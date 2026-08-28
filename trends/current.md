# Current Trend State — as of 2026-08-24T00:00Z

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
  3. 相邻背景：Meta Muse Glimmer / Muse Spark 1.2 开放权重（2026-08-10，美国实验室，方向相同但范畴不同）
  4. 背景：Kimi K3 2.8T 开放权重（2026-07-16）
- **重要性：** 如果多家中国实验室持续发布前沿水平的开源权重 agentic coding 模型，前沿 coding 模型市场将从闭源 API-only 转向开放权重，自托管的成本结构与模型竞争格局都会改变。当前证据仍在积累，确认判据尚未满足。
- **2026-08-16 run:** 窗口内无新的独立信号（GLM-5.3 登上 Product Hunt 第 3 名仅为社区热度）。Status/Confidence 维持不变。
- **2026-08-17 run:** 覆盖缺口说明：Qwen3.8-2.4T-A95B（Qwen3.8-Max 旗舰的开源权重版本，Apache-2.0 + 官方 FP8）于 2026-08-13 上架 Hugging Face，早于本知识库首个扫描窗口，仅作为背景证据登记，不计为窗口内新信号（与 27B 属同一组织）。采用情况：最初数日 BF16/FP8 下载量 7.9k/10.7k，vLLM、SGLang、TokenSpeed 首日即支持，另有 NVIDIA GB300 NVL72 serving 技术博客。Status/Confidence 维持不变。
- **2026-08-18 run:** 窗口内无新信号（GLM-5.3 权重仍待 ~8/28 落地）。Status/Confidence 维持不变。
- **2026-08-19 run:** 窗口内无新信号（GLM-5.3 权重仍未落地，HF 上 zai-org/GLM-5.3 仓库尚不存在）。背景交叉参考（不计为证据）：OpenAI《The Defender's Window》（8/10，窗口外）预计 8 月底将出现具备接近前沿网络能力的开源权重模型，威胁格局会因此显著恶化，时间点与 GLM-5.3（~8/28）相合。Status/Confidence 维持不变。
- **2026-08-20 run:** 窗口内无新信号（GLM-5.3 权重仍未落地；HF API 确认 zai-org/GLM-5.3 仍不存在，zai-org 最新公开模型仍为 GLM-5）。Qwen3.8 系列持续占据 HF trending（主仓 1M+ 下载、unsloth GGUF 4.3M），属于既有背景的延续，不计为新证据。Status/Confidence 维持不变。
- **2026-08-21 run:** 窗口内无新信号（GLM-5.3 权重仍待 ~8/28 落地；HF API 对 zai-org/GLM-5.3 仍返回 401，即仓库不存在）。HF trending 上 Qwen3.8-27B（1.37M 下载）、Kimi-K3、MiniMax-H3、DeepSeek-V4-Flash 系列持续霸榜，是中国开源权重主导地位的既有背景延续，不计为新证据。Status/Confidence 维持不变。
- **2026-08-22 run:** 窗口内无新信号（GLM-5.3 权重仍待 ~8/28；HF API 对 zai-org/GLM-5.3 仍返回 401，即仓库不存在；zai-org 最新公开模型仍为 GLM-5）。中国各 lab 窗口内没有动静。Qwen3.8-27B 生态数据（主仓 1.73M 下载、unsloth GGUF 5.8M、FP8 1.9M、衍生 Uncensored 变体 100k–1.1M）为既有背景延续。背景交叉引用明显增强（仍不计为证据）：OpenAI 官方安全文章《Pacing model development…》（8/18 宣布，长文 8/20 发布）确认了模型自主入侵 HF 生产基础设施的事件，并将 Astra 评为接近 Critical 网络能力阈值。这与《Defender's Window》对 8 月底开源权重网络能力的预期方向一致（见 ev-20260818-04）。Status/Confidence 维持不变。
- **2026-08-24 run:** 窗口内无新信号（GLM-5.3 权重仍待 ~8/28；HF API 对 zai-org/GLM-5.3 仍返回 401，即仓库不存在；zai-org 最新公开模型仍为 GLM-5；中国各 lab 周末静默）。窗口内流传的「GLM-5.3 发现 1,097 个漏洞」一文与 TokenCost 定价文，都是 8/14 发布期事实的二次传播。新增镜像背景（不计为证据）：WSJ 8/22 报道 Nvidia 拟借 $6B 的 Poolside 交易打造美国开源权重模型，明确对标 DeepSeek 与 Kimi。这是美国供给侧对本趋势的首次重量级回应，从侧面印证了开源权重前沿已成主战场（见 ev-20260822-01）。Status/Confidence 维持不变。
- **What would confirm:** GLM-5.3 权重落地 + 独立 benchmark 复现；下一周期再出现一个同级别发布；HF 下载增速持续

