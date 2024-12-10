# 문제 해결 가이드

## 인증 오류

### 로그인 문제

**오류 메시지:**  
<span class="error-message">Error: Invalid identifier or password</span>

**체크리스트:**
1. 사용자 이름과 비밀번호 입력
   - 불필요한 공백이 없는지 확인
   - 복사 붙여넣기 시 불필요한 문자가 포함되지 않았는지 확인

2. 사용자 이름 형식
   - 올바른 형식: `your-username.bsky.social`
   - 일반적인 실수: `your-username`(.bsky.social 누락)

3. 비밀번호 정보
   - 일반 비밀번호가 아닌 [앱 비밀번호](https://bsky.app/settings/app-passwords)를 사용하는 것을 강력히 권장합니다
   - 앱 비밀번호 형식: `xxxx-xxxx-xxxx-xxxx`(19자)

::: tip 유용한 힌트
앱 비밀번호를 설정의 "비밀번호 이름"과 혼동하지 마세요.
새 앱 비밀번호 생성 방법:
1. [앱 비밀번호 섹션으로 이동](https://bsky.app/settings/app-passwords)
2. "앱 비밀번호 추가" 클릭
3. "앱 비밀번호 생성" 클릭
4. 생성된 19자 비밀번호 복사
:::

---

### 2단계 인증 문제

**오류 메시지:**  
<span class="error-message">Error: Two-factor authentication required</span>

**해결 방법:**
1. 인증 코드가 포함된 이메일 확인
2. 2FA 입력 필드에 코드 입력
3. 다시 로그인 시도

::: warning
Firefox 버전은 2FA를 지원하지 않습니다. Firefox 버전에서는 2FA를 비활성화하세요.
:::

## 속도 제한 오류

**오류 메시지:**  
<span class="error-message">Error: Rate limit error</span>

**해결 방법:**
1. Bluesky API에는 다음과 같은 제한이 있습니다([공식 문서](https://docs.bsky.app/docs/advanced-guides/rate-limits)):
   - 시간당 최대 5,000포인트(약 1,666개의 새로운 작업)
   - 일일 최대 35,000포인트
   - 작업별 포인트:
     - 생성: 3포인트
     - 업데이트: 2포인트
     - 삭제: 1포인트
2. 제한에 도달한 경우 제한이 재설정될 때까지 대기
3. "Restart" 버튼을 클릭하여 재시도

::: warning
Firefox에서 공개된 버전은 속도 제한 오류가 자주 발생합니다. 오류가 발생하면 Chrome에서 시도해보세요.
:::

::: tip
일반적인 사용에서는 대부분의 사용자가 이러한 제한에 도달하지 않습니다. 단, 짧은 시간 동안 많은 사용자를 팔로우하거나 많은 게시물에 좋아요를 누를 경우 주의하세요.
:::

## 페이지 오류

### 잘못된 페이지

**오류 메시지:**  
<span class="error-message">Error: Invalid page. please open the 𝕏 following or blocking or list page.</span>

**해결 방법:**
이 확장 프로그램은 다음 𝕏(Twitter) 페이지에서만 사용할 수 있습니다:
- 팔로잉 페이지 ([x.com/following](https://x.com/following))
- 차단 페이지 ([x.com/settings/blocked/all](https://x.com/settings/blocked/all))
- 리스트 멤버 페이지 (`x.com/i/lists/<list_id>/members`)

또는 확장 프로그램 페이지에서 확장 프로그램 권한을 확인하세요.
사이트 권한은 다음과 같이 설정되어 있어야 합니다:

<img src="/images/site_permissions.png" alt="사이트 권한" width="500"/>

## 스캔 문제

### View Detected Users 버튼이 작동하지 않음

어떤 이유로 View Detected Users 버튼이 작동하지 않을 수 있습니다.

**해결 방법:**
1. 확장 프로그램 아이콘을 우클릭하고 "옵션" 선택
2. 결과 페이지가 표시됩니다

<img src="/images/click-option.png" alt="옵션 클릭" width="500"/>

### 스캔이 중간에 중지됨

스캔이 페이지 하단에 도달하기 전에 중지됨

**해결 방법:**
1. "Resume"을 클릭하여 계속
2. 스캔은 페이지 하단에 도달하면 자동으로 중지됩니다
3. 언제든지 "Stop and show results"를 클릭할 수 있습니다

### 사용자를 찾을 수 없음

스캔 후 Bluesky 사용자가 감지되지 않음

**해결 방법:**
1. 올바르게 로그인되어 있는지 확인
2. 다시 스캔 시도 - 일부 사용자는 첫 번째 시도에서 감지되지 않을 수 있습니다
3. 𝕏 사용자가 프로필에 Bluesky 계정을 연결했는지 확인

## 기타 문제

예기치 않은 오류가 발생한 경우:

1. 페이지 새로고침
2. 작업 재시도
3. 문제가 해결되지 않는 경우 다음 중 하나를 수행:
   - [이슈 생성](https://github.com/kawamataryo/sky-follower-bridge/issues):
     - 정확한 오류 메시지
     - 시도한 작업
     - 브라우저 종류와 버전
     - 관련 스크린샷
   - 또는 Bluesky에서 [@kawamataryo.bsky.social](https://bsky.app/profile/kawamataryo.bsky.social)에 언급 
