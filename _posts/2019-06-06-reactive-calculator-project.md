---
layout: post
author: soda1127
title: "1-03.RxKotlin으로 계산기 프로그램 만들기. 그리고 정리"
description: RxKotlin으로 계산기 프로그램 만들어봅니다. 그리고 리액티브 프로그래밍이 무엇인지 정리해봅니다.
image: 'https://i.imgur.com/QfID9Fe.png'
categories:
- programming
date: 2019-06-06 21:00:00
tags:
- kotlin
- ReactiveX
- Reactive Programming
introduction: RxKotlin으로 계산기 프로그램 만들어봅니다. 그리고 리액티브 프로그래밍이 무엇인지 정리해봅니다.
twitter_text: RxKotlin으로 계산기 프로그램 만들어봅니다. 그리고 리액티브 프로그래밍이 무엇인지 정리해봅니다.
---

# 1-03.RxKotlin을 활용하여 계산기 프로그램 만들기

저번 포스트에 이어서 리액티브 프로그래밍의 기초를 활용하여 단순 로직인 계산기 프로그램을 만들어 보도록 하겠습니다. 사용자 입력 이벤트 부터 시작하겠습니다.

```kotlin
fun main(args: Array<String>) {
    println("Initial Out put with a = 15, b = 10")
    val calculator = ReactiveCalculator(15, 10)

    println("Enter a = <number> or b = <number> in separate lines\nexit to exit the program")
    var line:String?
    do {
        line = readLine();
        calculator.handleInput(line)
    } while (line!= null && !line.toLowerCase().contains("exit"))
}
```

`main(Array<String>)` 메서드에선 사용자의 입력을 기다리고 있다가 받은 순간 입력 값을 `ReactiveCalculator` 클래스에 넘겨주고 있습니다. 그리고 해당 클래스에서 기존의 풀 매커니즘 방식이 아닌 푸시 매커니즘으로 리액티브하게 로직이 구성 될 것입니다.

```kotlin
class ReactiveCalculator(a:Int, b:Int) {
    private val subjectAdd: Subject<Pair<Int, Int>> = PublishSubject.create()
    private val subjectSub: Subject<Pair<Int, Int>> = PublishSubject.create()
    private val subjectMult: Subject<Pair<Int, Int>> =PublishSubject.create()
    private val subjectDiv: Subject<Pair<Int, Int>> = PublishSubject.create()

    private val subjectCalc: Subject<ReactiveCalculator> = PublishSubject.create()

    private var nums:Pair<Int,Int> = Pair(0,0)
    ...
}
```

`ReactiveCalculator` 클래스입니다. 인스턴스 생성 시 a와 b라는 인자를 받아 `nums` 변수에 인스턴스를 초기화 합니다. 그리고 `Subject` 클래스를 각 연산 별 쌍에 대한 값이 갱신됐을 때 옵저버블하게 값을 방출하기 위해 사용합니다.

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

생성자 호출 시 초기화하는 함수입니다. `nums` 변수에서 받은 각 쌍의 값을 `map((T) -> R)`(내부에 Function 인터페이스가 들어갔을 시 앞으로 단축하여 정리하겠습니다.) 받아 가공처리를 하게됩니다. 어떤 유형이든 결과 값으로 산출이 가능하며, 구독자를 통해 추가 처리가 가능하고, 결과를 출력하게 됩니다.

그리고, `subjectCalc` 인스턴스를 구독하여 매번 클래스 생성 시 `onNext(@NonNull T)`로 자기 자신의 인스턴스를 넘겨 `<T, R> with(receiver: T, block: T.() -> R): R` 메서드를 통해 해당 글래스의 계산 함수를 호출하게 됩니다.

> ### 여기서 `it` 키워드는 무엇일까요?
>
> 아마 예제 코틀린코드를 보시면서 궁금해 하셨을 키워드 중 하나라고 생각이 듭니다. `it` 키워드는 코틀린의 **Lambda Expression**식에서 코드 간결성을 위해 받은 인자값이 한개여서 유추할 수 있는 경우 `it` 키워드로 대체하여 작성할 수 있습니다. 하지만, 어떤 의도로 인자값을 넘기는지 명확하지 않을 수 있어 개발자의 의도에 따라 사용하길 권장합니다.



