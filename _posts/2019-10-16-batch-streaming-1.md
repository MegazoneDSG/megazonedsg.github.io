---
layout: post
author: seungpilpark
notification: true
title: "Kafka 를 활용한 OCR 검수 시스템 만들기"
description: Kafka 를 활용한 OCR 검수 시스템 만들기 글
image: "https://user-images.githubusercontent.com/13447690/65836936-bb7bd880-e32d-11e9-8e41-073bc346abea.png"
categories:
- tutorial
date: 2019-10-16 02:05:00
tags:
- msa
- spring
- kafka
introduction: Kafka 를 활용한 OCR 검수 시스템 만들기 글
twitter_text: Kafka 를 활용한 OCR 검수 시스템 만들기 글
---

쇼핑몰 사이트에서 상품 등록자가 허위 광고문구가 포함된 이미지를 올리거나, 불건전한 이미지를 올린다면 어떻게 검수할 수 있을까요?

여기 이런 고객사의 요구가 있다고 해봅시다.

"특정 카테고리의 모든 제품에 대해, 제품 상세 페이지의 주소를 통해 이미지를 캡쳐해서 부적절한 텍스트를 필터링 해 주세요"

가상화 브라우저를 통해 캡처를 하는 작업은 매우 높은 CPU 리소스를 소모합니다.
대형 쇼핑몰일 경우, 하나의 카테고리의 상품 개수가 1만 개를 넘어간다고 할 때, 레거시 한 서버환경에서 시스템을 구축 할 경우 다음과 같은 문제가 있습니다.

- 가상화 브라우저를 다수 운용하는 과정에서 언제 시스템이 죽을 지 모름
- 작업이 없는 상황에도 많은 서버대수를 유지해야 함
- 디스크를 매우 많이 쓰고, I/O 작업도 많음

위와 같은 문제를 해결하기 위해, 흔히 "컨테이너로 제작된 어플리케이션을 클라우드 상에서 스케일러블 하게 운영 하면 모두 해결된다" 라고 쉽게 말하는 사람들도 있는데요, 물론 컨테이너 운영은 필수입니다. 그러나 클라우드에서 기존의 배치성, 고사양 작업을 처리하기 위해서는 어플리케이션 아키텍처 설계가 더욱 중요합니다.

# Batch Processing VS Streaming Processing

클라우드 상에서 고사양 배치 어플리케이션을 수행할 때는, 가급적 하나의 타스크에 특화된 여러개의 서비스로 분리하고, 각 서비스가 죽어도 (심지어 모든 서비스가 죽어도) 데이터 흐름이 잠시 중단될 뿐, 데이터가 유실되는 일이 없어야 합니다.
이러한 일을 가능하게 하려면 기존의 배치 어플리케이션에서 데이터를 다뤘던 방식에서 스트리밍 프로세싱으로의 전환이 필요합니다.

|                   | Batch                 | Streaming                 |
|------------------- | -------------------| -------------------|
| 실행시간  | 일정 주기 | 리얼 타임
| 서버    | 정적 서버 그룹  | 동적 서버 그룹 |
| 잡 동작 방식 | 데이터 청크 단위로 워커들에게 분산 수행 요청   | 이벤트 단위로 워커들이 독립적으로 수행 (Coregraphy) |
| 장애 영향    | 잡 매니저 서버가 죽으면 수행중인 작업 유실  | 어느 서비스가 죽더라도 작업 상태 보존 |
| 프레임워크    | Spring Batch  | Spring Cloud Stream / Kafka |

스케치로 나타내면 다음과 같은 그림이 되지요.

