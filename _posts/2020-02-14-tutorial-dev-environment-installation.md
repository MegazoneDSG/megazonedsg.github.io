---
layout: post
author: dev-limeorange
notification: false
title: "[Tutorial] 개발환경 구성 - Spring Boot, Git, Maven [1/3]"
description: 첫 개발환경 구성 시 필요한 프로그램을 설치하기 위해 작성하는 글. 
image: "https://user-images.githubusercontent.com/55119239/74508917-976b0d80-4f43-11ea-9c97-f479de176bf3.png" 
categories: 
- tutorial
date: 2020-02-14 18:00:00
tags: 
- SpringBoot
- Git
- Maven
introduction: 첫 개발환경 구성 시 필요한 프로그램을 설치하기 위해 작성하는 글. 
twitter_text: 첫 개발환경 구성 시 필요한 프로그램을 설치하기 위해 작성하는 글. 
---

# *[Tutorial] 개발환경 구성 - Spring Boot, Git, Maven [1/3]*

첫 개발환경 구성에 필요한 Spring Boot, Git, Maven 설치 튜토리얼입니다.  
입사 후 개발환경이 바뀌면서 windows, mac 두 가지 os에 설치하게 되었습니다.  
때문에 제가 설치했던 과정들을 두 가지 OS버전으로 간략하게 나열해보았습니다.  
  
미리 설치한 프로그램은 아래와 같습니다.  
* OpenJDK 1.8 (환경변수 지정)
* IntelliJ Community 버전

Mac의 경우 Homebrew(패키지관리툴)를 먼저 설치해두면 편리하게 다운받을 수 있습니다.  

## *Git*
> Git은 분산형 버전 관리 시스템입니다.  

Git을 떠올리면, Github와 GitLab 등의 원격저장소 서비스들이 먼저 생각납니다.  
IDE에 내장된 기능으로 사용할 수도 있지만, 로컬에 Git을 설치해 직접 사용해보도록 하겠습니다.  

