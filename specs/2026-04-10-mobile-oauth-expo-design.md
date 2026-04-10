# Mobile OAuth Implementation Design (Expo OAuth Client 版)

> **Note:** この設計は `2026-04-06-mobile-oauth-design.md` のサーバーサイドプロキシ案を**置き換える**ものです。`@atproto/oauth-client-expo` という公式パッケージの存在が判明したため、サーバープロキシ方式は採用せず、より素直なクライアントサイド実装に方針転換しました。旧設計ファイルは履歴として残します。

## Background

現在のモバイルアプリは App Password ログインのみサポートしている。OAuth を実装することでユーザー体験を改善し、ブラウザ拡張版とも認証方式を揃えたい。

旧設計 (`2026-04-06`) では「Hermes が `crypto.subtle` を持たないため `@atproto/oauth-client` がそのままでは動かない」という制約から、Cloudflare Worker をプロキシにする案を採用していた。しかし npm 上に **公式パッケージ `@atproto/oauth-client-expo@0.0.10`** が存在し、iOS/Android のネイティブモジュール (Swift/Kotlin) で DPoP/JWT 署名を実行することが判明した。これによりサーバー側の追加実装はほぼ不要となり、ブラウザ拡張版と同じ `@atproto/oauth-client` コアをモバイルでも利用できる。

## 採用するアプローチ

**`@atproto/oauth-client-expo` をモバイルアプリに導入する。**

### このパッケージの要点

- 提供元: `bluesky-social/atproto` モノレポ (公式)
- メンテナ: Hailey (Bluesky)、Matthieu Sieben (atproto OAuth 作者)
- 内部で `@atproto/oauth-client@^0.6.0` を使用 (ブラウザ拡張版と同じコア)
- iOS: `Crypto.swift` `Jose.swift` でネイティブ DPoP 署名
- Android: 対応するネイティブ実装あり
- セッションストレージ: `react-native-mmkv` (パッケージ内ハードコード)
- DPoP nonce ローテーション、トークンリフレッシュは自動

### 制約

- バージョン `0.0.10` (まだ若い → API 破壊的変更リスクあり)
- ネイティブモジュールを含むため Expo Go では動かない (development build / `expo run:ios` 等が必須)
- 現在の mobile アプリは既に bare/dev-build 構成 (`mobile/ios/` `Podfile` `xcworkspace` 存在) のため、この制約は問題にならない

## 確定した設計判断

ブレインストーミングおよびレビュー指摘で決定した方針:

| # | 論点 | 決定 | 理由 |
|---|---|---|---|
| 1 | client-metadata の構成 | **A. 別エンドポイントを新設** (`/oauth/mobile/client-metadata.json`) | ブラウザ拡張版 (`application_type: web`) を一切壊さない。OAuth 仕様上 1 つの client metadata で `web` と `native` を共存できないため必須 |
| 2 | redirect URI スキーム | **a. `dev.sky-follower-bridge.mobile`** (旧 `sky-follower-bridge` は削除) | iOS bundle id と一致させる。Info.plist 登録が一貫し、可読性が高い。旧スキームは `expo-auth-session` 時代の遺物のため完全移行する |
| 3 | App Password の扱い | **C. OAuth 既定 + fallback link で App Password 残置** | パッケージが `0.0.10` という不安要素のヘッジ。カスタム PDS など OAuth 不調時のフォールバック。既存ユーザーのセッションも維持できる。※現行 `auth.tsx` は既にこの構成 |
| 4 | OAuth セッション保存 | **A. パッケージのデフォルト (MMKV)** | Bluesky 公式アプリ相当のセキュリティモデル。iOS Data Protection が自動暗号化。パッケージ更新追従性を確保 |
| 5 | セッション復元 | 既存型 `SessionData` の `{ authMethod: "oauth"; sub }` をそのまま流用 | 既に判別共用体で OAuth セッション本体を外部ストアに任せる設計になっている |
| 6 | `restore` の refresh 挙動 | **`client.restore(sub, false)`** (`'auto'` ではなく) | 拡張版 (`src/lib/bskyOAuthClient.ts:465`) と同じ方針。並列 restore 時の refresh 競合でセッションを壊すリスクを避ける。必要になった時点で `agent` 側のリクエストで自動リフレッシュされる |
| 7 | Agent 型 | **`AtpAgent` を維持** (既存コード互換) | `AuthContext`・`bskyAgent.ts`・`bskyOAuth.ts` の全てが `AtpAgent` 前提。OAuth セッションから `AtpAgent({ service: session.server.issuer, fetch: session.fetchHandler })` のようにカスタム fetch を注入して `AtpAgent` を構築する。パッケージが提供する `dpopFetch` 相当をラップするだけで既存の `BskyAgent` 依存箇所に手を入れずに済む |
| 8 | プラットフォーム対象 | **iOS のみ** (Android は未サポート) | リポジトリに `mobile/android/` が存在しない。Android サポートは別タスクとして明示的に切り出す |

## 全体アーキテクチャ

