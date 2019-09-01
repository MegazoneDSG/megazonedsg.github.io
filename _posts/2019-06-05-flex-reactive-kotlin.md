---
layout: post
title: "1-00.코틀린을 리액티브하게 Flex하다"
description: REACTIVE PROGRAMMING IN KOTLIN
image: 'https://i.imgur.com/I8IKewN.png'
category: 'programming'
date: 2019-06-05 14:04:00
tags:
- kotlin
- ReactiveX
- Reactive Programming
introduction: 프로그래밍 업계를 떠들썩하게 하고 있는 코틀린과 리액티브 프로그래밍을 책으로써 풀어나가는 시작점입니다.
twitter_text: 프로그래밍 업계를 떠들썩하게 하고 있는 코틀린과 리액티브 프로그래밍을 책으로써 풀어나가는 시작점입니다.

---

## 1-00.REACTIVE PROGRAMMING IN KOTLIN

저 소다는 블로그의 첫 시작점을 최근에 많은 사람들이 관심을 두고 있고, 저 또한 큰 관심을 두고 있는 `Kotlin`과, `Reactive Programming`이라는 주제로 얘기를 하는 것이 좋겠다 생각했습니다.

그래서, 여러분들과 함께 코틀린이라는 언어가 무엇이고, 왜 현재 프로그래밍 동향에서 대두가 되고있고, 리액티브 프로그래밍 방식을 이용할때 어떤 장점이 있는지 이 책을 통해 저와 같이 공부해 나갈까합니다. (추후에는 더 많은 것을 주제로 공부해 나갈 계획입니다.)

## Kotlin이라는 언어는 무엇인가?

![kotin logo image](https://i.imgur.com/fBvJQRd.png)

아마 많은 분들이 들어보셨고, 현재 공부하고 계시겠지만, 워낙 최신의 프로그래밍 언어기때문에 한 번 짚고 넘어갈까 합니다.

코틀린은 JetBrains사에서 만든 JVM위에서 동작하는 프로그래밍 언어로, 2011년 7월에 세상에 첫 공개가 된 가장 최신의 언어 중 하나입니다.

또한, 자바와 100% 상호운용이 되는 프로그래밍 언어기때문에, 현재 안드로이드 앱 프로그래밍의 기반이 되는 자바를 대체할 차세대 프로그래밍 언어로써 사용되고 있습니다.

> (구글측에서는 Google I/O 2017에서 안드로이드 개발 공식언어로 추가하여, 적극적으로 밀고 있는 언어 중 하나입니다.)

또한, JVM 바이트코드외에도 Kotlin/Native 컴파일러를 사용하여 기계어로 최종컴파일이 가능하기때문에, 현재는 많은 플랫폼들이 개발할 수 있도록 코틀린을 지원하고 있습니다.

코틀린이 언어로써 매우 강력한 기능을 갖고 있는 것은 두말할 것도 없지만, 다음과 같은 특징이 있습니다.

**코틀린의 특징(나무위키 참고)**

- 장황했던 Java와 비교하면 눈물날 정도로 간결한 문법을 제공한다. 간결한 문법을 제공하면서도 런타임 오버헤드가 거의 없다.
- 오버헤드 없는 널 안전성을 제공한다. Kotlin의 변수는 Nullable(널 값 사용 가능)과 NotNull(널 값 사용 불가)로 나뉘는데, 변수 선언 시 '?'를 붙여 Nullable로 만들 수 있다. Swift에서도 유사한 기능을 쓰는데 Kotlin 쪽이 제약이 좀 덜해서 사용하기 편하다.
- 예외처리를 강제하지 않는다.
- 모든 함수가 리턴값을 가진다.
- Java의 'Integer'나 'Double'처럼 primitive type을 위한 별도의 wrapper class가 존재하지 않는다. 모든 primitive type은 객체 취급을 받는다. 따라서 Int 따위의 변수는 객체에 할당된 toString 함수 등을 바로바로 이용할 수 있다.
- 확장함수, 연산자 오버로딩을 지원한다.
  예를 들어 int형을 확장해 'i = 3 power 4' 같은 식으로 새 연산자를 만들 수 있다.
- API 문서에 Java의 HTML 대신 Markdown을 사용한다.
- == 연산자가 생각하는 대로 작동한다.
  Java에서는 String i와 String j가 같은 문자열을 담고 있어도 가리키는 객체의 메모리 주소는 다를 수 있으므로 i == j는 false가 될 수 있다. 이 경우 쓰는 함수가 equals()인데, Kotlin에서 ==는 equals()와 똑같이, 즉 content equality로 작동한다. 따라서 i == j는 true다. Java처럼 identity equality를 비교하려면 ===를 쓰면 된다. !=를 쓰려면 !==를 쓰자.
- static 메서드가 없다. companion object를 사용해 감싸야 한다. Java 코드에서 접근하려면 '클래스명.Companion.메서드_혹은_get변수명()' 또는 @JvmStatic annotation을 쓰면 된다.
- Java 6에 호환된다.
- **Java와의 상호 운용이 100% 지원된다.**

## 그래서 이 책으로 뭘 얻고 싶은데?

앞에서 언급했듯이, `Kotlin`과, `Reactive Programming`이라는 주제로 책을 소개하고 있습니다.

`Reactive Programming`은 사람이 현재 살고 있는 `세계`라는 존재와 매우 유사한 방식을 지닙니다. 세계의 모든 존재하는 것들은 일련의 `state` 상태를 항상 갖고 있습니다. 따라서, 하나가 바뀌었을 경우, 또다른 하나가 바뀌었을 수도 있고, 여러것들이 바뀔수도 있는 구조를 지니고 있습니다.

어플리케이션은 그러한 작은 세상을 대변하는 존재 중 하나입니다. 어플리케이션의 동적인 변화를 감지하고, 적용하는 데 있어 비동기성과 반응성을 매우 중요하며, 이를 해결할 수 있는 방법으로써 `Reactive Programming`을 추구하는 것입니다.

또한 사용함으로써 안정적이고 확장하기 쉽고 우수한 코드를 작성하는데 도움을 줄 수 있습니다. 그리고, 이를 위한 도구로써코틀린이라는 프로그래밍 언어는 제격입니다.

코틀린에 대한 기본적인 내용은 차차 연재 해 나가겠지만, 해당 주제에 대해서는 어느정도 코틀린 문법에 대해 이해를 하고 있다는 가정하에 내용을 진행하겠습니다.

**이 책에서 다루는 내용**

- 리액티브 프로그래밍 패러다임과 기존 프로젝트 향상 방법
- RxKotlin 2.0과 ReactiveX 프레임워크
- 안드로이드에서 RxKotlin 사용하기
- RxKotlin에서 사용자 지정 연산자 생성
- 코틀린과 스프링 프레임워크 5.0
- reactor-kotlin 확장
- 스프링, 하이버네이트, RxKotlin을 사용해 Rest API 작성
- TestSubscriber를 사용해 RxKotlin 애플리케이션 테스트
- 플로어블(Flowable)과 백프레셔 관리

#### [>> 다음 포스트 1-01.리액티브 프로그래밍의 소개](https://soda1127.github.io/introduce-reactive-programming/)