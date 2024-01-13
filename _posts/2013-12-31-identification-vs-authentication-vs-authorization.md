---
layout: post
slug: identification-vs-authentication-vs-authorization
title: Identification vs. authentication vs. authorization
categories: [tech]
tags: [security, disambiguation]
date: 2013-12-30T12:00:00Z
custom_post_date: 2013
custom_update_date: 2024-01-13T16:30:00Z
custom_keywords: [identification, authentication, external authentication, perimeter authentication, authorization, subject, security domain, security realm, identity, credential, credentials, ]
custom_description: Identification, authentication, and authorization are crucial parts of implementing access control in a system and they do not mean the same thing.
---
{% include common-links-abbreviations.md %}

*[SIN]:
{:data-title="Social Insurance Number"}
*[SSO]:
{:data-title="Single Sign-On"}
*[RADIUS]:
{:data-title="Remote Authentication Dial In User Service"}

[subject]: <#subject>
[subjects]: <#subject>
[security domain]: <#security-domain>
[security domains]: <#security-domain>
[identity]: <#identity>
[credential]: <#credential>
[credentials]: <#credential>
[identification]: <#identification>
[identify]: <#identification>
[identified]: <#identification>
[authentication]: <#authentication>
[authenticated]: <#authentication>
[authenticate]: <#authentication>
[authenticating]: <#authentication>
[authorization]: <#authorization>

