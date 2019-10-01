---
layout: post
author: Lukoh
notification: true
title: "Androd ViewModel & LiveData"
description: Androd ViewModel & LiveData"
image: ""
categories:
- tutorial
date: 2019-09-30 02:05:00
tags:
- Androd ViewModel & LiveData"
introduction: Androd ViewModel & LiveData
twitter_text: Androd ViewModel & LiveData"
---

# ViewModels & LiveData : 패턴 + 안티 패턴

## View & ViewModel

### 책임 배분

![책임배분](https://raw.githubusercontent.com/MegazoneDSG/megazonedsg.github.io/master/assets/img/android/architecture/arch1.png)
그림 1) 아키텍처 컴포넌트로 빌드 된 앱에서 엔티티의 일반적인 상호 작용

이상적으로 ViewModels는 Android에 대해 아무것도 몰라야 합니다. 이는 테스트 가능성, leak safety 및 모듈성을 향상시킵니다. 일반적인 경험 규칙은 ViewModels안에  import android.*  가 없는지 확인하는 것입니다 (예 : AAC(Android Architecture Component) 예외 ). 

❌ ViewModels 에게 Android 프레임 워크 클래스에 대해 알리지 마십시오.

조건문, 루프 및 일반적인 결정은 액티비티또는 프레그먼트가 아닌 ViewModels 또는 앱의 다른 계층에서 수행해야합니다. View는 일반적으로 단위 테스트가 아니므로 ( [Robolectric](http://robolectric.org/) 을 사용하지 않는 한 ) 코드 줄이 적을 수록 좋습니다. 뷰는 데이터를 표시하고 사용자 이벤트를 ViewModel 에게 보내는 방법 만 알고 있어야합니다. 이것을 [패시브 뷰 패턴](https://martinfowler.com/eaaDev/PassiveScreen.html) 이라고합니다 .

Activities 활동 및 조각의 논리를 최소로 유지
ViewModel 은 활동 또는 프래그먼트와 범위가 다릅니다. ViewModel이 활성 상태이며 실행중인 동안 활동은 라이프 사이클 상태 중 하나 일 수 있습니다 . ViewModel을 모르는 동안 활동 및 프래그먼트를 파괴하고 다시 생성 할 수 있습니다.

![ViewModels에서 참조](https://raw.githubusercontent.com/MegazoneDSG/megazonedsg.github.io/master/assets/img/android/architecture/arch2.png)
그림 2) ViewModels에서 참조

ViewModel은 구성 변경 사항을 유지합니다
View (활동 또는 프래그먼트)의 참조를 ViewModel에 전달하는 것은 심각한 위험 입니다. ViewModel이 네트워크에서 데이터를 요청하고 데이터가 나중에 다시 온다고 가정 해 봅시다. 이 시점에서 View 참조가 손상되거나 더 이상 보이지 않는 오래된 활동으로 인해 메모리 누수가 발생하여 충돌이 발생할 수 있습니다.

❌ ViewModel은 뷰에 대한 참조를 피하십시오.

ViewModel과 Views 사이의 통신에 권장되는 방법은 LiveData 또는 다른 라이브러리의 Observable을 사용하는 관찰자 패턴입니다.

### Observer Pattern

![관찰자 패턴](https://raw.githubusercontent.com/MegazoneDSG/megazonedsg.github.io/master/assets/img/android/architecture/arch3.png)
그림 3) 관찰자 패턴

Android에서 프레젠테이션 레이어를 디자인하는 가장 편리한 방법은 View (활동 또는 조각 )가 ViewModel 을 관찰 ( 변경 사항 구독 )하도록하는 것입니다. ViewModel은 Android에 대해 알지 못하므로 Android가 Views를 자주 죽이는 방법을 모릅니다. 여기에는 몇 가지 장점이 있습니다.

#### 활동 또는 프래그먼트의 일반적인 구독.
* ViewModel은 구성 변경에 대해 유지되므로 회전이 발생할 때 데이터 (예 : 데이터베이스 또는 네트워크)에 대한 외부 소스를 다시 쿼리 할 필요가 없습니다.
* 장기 실행 작업이 완료되면 ViewModel의 관찰 가능 항목이 업데이트됩니다. 데이터가 관찰되고 있는지 여부는 중요하지 않습니다. 존재하지 않는 View를 업데이트하려고   할 때 널 포인터 예외가 발생하지 않습니다.
* ViewModel은 뷰를 참조하지 않으므로 메모리 누수 위험이 줄어 듭니다.
data 데이터를 UI로 푸시하는 대신 UI에서 변경 사항을 관찰하십시오.

### Fat ViewModels

관심사를 분리 할 수있는 것은 좋은 생각입니다. 
ViewModel에 너무 많은 코드가 있거나 너무 많은 책임이있는 경우 다음을 고려하십시오.
* ViewModel과 동일한 범위를 사용하여 일부 Logic을 Repository 또는 Interactor 로 옮기십시오. 앱의 다른 부분과 통신하고 ViewModel에서 LiveData 홀더   를 업데이트합니다.
* 도메인 계층 추가 및 [Clean Architecture](https://8thlight.com/blog/uncle-bob/2012/08/13/the-clean-architecture.html) 채택 . 이는   테스트 및 유지 관리가 가능한 아키텍처로 이어집니다. 또한 main thread를 빠르게 내릴 수 있습니다. [Architecture Blueprints]               (https://github.com/googlesamples/android-architecture) 에 Clean Architecture 샘플이 있습니다.

✅ 책임을 분배하고 필요한 경우 도메인 계층을 추가하십시오.

### Data Repository 사용

앱 아키텍처 가이드 에서 볼 수 있듯이 대부분의 앱에는 다음과 같은 여러 데이터 소스가 있습니다.
* 원격 : 네트워크 또는 클라우드
* 로컬 : 데이터베이스 또는 파일
* 인 메모리 캐시
프레젠테이션 레이어를 완전히 알지 못하는 데이터 레이어를 앱에 두는 것이 좋습니다. 캐시와 데이터베이스를 네트워크와 동기화하는 알고리즘은 쉽지 않습니다. 이러한 복잡성을 처리하는 단일 진입 점으로 별도의 저장소 클래스를 사용하는 것이 좋습니다.
여러 개의 매우 다른 데이터 모델이있는 경우 여러 리포지토리 추가를 고려하십시오.
repository 데이터 저장소를 단일 지점 항목으로 데이터에 추가

### 데이터 상태 다루기

시나리오를 고려하십시오. 표시 할 항목 목록이 포함 된 ViewModel에 노출 된 LiveData를 관찰하고 있습니다. View는 로드되는 데이터, 네트워크 오류 및 비어있는 목록을 어떻게 구분할 수 있습니까?
* LiveData<MyDataState>ViewModel에서을 노출시킬 수 있습니다. 예를 들래어, MyDataState 데이터가 현재로드 중인지, 성공적으로로드되었는지 또는 실패했는지   에 대한 정보를 포함 할 수 있습니다.
  
![Observe](https://raw.githubusercontent.com/MegazoneDSG/megazonedsg.github.io/master/assets/img/android/architecture/arch4.png) 

상태 및 오류 메시지와 같은 다른 메타 데이터가있는 클래스에서 데이터를 랩핑 할 수 있습니다. 샘플에서 [Resource 클래스](https://developer.android.com/topic/libraries/architecture/guide.html#addendum)를 참조하십시오 .
하나의 Wrapper 또는 다른 LiveData를 사용하여 데이터 상태에 대한 정보를 노출하십시오.

### Activity 상태 저장

활동 상태는 활동이 없어진 경우 화면을 다시 작성하는 데 필요한 정보입니다. 즉, 활동이 소멸되었거나 프로세스가 종료되었음을 의미합니다. 회전이 가장 명백한 사례이며 ViewModels로 덮여 있습니다. ViewModel에 보관되어 있으면 상태가 안전합니다.
그러나 ViewModel도 없어진 다른 시나리오에서는 OS의 리소스가 부족하고 프로세스가 종료되는 경우의 상태를 복원해야 할 수도 있습니다.
UI 상태를 효율적으로 저장하고 복원하려면 지속성 onSaveInstanceState()과 ViewModel 의 조합을 사용하십시오 .
예를 보려면 [ViewModels : Persistence, onSaveInstanceState (), UI 상태 및 로더 복원](https://medium.com/google-developers/viewmodels-persistence-onsaveinstancestate-restoring-ui-state-and-loaders-fc7cc4a6c090)을 참조하십시오.

### Events

이벤트는 한 번 발생하는 것입니다. ViewModel은 데이터를 노출하지만 이벤트는 어떻습니까? 예를 들어, 탐색 이벤트 또는 스낵바 메시지 표시는 한 번만 실행해야하는 조치입니다.
이벤트 개념은 LiveData가 데이터를 저장하고 복원하는 방법과 완벽하게 맞지 않습니다. 다음 필드가있는 ViewModel을 고려하십시오.

var snackbarMessage = MutableLiveData <String> ()
  
액티비티가 이를 관찰하기 시작하고 ViewModel이 작업을 완료하므로 메시지를 업데이트를 해야 합니다.
snackbarMessage.value =  "항목이 저장되었습니다!"
액티비티가 값을 받고 스낵바를 표시합니다. 
그러나 사용자가 전화를 돌리면 새로운 액티비티가 생성되고 관찰이 시작됩니다. LiveData 관찰이 시작되면 액티비티는 즉시 이전 값을 수신하여 메시지가 다시 표시됩니다!
라이브러리 또는 아키텍처 구성 요소의 확장으로이 문제를 해결하는 대신 디자인 문제가 발생합니다. 이벤트를 주정부의 일부로 취급 할 것을 권장합니다 .
state 의 부분으로 evnet를 디자인하십시오. 자세한 내용은 [SnackBar, Navigation 및 기타  Event   (SingleLiveEvent 사례)와 함께 LiveData](https://medium.com/google-developers/livedata-with-snackbar-navigation-and-other-events-the-singleliveevent-case-ac2622673150) 를 참조하십시오.

### Leaking ViewModels

반응 패러다임은 UI와 앱의 나머지 레이어 사이를 편리하게 연결할 수 있기 때문에 Android에서 잘 작동합니다. LiveData는 이 구조의 핵심 구성 요소이므로 일반적으로 액티비티들 및 프레크먼트들은 LiveData 인스턴스를 관찰합니다.
ViewModel이 다른 구성 요소와 통신하는 방법은 개발자에게 달려 있지만 Leaks & Edge 사례를 주의하십시오. 프리젠 테이션 레이어가 관찰자 패턴을 사용하고 데이터 레이어가 콜백을 사용하는이 다이어그램을 고려하십시오.

![UI의 관찰자 패턴 및 데이터 계층의 콜백](https://raw.githubusercontent.com/MegazoneDSG/megazonedsg.github.io/master/assets/img/android/architecture/arch5.png)
그림 4) UI의 관찰자 패턴 및 데이터 계층의 콜백

사용자가 앱을 종료하면 ViewModel이 더 이상 표시되지 않으므로 View가 사라집니다. 리포지토리가 싱글 톤이거나 응용 프로그램으로 범위가 지정된 경우 프로세스가 종료 될 때까지 리포지토리가 삭제되지 않습니다 . 시스템에 리소스가 필요하거나 사용자가 앱을 수동으로 종료 한 경우에만 발생합니다. 리포지토리가 ViewModel에서 콜백에 대한 참조를 보유하고 있으면 ViewModel이 일시적으로 누수됩니다.

![UI의 관찰자 패턴 및 데이터 계층의 콜백](https://raw.githubusercontent.com/MegazoneDSG/megazonedsg.github.io/master/assets/img/android/architecture/arch6.png)
그림 5) UI의 관찰자 패턴 및 데이터 계층의 콜백

활동이 완료되었지만 ViewModel이 여전히 있습니다.

ViewModel이 가볍거나 작업이 빠르게 완료되는 경우이 누출은 큰 문제가되지 않습니다. 그러나 항상 그런 것은 아닙니다. 이상적으로, ViewModel은 관찰하는 뷰가 없을 때마다 자유롭게 이동할 수 있어야합니다.

![UI의 관찰자 패턴 및 데이터 계층의 콜백](https://raw.githubusercontent.com/MegazoneDSG/megazonedsg.github.io/master/assets/img/android/architecture/arch7.png)
그림 6) UI의 관찰자 패턴 및 데이터 계층의 콜백

이를 달성하기위한 많은 옵션이 있습니다.

* ViewModel.onCleared() 를 사용 하면 리포지토리에 콜백을 ViewModel에 드롭하도록 지시 할 수 있습니다. 
  (현재 버젼의 ViewModel 에서는 View 가 Inactive 상태가 되면 자동으로 OnCleared() 함수가 호출되어 Clear 됩니다.  )
* 저장소에서 WeakReference 를 사용하거나 이벤트 버스를 사용할 수 있습니다 (오용하기 쉽고 유해한 것으로 간주 됨).
* View와 ViewModel간에 LiveData를 사용하는 것과 유사한 방식으로 LiveData를 사용하여 Repository와 ViewModel간에 통신하십시오.

edge 에지 사례, Leak 및 장기 실행 작업이 아키텍처의 인스턴스에 미치는 영향을 고려하십시오.

❌ 깨끗한 상태를 저장하거나 데이터와 관련하여 중요한 ViewModel에 로직을 넣지 마십시오.    

ViewModel에서 모든 호출은 마지막 호출이 될 수 있습니다.

### Repository 의 LiveData

ViewModels 의 Leak 및 콜백 지옥 을 피하기 위해 다음과 같이 리포지토리를 볼 수 있습니다.

![래포지터리 패턴 및 데이터 계층의 콜백](https://raw.githubusercontent.com/MegazoneDSG/megazonedsg.github.io/master/assets/img/android/architecture/arch8.png)
그림 7) 래포지터리 패턴 및 데이터 계층의 콜백

ViewModel이 지워지거나 View의 라이프 사이클이 완료되면 구독이 지워집니다.

![래포지터리 패턴 및 데이터 계층의 콜백](https://raw.githubusercontent.com/MegazoneDSG/megazonedsg.github.io/master/assets/img/android/architecture/arch9.png)
그림 8) 래포지터리 패턴 및 데이터 계층의 콜백

이 접근 방식을 시도해 볼 수 있습니다. LifecycleOwner에 액세스 할 수없는 경우 ViewModel에서 리포지토리를 어떻게 구독합니까? 변환을 사용하면 이를 매우 편리하게 해결할 수 있습니다. Transformations.switchMap다른 LiveData 인스턴스의 변경에 반응하는 새 LiveData를 만들 수 있습니다. 또한 체인 전체에서 옵저버 수명주기 정보를 전달할 수 있습니다.

LiveData<Repo> repo = Transformations.switchMap(repoIdLiveData, repoId -> {
    if (repoId.isEmpty()) {
       return AbsentLiveData.create();
    }

    return repository.loadRepo(repoId);
});

이 예제에서 트리거가 업데이트를 받으면 함수가 적용되고 결과가 다운 스트림으로 전달됩니다. 활동이 관찰 repo되고 동일한 LifecycleOwner가 repository.loadRepo(id)호출에 사용됩니다 .

✅ ViewModel 내에 Lifecycle 객체가 필요하다고 생각 될 때마다 Transformation이 해결책 일것입니다.

### LiveData 확장

LiveData의 가장 일반적인 사용 사례는 ViewModels에서 MutableLiveData를 사용하고 이를 관찰자로부터 변경할 수 없도록 LiveData로 노출하는 것입니다.
더 많은 기능이 필요한 경우 LiveData를 확장하면 활성 옵저버가있을 때 알려줍니다. 예를 들어 위치 또는 센서 서비스를 듣고 자 할 때 유용합니다.

public class MyLiveData extends LiveData<MyData> {
   public MyLiveData(Context context) {
       // Initialize service
   }
   @Override
   protected void onActive() {
       // Start listening
   }
 
   @Override
   protected void onInactive() {
       // Stop listening
   }
}

### LiveData를 확장하지 않을 때

You could also use onActive() to start some service that loads data, but unless you have a good reason for it, you don’t need to wait for the LiveData to be observed. Some common patterns:
* Add a start() method to the ViewModel and call it as soon as possible.
* Set a property that kicks off the load.

❌ You don’t usually extend LiveData. Let your activity or fragment tell the ViewModel when it’s time to start loading data.









