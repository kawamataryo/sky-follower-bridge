# Lessons

## 2026-04-10: spec の前提を検証するタイミング

**状況:** `specs/2026-04-10-mobile-oauth-expo-design.md` の決定事項 #7 「`AtpAgent` を維持して `fetch: session.fetchHandler` を注入」を計画に落とし込んだが、Task 8 で `@atproto/oauth-client-expo@0.0.10` の実型定義を確認したところ、以下が判明:

1. `OAuthSession.server` は `OAuthServerAgent` で、`.issuer` 直接取得はできない (`serverMetadata.issuer` が正しい)
2. `OAuthSession.fetchHandler` は `(pathname: string, init?) => Promise<Response>` — 標準 `fetch(url, init)` とは別シグネチャ
3. `AtpAgent` のコンストラクタは `AtpAgentOptions | CredentialSession` のみ受理し OAuthSession を直接注入できない
4. `@atproto/api` 自身が `AtpAgent is deprecated, use Agent with CredentialSession instead` と JSDoc 警告
5. 実際にブラウザ拡張版 (`src/lib/bskyClient.ts:120`) も `new Agent(oauthSession)` (基底 `Agent`) を使用

**何が問題だったか:**
spec を書いた時点で `OAuthSession` の実 API を確認せず「きっと `session.fetchHandler` が標準 fetch だろう」と推測で書いた。推測をそのまま計画に落とし込み、TDD テストまで書いてから食い違いが発覚するのはコスト高。

**ルール:**
外部パッケージの API に依存する設計判断 (型・プロパティ名・コンストラクタシグネチャ) は、**spec 段階で一度でいいから node_modules の `.d.ts` を読むか、パッケージのソースを開いて実在を確認する**。「多分こうだろう」で spec に書かない。特に `0.0.x` の若いパッケージは推測が当たらない前提で臨む。

**How to apply:**
次回パッケージ統合 spec を書くときは、「確定した設計判断」セクションに `✅ 型定義確認済み` のようなチェックマークを付けるか、もしくは spec 本体で該当プロパティ名を `.d.ts` から引用する。

## 2026-04-10: gitignored ディレクトリへの spec 記述に注意

**状況:** spec が `mobile/ios/SkyFollowerBridge/Info.plist` の手動編集をタスクとして指示していたが、`mobile/.gitignore` に `/ios` があり `mobile/ios/` はそもそも tracked されていない。`expo prebuild` で毎回再生成される扱い。

**ルール:**
タスク対象ファイルを spec に書く前に `git ls-files <path>` でトラック状況を確認する。gitignored ファイルへの変更は commit できず、spec のタスク構造が崩れる。tracked されていないなら、変更はソース (この場合 `mobile/app.json` の `scheme`) 側に寄せる。

**How to apply:**
- `mobile/ios/**`, `mobile/android/**`, `build/**`, `node_modules/**` など generated/ignored なパスに touch するタスクは spec 段階で赤信号
- generated ファイルの状態を変えたいなら、生成元 (config, template) を変えるタスクに置き換える
