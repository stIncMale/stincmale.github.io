---
layout: post
slug: sql-in-unnest-array
title: Consider using an <code>array</code> with <code>value_expression in (select unnest(?))</code> instead of issuing SQL statements in a batch or building dynamic statements
categories: [tech]
tags: [SQL]
date: 2019-02-14T12:00:00Z
custom_update_date: 2021-12-19T18:33:00Z
custom_keywords: [in, any, some, array, unnest, batch, dynamic statement, SQL]
custom_description: Imagine, you have a set of n identifiers (IDs) that cannot be represented by a range, and you want to delete/update all rows containing these IDs from/in a relational database. How would you do this? What if n is huge?
---
{% include common-links-abbreviations.md %}

[Oracle Database]: <https://docs.oracle.com/en/database/oracle/oracle-database/>
[JOOQ]: <https://www.jooq.org>
[`unnest`]: <https://www.postgresql.org/docs/current/functions-array.html>
[`array`]: <https://www.postgresql.org/docs/current/arrays.html>
[`in` subquery expression]: <https://www.postgresql.org/docs/current/functions-subquery.html#FUNCTIONS-SUBQUERY-IN>
[`in` comparison]: <https://www.postgresql.org/docs/current/functions-comparisons.html#FUNCTIONS-COMPARISONS-IN-SCALAR>
[`any` subquery expression]: <https://www.postgresql.org/docs/current/functions-subquery.html#FUNCTIONS-SUBQUERY-ANY-SOME>
[`any` comparison]: <https://www.postgresql.org/docs/current/functions-comparisons.html#id-1.5.8.28.16>

I refer to [PostgreSQL] in this article, but the [`unnest`] function, the [`in` subquery expression]
and the [`in` comparison] are all standard SQL.

{% include toc.md %}

