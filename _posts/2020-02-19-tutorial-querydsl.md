---
layout: post
author: hyeonjeongk
notification: true
title: "[Tutorial] QueryDSL 적용하기 - [3/3]"
description: QueryDSL의 기본적인 사용방법을 익히기 위해 작성하는 글.
image: "https://user-images.githubusercontent.com/55119239/74795179-9998e780-5308-11ea-8c99-3424a9c5a8db.png"
categories: 
- tutorial
date: 2020-02-19 11:14:00
tags: 
- QueryDSL
introduction: QueryDSL의 기본적인 사용방법을 익히기 위해 작성하는 글.
twitter_text: QueryDSL의 기본적인 사용방법을 익히기 위해 작성하는 글.
---

# *[Tutorial] QueryDSL 적용하기 - [3/3]*



마지막으로 QueryDSL 적용 튜토리얼을 작성해보겠습니다.  
QueryDSL 적용을 통해 Left Join을 구현해보고자 합니다.  

QueryDSL의 정의를 먼저 살펴보았습니다.  
- QueryDSL
	- 개념 
		- 정적 타입으로 된 SQL과 같은 쿼리를 구성할 수 있도록 해주는 프레임워크  
	- 원칙
		- 타입안정성 (Type safety)
		- 일관성(consistency) 
	- JPA Query 
		- JPQL과 Criteria 쿼리 모두 대체 가능 
		- Criteria 쿼리의 동적 특징과 JPQL의 표현력을 Type에 안전한 방법으로 제공  

정리하자면, 이렇게 이해할 수 있을 것 같습니다.  
조금 더 복잡해진 쿼리를 type에 안전하게 사용할 수 있다.    
또한 동적 쿼리도 사용 가능하다.  


