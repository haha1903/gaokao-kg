# 上海高考知识图谱 (gaokao-kg)

把上海高考理科知识组织成可交互的**知识图谱**:分层引导卡片 + 力导向关系网络 + 点击展开深度内容(含 MathJax 公式)。定位冲刺满分,区分 🎯 高考主干 与 ⭐ 冲满分拓展。

**在线访问**: https://kg.changhai.me/

## 结构

```
index.html                        学科导航首页
assets/                           共享样式、首页插画与站点图标
physics/electromagnetism/         电磁学(电场·磁场·电磁感应, 25 节点)
  ├── index.html                  交互式知识图谱单页应用
  ├── data.js                     知识点数据(节点 + 串联关系)
  └── assets/                     六维度总览 SVG
```

## 技术

纯静态站点，无构建依赖、无后端。蓝白纸张风格，支持手机与桌面；双视图（分层学习 / 关系图谱），公式使用 MathJax v3 CDN，批注存于 localStorage。改内容只需编辑对应 `data.js`。

样式分为共享设计变量 `assets/site.css`、首页 `assets/home.css` 和学习页 `assets/study.css`。支持键盘操作、减少动态效果偏好与触控图谱平移。首页图形为本地 SVG，不依赖图片或字体服务。

## 本地预览

在仓库根目录运行：

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

打开 http://127.0.0.1:4173/。GitHub Pages 从 `main` 分支根目录发布，域名由 `CNAME` 配置。

## 扩展

新章节 = 新建 `<学科>/<章节>/` 目录,复制 `index.html` 框架 + 写自己的 `data.js`,再在根 `index.html` 加一张入口卡片。
