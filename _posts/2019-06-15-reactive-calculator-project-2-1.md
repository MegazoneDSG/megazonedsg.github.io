---
layout: post
title: "2-01.발전된 방식으로 리액티브하게 계산기 프로그램 만들기1"
description: 더 발전된 방식으로 RxKotlin과 코루틴을 이용하여 리액티브 프로그래밍을 해봅시다.
image: 'https://i.imgur.com/QfID9Fe.png'
category: 'programming'
date: 2019-06-15 15:00:00
tags:
- kotlin
- ReactiveX
- Reactive Programming
introduction: Reactive Caclator 클래스에 개선된 함수형 프로그래밍을 적용 해봅시다.
twitter_text: Reactive Caclator 클래스에 개선된 함수형 프로그래밍을 적용 해봅시다.
---

# 2-01.발전된 방식으로 리액티브하게 계산기 프로그램 만들기1

이번 시간에는 1장에서 함께 만들어본 `ReactiveCalculator` 클래스를 좀 더 리액티브한 방식으로 프로그래밍 해볼 수 있도록 함께 개선해 나가봅시다.

## 이전 코드 복습

```kotlin
init{
  nums = Pair(a,b)

  subjectAdd.map { it.first+it.second }.subscribe {println("Add = $it")}
  subjectSub.map { it.first-it.second }.subscribe {println("Substract = $it")}
  subjectMult.map { it.first*it.second }.subscribe {println("Multiply = $it")}
  subjectDiv.map { it.first/(it.second*1.0) }.subscribe {println("Divide = $it")}

  subjectCalc.subscribe {
    with(it) {
      calculateAddition()
      calculateSubstraction()
      calculateMultiplication()
      calculateDivision()
    }
  }

  subjectCalc.onNext(this)
}
```

위 코드는 `ReactiveCalculator` 클래스의 초기화  `init` 메서드입니다. 이제 함수형 프로그래밍의 지식을 갖췄으니, 저번 시간에 알게 된 `map` 메서드와 `subscribe` 메서드는 매개 변수를 함수로 취하는 **고차 함수**라는 것을 이해 하셨을 겁니다.

이제 코드를 수정하고 최적화 해봅시다.

## 코드를 개선하자

```kotlin
class ReactiveCalculator(a:Int, b:Int) {
    val subjectCalc: Subject<ReactiveCalculator> = PublishSubject.create()

    var nums:Pair<Int,Int> = Pair(0,0)

    init{
        nums = Pair(a,b)
        
        subjectCalc.subscribe {
            with(it) {
                calculateAddition()
                calculateSubstraction()
                calculateMultiplication()
                calculateDivision()
            }
        }

        subjectCalc.onNext(this)
    }
  ...
}
```

보시는 것과 같이 각 `Subject` 인스턴스에 매번 값을 생신할 때마다 `map` 메서드를 통해 계산 결과를 출력하는 코드가 사라진 것을 볼 수 있습니다.

```kotlin
inline fun calculateAddition():Int {
  val result = nums.first + nums.second
  println("Add = $result")
  return result
}

inline fun calculateSubstraction():Int {
  val result = nums.first - nums.second
  println("Substract = $result")
  return result
}

inline fun calculateMultiplication():Int {
  val result = nums.first * nums.second
  println("Multiply = $result")
  return result
}

inline fun calculateDivision():Double {
  val result = (nums.first*1.0) / (nums.second*1.0)
  println("Division = $result")
  return result
}


inline fun modifyNumbers (a:Int = nums.first, b: Int = nums.second) {
  nums = Pair(a,b)
  subjectCalc.onNext(this)
}
```

`map` 메서드를 사용하지 않고 `inline` 키워드를 통해 계산하는 함수를 바깥으로 빼내 성능 최적화에 초점을 맞춘 것을 볼 수 있습니다.

## `Coroutine`코루틴

코틀린의 가장 혁신적인 기능은 `Coroutine`코루틴 이라고 할 수 있습니다. 스레드와 같이 비동기식, 논-블로킹 코드를 작성함에 있어 새로운 방법이고 더 간단하고 효율적인 솔루션이라 할 수 있습니다.

이후에도 계속 RxKotlin의 스케쥴러를 활용한 리액티브 프로그래밍이 나오겠지만, 코루틴은 라이브러리가 아닌 언어 순수 지원으로, 어디서나 사용이 가능합니다.

코루틴과 Rx라이브러리의 스케쥴러는 동일한 방식이나, Rx에서 아직 도입하지 않은 이유는 나온지 얼마 안된 최신의 방식이기 때문입니다. 그렇기 떄문에, Rx를 사용하길 원하지 않는 개발자에게는 최적의 솔루션이기도 합니다.



코루틴을 추가하는 방법은 어렵지 않습니다. Gradle에서 다음과 같은 코드를 추가만 하면 끝납니다.

```groovy
apply plugin: 'kotlin'

kotlin {
    experimental {
        coroutines 'enable'
    }
}

repositories {
    ...
    jcenter()
}

dependencies {
  ...
  compile "org.jetbrains.kotlinx:kotlinx-coroutines-core:x.xx"
  ...
}
```

코루틴 의존성 추가의 경우 추후 코틀린 버전 1.3부터 공식적으로 Kotlin에 포함되어있어 별도의 라이브러리 추가 없이 사용이 가능합니다.

### 코루틴은 어떤 용도로 많이 사용될까요?

> 어플리케이션을 개발 시 네트워크, 데이터베이스 호출 또는 복잡한 계산의 경우 긴 시간과 많은 리소스가 사용됩니다. 자바의 경우 스레드를 사용하는 것인데, 사용하기 매우 복잡한 단점을 가집니다. 이를 해결하기 위한 강력한 API로서 사용되는 것입니다. 특히 C#개발자의 경우 `async/await` 연산자에 익숙한데, 특정부분에선 유사합니다,



다음 글에선 코루틴을 활용하여 계산기를 개선하기 앞서 간단한 예제를 살펴보고 넘어가도록 하겠습니다.

[>> 다음 포스트 2-02.발전된 방식으로 리액티브하게 계산기 프로그램 만들기-2](https://soda1127.github.io/reactive-calculator-project-2-2/)