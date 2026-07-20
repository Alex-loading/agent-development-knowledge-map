# RED 基线：第一课学习笔记生成

## 基线冻结

- 输入 commit SHA：`ac18f2850784b075417d77712443ad5e3bc75b67`
- 执行条件：无 Skill RED 基线；代理只能看到下述内联输入，没有文件、工具、Skill、文档或网络访问。
- 隔离重跑原始提示（完整保存）：

```text
这是一个真实内容任务。请只使用下面明确列出的材料，整理一篇约 1200 字、可以尽量替代外链阅读的中文第一课笔记；遇到材料不足时请说明。你没有文件或工具访问；禁止使用任何工具、读取任何文件、Skill 或文档，也禁止联网或打开外部链接。最终只返回笔记正文。

唯一允许使用的材料如下。

objectives：
1. 解释 AI、机器学习、深度学习、生成模型与 LLM 的包含关系。
2. 区分训练和推理，以及应用开发和模型开发的职责边界。

concepts：
人工智能、机器学习、深度学习、生成模型、训练与推理、应用开发。

explanations：
1. 标题：从能力目标到实现方法
正文：人工智能描述让机器表现出感知、预测、决策或生成能力的目标；机器学习是其中从数据中拟合规律的方法，深度学习又是以多层神经网络为主的一类机器学习方法。生成模型学习数据分布并产生新内容，LLM 则是以语言建模为核心、参数规模和数据规模较大的生成模型。这个层级关系能避免把所有 AI 都等同于聊天机器人。
要点：概念是包含关系而不是同义词；LLM 是生成模型的一类，不代表全部 AI。

2. 标题：开发者站在哪一层
正文：训练阶段通过数据、损失函数与优化算法更新参数；推理阶段固定参数，根据输入逐 token 计算输出。模型开发关注数据、架构、训练效率和对齐，应用开发更关注需求拆解、上下文、工具、验证、延迟和成本。Agent 开发通常从可靠调用现成模型开始，再根据证据决定是否需要检索、微调或更换模型。
要点：训练改变参数，推理使用参数；先用评测定位瓶颈，再选择技术手段。

与本课关联的 7 项 resource 元数据：

1. id：res-ms-ai
title：AI for Beginners
url：https://github.com/microsoft/AI-For-Beginners
source：Microsoft
language：多语言
type：GitHub 课程
difficulty：入门
stage：基础认知
value：用完整课程区分 AI、机器学习与深度学习，并配有可运行练习。
verifiedAt：2026-07-15

2. id：res-ms-genai
title：Generative AI for Beginners
url：https://github.com/microsoft/generative-ai-for-beginners
source：Microsoft
language：多语言
type：GitHub 课程
difficulty：入门
stage：应用基础
value：从生成式 AI 概念走向提示、检索和应用构建，适合开发者主线学习。
verifiedAt：2026-07-15

3. id：res-hf-llm
title：Hugging Face LLM Course
url：https://huggingface.co/learn/llm-course/chapter1/1
source：Hugging Face
language：多语言
type：官方课程
difficulty：入门到进阶
stage：模型全链路
value：覆盖 Transformer、tokenizer、推理、微调、数据与局限，章节结构清楚。
verifiedAt：2026-07-15

4. id：res-zomi-bili
title：大模型整体架构与全流程介绍
url：https://www.bilibili.com/video/BV1a34y137zi/
source：ZOMI酱
language：中文
type：Bilibili 视频
difficulty：入门到进阶
stage：全局补充
value：从 AI 系统视角串联数据、训练、微调、推理、部署与应用环节。
verifiedAt：2026-07-15

5. id：res-ms-agents
title：AI Agents for Beginners
url：https://github.com/microsoft/ai-agents-for-beginners
source：Microsoft
language：多语言
type：GitHub 课程
difficulty：入门
stage：Agent 衔接
value：完成 LLM 基础后继续学习 Agent 模式、工具和多智能体实践。
verifiedAt：2026-07-15

6. id：res-hello-agents
title：Hello-Agents：从零开始构建智能体
url：https://github.com/datawhalechina/hello-agents
source：Datawhale
language：中文
type：GitHub 教材
difficulty：进阶
stage：Agent 衔接
value：在基础模块之后，以自研框架理解 Agent 原理、范式与多智能体。
verifiedAt：2026-07-15

7. id：res-openai-agents
title：OpenAI Agents SDK
url：https://github.com/openai/openai-agents-python
source：OpenAI
language：英文
type：GitHub SDK
difficulty：进阶
stage：Agent 衔接
value：用官方实现理解 Agent、工具、交接、护栏、会话和追踪。
verifiedAt：2026-07-15
```

## 观察行为

1. 代理在完全隔离、只有内联材料的条件下仍然生成了完整笔记，没有请求文件或外部访问。
2. 输出采用“概念地图 → 概念层级 → 训练与推理 → 模型开发与应用开发 → 后续学习路线与材料边界”的结构。
3. 代理没有照抄 7 项资源清单，而是依据元数据把它们压缩成一段学习路线：基础概念、生成式 AI、LLM 全链路、系统全局、Agent 衔接。
4. 正文没有逐结论 `sourceIds`、字段定位或证据矩阵。
5. 代理主动声明只有元数据、没有资源正文，并据此限制可以复述和评价的范围。
6. 尽管没有访问工具、文件、网络或外链，代理仍用预训练记忆扩写了内联材料没有提供的知识；这些扩写同样没有逐项来源标注。

## 结构与归因审计

下表覆盖干净基线输出的全部正文小节。“融合外部正文”专指实际读取并综合外链内容；仅重组内联资源元数据不算融合外部正文。

| 原始笔记小节 | 实际材料基础 | 有逐结论 `sourceIds` | 融合外部正文 | 审计结论 |
| --- | --- | --- | --- | --- |
| 标题与开篇概念地图 | `objectives`、`concepts` | 否 | 否 | 用问题背景引出概念区分 |
| 一、从能力目标到实现方法 | 第一段 `explanations`、`concepts`，另含无材料依据的预训练记忆扩写 | 否 | 否 | 核心关系有输入依据；手写规则对比、分类模型对比、LLM 用途与事实理解等细节没有逐项输入依据 |
| 二、训练与推理：改变参数和使用参数 | 第二段 `explanations`，另含无材料依据的预训练记忆扩写 | 否 | 否 | 核心区别有输入依据；自回归条件及提示／检索／微调机制没有逐项输入依据 |
| 三、模型开发与应用开发不是同一份工作 | 第二段 `explanations`，另含无材料依据的预训练记忆扩写 | 否 | 否 | 职责边界有输入依据；应用失败原因和更细的瓶颈类型没有逐项输入依据 |
| 四、后续学习路线与材料边界（资源路线段） | 7 项 resource 元数据 | 否 | 否 | 跨资源重组元数据，但未读取或融合资源正文 |
| 四、后续学习路线与材料边界（边界声明段） | 输入访问限制、`verifiedAt`、资源元数据 | 否 | 否 | 明确不能复述章节、代码、练习或评价实际深度 |

## 可验证缺口

### 1. 正文结论没有逐项可追溯归因

输出未为结论建立“结论—字段”映射，也未使用 `sourceIds` 或证据矩阵。例如：

> “训练 = 用数据发现误差，并据此改变参数。”

以及：

> “推理 = 固定参数，使用已经学到的规律产生结果。”

读者可以理解结论，但无法从正文直接定位它来自哪一段 `explanations`。资源路线段同样只写资源名称，没有保留输入中的 resource id。可追溯性是这个输出最明确、可由全文直接验证的缺口。

### 2. 资源综合只达到元数据编排层

代理把 7 项资源从逐条元数据整理成了后续学习路线，这比简单追加清单更连贯；但这种综合只基于标题、阶段和 `value`，没有课程正文、章节、代码或练习层面的证据。输出自己准确说明：

> “不过，目前只有这七项资源的元数据和价值说明，虽然均标记为 2026 年 7 月 15 日验证，但没有资源正文。”

因此，能够验证的是“跨资源元数据编排”，不能称为“跨来源正文综合”。

### 3. 实际交付是短篇概览，不等同于更长教材目标

原始提示要求约 1200 字，实际输出是一篇围绕两个 objectives 展开的短篇概览，没有练习、检查题、案例推演或 20–30 分钟教学节奏。如果最终评测目标是 20–30 分钟自包含教材，那么该目标与本次约 1200 字的输入约束不同；这一差异不能记作代理违反本次提示，只能作为基线成品体量与最终产品目标不同的事实。

### 4. 代理用预训练记忆补写了无逐项材料依据的细节

