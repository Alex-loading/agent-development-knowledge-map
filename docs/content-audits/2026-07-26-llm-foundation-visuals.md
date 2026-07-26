# LLM 基础视觉教学系统审计

## 发布前基线

- 功能分支：`feat/llm-foundation-visual-system`
- 基线提交：`24bc4ba7e5fe3805bb70fd27a6246af80f6b019d`
- 建立工作树时的 `origin/main`：`d4a3c8b01ed840421b2cc2ca59997c0afe9bdc44`
- 隔离工作树：`.worktrees/llm-foundation-visual-system`
- `npm test`：319 / 319 通过
- `git diff --check`：通过
- GitHub CLI 登录与仓库读取：通过
- Vercel 项目链接：已核对 `.vercel/project.json`
  - 项目：`agent-development-knowledge-map`
  - Project ID：`prj_my3aISdykLrqWFBtSetO9Ixi3Hlw`
  - Team ID：`team_u7X1xS2vwrojoOxfkxMgxkEC`
  - 生产域名：`https://agent-development-knowledge-map.vercel.app`
- 本机未安装全局 Vercel CLI；发布阶段继续使用已经验证成功的 Vercel REST/API 路径，并在发布前重新校验项目、提交 SHA、部署状态与生产别名。
- 当前尚未完成：视觉证据清单、图形资产、浏览器验收与生产部署。

## 视觉证据与许可冻结结果

- 冻结清单：[LLM 基础视觉主张、来源与许可冻结清单](../research/2026-07-26-llm-foundation-visual-inventory.md)
- 冻结日期：2026-07-26
- 视觉条目：40
- 课程分布：`llm-01` 至 `llm-08` 各 5 项
- 认知结构：每课 1 项 overview、至少 2 项机制/过程/关系图、至少 1 项边界/对比/失败模式/决策图
- assessed coverage：每项至少绑定一个与 cognitive question/storyboard 直接吻合的学习目标、quiz、练习步骤、完成标准或面试判断；40 项均映射到对应知识笔记的真实 section ID
- 来源：每项 `sourceIds` 均取自对应 section 的已核验来源范围；课程字段仅作为 coverage basis

### 许可决策汇总

| decision | count | 处置 |
| --- | ---: | --- |
| `original-synthesis` | 40 | 从空白画布制作，只重组来源支持的事实与关系，不复制、裁剪、翻译或近似临摹第三方图像。 |
| `licensed-reproduction` | 0 | 本轮未选择第三方原图。 |
| `licensed-adaptation` | 0 | 本轮未选择第三方改编。 |
| `official-media` | 0 | 本轮未选择官方媒体素材。 |
| `link-only-original-replacement` | 0 | 没有必须保留链接的不可替代第三方图；全部直接冻结为原创方案。 |

没有把论文发布页、课程页、视频页、仓库许可证、转载页或搜索摘要推断为图片再分发/修改许可。由于没有第三方媒体复用需求，本轮没有可适用的许可证 URL。任何后续第三方图片需求都必须重新进入许可发布门，补齐原始语境、作者、图号、实际许可证或媒体政策 URL、再分发和修改权限、版本、获取日期及修改记录后才能入站。

### 状态与阻塞处置

| status | count | 处置 |
| --- | ---: | --- |
| `verified` | 40 | section、考核映射、来源、原创决策与 storyboard 七要素已冻结，可进入原创制作。 |
| `blocked` | 0 | 当前没有阻塞项。若后续证据或媒体许可不足，条目必须停在发布门外并改为 `link-only-original-replacement` 或继续原创，不得猜测许可。 |

本节更新的是“发布前基线”之后的内容状态；图形资产制作、数据注册、页面组件、浏览器验收和部署仍由后续任务完成。

### assessed coverage 语义复核

规格审查后对 40 项重新执行了逐行语义复核，而不是只检查字段路径是否存在：

1. 从 `src/data/llm-foundation.js` 展开每个引用的学习目标、quiz prompt、练习步骤、完成标准和面试题全文；面试判断同时核对其 short answer 与 deep dive。
2. 将课程字段原文与该图的 cognitive question、nodes/regions、caption、alt 和 long-description outline 并排比较。
3. 只有图能直接回答该判断，或明确覆盖该考核结果的必要子步骤时才保留映射；仅“属于同一课程”或字段范围过宽不算覆盖。
4. 修正两处错误 quiz：有限重试状态机移除与不可信文档优先级相关的 `quiz-llm-07-2`，改用结构校验面试判断、练习步骤和完成标准；Prompt Injection 防御图由评测集来源题 `quiz-llm-08-2` 改为系统性防线题 `quiz-llm-08-1`。
5. 自回归生成图明确收窄为“不更新参数的标准推理”，改绑训练/推理目标与面试判断；泛化曲线移除与梯度、学习率、激活函数相关的完成标准。
6. 同轮还删除了训练/推理边界、tokenization、训练阶段、logit/softmax、因果可见性、版本评测与 grounding 图中的过宽或非必要引用，避免用数量夸大 assessed coverage。

复核后仍为 40 / 40 项各至少一个直接语义映射，许可决策与 blocked 数量不变。