참조: 
* [QueryDSL Reference Guide](http://www.querydsl.com/static/querydsl/4.0.1/reference/ko-KR/html_single/)
* [[Baeldung] intro-to-querydsl](https://www.baeldung.com/intro-to-querydsl)
* [[Baeldung] A Guide to Querydsl with JPA](https://www.baeldung.com/querydsl-with-jpa-tutorial)


이 튜토리얼에서는 QueryDSL의 Join 기능을 간단하게 구현해보았습니다.  

* API Spec
	* `POST` /book/{book_id}/rental : 책 대여 기록 인서트
	* `GET` /book/{book_id}/rental : 해당 책의 대여 기록 리스트
	* `PUT` /book/{book_id}/rental/{rental_id}/return : 책 반납


진행한 튜토리얼 순서는 아래와 같습니다.   

1. QueryDSL Maven 설정  
2. BookRentalEntity 추가   
3. Maven Install  
4. Repository 구현  
5. Controller 구현  



### 1. QueryDSL Maven 설정  

JPA와 함께 QueryDSL을 사용하기 위한 의존성을 추가해보겠습니다.   

`pom.xml`
```
<dependency>
  <groupId>com.querydsl</groupId>
  <artifactId>querydsl-apt</artifactId>
  <version>${querydsl.version}</version>
  <scope>provided</scope>
</dependency>

<dependency>
  <groupId>com.querydsl</groupId>
  <artifactId>querydsl-jpa</artifactId>
  <version>${querydsl.version}</version>
</dependency>
```

또한 maven APT plugin도 추가해줍니다. 
```
<project>
  <build>
  <plugins>
    ...
    <plugin>
      <groupId>com.mysema.maven</groupId>
      <artifactId>apt-maven-plugin</artifactId>
      <version>1.1.3</version>
      <executions>
        <execution>
          <goals>
            <goal>process</goal>
          </goals>
          <configuration>
            <outputDirectory>target/generated-sources/java</outputDirectory>
            <processor>com.querydsl.apt.jpa.JPAAnnotationProcessor</processor>
          </configuration>
        </execution>
      </executions>
    </plugin>
    ...
  </plugins>
  </build>
</project>
```

`JPAAnnotationProcessor`는 `javax.persistence.Entity` annotation이 추가된 도메인 타입을 찾아 쿼리 타입을 생성해줍니다.  


### 2. BookRentalEntity 추가 
```
BookRentalEntity

UUID    id
UUID    bookId
string  userId
string  userName
boolean returned
Date    createAt
```

```
package com.mz.example.examplebook.domain.book;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;

import javax.persistence.*;
import java.util.Date;
import java.util.UUID;

@Entity
@Table(name = "book_rental")
public class BookRentalEntity {

	@Id
	@Type(type = "uuid-char")
	@GeneratedValue
	private UUID id;

	@ManyToOne(targetEntity = BookEntity.class)
	@JoinColumn(name = "book_id")
	private BookEntity bookEntity;

	@Column(nullable = false)
	private String userId;

	@Column(nullable = false)
	private String userName;

	@Column(nullable = false)
	private boolean returned = false;

	@Column(nullable = false, updatable = false)
	@Temporal(TemporalType.TIMESTAMP)
	@CreationTimestamp
	private Date createAt;

	// default and all args constructor...
	// getters and setters...
	// toString...
}
```

`Book` Class에는 별도 설정을 더하지 않았습니다. 
`@ManyToOne`만 사용함으로써 단방향으로 연결했습니다. 


### 3. Maven install

쿼리 타입 entity를 생성해보겠습니다. 
maven install 혹은 compile을 진행합니다. 

```
mvn install
```
프로젝트의 pom.xml이 위치하는 루트에서 명령어를 실행하거나,  
maven 도구를 사용합니다.  

<img width="340" alt="스크린샷 2020-02-19 오전 10 57 43" src="https://user-images.githubusercontent.com/55119239/74795181-9b62ab00-5308-11ea-8979-3cec236814bb.png">
  
  
`target/generated-sources`위치의 java package 내에 보면 entity가 잘 생성되었습니다.   

<img width="340" alt="스크린샷 2020-02-19 오전 10 53 03" src="https://user-images.githubusercontent.com/55119239/74795193-a1f12280-5308-11ea-834f-5e5406aba4cf.png">  

### 4. Repository 구현 
#### BookRentalRepository
```
package com.mz.example.examplebook.domain.book;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface BookRentalRepository extends CrudRepository<BookRentalEntity, UUID> {

}
```

-   `POST`  /book/{book_id}/rental : 책 대여 기록 인서트  
-   `PUT`  /book/{book_id}/rental/{rental_id}/return : 책 반납  

두 가지 기능은 `CrudRepository`를 상속해 구현했습니다.  
아래 기능은 QueryDSL의 left join을 활용했습니다. 

- `GET` /book/{book_id}/rental : 해당 책의 대여 기록 리스트


book_rental 테이블과 book 테이블의 left join 쿼리를 먼저 작성해보겠습니다.  

```
SELECT 
	*
FROM   
	book_rental
LEFT JOIN 
	book
ON 
	book_rental.book_id = book.id
WHERE 
	book_id = "";
```

해당 쿼리가 잘 실행되는지 확인 후 쿼리를 QueryDSL 코드로 옮겨보았습니다. 

#### BookRentalCustomRepository
```
package com.mz.example.examplebook.domain.book;

import com.querydsl.core.support.FetchableQueryBase;
import com.querydsl.core.support.QueryBase;
import com.querydsl.jpa.impl.JPAQuery;

import org.springframework.stereotype.Repository;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

import java.util.List;
import java.util.UUID;

@Repository
public class BookRentalCustomRepository {

	@PersistenceContext
	private EntityManager entityManager;

	public List<BookRentalEntity> listBookRentalByBookId(UUID bookId) {
		JPAQuery<?> query = new JPAQuery<>(entityManager);

		QBookEntity qBookEntity = QBookEntity.bookEntity;
		QBookRentalEntity qBookRentalEntity = QBookRentalEntity.bookRentalEntity;

		List<BookRentalEntity> fetched = query.select(qBookRentalEntity)
			  .from(qBookRentalEntity)
		  	  .leftJoin(qBookEntity)
		      .on(qBookRentalEntity.bookEntity.id.eq(qBookEntity.id))
			  .where(qBookRentalEntity.bookEntity.id.eq(bookId))
			  .fetch();

		return fetched;
	}
}
```

String 등으로 작성하지 않고, 주어진 기능들로 쿼리를 작성할 수 있습니다. 


### 5. Controller 구현 
```
package com.mz.example.examplebook.domain.book;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class BookRentalController {

	@Autowired
	private BookRepository bookRepository;

	@Autowired
	private BookRentalRepository bookRentalRepository;

	@Autowired
	private BookRentalCustomRepository bookRentalCustomRepository;

	@PostMapping("/book/{bookId}/rental")
	public BookRentalEntity createBookRental(@PathVariable("bookId") UUID bookId,
	                                         @RequestBody BookRentalEntity bookRentalEntity) {

		BookRentalEntity created = null;

		BookEntity bookEntity = bookRepository.findById(bookId).get();
		if(bookEntity != null) {
			bookRentalEntity.setBookEntity(bookEntity);
			created = bookRentalRepository.save(bookRentalEntity);
		}

		return created;
	}

	@GetMapping("/book/{bookId}/rental")
	public List<BookRentalEntity> listBookRentalByBookId(@PathVariable("bookId") UUID bookId) {
		return bookRentalCustomRepository.listBookRentalByBookId(bookId);
	}

	@PutMapping("/book/{bookId}/rental/{rentalId}/return")
	public BookRentalEntity returnBookRental(@PathVariable("rentalId") UUID rentalId) {
		BookRentalEntity updated = null;
		
		BookRentalEntity bookRentalEntity = bookRentalRepository.findById(rentalId).get();
		if(bookRentalEntity != null) {
			bookRentalEntity.setReturned(true);
			updated = bookRentalRepository.save(bookRentalEntity);
		}

		return updated;
	}
}
```

여기까지 QueryDSL의 left join을 활용한 간단한 구현 튜토리얼이었습니다.  
 
