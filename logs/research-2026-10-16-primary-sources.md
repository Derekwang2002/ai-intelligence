# Primary-source research — 2026-10-16 incremental scan

- Target window: `[2026-10-15T16:00:25Z, 2026-10-16T15:56:07Z]`
- Retrieval overlap begins: `2026-10-15T13:00:25Z`
- Research completed: 2026-10-16 (America/Los_Angeles)
- Scope: non-monitor discovery, small/open-source teams, practical engineering changes, Chinese/non-English first-party material, and exceptional general-technology candidates. This note is research input only; it does not assert that every candidate should be persisted.

## Recommended candidates

| Priority | Candidate | Suggested disposition | Time basis | Availability / stage at cutoff | Dedupe lead |
| --- | --- | --- | --- | --- | --- |
| 1 | China proposes adding 23 AI technologies to its restricted/prohibited export catalogue and starts temporary pre-export registration | `new-event` | Both official pages show `2026-10-16 16:00` China time, or `2026-10-16T08:00:00Z`, inside the window. | The catalogue additions are a consultation draft, not final prohibitions/restrictions. The temporary registration requirement took effect on publication and covers listed technology transfers already underway but unfinished. | No matching event found by catalogue title, announcement number or ministry search. |
| 2 | NVIDIA releases Nemotron 3.5 Super VL and Bolt open weights | `new-event` | NVIDIA blog metadata gives `2026-10-15T18:01:00Z`; Hugging Face artifacts were modified from `18:06Z` onward, all after the previous cutoff and inside this run. | BF16 and quantized weights are downloadable globally under OpenMDW 1.1; hosted access is listed. Super VL needs substantial hardware for the reference paths. Bolt has a 24GB checkpoint, but its card's tested-hardware statements need careful interpretation. | No Nemotron 3.5 event found. Treat Super VL and Bolt as one family launch unless product-specific judgments materially diverge. |
| 3 | llama.cpp 0.7.0 adds MoE expert caching, LiLiCorr and a server/API migration | `new-event` or `filtered` if the run remains highly selective | GitHub release API: `published_at: 2026-10-15T17:13:19Z`. Stable tag, not prerelease. | Source and release notes are public. Server defaults change from port 8080 to 9931 outside Docker; formatted chat output becomes a parts array. The claimed MoE-cache speedup is project-reported. | No standalone llama.cpp event found; prior mentions are runtime support for other models or filtered rolling builds. |
| 4 | Browser Use 0.13.13 adds an OpenAI browser-tool driver | `new-event` or `filtered` | GitHub release API: `published_at: 2026-10-15T23:50:45Z`. Stable tag; 0.13.12's PyPI publication was cancelled. | Installable with the `openai-tools` extra and OpenAI Python 3.31+. It exposes 18 default tools plus six optional actions for local browsers, Browser Use Cloud and borrowed sessions. Validation is eleven driver tests plus smoke checks, not a broad benchmark. | No Browser Use event found. |
| 5 | Google demonstrates magic-state cultivation on Willow hardware | `out-of-scope` daily supplement or `new-event` / `WATCH` if the research category admits general computing | Google page metadata gives `2026-10-15T18:00:00Z`, after the previous cutoff. The Science paper was published the same day. | Hardware experiment, not a product or accessible service. Google reports 40x lower error than uncultivated states and 99.99% logical fidelity, but explicitly says larger-scale cultivation remains to be demonstrated. | No matching Willow / magic-state event found. |

### 1. China opens consultation on 23 AI export-control entries while imposing immediate registration

**What changed.** China's Ministry of Commerce and Ministry of Science and Technology published Announcement No. 48 of 2026. The draft would add 40 technologies to the country's prohibited/restricted technology-export catalogue: 23 in AI, five in biomedicine and 12 in photovoltaics. The AI scope covers large models, agents, compute clusters and information processing. The official Q&A names AI-driven malware generation and mutation among proposed prohibited technologies and AI-assisted vulnerability discovery among proposed restricted technologies.

**Stage and limits.** Two stages must not be collapsed. The catalogue revision is open for comment through November 15 and is not yet a final prohibition/restriction. Separately, the announcement imposes a temporary pre-export registration requirement immediately, lasting until the final revision takes effect. It covers transfers of technology ownership, authorization for overseas use, and a change of a domestic technology owner's or controller's status to an overseas entity; exports already started but not finished are also in scope.

**Important boundaries.** Technologies already in the public domain through open source or academic publication are proposed to be excluded. The official Q&A says open-source AI releases, overseas self-operated compute centres, overseas chip tape-outs, international joint R&D and standards participation would receive automatic-licence conveniences. It also says API, app/web interaction, SaaS and lightweight on-device delivery would not by themselves be treated as export of large-model technology; overseas localized deployment of a listed restricted technology would be in scope after the final rules take effect.

