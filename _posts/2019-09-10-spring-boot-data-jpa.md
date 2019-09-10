---
layout: post
author: byeongcheonmun
notification: true
title: "Spring-boot-data-jpa Example"
description: JPA를 사용하여 간단히 조회를 해보자!
image: ![cloud-db1](https://user-images.githubusercontent.com/9576729/64586673-06ae6580-d3d8-11e9-8075-5e3d39378005.jpg)
category: 'programming'
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
![프로젝트생성](https://user-images.githubusercontent.com/9576729/64584164-b252b800-d3ce-11e9-9b72-6079c78a1a2d.PNG)
![프로젝트생성2](https://user-images.githubusercontent.com/9576729/64584206-d44c3a80-d3ce-11e9-8cdc-d11b6733d93f.PNG)
- Springboot Component 선택
![프로젝트생성3](https://user-images.githubusercontent.com/9576729/64584227-e332ed00-d3ce-11e9-8786-2f25aa0b7bbb.PNG)
Spring Data JPA 와 테스트 용도로 쓸 H2 Database를 선택 하였다.

### 2. H2 Database 설정
- application.properties
```sh
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.url=jdbc:h2:mem:test
spring.datasource.username=sa
spring.datasource.password=sa
spring.jpa.show-sql=true
spring.flyway.locations=classpath:h2/initialDml
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
server.port=8090
```

- flyway

Flyway는 오픈소스 Database 마이그레이션 Tool이다. 서비스가 실행 되면서 H2 Database에 필요한 테이블 및 데이터를 생성하기 위해 사용 하였다.
프로젝트 루트의 pom.xml에 flyway dependency를 추가 한다.

![flywayPom](https://user-images.githubusercontent.com/9576729/64584410-897ef280-d3cf-11e9-8a99-ad68ae1b48a4.PNG)

서비스가 실행되면서 작업할 DML 및 SQL 문들을 생성한다. 위의 설정중에 flyway.location에 실행할 sql파일이 위치하게 된다. 실행될 파일들은 시작이 대문자 V 로 시작하게 되며 이하 숫자에 따라 실행 순서가 정해 진다. 그리고 언더 바의 갯수에 따라 하위 작업인지 파일 명인지 구분 되어 진다.

![flywayDML](https://user-images.githubusercontent.com/9576729/64584449-aa474800-d3cf-11e9-9931-50ae376dbffe.PNG)

잘 찾아보면 application.properties 파일과 다른 부분이 있을것이다. 찾아서 수정할 기회를 주겠다.
각각의 내용은 다음과 같다.

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
```

이제 프로젝트를 런하여 H2 Database 에 해당 내용이 작성이 되는지 확인해 보자. 프로젝트가 정상적으로 실행 되었으면 브라우저를 열어 H2 콘솔에 접속하여 보자
- H2 Console
![h2콘솔1](https://user-images.githubusercontent.com/9576729/64584973-dfed3080-d3d1-11e9-91c1-b283a8c0e81b.PNG)
![h2콘솔2](https://user-images.githubusercontent.com/9576729/64584991-f4312d80-d3d1-11e9-8311-878fd2b9bf06.PNG)
잘 생성 되었다!

### 3. JPA 구조 생성
- Entity 를 작성한다.
User Entity

![userEntity](https://user-images.githubusercontent.com/9576729/64584779-15454e80-d3d1-11e9-98b4-159a9c0ec0d5.PNG)

UserRole Entity - 사용자 룰은 사용자테이블을 참고하기 때문에 해당 Entity를 가지고 있는 구조이다.

![userRoleEntity](https://user-images.githubusercontent.com/9576729/64584813-3b6aee80-d3d1-11e9-8591-04f021b47d97.PNG)

- Repository 를 작성한다. 간단하게 User 테이블을 조회 하는 쿼리를 하나 작성하였다.

![repository](https://user-images.githubusercontent.com/9576729/64585023-1925a080-d3d2-11e9-9f13-2dd04d7e580a.PNG)

레파지토리 인터페이스의 의미는
```sh
public interface 이름 extends JpaRepository <엔티티 ID 유형>
```
이런 형태를 따른다. 위의 코드는 User Entity의 ID가 String 타입이라 String으로 선언하였다.
@Query 어노테이션을 사용하여 JPQL 형태의 쿼리를 사용해 보았다. 사실 같은 기능을 하는 함수가 JpaRepository 내에 이미 존재 하고 있다. findAll() 이라는 함수를 사용하면 위에서 선언한 JPQL과 같은 결과를 얻을 수 있다. 기본적으로 사용하는 CRUD 명령은 JpaRepository 클래스에 이미 명시되어 있다.

### 4. 테스트 코드 실행
이제 기본적인 틀은 만들어 진것 같다. 방금 작성한 UserRepository 를 이용하여 간단하게 테스트 코드를 작성해 보자. 프로젝트의 테스트 코드에다 작성 하였다.

![Test코드](https://user-images.githubusercontent.com/9576729/64585247-ef20ae00-d3d2-11e9-97a3-22fbd04252df.PNG)

자 테스트 코드를 실행 하여 보자.

![테스트 결과](https://user-images.githubusercontent.com/9576729/64585323-4b83cd80-d3d3-11e9-95a1-240948ce42d6.PNG)

## Database 조회에 성공하였다!!

MyBatis 같은 프레임워크를 사용하는 것보다 훨씬 간단하고 심플하게 결과를 받아볼 수 있었다.
다음은 ORM 프레임 워크인 QueryDSL 을 사용하여 좀더 복잡한 쿼리 실행에 도전해 봐야겠다!
