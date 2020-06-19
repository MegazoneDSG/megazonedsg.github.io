---
layout: post
author: jangjinik
notification: false
title: "YouTube Data API v3 사용해보기 (2/2)"
description: YouTube Data API v3 사용해보기 (2/2)
image: "https://user-images.githubusercontent.com/60992288/85112999-8d3e8000-b251-11ea-8900-dcd837799257.png"
categories:
- java
date: 2020-06-19 17:00:00
tags:
- youtube
introduction: YouTube Data API v3 사용해보기
twitter_text: YouTube Data API v3 사용해보기
---

앞서서 YouTube Data API v3를 사용하기 위해서, 구글 계정으로 프로젝트와 API Key, YouTube Data API v3 서비스 등록을 진행하였습니다.

이전블로그 참고 :  [https://megazonedsg.github.io/tutorial-youtube-api/](https://megazonedsg.github.io/tutorial-youtube-api/)

이번에는 YouTube Data API v3를 Spring Boot 프로젝트를 만들어 서비스를 호출하도록 하겠습니다.
[https://developers.google.com/youtube/v3/getting-started](https://developers.google.com/youtube/v3/getting-started)

[https://developers.google.com/youtube/v3/quickstart/java](https://developers.google.com/youtube/v3/quickstart/java)

1. Spring Boot 프로젝트 생성
2. YouTube Data API v3, Gradle 의존성 추가
3. YouTubeDto 생성
4. YouTubeProvider 생성
5. YouTubeService 생성
6. YouTubeController 생성
7. 결과확인
 

# 시작

이제 서비스 할 수 있는 프로젝트를 만들고, YouTube Data API v3 를 사용하겠습니다.

### 첫번째, Spring Boot 프로젝트 생성

##### 프로젝트 생성
intelliJ에서 ‘new > project > Spring Initializr’ 선택 후 아래와 같이 설정해주세요. 
![](https://user-images.githubusercontent.com/60992288/85116118-ca0d7580-b257-11ea-916c-52eb84321063.png)

##### 프로젝트 Dependencies 추가
Developer Tools > Lombok  선택

Web > Spring Web 선택

‘Next’ 클릭


이렇게만 한다면, 프로젝트가 생성됩니다. 

이제 YouTube API, Google API 라이브러리 추가, Controller, Dto, Provider, Service 를 생성해보겠습니다.


### 두번째, YouTube Data API v3, Gradle 의존성 추가
프로젝트 루트의 build.gradle 파일을 수정합니다.
>build.gradle
```
dependencies {
... 생략 ...
    compile 'com.google.api-client:google-api-client:1.30.9'
    compile 'com.google.oauth-client:google-oauth-client-jetty:1.23.0'
    compile 'com.google.apis:google-api-services-youtube:v3-rev222-1.25.0'
... 생략 ...
}
```

gradle 을 빌드 다시 해주세요. 그렇게 해야만 의존성이 추가 됩니다.

### 세번째, YouTubeDto 생성
조회한 데이터를 담을 수 있는 그릇을 만들겠습니다. 
아래 3가지 항목외에 더 필요한 정보가 있다면, 공식 API 문서를 참고해서 수정합니다.

>src/main/java/{package}/dto/youtube/YouTubeDto.java
```
@Getter
@Setter
@NoArgsConstructor
public class YouTubeDto {

  private String title; // 동영상 제목
  private String thumbnailPath; //동영상 썸네일 경로
  private String videoId; // 동영상 식별 ID

  @Builder(toBuilder = true)
  public YouTubeDto(String title, String thumbnailPath, String videoId) {
    this.title = title;
    this.thumbnailPath = thumbnailPath;
    this.videoId = videoId;
  }
}
```

### 네번째, YouTubeProvider 생성

>src/main/java/{package}/service/youtube/spec/YouTubeProvider.java
```
import com.jinik.tutorial.demo.dto.youtube.YouTubeDto;

public interface YouTubeProvider {
  YouTubeDto get();
}
```

### 다섯번째, YouTubeService 생성
이제 여기에서, 우리가 원하던 YouTube Data API v3 구현해보겠습니다.

저는 공식 API 의 코드를 참고하여 search 기능을 videos 기능으로 변경하여 따라해보았습니다..

(videos는 php만 예제만.... ) 

그리고 **저의 목적은 동영상의 재생시간을 가져오기* 위해서 videos API가 필요했어요.

[https://developers.google.com/youtube/v3/docs/search/list](https://developers.google.com/youtube/v3/docs/search/list)

[https://developers.google.com/youtube/v3/docs/videos/list](https://developers.google.com/youtube/v3/docs/videos/list)


>src/main/java/{package}/service/youtube/YouTubeService.java
```
import com.google.api.client.googleapis.json.GoogleJsonResponseException;
import com.google.api.client.http.HttpRequest;
import com.google.api.client.http.HttpRequestInitializer;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.services.youtube.YouTube;
import com.google.api.services.youtube.model.Thumbnail;
import com.google.api.services.youtube.model.Video;
import com.jinik.tutorial.demo.dto.youtube.YouTubeDto;
import com.jinik.tutorial.demo.service.youtube.spec.YouTubeProvider;
import java.io.IOException;
import java.util.Iterator;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class YouTubeService implements YouTubeProvider {

  private static final HttpTransport HTTP_TRANSPORT = new NetHttpTransport();
  private static final JsonFactory JSON_FACTORY = new JacksonFactory();
  private static final long NUMBER_OF_VIDEOS_RETURNED = 1;
  private static YouTube youtube;

  private static void prettyPrint(Iterator<Video> iteratorSearchResults, YouTubeDto youTubeDto) {

    System.out.println("\n=============================================================");
    System.out.println("=============================================================\n");

    if (!iteratorSearchResults.hasNext()) {
      System.out.println(" There aren't any results for your query.");
    }

    while (iteratorSearchResults.hasNext()) {

      Video singleVideo = iteratorSearchResults.next();

      // Double checks the kind is video.
      if (singleVideo.getKind().equals("youtube#video")) {
        Thumbnail thumbnail = (Thumbnail) singleVideo.getSnippet().getThumbnails().get("default");

        System.out.println(" Video Id" + singleVideo.getId());
        System.out.println(" Title: " + singleVideo.getSnippet().getTitle());
        System.out
            .println(" contentDetails Duration: " + singleVideo.getContentDetails().getDuration());
        System.out.println(" Thumbnail: " + thumbnail.getUrl());
        System.out.println("\n-------------------------------------------------------------\n");

        youTubeDto.setThumbnailPath(thumbnail.getUrl());
        youTubeDto.setTitle(singleVideo.getSnippet().getTitle());
        youTubeDto.setVideoId(singleVideo.getId());

      }
    }
  }

  @Override
  public YouTubeDto get() {
    YouTubeDto youTubeDto = new YouTubeDto();

      try {
        youtube = new YouTube.Builder(HTTP_TRANSPORT, JSON_FACTORY, new HttpRequestInitializer() {
          public void initialize(HttpRequest request) throws IOException {
          }
        }).setApplicationName("youtube-video-duration-get").build();

        //내가 원하는 정보 지정할 수 있어요. 공식 API문서를 참고해주세요.
        YouTube.Videos.List videos = youtube.videos().list("id,snippet,contentDetails");
        videos.setKey("### 여기에 앞서 받은 API키를 입력해야 합니다.");     
        videos.setId("### 여기에는 유튜브 동영상의 ID 값을 입력해야 합니다.");
        videos.setMaxResults(NUMBER_OF_VIDEOS_RETURNED); //조회 최대 갯수.
        List<Video> videoList = videos.execute().getItems();

        if (videoList != null) {
          prettyPrint(videoList.iterator(), youTubeDto);
        }

      } catch (GoogleJsonResponseException e) {
        System.err.println("There was a service error: " + e.getDetails().getCode() + " : "
            + e.getDetails().getMessage());
      } catch (IOException e) {
        System.err.println("There was an IO error: " + e.getCause() + " : " + e.getMessage());
      } catch (Throwable t) {
        t.printStackTrace();
      }

    return youTubeDto;
  }
}
```

### 여섯번째, YouTubeController 생성
이제 요청을 받고, API를 호출 할 수 있게 Controller를 생성하겠습니다.

>src/main/java/{package}/controller/youtube/YouTubeController.java
```
import com.jinik.tutorial.demo.dto.youtube.YouTubeDto;
import com.jinik.tutorial.demo.service.youtube.spec.YouTubeProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class YouTubeController {

  private YouTubeProvider youTubeProvider;

  @Autowired
  public YouTubeController(
      final YouTubeProvider youTubeProvider
  ) {
    this.youTubeProvider = youTubeProvider;
  }

  @GetMapping("youtube")
  public YouTubeDto Index() {
    return youTubeProvider.get();
  }
  
}
```

### 일곱번째, 결과 확인
서버를 구동하고, http://localhost:8080/youtube 으로 호출해 보았습니다. 

저는 [https://www.youtube.com/watch?v=TgOu00Mf3kI](https://www.youtube.com/watch?v=TgOu00Mf3kI) 이 영상을 가져와 보았습니다.

##### 결과 확인!
![](https://user-images.githubusercontent.com/60992288/85117147-608e6680-b259-11ea-917f-74cc88b79757.png)
---
![](https://user-images.githubusercontent.com/60992288/85117234-83b91600-b259-11ea-8bd0-715bb6799a62.png)

위와 같이 결과가 정상적으로 데이터를 가져왔네요~~

이상으로 YouTube Data API v3 사용하기 였습니다.