```
┌──────────────────────────────────────────────────────────────┐
│ Mobile App (Expo, dev build)                                  │
│                                                                │
│  ┌──────────────┐    ┌─────────────────────────────┐         │
│  │  auth.tsx    │───▶│  ExpoOAuthClient (singleton)│         │
│  │  (Sign in UI)│    │  (lib/bskyOAuthClient.ts)   │         │
│  └──────────────┘    └────────────┬────────────────┘         │
│         │                          │                          │
│         │ App Password 経路        │ OAuth 経路              │
│         ▼                          ▼                          │
│  ┌──────────────────┐    ┌────────────────────┐              │
│  │ expo-secure-store│    │ MMKV (パッケージ内)│              │
│  │ (現状維持)       │    │  - session         │              │
│  │ - session 文字列 │    │  - dpopKey.jwk     │              │
│  └──────────────────┘    │  - tokens          │              │
│                          └────────────────────┘              │
│         │                          │                          │
│         └──────────┬───────────────┘                          │
│                    ▼                                          │
│  ┌────────────────────────────────────┐                      │
│  │ secure-store: SessionData(目印のみ)│                      │
│  │  oauth     → { sub }               │                      │
│  │  app-pass  → { service, session }  │                      │
│  └────────────────────────────────────┘                      │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼ HTTPS
┌──────────────────────────────────────────────────────────────┐
│ Server (Cloudflare Worker - server/src/index.tsx)            │
│                                                                │
│  GET /oauth/client-metadata.json         (web, 既存・無変更) │
│  GET /oauth/mobile/client-metadata.json  (native, 新規)      │
│  GET /oauth/callback                     (既存・無変更)      │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    Bluesky Authorization Server
```

### 設計の中心思想

1. **DPoP はネイティブモジュール任せ** — Hermes の `crypto.subtle` 不在問題は `@atproto/oauth-client-expo` の Swift ネイティブ実装が解決する。サーバー側プロキシは不要。
2. **二つの認証方式は完全独立** — App Password と OAuth はそれぞれ独自のストレージ層を持ち、互いに干渉しない。`SessionData` 判別共用体が両者を統合する唯一の接点。
3. **secure-store は "目印" のみ** — OAuth セッションの本体はパッケージ内 MMKV にあり、secure-store には次回起動時に復元するための `sub` (DID) だけを置く。既存の型設計を流用。
4. **サーバー側は最小変更** — 新しいエンドポイント 1 つ追加するだけ。既存のブラウザ拡張用エンドポイントには一切触れない。新エンドポイントは canonical URL 固定値で metadata を返し、request origin に依存しない (local JSON との「完全一致」要件を満たすため)。
5. **AtpAgent を保持してインターフェイス断絶を避ける** — `OAuthSession` から取得した DPoP 付き `fetch` を `AtpAgent` の `fetch` オプションに注入し、既存の `AuthContext.agent: AtpAgent` 契約を壊さない。`Agent` 基底型への全面移行はしない。
6. **トークンリフレッシュは透明** — `OAuthSession` が内部で access_token の失効を検知して refresh_token を使い自動更新する。アプリ層は意識しない。restore 時には refresh を強制しない (`false`) ことで並列起動時の競合を避ける。

### スコープ外 (今回やらないこと)

- ブラウザ拡張版 OAuth の変更 (一切触らない)
- サーバーの既存 `/oauth/callback` `/oauth/client-metadata.json` の変更
- KV Namespace 有効化 (旧設計で必要だったが不要になった)
- 自前 DPoP proof 実装 (不要になった)
- App Password ログイン廃止 (fallback link で残す)
- **Android サポート** (`mobile/android/` ディレクトリ不在のため別タスク)
- `AtpAgent` → `Agent` 基底型への全面移行 (影響範囲が広いため別タスク)

## 変更ファイル一覧

### 新規作成 (3 ファイル)

| ファイル | 役割 |
|---|---|
| `mobile/lib/bskyOAuthClient.ts` | `ExpoOAuthClient` のシングルトンを生成・公開。client metadata は `require()` で同梱 JSON を読み込む。`signIn(handle)` `restore(sub)` `signOut(sub)` の薄いラッパー API を提供。`restore` は `false` を渡して即 refresh させない |
| `mobile/assets/oauth-client-metadata.json` | パッケージ README に従った native 用クライアントメタデータの**ローカルコピー**。`client_id` はサーバー URL を指す。**サーバー側の canonical JSON と 1 バイト単位で一致させる** |
| `server/src/lib/mobileOAuthClientMetadata.ts` | サーバー側で native 用 client metadata を生成するヘルパー。`MOBILE_OAUTH_CANONICAL_ORIGIN` 環境変数 (または固定定数) を使い、request origin に依存しない |

> **補足:** モバイル側で `assets/*.json` を `require` する設計にする理由は、README が「サーバー上の JSON とローカルの JSON を完全一致させる」ことを要求するため。CI で mobile 側の JSON と `mobileOAuthClientMetadata.ts` の出力をスナップショット比較するテストを Phase 4 で追加する。

### 修正 (7 ファイル)