전체 소스코드입니다.

```kotlin
class ReactiveCalculator(a:Int, b:Int) {
    private val subjectAdd: Subject<Pair<Int, Int>> = PublishSubject.create()
    private val subjectSub: Subject<Pair<Int, Int>> = PublishSubject.create()
    private val subjectMult: Subject<Pair<Int, Int>> =PublishSubject.create()
    private val subjectDiv: Subject<Pair<Int, Int>> = PublishSubject.create()

    private val subjectCalc: Subject<ReactiveCalculator> = PublishSubject.create()

    private var nums:Pair<Int,Int> = Pair(0,0)

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


    private fun calculateAddition() {
        subjectAdd.onNext(nums)
    }

    private fun calculateSubstraction() {
        subjectSub.onNext(nums)
    }

    private fun calculateMultiplication() {
        subjectMult.onNext(nums)
    }

    private fun calculateDivision() {
        subjectDiv.onNext(nums)
    }

    private fun modifyNumbers (a:Int = nums.first, b: Int = nums.second) {
        nums = Pair(a,b)
        subjectCalc.onNext(this)

    }

    fun handleInput(inputLine:String?) {
        if(!inputLine.equals("exit")) {
            val pattern: Pattern = Pattern.compile("([a|b])(?:\\s)?=(?:\\s)?(\\d*)");

            var a: Int? = null
            var b: Int? = null

            val matcher: java.util.regex.Matcher = pattern.matcher(inputLine)

            if (matcher.matches() && matcher.group(1) != null && matcher.group(2) != null) {
                if(matcher.group(1).toLowerCase() == "a"){
                    a = matcher.group(2).toInt()
                } else if(matcher.group(1).toLowerCase() == "b"){
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
    val calculator = ReactiveCalculator(15, 10)

    println("Enter a = <number> or b = <number> in separate lines\nexit to exit the program")
    var line:String?
    do {
        line = readLine()
        calculator.handleInput(line)
    } while (line!= null && !line.toLowerCase().contains("exit"))
}
```

결과적으로 다음과 같은 기능을 수행하게 됩니다.

> Initial Out put with a = 15, b = 10
>
> Add = 25
>
> Substract = 5
>
> Multiply = 150
>
> Divide = 1.5
>
> Enter a = <number> or b = <number> in separate lines
>
> exit to exit the program
>
> (사용자가 입력)a=8
>
> Add = 18
>
> Substract = -2
>
> Multiply = 80
>
> Divide = 0.8
>
> (사용자가 입력)b=4
>
> Add = 12
>
> Substract = 4
>
> Multiply = 32
>
> Divide = 2.0
>
> (사용자가 입력)exit
>
> Process finished with exit code 0

## 요약

이전 포스트까지의 정리로 1장에서는 리액티브 프로그래밍이 무엇이고, 코틀린과 함께 어떻게 쓰이고, 그에대한 예로 계산기 프로그램까지 만들어 볼 수 있었습니다.

또한, Rx 라이브러리를 활용하여 `Observable`과 그 사용법을 배웠고, `Subject`와 `map((T) -> R)` 메서드까지 알아보았습니다.

다음 2장에서는 `ReactiveCaclurator` 계산기 예제를 활용하여 프로그램을 최적화 하고 향상할 수 있는 방법에 대해서 알아보도록 하겠습니다.

[>> 포스트 1-00.REACTIVE PROGRAMMING IN KOTLIN](https://soda1127.github.io/flex-reactive-kotlin/)

[>> 포스트 1-01.리액티브 프로그래밍의 소개](https://soda1127.github.io/introduce-reactive-programming/)

[>> 포스트 1-02.RxKotlin 시작하기](https://soda1127.github.io/start-rx-kotlin/)

[>> 포스트 1-03.RxKotlin을 활용하여 계산기 프로그램 만들기](https://soda1127.github.io/reactive-calculator-project/)

[>>포스트 2-00.RxKotlin을 사용한 함수형 프로그래밍](https://soda1127.github.io/reactive-programming-with-rxkotlin)

