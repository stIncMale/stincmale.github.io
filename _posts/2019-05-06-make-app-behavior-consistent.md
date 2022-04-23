---
layout: post
slug: make-app-behavior-consistent
title: Making Java app behavior consistent in different environments
categories: [tech]
tags: [Java]
date: 2019-05-06T12:00:00Z
custom_update_date: 2022-03-11T06:39:00Z
custom_keywords: [environment, charset, locale, time zone, line separator]
custom_description: The behavior of a process is usually partly dependent on the environment where the process is being executed. This article points out what to pay attention to when writing an application that behaves the same way in different environments.
---
{% include common-links-abbreviations.md %}

*[SE]:
{:data-title="Standard Edition"}
*[ELF]:
{:data-title="Executable and Linking Format"}
*[PE]:
{:data-title="Portable Executable"}

[Bash]: <https://www.gnu.org/software/bash/>
[PowerShell]: <https://docs.microsoft.com/en-us/powershell/>
[Windows Terminal]: <https://docs.microsoft.com/windows/terminal/>
[`iconv`]: <https://pubs.opengroup.org/onlinepubs/9699919799/utilities/iconv.html>
[`TimeZone`]: <https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/TimeZone.html>
[`java.util.TimeZone`]: <https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/TimeZone.html>
[`Locale`]: <https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Locale.html>
[`java.util.Locale`]: <https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Locale.html>
[`Charset`]: <https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/nio/charset/Charset.html>
[`java.nio.charset.Charset`]: <https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/nio/charset/Charset.html>
[`PrintStream`]: <https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/io/PrintStream.html>
[`java.io.PrintStream`]: <https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/io/PrintStream.html>
[`OutputStream`]: <https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/io/OutputStream.html>
[`System.out`]: <https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/System.html#out>
[`System.err`]: <https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/System.html#err>
[source-file mode]: <https://docs.oracle.com/en/java/javase/17/docs/specs/man/java.html#using-source-file-mode-to-launch-single-file-source-code-programs>
[`ConsistentAppExample.java`]: <https://github.com/stIncMale/sandbox-java/blob/master/examples/src/main/java/stincmale/sandbox/examples/makeappbehaviorconsistent/ConsistentAppExample.java>
[`java.io.InputStreamReader`]: <https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/io/InputStreamReader.html>
[`java.io.OutputStreamWriter`]: <https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/io/OutputStreamWriter.html>
[`java.io.Reader`]: <https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/io/Reader.html>
[`java.io.Writer`]: <https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/io/Writer.html>

