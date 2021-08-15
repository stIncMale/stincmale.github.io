---
layout: base
title:
custom_post_category_to_display: about
custom_description: My personal website. Software engineering articles/notes/thoughts written by me and occasionally other stuff.
---
{% include common-links-abbreviations.markdown %}

<figure style="display: block">
  {%- comment -%}<!-- -webkit-clip-path is for iOS Safari -->{%- endcomment -%}
  <img src="{% link /assets/img/face.png %}" alt="Me" style="clip-path: circle(44.2% at 50% 50%); -webkit-clip-path: circle(44.2% at 50% 50%); width: 12em; height: auto; display: block; margin-left: auto; margin-right: auto;">
  <figcaption>2016, July</figcaption>
</figure>

`Profession` | **Server-side software engineer (Java)** interested in concurrency and distributed systems.
`Resume` | <a class="button" style="font-size: 1.3em;" href="{% link resume.markdown %}" title="Resume">{%- comment -%}<!-- /assets/img/resume-badge.svg -->{%- endcomment -%}<svg class="svg-button" enable-background="new 0 0 96 96" version="1.1" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg"><path d="M72,63H42v6h30V63z M72,75H42v6h30V75z M72,27H42v6h30V27z M72,39H42v6h30V39z M72,51H42v6h30V51z M36,51H24v6h12V51z M81,3  H15c-1.657,0-3,1.343-3,3v84c0,1.657,1.343,3,3,3h66c1.657,0,3-1.343,3-3V6C84,4.343,82.657,3,81,3z M78,87H18V9h60V87z M36,39H24v6  h12V39z M36,27c0-1.938-1.231-3.576-2.95-4.209c0.886-0.821,1.45-1.986,1.45-3.291c0-2.486-2.015-4.5-4.5-4.5s-4.5,2.014-4.5,4.5  c0,1.305,0.563,2.47,1.45,3.291C25.231,23.424,24,25.062,24,27v6h12V27z"/></svg></a>
`Bio` | I was born in Mogilev, Belarus, moved to Moscow, Russia, where I studied at [MIPT] and got my **MSc in applied mathematics and physics**. Now I live in Calgary, Canada.

