---
layout: post
title: "4# Service Rolling 테스트하기"
description: "4# Service Rolling 테스트하기"
image: 'https://user-images.githubusercontent.com/13447690/64077423-8323b300-cd0b-11e9-8588-fb4fa9c6a294.png'
category: 'tutorial'
date: 2019-09-01 01:05:00
tags:
- Docker
- Docker Swarm
introduction: 안녕하세요.
              챕터 3에서 배운 Service가 잘 생성되었나요?
              이번 챕터는 서비스를 Rolling test 해보도록 합시다.
---

# 4# Service Rolling 테스트하기

안녕하세요.

챕터 #3에서 배운 Service가 잘 생성되었나요?

이번 챕터는 서비스를 Rolling test 해보도록 합시다.

---

### 목차는 다음과 같습니다.

[1. Update 할 서비스 생성하기](#1-update-할-서비스-생성하기)  
[2. Service Update 시작하기](#2-service-update-시작하기)   
[3. Service를 원래 모습으로 Rollback 하기](#3-service를-원래-모습으로-rollback-하기)

---

## 1. Update 할 서비스 생성하기

서비스를 유지보수하는 `Rolling update` 를 테스트해보겠습니다.  
우선 새로운 서비스를 만들어봅시다.

#### 사용법
```
$ sudo docker service create --name [service-name] --replicas [replicas-number] --update-delay [update-task-time] [image-name] [command]
```
#### 예시
```
ubuntu@aws-node1:~$ sudo docker service create --name ping --replicas 4 --update-delay 10s alpine ping docker.com

pzooezxk56himwmece2ixchic
overall progress: 4 out of 4 tasks 
1/4: running   
2/4: running   
3/4: running   
4/4: running   
verify: Service converged 
```

* `--name` : service의 이름을 정해주는 옵션으로 여기서는 `ping`이라는 이름을 사용했습니다.
* `--replicas` : 생성할 서비스를 복제하는 옵션으로 여기서는 `4`개를 복제하겠습니다.
* `--update-delay` : 생성할 서비스에 대해 Update 진행시, 각 Task에 대해서 Update하는 동안   
                      일정한 시간 간격을 두도록 설정하는 옵션입니다. 여기서는 `10초`를 간격으로 두도록 설정했습니다.
          
* `alpine` : ping이라는 이름의 서비스를 만들 때, `alpine` 이라는 이미지를 사용합니다. 그 이후 뒤의 명령을 실행합니다.                   

> [Deploy services to a swarm](https://docs.docker.com/engine/swarm/services/#configure-a-services-update-behavior)

#### 서비스가 잘 생성되었는지 확인
```
ubuntu@aws-node1:~$ sudo docker service inspect --pretty ping

ID:		pzooezxk56himwmece2ixchic
Name:		ping
Service Mode:	Replicated
 Replicas:	4
 Delay:		10s
 .
 .
 ContainerSpec:
 Image:		alpine:latest@sha256:72c42ed48c3a2db31b7dafe17d275b634664a708d901ec9fd57b1529280f01fb
 Args:		ping docker.com 
 Init:		false
```
이미지의 요약을 볼 수 있는 명령입니다.   
`--pretty` 옵션을 사용하면, 이미지 내용을 보기 편하게 출력해줍니다.  

> 서비스 생성 시 입력했던, `Name`, `Replicas`, `Delay`, `Image` 옵션이 잘 들어간 것을 확인할 수 있습니다. 

## 2. Service Update 시작하기

시작 전에, Service의 Task 상태를 확인합니다.

#### 사용법
```
$ sudo docker service ps [service-name]
```

#### 예시
```
ubuntu@aws-node1:~$ sudo docker service ps ping
ID                  NAME                IMAGE               NODE                DESIRED STATE       CURRENT STATE            ERROR       
ujvf0wlrymht        ping.1              alpine:latest       aws-node1           Running             Running 43 seconds ago       
6r1v6kyf67rg        ping.2              alpine:latest       aws-node2           Running             Running 42 seconds ago       
7j97nj3ilmbv        ping.3              alpine:latest       aws-node2           Running             Running 42 seconds ago       
ok5zuc4smhqt        ping.4              alpine:latest       aws-node3           Running             Running 43 seconds ago           
```

이제 서비스를 업데이트 해보겠습니다.   
서비스를 업데이트하면, 기존 서비스의 모든 것을 변경할 수 있습니다.  
서비스를 업데이트하면 Docker는 컨테이너를 중지하고 새로운 구성으로 다시 시작하게 됩니다.

#### 업데이트 하기

기존 이미지 대신 `alpine:3.7`을 사용하도록 update를 해보겠습니다.

```
ubuntu@aws-node1:~$ sudo docker service update --image alpine:3.7 ping

ping
overall progress: 4 out of 4 tasks 
1/4: running   [==================================================>] 
2/4: running   [==================================================>] 
3/4: running   [==================================================>] 
4/4: running   [==================================================>] 
verify: Service converged
```

#### 업데이트 확인하기
```
ubuntu@aws-node1:~$ sudo docker service ps ping
ID                  NAME                IMAGE               NODE                DESIRED STATE       CURRENT STATE                 ERROR 
wd48w9u3h3gx        ping.1              alpine:3.7          aws-node1           Running             Running 32 seconds ago           
ujvf0wlrymht         \_ ping.1          alpine:latest       aws-node1           Shutdown            Shutdown 33 seconds ago          
34tpm4819ccu        ping.2              alpine:3.7          aws-node1           Running             Running about a minute ago       
6r1v6kyf67rg         \_ ping.2          alpine:latest       aws-node2           Shutdown            Shutdown about a minute ago      
ro9m6uxjzlvg        ping.3              alpine:3.7          aws-node2           Running             Running about a minute ago       
7j97nj3ilmbv         \_ ping.3          alpine:latest       aws-node2           Shutdown            Shutdown about a minute ago      
5uvpdoztqtrd        ping.4              alpine:3.7          aws-node3           Running             Running 55 seconds ago           
ok5zuc4smhqt         \_ ping.4          alpine:latest       aws-node3           Shutdown            Shutdown 55 seconds ago            
```
모든 Task의 image가 `alpine:3.7`로 변경된 것을 확인할 수 있습니다.

Update를 한 것을 보면, 원래의 컨테이너가 `Shutdown` 된 것으로 표시되고 새로운 컨테이너가 생성되어 `Running` 상태인 것을 볼 수 있습니다.
앞에서 Delay옵션을 설정한대로, 10초 간격으로 진행되었습니다.

정리하자면, `Update`는 새로운 컨테이너를 준비한 후에 기존의 컨테이너를 Shutdown 시키고 새로운 컨테이너를 실행한다고 할 수 있습니다.

## 3. Service를 원래 모습으로 Rollback 하기

원래 모습으로 Rollback 한다는 말은 원래 모습으로 Update 한다는 의미와 비슷합니다. 

하지만, 둘의 의미가 조금 다릅니다.   
`Update`는 기존 버전에서 새로운 버전으로 가는 `상승하는 방향`이라면,   
`Rollback`은 무언가 잘 못 되었을때, 안정적인 곳으로 내려가는 `하향하는 방향`입니다.  

이제 Rollback을 사용하여 보겠습니다.

#### 사용법
```
$ docker service rollback [sevice-name]
```
#### 예시
```
ubuntu@aws-node1:~$ sudo docker service rollback ping

ping
rollback: manually requested rollback 
overall progress: rolling back update: 4 out of 4 tasks 
1/4: running   [>                                                  ] 
2/4: running   [>                                                  ] 
3/4: running   [>                                                  ] 
4/4: running   [>                                                  ] 
verify: Service converged 
```
#### Rollback 확인
```
ubuntu@aws-node1:~$ sudo docker service ps ping
ID                  NAME                IMAGE               NODE                DESIRED STATE       CURRENT STATE                 ERROR 
06w8926jif67        ping.1              alpine:latest       aws-node2           Running             Running 29 seconds ago              
wd48w9u3h3gx         \_ ping.1          alpine:3.7          aws-node1           Shutdown            Shutdown 30 seconds ago            
ujvf0wlrymht         \_ ping.1          alpine:latest       aws-node1           Shutdown            Shutdown 2 minutes ago             
3ft3avcjx0o4        ping.2              alpine:latest       aws-node1           Running             Running about a minute ago         
34tpm4819ccu         \_ ping.2          alpine:3.7          aws-node1           Shutdown            Shutdown about a minute ago        
6r1v6kyf67rg         \_ ping.2          alpine:latest       aws-node2           Shutdown            Shutdown 3 minutes ago             
edu40xkmwwck        ping.3              alpine:latest       aws-node2           Running             Running 41 seconds ago             
ro9m6uxjzlvg         \_ ping.3          alpine:3.7          aws-node2           Shutdown            Shutdown 41 seconds ago            
7j97nj3ilmbv         \_ ping.3          alpine:latest       aws-node2           Shutdown            Shutdown 3 minutes ago             
olytmrcjbf8l        ping.4              alpine:latest       aws-node3           Running             Running 53 seconds ago             
5uvpdoztqtrd         \_ ping.4          alpine:3.7          aws-node3           Shutdown            Shutdown 54 seconds ago            
ok5zuc4smhqt         \_ ping.4          alpine:latest       aws-node3           Shutdown            Shutdown 3 minutes ago   
```
Update와 비슷한 과정으로 보여집니다.   
Rollback을 하여도 원래의 컨테이너로 돌아가는 것이 아닌, 새로운 컨테이너가 실행됩니다.   

---

`Rolling test` 기본 단계를 모두 완료하셨습니다!     
다음 단계에서는 서비스의 **상태를 전환** 하는 방법에 대해 배워보겠습니다.

> `배운 내용 복습 하기`   
[1. Update 할 서비스 생성하기](#1-update-할-서비스-생성하기)  
[2. Service Update 시작하기](#2-service-update-시작하기)   
[3. Service를 원래 모습으로 Rollback 하기](#3-service를-원래-모습으로-rollback-하기)


> `이전 단계로 돌아가기` : [서비스 만들기](/3-Make-Service)     
> `다음 단계로 넘어가기` : [서비스 상태 전환하기](/5-Service-Transform)