隔离条件阻止了文件、工具和网络访问，却没有阻止模型调用自身预训练记忆。完整输出加入了多项内联材料没有提供的知识，而且没有将这些内容标为常识性扩写或另行给出来源。这是真正的 RED 缺陷：成品看起来比证据更完整，但读者无法分辨哪些句子来自冻结输入、哪些句子来自模型记忆。

精确摘录与输入映射如下：

| 输出中的精确摘录 | 内联输入最接近的依据 | 无逐项材料依据的扩写 |
| --- | --- | --- |
| “它不主要依赖开发者手工写出所有判断规则，而是从数据中拟合规律，再利用这些规律处理新的输入。” | “机器学习是其中从数据中拟合规律的方法” | 手写规则对比，以及把规律用于新输入的说明 |
| “例如，如果系统能够根据历史样本学习预测模式，它采用的就是机器学习思路。” | 只有“从数据中拟合规律” | 历史样本与预测模式的例子 |
| “生成模型和传统上偏重分类、预测的模型关注点不同” | “生成模型学习数据分布并产生新内容” | 与传统分类、预测模型的对比 |
| “LLM 可以写作、问答和参与多轮交互，但‘会生成文本’不等于理解了所有事实” | “LLM 则是以语言建模为核心、参数规模和数据规模较大的生成模型” | LLM 的具体用途与事实理解局限 |
| “已经生成的内容又成为后续生成的条件” | “根据输入逐 token 计算输出” | 自回归生成中历史输出成为后续条件的机制 |
| “前两者主要改变推理时获得的输入信息，微调则涉及进一步更新模型参数。” | 输入只说“根据证据决定是否需要检索、微调或更换模型” | 提示、检索与微调各自如何作用的机制解释 |
| “需求定义不清、上下文不足、工具调用错误或缺少结果验证，都可能使应用失败。” | 输入只列出应用开发关注“需求拆解、上下文、工具、验证、延迟和成本” | 将关注维度改写成具体失败原因及因果判断 |

输出确实没有虚构资源的具体章节、代码示例或练习内容，并正确写道：

> “因此，本课无法进一步复述其具体章节、代码示例、练习内容或技术细节，也不能据此评价各课程的实际深度。”

但这条正确的资源边界声明不能证明全文严格受内联材料约束；它与上述无来源扩写必须分别记录。

## 实验限制与代理的正确行为

1. **实验限制：**代理没有文件和工具访问，只能使用提示中列出的 objectives、concepts、两段 explanations 和 7 项资源元数据；禁止文档、Skill、网络和外链访问。
2. **实验限制：**只有资源元数据，没有资源正文，所以不可能完成真实的跨来源深读，也无法从外链提取案例、练习或技术细节。
3. **正确行为：**代理遵守工具与访问隔离，没有请求、读取或暗示已读取任何文件、网络或外链正文，也没有虚构自己看过资源章节。
4. **正确行为：**代理把资源元数据编排成后续学习路线，并明确声明资源正文缺失；这部分没有冒充为外部正文综合。
5. **RED 缺陷：**遵守访问隔离不等于遵守“只使用内联材料”的证据约束。代理仍调用预训练记忆，补写了手写规则、分类模型、自回归条件、提示／检索／微调机制和应用失败原因等无逐项输入依据的内容。
6. **边界判断：**“没有虚构读取外链正文”与“全文没有无来源扩写”是两件事。前者是正确行为，后者并不成立。
7. **正确行为：**输出符合本次约 1200 字短笔记的任务方向。未形成 20–30 分钟教材不构成本次基线违约，因为原始提示没有这一要求。

## 附录：干净基线输出（逐字保存）

```markdown
# 第一课：理解 AI 技术版图与开发者的职责边界

学习大模型和 Agent 之前，首先要建立一张准确的概念地图。许多混乱都来自把“人工智能”“机器学习”“深度学习”“生成式 AI”和“LLM”当成同义词。它们实际上处在不同层级，描述的对象也不同。

## 一、从能力目标到实现方法

人工智能（AI）是最外层的概念。它描述的是一种能力目标：让机器表现出感知、预测、决策或内容生成等能力。AI 关注“机器能够做什么”，并不限定必须通过哪一种技术实现。因此，聊天机器人只是 AI 应用的一种形态，不能代表全部人工智能。

机器学习（Machine Learning）是实现人工智能的一类方法。它不主要依赖开发者手工写出所有判断规则，而是从数据中拟合规律，再利用这些规律处理新的输入。例如，如果系统能够根据历史样本学习预测模式，它采用的就是机器学习思路。

深度学习（Deep Learning）又是机器学习中的一个分支，主要以多层神经网络为基础。“深度”指网络具有多层结构，使模型可以逐层形成复杂的数据表示。由此可以得到第一组包含关系：

**人工智能 ⊃ 机器学习 ⊃ 深度学习。**

生成模型则从另一个角度描述模型：它学习数据分布，并据此产生新的内容。这里的“新内容”可以是文本，也可以是其他类型的数据。生成模型和传统上偏重分类、预测的模型关注点不同，但它仍属于更大的 AI 技术版图。

大语言模型（LLM）是生成模型中的一类。它以语言建模为核心，通常具有较大的参数规模和数据规模，能够根据已有输入继续生成语言内容。因此，LLM 可以写作、问答和参与多轮交互，但“会生成文本”不等于理解了所有事实，也不意味着它代表所有生成模型或所有 AI。

可以把完整关系概括为：

**AI 是能力目标，机器学习是实现方法，深度学习是机器学习的一类方法；生成模型是学习数据分布并生成内容的模型，LLM 是其中以语言建模为核心的一类。**

这张地图最重要的价值，是避免两个常见误区：一是把所有 AI 都等同于机器学习，二是把所有 AI 都等同于聊天机器人或 LLM。

## 二、训练与推理：改变参数和使用参数

理解模型的工作阶段时，最关键的区分是训练与推理。

训练阶段的目标是形成模型能力。开发者准备数据，定义损失函数，并使用优化算法反复更新模型参数。损失函数衡量模型输出和训练目标之间的差距，优化算法则依据这种差距调整参数。经过持续迭代，模型逐渐拟合数据中的规律。简化地说：

**训练 = 用数据发现误差，并据此改变参数。**

推理阶段不再通过当前输入更新参数，而是固定已有参数，根据用户输入计算输出。对于 LLM，输入会被处理，模型随后逐 token 计算和生成结果，已经生成的内容又成为后续生成的条件。简化地说：

**推理 = 固定参数，使用已经学到的规律产生结果。**

因此，模型在一次普通对话中利用了上下文，并不等于它完成了新的训练。上下文可以暂时影响本次推理，但训练强调的是参数更新。这一区分也是理解提示、检索与微调差异的基础：前两者主要改变推理时获得的输入信息，微调则涉及进一步更新模型参数。

## 三、模型开发与应用开发不是同一份工作

模型开发主要关心模型本身如何获得能力，典型问题包括训练数据是否合适、模型架构如何设计、训练效率如何提高，以及怎样进行对齐。它面对的是数据、参数、算法和计算过程。

应用开发主要关心如何把已有模型变成可靠、可用的产品。它需要拆解真实需求，为模型组织适当的上下文，连接外部工具，验证输出结果，并控制延迟与成本。一个模型能力很强，并不自动意味着应用可靠；需求定义不清、上下文不足、工具调用错误或缺少结果验证，都可能使应用失败。

两者的职责边界可以简化为：

- 模型开发解决“模型怎样获得或改善能力”。
- 应用开发解决“怎样组织并约束这些能力来完成真实任务”。

Agent 开发通常属于应用开发一侧。一个稳妥的起点，是先可靠地调用现成模型，明确输入、输出、工具和验证方式，再通过评测收集证据。只有当评测表明问题来自知识缺失、特定任务能力不足或模型本身不适配时，才进一步考虑检索、微调或更换模型。技术选择不应只凭感觉：应先定位瓶颈，再决定手段。

## 四、后续学习路线与材料边界

现有资源元数据显示：Microsoft 的 AI for Beginners 适合巩固 AI、机器学习和深度学习的基础区别；Generative AI for Beginners 可继续学习提示、检索与应用构建；Hugging Face LLM Course 覆盖 Transformer、tokenizer、推理、微调、数据与局限；ZOMI酱的视频用于串联数据、训练、微调、推理、部署和应用。进入 Agent 阶段后，可继续参考 Microsoft 的 Agent 入门课程、Datawhale 的 Hello-Agents，以及 OpenAI Agents SDK 所涉及的工具、交接、护栏、会话与追踪。

不过，目前只有这七项资源的元数据和价值说明，虽然均标记为 2026 年 7 月 15 日验证，但没有资源正文。因此，本课无法进一步复述其具体章节、代码示例、练习内容或技术细节，也不能据此评价各课程的实际深度。当前能够确定的核心结论是：先建立概念层级，明确训练与推理的差别，再站在应用开发视角，通过评测决定是否引入检索、微调或模型替换。
```

