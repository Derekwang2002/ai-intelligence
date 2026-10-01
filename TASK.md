# AI Intelligence Radar - Scheduled Task

在本地项目 `/Users/derek/Documents/Github/ai-intelligence` 中执行一次增量扫描。

先读取并遵守：

- `AGENTS.md`
- `config/radar.yaml`
- `config/taxonomy.json`（分类、来源类型、组织规范名）
- `state.json`
- `index/events.json`
- 必要的 `events/`、`daily/`、`trends/` 历史文件

执行步骤：

1. 记录 `current_run_started_at`。
2. 从 `state.json` 读取 `last_successful_run_at`。
3. 以 `[last_successful_run_at, current_run_started_at]` 作为本次扫描窗口。若不存在 checkpoint，使用 `config/radar.yaml` 中的 `time_window.initial_lookback_hours`。
4. 检索时使用 `config/radar.yaml` 中的 overlap buffer。overlap 用来兜住上一轮漏掉的内容：已入库的按 `event_fingerprint`、canonical URL、标题、组织、release name 和官方来源去重；上一轮没见过的按正常标准评估入库并标 `late_discovery`，不得以「早于 checkpoint」为由排除（AGENTS.md §3）。
5. 主动获取最新公开信息，优先使用官方来源、release notes、GitHub、Hugging Face、论文和官方文档。不要只依赖模型已有知识。
6. 过滤低价值 PR、重复转载、普通融资、空泛预测和缺乏工程价值的 hype。
7. 对保留事件进行来源验证、结构化摘要、评分和 ADOPT / TRIAL / WATCH / IGNORE 推荐，遵守 AGENTS.md §16.2 评级硬规则。
8. 按事件官方发布时间或实际发生日期写入或更新 `events/YYYY-MM-DD.json`，每个事件必须包含双语字段（`title` + `title_zh`、`summary_zh/en`、`why_it_matters_zh/en`）、雷达短名 `short_label_zh/en` 和建议动作 `next_action_zh/en`；`category`、`source_type`、`organization` 使用 `config/taxonomy.json` 的规范值。更新已有事件时重写 `next_action`，新版本内容写进 `changes[]`，不要追加进 summary（AGENTS.md §6）。
9. 按自然日累计更新 `daily/YYYY-MM-DD.md`（中文）和 `daily/YYYY-MM-DD.en.md`（英文），两份内容对应，不要创建 run-specific 日报。
10. 基于历史证据更新 `trends/YYYY-MM-DD.md`（+ `.en.md`）、`trends/current.json`（双语结构化）和 `trends/current.md`（中文），两者内容保持一致。证据不足时明确写"本周期没有发现证据充分的新趋势"，不要强行生成趋势。
11. 更新 `index/events.json`，确保后续运行可去重和跨期分析。
12. 只有检索、验证、去重、报告、事件存储、趋势更新、索引更新和所有持久化校验全部成功后，最后更新 `state.json`：`last_successful_run_at = current_run_started_at`。

如果任一步骤失败：

- 不推进 `last_successful_run_at`
- 保留上一次成功 checkpoint
- 在 `logs/` 中记录失败阶段和恢复信息
- 下一次仍从上一次成功 checkpoint 重新扫描

完成后，在对话中输出简短摘要，列出扫描窗口、新增事件、更新事件、跳过重复项、召回自检结果、更新的文件，以及 checkpoint 是否成功推进。

## MATRIX v2 产出与发布检查

同时遵守 AGENTS.md §20，读取 `projects/catalog.json`、`sources/catalog.json`、`topics/catalog.json`、`reviews/queue.json` 与最近成功的 `briefings/`、`logs/run-*.json`。

- 固定入口抓取：`node scripts/collect-sources.mjs --started=<current_run_started_at>`。抓取结果仍需实际阅读（包括 `required: false` 的入口），固定入口之外继续做领域搜索。
- 候选处置只用 AGENTS.md §20 词表；声称「已入库 / 重复 / 更新」时必须写出真实存在的 `event_id`。
- 召回自检：入库完成后运行 `node scripts/recall-audit.mjs --manifest=<path>`，对列出的每一条填写处置；发现真实漏报按 `late_discovery` 补录后重跑确认。
- 将新事实关联项目、证据与来源；写稳定的变化记录，保证更新旧事件也能出现在今日和未读列表。
- 本次涉及的每个项目都要复核 `projects/catalog.json` 里的 `judgment`：结论不变也更新 `reviewed_at`；等级或结论变化时重写，并记录 `recommendation` 变化（AGENTS.md §20「项目判断」）。
- 处理到期复核及每周定向补漏；未完成项保留待处理，不通过机械更新时间掩盖遗漏。
- 每次运行生成 `briefings/<run-id>.json`，最多 5 个必读，双语理由；旧事件更新合并成同一阅读条目。
- 同步趋势证据、反面材料、判断修正与研究专题。没有新证据时明确说明，不能强制生成变化。
- 用 `logs/run-<id>.json` 保存完整运行门禁状态。先执行 `node scripts/finalize-run.mjs --manifest=<path>` 预检（缺少召回自检、有未处置条目或处置不合规都会被拒绝），再加 `--commit` 原子推进 checkpoint；之后重新构建页面。
- 任一必需阶段失败均保留 checkpoint，按失败日志恢复，网站继续提供上次有效知识库。
