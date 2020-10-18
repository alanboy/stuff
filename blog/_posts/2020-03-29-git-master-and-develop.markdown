---
layout: post
title: "Branching strategies"
date: 2020-03-29 06:08:00 -0800
categories: software
published: true
description: "Branching strategies have a significant impact on your development process. Different strategies optimize for different projects and team sizes."
---

<div class="mermaid">
gitGraph:
options
{
    "nodeSpacing": 35,
    "nodeRadius": 10
}
end
commit
branch newbranch
checkout newbranch
commit
commit
checkout master
commit
merge newbranch
</div>

I really don't like the whole master/develop branch for small teams. But sometimes that decissions is beyond you and one must deal with the whole develop/master merge mess.

## You continuously work on develop

Options to merge a PR:

* Merge (no fast-forward)
Nonlinear history preserving all commits
* Squash commit
Linear history with only a single commit on the target

* Rebase and fast-forward
Rebase source commits onto target and fast forward

* Semi-linear merge
Rebase source commits onto target and create a two-parent merge
