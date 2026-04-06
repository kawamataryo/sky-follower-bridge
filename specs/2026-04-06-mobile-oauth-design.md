# Mobile OAuth Implementation Design

## Background

現在のモバイルアプリではApp Passwordによるログインのみサポートしている。OAuthを実装することで、ユーザーがApp Passwordを手動生成する手間を省き、よりスムーズなログイン体験を提供したい。

## 問題: AT Protocol OAuth の DPoP 要件

AT ProtocolのOAuthは**DPoP (Demonstration of Proof-of-Possession)** が必須。これは通常のOAuth 2.0に加え、以下を要求する:

1. **DPoP キーペア生成** — OAuth開始前にEC鍵ペア（ES256/P-256）を生成
2. **DPoP Proof JWT** — トークン交換時にDPoP proof（秘密鍵で署名したJWT）をヘッダーに含める
3. **全APIリクエストにDPoP proof** — アクセストークンに加え、リクエスト毎にDPoP proofを添付
4. **同一キーペアの継続使用** — フロー全体で同じDPoP秘密鍵を使い続ける

### なぜモバイルで困難か

- `expo-auth-session` の `exchangeCodeAsync` はDPoPをサポートしていない
- React Native (Hermes) は `crypto.subtle` を**サポートしていない**
- `@atproto/oauth-client` は `crypto.subtle` に依存しているため、そのままでは使えない
- ブラウザ拡張版は `@atproto/oauth-client` + Web Crypto API で動作しているが、同じアプローチはRNでは不可

## 現在の実装状況

### 動作しているもの
- **App Password ログイン** — `AtpAgent.login()` で正常動作
- **OAuth UI** — auth.tsx にOAuthボタン + TypeaheadDropdown（ハンドル補完）を実装済み
- **サーバー側 client-metadata.json** — モバイル用redirect_uri（`sky-follower-bridge://oauth-callback`）を登録済み
- **bskyOAuth.ts** — OAuth開始〜認可コード取得までは動作（`expo-auth-session`）

### 失敗するポイント
- トークン交換時に `DPoP proof required` エラー（サーバー: Bluesky認可サーバー）

## 提案アーキテクチャ: サーバーサイドOAuthプロキシ

### 概要

サーバー（Cloudflare Worker）がDPoP鍵管理とトークン交換を代行する。モバイルアプリは認可コードの取得のみ担当。

```
Mobile App                    Server (CF Worker)                  Bluesky Auth Server
    |                              |                                    |
    |-- POST /oauth/mobile/start ->|                                    |
    |   { handle }                 |-- resolve auth server ------------>|
    |                              |-- generate DPoP key pair           |
    |                              |-- generate PKCE verifier           |
    |                              |-- store state in KV                |
    |<-- { auth_url, state_id } ---|                                    |
    |                              |                                    |
    |== open browser to auth_url ==================================>   |
    |                              |                                    |
    |                              |<-- GET /oauth/mobile/callback -----|
    |                              |    { code, state }                 |
    |                              |-- retrieve state from KV           |
    |                              |-- exchange code + DPoP proof ----->|
    |                              |<-- { access_token, refresh_token } |
    |                              |-- store session in KV              |
    |<== redirect to app =========-|    (tokens + DPoP key)             |
    |   sky-follower-bridge://     |                                    |
    |   ?session_id=xxx            |                                    |
    |                              |                                    |
    |-- POST /oauth/mobile/token ->|                                    |
    |   { session_id }             |-- retrieve session from KV         |
    |<-- { did, handle,       ---- |                                    |
    |      access_token,           |                                    |
    |      dpop_private_key_jwk }  |                                    |
    |                              |                                    |
    |== API calls with DPoP ================================================>
```

### 新規サーバーエンドポイント

#### `POST /oauth/mobile/start`
- **入力**: `{ handle: string }`
- **処理**:
  1. ハンドルからPDSを解決 → 認可サーバーを特定
  2. DPoP EC鍵ペア（ES256/P-256）を生成
  3. PKCEコードベリファイア/チャレンジを生成
  4. ランダムな `state` を生成
  5. KVに保存: `{ dpop_key, pkce_verifier, auth_server, state }` (TTL: 10分)
  6. 認可URLを構築
- **出力**: `{ auth_url: string, state_id: string }`

#### `GET /oauth/mobile/callback`
- **入力**: クエリパラメータ `code`, `state`, `iss`
- **処理**:
  1. `state` でKVからセッション状態を取得
  2. DPoP proofを生成（保存された秘密鍵で署名）
  3. トークンエンドポイントに `code` + DPoP proof + PKCEベリファイアを送信
  4. セッション情報をKVに保存: `{ tokens, dpop_key }` (TTL: 1時間)
  5. `session_id` を生成
