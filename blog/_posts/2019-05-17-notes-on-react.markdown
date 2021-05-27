---
layout: post
title: "Front-end development"
date: 2019-05-17 11:06:00 -0800
categories: web
description: "Some notes on markdown"
published: false
description:
---

# Angular

## Debugging Angular

https://code.visualstudio.com/docs/nodejs/angular-tutorial

## AOT vs JIT and Ivy

https://medium.com/js-imaginea/ivy-a-look-at-the-new-render-engine-for-angular-953bf3b4907a

## Components and sharing info
https://medium.com/better-programming/angular-7-share-component-data-with-other-components-1b91d6f0b93f
https://fireship.io/lessons/sharing-data-between-angular-components-four-methods/
https://stackoverflow.com/questions/37587732/how-to-call-another-components-function-in-angular2
https://angular.io/guide/architecture-components

# Deployment with Apache

```
# If an existing asset or directory is requested go to it as it is
RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI} -f [OR]
RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI} -d
RewriteRule ^ - [L]

# If the requested resource doesn't exist, use index.html
RewriteRule ^ /index.html
```
https://angular.io/guide/deployment
https://www.stefanoscerra.it/apache-rewrite-rules-configuration-for-angular/

# React
http://buildwithreact.com/tutorial/jsx
https://babeljs.io/docs/en/next/babel-plugin-transform-react-jsx
https://babeljs.io/setup#installation
https://cdn.rawgit.com/gaearon/0b180827c190fe4fd98b4c7f570ea4a8/raw/b9157ce933c79a4559d2aa9ff3372668cce48de7/LikeButton.js
https://medium.com/@to_pe/how-to-add-react-to-a-simple-html-file-a11511c0235f
https://ossmsft.visualstudio.com/Project32/_packaging?_a=feed&feed=OSS_All
https://prettier.io/docs/en/configuration.html
https://prettier.io/docs/en/options.html
https://reactjs.org/docs/add-react-to-a-website.html
https://reactjs.org/docs/create-a-new-react-app.html
https://reactjs.org/docs/create-a-new-react-app.html#create-react-app
https://reactjs.org/docs/introducing-jsx.html
https://reactjs.org/tutorial/tutorial.html
https://scottsauber.com/2017/06/10/prettier-format-on-save-never-worry-about-formatting-javascript-again/
https://www.linkedin.com/learning/react-js-essential-training-3/accessibility?u=3322
https://www.npmjs.com/package/prettier
https://www.npmjs.com/package/watch
https://www.sitepoint.com/an-introduction-to-jsx/
https://www.typescriptlang.org/docs/handbook/jsx.html

## Security

### Cross site scripting CSS

### Algorithmic complexity

## Javascript
### Var vs Let
https://www.w3schools.com/js/js_let.asp
https://codeburst.io/difference-between-let-and-var-in-javascript-537410b2d707

## Architecture

### Single Page Application (SPA)

### NPM

### Frameworks

React

### UI frameworks

https://react.semantic-ui.com/collections/grid/
https://react.semantic-ui.com/elements/button/#types-button
https://semantic-ui.com/collections/grid.html#/overview
https://www.npmjs.com/package/semantic-ui-react

    npm install semantic-ui-react --save




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

A library for creating user interfaces. Renders UI in response to events.

Building components, not templates.

Separation of concerns:
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


## Promises, Observables

https://itnext.io/async-and-await-in-javascript-the-extension-to-a-promise-f4e0048964ac


RxJS is a library for composing asynchronous and event-based programs by using observable sequences.




https://angular.io/guide/observables
https://angular.io/guide/http
https://angular.io/api/common/http/HttpEvent
https://medium.com/@kevinwkds/angular-observable-81eea33a1aab
https://www.djamware.com/post/5da31946ae418d042e1aef1d/angular-8-tutorial-observable-and-rxjs-examples
https://itnext.io/async-and-await-in-javascript-the-extension-to-a-promise-f4e0048964ac
https://dev.to/mr_bertoli/rxjs-from-scratch-pipeable-operators-1g18

https://stackoverflow.com/questions/37771855/chaining-observables-in-rxjs
https://stackoverflow.com/questions/37748241/how-to-do-the-chain-sequence-in-rxjs/37748799#37748799
https://stackoverflow.com/questions/34523338/rxjs-sequence-equivalent-to-promise-then




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


