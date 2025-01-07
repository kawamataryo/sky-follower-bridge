# FAQ

关于Sky Follower Bridge的常见问题。如果您有其他问题，请随时联系[@sky-follower-bridge.dev](https://bsky.app/profile/sky-follower-bridge.dev)。

## 为什么要创建它？

当[开发者](https://bsky.app/profile/kawamataryo.bsky.social)迁移到Bluesky时，在Bluesky上查找X上的联系人是一项繁琐的任务。为了自动化这个过程，创建了Sky Follower Bridge。

## 使用什么标准来检测相似用户？

Sky Follower Bridge检测满足以下任一标准的用户：

- **相同的用户名**
- **相同的显示名称**
- **X个人简介中包含Bluesky用户名或个人资料链接**

有关详细标准，请查看[此代码](https://github.com/kawamataryo/sky-follower-bridge/blob/main/src/lib/bskyHelpers.ts)。

::: tip
如果您希望Sky Follower Bridge可靠地检测到您，我们建议在X和Bluesky上使用相同的显示名称，并在您的X个人简介中包含您的Bluesky个人资料链接。
:::

## 无法在移动设备上使用吗？

由于它是PC浏览器扩展，因此无法在移动设备上使用。我们正在考虑创建一个可以在移动设备上使用的网页版。

## 如何支持该项目？

我们感谢您通过以下链接提供支持。这有助于激励开发。

- [ko-fi](https://ko-fi.com/kawamataryo)

## 与skyfollowerbridge.com的关系是什么？

<a href="skyfollowerbridge.com" target="_blank" rel="noopener noreferrer nofollow">skyfollowerbridge.com</a>与Sky Follower Bridge没有任何关系。skyfollowerbridge.com之前冒充Sky Follower Bridge的官方网站并分发有害广告。请谨慎。有关此事件的详细信息，请参见下面的Bluesky帖子。

<SpamSiteEmbed /> 
