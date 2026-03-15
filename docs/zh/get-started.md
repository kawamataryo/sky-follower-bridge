# 入门

Sky Follower Bridge 帮助您在 Bluesky 上找到并关注您的 𝕏 (Twitter) 连接。

<iframe width="100%" height="315" src="https://www.youtube.com/embed/CnjjfSxm0G0?si=N2OFp15PPiZZezEN" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>


## 安装

Sky Follower Bridge 可在以下平台获取：

<ul class="install-list">
  <li>
    <img src="/images/icon-chrome.svg" width="20" height="20">
    <a href="https://chrome.google.com/webstore/detail/sky-follower-bridge/behhbpbpmailcnfbjagknjngnfdojpko" target="_blank" rel="noopener noreferrer" class="gtm-link-to-store">Chrome 网上应用店</a>（推荐）
  </li>
  <li>
    <img src="/images/icon-firefox.svg" width="20" height="20">
    <a href="https://addons.mozilla.org/en-US/firefox/addon/sky-follower-bridge/" target="_blank" rel="noopener noreferrer" class="gtm-link-to-store">Firefox 附加组件</a>
  </li>
  <li>
    <img src="/images/icon-edge.svg" width="20" height="20">
    <a href="https://microsoftedge.microsoft.com/addons/detail/sky-follower-bridge/dpeolmdblhfolkhlhbhlofkkpaojnnbb" target="_blank" rel="noopener noreferrer" class="gtm-link-to-store">Microsoft Edge 附加组件</a>
  </li>
  <li>
    <img src="/images/icon-safari.svg" width="20" height="20">
    <a href="https://apps.apple.com/us/app/sky-follower-bridge/id6738878242?mt=12" target="_blank" rel="noopener noreferrer" class="gtm-link-to-store">Safari 网页扩展</a> <span>（感谢 <a href="https://bsky.app/profile/knotbin.xyz">@knotbin.xyz</a> 的贡献！）</span>
  </li>
</ul>

::: tip
我们推荐使用 Chrome 网上应用店版本，因为它���是最新的。其他商店版本可能会延迟更新。
:::

::: warning
Sky Follower Bridge 仅适用于桌面浏览器。移动浏览器不支持。
:::

## 使用方法

### 1. 访问 𝕏 (Twitter)

访问 X 上的以下页面之一：
- 您的关注页面: [x.com/following](https://x.com/following)
- 您的已屏蔽用户页面: [x.com/settings/blocked/all](https://x.com/settings/blocked/all)
- 公共列表的成员页面: `x.com/i/lists/<list_id>/members`

![following-page](/images/following-page.png)

### 2. 启动 Sky Follower Bridge

按 `Alt + B` 或点击浏览器工具栏中的扩展图标。

::: tip
对于 Firefox 用户，按 `Alt + B` 可能不起作用。在这种情况下，请点击浏览器工具栏中的扩展图标。

https://support.mozilla.org/en-US/kb/extensions-button
:::

![Open Extension](/images/open-extension.png)

### 3. 登录 Bluesky

- **Bluesky（OAuth）**（推荐）：输入您的句柄并点击「Sign in with Bluesky」进行 OAuth 登录。
- **App Password**：切换到「App Password」标签页，输入句柄（或电子邮件）、[App password](https://bsky.app/settings/app-passwords) 和 **Service URL**（默认：`https://bsky.social`）。若使用自托管 PDS，请在 Service URL 中填写您的 PDS 地址。

::: tip
如果遇到登录错误，请参阅 [故障排除指南](/troubleshooting)。
:::

![App Password 标签页与 Service URL](/images/app-password-service-url.png)

#### 自托管 PDS（v3.1.0+）

若您使用自托管的 Bluesky PDS（Personal Data Server）而非 bsky.social：

1. 打开扩展，切换到 **App Password** 标签页。
2. 输入句柄（或电子邮件）、应用密码，并在 **Service URL** 中填写 PDS 地址（例如 `https://your-pds.example.com`）。
3. 点击 Login。

请确保您的 PDS 兼容 AT Protocol。

### 4. 开始搜索

点击 "Find Bluesky Users" 开始扫描。扩展将通过检查 Bluesky API 来搜索匹配的 Bluesky 配置文件。

![find-bluesky-users](/images/scan-users.png)

### 5. 查看结果

点击 "View Results" 查看在 Bluesky 上找到的潜在匹配。

![view-results-button](/images/click-results.png)

这将打开选项页面，显示所有检测到的 Bluesky 用户。

![options](/images/options.png)

### 6. 关注用户

点击任何您想连接的用户旁边的 "Follow" 按钮。

![follow](/images/click-follow-btn.png)

或使用 "Follow All" 按钮一次性关注所有检测到的用户。

![follow-all](/images/follow-all-btn.png)

::: warning
请注意，匹配过程并不完美，可能偶尔会建议错误的匹配。在关注之前请始终验证配置文件。
:::

就是这样！享受在 Bluesky 上与您的社区连接 🎉 
