---
layout: post
author: seungpilpark
notification: true
title: "AWS ACM 인증서 만료 방지하기"
description: AWS 인증서가 만료되어 시스템 장애를 예방하기 위해 작성하는 글.
image: 'https://user-images.githubusercontent.com/13447690/65383626-22f4bf80-dd53-11e9-8048-42a632739742.jpg'
categories:
- programming
date: 2019-09-07 01:05:00
tags:
- aws
- acm
introduction: AWS 인증서가 만료되어 시스템 장애를 예방하기 위해 작성하는 글.
twitter_text: AWS 인증서가 만료되어 시스템 장애를 예방하기 위해 작성하는 글.
---

프로젝트 진행 중 인증서가 만료되어 장애가 일어나, 팀원이 주말에 급히 출근하는 불상사가 일어났다.

AWS ACM 에서 발급하는 인증서를 사용 중이었는데, 알아보기로는 AWS ACM 은 자동으로 만료 시간을 갱신 해 준다고 알고있었는데 매년 같은 사고가 일어났다는 이야기를 듣고 의아했다.

관련 내용에 대해 다시 한번 찾아보니 이런 문서가 있었다. [https://aws.amazon.com/ko/premiumsupport/knowledge-center/certificate-fails-to-auto-renew/](https://aws.amazon.com/ko/premiumsupport/knowledge-center/certificate-fails-to-auto-renew/)

해당 문서를 바탕으로, 인증서 만료가 발생하는 원인을 다음과 같이 정리해 볼 수 있었다.

## 인증서 만료 문제 사전 방지.

1. AWS ACM 으로 관리되는 인증서는, 만료되기 60일 전에 자동으로 인증서를 갱신하는 프로세스를 시작합니다.
2. 자동 도메인 검증 프로세스:  AWS 가 도메인 사업자의 DNS 서버에 질의하여 자동으로 갱신합니다.
3. 이메일 검증 프로세스: 도메인 소유주 (고객) 에게 이메일 컨펌을 받아야 합니다.

* 만료 60일 전에 이메일 검증 프로세스가 이미 실행되었겠지만, 고객은 해당 절차를 모르고 있는 상태이므로 오늘과 같은 사고가 번복되는 것 입니다.
* 사고 예방을 위해 모든 인증서를 "도메인 검증 프로세스" 로 발급받을 필요가 있습니다.
* 도메인 검증 인증서는, 등록 절차가 매우 간단합니다. 도메인 사업자 콘솔에서 AWS ACM 용 CNAME 레코드를 등록시켜 주기만 하면 됩니다.

## 도메인 검증 인증서 발급받기

원인을 알았으므로, 도메인 검증 인증서를 발급받고 적용하는 절차에 대해 알아보자.

### AWS -> ACM 콘솔로 들어가서, 새 인증서를 요청한다.

<img width="1575" alt="스크린샷 2019-09-07 오후 12 14 09" src="https://user-images.githubusercontent.com/13447690/64469267-dc577080-d169-11e9-993e-10ef4e307696.png"> 

### 적용할 도메인 이름들을 추가한다.

<img width="1560" alt="스크린샷 2019-09-07 오후 12 14 31" src="https://user-images.githubusercontent.com/13447690/64469268-dcf00700-d169-11e9-855e-bda4b27031a0.png">

### `DNS 검증` 을 선택하고, 발급받는다.

<img width="1561" alt="스크린샷 2019-09-07 오후 12 14 43" src="https://user-images.githubusercontent.com/13447690/64469269-dcf00700-d169-11e9-9ba1-916180e58ea1.png">

### 초기 발급 받은 인증서는 **검증 보류** 상태이다. 검증 보류를 해제하기 위해서는 화면처럼 도메인 이름과 값을 CNAME 타입으로 도메인 사업자에 A 레코드를 등록해 주어야 한다.

- A 레코드 타입: CNAME
- A 레코드 도메인: _9cb1e06cc8e1520fe8429dcf83f76d0a.atomy.com.
- A 레코드 값: _e13286843784e905010f8f9d0d534d36.duyqrilejt.acm-validations.aws.

<img width="1535" alt="스크린샷 2019-09-07 오후 12 16 31" src="https://user-images.githubusercontent.com/13447690/64469270-dd889d80-d169-11e9-8e49-e0e38967908a.png">

### GABIA 도메인 사이트에 접속하여, 네임플러스 부가서비스로 들어간다.

<img width="801" alt="스크린샷 2019-09-07 오후 12 18 40" src="https://user-images.githubusercontent.com/13447690/64469271-dd889d80-d169-11e9-82c0-894b0ca7c51b.png">

### GABIA 에 등록된 도메인에, CNAME 설정으로 들어간다.

<img width="800" alt="스크린샷 2019-09-07 오후 12 19 01" src="https://user-images.githubusercontent.com/13447690/64469272-dd889d80-d169-11e9-98ec-74b1bdff3d62.png">

### 인증서의 A 레코드 도메인과 A 레코드 값을 차례로 넣어주고 등록하면 완성이다.

<img width="797" alt="스크린샷 2019-09-07 오후 12 19 15" src="https://user-images.githubusercontent.com/13447690/64469273-de213400-d169-11e9-9793-17de679a2a57.png">

모든 절차 종료 후 잠시 뒤 ACM 인증서가 **검증 보류** 상태에서 **검증 완료** 상태로 변경되며, 실제 사용 가능한 상태로 된다.
