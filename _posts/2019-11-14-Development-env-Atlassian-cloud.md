---
layout: post
author: seungpilpark
notification: true
title: "Atlassian 제품군 플러그인 개발환경 구축하기"
description: Atlassian 제품군 플러그인 개발환경 구축하기 글
image: "https://user-images.githubusercontent.com/13447690/68827648-1141ef80-06e6-11ea-8ad8-e5eef2a82bdc.png"
categories:
- tutorial
date: 2019-11-14 02:05:00
tags:
- cloud
- vdi
- atlassian
introduction: Atlassian 제품군 플러그인 개발환경 구축하기 글
twitter_text: Atlassian 제품군 플러그인 개발환경 구축하기 글
---

# Atlassian 제품군 플러그인 개발환경 구축하기

구글,페이스북,Jira 플러그인 등 3th Party 클라우드 제품과 연계된 어플리케이션을 개발할 때, 로컬 데스크탑에서 개발하는 것에는 한계가 있습니다.

우리가 타사이트의 클라우드를 향해 일방적으로 요청을 할 때는 문제가 없지만, JIRA 플러그인 개발 등 우리의 어플리케이션과 클라우드과 지속적으로 정보를 교환하여야 할 때는, 우리의 어플리케이션 개발환경 자체가 개방형 환경에 놓여있어야 합니다.

과거에는 이러한 개발을 할 때, 고정아이피가 연결된 공유기에 포트포워딩을 통해서 타사이트의 클라우드 제품군이 개발중인 어플리케이션을 찾아갈 수 있도록 설정을 하곤 했습니다. 규모있는 기업인 경우 보안팀과 까다로운 방화벽 정책을 협의해야 하는 문제가 있고, 개인의 개발환경을 위해 포트포워딩 룰을 지속적으로 관리해 주어야 하는 점 때문에 매우 어려운 현실입니다.

## 해결법
1. 로컬에서 모든 3th Party 클라우드 제품과의 연계 코드를 **예측** 해서 코딩한 후 배포한다.
2. 퍼블릭 인터넷 환경과 연계된 VDI(가상화 데스크톱) 을 구축한 후 VDI 내부에서 디버깅 하며 개발한다.

두가지 해결 법 중 개발자 입장에서는 2번 항목이 퍼포먼스를 더 낼 수 있겠지요.

[AWS Workspace](https://aws.amazon.com/ko/workspaces/?nc=sn&loc=1) 를 사용하면 가상화 데스크톱 서비스를 쉽게 사용할 수 있습니다. 다음은 Intellij IDEA 를 통해 개발을 하기 적합한 퍼포먼스의 서버 사양 가격표 입니다.

| Standard            | 루트 볼륨 | 사용자 볼륨 | 월별 요금 | 시간별 요금                 |
|---------------------|-----------|-------------|-----------|-----------------------------|
| 2 vCPU, 4GiB 메모리 | 80GB      | 10GB        | 29 USD    | 7.25 USD/월 + 0.26 USD/시간 |
| 2 vCPU, 4GiB 메모리 | 80GB      | 50GB        | 31 USD    | 9.75 USD/월 + 0.26 USD/시간 |
| 2 vCPU, 4GiB 메모리 | 80GB      | 100GB       | 34 USD    | 13 USD/월 + 0.26 USD/시간   |
| 2 vCPU, 4GiB 메모리 | 175GB     | 100GB       | 40 USD    | 19 USD/월 + 0.26 USD/시간   |

2 vCPU, 4GiB 메모리로 선택할 시 시간당 300원 정도가 과금이 되고, 로그아웃 만료시간을 1시간으로 설정한다면 개발을 하지 않는 기간에는 자동으로 종료가 되므로 합리적인 과금으로 운용할 수 있습니다.

다만 초기 세팅이 일반 개발자에게는 어려울 수 있으므로 VDI, ActiveDirectory, VPC 보안 등을 감안하여 Workspace 를 세팅하는 과정은 SA 의 도움을 받도록 합시다.

## 구축 후 모습

Atlassian Cloud Development 환경을 다음과 같이 완성하였습니다.  
로컬 데스크탑에서 원격 데스크탑 접속 클라이언트를 통해 Cloud 상에서 개발을 진행하고, Atlassian Cloud 상에서 플러그인을 통해 일어나는 일 또한 원격 데스크탑 IDEA 를 통해 바로 디버깅이 가능하기 때문에 개발자는 자신의 PC 에서 개발하는 경험을 동일하게 가져 갈 수 있습니다.

![스크린샷 2019-11-14 오후 1 40 50](https://user-images.githubusercontent.com/13447690/68827273-b78cf580-06e4-11ea-8917-953cd17162ca.png)

# Summary

혹시 이러한 3thParty 제품군과 클라우드상에서 연동되는 개발에 어려움을 겪고 계신 메가존 개발자 분들이 계시다면, seunpilpark@mz.co.kr 로 연락주세요.









