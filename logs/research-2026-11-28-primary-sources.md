# Primary-source research — 2026-11-28 run

- Scan window: `[2026-11-27T17:03:18Z, 2026-11-28T17:06:57Z]`
- Retrieval overlap start: `2026-11-27T14:03:18Z`
- Research boundary: official release APIs, fixed-source feeds, official Hugging Face model records, and active-discovery leads. Community attention was used only to find leads.

## Candidates with a recommended disposition

### Qwen Code 0.29.0 — `update-existing` (`ev-20260922-04`)

- The [official GitHub release](https://github.com/QwenLM/qwen-code/releases/tag/v0.29.0) was published at `2026-11-28T10:00:05Z`; the [desktop release](https://github.com/QwenLM/qwen-code/releases/tag/desktop-v0.29.0) followed at `2026-11-28T11:24:42Z`. Both are inside the scan window and are downloadable now.
- Material change: managed Turns can resume after Broker failover after the surviving Hosted Harness records the tool result and verifies the original prompt/checkpoint. The release also preserves workspace memory across task worktrees and adds fail-closed preflight/VM staging for untrusted PR verification.
- Stage and limits: shipped open-source release, with no declared breaking changes. Reliability and security claims are backed by project tests and linked pull requests, not independent production evidence.
- Why it changes the existing judgment: this advances the same durable-agent and isolated-verification line already tracked in `ev-20260922-04`; it is not a separate event. Keep `TRIAL`, and rewrite the one-day action around forced Broker failover, exact-once side-effect reconciliation, and untrusted PR execution in a staged VM.

### LiteLLM 1.108.20 LTS — `update-existing` (`ev-20260913-01`)

- The [official signed LTS release](https://github.com/BerriAI/litellm/releases/tag/v1.108.20) was published at `2026-11-27T21:37:18Z`, inside the window. The project provides a `cosign verify` command and states that the `lts` image tag now points to this release.
- Material change: it rejects non-string Anthropic `tool_call_id` values before they reach the provider, fixes cancelled OpenAI/Azure Responses streams so provider-reported usage is retained, and repairs `GET /audit` failures for rows written before or after team/key updates.
- Stage and limits: production LTS patch; the notes say no upgrade action is required. Evidence is maintainer release notes and project tests, not independent gateway telemetry.
- Why it changes the existing judgment: the billing and audit fixes affect cost/accountability rather than adding a new provider. Update `ev-20260913-01`, keep `TRIAL`, and regression-test cancellation billing plus historical audit rows before rollout.

### Kintsugi-27B — `new-event`, `late_discovery: true` (recommended `TRIAL`)

- The [official Hugging Face repository](https://huggingface.co/CaryPalmer/Kintsugi-27B) was created at `2026-11-20T19:53:25Z` and materially updated at `2026-11-27T14:07:51Z`, four minutes after the overlap start. At research time it reported roughly 22.9k downloads and 187 likes. The 10.5 GB GGUF weights are public and ungated under Apache-2.0; the base model is Qwen3.8-27B.
- The [model card](https://huggingface.co/CaryPalmer/Kintsugi-27B/blob/main/README.md) describes a 2.47-bits-per-weight build intended to keep the full 262,144-token context on one 12 GB GPU. It provides Windows/Linux bundles, a Mac path, benchmark harness links, exact file hashes, and known compatibility limits. Stock llama.cpp, Ollama and LM Studio cannot load it because it needs the author's llama.cpp fork with EXL3 trellis kernels.
- Evidence boundary: the author reports AppWorld `294/336` versus BF16 `293`, BFCL `505/800` versus BF16 `461`, and perfect synthetic recall at 245k tokens. Those are publisher-run results; the BFCL setup differs, most comparisons are one run, and no controlled independent reproduction was found. Community reports are adoption signals, not validation.
- Why `TRIAL` is defensible: the public weights, runnable bundles, scripts and hashes support a one-day test on a 12–16 GB machine. Compare the exact bundle against Qwen3.8-27B at matched prompts on a small coding/tool-use set, record task success, malformed tool calls, memory use and tokens/s, and stop if the fork-only runtime complicates operations. Do not claim parity with BF16 until independently reproduced.

## Explicitly filtered or deferred leads

- **llama.cpp builds b12830–b12833 — `filtered` (`minor-update`)**: [b12830](https://github.com/ggml-org/llama.cpp/releases/tag/b12830) fixes K2 Horizon tool-call parsing inside a reasoning block; subsequent builds add s390x optimization, a concat backward pass and WebGPU `CONV_TRANSPOSE_1D`. These are useful continuous-build changes but do not justify a separate intelligence event without broader release/adoption evidence.
- **Tencent `Hy-Embodied-Apexio-1.0` — `deferred`**: the [official API record](https://huggingface.co/api/models/tencent/Hy-Embodied-Apexio-1.0) shows an ungated public repository created `2026-11-27T05:46:43Z`, but it has no model card, files, downloads or likes. There is nothing usable or verifiable to evaluate yet.
- **Hugging Face Trainium3/LTX-2.5 article — `filtered`**: the [official blog post](https://huggingface.co/blog/video-trainium3) is dated `2026-11-27T00:00:00Z` and is a training tutorial, not a new model, chip release or independent performance result. The previous run already recorded this disposition.
- **Reported GPT-6.2 allowance percentages and Claude sabotage claims — `deferred`**: no public first-party release note, policy page, incident report or reproducible artifact confirming the reported figures/claims was found. Do not promote community or digest wording to fact.
- **Reported OpenAI–Apple litigation — `out-of-scope` for the AI event store at this evidence stage**: active discovery found secondary reporting, but no court docket or party filing was verified during this pass. It is not suitable for the exceptional general-news slot without the primary filing and a demonstrated broad technical/market consequence.

## Coverage and limitations

- Fixed official feeds for OpenAI, Anthropic, Google, GitHub, Hugging Face, Mistral, NVIDIA, Microsoft Research and xAI showed no other clearly in-window release requiring a new event in this research pass. Full monitor completion remains the main run's responsibility.
- arXiv's latest `cs.AI` feed entries were dated November 25, so no paper was treated as a November 27–28 publication.
- Hugging Face's global repository stream is too high-volume for a complete chronological day scan through its bounded public API. The fixed organization monitors and recall audit are therefore necessary; absence from this note is not evidence that no other repository exists.