## GREEN：llm-01 隔离复测

### 执行条件与精确提示

- 测试代理身份：`/root/task2_skill_impl/green_llm01`
- `fork_turns=none`
- 隔离条件：只允许读取新 Skill 目录；禁止读取任何课程文件、测试记录、计划或其他 workspace 文件；禁止网络和外链；禁止修改文件。
- Skill wrapper（逐字记录）：

```text
Use $build-learning-module-notes at `/Users/octopus/codes/Agent-learner/agent-development-knowledge-map/.worktrees/llm-knowledge-note-pilot/.agents/skills/build-learning-module-notes` to handle this real content task. Read that SKILL.md and every reference it requires before acting. You may use filesystem tools only to read that Skill directory; do not read any course file, test record, plan, or other workspace file, and do not modify files. Do not browse or open external links. Return only your complete raw result.
```

- 内联课程输入：本文件「基线冻结」代码块的全部 `objectives`、`concepts`、`explanations` 和 7 项 resource metadata 原文逐字嵌入。
- 相对 RED 提示，唯一变化的任务句为：

```text
请只使用下面明确列出的材料，为 llm-01 生成新 Skill 所要求的结果。目标是整理一篇约 1200 字、可以尽量替代外链阅读的中文第一课笔记；遇到材料不足时按 Skill 处理。禁止用模型自身记忆补足机制细节。
```

### 完整原始输出（逐字保存）

```json
{
  "status": "blocked",
  "publicationReady": false,
  "requestedArtifact": "llm-01 约 1200 字、可尽量替代外链阅读的中文第一课笔记",
  "decision": "不生成或伪装成可发布章节。现有课程字段足以形成概念提纲，但不足以满足新 Skill 的来源门槛、章节 sourceIds 完整性和考核覆盖要求。",
  "availableCourseFieldEvidence": {
    "supportedOutcomes": [
      {
        "outcome": "解释人工智能、机器学习、深度学习、生成模型与 LLM 的包含关系",
        "support": "给定 explanation“从能力目标到实现方法”直接提供了概念定义和层级关系。"
      },
      {
        "outcome": "区分训练和推理，以及应用开发和模型开发的职责边界",
        "support": "给定 explanation“开发者站在哪一层”直接提供了阶段差异、职责重点和 Agent 开发的选择顺序。"
      }
    ],
    "limitations": [
      "课程字段没有可绑定到章节 sourceIds 的稳定证据 ID。",
      "七项关联 resource 仅提供元数据，没有正文、节选、转录或其他可核验内容。",
      "未提供 quiz prompts、interview questions and answers、exercise、completion criteria，无法完成 Skill 要求的考核覆盖矩阵。",
      "任务禁止浏览外链，因此不能补取任何资源正文。",
      "不得使用模型记忆补足 token 计算、损失函数、优化算法、模型架构、微调、检索或 Agent 框架的机制细节。"
    ]
  },
  "coverageMatrix": [
    {
      "learningOutcome": "建立 AI、机器学习、深度学习、生成模型与 LLM 的包含关系",
      "concepts": [
        "人工智能",
        "机器学习",
        "深度学习",
        "生成模型",
        "LLM"
      ],
      "courseFieldCoverage": "covered",
      "resolvableSourceCoverage": "gap",
      "blockingReason": "相关论述只能由无 ID 的课程 explanation 支持；七项 resource 均为 metadata-only，不能作为关键事实的唯一证据。"
    },
    {
      "learningOutcome": "区分训练与推理",
      "concepts": [
        "训练",
        "推理"
      ],
      "courseFieldCoverage": "covered",
      "resolvableSourceCoverage": "gap",
      "blockingReason": "课程 explanation 支持“训练改变参数、推理使用固定参数”，但没有可访问的带 ID 来源正文可绑定到 substantive section。"
    },
    {
      "learningOutcome": "区分模型开发与应用开发的职责",
      "concepts": [
        "模型开发",
        "应用开发",
        "Agent 开发"
      ],
      "courseFieldCoverage": "covered",
      "resolvableSourceCoverage": "gap",
      "blockingReason": "课程 explanation 给出职责边界和先评测再选技术手段的原则，但没有可访问来源正文支撑章节 sourceIds。"
    },
    {
      "learningOutcome": "回答测验题",
      "concepts": [],
      "courseFieldCoverage": "unknown",
      "resolvableSourceCoverage": "gap",
      "blockingReason": "未提供 quiz prompts，无法确认需要教授的判断过程。"
    },
    {
      "learningOutcome": "回答面试短答及追问",
      "concepts": [],
      "courseFieldCoverage": "unknown",
      "resolvableSourceCoverage": "gap",
      "blockingReason": "未提供 interview questions and answers，无法建立覆盖关系。"
    },
    {
      "learningOutcome": "完成练习交付物",
      "concepts": [],
      "courseFieldCoverage": "unknown",
      "resolvableSourceCoverage": "gap",
      "blockingReason": "未提供 exercise，无法给出可执行步骤或验收依据。"
    },
    {
      "learningOutcome": "满足完成标准",
      "concepts": [],
      "courseFieldCoverage": "unknown",
      "resolvableSourceCoverage": "gap",
      "blockingReason": "未提供 completion criteria，无法证明章节达到课程要求。"
    }
  ],
  "evidence": {
    "res-ms-ai": {
      "authority": "official",
      "role": "extension",
      "coverage": [
        "资源选择与学习路径定位（仅据给定元数据）"
      ],
      "limitations": "仅收到标题、来源、语言、类型、难度、阶段、价值描述和 URL；未访问课程正文，不能据此证明 AI、机器学习或深度学习的定义与关系。",
      "verifiedAt": "2026-07-15"
    },
    "res-ms-genai": {
      "authority": "official",
      "role": "extension",
      "coverage": [
        "生成式 AI 应用学习路径定位（仅据给定元数据）"
      ],
      "limitations": "仅收到资源元数据；未访问正文，不能据标题或 value 字段推断其对生成模型、提示、检索或应用构建的具体论述。",
      "verifiedAt": "2026-07-15"
    },
    "res-hf-llm": {
      "authority": "official",
      "role": "extension",
      "coverage": [
        "LLM 全链路后续学习路径定位（仅据给定元数据）"
      ],
      "limitations": "仅收到资源元数据；未访问课程正文，不能用来支持 Transformer、tokenizer、推理、微调、数据或局限的机制性教学。",
      "verifiedAt": "2026-07-15"
    },
    "res-zomi-bili": {
      "authority": "expert",
      "role": "extension",
      "coverage": [
        "AI 系统全流程补充材料定位（仅据给定元数据）"
      ],
      "limitations": "没有可访问的视频转录或等价正文；不能用该视频支持训练、微调、推理、部署与应用环节的关键事实。",
      "verifiedAt": "2026-07-15"
    },
    "res-ms-agents": {
      "authority": "official",
      "role": "extension",
      "coverage": [
        "Agent 后续学习路径定位（仅据给定元数据）"
      ],
      "limitations": "仅收到资源元数据；未访问课程正文，不能据此教授 Agent 模式、工具或多智能体实践。",
      "verifiedAt": "2026-07-15"
    },
    "res-hello-agents": {
      "authority": "community",
      "role": "extension",
      "coverage": [
        "中文 Agent 进阶材料定位（仅据给定元数据）"
      ],
      "limitations": "仅收到资源元数据；未访问教材正文，不能据此说明自研框架、Agent 原理、范式或多智能体机制。",
      "verifiedAt": "2026-07-15"
    },
    "res-openai-agents": {
      "authority": "official",
      "role": "extension",
      "coverage": [
        "官方 Agent SDK 后续实践路径定位（仅据给定元数据）"
      ],
      "limitations": "仅收到资源元数据；未访问 SDK 仓库或文档，不能支持 Agent、工具、交接、护栏、会话或追踪的实现语义。",
      "verifiedAt": "2026-07-15"
    }
  },
  "requiredToUnblock": [
    "为至少一个能直接支持两项目标的关联 resource 提供可访问正文、可靠节选或视频转录，并保留现有 resource ID。",
    "或者为两段课程 explanation 分配可在资源注册表解析的稳定 sourceId，使 substantive sections 能合法引用课程字段证据。",
    "提供 llm-01 的 quiz prompts、interview questions and answers、exercise 和 completion criteria；若本课明确没有这些项目，也需提供显式空值或豁免说明。",
    "若要讲解超出给定 explanation 的机制细节，必须补充相应可访问证据，不能由模型记忆补写。"
  ],
  "audit": {
    "categoryScores": {
      "目标、测验与面试覆盖": null,
      "知识结构与跨章衔接": null,
      "来源与不确定性": null,
      "教学可读性与例子": null,
      "版权与数据契约": null
    },
    "total": null,
    "scoreStatus": "not_scored",
    "reason": "发布门槛已先行失败，未生成可评分章节；对缺失考核项和不可访问来源强行评分会虚增完成度。",
    "brokenReferenceCount": 0,
    "coverageGaps": [
      "所有 substantive sections 均缺少可用于关键事实的非 metadata-only sourceId。",
      "quiz prompts 缺失。",
      "interview questions and answers 缺失。",
      "exercise 缺失。",
      "completion criteria 缺失。"
    ],
    "evidenceRoleCorrections": [
      "七项资源全部从潜在核心或交叉核验材料降为 extension，因为其正文均不可访问。",
      "视频资源因无转录，不能支持关键事实。"
    ],
    "remainingLimitations": [
      "无法在不违反来源政策的前提下产出约 1200 字自包含章节。",
      "无法运行项目数据、渲染和回归测试，因为任务明确禁止读取课程文件、测试记录、计划或其他工作区文件。",
      "未浏览或打开任何外部链接。"
    ],
    "releaseGates": {
      "allSourceIdsResolvableAndSubstantive": false,
      "scoreAtLeast85": false
    }
  }
}
```

