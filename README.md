# AI Intelligence Radar

一个由 AI agent 驱动的本地增量式 AI Intelligence 知识库，持续追踪 AI 模型、Agent、AI Engineering、开源生态、研究、基础设施与开发者工具领域的重要变化，并长期沉淀为技术决策依据。

不是普通的 AI 新闻聚合器。项目的核心是把分散的公开信息加工为：

```text
Events -> Signals -> Trends -> Decisions
```

## 核心原则

- **Signal > Noise**：宁可漏掉一般新闻，也不产生低质量内容
- **Primary Source > Secondary Reporting**：优先官方博客、release notes、GitHub、Hugging Face、论文原文
- **Engineering Value > Hype**：关注对架构、成本、延迟、可靠性、开发工作流的实际影响
- **Impact > Popularity**：转载量和讨论热度本身不构成价值
- **Incremental Scan > Repeated Full Scan**：每次运行只处理新增信息
- **Historical Evidence > Single-event Speculation**：趋势必须有多日期、多主体的独立证据支撑

## 目录结构

```text
ai-intelligence/
├── AGENTS.md              # agent 执行规则（增量扫描、去重、评分、持久化、checkpoint）
├── TASK.md                # 单次增量扫描任务说明
├── state.json             # 运行状态与 checkpoint（last_successful_run_at）
├── config/
│   └── radar.yaml         # 时间窗口、来源分级、关注领域、评分维度、趋势规则
├── events/
│   └── YYYY-MM-DD.json    # 结构化事件，按事件实际发布日期归属
├── daily/
│   └── YYYY-MM-DD.md      # 中文日报（当日累计，多次运行合并到同一份）
├── trends/
│   ├── YYYY-MM-DD.md      # 趋势快照
│   └── current.md         # 当前追踪中的趋势及生命周期状态
├── index/
│   └── events.json        # 跨运行事件索引（去重 + 趋势分析）
├── logs/                  # 失败日志与恢复信息
├── docs/
│   └── site-architecture.md  # 站点技术文档：架构、选型考量、已知限制、演进方向、维护手册
├── site/                  # 只读静态网站（Astro），把知识库渲染为可浏览的雷达/时间线/趋势/日报
│   ├── scripts/prepare-data.mjs   # 构建前数据管线：知识库 → src/data/generated/（不入库）
│   └── …                   # 本地运行：cd site && npm install && npm run dev
└── .github/workflows/deploy-site.yml   # push 到 main 自动构建并发布到 GitHub Pages
```

## 工作机制

### 增量扫描

每次运行先记录 `current_run_started_at`，再从 `state.json` 读取 `last_successful_run_at`，扫描窗口为两者的区间。首次运行默认回看 24 小时（可由 `config/radar.yaml` 的 `time_window.initial_lookback_hours` 调整）。

检索时允许向前回退一个小的 overlap buffer（默认 3 小时）以对抗索引延迟和时区边界，但 overlap 区间的内容必须去重，不会重复写入。

### Checkpoint 与失败恢复

只有检索、验证、去重、分析、事件存储、日报、趋势、索引全部成功且通过校验后，才推进 `last_successful_run_at`（使用本次运行的开始时间，而非结束时间，避免执行期间发布的信息被永久漏掉）。

任一步骤失败则不推进 checkpoint，在 `logs/` 记录失败阶段，下一次运行从上一次成功 checkpoint 重新扫描。

### 去重与事件更新

候选事件通过 `event_fingerprint`、canonical URL、标题、organization、release name 等字段去重。多家媒体报道同一事件只保留一个事件实体，一手来源作为 `primary_source`，媒体报道归入 `secondary_sources`。

后续运行发现同一事件的重要新信息时，更新原事件而非创建重复事件。

## 事件模型

每个事件包含结构化摘要、来源、`why_it_matters`、技术细节，以及 1-5 分的六维评分：

| 维度 | 含义 |
| --- | --- |
| Technical Impact | 技术创新程度，5 = 可能改变技术路线 |
| Engineering Value | 工程应用价值，5 = 可显著改变开发方式 |
| Adoption Signal | 真实采用信号，5 = 快速真实采用 |
| Maturity | 成熟度，1 = Research Demo，5 = Widely Adopted |
| Verification Cost | 验证成本，5 = 高成本 |
| Risk | license / security / lock-in / 稳定性风险 |

每个重要技术附带 ADOPT / TRIAL / WATCH / IGNORE 之一的技术雷达推荐。

## 趋势判定

单个新闻不构成趋势。趋势至少需要多个独立信号：时间持续性、多主体参与、技术收敛、真实 adoption signal 或已发生的工程影响。

趋势有完整生命周期管理（candidate → emerging → strengthening → established，或 weakening / invalidated），维护在 `trends/current.md`，证据不足时明确写"本周期没有发现证据充分的新趋势"。

## 关注领域

- **Foundation Models**：新模型、reasoning、multimodal、long context、coding、open-weight / small models，以及 OpenAI、Anthropic、Google DeepMind、Meta、Mistral、xAI、Qwen、DeepSeek、Moonshot、Zhipu、ByteDance 等主要团队
- **AI Agent**：agent framework、multi-agent、tool calling、browser / coding / research agent、MCP、A2A protocol、memory、sandbox、long-running agents
- **AI Engineering**：RAG、context engineering、structured generation、evaluation、observability、LLM gateway、fine-tuning、quantization、model serving
- **Open Source**：GitHub / Hugging Face 上有真实增长信号（star velocity、contributor growth、HF downloads）的项目
- **Research**：有 code、有 benchmark、有工程潜力的论文
- **Infrastructure**：GPU / TPU / accelerator、训练与推理基础设施、AI cloud
- **Developer Tools**：Codex、Claude Code、Cursor、GitHub Copilot、Windsurf、Gemini CLI、Aider 等
- **Business & Policy**：仅收录可能实际改变技术生态、模型获取、API 成本、芯片供应或开源格局的事件

## 如何运行

本项目设计为由 AI coding agent（如 ZCode）执行。触发方式：

1. 让 agent 读取 `TASK.md`（agent 会按规则先读取 `AGENTS.md`、`config/radar.yaml`、`state.json` 与相关历史文件）
2. agent 执行一次增量扫描，产出事件、日报、趋势更新，并在成功后推进 checkpoint
3. 运行结束时 agent 会输出增量简报（扫描窗口、新增 / 更新事件、跳过的重复项、checkpoint 状态）

也可以配合定时任务（cron / scheduled automation）按固定间隔触发，实现持续积累。

## 配置

所有可调参数集中在 `config/radar.yaml`：时间窗口与 overlap、来源分级（Tier 1 官方来源 → Tier 4 社区信号）、各领域关注清单、评分维度、趋势规则与质量门禁。输出语言为中文，技术名称与产品名保留英文。
