---
layout: post 
author: seungpilpark 
notification: true 
title: "AWS 레드시프트 스펙트럼 실습해보기"
description: AWS 레드시프트 스펙트럼 실습해보기
image: "https://user-images.githubusercontent.com/13447690/125046633-29dff400-e0d9-11eb-9d03-b59ba0285fb0.gif"
categories:
- aws 
date: 2021-07-09 11:00:00 
tags:
- redshift
- bpmn
- aws 
introduction: AWS 레드시프트 스펙트럼 실습해보기 
twitter_text: AWS 레드시프트 스펙트럼 실습해보기
---

# AWS 레드시프트 스펙트럼 실습해보기

AWS 레드시프트 스펙트럼을 현장에서 사용한지 6개월 가량이 넘어갔습니다. 
업무 인수인계시 작성한 부분을 일부 수정하여 공유합니다. 
AWS 레드시프트 생성과정과, 접속환경 가이드는 생략하였습니다. 
접속툴은 Intellij 의 데이터베이스 -> 레드시프트 데이터소스 입니다.

# 레드시프트 External Schema

## S3 데이터와 External Schema 는 어떻게 매핑되어 있나?

레드시프트 클러스터가 내부의 테이블 대신 외부 테이블로 S3 를 연결하면 저렴한 가격에 큰 규모의 데이터를 효율적으로 사용이 가능합니다. S3 데이터소스와 연결가능한 테이블은 외부 데이터 매핑 전용 스키마인 External Schema 를 생성하고, 해당 스키마 내부에 테이블을 생성함으로써 사용이 가능합니다. 
External Schema 를 생성하면 Glue 카달로그에 해당 스키마의 네임스페이스가 생성됩니다. 
AWS Glue 카달로그는 레드시프트 뿐 아니라 RDS, HIVE, S3, DynamoDB 등 여러종류의 데이터소스의 테이블 정보와 실제 정보를 매핑하여 보관하고 있는 서비스입니다. 
AWS Glue 에서 제공하는 Spark Sql 을 사용하는 것 만으로도 RDS 와 S3, RDS 와 레드시프트 간의 Join 쿼리를 동작하게 할 수도 있습니다.

## 어떻게 동작하는가?

### 스캔 범위 추출 단계

Redshift Spectrum 쿼리를 Amazon Redshift 클러스터의 리더 노드에 제출 하면, 리더 노드는 쿼리 실행을 최적화 하여 Amazon Redshift 클러스터의 컴퓨팅 노드로 전달합니다. 
다음으로 컴퓨팅 노드는 데이터 카탈로그에서 외부 테이블을 설명하는 정보를 가져옵니다. 
그 이후 쿼리의 필터 및 조인을 기반으로 관련없는 파티션을 동적으로 제거합니다. 
파티션을 제거하는 과정에서 성능상의 큰 이득을 취하게 됩니다. 
파티션을 제거하는 과정에서 Amazon S3의 관련 객체(폴더)만 효율적으로 스캔하게 됩니다.

### Redshift Spectrum 제출 및 반환단계

그런 다음 Amazon Redshift 컴퓨팅 노드는 처리해야하는 객체 수에 따라 여러 요청을 생성합니다. 
그 이후 이 요청들을 AWS 가 리전당 수천개의 Amazon EC2 인스턴스풀을 가지고 있는 Redshift Spectrum 서비스에 동시에 제출합니다. Redshift Spectrum 작업자 노드는 Amazon S3에서 데이터를 스캔, 필터링 및 집계하여 Amazon Redshift 클러스터로 다시 처리하는 데 필요한 데이터를 스트리밍합니다. 
그런 다음 최종 조인 및 병합 작업이 레드시프트에서 클러스터에서 로컬로 수행되고 결과가 클라이언트에 반환됩니다. 

비록 최종 어그레이션 단계는 과금을 통해 비싼 레드시프트 노드를 사용해야 하지만, 기초적인 S3 데이터 및 스캔을 수행하는 레드시프트 스펙트럼 노드는 공유개념으로 아주 비싼 자원을 거의 무료로 가져다 쓰는 것 입니다. 
이 덕분에 수요예측과 권고발주가 제일 저렴한 레드시프트 클러스터를 사용하여도 수억건의 데이터 스캔과 연산처리를 아주 저렴하고 빠르게 수행할 수 있게 되었습니다.