| ファイル | 変更内容 |
|---|---|
| `mobile/package.json` | `@atproto/oauth-client-expo` を依存追加 (完全固定 `0.0.10`)。`base-64` `expo-auth-session` は OAuth 以外で未使用であることを grep 確認の上で削除 |
| `mobile/app.json` | `scheme` を `"sky-follower-bridge"` から `"dev.sky-follower-bridge.mobile"` に変更 |
| `mobile/lib/constants.ts` | `BSKY_OAUTH_CLIENT_ID` `BSKY_OAUTH_REDIRECT_URI` `BSKY_OAUTH_SCOPE` を**削除** (web 用 endpoint に依存しないため)。他で参照されていないことを grep で確認 |
| `mobile/lib/bskyAgent.ts` | `restoreAgent()` の OAuth 分岐を実装 (現状 `return null` のプレースホルダ)。`expoOAuthClient.restore(sessionData.sub, false)` を呼び、返ってきた `OAuthSession` から `AtpAgent({ service: session.server.issuer, fetch: session.fetchHandler })` を構築。失敗時は `null` を返し、AuthContext 側が `clearSession()` とクリーンアップを実行 |
| `mobile/lib/bskyOAuth.ts` | **既存ファイルを全面書き換え**。`expo-auth-session` / `base-64` / `AtpAgent.resumeSession` 経路を捨て、`bskyOAuthClient` を呼び出す薄いユースケース層に。`loginWithOAuth(identifier) → { agent, sub }` のシグネチャは維持 (AuthContext の呼び出し側を変更不要に保つため)。sub が空文字/undefined の場合は例外を投げる (後述) |
| `mobile/contexts/AuthContext.tsx` | restore 失敗時に `console.error` だけでなく `clearSession()` + `expoOAuthClient.signOut(sub)` を呼ぶ。`logout()` に OAuth 分岐を追加して OAuth セッションの revoke + MMKV purge を実行。`handleOAuthLogin` で `sub` の有効性検証 (空文字拒否) を追加 |
| `mobile/app/auth.tsx` | **現行 UI を維持**。エラーハンドリングを `OAuthLoginError` 正規化レイヤ経由にし、`error.code` でローカライズ済みメッセージを選ぶ。`2FA code` `service URL` の入力欄は今回のスコープ外 (App Password fallback のカスタム PDS 対応は別タスク) |
| `server/src/index.tsx` | `/oauth/mobile/client-metadata.json` ハンドラを追加。`mobileOAuthClientMetadata.ts` のヘルパーを呼び出し、canonical な JSON を返す |

### ネイティブビルド設定の手動更新 (iOS のみ)

`mobile/ios/` がコミット済みのため、`expo prebuild` で上書きせず手動反映する。`mobile/android/` ディレクトリは存在しないため Android 向け設定は行わない。

| ファイル | 変更内容 |
|---|---|
| `mobile/ios/SkyFollowerBridge/Info.plist` | `CFBundleURLSchemes` から旧 `sky-follower-bridge` を削除し `dev.sky-follower-bridge.mobile` のみ残す。旧スキーム削除はインストール済みユーザーへの影響なし (既存 OAuth フローはまだ `expo-auth-session` 経由のため旧スキームの callback URL は二度と呼ばれない) |
| `mobile/ios/Podfile.lock` | `expo install @atproto/oauth-client-expo` 後に `pod install` で `ExpoAtprotoOAuthClient` Pod が autolink される。`Podfile` への手動編集は不要 |

### 削除確定

- `mobile/lib/bskyOAuth.ts` 内の `expo-auth-session` / `base-64` / `buildServerCallbackUri` / `resolveAuthorizationServer` 関連コード (ネイティブパッケージ側が同等機能を提供)
- `mobile/lib/constants.ts` の `BSKY_OAUTH_CLIENT_ID` `BSKY_OAUTH_REDIRECT_URI` `BSKY_OAUTH_SCOPE`
- `mobile/package.json` の `expo-auth-session` `base-64` (他参照がないことを確認後)
- `mobile/ios/SkyFollowerBridge/Info.plist` の旧 `sky-follower-bridge` scheme

## データフロー

### 1. 新規 OAuth ログイン

```
User                auth.tsx          bskyOAuth.ts     ExpoOAuthClient    Bluesky AS
 │                     │                  │                  │                │
 │ 1. handle 入力       │                  │                  │                │
 ├────────────────────▶│                  │                  │                │
 │                     │ 2. loginWithOAuth │                  │                │
 │                     ├─────────────────▶│                  │                │
 │                     │                  │ 3. client.signIn │                │
 │                     │                  ├────────────────▶ │                │
 │                     │                  │                  │ 4. resolve PDS │
 │                     │                  │                  ├──────────────▶ │
 │                     │                  │                  │ 5. ネイティブで│
 │                     │                  │                  │   DPoP key生成 │
 │                     │                  │                  │ 6. authorize URL│
 │ 7. システムBrowser起動│                 │                  │                │
 │◀─────────────────────────────────────────────────────────│                │
 │                     │                  │                  │                │
 │ 8. ユーザー認可                                            │                │
 │ 9. dev.sky-follower-bridge.mobile:/oauth-callback?code=... ◀───────────────│
 │                     │                  │                  │ 10. token交換  │
 │                     │                  │                  │   (DPoP proof) │
 │                     │                  │                  ├──────────────▶ │
 │                     │                  │                  │◀───────────────│
 │                     │                  │                  │ 11. session を │
 │                     │                  │                  │   MMKV に保存 │
 │                     │                  │ 12. OAuthSession │                │
 │                     │                  │◀────────────────│                │
 │                     │                  │ 13. Agent 構築   │                │
 │                     │ 14. {agent, sub} │                  │                │
 │                     │◀─────────────────│                  │                │
 │                     │ 15. saveSession  │                  │                │
 │                     │   {authMethod:'oauth', sub}         │                │
 │                     │   → secure-store │                  │                │
 │ 16. /index に遷移    │                  │                  │                │
 │◀────────────────────│                  │                  │                │
```

