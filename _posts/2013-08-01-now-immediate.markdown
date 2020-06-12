---
layout: post
slug: now-immediate
title: 'Disambiguating "now" and "immediate"'
categories: [tech]
tags: [concurrency, disambiguation]
date: 2013-08-21T00:00:00+03:00
custom_update_date: 2020-06-12T02:55:00−06:00
custom_keywords: [now, currently, current, snapshot, immediately, immediate, instantaneously, instantaneous, instant, concurrency, distributed system, distributed computing]
custom_description: If you imply temporal semantics when using the words &quot;now&quot;/&quot;immediate&quot; while reasoning about concurrency, you are probably doing something wrong.
---
{% include common-links-abbreviations.markdown %}

{% include toc.markdown %}

## [](#now){:.section-link}Now {#now}
The notion of "now" seems to be a good enough illusion for everyday perception of time[^1]. Let us consider with some rigor what "now" means
when used with respect to something physical, that is, the universe or its part, or something logical, e.g., a data object.
Having the current state of `X` assumes both of the following premises:
* existence of absolute time, which allows us to talk about snapshots of `X`;
* the ability to stop time and explore a snapshot of `X` while `X` is not changing, as otherwise, the snapshot would not be the current one.

### [](#absolute-time){:.section-link}Absolute time {#absolute-time}
<div class="info-block" markdown="1">
`X` can be thought as existing in a single timeline that represents **absolute time**
iff the order of any two events `a` and `b` is the same
for all observers, a.k.a. frames of reference, in a physical system,
or for all processes in a logical system.
</div>

If there is absolute time, we can define what a snapshot is. 

<div class="info-block" markdown="1">
**Snapshot** &mdash; the state `S(t)` of `X` at a point `t` on its absolute timeline.
</div>

According to the theory of special relativity, there is no absolute time in which the universe exists.
For any event, i.e., a point in spacetime defined by spacial coordinates and a time coordinate,
there are infinitely many events distanced from it with a space-like interval.
Such events are seen as simultaneous by some observers and are not seen as simultaneous by other observers,
which means the universe does not exist in absolute time.

What if we are talking about a logical system, may it have absolute time? &mdash; it definitely may, for example:
* any sequential object, that is, a data object that is accessed only sequentially, may be thought of as having absolute logical time;
* depending on the consistency model of a [concurrent] object, that is, a data object that may be accessed concurrently,
  we may be able to imagine it existing in absolute logical time.
  This may be done for an object as simple as a linearizable, a.k.a. atomic[^2], register,
  or as complex as a DB managed by a DBMS that guarantees that all transactions are serializable.

