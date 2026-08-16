# AI Intelligence Radar — Site

知识库（`events/`、`daily/`、`trends/`、`index/`、`state.json`）的只读静态站点，基于 [Astro](https://astro.build)。

> 架构与选型的完整说明见 [`docs/site-architecture.md`](../docs/site-architecture.md)。

## 视图

| 路由 | 内容 |
|---|---|
| `/` | 概览：统计、观察清单、最新事件、活跃趋势、活动图、建议分布 |
| `/events/` | 事件时间线（搜索 + 类别 / 组织 / 建议筛选） |
| `/events/[id]/` | 事件详情：摘要、why it matters、技术细节、benchmark、六维评分、分层来源 |
| `/radar/` | 技术雷达：四象限 × ADOPT/TRIAL/WATCH/IGNORE 四环 |
| `/trends/` | 趋势看板（生命周期状态、置信度、证据链）+ 历史快照 |
| `/daily/` | 中文日报阅读页 |

## 本地开发

```bash
cd site
npm install
npm run dev      # 自动先跑 scripts/prepare-data.mjs，再启动 dev server
```

## 数据管线

`scripts/prepare-data.mjs` 在 dev/build 前运行，把知识库文件投影为 `src/data/generated/*.json`（已 gitignore，不入库）。知识库文件永远不会被站点修改。

## 部署

push 到 `main`（或手动触发 `.github/workflows/deploy-site.yml`）会自动构建并发布到 GitHub Pages：
`https://derekwang2002.github.io/ai-intelligence/`。

首次使用需在仓库 Settings → Pages 中把 Source 设为 **GitHub Actions**。

主题支持浅色 / 深色切换（跟随系统 + 手动切换，记忆在 localStorage）。