![redshift_spectrum-1](https://user-images.githubusercontent.com/13447690/125046633-29dff400-e0d9-11eb-9d03-b59ba0285fb0.gif)

# External Table 실습

## 실습 1 - 스키마 생성

External Table 의 실습을 위해서 먼저, 외부데이터 연결 전용 External Schema 를 생성해야 합니다. 
External Schema 생성시 AWS Glue 카달로그에 데이터베이스가 함께 생성이 됩니다. 
데이터베이스를 삭제하려면 External Schema 를 삭제하면 됩니다.

```redshift
create external schema spectrum
    from data catalog
    database 'spectrum'
    iam_role 'arn:aws:iam::983654105819:role/ROLE-REDSHIFT-SPECTRUM'
    create external database if not exists;
```

위의 스키마 생성 명령을 보면, iam_role 이 명시되어 있는 것을 볼 수 있습니다. 
레드시프트 클러스터가 쿼리플랜을 수행하고 레드시프트 스펙트럼에 요청을 전달할때, AWS Glue 서비스와 S3 버킷에 대한 RW 권한을 가지고 있어야 합니다. 
그 외에도 VPC 내부의 클러스터인 경우 EC2 네트워크 조회권한, IAM 역할 조회 권한등도 필요합니다.

위의 ROLE-REDSHIFT-SPECTRUM 은 External Schema 가 동작하기 위한 권한과 연결된 Role 입니다.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:*",
      "Resource": "arn:aws:s3:::*/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "glue:*"
      ],
      "Resource": [
        "arn:aws:glue:*:983654105819:catalog",
        "arn:aws:glue:*:983654105819:database/spectrum",
        "arn:aws:glue:*:983654105819:table/spectrum/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetBucketLocation",
        "s3:ListBucket",
        "s3:ListAllMyBuckets",
        "s3:GetBucketAcl",
        "ec2:DescribeVpcEndpoints",
        "ec2:DescribeRouteTables",
        "ec2:CreateNetworkInterface",
        "ec2:DeleteNetworkInterface",
        "ec2:DescribeNetworkInterfaces",
        "ec2:DescribeSecurityGroups",
        "ec2:DescribeSubnets",
        "ec2:DescribeVpcAttribute",
        "iam:ListRolePolicies",
        "iam:GetRole",
        "iam:GetRolePolicy",
        "cloudwatch:PutMetricData"
      ],
      "Resource": [
        "*"
      ]
    }
  ]
}
```

스키마 삭제는 다음 명령으로 가능합니다.

```
-- 예제의 스키마 및 테이블 삭제
drop table spectrum.center;
drop table spectrum.sku;
drop table spectrum.stock_daily;
drop table spectrum.stock_summary;
drop schema spectrum;
```

## 실습2 - 일반 익스터널 테이블 파티션 처리가 필요없는 테이블을 생성합니다.

```redshift
create external table spectrum.center(
    id bigint,
    code varchar(20),
    name varchar(100),
    dtype varchar(20),
    status varchar(20))
    row format delimited fields terminated by '|' stored as textfile location 's3://my-bucket/example/spectrum/center/' table
    properties ('numRows'='10');

create external table spectrum.sku(
    id bigint,
    code varchar(20),
    name varchar(50),
    category_name varchar(50),
    status VARCHAR(50))
    row format delimited fields terminated by '|' stored as textfile location 's3://my-bucket/example/spectrum/sku/' table
    properties ('numRows'='100');
``` 

각 프로퍼티의 의미는 다음과 같습니다.

- stored as textfile :   S3 에 텍스트 파일 형식으로 저장합니다.
- fields terminated by '|'  :  S3 에 데이터 적재시 `|` 문자열로 필드를 구분합니다.
- location: 데이터가 적재될 S3 위치입니다.
- numRows :  
  중요한 설정값인데, 해당하는 테이블이 얼마정도의 row 수를 가지고 있을 것인지 기재합니다. 클러스터가 쿼리 플랜을 세울시에 이 수치를 기반으로 적절한 join 순서를 세웁니다. 제사한 프로퍼티에 대한
  설명은 [https://docs.aws.amazon.com/ko_kr/redshift/latest/dg/r_CREATE_EXTERNAL_TABLE.html](https://docs.aws.amazon.com/ko_kr/redshift/latest/dg/r_CREATE_EXTERNAL_TABLE.html)
  를 참조하면 됩니다.

이제 데이터를 업로드 해 봅시다.

다음의 center 정보와 sku 정보파일을 다운로드 한 후 업로드 합니다.

[sku.txt](https://github.com/MegazoneDSG/megazonedsg.github.io/files/6789926/sku.txt)

[center.txt](https://github.com/MegazoneDSG/megazonedsg.github.io/files/6789935/center.txt)

```shell
$ aws s3 cp ./center.txt s3://my-bucket/example/spectrum/center/part_00 
upload: ./center.txt to s3://my-bucket/example/spectrum/center/part_00

