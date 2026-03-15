# 시작하기

Sky Follower Bridge는 𝕏(Twitter)에서 팔로우하는 사용자와 유사한 Bluesky 사용자를 찾아 팔로우하는 데 도움을 줍니다.

<iframe width="100%" height="315" src="https://www.youtube.com/embed/CnjjfSxm0G0?si=N2OFp15PPiZZezEN" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## 설치

Sky Follower Bridge는 다음에서 사용할 수 있습니다:

<ul class="install-list">
  <li>
    <img src="/images/icon-chrome.svg" width="20" height="20">
    <a href="https://chrome.google.com/webstore/detail/sky-follower-bridge/behhbpbpmailcnfbjagknjngnfdojpko" target="_blank" rel="noopener noreferrer" class="gtm-link-to-store">Chrome Web Store</a>(추천⭐)
  </li>
  <li>
    <img src="/images/icon-firefox.svg" width="20" height="20">
    <a href="https://addons.mozilla.org/en-US/firefox/addon/sky-follower-bridge/" target="_blank" rel="noopener noreferrer" class="gtm-link-to-store">Firefox Add-ons</a>
  </li>
  <li>
    <img src="/images/icon-edge.svg" width="20" height="20">
    <a href="https://microsoftedge.microsoft.com/addons/detail/sky-follower-bridge/dpeolmdblhfolkhlhbhlofkkpaojnnbb" target="_blank" rel="noopener noreferrer" class="gtm-link-to-store">Microsoft Edge Add-ons</a>
  </li>
  <li>
    <img src="/images/icon-safari.svg" width="20" height="20">
    <a href="https://apps.apple.com/us/app/sky-follower-bridge/id6738878242?mt=12" target="_blank" rel="noopener noreferrer" class="gtm-link-to-store">Safari Web Extension</a> <span>Thanks to <a href="https://bsky.app/profile/knotbin.xyz">@knotbin.xyz</a></span>
  </li>
</ul>

::: tip
Chrome Web Store 버전을 사용하는 것이 좋습니다. 항상 최신 상태를 유지하며, 다른 스토어 버전은 업데이트가 지연될 수 있습니다.
:::

::: warning
Sky Follower Bridge는 데스크톱 브라우저에서만 사용할 수 있습니다. 모바일 브라우저는 지원되지 않습니다.
:::

## 사용 방법

### 1. 𝕏(Twitter)로 이동

𝕏의 다음 페이지에 접속하세요:
- 팔로잉 페이지: [x.com/following](https://x.com/following)
- 차단된 사용자 페이지: [x.com/settings/blocked/all](https://x.com/settings/blocked/all)
- 공개 리스트 멤버 페이지: `x.com/i/lists/<list_id>/members`

![following-page](/images/following-page.png)

### 2. Sky Follower Bridge 실행

`Alt + B`를 누르거나 브라우저 툴바의 확장 프로그램 아이콘을 클릭하세요.

::: tip
Firefox 사용자의 경우 `Alt + B`가 작동하지 않을 수 있습니다. 이 경우 브라우저 툴바의 확장 프로그램 아이콘을 클릭하세요.

https://support.mozilla.org/en-US/kb/extensions-button
:::

![Open Extension](/images/open-extension.png)

### 3. Bluesky 로그인

- **Bluesky (OAuth)** (권장): 핸들을 입력하고 "Sign in with Bluesky"를 클릭하여 OAuth 로그인합니다.
- **App Password**: "App Password" 탭으로 전환한 뒤 핸들(또는 이메일), [앱 비밀번호](https://bsky.app/settings/app-passwords), **Service URL**(기본값: `https://bsky.social`)을 입력하세요. 셀프 호스팅 PDS를 사용하는 경우 Service URL 필드에 PDS URL을 입력하세요.

::: tip
로그인 오류가 발생한 경우 [문제 해결 가이드](/ko/troubleshooting)를 참조하세요.
:::

![App Password 탭과 Service URL](/images/app-password-service-url.png)

#### 셀프 호스팅 PDS (v3.1.0+)

bsky.social 대신 셀프 호스팅 Bluesky PDS(Personal Data Server)를 사용하는 경우:

1. 확장 프로그램을 열고 **App Password** 탭으로 전환하세요.
2. 핸들(또는 이메일), 앱 비밀번호, **Service URL**에 PDS URL(예: `https://your-pds.example.com`)을 입력하세요.
3. Login을 클릭하세요.

PDS가 AT Protocol과 호환되는지 확인하세요.

### 4. 검색 시작

"Find Bluesky users"를 클릭하여 스캔을 시작하세요. 확장 프로그램이 Bluesky API를 확인하여 일치하는 Bluesky 프로필을 검색합니다.

![find-bluesky-users](/images/scan-users.png)

### 5. 결과 확인

"Show results"를 클릭하여 Bluesky에서 발견된 가능한 일치 항목을 확인하세요.

![view-results-button](/images/click-results.png)

이렇게 하면 감지된 모든 Bluesky 사용자를 표시하는 옵션 페이지가 열립니다.

![options](/images/options.png)

### 6. 사용자 팔로우

연결하고 싶은 사용자 옆의 "Follow" 버튼을 클릭하세요.

![follow](/images/click-follow-btn.png)

또는 "Follow all" 버튼을 사용하여 감지된 모든 사용자를 한 번에 팔로우할 수 있습니다.

![follow-all](/images/follow-all-btn.png)

::: warning
매칭 프로세스는 완벽하지 않으며 때때로 잘못된 매칭을 제안할 수 있습니다. 팔로우하기 전에 반드시 프로필을 확인하세요.
:::

이제 완료되었습니다! Bluesky에서 커뮤니티와의 연결을 즐기세요 🎉 
