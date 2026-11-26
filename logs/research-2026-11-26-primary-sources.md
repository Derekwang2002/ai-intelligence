# Primary-source research log — 2026-11-26

Run started: `2026-11-26T17:03:09Z`  
Window: `[2026-11-25T16:58:49Z, 2026-11-26T17:03:09Z]`  
Overlap start: `2026-11-25T13:58:49Z`

## Coverage completed

- Read all 36 fixed monitor captures; all requests succeeded.
- Compared stable releases for Qwen Code, Codex, Claude Code, Gemini CLI, LiteLLM and MCP SDKs.
- Checked official model and organization feeds, including Chinese and other non-English publishers.
- Read current Hugging Face engineering posts and arXiv AI submissions, then followed primary artifacts.
- Searched open-source inference, document AI, agent reliability, agent security, infrastructure, policy, small teams and exceptional general news.
- Completed the due 30-day review for P-H3-Image.

## Verified candidates

- Qwen Code 0.28.6: official GitHub release, exact timestamp, update to an existing event.
- FlashInfer NVFP4 attention: NVIDIA technical article, merged FlashInfer PR and Reactor deployment report. Performance is publisher/deployer reported; manual quality review only.
- Nemotron 3.5 Parse assets: official Hugging Face article, public datasets, weights, recipe and DFlash2. Performance is publisher-run.
- llama.cpp AMD dashboard: public dashboard, raw results and reusable workflows; initial scope is two systems.
- Hugging Face swarm training: public TRL recipe on a toy task; no production-transfer evidence.
- Coding Agents Over-Edit: arXiv paper, 7,660 resolved trajectories; no public code or human validation.
- Attack Policy Selection in Monitor Evaluations: arXiv paper; no public code and proxy-trajectory realism remains open.

## Time and access limits

- GitHub Copilot code-review billing notes and OpenAI healthcare model configurations expose dates without times. Their placement after the previous hourly checkpoint could not be established, so both remain deferred.
- The FlashInfer implementation PR predates this window; the new event is the current technical disclosure and production evidence, not the old merge date.
- No fixed monitor failed. No exceptional general-news candidate met the evidence and impact threshold.

## Recall audit follow-up

- Recovered Raon-1 mini as a late-discovered final open-weight release. Its November 24 creation timestamp is preserved.
- Recovered the shorter GRH Lean repository, with machine checks separated from mathematical review.
- Recorded llm.asm as IGNORE: public code is useful for systems study but does not justify product adoption.
- The New York Times Photoshop warning relies on reported internal guidance rather than a new public Adobe policy; filtered.
- A social post about GPT-6.2 allowance corrections could not be matched to a public official statement with the quoted percentages; deferred.
- OCRia-1's release predates the overlap; the in-window model-card link update is not a new model event.
- The Rockbox port is a case study rather than a reusable capability release.
