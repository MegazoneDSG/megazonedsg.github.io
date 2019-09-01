---
layout: post
title: "3-00.옵저버블과 옵저버와 구독자"
description: 리액티브 프로그래밍의 기본 구성요소에 대해 알아봅시다.
image: 'https://i.imgur.com/fCyx0vC.png'
category: 'programming'
date: 2019-07-15 11:50:00
tags:
- kotlin
- ReactiveX
- Reactive Programming
introduction: 리액티브 프로그래밍의 기반을 이루는 옵저버블, 옵저버, 구독자에 대해 알아봅시다.
twitter_text: 리액티브 프로그래밍의 기반을 이루는 옵저버블, 옵저버, 구독자에 대해 알아봅시다.
---

# 3-00.옵저버블과 옵저버와 구독자

옵저버블과 구독자는 리액티브 프로그래밍의 기반을 이루는 `Observer` 패턴의 기본구성 요소입니다. 앞에 있던 두 챕터에서는 `Observable`와 `Subject` 인스턴스를 통해 데이터의 방출과 구독에 대해 관찰해 볼 수 있었습니다.

이를 통해, 우리가 이전에 구성해왔던 모든 프로그램들을 리액티브하게 바꿀 수 있다는 것을 알 수 있었습니다.



이번 챕터에서는 리액티브 프로그래밍의 핵심요소인 `observables`  ,  `observers`  ,  `subjects` 에 대해 알아보는 시간을 가져보겠습니다.



