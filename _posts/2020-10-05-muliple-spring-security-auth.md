---
layout: post
author: seungpilpark
notification: true
title: "Spring Security 다중인증수단 적용기"
description: Spring Security 다중인증수단 적용기
image: "https://t1.daumcdn.net/cfile/tistory/99052E345D1DCA1512"
categories:
- java
date: 2020-10-05 11:00:00
tags:
- enum
introduction: Spring Security 다중인증수단 적용기
twitter_text: Spring Security 다중인증수단 적용기
---

# Spring Security 다중인증수단 적용기

최근 프로젝트를 진행하면서, 다소 복잡한 요구사항의 인증수단을 필요로 하는 어플리케이션을 구축해야 할 일이 생겼습니다.
물류관련 업무에서는 재고자산 수불수등 회사 내부의 인력과 회사 외부 (거래처) 가 동시에 지표를 확인하고 발주,정산등의 업무를 진행할 필요가 있습니다.
지금부터 나오는 모든 내용은 실제 진행한 프로젝트와 관련된 직접적인 내용은 없으며 상황에 맞게 각색하였음을 알려드립니다.

여기서 요구사항이 도출 된 것을 보면

- 내부사용자와 외부사용자 모두 인증이 가능해야 한다.
- 내부사용자는 기존의 사내인증수단을 사용해야 한다.
- 외부사용자는 아이디,패스워드 기반의 인증을 사용해야 한다.
- 내부사용자와 외부사용자 모두 몇가지의 역할이 구분되며, 역할별로 접근할 수 있는 리소스를 이외에는 차단해야 한다.

위 사항을 구현하기 위해 수행해야 할 일의 절차는 다음과 같습니다.
1. 권한정책 정리
2. API 인증 아키텍처 구현 (Spring Security)
3. UI 인증 아키텍처 구현 (Vue)

## 1. 권한정책 정리

인증/접근제어 시스템을 만들 때 가장 중요하고 꼼꼼하게 처리되어야 할 작업입니다.
일반적으로, 개발자 여러분이 접하는 기획서는 다음과 같이 서술되어 있을 것입니다.

```
거래처 인원 등록 기능: 
- 내부 사용자 중 시스템관리자와 상품관리자만 등록/수정이 가능하고 외부 사용자중 거래처 메인담당자만 자신의 거래처 인원들에 대해 등록/수정/조회가 가능하며  그 외 거래처 직원들은 자신의 거래처 인원들만 조회 가능하다. 그리고 외부 사용자들은 자신의 이름, 이메일, 연락처 정도만 수정이 가능하다.
```

여기서 할 일은, 서술된 내용 그대로 API 를 만들때 바로 구현할 수도 있겠지만 다음과 같은 표를 만들어  먼저 기획자와 함께 확인하는 과정이 중요합니다.

### 사용자 유형 정리

먼저 각 기획서의 내용을 살핀 후 구분되어야 하는 역할담당과 시스템에서 사용할 Role 명칭을 리스트업 합니다.

| 사용자유형     | 역할담당   | 역할담당명 |
|----------------|------------|------------|
| 내부사용자     | 시스템관리자     | ADMIN      |
|                | 상품관리자 | MD         |
| 외부사용자     | 거래처메인담당자       | MAIN       |
|                | 그외담당자 | OTHERS      |

### 권한 정리

그리고, 기능별로 각 역할담당이 접근할 수 있는 리소스를 작성합니다.

> TIP. positive 한 나열보다 negative 하게 나열하는 것이 더 구현하기 쉽습니다. negative rule 이외에는 모두 통과시키면 되니까요.

이 과정에서 개발자는 개발해야 할 기능들과 권한역할에 대해 나름의 구현계획을 세울 수 있게 되고, 이런 스타일의 표는 기획자들도 이해하기 쉽기 때문에 미흡했던 부분들을 같이 보완해 나갈 수 있습니다.

