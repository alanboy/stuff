---
layout: post
title: "kubernetes"
date: 2021-03-02 05:31:00 -0800
categories: software
published: true
description: A guide to Kubernetes fundamentals, including key concepts, installation steps, and basic tooling
---

## Definitions

**Pod**	Smallest unit in Kubernetes. Can contain one or more containers.

**A sidecar** is a container that runs alongside your main container in the same Pod in Kubernetes. It typically provides supporting functionality to the main application.


* kubectl The Kubernetes command-line tool, kubectl, allows you to run commands against Kubernetes clusters. You can use kubectl to deploy applications, inspect and manage cluster resources, and view logs.
* kind kind lets you run Kubernetes on your local computer. This tool requires that you have Docker installed and configured. 
* minikube Like kind, minikube is a tool that lets you run Kubernetes locally. minikube runs a single-node Kubernetes cluster on your personal computer (including Windows, macOS and Linux PCs) so that you can try out Kubernetes, or for daily development work. Once you have minikube working, you can use it to run a sample application.
* kubeadm. You can use the kubeadm tool to create and manage Kubernetes clusters. It performs the actions necessary to get a minimum viable, secure cluster up and running in a user friendly way.
* pod. A Kubernetes Pod is a group of one or more Containers, tied together for the purposes of administration and networking.
* Deployment. A Kubernetes Deployment checks on the health of your Pod and restarts the Pod's Container if it terminates. Deployments are the recommended way to manage the creation and scaling of Pods.


## Hello world
Install `kubectl`:
```
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
```

Install `minikube`:
```
 curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
 sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

## Dashboards

```
kubectl proxy --address='0.0.0.0' --disable-filter=true
```

```
minikube dashboard
```

# References

https://kubernetes.io/docs/tasks/tools/install-kubectl/
https://minikube.sigs.k8s.io/docs/start/