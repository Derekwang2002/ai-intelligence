# MATRIX — AI Intelligence Site

Astro 静态站，知识库的只读投影。中文默认，英文使用 `/en/`；支持明暗主题、手机阅读和本地个人偏好。

| 路由 | 内容 |
| --- | --- |
| `/` | 今日简报、最近七天、自上次读完 |
| `/events/` | 搜索、分类、前沿观察；永久事件详情链接 |
| `/projects/` | 持续项目档案 |
| `/insights/` | 趋势、技术雷达、研究专题 |
| `/following/` | 本地关注、收藏、已读及导入导出 |
| `/sources/` | 引用材料及实际检查记录 |
| `/search/` | 事件、项目、趋势、专题统一搜索 |
| `/daily/` | 双语日报归档 |

```sh
npm ci
npm run dev
npm run check
npx playwright install chromium
npm run test:browser
```

数据准备在开发/构建前校验知识库并生成 `src/data/generated/` 和 `public/data/search.json`。这两处不入 Git。知识库变更后重新执行准备脚本，或重启开发服务。

GitHub Pages 设置 `ASTRO_BASE=/ai-intelligence`，所有内部路径经过同一个 URL helper。PR 运行校验、单元测试、构建及浏览器检查，main 检查成功才部署。

完整契约与恢复流程：[intelligence-v2.md](../docs/intelligence-v2.md)。历史架构讨论：[site-architecture.md](../docs/site-architecture.md)，其中旧路由描述以本文件为准。
