# FAQ

Sky Follower Bridge에 대한 자주 묻는 질문입니다. 다른 질문이 있으시면 [@sky-follower-bridge.dev](https://bsky.app/profile/sky-follower-bridge.dev)로 문의해 주세요.

## 왜 만들었나요?

[개발자](https://bsky.app/profile/kawamataryo.bsky.social)가 Bluesky로 이주했을 때, Bluesky에서 X의 연결을 찾는 것이 지루한 작업이었습니다. 이 과정을 자동화하기 위해 Sky Follower Bridge가 만들어졌습니다.

## 유사 사용자를 감지하는 기준은 무엇인가요?

Sky Follower Bridge는 다음 기준 중 하나를 충족하는 사용자를 감지합니다:

- **동일한 핸들 이름**
- **동일한 표시 이름**
- **X 소개에 Bluesky 핸들 또는 프로필 링크가 포함됨**

자세한 기준은 [이 코드](https://github.com/kawamataryo/sky-follower-bridge/blob/main/src/lib/bskyHelpers.ts)를 확인하세요.

::: tip
Sky Follower Bridge가 당신을 안정적으로 감지하기를 원한다면, X와 Bluesky에서 동일한 표시 이름을 사용하고 X 소개에 Bluesky 프로필 링크를 포함하는 것을 추천합니다.
:::

## 모바일 기기에서는 사용할 수 없나요?

PC 브라우저 확장 프로그램이기 때문에 모바일 기기에서는 사용할 수 없습니다. 향후 모바일 기기에서 사용할 수 있는 웹 버전을 만들 것을 고려하고 있습니다.

## 프로젝트를 어떻게 지원할 수 있나요?

다음 링크를 통해 지원해 주시면 감사하겠습니다. 개발 동기 부여에 도움이 됩니다.

- [ko-fi](https://ko-fi.com/kawamataryo)

## skyfollowerbridge.com과의 관계는 무엇인가요?

<a href="skyfollowerbridge.com" target="_blank" rel="noopener noreferrer nofollow">skyfollowerbridge.com</a>은 Sky Follower Bridge와 아무런 관련이 없습니다. skyfollowerbridge.com은 이전에 Sky Follower Bridge의 공식 사이트를 사칭하고 유해한 광고를 배포했습니다. 주의해 주시기 바랍니다. 이 사건에 대한 자세한 내용은 아래 Bluesky 스레드에서 확인할 수 있습니다.

<SpamSiteEmbed /> 
