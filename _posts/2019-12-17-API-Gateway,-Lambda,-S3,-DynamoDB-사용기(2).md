---
layout: post
author: HYGill
notification: true
title: "API Gateway,Lambda,S3, DynamoDB 사용기(2)"
description: API Gateway,Lambda,S3, DynamoDB를 사용해보며 남기는 글
image: "https://user-images.githubusercontent.com/47243329/67679584-beb9c100-f9cc-11e9-8b65-641e110409db.PNG"
categories:
- aws
date: 2019-12-17 21:00:00
tags:
- aws
- lambda
- API Gateway
- S3
- DynamoDB
introduction: API Gateway,Lambda,S3, DynamoDB를 사용해보며 남기는 글
twitter_text: API Gateway,Lambda,S3, DynamoDB를 사용해보며 남기는 글
---

# API Gateway, Lambda, S3, DynamoDB 사용기


<h2> 1. eclipse AWS 계정 설정</h2>

- **window 메뉴바의 Preferences를 클릭 후 정보를 입력합니다.**
![eclipse](https://user-images.githubusercontent.com/47243329/70958479-b58bcd00-20bc-11ea-8afa-84bb2803ca46.PNG)

이렇게 설정하면 S3나 dynamodb같은 AWS Service에 진입할 때 별도의 계정정보를 입력하지 않아도 접근이 가능했던 것을 알 수 있었다.

<h2> 2.  Lambda Function의 구조</h2>


```java

public class DataHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

	public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent event, Context context) {
		APIGatewayProxyResponseEvent response = new APIGatewayProxyResponseEvent();

		try {
			JSONParser parser = new JSONParser();
			JSONObject request = (JSONObject) parser.parse(event.getBody());

			// event를 받은 값을 원하는 형태로 가공하거나 사용한다.

			response.setBody(request.toString());
		
		} catch (Exception ex) {
			ex.printStackTrace();	
			response.setBody(ex.toString());
		}
		
		return response;
	}
}
```

알아 본 정보에서 기존 @RequestBody, param 등으로 여러 Data를 받아왔던 방식과는 다르게 input, output으로 딱 나뉘는 것을 알 수 있었고, 개발자가 input으로 받은 값 중에 필요한 값을 나눠서 써야하는 것으로 보였다. 

처음에는 어떤 예시로 나와있던 Event를 사용하다가 pom.xml에 있는 aws-lambda-java-events를 버전 업(2.2.2)을 하니 APIGatewayProxyRequestEvent를 사용할 수 있게 되었다. APIGatewayProxyRequestEvent는 API 게이트웨이에서 전송 한 요청을 처리하고 있을때, 이에 따라 처리 할 수있는 응답을 제공해야할때 사용한다고 한다. 

이렇게 받은 event안에서는 밑의 이미지와 같은 많은 정보가 세분화되어있다. app에서 정보를 body로 넘겨주었기 때문에 가장 많이 사용한 것은 getBody이었다.

![event](https://user-images.githubusercontent.com/47243329/70960316-0651f480-20c2-11ea-84da-a49ae07950bc.PNG)

그리고 마지막으로는 reponse의 body에 넣어서 return 해주었다.


프록시 통합 설정에 관한 [참고자료](https://docs.aws.amazon.com/ko_kr/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-output-format)


<h2> 3. DynamoDB 사용</h2>
DynamoDB를 사용하는 것은 간단하다. 

```java
AmazonDynamoDB client = AmazonDynamoDBClientBuilder.standard().build();
DynamoDB dynamoDB  = new DynamoDB(client);

// 예시 : insert data
Table UserTable = dynamoDB.getTable("user");
			Item item = new Item().withPrimaryKey("id", (String) request.get("id"))
					.withString("email", (String) request.get("email"));
			
			UserTable.putItem(item);
```

이렇게 선언해주고 사용하면 된다. 주의할 점은 PrimaryKey를 지정 잘해주어야하고 형식이 중요하다. 또한 기존에 값이 하나라도 있어야 insert가 되는 것 같아서 mock data를 넣어주었다. 

AmazoneDynamoDB를  import해주는 방법은 찾아보니 두가지가 있는 것 같다.
1. 직접 jar file을 library에 추가하는 방법

![sdk](https://user-images.githubusercontent.com/47243329/70961047-166ad380-20c4-11ea-8663-1af1e0a373f3.PNG)

2. pom.xml에 추가하는 방법

```xml
<!-- https://mvnrepository.com/artifact/com.amazonaws/aws-java-sdk-core -->
<dependency>
	<groupId>com.amazonaws</groupId>
	<artifactId>aws-java-sdk-core</artifactId>
	<version>1.11.688</version>
</dependency>
```

<h2> 4. S3 사용</h2>
java로 s3를 사용한 것은 delete이기 때문에  upload소개할 때 다시 언급해야겠다. 우선 간단한 사용방법!

```java

// 예시는 DELETE folder 입니다.
Regions clientRegion = Regions.AP_NORTHEAST_2;
String bucketName = BucketName;
	
AmazonS3 s3Client = AmazonS3ClientBuilder.standard()
		.withRegion(clientRegion)
		.build();
        
DeleteItemSpec deleteIndexItem = new DeleteItemSpec().withPrimaryKey("id", feedId)
					.withReturnValues(ReturnValue.ALL_OLD);

ContentIndex.deleteItem(deleteIndexItem);
```

S3는 dynamodb처럼 쿼리,스캔이 있는 것이 아니기 때문에 좀 명확했던것같다.


# 마무리

프로젝트 중반에 생각되었는데 이렇게 data를 받고 가공하고 return해주는 것이 한 함수안에 다 있는것이 정말 안 좋다고 생각했다. 초반에 시작할 때는 lambda함수 하나가 실행되니까 하나에 다 넣는 것이 맞다고 생각했는데 나중에 업로드 되는 것을 보니 어차피 jar파일에 묶어서 소스파일이 다 들어가는 것을 알 수 있었다, 그러면 분리해서 코딩을 했어도 타고타고 잘 실행되었을텐데,, 설계를 잘못했다는 생각이 너무 늦게 들었다. 

업로드를 진행할 때는 java를 쓰지 않고 nodejs를 썼는데 그 이야기를 다음에 쓰겠다.
