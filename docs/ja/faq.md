---
title: 'FAQ: sky'
---

# FAQ

よくある質問をまとめました。もし、他にも質問があれば [@sky-follower-bridge.dev](https://bsky.app/profile/sky-follower-bridge.dev) までお気軽にご連絡ください。

## なぜ作ったの？

[開発者](https://bsky.app/profile/kawamataryo.bsky.social)がBlueskyに移住した際に、Xの知り合いをBlueskyで検索する作業が大変だったので、なんとか自動化したいと思い、Sky Follower Bridgeを作りました。

## どのような基準で類似ユーザーを検出しているの？

Sky Follower Bridgeは、以下の基準のいずれかを満たすユーザーを検出しています。

- **ハンドル名が同じ**
- **表示名が同じ**
- **XのbioにBlueskyのハンドル名またはプロフィールリンクが含まれている**

詳細な基準は[こちらのコード](https://github.com/kawamataryo/sky-follower-bridge/blob/main/src/lib/bskyHelpers.ts)をご覧ください。

::: tip
もしSky Follower Bridgeで確実に自分を検出させたい場合は、Xの表示名とBlueskyの表示名を同一にした上で、XのbioにBlueskyのプロフィールリンクを含めることをオススメします。
:::

## モバイル端末では使えないの？

PC向けのブラウザ拡張機能なので、モバイル端末では使えません。将来的にモバイル端末でも使えるweb版を作成しようと考えています。

## プロジェクトをサポートするためには？

以下のサポートリンクからサポートしていただけると嬉しいです。開発のモチベーションにつながります。

- [ko-fi](https://ko-fi.com/kawamataryo)

## skyfollowerbridge.com との関係は？

<a href="skyfollowerbridge.com" target="_blank" rel="noopener noreferrer nofollow">skyfollowerbridge.com</a> は、Sky Follower Bridgeと何の関係もありません。skyfollowerbridge.comは以前、Sky Follower Bridgeの公式サイトを偽り、有害な広告を配信していました。ご注意ください。この件の詳細は、以下のBlueskyのスレッドに記載されています。

<SpamSiteEmbed />
