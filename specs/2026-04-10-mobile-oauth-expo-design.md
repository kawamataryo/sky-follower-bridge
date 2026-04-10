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

ブレインストーミングで決定した5つの方針:

| # | 論点 | 決定 | 理由 |
|---|---|---|---|
| 1 | client-metadata の構成 | **A. 別エンドポイントを新設** (`/oauth/mobile/client-metadata.json`) | ブラウザ拡張版 (`application_type: web`) を一切壊さない。OAuth 仕様上 1 つの client metadata で `web` と `native` を共存できないため必須 |
| 2 | redirect URI スキーム | **a. `dev.sky-follower-bridge.mobile`** | iOS bundle id と一致させる。Info.plist 登録が一貫し、可読性が高い |
| 3 | App Password の扱い | **C. OAuth 既定 + 折りたたみで App Password 残置** | パッケージが `0.0.10` という不安要素のヘッジ。カスタム PDS など OAuth 不調時のフォールバック。既存ユーザーのセッションも維持できる |
| 4 | OAuth セッション保存 | **A. パッケージのデフォルト (MMKV)** | Bluesky 公式アプリ相当のセキュリティモデル。iOS Data Protection が自動暗号化。パッケージ更新追従性を確保 |
| 5 | セッション復元 | 既存型 `SessionData` の `{ authMethod: "oauth"; sub }` をそのまま流用 | 既に判別共用体で OAuth セッション本体を外部ストアに任せる設計になっている。`client.restore(sub, 'auto')` 1 行で済む |

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

1. **DPoP はネイティブモジュール任せ** — Hermes の `crypto.subtle` 不在問題は `@atproto/oauth-client-expo` の Swift/Kotlin ネイティブ実装が解決する。サーバー側プロキシは不要。
2. **二つの認証方式は完全独立** — App Password と OAuth はそれぞれ独自のストレージ層を持ち、互いに干渉しない。`SessionData` 判別共用体が両者を統合する唯一の接点。
3. **secure-store は "目印" のみ** — OAuth セッションの本体はパッケージ内 MMKV にあり、secure-store には次回起動時に復元するための `sub` (DID) だけを置く。既存の型設計を流用。
4. **サーバー側は最小変更** — 新しいエンドポイント 1 つ追加するだけ。既存のブラウザ拡張用エンドポイントには一切触れない。
5. **トークンリフレッシュは透明** — `client.restore(sub, 'auto')` がパッケージ内で自動的にリフレッシュを処理する。アプリ層は意識しない。

### スコープ外 (今回やらないこと)

- ブラウザ拡張版 OAuth の変更 (一切触らない)
- サーバーの既存 `/oauth/callback` `/oauth/client-metadata.json` の変更
- KV Namespace 有効化 (旧設計で必要だったが不要になった)
- 自前 DPoP proof 実装 (不要になった)
- App Password ログイン廃止 (折りたたみ UI で残す)

## 変更ファイル一覧

### 新規作成 (3 ファイル)

| ファイル | 役割 |
|---|---|
| `mobile/lib/bskyOAuthClient.ts` | `ExpoOAuthClient` のシングルトンを生成・公開。client metadata は `require()` で同梱 JSON を読み込む。`signIn(handle)` `restore(sub)` `signOut(sub)` の薄いラッパー API を提供 |
| `mobile/assets/oauth-client-metadata.json` | パッケージ README に従った native 用クライアントメタデータの**ローカルコピー**。`client_id` はサーバー URL を指す |
| `server/src/lib/mobileOAuthClientMetadata.ts` | サーバー側で native 用 client metadata を生成するヘルパー |

> **補足:** モバイル側で `assets/*.json` を `require` する設計にする理由は、README が「サーバー上の JSON とローカルの JSON を完全一致させる」ことを要求するため。CI でサーバー版とローカル版の一致を検証するテストを追加する余地あり (任意)。

### 修正 (6 ファイル)

| ファイル | 変更内容 |
|---|---|
| `mobile/package.json` | `@atproto/oauth-client-expo` を依存追加。`base-64` `expo-auth-session` は OAuth では不要になるが、他で使われていなければ削除 (要 grep 確認) |
| `mobile/app.json` | `scheme` を `"sky-follower-bridge"` から `"dev.sky-follower-bridge.mobile"` に変更 |
| `mobile/lib/bskyAgent.ts` | `restoreAgent()` の OAuth 分岐を実装。`expoOAuthClient.restore(sessionData.sub, 'auto')` を呼び、返ってきた `OAuthSession` から `Agent` を構築 |
| `mobile/lib/bskyOAuth.ts` | **既存ファイルを全面書き換え**。`expo-auth-session` を捨て、`bskyOAuthClient` を呼び出す薄いユースケース層に。`loginWithOAuth(handle) → { agent, sub }` のシグネチャは維持 (auth.tsx の呼び出し側を変更不要に保つため) |
| `mobile/app/auth.tsx` | App Password フォームを「高度なオプション」として折りたたみ可能に。OAuth ボタンを上位の主要 CTA に昇格 |
| `server/src/index.tsx` | `/oauth/mobile/client-metadata.json` ハンドラを追加 |

