---
layout: post
author: sondayeon
notification: false
title: "AWS EC2 인스턴스에 Docker 설치하기 [1/6]"
description: 1# AWS EC2 인스턴스에 Docker 설치하기
image: 'https://user-images.githubusercontent.com/13447690/64077423-8323b300-cd0b-11e9-8588-fb4fa9c6a294.png'
categories:
- tutorial
date: 2019-09-01 01:05:00
tags:
- AWS
- Docker
- Docker-machine
introduction: AWS에서 EC2 인스턴스를 사용해서 `Docker`를 설치해보자.
---

# AWS에서 EC2 인스턴스에 Docker 설치하기

안녕하세요.

DSG부문 개발2팀 사원 손다연입니다.

오늘은 AWS에서 EC2 인스턴스를 사용해서 **Docker**를 설치하는 방법을 배워보겠습니다.

우선 사용 전에, OS가 `Windows`인 경우에는 가상머신을 사용하는 방법을 권장드립니다.

> 가상머신 설치하기 : [VMware install](https://m.blog.naver.com/PostView.nhn?blogId=bellship99&logNo=221164040584&proxyReferer=https%3A%2F%2Fwww.google.com%2F) 

---

### 목차는 다음과 같습니다.

[1. EC2 인스턴스 만들기](#1-ec2-인스턴스-만들기)  
[2. SSH를 통해 EC2 인스턴스에 접속하기](#2-ssh를-통해-ec2-인스턴스에-접속하기)   
[3. 접속한 인스턴스 안에 Docker를 설치하기](#3-접속한-인스턴스-안에-docker를-설치하기)  
[4. Docker-compose 설치하기](#4-docker-compose-설치하기)  
[5. Docker-machine 설치하기](#5-docker-machine-설치하기)  
[6. Docker-machine으로 AWS 드라이버 사용하기](#6-docker-machine으로-aws-드라이버-사용하기)  
[7. Docker-machine으로 EC2 인스턴스 노드 생성하기](#7-docker-machine으로-ec2-인스턴스-노드-생성하기)  

---
## 1. EC2 인스턴스 만들기

AWS 사이트에 들어가서 새로운 EC2 인스턴스를 하나 만들어 봅시다.

`서울 리전`에서 [인스턴스 시작] 버튼을 눌러 인스턴스를 만들겠습니다.

---

| 구성 | <center>값</center>|
| :---: | :---: |
| AMI | Amazon Linux AMI 2018.03.0 (HVM) |
| 인스턴스 유형 | t2.medium |
| 인스턴스 구성 | default |
| 스토리지 추가 | default |
| 태그 추가 | 키: Name, 값: AWS-Docker |     
| 보안 그룹 구성 | 새 보안 그룹 생성 후,  모든 트래픽 개방 |

---

> **TIP 1**     
> 키 페어는 기존에 쓰시던 것을 사용해도 되며, 새로운 키 페어를 생성하신 경우엔 파일을 잘 보관해주시길 바랍니다.  

> **TIP 2**        
> 가상머신을 사용하여 작업할 경우에는 가상머신 안에 키 페어 파일을 복사해서 넣어두셔야 합니다.

---

## 2. SSH를 통해 EC2 인스턴스에 접속하기

인스턴스가 생성이 되었으면, `연결` 버튼을 누릅니다.

인스턴스에 엑세스하는 방법을 그대로 따라합니다.

#### 연결 방법

```
$ chmod 400 [key-pair-path]
$ sudo ssh -i "key-pair-path" ec2-user@<instance-address>
```

#### 예시

```
$ chmod 400 dayeon_docker.pem
$ ssh -i "dayeon_docker.pem" ec2-user@ec2-54-180-188-231.ap-northeast-2.compute.amazonaws.com



       __|  __|_  )
       _|  (     /   Amazon Linux AMI
      ___|\___|___|

https://aws.amazon.com/amazon-linux-ami/2018.03-release-notes/
8 package(s) needed for security, out of 11 available
Run "sudo yum update" to apply all updates.
```
---
  
## 3. 접속한 인스턴스 안에 Docker를 설치하기 

위의 예시에서 연결한 후에 나온 문구인       
`Run "sudo yum update" to apply all updates.` 처럼        
apply 모두를 업데이트 한 후에 docker를 설치해보도록 하겠습니다.

#### Docker 설치하기

```
[ec2-user@ip-172-31-18-132 ~]$ $ sudo yum -y upgrade
[ec2-user@ip-172-31-18-132 ~]$ $ sudo yum -y install docker
```

docker가 제대로 설치되었는지 확인해보겠습니다.

#### 설치 확인하기

```
[ec2-user@ip-172-31-18-132 ~]$ docker -v
Docker version 18.09.1, build 4c52b90
```

설치되었으므로 이제 도커를 시작해보겠습니다.

#### Docker 시작하기

```
[ec2-user@ip-172-31-18-132 ~]$ sudo service docker start
```

`usermod` 명령어를 사용하여 그룹에 사용자인 `ec2-user`를 추가합니다.

#### 그룹에 사용자 추가하기
```
[ec2-user@ip-172-31-18-132 ~]$ sudo usermod -aG docker ec2-user
```
---

## 4. Docker-compose 설치하기

```
[ec2-user@ip-172-31-18-132 ~]$ sudo curl -L https://github.com/docker/compose/releases/download/1.25.0\
-rc2/docker-compose-`uname -s`-`uname -m` -o \
/usr/local/bin/docker-compose
```

설치 후에 `chmod` 명령어를 사용하여 디렉토리에 excute 권한을 추가합니다.

#### 실행권한 추가하기
```
[ec2-user@ip-172-31-18-132 ~]$ sudo chmod +x /usr/local/bin/docker-compose
```

설치가 되었는지 확인해보겠습니다.

#### 설치 확인하기

```
[ec2-user@ip-172-31-18-132 ~]$ docker-compose -v
docker-compose version 1.25.0-rc2, build 661ac20e
```

---

## 5. Docker-machine 설치하기

사용하는 운영체제에 따라서 설치하는 방법이 다릅니다.

- `MAC OS`를 실행중인 경우

```
$ base=https://github.com/docker/machine/releases/download/v0.16.0 &&
curl -L $base/docker-machine-$(uname -s)-$(uname -m) >/usr/local/bin/docker-machine &&
chmod +x /usr/local/bin/docker-machine
```
- `Linux`를 실행중인 경우

```
$ base=https://github.com/docker/machine/releases/download/v0.16.0 &&
curl -L $base/docker-machine-$(uname -s)-$(uname -m) >/tmp/docker-machine &&
sudo install /tmp/docker-machine /usr/local/bin/docker-machine
```

- Git Bash로 `Windows`를 실행하는 경우

```
$ base=https://github.com/docker/machine/releases/download/v0.16.0 &&
mkdir -p "$HOME/bin" &&
curl -L $base/docker-machine-Windows-x86_64.exe > "$HOME/bin/docker-machine.exe" &&
chmod +x "$HOME/bin/docker-machine.exe"
```

컴퓨터의 OS에 맞게 다운을 받은 후에, 다운이 잘 되었는지 확인하여 보겠습니다.

#### 설치 확인하기

```
[ec2-user@ip-172-31-18-132 ~]$ docker-machine -v
docker-machine version 0.16.0, build 702c267f
```

---

##  6. Docker-machine으로 AWS 드라이버 사용하기

우선 AWS를 드라이버로 사용하기 위하여, 환경변수를 추가하여보겠습니다.  

AWS CLI가 AWS와 상호 작용하기 위해 사용하는 설정을 구성하겠습니다.

#### 사용법

```
AWS Access Key ID [None]: [your-AWS-Access-Key-ID]
AWS Secret Access Key [None]: [your-AWS-Secret-Access-Key]
Default region name [None]: ap-northeast-2 
Default output format [None]: 
```

#### 예시

```
[ec2-user@ip-172-31-18-132 ~]$ aws configure

AWS Access Key ID [None]: AKIAIOSFODNN7EXXXX
AWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG/bPxxxxxxxxx
Default region name [None]: ap-northeast-2
Default output format [None]: 
```
아이디와 키를 입력하였고, 지역은 서울리전을 입력하였습니다.  
Output format은 지정하지 않고 `엔터키` 를 눌러서 `none` 상태를 유지하였습니다.

---

##  7. Docker-machine으로 EC2 인스턴스 노드 생성하기

Docker-machine을 사용해서 인스턴스 노드를 생성해보겠습니다.  
원하는 node의 이름을 정해서 **최소한 노드를 3개** 생성하도록 하겠습니다.

#### 사용법

```
$ docker-machine create --driver amazonec2 [node-name]
```

#### 예시

```
[ec2-user@ip-172-31-18-132 ~]$ docker-machine create --driver amazonec2 aws-node1
[ec2-user@ip-172-31-18-132 ~]$ docker-machine create --driver amazonec2 aws-node2
[ec2-user@ip-172-31-18-132 ~]$ docker-machine create --driver amazonec2 aws-node3
```
> **TIP 3**     
> 하나 생성하는데 시간이 조금 소요되기 때문에, 창을 3개를 켜 놓은 후 생성하면 시간이 단축됩니다.  

```
[ec2-user@ip-172-31-18-132 ~]$ docker-machine ls

NAME        ACTIVE   DRIVER      STATE     URL                         SWARM   DOCKER     ERRORS
aws-node1   -        amazonec2   Running   tcp://3.81.226.168:2376             v19.03.1   
aws-node2   -        amazonec2   Running   tcp://54.242.54.187:2376            v19.03.1   
aws-node3   -        amazonec2   Running   tcp://54.174.125.199:2376           v19.03.1   
```
다음과 같이 3개의 노드가 잘 설치된 것을 확인해 볼 수 있습니다.

---

도커를 설치하고 노드를 생성하는 기본 단계를 모두 완료하셨습니다!    

다음 단계에서는 방금 생성한 노드를 연결하는 **Docker-Swarm**을 만드는 방법에 대해서 배워보겠습니다.

> `배운 내용 복습 하기`    
[1. EC2 인스턴스 만들기](#1-ec2-인스턴스-만들기)  
[2. SSH를 통해 EC2 인스턴스에 접속하기](#2-ssh를-통해-ec2-인스턴스에-접속하기)   
[3. 접속한 인스턴스 안에 Docker를 설치하기](#3-접속한-인스턴스-안에-docker를-설치하기)  
[4. Docker-compose 설치하기](#4-docker-compose-설치하기)  
[5. Docker-machine 설치하기](#5-docker-machine-설치하기)  
[6. Docker-machine으로 AWS 드라이버 사용하기](#6-docker-machine으로-aws-드라이버-사용하기)  
[7. Docker-machine으로 EC2 인스턴스 노드 생성하기](#7-docker-machine으로-ec2-인스턴스-노드-생성하기) 

> `다음 단계로 넘어가기` : [Docker-Swarm 만들기](/2-Make-Swarm)
