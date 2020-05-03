---
layout: post
title: "Design notes for software"
date: 2019-01-29 12:42:00 -0800
categories: software engineering
published: false
description:
---

Here is one from Windows Terminal:
https://github.com/microsoft/terminal/blob/dev/miniksa/manager_spec/doc/specs/spec-template.md

Find a good one-pager template for writing new features in software
 
## Introduction
What are you going to talk about? Write a paragraph or two so that anybody can get acclimated with what this document is about to describe. 

## Scenarios and Business Impact 
Where is this feature going to be used? By whom? What is the expected impact to our customers and estimated service cost?   

## Key Design Decisions and Alternatives 
Did you make any important decisions we should know about? State the alternatives here so that we all know the reasoning. 

## Architecture 
This section describes how you are going to build what the functional spec outlines.  It should be detailed and through enough that another developer could implement your design and provide enough detail to get a high confidence estimate of the cost to implement the feature but isn’t as detailed as the code.  Be sure to also consider testability in your design.   

Describe the internal structure of this feature or component. Use diagrams to represent class hierarchies and sequence of interaction between objects or threads.  

Think about: 
* New Build 
* Build Definition 
* Deployment. ARM and Release Automation 

## Service Debuggability and Monitoring 
What TSGs need to be written before the new service is deployed?  What telemetry should be monitored?  ICMs? Think about each of the following: 

* Exception handling 
* Logging and Telemetry  
* Alerts, Monitoring Dashboards 

## Testing 
How are you going to test this component? Think about the following: 
* Unit Testing 
* Component Tests 
* Integration Testing – With mock data 
* Integration Testing – With actual data/dependencies 
* Load and Performance Testing 

## Dependencies 
Identify the key dependencies this component has on other services and/or other in-progress work within the org. Describe the key dependencies that this design has on other features being developed as well as the dependencies other features have on this design. 

## Metrics  
Cover the key metrics that will be used to measure both the performance and the health of this component. 

## Questions, Observations, and Comments 
Any unknowns that still need to be resolved? 