### ネイティブビルド設定の手動更新

`mobile/ios` `mobile/android` がコミット済みのため、`expo prebuild` で上書きせず手動反映する。

| ファイル | 変更内容 |
|---|---|
| `mobile/ios/SkyFollowerBridge/Info.plist` | `CFBundleURLTypes` の URL Scheme を `dev.sky-follower-bridge.mobile` に更新 |
| `mobile/ios/Podfile` (および `Podfile.lock`) | `expo install` 後に `pod install` で `ExpoAtprotoOAuthClient` Pod が autolink |
| `mobile/android/app/src/main/AndroidManifest.xml` | `intent-filter` の `android:scheme` を `dev.sky-follower-bridge.mobile` に更新 |

### 削除候補 (要影響確認)

- `mobile/lib/bskyOAuth.ts` の `expo-auth-session` インポート
- `mobile/lib/bskyOAuth.ts` の `base64Decode` ベースの ID トークン手動デコード
- `mobile/package.json` の `expo-auth-session`, `base-64` (OAuth 以外で使われていなければ)

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

**ポイント:** Step 12 で `OAuthSession` を受け取った後、`@atproto/api` の `Agent` (※`AtpAgent` ではなく `Agent`) コンストラクタは `OAuthSession` を直接受け取れる仕様になっている (`@atproto/api ^0.13` 以降)。現在の `mobile/package.json` は `@atproto/api ^0.19.6` なので問題なし。

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
 │                  │   client.restore(sub, 'auto')     │
 │                  ├────────────────▶                  │
 │                  │                  │ 5. session 読み│
 │                  │                  ├──────────────▶ │
 │                  │                  │◀───────────────│
 │                  │                  │ 6. expired時は │
 │                  │                  │  自動リフレッシュ│
 │                  │                  │  (DPoP付き)    │
 │                  │                  │ 7. 新session保存│
 │                  │                  ├──────────────▶ │
 │                  │ 8. OAuthSession  │                │
 │                  │◀────────────────│                 │
 │                  │ 9. new Agent(session)             │
 │ 10. agent        │                                   │
 │◀─────────────────│                                   │
```

リフレッシュ失敗 (refresh_token 期限切れ等) の場合、`client.restore` は throw する → catch して `clearSession()` + `/auth` へリダイレクト。

### 3. API リクエスト時の DPoP 付与

これは **一切意識しなくてよい**。`Agent` インスタンスは内部で `OAuthSession` の `Fetch` を使い、その `Fetch` は `OAuthClient` 内部で DPoP proof を毎リクエスト自動付与する。`fetch` インターセプタも自前ラッパー (`DpopAtpAgent` 等) も不要。DPoP nonce のローテーションもパッケージ内で自動処理される。

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

### 構成変更後の階層

```
┌─────────────────────────────────────────┐
│  Sky Follower Bridge                    │
│  Sign in to Bluesky                     │
│                                          │
│  ┌─────────────────────────────────┐   │
│  │  Bluesky Handle or PDS          │   │
│  │  [alice.bsky.social        ]    │   │
│  └─────────────────────────────────┘   │
│                                          │
│  ┌─────────────────────────────────┐   │
│  │  ✦  Sign in with Bluesky        │   │  ← 主要 CTA (OAuth)
│  └─────────────────────────────────┘   │
│                                          │
│  ▸ Advanced: Sign in with App Password │  ← 折りたたみトグル
│  └─ (展開時) ─────────────────────┐   │
│     │ Identifier                    │   │
│     │ Password                      │   │
│     │ 2FA code (optional)           │   │
│     │ Service URL (optional)        │   │
│     │ [Sign in with App Password]   │   │
│     └───────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### 実装の要点

- 主要 CTA は OAuth ボタン。ハンドル入力欄は OAuth と App Password で**共有** (`identifier` state を 1 つ持つ)
- 折りたたみ UI は `useState<boolean>(false)` + 単純な条件レンダリング。**アニメーションは入れない** (過去のコミット `f3fe539` で `Animated.View` が TextInput フォーカスを奪う問題があったため、シンプルに保つ)
- 既存の `TypeaheadDropdown` (ハンドル補完) は OAuth/App Password 両方の入力欄で共有
- フォームバリデーション: OAuth は handle のみ必須、App Password は identifier + password 必須

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

