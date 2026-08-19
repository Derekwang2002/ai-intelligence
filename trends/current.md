# Current Trend State — as of 2026-08-19T00:00Z

> 维护说明：本文件反映当前仍值得追踪的候选/确认趋势。每次运行可新增、升级、降级或作废条目。趋势判定要求多个独立信号（跨日期、跨组织）；单个新闻或单日热度不构成趋势。

## Candidates under observation

### Emerging: 中国实验室的开源权重 agentic coding 模型在前沿水平竞争
- **Status:** emerging（由 candidate 升级——跨组织证据已积累，但仍未达到确认判据）
- **Confidence:** Low
- **First observed:** 2026-08-15（覆盖 2026-08-14 窗口）
- **Last updated:** 2026-08-17
- **Evidence:**
  1. Qwen3.8-27B 权重发布（Apache 2.0，首日 91k 下载，2026-08-14）
  2. GLM-5.3 发布（权重预计 ~8/28 落地，2026-08-14）
  3. 相邻背景：Meta Muse Glimmer / Muse Spark 1.2 开放权重（2026-08-10，美国实验室——同方向、不同范畴）
  4. 背景：Kimi K3 2.8T 开放权重（2026-07-16）
- **重要性：** 如果多家中国实验室持续发布前沿水平的开源权重 agentic coding 模型，前沿 coding 模型市场将从闭源 API-only 转向开放权重，改变自托管成本结构与模型竞争格局。当前证据仍在积累，确认判据尚未满足。
- **2026-08-16 run:** 窗口内无新的独立信号（GLM-5.3 Product Hunt 第 3 名仅为社区热度）。Status/Confidence 维持不变。
- **2026-08-17 run:** 覆盖缺口说明——Qwen3.8-2.4T-A95B（Qwen3.8-Max 旗舰的开源权重兄弟版本，Apache-2.0 + 官方 FP8）于 2026-08-13 上架 Hugging Face，早于本知识库首个扫描窗口；仅作为背景证据登记（不计为窗口内新信号；与 27B 属同一组织）。采用情况：最初数日 BF16/FP8 下载量 7.9k/10.7k，vLLM/SGLang/TokenSpeed day-0 支持，NVIDIA GB300 NVL72 serving 技术博客。Status/Confidence 维持不变。
- **2026-08-18 run:** 窗口内无新信号（GLM-5.3 权重仍待 ~8/28 落地）。Status/Confidence 维持不变。
- **2026-08-19 run:** 窗口内无新信号（GLM-5.3 权重仍未落地；HF 上 zai-org/GLM-5.3 仓库尚不存在）。背景交叉参考（不计为证据）：OpenAI《The Defender's Window》（8/10，窗口外）预期 8 月底一个 open-weight、近 frontier cyber 能力的模型将显著加剧威胁格局，时间点与 GLM-5.3（~8/28）相合。Status/Confidence 维持不变。
- **What would confirm:** GLM-5.3 权重落地 + 独立 benchmark 复现；下一周期再出现一个同级别发布；HF 下载增速持续

### Emerging: MCP 进入企业安全与强制管控阶段
- **Status:** emerging（2026-08-16 由 candidate 升级）
- **Confidence:** Medium
- **First observed:** 2026-08-15（覆盖 2026-08-14 窗口）
- **Last updated:** 2026-08-16
- **Evidence:**
  1. Cloudflare One Gateway MCP 检测/enforcement GA——`experimental.is_mcp`、仅 Portal 的 enforcement、OAuth 预注册（2026-08-14，一手来源，ev-20260814-03）
  2. Workday Adaptive Planning 第一方 MCP Server 出现在 2026R2 release notes（2026-08-14，官方文档）——企业 SaaS 供给端
  3. Practical DevSecOps《MCP Security Statistics 2026》：82% 的实现存在 path traversal 风险；截至 8 月初已披露 40+ 个 MCP CVE——安全需求端
  4. 生态规模：2026-07-28 无状态 spec 修订后 MCP server 总数已超 10,000
