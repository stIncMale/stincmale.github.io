---
layout: post
slug: memory-model-resources
title: Useful resources on memory models
categories: [tech]
tags: [concurrency, memory model, C, C++, Rust, Java]
date: 2022-09-25T12:00:00Z
custom_update_date: 2023-12-31T09:15:00Z
custom_keywords: [C memory model, C++ memory model, Rust memory model, Java memory model, JMM]
custom_description: A list of resources on memory models and accompanying topics.
---
{% include common-links-abbreviations.md %}

A list of resources on memory models and accompanying topics.

{% include toc.md %}

## [](#general){:.section-link}General {#general}

Non-language-specific resources:

* ["Hardware Memory Models"](https://research.swtch.com/hwmm),
  ["Programming Language Memory Models"](https://research.swtch.com/plmm)<span class="insignificant">&nbsp;by [Russ Cox](https://swtch.com/~rsc/)</span>
* ["Многопоточное программирование&mdash;теория и практика"](https://youtu.be/mf4lC6TpclM)<span class="insignificant">&nbsp;by [Roman Elizarov](https://github.com/elizarov)</span>
  (the talk is in Russian, the slides are
  [here](https://www.slideshare.net/elizarov/j-point-2014-java-memory-model))
* ["Strong consistency models"](https://aphyr.com/posts/313-strong-consistency-models),
  ["Consistency models"](https://jepsen.io/consistency)[^1]<span class="insignificant">&nbsp;by [Kyle Kingsbury](https://aphyr.com/about)</span>

## [](#c){:.section-link}C {#c}

Specification-like resources:

* [Order of evaluation](https://en.cppreference.com/w/c/language/eval_order)
* [Memory model](https://en.cppreference.com/w/c/language/memory_model)[^2]
   * [`memory_order`](https://en.cppreference.com/w/c/atomic/memory_order)
   * [`atomic_thread_fence`](https://en.cppreference.com/w/c/atomic/atomic_thread_fence),
     [`atomic_signal_fence`](https://en.cppreference.com/w/c/atomic/atomic_signal_fence)
   * [Atomic operations](https://en.cppreference.com/w/c/atomic)
      * [`_Atomic`](https://en.cppreference.com/w/c/language/atomic)
* [`volatile`](https://en.cppreference.com/w/c/language/volatile)

Free-form resources:

* ["Modern C"](https://gustedt.gitlabpages.inria.fr/modern-c/)<span class="insignificant">&nbsp;by [Jens Gustedt](https://icps.icube.unistra.fr/index.php/Jens_Gustedt)</span>,
  chapters:
   * ["17. Variations in control flow"](https://livebook.manning.com/book/modern-c/chapter-17)
   * ["18. Threads"](https://livebook.manning.com/book/modern-c/chapter-18)
   * ["19. Atomic access and memory consistency"](https://livebook.manning.com/book/modern-c/chapter-19)

{% comment %} I found no way to use '+' as the `id` attribute in a header.
This looks like a krandown bug to me.{% endcomment %}
## [](#cpp){:.section-link}C++ {#cpp}

Specification-like resources:

* [Order of evaluation](https://en.cppreference.com/w/cpp/language/eval_order)
* [Memory model](https://en.cppreference.com/w/cpp/language/memory_model)
  * [`std::memory_order`](https://en.cppreference.com/w/cpp/atomic/memory_order)
  * [`std::atomic_thread_fence`](https://en.cppreference.com/w/cpp/atomic/atomic_thread_fence),
    [`std::atomic_signal_fence`](https://en.cppreference.com/w/cpp/atomic/atomic_signal_fence)
  * [Atomic operations](https://en.cppreference.com/w/cpp/atomic)
    * [`std::atomic`](https://en.cppreference.com/w/cpp/atomic/atomic),
      [`std::atomic_ref`](https://en.cppreference.com/w/cpp/atomic/atomic_ref)
* [`volatile`](https://en.cppreference.com/w/cpp/language/cv)

## [](#rs){:.section-link}Rust {#rs}

Specification-like resources:

* [Memory model](https://doc.rust-lang.org/reference/memory-model.html)[^3]
  * [`core::sync::atomic::Ordering`](https://doc.rust-lang.org/core/sync/atomic/enum.Ordering.html)
  * [`core::sync::atomic::fence`](https://doc.rust-lang.org/core/sync/atomic/fn.fence.html),
    [`core::sync::atomic::compiler_fence`](https://doc.rust-lang.org/core/sync/atomic/fn.compiler_fence.html)
  * [Atomic operations](https://doc.rust-lang.org/nomicon/atomics.html)
    * [`core::sync::atomic`](https://doc.rust-lang.org/core/sync/atomic/index.html)
* [`core::ptr::read_volatile`](https://doc.rust-lang.org/core/ptr/fn.read_volatile.html),
  [`core::ptr::write_volatile`](https://doc.rust-lang.org/core/ptr/fn.write_volatile.html)

Free-form resources:

* ["Rust Atomics and Locks"](https://marabos.nl/atomics/)<span class="insignificant">&nbsp;by [Mara Bos](https://marabos.nl/)</span>,
  ["Chapter 3. Memory Ordering"](https://marabos.nl/atomics/memory-ordering.html)
* ["Crust of Rust: Atomics and Memory Ordering"](https://youtu.be/rMGWeSjctlY)<span class="insignificant">&nbsp;by [Jon Gjengset](https://thesquareplanet.com/)</span>

Tools:

* [Loom](https://crates.io/crates/loom)&mdash;a testing tool for concurrent Rust code.
* [ThreadSanitizer](https://doc.rust-lang.org/nightly/unstable-book/compiler-flags/sanitizer.html#threadsanitizer)&mdash;a
  data race detection tool.

## [](#java){:.section-link}Java {#java}

Specification-like resources:

* [Memory model (JMM)](https://docs.oracle.com/javase/specs/jls/se17/html/jls-17.html#jls-17.4)
  * [`java.lang.invoke.VarHandle.AccessMode`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/invoke/VarHandle.AccessMode.html)[^4]
  * [`java.lang.invoke.VarHandle.releaseFence`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/invoke/VarHandle.html#releaseFence())/<wbr>
    [`acquireFence`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/invoke/VarHandle.html#acquireFence())/<wbr>
    [`fullFence`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/invoke/VarHandle.html#fullFence())/<wbr>
    [`loadLoadFence`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/invoke/VarHandle.html#loadLoadFence())/<wbr>
    [`storeStoreFence`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/invoke/VarHandle.html#storeStoreFence())[^5]
  * ["Using JDK 9 Memory Order Modes"](http://gee.cs.oswego.edu/dl/html/j9mm.html)<span class="insignificant">&nbsp;by [Doug Lea](http://gee.cs.oswego.edu/)</span>[^6]
  * [`java.util.concurrent.atomic`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/atomic/package-summary.html)

Free-form resources:

* ["Close Encounters of The Java Memory Model Kind"](https://shipilev.net/blog/2016/close-encounters-of-jmm-kind/)<span class="insignificant">&nbsp;by [Aleksey Shipilëv](https://shipilev.net/)</span>
* ["Java 9 VarHandles Best practices, and why?"](https://youtu.be/w2zaqhFczjY)<span class="insignificant">&nbsp;by [Tobi Ajila](https://github.com/tajila)</span>
* ["The JSR-133 Cookbook for Compiler Writers"](http://gee.cs.oswego.edu/dl/jmm/cookbook.html)<span class="insignificant">&nbsp;by [Doug Lea](http://gee.cs.oswego.edu/)</span>
* ["What do `Atomic*::lazySet`/<wbr>`Atomic*FieldUpdater::lazySet`/<wbr>`Unsafe::putOrdered*` actually mean?"](https://psy-lob-saw.blogspot.com/2016/12/what-is-lazyset-putordered.html)<span class="insignificant">&nbsp;by [Nitsan Wakart](https://github.com/nitsanw)</span>
* ["Java `final` field semantics"]({% post_url 2014-01-01-java-final-field-semantics %})
* ["A Formalization of Java's Concurrent Access Modes"](http://compiler.cs.ucla.edu/papers/jam/)<span class="insignificant">&nbsp;by [John Bender](https://johnbender.us/), [Jens Palsberg](https://web.cs.ucla.edu/~palsberg/)</span>

Tools:

* [Lincheck](https://github.com/Kotlin/kotlinx-lincheck)&mdash;a framework for testing
  concurrent data structures for correctness.
* [jcstress]&mdash;an experimental harness and a suite of tests to aid the research
  in the correctness of concurrency support in the JVM, class libraries, and hardware.
* [JPF]&mdash;an extensible software model-checking framework.

[^1]: These resources are about consistency models of distributed systems
    and not about hardware / programming language memory models
    (the latter is just a "hardware" memory model of an abstract machine&mdash;an imaginary computer
    for which a programming language is defined). However, conceptually these are the same thing,
    as one can always treat memory subsystems and processor caches, registers
    as a distributed system with unusually strong guarantes:
    synchronous "network", no message loss, infallible "nodes". Interestingly, when you look
    at things this way, it becomes obvious that the choice in favour of a weaker consistency model
    is not always about the availability&ndash;consistency trade-off as in [CAP],
    but also (in case of memory models&mdash;only) about the latency&ndash;consistency trade-off
    as in [PACELC].

[^2]: <q>["C just copies the C++ memory model; and C++11 was the first version of the model but it has received some bugfixes since then."](https://doc.rust-lang.org/nomicon/atomics.html)</q>
    The C++ memory model was influenced by the Java memory model.

[^3]: There is not much info there, and it will likely stay that way for the foreseeable future.
    <q>["Rust pretty blatantly just inherits the memory model for atomics from C++20."](https://doc.rust-lang.org/nomicon/atomics.html)</q>
    It may be worth mentioning here tangentially related
    ["The Rustonomicon"](https://doc.rust-lang.org/nomicon/index.html)
    and ["Unsafe Code Guidelines Reference"](https://rust-lang.github.io/unsafe-code-guidelines/).

[^4]: So C++ "stole" from Java, C and Rust&mdash;from C++,
    Java ["stole" access modes and fences](https://openjdk.org/jeps/193) from C++,
    the circle is complete.

[^5]: There is no compiler, a.k.a. signal, fence similar to those in C, C++, Rust
    because Java code is not supposed to handle
    [signals](https://pubs.opengroup.org/onlinepubs/9699919799/functions/V2_chap02.html#tag_15_04),
    a.k.a. [hardware and software interrupts](https://en.wikipedia.org/wiki/Interrupt).

[^6]: Instead of individual Java SE contributors publishing memos like that,
    the Java memory model needs to be updated. Any decade now&hellip;