Git의 기초개념은 이곳에서 잘 설명해줍니다.  
[https://rogerdudler.github.io/git-guide/index.ko.html](https://rogerdudler.github.io/git-guide/index.ko.html)

그럼 Git을 설치해보겠습니다.  

### Git 설치 - Windows
다운로드: [https://git-scm.com/](https://git-scm.com/)

### Git 설치 - Mac
다운로드: [https://git-scm.com/](https://git-scm.com/)
터미널로 설치 시(Homebrew 필요)
```
$ brew install git
```
  
잘 설치되었는지 터미널(cmd/Powershell)에서 확인해봅시다.
```
$ git --version
git version 2.25.0
```

설치가 잘 되었습니다.   
설치한 Git을 IntelliJ에서 사용하도록 설정해줍시다.  

**IntelliJ > Preference(Settings)**
<img width="800" alt="스크린샷 2020-02-14 오후 2 54 11" src="https://user-images.githubusercontent.com/55119239/74405520-9b7a2b00-4e70-11ea-8d9e-fd558eff03c3.png">
git 이 저장된 경로 지정 후 test를 해보면 됩니다.  


<img width="332" alt="스크린샷 2020-02-14 오후 2 54 11" src="https://user-images.githubusercontent.com/55119239/74405614-ded49980-4e70-11ea-92a3-e09394311914.png">

성공입니다!
  
  
  
## *Maven*
> Maven은 소프트웨어 프로젝트 관리 및 이해 도구입니다.   

Maven은 Java 기반 프로젝트를 빌드하고 관리하는 데 사용할 수 있는 도구를 제공합니다.   
Pom(Project Object Model) 개념을 기반으로, 프로젝트의 빌드, 리포팅 등을 관리할 수 있습니다.   

Maven도 IDE에 내장되어있지만, 별도로 설치해 사용할 수 있도록 해보겠습니다.  
Maven은 설치 전에 JDK가 반드시 필요합니다.  

### Maven 설치 - Windows
다운로드: [https://maven.apache.org/download.cgi](https://maven.apache.org/download.cgi)

### Maven 설치 - Mac
다운로드: [https://maven.apache.org/download.cgi](https://maven.apache.org/download.cgi)
터미널로 설치 시(Homebrew 필요)
```
$ brew install maven
```

windows, mac 모두 홈페이지에서 다운로드 할 경우 포터블로 사용하기 때문에, **환경변수 설정**이 필요합니다.   
mac의 경우 brew로 설치한다면 별도 환경변수 설정은 필요 없습니다.  

환경변수 설정이 되었다면 잘 설치되었는지 터미널(cmd/Powershell)에서 확인해봅시다.
```
$ mvn --version
Apache Maven 3.6.3
Maven home: /usr/local/Cellar/maven/3.6.3_1/libexec
```
  
버전과 함께 설치된 경로가 나온다면 성공적입니다.  
이제 설치한 Maven을 IntelliJ에서 사용하도록 설치한 경로를 설정해주었습니다.   

**IntelliJ > Preference(Settings)**
<img width="958" alt="스크린샷 2020-02-13 오후 6 09 15" src="https://user-images.githubusercontent.com/55119239/74418670-13098380-4e8c-11ea-8b3d-782289dccaf4.png">



## *Spring Boot*
Spring Boot는 독립적으로 실행 가능한 어플리케이션을 만들어주는 응용 프로그램입니다. 

특징적인 기능들은 아래와 같습니다.  
* 단독실행가능한 스프링애플리케이션을 생성
* 내장형 톰캣, 제티 혹은 언더토우를 내장(`WAR` 파일로 배포할 경우에는 필요없음)
* 기본설정되어 있는 'starter' 컴포넌트들을 쉽게 추가  

출처: [https://gist.github.com/ihoneymon/8a905e1dd8393b6b9298](https://gist.github.com/ihoneymon/8a905e1dd8393b6b9298)


개발자가 특별히 설정할 것이 많지 않고, 쉽게 시작할 수 있다는 뜻으로 보입니다.   


필요한 것을 최소화해 간단한 프로젝트를 먼저 구동해보겠습니다.  
모든 어플리케이션은 **Spring Initializr**로 시작해야 합니다.  
[https://start.spring.io/](https://start.spring.io/)

별도의 Dependency는 추가하지 않고, Spring Web만 추가된 상태로 다운 받아보겠습니다.  
<img width="800" alt="스크린샷 2020-02-14 오후 2 19 49" src="https://user-images.githubusercontent.com/55119239/74504085-67693d80-4f36-11ea-9810-1f175952d3da.png">

다운 받은 zip파일은 **압축을 풀어줍니다**. 

이제 IntelliJ로 실행해보겠습니다. 
`example-web` 폴더를 `Open`해줍니다.

아래와 같이 웹 어플리케이션이 생성되었습니다. 
<img width="337" alt="스크린샷 2020-02-14 오후 2 41 17" src="https://user-images.githubusercontent.com/55119239/74504607-165a4900-4f38-11ea-8dfd-256798e0b12d.png">

`pom.xml`를 확인해보면, Spring Boot에서 기본적인 것들을 상속 받는 부분이 존재합니다. 
```
<parent>  
 <groupId>org.springframework.boot</groupId>  
 <artifactId>spring-boot-starter-parent</artifactId>  
 <version>2.2.4.RELEASE</version>  
 <relativePath/> 
</parent>
```
  
 
이제 어플리케이션이 잘 작동하는지 확인해보겠습니다. 
 
`com.mz.tutorial.exampleweb` 패키지에 `controller`라는 패키지를 만들어줍니다.  
`controller`패키지 내에 `HelloController`를 만들어 `RestController`로 지정해주었습니다. 
  
```
package com.mz.tutorial.exampleweb.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @GetMapping("/hello")
    public String getHello() {
        return "hello Spring boot!";
    }
}
```


이제 필요한 것은 끝났습니다.  
웹 어플리케이션을 한 번 구동해보겠습니다.  

우측 상단에서 `Edit Configurations...`를 확인해보면, `Template`이 `Spring Boot`로 되어있습니다.   
<img width="475" alt="스크린샷 2020-02-14 오후 2 46 48" src="https://user-images.githubusercontent.com/55119239/74504840-dcd60d80-4f38-11ea-9677-1dc1abf03de9.png">

`Main Class`가 `ExampleWebApplication`으로 잘 지정되어있는지 확인 후 구동했습니다.   
(IntelliJ Community 버전에선 Spring Boot template가 지원되지 않지만 Main Class는 잘 구동되었습니다.)

```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::        (v2.2.4.RELEASE)

2020-02-14 14:48:33.537  INFO 27284 --- [           main] c.m.t.exampleweb.ExampleWebApplication   : Starting ExampleWebApplication on ........
2020-02-14 14:48:33.540  INFO 27284 --- [           main] c.m.t.exampleweb.ExampleWebApplication   : No active profile set, falling back to default profiles: default
2020-02-14 14:48:34.267  INFO 27284 --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat initialized with port(s): 8080 (http)
2020-02-14 14:48:34.274  INFO 27284 --- [           main] o.apache.catalina.core.StandardService   : Starting service [Tomcat]
2020-02-14 14:48:34.274  INFO 27284 --- [           main] org.apache.catalina.core.StandardEngine  : Starting Servlet engine: [Apache Tomcat/9.0.30]
2020-02-14 14:48:34.328  INFO 27284 --- [           main] o.a.c.c.C.[Tomcat].[localhost].[/]       : Initializing Spring embedded WebApplicationContext
2020-02-14 14:48:34.328  INFO 27284 --- [           main] o.s.web.context.ContextLoader            : Root WebApplicationContext: initialization completed in 750 ms
2020-02-14 14:48:34.447  INFO 27284 --- [           main] o.s.s.concurrent.ThreadPoolTaskExecutor  : Initializing ExecutorService 'applicationTaskExecutor'
2020-02-14 14:48:34.565  INFO 27284 --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port(s): 8080 (http) with context path ''
2020-02-14 14:48:34.567  INFO 27284 --- [           main] c.m.t.exampleweb.ExampleWebApplication   : Started ExampleWebApplication in 1.331 seconds (JVM running for 2.031)
```

8080포트로 Tomcat서버가 잘 구동되었습니다. 
http://localhost:8080/hello 로 접속해보겠습니다. 
<img width="332" alt="스크린샷 2020-02-14 오후 2 54 11" src="https://user-images.githubusercontent.com/55119239/74505221-ef047b80-4f39-11ea-8a8c-a7bcf2a7895c.png">

성공적으로 Spring Boot를 구동했습니다. 
