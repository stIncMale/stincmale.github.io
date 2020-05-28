---
layout: post
slug: parallelism-vs-concurrency
title: Parallelism vs. concurrency
categories: [tech]
tags: [concurrency]
date: 2020-05-17T10:00:00−06:00
custom_update_date: 2020-05-28T11:01:00−06:00
custom_keywords: [concurrency, parallelism, multitasking, multithreading]
custom_description: Parallelism &mdash; a term referring to techniques used to speedup execution by doing independent actions on multiple independently working processing units at the same physical time. Concurrency &mdash; a term referring to situations when there are unordered conflicting actions and techniques used to deal with them.
---
{% include common-links-abbreviations.markdown %}

*[CRDT]:
{:data-title="Conflict-Free Replicated Data Type"}
*[CRDTs]:
{:data-title="Conflict-Free Replicated Data Type"}
*[CPU]:
{:data-title="Central Processing Unit"}
*[CPUs]:
{:data-title="Central Processing Unit"}
*[OS]:
{:data-title="Operating System"}
*[ACID]:
{:data-title="Atomicity, Consistency, Isolation, Durability"}
*[DBMS]:
{:data-title="Database Management System"}
*[SSI]:
{:data-title="Serializable Snapshot Isolation"}
*[ISA]:
{:data-title="Instruction Set Architecture"}
*[RISC]:
{:data-title="Reduced Instruction Set Computer"}
*[JMM]:
{:data-title="Java Memory Model"}