| 접근시도                   | 메소드          | 사용자유형 | 역할담당          | 차단여부 | 제어가능대상               | 비고                         |
|----------------------------|-----------------|------------|-------------------|----------|----------------------------|------------------------------|
| 사용자 > 조회              | GET             | 내부사용자 | ADMIN             | 통과     | 모든사용자                 |                              |
|                            |                 | 내부사용자 | MD               | 통과     | 모든사용자                 |                              |
|                            |                 | 외부사용자 | MAIN              | 부분통과 | 소속거래처사용자           |                              |
|                            |                 | 외부사용자 | OTHERS               | 부분통과 | 소속거래처사용자           |                              |
| 사용자  > 수정             | PUT             | 내부사용자 | ADMIN             | 통과     | 모든사용자                 |                              |
|                            |                 | 내부사용자 | MD            | 부분통과 | 외부사용자                 |                              |
|                            |                 | 외부사용자 | MAIN              | 부분통과 | 소속거래처사용자           |  |
|                            |                 | 외부사용자 | OTHERS               | 부분통과 | 자기자신만                 | 이름, 연락처, 이메일만 가능  |
| 사용자 > 등록/삭제         | POST/DELETE     | 내부사용자 | ADMIN             | 통과     | 모든사용자                 |                              |
|                            |                 | 내부사용자 | MD            | 부분통과 | 외부사용자                 |                              |
|                            |                 | 외부사용자 | MAIN              | 부분통과 | 소속거래처사용자           |  |
|                            |                 | 외부사용자 | OTHERS               | 차단     | -                          |                              |

## 2. API 인증 아키텍처 구현 (Spring Security)

