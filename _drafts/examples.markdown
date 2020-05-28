---
layout: post
# Slug is used as a post ID that must never change (it is used in permalinks and as part of IRI in Atom feed).
slug: examples
# Each post must belong to a single category (it is used in permalinks but not in Atom feed),
# this one belongs to both just because it is an example.
categories: [tech, cgi-vfx]
title: Markup (<a href="https://kramdown.gettalong.org/syntax.html">kramdown</a>) and style examples
# Check that:
# - the unreserved characters (https://tools.ietf.org/html/rfc3986#section-2.3) are either left as is or are percent-encoded (https://tools.ietf.org/html/rfc3986#section-2.1) (I am not testing alpha and digit characters as they obviously work),
# - the reserved characters (https://tools.ietf.org/html/rfc3986#section-2.2) are percent-encoded,
# - the percent character is percent-encoded (according to https://tools.ietf.org/html/rfc3986#section-2.4),
# - all other characters may be percent-encoded.
tags: ["RFC3986-unreserved-characters-may-be-encoded__-.~", "RFC3986-reserved-characters-must-be-encoded__:_/_?_#_[_]_@_!_$_&_'_(_)_*_+_,_;_=", "percent-character-must-be-encoded__%", 'other-characters-may-be-encoded__\_ _"_&lt;_&gt;_^_&#x01f4af;']
# These dates must be specified in the RFC 3339 (https://tools.ietf.org/html/rfc3339) format,
# e.g. 1985-04-12T23:20:50.52Z or 2020-04-24T20:08:00−06:00 because they are used in Atom feed.
date: 2020-04-26T12:00:00+00:00
custom_update_date: 2020-05-28T10:57:00−06:00
custom_keywords: [keyword1, keyword2]
custom_description: Markup and style examples.
---
{% comment %}<!--
  Use -draft (actually it is double hyphen, but those are not allowed inside comments) e.g.
    bundle exec jekyll serve -draft
  to start Jekyll server that serves draft posts;
  alternatively specify
    show_drafts: true
  in _config.yml.
-->{% endcomment %}

{% include common-links-abbreviations.markdown %}

Text before ToC.

{% include toc.markdown %}

## [](#todo){:.section-link}TODO {#todo}
* Update https://github.com/stIncMale/sandbox/blob/master/examples/src/test/java/stincmale/sandbox/examples/brokentimestamps/JdbcTimestampTest.java#L27
* Leave "redirect" links in the old site.
* Update the link to this site on YouTube channel, LinkedIn, Github and other social websites.

