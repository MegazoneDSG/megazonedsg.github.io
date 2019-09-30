---
layout: post
author: Lukoh
notification: true
title: "Androd Advanced Architecture Guide"
description: Androd Advanced Architecture Guide
image: ""
categories:
- tutorial
date: 2019-09-30 02:05:00
tags:
- Androidn Room
introduction: Androd Advanced Architecture Guide
twitter_text: Androd Advanced Architecture Guide
---
# Android Advanced Architecture Guide

## Architecture 원칙


### 관심사 분리

따라야 할 가장 중요한 원칙은 관심사 분리입니다. Activity 또는 Fragment 에 모든 코드를 작성하는 실수는 흔히 일어납니다. 이러한 UI 기반의 클래스는 UI 및 운영체제 상호작용을 처리하는 로직만 포함해야 합니다. 이러한 클래스를 최대한 가볍게 유지하여 많은 수명 주기 관련 문제를 피할 수 있습니다.
Activity 및 Fragment 구현은 소유의 대상이 아니며, Android OS와 앱 사이의 계약을 나타내도록 이어주는 클래스에 불과합니다. 사용자 상호작용을 기반으로 또는 메모리 부족과 같은 시스템 조건으로 인해 언제든지 OS에서 클래스를 제거할 수 있습니다. 만족스러운 사용자 환경과 더욱더 수월한 앱 관리 환경을 제공하려면 이러한 클래스에 대한 의존성을 최소화하는 것이 좋습니다.
Why the cleaner approach?
 * Separation of code in different layers with assigned responsibilities making it easier for further modification.
 * High level of abstraction
 * Loose coupling between the code
 * Testing of code is painless
 
 
### 모델에서 UI 만들기
 
또 하나의 중요한 원칙은 모델에서 UI를 만들어야 한다는 것입니다. 가급적 지속적인 모델을 권장합니다. 모델은 앱의 데이터 처리를 담당하는 구성요소로, 앱의 View 개체 및 앱 구성요소와 독립되어 있으므로 앱의 수명주기와 관련 문제의 영향을 받지 않습니다.
 지속 모델이 이상적인 이유는 다음과 같습니다.
  * Android OS에서 리소스를 확보하기 위해 앱을 제거해도 사용자 데이터가 삭제되지 않습니다.
  * 네트워크 연결이 취약하거나 연결되어 있지 않아도 앱이 계속 작동합니다.
데이터 관리 책임이 잘 정의된 모델 클래스를 기반으로 앱을 만들면 쉽게 테스트하고 일관성을 유지할 수 있습니다.

### Recommended App Architecture

