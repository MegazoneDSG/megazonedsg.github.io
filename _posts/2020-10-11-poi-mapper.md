---
layout: post
author: seungpilpark
notification: true
title: "Poi-mapper(Excel model mapper) 라이브러리 개발기"
description: Poi-mapper(Excel model mapper) 라이브러리 개발기
image: "https://user-images.githubusercontent.com/61041926/95656676-dee58000-0b4a-11eb-936e-3cc22d5a4432.png"
categories:
- java
date: 2020-10-11 11:00:00
tags:
- enum
introduction: Poi-mapper(Excel model mapper) 라이브러리 개발기
twitter_text: Poi-mapper(Excel model mapper) 라이브러리 개발기
---

# Poi-mapper(Excel model mapper) 라이브러리 개발기

깃허브 주소 **[poi-mapper](https://github.com/MegazoneDSG/poi-mapper)** (좋아요 Github Star 클릭 한번씩 해주시면 감사합니다 ^^)

![](https://user-images.githubusercontent.com/61041926/95656676-dee58000-0b4a-11eb-936e-3cc22d5a4432.png)

최근 프로젝트를 진행하면서, 다소 복잡한 요구사항의 엑셀작업을 필요로 하는 어플리케이션을 구축해야 할 일이 생겼습니다.
물류관련 업무에서는 발주,정산,물류이동작지등 회사 내부의 인력 뿐 아니라 회사 외부 (거래처) 에도 공유되게 되는데, 이러한 문서는 단순한 데이터 나열뿐 아니라 결재문서양식의 모습을 하게 됩니다.

많은 수의 양식을 보다 효과적으로 개발하기 위해 어노테이션 기반의 엑셀 모델 매퍼 라이브러리를 개발하게 되었습니다.

해당 라이브러리는 유명한 Java Excel Library 인 [Apaceh Poi](https://poi.apache.org/) 를 어노테이션으로 개발할 수 있게 해 줍니다.

기존에는 Apaceh Poi 만을 사용하여 원하는 데이터를 엑셀로 표현하게 될 경우,

- per row, per cell 마다 하드코딩이 들어가기 때문에 디버깅이 어려움
- Excel 을 데이터로 변환할경우와 데이터를 Excel로 변환하는 두가지 케이스 모두 제작해야함.
- 개발 시간이 오래걸림

반면 Poi-mapper 를 사용하게 될 경우 다음과 같은 장점이 있습니다.

- Model Spec 를 디버깅 없이 육안으로 바로 구조를 파악할 수 있을만큼 명시적입니다.
- 하나의 모델로 Excel to Data, Data to Excel 변환이 가능합니다.
- 개발시간 단축

![](https://user-images.githubusercontent.com/61041926/95668442-11c15f80-0baf-11eb-8e96-d1dd8abb9530.png)

사용법과 Model 를 만드는 법은 **[poi-mapper](https://github.com/MegazoneDSG/poi-mapper)** 에서 확인하실 수 있습니다.

감사합니다.