## [](#useful-links){:.section-link}Useful links {#useful-links}
* [color names](https://htmlcolorcodes.com/color-names/)
* [Making Your Website Shareable on LinkedIn](https://www.linkedin.com/help/linkedin/answer/46687/making-your-website-shareable-on-linkedin), [LinkedIn post inspector](https://www.linkedin.com/post-inspector/)
* comments: <https://jekyllcodex.org/without-plugin/comments/>, <https://aristath.github.io/blog/static-site-comments-using-github-issues-api>, <https://www.bitsgalore.org/2020/03/11/does-microsoft-onedrive-export-large-ZIP-files-that-are-corrupt>
* [Validate XML against XSD online](https://www.freeformatter.com/xml-validator-xsd.html)
* [All HTML named entities](https://dev.w3.org/html5/html-author/charref)

## [](#urls-to-check){:.section-link}URLs to check with [W3C markup validator](https://validator.w3.org/), [W3C CSS validator](http://jigsaw.w3.org/css-validator/), [W3C feed validator](https://validator.w3.org/feed/) {#urls-to-check}
* W3C markup validator
  * [view-source:http://127.0.0.1:4000/blog/examples](view-source:http://127.0.0.1:4000/blog/examples)
  * [view-source:http://127.0.0.1:4000/blog/tags/](view-source:http://127.0.0.1:4000/blog/tags/)
  * [https://www.kovalenko.link](https://validator.w3.org/nu/?doc=https%3A%2F%2Fwww.kovalenko.link%2F)
  * [https://www.kovalenko.link/lyrics](https://validator.w3.org/nu/?doc=https%3A%2F%2Fwww.kovalenko.link%2Flyrics)
  * [https://www.kovalenko.link/blog/tags/](https://validator.w3.org/nu/?doc=https%3A%2F%2Fwww.kovalenko.link%2Fblog%2Ftags%2F)
  * [https://www.kovalenko.link/blog/cgi-vfx/](https://validator.w3.org/nu/?doc=https%3A%2F%2Fwww.kovalenko.link%2Fblog%2Fcgi-vfx%2F)
  * [https://www.kovalenko.link/blog/tech/](https://validator.w3.org/nu/?doc=https%3A%2F%2Fwww.kovalenko.link%2Fblog%2Ftech%2F)
  * [https://www.kovalenko.link/blog/netcracker-sportfest](https://validator.w3.org/nu/?doc=https%3A%2F%2Fwww.kovalenko.link%2Fblog%2Fnetcracker-sportfest)
  * [https://www.kovalenko.link/blog/parallelism-vs-concurrency](https://validator.w3.org/nu/?doc=https%3A%2F%2Fwww.kovalenko.link%2Fblog%2Fparallelism-vs-concurrency)
* W3C feed validator
  * [https://www.kovalenko.link/feed.xml](https://validator.w3.org/feed/check.cgi?url=https%3A%2F%2Fwww.kovalenko.link%2Ffeed.xml)
* W3C CSS validator
  * [https://www.kovalenko.link/assets/css/style.css](http://jigsaw.w3.org/css-validator/validator?uri=https%3A%2F%2Fwww.kovalenko.link%2Fassets%2Fcss%2Fstyle.css&profile=css3svg&usermedium=all&warning=1&vextwarning=&lang=en)

<!-- see https://kramdown.gettalong.org/syntax.html#specifying-a-header-id for details -->
## [](#h2){:.section-link}Header `<h2>` {#h2}
### [](#h3){:.section-link}Header `<h3>` {#h3}
#### [](#h4){:.section-link}Header `<h4>` {#h4}
##### [](#h5){:.section-link}Header `<h5>` {#h5}
###### [](#h6){:.section-link}Header `<h6>` {#h6}
## [](#basic-formatting){:.section-link}Basic formatting {#basic-formatting}
Normal text.

Decimal digits: 0123456789.

Unicode character by hexadecimal code point: &#x01f4af; (`HUNDRED POINTS SYMBOL`, `U+01f4af`).

Very very very very very very very very very very very very very very very very very very very very very very very very very very very very very
very very very very very very very very very very very very very very very very very very very very very very very very very very very very very
very very very very very very very very very very very very very very very very very very very very very very very very very very very very very
long text.

~~Strikethrough text.~~

**Bold text 1.** __Bold text 2.__

*Italic text 1.* _Italic text 2._

**_~~Bold italic strikethrough text.~~_**

[Link to Google](http://google.com), automatic link <http://google.com>.

<span class="monospace">Monospace text.</span>

Quotation <q>"inlined in text"</q>.

Quotation block:
> "Quoted text.
>
> [Link](https://google.com)
>
> Very very very very very very very very very very very very very very very very very very very very very very very very very very very very very
very very very very very very very very very very very very very very very very very very very very very very very very very very very very very
very very very very very very very very very very very very very very very very very very very very very very very very very very very very very
long text."

Information block that supports kramdown syntax inside:
<div class="info-block" markdown="1">
Info text.

[Link](https://google.com)

Very very very very very very very very very very very very very very very very very very very very very very very very very very very very very
very very very very very very very very very very very very very very very very very very very very very very very very very very very very very
very very very very very very very very very very very very very very very very very very very very very very very very very very very very very
long text.
</div>

## [](#abbreviations){:.section-link}Abbreviations {#abbreviations}
*[HTML]:
{:data-title="HyperText Markup Language"}
*[CSS]:
{:data-title="Cascading Style Sheets"}
*[kramdown]:
{:data-title="A markup language that is based on Markdown"}
*[W3C]:
{:data-title="World Wide Web Consortium"}
*[Jekyll]:
{:data-title="A site generator"}

These are abbreviations:\\
HTML, [CSS](https://www.w3.org/Style/CSS/), kramdown\\
that can be used to clarify any text.

## [](#link-definitions){:.section-link}Link definitions {#link-definitions}

[`java.lang.Object`]: <https://cr.openjdk.java.net/~iris/se/14/spec/fr/java-se-14-fr-spec/api/java.base/java/lang/Object.html>
[Java SE]: <https://docs.oracle.com/en/java/javase/index.html> "Java Platform, Standard Edition Documentation by Oracle"
This is a link to [Java SE] that has a title, and this one does not [`java.lang.Object`].

## [](#lists){:.section-link}Lists {#lists}
Normal text.
1. Ordered list item 1.
2. Very very very very very very very very very very very very very very very very very very very very very very very very very very very very very
very very very very very very very very very very very very very very very very very very very very very very very very very very very very very
very very very very very very very very very very very very very very very very very very very very very very very very very very very very very
long text.

   Another paragraph.
3. Ordered list item 3.
4. Ordered list item 4.
   1. Ordered list item 4a.
   2. Ordered list item 4b.

      Another paragraph.
   3. Ordered list item 4c.
   4. Ordered list item 4d.
5. Ordered list item 5.
6. Ordered list item 6.

Normal text.
* Hyphens and dashes (see <https://www.grammarly.com/blog/hyphens-and-dashes/>)
  * Hyphen - <q>This rock-hard cake is absolutely impossible to eat.</q>
  * En-dash &ndash; <q>14:00&ndash;15:00, 2015&ndash;2020 years, the Nobel prize&ndash;winning author.</q>
  * Em-dash &mdash; <q>He is afraid of two things &mdash; spiders and senior prom.</q>
* Ellipsis &hellip; <q>Andrew, can you, um&hellip; never mind.</q>

## [](#footnotes){:.section-link}Footnotes {#footnotes}
<!-- see https://kramdown.gettalong.org/syntax.html#footnotes for details -->
Text with footnotes[^footnoteA] in it[^footnoteB].

## [](#tables){:.section-link}Tables {#tables}
Table:

Table column 1 header | Table column 2 header
- | -
cell 11 | cell 12
cell 21 | cell 22

Table with long text:

Table column 1 header | Table column 2 header
- | -
cell 11 | cell 12
cell 21 | cell 22
cell 31 | Very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very long text.
cell 41 | cell 42

## [](#separator){:.section-link}Thematic separators {#separator}
HTML thematic break (horizontal line)
<hr>
kramdown thematic break (horizontal line)

---

## [](#figures){:.section-link}Figures {#figures}
Inline image ![Example image]({% link /assets/img/favicon.png %}){:style="border-radius: 20%; border: thin solid lightsteelblue; width: 3em; height: auto;"} with kramdown and inline CSS.

Figure:
<figure>
  <img src="{% link /assets/img/favicon.png %}" alt="Example image" style="width: 6em; height: auto;">
  <figcaption>Figure caption.</figcaption>
</figure>

## [](#code){:.section-link}Code {#code}
Inlined code: `java.lang.Object`, [`java.lang.Object`](https://cr.openjdk.java.net/~iris/se/14/spec/fr/java-se-14-fr-spec/api/java.base/java/lang/Object.html),
`select * from my_table where id > 10`{:.highlight .language-sql}.

`Very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very long text.`

<figure class="highlight">
  <pre class="highlight"><code>Manual <b>code</b> <i>block</i>
with HTML and <b><span style="color: green; font-weight: bold;">inline CSS</span></b>.</code></pre>
</figure>

```
Generic code block with kramdown.
```

<a href="https://github.com/rouge-ruby/rouge/wiki/List-of-supported-languages-and-lexers">List of supported code block languages.</a>

```sql
--SQL code block with kramdown
select *
from my_table
where id > 10;
```

```sql
--SQL code block with kramdown (long)
--Very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very long text.
select *
from my_table
where id > 10;
```

```html
<!DOCTYPE html>
<!-- HTML code block with kramdown -->
<html lang="en">
  <head>
    <title>Page Title</title>
    <meta charset="UTF-8">
  </head>
  <body>
    <div class="header">
      <h1>My Website</h1>
      <p>A <b>responsive</b> website created by me.</p>
    </div>
    <div class="footer">
      <h2>Footer</h2>
    </div>
  </body>
</html>
```

{%- highlight sql -%}
--SQL code block with Jekyll
select *
from my_table
where id > 10;
{%- endhighlight -%}

{%- highlight sql -%}
--SQL code block with Jekyll (long)
--Very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very long text.
select *
from my_table
where id > 10;
{%- endhighlight -%}

Note that Jekyll [`{% raw %}{% highlight <languageName> linenos %}{% endraw %}`](https://jekyllrb.com/docs/liquid/tags/#line-numbers)
generates invalid HTML
(a [`table`](https://html.spec.whatwg.org/multipage/tables.html#the-table-element) element is put inside of
a [`code`](https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-code-element) element).
Most browsers seem to manage rendering such invalid HTML "as expected", but Safari for iOS does not.

Another problem with `{% raw %}{% highlight <languageName> linenos %}{% endraw %}`
is that it does not put each line together with its number in a separate block (e.g [`tr`](https://html.spec.whatwg.org/multipage/tables.html#the-tr-element)),
so as a result if the lines are soft-wrapped e.g. when printing, the line numbers may be rendered incorrectly.

At least Chrome browser fails to correctly soft-wrap lines when printing HTML generated by Jekyll with `{% raw %}{% highlight <languageName> linenos %}{% endraw %}`
(probably because the HTML is invalid), but correctly soft-wraps lines in HTML generated by kramdown.

Because of the above problems using line numbers Jekyll feature should be avoided unless it is absolutely required.

{%- highlight sql linenos -%}
--SQL code block with Jekyll (line numbers)
select *
from my_table
where id > 10;
{%- endhighlight -%}

{%- highlight sql linenos -%}
--SQL code block with Jekyll (line numbers, long)
--Very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very long text.
select
  event_tree_id,
  string_agg(
    array_to_string(
      model_attr_array[:1] ||
      pg_temp.check_not_null(
        files.?,
        array['files for event_tree', event_tree_id::text, 'model_idx', model_idx::text] || 'model_attr_array'::text || model_attr_array)::text ||
      model_attr_array[3] ||
      pg_temp.check_not_null(
        stream_function.?,
        array['stream_function for event_tree', event_tree_id::text, 'model_idx', model_idx::text] || 'model_attr_array'::text || model_attr_array)::text ||
      pg_temp.check_not_null(
        function_metrics.?,
        array['function_metrics for event_tree', event_tree_id::text, 'model_idx', model_idx::text] || 'model_attr_array'::text || model_attr_array)::text,
      ','
    ),
    ';' order by model_idx
  ) as new_model_lob
from
  (select ? as event_tree_id, model_idx, string_to_array(model, ',') as model_attr_array
  from
    (select * from ?.event_tree where id >= ? order by id limit 100) as event_tree
    cross join unnest(string_to_array(model_lob, ';')) with ordinality as model (model, model_idx)
  ) as parsed_model_lob
  left join ?.files on model_attr_array[2]::bigint = files.?
  left join ?.stream_function on model_attr_array[4]::bigint = stream_function.?
  left join ?.function_metrics on model_attr_array[5]::bigint = function_metrics.?
group by event_tree_id;
--
--These comments are here to cause rendering a vertical scrollbar.
--
--
--
--
--
--
--
--
--
--
--
--
--
--
--
--
--
--
--
{%- endhighlight -%}

{%- highlight java -%}
//Java code block with Jekyll
package my.package;

/**
 * Javadoc {@link java.lang.Object}.
 */
//single line comment
public final class MyClass {
  private MyClass() throws UnsupportedOperationException {
    throw new UnsupportedOperationException("The class isn't designed to be instantiated");
  }

  /**
   * @param o The reference object with which to compare.
   */
  @Override
  public final boolean equals(@Nullable final Object o) {
    return super.equals(o);
  }

  @Override
  public final String toString() {
    int i = 10;
    return "Hello World!";
  }
}
{%- endhighlight -%}

## [](#video){:.section-link}Video {#video}
### [](#video-youtube){:.section-link}YouTube {#video-youtube}

{% include youtube-video.html content = "YziVpa8oZDg , hqdefault , iframe-ratio-22-15 , Darkwing Duck (intro and outro)" %}
<br>
{% include youtube-video.html content = "UGp8FvWGoWs , maxresdefault , iframe-ratio-64-33 , Devil May Cry 4 Full Video (eng)" %}

[^footnoteA]: Footnote

    > "that combines quotation"

    ```
    with
    code block
    ```

    and normal text.

[^footnoteB]: **Footnote** <q>"with inline quotation"</q>
    and multiple lines in the source code.
