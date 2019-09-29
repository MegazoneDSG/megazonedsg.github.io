---
layout: post
author: seungpilpark
notification: true
title: "1# 그럭저럭 돌아가는 Kafka 운영 환경 빨리 만들기"
description: Kafka 운영 환경 만들어보면서 쓰는 글
image: "https://user-images.githubusercontent.com/13447690/65836936-bb7bd880-e32d-11e9-8e41-073bc346abea.png"
categories:
- tutorial
date: 2019-09-30 02:05:00
tags:
- kafka
introduction: Kafka 운영 환경 만들어보면서 쓰는 글
twitter_text: Kafka 운영 환경 만들어보면서 쓰는 글
---

이 글은 다음과 같은 분들을 위해 쓰였습니다.

- Kafka 운영환경을 당장 구축해서 써먹어야 한다.
- Kafka 를 아주 자세하게 공부할 시간은 없다.
- Kafka 운영환경에 많을 돈을 쓸 예산은 없다.

저도 현재 위와 같은 상황에 직면 했는데요, 저와 같은 상황에 놓이신 분을 위해 아주 빠르고 저렴하게 설치하는 법을 알아보겠습니다.

# 가벼운 설명

카프카는 분산 메시지 처리 시스템입니다. 다음과 같은 유즈케이스에 쓰이고, 요즈음에는 안 끼어드는 분야가 없는 녀석이죠.

- 마이크로 서비스 간의 비동기 메시지 처리
- 멀리 떨어진 시스템 간의 데이터 동기화
- 로그 분석, 수집, 스트리밍 처리, 그 외 "대용량" 단어가 들어가는 곳에 일단 넣어두면 그럭저럭 쓰임

당장 설치해서 쓰고싶어하시는 분들을 위해, 설명은 그림 한장으로 대체하도록 합니다.