### Emerging: MCP 进入企业安全与强制管控阶段
- **Status:** emerging（2026-08-16 由 candidate 升级）
- **Confidence:** Medium
- **First observed:** 2026-08-15（覆盖 2026-08-14 窗口）
- **Last updated:** 2026-08-24
- **Evidence:**
  1. Cloudflare One Gateway 的 MCP 检测与 enforcement 能力 GA——`experimental.is_mcp`、enforcement 仅 Portal 可用、OAuth 预注册（2026-08-14，一手来源，ev-20260814-03）
  2. Workday Adaptive Planning 第一方 MCP Server 出现在 2026R2 release notes（2026-08-14，官方文档）——企业 SaaS 供给端
  3. Practical DevSecOps《MCP Security Statistics 2026》：82% 的实现存在 path traversal 风险；截至 8 月初已披露 40+ 个 MCP CVE——安全需求端
  4. 生态规模：2026-07-28 无状态 spec 修订后，MCP server 总数已超 10,000
  5. 背景（已核实）：Netskope Advanced Analytics 的 MCP Security Dashboard 于 2026-06-12 面向所有启用 Advanced Analytics 的客户开放（官方 release notes）；但 22 个 MCP 数据属性仍在 feature flag 之后，需 Sales/Support 开启，非干净 GA（2026-08-20 核实为覆盖前背景）
  6. 背景（已核实）：Netskope Release 140.0.0（月度更新，发布于 2026-08-11，早于本知识库覆盖范围）交付 Agentic Broker，可在专用 RTP 页面对 MCP 流量施加实时防护策略，作用域可选单个 server、catalog 类别或任意 MCP 流量，并扩展了 SkopeIT 中的 MCP 活动可见性。这是第二家厂商的强制管控能力，但属覆盖前背景，且 22 个 MCP 数据属性仍在 feature flag 之后、无公开遥测（2026-08-22 核实）
  7. 背景（已核实）：Zscaler 于 2026-06-09（Zenith Live）发布 Zscaler AI Broker，为 MCP 与 A2A 的 agent 通信提供安全代理，并配套 Agent Registry，可按 agent 查看其被授权访问的资源，定位为零信任 Agentic AI 平台的一部分。这是继 Cloudflare、Netskope 之后第三家 SSE/安全厂商的 MCP 管控能力，但新闻稿未标注 GA 或 preview 状态，也无公开遥测（2026-08-24 核实为覆盖前背景；此前 8/17 复核未检出）
- **Why upgraded:** 多个独立信号来自不同组织、不同日期（网络厂商、企业 SaaS、安全研究），指向同一方向：MCP 正从新兴协议转变为受治理的企业基础设施。
- **2026-08-17 run:** 核查了 Zscaler/Netskope/Palo Alto 是否已交付 MCP 识别能力，未发现（仅见 SASE 选型对比文章与 Zscaler 自有 MCP server 集成）。确认判据仍未满足。Status/Confidence 维持不变。
- **2026-08-18 run:** 背景说明：Netskope 的 MCP 安全能力（实时识别 MCP server/client 及 name/ID/URL/version/host/protocol 属性、CCI 风险评分、default-block 策略、DLP）于 2025-12-01 以 Preview 状态宣布，GA 计划 2026 上半年，未检索到带日期的 GA 公告。能力上部分满足第二家厂商判据，但早于本知识库覆盖范围，仅作背景登记。补充背景：2026-07-28 MCP auth spec（OAuth 2.1/OIDC）遭到企业侧阻力（anonymous DCR 批评）；CSA 在 2026 年初记录约 7,000 个暴露的 MCP server，约半数无认证；NSA/DoD 于 2026 年 6 月发布安全设计指引。判据修正为：第二家安全厂商交付 **GA** 状态的 MCP 识别能力 + 公开遥测。Status/Confidence 维持不变。
- **2026-08-19 run:** 窗口内无新信号；Netskope GA 判据仍未满足（新闻发布页本次不可达，未检索到带日期的 GA 公告）。邻接信号（不计为证据）：Codex 0.148.0 的 MCP OAuth 重认证恢复与沙箱 fail-closed 属于客户端可靠性加固，不是企业级识别与管控。Status/Confidence 维持不变。
- **2026-08-20 run:** 判据核查有实质进展：经 Netskope 官方 release notes（2026-06-12）核实，MCP Security Dashboard 已面向所有启用 Advanced Analytics 的客户开放（包含监控 AI-agent 活动的 dashboard），但 22 个 MCP 数据属性仍需 feature flag 加 Sales/Support 激活。结论是部分 GA、非干净 GA，确认判据（第二家厂商 GA + 公开遥测）仍未满足。该事实早于本知识库覆盖期，以「已核实背景」计入证据列表。窗口内无其他新信号。Status/Confidence 维持 emerging / Medium。
- **2026-08-21 run:** 窗口内无新信号；Netskope 干净 GA 判据仍未满足（未检索到带日期的 GA 公告；2026-06-12 的部分 GA 状态不变）。邻接信号（不计为证据）：Claude Code 2.1.238 的 stdio MCP 握手顺序修复（server/discover 不再先于 initialize）与 elicitation 对话框修复属于客户端可靠性；Tencent/AI-Infra-Guard（agent/MCP/skills 扫描红队工具）上榜 GitHub trending 属社区工具信号。Status/Confidence 维持 emerging / Medium。
- **2026-08-22 run:** 已核实背景进展：Netskope 140.0.0（月度更新 8/11，覆盖前）的 Agentic Broker 为 MCP 流量提供实时策略强制，是继 Cloudflare 之后第二家厂商的强制管控能力，已计入证据列表第 6 条。但干净 GA 判据仍未满足：8 月月度更新未提及 22 个 MCP 数据属性移出 feature flag，也无公开遥测。窗口内无其他新信号。Status/Confidence 维持 emerging / Medium。
- **2026-08-24 run:** 新增已核实背景证据（第 7 条）：Zscaler AI Broker（6/9，覆盖前）是第三家厂商的 MCP/A2A 管控能力，并带 Agent Registry。但新闻稿未标注 GA 状态、无公开遥测，干净 GA 判据（第二家厂商 GA + 公开遥测）仍未满足；Netskope 侧 8 月月度更新也未提及 22 个 MCP 数据属性移出 feature flag。窗口内无其他新信号。Status/Confidence 维持 emerging / Medium。
- **What would confirm:** 第二家安全厂商（Zscaler/Netskope/Palo Alto）交付 **GA** 状态的 MCP 识别能力并公开遥测数据；MCP auth spec 在主流 agent framework 中落地

