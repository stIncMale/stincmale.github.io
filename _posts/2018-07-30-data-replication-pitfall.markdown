---
layout: post
slug: data-replication-pitfall
title: A pitfall with asynchronous incremental logical data replication
categories: [tech]
tags: [distributed systems]
date: 2018-07-30T12:00:00Z
custom_update_date: 2021-04-04T07:15:00Z
custom_keywords: [replication, incremental replication, logical replication, asynchronous replication]
custom_description: Instead of transferring master diffs and inferring the master action history in slaves, logical replication should transfer the changes in the master action history to slaves.
---
{% include common-links-abbreviations.markdown %}

The situation I am going to describe is something I encountered in a real enterprise system.
A reader may find it trivial after reading, but I bet the one who implemented data replication in the naive and incorrect way,
which I am going to describe, would have felt the same and yet trapped into the pit.

{% include toc.markdown %}

## [](#system-description){:.section-link}Description of the system {#system-description}
The application stores data represented as entities with the following fields:

Field | Type | Constraints
- | -
`id` | integer | unique
`name` | string | unique

The application supports the following actions (read actions are irrelevant for this discussion, so I am omitting them):

Action | Description
- | -
`create(id, name)` | A write action that creates a new entity `(id, name)`.
`update(id, name1, name2)` | A write action that updates the `name` of the entity specified by `id` from `name1` to `name2`.
`delete(id)` | A write action that deletes the entity specified by `id`.

All write actions executed in a single application are totally ordered. I express this total order by using a top-down order of narration.

The system consists of multiple instances of the application, a.k.a. processes.
There are two roles for application instances in the system: master and slave.
There is exactly one instance with the master role, this instance allows both read and write actions to be executed by ordinary clients;
there can be multiple instances with the slave role, these instances allow only read actions to be executed by ordinary clients.

