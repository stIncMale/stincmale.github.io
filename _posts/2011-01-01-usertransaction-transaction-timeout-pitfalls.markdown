---
layout: post
slug: usertransaction-transaction-timeout-pitfalls
title: Pitfalls with <code>UserTransaction<wbr>.setTransactionTimeout</code>
categories: [tech]
tags: [Jakarta EE, Java]
date: 2011-01-01T12:00:00Z
custom_post_date: 2011
custom_update_date: 2021-12-19T18:26:00Z
custom_keywords: [UserTransaction.setTransactionTimeout, setTransactionTimeout, transaction timeout]
custom_description: Things to pay attention to when using UserTransaction.setTransactionTimeout.
---
{% include common-links-abbreviations.markdown %}

[`UserTransaction.setTransactionTimeout`]: <https://jakarta.ee/specifications/transactions/2.0/apidocs/jakarta/transaction/UserTransaction.html#setTransactionTimeout-int->
[`UserTransaction.begin`]: <https://jakarta.ee/specifications/transactions/2.0/apidocs/jakarta/transaction/UserTransaction.html#begin-->

First and foremost, [`UserTransaction.setTransactionTimeout`]<!-- -->[^1]
affects only subsequent[^2] transactions associated with the [current thread](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/Thread.html#currentThread()).
This behavior is explicitly stated in the documentation, but may not be intuitively expected. However, if we think about this behavior, it becomes obvious that
if the method were affecting transactions [started](https://jakarta.ee/specifications/transactions/2.0/apidocs/jakarta/transaction/UserTransaction.html#begin--) by other threads,
then setting a transaction timeout would have been inherently racy[^3]: another thread could have called [`UserTransaction.setTransactionTimeout`] with a different timeout
[concurrently]({% post_url 2020-05-17-parallelism-vs-concurrency %}#concurrency) with the current thread calling [`UserTransaction.setTransactionTimeout`] and [`UserTransaction.begin`].
In such a situation it would have been impossible to predict the timeout value for the transaction started by the current thread.

Another surprise is that calling a method of an [enterprise bean](https://eclipse-ee4j.github.io/jakartaee-tutorial/ejb-intro.html#GIJSZ) that uses
[container-managed transactions](https://eclipse-ee4j.github.io/jakartaee-tutorial/transactions004.html#BNCIJ) may result in loosing the timeout set via
[`UserTransaction.setTransactionTimeout`] if the method of the enterprise bean starts a transaction and the transaction timeout configured for this method/bean
is different from what you set via [`UserTransaction.setTransactionTimeout`]. This of course depends on the implementation of
[Jakarta Enterprise Beans](https://jakarta.ee/specifications/enterprise-beans/) that is being used.
Following is the code provided as an example where I experienced the described unexpected behavior with [Oracle WebLogic Server](https://docs.oracle.com/en/middleware/standalone/weblogic-server/).

```java
userTransaction.setTransactionTimeout(10);
// checkSomething starts a new transaction with the timeout 2 seconds
if (myBeanWithContainerManagedTransactions.checkSomething(2)) {
    /* Instead of the expected timeout of 10 seconds,
     * this call starts a transaction with the timeout of 2 seconds. */
    userTransaction.begin();
}
```

In order to avoid this potential problem, one should always call [`UserTransaction.setTransactionTimeout`] right before[^2] calling [`UserTransaction.begin`],
or, even better, use this functionality indirectly,
e.g., via [Spring Framework](https://docs.spring.io/spring-framework/docs/current/spring-framework-reference/data-access.html#tx-prog-template)'s
[`TransactionTemplate`](https://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/transaction/support/TransactionTemplate.html).

[^1]: If a transaction is not terminated by
    either [committing](https://jakarta.ee/specifications/transactions/2.0/apidocs/jakarta/transaction/UserTransaction.html#commit--)
    or [rolling back](https://jakarta.ee/specifications/transactions/2.0/apidocs/jakarta/transaction/UserTransaction.html#rollback--)
    then [Jakarta Transactions](https://jakarta.ee/specifications/transactions/) implementation automatically rolls it back.

    This setting is not to be confused with e.g. PostgreSQL [`idle_in_transaction_session_timeout`](https://www.postgresql.org/docs/current/runtime-config-client.html#GUC-IDLE-IN-TRANSACTION-SESSION-TIMEOUT).

[^2]: "Subsequent"/"right before" is defined according to the [program order](https://docs.oracle.com/javase/specs/jls/se17/html/jls-17.html#jls-17.4.3).

[^3]: I am talking about a [race condition]({% post_url 2015-01-01-race-condition-vs-data-race %}#race-condition) here.
