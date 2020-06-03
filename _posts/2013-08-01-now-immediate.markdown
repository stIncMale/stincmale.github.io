---
layout: post
slug: now-immediate
title: 'Disambiguating "now" and "immediate"'
categories: [tech]
tags: [concurrency]
date: 2013-08-21T00:00:00+03:00
custom_update_date: 2020-06-03T11:47:00−06:00
custom_keywords: [now, currently, current, snapshot, immediately, immediate, instantaneously, instantaneous, instant, concurrency, distributed system, distributed computing]
custom_description: If you imply temporal semantics when using the words &quot;now&quot;, &quot;immediate&quot; while reasoning about concurrency, you are probably doing something wrong.
---
{% include common-links-abbreviations.markdown %}

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

{% include toc.markdown %}

## [](#now){:.section-link}Now {#now}
The notion of "now" seems to be a good enough illusion for everyday life. Let us consider with some rigor what "now" means
when used with respect to something physical, i.e., the Universe or its part, or something logical, e.g., a data object.
Having the now- or current state of something, that we will refer to as `X`, implies the two following premises:
* existence of absolute time, which allows us to talk about snapshots of `X`;
* the ability to explore a snapshot of `X` while `X` is not changing, as otherwise our snapshot is not the current but an outdated one;
I did not find a better name for this then the contemporaneity premise.

### [](#absolute-time){:.section-link}The absolute time premise {#absolute-time}
<div class="info-block" markdown="1">
If `X` can be thought of as existing in a single directional timeline which all parts of `X` agree on,
then this timeline represents **absolute time**.
</div>

If there is absolute time, we can define what a snapshot is. 

<div class="info-block" markdown="1">
**Snapshot** &mdash; the state `S(t)` of `X` at a point `t` on its absolute timeline.
</div>

According to the theory of special relativity, there is no absolute time in which the Universe exists.
For any event, i.e., a point in spacetime defined by spacial coordinates and a time coordinate,
there are infinitely many events distanced from it with a space-like interval.
Such events are seen as simultaneous by some observers and are not seen as simultaneous by other observers.

What if we are talking about a logical system, may it have absolute time? &mdash; it definitely may, for example:
* any sequential object, that is, a data object that is accessed only sequentially, may be thought of as having absolute logical time;
* depending on the consistency model of a [concurrent] object, that is, a data object that may be accessed concurrently,
  we may be able to imagine it existing in absolute logical time.
  This may be done for an object as simple as a linearizable, a.k.a. atomic[^1], register,
  or as complex as a DB managed by a DBMS that guarantees that all transactions are serializable.

But do not get too excited &mdash; there are many logical [concurrent] systems, especially distributed ones, such that different parts of a system
exist in different timelines. [`LongAdder`](https://cr.openjdk.java.net/~iris/se/14/spec/fr/java-se-14-fr-spec/api/java.base/java/util/concurrent/atomic/LongAdder.html)
from [Java Platform, Standard Edition (Java SE) API](https://cr.openjdk.java.net/~iris/se/14/spec/fr/java-se-14-fr-spec/api/index.html)
is an example of a simple concurrent object with no absolute timeline and therefore no snapshots,
and the [specification](https://cr.openjdk.java.net/~iris/se/14/spec/fr/java-se-14-fr-spec/api/java.base/java/util/concurrent/atomic/LongAdder.html#sum()) is explicit about this:
<q>"The returned value is NOT an atomic snapshot; invocation in the absence of concurrent updates returns an accurate result,
but concurrent updates that occur while the sum is being calculated might not be incorporated."</q>

### [](#contemporaneity){:.section-link}The contemporaneity premise {#contemporaneity}
<div class="info-block" markdown="1">
While the current snapshot `S(t1)` is being explored,
`X` must not be changing, that is, the state of `X` at any absolute time `t > t1` must be equal to `S(t1)`.
The minimal time `t2 > t1` such that `S(t2)` is not equal to `S(t1)`, is the point at which `S(t1)` stops being the current snapshot
and starts being an outdated snapshot of `X`.
</div>

It is impossible to stop the Universe or its part from continuously changing, which means that even if we were able to take a snapshot of the Universe,
i.e., if the absolute time premise were to hold, such a snapshot would be outdated by definition.
Preventing a logical system from changing its state is, however, possible.

## [](#immediate){:.section-link}Immediate {#immediate}
Strictly speaking, the word "immediate" cannot have temporal semantics, despite it is commonly perceived as expressing a temporal quality.
It may have sound meaning only when applied to ordered elements. The phrase "`y` immediately follows `x`" have the same meaning as the phrase "`y` is ordered immediately after `x`",
which means that there is no element `z` different from both `x` and `y` such that `x` if ordered before `z` and `z` is ordered before `y`.
Unless you are using the word "immediate" in this sense when reasoning about concurrency, you are most likely using it incorrectly.

With this in mind, let us consider the following statement about linearizability:
<q>"Linearizability provides the **illusion** that each operation takes effect **instantaneously** at some point between its invocation and its response,
implying that the meaning of a concurrent object's operations can still be given by pre- and post conditions."</q>[^2]
The authors clearly do not mean to imply that operations take affect instantaneously in a temporal sense &mdash; that is why they call it an illusion.
But why exactly such an illusion occurs when a linearizable object is used? It is because the requirements imposed by the linearizable consistency model
<q>"allow us to describe acceptable concurrent behavior directly in terms of acceptable sequential behavior,
an approach that simplifies both formal and informal reasoning about concurrent programs."</q>[^2]
If all operations on an object can be thought of as being sequential,
then the duration of each operation in such a sequential history stops affecting the behaviour of the object,
and therefore we may imagine that operations take effect instantaneously.
I cannot speak for others, but to me, informal remarks in articles about concurrency or distributed systems that appeal to words with temporal semantics,
introduce confusion instead of helping to understand the concept being explained.

## [](#conclustion){:.section-link}Conclusion {#conclusion}
Just like the concept of "now" can be used with regard to the Universe or its part
only if we think of them within a model that is even more simple than the one provided by the theory of special relativity,
it can be used with regard to a logical system only if the two aforementioned premises hold for the system,
which is something that should be accurately thought of before appealing to the concept of "now".
If you imply temporal semantics when using the words "now", "immediate" while reasoning about concurrency, you are probably doing something wrong.

I may recommend also reading [There is No Now](https://dl.acm.org/doi/10.1145/2742694.2745385)<span class="insignificant">&nbsp;by Justin Sheehy</span>.

[^1]: The word "atomic" is overloaded: it is used both as a synonym of being linearizable (by the way, a `volatile` field in Java is a linearizable register)
    and as the atomicity property in ACID, which is about either committing all actions bundled together in a transaction, or ensuring that none of them happened.

[^2]: [Linearizability: A Correctness Condition for Concurrent Objects](https://cs.brown.edu/~mph/HerlihyW90/p463-herlihy.pdf)<span class="insignificant sub">&nbsp;by [Maurice P. Herlihy](https://cs.brown.edu/~mph/), [Jeannette M. Wing](http://www.cs.cmu.edu/~wing/)</span>