I sometimes notice the words "authentication" and "authorization" being used interchangeably. They sound similar to each other,
they are both related to security, the HTTP specification names a [header field](https://www.rfc-editor.org/rfc/rfc9110#section-6.3) that
<q>"allows a user agent to authenticate itself with an origin server"</q> and has a value that
<q>"consists of credentials containing the authentication information of the user agent for the realm of the resource being requested"</q>
[`Authorization`](https://www.rfc-editor.org/rfc/rfc9110#section-11.6.2)[^1] instead of calling it `Credentials` or `Authentication` at worst.
So there is no wonder these words are confused sometimes.

Lately, I have been doing security-related work, and documenting was a part of the task. I had to define some commonly used security-related terms
and decided to save the definitions for myself and others here.
I also recommend looking at [Java Authentication and Authorization Service (JAAS) Reference Guide](https://docs.oracle.com/en/java/javase/17/security/java-authentication-and-authorization-service-jaas-reference-guide.html#GUID-2A935F5E-0803-411D-B6BC-F8C64D01A25C)
and [Oracle WebLogic Server Glossary](https://docs.oracle.com/en/middleware/standalone/weblogic-server/14.1.1.0/scovr/glossary.html#GUID-74223FB6-8078-472E-8C20-B3BCFF85394E).

{% include toc.md %}

## [](#subject){:.section-link}Subject {#subject}
<div class="info-block" markdown="1">
**Subject**&mdash;an entity that interacts with objects. In other words, the source of a request to the system, e.g., a person or another system.
</div>

See also [JAAS subject](https://docs.oracle.com/en/java/javase/17/security/java-authentication-and-authorization-service-jaas-reference-guide.html#GUID-804BDE80-9E66-421C-BF0A-A96FBE7DE4E3),
[`javax.security.auth.Subject`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/javax/security/auth/Subject.html).

## [](#security-domain){:.section-link}Security domain {#security-domain}
<div class="info-block" markdown="1">
**Security domain/realm**&mdash;a set of [subjects] and objects the [subjects] can act upon, and security policies applied to them.
</div>

See also [WebLogic security realm](https://docs.oracle.com/en/middleware/standalone/weblogic-server/14.1.1.0/scovr/glossary.html#GUID-8AAC41B0-82EF-459A-B5DC-2548AB00336E).

## [](#identity){:.section-link}Identity {#identity}
<div class="info-block" markdown="1">
**Identity**&mdash;data that distinguishes an entity (either a [subject] or an object) from other entities within a given scope, i.e., within a set of [security domains].
</div>

Note that a [subject] may have multiple identities, e.g., a login name or a [Social Insurance Number (SIN)](https://www.canada.ca/en/employment-social-development/services/sin.html)[^2].

## [](#principal){:.section-link}Principal {#principal}
<div class="info-block" markdown="1">
**Principal**&mdash;the [identity] of an [authenticated]<!-- --> [subject].
</div>

See also [JAAS principal](https://docs.oracle.com/en/java/javase/17/security/java-authentication-and-authorization-service-jaas-reference-guide.html#GUID-8FAF9739-CD62-4A47-9582-884DBF3081F0),
[`java.security.Principal`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/security/Principal.html),
[WebLogic principal](https://docs.oracle.com/en/middleware/standalone/weblogic-server/14.1.1.0/scovr/glossary.html#GUID-2934BD38-E5E9-43EB-893D-F204826F93B9).

## [](#credential){:.section-link}Credential {#credential}
<div class="info-block" markdown="1">
**Credential**&mdash;a security-related attribute of a [subject] that may be used to [authenticate] the [subject]. 
</div>

A [subject] may have multiple [credentials], which may be either public or private, i.e., requiring special protection.
For example, a password is a private [credential], while a login name is a public [credential].
Note that a login name is also an [identity], and it is common for an [identity] to be used as a *public* [credential].

## [](#identification){:.section-link}Identification {#identification}
<div class="info-block" markdown="1">
**Identification**&mdash;a process of unambiguous differentiation of a [subject] from other [subjects].
</div>

For example, when I hear the name "Doug Lea" I can unambiguously differentiate ([identify]) that this name ([identity]) belongs to
a [professor of computer science specialized in concurrent programming, whose name is Doug Lea](http://gee.cs.oswego.edu/) ([subject]).
There are many humans with this name, but I have knowledge about only one of them
(my [security domain] contains a single [subject] with the name "Doug Lea").
If I knew more than one human named "Doug Lea", then this name alone would not have been enough to [identify] the [subject],
but both a name and a birth date could have been sufficient.

## [](#authentication){:.section-link}Authentication {#authentication}
<div class="info-block" markdown="1">
**Authentication**&mdash;a process of verifying the [identity] of a [subject].
</div>

In other words, [authenticating] means determining whether a [subject] is in fact what it claims to be.

Consider the following example. A man ([subject]) tells me that his name is "Doug Lea" (claimed [identity]), and I can [identify] that this name belongs to
a [professor of computer science specialized in concurrent programming, whose name is Doug Lea](http://gee.cs.oswego.edu/).
At this point, I cannot be sure the man who claims that he is Doug Lea is actually a man that is [identified] by me as professor Doug Lea.
In order to be sure, I would need to, for example, look at his face ([credentials]) and compare it with the mental image I have&mdash;if they match,
then I successfully [authenticated] the [subject].
If we were to communicate over the Internet without the ability to transmit images,
then in order to prove the [identity]<!-- -->[^3] he could have done something that only the Doug Lea I have knowledge about could do,
e.g., add the random text I sent him to the [Doug Lea's home page](http://gee.cs.oswego.edu/).

See also [WebLogic authentication](https://docs.oracle.com/en/middleware/standalone/weblogic-server/14.1.1.0/scovr/glossary.html#GUID-C1746E2C-29BF-4973-B12E-4C92DA0DF339).

<div class="info-block" markdown="1">
**External authentication**, a.k.a. **perimeter authentication**&mdash;[authentication]
that occurs outside the system that is being accessed.
The external system that performs the [authentication] is usually called an [identity] provider or [authentication] agent/server
and is trusted by the system that is being accessed.
The [identity] provider communicates the result of successful [authentication], which includes the [identity] of the authenticated [subject],
to the system via an artifact that is usually called a token or an assertion.
A token may contain information that is used by the system to verify its authenticity, i.e., that it was created by the trusted [identity] provider.
</div>

Single sign-on (SSO) is implemented by utilizing the external [authentication] approach,
but this approach may often be used just to move the [authentication] burden to a different system.
[Kerberos](https://www.rfc-editor.org/rfc/rfc4120), [LDAP authentication](https://www.rfc-editor.org/rfc/rfc4513),
[RADIUS](https://www.rfc-editor.org/rfc/rfc2865), [OpenID Connect](https://openid.net/developers/how-connect-works/) are all examples of external [authentication].

See also [WebLogic perimeter authentication](https://docs.oracle.com/en/middleware/standalone/weblogic-server/14.1.1.0/scovr/glossary.html#GUID-0E1E0338-573D-4DD9-AD9A-E4C1B488DF0D).

## [](#authorization){:.section-link}Authorization {#authorization}
<div class="info-block" markdown="1">
**Authorization**&mdash;a process of establishing whether a [subject] is allowed to do the requested action according to the security policies.
</div>

[Identification], [authentication], and [authorization] are crucial parts of implementing access control in a system.

[^1]: The `Authorization` header field
    was originally introduced as a [part of HTTP/1.0](https://www.rfc-editor.org/rfc/rfc1945#section-10.2),
    and is now [part of HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html#section-11.6.2),
    which makes it part of [HTTP/2](https://www.rfc-editor.org/rfc/rfc9113.html)
    and [HTTP/3](https://www.rfc-editor.org/rfc/rfc9114.html).

[^2]: How fucking brain-dead should meat bags, a.k.a. humans, be to use in 2020 an [identity] which at the same time acts as a *private* [credential],
    which its owner must both [protect](https://www.canada.ca/en/employment-social-development/programs/sin/protect.html)
    and [share with many unrelated parties](https://www.canada.ca/en/employment-social-development/programs/sin/protect.html#a2)?
    Though, taking into account how humans [perverted the concept of money](https://youtu.be/mzoX7zEZ6h4),
    it is clear, that human stupidity is infinite.

[^3]: This example turned out to be silly to an extent. We have never actually communicated,
    and I believe Doug Lea has more interesting and important things
    than communicating with me, let alone proving his [identity] to me.
