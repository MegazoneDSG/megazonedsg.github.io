---
layout: post
author: Lukoh
notification: true
title: "Android App Best practices of Development"
description: Android App Best practices of Development
image: ""
categories:
- tutorial
date: 2019-09-30 02:05:00
tags:
- Android App Best practices of Development
introduction: Android App Best practices of Development
twitter_text: Android App Best practices of Development
---

## Android App Best practices of Development

Programming is a creative field, and building Android apps isn't an exception. There are many ways to solve a problem, be it communicating data between multiple activities or fragments, retrieving remote data and persisting it locally for offline mode, or any number of other common scenarios that nontrivial apps encounter.

Although the following recommendations aren't mandatory, it has been our experience that following them makes your code base more robust, testable, and maintainable in the long run:

* # Avoid designating your app's entry points—such as activities, services, and broadcast receivers—as sources of data.

Instead, they should only coordinate with other components to retrieve the subset of data that is relevant to that entry point. Each app component is rather short-lived, depending on the user's interaction with their device and the overall current health of the system.

* # Create well-defined boundaries of responsibility between various modules of your app.

For example, don't spread the code that loads data from the network across multiple classes or packages in your code base. Similarly, don't define multiple unrelated responsibilities—such as data caching and data binding—into the same class.

* # Expose as little as possible from each module.

Don't be tempted to create "just that one" shortcut that exposes an internal implementation detail from one module. You might gain a bit of time in the short term, but you then incur technical debt many times over as your codebase evolves.

* # Consider how to make each module testable in isolation.

For example, having a well-defined API for fetching data from the network makes it easier to test the module that persists that data in a local database. If, instead, you mix the logic from these two modules in one place, or distribute your networking code across your entire code base, it becomes much more difficult—if not impossible—to test.

* # Focus on the unique core of your app so it stands out from other apps.

Don't reinvent the wheel by writing the same boilerplate code again and again. Instead, focus your time and energy on what makes your app unique, and let the Android Architecture Components and other recommended libraries handle the repetitive boilerplate.

* # Persist as much relevant and fresh data as possible.

That way, users can enjoy your app's functionality even when their device is in offline mode. Remember that not all of your users enjoy constant, high-speed connectivity.

* # Assign one data source to be the single source of truth.

Whenever your app needs to access this piece of data, it should always originate from this single source of truth.
