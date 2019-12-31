---
layout: post
author: HYGill
notification: true
title: "API Gateway,Lambda,S3, DynamoDB 사용기(3)"
description: API Gateway,Lambda,S3, DynamoDB를 사용해보며 남기는 글
image: "https://user-images.githubusercontent.com/47243329/67679584-beb9c100-f9cc-11e9-8b65-641e110409db.PNG"
categories:
- aws
date: 2019-12-31 14:00:00
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

<h2> multipart로 request를 받기 위한 busboy</h2>

>java에서 nodejs로 갈아탄 이유

	multipart로 오는 데이터형식은 예제와 같이 구성되어있는데, 
	자바로 할 경우  boundary로 잘라서 필요한 data를 꺼내서 가공하는 과정을 거쳐야하기때문이다.
	물론 자바도 오픈소스가 있지만 코드분석결과 이렇게까지 해야하나 싶었다. 너무 길고 복잡했다.
	그래서 module을 쉽게 사용할 수 있는 nodejs로 업로드와 업데이트 부분을 구현하기로 했다!
![image](https://user-images.githubusercontent.com/47243329/71571554-3798de80-2b1e-11ea-962a-2aef60c42196.png)
출처 [http://egloos.zum.com/tequiero35/v/2094266](http://egloos.zum.com/tequiero35/v/2094266)

npm다운받기 [https://www.npmjs.com/package/busboy](https://www.npmjs.com/package/busboy)
```javascript
/*
* This module will parse the multipart-form containing files and fields from the lambda event object.
* @param {event} - an event containing the multipart-form in the body
* @return {object} - a JSON object containing array of files and fields, sample below.

{
	files: [
		{

			filename: 'test.pdf',
			content: <Buffer 25 50 6f 62 ... >,
			contentType: 'application/pdf',
			encoding: '7bit',
			fieldname: 'uploadFile1'
		}
	],
	field1: 'VALUE1',
	field2: 'VALUE2',
}
*/
```
먼저 피드정보를 string으로 받고 사진을 file로 받기 때문에 위와같은 구조로 return해주는 busboy모듈이 딱 적당해보였다.
busboy.js의 사용방법을 설명해보면

```javascript
const  parse = (event) =>  new  Promise((resolve, reject) => {

const  result = {
	files: []
};

// 이곳에 전송받은 data가 들어오게 된다.
busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
	const  uploadFile = {};
	file.on('data', data  => {
		uploadFile.content = data;
		let  s3bucket = new  AWS.S3({
		accssKeyId:  IAM_USER_KEY,
		secretAccessKey:  IAM_USER_SECRET,
		Bucket:  BUCKET_NAME
	});

	var  params = {
		Bucket:  BUCKET_NAME,
		Key:  filename,
		Body:  data
	};

	// file은 전송받자마자 s3에 저장
	s3bucket.putObject(params, function (err, data) {
		if (err) {
			console.log('error in callback');
			console.log(err);
		}

		console.log('success');
		console.log(data);
		});
	});

	// upload한 file의 정보를 result에 넣어준다.
	file.on('end', () => {
		if (uploadFile.content) {
			uploadFile.filename = filename;
			uploadFile.contentType = mimetype;
			uploadFile.encoding = encoding;
			uploadFile.fieldname = fieldname;
			result.files.push(uploadFile);
		}
	});
});

// 전송받은 feed정보를 result에 넣어준다.
busboy.on('field', (fieldname, value) => {
	result[fieldname] = value;
});
```
이렇게 busboy에서 받은 data를 result에 정리해서 넣어주면 index.js에서 사용하면된다!

```javascript
var userParams = {
	TableName:  "user",
	Key:{
		"id":  result['userId']
	}
};
```

# 마무리
사람들이 lambda는 node로 해야한다고 말하는 이유를 느꼈던 업로드 구현이었다. 자바에서 그렇게 고민하던 것이 여기서는 이렇게 쉽게 끝나다니,, 노드를 이렇게 제대로 써보는 것은 처음이었는데 자바로 길게 구현해야하는 람다 기능들이 짧고 간단하게 구현이되어서 왜 람다는 노드로 해야한다고 말하는지 깨달았다.