**Recommended judgment.** This is a strong `business-policy` reader highlight because an operational registration duty is already live and can affect ownership transfers, licences and overseas deployment planning. Headline it as a *draft catalogue plus effective temporary registration*, not as "China has banned 23 AI technologies." The attachment with the precise 23 technical thresholds is a WPS binary that the web reader could not parse; the main announcement and Q&A provide the verified high-level scope.

Primary sources:

- Announcement No. 48 (`2026-10-16 16:00` CST): <https://www.mofcom.gov.cn/zwgk/zcfb/art/2026/art_0a31a3c9ac404f7a9b0e917ce3412997.html>
- Ministry Q&A (`2026-10-16 16:00` CST): <https://www.mofcom.gov.cn/zwgk/zcjd/art/2026/art_b11d5c1e9374421e93e85dc87eba6e38.html>

### 2. NVIDIA ships Nemotron 3.5 Super VL and Bolt weights

**What changed.** NVIDIA released a family aimed at multimodal agent work. Nemotron 3.5 Super VL is a 120B-total / 12B-active hybrid Mamba-2, MoE and attention model with a C-RADIO vision encoder. It accepts text, images and video, supports tool use, and advertises context up to 1M tokens. The release includes BF16 and NVFP4 weights, training/evaluation recipes, datasets and reinforcement-learning environments. Nemotron 3.5 Bolt is a 74B-total / 9B-active multimodal model; its 24GB IQ2 checkpoint targets local agent harnesses and supports up to 256K context.

**Availability and terms.** Model cards say global deployment and commercial or non-commercial use under OpenMDW 1.1 rather than Apache/MIT. The reference Super VL card lists 4x H100 or 2x GB200 deployments for 1M context. Hosted inference providers are listed by NVIDIA, and the blog links OpenRouter. The 24GB Bolt artifact is public, but "24GB model" is not proof that every 24GB consumer GPU/runtime combination works: the card's deployment table and later hardware-compatibility section are not perfectly aligned, so a reader entry should name only the hardware/runtime combinations the card actually documents.

**Evidence limits.** NVIDIA reports Super VL results across agent harnesses and claims up to 5x throughput in its size class, plus post-training gains supplied by partners. Most headline measurements are NVIDIA- or partner-reported. The model card publishes benchmark recipes for many tasks, but says several multimodal benchmarks still used official implementations or internal scaffolding planned for later release. Treat the claims as reproducible leads, not independent findings.

**Recommended judgment.** `TRIAL` is defensible because weights, recipes and hosted paths are available. The one-day action should test one representative multimodal tool-use workflow on a hosted endpoint, measure task success, latency and token/cost use, then separately verify OpenMDW obligations and whether the intended local hardware supports the chosen quantization.

Primary sources:

- NVIDIA launch post (`2026-10-15T18:01:00Z` metadata): <https://developer.nvidia.com/blog/nvidia-nemotron-3-5-super-vl-powers-specialized-agents-with-multimodal-reasoning/>
- Super VL BF16 card: <https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16>
- Super VL NVFP4 card: <https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4>
- Bolt BF16 card: <https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16>
- Bolt 24GB card: <https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB>
- Model API timestamps: <https://huggingface.co/api/models/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16>

### 3. llama.cpp 0.7.0 is a material stable runtime release

**What changed.** The release adds a GPU LRU cache for MoE experts otherwise held in host memory, with a project-reported decode improvement up to 2.2x when experts are offloaded; the cache can span multiple GPUs. It also adds LiLiCorr speculative decoding, GLM5-Next multi-token prediction, new model architectures including Nemotron 3.5 and EmbeddingGemma-2, a models manager in the web UI, and better prompt-cache/slot restoration.

**Migration risk.** This is not a drop-in patch for every server user. The server's default port changes from 8080 to 9931 outside Docker, and formatted chat output changes from a single string to an array of parts. The bundled ggml moves to 0.27.0 and the RPC protocol to v8. These are concrete regression-test targets for deployments and client libraries.

**Recommended judgment.** `TRIAL` for teams that self-host GGUF/MoE models, otherwise `WATCH`. A one-day verification can replay the same quantized MoE workload on 0.6.0 and 0.7.0, compare output correctness, decode speed and VRAM, then test server port, response parsing, prompt-cache restoration and RPC compatibility. The 2.2x number is not an independent benchmark.

Primary source:

- GitHub release (`published_at: 2026-10-15T17:13:19Z`): <https://github.com/ggml-org/llama.cpp/releases/tag/v0.7.0>

### 4. Browser Use exposes OpenAI browser tools across local and cloud sessions

**What changed.** Browser Use 0.13.13 adds an OpenAI browser-tool driver with 18 default tools and six optional actions. It supports a local browser, Browser Use Cloud and an already-borrowed session. The release also fixes transient empty Cloud tab URLs and keeps screenshots, crops and pointer coordinates aligned on scaled displays.

