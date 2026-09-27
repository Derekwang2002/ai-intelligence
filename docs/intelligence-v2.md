# MATRIX 情报产品 v2

MATRIX 继续以文件知识库为唯一来源，Astro 在构建时生成只读网站。阅读功能在浏览器本地运行；没有账号、服务端数据库、在线模型调用或通知。

## 阅读路径

主导航：今日、事件、项目、洞察、关注。日报从今日进入；洞察内为趋势、雷达、专题；页脚有来源覆盖和方法说明。所有内容都有中文和英文页面，旧事件、日报、快照 URL 不变。

今日按上海日期提供今天、近七天与自上次读完。变化记录的 `discovered_at` 决定阅读日期，`occurred_at` 保留真实发生时间。未读使用 ID 集合，不能按时间水位截断，否则迟到收录会漏掉。页面访问本身不标为已读；“以上内容已读”仅标记当前可见页。迁移的 `historical: true` 不进入未读，仍可按日期查看。

关注、收藏和已读是三个独立集合。关注决定排序和匹配，同时保留 `importance: major` 变化。导入合并集合，导出 JSON 可手动跨设备迁移。存储异常只影响偏好，不能阻断阅读。

## 数据契约

- `projects/catalog.json`: `{version:1, projects:[{id,name_zh,name_en,type,aliases,event_ids,source_ids,changes?}]}`。稳定 ID 必须来自明确项目身份；研究论文可以暂不归属项目。
- `sources/catalog.json`: `{version:1,sources:[{id,url,title,publisher,kind,official,verification,published_at,last_checked_at,checks}]}`。`official` 可为空；材料类型与官方身份分开。`checks` 记录 `checked_at/status/method/note/content_hash?`。状态为 success/changed/unchanged/failed/not_checked。没有记录显示未知；“成功访问”不意味着结论核实。
- 事件 `evidence[]`: `{id,claim_zh,claim_en,source_ids,event_ids,relation,verification}`。证据必须有实际引用。趋势使用相同结构，并保留旧文本数组；未准确映射的历史文本不生成链接。
- 对象 `changes[]`: `{id,kind,occurred_at,discovered_at,summary_zh,summary_en,evidence_ids,historical,before?,after?,importance?}`。支持事件、项目、趋势、专题。kind 仅为 new/update/correction/recommendation/trend；routine review 不允许进入变化列表。correction/recommendation 必须保存 before/after。
- `topics/catalog.json`: `{version:1,topics:[{id,question_zh/en,answer_zh/en,boundary_zh/en,questions_zh/en,trend_ids,evidence_ids,as_of,changes?}]}`。
- `briefings/<run-id>.json`: `{id,as_of,date,change_ids,highlights:[{change_id,reason_zh,reason_en}],coverage_zh,coverage_en}`。最多五个必读，且必须引用本次真实变化。历史恢复使用 historical；迁移基线使用 baseline。
- `reviews/queue.json`: `{version:1,reviews:[{id,event_id,due_at,trigger,status,last_result,last_checked_at}]}`。状态 pending/completed；无结果复核更新下次时间而不虚报完成。官方承诺日期优先，否则第 7/30 天。

`summary` 与 `summary_en`、`why_it_matters` 与 `why_it_matters_en` 保持一致。所有新读者文案必须双语。未实质变化不修改 `last_updated_at`；检查时间单独记录。

## 构建与工具

```sh
node scripts/migrate-intelligence.mjs          # 差异预演
node scripts/migrate-intelligence.mjs --write  # 幂等迁移，不改 checkpoint
node scripts/validate-intelligence.mjs
npm --prefix site run check                    # 校验 + 单元测试 + 完整构建
npm --prefix site run dev -- --host 127.0.0.1
npm --prefix site run test:browser             # 对本地 4321 的浏览器验证
```

`prepare-data.mjs` 先校验所有引用与必要双语字段，再输出构建数据和浏览器搜索索引。它不写知识库。Markdown 清理保留阅读格式，拒绝脚本、危险协议及协议相对地址。浏览器搜索结果使用 textContent/DOM 构造，不注入原始 HTML。

历史迁移导入已有摘要，不声称重新验证原事实。只对明确记录恢复更新，不推断以前的建议。`import-recorded-briefing.mjs` 仅用于一次性恢复 2026-09-27 已保存日报，不用于未来采集。

## 增量扫描与失败恢复

1. 记录 UTC 开始时间。`node scripts/collect-sources.mjs --started=<UTC>` 获取固定公开入口，输出本地抓取 manifest。原始抓取目录忽略入库。
2. Agent 实际阅读材料，结合 `radar.yaml` 全领域搜索完成日期核实、去重及候选判定。固定入口覆盖不能被当作整个 AI 领域覆盖。
3. 到期任务检查、每周近三十天定向补漏与事件分析共享证据。记录具体覆盖范围，未处理任务保持 pending。
4. 写入事件及所有关联数据、双语日报和趋势快照、当前趋势与索引、来源检查记录、复核队列和本次简报。准备 run manifest，标明每阶段完成状态、候选处置和已写文件。
5. `node scripts/finalize-run.mjs --manifest=logs/run-<id>.json` 预检；确认真实完成后加 `--commit`。工具检查必需来源、双语报告结构、文件清单、数据引用、索引，再执行测试/构建，并用并发 checkpoint 比较防止覆盖其他扫描。
6. checkpoint 是最后一次持久化知识库写入，值是运行开始时间。最后重新构建站点生成新的资料截至时间。

任一失败保留旧 checkpoint，日志记录失败阶段和恢复方案。失败抓取可以使用实际可读的官方页面或 web 工具替代，记录原失败与替代方法；不能直接把失败改成成功。恢复后重跑去重，不重复生成变化。

## 验收与维护

浏览器测试覆盖主页、跨页个人状态、搜索、前沿筛选、存储不可用、减少动态和三种宽度的双主题。新增页面还需检查长标题、外链、键盘焦点和 GitHub Pages 子路径。链接网络检查独立于构建执行，避免临时网络波动破坏历史页面。

来源失效不会删除已有事件。过去无法确定的内容保持历史标识和原文引用，后续实质更正使用新的 correction 记录。阅读页显示档案边界，不用“已检查”暗示 benchmark 已独立复现。

## 复核与发布门禁

`node scripts/review-agenda.mjs` 输出按对象合并的到期复核以及定向补漏是否到期。核验结论、来源、下次复核时间写入队列；无新信息不创建变化。

普通构建拒绝包含晚于 checkpoint 的未提交简报。`finalize-run.mjs` 仅允许构建当前命名的候选运行，通过来源、双语、关联、测试、构建和链接检查后原子推进 checkpoint。失败时不发布候选数据。

项目的 `current_judgment_event_id` 指向当前判断的事件依据，避免重复维护事实。新增相关事件改变判断时同步更新该指针。`official_source_ids` 只保存已确认发布主体的入口；`last_reviewed_at` 与实质更新分开。专题保存双语 `review_trigger_zh/en`。

更新 `trends/current.json` 后执行 `node scripts/render-current-trends.mjs`，从稳定顺序和复核记录生成 `current.md`。校验会拒绝两份当前看板不一致的提交。