$ aws s3 cp ./sku.txt s3://my-bucket/example/spectrum/sku/part_00 
upload: ./sku.txt to s3://my-bucket/example/spectrum/sku/part_00
```

쿼리를 수행해 봅니다.

```redshift
select *
from spectrum.center;
```

![test1](https://user-images.githubusercontent.com/13447690/125049716-387bda80-e0dc-11eb-903f-feb325c33afa.png)

```redshift
select *
from spectrum.sku
limit 5;
```

![test2](https://user-images.githubusercontent.com/13447690/125049530-0b2f2c80-e0dc-11eb-8c9f-8e7c554e85fd.png)

## 실습3 - 파티션드 익스터널 테이블 파티션을 사용하는 테이블을 생성합니다.

```redshift
create external table spectrum.stock_daily(
    sku_code varchar(20),
    center_code varchar(20), qty_rcvng decimal(19, 2), qty_shpm decimal(19, 2), qty_stck decimal(19, 2),
    qty_adjst decimal(19, 2))
    partitioned by (date varchar(10))
    row format delimited
    fields terminated by '|'
    stored as textfile
    location 's3://s3/my-bucket/example/spectrum/stock_daily/'
    table properties ('numRows'='200'); 
```

partitioned by 프로퍼티가 추가되었습니다. 
그리고 이 값에 date varchar(10) 이 사용 되었습니다. 
이 뜻은 10자리의 문자열의 date 컬럼을 파티션 키로 사용하겠다는 뜻 입니다. 
그리고 numRows 항목은 테이블의 전체적인 크기가 아니라, 하나의 파티션에서 평균적으로 들어갈 row 수를 기재하게 됩니다.

다운 받은 데이터의 압축을 풀고, 업로드 합니다.

[stock_daily.zip](https://github.com/MegazoneDSG/megazonedsg.github.io/files/6789930/stock_daily.zip)

```shell
$ aws s3 cp ./ s3://my-bucket/example/spectrum/stock_daily/ --recursive
```

파티션을 추가합니다.

```redshift
alter table spectrum.stock_daily
    add if not exists partition (date='2021-01-28')
    location 's3://my-bucket/example/spectrum/stock_daily/date=2021-01-28/';

alter table spectrum.stock_daily
    add if not exists partition (date='2021-01-29')
    location 's3://my-bucket/example/spectrum/stock_daily/date=2021-01-29/';

alter table spectrum.stock_daily
    add if not exists partition (date='2021-01-30')
    location 's3://my-bucket/example/spectrum/stock_daily/date=2021-01-30/';

alter table spectrum.stock_daily
    add if not exists partition (date='2021-01-31')
    location 's3://my-bucket/example/spectrum/stock_daily/date=2021-01-31/';

alter table spectrum.stock_daily
    add if not exists partition (date='2021-02-01')
    location 's3://my-bucket/example/spectrum/stock_daily/date=2021-02-01/';

alter table spectrum.stock_daily
    add if not exists partition (date='2021-02-02')
    location 's3://my-bucket/example/spectrum/stock_daily/date=2021-02-02/';

alter table spectrum.stock_daily
    add if not exists partition (date='2021-02-03')
    location 's3://my-bucket/example/spectrum/stock_daily/date=2021-02-03/';

alter table spectrum.stock_daily
    add if not exists partition (date='2021-02-04')
    location 's3://my-bucket/example/spectrum/stock_daily/date=2021-02-04/';

alter table spectrum.stock_daily
    add if not exists partition (date='2021-02-05')
    location 's3://my-bucket/example/spectrum/stock_daily/date=2021-02-05/';

alter table spectrum.stock_daily
    add if not exists partition (date='2021-02-06')
    location 's3://my-bucket/example/spectrum/stock_daily/date=2021-02-06/';

alter table spectrum.stock_daily
    add if not exists partition (date='2021-02-07')
    location 's3://my-bucket/example/spectrum/stock_daily/date=2021-02-07/';

alter table spectrum.stock_daily
    add if not exists partition (date='2021-02-08')
    location 's3://my-bucket/example/spectrum/stock_daily/date=2021-02-08/';

