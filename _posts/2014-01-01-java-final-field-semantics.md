---
layout: post
slug: java-final-field-semantics
title: Java <code>final</code> field semantics
categories: [tech]
tags: [concurrency, memory model, Java]
date: 2014-01-01T12:00:00Z
custom_post_date: 2014
custom_update_date: 2022-09-25T12:01:00Z
custom_keywords: [final field, final fields, semantics, JMM, Java memory model]
custom_description: A final field in Java is not the same thing as a final variable that may only be assigned to once.
---
{% include common-links-abbreviations.md %}

Contrary to popular belief,
a [`final` field](https://docs.oracle.com/javase/specs/jls/se17/html/jls-17.html#jls-17.5)
in Java is not the same thing as
a [`final` variable](https://docs.oracle.com/javase/specs/jls/se17/html/jls-4.html#jls-4.12.4)
that may only be assigned to once.
The [Java memory model (JMM)](https://docs.oracle.com/javase/specs/jls/se17/html/jls-17.html#jls-17.4)
not only has a separate
[section explaining the semantics](https://docs.oracle.com/javase/specs/jls/se17/html/jls-17.html#jls-17.5)
but also introduces two partial orders&mdash;dereference chain (`dereferences`)
and memory chain (`mc`) just for the sake of specifying `final` fields.

This presentation touches almost all aspects of the JMM and has many examples of programs which behavior a reader may find unexpected.
I presented it to my colleagues at [NetCracker Technology](https://www.netcracker.com/) and at [ZeptoLab](https://www.zeptolab.com/).
[Vladimir Sitnikov](https://github.com/vlsi), who is a co-author of the presentation,
made a [public talk (in Russian)](https://youtu.be/f6joeCiz440)

{% include google-slides.html id = "2PACX-1vTcmsM3pyonfM4GcNs1MbHm7Cj1PYLckuAXhjkXPig98Zlh3xVQzXK9-jaz9AuctKzYjjy14wUfFD7p" title = "Java <code>final</code> field semantics" %}

## [](#links){:.section-link}Links {#links}

* ["Useful resources on memory models"]({% post_url 2022-09-25-memory-model-resources %})