![Original MVI Design Pattern](https://raw.githubusercontent.com/MegazoneDSG/megazonedsg.github.io/master/assets/img/android/architecture/mvi-func2.png)

Original MVI Design Pattern

![Graph of MVI Architecture](https://raw.githubusercontent.com/MegazoneDSG/megazonedsg.github.io/master/assets/img/android/architecture/mvi1.png)

Graph of MVI Architecture

What are the recommended Architecture Components?
아키텍처 구성 요소에 대한 간단한 소개와 함께 작동하는 방법을 소개합니다. 구성 요소의 하위 집합, 즉 LiveData, ViewModel 및 Room에 중점을 둡니다.

![Android MVI-Light Call Pattern](https://raw.githubusercontent.com/MegazoneDSG/megazonedsg.github.io/master/assets/img/android/architecture/App%20Architecture.png)

Android MVI-Light Call Pattern

![Android Architecture Component](https://raw.githubusercontent.com/MegazoneDSG/megazonedsg.github.io/master/assets/img/android/architecture/Architecture%20Component.png)

Android Architecture Component

* Entity: When working with Architecture Components, this is an annotated class that describes a database table.
SQLite database: On the device, data is stored in an SQLite database. For simplicity, additional storage options, such as a web server, are omitted. The Room persistence library creates and maintains this database for you.
DAO: Data access object. A mapping of SQL queries to functions. You used to have to define these painstakingly in your SQLiteOpenHelper class. When you use a DAO, you call the methods, and Room takes care of the rest.

* Room database: Database layer on top of SQLite database that takes care of mundane tasks that you used to handle with an SQLiteOpenHelper. Database holder that serves as an access point to the underlying SQLite database. The Room database uses the DAO to issue queries to the SQLite database.
Repository: A class that you create, for example using the WordRepository class. You use the Repository for managing multiple data sources.

* ViewModel: Provides data to the UI. Acts as a communication center between the Repository and the UI. Hides where the data originates from the UI. ViewModel instances survive configuration changes.

* LiveData: A data holder class that can be observed. Always holds/caches latest version of data. Notifies its observers when the data has changed. LiveData is lifecycle aware. UI components just observe relevant data and don't stop or resume observation. LiveData automatically manages all of this since it's aware of the relevant lifecycle status changes while observing.

앱을 설계한 이후 모든 모듈이 서로 어떻게 상호작용해야 하는지 보여줍니다.
각 구성요소가 한 수준 아래의 구성요소에만 종속됨을 볼 수 있습니다. 예를 들어 activity 및 fragment는 ViewModel에만 종속됩니다. 저장소는 여러 개의 다른 클래스에 종속되는 유일한 클래스입니다. 이 예에서 저장소는 지속 데이터 모델과 원격 백엔드 데이터 소스에 종속됩니다.
이 설계는 일관되고 즐거운 사용자 환경을 제공합니다. 사용자가 앱을 마지막으로 닫은 후 몇 분 후 또는 며칠 후에 다시 사용하는지와 관계없이 앱이 로컬에 보존하는 사용자의 정보가 바로 표시됩니다. 이 데이터가 오래된 경우 앱의 저장소 모듈이 백그라운드에서 데이터 업데이트를 시작합니다.

사용자 인터페이스 작성
UI는 fragment UserProfileFragment와 관련 레이아웃 파일 user_profile_layout.xml로 구성됩니다.
UI를 만들려면 데이터 모델에 다음 데이터 요소가 있어야 합니다.
* 사용자 ID: 사용자의 식별자입니다. fragment 인수를 사용하여 이 정보를 fragment에 전달하는 것이 좋습니다. Android OS에서 프로세스를 제거해도 이 정보가 유지되므로, 앱을 다시 시작할 때 ID를 사용할 수 있습니다.
* 사용자 개체: 사용자에 관한 세부정보를 보유하는 데이터 클래스입니다.
이 정보를 유지하기 위해 ViewModel 아키텍처 구성요소를 기반으로 하는 UserProfileViewModel을 사용합니다.

ViewModel 개체는 fragment나 activity 같은 특정 UI 구성요소에 대한 데이터를 제공하고 모델과 커뮤니케이션하기 위한 데이터 처리 비즈니스 로직을 포함합니다. 예를 들어 ViewModel은 데이터를 로드하기 위해 다른 구성요소를 호출하고 사용자 요청을 전달하여 데이터를 수정할 수 있습니다. ViewModel은 UI 구성요소에 관해 알지 못하므로 구성 변경(예: 기기 회전 시 activity 재생성)의 영향을 받지 않습니다.

지금까지 다음 파일을 정의했습니다.
* user_profile.xml: 화면의 UI 레이아웃 정의
* UserProfileFragment: 데이터를 표시하는 UI 컨트롤러
* UserProfileViewModel: UserProfileFragment에서 볼 수 있도록 데이터를 준비하고 사용자 상호작용에 반응하는 클래스

다음 코드 스니펫은 이러한 파일의 시작 콘텐츠를 보여줍니다. 편의를 위해 레이아웃 파일은 생략했습니다.

UserProfileViewModel
```
class UserProfileViewModel: ViewModel() {
       val userId: String = TODO()
       val user: User = TODO()
}
```
   
UserProfileFragment
```
class UserProfileFragment: Fragment() {
   private val viewModel: UserProfileViewModel by viewModels()

   override fun onCreateView(
       inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
           return inflater.inflate(R.layout.main_fragment, container, false)
   }
}
```

이제 이러한 코드 모듈이 있습니다. 이 모듈을 어떻게 연결할까요? 결국 user 필드가 UserProfileViewModel 클래스에 설정되면 UI에 알리는 방법이 필요합니다.
user를 가져오려면 ViewModel에서 Fragment 인수에 액세스해야 합니다. Fragment에서 인수를 전달할 수도 있고, 더 나은 방법으로 SavedState 모듈을 사용해 ViewModel에서 직접 인수를 읽을 수 있습니다.

```
// UserProfileViewModel
class UserProfileViewModel(savedStateHandle: SavedStateHandle) : ViewModel() {
   val userId : String = savedStateHandle["uid"] ?:
          throw IllegalArgumentException("missing user id")
   val user : User = TODO()
}

// UserProfileFragment
private val viewModel: UserProfileViewModel by viewModels(
    factoryProducer = { SavedStateVMFactory(this) }
       ...
    )
    …
}
```

이제 user 개체가 확보되면 Fragment에 알려야 합니다. 여기에서 LiveData 아키텍처 구성요소가 사용됩니다.
LiveData는 식별 가능한 데이터 홀더입니다. 앱의 다른 구성요소에서는 이 홀더를 사용하여 상호 간에 명시적이고 엄격한 종속성 경로를 만들지 않고도 개체 변경사항을 모니터링할 수 있습니다. 또한 LiveData 구성요소는 activity, fragment, 서비스와 같은 앱 구성요소의 수명 주기 상태를 고려하고, 개체 유출과 과도한 메모리 소비를 방지하기 위한 정리 로직을 포함합니다.
LiveData 구성요소를 앱에 통합하기 위해 UserProfileViewModel의 필드 유형을 LiveData<User>로 변경합니다. 이제 데이터가 업데이트되면 UserProfileFragment에 정보가 전달됩니다. 또한 이 LiveData 필드는 수명 주기를 인식하기 때문에 더 이상 필요하지 않은 참조를 자동으로 정리합니다.

```
UserProfileViewModel
class UserProfileViewModel(savedStateHandle: SavedStateHandle): ViewModel() {
   val userId : String = savedStateHandle["uid"] ?:
          throw IllegalArgumentException("missing user id")
   val user : LiveData<User> = TODO()
}
```

이제 데이터를 관찰하고 UI를 업데이트하도록 UserProfileFragment를 수정합니다.

```
UserProfileFragment
override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
   super.onViewCreated(view, savedInstanceState)
   viewModel.user.observe(viewLifecycleOwner) {
        // update UI
   }
}
```

사용자 프로필 데이터가 업데이트될 때마다 onChanged() 콜백이 호출되고 UI가 새로고침됩니다.
식별 가능한 콜백을 사용하는 다른 라이브러리에 익숙하다면 데이터 관찰을 중지하기 위해 fragment의 onStop() 메서드를 재정의하지 않았음을 알아챘을 수도 있습니다. 
LiveData는 수명 주기를 인식하기 때문에 LiveData의 경우 이 단계가 필요하지 않습니다. 즉, onStart()를 받았지만 아직 onStop()은 받지 않은 활성 상태가 아닌 이상 onChanged() 콜백을 호출하지 않습니다. 또한 LiveData는 fragment의 onDestroy() 메서드가 호출되면 자동으로 관찰자를 삭제합니다.
사용자의 기기 화면 회전과 같은 구성 변경을 처리하기 위한 로직은 추가하지 않았습니다. 
구성이 변경되면 UserProfileViewModel이 자동으로 복원되므로 새 fragment가 생성되면 곧 동일한 ViewModel 인스턴스를 받으며, 콜백이 현재 데이터를 사용하여 즉시 호출됩니다. 
ViewModel 개체가 업데이트하는 해당 View 개체보다 오래 지속되게 의도되었으므로 ViewModel 구현 내의 View 개체에 직접 참조를 포함하면 안 됩니다. 
UI 구성요소의 수명 주기와 일치하는 ViewModel의 전체 기간에 관한 자세한 내용은 [ViewModel의 수명 주기](https://developer.android.com/topic/libraries/architecture/viewmodel.html#the_lifecycle_of_a_viewmodel)를 참조하세요.

### 데이터 가져오기

앞서 LiveData를 사용하여 UserProfileViewModel을 UserProfileFragment에 연결했습니다. 이제 어떻게 하면 사용자 프로필 데이터를 가져올 수 있을까요?
이 예에서는 백엔드에서 REST API를 제공한다고 가정하겠습니다. 동일한 목적에 사용되는 다른 라이브러리를 사용해도 되지만, 여기서는 Retrofit 라이브러리를 사용하여 백엔드에 액세스합니다.

다음은 백엔드와 커뮤니케이션하는 Webservice의 정의입니다.

```
Webservice
interface Webservice {
    /**
     * @GET declares an HTTP GET request
     * @Path("user") annotation on the userId parameter marks it as a
     * replacement for the {user} placeholder in the @GET path
     */
    @GET("/users/{user}")
    fun getUser(@Path("user") userId: String): Call<User>
}
```

ViewModel 구현을 위한 첫 번째 아이디어로 Webservice를 직접 호출하여 데이터를 가져오고 이 데이터를 LiveData 개체에 할당합니다. 이 디자인은 효과가 있겠지만, 이 방법을 사용하면 앱이 커지면서 유지관리가 어려워질 수 있으며, UserProfileViewModel 클래스에 너무 많은 책임을 부여하여 관심사 분리 원칙을 위반하게 됩니다. 또한 ViewModel의 범위는 Activity 또는 Fragment 수명 주기에 연결되어 있으므로 관련 UI 개체의 수명 주기가 끝나면 Webservice의 데이터가 삭제됩니다. 이 동작은 바람직하지 않은 사용자 환경을 만듭니다.
따라서 ViewModel에서 데이터 가져오기 프로세스를 대신 새로운 저장소 모듈에 위임합니다.

저장소 모듈은 데이터 작업을 처리합니다. 또한 깔끔한 API를 제공하므로 나머지 앱에서 이 데이터를 간편하게 가져올 수 있으며, 데이터가 업데이트될 때 데이터를 가져올 위치와 호출할 API를 알고 있습니다. 저장소는 지속 모델, 웹 서비스, 캐시 등 다양한 데이터 소스 간 중재자로 간주할 수 있습니다.

아래 코드 스니펫에 표시된 UserRepository 클래스는 WebService 인스턴스를 사용하여 사용자 데이터를 가져옵니다.

```
UserRepository
class UserRepository {
    private val webservice: Webservice = TODO()
    // ...
    fun getUser(userId: String): LiveData<User> {
       // This isn't an optimal implementation. We'll fix it later.
       val data = MutableLiveData<User>()
       webservice.getUser(userId).enqueue(object : Callback<User> {
           override fun onResponse(call: Call<User>, response: Response<User>) {
               data.value = response.body()
           }
           // Error case is left out for brevity.
           override fun onFailure(call: Call<User>, t: Throwable) {
               TODO()
           }
       })
           
       return data
   }
}
```

저장소 모듈은 불필요해 보여도 나머지 앱에서 데이터 소스를 추출하는 중요한 용도로 사용됩니다. 이제 UserProfileViewModel이 데이터를 가져오는 방법을 알지 못하기 때문에, 여러 개의 서로 다른 데이터 가져오기 구현을 통해 얻은 데이터를 ViewModel에 제공할 수 있습니다.

### 구성요소간 의존성 관리

위의 UserRepository 클래스에서 사용자의 데이터를 가져오려면 Webservice 인스턴스가 필요합니다. 인스턴스는 간단히 만들 수 있지만 그렇게 하려면 Webservice 클래스의 종속성도 알아야 합니다. 또한 UserRepository는 Webservice가 필요한 유일한 클래스가 아닐 수도 있습니다. 이러한 상황에서는 Webservice에 대한 참조가 필요한 각 클래스에서 클래스와 종속성을 구성하는 방법을 알아야 하므로 코드를 복제해야 합니다. 클래스별로 새로운 WebService를 만들면 앱의 리소스 소모량이 너무 커질 수도 있습니다.
다음 디자인 패턴을 사용하여 이 문제를 해결할 수 있습니다.
* 종속성 주입(DI): 종속성 주입을 사용하면 클래스가 자신의 종속성을 구성할 필요 없이 종속성을 정의할 수 있습니다. 런타임 시 다른 클래스가 이 종속성을 제공해야 합니다. Android 앱에서 종속성 주입을 구현하려면 Dagger 2 라이브러리를 사용하는 것이 좋습니다. Dagger 2는 종속성 트리를 따라 이동하여 개체를 자동으로 구성하고 종속성의 컴파일 시간을 보장합니다.
* 서비스 로케이터: 서비스 로케이터 패턴은 클래스가 자신의 종속성을 구성하는 대신 종속성을 가져올 수 있는 레지스트리를 제공합니다.

DI 사용보다 서비스 레지스트리 구현이 쉬우므로 DI에 익숙하지 않다면 대신 서비스 로케이터 패턴을 사용하세요.

이 패턴은 코드를 복제하거나 복잡성을 추가하지 않아도 종속성을 관리하기 위한 명확한 패턴을 제공하므로 코드를 확장할 수 있습니다. 또한 이러한 패턴을 사용하면 테스트 및 프로덕션 데이터 가져오기 구현 간에 신속하게 전환할 수 있습니다.

예제 앱에서는 [Dagger 2](https://dagger.dev/)를 사용하여 Webservice 개체의 종속성을 관리합니다.

### ViewModel과 저장소 연결

제 UserRepository 개체를 사용하도록 UserProfileViewModel을 수정합니다.

```
UserProfileViewModel
class UserProfileViewModel @Inject constructor(
   savedStateHandle: SavedStateHandle, userRepository: UserRepository) : ViewModel() {
       val userId : String = savedStateHandle["uid"] ?:
              throw IllegalArgumentException("missing user id")
       val user : LiveData<User> = userRepository.getUser(userId)
}
```

### 데이터 캐시

UserRepository 구현은 Webservice 개체 호출을 추출하지만 하나의 데이터 소스에만 의존하기 때문에 유연성이 떨어집니다.
UserRepository 구현에서 발생하는 중요한 문제는 백엔드에서 데이터를 가져온 후 어디에도 보관하지 않는다는 점입니다. 따라서 사용자가 UserProfileFragment를 떠났다가 다시 돌아오면 데이터가 변경되지 않았어도 앱에서 데이터를 다시 가져와야 합니다.
이 디자인은 다음과 같은 이유로 최적의 방법이 아닙니다.
* 귀중한 네트워크 대역폭을 낭비합니다.
* 새 쿼리가 완료될 때까지 사용자가 기다려야 합니다.
이러한 단점을 해결하기 위해 메모리에 User 개체를 캐시하는 UserRepository에 새로운 데이터 소스를 추가해 보겠습니다.

```
UserRepository
// Informs Dagger that this class should be constructed only once.
@Singleton
class UserRepository @Inject constructor(
        private val webservice: Webservice,
        // Simple in-memory cache. Details omitted for brevity.
        private val userCache: UserCache) {
        fun getUser(userId: String): LiveData<User> {
            val cached = userCache.get(userId)
            if (cached != null) {
                return cached
            }
            val data = MutableLiveData<User>()
            userCache.put(userId, data)
            // This implementation is still suboptimal but better than before.
            // A complete implementation also handles error cases.
            webservice.getUser(userId).enqueue(object : Callback<User> {
                override fun onResponse(call: Call<User>, response: Response<User>) {
                    data.value = response.body()
                }

                // Error case is left out for brevity.
                override fun onFailure(call: Call<User>, t: Throwable) {
                    TODO()
                }
            })
            return data
       }
}
```

### 데이터 지속

현재 구현 방식을 사용하면 사용자가 기기를 회전하거나 앱에서 나갔다가 즉시 돌아오는 경우 저장소가 메모리 내 캐시에서 데이터를 가져오기 때문에 기존 UI가 즉시 표시됩니다.
그런데 사용자가 앱에서 나갔다가 몇 시간 뒤 Android OS에서 프로세스를 종료한 후에 다시 돌아오면 어떻게 될까요? 이 상황에서 현재 구현에 의존하면 네트워크에서 데이터를 다시 가져와야 합니다. 이렇게 데이터를 다시 가져오는 프로세스는 사용자 환경을 저해할 뿐 아니라 귀중한 모바일 데이터를 소비한다는 점에서 낭비를 불러옵니다.
이 문제는 웹 요청을 캐시하여 해결할 수 있지만, 이로 인해 중요한 문제가 새로 발생합니다. 친구 목록 가져오기와 같은 다른 유형의 요청에서 동일한 사용자 데이터가 표시되면 어떻게 될까요? 앱에서 일치하지 않는 데이터를 표시하여 혼란스러워집니다. 예를 들면 사용자가 친구 목록과 단일 사용자를 서로 다른 시간에 요청한 경우 앱에서 동일한 사용자 데이터의 두 가지 다른 버전을 표시할 수 있습니다. 이렇게 되면 앱에서 일치하지 않는 데이터를 통합할 방법을 알아야 합니다.
이 상황은 지속 모델을 사용하여 적절하게 해결될 수 있습니다. 여기에서 [Room](https://developer.android.com/training/data-storage/room/index.html) 지속성 라이브러리가 필요합니다.
[Room](https://developer.android.com/training/data-storage/room/index.html)은 개체 매핑 라이브러리로, 최소한의 상용구 코드로 로컬 데이터 지속성을 제공합니다. 컴파일 시 데이터 스키마에 대해 각 쿼리의 유효성을 검사하므로 SQL 쿼리가 잘못되면 런타임 실패가 아닌 컴파일 시간 오류가 발생합니다. Room에서는 원본 SQL 테이블과 쿼리로 작동하는 일부 기본 구현 세부정보를 추출합니다. 또한 컬렉션과 조인 쿼리를 포함한 데이터베이스 데이터의 변경사항을 관찰하여 LiveData 개체를 사용해 변경사항을 노출할 수 있게 하고, 기본 스레드에 있는 저장소 액세스와 같은 일반적인 스레드 문제를 해결하는 실행 제약을 명시적으로 정의합니다.
Room을 사용하려면 로컬 스키마를 정의해야 합니다. 먼저 @Entity 주석을 User 데이터 모델 클래스에 추가하고 @PrimaryKey 주석을 클래스의 id 필드에 추가하겠습니다. 이러한 주석은 User를 데이터베이스의 테이블로, id를 테이블의 기본 키로 표시합니다.

```
User
@Entity
data class User(
   @PrimaryKey private val id: String,
   private val name: String,
   private val lastName: String
)
```

그런 다음 앱의 RoomDatabase를 구현하여 데이터베이스 클래스를 만듭니다.

```
UserDatabase
@Database(entities = [User::class], version = 1)
    abstract class UserDatabase : RoomDatabase()
```

UserDatabase는 추상 클래스입니다. Room에서는 자동으로 이 클래스의 구현을 제공합니다. 자세한 내용은 Room 문서를 참조하세요.
이제 사용자 데이터를 데이터베이스에 삽입할 방법이 필요합니다. 이를 위해 데이터 액세스 개체(DAO)를 만듭니다.

```
UserDao
@Dao
interface UserDao {
   @Insert(onConflict = REPLACE)
   fun save(user: User)
 
   @Query("SELECT * FROM user WHERE id = :userId")
   fun load(userId: String): LiveData<User>
}
```

load 메서드는 LiveData<User> 유형의 개체를 반환합니다. Room에서는 데이터베이스가 언제 수정되는지 알고 있으며 데이터가 변경되면 자동으로 모든 활성 관찰자에게 알립니다. Room에서는 LiveData를 사용하므로 이 작업이 효율적입니다. 활성 관찰자가 하나 이상 있는 경우에만 데이터를 업데이트합니다.

UserDao 클래스를 정의했으니 이제 데이터베이스 클래스에서 DAO를 참조합니다.

```
UserDatabase
@Database(entities = [User::class], version = 1)
abstract class UserDatabase : RoomDatabase() {
   abstract fun userDao(): UserDao
}
```

이제 UserRepository를 수정하여 Room 데이터 소스를 통합할 수 있습니다.

```
// Informs Dagger that this class should be constructed only once.
@Singleton
class UserRepository @Inject constructor(
       private val webservice: Webservice,
       // Simple in-memory cache. Details omitted for brevity.
       private val executor: Executor,
       private val userDao: UserDao) {
       fun getUser(userId: String): LiveData<User> {
           refreshUser(userId)
           // Returns a LiveData object directly from the database.
           return userDao.load(userId)
       }
 
       private fun refreshUser(userId: String) {
           // Runs in a background thread.
           executor.execute {
               // Check if user data was fetched recently.
               val userExists = userDao.hasUser(FRESH_TIMEOUT)
               if (!userExists) {
                   // Refreshes the data.
                   val response = webservice.getUser(userId).execute()
 
                   // Check for errors here.
 
                   // Updates the database. 
                   // The LiveData object automatically refreshes, 
                   // so we don't need to do anything else here.
                   userDao.save(response.body()!!)
               }
           }
       }
 
       companion object {
           val FRESH_TIMEOUT = TimeUnit.DAYS.toMillis(1)
       }
}
```

UserRepository에서 데이터의 출처를 변경했을지라도 UserProfileViewModel 또는 UserProfileFragment를 변경할 필요가 없었습니다. 이 작은 범위의 업데이트는 앱의 아키텍처에서 제공하는 유연성을 보여줍니다. 또한 가짜 UserRepository를 제공하고 동시에 프로덕션 UserProfileViewModel을 테스트할 수 있기 때문에 테스트에도 유용합니다.
사용자가 며칠을 기다린 후에 이 아키텍처를 사용하는 앱으로 돌아오면 저장소에서 업데이트된 정보를 가져오기 전까지 오래된 정보가 표시될 수 있습니다. 사용 사례에 따라 이 오래된 정보를 표시하고 싶지 않을 수도 있습니다. 대신 자리표시자 데이터를 표시하여 더미 값을 보여주고 현재 앱에서 최신 정보를 가져오고 로드하는 중임을 알릴 수 있습니다.

### 단일 소스 저장소

다양한 REST API 엔드포인트는 흔히 동일한 데이터를 반환합니다. 예를 들어 백엔드에 친구 목록을 반환하는 다른 엔드포인트가 있다면, 2개의 다른 API 엔드포인트에서 다른 세분화 수준을 사용하여 동일한 사용자 개체를 제공할 수 있습니다. 일관성 확인 없이 UserRepository가 Webservice 요청으로부터 응답을 있는 그대로 반환했다면 저장소의 데이터 버전과 형식이 가장 최근에 호출된 엔드포인트에 종속되므로 UI에서 혼란스러운 정보를 표시할 수 있습니다.
그렇기 때문에 UserRepository 구현에서는 데이터베이스에 웹 서비스 응답을 저장합니다. 그러면 데이터베이스 변경 시 활성 LiveData 개체에 콜백이 트리거됩니다. 이 모델을 사용하면 데이터베이스가 단일 소스 저장소 역할을 하며 앱의 다른 부분은 UserRepository를 사용하여 데이터베이스에 액세스합니다. 디스크 캐시 사용 여부와 상관없이 저장소에서 데이터 소스를 나머지 앱의 단일 소스 저장소로 지정하는 것이 좋습니다.

### 진행중인 작업표시

당겨서 새로고침과 같은 일부 사용 사례에서는 현재 진행 중인 네트워크 작업이 있음을 사용자에게 UI로 표시하는 게 중요합니다. 다양한 이유로 데이터가 업데이트될 수 있으므로 실제 데이터와 UI 작업을 분리하는 것이 좋습니다. 예를 들어 친구 목록을 가져왔다면 LiveData<User> 업데이트를 트리거하여 프로그래매틱 방식으로 동일한 사용자를 다시 가져올 수도 있습니다. UI 관점에서 보면 진행 중인 요청이 있다는 사실은 User 개체의 다른 데이터 부분과 유사한 다른 데이터 포인트에 불과합니다.
데이터 업데이트 요청의 출처와 관계없이 다음 전략 중 하나를 사용하여 UI에 일관성 있는 데이터 업데이트 상태를 표시할 수 있습니다.
* LiveData 유형의 개체를 반환하도록 getUser()를 변경합니다. 이 개체에는 네트워크 작업 상태가 포함됩니다.
* UserRepository 클래스에 User의 새로고침 상태를 반환할 수 있는 다른 공개 함수를 제공합니다. 데이터 가져오기 프로세스가 당겨서 새로고침 같은 명시적인 사용자 작업에서 비롯되었을 때만 UI에 네트워크 상태를 표시하려는 경우 이 옵션이 더 적합합니다.