**ポイント:** Step 12 で受け取った `OAuthSession` から、既存コードが依存する `AtpAgent` を構築する。`Agent` 基底型への切り替えは影響範囲が広すぎる (`AuthContext.agent: AtpAgent`、`bskyAgent.ts`、`bskyOAuth.ts`、各種呼び出し側) ため、今回は採用しない。代わりに `OAuthSession` が提供する DPoP 付き `fetch` (パッケージが公開する `fetchHandler` / `dpopFetch` 相当) を `AtpAgent` の `fetch` オプションに注入する:

```ts
const session = await client.signIn(identifier);
const agent = new AtpAgent({
  service: session.server.issuer, // PDS URL
  fetch: session.fetchHandler,     // DPoP proof を自動付与
});
// sub 空値ガード
if (!session.sub) throw new OAuthLoginError("unknown", "missing sub");
return { agent, sub: session.sub };
```

`@atproto/oauth-client-expo@0.0.10` の exports を実装時に確認し、`fetchHandler` のプロパティ名が異なる場合は Phase 3 の先頭で型定義と実装を確認してから進める。

**Step 15 の検証:** `sub` が空文字/undefined のまま `saveSession` に渡すと、次回起動時の `restore(sub, false)` が必ず失敗する。`AuthContext.handleOAuthLogin` で `if (!sub) throw ...` を追加し、save 前に失敗させる。

### 2. アプリ起動時のセッション復元

```
App Launch     bskyAgent.ts      ExpoOAuthClient     MMKV
 │ 1. loadSession                                       │
 │   from secure-store                                  │
 │   {authMethod:'oauth', sub:'did:plc:xxx'}            │
 │                                                      │
 │ 2. restoreAgent                                      │
 ├─────────────────▶                                    │
 │                  │ 3. switch on authMethod           │
 │                  │ 4. oauth 分岐                     │
 │                  │   client.restore(sub, false)      │
 │                  ├────────────────▶                  │
 │                  │                  │ 5. session 読み│
 │                  │                  ├──────────────▶ │
 │                  │                  │◀───────────────│
 │                  │                  │ 6. refresh しない (false)│
 │                  │                  │  → 既存トークン│
 │                  │                  │  がそのまま使われる│
 │                  │ 7. OAuthSession  │                │
 │                  │◀────────────────│                 │
 │                  │ 8. new AtpAgent( │                │
 │                  │    service, fetch)                │
 │ 9. agent         │                                   │
 │◀─────────────────│                                   │
```

**復元失敗時の挙動** (refresh_token 期限切れ、MMKV 破損、sub 不一致、ネットワーク不達など):

1. `client.restore(sub, false)` が throw
2. `bskyAgent.ts` の catch で `expoOAuthClient.signOut(sub).catch(() => {})` を呼び MMKV 実体を purge (revoke は best-effort)
3. `null` を返す
4. `AuthContext` は `clearSession()` で secure-store もクリアし `/auth` 画面に遷移

**refresh のタイミング:** `restore(sub, false)` は復元時に refresh を実行しないが、その後の API 呼び出しで access token が失効していれば `fetchHandler` 内部で自動的に refresh が走る。ユーザー体感上の遅延は初回 API 呼び出しのみ。並列 restore 競合のリスクは排除される。

### 3. API リクエスト時の DPoP 付与

これは **一切意識しなくてよい**。`AtpAgent` に `fetch: session.fetchHandler` を注入しているため、`@atproto/api` が発行する全リクエストは `OAuthSession` 経由となり、DPoP proof・nonce ローテーション・access token リフレッシュがパッケージ内で自動処理される。`fetch` インターセプタも自前ラッパー (`DpopAtpAgent` 等) も不要。

### 4. ログアウト

```
User           AuthContext       expoOAuthClient    MMKV     secure-store
 │                │                    │             │              │
 │ tap logout     │                    │             │              │
 ├──────────────▶ │                    │             │              │
 │                │ 1. authMethod 判定  │             │              │
 │                │ 2. oauth なら       │             │              │
 │                │  signOut(sub)       │             │              │
 │                ├────────────────────▶│             │              │
 │                │                    │ revoke (best-effort)       │
 │                │                    │ ────────────▶│              │
 │                │                    │ purge session               │
 │                │                    ├────────────▶│              │
 │                │ 3. clearSession()   │             │              │
 │                ├────────────────────────────────────────────────▶│
 │                │ 4. setAgent(null)   │             │              │
 │◀──────────────│                     │             │              │
```

