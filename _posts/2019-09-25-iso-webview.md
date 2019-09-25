---
layout: post
author: youngjucha
notification: false
title: "[iOS] Webview에서 구현 가능한 URL 호출 처리방식"
description: [iOS] Webview에서 구현 가능한 URL 호출 처리방식
image: "http://d1841mjet2hm8m.cloudfront.net/thumb-900/fb_1135/1620/4/7363c8f36313431d34743b122393a5ae.jpg"
categories:
- programming
date: 2019-09-25 21:05:00
tags:
- iOS
- swift
- App
- Mobile
introduction: [iOS] Webview에서 구현 가능한 URL 호출 처리방식
twitter_text: [iOS] Webview에서 구현 가능한 URL 호출 처리방식
---


iOS Webview에서 구현가능한 URL 호출 처리방식 아래 4가지 방식에 대해 알아보겠습니다.

## 사파리 호출

기존 브라우저 앱을 통한 특정 URL 노출 방식, 

기존 앱에서 포커스가 벗어나 다른 앱으로 이동하는 결과를 도출

```swift
    let url = URL(string: "https://megazonedsg.github.io/")
    UIApplication.shared.open(url!, options: [:])
```

-  UIWebview (Deprecated)

    기존의 iOS에서 사용하던 웹 뷰 기반 컴포넌트, UIKit의 일부

```swift
    // UIWebview객체에 대한 아울렛 변수
    @IBOutlet var webView: UIWebview!
    
    // URLRequest 객체 생성
    let url = URL(string: "https://megazonedsg.github.io/")
    let request = URLRequest(url: url!)

    self.webView.loadRequest(request)
```

## WKWebview

iOS8부터 새로 지원되기 시작한 컴포넌트로서 UIWebview에서 자바스크립트 처리 등 느린 성능을 개선

UIWebview와 거의 동일하지만 UIKit 프레임워크에 속해 있는 UIWebview와는 달리 WKWebview는 `WebKit` 이라는 별도 프레임워크 반입 정의 필요

```swift
    // WKWebview 사용을 위한 프레임워크 반입 정의
    import WebKit

    // WKWebview 객체에 대한 아울렛 변수
    @IBOutlet var webView: WKWebview!

    // URLRequest 객체 생성
    let url = URL(string: "https://megazonedsg.github.io/")
    let request = URLRequest(url: url!)

    self.webView.load(request)
```


## SFSafariViewController

사파리앱에서 사용하는 뒤로가기/앞으로가기, 북마크, 공유 등의 기능을 그대로 지원하되, 앱 내부에서 사용 가능

```swift
    // SFSafariViewController 사용을 위한 프레임워크 반입 정의
    import SafariServices

    // URL 객체 생성
    let url = URL(string: "https://megazonedsg.github.io/")
    let safariViewController = SFSafariViewController(url: url)

    // 화면 전환
    present(safariViewController, animated: true, completion: nil)

```

실무에서 중요한 객체로는 원하는대로 커스터마이징이 가능한 WKWebview입니다.
웹의 JavaScript와 iOS 네이티브상에서 통신을 바탕으로 커스터마이징하는 상황이 많음으로서
UIWebview는 Deprecate되었으며 속도나 기능성면으로도 WKWebview 권장합니다.