I know there are many materials about this topic on the Internet,
e.g., I like this [Haskel wiki page](https://wiki.haskell.org/Parallelism_vs._Concurrency)
and a talk [Concurrency Is Not Parallelism](https://youtu.be/cN_DpYBzKso)<span class="insignificant">&nbsp;by [Rob Pike](https://en.wikipedia.org/wiki/Rob_Pike)</span>.
But software engineers still sometimes confuse these two concepts.
As always, I am writing to help myself in organizing my understanding and to hopefully help others to resolve the confusion;
this implies an immodest assumption that I have something meaningful to add to what is out there on the Internet.

{% include toc.markdown %}

## [](#parallelism){:.section-link}Parallelism {#parallelism}
<div class="info-block" markdown="1">
**Parallelism** &mdash; a term referring to
techniques used to speedup execution by doing *independent* actions on multiple *independently* working processing units at the same physical time,
a.k.a. simultaneously[^1]. Such actions are referred to as being done in parallel.
</div>

This does not mean that the processing units must be completely independent,
but rather that they must be able to do at least some parts of their activity independently of other processing units, i.e., without coordinating with them.

So parallelism is a concept we may want to use when talking about the *performance* of a system.

## [](#concurrency){:.section-link}Concurrency {#concurrency}
Before defining what concurrency is, we need to talk about the order of actions and the lack thereof.
We may think of an action / operation `a` as a pair of events: an invocation `inv(a)` and the matching response `res(a)`.
Actions `a` and `b` are ordered or sequential iff either `res(a)` is ordered before `inv(b)`, or `res(b)` is ordered before `inv(a)`.
Such "ordered before" relation is also sometimes called "happens-before". For more details see, e.g.,
[Linearizability: A Correctness Condition for Concurrent Objects](https://cs.brown.edu/~mph/HerlihyW90/p463-herlihy.pdf)<span class="insignificant">&nbsp;by [Maurice P. Herlihy](https://cs.brown.edu/~mph/), [Jeannette M. Wing](http://www.cs.cmu.edu/~wing/)</span>[^2].  

We usually do not care about unordered independent actions, because independence means we can assume,
that they are ordered in any order convenient for us to reason about. 
But we do care about the order of actions that depend on each other (e.g., the result of one action is used as an input for another action),
or may affect each other in other ways (such actions are often called *conflicting*).

<div class="info-block" markdown="1">
**Concurrency** &mdash; a term referring to
situations when there are *unordered* *conflicting* actions and techniques used to deal with them.
Unordered actions are referred to as being concurrent.
</div>

So concurrency is a concept we may want to use when talking about the *design* if a system.
For example, when deciding how to deal with incoming requests and the corresponding transactions which are not ordered, a.k.a. concurrent, and often may affect each other.

It is worth mentioning that some sources use the word "time" instead of the word "order",
which is misleading unless they introduce order relations first and then explicitly say that this is what they use as the logical time.
While it is true that physical and logical time are concepts similar in that they both represent order,
it is easy to forget that the order of actions in a specific system or a computing model is not necessarily correlated with the physical time[^3],
let alone that it is often incorrect to assume that there is an absolute physical time in a distributed system.
Just like using the word "time" may be misleading, using the words "now", "immediate"
may also be misleading, see [Disambiguating "now" and "immediate"]({% post_url 2013-08-01-now-immediate %}) for more details.

## [](#source-of-confusion){:.section-link}A possible source of confusion {#source-of-confusion}
The concepts of parallelism and concurrency are likely often confused because the corresponding techniques affect each other:
* Parallel execution introduces a partial lack of order, which means that a system must be prepared to deal with it,
i.e., it must be designed with concurrency in mind in order to be able to benefit from parallel execution without compromising correctness, a.k.a. safety.
* When dealing with concurrency we have to modify conflicting actions in such a way that
either they become ordered (e.g., eliminate conflicts with locks, or detect them with optimistic concurrency control)
or they become independent (e.g., use conflict-free replicated data types (CRDTs)).
If a technique that imposes ordering does this in a too coarse-grained manner,
i.e., imposes ordering not only on conflicting actions, but also on independent actions,
then such a technique reduces the possible level of parallelism for a given system.

## [](#examples){:.section-link}Examples {#examples}
### [](#pit-digging){:.section-link}Digging a pit {#pit-digging}
An example of a situation when actions are not done in parallel despite being concurrent.

If people A and B having the same performance were digging a pit together during the same day,
then their "dig" actions both started in the morning and finished in the evening, thus were concurrent.
However, if during that day when A was in the pit &mdash; B was resting, and vice versa, then they did not dig the pit in parallel,
and, therefore, a single person C who has the same performance as either A or B but does not need any rest would have dug a pit of the same size in a day while working alone.

### [](#executing-on-single-processing-unit){:.section-link}Executing on a single processing unit {#executing-on-single-processing-unit}
An example showing that we still may have to think about concurrency even if no parallel execution is possible in the system that we are designing.

If we run [PostgreSQL](https://www.postgresql.org/)
(this DBMS is actually ACID, as unlike some others it supports [serializable transactions](https://www.postgresql.org/docs/current/transaction-iso.html#XACT-SERIALIZABLE))
in an OS that implements preemptive multitasking and multithreading but runs on an ancient computer with a single CPU/core,
then we are in a situation when the computer can execute only one thread of a process, and multitasking may be achieved only because
the OS regularly switches the thread that is being executed. Despite parallel execution is physically impossible in the described system,
PostgreSQL still able to start multiple backend processes and process concurrent requests in separate transactions.

Now imagine disabling [concurrency control](https://www.postgresql.org/docs/current/mvcc.html) &mdash; transactions are not isolated ("I" in ACID) anymore
and, therefore, behave differently. If this is not obvious, you may take any of the [examples](https://wiki.postgresql.org/wiki/SSI) demonstrating
[Serializable Snapshot Isolation (SSI)](https://drkp.net/papers/ssi-vldb12.pdf)<span class="insignificant">&nbsp;by Dan R. K. Ports, Kevin Grittner</span>
and see that it does not rely on whether transactions are executed in parallel or not, yet shows that without SSI the behavior would have been different.

### [](#instruction-pipelining){:.section-link}Instruction pipelining[^4] {#instruction-pipelining}
Instructions of a thread in the multithreading execution model are sequential,
and the result of one instruction may be an operand for an instruction that is ordered after it in the same thread,
but they may be partially executed in parallel nonetheless.

Instruction set architectures (ISA) of modern CPUs usually follow reduced instruction set computer (RISC) approach.
Each instruction is processed in multiple steps common for all instructions and ideally taking one CPU cycle,
e.g., fetch an instruction from memory, decode the instruction, execute the instruction, access memory, write the result into a register.
A processing unit works on different steps of different instructions in parallel,
like a car assembly line assembles different parts of different cars simultaneously, thus, more instructions can be executed in a shorter period of time.
This is called instruction-level parallelism and in terms of latency and throughput, it increases the throughput without affecting the latency.
Instructions still appear to be executed sequentially, just like an assembly line produces manufactured cars one at a time.

### [](#inherent-concurrency){:.section-link}Inherent concurrency {#inherent-concurrency}
A fun example of concurrent actions from the theory of special relativity.

Consider actions `a` and `b` where `inv(a)`, `res(a)`, `inv(b)`, `res(b)` are physical events, i.e., points in spacetime defined by spacial coordinates and a time coordinate.
If the spacetime interval between `res(a)` and `inv(b)` is space-like, then to some observers, that is, in some reference frames, `res(a)` is ordered before `inv(b)`,
which means that to those observers `a` is ordered before `b`. But to other observers `inv(b)` is ordered before `res(a)`,
which means that for them `a` is not ordered before `b`, i.e., either `b` is ordered before `a`, or `a` and `b` are unordered.
This effect is called relativity of simultaneity.

Since it is not the case that for all observers either `a` is ordered before `b`, or `b` is ordered before `a`,
we may conclude that the actions `a` and `b` are concurrent.

[^1]: Parallelism is inherently tied to the physical world, just like performance.
    What we mean exactly when saying "at the same time" / "simultaneously" with regard to parallelism is not of the essence, because parallelism is not about correctness.
    Depending on the situation, it may be adequate to think about simultaneity in terms of Newtonian, a.k.a. absolute, time
    or in terms of Einstein's special or general relativity.

    The concept of physical time is not trivial, and I am not qualified in this area,
    but I can recommend a few videos of qualified people talking about / discussing this topic:
    * [Time Is of the Essence… or Is It?](https://youtu.be/N-NTXoYTvao)\\
    <span class="insignificant">Participants: David Z. Albert, Vijay Balasubramanian, Carlo Rovelli, Lee Smolin; moderator: Jim Holt</span>
    * [The Physics and Philosophy of Time](https://youtu.be/-6rWqJhDv7M)\\
    <span class="insignificant">Carlo Rovelli</span>
    * [The Richness of Time](https://youtu.be/1FJWvEbeBps)\\
    <span class="insignificant">Participants: Lera Boroditsky, Dean Buonomano; moderator: Brian Greene</span>

[^2]: The happens-before order introduced in the paper is the same order that is [specified in the Java memory model (JMM)](https://docs.oracle.com/javase/specs/jls/se14/html/jls-17.html#jls-17.4.5),
    with the only difference that the article defines it as an irreflexive, a.k.a. strict, partial order, while the JMM requires it to be reflexive
    in a [well-formed execution](https://docs.oracle.com/javase/specs/jls/se14/html/jls-17.html#jls-17.4.7).
    But as far as I can see, neither uses the reflexivity or irreflexivity properties of the happens-before order, thus the difference is merely the author's choice.

[^3]: For example, the JMM says <q>"It should be noted that the presence of a happens-before relationship between two actions
    does not necessarily imply that they have to take place in that order in an implementation.
    If the reordering produces results consistent with a legal execution, it is not illegal."</q>

[^4]: I have no doubts that the real state of affairs is much more complex than the one described in this section.
