---
layout: post
author: soda1127
title: "2-02.발전된 방식으로 리액티브하게 계산기 프로그램 만들기2"
description: 코루틴을 이용하여 계산기 프로그램을 만들어 봅시다.
image: 'https://i.imgur.com/QfID9Fe.png'
category: 'programming'
date: 2019-06-18 00:30:00
tags:
- kotlin
- ReactiveX
- Reactive Programming
introduction: Reactive Caclator 클래스에 개선된 함수형 프로그래밍을 적용 해봅시다.
twitter_text: Reactive Caclator 클래스에 개선된 함수형 프로그래밍을 적용 해봅시다.
---

# 2-02.발전된 방식으로 리액티브하게 계산기 프로그램 만들기2

## 코루틴 시작하기

설명에 앞서 코드를 함께 봅시다. 다음은 2초 대기 후 시간이 얼마나 소요되었는지 출력하는 예제입니다.

```kotlin
suspend fun longRunningTsk():Long {//(1)
    val time = measureTimeMillis {//(2)
        println("Please wait")
        delay(2,TimeUnit.SECONDS)//(3)
        println("Delay Over")
    }
    return time
}

fun main(args: Array<String>) {
    runBlocking {//(4)
        val exeTime = longRunningTsk()//(5)
        println("Execution Time is $exeTime")
    }
}
```

주석 (1)에서는 `suspend`라는 키워드를 사용하여 함수를 일시 중지 한다는 선언을 하였습니다. 즉, 함수를 호출 시 프로그램은 결과를 기다려야 하고, **메인스레드**를 중지하는 것은 허용되지 않습니다.

`suspend` 키워드는 코루틴을 정의할 수 있는 키워드입니다.



주석 (2), (3)에서는 시간을 측정 후 의도적으로 2초라는 시간을 지연시킨 후 결과를 반환합니다.

주석 (4) `main` 메서드에서는 주석 (5)의 `longRunningTsk()` 함수가 호출 된 후 완료되기까지 프로그램을 대기 상태로 구성합니다.

이후 실행된 시간에 대해 출력을 하게 됩니다. 결과는 다음과 같습니다.

> Please wait
>
> Delay Over
>
> Execution Time is 2037

해당 코드의 문제는 대기시간이 메인스레드에서 동작하게 되어 안드로이드와 같은 플랫폼의 경우 메인스레드가 곧 UI스레드이기 때문에 문제가 될 수 있는 사항입니다. 따라서, 비동기 작업이 필요합니다.

```kotlin
fun main(args: Array<String>) {
    val time = async(CommonPool) { longRunningTsk() }
    println("Print after async ")
    runBlocking { println("printing time ${time.await()}") }
}
```

코드를 비동기적이게 바꿔 보았습니다. 여기서 추가된 키워드는 `async`인데, 코루틴 `Context`컨텍스트에서 비동기적으로 블록안에 있는 코드를 수행합니다.

결과는 다음과 같습니다.

> Print after async 
>
> Please wait
>
> Delay Over
>
> printing time 2042



## 시퀀스 생성하기

이전 포스트에서 언급했지만, 코틀린의 코루틴은 자바의 스레드나 C# `async/await` 보다 뛰어난 부분을 갖고 있습니다. 굉장히 단순하고 편리하며, 해당 기능을 실무에 바로 적용할만큼의 수준이라는 것입니다. 또한, 어느 라이브러리를 사용하지 않고도 명시적으로 사용할 수 있다는 특징도 큰 장점입니다.

간단한 예로 피보나치 수열에 대한 코드로 비교를 해보곘습니다.

```kotlin
fun main(args: Array<String>) {
    var a = 0
    var b = 1
    print("$a, ")
    print("$b, ")

    for(i in 2..9) {
        val c = a+b
        print("$c, ")
        a=b
        b=c
    }
}
```

코틀린으로 작성한 루프형태의 피보나치 수열입니다. 해당 코드는 입력값을 미리 선언을 해 두었기 때문에 문제가 없지만, 출력할 수를 사용자에게 받을 시 문제가 생길 수 있습니다. 해당 문제를 코루틴의 시퀀스를 통해 해결할 수 있습니다.

아래는 코루틴의 시퀀스를 이용하여 출력할 값을 계산 후,  `Sequence<Int>.joinToString()`을 `infix` 키워드를 통해 확장함수로 쉼표에 붙여주었습니다.

```kotlin
fun main(args: Array<String>) {
    val fibonacciSeries = buildSequence {
        var a = 0
        var b = 1
        yield(a)
        yield(b)

        while (true) {
            val c = a+b
            yield(c)
            a=b
            b=c
        }
    }

    println(fibonacciSeries.take(10) join ", ")
}

infix fun Sequence<Int>.join(str : String) : String {
    return this.joinToString(str)
}
```

두 코드의 결과는 같게 나오게 됩니다.

> 0, 1, 1, 2, 3, 5, 8, 13, 21, 34

## 코루틴을 사용하여 ReactiveCalculator를 리액티브하게 바꿔봅시다.

이전에 만들어 본 ReactiveCalculator 프로그램은 동일 스레드에서 모든 계산을 처리했기 때문에 이번에는 비동기적으로 바꿔보도록 하겠습니다.

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

    suspend fun handleInput(inputLine:String?) {//(1)
        if(!inputLine.equals("exit")) {
            val pattern: java.util.regex.Pattern = java.util.regex.Pattern.compile("([a|b])(?:\\s)?=(?:\\s)?(\\d*)");

            var a: Int? = null
            var b: Int? = null

            val matcher: java.util.regex.Matcher = pattern.matcher(inputLine)

            if (matcher.matches() && matcher.group(1) != null && matcher.group(2) != null) {
                if(matcher.group(1).toLowerCase().equals("a")){
                    a = matcher.group(2).toInt()
                } else if(matcher.group(1).toLowerCase().equals("b")){
                    b = matcher.group(2).toInt()
                }
            }

            when {
                a != null && b != null -> modifyNumbers(a, b)
                a != null -> modifyNumbers(a = a)
                b != null -> modifyNumbers(b = b)
                else -> println("Invalid Input")
            }
        }
    }

}

fun main(args: Array<String>) {
    println("Initial Out put with a = 15, b = 10")
    val calculator: ReactiveCalculator = ReactiveCalculator(15, 10)

    println("Enter a = <number> or b = <number> in separate lines\nexit to exit the program")
    var line:String?
    do {
        line = readLine()
        async(CommonPool) {//(2)
            calculator.handleInput(line)
        }
    } while (line!= null && !line.toLowerCase().contains("exit"))
}
```

이전 계산기 프로그램과 달라진것은 코루틴의 `suspend` 키워드와 `async` 함수를 통해 `calculator.handleInput(String)` 메서들르 호출하는 컨텍스트가 실행되면 완료될때까지 기다린다는 것 입니다.



다음 포스트는 함수형 프로그래밍의 꽃 `monad`를 알아보고, 어떤 식으로 활용하는지 알아보도록 하겠습니다.

[>>다음 포스트 2-03.함수형 프로그래밍 - 모나드](https://soda1127.github.io/functional-programing-monad/)