alter table spectrum.stock_daily
    add if not exists partition (date='2021-02-09')
    location 's3://my-bucket/example/spectrum/stock_daily/date=2021-02-09/';

alter table spectrum.stock_daily
    add if not exists partition (date='2021-02-10')
    location 's3://my-bucket/example/spectrum/stock_daily/date=2021-02-10/';
```

쿼리를 수행해 봅니다.

```redshift
select sku_code,
       sum(-(qty_shpm)) as sales
from spectrum.stock_daily
where date between '2021-02-01' and '2021-02-10'
group by sku_code
```

![test3](https://user-images.githubusercontent.com/13447690/125050504-f901be00-e0dc-11eb-84b7-db48175596d0.png)

## 실습3 - 테이블 조인

- **반려동물 카테고리 상품중 2/1 ~ 2/10 까지 중 sku 별 매출 합계**

```redshift
select sd.sku_code,
       sum(-(sd.qty_shpm)) as sales
from spectrum.stock_daily sd
         join spectrum.sku sku on sku.code =
                                  sd.sku_code
where date between '2021-02-01' and '2021-02-10'
  and sku.category_name = '반려동물'
group by sku_code
```

![test5](https://user-images.githubusercontent.com/13447690/125050742-38300f00-e0dd-11eb-82bf-62dc488cb69e.png)

## 실습4 - 쿼리 플랜

일반 Join 과 with 절을 사용한 straight join 의 쿼리 플랜 비교

### 일반 join

각 S3 스펙트럼의 필터된 결과를 모두 join 한 후 group by 를 실행. 
최종 cost 가 560052.84  ~  560052.84 로, 모든 스펙트럼 결과물을 어그리게잇 한다.

```redshift
explain
select sd.sku_code,
       sum(-(sd.qty_shpm)) as sales
from spectrum.stock_daily sd
         join spectrum.sku sku
              on sku.code = sd.sku_code
where date between '2021-02-01'
    and '2021-02-10'
  and sku.category_name = '반려동물'
group by sku_code
             +--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
         |QUERY PLAN                                                                                                                                                                            |
+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
|XN HashAggregate  (cost=560052.84..560052.86 rows=5 width=66)                                                                                                                         |
|  ->  XN Hash Join DS_BCAST_INNER  (cost=1.26..560052.81 rows=5 width=66)                                                                                                             |
|        Hash Cond: (("outer".sku_code)::text = ("inner".code)::text)                                                                                                                  |
|        ->  XN Partition Loop  (cost=0.00..39.00 rows=1000 width=66)                                                                                                                  |
|              ->  XN Seq Scan PartitionInfo of spectrum.stock_daily sd  (cost=0.00..15.00 rows=5 width=0)                                                                         |
|                    Filter: (((date)::text <= '2021-02-10'::text) AND ((date)::text >= '2021-02-01'::text))                                                                           |
|              ->  XN S3 Query Scan sd  (cost=0.00..4.00 rows=200 width=66)                                                                                                            |
|                    ->  S3 Seq Scan spectrum.stock_daily sd location:"s3://my-bucket/example/spectrum/stock_daily" format:TEXT  (cost=0.00..2.00 rows=200 width=66)|
|        ->  XN Hash  (cost=1.26..1.26 rows=1 width=48)                                                                                                                                |
|              ->  XN S3 Query Scan sku  (cost=0.00..1.26 rows=1 width=48)                                                                                                             |
|                    ->  S3 Seq Scan spectrum.sku location:"s3://my-bucket/example/spectrum/sku" format:TEXT  (cost=0.00..1.25 rows=1 width=48)                     |
|                          Filter: ((category_name)::text = '\355\216\270\353\246\254\355\225\234\352\262\203'::text)                                                              |
+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
```

### with join

파티션된 S3 스펙트럼의 필터된 결과를 한차례 group by 어그리게이션 한 후, join 실행. 
최종 cost 가 45.26  ~  560052.84 로, 사전 어그리게잇된 양에 따라 cost 가 절감된다.

쿼리를 작성할때 with 절을 사용해 순차적으로 어그리게잇 하며 다음 with 절에 전달하는 순서로 작성할 것!!

```redshift
explain
with sd as (
    select sku_code,
           sum(-(qty_shpm)) as sales
    from spectrum.stock_daily
    where date between '2021-02-01' and '2021-02-10'
    group by sku_code
),
     sku as (
         select code,
                category_name
         from spectrum.sku
         where sku.category_name = '반려동물'
     )
