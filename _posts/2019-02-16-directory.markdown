---
layout: post
slug: directory
title: Directory vs directory service vs naming service vs LDAP vs JNDI
categories: [tech]
tags: [Java, security, disambiguation]
date: 2019-02-16T12:00:00Z
custom_update_date: 2022-04-15T11:51:00Z
custom_keywords: [directory, directory service, naming service, LDAP, JNDI]
custom_description: This article briefly explains what directory and naming services are, and how they can be accessed.
---
{% include common-links-abbreviations.markdown %}

[`bind`]: <https://www.rfc-editor.org/rfc/rfc4511#section-4.2>
[directories]: <#directory>
[directory service]: <#directory-service>
[directory services]: <#directory-service>
[directory server]: <#directory-service>
[naming service]: <#naming-service>
[LDAP server]: <#ldap>
[naming]: <#naming-service>
[PostgreSQL JDBC Driver]: <https://jdbc.postgresql.org/>
[Spring Security]: <https://spring.io/projects/spring-security>
[Java Naming and Directory Interface (JNDI)]: <https://docs.oracle.com/en/java/javase/17/docs/api/java.naming/module-summary.html>
[JNDI]: <https://docs.oracle.com/en/java/javase/17/docs/api/java.naming/module-summary.html>
[LDAP Naming Service Provider for JNDI]: <https://docs.oracle.com/javase/8/docs/technotes/guides/jndi/jndi-ldap.html>
[JDBC]: <https://docs.oracle.com/en/java/javase/17/docs/api/java.sql/module-summary.html>

*[CQL]:
{:data-title="Cassandra Query Language"}

