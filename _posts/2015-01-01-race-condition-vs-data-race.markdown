---
layout: post
slug: race-condition-vs-data-race
title: Race condition vs. data race
categories: [tech]
tags: [concurrency, Java, disambiguation]
date: 2015-01-01T00:00:00+00:00
custom_post_date: 2015
custom_update_date: 2020-07-02T20:00:00−06:00
custom_keywords: [race condition, data race, race, racy]
custom_description: Not all race conditions are data races, and not all data races are race conditions, but they both can cause concurrent programs to fail in unpredictable ways.
---
{% include common-links-abbreviations.markdown %}

*[race condition]:
{:data-title="a property of an algorithm"}
*[data race]:
{:data-title="a property of an execution of a program"}

It may seem that the terms "race condition" and "data race" have the same meaning, while in fact, they are different.
[Java Concurrency in Practice](https://jcip.net/)<span class="insignificant">&nbsp;ISBN: 0321349601</span> book says:

> "Not all race conditions are data races, and not all data races are race conditions,
but they both can cause concurrent programs to fail in unpredictable ways."

The [Java memory model (JMM)](https://docs.oracle.com/javase/specs/jls/se14/html/jls-17.html#jls-17.4) does not directly mention race conditions,
but there is a phrase:

> "freedom from data races still allows errors arising from groups of operations that need to be perceived atomically and are not"

which is in essence an example of a race condition.


In order to demonstrate this difference, I am going to show a situation where there is a race condition but there is no data race,
and a situation where there is a data race but there is no race condition.

{% include toc.markdown %}

## [](#race-condition){:.section-link}Race condition {#race-condition}
<div class="info-block" markdown="1">
**Race condition** &mdash; a property of an algorithm (or a program, a system, etc.) manifested in displaying anomalous outcomes / behaviour
because of unfortunate ordering / relative timing of events.
</div>

## [](#data-race){:.section-link}Data race {#data-race}
<div class="info-block" markdown="1">
**Data race** &mdash; a property of an [execution of a program](https://docs.oracle.com/javase/specs/jls/se14/html/jls-17.html#jls-17.4.6).
According to the JMM, an execution is said to contain a data race if it contains at least two conflicting accesses (reads of or writes to the same variable)
that are not ordered by a [happens-before (`hb`) relation](https://docs.oracle.com/javase/specs/jls/se14/html/jls-17.html#jls-17.4.5)<!-- -->[^1].
Two accesses to the same variable are said to be conflicting if at least one of the accesses is a write.
</div>

This definition can probably be generalized by saying that an execution contains a data race if it contains at least two conflicting accesses
that are not properly coordinated (a.k.a synchronized), but I am going to talk about data races as they are defined by the JMM.
Unfortunately, the above definition has a significant flaw in it, which was pointed out many times by different people,
though the problem has not been fixed as of
the [Java Language Specification (JLS)](https://docs.oracle.com/javase/specs/jls/se14/html/index.html)
for the [Java Platform, Standard Edition (Java SE) 14](https://cr.openjdk.java.net/~iris/se/14/spec/fr/java-se-14-fr-spec/):

* <q>"JLS3 seems to contain a glitch that prevents me from proving that my program is free of data races"</q>\\
<span class="insignificant">[Java Memory Model discussions list](http://www.cs.umd.edu/~pugh/java/memoryModel/archive/2477.html),
[the answer](http://www.cs.umd.edu/~pugh/java/memoryModel/archive/2483.html), 2005</span>
* <q>"I was wondering if there was a happens before guarantee for reads of volatiles relative to later writes."</q>\\
<span class="insignificant">[concurrency-interest discussion list](http://cs.oswego.edu/pipermail/concurrency-interest/2012-January/008883.html),
[the answer](http://cs.oswego.edu/pipermail/concurrency-interest/2012-January/008927.html), 2012</span>
* <q>"Is volatile read happens-before volatile write?"</q>\\
<span class="insignificant">[stackoverflow.com](https://stackoverflow.com/questions/16615140/is-volatile-read-happens-before-volatile-write), 2013</span>
* <q>"The way "data race" and "correctly synchronized" programs are defined in JMM continue bothering me.
It makes completely legit programs producing consistent results with all shared variables declared volatile ... to be "incorrectly synchronized"
because data race definition is equally applicable to plain and volatile accesses.
So my question is: shouldn't data race be specified in JMM for non-volatile conflicting accesses only?"</q>\\
<span class="insignificant">I asked this question in [concurrency-interest discussion list](http://cs.oswego.edu/pipermail/concurrency-interest/2017-December/016272.html)
and recommend reading it for those who are interested in a formal explanation of the problem, 2017</span>

Despite the incorrect definition stated by the JMM stays unchanged, I am going to use a fixed version:
<div class="info-block" markdown="1">
An execution is said to contain a **data race** if it contains at least two conflicting *non-volatile*[^2] accesses 
to a [shared variable](https://docs.oracle.com/javase/specs/jls/se14/html/jls-17.html#jls-17.4.1) that are not ordered by an `hb` relation.
</div>

Despite data race is a property of an execution and not a program, you may hear people saying that a program has a data race.
And we do not have to look far to find such situations because even the JMM does so in some places.
A phrase "the program has a data race" means that there are executions of the program, which are allowed[^3] by the JMM and contain a data race
(hereafter in this post I will refer to an execution allowed by the JMM as just an execution). A phrase "the program / algorithm is racy" means
that it has a race condition.

## [](#examples){:.section-link}Examples {#examples}
I will try to give links to the JMM sections needed to understand the explanations below, but it is still better if the reader is familiar with the JMM.
If you feel a bit scared reading [the JMM](https://docs.oracle.com/javase/specs/jls/se14/html/jls-17.html#jls-17.4),
maybe reading [Close Encounters of The Java Memory Model Kind](https://shipilev.net/blog/2016/close-encounters-of-jmm-kind/)<span class="insignificant">&nbsp;by [Aleksey Shipilëv](https://shipilev.net/)</span>
is going to be more fun[^4].

### [](#race-condition-example){:.section-link}Race condition example {#race-condition-example}
While I could have described an algorithm with a race condition in plain English, I will show a source code of a program in Java
which has this condition, just to emphasize that data race and race condition do not necessarily imply one another even in Java programs.

```java
class RaceConditionExample {
  static volatile boolean flag = false;

  static void raiseFlag() {
    flag = true;//w1
  }

  public static void main(String... args) {
    ForkJoinPool.commonPool().execute(RaceConditionExample::raiseFlag);
    System.out.print(flag);//r
  }
}
```

The only shared variable in the program is `flag`[^5], and it is marked as volatile, hence by definition,
there are no data races in any execution of this program.
And yet it is obvious that the program may print not only "true" (let us say the desired outcome), but also "false",
because we do not impose any order between the action `r` reading `flag` for printing and the action `w1` writing true to `flag` in the method `raiseFlag`.
More specifically, these two actions are [synchronization actions](https://docs.oracle.com/javase/specs/jls/se14/html/jls-17.html#jls-17.4.2),
thus they are totally ordered with [synchronization order (`so`)](https://docs.oracle.com/javase/specs/jls/se14/html/jls-17.html#jls-17.4.4).
But both orders

* `so1`: `r`, `w1`
* `so2`: `w1`, `r`

are allowed[^3] and lead to different program outputs &mdash; "false" and "true" respectively.
Moreover, this program may exit without ever executing the method `raiseFlag`, i.e. without printing anything.
So the program clearly has a race condition despite having no data race.

We can get rid of the race condition in our program by waiting until `flag` becomes true
(the approach is only used for demonstration purposes, so please do not copy it blindly to a real code because there are more sane ways
of accomplishing the same goal):

{% comment %}<!-- The character '∈' used here is ELEMENT OF -->{% endcomment %}
```java
class FixedRaceConditionExample {
  static volatile boolean flag = false;//w0

  static void raiseFlag() {
    flag = true;//w1
  }

  public static void main(String... args) {
    ForkJoinPool.commonPool().execute(RaceConditionExample::raiseFlag);
    while (!flag);//r_i, where i ∈ [1, k], k is finite
    System.out.print(flag);//r
  }
}
```

For this modified program the JMM allows executions with *only* the following `so`:

* `so1`: `w0`, `w1`, `r_1`, `r`

  which gives [synchronized-with (`sw`)](https://docs.oracle.com/javase/specs/jls/se14/html/jls-17.html#jls-17.4.4) relation `sw(w1, r)`
  because `w1` and `r` both affect the same `volatile` variable `flag`, and hence `hb(w1, r)`, thus `r == true`.
* `so2`: `w0`, `r_1`, &hellip;, `w1`, &hellip; `r_k`, `r`

  which gives `r == true` for the same reasons as above.

We hereby presented a proof that all executions of this modified program produce the same result: they print "true",
hence this program does not have a race condition.

### [](#data-race-example){:.section-link}Data race example {#data-race-example}

Let us change the example by getting rid of the `volatile` modifier.

```java
class DataRaceExample {
  static boolean flag = false;//w0

  static void raiseFlag() {
    flag = true;//w1
  }

  public static void main(String... args) {
    ForkJoinPool.commonPool().execute(DataRaceExample::raiseFlag);
    while (!flag);//r_i, where i ∈ [1, k), k may be infinite
    System.out.print(flag);//r
  }
}
```

Now all executions have data races because `flag` is not `volatile`, and there are no sources for `hb` relations between `w` and any `r_i`,
or between `w` and `r`. Therefore by definition, all executions of this program contain data races.
In this situation the JMM allows either true or false being read by any of the reads `r_i`, `r`.
So the program may not only print "true" or "false" but may also hang infinitely executing `while (!flag)`{:.highlight .language-java},
thus never performing the action `r`. In other words this program produces anomalous outcomes which are not caused by any unfortunate ordering or timing
but rather by data races in the executions of the program.

For the sake of completeness, I need to say that a data race does not always lead to unexpected outcomes, while a race condition by definition does.
Sometimes data races are used to allow the program to perform faster; these are so-called benign data races.
Examples of such benign cases can be found in the source code of the [OpenJDK]<!-- --> [Java Development Kit (JDK)](https://openjdk.java.net/projects/jdk/)[^6]:

```java
//java.lang.String from OpenJDK JDK 14
//http://hg.openjdk.java.net/jdk/jdk14/file/6c954123ee8d/src/java.base/share/classes/java/lang/String.java#l1526

/** Cache the hash code for the string */
private int hash; // Default to 0

/**
 * Cache if the hash has been calculated as actually being zero, enabling
 * us to avoid recalculating this.
 */
private boolean hashIsZero; // Default to false;

public int hashCode() {
    // The hash or hashIsZero fields are subject to a benign data race,
    // making it crucial to ensure that any observable result of the
    // calculation in this method stays correct under any possible read of
    // these fields. Necessary restrictions to allow this to be correct
    // without explicit memory fences or similar concurrency primitives is
    // that we can ever only write to one of these two fields for a given
    // String instance, and that the computation is idempotent and derived
    // from immutable state
    int h = hash;
    if (h == 0 && !hashIsZero) {
        h = isLatin1() ? StringLatin1.hashCode(value)
                       : StringUTF16.hashCode(value);
        if (h == 0) {
            hashIsZero = true;
        } else {
            hash = h;
        }
    }
    return h;
}
```

Another example known to me was in OpenJDK JDK 6 and is long gone, but one still may see
a corresponding [question on stackoverflow.com](https://stackoverflow.com/questions/41517491/why-readvalueunderlocke-exist-in-concurrenthashmap-s-get-method)
and a [concurrency-interest discussion](http://cs.oswego.edu/pipermail/concurrency-interest/2008-April/005107.html).

[^1]: Relations and partial/total orders mentioned in the JMM are all [binary relations](https://web.stanford.edu/class/archive/cs/cs103/cs103.1142/lectures/07/Slides07.pdf).

[^2]: We can do volatile read/write [actions](https://docs.oracle.com/javase/specs/jls/se14/html/jls-17.html#jls-17.4.2) in Java
    either by accessing a [`volatile` field](https://docs.oracle.com/javase/specs/jls/se14/html/jls-8.html#jls-8.3.1.4)
    or by using [`VarHandle.AccessMode.GET_VOLATILE`](https://cr.openjdk.java.net/~iris/se/14/spec/fr/java-se-14-fr-spec/api/java.base/java/lang/invoke/VarHandle.AccessMode.html#GET_VOLATILE)/<wbr>[`VarHandle.AccessMode.SET_VOLATILE`](https://cr.openjdk.java.net/~iris/se/14/spec/fr/java-se-14-fr-spec/api/java.base/java/lang/invoke/VarHandle.AccessMode.html#SET_VOLATILE).

[^3]: An execution is allowed by the JMM iff it
    * is [well-formed](https://docs.oracle.com/javase/specs/jls/se14/html/jls-17.html#jls-17.4.7),
    * satisfies the [causality requirements](https://docs.oracle.com/javase/specs/jls/se14/html/jls-17.html#jls-17.4.8),
    * satisfies the [requirements for observable behavior](https://docs.oracle.com/javase/specs/jls/se14/html/jls-17.html#jls-17.4.9),
    * obeys the [`final` field semantics](https://docs.oracle.com/javase/specs/jls/se14/html/jls-17.html#jls-17.5),
    * does not display [word tearing](https://docs.oracle.com/javase/specs/jls/se14/html/jls-17.html#jls-17.6).

[^4]: More links to resources about the JMM and its new developments like
    [access modes](https://cr.openjdk.java.net/~iris/se/14/spec/fr/java-se-14-fr-spec/api/java.base/java/lang/invoke/VarHandle.AccessMode.html)
    may be found [here]({% post_url 2014-01-01-java-final-field-semantics %}#links).

[^5]: Here we are ignoring any shared variables used inside <code>ForkJoinPool.commonPool()<wbr>.execute(<wbr>DataRaceExample::raiseFlag)</code> without loss of generality.

[^6]: [OpenJDK] is a community which goal is developing an implementation of Java SE specification.
    The phrase "[OpenJDK JDK](https://openjdk.java.net/projects/jdk/)" means "a JDK developed by the OpenJDK community".
    We may see usage of this phrase, for example, on the page [How to download and install prebuilt OpenJDK packages](https://openjdk.java.net/install/index.html):
    <q markdown="1">"Oracle's OpenJDK JDK binaries for Windows, macOS, and Linux are available on release-specific pages of [jdk.java.net](https://jdk.java.net/)"</q>.
    I find this naming confusing.
