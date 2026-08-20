# AI Intelligence Radar - Scheduled Task

在本地项目 `/Users/derek/Documents/Github/ai-intelligence` 中执行一次增量扫描。

先读取并遵守：

- `AGENTS.md`
- `config/radar.yaml`
- `state.json`
- `index/events.json`
- 必要的 `events/`、`daily/`、`trends/` 历史文件

执行步骤：

1. 记录 `current_run_started_at`。
2. 从 `state.json` 读取 `last_successful_run_at`。
3. 以 `[last_successful_run_at, current_run_started_at]` 作为本次扫描窗口。若不存在 checkpoint，使用 `config/radar.yaml` 中的 `time_window.initial_lookback_hours`。
4. 检索时允许使用 `config/radar.yaml` 中的 overlap buffer，但 overlap 只用于防止遗漏，必须通过 `event_fingerprint`、canonical URL、标题、组织、release name 和官方来源去重。
5. 主动获取最新公开信息，优先使用官方来源、release notes、GitHub、Hugging Face、论文和官方文档。不要只依赖模型已有知识。
6. 过滤低价值 PR、重复转载、普通融资、空泛预测和缺乏工程价值的 hype。
7. 对保留事件进行来源验证、结构化摘要、评分和 ADOPT / TRIAL / WATCH / IGNORE 推荐。
8. 按事件官方发布时间或实际发生日期写入或更新 `events/YYYY-MM-DD.json`，每个事件必须包含双语字段（`title` + `title_zh`、`summary_zh/en`、`why_it_matters_zh/en`）。
9. 按自然日累计更新 `daily/YYYY-MM-DD.md`（中文）和 `daily/YYYY-MM-DD.en.md`（英文），两份内容对应，不要创建 run-specific 日报。
10. 基于历史证据更新 `trends/YYYY-MM-DD.md`（+ `.en.md`）、`trends/current.json`（双语结构化）和 `trends/current.md`（中文），两者内容保持一致。证据不足时明确写"本周期没有发现证据充分的新趋势"，不要强行生成趋势。
11. 更新 `index/events.json`，确保后续运行可去重和跨期分析。
12. 只有检索、验证、去重、报告、事件存储、趋势更新、索引更新和所有持久化校验全部成功后，最后更新 `state.json`：`last_successful_run_at = current_run_started_at`。

如果任一步骤失败：

- 不推进 `last_successful_run_at`
- 保留上一次成功 checkpoint
- 在 `logs/` 中记录失败阶段和恢复信息
- 下一次仍从上一次成功 checkpoint 重新扫描

完成后，在对话中输出简短摘要，列出扫描窗口、新增事件、更新事件、跳过重复项、更新的文件，以及 checkpoint 是否成功推进。