- **出力**: `sky-follower-bridge://oauth-callback?session_id=xxx` へリダイレクト

#### `POST /oauth/mobile/token`
- **入力**: `{ session_id: string }`
- **処理**:
  1. KVから `session_id` でセッションを取得
  2. DPoP秘密鍵をJWK形式でエクスポート
  3. セッション情報を返却（KVから削除 = ワンタイム）
- **出力**: `{ did, handle, access_token, refresh_token, dpop_private_key_jwk }`

### サーバー側の必要な変更

#### インフラ
- **KV Namespace 有効化** — `wrangler.toml` の KV設定をアンコメント
- 用途: OAuth状態管理（短期TTL）、セッション一時保存

#### 依存パッケージ追加
```json
{
  "@atproto/oauth-client": "^0.6.0",
  "@atproto/jwk-webcrypto": "^0.2.0",
  "jose": "^5.x"
}
```
- `jose`: DPoP proof JWT の生成（Cloudflare Workers の crypto.subtle と互換）
- または Cloudflare Workers の Web Crypto API を直接使用

#### Crypto 対応
- Cloudflare Workers は `crypto.subtle` をネイティブサポート
- DPoP鍵生成: `crypto.subtle.generateKey("ECDSA", P-256)`
- DPoP proof署名: `crypto.subtle.sign("ECDSA", privateKey, data)`

### モバイル側の必要な変更

#### DPoP Proof 生成（APIリクエスト時）
モバイルアプリは `dpop_private_key_jwk` を受け取った後、各APIリクエストにDPoP proofを添付する必要がある。

**課題**: Hermes は `crypto.subtle` をサポートしていない

**解決策の選択肢**:

| 選択肢 | Pros | Cons |
|--------|------|------|
| A. `react-native-quick-crypto` | ネイティブ実装、高速 | ネイティブモジュール依存、Expo Go不可 |
| B. `@noble/curves` (pure JS) | 依存なし、どこでも動く | やや遅い（許容範囲） |
| C. サーバープロキシ全API | モバイル側変更なし | レイテンシ増、サーバー負荷 |

**推奨: B (`@noble/curves`)** 
- Pure JSでECDSA P-256署名が可能
- expo-dev-client不要
- パフォーマンスは十分（DPoP proofは軽量なJWT）

#### カスタム AtpAgent ラッパー
```typescript
// DPoP proof を自動付与する AtpAgent ラッパー
class DpopAtpAgent extends AtpAgent {
  private dpopKey: { privateKey: Uint8Array; publicKey: JWK };
  
  async call(method, params, opts) {
    const proof = await generateDpopProof(this.dpopKey, method, url);
    return super.call(method, params, {
      ...opts,
      headers: { ...opts?.headers, DPoP: proof },
    });
  }
}
```

#### セッション保存
- `dpop_private_key_jwk` を `expo-secure-store` に保存
- トークンリフレッシュ時もDPoP proofが必要 → リフレッシュもサーバー経由 or モバイルで署名

### セキュリティ考慮事項

1. **DPoP秘密鍵の転送** — サーバーからモバイルへの秘密鍵転送はHTTPS経由 + ワンタイム取得
2. **セッション一時保存** — KVに保存するセッションは短いTTL（1時間）でワンタイム取得後削除
3. **state パラメータ** — CSRF防止のためランダム生成、KVで検証
4. **PKCE** — 認可コード横取り防止

## 実装フェーズ

### Phase 1: サーバー側OAuth処理
- KV Namespace有効化
- `/oauth/mobile/start` エンドポイント実装
- `/oauth/mobile/callback` エンドポイント実装（DPoP proof生成 + トークン交換）
- `/oauth/mobile/token` エンドポイント実装

### Phase 2: モバイル側DPoP対応
- `@noble/curves` でECDSA署名実装
- DPoP proof生成ユーティリティ
- `DpopAtpAgent` ラッパー作成
- `expo-secure-store` にDPoP鍵保存

### Phase 3: OAuth UIフロー統合
- auth.tsx のOAuthボタンを新フローに接続
- セッション復元ロジック（DPoP鍵 + トークン）
- トークンリフレッシュ対応

## 参考

- [AT Protocol OAuth Spec](https://atproto.com/specs/oauth)
- [DPoP RFC 9449](https://datatracker.ietf.org/doc/rfc9449/)
- ブラウザ拡張の実装: `src/lib/bskyOAuthClient.ts` (IndexedDB + `@atproto/oauth-client`)
- `@noble/curves`: https://github.com/paulmillr/noble-curves