OAuth 経路では **必ず両方のストレージ** (MMKV と secure-store) をクリアする。どちらか一方だけ残ると、次回起動時に「marker はあるが実体が無い」または「実体はあるが marker が無い」不整合状態になり、restore が無限に失敗するか、ユーザー切替時に古いセッションが紛れ込むリスクがある。

`signOut` の revoke request はオフライン時に失敗しうるが、**アプリ側のクリアは常に成功させる**。revoke は best-effort、ローカル purge は必須。

## ネイティブビルド設定と redirect URI の詳細

### iOS 設定

**`mobile/app.json`:**

```json
{
  "expo": {
    "scheme": "dev.sky-follower-bridge.mobile",
    "ios": {
      "bundleIdentifier": "dev.sky-follower-bridge.mobile"
    }
  }
}
```

**`mobile/ios/SkyFollowerBridge/Info.plist`:**

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>dev.sky-follower-bridge.mobile</string>
    </array>
  </dict>
</array>
```

**Pod 追加 (自動):** `npm install @atproto/oauth-client-expo` 後に `cd ios && pod install` で `ExpoAtprotoOAuthClient` Pod が autolink される。`Podfile` への手動編集は不要。

### Android 設定

**`mobile/android/app/src/main/AndroidManifest.xml`:**

```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="dev.sky-follower-bridge.mobile" />
</intent-filter>
```

**Gradle:** Expo modules autolinking が `expo.modules.atprotooauthclient` を自動追加するため手動編集不要。

### redirect URI の最終形

| 場所 | 値 |
|---|---|
| `mobile/assets/oauth-client-metadata.json` の `redirect_uris` | `["dev.sky-follower-bridge.mobile:/oauth-callback"]` |
| サーバーの `/oauth/mobile/client-metadata.json` の `redirect_uris` | 同上 (完全一致が必須) |
| iOS `CFBundleURLSchemes` | `dev.sky-follower-bridge.mobile` |
| Android `intent-filter` の `android:scheme` | `dev.sky-follower-bridge.mobile` |

> **重要な仕様:** スラッシュは 1 つだけ (`scheme:/path`)。`scheme://path` は無効。

### client-metadata.json の最終形 (両方同じ内容)

```json
{
  "client_id": "https://server.sky-follower-bridge.dev/oauth/mobile/client-metadata.json",
  "client_name": "Sky Follower Bridge Mobile",
  "client_uri": "https://server.sky-follower-bridge.dev",
  "policy_uri": "https://server.sky-follower-bridge.dev/privacy-policy",
  "redirect_uris": ["dev.sky-follower-bridge.mobile:/oauth-callback"],
  "scope": "atproto transition:generic",
  "token_endpoint_auth_method": "none",
  "response_types": ["code"],
  "grant_types": ["authorization_code", "refresh_token"],
  "application_type": "native",
  "dpop_bound_access_tokens": true
}
```

## UI 変更 (auth.tsx)

### 現状との差分

**現行 `mobile/app/auth.tsx` は既に OAuth 主導 + App Password fallback link 構成になっている** (`showAppPassword` state で OAuth / App Password モードを切り替え)。したがって今回の spec では UI 構造の大規模変更はしない。以下の小さな改修のみを行う。

### 改修ポイント

1. **エラー表示の正規化** — 現状は `Alert.alert("Login Error", e.message)` で raw なエラーメッセージを表示しているが、`OAuthLoginError.code` で switch してローカライズ済みの定数メッセージを引く
2. **`cancelled` を無視** — ユーザーがブラウザで Cancel した場合は Alert を出さず、UI をローディング解除のみ行う
3. **handle 未入力チェック** — 既存の `if (!handle)` は維持
4. **typeahead dropdown** — 既存実装を維持 (OAuth モードのみ表示)
5. **`2FA code` / `service URL` 入力欄は今回追加しない** — 現行 `createAgentWithAppPassword` は両オプションを受け付けるが UI で渡していない。カスタム PDS での App Password fallback は現時点でも未サポートという前提を明記。本当に必要になったら別タスクとして追加する

### 現状 UI の模式図 (変更なし)

```
┌─────────────────────────────────────────┐
│  STEP 1 OF 3                            │
│  Connect Bluesky                        │
│  Sign in to your Bluesky account...     │
│                                          │
│  ┌─────────────────────────────────┐   │
│  │ @  alice.bsky.social             │   │  ← 共有 handle 入力
│  └─────────────────────────────────┘   │
│                                          │
│  [Typeahead dropdown]                   │  ← OAuth モードのみ
│                                          │
│  ┌─────────────────────────────────┐   │
│  │  ▶  Sign in with Bluesky         │   │  ← 主要 CTA (OAuth)
│  └─────────────────────────────────┘   │
│  You'll be redirected to Bluesky ...    │
│                                          │
│        Use App Password instead          │  ← fallback link (既存)
└─────────────────────────────────────────┘
```

