---
layout: post
author: seungpilpark
notification: true
title: "Oauth2.0 기반의 SSO 솔루션 구축기"
description: Oauth2.0 기반의 SSO 솔루션 구축기
image: "https://user-images.githubusercontent.com/13447690/79689763-df831500-8291-11ea-9341-53c7a29f3044.png"
categories:
- sso
date: 2020-04-19 11:00:00
tags:
- sso
introduction: Oauth2.0 기반의 SSO 솔루션 구축기
twitter_text: Oauth2.0 기반의 SSO 솔루션 구축기
---

# Oauth2.0 기반의 SSO 솔루션 구축기

최근 모 대기업의 국내사이트 통합인증 프로젝트가 오픈하였는데, 핵심 모듈인 SSO 기능구현에 메가존에서 구축한 SSO 솔루션이 사용되었습니다.
기존 B2C 커머스사이트 5곳, 800만 회원을 통합하는 프로젝트였으며, 현재 분당 평균 2000 건의 인증처리를 안정적으로 수행하고 있습니다.

이 사이트들은 JDK1.4 버전, JDK1.8버전, C#, Android 등 서로 다른 랭귀지와 서버환경, 그리고 신/구 기술이 뒤섞인 상황이었는데, 
전통적인 에이전트 설치 방식의 SSO 솔루션들이 쉽사리 할 수 없었던 일을 오로지 HTTP 방식으로만 싱글사인온 처리가 가능하도록 하여 2달만에 오픈을 성공하였습니다.
  
이 SSO 솔루션은 국내사이트 구축 이전에도, 이 기업의 해외 B2C 사이트 150여 개국의 인증처리에도 사용되었습니다.
특히 해외 BC2 사이트는 회원정보 자체가 대륙별로 크게 5개의 운영주체가 있었고 서로 다른 인증/인가 법률및 정책이 있었는데, 여러 어플리케이션에서 매우 복잡하게 얽혀들어갈 수 있는 문제를 
아키텍처의 심플함으로 풀어내었습니다.

