---
layout: post
slug: postgresql-explain-analyze-actual-rows
title: Actual rows reported by PostgreSQL's <code>explain analyze</code> is not the number of rows in the set computed by a node
categories: [tech]
tags: [PostgreSQL, SQL]
date: 2020-09-20T12:00:00Z
custom_update_date: 2022-04-03T09:44:00Z
custom_keywords: [explain analyze, explain plan, explain, execution plan, plan, actual rows, rows]
custom_description: This article explains a corner case that helps to develop a better understanding of the output of the EXPLAIN ANALYZE PostgreSQL command.
---
{% include common-links-abbreviations.md %}

{% include toc.md %}

## [](#misbelief){:.section-link}Misbelief {#misbelief}

[PostgreSQL] documentation specifies the actual rows reported by the [`explain analyze`](https://www.postgresql.org/docs/current/sql-explain.html)
command as:

> "The `ANALYZE` option causes the statement to be actually executed, not only planned. Then actual run time statistics are added to the display,
> including the total elapsed time expended within each plan node (in milliseconds) and the **total number of rows it actually returned**.
> This is useful for seeing whether the planner's estimates are close to reality."

Additionally, it [also says](https://www.postgresql.org/docs/current/using-explain.html#USING-EXPLAIN-BASICS):

> "The `rows` value is a little tricky because it is not the number of rows processed or scanned by the plan node,
> but rather the **number emitted by the node**. This is often less than the number scanned,
> as a result of filtering by any `WHERE`-clause conditions that are being applied at the node."

Until recently, I had always understood the descriptions above as "`rows` is the number of rows in the set computed by a node".
For example:

* If a `Sort` node reported actual `rows=10`, then it produces a sorted set of 10 rows.
* If a `Group` node reported actual `rows=10`, then after aggregating all the fed rows it produces a set of 10 rows,
which is usually smaller than the number of the rows fed into the node, but is never larger.
* If a `Hash` node reported actual `rows=10`, then it constructed a hash table (in memory, or partially in memory)
with 10 rows hashed using whatever is used to join the data.
Since it is possible to have multiple rows for a single hash key, 10 is not the number of keys in the hash table,
but actually the number of rows stored in it. By providing the constructed hash table to a parent node, this node produces 10 rows.
* If a `Materialize` node reported actual `rows=10`, then it stored (in memory, or partially in memory) 10 rows,
which is the set of rows produced by the node.
And if `Materialize` is used by a `Nested Loop`, then `loops` reported by the `Materialize` node tell us how many times the outer loop
had to go through the materialized set of rows.[^1]
* And so on …

Recently, I was shown a plan that did not fit the presented above view of the world:

```sql
...
->  Materialize  (cost=17004.81..17490.67 rows=97171 width=56) (actual time=178.715..2570.569 rows=43998855 loops=1)
      ->  Sort  (cost=17004.81..17247.74 rows=97171 width=56) (actual time=178.703..217.895 rows=94164 loops=1)
...
```

As we can see, 94164 rows sorted by the `Sort` node were fed into the `Materialize` node that reported 43998855 rows.
How so?

## [](#example){:.section-link}Example[^2] {#example}

Turns out, we can observe the aforementioned effect with a simple SQL query:

```sql
# explain analyze
# select *
# from
#     (values (0), (0), (0), (0), (0) order by 1) as a (v)
#     inner join
#     (values (0), (0) order by 1) as b (v)
#     on a.v = b.v;
                                                        QUERY PLAN
---------------------------------------------------------------------------------------------------------------------------
Merge Join  (cost=0.16..0.29 rows=2 width=8) (actual time=0.034..0.040 rows=10 loops=1)
   Merge Cond: ("*VALUES*".column1 = "*VALUES*_1".column1)
   ->  Sort  (cost=0.12..0.13 rows=5 width=4) (actual time=0.012..0.012 rows=5 loops=1)
         Sort Key: "*VALUES*".column1
         Sort Method: quicksort  Memory: 25kB
         ->  Values Scan on "*VALUES*"  (cost=0.00..0.06 rows=5 width=4) (actual time=0.002..0.004 rows=5 loops=1)
   ->  Materialize  (cost=0.04..0.07 rows=2 width=4) (actual time=0.018..0.022 rows=6 loops=1)
         ->  Sort  (cost=0.04..0.04 rows=2 width=4) (actual time=0.017..0.018 rows=2 loops=1)
               Sort Key: "*VALUES*_1".column1
               Sort Method: quicksort  Memory: 25kB
               ->  Values Scan on "*VALUES*_1"  (cost=0.00..0.03 rows=2 width=4) (actual time=0.004..0.004 rows=2 loops=1)
Planning time: 0.132 ms
Execution time: 0.071 ms
(13 rows)
``` 

Here we can see a `Sort` node producing 2 rows which are fed to a `Materialize` node that reports 6 rows.

## [](#explanation){:.section-link}Explanation {#explanation}

The following excerpt from the PostgreSQL code comments gives us a hint:

```c
// nodeMergejoin.c
// https://github.com/postgres/postgres/blob/7559d8ebfa11d98728e816f6b655582ce41150f3/src/backend/executor/nodeMergejoin.c

/*
 *    …
 *    Merge-join is done by joining the inner and outer tuples satisfying
 *    join clauses of the form ((= outerKey innerKey) …).
 *    The join clause list is provided by the query planner and may contain
 *    more than one (= outerKey innerKey) clause (for composite sort key).
 *
 *    However, the query executor needs to know whether an outer
 *    tuple is "greater/smaller" than an inner tuple so that it can
 *    "synchronize" the two relations. For example, consider the following
 *    relations:
 *
 *        outer: (0 ^1 1 2 5 5 5 6 6 7)    current tuple: 1
 *        inner: (1 ^3 5 5 5 5 6)          current tuple: 3
 *
 *    To continue the merge-join, the executor needs to scan both inner
 *    and outer relations till the matching tuples 5. It needs to know
 *    that currently inner tuple 3 is "greater" than outer tuple 1 and
 *    therefore it should scan the outer relation first to find a
 *    matching tuple and so on.
 *
 *    Therefore, rather than directly executing the merge join clauses,
 *    we evaluate the left and right key expressions separately and then
 *    compare the columns one at a time (see MJCompare).  The planner
 *    passes us enough information about the sort ordering of the inputs
 *    to allow us to determine how to make the comparison.  We may use the
 *    appropriate btree comparison function, since Postgres' only notion
 *    of ordering is specified by btree opfamilies.
 *
 *    Consider the above relations and suppose that the executor has
 *    just joined the first outer "5" with the last inner "5". The
 *    next step is of course to join the second outer "5" with all
 *    the inner "5's". This requires repositioning the inner "cursor"
 *    to point at the first inner "5". This is done by "marking" the
 *    first inner 5 so we can restore the "cursor" to it before joining
 *    with the second outer 5. The access method interface provides
 *    routines to mark and restore to a tuple.
 *
 *    Essential operation of the merge join algorithm is as follows:
 *
 *    Join {
 *        get initial outer and inner tuples          INITIALIZE
 *        do forever {
 *            while (outer != inner) {                SKIP_TEST
 *                if (outer < inner)
 *                    advance outer                   SKIPOUTER_ADVANCE
 *                else
 *                    advance inner                   SKIPINNER_ADVANCE
 *            }
 *            mark inner position                     SKIP_TEST
 *            do forever {
 *                while (outer == inner) {
 *                    join tuples                     JOINTUPLES
 *                    advance inner position          NEXTINNER
 *                }
 *                advance outer position              NEXTOUTER
 *                if (outer == mark)                  TESTOUTER
 *                    restore inner position to mark  TESTOUTER
 *                else
 *                    break // return to top of outer loop
 *            }
 *        }
 *    }
 *    …
 */
```

So `Merge Join` may access the same rows produced by the inner child node (`Materialize` in our case)
multiple times if `restore inner position to mark` happens.
In our query, the outer set of rows `a` is `(0)`, `(0)`, `(0)`, `(0)`, `(0)`, and the inner set of rows `b` is `(0)`, `(0)`.
According to the algorithm described above, `restore inner position to mark` must be happening 4 times, resulting in accessing the materialized (inner)
set of rows 5 times. Are you also experiencing `Nested Loop` déjà vu at this point? Only in this case the `loops` value is 1.

Accessing 5 times each of the 2 inner set rows gives 10 accesses in total, and yet the `Materialize` node reports 6 rows.
My understanding is that after `advance outer position` but before `restore inner position to mark` the last row from the
inner set is still available to the `Merge Join` node without the need to access it again from the inner set, and so it is used right away.
With this in mind, joining each of the outer rows, but the first one, results in accessing 2 - 1 = 1 rows instead of 2 rows
from the inner set (joining the first outer row still has to access all 2 inner rows), giving
1<span class="insignificant">&nbsp;outer row</span> * 2<span class="insignificant">&nbsp;inner rows</span> + (5 - 1)<span class="insignificant">&nbsp;outer rows</span> * (2 - 1)<span class="insignificant">&nbsp;inner rows</span> = 6
rows returned/emitted (as it is worded by the PostgreSQL docs) by the `Materialize` node.

Interestingly, the same does not seem to happen for the `Hash` node which has a `Hash Join` node as its parent:

```sql
# explain analyze
# select *
# from
#     (values (0), (0), (0), (0), (0)) as a (v)
#     inner join
#     (values (0), (0)) as b (v)
#     on a.v = b.v;
                                                     QUERY PLAN
---------------------------------------------------------------------------------------------------------------------
Hash Join  (cost=0.05..0.15 rows=2 width=8) (actual time=0.016..0.024 rows=10 loops=1)
   Hash Cond: ("*VALUES*".column1 = "*VALUES*_1".column1)
   ->  Values Scan on "*VALUES*"  (cost=0.00..0.06 rows=5 width=4) (actual time=0.001..0.005 rows=5 loops=1)
   ->  Hash  (cost=0.03..0.03 rows=2 width=4) (actual time=0.006..0.007 rows=2 loops=1)
         Buckets: 1024  Batches: 1  Memory Usage: 9kB
         ->  Values Scan on "*VALUES*_1"  (cost=0.00..0.03 rows=2 width=4) (actual time=0.001..0.002 rows=2 loops=1)
Planning time: 0.123 ms
Execution time: 0.060 ms
(8 rows)
```

Maybe this is because the hash table is accessed only once per each key, and the number of rows returned/emitted per key
is considered to be equal to the number of rows stored by the `Hash` node for the key,
or maybe this is because the constructed hash table is not actually treated as a node:

```c
// nodeHash.c
// https://github.com/postgres/postgres/blob/7559d8ebfa11d98728e816f6b655582ce41150f3/src/backend/executor/nodeHash.c

/*
 * We do not return the hash table directly because it's not a subtype of
 * Node, and so would violate the MultiExecProcNode API.  Instead, our
 * parent Hashjoin node is expected to know how to fish it out of our node
 * state.  Ugly but not really worth cleaning up, since Hashjoin knows
 * quite a bit more about Hash besides that.
 */
``` 

[^1]: <q>["In some query plans, it is possible for a subplan node to be executed more than once.
    …
    In such cases, the `loops` value reports the total number of executions of the node,
    and the actual `time` and `rows` values shown are averages per-execution."](https://www.postgresql.org/docs/current/using-explain.html#USING-EXPLAIN-ANALYZE)</q>

    ["Explaining the unexplainable"](https://www.depesz.com/tag/unexplainable/)
    <span class="insignificant">by [Hubert Lubaczewski](https://www.depesz.com/) (a.k.a. [depesz](https://www.depesz.com/))</span>
    is a great series of posts explaining how to understand the output of the `explain` command in much more details
    than the [existing documentation](https://www.postgresql.org/docs/current/using-explain.html).

[^2]: All examples were run with PostgreSQL 12.4.