App Password モード (`showAppPassword === true`):

```
┌─────────────────────────────────────────┐
│  @  alice.bsky.social                   │
│  [App Password           ]              │
│  Generate an App Password in ...        │
│  [ Sign In ]                            │
│  ← Back to OAuth sign in                │
└─────────────────────────────────────────┘
```

## エラーハンドリング

### OAuth ログイン時のエラーケース

| ケース | 検出方法 | UI 表示 |
|---|---|---|
| ユーザーがブラウザでキャンセル | `client.signIn` の戻り値 `status === 'cancel'` | サイレント (エラー表示なし、何もしない) |
| ハンドル解決失敗 (typo, 存在しない PDS) | `signIn` が throw | 「ハンドルが見つかりません。スペルを確認してください」 |
| 認可サーバーがメタデータ取得失敗 | 同上 | 「Bluesky 認可サーバーに接続できませんでした。時間をおいて再試行してください」 |
| トークン交換失敗 (DPoP nonce 再試行後も) | 同上 | 「認証に失敗しました。再度お試しください」+ 開発時はエラー詳細をコンソール |
| ブラウザ起動失敗 (`expo-web-browser`) | `signIn` が throw | 「ブラウザを起動できませんでした」 |
| ネットワーク全般 | 同上 | 「ネットワークエラー。接続を確認してください」 |

### セッション復元時のエラーケース

`restore(sub, false)` は復元時に refresh を実行しない分、起動パスでの失敗頻度は下がる。以下は主な失敗モード。

| ケース | 検出方法 | 挙動 |
|---|---|---|
| MMKV からセッションが消えた (アンインストール残骸、直接書き換え) | `client.restore(sub, false)` が throw | `signOut(sub).catch(() => {})` + `clearSession()` → `/auth` へリダイレクト |
| sub 不一致 (secure-store の marker が古い) | 同上 | 同上 |
| その後の API 呼び出しで access_token 失効 → refresh も失敗 | `AtpAgent` 経由の request が reject | `AuthContext` の unified error handler で `signOut` + `clearSession` を呼び `/auth` へ |
| ネットワークなし起動 | 成功 (restore は local 操作のみ) | 既存トークンで agent が作れる。API 呼び出し時に再度判定 |
| パッケージ内部エラー (MMKV 読み取り例外など) | throw | 上記と同様 |

**sub 検証:** `loadSession()` が返す sessionData の `sub` が空文字または `undefined` だった場合 (旧バグの残存データ)、`restore` を呼ばずに即座に `clearSession()` し `/auth` へ。

### エラー型の正規化

`bskyOAuth.ts` のラッパーで例外を `OAuthLoginError` 型に正規化する:

```ts
export type OAuthLoginErrorCode =
  | "cancelled"
  | "handle_resolution_failed"
  | "network"
  | "auth_server_unavailable"
  | "token_exchange_failed"
  | "browser_failed"
  | "unknown";

export class OAuthLoginError extends Error {
  constructor(
    public code: OAuthLoginErrorCode,
    message: string,
    public cause?: unknown,
  ) {
    super(message);
  }
}
```

`auth.tsx` 側は `error.code` で switch して i18n キーまたは定数化されたメッセージを引く。

### キャンセルとエラーの区別

`status === 'cancel'` は **エラーとして扱わない** (ユーザーの意図的な操作)。何もせず `auth.tsx` に留まる。

## テスト戦略

mobile は Vitest + happy-dom 構成。`@atproto/oauth-client-expo` のネイティブモジュールはテスト環境では呼べないので、スタブ層を挟んでユニットテスト対象を絞る。

| レイヤ | テスト方針 |
|---|---|
| `bskyOAuthClient.ts` (シングルトン) | テスト対象外 (副作用層、薄いラッパー) |
| `bskyOAuth.ts` (ユースケース) | `bskyOAuthClient` を `vi.mock` してエラー正規化のロジックをテスト。`OAuthLoginError` の `code` が正しくマップされるかを表駆動テストで網羅 |
| `bskyAgent.ts` の `restoreAgent` | 既存テストを拡張。`authMethod: "oauth"` 分岐を追加し、mock した `client.restore` の成功/失敗で Agent 取得 / null を検証 |
| `auth.tsx` | 既存テストがあれば折りたたみ UI の表示切替テストを追加。なければスキップ (実機検証で代替) |
| サーバー `/oauth/mobile/client-metadata.json` | server 側のテストファイルがあるか確認後、エンドポイント単体テストを追加 (Hono の `app.request()` でレスポンス JSON を検証) |

### 実機検証 (テストでは代替不可)

- iOS シミュレータでの OAuth フロー一周 (sign in → restore → sign out)
- Android エミュレータでの同フロー
- カスタム PDS (`bsky.social` 以外) での動作確認 — handle 解決と AS 発見の検証
- リフレッシュトークン期限切れシミュレーション (MMKV 直接書き換えで `expires_at` を過去に)
- 機内モードでの起動 → グレースフルフォールバック確認

## 実装フェーズ

依存順に並べた 4 フェーズ。各フェーズの完了基準を明示。

