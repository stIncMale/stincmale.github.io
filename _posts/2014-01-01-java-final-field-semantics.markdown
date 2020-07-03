---
layout: post
slug: java-final-field-semantics
title: Java <code>final</code> field semantics
categories: [tech]
tags: [concurrency, Java]
date: 2014-01-01T12:00:00+00:00
custom_post_date: 2014
custom_update_date: 2020-07-02T20:30:00−06:00
custom_keywords: [final field, final fields, semantics, JMM, Java memory model]
custom_description: A final field in Java is not the same thing as a final variable that may only be assigned to once.
---
{% include common-links-abbreviations.markdown %}

Contrary to popular belief, a `final` field in Java is not the same thing as
a [`final` variable](https://docs.oracle.com/javase/specs/jls/se14/html/jls-4.html#jls-4.12.4) that may only be assigned to once.
[The Java memory model (JMM)](https://docs.oracle.com/javase/specs/jls/se14/html/jls-17.html#jls-17.4) not only has a separate
[section explaining the semantics](https://docs.oracle.com/javase/specs/jls/se14/html/jls-17.html#jls-17.5)
but also introduces two partial orders &mdash; dereference chain (`dereferences`) and memory chain (`mc`)
just for the sake of specifying `final` fields.

This presentation touches almost all aspects of the JMM and has many examples of programs which behavior a reader may find unexpected.
I presented it to my colleagues at [NetCracker Technology](https://www.netcracker.com/) and at [ZeptoLab](https://www.zeptolab.com/).
[Vladimir Sitnikov](https://github.com/vlsi), who is a co-author of the presentation,
made a [public talk](https://youtu.be/f6joeCiz440) in Russian.

{% include google-slides.html id = "2PACX-1vTcmsM3pyonfM4GcNs1MbHm7Cj1PYLckuAXhjkXPig98Zlh3xVQzXK9-jaz9AuctKzYjjy14wUfFD7p" title = "Java <code>final</code> field semantics" %}

## [](#links){:.section-link}Links to useful resources about the JMM {#links}
<!-- This section is linked from 2015-01-01-race-condition-vs-data-race.markdown -->
* [Теоретический минимум для понимания Java Memory Model](https://youtu.be/hxIRyqHRnjE)<span class="insignificant">&nbsp;by [Roman Elizarov](https://github.com/elizarov)</span> (in Russian)
* [Close Encounters of The Java Memory Model Kind](https://shipilev.net/blog/2016/close-encounters-of-jmm-kind/)<span class="insignificant">&nbsp;by [Aleksey Shipilëv](https://shipilev.net/)</span>
* [Using JDK 9 Memory Order Modes](http://gee.cs.oswego.edu/dl/html/j9mm.html)<span class="insignificant">&nbsp;by [Doug Lea](http://gee.cs.oswego.edu/)</span>
* [A Formalization of Java's Concurrent Access Modes](http://compiler.cs.ucla.edu/papers/jam/)<span class="insignificant">&nbsp;by [John Bender](http://johnbender.us/), [Jens Palsberg](http://web.cs.ucla.edu/~palsberg/)</span>