### Strengthening: Coding agent 收敛为 multi-agent runtime
- **Status:** strengthening（2026-08-18 由 candidate 升级为 emerging；2026-08-20 升级为 strengthening——第六家组织 Anysphere/Cursor 在稳定产品中落地新原语类型，跨组织窗口内证据连续多个窗口持续积累）
- **Confidence:** Medium
- **First observed:** 2026-08-15（覆盖 2026-08-13/14 窗口）
- **Last updated:** 2026-08-21
- **Evidence:**
  1. Anthropic Claude Code：subagent forking 默认开启 + 跨会话 SendMessage（2026-08-13/14）
  2. GitHub/Microsoft Copilot Agent Plugins 1.0 GA（2026-08-13）
  3. DeepSeek Harness (dsh) MIT 开源 agent runtime（2026-08-14）
  4. OpenAI Codex subagents GA——manager agent 并行派生专门 subagent（2026-03-16；官方 @OpenAIDevs 公告，snowflake 时间戳 2026-03-16T20:09Z，另有媒体交叉印证；2026-08-18 核实为覆盖前背景）
  5. OpenCode 实验性 background subagents，primary/subagent 结构（v1.14.51，v1.18.x 之前的版本线；2026-08-18 核实为覆盖前背景）
  6. OpenAI Codex CLI 0.148.0 stable 落地 `codex exec fork` 会话分叉与可调用 MCP 工具的异步 hooks（2026-08-18T22:26Z，一手来源，ev-20260818-02）
  7. Gemini CLI main 分支存在 packages/a2a-server（A2A 协议 server），nightly 版本（8/14–18）引用了 a2a-server 与 SSR Agent（2026-08-19 观察；early indication——未进 stable、无官方公告）
  8. Cursor「Cloud Agents and Cursor Harness Improvements」在稳定产品中落地 always-on 系统原语：事件驱动 Subscriptions（订阅 PR/Slack/定时任务并唤醒，自动把自己创建的 PR 推进到完成）、VM-per-subagent 隔离 + swarm、/goal 长期目标、非打断式 steering（2026-08-19，官方 changelog，ev-20260819-01）
  9. OpenAI Codex CLI 0.149.0 stable 落地交互式 agents dashboard（搜索/启动/打开/重命名/停止任务，stable CLI agent 运行时的首个 fleet 管理 UI）与 `codex queue`（向既有本地/远程会话发送消息，排队消息可可靠唤醒 idle 会话，支持重名会话解析）（2026-08-20T21:04Z，一手来源，ev-20260818-02 更新）