- **Why upgraded:** 来自不同组织、不同日期的多个独立信号（网络厂商、企业 SaaS、安全研究）指向同一方向——MCP 正在从新奇协议转变为受治理的企业基础设施。
- **2026-08-17 run:** 核查了 Zscaler/Netskope/Palo Alto 是否已交付 MCP 识别能力——未发现（仅见 SASE 选型对比文章与 Zscaler 自有 MCP server 集成）。确认判据仍未满足。Status/Confidence 维持不变。
- **2026-08-18 run:** 背景说明——Netskope 的 MCP 安全能力（实时识别 MCP server/client 及 name/ID/URL/version/host/protocol 属性、CCI 风险评分、default-block 策略、DLP）于 2025-12-01 以 Preview 状态宣布，GA 计划 2026 上半年；未检索到带日期的 GA 公告。能力上部分满足第二家厂商判据，但早于本知识库覆盖范围——仅作为背景登记。补充背景：2026-07-28 MCP auth spec（OAuth 2.1/OIDC）遭企业侧阻力（anonymous DCR 批评）；CSA 在 2026 年初记录约 7,000 个暴露的 MCP server，约半数无认证；NSA/DoD 于 2026 年 6 月发布安全设计指引。判据修正为：第二家安全厂商交付 **GA** 状态的 MCP 识别能力 + 公开遥测。Status/Confidence 维持不变。
- **2026-08-19 run:** 窗口内无新信号；Netskope GA 判据仍未满足（新闻发布页本次不可达，未检索到带日期 GA 公告）。邻接信号（不计为证据）：Codex 0.148.0 的 MCP OAuth 重认证恢复与沙箱 fail-closed 属客户端可靠性加固，非企业级识别/管控。Status/Confidence 维持不变。
- **What would confirm:** 第二家安全厂商（Zscaler/Netskope/Palo Alto）交付 **GA** 状态的 MCP 识别能力并公开遥测数据；MCP auth spec 在主流 agent framework 中落地

### Emerging: Coding agent 收敛为 multi-agent runtime
- **Status:** emerging（2026-08-18 由 candidate 升级——跨组织原语已核实，包括早于本知识库覆盖的背景事实；2026-08-19 补两条窗口内证据）
- **Confidence:** Medium
- **First observed:** 2026-08-15（覆盖 2026-08-13/14 窗口）
- **Last updated:** 2026-08-19
- **Evidence:**
  1. Anthropic Claude Code：subagent forking 默认开启 + 跨会话 SendMessage（2026-08-13/14）
  2. GitHub/Microsoft Copilot Agent Plugins 1.0 GA（2026-08-13）
  3. DeepSeek Harness (dsh) MIT 开源 agent runtime（2026-08-14）
  4. OpenAI Codex subagents GA——manager agent 并行派生专门 subagent（2026-03-16；官方 @OpenAIDevs 公告，snowflake 时间戳 2026-03-16T20:09Z + 媒体交叉印证；2026-08-18 核实为覆盖前背景）
  5. OpenCode 实验性 background subagents，primary/subagent 结构（v1.14.51，v1.18.x 之前的版本线；2026-08-18 核实为覆盖前背景）
  6. OpenAI Codex CLI 0.148.0 stable 落地 `codex exec fork` 会话分叉 + 可调用 MCP 工具的异步 hooks（2026-08-18T22:26Z，一手来源，ev-20260818-02）
  7. Gemini CLI main 分支存在 packages/a2a-server（A2A 协议 server），nightly（8/14–18）引用 a2a-server 与 SSR Agent（2026-08-19 观察；early indication——未进 stable、无官方公告）
- **Why upgraded:** 等效原语已在五家组织（Anthropic、GitHub/Microsoft、DeepSeek、OpenAI、SST/OpenCode）得到核实，且从 2026 年 3 月持续至 8 月——时间持续性、多主体参与、技术收敛三项条件均满足；2026-08-18 Codex 0.148.0 又把会话分叉推进 stable。
- **2026-08-16 run:** 窗口内无新信号（Claude Code 无新版本；Cursor Builds 默认开启时间为 8/17，尚未生效）。
- **2026-08-17 run:** Cursor Builds 按计划对所有环境默认开启——但 Builds 是 warm-snapshot 基础设施改进，不是 multi-agent 原语；不计为证据。
- **2026-08-19 run:** 新增两条窗口内证据：(a) Codex CLI 0.148.0 stable 落地 `codex exec fork` + 可调用 MCP 工具的异步 hooks（一手来源）；(b) Gemini CLI main 分支出现 packages/a2a-server（A2A 协议 server，nightly 引用）——early indication。判据 (a)（跨会话/跨 agent messaging 落地非 Anthropic stable 运行时）仍未满足：Codex fork 是分叉原语而非消息原语，a2a-server 未进 stable。Status/Confidence 维持不变。
- **Not yet established because:** 非 Anthropic stable 运行时尚无 inter-agent messaging 类原语（Codex fork 是分叉而非消息；Gemini CLI a2a-server 仅为 repo 级 early indication）；缺少公开的生产案例与采用遥测。
- **What would confirm:** (a) Codex、Cursor、OpenCode 或 Gemini CLI 任一落地跨会话/跨 agent messaging；(b) 社区编排模式收敛到 orchestration-on-CLI（出现事实标准工具或命名模式）；(c) ≥2 个独立组织公开生产案例

## Invalidated / retired

（无）
