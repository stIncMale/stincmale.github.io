---
layout: post
slug: now-immediate
title: 'Disambiguating "now" and "immediate"'
categories: [tech]
tags: [concurrency]
date: 2013-08-01T00:00:00+00:00
custom_update_date: 2020-05-21T02:03:00−06:00
custom_keywords: [now, currently, current, immediately, immediate, instantaneously, instantaneous, instant, concurrency, distributed system, distributed computing]
custom_description: If you imply temporal semantics when using the words "now", "immediate" while reasoning about concurrency, you are probably doing something wrong.
---
[concurrent]: <{% post_url 2020-05-17-parallelism-vs-concurrency %}#concurrency>
[concurrently]: <{% post_url 2020-05-17-parallelism-vs-concurrency %}#concurrency>

*[ACID]:
{:data-title="Atomicity, Consistency, Isolation, Durability"}

The idea to write this post came to me as a result of seeing [the question](http://cs.oswego.edu/pipermail/concurrency-interest/2013-August/011733.html)
<q>"Can you confirm if this is correct &mdash; a volatile write or atomic dec/inc becomes visible immediately to other threads&hellip;?"</q>,
which was about the semantics of [`volatile` fields](https://docs.oracle.com/javase/specs/jls/se14/html/jls-8.html#jls-8.3.1.4) in Java,
and the two following great answers:

* [first](http://cs.oswego.edu/pipermail/concurrency-interest/2013-August/011734.html)
> No there is no requirement for writes to become visible "immediately".
> Only the happens-before ordering guarantees visibility &mdash; if you see a given write then you must also see writes that happen-before that first write.
> In practice writes don't take long to become visible on most architectures &mdash; there is typically a delay until a write buffer drains.

* [second](http://cs.oswego.edu/pipermail/concurrency-interest/2013-August/011735.html)
> When someone talks about "visible immediately", we need to ask them what they mean by "immediately".
> In particular, how would a external observer know that something became visible "not immediately".
>
> You will quickly see that the external observer can only make judgements about the order of some events with respect to other events.
> If observing arrival of event A implies arrival of event B can be observed, i.e., A implies B, then you have B happens before A.
> This is pretty much  all the external observer can figure out. But this is enough to reason about the state of the system.

## [](#now){:.slink}Now {#now}
The notion of "now" seems to be a good enough illusion for everyday life, even though strictly speaking it does not make sense from the standpoint of physics.
The concept of "now" requires existence of absolute time, which does not exist according to the theory of special relativity.
"Now" implies a set of all simultaneous physical events, i.e., points in spacetime defined by spacial coordinates and a time coordinate,
but the relativity of simultaneity tells us that such a set cannot be absolute: events that are simultaneous for one observer may not be simultaneous to another.
This means that there is no such thing as a snapshot of the Universe, but we still find it often useful to pretend that parts of the Universe,
e.g., our household/city/planet exist in the same absolute time and, therefore, allows the existence of snapshots.

But there is another problem with this layman understanding of "now" &mdash; we can stop neither the flow of time nor everything that happens within the region of the Universe
which we assume exists in the same absolute time. This means that any snapshot that may take is outdated, it never represents the "current" state
of our part of the Universe.

Both of the aforementioned limitations are not necessary a thing for a [concurrent] object[^1] &mdash; no wonder, as the software we build
is usually much less complex than the world around us.
Depending on the consistency model of the [concurrent] object, we may be able to get a snapshot of its state.
We may have a snapshot of an object as simple as a linearizable, a.k.a. atomic[^2], register (by the way, a `volatile` field in Java is a linearizable register)
by simply reading from it, or as complex as a DB managed by a DBMS that guarantees that all transactions are serializable.
If we can guarantee that no other process can modify the state of the object [concurrently] with us taking its snapshot and looking at it,
then we can claim that the snapshot we are looking at is the "now"- or "current" state of the object.

I also may recommend reading [There is No Now](https://dl.acm.org/doi/10.1145/2742694.2745385)<span class="insignificant">&nbsp;by Justin Sheehy</span>.

## [](#immediate){:.slink}Immediate {#immediate}
Strictly speaking, the word "immediate" cannot have temporal semantics, despite it is commonly perceived as expressing a temporal quality.
It may have sound meaning only when applied to ordered elements. The phrase "`y` immediately follows `x`" have the same meaning as the phrase "`y` is ordered immediately after `x`",
which means that there is no element `z` different from both `x` and `y` such that `x` if ordered before `z` and `z` is ordered before `y`.
Unless you are using the word "immediate" in this sense when reasoning about concurrency, you are most likely using it incorrectly.

With this in mind, let us consider the following statement about linearizability:
<q>"Linearizability provides the **illusion** that each operation takes effect **instantaneously** at some point between its invocation and its response,
implying that the meaning of a concurrent object's operations can still be given by pre- and post conditions."</q>[^3]
The authors clearly do not mean to imply that operations take affect instantaneously in a temporal sense &mdash; that is why they call it an illusion.
But why exactly such an illusion occurs when a linearizable object is used? It is because the requirements imposed by the linearizable consistency model
<q>"allow us to describe acceptable concurrent behavior directly in terms of acceptable sequential behavior,
an approach that simplifies both formal and informal reasoning about concurrent programs."</q>[^3]
If all operations on an object can be thought of as being sequential,
then the duration of each operation in such a sequential history stops affecting the behaviour of the object,
and therefore we may imagine that operations take effect instantaneously.
I cannot speak for others, but to me, informal remarks in articles about concurrency or distributed systems that appeal to words with temporal semantics,
introduce confusion instead of helping to understand the concept being explained.

[^1]: A concurrent object is simply a data object shared by concurrent processes.

[^2]: The word "atomic" is overloaded: it is used both as a synonym of being linearizable and as the atomicity property in ACID,
    which is about either committing all actions bundled together in a transaction, or ensuring that none of them happened.

[^3]: [Linearizability: A Correctness Condition for Concurrent Objects](https://cs.brown.edu/~mph/HerlihyW90/p463-herlihy.pdf)<span class="insignificant sub">&nbsp;by [Maurice P. Herlihy](https://cs.brown.edu/~mph/), [Jeannette M. Wing](http://www.cs.cmu.edu/~wing/)</span>