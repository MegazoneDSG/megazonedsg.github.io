---
layout: post
title: "2-00.RxKotlin을 사용한 함수형 프로그래밍"
description: 더 발전된 방식으로 RxKotlin을 이용하여 리액티브 프로그래밍을 해봅시다.
image: 'https://i.imgur.com/pr6E1OC.jpg'
category: 'programming'
date: 2019-06-11 19:00:00
tags:
- kotlin
- ReactiveX
- Reactive Programming
introduction: RxKotlin이 무엇인지, RxKotlin은 어떤 기능을 제공하는지 알아봅니다.
twitter_text: RxKotlin이 무엇인지, RxKotlin은 어떤 기능을 제공하는지 알아봅니다.
---

# 2-00.RxKotlin을 사용한 함수형 프로그래밍 - 1

당연한 이야기 겠지만, 함수형 프로그래밍 패러다임은 객체지향 프로그래밍과 약간 상이합니다.

함수형 프로그래밍은 선언적이고, `Representive`표현적이며, 선언적이기보단 `Immutable`불변의 데이터를 사용하는 경우가 더 큽니다.

함수형 프로그래밍의 정의는 다음과 같습니다.

> 불변의 데이터를 사용한 수학적인 함수의 평가를 통해 프로그램을 구조화 하는 동시에 상태변화를 방지한다.

2장에서 다루는 내용은 다음과 같습니다.

- 함수형 프로그래밍 시작하기
- 리액티브 프로그래밍과 함수형 프로그래밍간의 관계
- 코틀린의 혁신적인 기능인 `Coroutines`코루틴



## 함수형 프로그래밍 소개

함수형 프로그래밍은 프로그래밍 로직을 작고 재사용 가능하며 선언적인 순수한 기능의 조각으로 나누는것을 지향합니다. 논리를 작은 코드로 분산시키면 쉽게 모듈화가 가능하고 단순해지기 때문에 다른 모듈에 영향을 끼치지 않고 특정 코드의 일부 또는 모든 부분을 리팩토링하거나 변경하기 용이합니다.

다음은 가장 많이 사용되는 함수형 프로그래밍 언어의 목록입니다.

- `Lisp`리스프
- `Clojure`클로저
- `Wolfram`올프램
- `Erlang`얼랭
- `Ocaml`오캐멀
- `Haskell`헤스켈
- `Scala`스칼라
- F#

이 중 코틀린은 8버전에서 함수형 프로그래밍을 지원했던 `Java`자바와는 대조적으로 첫 Stable 릴리즈에서 함수형 프로그래밍에 대한 지원을 합니다. 코틀린은 객체지향 및 함수형 프로그래밍 스타일 모두 사용 가능하며, 이 두가지를 사용할 수 있는 덕분에 큰 도움이 됩니다.

코틀린은 `Higher Order Function`고차함수, 람다와 같은 함수유형의 퍼스트 클래스 지원을 통해 함수형 프로그래밍에 대해 알아보거나 구현할 경우 훌륭한 선택지라고 볼 수 있습니다.



`FPR(Functional Reacrive Programming)`함수형 리액티브 프로그래밍의 개념은 실제로 리액티브 프로그래밍과 함수형 프로그래밍을 혼합한 개념으로, 주요목적은 클린 코드를 지향하며, 쉽게 모듈화가 가능한 프로그램을 구현하는 것입니다. 모듈화된 프로그램은 리액티브 프로그래밍을 구현하거나 필요에 따라 리액티브 선언문의 원칙을 지켜야 합니다.



## 함수형 프로그래밍의 기초

### 람다

람다는 일반적으로 이름이 없는 익명함수를 의미합니다. 람다식은 함수라고 말할 수 있으나, 모든 함수가 람다식인것은 아닙니다. 예를들어 자바는 리액티브 프로그래밍 라이브러리를 통해 `SAM(Single Abstact Method)`단일 추상 메서드 방식으로 함수 구현이 가능했습니다. 그 이후 자바 8버전 이후로는 람다식으로 표현이 가능해졌습니다.

코틀린은 람다 표현을 잘 지원하고, 매우 쉽고 자연스럽습니다.

```kotlin
fun main(args: Array<String>) {
    val sum = { x: Int, y: Int -> x + y } // (1)
    println("Sum ${sum(12,14)}")// (2)
    val anonymousMult = {x: Int -> (Random().nextInt(15)+1) * x}// (3)
    println("random output ${anonymousMult(2)}")// (4)
}
```

위 예시의 주석(1)에서는 x, y 인자를 받아 결과의 합을 반환하는 람다식을 선언합니다. 주석(2)에서 출력 때 sum(x, y)함수를 통해 합 26을 반환하는 것을 알 수 있습니다.

주석(3)에서는 x인자를 받아 랜덤으로15까지 제한된 난수를 전달된 x와 곱한 후 반환하는 람다식을 선업합니다. 주석(4)에서 2라는 값을 넣어 2 X 난수라는 값을 반환하는 것을 알 수 있습니다.

### 순수 함수

함수의 반환 값이 인수/매개 변수에 전적으로 의존하면 이 함수를 순수 함수라고 합니다. 그래서 `fun func1(x : Int) : Int`를 선언하면, 그 반환값은 인수 x에 전적으로 의존합니다. 이전 예시의 첫 람다식은 순수 함수였지만, 아래와 같은 예시의 경우 반환값은 동일한 값이 전달된 경우에도 달라질 수 있습니다.

