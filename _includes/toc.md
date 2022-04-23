{%- comment -%}<!--
  See https://kramdown.gettalong.org/converter/html.html#toc for details.
  Unfortunately, TOC cannot be included in a layout and must be included in a page itself.
-->{%- endcomment -%}
{%- capture toc_title -%}
###### Contents
{:.no_toc}
{%- endcapture -%}
{{ toc_title | markdownify }}
1. A markdown ordered list which will be replaced with the ToC, excluding the optional contents header from above.
{:toc}
