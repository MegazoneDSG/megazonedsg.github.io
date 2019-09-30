---
layout: post
author: byeongcheonmun
notification: true
title: "What is Javascript"
description: 자바스크립트에 대해서 알아보자.
image: https://user-images.githubusercontent.com/9576729/65842570-6957a900-e367-11e9-99b5-e33674d55794.jpg
categories:
- introduction
date: 2019-09-30 09:34:00
tags:
- javascript
- js

introduction: 자바스크립트에 대해서 알아보자.
---


>자바스크립트(영어: JavaScript)는 객체 기반의 스크립트 프로그래밍 언어이다. 이 언어는 웹 브라우저 내에서 주로 사용하며, 다른 응용 프로그램의 내장 객체에도 접근할 수 있는 기능을 가지고 있다. -wikipedia.org

이번 포스트에서 알아볼 내용은 Javascript 이다. 최근 가장 인기 있는 Web 언어 이며 다양한 기술들이 개발되고 있다. Web 이라는 개념이 처음 등장하고 Web Browser 라는 프로그램이 등장하면서 Javascript라는 언어가 등장하게 되었다.(1995년) 그 당시만 하더라도 Javascript 는 그저 Web Browser 에서 해석 가능한 마크업 언어 정도 였다. 할 수 있는 기능도 굉장히 한정적이 였다. (필자도 사용해 본 건 마우스 포인터를 바꾸거나 Web Page 에서 눈이 내리는 것 같은 효과 정도였다.)

그 후 ECMA-262 이라는 명세에 맞춰 표준 스크립트인 ECMA script 가 만들어 졌고 이것이 흔이 요즘 말하는 Javascript 라고 보면 된다. 1998년 ECMA-262 1st 부터 시작 하여 2017년 ECMA-262 8th가 개발되었다. 대부분은 ES6라고 알려진 2015년에 제정된 버전를 가장 많이 사용하고 있다.

Javascript의 발전 역사를 살펴 보자면
- Dynamic DOM (1997) 동적으로 웹의 구성요소인 DOM 을 다룰수 있게 되었다.
- XMLHttpRequest (1999) XML 형태의 요청과 응답이 가능해 졌다.
- JSON (2001)
- Ajax (2005) 비동기식 HTTP Request, response
- Jquery (2006) 
- Webkit (2007) 2003년 애플에 의해 소개된 HTML 엔진
- V8 Engine (2008) 
- Node.js (2009)

이후 AngularJS, React, Vue 등등 다양한 javascript 프레임 워크 들이 등장하게 되었다.
그럼 ES6 기준으로 Javascript 의 특징을 알아보자.

##### 1. 객체 기반의 언어
자바 스크립트는 모든 것이 객체이다. 변수도 객체고 함수도 객체이다. 아래 예제 코드를 보자.
```javascript
<script type="text/javascript">
    function Person(fullName, gender, age) {
        this.fullName = fullName;
        this.gender = gender;
        this.age = age;
    }
    var person1 = new Person('name1', 'man', 25);
    console.log(person1.fullName);
    console.log(person1.gender);
    console.log(person1.age);
}
</script>
```
persion 이라는 객체를 함수로 선언하였고 해당 함수는 각 변수를 가지고 있다. function 에 접근하는 변수에 직접 변수를 지정하여 접근할수 있다!. function 키워드를 이용하였다고 function이 아니라는 것이다. 자바스크립트에서는 함수도 객체이고, 배열도 객체이고 모든 것이 객체이다.

