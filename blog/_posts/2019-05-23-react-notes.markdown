---
layout: post
title: "react-notes"
date: 2019-05-23 12:45:00 -0800
categories: react-notes
---

https://www.codementor.io/tamizhvendan/beginner-guide-setup-reactjs-environment-npm-babel-6-webpack-du107r9zr
https://www.npmjs.com/package/webpack

https://medium.freecodecamp.org/part-1-react-app-from-scratch-using-webpack-4-562b1d231e75
https://webpack.js.org/guides/getting-started/
https://webpack.js.org/concepts/configuration#simple-configuration



`import React from 'react';` vs `require('React');`

Reading:
https://signalvnoise.com/posts/3124-give-it-five-minutes

### Pete Hunt: React: Rethinking best practices -- JSConf EU 2013
https://www.youtube.com/watch?v=x7cQ3mrcKaY

A librarty for creating user interfaces. Renders UI in response to events.

Building components, not templates.

eparation of concerns:
Reduce couple, increase cohesion.

Templates encourage a poor separation of concerns.

"View model" tightly copules template to display logic.

Display logic and markup are inveitably tightly coupled. Highly cohesive. They both show the UI.

Templates separates **technologies**, not **concerns**.

prototypical inheritance... 

The framework cannot know how to separate your concerns for you. 

Re-Render the entire page on every update.!!! 

https://quotes.yourdictionary.com/author/edsger-w-dijkstra/45532

React componenta are basically just idemponent functions that describe your UI at any point in time, just like a server-rendered app.


