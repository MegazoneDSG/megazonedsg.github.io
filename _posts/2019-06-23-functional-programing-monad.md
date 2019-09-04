---
layout: post
author: soda1127
title: "2-03.함수형 프로그래밍 - 모나드"
description: 함수형 프로그래밍을 완벽하게 만드는 모나드의 개념을 알아봅시다.
image: 'https://i.imgur.com/D4HzDvF.png'
category: 'programming'
date: 2019-06-24 00:05:00
tags:
- kotlin
- ReactiveX
- Reactive Programming
introduction: 함수형 프로그래밍을 완벽하게 만드는 모나드의 개념을 알아봅시다.
twitter_text: 함수형 프로그래밍을 완벽하게 만드는 모나드의 개념을 알아봅시다.
---

# 2-03.함수형 프로그래밍의 꽃 - `monad`모나드

우선 함수형 프로그래밍은 들어본 사람이 많겠지만, 공부하면서 대부분의 개발자들은 `monad`모나드라는 용어를 들어보기가 흔치 않았을 것입니다. 

특히, 함수형 프로그래밍언어인 스칼라나 하스켈을 접해보지 않은 개발자들이라면, 모나드가 어떤 의미인지 모르고 리액티브 프로그래밍을 접할 가능성이 큽니다. 그러면 모나드란, 무엇을 의미할까요?



## `monad`모나드를 이해하기 앞서..

![하스켈의 러닝커브](https://i.imgur.com/7eL89gx.png)



위 이미지는 하스켈이라는 순수 함수 언어를 공부할 때 러닝커브를 보여줍니다. 하스켈의 경우 모나드를 이해하기 전후로 생산성이 확연하게 차이가 나는것을 볼 수 있습니다. 그만큼 함수형 프로그래밍을 함에 있어 중요하고, 활용성이 뛰어나다는 것을 알 수 있습니다.

모나드의 정의에 따르면, '모나드는 값을 캡슐화하고, 추가 기능을 더해 새로운 타입을 생성하는 구조체'라고 설명이 되어 있습니다. 글을 읽기만 하면 이해할 수 없으니 그림과 코드를 함께 보면서 이해 해 보도록 합시다.



## 그림으로 표현하자면..

![그림으로 표현한 모나드](https://i.imgur.com/d5Y9CQv.png)

모나드는 하나의 타입이며, 인자를 `Type` 타입으로 받아(Java와 C++의 제너릭을 생각하시면 됩니다.) 값을 캡슐화하여 값을 가공할 수 있는 추가기능(일반적으로 map이라 부릅니다) 오퍼레이터를 사용할 수 있는 `Functor` 를 사용하여 최종적으로 이러한 프로세스를 구현하는 구조를 새롭게 생성하는 특징을 가집니다.

좀 더 쉽게 설명하자면, 프로그래밍적으로 다음 세가지를 충족하면 모나드라고 부를 수 있습니다.

> 1. 타입을 인자로 받는 타입이다.
> 2. unit(return) operator가 있어야 한다.
>    1. 다시말해, T타입 인자를 받는 방식이라면 반환 시 M<T>를 반환 해야 합니다. 하스켈에서는 이를 return operator라고 부릅니다.
> 3. bind operator가 있어야 한다.
>    1. 이 함수는 M<T> 타입의 모나드가 있을 때, T 타입의 변수를 받아 M<U> 타입의 모나드를 반환하는 함수를 받아서, M<U> 타입의 값을 반환하는 함수다. 즉, 이 함수를 통해 다른 모나드로 변환하여 사용이 가능해야 합니다.

아직까지는 설명으로만 이해하기에 어려움이 있기때문에, 실제 프로그래밍 코드에서는 어떤식으로 활용할 수 있는지 같이 보도록 하겠습니다,

## Let's see the Code

```kotlin
val maybeValue: Maybe<Int> = Maybe.just(14)//(1)
maybeValue.subscribeBy(//(2)
  onComplete = {println("Completed Empty")},
  onError = {println("Error $it")},
  onSuccess = { println("Completed with value $it")}
)
val maybeEmpty:Maybe<Int> = Maybe.empty()//(3)
maybeEmpty.subscribeBy(//(4)
  onComplete = {println("Completed Empty")},
  onError = {println("Error $it")},
  onSuccess = { println("Completed with value $it")}
)
```

위 예제에서 보이는 타입 중 `Maybe`라는 타입을 보니 제너릭으로 안에 타입이 감싸져 있는 것을 볼 수 있습니다. Int타입을 캡슐화 하였고, 이를 통해 여러가지 기능을 제공합니다. 

모다드인  `Maybe`는 값을 포함할 수도, 포함하지 않을수도 있는 타입이며, 방출된 결과 값, 혹은 오류에 상관없이 완료가 됩니다. `Maybe`는 총 세가지의 터미널 메서드를 가지고 있는데, 오류가 발생 시 `onError` 함수가 호출이 되어 이에 대한 구현 처리를 하게됩니다. 또는 성공시에는 `onSucess` 함수가 호출이되어 성공에 대한 구현 처리를 하게됩니다. 값도 없고, 오류도 없는 경우엔 최종적으로 완료하여 `onComplete` 함수를 호출하게 됩니다. 

먼저 주석(1)에서는 모나드를 선언하고, 14라는 값을 주입(할당)합니다. 주석(2)에서는 `subscribeBy` 함수를 통해 구독을 시작하게 됩니다. 그리고 해당 구독에 대한 터미널 메서드로 각 상황에 맞는 함수를 구현해주게 됩니다.

주석(3)에서는 빈값으로 선언을 하였습니다. 빈값에 대한 구독이기 때문에 주석(4)로 구독 시 바로 완료처리가 될 것입니다.

다음은 결과입니다.

> Completed with value 14
>
> Completed Empty

## 단일 모나드

모다드인  `Maybe`는 단순히 모나드의 한 유형인데, 이외에도 다수의 모나드가 존재합니다. 이후에 리액티브 프로그래밍을 다양하게 적용해보면서 여러 모나드를 결합해 보도록 하겠습니다



[>> 포스트 2-00.RxKotlin을 사용한 함수형 프로그래밍](https://soda1127.github.io/reactive-programming-with-rxkotlin)

[>> 포스트 2-01.발전된 방식으로 리액티브하게 계산기 프로그램 만들기1](https://soda1127.github.io/reactive-calculator-project-2-1/)

[>> 포스트 2-02.발전된 방식으로 리액티브하게 계산기 프로그램 만들기2](https://soda1127.github.io/reactive-calculator-project-2-2/)

[>> 포스트 3-00.옵저버블과 옵저버와 구독자](https://soda1127.github.io/observables-observers-subjects/)

