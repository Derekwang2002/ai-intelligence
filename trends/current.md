# Current Trend State — as of 2026-08-18T00:00Z

> 维护说明：本文件反映当前仍值得追踪的候选/确认趋势。每次运行可新增、升级、降级或作废条目。趋势判定要求多个独立信号（跨日期、跨组织）；单个新闻或单日热度不构成趋势。

## Candidates under observation

### Emerging: Open-weight agentic coding models from Chinese labs competing at frontier level
- **Status:** emerging (upgraded from candidate — multi-org evidence accumulated, still short of confirmation criteria)
- **Confidence:** Low
- **First observed:** 2026-08-15 (covering 2026-08-14 window)
- **Last updated:** 2026-08-17
- **Evidence so far:** Qwen3.8-27B weights (Apache 2.0, 91k downloads day-one, 2026-08-14); GLM-5.3 launch (weights pending ~8/28, 2026-08-14); adjacent context: Meta Muse Glimmer / Muse Spark 1.2 open weights (2026-08-10, US lab — same direction, different scope); background: Kimi K3 2.8T open weights (2026-07-16)
- **2026-08-16 run:** no new independent signals in window (GLM-5.3 Product Hunt #3 is community heat only). Status/Confidence unchanged.
- **2026-08-17 run:** coverage-gap note — Qwen3.8-2.4T-A95B (open-weights sibling of Qwen3.8-Max flagship, Apache-2.0 + official FP8) was published to HF on 2026-08-13, before this KB's first scan window; logged as background evidence only (not counted as new in-window signal; same organization as 27B). Adoption: 7.9k/10.7k downloads (BF16/FP8) in first days, vLLM/SGLang/TokenSpeed day-0, NVIDIA GB300 NVL72 serving blog. Status/Confidence unchanged.
- **2026-08-18 run:** no new signals in window (GLM-5.3 weights still pending ~8/28). Status/Confidence unchanged.
- **What would confirm:** GLM-5.3 weights land + independent benchmark reproduction; another same-tier release next cycle; sustained HF download velocity

### Emerging: MCP entering enterprise security & enforcement phase
- **Status:** emerging (upgraded from candidate on 2026-08-16)
- **Confidence:** Medium
- **First observed:** 2026-08-15 (covering 2026-08-14 window)
- **Last updated:** 2026-08-16
- **Evidence:**
  1. Cloudflare One Gateway MCP detection/enforcement GA — `experimental.is_mcp`, Portal-only enforcement, OAuth pre-registration (2026-08-14, primary, ev-20260814-03)
  2. Workday Adaptive Planning first-party MCP Server in 2026R2 release notes (2026-08-14, official docs) — enterprise SaaS supply side
  3. Practical DevSecOps MCP Security Statistics 2026: 82% of implementations vulnerable to path traversal; 40+ disclosed MCP CVEs by early August — security demand side
  4. Ecosystem scale: 10,000+ MCP servers after the 2026-07-28 stateless spec revision
- **Why upgraded:** multiple independent signals from different organizations and dates (network vendor, enterprise SaaS, security research) all point the same direction — MCP is moving from novelty protocol to governed enterprise infrastructure.
- **2026-08-17 run:** checked Zscaler/Netskope/Palo Alto for MCP identification shipping — none found (only SASE comparison articles and Zscaler's own MCP server integrations). Confirmation criterion still unmet. Status/Confidence unchanged.
- **2026-08-18 run:** background note — Netskope's MCP security (real-time MCP server/client identification with name/ID/URL/version/host/protocol attributes, CCI risk scoring, default-block policy, DLP) was announced 2025-12-01 as Preview, GA planned H1 2026; no dated GA announcement found. Partially satisfies the second-vendor criterion on capability, but predates KB coverage — logged as background only. Additional context: 2026-07-28 MCP auth spec (OAuth 2.1/OIDC) faces enterprise pushback (anonymous DCR criticism); CSA catalogued ~7,000 exposed MCP servers in early 2026, ~half unauthenticated; NSA/DoD security design guidance June 2026. Criterion refined to: second security vendor with **GA** MCP identification + published telemetry. Status/Confidence unchanged.
- **What would confirm:** second security vendor (Zscaler/Netskope/Palo Alto) shipping **GA** MCP identification with public telemetry; MCP auth spec adoption in major agent frameworks

### Emerging: Coding agents converging into multi-agent runtimes
- **Status:** emerging (upgraded from candidate on 2026-08-18 — cross-org primitives verified, including background facts predating KB coverage)
- **Confidence:** Medium
- **First observed:** 2026-08-15 (covering 2026-08-13/14 window)
- **Last updated:** 2026-08-18
- **Evidence so far:**
  1. Anthropic Claude Code: default-on subagent forking + cross-session SendMessage (2026-08-13/14)
  2. GitHub/Microsoft Copilot Agent Plugins 1.0 GA (2026-08-13)
  3. DeepSeek Harness (dsh) MIT open-source agent runtime (2026-08-14)
  4. OpenAI Codex subagents GA — manager agents spawning specialized subagents in parallel (2026-03-16; official @OpenAIDevs announcement, snowflake timestamp 2026-03-16T20:09Z + media corroboration; verified 2026-08-18 as pre-coverage background)
  5. OpenCode experimental background subagents, primary/subagent structure (v1.14.51, pre-v1.18.x line; verified 2026-08-18 as pre-coverage background)
- **Why upgraded:** equivalent primitives now verified across five organizations (Anthropic, GitHub/Microsoft, DeepSeek, OpenAI, SST/OpenCode) with persistence March→August 2026 — time continuity + multi-actor participation + technical convergence all satisfied.
- **2026-08-16 run:** no new signals in window (no new Claude Code release; Cursor Builds default-on is 8/17, not yet in effect).
- **2026-08-17 run:** Cursor Builds became default-on for all environments as scheduled — but Builds is a warm-snapshot infra improvement, not a multi-agent primitive; not counted as evidence.
- **Not yet established because:** no inter-agent messaging primitive in non-Anthropic runtimes yet (Codex/OpenCode ship subagent spawning, not cross-session messaging); no public production case studies or adoption telemetry.
- **What would confirm (→ established/High):** (a) cross-session/inter-agent messaging landing in Codex, Cursor, OpenCode or Gemini CLI; (b) community orchestration patterns consolidating around orchestration-on-CLI (de-facto standard tool or named pattern); (c) ≥2 independent organizations publishing production case studies

## Invalidated / retired

(none)
