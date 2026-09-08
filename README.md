# 上海高考知识图谱

把上海高考理科知识组织成可交互的知识图谱：分层学习、关系网络、公式推导和个人批注。

在线访问：[kg.changhai.me](https://kg.changhai.me/)。参考 Justin3go 的留白、排版和个人站气质，采用蓝白纸张风格，适配手机与桌面。

首页插画、电磁轨道和学习路径随原生滚动推进，章节导航吸顶并标记当前位置。手机减小位移；系统开启“减少动态效果”时展示完整静态图案。脚本未加载时，正文和导航仍可使用。

## 云端批注

网站运行在 **Cloudflare Pages**；**Pages Functions + D1** 保存批注、存疑和高亮。浏览器保留缓存与待上传操作，断网时仍可在已打开的页面记录，联网后自动重试。

- 新增第一条批注时自动创建独立云端笔记本，也可以在「我的批注」中点击「开启云端同步」。
- 旧版浏览器批注会随开启同步迁入云端，原始本地数据保留作备份。
- 在「我的批注 → 同步码与换设备」复制同步码，在另一台设备粘贴恢复。
- 同步码是 256 位随机凭证，持有码的人可以读写这本笔记。请妥善保存；没有注册、邮箱找回或共享公开批注列表。数据库只保存同步码的 SHA-256 哈希。
- 批注仍可导出为 JSON。切换笔记本前需要先完成待上传修改，并保存原笔记本的同步码。
- 打开页面、返回页面、恢复网络或点击「立即同步」时同步；页面可见时每 30 秒拉取一次。

新增批注使用独立 ID，上传可重试；删除保留标记，避免另一台离线设备重新上传旧数据。每本最多 1,000 条记录（含删除标记）；引用最多 4,000 字，批注最多 8,000 字。API 限制请求大小和匿名笔记本创建频率。云端数据不是端到端加密，站点管理员可以通过数据库管理工具访问。

## 项目结构

```text
index.html                         首页
assets/                            共享样式、插画、批注同步客户端
physics/electromagnetism/           电磁学：25 个节点、88 条关系、4 层路径
  index.html                       学习页面
  data.js                          知识点内容
functions/api/[[path]].js           Pages Functions API 入口
server/api.js                      笔记本鉴权与存储
migrations/                        D1 数据库迁移
scripts/build.mjs                  仅复制公开资源到 dist/
tests/storage.test.mjs             存储、隔离、重试、迁移和多设备测试
wrangler.jsonc                     Pages 和 D1 配置
```

## 本地开发

需要 Node.js 22.13+（推荐 24 LTS）。

```sh
npm ci
npm run db:migrate:local
npm run dev
```

打开 [localhost:4174](http://localhost:4174/)。本地使用 Wrangler 的 SQLite 模拟 D1，不会修改线上数据库。修改静态文件后重新执行 `npm run build` 并刷新浏览器。

```sh
npm test
npm run build
npx wrangler pages functions build --outdir .wrangler/check
```

测试直接执行生产 SQL，覆盖数据隔离、删除防复活、输入验证、配额、本地迁移、离线重试和跨设备恢复。GitHub Actions 对 PR 和 main 执行这些检查。

## Cloudflare 部署

项目名 `gaokao-kg`，临时域名 [gaokao-kg.pages.dev](https://gaokao-kg.pages.dev/)，正式域名 `kg.changhai.me`。生产数据库 `gaokao-kg`；预览数据库 `gaokao-kg-preview`，两者相互独立。

本项目通过 GitHub Actions 调用 Wrangler Direct Upload 自动发布：**推送或合并到 `main` → 测试、构建和 Functions 编译通过 → 部署 Cloudflare Pages → 检查新部署的 D1 API**。PR 只运行检查，其他分支不会更新正式站点；也可以在 Actions 的 `Check and deploy site` 中选择 `main` 手动触发。连续的生产运行会排队，避免同时上传。

GitHub 的 `production` environment 仅允许 `main` 部署，配置了加密 Secret `CLOUDFLARE_API_TOKEN` 和变量 `CLOUDFLARE_ACCOUNT_ID`。部署 Token 仅有本站所在 Cloudflare 账户的 Pages Write 权限；不包含 DNS、D1 数据读写或账户管理权限。不要把 Cloudflare 全局 API Key 提交到仓库或放进 GitHub Secrets。

代码和 Pages Functions 会自动发布。新增数据库迁移仍需在发布相关代码前，从有 D1 权限的可信开发环境执行 `npm run db:migrate`，并保持迁移向后兼容。需要手动部署时，运行 `npx wrangler login` 或设置所需权限的 `CLOUDFLARE_API_TOKEN` 后执行：

```sh
npm run db:migrate
npm run deploy
```

`npm run deploy` 构建静态资源并将当前代码发布为 Pages 的 main 生产部署。发布前应完成测试并提交代码；`dist/` 不包含服务端源码、配置或数据库迁移。Functions 单独编译上传。

预览部署使用独立数据库：

```sh
npx wrangler d1 migrations apply gaokao-kg-preview --env preview --remote
npm run build
npx wrangler pages deploy dist --branch preview
```

`GET /api/health` 返回 `{"ok":true,"storage":"D1"}` 表示数据库连接和迁移正常。其余 API 使用 `Authorization: Bearer <同步码>`，不接受 URL 中的凭证，不允许跨站请求，响应不缓存。

回滚页面可在 Cloudflare Pages 的 Deployments 中选择此前的成功生产部署。数据库迁移需保持向后兼容；不要通过回滚页面删除或重建数据库。定期使用 D1 导出与 Time Travel 管理备份。

## 扩展内容

编辑对应章节的 `data.js` 更新知识点。新学科或章节需增加页面入口和数据；当前云端笔记针对电磁学，新增章节时应在存储协议中加入章节隔离。

公式使用 MathJax v3 CDN；字体和插画使用本地或系统资源。GitHub Pages 已由 Cloudflare Pages 替代。
