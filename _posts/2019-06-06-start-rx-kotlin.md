---
layout: post
author: soda1127
title: "1-02.RxKotlin 시작하기"
description: RxKotlin을 이용하여 리액티브 프로그래밍을 해봅시다.
image: 'https://i.imgur.com/pr6E1OC.jpg'
category: 'programming'
date: 2019-06-06 17:54:00
tags:
- kotlin
- ReactiveX
- Reactive Programming
introduction: RxKotlin이 무엇인지, RxKotlin은 어떤 기능을 제공하는지 알아봅니다.
twitter_text: RxKotlin이 무엇인지, RxKotlin은 어떤 기능을 제공하는지 알아봅니다.
---

# 1-02.RxKotlin 시작하기

`RxKotlin`은 **ReactiveX**의 `RxJava` 라이브러리를 기반으로 포팅하여 코틀린을 위한 리액티브 프로그래밍의 특정 부분을 함수형 프로그래밍으로써 구현한 라이브러리입니다. 기본적인 Rx와 코틀린을 결합한 내용에 대해서는 렘 아카데미에서 제공하는 포스트인 [Rx와 Kotlin으로 간결하고 명료하게 모든 것을 조립해보세요!](https://academy.realm.io/kr/posts/compose-everything-rx-kotlin/)를 참고하시기 바랍니다.

`RxKotlin`는 함수 컴포지션을 선호하며, 전역 상태와 함수를 호출함으로써 발생하는 사이드 이펙트를 방지하는 역할도 제공합니다.

Rx라이브러리에서는 값을 발행하는 `Producers`프로듀서와 값을 구독하여 소비하는 `Consumers`컨슈머 구조로 옵저버패턴으로 이루어져 있습니다. 해당 구조에 스케쥴링, 스로틀링, 변형, 병합, 에러처리, 라이프 사이클 등을 관리하는 오퍼레이터를 제공합니다.

## RxKotlin 설정

요즘은 대부분 빌드환경으로 `Gradle`를 사용하고 있습니다. 저는 `Gradle` 빌드 환경을 기준으로 세팅하도록 하겠습니다.

```groovy
compile 'io.reactivex.rxjava2.rxkotlin:2.x.y'
```

## RxJava의 푸시 매커니즘과 풀 매니커즘 비교

```kotlin
fun main(args: Array<String>) {
    val list = listOf("One", 2, "Three", "Four", 4.5, "Five", 6.0f) // 1
    val iterator = list.iterator() // 2
    while (iterator.hasNext()) { // 3
        println(iterator.next()) // 4 각 엘리먼트를 출력한다
    }
}
```

`RxKotlin`은 과거 패러다임에서 사용하던 프로그래밍 방식인 `Iterator`반복자 패턴의 풀 매커니즘을 사용하지 않고, 푸시 매커니즘의 옵저버블 패턴을 중심으로 작용합니다.

그렇기때문에 지연이 일어날 수 있으며, 동기식과 비동기식 방식 모두 이용될 수 있습니다.

결과는 다음과 같습니다.

> One
>
> 2
>
> Three
>
> Four
>
> 4.5
>
> Five
>
> 6.0

이번에는 `Observable` 패턴으로 구성된 동일한 예제를 봅시다.

```kotlin
fun main(args: Array<String>) {
    val list:List<Any> = listOf("One", 2, "Three", "Four", 4.5, "Five", 6.0f)
    val observable: Observable<Any> = list.toObservable(); //1

    observable.subscribeBy(  // 2 named arguments for lambda Subscribers
            onNext = { println(it) },
            onError =  { it.printStackTrace() },
            onComplete = { println("Done!") }
    )

}
```

결과는 다음과 같습니다.

> One
>
> 2
>
> Three
>
> Four
>
> 4.5
>
> Five
>
> 6.0
>
> Done!

마찬가지로 리스트의 모든 값을 출력하는 것을 볼 수 있습니다. 차이점은 `Done`을 출력하는 것을 볼 수 있는데요. 내부적으로 어떤차이가 있는지 살펴봅시다.



1. 리스트를 생성한다(이전 코드와 동일)
2. 1번에서 생성한 리스트로 `Observable` 인스턴스를 생성한다.
3. `Observable` 인스턴스를 구독한다.

옵저버블 객체를 구독했기때문에, 내부 리스트의 값을 하나 하나씩 푸시하고, 그렇게 방출된 값에 대해 변경사항을 추적합니다. 따라서,

- `onNext: (T) -> Unit`  : 변경사항을 추적하고 방출합니다.
- `onError: (Throwable) -> Unit` : 에러가 발생 시 Throwable 인스턴스를 넘겨줍니다.
- `onComplete: () -> Unit` : 모든 데이터가 푸시가 완료되면 호출되는 함수입니다.

가장 기본적인 `Observable` 인스턴스 사용법을 알아보았습니다. 이미 익숙한 과거 Iterator 인스턴스 사용법과 유사합니다.

## Reactive하게 과거 코드를 바꿔봅시다. 

```kotlin
fun main(args: Array<String>) {
    var number = 4
    var isEven = isEven(number)
    println("The number is" + (if (isEven) "Even" else "Odd"))
    number = 9
    println("The number is" + (if (isEven) "Even" else "Odd"))
}

fun isEven(n: Int): Boolean = (n % 2 == 0)
```

과거 저희가 짝수와 홀수를 구분하기 위한 간단한 프로그램을 구현했는데, 이를 리액티브하게 바꿔보겠습니다.

```kotlin
fun main(args: Array<String>) {
    val subject: Subject<Int> = PublishSubject.create()

    subject.map { isEven(it) }
            .subscribe {
                println("The number is ${(if (it) "Even" else "Odd")}" )
            }

    subject.onNext(4)
    subject.onNext(9)
}
fun isEven(n: Int): Boolean = (n % 2 == 0)
```

결과는 다음과 같습니다.

> The number is Even
>
> The number is Odd

변환한 코드를 보면 `map(Function<? super T, ? extends R>):Observable<R>` 함수를 사용하였는데, 후에 설명하겠지만 해당 함수를 통해 `isEven(Int):Boolean`에 인자로 푸시된 값을 차례로 받아 가공하는 과정을 거칩니다.

`subject.onNext(@NonNull T)` 메서드는 새로운 값을 받아 `subject`로 전달해 처리할 수 있습니다.

[>> 다음 포스트 1-03.RxKotlin을 활용하여 계산기 프로그램 만들기](https://soda1127.github.io/reactive-calculator-project/)