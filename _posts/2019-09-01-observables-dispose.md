---
layout: post
author: soda1127
title: "3-01.옵저버블을 구독했을 때 해제하는 방법"
description: 옵저버블을 구독힌 이후 중지하는 방법에 대해 이해 해봅시다.
image: 'https://imgur.com/AIthrBr.png'
categories:
- programming
date: 2019-09-01 01:05:00
tags:
- kotlin
- ReactiveX
- Reactive Programming
introduction: 옵저버블을 구독힌 이후 중지하는 방법에 대해 이해 해봅시다.
twitter_text: 옵저버블을 구독힌 이후 중지하는 방법에 대해 이해 해봅시다.

---

# 3-01.옵저버블을 구독했을 때 해제하는 방법

앞의 글을 보면서 옵저버블 객체를 어떻게 생성하고, 구독자가 구독을 통해 데이터가 어떤 흐름으로 방출되는것을 받을 수 있는지 이해할 수 있는 시간을 가져보았습니다. 결론적으로는 구독의 개념을 이해하고, 사용할 수 있게 되었습니다.



그 이후 일정기간이 지나고 구독을 해지하려면 어떻게 해야할까요? 안드로이드 플랫폼에서 리액티브 프로그래밍을 하기위해서 사용하는 RxJava 라이브러리를 기준으로 생각을 해 보도록 하겠습니다.



RxJava를 사용한 프로그래밍 방식은 `Declaration Programming` 선언형 프로그래밍으로, 목표를 명시할 뿐, 알고리즘을 명시하지는 않습니다. 그래서, 자바를 통해 구현된 Rx라이브러리는 모든 옵저버, 컨수머, 디스포저 등이 인터페이스로 구성이 되어 있습니다.



![subscribe 함수 코드](https://i.imgur.com/ksDr9gd.png)



다음은 RxJava2에서 제공하는 `Observable` 클래스의 subscribe(...) 함수에 대한 도큐먼트입니다. 

옵저버블 인스턴스를 구독시 각 구현에 대한 처리를 선언하여 정의하게 됩니다. 이때, `Consumer`에 대한 역할은 말 그대로 구독하고 있는 데이터를 소비하는 형태를 지니며, 구독에 대한 액션이 완료되거나, 해제 하지 않는 이상 끝나지 않습니다. 곧 그 말은, 구독이 완료되어 데이터가 더 이상 발행이 되지 않는지 확인이 필요하다는 것을  의미합니다.



여기서 안드로이드의 경우 병렬처리 및 비동기적으로 연산을 수행하기 위해 RxJava의 여러 스케쥴링을 활용하여  스레드를 사용하게 되는데, 이때 구독에 대한 완료 또는 해지가 되지 않으면 쓰레드가 해제되지 않아 메모리상에 잔존하고, 결론적으로는 `Memory Leak` 메모리 누수 현상을 발생하게 되는 문제에 이르게 됩니다. 많은 개발자들이 RxJava 라이브러리를 활용 시 이에 대한 문제를 쉽게 인지하지 못하고 넘어가 뒤늦게 후회하는 경우가 많이 생기곤 합니다.



이를 위해 의도적으로 구독에 대한 해지를 통해 방지를 해주어야 하며, 그 역할로 구독을 해제하는 `Disposable.dispose()` 메서드가 있습니다.



## Disposable 인스턴스는 어떻게 만들어지는가?

이전 포스트에서 보았던 `onSubscribe()`메서드가 기억이 나시나요? 구독을 하는 동안, `subscribe` 연산자는 `Disposable` 인스턴스를 반환하는데, Observer 인스턴스를 전달 했을 시 `onSubscribe` 메서드에선 `Disposable` 인스턴슬르 반환 받을 수 있습니다. 다음예제를 보겠습니다.



```kotlin
fun main(args: Array<String>) {
    runBlocking {
        val observale:Observable<Long> = Observable.interval(100,TimeUnit.MILLISECONDS)//(1)
        val observer:Observer<Long> = object : Observer<Long> {

            lateinit var disposable:Disposable//2

            override fun onSubscribe(d: Disposable) {
                disposable = d//3
            }

            override fun onNext(item: Long) {
                println("Received $item")
                if(item>=10 && !disposable.isDisposed) {//4
                    disposable.dispose()//5
                    println("Disposed")
                }
            }

            override fun onError(e: Throwable) {
                println("Error ${e.message}")
            }

            override fun onComplete() {
                println("Complete")
            }

        }

        observale.subscribe(observer)
        delay(1500)//6
    }
}
```



`runBlocking()` 메서드는 코루틴에서 제공하는 메서드로, `delay()` 메서드를 사용해 1500ms를 기다리려고 합니다.   주석 (1)을 보면 100ms간 0부터 시작해 정수를 순차적으로 출력하는 코드를 볼 수 있습니다. 주석(4)에선 시퀀스가 10에 도달 한 후 10보다 크거나 같은지 비교한 뒤 구독이 완료되지 않거나 해제되지 않은 경우 구독 시 넘겨받은 `Disposable` 인스턴스로 해제하게 됩니다. 결과는 다음과 같습니다.



>Received 0
>Received 1
>Received 2
>Received 3
>Received 4
>Received 5
>Received 6
>Received 7
>Received 8
>Received 9
>Received 10
>Disposed
>
>Process finished with exit code 0



분명 500ms를 더 기다렸음에도 주석(5)의 `dispose()` 메서드가 호출 된 이후 아무런 정수도 출력되지 않았음을 볼 수 있습니다.



RxJava 라이브러에서 제공하는 Disposable 인터페이스의 정보입니다.

```java
/**
 * Represents a disposable resource.
 */
public interface Disposable {
    /**
     * Dispose the resource, the operation should be idempotent.
     * 리소스를 처리하며, 연산은 멱등성(연산을 여러번 적용하더라도 변하지 않는 성질)을 갖고 있어야 합니다.
     */
    void dispose();

    /**
     * Returns true if this resource has been disposed.
     * 리소스가 처리됐다면, true를 반환합니다.
     */
    boolean isDisposed();
}
```

다음장에선 옵저버블을 크게 두 종류로 나누는 `Hot Observable`과 `Cold Observable`에 대해 이야기를 나눠 보도록 하겠습니다.