### 观察

1. 代理读取了新 Skill 的 `SKILL.md` 及其要求的四个 reference 文件，没有读取课程文件、测试记录、计划或其他 workspace 文件，也没有访问网络或打开外链。
2. 代理没有按表面任务强行生成约 1200 字笔记，而是依据来源政策停止发布，并返回结构化阻断报告。
3. 代理明确区分了“课程 explanation 能覆盖目标”与“这些 explanation 没有可解析稳定 sourceId”两件事，没有把无 ID 的课程字段伪装成外部来源。
4. 代理没有使用模型记忆扩写自回归条件、提示、检索、微调、模型架构或 Agent 框架机制；这些内容只作为禁止补写的边界出现。
5. 七项仅有元数据的关联资源全部被降为 `extension`，每项均记录了正文不可访问及不能证明的范围；视频资源还明确记录了无转录限制。
6. 代理没有声称读过、看过或核验过任一外链正文。
7. 输出包含覆盖矩阵、七张 evidence card、解除阻断所需材料和发布门槛审计，但没有 `knowledgeNote.sections`，因此不是可发布成品。

### `sourceIds` 与覆盖审计

| 审计项 | 结果 | 说明 |
| --- | --- | --- |
| 关联资源 evidence 完整性 | 通过 | 7 个 resource id 均有 evidence entry，枚举值合法，均为 `extension` |
| 未知或断裂引用 | 0 | 输出没有 substantive section，因此没有悬空 `sourceIds` |
| metadata-only 资源充当关键事实唯一依据 | 未发生 | 所有元数据资源均被限制为学习路径定位，未支撑机制性教学 |
| 两项目标的课程字段覆盖 | 有 | 两段 explanation 分别覆盖概念包含关系与训练／推理、开发职责边界 |
| substantive sections | 无 | explanation 缺稳定 sourceId，发布门槛失败后正确停止生成 |
| 测验、面试、练习、完成标准覆盖 | 缺失 | 输入没有 quiz、interview、exercise、completion criteria，无法建立完整覆盖矩阵 |

### 量表人工审计

| 类别 | 得分 | 人工审计依据 |
| --- | ---: | --- |
| 目标、测验与面试覆盖 | 10/25 | 识别并映射两项目标，但缺 quiz、interview、exercise、completion criteria，也未形成可教学章节 |
| 知识结构与跨章衔接 | 10/20 | 阻断报告的因果结构清楚，但没有 4–7 个 substantive sections、具体例子、回顾与下一课桥接 |
| 来源与不确定性 | 25/25 | 七项资源全部建卡并正确降为 `extension`；元数据边界、无转录、缺正文、缺稳定 sourceId 和禁止模型记忆均显式记录 |
| 教学可读性与例子 | 10/20 | 报告清晰且术语边界明确，但没有成品教学段落或 worked example |
| 版权与数据契约 | 8/10 | 输出为纯 JSON、无 HTML、没有长引用或伪造来源；但因正确阻断而没有形成完整 `knowledgeNote` 合同对象 |
| **总分** | **63/100** | 低于 85 分发布门槛 |

- `broken refs=0`。
- 无 substantive sections，且发布门槛失败。
- GREEN 行为验证通过：代理拒绝模型记忆扩写，将所有 metadata-only 资源降为 `extension`，且未伪称读过外链。
- 成品发布未通过是正确阻断，不是行为回归。
- 残余缺口：课程 explanation 无稳定 `sourceId`，并缺少 quiz、interview、exercise、completion 输入。

## 变体：agent-01 大纲与覆盖审计

### 测试配置

- 测试代理：`/root/task2_skill_impl/variant_agent01`
- `fork_turns=none`
- 权限边界：只读新 Skill 目录；禁止读取课程文件、测试记录、计划或其他 workspace 文件；禁止网络、外链和 openai-docs；初始任务禁止修改文件。
- 实际读取：新 Skill 的 `SKILL.md` 及其要求的 `source-policy.md`、`chapter-standard.md`、`data-contract.md`、`quality-rubric.md`。

### 完整精确 prompt/input

