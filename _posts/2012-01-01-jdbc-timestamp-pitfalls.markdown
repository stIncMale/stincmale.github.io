---
layout: post
slug: jdbc-timestamp-pitfalls
title: Pitfalls with JDBC <code>PreparedStatement<wbr>.setTimestamp</code>/<wbr><code>ResultSet<wbr>.getTimestamp</code>
categories: [tech]
tags: [JDBC, Java]
date: 2012-01-01T12:00:00Z
custom_post_date: 2012
custom_update_date: 2022-04-15T11:50:00Z
custom_keywords: [PreparedStatement.setTimestamp, setTimestamp, ResultSet.getTimestamp, getTimestamp, timestamp, time zone, timezone, timestamp without time zone, timestamp with time zone, OffsetDateTime, LocalDateTime, PreparedStatement.setObject, setObject, ResultSet.getObject, getObject]
custom_description: Beware of using SQL timestamp without time zone as you may not only loose time zone information but also make your application behavior dependent on the machine time zone.
---
{% include common-links-abbreviations.markdown %}

[`timestamp with time zone`]: <https://www.postgresql.org/docs/current/datatype-datetime.html>
[default time zone]: <https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/TimeZone.html#getDefault()>
[`Timestamp`]: <https://docs.oracle.com/en/java/javase/17/docs/api/java.sql/java/sql/Timestamp.html>
[`OffsetDateTime`]: <https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/time/OffsetDateTime.html>
[`JDBCType.TIMESTAMP`]: <https://docs.oracle.com/en/java/javase/17/docs/api/java.sql/java/sql/JDBCType.html#TIMESTAMP>
[`JDBCType.TIMESTAMP_WITH_TIMEZONE`]: <https://docs.oracle.com/en/java/javase/17/docs/api/java.sql/java/sql/JDBCType.html#TIMESTAMP_WITH_TIMEZONE>
[`PreparedStatement.setTimestamp(int parameterIndex, Timestamp x)`]: <https://docs.oracle.com/en/java/javase/17/docs/api/java.sql/java/sql/PreparedStatement.html#setTimestamp(int,java.sql.Timestamp)>
[`PreparedStatement.setTimestamp(int parameterIndex, Timestamp x, Calendar cal)`]: <https://docs.oracle.com/en/java/javase/17/docs/api/java.sql/java/sql/PreparedStatement.html#setTimestamp(int,java.sql.Timestamp,java.util.Calendar)>
[`ResultSet.getTimestamp(int columnIndex)`]: <https://docs.oracle.com/en/java/javase/17/docs/api/java.sql/java/sql/ResultSet.html#getTimestamp(int)>
[`ResultSet.getTimestamp(int columnIndex, Calendar cal)`]: <https://docs.oracle.com/en/java/javase/17/docs/api/java.sql/java/sql/ResultSet.html#getTimestamp(int,java.util.Calendar)>

{% include toc.markdown %}

## [](#situation){:.section-link}Situation {#situation}