```kotlin
fun square(n:Int):Int {//(1)
    return n*n
}

fun main(args: Array<String>) {
    println("named pure func square = ${square(3)}")
    val qube = {n:Int -> n*n*n}//(2)
    println("lambda pure func qube = ${qube(3)}")
}
```

주석 (1), (2) 모두 순수 함수로서 하나는 이름이 있는 함수, 나머지는 람다식입니다. 값 3을 어떤 함수에 n번 전달하면 매번 동일한 값이 반복되어 출력되기때문에, 순수함수에서는 `Side Effect`부작용이 없습니다.

### 고차 함수

함수를 인자로 받아들이거나 반환하는 함수를 `High-Order-Function`고차 함수라고 부릅니다.

```kotlin
fun Int.isEven():Boolean = ((this % 2) == 0)

fun highOrderFunc(a:Int, validityCheckFunc:(a:Int)->Boolean) {//(1)
    if(validityCheckFunc(a)) {//(2)
        println("a $a is Valid")
    } else {
        println("a $a is Invalid")
    }
}

fun main(args: Array<String>) {
    highOrderFunc(12) { a:Int -> a.isEven()}//(3)
    highOrderFunc(19) { a:Int -> a.isEven()}
}
```

위 예제에서는 코틀린의 확장 함수 기능을 이용해 Int를 받아 짝수인지 홀수인지 체크하는 `Int.Even():Boolean` 함수를 사용하였고, `highOrderFunc(Int, (Int)->Boolean)` 함수로 내부에서 `validityCheckFunc` 함수를 호출하여 인자를 받아 홀수인지 짝수인지 값이 유효한지 검증하여 출력합니다. 결과는 다음과 같습니다.

> a 12 is Valid
>
> a 19 is Invalid

### 인라인 함수

함수는 이식가능한 코드를 작성하는 것이 좋은 방법이나, 함수의 스택 유지 관리 및 오버헤드 발생으로 실행시간이 늘어나고, 메모리 사용에 있어 최적화되지 않을 수 있습니다. 이러한 부분에 있어 인라인 함수는 함수형 프로그래밍에서 좋은 방법입니다.

인라인 함수를 시용시 좀 더 와닿게 설명해주는 포스팅 글로는 해리의 유목코딩글의 [[kotlin] inline, noinline 한번에 이해하기](https://medium.com/harrythegreat/kotlin-inline-noinline-한번에-이해하기-1d54ff34151c)를 먼저 보시는 것을 추천드립니다.

`Inline-Function`인라인 함수는 프로그램의 성능 및 메모리 최적화를 향상시키는 기능입니다. 함수 정의를 호출시 인라인으로 대체할 수 있도록 컴파일러가 지시할 수 있기때문에 함수 호출, 스택 유지 보수를 위해 많은 메모리를 필요로 하지 않으며, 동시에 함수의 장점도 얻을 수 있습니다.

```kotlin
inline fun doSomeStuff(a:Int = 0) = a+(a*a)

fun main(args: Array<String>) {
    for (i in 1..10) {
        println("$i Output ${doSomeStuff(i)}")
    }
}
```

위 예시는 두 개의 숫자를 더하고 그 결과를 반환하는 함수를 선언하고 루프에서 함수를 호출합니다. 이를 위해 함수를 선언하지 않고, 함수가 호출되는 위치에 덧셈을 수행하는 코드를 작성할 수 있습니다. 하지만, 함수로 선언하면 기존코드에 영향없이 로직 수정이 가능합니다. 물론 해당 `dpSomeStuff(Int)`함수에서는 인자의 타입이 함수가 아니므로 굳이 사용할 필요는 없습니다. 결과는 다음과 같습니다.

> 1 Output 2
> 2 Output 6
> 3 Output 12
> 4 Output 20
> 5 Output 30
> 6 Output 42
> 7 Output 56
> 8 Output 72
> 9 Output 90
> 10 Output 110

그럼 이번에는 고차 함수를 사용하는 코드를 인라인 방식으로 바꿔보겠습니다.

```kotlin
inline fun highOrderFuncInline(a:Int, validityCheckFunc:(a:Int)->Boolean) {//(1)
    if(validityCheckFunc(a)) {//(2)
        println("a $a is Valid")
    } else {
        println("a $a is Invalid")
    }
}

fun main(args: Array<String>) {
    highOrderFuncInline(12) { a:Int -> a.isEven()}//(3)
    highOrderFuncInline(19) { a:Int -> a.isEven()}
}
```

컴파일러는 `highOrderFuncInline` 함수의 정의에 따라 모든 함수호출을 람다로 대체합니다. 결론적으로 고차함수 사용 시 성능향상을 볼 수 있게됩니다.



다음 포스트는 지난번에 만든 계산기 프로그램을 좀 더 함수형 프로그래밍 방식에 가깝게 적용해보도록 하겠습니다.

[>> 다음 포스트 2-01.발전된 방식으로 리액티브하게 계산기 프로그램 만들기-1](https://soda1127.github.io/reactive-calculator-project-2-1/)

