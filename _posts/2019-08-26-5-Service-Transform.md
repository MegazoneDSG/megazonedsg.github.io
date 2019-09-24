---
layout: post
author: sondayeon
notification: false
title: "Docker Services 상태 전환하기 [5/6]"
description: "5# Docker Services 상태 전환하기"
image: 'https://user-images.githubusercontent.com/13447690/64077423-8323b300-cd0b-11e9-8588-fb4fa9c6a294.png'
categories:
- tutorial
date: 2019-08-26 01:05:00
tags:
- Docker
- Docker Swarm
- Drain
- Down
introduction: Docker 서비스의 상태를 Drain, Down으로 전환해 보도록 합시다.
---

# Docker Services 상태 전환하기

안녕하세요.

DSG 웹서비스부문 개발 2팀 사원 손다연입니다.

[챕터 4]에서 배운 Service로 Rolling Test를 잘 해보셨나요?

이번 챕터는 `Docker 서비스 상태를 전환`해 보도록 합시다.

---

### 목차는 다음과 같습니다.

[1. Drain 상태로 전환하기](#1-drain-상태로-전환하기)  
[2. Down 상태로 전환하기](#2-down-상태로-전환하기)   

---

## 1. Drain 상태로 전환하기

Node를 유지보수하기 위해서, Node에서 실행되는 작업을 빼내야할 때 `Drain` 설정을 사용합니다.

저는 위에서 만든 Ping 서비스의 Task 내역을 다 지운 후 다시 서비스를 생성하는 작업을 하겠습니다.      
여러분께서는 이 작업을 안하셔도 괜찮습니다.
 
 > 참고 : 챕터 #3의 `3.서비스 지우기`와 `1. 서비스 만들기`   
 > [챕터 #3 바로가기](/3-Make-Service)

---

다시 ping을 생성한 후의 Task 상태를 확인해보겠습니다.

#### Task 상태 확인

```
ubuntu@aws-node1:~$ ubuntu@aws-node1:~$ sudo docker service ps ping
ID                  NAME                IMAGE               NODE                DESIRED STATE       CURRENT STATE            ERROR       
5ao38pqjme6t        ping.1              alpine:latest       aws-node2           Running             Running 45 seconds ago
tjtpthtxayhu        ping.2              alpine:latest       aws-node2           Running             Running 45 seconds ago
lcr9l2nqq64n        ping.3              alpine:latest       aws-node3           Running             Running 45 seconds ago
fpcd0pnbdrzb        ping.4              alpine:latest       aws-node1           Running             Running 46 seconds ago       
```
4개의 복제본이 node에 `분산분배`되어있는 것을 확인할 수 있습니다.

#### Node 상태 확인
```
ubuntu@aws-node1:~$ sudo docker node ls

ID                            HOSTNAME            STATUS              AVAILABILITY        MANAGER STATUS      ENGINE VERSION
6m0jz67jhevvsk9sbqklna83x *   aws-node1           Ready               Active              Leader              19.03.1
hqkfbmk7byfsboh0w6v0wjspn     aws-node2           Ready               Active                                  19.03.1
sexjhrlvhuyxjgu6w5tuwfimk     aws-node3           Ready               Active                                  19.03.1
```
node의 상태를 확인하면, node들이 모두 `Active` 되어 있고 `Ready` 중인 것을 확인할 수 있습니다.    

> 이 부분에서 오류가 난다면, EC2 인스턴스를 재부팅하거나 docker swarm을 해제하고 다시 join하시길 바랍니다.

----

ping이 node들에 잘 분산적으로 분배가 되어있는 것을 확인해보셨나요?   
그럼 이제 유지보수 모드로 진입해보겠습니다.

저는 `aws-node3`을 availability를 `Active`에서 `Drain`으로 전환해보도록 하겠습니다.

#### Drian 사용법
```
$ docker node update --availability drain [your-worker-node-name]
```
#### Drain 사용 예시
```
ubuntu@aws-node1:~$ sudo docker node update --availability drain aws-node3

aws-node3
```
위에서 배운 update 명령에 `--availablity` 옵션을 사용하여 Drain 으로 전환하였습니다.

#### Drain 상태 전환 확인
```
ubuntu@aws-node1:~$ sudo docker node ls

ID                            HOSTNAME            STATUS              AVAILABILITY        MANAGER STATUS      ENGINE VERSION
6m0jz67jhevvsk9sbqklna83x *   aws-node1           Ready               Active              Leader              19.03.1
hqkfbmk7byfsboh0w6v0wjspn     aws-node2           Ready               Active                                  19.03.1
sexjhrlvhuyxjgu6w5tuwfimk     aws-node3           Ready               Drain                                   19.03.1
```
다음과 같이 `aws-node3`이 Drain 상태로 변경된 것을 확인할 수 있습니다.

이제 서비스 ping의 상태를 확인해봅시다.

#### Ping Task 상태 확인
```
ubuntu@aws-node1:~$ sudo docker service ps ping

ID                  NAME                IMAGE               NODE                DESIRED STATE       CURRENT STATE            ERROR       
5ao38pqjme6t        ping.1              alpine:latest       aws-node2           Running             Running 11 minutes ago
tjtpthtxayhu        ping.2              alpine:latest       aws-node2           Running             Running 11 minutes ago
d15frlad5zz3        ping.3              alpine:latest       aws-node1           Running             Running 3 minutes ago
lcr9l2nqq64n         \_ ping.3          alpine:latest       aws-node3           Shutdown            Shutdown 3 minutes ago
fpcd0pnbdrzb        ping.4              alpine:latest       aws-node1           Running             Running 11 minutes ago         
```
`aws-node3`에 올라와 있던 task인 `ping.3`이 `Shutdown` 상태로 전환되었습니다.   
다른 노드인 `aws-node1`이 원래 `aws-node3`이 하던 task를 수행하고 있습니다. 

Node의 유지보수 작업을 끝냈다고 가정한 후에, 다시 Active 상태로 돌아가보겠습니다.

#### Active 사용법
```
$ docker node update --availability active [your-node-name]
```
#### Active로 상태 전환 예시 
```
ubuntu@aws-node1:~$ sudo docker node update --availability active aws-node3

aws-node3
```
`Active`로 상태를 전환한 후, 다시 task를 확인해보겠습니다.

#### Active 상태 전환 확인
```
ubuntu@aws-node1:~$ sudo docker service ps ping

ID                  NAME                IMAGE               NODE                DESIRED STATE       CURRENT STATE            ERROR       
5ao38pqjme6t        ping.1              alpine:latest       aws-node2           Running             Running 16 minutes ago
tjtpthtxayhu        ping.2              alpine:latest       aws-node2           Running             Running 16 minutes ago
d15frlad5zz3        ping.3              alpine:latest       aws-node1           Running             Running 7 minutes ago 
lcr9l2nqq64n         \_ ping.3          alpine:latest       aws-node3           Shutdown            Shutdown 7 minutes ago
fpcd0pnbdrzb        ping.4              alpine:latest       aws-node1           Running             Running 16 minutes ago               
```
`aws-node3`을 다시 Active 상태로 전환하였지만, 기존에 했던 작업을 다시 이어받아 할 수 는 없습니다.

----
#### 응용하기

그렇다면, `aws-node3`에 다시 일을 줄 수 있는 방법이 있을까요?

`aws-node3`에도 task를 다시 주고 싶다면, ping의 replicas의 수를 늘리면 가능합니다!  
서비스 ping의 수를 5까지 늘려보겠습니다. 
```
ubuntu@aws-node1:~$ sudo docker service scale ping=5

ping scaled to 5
overall progress: 5 out of 5 tasks 
1/5: running   [==================================================>] 
2/5: running   [==================================================>] 
3/5: running   [==================================================>] 
4/5: running   [==================================================>] 
5/5: running   [==================================================>] 
verify: Service converged 
```
`aws-node3`이 일을 받았는지 확인해보겠습니다.
```
ubuntu@aws-node1:~$ sudo docker service ps ping
ID                  NAME                IMAGE               NODE                DESIRED STATE       CURRENT STATE                ERROR   
5ao38pqjme6t        ping.1              alpine:latest       aws-node2           Running             Running 23 minutes ago
tjtpthtxayhu        ping.2              alpine:latest       aws-node2           Running             Running 23 minutes ago
d15frlad5zz3        ping.3              alpine:latest       aws-node1           Running             Running 15 minutes ago
lcr9l2nqq64n         \_ ping.3          alpine:latest       aws-node3           Shutdown            Shutdown 15 minutes ago
fpcd0pnbdrzb        ping.4              alpine:latest       aws-node1           Running             Running 23 minutes ago
gmj46hh8xkdb        ping.5              alpine:latest       aws-node3           Running             Running about a minute ago
```
다음과 같이, `ping.5`라는 새로운 작업을 `aws-node3`이 일을 받아 `Running` 중인 것을 볼 수 있습니다. 

---

## 2. Down 상태로 전환하기

이번에는 `aws-node2`를 강제로 중지시켜보겠습니다.

아래의 그림과 같이, AWS EC2의 인스턴스 항목에서 aws-node2를 `중지` 시킵니다.
<div><img width="500" src="https://user-images.githubusercontent.com/54167990/63670170-eea2e780-c816-11e9-90f2-dcc60d07ed4b.PNG"></div>

#### Down 확인
```
ubuntu@aws-node1:~$ sudo docker node ls

ID                            HOSTNAME            STATUS              AVAILABILITY        MANAGER STATUS      ENGINE VERSION
6m0jz67jhevvsk9sbqklna83x *   aws-node1           Ready               Active              Leader              19.03.1
hqkfbmk7byfsboh0w6v0wjspn     aws-node2           Down                Active                                  19.03.1
sexjhrlvhuyxjgu6w5tuwfimk     aws-node3           Ready               Active                                  19.03.1
```
Down을 확인 한 후, `aws-node2`의 task가 어떻게 분배되었는지 확인해보겠습니다.

#### `aws-node2` task 분배 확인
```
ubuntu@aws-node1:~$ sudo docker service ps ping
ID                  NAME                IMAGE               NODE                DESIRED STATE       CURRENT STATE               ERROR   
vi81aj8k7zha        ping.1              alpine:latest       aws-node3           Running             Running 6 minutes ago 
5ao38pqjme6t         \_ ping.1          alpine:latest       aws-node2           Shutdown            Running 6 minutes ago 
iq6y4v4129hv        ping.2              alpine:latest       aws-node3           Running             Running 6 minutes ago 
tjtpthtxayhu         \_ ping.2          alpine:latest       aws-node2           Shutdown            Running 6 minutes ago 
d15frlad5zz3        ping.3              alpine:latest       aws-node1           Running             Running 56 minutes ago
lcr9l2nqq64n         \_ ping.3          alpine:latest       aws-node3           Shutdown            Shutdown 56 minutes ago
fpcd0pnbdrzb        ping.4              alpine:latest       aws-node1           Running             Running about an hour ago
gmj46hh8xkdb        ping.5              alpine:latest       aws-node3           Running             Running 43 minutes ago              
```

`ping.1`과 `ping.2`가 원래는 `aws-node2`에서 일을 하고 있었는데,   
`aws-node3`이 이젠 ping.1과 ping.2의 task를 `Running` 하고 있는 것을 알 수 있습니다.

aws-node2에서 장애가 발생하자, `다른 노드가 장애를 감지하고 복구를 하였습니다.`

그럼 다시 aws-node2를 활성화시켜보겠습니다.

#### aws-node2 활성화

```
ubuntu@aws-node1:~$ sudo docker node ls

ID                            HOSTNAME            STATUS              AVAILABILITY        MANAGER STATUS      ENGINE VERSION
6m0jz67jhevvsk9sbqklna83x *   aws-node1           Ready               Active              Leader              19.03.1
hqkfbmk7byfsboh0w6v0wjspn     aws-node2           Ready               Active                                  19.03.1
sexjhrlvhuyxjgu6w5tuwfimk     aws-node3           Ready               Active                                  19.03.1

```
#### ping task 상태 확인
```
ubuntu@aws-node1:~$ sudo docker service ps ping
ID                  NAME                IMAGE               NODE                DESIRED STATE       CURRENT STATE                ERROR   
vi81aj8k7zha        ping.1              alpine:latest       aws-node3           Running             Running 15 minutes ago 
5ao38pqjme6t         \_ ping.1          alpine:latest       aws-node2           Shutdown            Shutdown 2 minutes ago 
iq6y4v4129hv        ping.2              alpine:latest       aws-node3           Running             Running 15 minutes ago 
tjtpthtxayhu         \_ ping.2          alpine:latest       aws-node2           Shutdown            Shutdown 2 minutes ago 
d15frlad5zz3        ping.3              alpine:latest       aws-node1           Running             Running about an hour ago
lcr9l2nqq64n         \_ ping.3          alpine:latest       aws-node3           Shutdown            Shutdown about an hour ago
fpcd0pnbdrzb        ping.4              alpine:latest       aws-node1           Running             Running about an hour ago 
gmj46hh8xkdb        ping.5              alpine:latest       aws-node3           Running             Running 52 minutes ago      
```
다시 노드를 활성화시켰지만, 원래 하던 일을 다시 받을 수 없습니다.  
위에서 실습한 `Drain` 상태로 전환하는 과정과 비슷합니다.   

#### 응용하기

Drain의 응용하기와 마찬가지로,    
`aws-node2`에 다시 일을 주기 위해 ping의 replicas의 수를 늘려봅시다!  

서비스 ping의 수를 7까지 늘려보겠습니다. 
```
ubuntu@aws-node1:~$ sudo docker service scale ping=7

ping scaled to 7
overall progress: 7 out of 7 tasks 
1/7: running   [==================================================>] 
2/7: running   [==================================================>] 
3/7: running   [==================================================>] 
4/7: running   [==================================================>] 
5/7: running   [==================================================>] 
6/7: running   [==================================================>] 
7/7: running   [==================================================>] 
verify: Service converged 
```
`aws-node2`가 일을 받았는지 확인해보겠습니다.
```
ubuntu@aws-node1:~$ sudo docker service ps ping
ID                  NAME                IMAGE               NODE                DESIRED STATE       CURRENT STATE                ERROR   
vi81aj8k7zha        ping.1              alpine:latest       aws-node3           Running             Running 19 minutes ago    
5ao38pqjme6t         \_ ping.1          alpine:latest       aws-node2           Shutdown            Shutdown 6 minutes ago    
iq6y4v4129hv        ping.2              alpine:latest       aws-node3           Running             Running 19 minutes ago    
tjtpthtxayhu         \_ ping.2          alpine:latest       aws-node2           Shutdown            Shutdown 6 minutes ago    
d15frlad5zz3        ping.3              alpine:latest       aws-node1           Running             Running about an hour ago 
lcr9l2nqq64n         \_ ping.3          alpine:latest       aws-node3           Shutdown            Shutdown about an hour ago 
fpcd0pnbdrzb        ping.4              alpine:latest       aws-node1           Running             Running about an hour ago  
gmj46hh8xkdb        ping.5              alpine:latest       aws-node3           Running             Running 56 minutes ago     
mqw15zg0fxyw        ping.6              alpine:latest       aws-node2           Running             Running 39 seconds ago     
tr3x8k809nbz        ping.7              alpine:latest       aws-node2           Running             Running 39 seconds ago     
```
다음과 같이, `ping.6`과 `ping.7` 이라는 새로운 작업을 `aws-node2`이 일을 받아 `Running` 중인 것을 볼 수 있습니다. 

---

`서비스 유지보수` 기본 단계를 모두 완료하셨습니다!     
다음 단계에서는 서비스에 **고가용성 테스트**를 하는 방법에 대해 배워보겠습니다.

> `배운 내용 복습 하기`   
[1. Drain 상태로 전환하기](#1-drain-상태로-전환하기)  
[2. Down 상태로 전환하기](#2-down-상태로-전환하기)   


> `이전 단계로 돌아가기` : [서비스 Rolling-Test하기](/4-Rolling-Test)     
> `다음 단계로 넘어가기` : [고가용성 테스트하기](/6-Service-HA)


