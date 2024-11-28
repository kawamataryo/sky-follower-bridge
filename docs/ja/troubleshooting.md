# トラブルシューティングガイド

## 認証エラー

### ログインの問題

**エラーメッセージ:**  
<span class="error-message">Error: Invalid identifier or password</span>

**チェックリスト:**
1. ユーザー名とパスワードの入力
   - 余分なスペースがないか確認
   - コピー＆ペーストする場合、余分な文字が含まれていないか確認

2. ユーザー名の形式
   - 正しい形式: `your-username.bsky.social`
   - よくある間違い: `your-username`（.bsky.socialが欠落）

3. パスワード情報
   - 通常のパスワードではなく、[AppPassword](https://bsky.app/settings/app-passwords)を使用することを強くお勧めします
   - アプリパスワードの形式: `xxxx-xxxx-xxxx-xxxx`（19文字）

::: tip 役立つヒント
AppPasswordを設定の「パスワード名」と混同しないでください。
新しいAppPasswordを作成する方法:
1. [AppPasswordセクションに移動](https://bsky.app/settings/app-passwords)
2. 「AppPasswordを追加」をクリック
3. 「AppPasswordを作成」をクリック
4. 生成された19文字のパスワードをコピー
:::

---

### 二要素認証の問題

**エラーメッセージ:**  
<span class="error-message">Error: Two-factor authentication required</span>

**解決策:**
1. 認証コードが記載されたメールを確認
2. 2FA入力フィールドにコードを入力
3. 再度ログインを試みる

::: warning
Firefox版は2FAに対応していません。Firefox版では2FAを無効にしてください。
:::

## レート制限エラー

**エラーメッセージ:**  
<span class="error-message">Error: Rate limit error</span>

**解決策:**
1. Bluesky APIには以下の制限があります（[公式ドキュメント](https://docs.bsky.app/docs/advanced-guides/rate-limits)）:
   - 1時間あたり最大5,000ポイント（約1,666の新しいアクション）
   - 1日あたり最大35,000ポイント
   - アクションごとのポイント:
     - 作成: 3ポイント
     - 更新: 2ポイント
     - 削除: 1ポイント
2. 制限に達した場合、制限がリセットされるまで待つ
3. 「Restart」ボタンをクリックして再試行

::: warning
Firefoxで公開されているバージョンは、レート制限エラーに頻繁に遭遇します。エラーが発生した場合は、Chromeで試してください。
:::

::: tip
通常の使用ではほとんどのユーザーがこれらの制限に達することはありません。ただし、多くのユーザーを短時間でフォローしたり、多くの投稿にいいねをしたりする場合は注意してください。
:::

## ページエラー

### 無効なページ

**エラーメッセージ:**  
<span class="error-message">Error: Invalid page. please open the 𝕏 following or blocking or list page.</span>

**解決策:**
この拡張機能は以下の𝕏（Twitter）ページでのみ使用してください：
- フォロー中のページ ([x.com/following](https://x.com/following))
- ブロック中のページ ([x.com/settings/blocked/all](https://x.com/settings/blocked/all))
- リストメンバーのページ (`x.com/i/lists/<list_id>/members`)

または、拡張機能ページで拡張機能の権限を確認してください。
サイトの権限は以下のように設定されている必要があります：

<img src="/images/site_permissions.png" alt="サイトの権限" width="500"/>

## スキャンの問題

### View Detected Users ボタンが機能しない

何らかの理由で、View Detected Users ボタンが機能しない場合があります。

**解決策:**
1. 拡張機能のアイコンを右クリックし、「オプション」を選択
2. 結果ページが表示されます

<img src="/images/click-option.png" alt="オプションをクリック" width="500"/>

### スキャンが途中で停止

スキャンがページの下部に到達する前に停止する

**解決策:**
1. 「Resume」をクリックして続行
2. スキャンはページの下部に到達すると自動的に停止します
3. いつでも「Stop and show results」をクリックできます

### ユーザーが見つからない

スキャン後にBlueskyユーザーが検出されない

**解決策:**
1. 正しくログインしていることを確認
2. 再度スキャンを試みる - 一部のユーザーは最初のパスで検出されない場合があります
3. 𝕏ユーザーがプロフィールにBlueskyアカウントをリンクしているか確認

## その他の問題

予期しないエラーが発生した場合：

1. ページをリロード
2. 操作を再試行
3. 問題が解決しない場合は、以下のいずれかを行う：
   - [問題を作成](https://github.com/kawamataryo/sky-follower-bridge/issues)：
     - 正確なエラーメッセージ
     - 実行しようとした操作
     - ブラウザの種類とバージョン
     - 関連するスクリーンショット
   - または、Blueskyで[@kawamataryo.bsky.social](https://bsky.app/profile/kawamataryo.bsky.social)に言及 