### Phase 0: canonical metadata JSON 確定 (設計の前提合わせ)

Phase 1 と Phase 2 の「1 バイト単位の一致」要件を成立させるため、先に canonical な JSON を合意する。

- `mobile/assets/oauth-client-metadata.json` と `server/src/lib/mobileOAuthClientMetadata.ts` の出力の canonical 仕様を確定
- `client_id` `redirect_uris` `scope` `application_type` 等の最終値をこのドキュメントに固定 (既に「client-metadata.json の最終形」節にあり)
- **完了基準:** spec に記載された JSON がそのまま両方にコピーできる状態

### Phase 1: サーバー側 (Phase 0 完了後に先行可能)

- `server/src/lib/mobileOAuthClientMetadata.ts` 作成 (canonical URL 固定、request origin 非依存)
- `/oauth/mobile/client-metadata.json` ハンドラを `server/src/index.tsx` に追加
- 本番デプロイ → `curl https://server.sky-follower-bridge.dev/oauth/mobile/client-metadata.json` で JSON 検証
- **完了基準:** cURL でメタデータが返る、`application_type: "native"` が含まれる、`client_id` が canonical URL

### Phase 2: モバイル基盤 (Phase 0 完了後、Phase 1 と並行可能)

- `expo install @atproto/oauth-client-expo` (バージョン `0.0.10` 完全固定)
- `mobile/assets/oauth-client-metadata.json` 作成 (Phase 0 の canonical 仕様と完全一致)
- `mobile/lib/bskyOAuthClient.ts` 作成 (シングルトン、`restore(sub, false)` 方針)
- `mobile/app.json` の `scheme` 更新
- `mobile/ios/SkyFollowerBridge/Info.plist` 手動更新 (旧 scheme 削除)
- `cd mobile/ios && pod install` → `npm run ios` で起動確認
- **完了基準:** iOS シミュレータでアプリが起動する (OAuth 未統合でも既存機能が動く)。Android は対象外

### Phase 3: OAuth 統合

- `mobile/lib/constants.ts` の `BSKY_OAUTH_*` 定数を削除 (grep で未参照確認)
- `mobile/lib/bskyOAuth.ts` 全面書き換え (`loginWithOAuth(identifier) → {agent, sub}` シグネチャ維持、sub 空値ガード追加)
- `mobile/lib/bskyAgent.ts` の `restoreAgent` OAuth 分岐実装 (現状 `return null` のプレースホルダを置き換え)
- `mobile/contexts/AuthContext.tsx` の restore 失敗時ハンドリングを `console.error` から `signOut(sub) + clearSession()` に強化
- `mobile/contexts/AuthContext.tsx` の `logout` に OAuth 分岐追加 (`signOut` + `clearSession`)
- `OAuthLoginError` 正規化レイヤ (`mobile/lib/bskyOAuth.ts`)
- **完了基準:** iOS 実機で sign in → results 画面遷移 → アプリ再起動でセッション復元 → logout で両ストレージがクリアされる

### Phase 4: 仕上げとテスト

- `auth.tsx` のエラー表示を `OAuthLoginError.code` ベースに変更
- `bskyOAuth.ts` ユニットテスト (mock 経由でエラー正規化のロジックをテスト)
- `bskyAgent.ts` の `restoreAgent` テスト拡張
- CI に「local JSON と server canonical JSON の一致テスト」追加 (snapshot)
- カスタム PDS 検証 (OAuth のみ。App Password fallback のカスタム PDS は今回未サポート)
- リフレッシュ期限切れ検証 (MMKV を直接書き換え)
- 機内モード起動 検証
- logout 後に secure-store と MMKV 両方が空になることを確認
- **完了基準:** 全ユニットテスト pass、実機検証チェックリスト全項目クリア

## リスクと撤退計画

| リスク | 影響度 | 確率 | 対策 |
|---|---|---|---|
| `@atproto/oauth-client-expo@0.0.10` の API 破壊的変更 | 中 | 中 | バージョンを `0.0.10` 完全固定 (`^` ではなく) でロック。アップデートは別タスクで意図的に実施 |
| `OAuthSession` の公開 API (`fetchHandler` 等のプロパティ名) が想定と異なる | 高 | 中 | Phase 3 着手時にパッケージの型定義を実機で確認する手順を入れる。もし `AtpAgent` の `fetch` オプションに差し込めない形であれば、パッケージが提供する helper (`Agent`) を使うか、ラッパー関数で変換する |
| ネイティブモジュールが iOS でビルド失敗 | 高 | 低 | Phase 2 完了基準に「iOS シミュレータでアプリ起動」を含め早期発見 |
| カスタム PDS で動かない | 中 | 低 | App Password 経路を残しているので即座にフォールバック可 (ただし現行 UI はカスタム PDS 未対応のため、真のフォールバックには UI 拡張が必要) |
| トークンリフレッシュが想定通り動かない | 高 | 低 | Phase 4 で MMKV を直接書き換えて検証 |
| `react-native-mmkv` が既存依存と競合 (RN 0.81.5) | 中 | 低 | `npm install` 時の peerDependency 警告で検出 |
| ログアウト時に MMKV クリアが漏れて古いセッションが残る | 高 | 中 | Phase 3 の `AuthContext.logout` 改修と Phase 4 の「logout 後ストレージ空確認」で検出 |
| secure-store に残った `{ sub: "" }` 状態で起動して restore が無限失敗 | 中 | 中 | `loadSession` 直後の sub 空値ガードで即 `clearSession` |
| 旧 scheme 削除で既存 `expo-auth-session` フローが壊れる | 高 | 極低 | 旧フローは今回の PR で完全削除するため、壊れるタイミングと移行タイミングが一致する |
| Bluesky 認可サーバー側が `application_type: native` を未サポート | 致命的 | 極低 | サーバーは公式仕様準拠なので対応済みのはず。Phase 1 後に手動確認 |

