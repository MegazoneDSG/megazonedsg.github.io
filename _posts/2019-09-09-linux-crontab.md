---
layout: post
author: seungpilpark
notification: true
title: "리눅스 CronTab 으로 스케쥴러 실행하기"
description: 간단한 배치 작업을 수행할 필요가 있어 CronTab 을 써보고 작성하는 글.
image: 'https://user-images.githubusercontent.com/13447690/65383626-22f4bf80-dd53-11e9-8048-42a632739742.jpg'
categories:
- programming
date: 2019-09-09 01:05:00
tags:
- linux
- os
introduction: 간단한 배치 작업을 수행할 필요가 있어 CronTab 을 써보고 작성하는 글.
twitter_text: 간단한 배치 작업을 수행할 필요가 있어 CronTab 을 써보고 작성하는 글.
---

최근에 회의가 많아 사내 DEVOPS 시스템 유지관리에 소홀했었는데, 회의 중 형상관리 사이트가 안들어가진다고 팀원에게 연락이 왔다.

사내 DEVOPS 시스템은 사이트는 여러개인데, AWS 로드밸런서 가격도 아깝고 사내 인원만 쓰는거니 1cpu, 1GB 짜리 인스턴스에 Nginx Docker 를 설치하여 AWS 로드밸런서 가격을 세이브 하고 있었다.

Nginx 는 설정에 따라 2가지 기능의 프록시 기능을 수행할 수 있다.

- L7 스위치: http 프록시.  헤더,경로,패스 등을 라우팅 분기 조건으로 삼는다.
- L4 스위치: tcp 프록시.  포트 수준의 라우팅 분기 조건만을 삼을 수 있다. tcp 이므로 데이터베이스 등도 프록시가 가능하다.

원인을 알아보니, 나의 경우처럼 Nginx 를 L4 스위치 조건으로 사용하게 될 시 cpu 수, 워커 수, ulimit 등 신경써야 할 게 많다고 한다.

Nginx 를 L4 스위치처럼 잘 써보겠다고 열심히 파고드는 것은 내 인생에 별로 도움이 안 될 것 같았다. 문제 해결을 위해 하루 한번 정도만 재시작 하게 하면 될 것 같아서, 그 시간에 더 유용해 보이는 CronTab 스케쥴러 배워보았다.

## Crontab

크론탭은 별도 설치 없이 linux 또는 OSX 에 내장되어 있다. Java 프로그래밍에서 쓰는 CronExpression 은 6 자리인데 반해 linux crontab 은 5 자리 를 사용해서 혼동이 있었다. 사용법은 정말 간단하였다.

### 등록법

`crontab -e` 입력 시 편집창이 나오는데, 아래와 같이 원하는 스케쥴과 커맨드를 차례대로 입력하고 저장한다.

```
$ crontab -e

0 1 * * * [command]
```

스케쥴 표현식은 [https://crontab.guru/](https://crontab.guru/) 사이트에 들어가면 쉽게 얻을 수 있다.

로그와 함께 실행되길 원할 때는 다음과 같이 등록한다.

```
0 1 * * * [command] >> [log-file-path] 2>&1
```


### 스케쥴 조회/삭제

```
$ crontab -l  (조회)

$ crontab -r  (삭제)
```


