---
layout: post
author: Lukoh
notification: true
title: Android Dependency Injection Framework Dagger2
description: Android Dependency Injection Framework Dagger2
image: "https://user-images.githubusercontent.com/55682968/66175131-69bbb100-e693-11e9-943a-f98c1f6a8f68.png"
categories:
- tutorial
date: 2019-10-04 09:30:00
tags:
- Android Dependency Injection Framework Dagger2
introduction: Android Dependency Injection Framework Dagger2
twitter_text: Android Dependency Injection Framework Dagger2
---

# Android Dependency Injection Framework Dagger2

## What is Dependency Injection Framework?

Dependency injection is a technique where objects are created by an external entity or object. 
This means an object doesn’t have to create the instances of its dependent classes on his own but rather gets the dependencies from another object or static method.

## Dependency Injection Framework's benefits
This technique has many benefits here I’m just listing the most important ones:
* Reduces the boilerplate code
* Makes our code reusable and clean
* Makes it easy to replace our dependencies with fake implementations which make testing easier
* Helps us enable loose coupling

## What is Dagger2?

A fast dependency injector for Java and Android.

Dagger2 is a compile-time framework for dependency injection. 
It uses no reflection or runtime bytecode generation, does all its analysis at compile-time, and generates plain Java source code.

Dagger2 is a fully static dependency injection framework which is based on annotations and helps us to manage our dependencies between classes. 
Here are some of its benefits:
* It makes your code very modular
* Makes it easier to unit test your code
* Helps you loosely couple your code
* Reduce lots of boiler-plate code

## Why do we use Dagger2 in our project?

Dagger2 is light weight and it generates code at compile time so suitable for android.

Dagger2 is not required for simple applications. 
But it is always a good idea to use Dagger2 as functionality is always expected to change and your app should be designed in such way that making functionality changes requires minimal effort and you should be able make changes where it is need without breaking the entire app. 
To achieve this, one of the design and dev items you need to consider is Dagger2 as DI(Dependecy Injection Framework).

### Annotations:
Dagger2 provides you with a few annotations I can use to define and inject our dependencies.

#### Inject:
This annotation can be used in two ways:
* Telling dagger to use this constructor to make an object of this type. 
  This injection is recursive which means that if the constructor has parameters dagger will automatically try to inject them too.
* Used by a component to tell dagger that it wants this dependency.

Here is a simple example to make the statement clearer:
```
class Example @Inject constructor()
class MainClass{
    @Inject
    lateinit var example: Example
}
```

Here I create a class called Example which uses the @Inject on its constructor to tell dagger that it should use this constructor to inject dependencies of this type. 
After that I define the MainClass which ask Dagger2 to get an instance of Example and dagger tries to inject the dependency using the constructor.

#### Provides:

I use the provides annotation if there is no constructor I can inject from and when I can’t instantiate the dependency.
Marking a method with this annotation tells dagger that the method returns the datatype I want to inject. 
Now let’s look at an example to understand it better:
```
@Provides fun getContext(): Context {
    return this.getContext()
}
```

In this example, I have a dummy function which returns a context. 
The @Provides annotation tells dagger where it can find the context.

The only problem that I can run into using this function is when I want to inject two different things with the same return-type. 
If something like this happens I need to use the Named annotation to rename our dependency manually.
```
@Named("ActivityContext")
@Provides fun getContext(): Context {
    return this.getContext()
}

@Named("ApplicationContext")
@Provides fun getApplicationContexts(): Context{
    return this.applicationContext
}
```

Here I have two functions with the same return type which I named using the Named annotation to let dagger know that they aren’t the same.
Note: Provide annotations can only be defined in a class which is annotated with @Module.

#### Module:

Modules tell dagger how to provide dependencies from the dependency graph. 
These are normally high-level dependencies that you haven’t already provided to the graph using @Inject.
Modules are defined as classes with an @Module annotation.
```
@Module
class AppModule{
    ...
}
```

This example shows how you can define a basic module using the @Module annotation on your class.

```
@Module
class AppModule(val activity: Activity){
    @Named("ActivityContext")
    @Provides fun getContext(): Context {
        return activity.baseContext
    }

    @Named("ApplicationContext")
    @Provides fun getApplicationContexts(): Context{
        return activity.applicationContext
    }
}
```

#### The steps:
* Ignore dagger-android (added in 2.10) entirely, you don’t need it
* Use @Inject annotated constructors wherever you can (and the scope that comes with it on the class)
* Use @Component, and @Module (when you actually need it)
* Understand @Singleton scope (basically “allow creating only 1 instance of this thing, please”), and that all scopes say the same thing
* Start using subscopes only if you actually have an architectural design that demands the creation of subscopes. You can usually get away without ’em. Either way, don’t stress about ‘em.

#### When to inject
Constructor injection is preferred whenever possible because javac will ensure that no field is referenced before it has been set, which helps avoid NullPointerExceptions. 
When members injection is required (as discussed above), prefer to inject as early as possible. 
For this reason, DaggerActivity calls AndroidInjection.inject() immediately in onCreate(), before calling super.onCreate(), and DaggerFragment does the same in onAttach(), which also prevents inconsistencies if the Fragment is reattached.

It is crucial to call AndroidInjection.inject() before super.onCreate() in an Activity, since the call to super attaches Fragments from the previous activity instance during configuration change, which in turn injects the Fragments. In order for the Fragment injection to succeed, the Activity must already be injected. For users of ErrorProne, it is a compiler error to call AndroidInjection.inject() after super.onCreate().

Here I actually define our provide function from above in our module.
Note: If you want more information about dagger I can highly recommend [Hari Vignesh Jayapalan introduction to dagger2 posts](https://medium.com/@harivigneshjayapalan/dagger-2-for-android-beginners-introduction-be6580cb3edb) where he goes from the basics to more advanced dagger topics in just a few posts.

Now you should know how the dependency injection works and why it’s important to use it.

Please visit to [the official Dagger2 site](https://dagger.dev/android.html), if you'd like to dive into Dagger2 or get it in your memory.
