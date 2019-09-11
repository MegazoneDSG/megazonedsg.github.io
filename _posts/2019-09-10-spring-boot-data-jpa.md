---
layout: post
author: byeongcheonmun
notification: true
title: "Spring-boot-data-jpa Example"
description: JPA를 사용하여 간단히 조회를 해보자!
image: https://user-images.githubusercontent.com/9576729/64586845-7fadbd00-d3d8-11e9-87c3-8c950c6b6a22.jpg
category: 'tutorial'
date: 2019-09-10 12:11:00
tags:
- java
- database
- spring-boot
- jpa
- orm
introduction: JPA를 사용하여 간단히 조회를 해보자!
---

앞서 ORM의 개념을 살펴 보았으니 실재적으로 어떻게 사용하는지 알아보도록 하자. SpringBoot를 이용하여 대표적인 ORM 인 JPA를 사용하여 보자!

샘플 프로젝트를 만들어 보자.

### 1. 프로젝트 생성
- New Project
![프로젝트생성](https://user-images.githubusercontent.com/9576729/64658915-3c089100-d474-11e9-8afb-65164dc56579.PNG)
![프로젝트생성2](https://user-images.githubusercontent.com/9576729/64658880-1bd8d200-d474-11e9-8f91-b327c4b3e2cb.PNG)
- Springboot Component 선택
![프로젝트생성3](https://user-images.githubusercontent.com/9576729/64584227-e332ed00-d3ce-11e9-8786-2f25aa0b7bbb.PNG)

Spring Data JPA 와 테스트 용도로 쓸 H2 Database를 선택 하였다. 그리고 별도로 ***Spring Web Service*** 와 ***lombok*** 을 추가 하였다.

### 2. H2 Database 설정
- application.properties

```
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.url=jdbc:h2:mem:test
spring.datasource.username=sa
spring.datasource.password=sa
spring.jpa.show-sql=true
spring.flyway.locations=classpath:initialDml
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
server.port=8090
```

- flyway

서비스가 실행 되면서 H2 Database에 필요한 테이블 및 데이터를 생성하기 위해 flyway 라는 툴을 사용 하였다. 참고로 Flyway는 오픈소스 Database 마이그레이션 Tool이다. 프로젝트 루트의 pom.xml에 flyway dependency를 추가 한다.

```
<!-- flyway 서비스 실행시 H2에 샘플 데이터를 입력하기 위해-->
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
```

Springboot application이 실행되면서 작업할 DML 및 SQL 문들을 생성해야 한다. 위의 설정중에 flyway.location에 실행할 sql파일이 위치하게 된다. 실행될 파일들은 시작이 대문자 V 로 시작하게 되며 이하 숫자에 따라 실행 순서가 정해 진다. 그리고 언더 바의 갯수에 따라 하위 작업인지 파일 명인지 구분 되어 진다.

![flywayDML](https://user-images.githubusercontent.com/9576729/64584449-aa474800-d3cf-11e9-9931-50ae376dbffe.PNG)

테스트에 필요한 테이블과 데이터를 생성하기 위한 SQL 문들이다. 각각의 내용은 다음과 같다.

#### V1__InitializeDml.sql
```sh
-- -----------------------------------------------------
-- Table `USER`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `USER`
(
  `USER_ID`             VARCHAR(255) NOT NULL,
  `NAME`                VARCHAR(255) NOT NULL,
  `EMAIL`               VARCHAR(255) NOT NULL,
  `ADDRESS`             VARCHAR(255) NOT NULL,
  `CREATED_AT`          TIMESTAMP    NULL,
  `LATEST_LOGIN_AT`     TIMESTAMP    NULL,
  PRIMARY KEY (`USER_ID`)
);

-- -----------------------------------------------------
-- Table `USER_ROLE`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `USER_ROLE`
(
  `ROLE_ID`             VARCHAR(255) NOT NULL,
  `USER_ID`             VARCHAR(255) NOT NULL,
  `ROLE`                VARCHAR(255) NOT NULL,
  `AUTHORIZED_AT`       TIMESTAMP    NULL,
  PRIMARY KEY (`ROLE_ID`)
);
```

#### V2__InitializeData.sql
```sh
-- -----------------------------------------------------
-- Data `USER`
-- -----------------------------------------------------
INSERT INTO USER (USER_ID, NAME, EMAIL, ADDRESS, CREATED_AT, LATEST_LOGIN_AT)
VALUES ('1', '문병천', 'munbc@mz.co.kr', '주소1', NOW(), null);
INSERT INTO USER (USER_ID, NAME, EMAIL, ADDRESS, CREATED_AT, LATEST_LOGIN_AT)
VALUES ('2', '홍길동', 'honggil@korea.com', '주소2', NOW(), null);
INSERT INTO USER (USER_ID, NAME, EMAIL, ADDRESS, CREATED_AT, LATEST_LOGIN_AT)
VALUES ('3', '강감찬', 'gamchan@korea.com', '주소3', NOW(), NULL);
INSERT INTO USER (USER_ID, NAME, EMAIL, ADDRESS, CREATED_AT, LATEST_LOGIN_AT)
VALUES ('4', '이순신', 'general@korea.com', '주소4', NOW(), NULL);
INSERT INTO USER (USER_ID, NAME, EMAIL, ADDRESS, CREATED_AT, LATEST_LOGIN_AT)
VALUES ('5', '태백산', 'mountain@korea.com', '주소5', NOW(), NULL);
-- -----------------------------------------------------
-- Data `USER_ROLE`
-- -----------------------------------------------------
INSERT INTO USER_ROLE (ROLE_ID, USER_ID, ROLE, AUTHORIZED_AT)
VALUES ('1', '1', 'ADMINISTRATOR', NOW());
INSERT INTO USER_ROLE (ROLE_ID, USER_ID, ROLE, AUTHORIZED_AT)
VALUES ('2', '2', 'MANAGER', NOW());
INSERT INTO USER_ROLE (ROLE_ID, USER_ID, ROLE, AUTHORIZED_AT)
VALUES ('3', '3', 'USER', NOW());
INSERT INTO USER_ROLE (ROLE_ID, USER_ID, ROLE, AUTHORIZED_AT)
VALUES ('4', '4', 'USER', NOW());
INSERT INTO USER_ROLE (ROLE_ID, USER_ID, ROLE, AUTHORIZED_AT)
VALUES ('5', '5', 'USER', NOW());
INSERT INTO USER_ROLE (ROLE_ID, USER_ID, ROLE, AUTHORIZED_AT)
VALUES ('6', '1', 'USER', NOW());
```

이제 프로젝트를 런하여 H2 Database 에 해당 내용이 작성이 되는지 확인해 보자. 프로젝트가 정상적으로 실행 되었으면 브라우저를 열어 H2 콘솔에 접속하여 보자

- H2 Console [link](http://localhost:8090/h2-console)

![h2콘솔1](https://user-images.githubusercontent.com/9576729/64584973-dfed3080-d3d1-11e9-91c1-b283a8c0e81b.PNG)

H2 콘솔 접속 화면이다. URL에 application.properties 에서 설정한 spring.datasource.url 값을 넣는다. 사용자 password도 application.properties를 참고 한다.

데이터를 확인하여 보자!

```
SELECT * FROM USER;
SELECT * FROM USER_ROLE;
```

![h2콘솔2](https://user-images.githubusercontent.com/9576729/64584991-f4312d80-d3d1-11e9-8311-878fd2b9bf06.PNG)

잘 생성 되었다!

### 3. JPA 구조 생성
- Entity 를 작성한다. 쉽게 테이블을 객체 형태로 만든다고 생각하면 된다.

User Entity - Entitiy 어노테이션을 통해 이 객체가 Entity라고 선언하여 준다. 필드값의 Id 어노테이션은 테이블의 키값을 의미 한다. 다중 키값의 설정을 불가하다. CreationTimestamp 어노테이션은 Insert나 Update 가 발생할시 현재 시간 값을 자동으로 넣어 주는 기능을 한다. 그리고 사용자는 여러룰을 가질수 있기 때문에 userRole 객체를 조인하며 List 형태로 가지고 있을 수 있다. 

```
package com.example.ormtest.entity;


import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import java.util.Date;
import java.util.List;

@Entity
@Data
public class User {

    @Id
    private String user_id;

    private String name;

    private String email;

    private String address;

    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    private Date created_at;

    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    private Date latest_login_at;

    @OneToMany(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private List<UserRole> userRole;
}
```

UserRole Entity

```
package com.example.ormtest.entity;

import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import java.util.Date;


@Entity
@Data
public class UserRole {

    @Id
    private String role_id;

    private String user_id;

    private String role;

    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    private Date authorized_at;
}
```

- Repository 를 작성한다. 간단하게 User 테이블을 조회 하는 쿼리를 하나 작성하였다.

```
package com.example.ormtest.repository;

import com.example.ormtest.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    @Query("select u from User u")
    List<Optional<User>> getUserList();

}
```

레파지토리 인터페이스의 의미는
```sh
public interface 이름 extends JpaRepository <엔티티 ID 유형>
```
이런 형태를 따른다. 위의 코드는 User Entity의 ID가 String 타입이라 String으로 선언하였다.
그리고 @Query 어노테이션을 사용하여 JPQL 형태의 쿼리를 사용해 보았다. 사실 같은 기능을 하는 findAll() 이라는 함수가 JpaRepository 내에 이미 존재 하고 있다. 우리가 기본적으로 사용하는 CRUD 명령은 JpaRepository 클래스에 이미 명시되어 있다. 

### 4. 테스트 코드 실행
이제 기본적인 틀은 만들어 진것 같다. 방금 작성한 UserRepository 를 이용하여 간단하게 테스트 코드를 작성해 보자. 프로젝트의 테스트 코드에다 작성 하였다.

```
package com.example.ormtest;

import com.example.ormtest.entity.User;
import com.example.ormtest.repository.UserRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.List;
import java.util.Optional;

@RunWith(SpringRunner.class)
@SpringBootTest
public class OrmtestApplicationTests {

    private Logger logger = LoggerFactory.getLogger(OrmtestApplicationTests.class);

    @Autowired
    private UserRepository userRepository;

    @Test
    public void jpaQueryTest(){
        List<Optional<User>> userList = userRepository.getUserList();
        for(Optional<User> user : userList ){
            logger.info("#### User Info : " + user);
        }
    }
}
```

자 테스트 코드를 실행 하여 보자.

![테스트 결과](https://user-images.githubusercontent.com/9576729/64585323-4b83cd80-d3d3-11e9-95a1-240948ce42d6.PNG)

## Database 조회에 성공하였다!!
실행 결과 맨 윗줄은 실행되는 SQL 문을 찍은 로그이다. application.properties의 spring.jpa.show-sql를 true 로 설정하였기 때문에 보이는 것이다.

결론은 MyBatis 같은 프레임워크를 사용하는 것보다 훨씬 간단하고 심플하게 결과를 받아볼 수 있었다.
다음은 ORM 프레임 워크인 QueryDSL 을 사용하여 좀더 복잡한 쿼리 실행에 도전해 봐야겠다!