진행중인 프로젝트와 관련된 모든 프로젝트들이 Spring Security 를 사용하고 있었으므로 똑같이 Spring Security 를 사용하여 구현하기로 합니다. Spring Security 를 커스터마이징 하기 위해서는 기존의 필터들과 메커니즘을 상세하게 알 필요가 있는데, [spring-security-authentication-architecture](https://springbootdev.com/2017/08/23/spring-security-authentication-architecture/) 이곳에서 잘 정리된 문서가 있으므로 추천합니다.

해당 문서의 내용을 간단히 정리하자면 다음과 같습니다.

![](https://chathurangat.files.wordpress.com/2017/08/blogpost-spring-security-architecture.png)

1. HTTP 요청을 받음. 로그인,로그아웃,인증확인등 다양항 요청종류가 있으며 각각의 요청에 해당하는 필터체인에 도달할 때까지 필터를 통과한다.
2. 사용자가 입력한 아이디,패스워드 기반의 AuthenticationToken 을 생성 (아이디,패스워드 정보만 담고있는 토큰이고 아직 로그인된 것은 아니다)
3. 생성된 AuthenticationToken 를 AuthenticationManagager 에 전달
4. 등록된 AuthenticationProvider(s) 들마다 인증수행
5. UserDetailsService 에서 아이디,패스워드 기반으로 사용자 정보를 쿼리
6. UserDetails (사용자 정보) 오브젝트 반환
7. 위와 동일
8. 위와 동일
9. 위와 동일
10. SecurityContext 에 Authentication Object 세팅. 이후 설정에 따라 SessionManager 를 통해 세션에 저장되기도 하고, 1번 과정에서 세션에서부터 인증정보를 가져오기도 한다.

### Spring Security 커스터마이징

위 그림의 1번에서 2번으로 도달하기 전, username, password를 쓰는 form기반 인증을 처리하는 필터인 UsernamePasswordAuthenticationFilter 가 사용됩니다. 해당 필터는 아이디/패스워드 기반의 외부사용자 인증을 처리하기 위해 그대로 사용하고, 그 이후에 다음과 같은 필터 체인 및 아키텍처를 구현할 수 있습니다.

![](https://user-images.githubusercontent.com/13447690/95037813-362cc000-0707-11eb-9a3d-786a49ee47de.png)

| 필터 | 역할                               |
|--------------------------------------|-----------------------------------------------------------------------------|
| UsernamePasswordAuthenticationFilter | 패스워드 기반 로그인 인증정보를 처리하는 필터                               |
| IntranetAuthenticationFilter               | 사내인증시스템의 쿠키로 인증정보를 처리하는 필터                               |
| ClientAuthenticationFilter           | x-api-key 를 통한 내부클라이언트끼리의 인증정보를 처리하는 필터             |
| UserBlockFilter                      | 계정잠김, 비밀번호변경필요등 정상서비스를 이용할 수 없는 사용자에 대한 필터 |

상세한 구현방식은 Spring Security 관련문서가 워낙에 많으므로 따로 기재하지는 않겠습니다. 
`다만 필터체인을 추가하는 법은 익숙치 않을 수 있으므로 관련부분 config 를 첨부합니다.`

```
  @Override
  protected void configure(HttpSecurity http) throws Exception {
    http.exceptionHandling().authenticationEntryPoint((request, response, authException) -> {
      ....
    });

    http.exceptionHandling().accessDeniedHandler((request, response, accessDeniedException) -> {
      ....
    });

    http.headers();
    http.csrf().disable();
    http.cors().disable();
    http
        .authorizeRequests()
        .antMatchers(COMMON_API_PATHS).permitAll()
        .antMatchers(BUSINESS_API_PATHS).authenticated()
        .anyRequest().permitAll()
        .and()
        .sessionManagement()
        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED);

    http.formLogin()
        .loginPage("/login")
        .loginProcessingUrl("/api/security/login")
        .successHandler(authenticationSuccessHandler)
        .failureHandler(authenticationFailureHandler)
        .and()
        .logout()
        .logoutUrl("/api/security/logout")
        .addLogoutHandler(customLogoutHandler)
        .deleteCookies("JSESSIONID")
        .invalidateHttpSession(true)
        .logoutSuccessHandler(customLogoutSuccessHandler);
    // UsernamePasswordAuthenticationFilter 이후 커스텀 필터를 추가하는 부분입니다.
    http
        .addFilterAfter(IntranetAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
        .addFilterAfter(clientAuthenticationFilter, IntranetAuthenticationFilter.class)
        .addFilterAfter(userBlockFilter, ClientAuthenticationFilter.class);
  }
```

## 3. UI 인증 아키텍처 구현 (Vue)

로그인상태는 외부사용자를 대상으로 하는 패스워드 기반 인증인경우 정보보안법에 따라 다양한 상태들이 있을 수 있습니다.

| 상태  | 설명                                      |
|--------------------|---------------------------------------------------------|
| NOT_AUTHENTICATED  | 로그인 되지 않은자                                      |
| FIRST_REGISTRATION | 최초가입 후 비밀번호 변경을 하지 않은자                 |
| PASSWORD_EXPIRED   | 패스워드변경 만료일이 지난자                            |
| NOT_TERM_AGREED    | 개인정보이용동의 하지 않은자                            |
| LOCK               | 계정잠김된 자                                           |
| REVOKE             | 계정정지된 자                                           |
| ACTIVE             | 정상이용자                                              |

JSP 등의 서버와 UI 가 하나로 구현하시던 아키텍처에 익숙하신 분들은 `권한없음 == 서버에서 로그인한 사용자의 상태별로 해당되는 페이지로 리디릭션` 이라는 개념에 익숙합니다. 그러나 서버와 UI 가 분리된 환경에서는 

- 로그인상태에 따른 리소스 차단은 API 의 역할
- 로그인상태에 따른 UI 핸들링은 Front(Vue) 의 역할
- 로그인한 사용자가 정상상태가 아니여도 서버에서는 SecurityContext 를 생성시켜 상태정보를 지니고 있으며, 서버는 API 접근시도에 대한 HttpStatus 만 전달하며 직접적인 페이지 리디릭션 행위는 하지 않는다.

를 따를 필요가 있습니다.

서버에서는 위에 해당하는 상태일지라도 로그인정보는 SecurityContext 에 저장되어 UI 측에서 확인할수 있어야하고, 로그인 상태별로 페이지를 리디릭션 하는것은 UI 의 역할입니다.

그림으로 표현하면 다음과 같습니다.

![](https://user-images.githubusercontent.com/13447690/95038704-c7049b00-0709-11eb-948d-11926ee4683d.png)




