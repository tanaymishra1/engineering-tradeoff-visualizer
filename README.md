# Engineering Trade-Off Visualizer

A web version of my [trade-off simulator](https://github.com/tanaymishra1/engineering-tradeoff-simulator). Move the sliders for speed, torque and cost, split 100 points between them, and the score and chart update right away. Saved designs get ranked by score.

Try it: https://tanaymishra1.github.io/engineering-tradeoff-visualizer/

![Screenshot](docs/screenshot.png)

## Why I made it

The Python version makes you type everything in and only shows the result at the end. I wanted to see it change as I moved things around.

## Running it

Use the link above, or download the repo and open index.html in a browser. Nothing to install.

## How it works

It's plain HTML, CSS and JavaScript. Every slider and priority box has an input listener that recalculates the score and redraws the bar chart on a canvas. The scoring is the same as the Python version: speed, torque and cost times their priority, with cost subtracted, and a one-point penalty if torque is under 5.

Saved designs reset when you reload the page.

## What I learned

This was my first time using DOM events, and my first time taking logic I wrote in Python and rebuilding it in JavaScript.

## To do

- Keep saved designs after a reload
- Compare two designs side by side
- Let users add their own criteria

MIT license.
