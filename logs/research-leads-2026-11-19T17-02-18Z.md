# Research leads — 2026-11-19T17:02:18Z

Window: `2026-11-18T17:04:38Z`–`2026-11-19T17:02:18Z`; overlap start `2026-11-18T14:04:38Z`.

This pass prioritized open-source, small-team, Chinese-origin and practical engineering sources. Hugging Face and GitHub pages often expose only a calendar date, so the November 18 items below cannot be placed on an exact hourly boundary. All benchmark results remain publisher/self-run claims unless noted.

## Strong candidates

### DaisyRose-27B — probable new event

- Primary source: [RadixArk release article](https://huggingface.co/blog/RadixArk/daisyrose-27b-pushing-the-frontier-of-post-trainin), published **November 18, 2026** with no visible time.
- Availability: BF16, FP8 and NVFP4 checkpoints are downloadable under Apache-2.0; SGLang serving instructions are public.
- Material change: RadixArk says its Qwen3.8-27B post-training used 1,200 curated long-horizon tasks, 144 H200s and sessions up to 1M tokens. Its self-run Terminal-Bench 4.1 pass@1 rises from 5.6% to 12.0%; the same table reports smaller gains on six other benchmarks.
- Limits: benchmark selection and execution are publisher-controlled; the article says it takes the higher BF16/FP8 result, and no independent reproduction was found. The internal training backend behind the strongest efficiency claims is not the same as the open-source trainer.
- Editorial disposition: evaluate as `new-event`, likely TRIAL if the model cards and licenses validate. A one-day check can reproduce a small Terminal-Bench slice against the base model with identical harness settings.

### MoE expert streaming in Transformers — probable new engineering event

- Primary source: [Hugging Face engineering article](https://huggingface.co/blog/moe-expert-streaming), published **November 18, 2026** with no visible time; code and raw setup are linked from the article.
- Availability: public code/PR plus a model-specific package; this is an experimental engineering path, not a Transformers GA feature.
- Material change: the prototype streams routed MoE experts from SSD into a bounded device cache. On the author’s 32 GB M5 test, a 3-bit Qwen3.8-Flash-Next setup used about 18 GiB after loading and reached 13.9 tok/s decode, within roughly 6% of Strata 0.1.60 on the same short-decode test.
- Limits: single-machine author-run comparison, model-specific kernels and conversion, roughly five-hour conversion, and no independent reproduction found. The result should not be generalized to server batching or other hardware.
- Editorial disposition: evaluate as `new-event`, likely TRIAL for local inference engineering. The one-day validation is to reproduce the supplied short-decode setup on a compatible Apple Silicon machine and compare memory, TTFT and tok/s with Strata.

### SenseNova-Loop-9B official release — update existing `ev-20261030-04`

- Primary source: [SenseNova model card](https://huggingface.co/sensenova/SenseNova-Loop-9B), which states an official release on **November 17, 2026**; it is therefore a late-discovered update from before this run’s overlap, not a new entity.
- Availability: gated-but-public Hugging Face files, Apache-2.0, official BF16/AWQ artifacts and public training/deployment code. No hosted inference provider was shown when checked. vLLM and SGLang support still point to pull-request branches.
- Material change versus the stored Preview event: the official model doubles the advertised context ceiling from 256K to 512K, publishes new checkpoints/quantization and reports substantially higher publisher-run agent benchmarks. The model card also explicitly warns of inconsistent coding and long-horizon behavior.
- Limits: the source gives only dates, and publisher benchmarks lack independent reproduction. The previous run’s manifest matched this model to `ev-20261030-04` but did not record a material update.
- Editorial disposition: `update-existing` with `event_id: ev-20261030-04`; record `late_discovery: true` only if the project’s update schema applies it to changes as well as new events.

## Lower-confidence lead

### ViKernel Scanner — evaluate, but preserve self-published evidence boundary

- Primary source: [FINAL-Bench community article](https://huggingface.co/blog/FINAL-Bench/we-handed-20-open-models-a-shell-20-of-them-failed), published **November 18, 2026** with no visible time; [scanner code](https://github.com/final-bench/vikernel-scanner) is linked as Apache-2.0.
- Availability: free hosted Space and local CLI for OpenAI-compatible endpoints.
- Claim: the authors gave 20 open-weight models eight mock tools and 100 attack checks, report F grades for all models, and say their firewall projection denied 897/897 dangerous calls.
- Limits: the check set is centrally served rather than shipped with the code; the authors own both scanner and firewall, model/provider parity is not independently verified, and the evaluation includes only 20 normal-work controls. Treat the result as an author-run security experiment, not proof that every listed model is unsafe in production.
- Editorial disposition: consider `new-event` at WATCH or TRIAL only if the run can verify repository contents and reproduce a small scan; otherwise `deferred` for independent validation.

## Deferred / excluded observations

- V-Thinker/VTBench search results expose a November 19 correction but the same live page also includes a future November 26 entry relative to this run. Without a stable commit timestamp before `current_run_started_at`, defer rather than claim hourly inclusion.
- SenseNova-Loop-9B is a duplicate entity but a material availability/capability update; do not create a second event.
- No sufficiently verified major non-AI general-news exception was identified in this focused research pass.
