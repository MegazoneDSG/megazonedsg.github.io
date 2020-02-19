---
layout: post
author: hyeonjeongk
notification: false
title: "[Tutorial] JPA - CRUD RestController 만들기 [2/3]"
description: JPA의 기본적인 사용방법을 익히기 위해 작성하는 글.
image: "https://user-images.githubusercontent.com/55119239/74632964-ea430000-51a3-11ea-8e7d-a8ecb6402a86.png"
categories: 
- tutorial
date: 2020-02-17 16:59:00
tags: 
- JPA
- Spring Data JPA
introduction: JPA의 기본적인 사용방법을 익히기 위해 작성하는 글.
twitter_text: JPA의 기본적인 사용방법을 익히기 위해 작성하는 글.
---

# *[Tutorial] JPA - CRUD RestController 만들기 [2/3]*

이번에는 JPA를 쉽고, 편하게 구현하기 위해 Spring Data JPA를 활용해보았습니다.  

JPA를 사용하기에 앞서, [Object Relation Mapping](https://megazonedsg.github.io/object-relational-mapping/)에 대해 살펴보면 좋을 것 같습니다. 

Spring Data JPA를 구현하면서 아래의 사이트를 참조했습니다. 
* [Spring Data JPA](https://spring.io/projects/spring-data-jpa#overview)
* [[Github] Spring Data JPA Samples > spring-data-examples](https://github.com/spring-projects/spring-data-examples/tree/master/jpa)

예제들을 공부하기에 좋은 사이트입니다. 
* [Baeldung](https://www.baeldung.com/)

간단한 Book Table을 기준으로, CRUD RestController를 만들어보겠습니다.  

```
Class: BookEntity
Field: 
  UUID      id
  String    name
  String    category
  Long      sellCount
  TimeStamp createAt
```


개발 순서는 아래와 같이 진행했습니다.  
1. 프로젝트 생성 
2. Database connection  
3. Entity 생성  
4. Repository 구현  
5. Controller 구현  


### 프로젝트 생성
Spring Initializr를 통해 `example-book`프로젝트를 생성합니다.  
아래 라이브러리들을 추가했습니다.  
* Spring Web
* Spring Data JPA
* H2 Database


### Database Connection 
h2 database는 in-memory 방식으로 간편하게 사용할 수 있습니다.  

`/resources/application.properties` 설정입니다. 
```
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

spring.jpa.properties.hibernate.show_sql=true
spring.jpa.properties.hibernate.format_sql=true
  
spring.h2.console.enabled=true
```

참조1: [https://www.baeldung.com/spring-boot-h2-database](https://www.baeldung.com/spring-boot-h2-database)  

참조2: [https://www.baeldung.com/spring-boot-access-h2-database-multiple-apps](https://www.baeldung.com/spring-boot-access-h2-database-multiple-apps)  
  
  
SQL 보기 및 정렬, h2 database의 콘솔 화면을 볼 수 있는 옵션을 추가했습니다.  

서버 구동 후 `http://localhost:8080/h2-console`로 접속해 연결이 잘 되는지 테스트합니다.  
h2 Driver가 로드되지 않는다는 등의 오류로 서버 구동이 되지 않을 경우,  
추가된 설정 뒷부분에 공백이 있지 않는지 점검해주시기 바랍니다.  

<img width="340" alt="스크린샷 2020-02-17 오후 4 53 27" src="https://user-images.githubusercontent.com/55119239/74633889-0a73be80-51a6-11ea-8ebc-dfb863ee1672.png">


잘 연결되었네요. 
  
  
### BookEntity 생성
```
package com.mz.example.examplebook.domain.book;  
  
import org.hibernate.annotations.CreationTimestamp;  
import org.hibernate.annotations.Type;  
  
import javax.persistence.*;  
import java.util.Date;  
import java.util.UUID;  
  
@Entity  
@Table(name="book")  
public class BookEntity {  
  
  @Id  
  @Type(type = "uuid-char")  
  @GeneratedValue  
  private UUID id;  
  
  @Column(nullable = false)  
  private String name;  
  
  @Column(nullable = false)  
  private String category;  
  
  @Column(nullable = false)  
  private long sellCount;  
  
  @Column(nullable = false, updatable = false)  
  @Temporal(TemporalType.TIMESTAMP)  
  @CreationTimestamp  
  private Date createAt;

  // default, all args constructor...
  // getter, setter
  // toString...
}
```

참조: [https://www.baeldung.com/spring-boot-hibernate](https://www.baeldung.com/spring-boot-hibernate)

`@GeneratedValue` ID생성 방식에 대한 정의로, Id 필드의 타입이 `UUID`일 경우 자동으로 uuid를 생성해 값을 넣어줍니다.  

참조: [https://www.baeldung.com/hibernate-identifiers](https://www.baeldung.com/hibernate-identifiers)  

서버 재구동 후 로그를 확인했습니다.  
Book 테이블이 생성되어있습니다.  

<img width="300" alt="스크린샷 2020-02-17 오후 1 44 12" src="https://user-images.githubusercontent.com/55119239/74625244-02f4eb00-518f-11ea-8ba4-ae33fa85c55a.png">



### BookRepository  생성 
```
package com.mz.example.examplebook.domain.book;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface BookRepository extends CrudRepository<BookEntity, UUID> {

}
```

`CrudRepository`를 상속 받은 Repository를 구현합니다.  
기본적인 CRUD 구현은 끝났습니다.  

참조1: [https://www.baeldung.com/spring-boot-hibernate](https://www.baeldung.com/spring-boot-hibernate)  

참조2: [`CrudRepository`와 `JpaRepository`﻿](https://stackoverflow.com/questions/14014086/what-is-difference-between-crudrepository-and-jparepository-interfaces-in-spring)  



### BookController 생성 
```
package com.mz.example.examplebook.domain.book;  
  
import org.springframework.beans.factory.annotation.Autowired;  
import org.springframework.web.bind.annotation.*;  
  
import java.util.ArrayList;  
import java.util.List;  
import java.util.UUID;  
  
@RestController()  
public class BookController {  
  
  @Autowired  
  private BookRepository bookRepository;  
  
  @PostMapping("/book")  
  public BookEntity createBook(@RequestBody BookEntity bookEntity) {  
    BookEntity created = bookRepository.save(bookEntity);  
    return created;  
  }  
  
  @GetMapping("/book")  
  public List<BookEntity> listAllBooks() {  
    List<BookEntity> list = new ArrayList<>();  
    Iterable<BookEntity> iterable = bookRepository.findAll();  
    for (BookEntity bookEntity : iterable) {  
      list.add(bookEntity);  
    }  
    return list;  
  }  
  
  @PutMapping("/book/{bookId}")  
  public BookEntity updateBook(@PathVariable("bookId") UUID bookId,  
                                 @RequestBody BookEntity bookEntity) {  
      bookEntity.setId(bookId);  
      BookEntity updated = bookRepository.save(bookEntity);  
      return updated;  
  }  
  
  @DeleteMapping("/book/{bookId}")  
  public void deleteBook(@PathVariable("bookId") UUID bookId) {  
    bookRepository.deleteById(bookId);  
  }  
}
```



### data.sql

`/resources/data.sql` 파일을 생성해보았습니다.  
테스트용 초기 데이터를 추가해두었습니다.  
해당 위치에 있으면 `Spring JDBC`가 자동으로 이를 인식하고 sql을 실행해줍니다.   

```
INSERT INTO book (id, name, category, sell_count, create_at) VALUES
     ('7c9649e3-944a-4bfc-a332-e77c3ce517af', '열 번의 산책', '인문', 9000, NOW()),
     ('c164e06d-a57c-4045-a03d-43ce3b33d09a', '숲길', '인문', 12000, NOW()),
     ('f60dfe05-ba02-4f18-b663-eb0f0d2be4c9', '바닷마을 인문학', '인문', 13500, NOW()),
     ('bf4f57d6-f2bd-4c04-9138-2d214a943019', '트렌드 코리아 2020', '경제', 25400, NOW()),
     ('0918b305-093c-4d83-bcdf-49ec86a701ed', '부의 인문학', '경제', 14500, NOW()),
     ('faaacd46-240a-434c-a210-a3de0d6d9292', '넛지', '경제', 13500, NOW()),
     ('d02f77b1-51de-4505-ad87-5e6dc3dfa4c2', '일의 기쁨과 슬픔', '소설', 11000, NOW()),
     ('d41b537f-3f0b-4d84-9e7f-d33668c4a3bc', '아몬드', '소설', 12000, NOW()),
     ('875125be-c1a4-4496-a7b5-9b2cbf39a2b3', '한국단편소설 40', '소설', 14700, NOW()),
     ('70afb424-7223-42df-9881-96a6284eacc2', '대한민국 요즘 여행', '여행', 16920, NOW());
```

서버 재구동 후 Postman으로 테스트해보았습니다.    

<img width="340" alt="스크린샷 2020-02-17 오후 2 08 09" src="https://user-images.githubusercontent.com/55119239/74625246-04beae80-518f-11ea-9e32-316b520051ff.png">


여기까지 JPA tutorial이었습니다.  


