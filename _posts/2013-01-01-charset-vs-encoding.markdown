---
layout: post
slug: charset-vs-encoding
title: Charset vs. encoding
categories: [tech]
tags: [disambiguation]
date: 2013-01-01T12:00:00Z
custom_post_date: 2013
custom_update_date: 2021-05-13T03:42:00Z
custom_keywords: [charset, encoding, character map, CM, coded character set, CCS, character encoding form, CEF, character encoding scheme, CES, Universal Coded Character Set, UCS, UCS Transformation Format, UTF, Unicode]
custom_description: Charset, a.k.a. character map (CM) = coded character set (CCS) + character encoding form (CEF) + character encoding scheme (CES).
---
{% include common-links-abbreviations.markdown %}

*[ACR]:
{:data-title="Abstract Character Repertoire"}
*[CM]:
{:data-title="Character Map"}
*[CCS]:
{:data-title="Coded Character Set"}
*[CEF]:
{:data-title="Character Encoding Form"}
*[CES]:
{:data-title="Character Encoding Scheme"}
*[UCS]:
{:data-title="Universal Coded Character Set"}
*[LE]:
{:data-title="Little Endian"}
*[BE]:
{:data-title="Big Endian"}
*[BOM]:
{:data-title="Byte Order Mark"}

I have always been discouraged by the fact that the words "charset" and "encoding" seem to be
used interchangeably&mdash;if they are the same term, why use both words?
* The [HTML specification](https://html.spec.whatwg.org/multipage/) uses both words interchangeably:
<q>"The <a href="https://html.spec.whatwg.org/multipage/semantics.html#attr-meta-charset">`charset`</a> attribute specifies the character <a href="https://encoding.spec.whatwg.org/#encoding">encoding</a> used by the document."</q>
* The [XML specification](https://www.w3.org/TR/xml/) seems to do a similar thing, only it specifies a declaration named `encoding` instead of `charset`,
but [recommends](https://www.w3.org/TR/xml/#charencoding) the names of [IANA charsets](https://www.iana.org/assignments/character-sets/character-sets.xhtml) to be specified as values:
<q>"It is recommended that character encodings registered (as charsets) with the Internet Assigned Numbers Authority, other than those just listed,
be referred to using their registered names"</q>.

My patience burst, and I decided to dive into the matter.
This post is essentially a version of the [Unicode Character Encoding Model](https://unicode.org/reports/tr17/) shortened and creatively retold by me,
and I invite you to read the original instead, if you are so inclined.
I also recommend reading the article [The Absolute Minimum Every Software Developer Absolutely, Positively Must Know About Unicode and Character Sets (No Excuses!)](https://www.joelonsoftware.com/2003/10/08/the-absolute-minimum-every-software-developer-absolutely-positively-must-know-about-unicode-and-character-sets-no-excuses/)<span class="insignificant">&nbsp;by [Joel Spolsky](https://www.joelonsoftware.com/about-me/)</span>.

{% include toc.markdown %}

## [](#acr){:.section-link}Abstract character repertoire (ACR) {#acr}
<div class="info-block" markdown="1">
[**Abstract character repertoire** (ACR)](https://unicode.org/reports/tr17/#Repertoire)&mdash;an
unordered set of **abstract characters**.
Abstract characters are often referred to as just characters.
</div>

The word "abstract" emphasizes that these objects are defined by convention.
For example, the capital letter "A" in the Latin alphabet is an abstract character named `LATIN CAPITAL LETTER A` in the [Unicode standard](https://unicode.org/standard/standard.html).
Regardless of the [glyph](https://unicode.org/reports/tr17/#CharactersVsGlyphs) we use to represent this character, e.g.,
![glyph examples]({% link /assets/img/blog/charset-vs-encoding/glyph-examples.png %}){:style="width: auth; height: 1.5em; vertical-align: sub;"},
we mean the same abstract character.

## [](#cm){:.section-link}Character map (CM) {#cm}
<div class="info-block" markdown="1">
[**Character map** (CM)](https://www.unicode.org/reports/tr17/#CharacterMaps),
a.k.a. [**charset**](https://www.rfc-editor.org/rfc/rfc2978#section-1.3)&mdash;a mapping
from a sequence of members of an ACR to a sequence of bytes.

[CM](https://www.unicode.org/reports/tr17/#CharacterMaps) = [coded character set (CCS)](https://www.unicode.org/reports/tr17/#CodedCharacterSet) + [character encoding form (CEF)](https://www.unicode.org/reports/tr17/#CharacterEncodingForm) + [character encoding scheme (CES)](https://www.unicode.org/reports/tr17/#CharacterEncodingScheme)
</div>

So a charset is not actually a set of characters, as one might have anticipated based on the word choice.

CES in the above definition may be compound, which means there may be multiple CEF/CCS for a given CM, which is also then called compound.
This definition is to an extent similar to the definition given by the [RFC 2978](https://www.rfc-editor.org/rfc/rfc2978#section-1.3),
though it does not seem like they are identical, and the definition in the RFC makes much less sense to me than the one in the Unicode standard.

### [](#ccs){:.section-link}Coded character set (CCS) {#ccs}

<div class="info-block" markdown="1">
[**Coded character set** (CCS)](https://www.unicode.org/reports/tr17/#CodedCharacterSet),
a.k.a. [code page](https://docs.microsoft.com/en-us/windows/win32/intl/code-pages)&mdash;a mapping
from an ACR to the set of non-negative integers, which are called **code points**.
If a CCS assigns a code point to an abstract character,
then such a character is called an **encoded character**.
</div>

### [](#cef){:.section-link}Character encoding form (CEF) {#cef}
<div class="info-block" markdown="1">
[**Character encoding form** (CEF)](https://www.unicode.org/reports/tr17/#CharacterEncodingForm)&mdash;a mapping
from code points used in a CCS to the set of sequences of **code units**.
While a code unit is an integer with a bit width fixed for a given CEF,
the sequences of code units representing code points do not necessarily have the same length.
</div>

This concept arises from the way numbers are represented in computers&mdash;as sequences of bytes;
thus a CES enables character representation as actual data in a computer.
For example, the UTF-8 CEF is a variable-width encoding form that represents code points as a mix of one to four 8-bit code units in the Unicode standard.

### [](#ces){:.section-link}Character encoding scheme (CES) {#ces}
<div class="info-block" markdown="1">
[**Character encoding scheme** (CES)](https://www.unicode.org/reports/tr17/#CharacterEncodingScheme)&mdash;a reversible
transformation of sequences of code units to sequences of bytes.
</div>

Applying CES is the last step in the process of representing an abstract character as binary data
in a computer. It may introduce compression or care about
[byte order](https://www.unicode.org/reports/tr17/#ByteOrder). For example, UTF-16 CES 
cares about byte order and has the little endian (LE) / big endian (BE) byte order marks (BOM).

## [](#examples){:.section-link}Examples {#examples}

### [](#ccs-example){:.section-link}Coded character set {#ccs-example}
[ISO/IEC 10646](https://www.iso.org/standard/69119.html) defines a CCS called Universal Coded Character Set (UCS).
The Unicode standard uses this CCS.
UCS includes many interesting characters, e.g., &#x2467; &#x1f9a0; &#x222c;, but not everything you might want, for example,
it [does not include Apple logo](https://hea-www.harvard.edu/~fine/OSX/unicode_apple_logo.html).
The complete CCS used by the Unicode standard is available at <https://www.unicode.org/charts/>.

Unicode code points are written in the format `U+HHHH` or `U+HHHHHH`, where `H` is a hexadecimal digit,
and have values from `U+0000` (0) to `U+10FFFF` (1_114_111).
Note that some values do not have assigned characters and are reserved in the Unicode standard for internal use.
Such code points are called [noncharacters](https://www.unicode.org/faq/private_use.html#noncharacters).

### [](#cm-example){:.section-link}Character map {#cm-example}
We often refer to something called "UTF-8" as "encoding",
but Java SE API specification refers to it as [`Charset`](https://cr.openjdk.java.net/~iris/se/14/spec/fr/java-se-14-fr-spec/api/java.base/java/nio/charset/StandardCharsets.html#UTF_8). 
So what is it exactly? According to [ISO/IEC 10646](https://www.iso.org/standard/69119.html), or the [Unicode standard](https://unicode.org/standard/standard.html)
(they are [kept synchronized](https://www.unicode.org/faq/unicode_iso.html)),
there is UTF-8 CEF and UTF-8 CES.
[RFC 3629](https://www.rfc-editor.org/rfc/rfc3629) defines UTF-8 charset that is registered as an [IANA character set](https://www.iana.org/assignments/character-sets/character-sets.xhtml).
So we may say that
<div class="info-block" markdown="1">
UTF-8 charset = UCS CCS + UTF-8 CEF + UTF-8 CES.
</div>