![](https://user-images.githubusercontent.com/13447690/65837196-693bb700-e32f-11e9-889a-bb6fb09dff57.png)


# 환경 선택

많은 분들이 이미 인터넷 서칭을 통해 여러가지 Kafka 설치 옵션을 헤매다 오셨을 겁니다.

아래 환경들은 제가 몇일동안 시도해보고 각 환경의 특징을 추려본 결과입니다.

## wurstmeister

[https://github.com/wurstmeister/kafka-docker](https://github.com/wurstmeister/kafka-docker)

- 난이도 ★☆☆☆☆
- 유지비 ★★★☆☆
- 안정성 ★★☆☆☆

수많은 블로그에 **Kafka 시작하기** 관련 글에 빠지지 않고 등장하는 Docker 로 패키징 된 카프카입니다.  말 그대로 시작하는 용도 이므로 운영환경에 써야 한다면 Dockerfile 에 튜닝을 좀 하셔야 합니다.  에코 시스템과 모니터링도 별도로 서치해서 하나하나 추가 하셔야 하므로 시간상 패스.
  
## AWS ECS 
  
- 난이도 ★★★★☆
- 유지비 ★☆☆☆☆
- 안정성 ★★★☆☆
 
 Kafka Docker 와 Zookeeper Docker 를 직접 말아올려서, AWS ECS 에서 운영하는 방법입니다. 컨테이너 오케스트레이터 에서 관리되는 만큼 유지비와 안정성은 양호합니다.  

그런데 Kafka 는 Zookeeper 분산 트랜잭션 코디네이터 시스템을 사용하기 때문에, 컨테이너 끼리 IP, Port 를 서로 알고있어야 하고, 각 컨테이너는 고유의 퍼시스턴트 디스크 볼륨을 사용해야 하기 때문에 관련한 설정을 마추어야 합니다.  

컨테이너 구동 설정에 awk 와 aws 메타데이터 api 를 마구 써주어야 하기 때문에 많이 피곤할 수 있습니다.  에코 시스템과 모니터링도 별도로 서치해서 이런 과정을 거쳐야 합니다. 시간이 없으신 분들은 패스하도록 합시다. 

## Confluent Platform Community (on AWS EC2)
 
- 난이도 ★★☆☆☆
- 유지비 ★★★☆☆
- 안정성 ★★★★☆

[https://www.confluent.io/](https://www.confluent.io/)  요즘에 Kafka 관련 에코시스템을 많이 출시하고 있는 아주 핫한 회사죠.  KSQL, Kafka Connect 등 마이크로 서비스 세계에서 고민했던 많은 부분들을 해결해 주고 있습니다.  엔터프라이즈, 커뮤니티 버젼이 있는데 이 글을 보시는 분들은 저렴한 걸 원함으로 커뮤니티 버젼으로 진행하겠습니다.

일단, [System Requirement](https://docs.confluent.io/current/installation/system-requirements.html) 를 보시면 다음과 같은 어마어마한 스펙이 필요하다고 겁을 줍니다. 클라우드 비용으로 월 수천만원이 들어가겠네요.

| Component       | Nodes | Storage                                                                                                                                        | Memory                                                       | CPU                                                                                              |
|-----------------|-------|------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| Control Center  | 1     | 300 GB, preferably SSDs                                                                                                                        | 32 GB RAM (JVM default 6 GB)                                 | 8 cores or more                                                                                  |
| Broker          | 3     | 12 X 1 TB disk. RAID 10 is optional                                                                                                            | 64 GB RAM                                                    | Dual 12 core sockets                                                                             |
|                 |       | Separate OS disks from Apache Kafka® storage                                                                                                   |                                                              |                                                                                                  |
| Connect         | 2     | Only required for installation                                                                                                                 | 0.5 - 4 GB heap size depending on connectors                 | Typically not CPU- bound. More cores is better than faster cores.                                |
| KSQL            | 2     | Use SSD. Sizing depends on the number of concurrent queries and the aggregation performed.                                                     | 20 GB RAM                                                    | 4 cores                                                                                          |
| REST Proxy      | 2     | Only required for installation                                                                                                                 | 1 GB overhead plus 64 MB per producer and 16 MB per consumer | 16 cores to handle HTTP requests in parallel and background threads for consumers and producers. |
| Schema Registry | 2     | Only required for installation                                                                                                                 | 1 GB heap size                                               | Typically not CPU- bound. More cores is better than faster cores.                                |
| ZooKeeper       | 3-5   | Transaction log: 512 GB SSD                                                                                                                    | 32 GB RAM                                                    | 2-4 Cores                                                                                        |
|                 |       | Storage: 2 X 1 TB SATA, RAID 10                                                                                                                |                                                              |                                                                                                  |
|                 |       | Each write to ZooKeeper must be persisted in the transaction log before the client gets an ack. Using SSD reduces the ZooKeeper write latency. |                                                              |                                                                                                  |

위의 스펙은 권장 사양 이므로, 따를 이유는 없습니다. 운영하려는 시스템의 성격에 맞게 정해주시면 되는데요, 저처럼 MSA 이벤트 딜리버리 용으로 분당 수백건 정도의 메시지 처리만 하면 된다면 아래의 스펙으로 진행하셔도 됩니다.

## AWS EC2 시스템 사양

- m5.large (2core / 8GiB)  * 3대.
- 100GB EBS 스토리지 * 3개.

데이터 레플리카 위해 3대의 브로커 기준으로, 월 비용 40 만원 가량 소요됩니다.
 
## Install  
  
[Install Docker & Docker Compose on EC2](https://megazonedsg.github.io/1-Make-Docker/)  을 통해 Docker 와 Docker compose 를 준비해 줍니다.
  
## Disk mount  

Zookeeper 데이터와 Kafka 데이터를 영구 디스크에 저장해야 장애가 나도 복원이 가능하겠죠. 

[https://docs.aws.amazon.com/ko_kr/AWSEC2/latest/UserGuide/ebs-attaching-volume.html](https://docs.aws.amazon.com/ko_kr/AWSEC2/latest/UserGuide/ebs-attaching-volume.html) 을 통해 EBS 볼륨을 EC2 에 마운트 합니다.

마운트 한 이후에 파일 시스템을 생성합니다.

```  
$ lsblk  
NAME          MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT  
nvme0n1       259:1    0    8G  0 disk  
|-nvme0n1p1   259:2    0    8G  0 part /  
`-nvme0n1p128 259:3    0    1M  0 part  
nvme1n1       259:0    0  100G  0 disk  
  
$ sudo file -s /dev/nvme1n1  
/dev/nvme1n1: data  
  
$ sudo mkfs -t xfs /dev/nvme1n1  
meta-data=/dev/nvme1n1           isize=512    agcount=4, agsize=6553600 blks  
 =                       sectsz=512   attr=2, projid32bit=1 =                       crc=1        finobt=1, sparse=0data     =                       bsize=4096   blocks=26214400, imaxpct=25  
 =                       sunit=0      swidth=0 blksnaming   =version 2              bsize=4096   ascii-ci=0 ftype=1  
log      =internal log           bsize=4096   blocks=12800, version=2  
 =                       sectsz=512   sunit=0 blks, lazy-count=1realtime =none                   extsz=4096   blocks=0, rtextents=0  
```

마운트 할 디렉토리를 생성합니다.

```
$ sudo mkdir /data
```
 
디스크 옵션 파일에, 마운트 지점 및 파일시스템을 설정합니다. `blkid` 실행시 나오는 `UUID` 항목을 잘 보고 넣도록 합니다.

```
$ sudo cp /etc/fstab /etc/fstab.orig  
  
$ sudo blkid  
/dev/nvme0n1p1: LABEL="/" UUID="30bc2d31-3d87-4039-b63f-7b6acbff282d" TYPE="ext4" PARTLABEL="Linux" PARTUUID="fd0b0ede-242e-4abd-821c-a58f9d7af840"  
/dev/nvme1n1: UUID="35945ffa-50ba-4da0-afe0-c44aca09b9e0" TYPE="xfs"  
/dev/nvme0n1: PTTYPE="gpt"  
/dev/nvme0n1p128: PARTLABEL="BIOS Boot Partition" PARTUUID="faaa3498-ed3f-427c-98de-81423d90a08c"  
  
$ sudo vi /etc/fstab  
.  
.  
UUID=35945ffa-50ba-4da0-afe0-c44aca09b9e0  /data  xfs  defaults,nofail  0  2  
```  

마운트를 완료하고,  `df` 명령어를 통해 `/data` 폴더에 100GB 디스크 마운트 된 것을 확인합니다.

```
$ sudo mount -a    
$ df -h  
Filesystem      Size  Used Avail Use% Mounted on  
devtmpfs        3.8G   60K  3.8G   1% /dev  
tmpfs           3.8G     0  3.8G   0% /dev/shm  
/dev/nvme0n1p1  7.9G  1.4G  6.4G  18% /  
/dev/nvme1n1    100G  135M  100G   1% /data  
```  
  
### Prepare Volume  

마운트 한 디렉토리에, **Confluent Platform** 에서 사용할 데이터 폴더를 다음과 같이 만들어 줍니다.

```  
# Create dirs for Kafka / ZK data  
sudo mkdir -p /data/zk-data  
sudo mkdir -p /data/zk-txn-logs  
sudo mkdir -p /data/kafka-data  
  
# Make sure user 12345 has r/w permissions  
sudo chown -R 12345 /data/zk-data  
sudo chown -R 12345 /data/zk-txn-logs  
sudo chown -R 12345 /data/kafka-data  
```  
  
### Download Confluent Platform  
  
다음의 **Confluent Platform** 도커 이미지 샘플 레파지토리를 다운받고,  **5.3.1-post branch** 를 맞춰주도록 합니다.
  
```  
$ sudo yum install git -y  
$ git clone https://github.com/confluentinc/examples  
$ cd examples  
$ git checkout 5.3.1-post  
```

### Edit docker-compose file

**cp-all-in-one** 폴더로 이동하여, **docker-compose.yml** 파일을 수정합니다. 해당 파일에 많은 에코시스템이 있는데,  엔터프라이즈 라이선스를 사고 써야 하는 것은 삭제하고 사용해야 합니다. **ksql, kafka-connect** 까지는 사용 가능합니다. 해당 이미지를 참조하도록 합니다.

![](https://user-images.githubusercontent.com/13447690/65837944-36e28780-e338-11e9-9a7c-88be349e5a38.png) 

- broker 호스트 관련 부분은 각자 환경의 도메인에 맞추어 변경 해 주도록 합니다.
- 해당 파일은 싱글 브로커 설정입니다. 

```
$ cd cp-all-in-one/  
$ vi docker-compose.yml  
  
version: '2'
services:
  zookeeper:
    image: confluentinc/cp-zookeeper:5.3.1
    hostname: zookeeper
    container_name: zookeeper
    ports:
      - "2181:2181"
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    volumes:
      - /data/zk-data:/var/lib/zookeeper/data
      - /data/zk-txn-logs:/var/lib/zookeeper/log

  broker:
    image: confluentinc/cp-enterprise-kafka:5.3.1
    hostname: kafka.wmpmzdev.com
    container_name: broker
    depends_on:
      - zookeeper
    ports:
      - "29092:29092"
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: 'zookeeper:2181'
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka.wmpmzdev.com:29092,PLAINTEXT_HOST://localhost:9092
      KAFKA_METRIC_REPORTERS: io.confluent.metrics.reporter.ConfluentMetricsReporter
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS: 0
      CONFLUENT_METRICS_REPORTER_BOOTSTRAP_SERVERS: kafka.wmpmzdev.com:29092
      CONFLUENT_METRICS_REPORTER_ZOOKEEPER_CONNECT: zookeeper:2181
      CONFLUENT_METRICS_REPORTER_TOPIC_REPLICAS: 1
      CONFLUENT_METRICS_ENABLE: 'true'
      CONFLUENT_SUPPORT_CUSTOMER_ID: 'anonymous'
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: 'false'

    volumes:
      - /data/kafka-data:/var/lib/kafka/data
 ```

운영에서 GUI 도 필요한데,  컨플루언트의 **Control Center** 가 유료이므로 다음의 무료 대체제를 추가합니다.

```
  kafka_manager:
    depends_on:
      - zookeeper
      - broker
    image: hlebalbau/kafka-manager:stable
    ports:
      - "9000:9000"
    environment:
      ZK_HOSTS: "zookeeper:2181"
      APPLICATION_SECRET: "random-secret"
    command: -Dpidfile.path=/dev/null
```

## Run

Docker compose 를 실행합니다.

```
$ docker-compose up -d --build  
  
 Creating network "cp-all-in-one_default" with the default driver Creating zookeeper ... done Creating broker    ... done Creating cp-all-in-one_kafka_manager_1 ... done
```

실행 한 후 **http://domain:9000** 으로 접속한 후 아래와 같이 컨트롤 할 클러스터 정보를 입력합니다. 

Zookeeper Host 가 중요한데, docker-compose.yml 의  **KAFKA_ZOOKEEPER_CONNECT** 에서 설정했던 값을 넣어주도록 합니다.

![](https://user-images.githubusercontent.com/13447690/65838066-f421af00-e339-11e9-83f9-10264d979aa5.png)


다음과 같이 브로커 정보가 정상적으로 뜨면 됩니다.

![](https://user-images.githubusercontent.com/13447690/65838069-fc79ea00-e339-11e9-808a-ab26c13e4ad0.png)