Do not get too excited, though &mdash; there are many logical [concurrent] systems, especially distributed ones, such that different parts of a system
exist in different timelines. [`LongAdder`](https://cr.openjdk.java.net/~iris/se/14/spec/fr/java-se-14-fr-spec/api/java.base/java/util/concurrent/atomic/LongAdder.html)
from [Java Platform, Standard Edition (Java SE) API](https://cr.openjdk.java.net/~iris/se/14/spec/fr/java-se-14-fr-spec/api/index.html)
is an example of a simple concurrent object with no absolute timeline and, therefore, no snapshots,
and the [specification](https://cr.openjdk.java.net/~iris/se/14/spec/fr/java-se-14-fr-spec/api/java.base/java/util/concurrent/atomic/LongAdder.html#sum()) is explicit about this:
<q>"The returned value is NOT an atomic snapshot; invocation in the absence of concurrent updates returns an accurate result,
but concurrent updates that occur while the sum is being calculated might not be incorporated."</q>

### [](#stop-time){:.section-link}The ability to stop time {#stop-time}
At least on the macroscopic scale, we perceive time as flowing unstoppably and irreversibly.
What is it exactly that allows us to perceive and measure the time? The answer to this question is &mdash; changes.
We perceive the flow of time because we observe changes, and if all changes stopped, it would have been equivalent to time stopping.
An observer within a part of the universe where there are no changes (this is a hypothetical situation which is not physically possible)
or within a logical system where no changes are happening cannot perceive that the time is stopped, but an external observer can.

<div class="info-block" markdown="1">
A snapshot `S(tc)` of `X` is the **current snapshot** iff
1. all instants `t` on the absolute timeline of `X` are such that `t` &le; `tc`;
2. the above stays true while `S(tc)` is being explored, i.e., time is stopped for `X` but is not stopped for its external observer.

`tc` is called the **current time** or **now**.
</div>

It is impossible to stop the universe or its part from continuously changing, which means that even if there were absolute time in which the universe
exists, there would be strictly speaking no "now". Nevertheless, it still may be useful in some situations to imagine a part of the universe as
existing in absolute time and maybe even not changing, and imagine us as being external observers of that part.
Within such a model "now" makes sense.

Unlike with the universe, preventing a logical system from changing its state and observing it externally is very much possible.

## [](#immediate){:.section-link}Immediate {#immediate}
Consider the following sentence: "I initiated the process of releasing a hotfix immediately after I finished fixing the problem."
This sentence conveys that after fixing the problem I initiated a hotfix release instead of doing anything else,
but tells nothing about how soon I did that &mdash; I might have done it with a minute delay or with a delay of hours.

Even though the word "immediately" is commonly thought of as expressing a temporal quality,
and is often used interchangeably with "instantaneously", it has a clear meaning only when expressing ordering relations.
The phrase "`y` immediately follows `x`" has the same meaning as the phrase "`y` is ordered immediately after `x`",
which means that there is no element `z` different from both `x` and `y` such that `x` if ordered before `z` and `z` is ordered before `y`.
This is the only meaning of the word "immediate" that one may use when reasoning about concurrency.

With this in mind, let us consider the following statement about linearizability:
<q>"Linearizability provides the **illusion** that each operation takes effect **instantaneously** at some point between its invocation and its response,
implying that the meaning of a concurrent object's operations can still be given by pre- and post conditions."</q>[^3]
The authors clearly do not mean to imply that operations take effect instantaneously in a temporal sense &mdash; that is why they call it an illusion.
But why exactly does such an illusion occur when a linearizable object is used? It is because the requirements imposed by the linearizable consistency model
<q>"allow us to describe acceptable concurrent behavior directly in terms of acceptable sequential behavior,
an approach that simplifies both formal and informal reasoning about concurrent programs."</q>[^3]
If all operations on an object can be thought of as being sequential,
then the duration of each operation in such a sequential history stops affecting the behaviour of the object,
and therefore we may imagine that operations take effect instantaneously.
I cannot speak for others, but to me, informal remarks in articles about concurrency / distributed systems that appeal to words with temporal semantics,
introduce confusion instead of helping to clarify the concept being explained.

## [](#conclustion){:.section-link}Conclusion {#conclusion}
Just like the concept of "now" can be used with regard to the universe or its part
only if we think of them within a model that is even more simple than the one provided by the theory of special relativity,
it can be used with regard to a logical system only if the two aforementioned premises hold for the system,
which is something that should be accurately thought of before appealing to the concept of "now".

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

I would like to add that if you imply temporal semantics when using the words "now"/"immediate" while reasoning about concurrency,
you are probably doing something wrong.
See also [There is No Now](https://dl.acm.org/doi/10.1145/2742694.2745385)<span class="insignificant">&nbsp;by Justin Sheehy</span>.

[^1]: {%- comment -%}<!-- This footnote is linked from 2020-05-17-parallelism-vs-concurrency.markdown -->{%- endcomment -%}
    The concept of physical time is not trivial, and I am not qualified in this area,
    but I can recommend a few videos of qualified people talking about / discussing this topic:

    * [The Distinction of Past and Future](https://youtu.be/VU0mpPm9U-4)\\
      <span class="insignificant">[Richard Feynman](https://en.wikipedia.org/wiki/Richard_Feynman)</span>
    * [Time Is of the Essence… or Is It?](https://youtu.be/N-NTXoYTvao)\\
      <span class="insignificant">Participants: [David Z. Albert](https://en.wikipedia.org/wiki/David_Albert), [Vijay Balasubramanian](https://www.sas.upenn.edu/~vbalasub/Home.html), [Carlo Rovelli](http://www.cpt.univ-mrs.fr/~rovelli/), [Lee Smolin](http://leesmolin.com/); moderator: [Jim Holt](https://en.wikipedia.org/wiki/Jim_Holt_(philosopher))</span>
    * [The Physics and Philosophy of Time](https://youtu.be/-6rWqJhDv7M)\\
      <span class="insignificant">[Carlo Rovelli](http://www.cpt.univ-mrs.fr/~rovelli/)</span>
    * [The Richness of Time](https://youtu.be/1FJWvEbeBps)\\
      <span class="insignificant">Participants: [Lera Boroditsky](http://lera.ucsd.edu/), [Dean Buonomano](https://en.wikipedia.org/wiki/Dean_Buonomano); moderator: [Brian Greene](http://www.briangreene.org/)</span> 

[^2]: The word "atomic" is overloaded: it is used both as a synonym of being linearizable (by the way, a `volatile` field in Java is a linearizable register)
    and as the atomicity property in ACID, which is about either committing all actions bundled together in a transaction, or ensuring that none of them happened.

[^3]: [Linearizability: A Correctness Condition for Concurrent Objects](https://cs.brown.edu/~mph/HerlihyW90/p463-herlihy.pdf)<span class="insignificant sub">&nbsp;by [Maurice P. Herlihy](https://cs.brown.edu/~mph/), [Jeannette M. Wing](http://www.cs.cmu.edu/~wing/)</span>