## [](#dead-code){:.section-link}{{ site.custom_title }} {#dead-code}
A place where I share things (mostly those related to my profession) with humanity.
Humanity … do I like it? Let's say, I have mixed feelings.
I love [the song](https://youtu.be/0755SXCTCN0) though!

The story behind the name {{ site.custom_title }} is straightforward:
the majority of code that software engineers write in their spare time ends up being unused, i.e. being dead&mdash;hence the name.

## [](#personality){:.section-link}Personality {#personality}
This particular page is about sharing something with regard to my personality rather than technical things.
For example, here are a few examples of [lyrics]({% link lyrics.markdown %}) and quotes/sayings I like:
* <q>"… it takes all the running you can do to keep in the same place.[^1] If you want to get somewhere else, you must run at least twice as fast as that!"</q>\\
  <span class="insignificant">Lewis Carroll, [Through the looking-glass, and what Alice found there](https://www.loc.gov/item/00000848/), 1871</span>
* <q>"Those who would give up essential Liberty, to purchase a little temporary Safety, deserve neither Liberty nor Safety."</q>\\
  <span class="insignificant">Benjamin Franklin, [Pennsylvania Assembly: Reply to the Governor](https://franklinpapers.org/framedVolumes.jsp?vol=6&page=238a), November 11, 1755</span>
* <q>"Never attempt to teach a pig to sing; it wastes your time and annoys the pig."</q>\\
  <span class="insignificant">Robert A. Heinlein, [Time enough for love, the lives of Lazarus Long](https://catalog.loc.gov/vwebv/search?searchCode=LCCN&searchArg=72098131&searchType=1&permalink=y), 1973</span>
* <q>"When the going gets tough, the tough get going."</q>\\
  <span class="insignificant">this saying [is ridiculously interpreted](https://youtu.be/z52kKE8qngs) in [South Park s16e7](https://www.southparkstudios.com/episodes/iyw8ps/south-park-cartman-finds-love-season-16-ep-7)</span>
* <q>"Do your duty, come what may."</q>
* <q>"Live as if you were to die tomorrow. Learn as if you were to live forever."</q>

I like to play computer games and spent a lot of time playing Quake and Unreal Tournament series at university and for some time after graduating.
I am still playing, but mostly non-competitive games because they do not require investing time regularly.
My nickname is `Male` sometimes with the tag `stInc`.
This tag is now quite useless because I suppose I am the only one who still uses it.
`stInc` means `Starfuckers Inc`, or sometimes it may mean "stink" &#x1f61b;
I also was taking part for 3 years in developing (unfortunately mobile) games at [ZeptoLab](https://youtu.be/mAXjQvJ2Umo).

Following are examples of YouTube channels I am subscribed to and watching regularly, which may tell you something about my interests beyond professional ones:
* [3Blue1Brown](https://www.youtube.com/3blue1brown)<span class="insignificant">&nbsp;by [Grant Sanderson](https://www.3blue1brown.com/about#about-the-author)</span>\\
  <span class="insignificant">A combination of math and entertainment, depending on your disposition.</span>
* [Robert Miles](https://www.youtube.com/RobertMilesAI)\\
  <span class="insignificant">Videos about Artificial Intelligence Safety Research, for everyone.</span>
* [Healthcare Triage](https://www.youtube.com/healthcaretriage)<span class="insignificant">&nbsp;by [Aaron Carroll](https://medicine.iu.edu/faculty/3005/carroll-aaron)</span>\\
  <span class="insignificant">Videos that explain healthcare policy, medical research, and answer a lot of other questions you may have about medicine, health, and healthcare.</span>
* [Kurzgesagt – In a Nutshell](https://www.youtube.com/inanutshell)<span class="insignificant">&nbsp;by [kurzgesagt.org](https://kurzgesagt.org/about/)</span>\\
  <span class="insignificant">Videos explaining things with optimistic nihilism.</span>
* [Real Engineering](https://www.youtube.com/RealEngineering)<span class="insignificant">&nbsp;by [Brian McManus](https://twitter.com/TheBrianMcManus)</span>\\
  <span class="insignificant">Interesting answers to simple questions.</span>
* [PBS Space Time](https://www.youtube.com/pbsspacetime)<span class="insignificant">&nbsp;hosted by [Matt O'Dowd](https://www.mattodowd.space/) (originally hosted by [Gabe Perez-Giz](https://twitter.com/fizziksgabe))</span>\\
  <span class="insignificant">The channel explores the outer reaches of space, the craziness of astrophysics, the possibilities of sci-fi, and anything else you can think of beyond Planet Earth.</span>
* [Science without the gobbledygook](https://www.youtube.com/SabineHossenfelder)<span class="insignificant">&nbsp;by [Sabine Hossenfelder](http://sabinehossenfelder.com/)</span>\\
  <span class="insignificant">No hype, no spin, no tip-toeing around inconvenient truths.</span>
* [Fermilab](https://www.youtube.com/fermilab)<span class="insignificant">&nbsp;by [Fermi National Accelerator Laboratory](https://www.fnal.gov/), hosted by [Don Lincoln](https://drdonlincoln.com/)</span>\\
  <span class="insignificant">Videos on basic particle physics and cosmology.</span>
* [World Science Festival](https://www.youtube.com/WorldScienceFestival)<span class="insignificant">&nbsp;by [World Science Foundation](https://www.worldsciencefestival.com/about/meet-our-team/), hosted by [Brian Greene](https://www.briangreene.org/)</span>\\
  <span class="insignificant">Long and short-form videos on nearly every science-related topic including physics, biology, the brain, robotics, medicine, space, engineering, and the Earth.</span>

[^1]: Albert Einstein went even further than Lewis Carroll in his general theory of relativity, which tells us that in curved spacetime a body must
    have non-zero proper acceleration (it may be measured by an accelerometer) to stay in the same place.
    See [Is Gravity An Illusion? (at 9:56)](https://youtu.be/XRr1kaXKBsU?t=596)<span class="insignificant">&nbsp;by [Derek Muller](https://www.veritasium.com)</span>
    for a popular science explanation.
