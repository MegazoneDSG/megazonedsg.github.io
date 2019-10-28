---
layout: post
author: HYGill
notification: true
title: "API Gateway,Lambda,S3, DynamoDB사용기(1)"
description: API Gateway,Lambda,S3, DynamoDB사용해보며 남기는 글
image: "https://images.app.goo.gl/rRAUike1DBXyvU6w9"
categories:
- aws
date: 2019-10-28 11:40:00
tags:
- aws
- lambda
- API Gateway
- S3
- DynamoDB
introduction: API Gateway,Lambda,S3, DynamoDB사용해보며 남기는 글
twitter_text: API Gateway,Lambda,S3, DynamoDB사용해보며 남기는 글
---

# API Gateway, Lambda, S3, DynamoDB 사용기
**프로젝트 개요**

DSG 그룹의 Communication App을 만드는 프로젝트에서 서버를 구현하는 역할을 맡게 되었다. 
Application에서 json이나 multipart로 전송되는 Data를 서버에서 처리하면 되는데 문제는 AWS의 Lambda를 사용해서  serverless로 구현해야하는 점이다. 

 **전체구성도**
![megatong (2)](https://user-images.githubusercontent.com/47243329/67674623-5f55b400-f9c0-11e9-922b-11de47368b7f.PNG)






## 1. API Gateway 사용하기

- **API 작성을 클릭합니다.**
![api1](https://user-images.githubusercontent.com/47243329/67669902-257fb000-f9b6-11e9-9f14-c681659c5fdd.PNG)
App에서 POST /v1/feed/로 Request를 'multipart/form-data' 형태로 넘겨주실것이라고 말씀해주셨기때문에 아래와 같은 형태로 구성해보았다. 

![api2](https://user-images.githubusercontent.com/47243329/67670182-b6ef2200-f9b6-11e9-91c3-ed9a6b538dfd.PNG)

mutipart로 받는 것은 아직 되는지 확인해보지 않았지만 메소드를 구성할 때 '요청본문 패스스루'에서 multipart/form-data를 추가해야한다고 한다. [참고자료](http://devstory.ibksplatform.com/2017/12/aws-lambda-api-gateway-s3-api-3-api.html)

또 메소드를 등록할 때 연결할 Lambda함수를 추가해줄 수 있는데 이 Lambda함수는 create function으로 만들 수 있지만(node.js나 python을 사용할 계획이라면 내장되어있는 편집기가 있어서 이 방법이 더 편할 것이다)  java를 사용할 것이기 때문에 따로 편집기를 써야한다. 

<h2> 2.  Eclipse로 java lambda함수 만들기</h2>

- **eclipse STS를 이용하였다**
**1. aws의 기능을 사용할 수 있게 하는 toolkit을 다운**

![lambda1](https://user-images.githubusercontent.com/47243329/67670794-fec27900-f9b7-11e9-9314-e961cbd02d4f.PNG)

 **2. Lambda fuction을 사용하는 project를 생성** 

![lambda2](https://user-images.githubusercontent.com/47243329/67671104-97f18f80-f9b8-11e9-82c3-e1c03edadf80.PNG)

좋았던게  input을 설정할 수 있고 가이드 코드가 잘되어있어서 감 잡는데 좋았다(오래안걸린척)
input이 s3가 아니기 때문에 custom으로 설정해놓고 생성하면
```java

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;

public class  implements RequestHandler<Object, String> {

    @Override
    public String handleRequest(Object input, Context context) {
        context.getLogger().log("Input: " + input);

        // TODO: implement your handler
        return "Hello from Lambda!";
    }

}
```
이런 기본코드가 생성이 된다.

![lambda3](https://user-images.githubusercontent.com/47243329/67671491-688f5280-f9b9-11e9-9d95-ef35e3f5c7b1.png)
여기서 Upload function to AWS Lambda와 Run function on AWS Lambda를 사용하는데
앞의 것은 lambda function을 만들고 s3에 저장하는 것이고 Run function은 json을 넣어 test해볼 수 있다. 
이것을 눌러 테스트할 수 도 있고 API Gateway에서 테스트를 눌러도 test해볼 수 있다.  

<h2> 3. lambda함수 와 API Gateway 연결해서 test하기 </h2>

eclipse에서 upload function을 해줬으면 메소드 생성하고 lambda함수 지정할 때 드롭바로 확인 할 수 있다.
연결해주고 테스트를 누르면 응답본문에서 아까 return값으로 지정한 문자열을 볼 수 있다.
![lambda4 (2)](https://user-images.githubusercontent.com/47243329/67674667-772d3800-f9c0-11e9-9e0c-f6cbc4cdd3a9.PNG)

연결하면 lambda함수가 이렇게 구성되어 있는데 오른쪽에 연결된 것은 따로 IAM에서 설정해주어야한다.
![lambda5 (2)](https://user-images.githubusercontent.com/47243329/67674997-5addcb00-f9c1-11e9-9ff9-b3fffd34cf70.PNG)

<h2> 4. IAM에서 엑세스할 수 있는 리소스 추가하기 </h2>

![iam1](https://user-images.githubusercontent.com/47243329/67672226-dbe59400-f9ba-11e9-82a0-f275f5b47c64.PNG)

여기에서 ~~~역할을 확인을 누른다.

![iam2](https://user-images.githubusercontent.com/47243329/67672307-00da0700-f9bb-11e9-8b9f-46fce616297c.PNG)

이곳에서 정책 연결을 해주면 끝~!



# 마무리
다음에는 실제 구현한 코드를 포스팅 해야겠다!