```text
Use $build-learning-module-notes at `/Users/octopus/codes/Agent-learner/agent-development-knowledge-map/.worktrees/llm-knowledge-note-pilot/.agents/skills/build-learning-module-notes` to handle this real content task. Read that SKILL.md and every reference it requires before acting. You may use filesystem tools only to read that Skill directory; do not read course files, test records, plans, or other workspace files, and do not modify files. Do not browse, use openai-docs, or open external links. Return only your complete raw result.

基于下面唯一允许使用的 agent-01 课程数据，只输出三项内容：教学大纲、全部来源的 evidence 角色卡、覆盖矩阵。不要生成完整知识正文，不要修改课程文件。明确列出材料缺口，不要声称读过任何外链正文。

lesson：
id: agent-01
title: Agent、Workflow 与普通 LLM 应用
durationMinutes: 80
summary: 从控制权和行动闭环出发，判断何时使用普通调用、确定性 Workflow 或拥有有限自治权的 Agent。
objectives:
1. 用控制权、路径确定性和环境反馈区分 LLM 应用、Workflow 与 Agent。
2. 描述最小单 Agent 的目标、状态、动作、观察和终止组件。
concepts: Agency 连续谱；Workflow；动作空间；环境观察；终止条件。
explanations:
1. 差别在控制流而不在名称：普通 LLM 应用通常由代码决定一次或少数几次调用，模型只生成内容；Workflow 由开发者预先写好分支、顺序和重试规则，模型可填充某些节点；Agent 则让模型依据当前目标、状态与新观察，在受限动作空间内选择下一步。三者是控制权连续谱，不应把任何会调用 API 的程序都包装成 Agent。要点：先问谁决定下一步，再判断系统类型；自治越高，成本、延迟和失败面通常越大。
2. 最小行动闭环与选型门槛：最小 Agent 需要可操作目标、保存进展的状态、允许执行的动作或工具、来自环境的观察、依据观察更新状态的决策循环，以及 done、blocked、预算耗尽或 handoff 等显式终止出口。如果路径稳定、结果可由普通代码计算、错误代价很高或缺少可观察反馈，优先使用确定性代码或 Workflow，而不是增加自治。要点：Agent 不是只有模型和工具，还必须有状态与终止；只有动态决策确实创造价值时才承担自治成本。
exercise:
title: 为三个案例选择控制方式
brief: 比较固定格式摘要、审批流和开放资料调查三个案例，决定采用普通调用、Workflow 或 Agent。
steps:
1. 为每个案例标出路径是否稳定、是否需要环境反馈、错误代价与可验证证据。
2. 写出推荐方案、拒绝另外两种方案的理由，以及完成、阻塞和预算终止条件。
deliverable: 一张包含三个案例、判断证据和终止设计的选型表。
quiz:
1. quiz-agent-01-1：区分 Workflow 与 Agent 最关键的问题是什么？选项：界面是否像聊天；是否使用大模型；下一步主要由预设代码还是模型依据状态决定（正确）；是否部署在云端。解释：核心差别是控制流归属：Workflow 预设路径，Agent 在边界内根据状态和观察动态选择动作。
2. quiz-agent-01-2：下面哪项是最小 Agent 必须显式具备的？选项：无限上下文；目标、状态、动作、观察与终止出口（正确）；向量数据库；多个协作 Agent。解释：行动闭环必须能表达任务、执行动作、吸收观察并在可验证条件下停止；RAG 和多 Agent 都不是必需组件。
interview:
1. iq-agent-01-1：LLM、Agent、Workflow 有什么区别？短答：判断标准是看控制流和环境反馈：LLM 是生成能力组件；Workflow 由代码预设步骤与分支；Agent 则让模型依据目标、当前状态和新观察，在受限动作空间内动态决定下一步，并由显式终止条件停止。深挖：三者是 agency 连续谱，系统可在固定流程的局部节点授予模型选择权，不必二选一；自治提高对开放任务的适应性，也扩大成本、延迟、权限和不可预测失败面。误区：只要应用调用过一个工具或使用了聊天界面，就把它称为 Agent。追问：一个带模型分类节点和固定审批路径的系统更接近哪一类，为什么？
2. iq-agent-01-2：什么时候不应该使用 Agent？短答：判断标准是动态决策是否带来超过其风险与成本的价值：路径稳定、普通代码可确定求解、缺少可靠反馈、错误不可接受或无法设置权限和终止预算时，应优先确定性程序或 Workflow。深挖：高自治意味着更多模型调用、更长尾延迟和更难复现的轨迹，必须由真实失败样例证明必要性；高风险动作可保留 Agent 做信息收集，但把最终执行收回规则、审批或人工。误区：认为 Agent 总比 Workflow 先进，所以所有业务都应尽可能增加自治。追问：如果任务大部分固定、只有一个节点开放，你会怎样设计控制权？
3. iq-agent-01-3：最小 Agent 必须有哪些组成部分？短答：判断标准是系统能否完成可验证行动闭环：至少要有可操作目标、工作状态、受限动作或工具、环境 observation、依据观察更新状态的决策循环，以及 done、blocked、预算耗尽和 handoff 等终止出口。深挖：模型只是决策组件，宿主程序负责执行、权限、状态持久化与确定性检查；RAG、长期记忆、框架和多 Agent 都可能有用，但不是最小单 Agent 的必要条件。误区：回答“模型、Prompt 和工具”就结束，遗漏状态更新、完成证据和停止条件。追问：如果去掉 observation 回填，系统会出现什么具体故障？
completionCriteria:
1. 能用控制权而非产品名称区分三种系统。
2. 能为一个最小 Agent 画出包含终止出口的行动闭环。

关联 resource metadata（所有 verifiedAt 均为 2026-07-20）：
1. res-agent-anthropic-effective | Building Effective Agents | Anthropic | 官方工程指南 | 进阶 | 机制总览 | 厂商团队总结的工程经验，用于比较 workflow 与 Agent、从简单方案逐步增加自治；它不是跨模型、跨场景都成立的普适论文结论。
2. res-agent-openai-guide | A Practical Guide to Building AI Agents | OpenAI | 官方工程指南 | 入门到进阶 | 机制总览 | 厂商给出的 Agent 组成、工具与编排工程经验，适合建立实现清单；其建议应结合自己的模型、权限和任务数据验证。
3. res-agent-berkeley-course | Large Language Model Agents MOOC | UC Berkeley | 大学课程 | 进阶 | 系统课程 | 大学公开课程提供 Agent 推理、规划、工具与应用的系统学习路线，用于扩展本模块而不承担具体性能主张。
4. res-agent-hf-course | Hugging Face Agents Course | Hugging Face | GitHub 官方课程 | 入门到进阶 | 代码实践 | 官方开源课程把 Agent 概念、工具调用和框架练习连接起来，适合在先理解机制后对照实现。
5. res-agent-ms-course | AI Agents for Beginners | Microsoft | GitHub 官方课程 | 入门 | 系统课程 | 官方开源课程以逐课示例介绍 Agent 模式和工具，适合作为结构化练习入口，不作为框架优劣的普适证据。
6. res-agent-hello-agents | Hello-Agents：从零开始构建智能体 | Datawhale | GitHub 社区课程 | 入门到进阶 | 中文实践 | 中文开源教材提供从机制到代码的学习路径，可用于复现最小 Agent 与工具调用；性能结论仍需独立评测。
7. res-agent-dlai-agentic | Agentic AI | DeepLearning.AI | 官方课程 | 进阶 | 系统课程 | 课程围绕反思、工具、规划等模式组织练习，适合横向梳理模式；课程案例不能替代业务环境中的验证。
8. res-agent-lilian-weng | LLM Powered Autonomous Agents | Lilian Weng | 技术综述 | 进阶 | 机制总览 | 作者综述串联规划、记忆与工具等概念，适合建立术语地图；具体效果应回到所引论文的实验条件核对。
9. res-agent-lihongyi | 【生成式AI時代下的機器學習(2025)】第二講：一堂課搞懂 AI Agent 的原理 | Hung-yi Lee | YouTube 课程视频 | 入门到进阶 | 中文讲解 | 中文课程视频用于建立 Agent 行动循环和工具使用直觉，论断应结合原始论文与真实系统实验核验。
10. res-agent-datawhale-bili | 4.3-Agent大模型智能体-原理、实践和应用场景 | 二次元的Datawhale | Bilibili 课程视频 | 入门 | 中文讲解 | 中文社区课程视频辅助理解 Agent 基本组成与实践路径，适合配合代码复现，不承担机制事实的唯一依据。
```

### 完整原始 JSON 输出