[*해외 B2C 사이트 통합로그인 적용시 사용된 개념도 일부.*]
[*SSO 에서 다양한 이해관계 및 운영주체들간의 요구사항을 처리하고 있다.*]
![](https://user-images.githubusercontent.com/13447690/79689761-dd20bb00-8291-11ea-8469-d048a3623269.png)

다음은 이 SSO 솔루션은 어떠한 생각과 아키텍처로 만들어 졌는지에 대한 설명입니다.

## About Oauth2.0

**OAuth 2.0** 은 인증을 위한 산업 표준 프로토콜입니다.
OAuth 2.0은 2006 년에 만들어진 원래 OAuth 프로토콜에 대한 작업보다 우선합니다.
OAuth 2.0은 웹 개발자를 위한 인증 플로우을 제공하면서 데스크톱 애플리케이션, 모바일 등의 클라이언트 개발과정의 단순성에 중점을 둡니다.
OAuth 2.0의 사양과 확장은 [IETF OAuth Working Group] (https://www.ietf.org/mailman/listinfo/oauth)에서 개발되고 있습니다.
 
> 인증 서버가 필요한 이유는?

- **AS-IS**
 - 응용 프로그램 수준에서 모든 인증 처리
 - 복잡한 세션 관리 코드로 인한 개발 지연

- **TO-BE**
 - 인증 처리를 인증 서버에 위임합니다.
 - 응용 프로그램은 발급 된 토큰을 사용하여 각 서비스간에 통신 및 로그인 절차를 수행합니다.
 
*AS-IS / TO-BE* 
![](http://ssodoc.lgcom.lge.com/docs/image/concept/concept1.png)
 
> 새로운 서비스 나 새로운 스토리지가 증가함에 따라 기존 애플리케이션 코드를 수정할 필요가 없습니다.
 
![](http://ssodoc.lgcom.lge.com/docs/image/concept/concept2.png) 
 
## Flexible user repository

이번 프로젝트에 구축한 메가존 SSO 의 특징은 **유연한 사용자 인증 저장소** 를 지원하는 것입니다.

다음은 전통적인 Oauth2 아키텍처와 각 구성 요소에 대한 설명입니다.

*Traditional Oauth2 basic architecture*
![](http://ssodoc.lgcom.lge.com/docs/image/concept/concept3.png)

원래 인증 서버의 목적은 기업이 운영하는 다양한 크로스-도메인 사이트 간에 단일 사용자 ID로 로그인하는 것입니다.
이 때 기업은 보통 사용자 정보 저장소를 한곳에 모아서 관리하게 되는데, IAM(Identity and Access Management) 에서는 이를 **realm** 이라 합니다.
그리고 많은 오픈소스/상업용 SSO 솔루션들이 **하나의 realm 에는 하나의 사용자 스토리지를 사용할 수 있도록 설계되어있습니다.**

그러나 서비스 통합의 주체가 다양해 짐에 따라 다음과 같은 요인으로 인해 통합 인증을 적용하기가 점점 어려워지고 있습니다. 

1. 대다수의 각 서비스에는 이미 자체 사용자 저장소가 있습니다.
2. 개인 정보는 `GDPR 정책` 에 따라 각 국가에 귀속되어야합니다.
3. 대부분의 통합인증 오픈 소스는 LDAP 등 사용자스토리지 연동기능을 지원하지만, 데이터베이스 형태의 사용자 저장소나 3thParty 형태의 사용자 저장소에 액세스하려면 `연동 어댑터 개발`이 필요합니다.

*Difficult for single-sign-on*

![](http://ssodoc.lgcom.lge.com/docs/image/concept/concept1-1.png)

---

**메가존 SSO는 이러한 문제를 해결하기 위해 다음을 지원합니다.**:

- 다중 사용자 스토리지 지원
- 소스 코드를 재배포하지 않고 기존 사용자 데이터 인증 로직 변경이 가능합니다.

![](https://user-images.githubusercontent.com/13447690/79689420-b5305800-828f-11ea-887e-6c60983de9f9.png)
 
기업이 보유한 서비스가 많고 사용자정보 저장소가 다양하고 많을수록 이 방법의 이점이 커집니다.

![](http://ssodoc.lgcom.lge.com/docs/image/concept/concept5.png)

---

## How to integrate user data?

### Pipeline modeler

다음은 다중 사용자 스토리지 지원과 함께, 다중 사용자 스토리지를 효과적으로 모델링 할 수 있는 SSO 의 기능을 소개합니다.

> 파이프라인 모델러: 각 클라이언트가 사용자 정보에 액세스 할 때 데이터에 액세스하는 방법을 모델링 합니다.

파이프라인은 `RestAPI`, `Sql` 및 `Function` 과 같은 타스크로 구성됩니다. 토큰은 각 타스크들의 조합을 통해 원하는 사용자정보를 조합하여 생성됩니다.
또한 인증 전/후 처리등 커스터마이징 요소들도 타스크 조합을 통해 유연하게 구성이 가능합니다.  

**Task**

> - RestAPI: RestAPI 를 호출할 수 있는 타스크 
> - Sql: JDBC adapter 를 통해 SQL 을 실행할 수 있는 타스크
> - Function: 자바스크립트 엔진을 통해 커스텀한 로직을 구현할 수 있는 타스크
> - LDAP: LDAP 사용자를 호출할 수 있는 타스크
> - Others: 이메일 인증, MFA 처리 등을 구성할 수 있는 타스크

모든 작업 정의는 UI Modeler 에서 설정할 수 있으며 서버를 다시 시작하지 않고 즉시 반영됩니다. 2 단계 인증과 같은 로그인 시나리오가 가능합니다.

*Example pipeline for login*
![](http://ssodoc.lgcom.lge.com/docs/image/concept/concept6.png)

*User storage with CRUD pipelines*
![](http://ssodoc.lgcom.lge.com/docs/image/storage/storage-5.png)

### Extends pipeline

경우에 따라 `사용자 CRUD 작업`, `이메일 인증` 및 `투팩터 인증` 을 수행하는 파이프라인을 추가 할 수 있습니다.

이 경우 애플리케이션에서는 사용자 처리와 연관된 로직들을 어플리케이션에서 완전히 분리하여 **마이크로 서비스 지향적인 설계를 할 수 있습니다.**

*CRUD operations with pipeline*
![](http://ssodoc.lgcom.lge.com/docs/image/concept/concept7.png)
  
*다양한 시나리오의 파이프라인을 구성*
![](http://ssodoc.lgcom.lge.com/docs/image/storage/storage-6.png)

*파이프라인 모델링과 테스트 샘픔*
![](http://ssodoc.lgcom.lge.com/docs/image/pipeline/pipeline-5.png)

## How to single-sign-on? 

Oauth2.0 Spec 은 인증/인가에 대한 flow 를 제공하고 있지만 이것이 과거 WAS 플러그인 기반의 동시로그인/동시로그아웃 세션 동기화를 의미하는 것은 아닙니다.
동시로그인/동시로그아웃 실현방법은 기업의 전략에 따라 Oauth2.0 모델에서 조금씩 달리 확장되어 쓰일 수 있습니다.

일단 메가존 SSO 에서 지원하는 기본적인 형태의 동시로그인/아웃 모델을 살펴보겠습니다.

> Oauth2 를 확장하여 동시로그인 모델을 이해할 수 있는 간단한 설명

*SiteA initial login*
![](http://ssodoc.lgcom.lge.com/docs/image/concept/concept8.png)

1. 브라우저가 SiteA 에 접근합니다.
2. 사용자가 SiteA 에 로그인하지 않았으므로 브라우저가 사용자를 SSO 서버로 리디렉션 합니다.
3. 사용자가 SSO 에서 로그인을 합니다.
4. SSO 서버는 사용자가 성공적으로 로그인하면 Code 값과 함께 SiteA로 리디렉션합니다.
5. SiteA는 SSO 서버에 클라이언트의 자격 증명과 함께 수신된 코드를 보내어 토큰발급을 요청합니다.
6. SSO 서버는 토큰을 발행하고 로그인 세션을 저장합니다.
7. SiteA는 발행 된 토큰을 어플리케이션 세션 또는 브라우저에 저장합니다.

*Log in to SiteB while logged into SiteA*
![](http://ssodoc.lgcom.lge.com/docs/image/concept/concept9.png)
 
1. 브라우저가 SiteB 에 접근합니다.
2. 사용자가 SiteB 에 로그인하지 않았으므로 브라우저가 사용자를 SSO 서버로 리디렉션 합니다.
3. SSO 는 사용자가 이미 SSO 로그인하였음을 감지합니다.
4. SSO 서버는 Code 값과 함께 SiteB로 리디렉션합니다.
5. SiteB는 SSO 서버에 클라이언트의 자격 증명과 함께 수신된 코드를 보내어 토큰발급을 요청합니다.
6. SiteB는 발행 된 토큰을 어플리케이션 세션 또는 브라우저에 저장합니다.

*Log out*
![](http://ssodoc.lgcom.lge.com/docs/image/concept/concept10.png)

1. SiteA에서 로그 아웃을 클릭하면 브라우저가 사용자를 SSO 로그 아웃 URL로 리디릭션 합니다.
2. SSO 서버가 사용자 토큰을 만료시키고 세션에서 삭제합니다.
3. SSO 서버는 로그 아웃 성공 메시지와 함께 사용자를 SiteA로 리디렉션됩니다.
4. 브라우저가 SiteB로 접근시 SiteB는 SSO 서버에 토큰 유효성 검증을 요청합니다.
5. SSO 서버는 사용자가 로그 아웃했음을 알려줍니다.

---

## 로그인/로그아웃 동기화 확장 시나리오

각 사이트에서 Oauth2.0 프로토콜에 따라 SSO 에서 제공하는 로그인 / 로그아웃 flow 를 올바르게 구현하였다면, SSO 에서 좀더 복잡한 상황에서의 동시로그인/아웃 지원기능을 설정할 수 있게 됩니다. 

다음은 로그인/로그아웃 동기화 정책의 예시입니다.

## 메인 도메인이 같은 사이트 간의 쿠키를 사용한 로그인 동기화

메인 도메인이 같은 사이트 끼리는 도메인 쿠키를 사용해서 문제를 쉽게 해결 할 수 있습니다.
메인 도메인이 같을 경우 사이트 A는 로그인/로그아웃이 되면 메인 도메인 쿠키에 발급받은 어세스 토큰을 저장하게 됩니다.  
이후 사이트 B 는 브라우저 진입시 쿠키의 어세스 토큰을 획득한 후, SSO 에 토큰 정보를 요청하여 로그인 여부를 판단합니다.

[동시로그인 요약]
![](https://user-images.githubusercontent.com/13447690/79686536-16e6c700-827c-11ea-8096-7f08f5698396.png)

1. 로그인 요청 [브라우저 이동]
2. 사용자가 SSO 에서 로그인 행위를 함.
3. 로그인 성공시 SSO 에서 SiteA 로 code 값과 함께 리디릭션
4. SiteA 에서 code 값으로 Access Token 교환
5. 세션 및 쿠키에 Access Token 저장
6. SiteB 오픈
7. SSO 에 AccessToken 을 보내 위변조 확인 후 로그인확인
 
## 메인 도메인이 다른 사이트 간의 동시 로그인

아래의 설명은 메인 도메인이 다른 사이트들 간에 어떻게 동시 로그인이 되는가에 대한 설명을 담고 있습니다.

[동시로그인 요약]
![](https://user-images.githubusercontent.com/13447690/79686544-1d753e80-827c-11ea-8901-25b25f79f886.png)

1. 로그인 요청  [브라우저 이동]
2. 사용자가 SSO 에서 로그인 행위를 함.
3. 로그인 성공시 SSO 에서 SiteA 는 code 값과 함께 리디릭션, SiteB 는 hidden iframe 으로 code 값과 함께 오픈
4. SiteA, SiteB 에서 code 값으로 Access Token 교환
5. SiteA, SiteB 에서 세션에 Access Token 저장

> SSO 설정창에서 동시로그인 할 대상 클라이언트 그룹을 지정할 수 있습니다.

## 모든 사이트에서 동시 로그아웃

아래의 설명은 어떻게 동시 로그아웃이 되는가에 대한 설명을 담고 있습니다.

[동시로그아웃 요약]
![](https://user-images.githubusercontent.com/13447690/79686547-1ea66b80-827c-11ea-8286-b2ebe6dbc522.png)

1. 로그아웃 요청  [브라우저 이동]
2. SSO 에서 사용자 세션을 만료 시킴.
3. 로그아웃 성공시 SSO 에서 SiteA 는 리디릭션, SiteB 는 hidden iframe 으로 오픈
4. SiteA, SiteB 에서 세션에 Access Token 삭제

> SSO 설정창에서 동시로그아웃 할 대상 클라이언트 그룹을 지정할 수 있습니다.

## SSO 의 기술적 이슈들과 해결 방안

**SSO 서버가 도입 될 때마다 제시되는 두 가지 기술적 문제가 있습니다.**

> **첫 번째 문제는 세션 풀입니다.**

첫 번째는 SSO 서버에서 대규모 사용자를 지원할 때 세션 정보를 분산 저장하는 방법입니다.
메가존 SSO는 `Redis 세션 클러스터링` 을 사용하므로 세션 스토리지 용량의 한계는 전적으로 redis 성능에 달려 있습니다.
  
> **두 번째 문제는 동시로그인/아웃 문제입니다.**

Oauth2를 사용하여 SiteA 또는 SiteB에 대한 초기 인증이 성공하고 토큰이 발행되었다고 가정하십시오.
SiteA 또는 SiteB 어플리케이션의 세션레벨에서 각기 다른 세션유지시간 값을 유지하는 경우, 사이트 A와 사이트 B의 세션 만료시간이 다를 수 있습니다.

이 경우 SiteA가 로그 아웃 된 경우 전체 사이트에서 여전히 로그인 된 상태로 남아있는 비 일관성 문제가 발생합니다.

보통의 SSO 솔루션들은 다음의 두가지 해법을 제시합니다.

1. Http 기반: 페이지가 열릴 때마다 토큰 확인 요청.
2. Agent 기반: 백엔드 스케줄러를 구현하여 토큰 유효성 검사를 주기적으로 판단하는 웹서버 에이전트 설치.

메가존에서 구축한 SSO 는 폴리글랏 어플리케이션들간의 Http 통신만으로 싱글사인온을 구현하는 것이 목표이기 때문에, Agent 기반의 해법은 사용하지 않습니다.
메가존 SSO 는 동시로그인/동시로그아웃 기능을 제공하고 있고 매우 일반적인 상황에서 매우 유용하게 쓰입니다만, 
어플리케이션 설계단예서 미처 고려하지 못한 돌발상황 및 토큰위변조/로그인판별 확인을 위해 매 요청시마다 Http 토큰 확인 요청을 하는 것을 권한하고 있습니다.

어플리케이션마다 토큰위변조/로그인판별 요청을 하게 되어 매우 많은 리퀘스트를 수용해야 하는데, 
JWT 토큰 기반 유효성 검사 및 Redis 기반 로그인 상태 확인을 수행하므로 10 ~ 20 ms 이내에 응답 할 수 있습니다.

**토큰위변조/로그인판별 API 응답속도**
![](https://user-images.githubusercontent.com/13447690/79688643-8cf22a80-828a-11ea-8923-e57ba52742de.png)