- **Why strengthening:** 等效原语已在六家组织（Anthropic、GitHub/Microsoft、DeepSeek、OpenAI、SST/OpenCode、Anysphere/Cursor）得到核实，时间跨度从 2026 年 3 月到 8 月，且连续多个窗口都有新的窗口内证据。原语类型也在持续扩展：subagent 派生（3 月）→ 会话分叉进入 stable（8/18）→ 事件驱动唤醒 + VM-per-subagent 隔离 + 长期目标（8/19，Cursor）。工程影响开始具体化：agent 运行时正在获得事件触发、隔离并行与目标持久化能力，编排方式从「人发起的会话」转向「常驻系统」。尚未确立（established）的原因：非 Anthropic stable 运行时尚无 inter-agent messaging 类原语（Codex fork 是分叉而非消息；Cursor Subscriptions 是事件源唤醒而非 agent 间消息；Gemini CLI a2a-server 未进 stable），也缺少公开的生产案例与采用遥测。
- **2026-08-16 run:** 窗口内无新信号（Claude Code 无新版本；Cursor Builds 默认开启时间为 8/17，尚未生效）。
- **2026-08-17 run:** Cursor Builds 按计划对所有环境默认开启。但 Builds 是 warm-snapshot 基础设施改进，不是 multi-agent 原语，不计为证据。
- **2026-08-19 run:** 新增两条窗口内证据：(a) Codex CLI 0.148.0 stable 落地 `codex exec fork` 与可调用 MCP 工具的异步 hooks（一手来源）；(b) Gemini CLI main 分支出现 packages/a2a-server（A2A 协议 server，nightly 引用），属 early indication。判据 (a)（跨会话/跨 agent messaging 落地非 Anthropic stable 运行时）仍未满足：Codex fork 是分叉原语而非消息原语，a2a-server 未进 stable。Status/Confidence 维持不变。
- **2026-08-20 run:** 升级为 strengthening——Cursor 8/19 在稳定产品中落地 always-on 系统原语（第六家组织，两类新原语类型；官方 changelog 一手来源）；Claude Code 2.1.236 的 SendMessage `notify_when_idle` 是 Anthropic 侧既有 messaging 原语的细化（同一组织，不另计证据）。判据 (a) 仍未满足：Cursor Subscriptions 是事件源唤醒而非 agent 间消息；Gemini CLI 0.56.0 stable 已发布但未纳入 a2a-server。不升 established（缺公开生产案例与采用遥测），confidence 维持 Medium。
- **2026-08-21 run:** 新增一条窗口内证据：Codex 0.149.0 stable 落地 agents dashboard（fleet 管理 UI）与 `codex queue`（向既有本地/远程会话发消息 + 可靠 idle 唤醒）——同一组织（OpenAI）的第二条 stable 窗口内证据，也是 Codex 侧的新原语类型。判据 (a) 部分满足：跨会话消息已在非 Anthropic stable 运行时落地，但由用户/编排者发起，agent-to-agent 收件箱语义仍只有 Anthropic 具备（Claude Code 2.1.238 的跨会话消息可靠性修复是对同一既有原语的加固，不另计证据）；Gemini CLI a2a-server 仍只在 main。不升 established（缺公开生产案例与采用遥测），confidence 维持 Medium。
- **2026-08-22 run:** 窗口内无新证据。Claude Code 2.1.239 的 ListAgents/SendMessage 改进（列出 live teammates、告知自身 peer 名、修复标题以 / 开头的会话无法寻址、修复 Remote Control 标题同步失控这一 2.1.232 回归）是对 Anthropic 既有 messaging 原语的加固（同一组织，不另计证据）；Codex 0.150 仍只有 alpha（8/21 内 alpha.3/5/6，无新 stable）；Gemini CLI 无新 stable（a2a-server 仍只在 main）。判据 (a) 状态不变。Status/Confidence 维持 strengthening / Medium。
- **2026-08-24 run:** 窗口内无新证据。Claude Code 2.1.240/241（8/22，changelog 仅「Bug fixes and reliability improvements」）是没有具体变更说明的补丁版本（同组织，不另计证据）；Codex 0.150 仍只有 alpha（窗口内续发 0.149.0-alpha.7.2、0.150.0-alpha.7、0.149.0-alpha.4.3，无新 stable）；Gemini CLI 无新 stable（a2a-server 仍只在 main）；Cursor 官方 changelog 无新条目（8/22 常规 app 更新与论坛讨论属 Tier-4）。判据 (a) 状态不变：跨会话消息已落地非 Anthropic stable 运行时（8/21 已记），agent-to-agent 收件箱语义仍只有 Anthropic 具备。Status/Confidence 维持 strengthening / Medium。
- **What would confirm:** (a) Codex、Cursor、OpenCode 或 Gemini CLI 任一落地跨会话/跨 agent messaging（agent-to-agent 语义）；(b) 社区编排模式收敛到 orchestration-on-CLI（出现事实标准工具或命名模式）；(c) ≥2 个独立组织公开生产案例

## Invalidated / retired

（无）