The behaviour of a process is usually partly dependent on the environment where the process is being executed.
Namely, the default
[time zone](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/TimeZone.html#getDefault()),
[line separator](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/System.html#lineSeparator()),
[locale](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Locale.html#getDefault()),
[charset](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/nio/charset/Charset.html#defaultCharset())
are picked by a JDK[^1] from the environment in which it is being used,
which is usually an operating system's shell (whether a command-line interface (CLI) or a graphical user interface (GUI)).
If we are developing a CLI utility that is used primarily in conjunction with other CLI utilities,
e.g., as part of a [Bash pipeline](https://www.gnu.org/software/bash/manual/html_node/Pipelines.html),
it may be important for such an application to behave in accordance with the environment to improve interoperability with other utilities.
However, if we are developing an application that is supposed to run on its own, we may want to make it behave the same way in different environments.
The Java SE API allows to explicitly specify all the aforementioned, thus, overriding the default values defined by the environment, for example:
* [`LocalDateTime.now()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/time/LocalDateTime.html#now())
  vs. [<code>LocalDateTime.now(<b>ZoneId zone</b>)</code>](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/time/LocalDateTime.html#now(java.time.ZoneId))\\
  <span class="insignificant">see also ["Pitfalls with JDBC `PreparedStatement.setTimestamp`/<wbr>`ResultSet.getTimestamp`"]({% post_url 2012-01-01-jdbc-timestamp-pitfalls %})</span>
* [`String.lines()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/String.html#lines())
  vs. [<code>Scanner.useDelimiter(<b>Pattern pattern</b>)</code>](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Scanner.html#useDelimiter(java.util.regex.Pattern)).[`tokens()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Scanner.html#tokens())
* [`String.format(String format, Object... args)`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/String.html#format(java.lang.String,java.lang.Object...))
  vs. [<code>String.format(<b>Locale l</b>, String format, Object... args)</code>](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/String.html#format(java.util.Locale,java.lang.String,java.lang.Object...))
* [`PrintStream(OutputStream out, boolean autoFlush)`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/io/PrintStream.html#%3Cinit%3E(java.io.OutputStream,boolean))
  vs. [<code>PrintStream(OutputStream out, boolean autoFlush, <b>Charset charset</b>)</code>](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/io/PrintStream.html#%3Cinit%3E(java.io.OutputStream,boolean,java.nio.charset.Charset))

However, in any complex project programmers often forget to explicitly specify the environment-specific values.
It is also not very convenient to always have to specify them explicitly,
and may not always be possible when using 3rd-party APIs.
So it is worth specifying environment-independent application-wide defaults at least as a safeguard 
mechanism.

{% include toc.md %}

## [](#setting-defaults){:.section-link}Setting defaults {#setting-defaults}

### [](#time-zone){:.section-link}Time zone {#time-zone}
The default [`java.util.TimeZone`] is accessible via the methods
[`TimeZone.getDefault()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/TimeZone.html#getDefault())/<wbr>
[`TimeZone.setDefault(TimeZone zone)`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/TimeZone.html#setDefault(java.util.TimeZone)),
and can be set as shown below

```java
TimeZone.setDefault(TimeZone.getTimeZone(ZoneId.from(ZoneOffset.UTC)));
```

### [](#line-separator){:.section-link}Line separator {#line-separator}
Any string/text is simply a sequence of [abstract characters]({% post_url 2013-01-01-charset-vs-encoding %}#acr).
A line is a concept that is not intrinsic to a string/text and is rather added on top of it as a basic way to markup the text for the purpose of
separating different pieces from each other to facilitate human perception. On paper or on a screen we display different lines by spatially separating them.
In a logical system, the information about where a line ends is represented by specially designated control, a.k.a. non-printing/nongraphic, characters
or sequences of them, called line separators, injected in the text.

The Java SE API provides two ways of accessing the default line separator: either directly via the standard `line.separator`
[Java system property](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/System.html#getProperty(java.lang.String))
or by using the method [`java.lang.System.lineSeparator()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/System.html#lineSeparator()).
Note that the method [`System.getProperties()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/System.html#getProperties())
states
> "**Changing a standard system property may have unpredictable results unless otherwise specified.**
> Property values may be cached during initialization or on first use.
> Setting a standard property after initialization … may not have the desired effect."

So the only reliable way of setting the default line separator is by specifying the value of the `line.separator` Java system property when starting a JVM process.
Once this is done, methods like [`java.io.PrintStream.println()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/io/PrintStream.html#println())
will use the specified value. Specifying a Java system property when starting a JVM process is shell-specific, here is how this can be done
when using the [`java`/`javaw`](https://docs.oracle.com/en/java/javase/17/docs/specs/man/java.html) launcher in
* [Bash]
```shell
$ java -Dline.separator=$'\n'
```
See [Bash ANSI-C Quoting](https://www.gnu.org/software/bash/manual/bash.html#ANSI_002dC-Quoting)
for the details about the `$'\n'`{:.highlight .language-shell} syntax.
By the way, the JLS specifies a similar way of [escaping nongraphic characters](https://docs.oracle.com/javase/specs/jls/se17/html/jls-3.html#jls-3.10.7).

* [PowerShell]
```shell
> java -D'line.separator'="`n"
```
See [PowerShell About Special Characters](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_special_characters?view=powershell-7.1)
for the details about the
<code class="language-plaintext highlight language-shell highlighter-rouge"><span class="s2">"</span><span class="sb">`</span>n<span class="s2">"</span></code>
syntax.

### [](#locale){:.section-link}Locale {#locale}
The default [`java.util.Locale`] is accessible via the methods
[`Locale.getDefault()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Locale.html#getDefault())/<wbr>
[`Locale.setDefault(Locale newLocale)`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Locale.html#setDefault(java.util.Locale)),
and can be set as shown below

```java
Locale.setDefault(Locale.ENGLISH);
```

### [](#charset){:.section-link}Charset {#charset}
The default [`java.nio.charset.Charset`] can be obtained via the method
[`Charset.defaultCharset()`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/nio/charset/Charset.html#defaultCharset()),
but the Java SE does not provide any way of setting the default charset. As of
[JEP 400: UTF-8 by Default](https://openjdk.java.net/jeps/400), the Java SE API uses
UTF-8 as the
[default charset](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/nio/charset/Charset.html#defaultCharset()),
except for the
[`java.io.Console`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/io/Console.html)
API, where the
[charset](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/io/Console.html#charset())
must match the operating system's shell charset.
Before JEP 400, i.e., before OpenJDK JDK 18, one could set the default charset to UTF-8 via
the Java system property `file.encoding`, but this property is an implementation detail and is not
part of the Java SE.

The very minimal functionality that relies on the default charset and is used either directly or indirectly by virtually all Java applications
is the standard [`System.out`] and [`System.err`]<!-- --> [`PrintStream`]s.
We can specify the [`Charset`] used by these two [`PrintStream`]s as follows:

```java
System.setOut(new PrintStream(System.out, true, StandardCharsets.UTF_8));
System.setErr(new PrintStream(System.err, true, StandardCharsets.UTF_8));
```

Note that the [constructor](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/io/PrintStream.html#%3Cinit%3E(java.io.OutputStream,boolean,java.nio.charset.Charset))
of the [`PrintStream`] class takes an [`OutputStream`],
which is charset-agnostic because it does not operate on characters. The approach specified above works despite [`System.out`]/[`System.err`]
being [`PrintStream`]s and, thus, having their own charsets specified, because they are treated as [`OutputStream`]s by the constructor of the [`PrintStream`] class.
Note also, that the fields [`System.out`]/[`System.err`] are declared as `static final`, and yet the methods
[`System.setOut(PrintStream out)`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/System.html#setOut(java.io.PrintStream))/<wbr>
[`System.setErr(PrintStream err)`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/System.html#setErr(java.io.PrintStream))
somehow write to these fields after they are initialized. Does not this violate
the [JLS 4.12.4. `final` Variables <q>"may only be assigned to once"</q>](https://docs.oracle.com/javase/specs/jls/se17/html/jls-4.html#jls-4.12.4) semantics?
It does, but this exception is allowed by the [JLS 17.5.4. Write-Protected Fields](https://docs.oracle.com/javase/specs/jls/se17/html/jls-17.html#jls-17.5.4).

## [](#example){:.section-link}Example {#example}
[`ConsistentAppExample.java`] is a tiny Java application that demonstrates the aforementioned techniques.
We can start it in [Bash] running in [macOS] or [Ubuntu]
using the [source-file mode] (see also [JEP 330: Launch Single-File Source-Code Programs](https://openjdk.java.net/jeps/330)):

```shell
$ java -Dline.separator=$'\n' -Dfile.encoding=UTF-8 ConsistentAppExample.java
charset=UTF-8, console charset=UTF-8, native charset=UTF-8, locale=en, time zone=UTC, line separator={LINE FEED (LF)}
Charset smoke test: latin:english___cyrillic:русский___hangul:한국어___math:μ∞θℤ
```

or in [PowerShell] running in [Windows] from [Windows Terminal]<!-- -->[^2]:

```shell
> java -D'line.separator'="`n" -D'file.encoding'=UTF-8 ConsistentAppExample.java
charset=UTF-8, console charset=UTF-8, native charset=Cp1252, locale=en, time zone=UTC, line separator={LINE FEED (LF)}
Charset smoke test: latin:english___cyrillic:русский___hangul:한국어___math:μ∞θℤ
```

Be aware that starting a Java application using the source-file mode
introduces an additional activity where the default platform charset plays a role&mdash;the source file
<q>["bytes are read with the default platform character encoding that is in effect."](https://openjdk.java.net/jeps/330)</q>[^3]
This can be avoided if we compile the source files at first with explicitly specifying the source file charset via the documented
[`javac` `-encoding`](https://docs.oracle.com/en/java/javase/17/docs/specs/man/javac.html#option-encoding) option,
and then start the application from the resulting [`class` file](https://docs.oracle.com/javase/specs/jvms/se17/html/jvms-4.html),
which has <q>["hardware- and operating system-independent binary format"](https://docs.oracle.com/javase/specs/jvms/se17/html/jvms-2.html#jvms-2.1)</q>.

## [](#cli-charset-conversion){:.section-link}Using [`iconv`] to convert between charsets {#cli-charset-conversion}
As a bonus topic, which is to some extent related to the main topic of the article, I would like to mention the
[`iconv`](https://pubs.opengroup.org/onlinepubs/9699919799/utilities/iconv.html) POSIX CLI utility for converting between charsets.
We have two CLI Java programs represented as ["shebang" files](https://openjdk.java.net/jeps/330#Shebang_files):
* [`inShellOutUtf16`](https://github.com/stIncMale/sandbox-java/blob/master/examples/src/main/java/stincmale/sandbox/examples/makeappbehaviorconsistent/inShellOutUtf16)
that reads character data from the stdin using the charset specified by the shell and writes the data to the stdout using UTF-16 charset;
* [`inUtf8OutShell`](https://github.com/stIncMale/sandbox-java/blob/master/examples/src/main/java/stincmale/sandbox/examples/makeappbehaviorconsistent/inUtf8OutShell)
that reads character data from the stdin using the UTF-8 charset and writes the data to the stdout using the charset specified by the shell.

If we try feeding the stdout of the first to the stdin of the second in Bash running in macOS or Ubuntu, we see

```shell
$ echo 'Hello 🌎!' | ./inShellOutUtf16 | ./inUtf8OutShell
��Hello �<�!
```

Apparently, the [pipeline](https://www.gnu.org/software/bash/manual/html_node/Pipelines.html) is not working correctly.
We may fix it using `iconv`:

```shell
$ echo 'Hello 🌎!' | ./inShellOutUtf16 | iconv -f UTF-16 -t UTF-8 | ./inUtf8OutShell
Hello 🌎!
```

You may notice that these programs use [`java.io.InputStreamReader`] and [`java.io.OutputStreamWriter`] with explicit charsets instead of setting the charset
on the [`System.out`]<!-- --> [`PrintStream`] as was shown above. This is because the Java SE API provides a straightforward tool for transferring character data
from a [`java.io.Reader`] to a
[`java.io.Writer`]&mdash;[`Reader.transferTo(Writer out)`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/io/Reader.html#transferTo(java.io.Writer)).
It is important to note that we cannot use the method
[`java.io.InputStream.transferTo(OutputStream out)`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/io/InputStream.html#transferTo(java.io.OutputStream))
because this way we would be transferring binary data
from the stdin to the stdout instead of transferring character data, which would break the semantics of the programs.

[^1]: {%- comment -%}<!-- This footnote is linked from 2015-01-01-race-condition-vs-data-race.md, 2019-02-16-directory.md -->{%- endcomment -%}
    <h5>Java Platform</h5>
    A Java Development Kit (JDK) is the common name for an implementation of the Java Platform, Standard Edition (Java SE) Specification.
    For example, here is a link to the [Java SE 17 Specification](https://cr.openjdk.java.net/~iris/se/17/spec/fr/java-se-17-fr-spec/),
    which formal name is the [Java Specification Request (JSR)](https://jcp.org/en/jsr/overview) [392](https://jcp.org/en/jsr/detail?id=392).
    Its key parts are
    * [Java Language Specification (JLS)](https://docs.oracle.com/javase/specs/jls/se17/html/index.html),
    * [Java Virtual Machine Specification (JVMS)](https://docs.oracle.com/javase/specs/jvms/se17/html/index.html),
    * [Java SE API Specification](https://cr.openjdk.java.net/~iris/se/17/spec/fr/java-se-17-fr-spec/api/index.html);
    
    there are other parts, e.g.,
    * [Java Object Serialization Specification](https://cr.openjdk.java.net/~iris/se/17/spec/fr/java-se-17-fr-spec/specs/serialization/index.html),
    * [Java Native Interface (JNI) Specification](https://cr.openjdk.java.net/~iris/se/17/spec/fr/java-se-17-fr-spec/specs/jni/index.html).
    
    Unfortunately, OpenJDK publishes mostly changed specifications with each Java SE release instead of publishing all of them.
    See the [specifications published by Oracle](https://docs.oracle.com/en/java/javase/17/docs/specs/index.html) for a full list of Java SE parts.
    Previously the "SE" part was used to differentiate between the "standard" Java Platform,
    the [Java Platform, Micro Edition (Java ME)],
    and the [Java Platform, Enterprise Edition (Java EE)].
    Java ME is dead, Java EE [evolved](https://blogs.oracle.com/javamagazine/post/transition-from-java-ee-to-jakarta-ee)
    into [Jakarta Enterprise Edition Platform (Jakarta EE)]
    after [Java EE 8](https://www.jcp.org/en/jsr/detail?id=366), thus, the "SE" qualifier is an atavism.

    <h6>JRE</h6>
    A subset of a JDK that is sufficient to run a Java application but is not sufficient to develop one is commonly named a Java Runtime Environment (JRE).
    The key part of any JDK or JRE is a Java Virtual Machine (JVM), it is responsible for hardware- and operating system&ndash;independence of any programming language
    compiled into JVM instructions called bytecodes (such languages are often called JVM languages).
    A JVM can be thought of as an emulator of a computing machine that understands the instruction set specified by
    [JVMS Chapter 6. The Java Virtual Machine Instruction Set](https://docs.oracle.com/javase/specs/jvms/se17/html/jvms-6.html).
    The Java [`class` file format](https://docs.oracle.com/javase/specs/jvms/se17/html/jvms-2.html#jvms-2.1) is to a JVM
    as the [Executable and Linking Format (ELF)](https://man7.org/linux/man-pages/man5/elf.5.html) / [Portable Executable (PE) format](https://docs.microsoft.com/en-us/windows/win32/debug/pe-format)
    is to a machine controlled by the Linux/Windows operating system respectively.

    <h5>OpenJDK</h5>
    [OpenJDK] is a [community](https://openjdk.java.net/groups/) whose main goal is developing an
    [open-source](https://opensource.org/osd) implementation of the Java SE Specification.
    [OpenJDK JDK] is a proper name of the JDK developed by the OpenJDK community
    ("OpenJDK" is an adjective here according to [JDK-8205956 Fix usage of “OpenJDK” in build and test instructions](https://bugs.openjdk.java.net/browse/JDK-8205956)),
    but it is ridiculous and is usually shortened to just OpenJDK where it does not cause ambiguity.
    We may see the usage of the full name, for example, on the page [How to download and install prebuilt OpenJDK packages](https://openjdk.java.net/install/index.html):
    <q markdown="1">"Oracle's OpenJDK JDK binaries for Windows, macOS, and Linux are available on release-specific pages of [jdk.java.net](https://jdk.java.net/)…"</q>
    I find this naming confusing.

    So, the OpenJDK JDK is an implementation of the Java SE Specification. As a result of it being open-source, there are many other implementations
    that are based on it. Each implementation may have its own additional features not specified by the Java SE Specification.
    Both standard and nonstandard features included in each new release of the OpenJDK JDK are listed in the corresponding release page.
    They are called [JDK Enhancement Proposals (JEPs)](https://openjdk.java.net/jeps/0),
    here is a link to the [OpenJDK JDK 17 release page](https://openjdk.java.net/projects/jdk/17/)
    specifying all the JEPs included in this release.

    One of the commercial JDKs based on [OpenJDK JDK] is [Oracle JDK].
    We may see that the [Java API they provide](https://docs.oracle.com/en/java/javase/17/docs/api/) includes both
    the Java SE API and Oracle JDK&ndash;specific API. The [Oracle JDK documentation](https://docs.oracle.com/en/java/javase/)
    and [dev.java](https://dev.java/) are great places to find the information you need when learning Java
    or developing with it.

[^2]: It would have been nice if PowerShell just worked with UTF-8, but it does not.
    You need to use the following incantation, which I found
    [here](https://stackoverflow.com/a/49481797/1285873),
    to make it inputting and outputting UTF-8 correctly:
    ```shell
    $OutputEncoding = [console]::InputEncoding = [console]::OutputEncoding = New-Object System.Text.UTF8Encoding
    ```
    I use PowerShell 7.2, other versions may behave differently.
    Note also that I see the specified fine results in PowerShell only when I run PowerShell in 
    Windows Terminal. If I run PowerShell on its own, it displays
    <figure>
      <img src="{% link assets/img/blog/make-app-behavior-consistent/powershell-output.png %}" alt="PowerShell output">
    </figure>
    regardless of whether I use the
    [Lucida Console](https://docs.microsoft.com/en-us/typography/font-list/lucida-console)
    font family or [Cascadia Code](https://github.com/microsoft/cascadia-code).

[^3]: This is why `-Dfile.encoding=UTF-8` may be omitted in Bash running in macOS or Ubuntu
    ```shell
    $ java -Dline.separator=$'\n' ConsistentAppExample.java
    charset=UTF-8, console charset=UTF-8, native charset=UTF-8, locale=en, time zone=UTC, line separator={LINE FEED (LF)}
    Charset smoke test: latin:english___cyrillic:русский___hangul:한국어___math:μ∞θℤ
    ```
    , but when `-D'file.encoding'=UTF-8` is omitted in PowerShell running in Windows, I get
    ```shell
    > java -D'line.separator'="`n" ConsistentAppExample.java
    charset=windows-1252, console charset=UTF-8, native charset=Cp1252, locale=en, time zone=UTC, line separator={LINE FEED (LF)}
    Charset smoke test: latin:english___cyrillic:Ñ€ÑƒÑ�Ñ�ÐºÐ¸Ð¹___hangul:í•œêµ­ì–´___math:Î¼âˆžÎ¸â„¤
    ```
    despite the application putting UTF-8 bytes in the stdout due to the code
    `System.setOut(new PrintStream(System.out, true, StandardCharsets.UTF_8))`{:.highlight .language-java}.
    As we can see, the JDK detects that the environment charset is `Cp1252`, which is weird, as Microsoft claims
    <q>["In PowerShell 6+, the default encoding is UTF-8 without BOM on all platforms."](https://docs.microsoft.com/en-us/powershell/scripting/dev-cross-plat/vscode/understanding-file-encoding?view=powershell-7#configuring-powershell)</q>
    If we compile the Java code and then run it, then the application behaves as expected without `-D'file.encoding'=UTF-8` in PowerShell running in Windows:
    ```shell
    > javac -encoding UTF-8 stincmale\sandbox\examples\makeappbehaviorconsistent\ConsistentAppExample.java
    > java -D'line.separator'="`n" stincmale.sandbox.examples.makeappbehaviorconsistent.ConsistentAppExample
    charset=windows-1252, console charset=UTF-8, native charset=Cp1252, locale=en, time zone=UTC, line separator={LINE FEED (LF)}
    Charset smoke test: latin:english___cyrillic:русский___hangul:한국어___math:μ∞θℤ
    ```

