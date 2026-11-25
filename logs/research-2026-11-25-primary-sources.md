# Primary-source research — 2026-11-25 run

Research window: strict `[2026-11-24T17:07:26Z, 2026-11-25T16:58:49Z]`; overlap starts `2026-11-24T14:07:26Z`. Checked at run time. Official pages that expose only a calendar date are flagged rather than assigned an invented timestamp.

## Confirmed in-window candidates

### Delegent — new research/tool candidate

- arXiv v1 was submitted at `2026-11-24T18:34:40Z`, inside the strict window. The paper describes a Claude Code harness that keeps the frontier model in charge and delegates bounded legwork to a local small model. The authors report 67% lower frontier-model cost on DeepSWE and 59% on a 694-question search evaluation without fewer solved tasks/correct answers. These are author results, not independent reproduction. [arXiv](https://arxiv.org/abs/2611.33098)
- The Apache-2.0 repository includes source, tests, samples and reproduction instructions, so this clears the public-artifact requirement for a one-day TRIAL. The repository was effectively new at inspection (26 commits, one star), so adoption evidence is absent. [GitHub](https://github.com/castorini/delegent)

### Humanity's First Exam — new benchmark candidate

- Google DeepMind launched HFE on November 24. The official post gives date precision only. A syndication record reports `1:30 PM CT` (about `19:30Z`), but that time is not exposed by the official page, so preserve the precision limit. HFE contains 544 elementary text/image prompts in 136 four-prompt families across 20 capabilities and tests repeated consistency rather than one-shot success. [Google](https://blog.google/innovation-and-ai/models-and-research/google-deepmind/humanitys-first-exam/) [technical report](https://storage.googleapis.com/deepmind-media/papers/hfe_tech_paper.pdf)
- The report evaluates 18 models. Its important limitation is selection: tasks were chosen because models had failed related examples, so the scores are a controlled stress test, not an estimate of ordinary production failure frequency. The public sample is smaller than the full held-out evaluation; the Kaggle contribution drive runs through December 15.

### Claude Code 2.1.332 — update existing `ev-20260814-04`

- GitHub published stable `v2.1.332` at `2026-11-25T01:32:14Z`. The release adds MCP-server skills in beta and a `PreSkillShellCommand` hook that can refuse inline shell commands before a skill loads. It also fixes hangs from named pipes, unbounded hook/MCP output, SSE MCP reconnects, compaction failure loops, and third-party gateway/model-policy fallback behavior. [release](https://github.com/anthropics/claude-code/releases/tag/v2.1.332)
- The release is broad and vendor-authored. Treat the controls as shipped behavior but not as proof that all policy/recovery paths are fail-closed; regression testing should cover shell-command rejection, MCP reconnects, and managed model allowlists.

### LiteLLM 1.108.17 LTS — update existing `ev-20260913-01`

- GitHub published `v1.108.17` at `2026-11-24T22:56:05Z`. The signed LTS backport fixes streamed OpenAI tool calls arriving with empty arguments, first-turn `chat-latest` 400s, a Bedrock Claude shared-`$defs` stall/failure, zero-cost logging for OpenAI Agents API sessions, and ignored DeepSeek V4 effort. It also adds Gemini page/sheet range forwarding. [release](https://github.com/BerriAI/litellm/releases/tag/v1.108.17)
- Later stable trains `1.109.5`, `1.110.4`, and `1.111.0` were published between `00:31Z` and `01:42Z`, but the monitored event follows the LTS line; do not merge RC-only or non-LTS claims into the LTS update.

### Qwen Code 1.0.0-preview.2 — preview update existing `ev-20260922-04`

- GitHub published `v1.0.0-preview.2` at `2026-11-25T06:37:49Z`. It adds Qwen4-Max to the subscription catalog, quota reset/upgrade UI, request IDs, and `Retry-After` handling. It remains a preview and does not supersede the tracked stable `0.28.4`; record only if preview lineage is being maintained. [release](https://github.com/QwenLM/qwen-code/releases/tag/v1.0.0-preview.2)

### Current arXiv digest — additional research candidates

- `OmniAct` was submitted at `2026-11-24T18:59:58Z`. The authors train across one million procedurally generated robot embodiments and report 63.0% success over 2,000 held-out embodiment-scene episodes plus a real-robot gain. The linked project URL returned 404 during this run, so there is no verified public code/weights artifact; maximum recommendation is WATCH. [arXiv](https://arxiv.org/abs/2611.33158)
- `AIChipBench` was submitted at `2026-11-24T18:28:41Z`. Across 9,136 agent attempts, the authors report that state-mismatch feedback raised accepted RTL designs by 25.0–46.9 points, yet 45 of 69 accepted designs failed on new sequences/conditions. This is strong benchmark methodology evidence, but the arXiv record exposes no verified code/data link; maximum recommendation is WATCH unless artifacts are found. [arXiv](https://arxiv.org/abs/2611.33093)
- `Draft Calibration for Speculative Decoding` was submitted at `2026-11-24T18:41:59Z` and reports up to about 10% longer accepted speculative spans from simple temperature scaling. No public implementation was located, and throughput gains need hardware/workload detail; defer or WATCH. [arXiv](https://arxiv.org/abs/2611.33111)
- `EmbodiSafety` was submitted at `2026-11-24T17:59:05Z` with 1,092 snapshot and 540 trajectory tasks over 844 visual scenarios. The authors report the best reference model at only 56.1%/61.5% complete decision accuracy and expose a project/dataset surface, but independent validation was not found. [arXiv](https://arxiv.org/abs/2611.33054) [dataset](https://huggingface.co/datasets/cuierfei/EmbodiSafety)

## Overlap / late-discovery updates

### ERNIE 5.5 Flash Preview weights — update existing `ev-20261111-05`

- The previously unreadable primary model card is now readable. Baidu provides three downloadable checkpoints (default FP4-expert mix, FP8, BF16), deployment recipes for vLLM/SGLang, fine-tuning guidance, and Apache-2.0 for the Preview weights. The model remains an unfinished intermediate post-training checkpoint; all 20 benchmark rows are vendor-run. [model card](https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview) [launch post](https://ernie.baidu.com/release/ernie-5-5-flash-preview)
- Hugging Face API metadata says the three repositories were created around `2026-11-23T09:00Z` and last modified around `2026-11-24T07:17–07:20Z`, before this run's overlap and before the previous checkpoint. Because the last manifest deferred this lead solely for unreadable primary evidence, treat this as a directed late-discovery update, not a November 25 release. The new fact is that the promised weights are verifiably downloadable, not that Baidu announced a new model.

### Ling-3.2-air independent evaluation — update existing launch event

- Artificial Analysis now reports an independent Intelligence Index score of 23 across nine evaluations, with particularly high output volume (199M output tokens across its index run) and no public API price/speed measurement. The model is above the median for comparable open-weight models but is not close to frontier closed-model performance. [Artificial Analysis](https://artificialanalysis.ai/models/ling-3-2-air)
- The evaluator page exposes a November release date but not an exact result-publication time. This evidence was first observed in this run; treat it as a directed follow-up with timing precision limited to date/current availability, not as proven post-checkpoint publication.

## Date-only / boundary-limited product updates

### OpenAI healthcare model configurations — likely update to `ev-20261116-01`

- The API changelog is dated November 24 but gives no time. It now lists `gpt-6.2-astra-healthcare`, `gpt-6.2-sol-healthcare`, `gpt-6-astra-healthcare`, and `gpt-6.1-sol-healthcare` on `v1/responses`, pairing the model with a clinical-question harness and a dedicated medical-source index when web search is enabled. [API changelog](https://developers.openai.com/api/docs/changelog)
- API organizations can use the configurations without a ChatGPT for Healthcare workspace. PHI use still requires an applicable BAA and eligible account/tool configuration. Promotional standard pricing is $8/$40 per million input/output tokens for Astra 6.2 and $2/$10 for Sol 6.2; regional processing doubles those base rates on the published table. [help](https://help.openai.com/en/articles/20001656-healthcare-model-configurations-in-the-openai-api) [pricing](https://developers.openai.com/api/docs/pricing)
- OpenAI's product article announced the configuration on November 16, while the API changelog/IDs appeared on November 24. Because the changelog lacks a time, do not claim it landed after the prior `17:07Z` checkpoint unless manifest/monitor evidence supplies a capture time.

### AWS Bedrock watermark coverage — possible update existing watermark event

- Bedrock's official documentation history, dated November 25 with no time, adds Claude Sonnet 4.6, Opus 4.6, Opus 4.5, Sonnet 4.5 and Haiku 4.5 to models documented as adding a watermark. This is a deployment-surface clarification, not a new watermark mechanism. [Bedrock document history](https://docs.aws.amazon.com/bedrock/latest/userguide/bedrock-ug-doc-history.html)

## Smaller / non-English engineering coverage

- IBM Research published an open, runnable Indic voice-agent example on November 25 using Apache-2.0 CUGA, multilingual retrieval, Sarvam or local SraVaani/Svara speech, and source-page grounding. The useful engineering lesson is that an English-only embedding model can silently retrieve irrelevant passages for Indic-language queries even when every component returns success. This is a tutorial/application release rather than a new foundation capability; likely `filtered` unless the project tracks practical RAG patterns as events. [Hugging Face article](https://huggingface.co/blog/ibm-research/an-indic-voice-agent-with-cuga) [CUGA](https://github.com/IBM/CUGA)
- NVIDIA's November 24 Microduck tutorial publishes a reproducible Isaac Lab/Newton sim-to-real obstacle-avoidance workflow and code paths, but it is a follow-on tutorial rather than a new platform/model release. Likely `filtered` for low incremental impact. [article](https://huggingface.co/blog/nvidia/microduck-obstacle-avoidance)

## Directed follow-ups and rejected/deferred leads

- **OmniEVIE-4B:** no independent evaluation located. Tencent's repository now cites a public MMEB leaderboard snapshot, but the model's own runs and claimed million-scale latency remain publisher evidence. Keep the prior judgment; do not refresh activity solely for re-reporting. [repository](https://github.com/Tencent/OmniEVIE)
- **Sirius/DuckDB:** NVIDIA's benchmark post is still first-party and uses pinned development builds, tuned GPU configurations, asymmetric result-output accounting, and query-time compute cost that excludes startup, validation, storage, S3 and idle time. Older independent academic work supports the broad GPU-analytics direction but does not validate this exact core-extension release. Keep the prior trial boundary. [NVIDIA](https://developer.nvidia.com/blog/get-started-with-gpu-accelerated-duckdb-analytics-using-the-sirius-core-extension/)
- **RoboTrack:** no independent rerun found after Ai2's release. The current public sources remain Ai2's benchmark/paper/code/dataset. Do not manufacture a new update. [Ai2/Hugging Face](https://huggingface.co/blog/allenai/robotrack)
- **DeepSeek outage:** the official status page records a resolved ten-minute V4 Pro API degradation on November 25. This is too short and too narrowly scoped to justify an intelligence event absent broader customer impact. `filtered` as operational noise. [status](https://status.deepseek.com/history?month=2026-11)
- **Codex 0.174 alphas:** multiple prereleases appeared inside the window, but no stable Codex release followed. `filtered`/`deferred` under the existing stable-only rule.
- **Qwen Code preview.2:** do not present as GA or as replacing stable 0.28.4.

## Coverage limits

- Primary-source searches covered OpenAI, Anthropic, Google/DeepMind, GitHub, Baidu, Qwen, DeepSeek, Z.ai, InclusionAI, Meta, Mistral, Cohere, Moonshot, ByteDance, AWS, NVIDIA, AMD, Hugging Face and the current arXiv AI/CL/LG/robotics submission window.
- Several official product/blog pages expose only a date; those items cannot be asserted to fall strictly after the hourly checkpoint without monitor capture metadata.
- No independent reproduction was found for OmniEVIE, Sirius core-extension performance, RoboTrack, Delegent, HFE, OmniAct, AIChipBench, Draft Calibration or EmbodiSafety. Ling-3.2-air gained independent evaluator results, but no measured serving speed or public API pricing.