Imagine the following Java application:
* it stores timestamp data in a DB via JDBC and reads them back;
* in the DB timestamps are represented as [`timestamp [without time zone]`](https://www.postgresql.org/docs/current/datatype-datetime.html) SQL data type
(the Java SE API counterpart is [`JDBCType.TIMESTAMP`]);
* in the application timestamps are represented as [`Timestamp`].
They are created via the constructor [`Timestamp(long time)`](https://docs.oracle.com/en/java/javase/17/docs/api/java.sql/java/sql/Timestamp.html#%3Cinit%3E(long))
and hence are expected to represent [Java Time-Scale](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/time/Instant.html)[^1].
Values are bound to a [`PreparedStatement`](https://docs.oracle.com/en/java/javase/17/docs/api/java.sql/java/sql/PreparedStatement.html)
via [`PreparedStatement.setTimestamp(int parameterIndex, Timestamp x)`]
and retrieved from a [`ResultSet`](https://docs.oracle.com/en/java/javase/17/docs/api/java.sql/java/sql/ResultSet.html)
via [`ResultSet.getTimestamp(int columnIndex)`].

It is working fine&mdash;stores timestamps and reads them back as expected. But then you start it on a different machine all of a sudden,
it reads not what you expected&mdash;all timestamps are shifted by a few hours. What happened and how this could have been avoided?

## [](#explanation){:.section-link}Explanation {#explanation}
Turns out, the new machine uses a different time zone, but our application was not written correctly to survive such an event. 

The first pitfall we fell into is that our imaginary application uses the method
[`PreparedStatement.setTimestamp(int parameterIndex, Timestamp x)`],
which in turn uses the [default time zone] of the Java virtual machine (JVM) to construct SQL [`timestamp`](https://www.postgresql.org/docs/current/datatype-datetime.html) value for the DB,
which is not something I would expect.
This is a documented JDBC behaviour, but it is documented only for the method [`PreparedStatement.setTimestamp(int parameterIndex, Timestamp x, Calendar cal)`] for some reason.
As a result, the value our application writes to the DB depends not only on the number of milliseconds we use to create a [`Timestamp`]
but also on the [default time zone].

The second mistake is using [`timestamp`](https://www.postgresql.org/docs/current/datatype-datetime.html) SQL data type instead of using [`timestamp with time zone`].
If the DB does not store time zone information, the method [`ResultSet.getTimestamp(int columnIndex)`]
uses the [default time zone] to construct a [`Timestamp`]. This is not documented but is true
and may be guessed from the specification of the method [`ResultSet.getTimestamp(int columnIndex, Calendar cal)`].
Because of this, the [`Timestamp`] our application reads from the DB depends not only on the value stored there
but also on the [default time zone].

What is even more surprising is that in case of using [`timestamp with time zone`], the method [`PreparedStatement.setTimestamp(int parameterIndex, Timestamp x)`]
stops using the [default time zone]. I do not know how JDBC API users are supposed to figure this out without failing at first and then debugging and experimenting.

## [](#solutions){:.section-link}Solutions {#solutions}
### [](#solution-ugly){:.section-link}The Ugly {#solution-ugly}
Use the methods [`PreparedStatement.setTimestamp(int parameterIndex, Timestamp x, Calendar cal)`]/[`ResultSet.getTimestamp(int columnIndex, Calendar cal)`]
with explicitly specified [`Calendar`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Calendar.html) objects
[constructed with the same time zone](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Calendar.html#getInstance(java.util.TimeZone)).
This solution is ugly because once the data is stored in the DB its time zone information is still lost and no one but the writer at best knows what it is.

### [](#solution-bad){:.section-link}The Bad {#solution-bad}
Use the SQL data type [`timestamp with time zone`]
(the Java SE API counterpart is [`JDBCType.TIMESTAMP_WITH_TIMEZONE`]).
This way you not only preserve the time zone information, but also can use more straightforward methods
[`PreparedStatement.setTimestamp(int parameterIndex, Timestamp x)`]/[`ResultSet.getTimestamp(int columnIndex)`].
This solution is bad because the class [`Timestamp`] is mutable, which arguably makes the code less robust at the cost of flexibility to reuse the same object
for different values, which may in theory be justified by reasons related to performance but in practice is unreasonable in situations when JDBC is used.

### [](#solution-good){:.section-link}The Good {#solution-good}
[JSR 221](https://jcp.org/en/jsr/detail?id=221) [JDBC API Specification 4.2](https://jcp.org/aboutJava/communityprocess/mrel/jsr221/index2.html)
introduced, besides others, the following two bidirectional mappings
(see sections *"B.4 Java Object Types Mapped to JDBC Types"*,
*"B.5 Conversions by setObject and setNull from Java Object Types to JDBC Types"*,
*"B.6 Type Conversions Supported by ResultSet getter Methods"* in the specification):
* [`OffsetDateTime`]&mdash;[`JDBCType.TIMESTAMP_WITH_TIMEZONE`]
* [`LocalDateTime`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/time/LocalDateTime.html)&mdash;[`JDBCType.TIMESTAMP`]

The methods [`PreparedStatement.setObject(int parameterIndex, Object x)`](https://docs.oracle.com/en/java/javase/17/docs/api/java.sql/java/sql/PreparedStatement.html#setObject(int,java.lang.Object))/[`ResultSet.getObject(int columnIndex, Class<T> type)`](https://docs.oracle.com/en/java/javase/17/docs/api/java.sql/java/sql/ResultSet.html#getObject(int,java.lang.Class))
can now be used to write/read [`OffsetDateTime`]/[`timestamp with time zone`].
This is the best solution we may have because it uses immutable [`OffsetDateTime`],
the time zone information is not lost, and the behavior does not depend on the [default time zone].

## [](#examples){:.section-link}Examples {#examples}
[Junit 5] tests illustrating the problem and the solutions: [`JdbcTimestampIntegrationTest.java`](https://github.com/stIncMale/sandbox-java/blob/master/examples/src/test/java/stincmale/sandbox/examples/brokentimestamps/JdbcTimestampIntegrationTest.java).

[^1]: Java Time-Scale is similar to Epoch Time, a.k.a. POSIX time,
    see [POSIX](https://pubs.opengroup.org/onlinepubs/9699919799.2018edition/)
    [4.16 Seconds Since the Epoch](https://pubs.opengroup.org/onlinepubs/9699919799.2018edition/basedefs/V1_chap04.html#tag_04_16)
    and [A.4.16 Seconds Since the Epoch](https://pubs.opengroup.org/onlinepubs/9699919799/xrat/V4_xbd_chap04.html#tag_21_04_16).