| ケース | 検出方法 | 挙動 |
|---|---|---|
| `refresh_token` 期限切れ | `client.restore(sub, 'auto')` が throw | `clearSession()` → `/auth` へリダイレクト (再ログイン) |
| MMKV からセッションが消えた | 同上 | 同上 |
| ネットワークなし起動 | 同上 | リフレッシュ不要なら成功、必要ならエラー → 既存の Agent を返さず `null` を返し `/auth` へ |
| パッケージ内部エラー | 同上 | 同上 |

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

### Phase 1: サーバー側 (独立、先行可能)

- `/oauth/mobile/client-metadata.json` ハンドラ追加
- 本番デプロイ → `curl https://server.sky-follower-bridge.dev/oauth/mobile/client-metadata.json` で JSON 検証
- **完了基準:** cURL でメタデータが返る、`application_type: "native"` が含まれる

### Phase 2: モバイル基盤 (依存なし)

- `npm install @atproto/oauth-client-expo`
- `mobile/assets/oauth-client-metadata.json` 作成 (Phase 1 のサーバー版と完全一致)
- `mobile/lib/bskyOAuthClient.ts` 作成 (シングルトン)
- `mobile/app.json` の `scheme` 更新
- `Info.plist` `AndroidManifest.xml` 手動更新
- `pod install` → `npm run ios` で起動確認
- **完了基準:** アプリが起動する (OAuth 未統合でも既存機能が動く)

### Phase 3: OAuth 統合

- `bskyOAuth.ts` 全面書き換え (`loginWithOAuth(handle) → {agent, sub}` 維持)
- `bskyAgent.ts` の `restoreAgent` OAuth 分岐実装
- `OAuthLoginError` 正規化レイヤ
- **完了基準:** 実機で sign in → results 画面遷移 → アプリ再起動でセッション復元

### Phase 4: UI 整理 + テスト

- `auth.tsx` の折りたたみ UI 実装
- ユニットテスト追加
- カスタム PDS 検証
- リフレッシュ期限切れ検証
- **完了基準:** 全ユニットテスト pass、実機検証チェックリスト全項目クリア

## リスクと撤退計画

| リスク | 影響度 | 確率 | 対策 |
|---|---|---|---|
| `@atproto/oauth-client-expo@0.0.10` の API 破壊的変更 | 中 | 中 | バージョンを `0.0.10` 完全固定 (`^` ではなく) でロック。アップデートは別タスクで意図的に実施 |
| ネイティブモジュールが iOS/Android のどちらかでビルド失敗 | 高 | 低 | Phase 2 完了基準に「両プラットフォームで起動」を含め、早期発見 |
| カスタム PDS で動かない | 中 | 低 | App Password 経路を残しているので即座にフォールバック可 |
| トークンリフレッシュが想定通り動かない | 高 | 低 | Phase 4 で MMKV を直接書き換えて検証 |
| `react-native-mmkv` が既存依存と競合 (RN 0.81.5) | 中 | 低 | `npm install` 時の peerDependency 警告で検出 |
| Bluesky 認可サーバー側が `application_type: native` を未サポート | 致命的 | 極低 | サーバーは公式仕様準拠なので対応済みのはず。Phase 1 後に手動確認 |

### 撤退計画

OAuth 実装が動かないと判明した場合、**App Password 経路を削除していないので、`auth.tsx` から OAuth ボタンを単純に非表示にするだけで完全撤退できる**。サーバーの `/oauth/mobile/client-metadata.json` も残しておけばロールフォワードも容易。

## 見送り事項 (将来検討)

- アプリ内ブラウザと外部ブラウザの選択肢提示 — まずはパッケージのデフォルト挙動 (`openAuthSessionAsync`) に従う
- マルチアカウント対応 — `OAuthSession` は `sub` ベースで複数保持可能だが、UI 設計が別タスク
- iCloud バックアップから MMKV 除外設定 — iOS の Data Protection 既定で十分なリスクモデルと判断

## 参考

- [`@atproto/oauth-client-expo` on npm](https://www.npmjs.com/package/@atproto/oauth-client-expo)
- [bluesky-social/atproto - oauth-client-expo](https://github.com/bluesky-social/atproto/tree/main/packages/oauth/oauth-client-expo)
- [AT Protocol OAuth Spec](https://atproto.com/specs/oauth)
- 旧設計: `specs/2026-04-06-mobile-oauth-design.md`
- ブラウザ拡張の OAuth 実装: `src/lib/bskyOAuthClient.ts`
