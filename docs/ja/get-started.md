# はじめに

Sky Follower Bridgeは、𝕏（Twitter）のあなたのフォローしているユーザーと類似したBlueskyユーザーを見つけてフォローするのに役立ちます。

<iframe width="100%" height="315" src="https://www.youtube.com/embed/CnjjfSxm0G0?si=N2OFp15PPiZZezEN" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>


## インストール

Sky Follower Bridgeは以下で利用可能です：

<ul class="install-list">
  <li>
    <img src="/images/icon-chrome.svg" width="20" height="20">
    <a href="https://chrome.google.com/webstore/detail/sky-follower-bridge/behhbpbpmailcnfbjagknjngnfdojpko" target="_blank" rel="noopener noreferrer" class="link-to-chrome-store">Chrome Web Store</a>（推奨⭐）
  </li>
  <li>
    <img src="/images/icon-firefox.svg" width="20" height="20">
    <a href="https://addons.mozilla.org/en-US/firefox/addon/sky-follower-bridge/" target="_blank" rel="noopener noreferrer" class="link-to-mozilla-addons">Firefox Add-ons</a>
  </li>
  <li>
    <img src="/images/icon-edge.svg" width="20" height="20">
    <a href="https://microsoftedge.microsoft.com/addons/detail/sky-follower-bridge/dpeolmdblhfolkhlhbhlofkkpaojnnbb" target="_blank" rel="noopener noreferrer" class="link-to-edge-store">Microsoft Edge Add-ons</a>
  </li>
  <li>
    <img src="/images/icon-safari.svg" width="20" height="20">
    <a href="https://apps.apple.com/us/app/sky-follower-bridge/id6738878242?mt=12" target="_blank" rel="noopener noreferrer" class="link-to-safari-store">Safari Web Extension</a> <span>Thanks to <a href="https://bsky.app/profile/knotbin.xyz">@knotbin.xyz</a></span>
  </li>
</ul>

::: tip
Chrome Web Storeバージョンを使用することをお勧めします。常に最新の状態です。他のストアバージョンは更新が遅れる場合があります。
:::

::: warning
Sky Follower Bridgeはデスクトップブラウザのみで利用可能です。モバイルブラウザはサポートされていません。
:::

## 使用方法

### 1. 𝕏（Twitter）に移動

𝕏の以下のページにアクセスしてください：
- あなたのフォロー中のページ: [x.com/following](https://x.com/following)
- ブロックしたユーザーのページ: [x.com/settings/blocked/all](https://x.com/settings/blocked/all )
- 公開リストのメンバーのページ: `x.com/i/lists/<list_id>/members`

![following-page](/images/following-page.png)

### 2. Sky Follower Bridgeを起動

`Alt + B`を押すか、ブラウザツールバーの拡張機能アイコンをクリックします。

::: tip
Firefoxユーザーの場合、`Alt + B`が機能しないことがあります。その場合は、ブラウザツールバーの拡張機能アイコンをクリックしてください。

https://support.mozilla.org/en-US/kb/extensions-button
:::

![Open Extension](/images/open-extension.png)

### 3. Blueskyにサインイン

あなたのBlueskyハンドル（またはメール）と[アプリパスワード](https://bsky.app/settings/app-passwords)を入力してください。

::: tip
ログインエラーが発生した場合は、[トラブルシューティングガイド](/ja/troubleshooting)を参照してください。
:::

![enter-credentials](/images/enter-credentials.png)

### 4. 検索を開始

「Find Bluesky users」をクリックしてスキャンを開始します。拡張機能はBluesky APIをチェックして一致するBlueskyプロファイルを検索します。

![find-bluesky-users](/images/scan-users.png)

### 5. 結果を確認

「Show results」をクリックして、Blueskyで見つかった可能性のある一致を確認します。

![view-results-button](/images/click-results.png)

これにより、検出されたすべてのBlueskyユーザーを表示するオプションページが開きます。

![options](/images/options.png)

### 6. ユーザーをフォロー

接続したいユーザーの横にある「Follow」ボタンをクリックします。

![follow](/images/click-follow-btn.png)

または、「Follow all」ボタンを使用して、検出されたすべてのユーザーを一度にフォローします。

![follow-all](/images/follow-all-btn.png)

::: warning
マッチングプロセスは完璧ではなく、時折誤った一致を提案することがあります。フォローする前に必ずプロフィールを確認してください。
:::

以上です！Blueskyでのコミュニティとのつながりを楽しんでください 🎉 