![ReactiveX Introduce](https://i.imgur.com/fKfqkrb.png)



위 사진은 [ReactiveX](http://reactivex.io) 랜딩페이지에서 발췌한 옵저버 패턴의 흐름입니다. 다음과 같은 그림으로 데이터의 흐름을 이해한다면, 여러분들도 좀 더 직관적으로 이해할 수 있을 것입니다.

## `Observable` 옵저버블

리액티브 프로그래밍에서 `Observable`옵저버블은 `Consumer`컨슈머가 소비할 수 있는 값을 산출해 내는 기본 계산 작업을 갖고 있습니다. 여기서  `Consumer`컨슈머는 풀 매커니즘 방식이 아닙니다.

옵저버블은 반대로 컨슈머에게 값을 푸시하는 역할을 합니다. 따라서 옵저버블은 일련의 연산자를 가진 모나드를 `Serialization`직렬화 하여 최종적으로 값을 옵저버에게 방출하는 이터레이터라 볼 수 있습니다.

옵저버블은 다음과 같은 방법으로 기능을 수행합니다.

- 옵저버는 옵저버블을 구독합니다.
- 옵저버블이 그 내부의 아이템들을 내보내기 시작합니다.
- 옵저버는 옵저버블에서 내보내는 모든 아이템에 반응합니다.



![Observable guide](https://i.imgur.com/fQb8knj.png)



## 옵저버블이 동작하는 방법

옵저버블은 `onNext`, `onComplete`, `onError` 같은 이벤트 메서드를 통해 작동을 하게됩니다.

- `onNext` : 옵저버블은 모든 아이템을 하나씩 해당 메서드에 전달하게 됩니다.

- `onComplete` : 모든 아이템이 `onNext` 메서드를 통과하면 옵저버블은 `onComplete` 메서드를 호출하게 됩니다.

- `onError` : 옵저버블에서 에러가 발생하면 `onError` 메서드가 호출되어 정의된 대로 에러를 구현합니다.



다음은 Observable이 동작하는 흐름을 이미지로 표현한 것입니다.

![Observable basic](https://i.imgur.com/zPLAEXO.png)



## Let's see the Basic Code!

```kotlin
fun main(args: Array<String>) {

  val observer: Observer<Any> = object : Observer<Any> { //(1)
    override fun onComplete() { //(2)
      println("All Completed")
    }

    override fun onNext(item: Any) { //(3)
      println("Next $item")
    }

    override fun onError(e: Throwable) { //(4)
      println("Error Occured $e")
    }

    override fun onSubscribe(d: Disposable) { //(5)
      println("Subscribed to $d")
    }
  }

  ...
}
```

해당 옵저버 인터페이스에서는 4개의 메서드가 구현되어 있습니다.

(5)의 `onSubscribe()` 메서드는 옵저버블 객체를 구독하기 시작할 때마다 호출되게 됩니다. 이때 `Disposable` 은 해당 구독에 대해 해제할 수 있는 관리자가 역할을 합니다.

(2)의 `onComplete()` 메서드는 옵저버블이 오류 없이 모든 아이템을 처리하게 되면 호출됩니다.

(3)의 `onNext(Any)` 메서드는 구독 이후 처리하는 모든 아이템에 대해 흐름에 따라 호출하게 됩니다.

(4)의 `onError(Throwable)` 메서드는 옵저버블에 오류가 생겼을 때 호출하게 됩니다.



해당 옵저버를 구현하게 되면, 옵저버블을 구독시에 방출하는 아이템에 대해 보기와 같이 구현된 것에 따라 처리하게 됩니다.



이제 어떻게 아이템들을 옵저버블하게 구성하는지 알아보겠습니다.

해당방법에는 두가지가 있는데, 기존에 갖고 있는 아이템들을 옵저버블하게 컨버팅하는 것과, 옵저버블 팩토리를 생성하여 아이템들을 넣는 것입니다.

아래는 에제 코드입니다.

```kotlin
fun main(args: Array<String>) {
  ...
  
  val observable: Observable<Any> =
  listOf("One", 2, "Three", "Four", 4.5, "Five", 6.0f).toObservable()  //(6)

  observable.subscribe(observer) //(7)

  val observableOnList: Observable<List<Any>> = 
  Observable.just(
    listOf("One", 2, "Three", "Four", 4.5, "Five", 6.0f),
    listOf("List with Single Item"),
    listOf(1,2,3,4,5,6)) //(8)

  observableOnList.subscribe(observer) //(9)
}
```

(6)에서는 `listOf(...)`  메서드로 아이템에 대한 리스트를 생성 후 `toObservable` 메서드를 사용하여 옵저버블한 객체로 바꿔주고 있습니다.

(8)에서는 팩토리 패턴을 이용하여  리스트를 한 아이템으로 두고 아이템들을 옵저버블로 생성해주고 있습니다.

그리고 (7), (9)를 통해 구독하여 나온 결과는 다음과 같습니다.

>Subscribed to io.reactivex.internal.operators.observable.ObservableFromIterable
>
>$FromIterableDisposable@4361bd48
>
>Next One
>
>Next 2
>
>Next Three
>
>Next Four
>
>Next 4.5
>
>Next Five
>
>Next 6.0
>
>All Completed
>
>Subscribed to io.reactivex.internal.operators.observable.ObservableFromArray$FromArrayDisposable@7637f22
>
>Next [One, 2, Three, Four, 4.5, Five, 6.0]
>
>Next [List with Single Item]
>
>Next [1, 2, 3, 4, 5, 6]
>
>All Completed



## `Observable.create` 메서드 이해

우리는 언제든지 옵저버블을 팩토리 패턴을 이용하여 직접 생성할 수 있습니다. `Observable.create` 메서드는 `ObservableEmitter<T>` 인터페이스의 인스턴스를 입력 받습니다.

```kotlin
fun main(args: Array<String>) {

  val observer: Observer<String> = object : Observer<String> {
    override fun onComplete() {
      println("All Completed")
    }

    override fun onNext(item: String) {
      println("Next $item")
    }

    override fun onError(e: Throwable) {
      println("Error Occured ${e.message}")
    }

    override fun onSubscribe(d: Disposable) {
      println("New Subscription ")
    }
  } //Create Observer

  val observable:Observable<String> = Observable.create<String> {//1
    it.onNext("Emit 1")
    it.onNext("Emit 2")
    it.onNext("Emit 3")
    it.onNext("Emit 4")
    it.onComplete()
  }

  observable.subscribe(observer)

  val observable2:Observable<String> = Observable.create<String> {//2
    it.onNext("Emit 1")
    it.onNext("Emit 2")
    it.onNext("Emit 3")
    it.onNext("Emit 4")
    it.onError(Exception("My Custom Exception"))
  }

  observable2.subscribe(observer)
}
```

이전 예제와 옵저버를 구현한 것은 거의 같습니다. 달라진 것은 `Observable.create` 메서드를 통해 팩토리 패턴으로 옵저버블을 생성해 주고 있습니다. 결과는 다음과 같습니다.

>New Subscription 
>
>Next Emit 1
>
>Next Emit 2
>
>Next Emit 3
>
>Next Emit 4
>
>All Completed
>
>New Subscription 
>
>Next Emit 1
>
>Next Emit 2
>
>Next Emit 3
>
>Next Emit 4
>
>Error Occured My Custom Exception



해당 방식은 사용자가 지정한 데이터 구조를 사용하거나, 내보내는 값을 제어하려고 할 때 유용한 방식이니, 기억해 두시기 바랍니다.



다음장에선 더 다양한 방법으로 옵저버블을 생성하여 데이터의 흐름을 생성하는 방법을 알아보도록 하겠습니다.

[>> 포스트 3-01.옵저버블을 구독했을 때 해제하는 방법](https://soda1127.github.io/observables-dispose/)

