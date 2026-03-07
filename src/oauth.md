実機テスト手順（Chrome想定）
このブランチに移動

git switch feat/bluesky-oauth
依存を入れる

npm install
OAuth用の環境変数を設定

ルートに .env を作成し、最低限以下を設定
PLASMO_PUBLIC_BSKY_OAUTH_CLIENT_ID=https://<your-domain>/oauth/client-metadata.json
PLASMO_PUBLIC_BSKY_OAUTH_REDIRECT_URI=https://<your-domain>/oauth/callback
任意:
PLASMO_PUBLIC_BSKY_OAUTH_SCOPE=atproto transition:generic
PLASMO_PUBLIC_BSKY_OAUTH_HANDLE_RESOLVER=https://bsky.social
OAuth metadata/callback配信用サーバーを設定（Cloudflare Worker側）

server/src/index.tsx で追加したエンドポイントを使う前提
Worker側の環境変数を設定
OAUTH_REDIRECT_URI=https://<your-domain>/oauth/callback
OAUTH_EXTENSION_REDIRECT_URI=https://<extension-id>.chromiumapp.org/oauth-success
Firefox も使う場合は任意で以下も設定
OAUTH_EXTENSION_REDIRECT_URIS=https://<extension-id>.chromiumapp.org/oauth-success,https://<firefox-hash>.extensions.allizom.org/oauth-success
<extension-id> は拡張の固定IDを使う（開発中に変わるとredirectが不一致になる）
開発用と公開用で拡張IDが違う場合: OAUTH_EXTENSION_REDIRECT_URIS に両方の redirect URL をカンマ区切りで並べれば、どちらの環境でも OAuth が通る（拡張は実行時に getRedirectURL で自分の ID の URL を送るため）
Firefox 側の redirect URL は browser.identity.getRedirectURL("oauth-success") の値に合わせる
拡張を起動

npm run dev
chrome://extensions で開発中拡張を読み込み
ログイン動作確認

拡張Popupを開く
identifier（handle）入力 → Sign in with Bluesky
認可画面遷移 → 許可 → Popupに戻ってプロフィール表示されることを確認
機能回帰テスト

X/Instagram/Threads/TikTok/Facebookページから検索開始
検出後に以下を確認
Follow/Unfollow
Block/Unblock
List作成 + 追加
Popup閉じて再度開き、セッションが復元されることを確認
Logoutして未認証状態に戻ることを確認
つまずきやすいポイント
OAuth is not configured が出る
.env の PLASMO_PUBLIC_BSKY_OAUTH_CLIENT_ID / ...REDIRECT_URI を再確認
認可後に戻れない
OAUTH_EXTENSION_REDIRECT_URI の拡張ID不一致が多いです
Firefox も対象なら OAUTH_EXTENSION_REDIRECT_URIS に Firefox の redirect URL が入っているか確認
client_id / redirect_uri 不整合
client-metadata.json の client_id と配信URLが完全一致しているか確認
必要なら次に、上記手順をそのまま docs/ に追加するところまで進めます。
