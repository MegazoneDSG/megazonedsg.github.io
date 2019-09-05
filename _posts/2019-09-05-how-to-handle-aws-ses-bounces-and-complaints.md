---
layout: post
author: seungpilpark
notification: true
title: "AWS SES 이메일 반송 및 스팸 신고에 대응하기"
description: 프로젝트 인수인계 중에 AWS SES 반송 로직 코드를 보고, 업무를 이해하기 위해 작성하는 글.
image:
category: 'programming'
date: 2019-09-01 01:05:00
tags:
- aws
- ses
introduction: 프로젝트 인수인계 중에 AWS SES 반송 로직 코드를 보고, 업무를 이해하기 위해 작성하는 글.
twitter_text: 프로젝트 인수인계 중에 AWS SES 반송 로직 코드를 보고, 업무를 이해하기 위해 작성하는 글.

---

**출처**: [https://medium.com/@serbanmihai/how-to-handle-aws-ses-bounces-and-complaints-53d6e7455443](https://medium.com/@serbanmihai/how-to-handle-aws-ses-bounces-and-complaints-53d6e7455443)

AWS Simple Email Service 를 구현하려는 경우, SES 계정을 샌드 박스 모드에서 해제하기 전에 이메일 반송 및 불만 사항을 처리하기위한 흐름이 필요하다는 것을 알 수 있습니다.

*Bounce* 이메일은 받는 사람 이메일이 없는 경우  
 
*Complaints* 이메일은 수신자가 받은 편지함에서 차단한 경우입니다. 
예를 들어 SPAM으로 표시하면 이러한 보고서가 트리거됩니다.  

ESP (Email Service Provider)는 모든 주요 인터넷 서비스 제공 (ISP)과 함께 "피드백 루프"라고합니다.
우리의 어플리케이션은 *Bounce* / *Complaints* 신청을 받는 경우 다시 이메일이 발생하지 않도록 조치를 취해야합니다. 가장 쉬운 방법은 이메일 수신에 동의하지 않는 한 해당 사용자에게 이메일을 보내지 않는 것입니다.

# Overview of the sending process

다음은 AWS SES 의 이메일 전송 프로세스 입니다.

![1_pEz2kdAeiT6ljb32F6J9fw](https://user-images.githubusercontent.com/13447690/64315732-da68a280-cfed-11e9-94c9-d6bdee4c86ca.png)

이메일 전송이 완료되면 다음중 하나의 결과를 예상할 수 있습니다:
- success
- bounce
- complaint

# Overview of handling of bounce/complaints

다음은 AWS SNS service 를 활용한 *bounce/complaints* 이메일 핸들링 과정입니다.

![1_-eRHvZt-9R_R_7f6f0yCvw](https://user-images.githubusercontent.com/13447690/64315871-39c6b280-cfee-11e9-9a2f-450b595e20da.png)


# 1. Setup AWS SNS topics for bounce and complaints

AWS SNS 에서 다음의 토픽을 구성합니다.

- ses-bounces-topic-prod
- ses-complaints-topic-prod
- ses-deliveries-topic-prod (optional)

[1_JZ8CVlRWquIv20SKnUIjHg](https://user-images.githubusercontent.com/13447690/64316014-8b6f3d00-cfee-11e9-81d7-03d8ac7f1798.png)

각 토픽을 생성한 후에는 구독을 만드는 다음 단계에서 필요한 ARN을 받게됩니다.

![1_sWjh8Qxn-o5wyqvI5Ipe3Q](https://user-images.githubusercontent.com/13447690/64316025-94f8a500-cfee-11e9-9f69-6cc9f68a89e6.png)

SNS 구독으로 이동하여 이전에 만든 *bounce/complaints* 토픽에 대한 SNS 구독을 만듭니다.
여기서 각 토픽에서 알림을 받을 엔드 포인트를 지정해야합니다. 엔드 포인트는 어플리케이션의 백엔드에서 POST 로 받을 수 있어야 합니다.

![1__Bnw9nIcRwC4LjH9hd3Mow](https://user-images.githubusercontent.com/13447690/64316150-f6b90f00-cfee-11e9-9412-4901aaa82a43.png)

각 구독은 생성 후 PendingConfirmation 상태에 있는지 확인해야합니다. 구독을 확인하려면 백엔드에서 엔드 포인트를 구현하고 SNS 대시 보드에서 요청 확인을 호출해야합니다.
서버에서 수신한 HTTP 전문에는 요청 확인에 사용할 수있는 SubscribeURL 또는 토큰이 있습니다.
토큰으로 `sns.confirmSubscription()` 을 호출하거나 SubscribeURL 을 SNS 대시 보드에 붙여넣기 하도록 합니다.

![1_T_bSIOjMnaOaHs9PwEevnw](https://user-images.githubusercontent.com/13447690/64316270-50b9d480-cfef-11e9-8d29-f6de70b14111.png)

> TIP: 어플리케이션에서 사용되는 IAM User 가 SNS 에서 권한이 있는지 확인하도록 합니다.

2. Configure SES to publish notifications to each created SNS topic

SES 관리 콘솔-> 이메일 주소 -> 이메일 주소 선택 한 후 *Notifications* 탭을 엽니다.
*Edit Configuration* 탭을 선택하고, 각 알림 유형에 대한 SNS 주제를 선택하도록 합니다.

![1_k4fHq6CgGYUeXZjNmyXOLA](https://user-images.githubusercontent.com/13447690/64316531-1270e500-cff0-11e9-8a56-174c734436ab.png)

AWS 메일 박스 시뮬레이터는 SES 관리 콘솔에서 찾을 수 있으며, *bounce/complaints* 같은 시나리오를 구현하는 방식을 테스트 할 수있는 방법을 제공합니다.

![1_Pydm3yb5aGuuRerVw6mxcQ](https://user-images.githubusercontent.com/13447690/64316654-6c71aa80-cff0-11e9-986f-5a2fe89e2c23.png)

*success@simulator.amazonses.com* 으로 보낸 메일은 성공적으로 배달 된 것으로 간주됩니다.

*bounce@simulator.amazonses.com* 으로 발송 된 메일은 SMTP 550 (“알 수없는 사용자”) 응답 코드로 거부됩니다. Amazon SES가 이메일 또는 SNS 알림으로 반송 알림을 보냅니다.

*ooto@simulator.amazonses.com* 으로 보낸 메일은 성공적으로 배달 된 것으로 간주됩니다.

*expert@simulator.amazonses.com* 으로 전송 된 메일은 수신자가 이메일 애플리케이션에서 스팸으로 표시를 클릭하고 ISP가 Amazon SES에 불만 응답을 보내는 경우를 시뮬레이션합니다.

*blacklist@simulator.amazonses.com* 으로 전송 된 메일은 Amazon SES가 전송 시도를 차단하고 "주소 블랙리스트" 오류 메시지가 포함 된 MessageRejected 오류를 반환합니다.



