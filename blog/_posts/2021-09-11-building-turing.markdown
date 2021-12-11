---
layout: post
title: "Building Turing"
date: 2021-09-11 23:05:00 -0800
categories: none
published: false
description:
---

# Introduction

## Domain Specific Languages

SQL, Yaml, build sytems

Internal vs External.

## Declarative vs Imperative languages
A programming paradigm is a fundamental style of computer programming. There are four main paradigms: imperative, declarative, functional (which is considered a subset of the declarative paradigm) and object-oriented.

![](2021-09-11-23-07-47.png)

https://www.linkedin.com/pulse/20140915130624-107536061-imperative-vs-declarative-programming/

https://stackoverflow.com/questions/1784664/what-is-the-difference-between-declarative-and-imperative-paradigm-in-programmin

## JVM base languages

Kotlin, Scala, Groovy and Java.

https://dev.to/javinpaul/scala-groovy-or-kotlin-which-programming-language-java-developers-should-learn-5an5

This was taken on 2021
![](2021-09-11-23-16-22.png)

# Fluency tactics

## infix

Member functions and extensions with a **single parameter** can be turned into infix functions.

```
  infix fun Int.times(str: String) = str.repeat(this)        // 1
  println(2 times "Bye ")                                    // 2
```

# The first plugin

https://github.com/apollographql/apollo-android

Github and the graphql endpoint.
https://dev.to/gr2m/github-api-authentication-personal-access-tokens-53kd

https://www.apollographql.com/docs/android/essentials/get-started-kotlin/


```
./gradlew downloadApolloSchema \
  --endpoint="https://api.github.com/graphql" \
  --schema="src/main/kotlin/graphql/com/github/schema.graphqls"  --header="Authorization: token *****"

```