##### 2. 인터프리터 언어
![Compilervrsinterpreter](https://user-images.githubusercontent.com/9576729/65757497-37212e00-e152-11e9-89dd-7b481ceee01b.jpg)
인터프리터 방식이란 것은 위의 그림 처럼 컴파일 시에 소스 전체를 먼저 보는 것이 아니고 한줄 한줄 컴파일 하는 방식을 말합니다. 이런 인터프리터 언어는 프로그램 수정이 간단하다는 장점이 있습니다. 컴파일러는 소스 코드를 번역해서 실행 파일을 만들기 때문에 프로그램에 수정 사항이 발생하면 소스 코드를 다시 컴파일해야 하지만 프로그램이 작고 간단하면 문제가 없지만 프로그램 덩치가 커지면 컴파일이 시간 단위가 되는 일이 많아진다. 하지만 인터프리터는 소스 코드를 수정해서 실행시키면 끝. 이 장점 때문에 인터프리터 언어는 수정이 빈번히 발생하는 용도의 프로그래밍에서 많이 사용된다. 이 장점을 최대한 살려서 인터프리터를 적극적으로 채용한 것이 스크립트 언어이다.

##### 3. SCOPE

```javascript
<script type="text/javascript">
    var global_scope="global";
    function A(a_scope_param){
        var local_sope_a = "a";
        function B(){
            var local_scope_b = "b";
            function C(){
                var local_scope_c = "c";
            }
        }
    } //local_scope_a, local_scope_b, local_scope_c 의 유효범위
    //global_scope 의 유효범위
</script>
```
변수와 매개변수(parameter)의 접근성과 생존기간을 뜻합니다. 따라서 유효범위 개념을 잘 알고 있다면 변수와 매개변수의 접근성과 생존기간을 제어할 수 있습니다. 유효범위의 종류는 크게 두 가지가 있습니다. 하나는 전역 유효범위(Global Scope), 또 하나는 지역 유효범위(Local Scope)입니다. 전역 유효범위는 스크립트 전체에서 참조되는 것을 의미하는데, 말 그대로 스크립트 내 어느 곳에서든 참조됩니다. 지역 유효범위는 정의된 함 수 안에서만 참조되는 것을 의미하며, 함수 밖에서는 참조하지 못합니다. 다른 프로그래밍 언어들은 유효범위의 단위가 블록 단위이기 때문에 위의 코드와 같은 if문, for문 등 구문들이 사용되었을 때 중괄호 밖의 범위에서는 그 안의 변수를 사용할 수 없습니다. 하지만 JavaScript의 유효범위는 함수 단위이기 때문에 예제코드의 변수 a,b,c모두 같은 유효범위를 갖습니다. 다른 프로그래밍 언어의 경우 변수를 선언할 때 변수형을 쓰지 않을 경우 에러가 나지만 JavaScript는 var 키워드가 생략이 가능합니다. 단, var 키워드를 빼먹고 변수를 선언할 경우 전역 변수로 선언됩니다.

##### 4. Hoisting

Hoisting 이라는 단어의 의미는 끌어올리기, 올려 나르기 라는 뜻이며 Javascript 에서도 같은 의미로 사용 됩니다. 밑의 예제를 한번 보죠.

```javascript
<script type="text/javascript">
    function hoistingExam(){  
        var value;
        console.log("value="+value);
        value =10;
        console.log("value="+value);
    }
    hoistingExam();  
</script>
//실행결과
/*
value= undefined  
value= 10  
*/
```
위의 코드를 보면 value 라는 변수를 두번 호출 하는데 자바 같은 경우라면 초기화 되지 않은 변수라 첫번째 호출때 오류가 날것입니다. 하지만 Javascipt 에서는 호이스팅이 이루어 지면서 변수선언문이 유효범위 안의 제일 상단부에 되고 선언문이 있던 자리에서 초기화가 이루어 지기 때문에 오류가 나지 않습니다. 이상하죠?
이상한거 하나 더 준비 했습니다.

```javascript
<script type="text/javascript">
    var value=30;  
    function hoistingExam(){  
        console.log("value="+value); 
        var value =10; 
        console.log("value="+value); 
    }
    hoistingExam();  
    //실행결과 
    /* 
    value= undefined  
    value= 10  
    */
</script>
```
다른 프로그래밍 언어에 익숙한 개발자 분들은 변수 value의 첫 호출에서 전역변수가 참조된다고 생각하실 수 있습니다. 하지만 JavaScript의 호이스팅으로 인해서 선언 부가 함수 hoistingExam의 최 상단에서 끌어올려 짐으로써 전역변수가 아닌 지역변수를 참조합니다. 이상하군요.

##### 5. Closure
클로저는 JavaScript의 유효범위 체인 (Scope) 을 이용하여 이미 생명 주기가 끝난 외부 함수의 변수를 참조하는 방법입니다. 외부 함수가 종료되더라도 내부함수가 실행되는 상태면 내부함수에서 참조하는 외부함수는 닫히지 못하고 내부함수에 의해서 닫히게 되어 클로저라 불리 웁니다. 따라서 클로저란 외부에서 내부 변수에 접근할 수 있도록 하는 함수입니다.
내부 변수는 하나의 클로저에만 종속될 필요는 없으며 외부 함수가 실행 될 때마다 새로운 유효범위 체인과 새로운 내부 변수를 생성합니다. 또, 클로저가 참조하는 내부 변수는 실제 내부 변수의 복사본이 아닌 그 내부 변수를 직접 참조합니다. 예제를 한번 봅시다.
```javascript
<script type="text/javascript">
    function outerFunc(){  
        var a= 0;
        return {
            innerFunc1 : function(){
                a+=1;
                console.log("a :"+a);
            },
            innerFunc2 : function(){
                a+=2;
                console.log("a :"+a);
            }
        };
    }
    var out = outerFunc();  
    out.innerFunc1();  
    out.innerFunc2();  
    out.innerFunc2();  
    out.innerFunc1();
</script>
//실행결과
/*
a = 1  
a = 3  
a = 5  
a = 6  
*/
```
서로 다른 클로저 innerFunc1과 innerFunc2가 내부 변수 a를 참조하고 a의 값을 바꿔주고 있습니다. 실행 결과를 보면 내부 변수 a의 메모리를 같이 공유한다는 것을 알 수 있습니다. 클로저를 사용하게 되면 전역변수의 오,남용이 없는 깔끔한 스크립트를 작성 할 수 있습니다. 같은 변수를 사용하고자 할 때 전역 변수가 아닌 클로저를 통해 같은 내부 변수를 참조하게 되면 전역변수의 오남용을 줄일 수 있습니다. 또한, 클로저는 JavaScript에 적합한 방식의 스크립트를 구성하고 다양한 JavaScript의 디자인 패턴을 적용할 수 있습니다. 
여기까지 Javascript 에대해 알아보았고 다음 포스트에는 Node.js에 대해 알아볼 계획입니다.