### 撤退計画

OAuth 実装が動かないと判明した場合、App Password 経路を削除していないので基本的には `auth.tsx` から OAuth ボタンを非表示にするだけで良い。ただし**以下の後始末が必要**:

1. **restore 分岐を feature flag 化** — `restoreAgent()` 内の OAuth 分岐を `if (FEATURE_OAUTH_ENABLED && sessionData.authMethod === "oauth")` で gate する。flag を false にすれば既存 OAuth marker は「未対応セッション」として扱われ、`clearSession()` 経由で再ログインに誘導される
2. **既存 OAuth marker の cleanup** — アプリ起動時に `sessionData.authMethod === "oauth"` かつ flag が false なら即座に `clearSession()` + `expoOAuthClient.signOut(sub).catch(() => {})` を呼んで両ストレージを初期化
3. **サーバー endpoint は残す** — `/oauth/mobile/client-metadata.json` は消さずロールフォワード可能な状態を保つ
4. **UI 非表示だけでは不十分** — OAuth ボタンを消しても、既ログインユーザーの起動パスには OAuth restore が走る可能性があるため、上記 1, 2 がセットで必要

## 見送り事項 (将来検討)

- **Android サポート** — `mobile/android/` ディレクトリ自体が存在しないため、`expo prebuild --platform android` → AndroidManifest 調整 → Gradle 設定を別タスクで扱う
- **`AtpAgent` → `Agent` 基底型への移行** — 今回は `AtpAgent` 互換を保つが、将来的に `@atproto/api` の新しい `Agent` 基底型に寄せる可能性あり
- **App Password のカスタム PDS / 2FA サポート** — `createAgentWithAppPassword` は既に `authFactorToken` と `service` を受け取るが UI で渡していない。OAuth でカバーできないケース (カスタム PDS) が実運用で問題になれば追加
- **アプリ内ブラウザと外部ブラウザの選択肢提示** — まずはパッケージのデフォルト挙動 (`openAuthSessionAsync`) に従う
- **マルチアカウント対応** — `OAuthSession` は `sub` ベースで複数保持可能だが、UI 設計が別タスク
- **iCloud バックアップから MMKV 除外設定** — iOS の Data Protection 既定で十分なリスクモデルと判断

## 参考

- [`@atproto/oauth-client-expo` on npm](https://www.npmjs.com/package/@atproto/oauth-client-expo)
- [bluesky-social/atproto - oauth-client-expo](https://github.com/bluesky-social/atproto/tree/main/packages/oauth/oauth-client-expo)
- [AT Protocol OAuth Spec](https://atproto.com/specs/oauth)
- 旧設計: `specs/2026-04-06-mobile-oauth-design.md`
- ブラウザ拡張の OAuth 実装: `src/lib/bskyOAuthClient.ts` (特に `restore(sub, false)` の判断根拠コメント)
- 現行 mobile OAuth (expo-auth-session 版): `mobile/lib/bskyOAuth.ts` (Phase 3 で全面書き換え対象)

## レビュー反映ログ (2026-04-10)

Codex による spec レビューで指摘された以下の点を反映済み:

1. `restore(sub, 'auto')` → `restore(sub, false)` に変更 (拡張版と方針統一、並列 refresh 競合回避)
2. `Agent` 型への移行を取りやめ、`AtpAgent` 互換維持 (影響範囲縮小)
3. `logout` の OAuth 分岐を明示 (`signOut` + `clearSession` の両ストレージ purge)
4. `mobile/lib/constants.ts` の `BSKY_OAUTH_*` 定数削除を明記
5. server metadata を request origin 非依存の canonical URL 固定に変更
6. Android サポートを明示的にスコープ外へ (`mobile/android/` 不在のため)
7. Info.plist の旧 scheme を削除する方針を明記 (完全移行)
8. `auth.tsx` は現行 UI を維持、エラー正規化のみ適用する方針に修正
9. restore 失敗時の `clearSession` + `signOut` フォールバックを明示
10. `sub` 空値ガードを AuthContext と loadSession 直後に追加
11. 撤退計画に feature flag 化と既存 marker cleanup を追加
12. Phase 0 (canonical JSON 確定) を追加し、Phase 1/2 の依存関係を明確化
13. CI スナップショットテストで local JSON と server 出力の一致検証を追加
