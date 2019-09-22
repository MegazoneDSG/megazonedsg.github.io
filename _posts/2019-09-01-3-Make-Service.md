---
layout: post
author: sondayeon
title: "3# Node에서 Service 생성하기"
description: "3# Node에서 Service 생성하기"
image: 'https://user-images.githubusercontent.com/13447690/64077423-8323b300-cd0b-11e9-8588-fb4fa9c6a294.png'
categories:
- tutorial
date: 2019-09-01 01:05:00
tags:
- Docker
- Docker Swarm
introduction: 안녕하세요.
              챕터 2에서 배운 Docker-Swarm이 잘 생성되었나요?
              이번 챕터는 서비스를 만든 후에, Docker-Swarm으로 잘 분산이 되는지 확인해보도록 합시다.
---

# 3# Node에서 Service 생성하기

안녕하세요.

챕터 #2에서 배운 Docker-Swarm이 잘 생성되었나요?

이번 챕터는 서비스를 만든 후에, Docker-Swarm으로 잘 분산이 되는지 확인해보도록 합시다.

---

### 목차는 다음과 같습니다.

[1. 서비스 만들기](#1-서비스-만들기)  
[2. 서비스 복제하기](#2-서비스-복제하기)   
[3. 서비스 지우기](#3-서비스-지우기)

---

## 1. 서비스 만들기

manager로 만들었던 aws-node1에서 진행하도록 합니다.   
이 노드에서 서비스를 만들어봅시다.

#### 사용법
```
$ docker service create [OPTIONS] IMAGE [COMMAND] [ARG...]
```
#### 예시     
```
ubuntu@aws-node1:~$ sudo docker service create --name web httpd

i7pbste6l5f01s1ps0ie3mlbz
overall progress: 1 out of 1 tasks 
1/1: running   [==================================================>] 
verify: Service converged 
```
#### 서비스가 잘 생성되었는지 확인
```
ubuntu@aws-node1:~$ sudo docker service ls

ID                  NAME                MODE                REPLICAS            IMAGE               PORTS
i7pbste6l5f0        web                 replicated          1/1                 httpd:latest        
````
#### 생성한 서비스 web의 상태정보도 확인
```
ubuntu@aws-node1:~$ sudo docker service ps web
ID                  NAME                IMAGE               NODE                DESIRED STATE       CURRENT STATE           ERROR       
pfxfmfhouu7h        web.1               httpd:latest        aws-node1           Running             Running 3 minutes ago               
```

## 2. 서비스 복제하기

#### 사용법
```
$ sudo docker service scale [service-name]=[replicas-number]
```
#### 예시
```
ubuntu@aws-node1:~$ sudo docker service scale web=3

web scaled to 3
overall progress: 3 out of 3 tasks 
1/3: running   [==================================================>] 
2/3: running   [==================================================>] 
3/3: running   [==================================================>] 
verify: Service converged 
```
#### 복제확인
```
ubuntu@aws-node1:~$ sudo docker service ls

ID                  NAME                MODE                REPLICAS            IMAGE               PORTS
i7pbste6l5f0        web                 replicated          3/3                 httpd:latest        
```
#### 상태확인
```
ubuntu@aws-node1:~$ sudo docker service ps web

ID                  NAME                IMAGE               NODE                DESIRED STATE       CURRENT STATE            ERROR       
pfxfmfhouu7h        web.1               httpd:latest        aws-node1           Running             Running 17 minutes ago
ankki0tclob3        web.2               httpd:latest        aws-node3           Running             Running 28 seconds ago
mkdc14bvys8l        web.3               httpd:latest        aws-node2           Running             Running 28 seconds ago               
```

## 3. 서비스 지우기

위에서 만든 `web` 이라는 서비스를 지워보도록 하겠습니다.

#### 사용법
```
$ docker service rm SERVICE [SERVICE...]
```
#### 예시
```
ubuntu@aws-node1:~$ sudo docker service rm web
web
```
#### service 목록 확인
```
ubuntu@aws-node1:~$ sudo docker service ls
ID                  NAME                MODE                REPLICAS            IMAGE               PORTS
```
#### web이라는 서비스의 상태 확인
```
ubuntu@aws-node1:~$ sudo docker service ps web

no such service: web
```

`web` 이라는 서비스를 찾을 수 없다고 나오는 것을 보아, 잘 지워진 것을 확인할 수 있습니다.

---

`Service`를 만드는 기본 단계를 모두 완료하셨습니다!     
다음 단계에서는 오늘 만든 Service를 가지고 **Rolling Test**를 하는 방법에 대해 배워보겠습니다.

> `배운 내용 복습 하기`   
[1. 서비스 만들기](#1-서비스-만들기)  
[2. 서비스 복제하기](#2-서비스-복제하기)   
[3. 서비스 지우기](#3-서비스-지우기)

> `이전 단계로 돌아가기` : [Docker-Swarm 만들기](/2-Make-Swarm)     
> `다음 단계로 넘어가기` : [서비스 Rolling-Test하기](/4-Rolling-Test)




