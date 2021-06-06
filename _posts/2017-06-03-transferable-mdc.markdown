---
layout: post
slug: transferable-mdc
title: Using SLF4J MDC across threads
categories: [tech]
tags: [Java]
date: 2017-06-03T12:00:00Z
custom_update_date: 2021-06-06T21:44:00Z
custom_keywords: [MDC, mapped diagnostic context, ThreadContext, SLF4J, Log4j, logging]
custom_description: When a single task is done by multiple threads one may want to pass MDC between the threads to achieve task-scoped behavior. TransferableMdc is the tool that does this for you.
---
{% include common-links-abbreviations.markdown %}

*[MDC]:
{:data-title="Mapped Diagnostic Context"}

Mapped diagnostic context (MDC) is a tool that allows propagating diagnostic information from method to method
without cluttering methods' signatures with excessive parameters. Semantically, this information is task-scoped, i.e., it is relevant
only to a specific task, and may be added to log entries by a logging library without writing additional application code.

[SLF4J](http://www.slf4j.org/manual.html#mdc), [Logback](http://logback.qos.ch/manual/mdc.html),
[Log4j 2](https://logging.apache.org/log4j/2.x/manual/thread-context.html) all implement MDC by making its state thread-scoped.
This means that the information is accessible to the code that is executed by the same thread
and is not accessible to the code executed by different threads.
This approach works fine when a single task is processed by a single thread and fails if more than one thread participates in processing a task.
Logback [recommends](http://logback.qos.ch/manual/mdc.html#managedThreads) using the methods
[`MDC.getCopyOfContextMap()`](http://www.slf4j.org/apidocs/org/slf4j/MDC.html#getCopyOfContextMap())/<wbr>[`MDC.setContextMap(Map<String, String> contextMap)`](http://www.slf4j.org/apidocs/org/slf4j/MDC.html#setContextMap(java.util.Map))
for transferring the context between threads, Log4j 2 also [suggests](https://logging.apache.org/log4j/2.x/manual/thread-context.html#Implementation_details)
implementing such transferring in the application.
In my opinion, this task should be solved by logging libraries instead of being shifted to users, especially given that
if a user forgets to roll back thread's context changes after the thread finished working on a task,
then log entries related to other tasks may be polluted with the data from the transferred context because threads may and should be reused
for other tasks. So I created this [pull request](https://github.com/qos-ch/slf4j/pull/150) implementing the aforementioned functionality in SLF4J.
The API can be used like this:

```java
TransferableMdc outerMdc = TransferableMdc.current();
executor.submit(() -> {
    try (var transferredMdc = outerMdc.transfer()) {
        logger.info("This call can access contents of outerMdc via org.slf4j.MDC");
    }
    logger.info("This call cannot access contents of outerMdc via org.slf4j.MDC");
});
```

This pull request was not merged into SLF4J because we could not come to an agreement with [Ceki Gulcu](https://github.com/ceki), its author,
about the behavior of the [`TransferableMdc.close()`](https://www.kovalenko.link/server/apidocs/stincmale.server/stincmale/server/util/logging/TransferableMdc.html#close())
method: he thinks this method should always [clear](http://www.slf4j.org/apidocs/org/slf4j/MDC.html#clear()) MDC,
while I think it should roll back the changes by reverting the context state to the state before MDC was transferred.
As a side note, I think that merge/unmerge behavior may be implemented additionally as an alternative to the current override/rollback behavior,
as I mentioned in [this comment](https://github.com/qos-ch/slf4j/pull/150#discussion_r307762723),
but always clearing the context seems more like a disruptive rather than helping behavior.

Anyway, the class [`TransferableMdc`](https://www.kovalenko.link/server/apidocs/stincmale.server/stincmale/server/util/logging/TransferableMdc.html)
is documented, [tested](https://github.com/stIncMale/server/blob/master/src/test/java/stincmale/server/util/logging/TransferableMdcTest.java)
and you are free to use it, as it is licensed under [WTFPL].
