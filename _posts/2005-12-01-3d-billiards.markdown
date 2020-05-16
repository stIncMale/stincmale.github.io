---
layout: post
slug: 3d-billiards
title: 3D Billiards
categories: [tech]
tags: [archived, C++, OpenGL]
date: 2005-12-01T00:00:00+00:00
custom_update_date: 2020-05-15T21:02:00−06:00
---
*[MIPT]:
{:data-title="The Moscow Institute of Physics and Technology"}

This game is a computer science project made by students at MIPT.
The greater part of all programming was made by me with some help of [Roman Prokofyev](https://prokofyev.ch),
the model of a billiard table was made by Vladimir Muzychenko.
The game has tons of bugs, but somehow it works &#x1f605;

By the time I started this project, I had about 1.5&ndash;2 years of experience with computer;
before that I was not even able to copy a file in Windows.
Despite the game is quite poor, this page is here to keep memories about the very beginning of what later became my career. 

{% include toc.markdown %}

## [](#demo){:.slink}Demo video {#demo}

{% include youtube-video.html content = "8Lzr0kWM440 , maxresdefault , iframe-ratio-4-3 , 3D Billiards Demo" %}

## [](#requirements){:.slink}Requirements {#requirements}

Operating system | Windows XP or newer

I tried on Windows 10 and it works. &#x1f44d; for the backwards compatibility, Microsoft!

## [](#controls){:.slink}Controls {#controls}

Rotate viewpoint | Move the mouse to the edges of the screen.
Zoom in/out | Mouse wheel up/down or `Page Up` / `Page Down`.
Hit a ball | Left-click anywhere to prepare the hit, then choose a ball by left-clicking on it. Then right-click to choose the direction and the force of the hit. Press `"Next"` and  left-click to choose the point on the ball where to hit, right-click to to restore the point to the center. Press `"Done"` to hit, press `"Cancel"` to abort.
Open in-game menu | Right-click.

## [](#physics-params){:.slink}Physics params {#physics-params}
Physics params are stored in `.\Data\Physical characteristics\VALUE.VAL` and one may play with them.

## [](#known-issues){:.slink}Known issues {#known-issues}

The process appears to not respond to input after starting. | Press `Esc` to close the splash screen.
The screen appears frozen after changing the display resolution. | `F1` loads default display settings. If this does not help, stop the process e.g. by pressing `Alt` + `F4` and launch it again.
I cannot see the menu/fonts in the game. | Maybe the required font is not installed. `F2` tries to load another font, `F3` loads the default game font.

## [](#links){:.slink}Download links {#links}
* [unpack and play](https://docs.google.com/leaf?id=0B_4a-5REfZ5jMGIxNzFkMWYtMGVmNy00NDZiLWJhOTAtY2U1ZDU3ODU4MDIz&sort=name&layout=list&num=50)
* [the source code for Microsoft Visual C++ 6 with all in-game assets](https://docs.google.com/leaf?id=0B_4a-5REfZ5jMzNkZWU2NGItYTFhOS00ODkxLWExYTUtNDk1MGVmODUyMDlh&sort=name&layout=list&num=50)
 