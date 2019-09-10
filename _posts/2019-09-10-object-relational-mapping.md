---
layout: post
author: byeongcheonmun
notification: true
title: "Object Relation Mapping"
description: 객체 관계 매핑에 대한 스터디 내용을 정리하였습니다.
image:https://user-images.githubusercontent.com/9576729/64586845-7fadbd00-d3d8-11e9-87c3-8c950c6b6a22.jpg
category: 'programming'
date: 2019-09-10 12:11:00
tags:
- java
- database
- orm
introduction: 객체 관계 매핑에 대한 스터디 내용을 정리하였습니다.
---

ORM (Object Relation Mapping) 객체 관계 매핑
>객체 관계 매핑은 데이터베이스와 객체 지향 프로그래밍 언어 간의 호환되지 않는 데이터를 변환하는 >프로그래밍 기법이다. 객체 지향 언어에서 사용할 수 있는 "가상" 객체 데이터베이스를 구축하는 >방법이다. -wikipedia.org

### 등장 배경
1. Model1
    - Web Service 초기 개발 모델이다.
    - JSP, Seblet 내에서 데이터베이스를 핸들링한다.
    - 구조가 복잡해 질 수록 유지보수가 기하급수적으로 어려워 진다.
2. Model2
    - MVC 모델을 도입
    - DAO, EJB을 이용해 데이터베이스에 접근한다.
    - 객체 단위의 개발이 가능해 졌다.
    - MyBatis 같은 프레임워크가 등장했다.
    - 객체지향 적으로 설계되지 않은 데이터베이스들 덕분에 이해하기 힘든 구조를 가지게 되었다.

데이터베이스에 대한 객체적인 접근을 하려는 요구와 반복 적인 SQL 쿼리 요청 코드나 SQL 에 의존 적인 코딩에서 벗어나고자 하는 목적으로 인해 ORM이라는 개념이 등장하게 됬다고 생각하면 될것이다.

  - 장점
      - 직관적인 코드를 작성할수 있다.
      - 부수적인 코드가 급격히 줄어든다.
      - SQL의 절차적인 접근이 아닌 객체 지향적 접근으로 코드를 이해하기 쉽다.
      - 작성된 객체들을 재사용 하기 쉽다.
      - DBMS에 종속적이지 않다.

  - 단점
    - 기존 SQL 문을 변경하기에는 많은 자원이 소모 된다.
    - 설계가 복잡해 질 경우가 있다.
    - 복잡한 구조의 테이블 관계를 구현하기 까다롭다.
    - 성능 튜닝이 필요한 경우도 있다.

### Overview
기존의 데이터베이스 엔진으로 SQL 문을 사용하여 이름을 알아내는 방법이다.
```sh
String sql = "SELECT id, first_name, last_name, phone, birth_date, sex FROM persons WHERE id = 10";
Result res = db.execSql(sql);
String name = res[0]["first_name"];
```
ORM으로 접근한 방법이다.
```sh
Person p = repository.GetPerson(10);
String name = p.getFirstName();
```
코드가 훨신 간단하며 객체에서 값을 뽑아 내는 것 처럼 사용할 수 있다.

## JAVA ORM Frameworks
- ActiveJDBC
    - ActiveJDBC is a Java implementation of the Active Record design pattern developed by Igor Polevoy. It was inspired by ActiveRecord ORM from Ruby on Rails. It is based on convention over configuration.
- ActiveJPA
    - ActiveJPA is an open-source application framework written in Java for object-relational mapping. It is based on the Java Persistence API (JPA), but it does not strictly follow the JSR 338 Specification as it implements different design patterns and technologies.
- Apache Cayenne
    - Apache Cayenne is an open source persistence framework licensed under the Apache License, providing object-relational mapping (ORM) and remoting services. Cayenne binds one or more database schemas directly to Java objects, managing atomic commit and rollbacks, SQL generation, joins, sequences, and mor
- Hibernate
    - Hibernate ORM (Hibernate in short) is an object-relational mapping tool for the Java programming language. It provides a framework for mapping an object-oriented domain model to a relational database. Hibernate handles object-relational impedance mismatch problems by replacing direct, persistent database accesses with high-level object handling functions.
- JOOQ
    - jOOQ Object Oriented Querying, commonly known as jOOQ, is a light database-mapping software library in Java that implements the active record pattern. Its purpose is to be both relational and object oriented by providing a domain-specific language to construct queries from classes generated from a database schema
- MyBatis
    - MyBatis is a Java persistence framework that couples objects with stored procedures or SQL statements using an XML descriptor or annotations. MyBatis is free software that is distributed under the Apache License 2.0. MyBatis is a fork of iBATIS 3.0 and is maintained by a team that includes the original creators of iBATIS.
- QueryDSL
    - Querydsl is a framework which enables the construction of type-safe SQL-like queries for multiple backends including JPA, MongoDB and SQL in Java. Instead of writing queries as inline strings or externalizing them into XML files they are constructed via a fluent API.
