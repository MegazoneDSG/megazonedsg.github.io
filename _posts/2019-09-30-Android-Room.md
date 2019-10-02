---
layout: post
author: Lukoh
notification: true
title: "Android Room 기술"
description: Android Room 이란?
image: "https://raw.githubusercontent.com/MegazoneDSG/megazonedsg.github.io/master/assets/img/room_architecture.png"
categories:
- tutorial
date: 2019-09-30 02:05:00
tags:
- Android Room
introduction: Android 개발 필수 기술 Room
twitter_text: Android 개발 필수 기술 Room
---

# Room을 사용하여 로컬 캐시에 데이터 저장
Room은 SQLite에 대한 추상화 계층을 제공하여 SQLite의 모든 기능을 활용하면서 유연하고 능숙하게 데이터베이스 액세스를 허용합니다. 쉽게 말하면 SQLite의 기능을 모두 사용할 수 있고, DB로의 접근을 편하게 도와주는 라이브러리 입니다. 또한 구글이 안드로이드 플랫폼을 위해서 만든 ORM 입니다. ORM이란 Object Relational Mapping 으로 데이터베이스와 객체 지향 프로그래밍 언어간의 호환되지 않는 데이터를 변환하는 프로그래밍 기법으로 DB 테이블과 매핑되는 객체를 만들고 그 객체에서 DB를 관리하는 것입니다.

작지않은 양의 구조화 된 데이터를 처리하는 앱은 해당 데이터를 로컬로 유지하는 데 큰 도움이됩니다. 가장 일반적인 사용 사례는 관련 데이터를 캐시하는 것입니다. 이렇게하면 장치가 네트워크에 액세스 할 수없는 경우에도 사용자는 오프라인 상태에서도 해당 내용을 탐색 할 수 있습니다. 그런 다음 장치가 다시 온라인 상태가 된 후 사용자가 시작한 모든 내용 변경 내용이 서버에 동기화됩니다. 즉 Room을 사용하면 컴파일 시간을 체크할 수 있으며, 무의미한 boilerplate 코드의 반복을 줄여줄 수 있습니다.

Room을 사용해야하는 이유?
 - 컴파일 타임 검사를 제공합니다.
 - LiveData, LiveData를 사용한 실시간 모니터링에 적합합니다.
 - Room에서 다양한 구성 요소를 쉽게 테스트 할 수 있습니다.
 - 사용 및 구현이 쉽습니다.
 - 상용구 코드의 양을 줄입니다.

