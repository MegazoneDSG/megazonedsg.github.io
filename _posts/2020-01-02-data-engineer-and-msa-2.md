---
layout: post
author: seungpilpark
notification: true
title: "2# 데이터 엔지니어와 마이크로 서비스 구축 SI 프로젝트"
description: 2# 데이터 엔지니어와 마이크로 서비스 구축 SI 프로젝트
image: "https://user-images.githubusercontent.com/13447690/71647290-dd736580-2d37-11ea-8868-c3a5775a00bc.png"
categories:
- msa
date: 2020-01-02 10:00:00
tags:
- msa
introduction: 2# 데이터 엔지니어와 마이크로 서비스 구축 SI 프로젝트
twitter_text: 2# 데이터 엔지니어와 마이크로 서비스 구축 SI 프로젝트
---

[1# 데이터 엔지니어와 마이크로 서비스 구축 SI 프로젝트](https://megazonedsg.github.io/data-engineer-and-msa-1/)

많은 경험있는 프로젝트 리더들은 이전 포스팅 된 글에서 나온 실시간성 데이터 이관 문제를 해결하기 위해 ETL(Extract, Transform, Load) 과정을 떠올릴 수 있습니다.

그리고 ETL 을 수행하기 위해 어떠한 유형의 솔루션을 선택해야 할 지 선택하게 됩니다.
그리고 앞선 상황에서 "TB 단위의 데이터", "새로운 데이터베이스" 등의 키워드 때문에 데이터 분석 전문가를 찾게 되고, 실시간 스트리밍 분석 엔진 또는 데이터웨어 하우스, 또는 둘 다 필요하다는 답변을 들을 것입니다.

이 개념들의 이해를 돕도록, 대표적 솔루션인 Apache Spark(실시간 스트리밍 분석 엔진) 와 AWS Redshift(데이터웨어 하우스) 를 비교하여 설명드리겠습니다.

## Spark 와 Redshift 

이 두가지는 무었이며, 어떨 때 사용해야 할까요?
하나의 비유를 드리겠습니다. 식기 세척기 나 냉장고 중 어느 것이 더 낫습니까? 어느 것을 선택해야 합니까? 둘 다 전기 제품 이지만 각기 다른 용도로 사용됩니다.

Spark 와 Redshift도 마찬가지입니다.

Spark 는 머신 러닝 및 스트리밍 데이터와 같은 메모리에서 복잡한 데이터 프로세스를 처리 할 수있는 데이터 처리 엔진입니다.
Redshift 는 대규모 분산 데이터웨어 하우스입니다. 모두 SQL 을 기반한 데이터 처리가 가능합니다.

실리콘 밸리에서 가장 앞선 기술 스타트 업을 본다면 Spark와 Redshift 를 모두 사용하고 있을 것입니다. 스파크는 요즘 MSA 구성의 데이터 처리에 조금 더 적합한 엔진으로써 주목을 받고 있습니다. 그러나 서로 다른 use case ("식기 세척기 대 냉장고") 를 다루고 있습니다.

프로젝트 리더가 무엇을 사용 할 것인지 의사 결정을 할 수 있는 목차를 정리 해 보도록 하겠습니다.

1. What it is
2. Data architecture
3. Redshift and Spark: Data engineering


## WHAT IT IS

### Spark

Apache Spark 는 데이터 프로세스 엔진입니다. 스파크로 할 수 있는 것은 다음과 같습니다:

- 실시간으로 배치 또는 스트리밍 워크로드를 처리합니다.
- Java, Scala, Python, R 등의 언어로 어플리케이션을 구현할 수 있습니다.
- pre-built 된 라이브러리를 사용하여 몇줄 이내의 코드로 어플리케이션을 구성할 수 있습니다.

스파크는 탑 레벨의 엔진인 Spark Core 와 부가 기능을 제공하는 여러 에코시스템 모듈로 구성되어 있습니다.

![](https://qph.fs.quoracdn.net/main-qimg-8a397bda9e4baeafdbbd4fb326c0dbda.webp)

Source: [Databricks](https://databricks.com/spark/about)

[Spark 를 선호하는 사람들](https://mapr.com/blog/5-minute-guide-understanding-significance-apache-spark/) 은 다음의 3가지 이유에서 입니다:

1. Spark 는 데이터를 클러스터에 분산시키고 해당 데이터를 병렬로 처리하기 때문에 빠릅니다. 
또한 맵리듀스와 같이 디스크에 데이터를 저장하는 것과 다르게, 메모리에 데이터를 보관하고 처리합니다.

2. Spark는 추상화 수준이 높기 때문에 적은 코드로 응용 프로그램을 작성할 수 있으므로 사용하기 쉽습니다.

3. Spark는 사전 구축 된 라이브러리(e.g 머신 러닝, 스트리밍, 데이터수집 함수) 를 통해 확장 가능합니다. 이 라이브러리는 Spark 오피셜 모듈 또는 3rd party 프로젝트로 제공됩니다.

요약하면, Spark 는 개발 속도를 높이고 응용 프로그램을 보다 이식/확장이 가능하게 하고 데이터 처리 작업을 기존 데이터베이스 보다 더 빠르게 실행할 수 있도록 하는 것 입니다.

Spark에서 주목할만한 몇 가지 사항입니다:

- Spark는 오픈 소스이므로 다운로드하여 직접 실행할 수 있습니다 ex. 아마존의 [EC2](https://spark.apache.org/docs/1.6.2/ec2-scripts.html) Spark를 만든 사람들이 만든 [Databricks](https://databricks.com/company/about-us)

- Spark는 데이터베이스가 아닙니다. Spark가 데이터를 가져올 수있는 일종의 영구 데이터 스토리지가 필요합니다 (e.g Amazon S3 또는 [Redshift](https://databricks.com/blog/2015/10/19/introducing-redshift-data-source-for-spark.html) 와 같은 데이터 소스).

- Spark 는 쿼리를 처리하기 위해 데이터를 메모리로 읽어들입니다. 프로세스가 완료되면 Spark는 결과를 저장하거나 전달할 장소가 필요합니다 (Spark는 데이터베이스가 아니기 때문입니다). S3 로 결과를 재 적재 하거나, [S3 -> Redshift](http://docs.aws.amazon.com/redshift/latest/dg/t_Loading-data-from-S3.html) 로 적재되도록 구성 할 수도 있습니다.

![](https://qph.fs.quoracdn.net/main-qimg-d26325b3cb137524dd16414ad2e97774.webp)

소스 : [Spark Streaming - Spark 2.1.1 Documentation](https://spark.apache.org/docs/latest/streaming-programming-guide.html)

Spark ("write applications" part) 를 사용하려면 코드를 작성하는 방법을 알아야합니다. 따라서 Spark를 사용하는 사람들은 일반적으로 개발자 입니다.

### Redshift

Amazon Redshift는 분석 데이터베이스 입니다. Redshift를 사용하면 다음을 수행 할 수 있습니다:

- 여러 소스의 데이터를 통합하는 중앙 데이터웨어 하우스 구축
- SQL을 사용하여 크고 복잡한 분석 쿼리 실행
- 보고서를 작성하고 대쉬 보드 또는 다른 어플리케이션에 전달

Redshift는 Amazon에서 제공하는 매니지드 서비스입니다. 원시 데이터는 Redshift ("ETL"이라고 함) 로 흘러 가며 regular cadence ("transformation" 또는 "aggregations") 또는 ad-hoc basis ("ad-hoc queries") 로 처리 및 변환됩니다. 데이터를 로드하고 변환하는 이 일련의 과정의 또 다른 용어는 "data pipelines" 입니다.

아래 이미지는 Amazon Redshift Architecture 및 쿼리 흐름에 대한 개요를 제공합니다.

![](https://qph.fs.quoracdn.net/main-qimg-7f02ca40ac23eb1d2598f61b3253b45f)

소스: [A DBA’s Guide to the Amazon Redshift Architecture](https://www.intermix.io/blog/a-dbas-guide-to-the-amazon-redshift-architecture-the-5-components-you-need-to-understand/)

Redshift 를 선호하는 사람들은 다음의 3가지 이유에서 입니다:

1. Redshift 는 대규모 병렬 처리(MPP) 아키텍처를 사용하여 쿼리를 분산하고 병렬화하기 때문에 속도가 빠릅니다. Redshift는 높은 쿼리 동시성을 허용하고 메모리에서 쿼리를 처리합니다. (spark 처럼 메모리에 데이터를 항시 보관하는 것은 아닙니다. 데이터 전처리 시점에는 디스크로부터 데이터를 읽어들입니다. 따라서 spark 보다는 처리속도가 느리며, 리얼타임으로 처리 할 수는 없습니다.)

2. Redshift는 구조화 / 반 구조화 / 비 구조화 데이터 세트 (S3 또는 DynamoDB를 통해) 를 모두 담을 수 있고, 페타 바이트 이상까지 수집 한 다음 익숙한 SQL 형식으로 데이터를 슬라이스 할 수 있기 때문에 사용하기 쉽습니다.

3. Redshift는 저렴한 요금으로 1 년에 $935/TB 의 요금으로 데이터를 저장할 수 있기 때문에 저렴합니다 (3년 예약 인스턴스 요금을 사용하는 경우). 이러한 가격대는 데이터웨어 하우스 계열에서는 매우 저렴한 편입니다.

요약하면, Redshift 는 데이터웨어 하우징을 보다 저렴하고 빠르며 쉽게 만들 수 있습니다. 일반적인 RDBMS 보다 더 다양한 소스를 사용하여 훨씬 더 크고 복잡한 데이터 세트를 분석 할 수 있습니다.

Redshift 에서 몇 가지 주목할만한 점:

- Redshift는 완전 관리형 매니지드 서비스 입니다. 그러나 "완전 관리" 는 오해의 소지가 있습니다. 성능을 높이기 위해 튜닝 작업을 해야 할 것이 많습니다. [Amazon Redshift 를 위한 10가지 성능 튜닝 기법](https://aws.amazon.com/ko/blogs/korea/top-10-performance-tuning-techniques-for-amazon-redshift/) 을 참조할 수 있습니다.

- 처음에는 비어있는 클러스터가 생성되기 때문에 데이터를 채우는 과정이 필요합니다. BI(비즈니스 인텔리전스) 목적으로 데이터를 분석하고 보고하기 위해 데이터를 빠르게 채울 수있는 많은 ETL(데이터 통합) 도구가 있습니다.

- Redshift는 데이터베이스이므로 원시 데이터 기록과 변환 결과를 저장할 수 있습니다. 현재 Amazon은 데이터를 저장하는 훨씬 저렴한 방법 으로 S3의 데이터에 대해 쿼리를 실행할 수있는 Redshift Spectrum 을 사용할 수 있습니다.

![](https://qph.fs.quoracdn.net/main-qimg-913d4a606336ed26c4a03234bb8a2c9e.webp)

Source: [Automating Analytic Workflows on AWS](https://aws.amazon.com/blogs/big-data/automating-analytic-workflows-on-aws/)

Redshift 를 사용하기 위해서는 코드를 작성할 필요는 없습니다. 대신 use case 에 따라 결과 도출을 위해 크고 복잡한 SQL 작성 능력이 필요합니다.
 따라서 Redshift 을 주로 사용하는 직군은 데이터 사이언티스트 또는 비즈니스 분석가 입니다.

### Spark and Redshift Summary

위에서 정리한 내용을 표로 도출하면 다음과 같습니다.

![](https://qph.fs.quoracdn.net/main-qimg-a2abf2226539cd33eeef63da413807f7.webp)

## DATA ARCHITECTURE

간단한 데이터 분석 아키텍처를 구성한다고 해도 둘 중 하나만 사용하는 경우보다는, 둘다 사용하는 방식이 많이 선호됩니다.
Spark를 사용하여 응용 프로그램을 구축 한 다음 데이터의 소스 / 결과 저장 대상으로 Redshift 를 사용하는 방식 등 입니다.

이렇게 구성하는 이유는 Spark와 Redshift가 데이터를 처리하는 방식이 다르고 결과를 산출하는 데 걸리는 시간이 다르기 때문입니다.

Spark를 사용하면 실시간 스트림 처리를 수행 할 수 있습니다. 즉, 데이터 스트림의 이벤트에 대한 실시간 응답을 얻습니다.
Redshift를 사용하면 **거의 실시간에 가까운** (실시간은 아닙니다) 배치 작업을 수행 할 수 있습니다. 즉, 데이터 스트림에서 소량의 이벤트를 수집 한 다음 Redshift 쿼리를 실행하여 이벤트에 대한 응답을 얻을 수 있습니다.

### Example: Fraud detection

매우 간단한 예를 들어보겠습니다.

예를 들어 비트코인 사기 거래를 실시간으로 감지해야 하는 경우 Spark 로 어플리케이션을 만들어야 합니다. 비트코인 거래의 흐름이 거의 실시간에 가까운 특성을 고려할 때 Redshift 는 이 경우에 적합하지 않습니다.

그러나 사기 거래 탐지 예측을 더 정교하게 판단하기 위해서 더 많은 작업이 필요하다고 가정 생각 해 봅시다. 

Spark 에서는 실시간성으로 사기 예측을 하기 위해 Spark MLlib 을 통해 생성된 model 이 메모리 상에 존재하게 됩니다. 그리고 트랜잭션 이벤트가 도달했을 때, Prediction 작업을 수행하여 사기 패턴 여부를 판단합니다. 이 작업은 아주 찰나의 순간에 행해지게 됩니다.

하지만, 현실에서는 경량화 된 ML 모델을 통해 예측한 결과에만 의존해 사기라고 판단하고 거래를 중단시키지는 않습니다.

Spark 에서 트랜잭션 데이터를 Redshift 로 로드합니다. Redshift 에서 사기 패턴에 대한 과거 데이터와 join 합니다. (이 데이터는 모델학습을 위해 샘플링 된 데이터 셋이 아닌 실제 과거의 모든 사기 트랜잭션에 대한 기록입니다.) 그러나 실시간으로 거래를 차단하기에는 결과가 너무 늦게 도착합니다. 따라서 Spark 를 사용하여 ML model 에서 선처리를 통해 트랜잭션을 실시간으로 차단 한 다음 Redshift 의 결과가 나올 때까지 기다렸다가 계속 차단할지 여부를 결정하게 됩니다.

Amazon Big Data Blog 에 Redshift 와 Spark 를 모두 사용하는 또 다른 예가 있습니다.

[“Powering Amazon Redshift Analytics with Apache Spark and Amazon Machine Learning](https://aws.amazon.com/blogs/big-data/powering-amazon-redshift-analytics-with-apache-spark-and-amazon-machine-learning/)

이 예제는 비행기 연착 가능성을 예측 해 주는 어플리케이션을 Redshift 와 Spark 를 통해 처리하는 방법에 대해 설명하고 있습니다.

## REDSHIFT & SPARK: DATA ENGINEERING

위의 활용 방안에서 보듯이 개발자 / 비즈니스 인텔리전스 분석가 / 데이터 사이언티스트 사이의 경계가 사라지고 있습니다. 그 결과 데이터 엔지니어링이라는 새로운 직업이 생겨났습니다. 

Maxime Beauchemin 는 다음과 같이 데이터 엔지니어링에 대해 정의하였습니다.

"기존의 역할과 관련하여, 데이터 엔지니어링 분야는 소프트웨어 엔지니어링에서 더 많은 소스를 가져오고 'Big Data' 분산 시스템의 운영을 통합하는 비즈니스 인텔리전스 및 데이터웨어 하우징의 상위 집합입니다."

Spark는 "Big Data" 분산 시스템입니다. Redshift 는 데이터웨어 하우징 부분입니다. 
데이터 엔지니어링은 이 두 가지를 결합한 학문입니다. 
데이터웨어 하우징 의 활용 분야가 어플리케이션 코드 작성이 필요한 쪽으로 발전하고 있기 때문입니다.
코드 작성을 통해 Redshift에 공급되는 데이터 파이프 라인을 작성합니다. 이후, 엔드 유저에게 베너핏을 주기 위해서는 클러스터 내부에 있는 데이터를 Spark 에서 변환하고 재 가공해야 하는 시나리오가 등장할 가능성이 큽니다. 
이것은 이제 단순히 SQL을 아는 것만으로는 더 이상 충분하지 않다는 것을 의미합니다. 
코드 작성 방법을 알아야 하기 때문에 "데이터 엔지니어" 이라고 부를 수 있습니다. 

빅 데이터 아키텍처의 경우 각각 가장 적합한 특정 사용 사례를 충족하기 위해 각각 Redshift 와 Spark 를 사용하게 될 것입니다.

이제 다음글에서는 본론으로 돌아가서, 왜 MSA SI 프로젝트 리더들이 데이터 엔지니어링 개념을 알아야 하고, SI 프로젝트에서 DT 생산성 (디지털 트랜스포메이션 가격 경쟁력) 을 결정짓는 중요한 부분을 차지하는 지 알아보겠습니다.

[3# 데이터 엔지니어와 마이크로 서비스 구축 SI 프로젝트](https://megazonedsg.github.io/data-engineer-and-msa-3/)
