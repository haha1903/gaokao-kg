# 上海高考知识图谱 (gaokao-kg)

把上海高考理科知识组织成可交互的**知识图谱**:分层引导卡片 + 力导向关系网络 + 点击展开深度内容(含 MathJax 公式)。定位冲刺满分,区分 🎯 高考主干 与 ⭐ 冲满分拓展。

**在线访问**: https://haha1903.github.io/gaokao-kg/

## 结构

```
index.html                        导航首页
physics/electromagnetism/         电磁学(电场·磁场·电磁感应, 25 节点)
  ├── index.html                  交互式知识图谱单页应用
  ├── data.js                     知识点数据(节点 + 串联关系)
  └── _static-base/               六维度总览 SVG
```

## 技术

纯静态站点,无后端。深色 JetBrains Mono 风,双视图(引导卡片 / 力导向图谱),公式走 MathJax v3 CDN,批注存 localStorage。改内容只需编辑对应 `data.js`。

## 扩展

新章节 = 新建 `<学科>/<章节>/` 目录,复制 `index.html` 框架 + 写自己的 `data.js`,再在根 `index.html` 加一张入口卡片。