Note that so far any ACID DBMS fits the description of the application and some [NoSQL DBMS](https://youtu.be/qI_g07C_Q5I)
may also fit, especially if we allow the uniqueness constraint to be a client-enforced data integrity rule
that may not necessarily be enforced by the DBMS. Thus, the pitfall I am going to discuss is quite generic.

## [](#naive-data-replication){:.section-link}Naive data replication algorithm {#naive-data-replication}
The task is to eventually have the same data in all slave instances as in the master instance by utilizing
a self-invented asynchronous incremental logical data replication.
An inter-instance process called `replicate` acts as a client of slave instances.
This is the only client that is allowed to execute write actions in slaves.
It is also important to note that `replicate` is asynchronous and cannot be executed
[concurrently](<{% post_url 2020-05-17-parallelism-vs-concurrency %}#concurrency>) with itself,
i.e., once the `replicate` process is started another process may be started only after the previous one completes.

We want asynchrony because it allows
* completing a write action in the master without waiting for the replication process to finish its execution
at the cost of relaxing the [consistency model](https://jepsen.io/consistency#consistency-models)
to something that is often referred to as eventual consistency[^1];
* aggregating multiple write actions into a single execution of the `replicate` process,
which in turn may open opportunities for more efficient processing.

We want `replicate` executions to be totally ordered because it makes things easier to reason about,
and I do not think there would be any benefits of not having them totally ordered.

We ignore the possibility of network partitions between instances because such considerations while being important in general,
are not relevant to our discussion.
Essentially, the asynchronous replication we are talking about is similar to data synchronization between a write-behind cache
and the underlying storage. We are going to [come back to this analogy later](#analogy).

The `replicate` algorithm:
1. Collect all entities in the master that were created/updated since the last execution of this step,
this is what makes the replication incremental. The replication is logical because it replicates entities based upon their identity,
as opposed to physical replication that would have replicated data byte-by-byte.
2. Sort the collected entities by `id`. The only reason for doing so is to make the algorithm deterministic, therefore,
the sort order, per se, does not matter.
3. Transfer the collected and sorted data to all slaves.
4. In each slave `delete` all entities that exist in the slave and do not exist in the received data. Entities are matched by `id`.
5. In each slave iterate over all the received entities preserving the order and apply the new state as follows:
   1. if the slave has the entity, then `update` it with the new data;
   2. if the slave does not have the entity, then `create` a new one in accordance with the new data.

We will only consider a single slave instance hereinafter.
Note that actions executed in the slave depend only on its state and the data that comes from the master,
they are inferred based on this data.
We will show that this fact represents a fatal flaw in the described algorithm and propose the solution.

### [](#failing-scenario1){:.section-link}Failing scenario {#failing-scenario1}
Initially, neither there is no data in the master and in the slave, then the following happens:

```java
create(2, "a")
replicate
```

Since `replicate` is asynchronous and is allowed to aggregate multiple write actions, we can place its executions anywhere we want in our examples.
Let us expand the `replicate` process actions in the above execution:
1. Collected entities: `{(2, "a")}`{:.highlight .language-java}.
2. Sorted entities: `{(2, "a")}`{:.highlight .language-java}.
3. Transfer the prepared data to the slave.
4. `delete` nothing.
5. Iterate over `{(2, "a")}`{:.highlight .language-java}:
   1. `update` nothing;
   2. `create(2, "a")`{:.highlight .language-java}.

The above form of describing an execution of the `replicate` process is cumbersome, I will use the following form instead:

```java
master{(2, "a")} -> slave{} //replicate the sorted master state {(2. "a")} into the slave with the state {}
  5.2: create(2, "a") //the algorithm step and its action on a single entity separated with ':'
slave{(2, "a")} //the slave state after replication finishes
```

So far so good. Here come new changes in the master:

```java
update(2, "a", "b")
create(1, "a")
replicate
```

Note that I have not expressed any correspondence between the natural order of values of the `id` field and the total order of actions
on a single application. If `id` were randomly generated, e.g., [UUID version 4](https://www.rfc-editor.org/rfc/rfc4122#section-4.1.3),
then this statement would have been obvious. I use the integer type in this post simply because I can use a single character
to represent some of its values. I deliberately used 2 as the `id` in the first `create` and 1 in the second `create` because this is allowed
and results in a scenario I need.

The second `replicate` execution:

{:#execution-E}
```java
//replicate execution E
master{(1, "a"), (2, "b")} -> slave{(2, "a")}
  5.2: create(1, "a") //the order of actions from the steps 5.1 and 5.2 is defined by the order of entities that came from the master, not by the index number of steps in the description of the algorithm
  //5.1: update(2, "a", "b") this action is not executed because the previous action fails
unique constraint violation
```

The `replicate` process fails to execute `create(1, "a")`{:.highlight .language-java} in the slave
because the slave already has the entity `(2, "a")`{:.highlight .language-java},
and the `name` field must be unique. Note that the action `update(2, "a", "b")`{:.highlight .language-java} in the slave
turned out to be ordered after the action `create(1, "a")`{:.highlight .language-java}. This is an inverted order comparing to how actions
happened in the master.

### [](#naive-fix){:.section-link}Naive fix {#naive-fix}
The original `replicate` algorithm does not specify the order of `create`/`update` operations, their order depends on the
diff that comes from the master, the state of the slave, and the sort order in step 2, which is arbitrary.
At first glance, it appears that the above problem can be solved by executing all `update` actions
before executing any of `create` actions. The <span style="color: green;">updated</span> algorithm:
1. Collect all entities in the master that were created/updated since the last execution of this step.
2. Sort the collected entities by `id`.
3. Transfer the collected and sorted data to all slaves.
4. In each slave `delete` all entities that exist in the slave and do not exist in the received data.
5. <span style="color: green;">In each slave iterate over all the received entities preserving the order and `update` all entities that the slave has.</span>
6. <span style="color: green;">In each slave iterate over all the received entities preserving the order and `create` all entities that the slave does not have.</span>

With this algorithm the [execution `E`](#execution-E) becomes

```java
//replicate execution E'
master{(1, "a"), (2, "b")} -> slave{(2, "a")}
  5: update(2, "a", "b")
  6: create(1, "a")
slave{(2, "b"), (1, "a")}
```

We managed to successfully replicate the state, and the slave has the same state as the master.
Unfortunately, there are scenarios in which the new algorithm also fails.

### [](#failing-scenario2){:.section-link}Another failing scenario {#failing-scenario2}
Initially, neither there is no data in the master and in the slave, then the following happens:

```java
create(1, "a")
create(2, "b")
replicate
```

The corresponding `replicate` execution:

```java
master{(1, "a"), (2, "b")} -> slave{}
  6: create(1, "a")
  6: create(2, "b")
slave{(1, "a"), (2, "b")}
```

More writes happen in the master:

```java
update(1, "a", "c")
update(2, "b", "a")
update(1, "c", "b")
replicate
```

The new master state is `{(1, "b"), (2, "a")}`{:.highlight .language-java}. The corresponding `replicate` execution:

```java
master{(1, "b"), (2, "a")} -> slave{(1, "a"), (2, "b")}
  5: update(1, "a", "b")
  //5: update(2, "b", "a") this action is not executed
unique constraint violation
```

### [](#proper-fix){:.section-link}Proper fix {#proper-fix}
It is fairly easy to see that no matter how we reorder the `create`/`update` actions executed by the `replicate` algorithm,
or how we reorder entities collected in the master, the algorithm always fails in the above scenario.
The only way to fix the algorithm is to collect and transfer the history of actions from the master to slaves instead of transferring its diffs and
trying to infer the history of actions in slaves as both the above-mentioned versions of the `replicate` algorithm are doing.
This is, by the way, exactly how [PostgreSQL logical replication](https://www.postgresql.org/docs/current/logical-replication.html) works,
with the difference that one may choose to
[limit the actions in the history](https://www.postgresql.org/docs/current/logical-replication-publication.html).

To be honest, the proper fix would have required radical changes, so I implemented the [naive fix](#naive-fix), or rather a kludge,
in the real system and mentioned that the replication cannot be fixed without reimplementing it.

## [](#analogy){:.section-link}Write-behind cache analogy {#analogy}
At the beginning of this article I mentioned that the discussed replication is similar to data synchronization between a write-behind cache
and the underlying storage. There is a very popular write-behind cache&mdash;[Jakarta Persistence](https://jakarta.ee/specifications/persistence/)<!-- -->[^2]
persistence context accessible via [`EntityManager`](https://jakarta.ee/specifications/persistence/3.0/apidocs/jakarta/persistence/EntityManager.html).
Its method [`EntityManager.flush()`](https://jakarta.ee/specifications/persistence/3.0/apidocs/jakarta/persistence/EntityManager.html#flush())
can be seen as an analogy to the discussed replication process.
If it is a good analogy, then we expect similar problems there, right? Indeed, sometimes you have to explicitly synchronize the persistence context
with the underlying database, not only for the sake of keeping it from growing too large in a large transaction,
but also in order to avoid violating constraints of the underlying database. It seems that Jakarta Persistence implementations,
e.g., [Hibernate ORM](https://hibernate.org/orm/), try to save users some trouble by implementing a sophisticated
[`flush` operation order](https://docs.jboss.org/hibernate/orm/current/userguide/html_single/Hibernate_User_Guide.html#flushing-order),
which is meant to reduce the chances of violating database constraints when flushing.
If you are interested in further reading about Hibernate ORM flushing order, I recommend the following:
[How is Hibernate deciding order of update/insert/delete](https://stackoverflow.com/questions/12616336/how-is-hibernate-deciding-order-of-update-insert-delete),
[A beginner’s guide to Hibernate flush operation order](https://vladmihalcea.com/hibernate-facts-knowing-flush-operations-order-matters/)<span class="insignificant">&nbsp;by [Vlad Mihalcea](https://vladmihalcea.com)</span>.

[^1]: Eventual consistency is a class of consistency models that all have the following common guarantee:
    <q>"if no new updates are made to the object, eventually all accesses will return the last updated value"</q>.
    See [Eventually Consistent](https://doi.org/10.1145/1435417.1435432)<span class="insignificant">&nbsp;by [Werner Vogels](https://www.allthingsdistributed.com/)</span>
    for more details.
    
    As a side note, if you are curious about those 1-safe, 2-safe, group-safe criteria mentioned in the
    [PostgreSQL replication docs](https://www.postgresql.org/docs/current/warm-standby.html#SYNCHRONOUS-REPLICATION),
    I recommend reading [Beyond 1-Safety and 2-Safety for replicated databases: Group-Safety](https://www.researchgate.net/publication/2875732_Beyond_1-Safety_and_2-Safety_for_replicated_databases)<span class="insignificant">&nbsp;by [Matthias Wiesmann](https://wiesmann.codiferes.net/wordpress/?page_id=503), [André Schiper](https://people.epfl.ch/andre.schiper)</span>.

[^2]: Formerly known as Java Persistence API (JPA).