Room은 이러한 문제를 처리하므로 SQLite 대신 Room을 사용 하는 것이 좋습니다 .
Room에는 3 가지 주요 구성 요소가 있습니다.
* [DataBase](https://developer.android.com/reference/androidx/room/Database.html) : 데이터베이스 홀더를 포함하고 앱의 지속 관계형 데이터에 대한 기본 연결을위한 기본 액세스 지점 역할을합니다.
주석이 달린 클래스 @Database는 다음 조건을 충족해야합니다.
확장하는 추상 클래스입니다 RoomDatabase.
주석 내에 데이터베이스와 연관된 엔티티 목록을 포함하십시오.
인수가 0 인 추상 메소드를 포함하고 주석이 달린 클래스를 리턴합니다 @Dao.

* [Entity](https://developer.android.com/training/data-storage/room/defining-data.html) : 데이터베이스 내의 테이블을 나타냅니다.

* [DAO](https://developer.android.com/training/data-storage/room/accessing-data.html) : 데이터베이스에 액세스하는 데 사용되는 방법이 들어 있습니다.

앱은 Room 데이터베이스를 사용하여 해당 데이터베이스와 연결된 데이터 액세스 개체 또는 DAO를 가져옵니다. 그런 다음 앱은 각 DAO를 사용하여 데이터베이스에서 엔터티를 가져오고 해당 엔터티에 대한 변경 내용을 데이터베이스에 다시 저장합니다. 마지막으로 앱은 엔터티를 사용하여 데이터베이스 내의 테이블 열에 해당하는 값을 가져오고 설정합니다.

Room의 여러 구성 요소 사이의 관계는 그림 1에 나타납니다.
![Room Architecture Diagram](https://raw.githubusercontent.com/MegazoneDSG/megazonedsg.github.io/master/assets/img/room_architecture.png)

그림 1. Room 아키텍처 다이어그램

다음 코드 스니펫에는 하나의 엔티티와 하나의 DAO가있는 샘플 데이터베이스 구성이 포함되어 있습니다.

User 데이터 클래스

```
@Entity
data class User(
    @PrimaryKey val uid: Int,
    @ColumnInfo(name = "first_name") val firstName: String?,
    @ColumnInfo(name = "last_name") val lastName: String?
)
```

몇 가지주의 할 점
 - 클래스는 Entity 로 주석을 달아야합니다 . 이것이 Room을 식별하는 방법입니다. 생성 한 각 엔티티에 대해 연관된 데이터베이스를 사용하여 테이블이 작성됩니다. 기본적으로 Room은 각 필드에 대한 열을 생성하지만 주석 무시를 사용하여 몇 개의 필드에서이를 피할 수 있습니다.
 - 각 엔티티는 하나 이상의 기본 키를 정의해야합니다. PrimaryKey 주석으로 필드에 주석 을 달아야 합니다.
 - 기본적으로 Room은 클래스 이름을 테이블 이름으로 사용합니다. tableName 속성 을 사용하여 사용자 지정 이름을 지정할 수 있습니다 .
 
자세한 내용은 [여기](https://developer.android.com/training/data-storage/room/defining-data.html) 를 확인하십시오 .
 
이제 데이터베이스 액세스에 사용될 DAO (Data Access Object)가 필요합니다.
 
User DAO 인터페이스
```
@Dao
interface UserDao {

    @Query("SELECT * FROM user")
    fun getAll(): List<User>
 
    @Query("SELECT * FROM user WHERE uid IN (:userIds)")
    fun loadAllByIds(userIds: IntArray): List<User>
 
    @Query("SELECT * FROM user WHERE first_name LIKE :first AND " +
           "last_name LIKE :last LIMIT 1")
    fun findByName(first: String, last: String): User
 
    @Insert
    fun insertAll(vararg users: User)
 
    @Delete
    fun delete(user: User)
}
```
 
DAO를 사용하면 쿼리에 매개 변수를 전달하거나 열의 하위 집합을 반환하거나 인수 컬렉션을 전달하는 등의 작업을 훨씬 더 많이 수행 할 수 있습니다.
몇 가지주의 할 점
 - 액세스하거나 상호 작용하려면 DAO로 주석이 달린 인터페이스가 필요합니다. 이것이 Room이 알아내는 방법입니다. 각 DAO에는 앱 데이터베이스에 대한 추상 액세스를 제공하는 메서드가 포함되어 있습니다.
 - 쿼리 작성기 또는 직접 쿼리 대신 DAO를 사용하여 데이터베이스에 액세스하면 데이터베이스 아키텍처의 여러 구성 요소를 분리 할 수 있습니다.
 - DAO를 사용하면 테스트 앱으로 데이터베이스 액세스를 쉽게 조롱 할 수 있습니다.
 - DAO는 인터페이스 또는 추상 클래스 일 수 있습니다. 추상 클래스의 경우 선택적으로 RoomDatabase를 유일한 매개 변수로 사용하는 생성자를 가질 수 있습니다.
 - Room은 컴파일 타임에 각 DAO 구현을 만듭니다.
 
자세한 내용은 [여기](https://developer.android.com/training/data-storage/room/accessing-data.html) 를 확인 하십시오 .
 
마지막으로 Database로 주석이 달린 DatabaseClass가 필요합니다. 
Database 클래스는 DAO 인터페이스간에 논리적 그룹을 설정합니다. 또한 데이터베이스 마이그레이션을 추적하고 구현하는 데 사용되는 필수 버전 번호를 정의합니다.
 
AppDatabase 클래스

```
@Database(entities = arrayOf(User::class), version = 1)
abstract class AppDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao
}
 
After creating the files above, you get an instance of the created database using the following code:

val db = Room.databaseBuilder(
            applicationContext,
            AppDatabase::class.java, "database-name"
        ).build()
``` 
 
여기서 주목할 사항
 - 각 RoomDatabase 인스턴스가 상당히 비싸고 여러 인스턴스에 액세스 할 필요가 거의 없으므로 AppDatabase 객체를 인스턴스화 할 때 싱글 톤 디자인 패턴을 따라야합니다.
 - 클래스는 추상적이어야하며 RoomDatabase를 확장해야합니다.
 
위의 생성 된 데이터베이스로 위의 코드를 실행하려고하면 수행 된 작업이 메인 스레드에서 수행됨에 따라 앱이 중단됩니다 . 기본적으로 Room은이를 확인하고 UI를 지연시킬 수 있으므로 기본 스레드에서 작업을 허용하지 않습니다.
따라서, Room의 데이터는 모두 백그라운드 쓰레드에서 처리해야 합니다.
 
참고 : 앱이 단일 프로세스에서 실행되는 경우 AppDatabase 객체를 인스턴스화 할 때 싱글 톤 디자인 패턴을 따라야 합니다. 각 인스턴스는 상당히 비싸므로 단일 프로세스 내에서 여러 인스턴스에 액세스 할 필요가 거의 없습니다. RoomDatabase