select sd.sku_code,
       sd.sales
from sd
         join sku on sku.code = sd.sku_code
    +-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
                                |QUERY PLAN                                                                                                                                                                               |
+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
|XN Hash Join DS_BCAST_INNER  (cost=45.26..560050.77 rows=1 width=80)                                                                                                                     |
|  Hash Cond: (("outer".sku_code)::text = ("inner".code)::text)                                                                                                                           |
|  ->  XN Subquery Scan sd  (cost=44.00..47.00 rows=200 width=80)                                                                                                                         |
|        ->  XN HashAggregate  (cost=44.00..45.00 rows=200 width=66)                                                                                                                      |
|              ->  XN Partition Loop  (cost=0.00..39.00 rows=1000 width=66)                                                                                                               |
|                    ->  XN Seq Scan PartitionInfo of spectrum.stock_daily  (cost=0.00..15.00 rows=5 width=0)                                                                         |
|                          Filter: (((date)::text <= '2021-02-10'::text) AND ((date)::text >= '2021-02-01'::text))                                                                        |
|                    ->  XN S3 Query Scan stock_daily  (cost=0.00..4.00 rows=200 width=66)                                                                                                |
|                          ->  S3 Seq Scan spectrum.stock_daily location:"s3://my-bucket/example/spectrum/stock_daily" format:TEXT  (cost=0.00..2.00 rows=200 width=66)|
|  ->  XN Hash  (cost=1.26..1.26 rows=1 width=48)                                                                                                                                         |
|        ->  XN S3 Query Scan sku  (cost=0.00..1.26 rows=1 width=48)                                                                                                                      |
|              ->  S3 Seq Scan spectrum.sku location:"s3://my-bucket/example/spectrum/sku" format:TEXT  (cost=0.00..1.25 rows=1 width=48)                              |
|                    Filter: ((category_name)::text = '\355\216\270\353\246\254\355\225\234\352\262\203'::text)                                                                       |
+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
```

## 실습5 - 쿼리된 데이터를 다른 테이블에 INSERT

쿼리로 로드된 데이터를 다른 테이블에 insert 할때, csv 파일을 만들어 올리고 파티션을 생성하는 번거로운 과정을 거칠 필요가 없습니다.

자동으로 s3 파일 및 파티션이 생성됩니다.

```redshift
create external table spectrum.stock_summary(
    sku_code varchar(20),
    sales decimal(19, 2))
    partitioned by (process_id varchar(36))
    row format delimited
    fields terminated by '|'
    stored as textfile
    location 's3://my-bucket/example/spectrum/stock_summary/'
    table properties ('numRows'='100', 'write.maxfilesize.mb'='100');

INSERT INTO spectrum.stock_summary (
    with sd as (
        select sku_code, sum(-(qty_shpm)) as sales
        from spectrum.stock_daily
        where date between '2021-02-01' and '2021-02-10'
        group by sku_code
    ),
         sku as (
             select code,
                    category_name
             from spectrum.sku
             where sku.category_name = '반려동물'
         )
    select sd.sku_code,
           sd.sales::decimal(19, 2),
           '2021-07-01-0001'::varchar(36) as process_id
    from sd
             join sku on sku.code = sd.sku_code
)
```

다른 파티션된 테이블로 인서트를 하게 된다면 select 문구의 가장 마지막 컬럼은 파티션 값이어야 합니다. 그리고 insert 할시 컬럼의 데이터 타입을 테이블의 데이터 타입과 맞추어 cast 해 주어야 합니다.
insert 후 s3 의 `s3://my-bucket/example/spectrum/stock_summary/process_id=2021-07-01-0001/` 패스에 다음과 같이 결과물이 생성됩니다.