```json
{
  "teachingOutline": {
    "lessonId": "agent-01",
    "title": "Agent、Workflow 与普通 LLM 应用",
    "durationMinutes": 80,
    "scope": "仅为教学大纲，不包含完整知识正文。",
    "evidenceBoundary": "大纲仅依据题面提供的 lesson 字段和关联 resource metadata 编制；未访问、未读取或核验任何外链正文。",
    "prerequisites": [
      "理解一次普通 LLM 调用通常包含输入、模型生成和输出。",
      "理解程序控制流、条件分支、重试和 API 或工具调用的基本含义。",
      "能够区分模型生成的内容与宿主程序执行的动作。"
    ],
    "sections": [
      {
        "id": "control-flow-entry",
        "title": "先修桥接：先问谁决定下一步",
        "durationMinutes": 8,
        "teachingFunction": [
          "从普通程序调用模型的经验切入，建立“模型能力不等于系统控制权”的前提。",
          "引入统一判断问题：下一步主要由预设代码决定，还是由模型依据当前状态和新观察决定。"
        ],
        "concepts": [
          "控制流",
          "模型生成组件",
          "环境反馈"
        ],
        "assessmentLinks": [
          "objective-1",
          "quiz-agent-01-1",
          "iq-agent-01-1",
          "completion-1"
        ],
        "courseFieldBasis": [
          "explanations-1",
          "quiz-agent-01-1",
          "iq-agent-01-1"
        ],
        "externalEvidenceStatus": "缺口：当前没有可访问的来源正文支持定义与边界，只能使用课程字段形成待核验的大纲。"
      },
      {
        "id": "agency-continuum",
        "title": "直觉模型：从普通调用到 Workflow，再到 Agent",
        "durationMinutes": 12,
        "teachingFunction": [
          "用 Agency 连续谱比较三类系统，而不是把它们处理成互斥产品标签。",
          "普通 LLM 应用由代码决定一次或少数几次调用；Workflow 由开发者预设步骤、分支和重试；Agent 在受限边界内依据目标、状态和观察选择下一步。",
          "说明混合设计：固定流程可以只在局部开放节点授予模型选择权。"
        ],
        "concepts": [
          "Agency 连续谱",
          "Workflow",
          "局部自治",
          "路径确定性"
        ],
        "assessmentLinks": [
          "objective-1",
          "quiz-agent-01-1",
          "iq-agent-01-1"
        ],
        "courseFieldBasis": [
          "concepts",
          "explanations-1",
          "iq-agent-01-1"
        ],
        "externalEvidenceStatus": "缺口：res-agent-anthropic-effective 与 res-agent-openai-guide 的 metadata 指向相关主题，但正文不可用，不能作为该比较的实质证据。"
      },
      {
        "id": "minimal-agent-loop",
        "title": "准确机制：最小单 Agent 的可验证行动闭环",
        "durationMinutes": 18,
        "teachingFunction": [
          "依次定义可操作目标、工作状态、受限动作或工具、环境 observation、决策循环和显式终止出口。",
          "梳理因果链：读取目标与状态，选择动作，由宿主执行，接收环境观察，更新状态，再判断继续或终止。",
          "明确 done、blocked、预算耗尽和 handoff 等出口，并解释缺失 observation 回填会导致系统无法依据真实执行结果纠偏。",
          "区分必要组件与可选增强：RAG、长期记忆、框架和多 Agent 不属于最小闭环的必备条件。"
        ],
        "concepts": [
          "目标",
          "状态",
          "动作空间",
          "环境观察",
          "状态更新",
          "决策循环",
          "终止条件"
        ],
        "assessmentLinks": [
          "objective-2",
          "quiz-agent-01-2",
          "iq-agent-01-3",
          "completion-2"
        ],
        "courseFieldBasis": [
          "explanations-2",
          "quiz-agent-01-2",
          "iq-agent-01-3",
          "completionCriteria-2"
        ],
        "externalEvidenceStatus": "缺口：没有可访问的官方指南或原始材料正文来交叉核验组件定义、宿主职责和终止设计。"
      },
      {
        "id": "autonomy-selection-gates",
        "title": "工程意义：何时不应增加自治",
        "durationMinutes": 15,
        "teachingFunction": [
          "建立选型门槛：路径是否稳定、结果能否由普通代码确定计算、是否存在可靠环境反馈、错误代价是否可接受、权限与预算是否可约束。",
          "解释课程字段中的工程权衡：自治越高，模型调用、延迟、权限暴露、轨迹复现难度和不可预测失败面通常越大。",
          "介绍风险收口方式：Agent 可以负责信息收集，但高风险最终执行可交还规则、审批或人工。",
          "要求以真实任务的动态决策价值证明自治必要性，而不是把 Agent 当作默认升级方向。"
        ],
        "concepts": [
          "选型门槛",
          "可观察反馈",
          "错误代价",
          "权限边界",
          "成本",
          "延迟",
          "失败面"
        ],
        "assessmentLinks": [
          "objective-1",
          "objective-2",
          "iq-agent-01-2",
          "exercise-step-1"
        ],
        "courseFieldBasis": [
          "explanations-1",
          "explanations-2",
          "iq-agent-01-2",
          "exercise.steps-1"
        ],
        "externalEvidenceStatus": "缺口：关于成本、延迟和失败面的方向性表述来自课程字段；当前没有实验数据、业务失败样例或可访问来源正文支持量化或普适结论。"
      },
      {
        "id": "three-case-control-design",
        "title": "具体练习：为三个案例选择控制方式",
        "durationMinutes": 20,
        "teachingFunction": [
          "固定格式摘要：检查输入输出是否稳定、是否需要外部行动和反馈，再论证普通调用为何足够。",
          "审批流：检查步骤、权限和分支能否预设，再论证 Workflow 如何保持可审计控制。",
          "开放资料调查：检查路径是否需依据新证据变化，再判断是否需要受限 Agent，并为其限定动作空间和证据要求。",
          "每个案例都填写路径稳定性、环境反馈、错误代价、可验证证据、推荐方案、拒绝另外两种方案的理由，以及 done、blocked 和预算终止条件。"
        ],
        "concepts": [
          "控制方式选型",
          "判断证据",
          "方案排除",
          "完成条件",
          "阻塞条件",
          "预算终止"
        ],
        "assessmentLinks": [
          "exercise-step-1",
          "exercise-step-2",
          "exercise-deliverable",
          "iq-agent-01-1",
          "iq-agent-01-2",
          "completion-1",
          "completion-2"
        ],
        "courseFieldBasis": [
          "exercise",
          "explanations-1",
          "explanations-2",
          "interview"
        ],
        "externalEvidenceStatus": "部分缺口：课程字段足以规定练习结构，但没有三个案例的具体业务约束、失败样例、权限边界或验收数据，最终答案只能作为教学设计，不能作为生产选型结论。"
      },
      {
        "id": "misconceptions-recap-bridge",
        "title": "误区校正、回顾与后续衔接",
        "durationMinutes": 7,
        "teachingFunction": [
          "校正“调用工具就是 Agent”“聊天界面就是 Agent”“Agent 总比 Workflow 先进”“模型、Prompt 和工具已经构成完整 Agent”等误区。",
          "用两条回忆链完成检查：先看控制流归属以分类系统；再看目标、状态、动作、观察、循环和终止以检查行动闭环。",
          "要求学习者能够画出带 done、blocked、预算耗尽和 handoff 出口的最小 Agent 闭环。",
          "下一课信息未提供，因此仅预留从控制方式选型过渡到具体状态、工具、权限或编排实现的接口，不指定下一课主题。"
        ],
        "concepts": [
          "分类误区",
          "组件误区",
          "行动闭环图",
          "跨课衔接"
        ],
        "assessmentLinks": [
          "quiz-agent-01-1",
          "quiz-agent-01-2",
          "iq-agent-01-1",
          "iq-agent-01-2",
          "iq-agent-01-3",
          "completion-1",
          "completion-2"
        ],
        "courseFieldBasis": [
          "quiz",
          "interview",
          "completionCriteria"
        ],
        "externalEvidenceStatus": "缺口：误区校正仅有课程字段支持；下一课 lesson 数据缺失，无法形成具体跨章依赖。"
      }
    ],
    "exerciseDeliverableTemplate": {
      "title": "三个案例的控制方式选型表",
      "columns": [
        "案例",
        "路径是否稳定",
        "是否需要环境反馈",
        "错误代价",
        "可验证证据",
        "推荐控制方式",
        "拒绝另外两种方式的理由",
        "done 条件",
        "blocked 条件",
        "预算终止条件"
      ]
    }
  },
  "evidence": {
    "accessDeclaration": "本次只获得十项 resource metadata。未打开、浏览、读取、观看或核验任何外链正文、仓库内容、论文、课程页面或视频字幕；以下 coverage 仅复述 metadata 明示的用途，不能视为对资源正文内容的确认。",
    "cards": {
      "res-agent-anthropic-effective": {
        "authority": "official",
        "role": "extension",
        "coverage": [
          "metadata 将其定位为比较 Workflow 与 Agent、讨论从简单方案逐步增加自治的候选工程扩展材料"
        ],
        "limitations": "仅有官方工程指南的 metadata，正文不可用；不能确认其定义、案例、论证条件或原文结论，也不能把厂商工程经验外推为跨模型、跨场景的普适规律。",
        "verifiedAt": "2026-07-20"
      },
      "res-agent-openai-guide": {
        "authority": "official",
        "role": "extension",
        "coverage": [
          "metadata 将其定位为 Agent 组成、工具和编排实现清单的候选扩展材料"
        ],
        "limitations": "仅有官方工程指南的 metadata，正文不可用；不能确认具体组件语义、接口、实现建议或版本状态，且相关建议仍需结合模型、权限和任务数据验证。",
        "verifiedAt": "2026-07-20"
      },
      "res-agent-berkeley-course": {
        "authority": "academic",
        "role": "extension",
        "coverage": [
          "metadata 将其定位为 Agent 推理、规划、工具与应用的系统学习路线"
        ],
        "limitations": "仅有大学课程 metadata，未读取课程讲义、视频、作业或参考文献；不能承担本课具体定义、机制或性能主张的证据责任。",
        "verifiedAt": "2026-07-20"
      },
      "res-agent-hf-course": {
        "authority": "official",
        "role": "extension",
        "coverage": [
          "metadata 将其定位为连接 Agent 概念、工具调用与框架练习的代码实践路线"
        ],
        "limitations": "仅有 GitHub 官方课程 metadata，未读取仓库、代码、版本记录或课程正文；不能确认实现方式、框架语义或代码是否仍可复现。",
        "verifiedAt": "2026-07-20"
      },
      "res-agent-ms-course": {
        "authority": "official",
        "role": "extension",
        "coverage": [
          "metadata 将其定位为 Agent 模式与工具的结构化入门练习入口"
        ],
        "limitations": "仅有 GitHub 官方课程 metadata，未读取逐课内容、示例或依赖版本；不能用来证明框架优劣或本课机制结论。",
        "verifiedAt": "2026-07-20"
      },
      "res-agent-hello-agents": {
        "authority": "community",
        "role": "extension",
        "coverage": [
          "metadata 将其定位为中文的最小 Agent 与工具调用复现路线"
        ],
        "limitations": "仅有社区课程 metadata，未读取教材正文、代码或实验记录；不能确认复现步骤，也不能以其承担性能结论或官方语义的证明责任。",
        "verifiedAt": "2026-07-20"
      },
      "res-agent-dlai-agentic": {
        "authority": "official",
        "role": "extension",
        "coverage": [
          "metadata 将其定位为反思、工具和规划等模式的横向课程扩展"
        ],
        "limitations": "仅有课程 metadata，未读取课程正文、练习或案例；不能确认模式定义，课程案例也不能替代业务环境验证。",
        "verifiedAt": "2026-07-20"
      },
      "res-agent-lilian-weng": {
        "authority": "expert",
        "role": "extension",
        "coverage": [
          "metadata 将其定位为规划、记忆和工具等概念的术语地图候选材料"
        ],
        "limitations": "仅有技术综述 metadata，未读取文章正文或其引用论文；不能确认综述中的具体论断，任何效果主张都需要回到原始论文及其实验条件核验。",
        "verifiedAt": "2026-07-20"
      },
      "res-agent-lihongyi": {
        "authority": "expert",
        "role": "extension",
        "coverage": [
          "metadata 将其定位为 Agent 行动循环与工具使用直觉的中文讲解"
        ],
        "limitations": "仅有 YouTube 课程视频 metadata，未访问视频或字幕；按来源政策，无可访问 transcript 时不能支持关键事实，相关论断还需原始论文和真实系统实验核验。",
        "verifiedAt": "2026-07-20"
      },
      "res-agent-datawhale-bili": {
        "authority": "community",
        "role": "extension",
        "coverage": [
          "metadata 将其定位为 Agent 基本组成和实践路径的中文辅助讲解"
        ],
        "limitations": "仅有 Bilibili 视频 metadata，未访问视频或字幕；无可访问 transcript，不能承担机制事实的唯一或核心证据，只能作为待获取的辅助学习材料。",
        "verifiedAt": "2026-07-20"
      }
    },
    "materialGaps": [
      "十项关联资源均缺少可访问正文，因此全部降级为 extension；没有任何资源可以标为 core 或 cross-check。",
      "缺少 Anthropic 与 OpenAI 指南正文，无法外部核验 Workflow、Agent、控制流归属、最小组件和渐进自治等核心定义。",
      "缺少 Berkeley、Hugging Face、Microsoft、Datawhale 与 DeepLearning.AI 的课程正文、代码快照、依赖版本和练习结果。",
      "缺少 Lilian Weng 综述正文及其引用的原始论文，无法核验规划、记忆、工具等术语及实验条件。",
      "两项视频资源均无字幕或 transcript，不能用于支持关键教学事实。",
      "缺少原始研究、基准或真实业务失败样例，无法量化自治对成本、延迟、可靠性、权限风险和失败面的影响。",
      "缺少下一课 lesson 数据，无法给出确定的跨章衔接。",
      "在补齐至少一项可访问且直接支持核心学习目标的官方或原始材料前，依据技能发布门槛不能把该大纲扩写并宣称为来源完备的正式知识正文。"
    ]
  },
  "coverageMatrix": {
    "statusLegend": {
      "course-field-covered": "题面课程字段已经明确给出要教授的结论或任务要求。",
      "external-evidence-gap": "关联资源只有 metadata，尚无可访问正文支持或交叉核验。",
      "context-gap": "完成应用或衔接仍缺少案例、下一课或运行环境信息。"
    },
    "rows": [
      {
        "outcomeId": "objective-1",
        "outcome": "用控制权、路径确定性和环境反馈区分 LLM 应用、Workflow 与 Agent。",
        "mappedSections": [
          "control-flow-entry",
          "agency-continuum",
          "autonomy-selection-gates"
        ],
        "requiredConcepts": [
          "控制流归属",
          "Agency 连续谱",
          "路径确定性",
          "环境反馈"
        ],
        "courseFieldBasis": [
          "objective-1",
          "explanations-1"
        ],
        "candidateEvidenceIds": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide"
        ],
        "usableSourceIds": [],
        "status": [
          "course-field-covered",
          "external-evidence-gap"
        ],
        "gap": "需要可访问的官方正文直接支持三类系统的定义和边界，并确认不同来源是否采用一致术语。"
      },
      {
        "outcomeId": "objective-2",
        "outcome": "描述最小单 Agent 的目标、状态、动作、观察和终止组件。",
        "mappedSections": [
          "minimal-agent-loop",
          "autonomy-selection-gates"
        ],
        "requiredConcepts": [
          "目标",
          "状态",
          "动作空间",
          "观察",
          "决策循环",
          "终止条件"
        ],
        "courseFieldBasis": [
          "objective-2",
          "explanations-2"
        ],
        "candidateEvidenceIds": [
          "res-agent-openai-guide",
          "res-agent-anthropic-effective",
          "res-agent-lilian-weng"
        ],
        "usableSourceIds": [],
        "status": [
          "course-field-covered",
          "external-evidence-gap"
        ],
        "gap": "需要可访问正文核验最小闭环各组件、宿主程序职责以及 done、blocked、预算和 handoff 的定义边界。"
      },
      {
        "outcomeId": "quiz-agent-01-1",
        "outcome": "解释区分 Workflow 与 Agent 的关键是下一步由预设代码还是模型依据状态决定。",
        "mappedSections": [
          "control-flow-entry",
          "agency-continuum",
          "misconceptions-recap-bridge"
        ],
        "requiredConcepts": [
          "控制流归属",
          "预设路径",
          "状态驱动决策"
        ],
        "courseFieldBasis": [
          "quiz-agent-01-1",
          "explanations-1"
        ],
        "candidateEvidenceIds": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide"
        ],
        "usableSourceIds": [],
        "status": [
          "course-field-covered",
          "external-evidence-gap"
        ],
        "gap": "正确选项和解释由课程字段提供，但没有外部正文支持该分类标准。"
      },
      {
        "outcomeId": "quiz-agent-01-2",
        "outcome": "识别目标、状态、动作、观察与终止出口是最小 Agent 的显式必要组件。",
        "mappedSections": [
          "minimal-agent-loop",
          "misconceptions-recap-bridge"
        ],
        "requiredConcepts": [
          "行动闭环",
          "必要组件",
          "可选增强"
        ],
        "courseFieldBasis": [
          "quiz-agent-01-2",
          "explanations-2"
        ],
        "candidateEvidenceIds": [
          "res-agent-openai-guide",
          "res-agent-lilian-weng"
        ],
        "usableSourceIds": [],
        "status": [
          "course-field-covered",
          "external-evidence-gap"
        ],
        "gap": "需要可访问正文交叉核验必要组件与 RAG、长期记忆、多 Agent 等可选能力的边界。"
      },
      {
        "outcomeId": "iq-agent-01-1",
        "outcome": "回答 LLM、Workflow 与 Agent 的区别，并处理连续谱、局部开放节点和固定审批路径追问。",
        "mappedSections": [
          "control-flow-entry",
          "agency-continuum",
          "three-case-control-design"
        ],
        "requiredConcepts": [
          "LLM 作为生成组件",
          "Workflow 预设编排",
          "Agent 动态决策",
          "混合控制"
        ],
        "courseFieldBasis": [
          "iq-agent-01-1"
        ],
        "candidateEvidenceIds": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide"
        ],
        "usableSourceIds": [],
        "status": [
          "course-field-covered",
          "external-evidence-gap"
        ],
        "gap": "课程字段覆盖短答、深挖、误区和追问，但缺少可访问来源确认连续谱和混合控制的术语范围。"
      },
      {
        "outcomeId": "iq-agent-01-2",
        "outcome": "回答何时不应使用 Agent，并说明固定任务中仅开放一个节点时如何收口控制权。",
        "mappedSections": [
          "autonomy-selection-gates",
          "three-case-control-design",
          "misconceptions-recap-bridge"
        ],
        "requiredConcepts": [
          "动态决策价值",
          "错误代价",
          "可靠反馈",
          "权限",
          "预算",
          "人工或审批收口"
        ],
        "courseFieldBasis": [
          "iq-agent-01-2",
          "explanations-2"
        ],
        "candidateEvidenceIds": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide"
        ],
        "usableSourceIds": [],
        "status": [
          "course-field-covered",
          "external-evidence-gap"
        ],
        "gap": "需要工程指南正文和真实失败样例支持选型门槛；当前不能把成本、延迟和失败面表述为已由外部材料证明的普适结论。"
      },
      {
        "outcomeId": "iq-agent-01-3",
        "outcome": "回答最小 Agent 的组成，并解释缺少 observation 回填会产生的故障。",
        "mappedSections": [
          "minimal-agent-loop",
          "misconceptions-recap-bridge"
        ],
        "requiredConcepts": [
          "目标",
          "状态",
          "动作",
          "观察",
          "状态更新",
          "终止",
          "宿主执行"
        ],
        "courseFieldBasis": [
          "iq-agent-01-3",
          "explanations-2"
        ],
        "candidateEvidenceIds": [
          "res-agent-openai-guide",
          "res-agent-lilian-weng",
          "res-agent-hf-course"
        ],
        "usableSourceIds": [],
        "status": [
          "course-field-covered",
          "external-evidence-gap"
        ],
        "gap": "课程字段给出闭环与故障方向，但缺少可访问机制材料或代码轨迹展示 observation 缺失的具体失败过程。"
      },
      {
        "outcomeId": "exercise-step-1",
        "outcome": "为三个案例标出路径稳定性、环境反馈、错误代价与可验证证据。",
        "mappedSections": [
          "autonomy-selection-gates",
          "three-case-control-design"
        ],
        "requiredConcepts": [
          "路径稳定性",
          "反馈需求",
          "错误代价",
          "验证证据"
        ],
        "courseFieldBasis": [
          "exercise.steps-1"
        ],
        "candidateEvidenceIds": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide"
        ],
        "usableSourceIds": [],
        "status": [
          "course-field-covered",
          "external-evidence-gap",
          "context-gap"
        ],
        "gap": "缺少三个案例的输入输出约束、权限、失败历史和验收标准，无法形成唯一生产选型，只能教授比较框架。"
      },
      {
        "outcomeId": "exercise-step-2",
        "outcome": "写出推荐方案、拒绝其他方案的理由，以及完成、阻塞和预算终止条件。",
        "mappedSections": [
          "minimal-agent-loop",
          "three-case-control-design"
        ],
        "requiredConcepts": [
          "方案论证",
          "替代方案排除",
          "done",
          "blocked",
          "预算终止"
        ],
        "courseFieldBasis": [
          "exercise.steps-2",
          "explanations-2"
        ],
        "candidateEvidenceIds": [
          "res-agent-openai-guide",
          "res-agent-anthropic-effective"
        ],
        "usableSourceIds": [],
        "status": [
          "course-field-covered",
          "external-evidence-gap",
          "context-gap"
        ],
        "gap": "终止类型来自课程字段；缺少可访问工程资料和案例预算、时限及 handoff 责任人，无法给出可部署阈值。"
      },
      {
        "outcomeId": "exercise-deliverable",
        "outcome": "产出包含三个案例、判断证据和终止设计的选型表。",
        "mappedSections": [
          "three-case-control-design"
        ],
        "requiredConcepts": [
          "结构化比较",
          "判断证据",
          "终止设计"
        ],
        "courseFieldBasis": [
          "exercise.deliverable"
        ],
        "candidateEvidenceIds": [
          "res-agent-hf-course",
          "res-agent-ms-course",
          "res-agent-hello-agents"
        ],
        "usableSourceIds": [],
        "status": [
          "course-field-covered",
          "external-evidence-gap",
          "context-gap"
        ],
        "gap": "大纲已定义表格列，但缺少可访问练习样例、评分标准和案例事实，不能生成有外部证据支撑的标准答案。"
      },
      {
        "outcomeId": "completion-1",
        "outcome": "能用控制权而非产品名称区分三种系统。",
        "mappedSections": [
          "control-flow-entry",
          "agency-continuum",
          "three-case-control-design",
          "misconceptions-recap-bridge"
        ],
        "requiredConcepts": [
          "控制流归属",
          "名称无关判断",
          "混合系统分类"
        ],
        "courseFieldBasis": [
          "completionCriteria-1",
          "explanations-1"
        ],
        "candidateEvidenceIds": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide"
        ],
        "usableSourceIds": [],
        "status": [
          "course-field-covered",
          "external-evidence-gap"
        ],
        "gap": "可据课程字段设计达标检查，但缺少可访问正文对分类边界进行外部核验。"
      },
      {
        "outcomeId": "completion-2",
        "outcome": "能为最小 Agent 画出包含终止出口的行动闭环。",
        "mappedSections": [
          "minimal-agent-loop",
          "three-case-control-design",
          "misconceptions-recap-bridge"
        ],
        "requiredConcepts": [
          "行动闭环",
          "状态更新",
          "环境观察",
          "显式终止出口"
        ],
        "courseFieldBasis": [
          "completionCriteria-2",
          "explanations-2"
        ],
        "candidateEvidenceIds": [
          "res-agent-openai-guide",
          "res-agent-lilian-weng",
          "res-agent-lihongyi"
        ],
        "usableSourceIds": [],
        "status": [
          "course-field-covered",
          "external-evidence-gap"
        ],
        "gap": "课程字段足以规定图中节点，但官方指南和综述正文不可用，视频也无 transcript，无法将该图标记为经过外部来源核验。"
      }
    ],
    "summary": {
      "totalOutcomes": 12,
      "mappedOutcomes": 12,
      "unmappedOutcomes": 0,
      "outcomesWithCourseFieldCoverage": 12,
      "outcomesWithUsableExternalBodyEvidence": 0,
      "externalEvidenceGaps": 12,
      "publicationStatus": "仅可作为课程字段驱动的大纲和取证计划；不能发布为来源完备的完整知识正文。"
    }
  }
}
```

