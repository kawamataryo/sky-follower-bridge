# 故障排除指南

## 身份验证错误

### 登录问题

**错误信息:**  
<span class="error-message">Error: Invalid identifier or password</span>

**检查清单:**
1. 用户名和密码输入
   - 检查是否有意外的空格
   - 如果复制和粘贴，请确保没有包含多余的字符

2. 用户名格式
   - 正确格式: `your-username.bsky.social`
   - 常见错误: `your-username` (缺少 .bsky.social)

3. 密码信息
   - 我们强烈建议使用 [App Password](https://bsky.app/settings/app-passwords) 而不是您的常规密码
   - App Password 格式: `xxxx-xxxx-xxxx-xxxx` (19 个字符)

::: tip 有用的提示
不要将 App Password 与设置中显示的 "password name" 混淆。
如何创建新的 App Password:
2. [导航到 App Passwords 部分](https://bsky.app/settings/app-passwords)
3. 点击 "Add App Password"
4. 点击 "Create App Password"
4. 复制生成的 19 个字符的密码
:::

---

### 需要双因素身份验证

**错误信息:**  
<span class="error-message">Error: Two-factor authentication required</span>

**解决方案:**
1. 检查您的电子邮件���获取身份验证代码
2. 在 2FA 输入字段中输入代码
3. 尝试重新登录

## 速率限制错误

**错误信息:**  
<span class="error-message">Error: Rate limit error</span>

**解决方案:**
1. Bluesky API 有以下限制 ([官方文档](https://docs.bsky.app/docs/advanced-guides/rate-limits)):
   - 每小时最多 5,000 点（大约 1,666 个新操作）
   - 每天最多 35,000 点
   - 每个操作的点数:
     - 创建: 3 点
     - 更新: 2 点
     - 删除: 1 点
2. 如果达到限制，请等待限制重置
3. 点击 "Restart" 按钮重试

::: warning
在 Firefox 上发布的版本经常遇到速率限制错误。如果遇到错误，请在 Chrome 上尝试。
:::

::: tip
大多数用户在正常使用期间不会达到这些限制。然而，在短时间内执行批量操作（如关注许多用户或点赞许多帖子）时请注意。
:::

## 页面错误

### 页面无效

**错误信息:**  
<span class="error-message">Error: Invalid page. please open the 𝕏 following or blocking or list page.</span>

**解决方案:**
仅在以下 𝕏 (Twitter) 页面上使用扩展：
- 关注页面 ([x.com/following](https://x.com/following))
- 屏蔽页面 ([x.com/settings/blocked/all](https://x.com/settings/blocked/all))
- 列表成员页面 (`x.com/i/lists/<list_id>/members`)

或在扩展页面上检查您的扩展权限。
站点权限应如下所示：

<img src="/images/site_permissions.png" alt="site permissions" width="500"/>

## 扫描问题

### 扫描过早停止

扫描在到达页面底部之前停止

**解决方案:**
1. 点击 "Resume Scanning" 继续
2. 扫描将在到达页面底部时自动停止
3. 您可以随时点击 "Stop Scanning and View Results"

### 未找到用户

扫描后未检测到 Bluesky 用户

**解决方案:**
1. 确保您已正确登录
2. 尝试再次扫描 - 某些用户可能在第一次扫描时未被检测到
3. 检查 𝕏 用户是否在其个人资料中链接了他们的 Bluesky 帐户

## 其他问题

如果遇到任何意外错误：

1. 重新加载页面
2. 再次尝试操作
3. 如果问题仍然存在，您可以：
   - [创建一个问题](https://github.com/kawamataryo/sky-follower-bridge/issues)，包括：
     - 精确的错误信息
     - 您尝试执行的操作
     - 您的浏览器类型和版本
     - 任何相关的截图
   - 或在 Bluesky 上提及 [@kawamataryo.bsky.social](https://bsky.app/profile/kawamataryo.bsky.social) 