![](https://user-images.githubusercontent.com/13447690/66888970-a1274780-f01b-11e9-9e26-397f2e0f20c2.png)

먼저 위의 시나리오를 가능하게 위해 저에게 큰 도움을 주었던 서적을 소개합니다. Making Sense of Stream Processing 이란 서적이고, [Confluent](https://www.confluent.io/stream-processing/) 사이트에서 다운로드 받을 수 있습니다.

![](https://user-images.githubusercontent.com/13447690/66885321-f01ab000-f00e-11e9-94dd-b85bf406e3e6.gif)

# Streaming Batch Processing

위의 서적의 도움을 받아서 열심히 코딩을 한 결과, 다음과 같이 그럭저럭 돌아가는 "Streaming 기반 OCR 시스템" 을 만들어 낼 수 있었습니다. 배치 프로세싱의 기본 개념인 Controller - Worker 조합을 유지하면서, 장애 내구성과 스트리밍 프로세싱의 장점을 취합한 아키텍처를 수립한 것이죠.

![](https://user-images.githubusercontent.com/13447690/66889563-dc2a7a80-f01d-11e9-93ab-4df743cc8da3.png)

Kafka Processing 데이터 흐름을 제어 할 때는, "이벤트 발행(Producer)은 무제한으로, 그러나 구독(Consumer) 은 자신이 수행할 수 있을 만큼만 가져오기" 의 전제 조건을 생각하며 제작 해 나가도록 합니다.
위 그림에서 데이터의 흐름이 어떻게 흘러가는지 살펴보도록 합시다.

1. 외부 시스템에서 10,000 건의 OCR 분석이 도착했습니다.
2. `Command Handler` 는 잡 실행 요청에 대해 최소한의 Validation 만을 수행하고, 임의의 아이디를 생성한 다음 즉시 리턴합니다. 이 과정은 로컬에서 이루어지기 때문에 1~2 초 이내에 수행됩니다.
3. `Command Handler` 가 Kafka 에 10,000 건의 잡 실행 요청을 발행합니다.
4. `Job Request Consumer` 는 잡 실행 요청을 구독하여, 설정된 수 만큼 일거리를 가져옵니다.
5. `Job Request Consumer` 가 실제로 데이터베이스에 Job 을 생성하며, 이런저런 일처리를 합니다.
6. `Job Request Consumer` 가 `Job Assigned Consumer` 가 작업을 가져갈 수 있도록 어사인 이벤트를 발행합니다.
7. `Job Assigned Consumer` 는 어사인 이벤트를 구독하며, 어떻게 캡처를 찍어야 할지 캡처 규칙을 읽어들여 `Capture Worker` 의 NodeJS 코드를 실행시킵니다.
8. `Capture Worker` 는 캡처를 하기 위해 가상 브라우저를 실행시키고, 원하는 캡처 화면을 위해 DomControll 을 수행하는 스크립트를 실행합니다. 캡처를 할 때는 분할 화면 방식으로 촬영하며, 촬영된 각 캡쳐본을 Merge 하여 GCP Cloud Storage 에 업로드 합니다. 

> `Capture Worker` 는 설명은 간단한데 이걸 하기 위해 무진장 힘들었습니다. 가상 브라우저를 위해 Google Puppeter 를 사용했는데, 컨테이너 환경에서 변수가 많더군요. 폰트 문제와 Chronium 튜닝이 특히 힘들었습니다.

9. `Capture Worker` 는 계속해서 GCP Vision API 를 사용하여 OCR 작업을 수행합니다.
10. `Capture Worker` 에서 Kafka 로 작업 완료 이벤트를 발행합니다.
11. `Job Complete Consumer` 는 작업 완료 이벤트를 구독하며, 이런저런 데이터 가공을 합니다.
12. 잡 상태를 데이터베이스에 업데이트하고, `Web Hook Scheduler` 에 등록합니다.
13. `Web Hook Scheduler` 는 완료된 작업에 대해, 외부 시스템인 `Job Receiver` 에게 HTTP 로 즉시 전달합니다. 전달에 실패할 것에 대비하여, Quartz 스케쥴러를 통해 최대 3번 일정 간격으로 재시도 합니다.

# Failer Message Driven On Streaming Batch Processing

서적을 통해 보았던 Kafka Processing 데이터 실패 처리에 대한 흐름의 Best Practice 는 "어플리케이션에서 구독한 이벤트에 대한 로직 수행이 실패할 경우, 가장 좋은 방법은 Exception 을 그대로 throw 하는 것" 입니다. 그러면 Kafka 는 최대 리트라이 횟수까지 또 다른 Consumer 에서 작업 처리를 의뢰하다가, 최대 리트라이 횟수에 이르렀을 경우 지정된 Error 토픽으로 Exception Stack Trace 와 함께 에러 이벤트를 발급합니다.

![](https://user-images.githubusercontent.com/13447690/66890894-915f3180-f022-11e9-8813-7dc70731c606.png)

위의 Best Practice 를 바탕으로 실패 메시지 처리 흐름을 제작 해 보았습니다.

1. `Consumer` 들이 이벤트를 구독합니다.
2. 작업 수행이 너무 길어져 타임아웃이 일어나거나, 로직 수행이 실패 한 경우 Exception 을 그대로 발생시킵니다.
3. Kafka 는 에러를 JobError 토픽으로 딜리버리 합니다.
4. `Job Error Consumer` 에서는 에러를 구독하며, 이런저런 후처리를 합니다.
5. `Job Error Consumer` 에서 실패한 Job 처리에 대해 데이터베이를 갱신합니다.
6. 사용자는 실패된 잡 이력 및 로그를 보고, 조치를 취한 후 `Job Retry Producer` 를 통해 재시도 처리를 합니다.
7. `Job Retry Producer` 는 실패된 이벤트 메시지를 재 발행 합니다.

# Summary

다음 포스트에는 실제 구현을 위한 코드 샘플을 살펴보도록 하겠습니다.