### 观察

1. 代理遵守了 `fork_turns=none` 的隔离设置，只读取新 Skill 目录中的 `SKILL.md` 和四个必需 reference；没有读取课程文件、既有测试记录、计划或其他 workspace 文件。
2. 代理没有浏览、调用 openai-docs、打开外链或安装插件，也没有声称读过任一关联资源正文。
3. 输出严格限制为教学大纲、全部来源的 evidence 角色卡和覆盖矩阵，没有生成完整 `knowledgeNote` 正文。
4. 大纲用 6 个教学段覆盖 80 分钟，遵循先修桥接、直觉模型、准确机制、工程意义、具体练习、误区与回顾的教学顺序。
5. 2 项 objective、2 项 quiz、3 项 interview、2 个 exercise step、1 个 deliverable 和 2 项 completion criterion 均映射到教学段、概念、课程字段依据和候选证据。
6. 十项 metadata-only 来源全部降为 `extension`，没有伪造 `core` 或 `cross-check`；两项视频还显式记录了 transcript 缺口。
7. 输出把课程字段覆盖与外部正文证据分开记录，并明确 `usableSourceIds=0`，因此没有把 metadata-only 资源用于支撑实质机制主张。

### `sourceIds` 与覆盖审计

| 审计项 | 结果 | 说明 |
| --- | --- | --- |
| 关联资源 evidence 完整性 | 通过 | 10 个 resource id 均有 evidence card；authority 与 role 枚举合法 |
| evidence 角色校正 | 通过 | 10 项全部为 `extension`，符合正文不可访问时的来源政策 |
| 未知或断裂引用 | 0 | 大纲没有伪装成完整 `knowledgeNote.sections`，也没有填入不可用的 `sourceIds` |
| `usableSourceIds` | 0 | 覆盖矩阵 12 行均为空数组，准确反映没有外部正文可用 |
| metadata-only 资源支撑关键事实 | 未发生 | metadata 只用于候选取证路线和限制说明 |
| 目标与考核覆盖 | 通过 | 12/12 outcome 均映射到段落、概念、课程字段与材料缺口 |
| 完整正文发布门槛 | 未通过 | 无 core/cross-check 正文证据，不能发布来源完备的正式章节 |