Before I begin, I want to point out that the [documentation](https://directory.apache.org/apacheds/basic-ug/1.2-some-background.html)
of [ApacheDS](https://directory.apache.org/apacheds/) does a good job concisely explaining the concepts addressed here,
the tutorial [Naming and Directory Concepts](https://docs.oracle.com/javase/tutorial/jndi/concepts/index.html)
is also handy. I am adding something extra to explain the concepts&mdash;an analogy.
Besides, I also want to briefly talk about [LDAP authentication](#ldap-authentication) and [JNDI](#jndi).

{% include toc.markdown %}

## [](#directory){:.section-link}Directory {#directory}
<div class="info-block" markdown="1">
**Directory**&mdash;a hierarchical database (DB) with a specific structure: names are associated with objects (such an association is called a **binding**),
objects are associated with attributes. Just like a relational or any other DB, it can be represented in various ways,
e.g., by data structure in memory, a file, etc.
</div>

## [](#directory-service){:.section-link}Directory service {#directory-service}
<div class="info-block" markdown="1">
**Directory service**, a.k.a. **directory server**&mdash;a database management system (DBMS) for [directories].
</div>

## [](#naming-service){:.section-link}Naming service {#naming-service}
<div class="info-block" markdown="1">
**Naming service**&mdash;a DBMS similar to a [directory service], but the managed hierarchical DB contains only bindings.
The functional difference between a naming service and a [directory service] is that the former focuses on looking up and updating the stored bindings,
while the latter additionally provides extensive search capabilities and updates of the stored object attributes.
</div>
So any [directory service] is also a naming service, but not vice-versa.
[DNS] is the most known naming service that contains bindings between machine names and [IP] addresses.
Another example is the naming service provided by a
[Jakarta EE server](https://jakarta.ee/specifications/platform/9/jakarta-platform-spec-9.html#jakarta-ee-servers)<!-- -->[^1]
to allow [access by name to various resources](https://jakarta.ee/specifications/platform/9/jakarta-platform-spec-9.html#a567).

## [](#ldap){:.section-link}Lightweight Directory Access Protocol (LDAP) {#ldap}
<div class="info-block" markdown="1">
**Lightweight Directory Access Protocol** ([LDAP])&mdash;a standard protocol of communication with a [directory server].
</div>

<div class="info-block" markdown="1">
**LDAP server**&mdash;a [directory server] that supports being accessed via LDAP.
</div>

Nothing prevents existence of other vendor-specific protocols serving the same purpose.
The situation of having a standard protocol is very different from what we have in the rest of the DBMS world,
where each DBMS has its own protocol and a driver library (a client) implementing it
(e.g.,
[PostgreSQL JDBC Driver] for [PostgreSQL],
[Datastax Java Driver](https://docs.datastax.com/en/developer/java-driver/) for [Cassandra],
[MongoDB Java Drivers](https://www.mongodb.com/docs/drivers/java-drivers/) for [MongoDB]).

<div class="info-block" markdown="1">
* [LDAP] is to
  * [OpenLDAP Directory Services](https://www.openldap.org/) /
  [ApacheDS](https://directory.apache.org/apacheds/) /
  [Active Directory Domain Services](https://docs.microsoft.com/en-us/windows-server/identity/ad-ds/active-directory-domain-services) / etc.,
* as [PostgreSQL Frontend/Backend Protocol](https://www.postgresql.org/docs/current/protocol.html) is to
  * [PostgreSQL],
* as [Cassandra Query Language (CQL) binary protocol](https://github.com/apache/cassandra/blob/trunk/doc/native_protocol_v5.spec) is to
  * [Cassandra],
* as [MongoDB Wire Protocol](https://www.mongodb.com/docs/manual/reference/mongodb-wire-protocol/) is to
  * [MongoDB].
</div>

### [](#ldap-authentication){:.section-link}LDAP [authentication] {#ldap-authentication}
Since organizations often keep user records in a [directory service], it is a natural idea to use it for authentication.
There are two ways one can implement authentication in an application via LDAP
(excluding other nonstandard ways of authentication a specific directory service may provide):
1. by using the [`bind`] operation that was specifically designed for this purpose
   (see also this [specification](https://www.rfc-editor.org/rfc/rfc4513#section-5) for additional info about the authentication mechanisms provided by the [`bind`] operation);
2. by using the [`compare`](https://www.rfc-editor.org/rfc/rfc4511#section-4.10) operation and comparing the provided and stored password hashes
([salted hashing](https://docs.spring.io/spring-security/site/docs/current/api/org/springframework/security/crypto/bcrypt/BCrypt.html)
is incompatible with this approach, which makes the whole approach questionable).

[Spring Security] calls the former approach
[bind authentication](https://docs.spring.io/spring-security/site/docs/current/reference/html5/#servlet-authentication-ldap-bind)
(see also [<code>org<wbr>.springframework<wbr>.security<wbr>.ldap<wbr>.authentication<wbr>.BindAuthenticator</code>](https://docs.spring.io/spring-security/site/docs/current/api/org/springframework/security/ldap/authentication/BindAuthenticator.html)),
and the latter one is called
[password authentication](https://docs.spring.io/spring-security/site/docs/current/reference/html5/#servlet-authentication-ldap-pwd)
(see also [<code>org<wbr>.springframework<wbr>.security<wbr>.ldap<wbr>.authentication<wbr>.PasswordComparisonAuthenticator</code>](https://docs.spring.io/spring-security/site/docs/current/api/org/springframework/security/ldap/authentication/PasswordComparisonAuthenticator.html)).

## [](#jndi){:.section-link}Java Naming and Directory Interface (JNDI) {#jndi}
Usually, authentication is not the only thing that an application wants, and other interactions with a [directory service] may be required.
<div class="info-block" markdown="1">
**Java Naming and Directory Interface** ([JNDI])&mdash;a part of the
[Java SE API Specification](https://cr.openjdk.java.net/~iris/se/17/spec/fr/java-se-17-fr-spec/api/index.html)
that provides API for working with [naming] and [directory services] and SPI for plugging in implementations of this API for different services
(see also [JNDI docs published by Oracle](https://docs.oracle.com/javase/8/docs/technotes/guides/jndi/index.html)).
</div>

Both [OpenJDK JDK] and [Oracle JDK] have [LDAP Naming Service Provider for JNDI]
which implements [`javax.naming.ldap.LdapContext`](https://docs.oracle.com/en/java/javase/17/docs/api/java.naming/javax/naming/ldap/LdapContext.html)
(see also [`com.sun.jndi.ldap.LdapCtxFactory`](https://github.com/openjdk/jdk/blob/master/src/java.naming/share/classes/com/sun/jndi/ldap/LdapCtxFactory.java)
and [LDAP and JNDI tutorial published by Oracle](https://docs.oracle.com/javase/tutorial/jndi/ldap/index.html)).
[Spring LDAP](https://spring.io/projects/spring-ldap) provides a JNDI facade
[`org.springframework.ldap.core.LdapTemplate`](https://docs.spring.io/spring-ldap/docs/current/apidocs/org/springframework/ldap/core/LdapTemplate.html) 
to simplify interactions with an [LDAP server].

<div class="info-block" markdown="1">
* [LDAP Naming Service Provider for JNDI] is to
  * [JNDI],
* as [PostgreSQL JDBC Driver] is to
  * [JDBC].
</div>

Unlike JDBC with its [`java.sql.Connection`](https://docs.oracle.com/en/java/javase/17/docs/api/java.sql/java/sql/Connection.html),
JNDI does not expose connections and manages them under the hood. In some cases, one may want to be aware of the connection management
and have some control over it. This [connection management tutorial](https://docs.oracle.com/javase/tutorial/jndi/ldap/connect.html) 
explains how to do so for the [LDAP Naming Service Provider for JNDI].

DNS, being a [naming service], can also be accessed via JNDI, and both [OpenJDK JDK] and [Oracle JDK]
have [DNS Service Provider for JNDI](https://docs.oracle.com/javase/8/docs/technotes/guides/jndi/jndi-dns.html)
which implements [`javax.naming.directory.DirContext`](https://docs.oracle.com/en/java/javase/17/docs/api/java.naming/javax/naming/directory/DirContext.html)
(see also [`com.sun.jndi.dns.DnsContextFactory`](https://github.com/openjdk/jdk/blob/master/src/jdk.naming.dns/share/classes/com/sun/jndi/dns/DnsContextFactory.java)).

[^1]: A [Jakarta EE server](https://jakarta.ee/specifications/platform/9/jakarta-platform-spec-9.html#jakarta-ee-servers) is a runtime portion of
    a [Jakarta EE product](https://jakarta.ee/specifications/platform/9/jakarta-platform-spec-9.html#flexibility-of-product-requirements),
    and is analogue of a [Java EE server](https://javaee.github.io/tutorial/overview005.html#BNABR), a.k.a. application server
    ([Jakarta EE] is a successor of [Java EE]).
    See this [footnote]({% post_url 2019-05-06-make-app-behavior-consistent %}#fn:1) for more info about Java platform.