![test6](https://user-images.githubusercontent.com/13447690/125051937-69f5a580-e0de-11eb-8d8a-511c91768bae.png)

위 결과물을 저장하는 테이블은 몇가지 특징이 있습니다.

먼저 어그리게잇되는 데이터 크기가 큰 경우가 대부분이기에, 결과물 파일당 크기를 100 mb 로 제한하였습니다. 
결과물 크기를 제한하지 않으면 GB 바이트에 이르는 큰 파일이 생성되게 되며 이는 스펙트럼 노드가 병렬처리 하지 못하고 직렬방식으로 데이터를 읽어오게 하기 때문에 성능상 큰 손해를 봅니다.

그리고, 파티션 키를 작업아이디 형태로 할당하였습니다. 
어떤 데이터를 분석할때 작업아이디를 기준으로 연속되는 결과물을 이어나가야 하는 워크플로우 형태로 진행되기 때문에, 동일한 작업아이디 끼리만 데이터를 활용하게 함으로써 스펙트럼의 S3 필터를 효과적으로 사용할 수 있습니다.

## 실습6 - window function 활용

창 함수를 사용하면 사용자가 분석적 업무 질의를 더욱 효율적으로 생성할 수 있습니다. 창 함수는 결과 집합의 파티션, 즉 "창"에서 실행되어 해당 창에 속하는 모든 행에 대한 값을 반환합니다. 이와는 반대로 창이
없는 함수는 결과 집합의 모든 행에 대해 계산을 실행합니다. 그 밖에도 결과 행을 집계하는 그룹 함수와 달리 창 함수에서는 테이블 표현식의 모든 행이 그대로 유지됩니다.

반환된 값은 해당 창에 속한 행 집합의 값을 사용하여 계산됩니다. 테이블의 각 행마다 창은 추가 속성을 계산하는 데 사용되는 행 집합을 정의합니다. 창은 창 명세(OVER 절)를 사용하여 정의되며, 다음과 같이 세
가지 주요 개념을 근거로 합니다.

- 창 파티션 - 행 그룹을 형성합니다(PARTITION 절).
- 창 순서 지정 - 각 파티션의 행 순서 또는 시퀀스를 정의합니다(ORDER BY 절).
- 창 프레임 - 행 집합을 제한하기 위해 각 행마다 정의됩니다(ROWS 명세).

창 함수는 최종 ORDER BY 절을 제외하고 쿼리에서 실행되는 마지막 연산 집합입니다. 창 함수를 처리할 때는 그 전에 모든 조인을 비롯한 WHERE, GROUP BY 및 HAVING 절까지 모두 완료됩니다.
따라서 창 함수는 선택 목록 또는 ORDER BY 절에만 나타날 수 있습니다. 단일 쿼리 내에서도 프레임 절을 다르게 하여 여러 창 함수를 사용할 수 있습니다. 또한 CASE 같은 다른 스칼라 표현식에서도 창 함수를
사용할 수 있습니다.

Amazon Redshift 는 집계와 순위, 두 가지 유형의 창 함수를 지원합니다.

다음은 지원되는 집계 함수입니다.

- AVG
- COUNT
- CUME_DIST
- FIRST_VALUE
- LAG
- LAST_VALUE
- LEAD
- MAX
- MEDIAN
- MIN
- NTH_VALUE
- PERCENTILE_CONT
- PERCENTILE_DISC
- RATIO_TO_REPORT
- STDDEV_POP
- STDDEV_SAMP(STDDEV와 동일)
- SUM
- VAR_POP
- VAR_SAMP(VARIANCE와 동일)

다음은 지원되는 순위 함수입니다.

- DENSE_RANK
- NTILE
- PERCENT_RANK
- RANK
- ROW_NUMBER

더 많은
창함수: [https://docs.aws.amazon.com/ko_kr/redshift/latest/dg/c_Window_functions.html](https://docs.aws.amazon.com/ko_kr/redshift/latest/dg/c_Window_functions.html)

### rank 예제

2021-02-10 날짜에 sku 별로 재고가 많은 센터 순으로 순위 매기기

```redshift
with sd as (
    select sku_code,
           center_code,
           qty_stck
    from spectrum.stock_daily
    where date = '2021-02-10'
)
select sku_code,
       center_code,
       qty_stck,
       rank() over (partition by sku_code order by qty_stck desc) as rank
from sd
order by sku_code, rank;
```

![test7](https://user-images.githubusercontent.com/13447690/125052254-bb9e3000-e0de-11eb-977e-0609c4f4a4ea.png)

### lag 예제

2021-02-01 ~  2021-02-10 날짜동안 sku by center 별로 어제 재고와 차이나는 수량 구하기

```redshift
with sd as (
    select sku_code,
           center_code,
           qty_stck,
           date
    from spectrum.stock_daily
    where date between '2021-02-01' and '2021-02-10'
)
select sku_code,
       center_code,
       date,
       lag(qty_stck, 1) over (partition by sku_code, center_code order by date) as yesterday,
       qty_stck                                                                 as today,
       (today - yesterday)                                                      as diff
from sd
order by sku_code, center_code, date;
```

![test8](https://user-images.githubusercontent.com/13447690/125052263-be992080-e0de-11eb-8c76-6522fa39f165.png)