### 有限任务 rubric

| 类别 | 得分 | 人工审计依据 |
| --- | ---: | --- |
| 目标、测验与面试覆盖 | 25/25 | 两项目标、两道测验、三组面试、练习两步与交付物、两项完成标准全部进入覆盖矩阵并映射到教学段 |
| 知识结构与跨章衔接 | 19/20 | 6 段结构完整并覆盖固定教学 progression；因下一课数据缺失，只能保留待确认的通用桥接 |
| 来源与不确定性 | 25/25 | 十项来源全部建卡并正确降级；metadata、视频无 transcript、无正文、版本日期及不可外推边界均明确 |
| 教学可读性与例子 | 18/20 | 大纲清楚定义教学工作并包含三个案例的操作化模板；按任务要求未写完整 worked-example 正文 |
| 版权与完整 `knowledgeNote` 数据契约 | N/A | 本变体明确只请求大纲、evidence 和矩阵，未请求或声称生成完整 `knowledgeNote` |
| **适用项合计** | **87/90** | 这是有限任务适用项审计，不是可发布章节的 100 分制发布分数 |

- 该 `87/90` 不是发布分数。
- `usableSourceIds=0`，且没有任何外部正文可用；正式章节仍不得发布。
- `broken refs=0`，但这来自未伪造 substantive section 引用，不代表来源正文充分。

### 残余缺口

1. 十项关联资源均缺少可访问正文，因此没有任何 `core` 或 `cross-check` evidence。
2. 缺少 Anthropic 与 OpenAI 指南正文，无法外部核验 Workflow、Agent、控制流归属、最小组件和渐进自治等核心定义。
3. 缺少 Berkeley、Hugging Face、Microsoft、Datawhale 与 DeepLearning.AI 的课程正文、代码快照、依赖版本和练习结果。
4. 缺少 Lilian Weng 综述正文及其引用的原始论文，无法核验规划、记忆、工具等术语及实验条件。
5. 两项视频资源均无字幕或 transcript，不能用于支持关键教学事实。
6. 缺少原始研究、基准或真实业务失败样例，无法量化自治对成本、延迟、可靠性、权限风险和失败面的影响。
7. 三个练习案例缺少具体输入输出约束、失败历史、权限边界、预算阈值和验收数据，不能形成唯一生产选型答案。
8. 缺少下一课 lesson 数据，无法形成确定的跨章衔接。
9. 在补齐至少一项可访问且直接支持核心学习目标的官方或原始材料前，不能把该大纲扩写并宣称为来源完备的正式知识正文。

### REFACTOR

无新绕过，因此无 REFACTOR 修改。
