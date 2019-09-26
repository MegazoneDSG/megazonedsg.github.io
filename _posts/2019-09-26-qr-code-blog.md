---
layout: post
author: insupark83
notification: false
title: "QR code(Quick Response code) 생성"
description: "QR code(Quick Response code)"
image: "http://datagenetics.com/blog/november12013/anat.png"
categories:
- programming
date: 2019-09-26 20:05:00
tags:
- qrCode
- zxing

introduction: "QR code(Quick Response code) 생성"
twitter_text: "QR code(Quick Response code) 생성"
---


회사에서  운영업무를 하면서 유저들어게 QR 코드를 발급하여 통역기를 대여하는 서비스를 개발하게 되었다.

QR 코드를 생성하는 방법은  간단하고 여러가지가 있다.  

API를 통해 QR을 생성할 수도 있고 라이브러리를 사용해서 생성 할 수도 있다.  

보통 API를 사용한 경우가 많으나 버전업 될때 갑자기 생성이 안되는 경우 ,deprecated 된 경우가 있어서

안전하게 후자의 방법으로 QR 생성하는 방법을 살펴보겠다.

<br><br>
# Javascript로 생성하는 방법

- [이곳](https://davidshimjs.github.io/qrcodejs/)에 가서 먼저 qrcode.js를 다운받는다

- 뷰페이지에 해당 코드를 넣으면 완성

```javascript
 <div style="border: 2px solid #000;width:500px">
	 <div id="qrcode"></div>
 </div>
 
<script src="경로/qrcode.js"></script>

var qrcode = new QRCode(document.getElementById("qrcode"), {
 text: "QR리더기로 읽을때 표시될 문자. url이 될수도 있다",
 width: 300,  //가로
 height: 300, //세로
 colorDark : "#000000", //qr에서 어두운 색 (보통 검은색) 
 colorLight : "#ffffff", //qr에서 밝은 색 (보통 하얀색) colorDark 보다 옅어야한다.
 correctLevel : QRCode.CorrectLevel.H //qr코드 오류복원능력임 (L->M->Q->H)
 });

```

QR코드는 코드의 손상에도 코드 자체에 데이터를 복원하는 기능이 있다. 

4단계가 있으며 레벨을 올리게 되면 복원 능력은 향상되지만 이미지 크기가 커진다.

자세한 사항은 [요기](https://www.qrcode.com/en/about/error_correction.html) 를 참조하자.

무엇일까요?
![qr](https://user-images.githubusercontent.com/32725840/65689407-fbca2500-e0a7-11e9-903e-fdac97002921.png)



<br><br>



# JAVA 로 생성하는 방법

`zxing` 라이브러리는 자바로 구현된 1차/2차원 바코드 이미지 프로세싱을 다루는 오픈소스다. 
 
- maven dependency 설정

``` xml
<dependency>
    <groupId>com.google.zxing</groupId>
    <artifactId>javase</artifactId>
    <version>3.1.0</version>
</dependency>
```

- 코드 작성


``` java


try {
	  createQRCodeImage("QR내용", 350, 350, 0x00000000, 0xFFFFFFFF);
	} catch (WriterException e) {
	    log....
	} catch (IOException e) {
	    log....
}

public void createQRCodeImage(String text, int width, int height, int qrDarkColor, int qrLightColor)throws WriterException, IOException {
  QRCodeWriter qrCodeWriter = new QRCodeWriter();
  BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height); //텍스트, 바코드 포맷,가로,세로
    
	MatrixToImageConfig config = new MatrixToImageConfig(qrDarkColor , qrLightColor); //진한색, 연한색
	BufferedImage qrImage = MatrixToImageWriter.toBufferedImage(matrix , config);

	File temp =  File.createTempFile(text, ".png"); 
	ImageIO.write(qrImage, "png",temp ); //temp 위치에 qr이 이미지 생성됨. 
	InputStream is = new FileInputStream(temp.getAbsolutePath()); // 인풋 스트림으로 변환(향후 S3로 업로드하기위한 작업)

	//로직처리후 temp.delete() 와 is.close()를 해줘야함.
    }
```

바코드 포맷은 [요기](https://zxing.github.io/zxing/apidocs/com/google/zxing/BarcodeFormat.html) 를 가면 자세히 볼 수 있다.
