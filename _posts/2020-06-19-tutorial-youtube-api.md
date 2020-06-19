---
layout: post
author: jangjinik
notification: true
title: "YouTube Data API v3 사용해보기 (1/2)"
description: YouTube Data API v3 사용해보기 (1/2)
image: "https://user-images.githubusercontent.com/60992288/85112999-8d3e8000-b251-11ea-8900-dcd837799257.png"
categories:
- java
date: 2020-06-19 17:00:00
tags:
- youtube
introduction: YouTube Data API v3 사용해보기
twitter_text: YouTube Data API v3 사용해보기
---

최근 프로젝트에서 YouTube 동영상의 링크 정보로 특정 동영상의 재생시간을 가져와야 하는 요구사항이 있었는데요. 
이 계기로 YouTube Data API v3를 접해 볼 기회가 있었습니다.

YouTube Data API v3 의 상세한 문서는 아래 링크를 참고 하세요. 정리가 잘 되어있더라구요.
[https://developers.google.com/youtube/v3/getting-started](https://developers.google.com/youtube/v3/getting-started)
[https://developers.google.com/youtube/v3/quickstart/java](https://developers.google.com/youtube/v3/quickstart/java)

그럼 이제, YouTube Data API v3 를 사용하여 YouTube 동영상의 정보들을 가져와 보도록 하겠습니다.

# 시작

우선 YouTube Data API V3 를 사용하기 위해서는

### 첫번째, Google 계정과 Google APIs 프로젝트 생성.
왜 구글 계정이 필요하지? 라고 생각하고 찾아보니, 

>구글이 2006년 10월 9일 주식교환을 통해 16억 6천만 달러에 유튜브를 인수를 했다고 해요. 이후 구글은 국가별 현지화 서비스를 시작하면서, 네덜란드, 브라질, 프랑스, 폴란드, 아일랜드, 이탈리아, 일본, 스페인, 영국 등 총 9개 국가에서 사용자를 위한 페이지를 공개 했다고 하네요. 

> 우리나라는 2008년 1월 23일에 시작했다고 합니다.

[https://ko.wikipedia.org/wiki/%EC%9C%A0%ED%8A%9C%EB%B8%8C](https://ko.wikipedia.org/wiki/%EC%9C%A0%ED%8A%9C%EB%B8%8C) 위키백과에서 참고했습니다.

그럼, 다시 본론으로 돌아가서 구글 로그인 된 상태에서 
Google API 콘솔 화면으로 접속을 합니다. 
[https://console.developers.google.com/](https://console.developers.google.com/)

구글 콘솔에서 프로젝트를 만들어야 하는데요.
콘솔화면의 왼쪽메뉴에서 'API 및 서비스 > 대시보드' 에서 새로운 프로젝트를 하나 생성합니다.

프로젝트 이름 : YouTube-API (원하는시는 명 입력하면 됩니다.)

프로젝트 ID : 프로젝트 ID는 자동으로 되고, 변경도 가능합니다.

조직 : 선택사항이에요.

위치 : 메가존 (메가존 계정이라 그런지 메가존으로 위치를 잡았습니다.)


![](https://user-images.githubusercontent.com/60992288/85112999-8d3e8000-b251-11ea-8900-dcd837799257.png)



만들기 버튼을 누르면 화면이 새로고침 되면서 
‘아직 사용할 수 있는 API가 없습니다. 시작하려면 ‘API 및 서비스 사용 설정'을 클릭하거나 API 라이브러리로 이동하세요' 라는 메시지를 보게 됩니다. 
라이브러리는 세번째 챕터에서 설정하도록 하겠습니다

---
### 두번째, API Key 생성
이제 만들어진 프로젝트의 왼쪽 메뉴에 보시면 ‘사용자 인증 정보’가 보일 거에요. 
이동한 페이지의 상단에 ‘+ 사용자 인증 정보 만들기’ 를 클릭하여, API키를 선택해주세요. 
그럼 아래의 API키 항목에 새로운 API Key가 생성된 것을 확인할 수 있습니다.

![](https://user-images.githubusercontent.com/60992288/85114491-51f18080-b254-11ea-8901-7bf6385cd981.png)

---
### 세번째, YouTube Data API v3 서비스 설정하기
이제 YouTube의 Data API v3 서비스를 등록하겠습니다.

왼쪽 메뉴의 ‘API 및 서비스 > 라이브러리' 를 클릭하면, 라이브러리를 검색할 수 있습니다.
추가할 라이브러리가 있는 경우 여기서 검색해서 등록하면 다른 라이브러리도 사용할 수 있습니다.

검색을 ‘YouTube Data API v3’ 하면 하나의 결과가 나올 거에요. 클릭해주세요.
![](https://user-images.githubusercontent.com/60992288/85114950-dbee1900-b255-11ea-9c35-e144f130e206.png)

그럼 이제 이 API에 대한 설명과 정보들이 출력되고, 
우리는 API 사용하기 위해서 ‘사용설정’ 버튼을 클릭해주세요.'

![](https://user-images.githubusercontent.com/60992288/85115015-f7592400-b255-11ea-9279-84529fe61fa7.png)

그럼, 이제 사용설정 되고, 
API 및 서비스 > 대시보드 에서 YouTube Data API v3 가 등록된 것을 확인 할 수 있어요. 

여기까지 이상없이 했다면, 이제 준비는 완벽하다고 보면 되겠습니다.

이후에는 Spring Boot 프로젝트를 생성하여, YouTube Data API v3 코드를 녹여?보도록 하겠습니다.