**Stage and limits.** This is a stable GitHub/PyPI release, but requires the `openai-tools` extra and OpenAI Python 3.31 or newer. The project says eleven driver tests pass and reports live remote-browser and library smoke tests; it explicitly leaves broader evaluation results separate. Version 0.13.12 was not published to PyPI and should not be recorded as a separate release.

**Recommended judgment.** `TRIAL` only if OpenAI Responses/browser-tool integration is directly relevant; otherwise filter as a focused adapter release. Test navigation, screenshot-coordinate fidelity, session borrowing and failure recovery against a site with iframe/scaled-display interactions before treating the driver as production-ready.

Primary sources:

- GitHub release (`published_at: 2026-10-15T23:50:45Z`): <https://github.com/browser-use/browser-use/releases/tag/0.13.13>
- Integration guide: <https://docs.browser-use.com/open-source/customize/integrations/openai>

### 5. Google demonstrates magic-state cultivation on Willow

**What changed.** A Google Quantum AI team reports the first hardware demonstration of its magic-state cultivation protocol. On Willow it measured roughly 40x fewer errors than uncultivated states and logical T-state fidelity of 99.99%. The experiment also transferred a cultivated state from a distance-3 colour code to a distance-5 surface code. The work appears in Science rather than only a company post.

**Why it matters, and the limit.** Magic states supply operations needed for universal error-corrected quantum programs, but producing them can dominate a fault-tolerant computer's resources. The experiment attacks a real systems bottleneck. It does not show useful fault-tolerant applications or production-scale cultivation: Google explicitly says larger-scale demonstration and substantial engineering remain.

**Recommended judgment.** If the knowledge base remains AI-focused, use the exceptional-general-news path and record it `out-of-scope` in the manifest while adding a tightly qualified daily-summary item. If broad computing research is within the taxonomy, `WATCH` is the ceiling; there is no accessible product, code path or deployment decision for ordinary engineers.

Primary sources:

- Google Quantum AI explanation (`2026-10-15T18:00:00Z` page metadata): <https://blog.google/innovation-and-ai/models-and-research/quantum-computing/magic-state-cultivation-quantum-computing/>
- Science paper linked by Google: <https://www.science.org/doi/10.1126/science.ady3434>

## Lower-priority / filtered leads

### Routing Policy Optimization for diffusion RL

- Primary paper: <https://arxiv.org/abs/2610.22282> (`2026-10-15T17:40:30Z`).
- Project page: <https://velox-world.com/rpo/>.
- The authors route attention during online diffusion reinforcement learning and report nearly 4x training-efficiency improvement over Flow-GRPO-style methods while returning to dense attention at inference. This is a single paper with author-run image/video experiments; no mature reusable package was confirmed in this pass.
- Suggested disposition: `WATCH` only if research capacity remains after stronger candidates; otherwise `filtered` as an early single-paper signal.

### AndroidHarness multi-workspace release

- Repository: <https://github.com/Sanuu7/AndroidHarness>.
- GitHub release discovery reported a tag published `2026-10-15T23:15:23Z`; the small MIT project adds multiple repositories in one on-device coding-agent conversation. The public repository had about 67 stars and Google Play showed 100+ downloads at review time.
- Suggested disposition: `filtered` for now. It is a useful small-team lead, but adoption and independent reliability evidence are too thin for a daily highlight. Keep it on a watchlist rather than using community novelty as proof of importance.

## Overlap items already handled

- Mistral Timestral is already stored as `ev-20261015-01`.
- Cloudflare/OpenAI web-discovery pilot is already stored as `ev-20261015-02`.
- GitHub AI Scan GA and GitHub agentic autofix GA already exist in the event library, with GA changes recorded. They should be treated as duplicates/previously handled unless a new post-cutoff fact appears.
- Meta Muse Spark Open availability was handled in the prior run; do not create another event from downstream GGUF packaging alone.

## Coverage and limitations

- This pass checked first-party product/model pages, GitHub release APIs, Hugging Face model APIs/cards, Chinese government material, a peer-reviewed general-computing result and small/open-source project leads.
- The strongest Chinese-language discovery was the Ministry of Commerce/Ministry of Science and Technology announcement. Other Chinese model/vendor searches did not yield a stronger traceable in-window release; this is a search limitation, not evidence that none existed.
- The Chinese announcement's WPS attachment could not be parsed by the web reader. The verified policy-stage, counts, named examples and operational registration rule come from the official HTML announcement and Q&A; exact per-technology thresholds still require attachment review before quoting them.
- Hugging Face `lastModified` proves an artifact changed, not the exact moment it first became public. Here it is used only alongside NVIDIA's dated launch page and cards.
- NVIDIA, llama.cpp and Browser Use performance or validation claims remain attributed to their publishers unless explicitly described otherwise. Google’s Science publication strengthens peer-review status but does not remove scale and practical-use limits.
- No item with only a date-level timestamp was treated as having passed a strict hourly cutoff unless another first-party timestamp or artifact record supplied the boundary evidence.
