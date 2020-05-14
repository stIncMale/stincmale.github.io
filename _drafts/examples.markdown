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
custom_update_date: 2020-05-13T10:00:00−06:00
custom_keywords: [keyword1, keyword2]
custom_description: Markup and style examples.
---
{%- comment -%}<!--
  Use -draft (actually it is double hyphen, but those are not allowed inside comments) e.g.
    bundle exec jekyll serve -draft
  to start Jekyll server that serves draft posts;
  alternatively specify
    show_drafts: true
  in _config.yml.
-->{%- endcomment -%}
Text before ToC.

{% include toc.markdown %}

## [](#todo){:.slink}TODO {#todo}
* Leave "redirect" links in the old site.
* Update the link to this site on YouTube channel, LinkedIn, Github and other social websites.
* Support printing videos <https://stackoverflow.com/questions/12556521/is-it-possible-to-print-a-youtube-video-stillshot-as-it-appears-on-your-webpage>.

## [](#useful-links){:.slink}Useful links {#useful-links}
* [color names](https://htmlcolorcodes.com/color-names/)
* [Making Your Website Shareable on LinkedIn](https://www.linkedin.com/help/linkedin/answer/46687/making-your-website-shareable-on-linkedin), [LinkedIn post inspector](https://www.linkedin.com/post-inspector/)
* comments: <https://jekyllcodex.org/without-plugin/comments/>, <https://aristath.github.io/blog/static-site-comments-using-github-issues-api>, <https://www.bitsgalore.org/2020/03/11/does-microsoft-onedrive-export-large-ZIP-files-that-are-corrupt>
* [Validate XML against XSD online](https://www.freeformatter.com/xml-validator-xsd.html)

## [](#urls-to-check){:.slink}URLs to check with [W3C markup validator](https://validator.w3.org/), [W3C CSS validator](http://jigsaw.w3.org/css-validator/), [W3C feed validator](https://validator.w3.org/feed/) {#urls-to-check}
* W3C markup validator
  * [view-source:http://127.0.0.1:4000/blog/examples](view-source:http://127.0.0.1:4000/blog/examples)
  * [view-source:http://127.0.0.1:4000/blog/tags/](view-source:http://127.0.0.1:4000/blog/tags/)
  * [https://www.kovalenko.link](https://validator.w3.org/nu/?doc=https%3A%2F%2Fwww.kovalenko.link%2F)
  * [https://www.kovalenko.link/lyrics](https://validator.w3.org/nu/?doc=https%3A%2F%2Fwww.kovalenko.link%2Flyrics)
  * [https://www.kovalenko.link/blog/tags/](https://validator.w3.org/nu/?doc=https%3A%2F%2Fwww.kovalenko.link%2Fblog%2Ftags%2F)
  * [https://www.kovalenko.link/blog/cgi-vfx/](https://validator.w3.org/nu/?doc=https%3A%2F%2Fwww.kovalenko.link%2Fblog%2Fcgi-vfx%2F)
  * [https://www.kovalenko.link/blog/tech/](https://validator.w3.org/nu/?doc=https%3A%2F%2Fwww.kovalenko.link%2Fblog%2Ftech%2F)
  * [https://www.kovalenko.link/blog/netcracker-sportfest](https://validator.w3.org/nu/?doc=https%3A%2F%2Fwww.kovalenko.link%2Fblog%2Fnetcracker-sportfest)
  * [https://www.kovalenko.link/blog/stopwatch](https://validator.w3.org/nu/?doc=https%3A%2F%2Fwww.kovalenko.link%2Fblog%2Fstopwatch)
* W3C feed validator
  * [https://www.kovalenko.link/feed.xml](https://validator.w3.org/feed/check.cgi?url=https%3A%2F%2Fwww.kovalenko.link%2Ffeed.xml)
* W3C CSS validator
  * [https://www.kovalenko.link/assets/css/style.css](http://jigsaw.w3.org/css-validator/validator?uri=https%3A%2F%2Fwww.kovalenko.link%2Fassets%2Fcss%2Fstyle.css&profile=css3svg&usermedium=all&warning=1&vextwarning=&lang=en)

<!-- see https://kramdown.gettalong.org/syntax.html#specifying-a-header-id for details -->
## [](#h2){:.slink}Header `<h2>` {#h2}
### [](#h3){:.slink}Header `<h3>` {#h3}
#### [](#h4){:.slink}Header `<h4>` {#h4}
##### [](#h5){:.slink}Header `<h5>` {#h5}
###### [](#h6){:.slink}Header `<h6>` {#h6}
## [](#basic-formatting){:.slink}Basic formatting {#basic-formatting}
Normal text.

Decimal digits: 0123456789.

Unicode character by hexadecimal code point: &#x01f4af; (HUNDRED POINTS SYMBOL, U+01f4af).

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

Information block:
<div class="info-block">
<p>
Info text.
</p>
<p><a href="https://google.com">Link</a></p>
<p>
Very very very very very very very very very very very very very very very very very very very very very very very very very very very very very
very very very very very very very very very very very very very very very very very very very very very very very very very very very very very
very very very very very very very very very very very very very very very very very very very very very very very very very very very very very
long text.
</p>
</div>

## [](#abbreviations){:.slink}Abbreviations {#abbreviations}
*[HTML]:
{:data-title="Hypertext Markup Language"}
*[CSS]:
{:data-title="Cascading Style Sheets"}

Use abbreviations, for example\\
HTML and [CSS](https://www.w3.org/Style/CSS/)\\
inside normal text.

## [](#lists){:.slink}Lists {#lists}
Normal text.
1. Ordered list item 1.
2. Very very very very very very very very very very very very very very very very very very very very very very very very very very very very very
very very very very very very very very very very very very very very very very very very very very very very very very very very very very very
very very very very very very very very very very very very very very very very very very very very very very very very very very very very very
long text.

    Another paragraph.
3. Ordered list item 3.
4. Ordered list item 3.
   1. Ordered list item 4a.
   2. Ordered list item 4b.

        Another paragraph.
   3. Ordered list item 4c.
   4. Ordered list item 4d.
5. Ordered list item 4.
6. Ordered list item 5.

Normal text.
* Hyphens and dashes (see <https://www.grammarly.com/blog/hyphens-and-dashes/>)
  * Hyphen - <q>This rock-hard cake is absolutely impossible to eat.</q>
  * En-dash &ndash; <q>14:00&ndash;15:00, 2015&ndash;2020 years, the Nobel prize&ndash;winning author.</q>
  * Em-dash &mdash; <q>He is afraid of two things &mdash; spiders and senior prom.</q>
* Ellipsis &hellip; <q>Andrew, can you, um&hellip; never mind.</q>

## [](#footnotes){:.slink}Footnotes {#footnotes}
<!-- see https://kramdown.gettalong.org/syntax.html#footnotes for details -->
Text with footnotes[^footnoteA] in it[^footnoteB].

## [](#tables){:.slink}Tables {#tables}
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

## [](#separator){:.slink}Thematic separators {#separator}
HTML thematic break (horizontal line)
<hr>
Markdown thematic break (horizontal line)

---

## [](#figures){:.slink}Figures {#figures}
Inline image ![Example image]({% link /assets/img/favicon.png %}){:style="border-radius: 20%; border: thin solid lightsteelblue; width: 3em; height: auto;"} with Markdown and inline CSS.

Figure:
<figure>
  <img src="{% link /assets/img/favicon.png %}" alt="Example image" style="width: 6em; height: auto;">
  <figcaption>Figure caption.</figcaption>
</figure>

## [](#code){:.slink}Code {#code}
Inlined code: `java.lang.Object`, [`java.lang.Object`](https://docs.oracle.com/en/java/javase/14/docs/api/java.base/java/lang/Object.html).

`Very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very long text.`

<figure class="highlight">
  <pre class="highlight"><code>Manual <b>code</b> <i>block</i>
with HTML and <b><span style="color: green; font-weight: bold;">inline CSS</span></b>.</code></pre>
</figure>

```
Generic code block with Markdown.
```

<a href="https://github.com/rouge-ruby/rouge/wiki/List-of-supported-languages-and-lexers">List of supported code block languages.</a>

```sql
--SQL code block with Markdown
select *
from my_table
where id > 10;
```

```sql
--SQL code block with Markdown (long)
--Very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very long text.
select *
from my_table
where id > 10;
```

```html
<!DOCTYPE html>
<!-- HTML code block with Markdown -->
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

Note that Jekyll {% raw %}[`{% highlight <languageName> linenos %}`](https://jekyllrb.com/docs/liquid/tags/#line-numbers){% endraw %}
generates invalid HTML
(a [`table`](https://html.spec.whatwg.org/multipage/tables.html#the-table-element) element is put inside of
a [`code`](https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-code-element) element).
Most browsers seem to manage rendering such invalid HTML "as expected", but Safari for iOS does not, so avoid using line numbers
unless absolutely required.

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

## [](#video){:.slink}Video {#video}
### [](#video-youtube){:.slink}YouTube {#video-youtube}

A video with the title specified for printing
{% include youtube-video.html content = "YziVpa8oZDg, hqdefault, iframe-ratio-22-15, Darkwing Duck (intro and outro)" %}

A video with no title specified for printing
{% include youtube-video.html content = "UGp8FvWGoWs, maxresdefault, iframe-ratio-64-33" %}

[^footnoteA]: Footnote

    > "that combines quotation"

    ```
    with
    code block
    ```

    and normal text.

[^footnoteB]: **Footnote** <q>"with inline quotation"</q>
    and multiple lines in the source code.