## [](#problem-statement){:.section-link}Problem statement {#problem-statement}
You have a set of `n` identifiers (IDs) that cannot be represented by a range,
and you want to
[`delete`](https://www.postgresql.org/docs/current/sql-delete.html)/[`update`](https://www.postgresql.org/docs/current/sql-update.html)
all rows containing these IDs from/in a relational database. How would you do this? What if `n` is huge?

## [](#solutions){:.section-link}Solutions {#solutions}

### [](#solution-batch){:.section-link}`n` static prepared statements with one parameter in a batch {#solution-batch}
You could issue `n` SQL [prepared statements](https://www.postgresql.org/docs/current/sql-prepare.html)
with one [parameter](https://www.postgresql.org/docs/current/sql-expressions.html#SQL-EXPRESSIONS-PARAMETERS-POSITIONAL)[^1], a.k.a. bind variable:

```sql
delete from my_table where id = ?;
```

Of course, you would not want to issue the commands one by one&mdash;it is better to organize them into a batch.
With JDBC this can be done by using
[`java.sql.PreparedStatement.addBatch()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.sql/java/sql/PreparedStatement.html#addBatch())/<wbr>
[`java.sql.Statement.executeBatch()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.sql/java/sql/Statement.html#executeBatch())/<wbr>
[`java.sql.Statement.executeLargeBatch()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.sql/java/sql/Statement.html#executeLargeBatch()).
Despite the commands being issued more efficiently this way, you still request `n` commands which a DBMS executes one by one.
It is reasonable to assume that executing `n` commands takes more time than executing a single one that does the same thing as those `n` commands,
and it seems to be true according to
["The Performance Difference Between SQL Row-by-row Updating, Batch Updating, and Bulk Updating"](https://blog.jooq.org/2018/04/19/the-performance-difference-between-sql-row-by-row-updating-batch-updating-and-bulk-updating/)<span class="insignificant">&nbsp;by
[Lukas Eder](https://github.com/lukaseder) working with [JOOQ]</span>.

### [](#solution-n-parameters){:.section-link}A dynamic prepared statement with `n` parameters {#solution-n-parameters}
You may dynamically build a single SQL statement with `n` parameters specified for the [`in` comparison]:

```sql
delete from my_table where id in (?, ?, ...);
```

However, for a large enough `n` you may face a limit imposed by a (poor?) implementation of a [JDBC driver](https://jdbc.postgresql.org),
like the one described [here](https://stackoverflow.com/a/42251312/1285873):

```
java.io.IOException: Tried to send an out-of-range integer as a 2-byte value: 100000
    at org.postgresql.core.PGStream.SendInteger2(PGStream.java:201)
```

which happened when 100_000 values were specified for the [`in` comparison].

Another problem with this approach, is that you may end up generating many similar SQL statements which differ only by the number of bind variables.
If there is a cache of execution plans in the DBMS or a cache of prepared statements in the JDBC API implementation / JDBC driver,
then not only you can hardly benefit from it, but you also pollute the cache.
[Hibernate ORM](https://hibernate.org/orm/) tries to mitigate this by using `in` clause parameter padding
(see ["How to improve statement caching efficiency with IN clause parameter padding"](https://vladmihalcea.com/improve-statement-caching-efficiency-in-clause-parameter-padding/)<span class="insignificant">&nbsp;by [Vlad Mihalcea](https://vladmihalcea.com)</span>
and [`hibernate.query.in_clause_parameter_padding`](https://docs.jboss.org/hibernate/orm/5.4/javadocs/constant-values.html#org.hibernate.cfg.AvailableSettings.IN_CLAUSE_PARAMETER_PADDING)).

### [](#solution-array){:.section-link}A static prepared statement with one parameter of the [`array`] type of size `n` {#solution-array}
As a result of all the aforementioned, it appears to me that a good option may be to use
the SQL [`array`] type represented by
[`java.sql.Array`](https://docs.oracle.com/en/java/javase/17/docs/api/java.sql/java/sql/Array.html) in JDBC:

```sql
delete from my_table where id in (select unnest(?));
```

We can create an [`array`] with
[`java.sql.Connection.createArrayOf(String typeName, Object[] elements)`](https://docs.oracle.com/en/java/javase/17/docs/api/java.sql/java/sql/Connection.html#createArrayOf(java.lang.String,java.lang.Object[]))
and specify it by using
[`PreparedStatement.setArray(int parameterIndex, Array x)`](https://docs.oracle.com/en/java/javase/17/docs/api/java.sql/java/sql/PreparedStatement.html#setArray(int,java.sql.Array)).
The reason for using the [`unnest`] function is that the [`in` subquery expression] expects (you guessed it)
a subquery which returns a set of rows, a.k.a. a table, not an [`array`].
Note that previously we were using the [`in` comparison], while now we are using the [`in` subquery expression].
The function [`unnest`] converts an [`array`] to a set of rows, this is also called ["flattening"](https://cloud.google.com/bigquery/docs/reference/standard-sql/arrays#flattening_arrays).

What about the performance of the [`in` comparison] with `n` parameters and
the [`in` subquery expression] with a single parameter of the [`array`] type?
I am so glad the measurements have already been done and described in
["SQL IN Predicate: With IN List or With Array? Which is Faster?"](https://blog.jooq.org/2017/03/30/sql-in-predicate-with-in-list-or-with-array-which-is-faster/)<span class="insignificant">&nbsp;by
[Lukas Eder](https://github.com/lukaseder) working with [JOOQ]</span>. In short:
* for [PostgreSQL], the approach with `n` parameters seem to result in a smaller latency than the approach with an [`array`] for `n` < 128,
and the situations changes in favour of using an [`array`] for `n` >= 128;
* for [Oracle Database], the approach with an [`array`] is at least not worse than the approach with `n` parameters
if we ask it to determine the [`array`] cardinality with the
[`/*+gather_plan_statistics*/`](https://docs.oracle.com/en/database/oracle/oracle-database/19/tgsql/optimizer-statistics-concepts.html#GUID-C8E00C0A-2DC3-4331-9319-696A6DECE716) hint.

As we can see, there is no simple answer showing the performance of one approach being always better than the performance of the other approach,
but looks like at least for big enough `n` the approach with an [`array`] results in smaller latencies while also having the benefit of not polluting caches.
By the way, Hibernate ORM may also [use this technique](https://github.com/hibernate/hibernate-orm/pull/2495) in the future.

#### [](#solution-array-example){:.section-link}JDBC example {#solution-array-example}
This technique turns out especially handy when you have multiple sets of IDs and want to request different updates for each set.
It allows you to have a single SQL statement for each set of IDs and issue all such commands in a batch.
Here is an example code demonstrating the situation:

```java
Map<String, Set<Long>> valueToIds = ...;
JdbcTemplate jdbcTemplate = ...;
jdbcTemplate.execute((Connection connection) -> {
    try (PreparedStatement statement = connection.prepareStatement(
            "update my_table set value = ? where id in (select unnest(?))")) {
        valueToIds.forEach((value, ids) -> {
            try {
                statement.setString(1, value);
                statement.setArray(2, connection.createArrayOf(
                        JDBCType.BIGINT.getName(), ids.toArray()));
                statement.addBatch();
            } catch (SQLException e) {
                throw new RuntimeException(e);
            }
        });
        return statement.executeBatch();
    }
});
```

### [](#solution-temporary-table){:.section-link}A temporary table with `n` rows {#solution-temporary-table}
A cardinally different and significantly less convenient approach is to create a temporary table which contains all `n` IDs
and then use [`inner join`](https://www.postgresql.org/docs/current/queries-table-expressions.html#id-1.5.6.6.5.6.4.3.1.1)
by utilizing PostgreSQL-specific [`using`](https://www.postgresql.org/docs/current/sql-delete.html#id-1.9.3.100.8) clause:

```sql
delete from my_table as t using tmp_table as tmp where t.id = tmp.id;
```

or with standard SQL syntax:

```sql
delete from my_table as t where t.id in (select id from tmp_table);
```

This technique is also described [here](https://stackoverflow.com/a/11119642/1285873).
It is not easy to imagine a situation in which this approach may be needed,
but this [comment](https://stackoverflow.com/questions/2861230/what-is-the-best-approach-using-jdbc-for-parameterizing-an-in-clause/11119642#comment101891449_11119642)
seems to describe one such situation.

## [](#notes){:.section-link}Notes {#notes}
["100x faster Postgres performance by changing 1 line"](https://www.datadoghq.com/blog/100x-faster-postgres-performance-by-changing-1-line/)<span class="insignificant">&nbsp;by [Alexis Lê-Quôc](https://www.linkedin.com/in/alexislequoc/) a co-founder of [Datadog](https://www.datadoghq.com)</span>
reports poor performance of

```sql
value_expression = any(array[v1, v2, ...])
```
in contrast with

```sql
value_expression = any(values (v1), (v2), ...)
```

for [PostgreSQL] 9.0, but says the problem was fixed in [PostgreSQL] 9.3.

The reason I am mentioning this difference between the [`any` comparison] and the [`any` subquery expression] here is that
the [`in` subquery expression] is equivalent to the `=` [`any` subquery expression] according to the [docs](https://www.postgresql.org/docs/current/functions-subquery.html#FUNCTIONS-SUBQUERY-ANY-SOME);
therefore, the mentioned performance bug probably also affected SQL commands with the [`in` subquery expression].

Note also that in [PostgreSQL] the [`any` comparison] accepts an [`array`] expression, while the [`in` comparison] accepts a list of
[value expressions](https://www.postgresql.org/docs/current/sql-expressions.html), a.k.a. scalar expressions.

[^1]: [JDBC API Specification](https://jcp.org/en/jsr/detail?id=221) also supports prepared statements via
    [`java.sql.PreparedStatement`](https://docs.oracle.com/en/java/javase/17/docs/api/java.sql/java/sql/PreparedStatement.html).
    Section *"13.2 The PreparedStatement Interface"* of the [JDBC API Specification 4.3](https://jcp.org/aboutJava/communityprocess/mrel/jsr221/index3.html) states
    <q>"Parameter markers, represented by "`?`" in the SQL string, are used to specify input values to the statement that may vary at runtime."</q>
    I am using this JDBC SQL syntax in the article.
