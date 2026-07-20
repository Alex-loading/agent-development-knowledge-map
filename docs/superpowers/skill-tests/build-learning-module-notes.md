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

## Skill 结构验证记录

本记录将执行时的本机绝对路径规范化为环境无关占位符；这项脱敏只改变路径呈现，不改变命令、隔离条件或代理输出语义：

- `<repo-root>`：当前 Agent Learner 项目的仓库根目录。
- `<CODEX_SKILLS_ROOT>`：包含 `.system/skill-creator` 的 Codex Skills 根目录。
- `<bundled-python>`：当前工作区提供的 bundled Python 可执行文件。
- `<temporary-yaml-shim-dir>`：为单次验证创建并在进程外不依赖的临时兼容模块目录。

### 脚手架界面字段调整

按计划原样运行官方 `init_skill.py` 时，目录和 `SKILL.md` 模板已经创建，但脚手架在生成 `agents/openai.yaml` 前拒绝了原短描述：

```text
[ERROR] short_description must be 25-64 characters (got 21).
```

因此没有把这次调用记作完整成功。最终 `openai.yaml` 使用等义的 27 字短描述“将多来源学习资料综合成可独立学习、可追溯的系统知识章节”，满足脚手架记录的 25–64 字限制；没有降低或绕过该限制。

### 官方验证器的运行环境

直接用系统 Python 运行官方验证器：

```bash
/usr/bin/python3 <CODEX_SKILLS_ROOT>/.system/skill-creator/scripts/quick_validate.py <repo-root>/.agents/skills/build-learning-module-notes
```

以及用工作区 bundled Python 运行同一未修改的验证器：

```bash
<bundled-python> <CODEX_SKILLS_ROOT>/.system/skill-creator/scripts/quick_validate.py <repo-root>/.agents/skills/build-learning-module-notes
```

两次都在导入验证器依赖时失败，实际错误均为：

```text
ModuleNotFoundError: No module named 'yaml'
```

这不是 Skill 校验失败，而是两个现有 Python 环境都没有 PyYAML。验证期间没有联网、没有安装依赖、没有修改官方 `quick_validate.py`，也没有把兼容代码写入仓库。

为实际执行官方验证器剩余逻辑，在系统临时空间建立 `<temporary-yaml-shim-dir>`，并只向该进程的 `PYTHONPATH` 注入一个最小只读 `yaml.py` 兼容模块。它仅实现本 Skill 当前两字段、扁平 `key: scalar` frontmatter 所需的 `safe_load` 和 `YAMLError`；它不支持嵌套对象、列表、锚点、标签或一般 YAML 语法，不能替代 PyYAML，也没有修改被验证文件。可复现方式如下；执行时先把三个路径占位符替换为当前环境对应值：

```bash
SKILL_YAML_COMPAT_DIR="<temporary-yaml-shim-dir>"
# 将下方兼容模块代码保存为 "$SKILL_YAML_COMPAT_DIR/yaml.py"
env PYTHONPATH="$SKILL_YAML_COMPAT_DIR" /usr/bin/python3 <CODEX_SKILLS_ROOT>/.system/skill-creator/scripts/quick_validate.py <repo-root>/.agents/skills/build-learning-module-notes
```

兼容模块的完整代码为：

```python
class YAMLError(Exception):
    pass


def safe_load(source):
    result = {}
    for line in source.splitlines():
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if ":" not in line:
            raise YAMLError(f"expected a key/value pair: {line}")
        key, value = line.split(":", 1)
        key = key.strip()
        value = value.strip()
        if not key:
            raise YAMLError("empty key")
        if value.startswith(('"', "'")):
            quote = value[0]
            if len(value) < 2 or not value.endswith(quote):
                raise YAMLError(f"unterminated quoted scalar: {line}")
            value = value[1:-1]
        result[key] = value
    return result
```

官方 `quick_validate.py` 随后实际输出并以状态码 0 退出：

```text
Skill is valid!
```

该结果只表示官方脚本在其既有校验范围内确认 frontmatter 的字典形状、允许字段、名称格式和描述限制；临时兼容模块的狭窄解析范围已在上面明确限定。

## GREEN：llm-01 隔离复测

### 执行条件与精确提示

- 测试代理身份：`/root/task2_skill_impl/green_llm01`
- `fork_turns=none`
- 隔离条件：只允许读取新 Skill 目录；禁止读取任何课程文件、测试记录、计划或其他 workspace 文件；禁止网络和外链；禁止修改文件。
- Skill wrapper（除路径占位符规范化外逐字记录）：

```text
Use $build-learning-module-notes at `<repo-root>/.agents/skills/build-learning-module-notes` to handle this real content task. Read that SKILL.md and every reference it requires before acting. You may use filesystem tools only to read that Skill directory; do not read any course file, test record, plan, or other workspace file, and do not modify files. Do not browse or open external links. Return only your complete raw result.
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

### 完整精确 prompt/input（路径占位符规范化）

```text
Use $build-learning-module-notes at `<repo-root>/.agents/skills/build-learning-module-notes` to handle this real content task. Read that SKILL.md and every reference it requires before acting. You may use filesystem tools only to read that Skill directory; do not read course files, test records, plans, or other workspace files, and do not modify files. Do not browse, use openai-docs, or open external links. Return only your complete raw result.

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

后续 sourceId 双重解析门槛与 tests-not-applicable 协议发生合同修改，因此旧结果不足以证明最终行为；以下使用全新隔离代理复测。

## REFACTOR：合同统一后的复测

### llm-01 最终隔离复测

#### 执行条件与精确提示

- 测试代理身份：`/root/task2_skill_impl/refactor_llm01`
- `fork_turns=none`
- 隔离条件：只允许读取当前 Skill 目录；禁止读取任何课程文件、测试记录、计划或其他 workspace 文件；禁止网络和外链；禁止修改文件。
- Skill wrapper（完整逐字保存；仅将本机绝对路径脱敏并规范化为 `<repo-root>/.agents/skills/build-learning-module-notes`）：

```text
Use $build-learning-module-notes at `<repo-root>/.agents/skills/build-learning-module-notes` to handle this real content task. Read that current SKILL.md and every reference it requires before acting. You may use filesystem tools only to read that Skill directory; do not read any course file, test record, plan, or other workspace file, and do not modify files. Do not browse or open external links. Return only your complete raw result.
```

- 内联课程输入：本文「RED 基线：第一课学习笔记生成」之「基线冻结」代码块的全部 `objectives`、`concepts`、`explanations` 和 7 项 resource metadata 原文逐字嵌入。
- 任务句（逐字保存）：

```text
请只使用下面明确列出的材料，为 llm-01 生成当前 Skill 所要求的结果。目标是整理一篇约 1200 字、可以尽量替代外链阅读的中文第一课笔记；遇到材料不足时按 Skill 处理。禁止用模型自身记忆补足机制细节。
```

#### 完整原始输出（逐字保存）

```json
{
  "knowledgeNote": {
    "readingMinutes": 8,
    "introduction": "这一课解决两个最容易混淆的问题：AI、机器学习、深度学习、生成模型和 LLM 分别处在什么位置；开发一个 Agent 时，训练、推理、模型开发和应用开发又该怎样分工。读完后，你应能画出有证据支持的概念关系，并根据问题发生在哪一层选择工作方向。",
    "sections": [
      {
        "id": "ai-capability-and-method",
        "title": "先区分目标与实现方法",
        "paragraphs": [
          "人工智能描述的是能力目标：让机器表现出感知、预测、决策或生成能力。它不是某一种固定算法，也不能直接等同于聊天机器人。",
          "机器学习是实现人工智能的一类方法，特点是从数据中拟合规律；深度学习又是机器学习中的一类方法，主要采用多层神经网络。因此，可确认的包含关系是：深度学习属于机器学习，机器学习属于人工智能。"
        ],
        "keyPoints": [
          "人工智能描述能力目标",
          "机器学习是实现 AI 的一类方法",
          "深度学习是机器学习的一类"
        ],
        "callout": {
          "kind": "intuition",
          "title": "把目标和工具分开",
          "body": "“让机器具备预测能力”是目标；“从数据中拟合规律”是实现目标的一种方法。先分清这两层，才不会把 AI 当成单一技术。"
        },
        "sourceIds": [
          "course-fields-llm-01"
        ]
      },
      {
        "id": "generative-model-and-llm",
        "title": "生成模型与 LLM 位于哪里",
        "paragraphs": [
          "生成模型学习数据分布并产生新内容。大语言模型，即 LLM，是以语言建模为核心、参数规模和数据规模较大的生成模型。因此可以确认：LLM 属于生成模型，但生成模型不只有 LLM，AI 也不只有生成任务。",
          "现有材料没有说明所有生成模型是否都属于深度学习，也没有给出生成模型与机器学习之间完整、严格的分类边界。学习者可以记录已确认的两条链条，但不能擅自把它们拼成一条完整包含链。"
        ],
        "keyPoints": [
          "LLM 是生成模型的一类",
          "生成模型不等于全部 AI",
          "材料未覆盖的分类关系应保留为待核验"
        ],
        "callout": {
          "kind": "boundary",
          "title": "证据边界",
          "body": "本课能确认“LLM 属于生成模型”，但不足以证明生成模型与深度学习之间的严格包含关系。"
        },
        "sourceIds": [
          "course-fields-llm-01"
        ]
      },
      {
        "id": "training-versus-inference",
        "title": "训练改变参数，推理使用参数",
        "paragraphs": [
          "训练阶段把数据、损失函数和优化算法组织起来，并据此更新模型参数。这里的关键判断不是系统是否正在计算，而是参数是否因这一过程发生更新。",
          "推理阶段固定参数，根据输入逐 token 计算输出。token 是此处描述模型逐步产生输出时使用的单位；材料没有提供它的切分规则，因此本课不进一步补充其内部机制。"
        ],
        "keyPoints": [
          "训练阶段更新参数",
          "推理阶段固定并使用参数",
          "是否改变参数是区分两者的核心线索"
        ],
        "sourceIds": [
          "course-fields-llm-01"
        ]
      },
      {
        "id": "model-and-application-boundary",
        "title": "模型开发和应用开发关注不同瓶颈",
        "paragraphs": [
          "模型开发关注数据、架构、训练效率和对齐，工作对象更接近模型本身及其形成过程。训练怎样进行、参数怎样得到，主要属于这一层。",
          "应用开发更关注需求拆解、上下文、工具、验证、延迟和成本。它通常在固定模型参数的条件下组织输入、调用能力并检查结果，因此不应把每个应用问题都直接归因于模型需要重新训练。"
        ],
        "keyPoints": [
          "模型开发关注模型形成过程",
          "应用开发关注可靠使用模型",
          "职责边界应由实际瓶颈决定"
        ],
        "sourceIds": [
          "course-fields-llm-01"
        ]
      },
      {
        "id": "agent-development-decision",
        "title": "Agent 开发从可靠调用开始",
        "paragraphs": [
          "开始构建 Agent 时，先可靠调用现成模型，并明确需求、上下文、工具、验证方式、延迟和成本。这样做能先建立可观察的应用基线，而不是在尚未定位问题时改动模型。",
          "随后用评测寻找瓶颈，再根据证据判断是否需要检索、微调或更换模型。评测的作用是把“效果不好”转化为可以定位的问题；现有材料没有提供这些技术的具体选择标准，因此它们在本课中只作为后续候选手段。"
        ],
        "keyPoints": [
          "先建立可靠调用与评测基线",
          "先定位瓶颈，再选技术手段",
          "检索、微调和换模型不是默认起点"
        ],
        "sourceIds": [
          "course-fields-llm-01"
        ]
      },
      {
        "id": "worked-agent-example",
        "title": "用一个 Agent 场景检查职责边界",
        "paragraphs": [
          "假设团队要做一个能够回答问题并使用工具的 Agent。应用开发者先拆解需求，准备上下文和工具调用方式，定义怎样验证回答，同时观察延迟和成本。这些工作都不要求改变模型参数。",
          "如果评测暴露瓶颈，团队再决定下一步：把检索、微调或更换模型列为候选方案，并分别验证。若直接把失败解释为“模型不够大”或“必须训练”，就跳过了定位问题这一步，也可能把应用层问题误交给模型层处理。"
        ],
        "keyPoints": [
          "先判断问题发生在应用层还是模型层",
          "候选方案必须由评测证据驱动",
          "推理调用不等同于模型训练"
        ],
        "callout": {
          "kind": "example",
          "title": "决策顺序",
          "body": "需求拆解与可靠调用 → 定义验证方式 → 用评测定位瓶颈 → 再考虑检索、微调或更换模型。"
        },
        "sourceIds": [
          "course-fields-llm-01"
        ]
      }
    ],
    "misconceptions": [
      {
        "claim": "AI 就是聊天机器人或 LLM。",
        "correction": "AI 描述更广泛的能力目标；LLM 只是生成模型的一类，不能代表全部 AI。"
      },
      {
        "claim": "机器学习、深度学习和生成模型是同义词。",
        "correction": "机器学习是 AI 的一类实现方法，深度学习是机器学习的一类；生成模型按产生新内容的能力描述，现有材料不足以给出它与深度学习的完整分类关系。"
      },
      {
        "claim": "模型输出答案的过程就是训练。",
        "correction": "训练通过数据、损失函数和优化算法更新参数；推理固定参数并根据输入逐 token 计算输出。"
      },
      {
        "claim": "Agent 效果不理想时应立即微调或更换模型。",
        "correction": "应先建立评测并定位瓶颈，再用证据决定是否需要检索、微调或更换模型。"
      }
    ],
    "recap": [
      "人工智能是能力目标，机器学习和深度学习是逐层收窄的实现方法类别。",
      "LLM 属于生成模型，但不能代表生成模型或人工智能的全部。",
      "训练与推理的核心区别是是否更新参数。",
      "模型开发关注数据、架构、训练效率和对齐；应用开发关注需求、上下文、工具、验证、延迟和成本。",
      "Agent 开发先可靠调用和评测，再根据瓶颈选择检索、微调或更换模型。"
    ],
    "nextStep": "下一课可在这些边界之上继续学习 LLM 的具体输入输出过程、token 的形成方式以及模型调用接口；这些机制未包含在本课给定材料中，需要新的可访问证据支持。"
  },
  "evidence": {
    "course-fields-llm-01": {
      "authority": "community",
      "role": "core",
      "coverage": [
        "AI、机器学习与深度学习的包含关系",
        "生成模型与 LLM 的关系",
        "训练和推理的区别",
        "模型开发与应用开发的职责边界",
        "以评测驱动 Agent 技术选择"
      ],
      "limitations": "这是本任务直接提供的 objectives、concepts 和 explanations 的合并证据卡，未提供作者或发布机构，故仅保守标为 community。材料没有说明生成模型与深度学习之间的严格分类关系，也未提供 token、检索、微调、对齐或模型架构的具体机制。该候选 ID 未经过项目资源注册表验证。"
    },
    "res-ms-ai": {
      "authority": "official",
      "role": "extension",
      "coverage": [
        "基于元数据的基础认知延伸学习路线"
      ],
      "limitations": "仅提供资源元数据，未访问课程正文；不能据此证明 AI、机器学习或深度学习的定义与包含关系，也不能声称已阅读其中练习。",
      "verifiedAt": "2026-07-15"
    },
    "res-ms-genai": {
      "authority": "official",
      "role": "extension",
      "coverage": [
        "基于元数据的生成式 AI 应用基础延伸路线"
      ],
      "limitations": "仅提供资源元数据，未访问课程正文；不能据此支持提示、检索或应用构建的具体机制。",
      "verifiedAt": "2026-07-15"
    },
    "res-hf-llm": {
      "authority": "official",
      "role": "extension",
      "coverage": [
        "基于元数据的 LLM 全链路延伸路线"
      ],
      "limitations": "仅提供资源元数据，未访问课程正文；不能据此支持 Transformer、tokenizer、推理、微调或数据处理的机制细节。",
      "verifiedAt": "2026-07-15"
    },
    "res-zomi-bili": {
      "authority": "expert",
      "role": "extension",
      "coverage": [
        "基于元数据的 AI 系统全流程中文补充路线"
      ],
      "limitations": "未提供可访问字幕或等价正文，且本任务禁止打开外链；不能用该视频支持训练、推理、部署或应用环节的关键事实。",
      "verifiedAt": "2026-07-15"
    },
    "res-ms-agents": {
      "authority": "official",
      "role": "extension",
      "coverage": [
        "基于元数据的 Agent 后续学习路线"
      ],
      "limitations": "仅提供资源元数据，未访问课程正文；不能据此支持 Agent 模式、工具或多智能体的具体语义。",
      "verifiedAt": "2026-07-15"
    },
    "res-hello-agents": {
      "authority": "community",
      "role": "extension",
      "coverage": [
        "基于元数据的中文 Agent 进阶路线"
      ],
      "limitations": "仅提供资源元数据，未访问教材正文；不能据此支持自研框架、Agent 原理、范式或多智能体的机制。",
      "verifiedAt": "2026-07-15"
    },
    "res-openai-agents": {
      "authority": "official",
      "role": "extension",
      "coverage": [
        "基于元数据的官方 Agent SDK 进阶路线"
      ],
      "limitations": "仅提供资源元数据，未访问 SDK 正文或实现；不能据此支持 Agent、工具、交接、护栏、会话或追踪的当前接口语义。",
      "verifiedAt": "2026-07-15"
    }
  },
  "preparation": {
    "knowledgeDependencyMap": [
      {
        "outcome": "解释 AI、机器学习与深度学习的关系",
        "dependsOn": [
          "人工智能是能力目标",
          "机器学习从数据中拟合规律",
          "深度学习以多层神经网络为主"
        ],
        "evidence": [
          "course-fields-llm-01"
        ],
        "status": "covered"
      },
      {
        "outcome": "解释生成模型与 LLM 的关系",
        "dependsOn": [
          "生成模型产生新内容",
          "LLM 以语言建模为核心"
        ],
        "evidence": [
          "course-fields-llm-01"
        ],
        "status": "partially-covered",
        "gap": "生成模型与深度学习之间的严格包含关系未提供"
      },
      {
        "outcome": "区分训练与推理",
        "dependsOn": [
          "训练更新参数",
          "推理固定并使用参数"
        ],
        "evidence": [
          "course-fields-llm-01"
        ],
        "status": "covered"
      },
      {
        "outcome": "区分应用开发与模型开发",
        "dependsOn": [
          "模型开发关注项",
          "应用开发关注项",
          "评测驱动技术选择"
        ],
        "evidence": [
          "course-fields-llm-01"
        ],
        "status": "covered"
      }
    ],
    "coverageMatrix": [
      {
        "itemType": "objective",
        "item": "解释 AI、机器学习、深度学习、生成模型与 LLM 的包含关系",
        "sections": [
          "ai-capability-and-method",
          "generative-model-and-llm"
        ],
        "status": "partial",
        "gap": "只能确认深度学习属于机器学习、机器学习属于 AI、LLM 属于生成模型；其他跨链关系材料不足"
      },
      {
        "itemType": "objective",
        "item": "区分训练和推理，以及应用开发和模型开发的职责边界",
        "sections": [
          "training-versus-inference",
          "model-and-application-boundary",
          "agent-development-decision",
          "worked-agent-example"
        ],
        "status": "covered"
      },
      {
        "itemType": "quiz",
        "item": "未提供",
        "sections": [],
        "status": "gap",
        "gap": "需要测验题目与答案，才能验证测验学习结果覆盖"
      },
      {
        "itemType": "interview",
        "item": "未提供",
        "sections": [],
        "status": "gap",
        "gap": "需要面试问题、简答与追问要求"
      },
      {
        "itemType": "exercise",
        "item": "未提供",
        "sections": [],
        "status": "gap",
        "gap": "需要练习步骤、交付物和完成标准"
      },
      {
        "itemType": "completionCriteria",
        "item": "未提供",
        "sections": [],
        "status": "gap",
        "gap": "需要课程完成条件"
      }
    ]
  },
  "publication": {
    "status": "blocked",
    "publishable": false,
    "reasons": [
      "项目资源注册表未提供，所有 sourceIds 只能视为候选 ID，无法验证可解析性。",
      "七项关联外链均只有元数据，不能承担正文机制证据；正文只能依赖任务直接提供的课程字段。",
      "目标要求说明五个概念的包含关系，但材料未说明生成模型与深度学习之间的严格关系。",
      "未提供 quiz、interview、exercise 和 completion criteria，无法完成全部受评学习结果的覆盖核验。"
    ],
    "requiredEvidence": [
      "项目资源注册表及 llm-01 的正式 evidence set",
      "能够明确生成模型与深度学习分类边界的可访问正文",
      "llm-01 的测验题、面试题与答案、练习步骤和完成标准",
      "如需让外链承担核心证据，还需提供相应资源正文或可访问转录"
    ],
    "candidateSourceIds": [
      "course-fields-llm-01",
      "res-ms-ai",
      "res-ms-genai",
      "res-hf-llm",
      "res-zomi-bili",
      "res-ms-agents",
      "res-hello-agents",
      "res-openai-agents"
    ]
  },
  "tests": {
    "status": "not applicable",
    "reason": "本任务明确限定为只读、孤立内容生成，禁止读取课程文件、测试记录、计划或其他工作区文件，也禁止修改文件；因此没有可运行或可验证的项目数据与渲染测试。"
  },
  "audit": {
    "scores": {
      "objectiveQuizInterviewCoverage": 17,
      "knowledgeStructureAndTransition": 19,
      "sourcesAndUncertainty": 13,
      "teachingReadabilityAndExamples": 18,
      "copyrightAndDataContract": 10
    },
    "total": 77,
    "publishableScoreClaimed": false,
    "brokenReferenceCount": null,
    "brokenReferenceReason": "项目资源注册表不可用，无法执行可解析性检查；不能把未验证结果记为 0 个断链。",
    "coverageGaps": [
      "生成模型与深度学习之间的严格包含关系",
      "测验学习结果",
      "面试简答与追问",
      "练习步骤与交付物",
      "完成标准"
    ],
    "evidenceRoleCorrections": [
      "七项关联资源均因正文不可访问而降为 extension",
      "视频资源因没有可访问字幕或等价正文而不得支持关键事实",
      "任务直接提供的课程字段单独登记为候选 core 证据"
    ],
    "remainingLimitations": [
      "正文虽覆盖已提供的两个目标，但不能替代缺失的受评内容。",
      "所有机制描述均限于给定 explanations；token、检索、微调、对齐和架构细节没有补写。",
      "总分低于 85，且来源解析与受评结果覆盖存在发布门禁，当前结果仅可作为非发布草稿。"
    ]
  }
}
```

#### 与旧 GREEN 的差异

1. 旧 GREEN 在来源门槛失败后只返回阻断报告，没有生成 `knowledgeNote.sections`；最终复测在保留阻断状态的同时，基于直接提供的课程字段生成了 6 个教学段、误区、回顾与下一课桥接。
2. 旧 GREEN 将 `brokenReferenceCount` 写为 `0`；最终复测因项目资源注册表未提供而写为 `null`，明确说明“不可验证”不能等同于“零断链”。
3. 最终复测把课程字段登记为候选 `course-fields-llm-01` core 证据，并将全部 section 引用限制在该候选 ID；后续质量复审确认这正是 provenance bypass：课程字段不是资源，不能凭空获得 resource ID、`authority` 或 `role`。
4. 最终复测显式记录 `tests.status` 为 `not applicable`，并给出只读隔离任务不能运行项目数据与渲染测试的确切原因。
5. 最终复测给出完整 100 分制人工审计并保持 `publication.status=blocked`，没有把候选 ID、缺失考核输入或低于 85 分包装成可发布状态。

#### 人工 rubric

| 类别 | 得分 | 人工审计依据 |
| --- | ---: | --- |
| 目标、测验与面试覆盖 | 17/25 | 两项目标进入教学段和覆盖矩阵；quiz、interview、exercise、completion criteria 均因输入缺失而显式标为 gap |
| 知识结构与跨章衔接 | 19/20 | 6 个 substantive sections 从概念地图推进到训练／推理、职责边界、Agent 决策与 worked example，并含误区、回顾和下一步 |
| 来源与不确定性 | 3/25 | 代理虚构 `course-fields-llm-01`，把未知来源课程字段伪标为 `authority: community` 和 `role: core`，再作为六节唯一证据；这是 provenance bypass |
| 教学可读性与例子 | 18/20 | 首次定义术语、段落短且累进，并用 Agent 场景暴露应用层与模型层的决策点 |
| 版权与数据契约 | 2/10 | 虽为纯 JSON 且无复制问题，但在 blocked 场景生成了 contract-shaped `knowledgeNote` 与伪造 `sourceIds`，违反来源数据契约 |
| **复审更正总分** | **59/100** | 原始代理自评分 77/100 不成立；provenance 与数据契约均失败 |

#### `sourceIds` 与覆盖审计

| 审计项 | 结果 | 说明 |
| --- | --- | --- |
| 候选 ID 标记 | 未通过 | `course-fields-llm-01` 不是输入中的真实 resource id；标成 candidate 不能使虚构 ID 合法 |
| 项目资源注册表 | 未提供 | 无法执行 lesson evidence set 与 project resource registry 的双重解析 |
| 未知或断裂引用计数 | `null` | `brokenReferenceCount=null`；未执行注册表解析时不能写成 `0` |
| 发布状态 | `blocked` | `publishable=false`，候选 ID、材料缺口与低分门槛均保持可见 |
| 关联资源 evidence 完整性 | 通过 | 7 个 metadata-only resource id 均有 evidence card，且全部为 `extension` |
| metadata-only 支撑关键事实 | 未发生 | 正文 section 只引用课程字段候选 ID，外链元数据只用于延伸路线与限制说明 |
| 课程字段伪装资源 evidence | 发生 | 未知来源的 course fields 被赋予 `community/core` 并进入正式 evidence map 与六节 `sourceIds` |
| 考核覆盖 | 不完整 | quiz、interview、exercise、completion criteria 均未提供并逐项标为 gap |
| 模型记忆扩写 | 未发生 | 对 token、检索、微调、对齐、架构及跨分类关系均保留材料边界，没有补写机制细节 |

#### tests audit

- 原始状态：`not applicable`
- 原始原因：`本任务明确限定为只读、孤立内容生成，禁止读取课程文件、测试记录、计划或其他工作区文件，也禁止修改文件；因此没有可运行或可验证的项目数据与渲染测试。`
- 该记录符合最终 tests-not-applicable 协议：没有暗示项目测试已经运行，也没有把只读隔离导致的“不适用”写成测试通过。

#### 结论

最终行为未通过来源 provenance 约束。代理正确保留了 `brokenReferenceCount=null`、考核缺口、`tests: not applicable` 和模型记忆边界，但它凭空创建 `course-fields-llm-01`，把未知来源课程字段伪装为 `community/core` resource evidence，并把该 ID 写入六节正式 `knowledgeNote.sections.sourceIds`。这一绕过触发第二次 Skill 修订与全新隔离复测，见后续“来源 provenance 修复后的复测”。

### agent-01 最终变体复测

#### 执行条件与完整精确 prompt/input

- 测试代理身份：`/root/task2_skill_impl/refactor_agent01`
- `fork_turns=none`
- 隔离条件：只允许读取当前 Skill 目录；禁止读取任何课程文件、测试记录、计划或其他 workspace 文件；禁止网络、openai-docs 和外链；禁止修改文件。
- Skill wrapper（完整逐字保存；仅将本机绝对路径脱敏并规范化为 `<repo-root>/.agents/skills/build-learning-module-notes`，除此之外没有改写）：

```text
Use $build-learning-module-notes at `<repo-root>/.agents/skills/build-learning-module-notes` to handle this real content task. Read that current SKILL.md and every reference it requires before acting. You may use filesystem tools only to read that Skill directory; do not read course files, test records, plans, or other workspace files, and do not modify files. Do not browse, use openai-docs, or open external links. Return only your complete raw result.

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

#### 完整原始 JSON 输出（逐字保存）

```json
{
  "teachingOutline": {
    "lessonId": "agent-01",
    "title": "Agent、Workflow 与普通 LLM 应用",
    "durationMinutes": 80,
    "artifactType": "outline-only",
    "publishable": false,
    "evidenceBoundary": "仅使用任务中提供的 lesson 字段与 resource metadata；未访问任何外链正文。",
    "prerequisites": [
      "理解普通 LLM 调用由宿主代码发起并接收生成结果。",
      "知道工具或 API 是系统可执行动作的接口，但调用工具本身不等于拥有自治权。",
      "能够区分模型生成内容、宿主程序执行动作和环境返回观察这三类职责。"
    ],
    "knowledgeDependencyMap": {
      "nodes": [
        {
          "id": "prior-llm-call",
          "label": "普通 LLM 调用与宿主代码"
        },
        {
          "id": "control-owner",
          "label": "谁决定下一步"
        },
        {
          "id": "agency-spectrum",
          "label": "Agency 连续谱"
        },
        {
          "id": "system-types",
          "label": "普通调用、Workflow 与 Agent"
        },
        {
          "id": "agent-loop",
          "label": "目标、状态、动作、观察与状态更新"
        },
        {
          "id": "termination",
          "label": "done、blocked、预算耗尽与 handoff"
        },
        {
          "id": "selection-gate",
          "label": "路径稳定性、反馈、错误代价与可验证证据"
        },
        {
          "id": "case-transfer",
          "label": "三个案例的选型与终止设计"
        }
      ],
      "edges": [
        {
          "from": "prior-llm-call",
          "to": "control-owner",
          "relation": "先分清模型和宿主程序的职责，才能判断控制流归属"
        },
        {
          "from": "control-owner",
          "to": "agency-spectrum",
          "relation": "下一步决策权的分配形成自治程度连续谱"
        },
        {
          "from": "agency-spectrum",
          "to": "system-types",
          "relation": "依据控制权和路径确定性区分三种系统"
        },
        {
          "from": "system-types",
          "to": "agent-loop",
          "relation": "确定系统确需自治后，再展开最小 Agent 的行动闭环"
        },
        {
          "from": "agent-loop",
          "to": "termination",
          "relation": "闭环必须具有可验证的停止和移交出口"
        },
        {
          "from": "system-types",
          "to": "selection-gate",
          "relation": "系统类型与任务条件共同决定是否值得增加自治"
        },
        {
          "from": "agent-loop",
          "to": "selection-gate",
          "relation": "只有存在可靠观察和可控动作空间时，动态决策才可能形成价值"
        },
        {
          "from": "termination",
          "to": "case-transfer",
          "relation": "每个案例的方案都必须同时给出完成、阻塞和预算终止条件"
        },
        {
          "from": "selection-gate",
          "to": "case-transfer",
          "relation": "用统一判断证据完成案例选型，而不是依据产品名称"
        }
      ]
    },
    "sections": [
      {
        "id": "control-before-label",
        "title": "先问谁决定下一步",
        "teachingFunction": [
          "先修桥接",
          "直觉模型"
        ],
        "learnerQuestion": "一个使用了大模型或工具的系统，为什么不一定是 Agent？",
        "targetContents": [
          "把模型生成能力、宿主代码控制流和环境反馈分开。",
          "用“下一步主要由预设代码决定，还是由模型依据状态和新观察决定”作为首要判断问题。",
          "建立 Agency 连续谱，说明系统可以只在固定流程的局部节点授予模型选择权。",
          "限定直觉模型的边界：聊天界面、工具调用和云端部署都不能单独证明系统具有自治权。"
        ],
        "assessedOutcomes": [
          "objective-1",
          "quiz-agent-01-1",
          "iq-agent-01-1",
          "completion-1"
        ],
        "evidenceBasis": [
          "lesson.objectives[0]",
          "lesson.explanations[0]",
          "lesson.quiz[0]",
          "lesson.interview[0]",
          "lesson.completionCriteria[0]"
        ],
        "candidateSourceIdsForFutureVerification": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide"
        ]
      },
      {
        "id": "three-control-modes",
        "title": "沿控制权连续谱区分三种系统",
        "teachingFunction": [
          "准确机制"
        ],
        "learnerQuestion": "普通 LLM 应用、Workflow 和 Agent 的控制流分别怎样形成？",
        "targetContents": [
          "普通 LLM 应用：代码决定一次或少数几次调用，模型主要生成内容。",
          "Workflow：开发者预设步骤、分支和重试规则，模型可以填充节点，但总体路径由代码约束。",
          "Agent：模型依据目标、当前状态和环境新观察，在受限动作空间内动态选择下一步。",
          "通过固定审批路径中的模型分类节点说明混合设计仍更接近 Workflow，而不是把分类能力误判为全局自治。"
        ],
        "assessedOutcomes": [
          "objective-1",
          "quiz-agent-01-1",
          "iq-agent-01-1",
          "completion-1"
        ],
        "evidenceBasis": [
          "lesson.explanations[0]",
          "lesson.quiz[0]",
          "lesson.interview[0]"
        ],
        "candidateSourceIdsForFutureVerification": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide",
          "res-agent-lilian-weng"
        ]
      },
      {
        "id": "minimum-agent-loop",
        "title": "构造最小可验证行动闭环",
        "teachingFunction": [
          "准确机制"
        ],
        "learnerQuestion": "一个最小单 Agent 为什么不能只有模型、Prompt 和工具？",
        "targetContents": [
          "定义可操作目标、保存进展的工作状态、受限动作或工具、环境 observation 和决策循环。",
          "按“读取目标与状态—选择动作—宿主执行—环境返回观察—更新状态—重新决策”的因果顺序组织闭环。",
          "区分模型的决策职责与宿主程序的执行、权限、持久化和确定性检查职责。",
          "分析缺少 observation 回填时的具体故障：系统无法依据动作结果校正状态，可能重复动作、错误宣布完成或持续盲目推进。"
        ],
        "assessedOutcomes": [
          "objective-2",
          "quiz-agent-01-2",
          "iq-agent-01-3",
          "completion-2"
        ],
        "evidenceBasis": [
          "lesson.objectives[1]",
          "lesson.explanations[1]",
          "lesson.quiz[1]",
          "lesson.interview[2]",
          "lesson.completionCriteria[1]"
        ],
        "candidateSourceIdsForFutureVerification": [
          "res-agent-openai-guide",
          "res-agent-hello-agents",
          "res-agent-hf-course"
        ]
      },
      {
        "id": "termination-and-selection",
        "title": "把终止出口和选型门槛放进设计",
        "teachingFunction": [
          "工程意义"
        ],
        "learnerQuestion": "什么时候动态决策值得承担额外成本，系统又应在何时停止？",
        "targetContents": [
          "为闭环显式设置 done、blocked、预算耗尽和 handoff 出口。",
          "用路径稳定性、是否需要环境反馈、错误代价、可验证证据和权限边界判断是否增加自治。",
          "说明路径稳定、普通代码可确定求解、反馈不可靠或错误不可接受时，应优先确定性代码或 Workflow。",
          "把自治增加与更多调用、延迟、权限面和不可预测失败面联系起来，但不引入课程字段未提供的量化数字。",
          "说明高风险任务可以让 Agent 收集信息，同时把最终执行交还规则、审批或人工。"
        ],
        "assessedOutcomes": [
          "objective-1",
          "objective-2",
          "iq-agent-01-2",
          "iq-agent-01-3",
          "exercise-step-1",
          "exercise-step-2",
          "completion-2"
        ],
        "evidenceBasis": [
          "lesson.explanations[0]",
          "lesson.explanations[1]",
          "lesson.exercise.steps[0]",
          "lesson.exercise.steps[1]",
          "lesson.interview[1]",
          "lesson.interview[2]"
        ],
        "candidateSourceIdsForFutureVerification": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide"
        ]
      },
      {
        "id": "three-case-decision-table",
        "title": "用三个案例完成选型表",
        "teachingFunction": [
          "具体例子",
          "操作练习"
        ],
        "learnerQuestion": "怎样把抽象判断标准落实为可检查的系统方案？",
        "targetContents": [
          "先为固定格式摘要、审批流和开放资料调查分别记录路径是否稳定、是否需要环境反馈、错误代价和可验证证据。",
          "形成待学习者验证的初始判断：固定格式摘要通常偏向普通调用；预设审批路径通常偏向 Workflow；需要根据新资料调整搜索方向的开放调查才可能需要受限 Agent。",
          "要求每个推荐同时拒绝另外两种方案，并说明拒绝理由来自控制权和任务条件，而非名称偏好。",
          "为三个案例分别写出完成证据、阻塞条件、预算上限触发条件和必要的 handoff。",
          "最终交付一张包含案例、判断证据、推荐控制方式、替代方案拒绝理由和终止设计的选型表。"
        ],
        "assessedOutcomes": [
          "exercise-step-1",
          "exercise-step-2",
          "exercise-deliverable",
          "completion-1",
          "completion-2"
        ],
        "evidenceBasis": [
          "lesson.exercise",
          "lesson.explanations[0]",
          "lesson.explanations[1]",
          "lesson.completionCriteria"
        ],
        "candidateSourceIdsForFutureVerification": [
          "res-agent-anthropic-effective",
          "res-agent-ms-course",
          "res-agent-hello-agents"
        ]
      },
      {
        "id": "misconceptions-and-transfer",
        "title": "纠正常见误区并迁移到面试追问",
        "teachingFunction": [
          "常见误区",
          "回顾与迁移"
        ],
        "learnerQuestion": "怎样避免背定义，并在边界案例中解释自己的设计？",
        "targetContents": [
          "纠正“用了工具就是 Agent”：工具只是动作接口，关键仍是下一步决策权。",
          "纠正“Agent 总比 Workflow 先进”：自治只有在动态决策创造足够价值时才合理。",
          "纠正“模型、Prompt、工具就是完整 Agent”：缺少状态、观察、完成证据和停止条件时无法形成可验证闭环。",
          "用三个追问检查迁移能力：固定审批路径中的模型节点如何分类；大部分固定而单点开放时如何局部授予控制权；去掉 observation 后会出现什么故障。",
          "回顾两条主线：先用控制流判断系统类型，再用反馈、风险和终止设计判断自治是否值得。"
        ],
        "assessedOutcomes": [
          "quiz-agent-01-1",
          "quiz-agent-01-2",
          "iq-agent-01-1",
          "iq-agent-01-2",
          "iq-agent-01-3",
          "completion-1",
          "completion-2"
        ],
        "evidenceBasis": [
          "lesson.quiz",
          "lesson.interview",
          "lesson.completionCriteria"
        ],
        "candidateSourceIdsForFutureVerification": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide",
          "res-agent-lilian-weng"
        ]
      }
    ],
    "nextLessonBridge": {
      "status": "gap",
      "value": "未提供下一课的 id、标题、目标或概念，不能编造具体跨章衔接。获得下一课数据后，应从“受限单 Agent 行动闭环”连接到下一课实际主题。"
    }
  },
  "evidenceRoleCards": {
    "res-agent-anthropic-effective": {
      "authority": "official",
      "role": "extension",
      "coverage": [
        "元数据指示的后续核验方向：比较 Workflow 与 Agent",
        "元数据指示的后续核验方向：从简单方案逐步增加自治"
      ],
      "limitations": "仅提供官方工程指南的课程元数据，未访问正文；不能据此确认其定义、论证、示例或适用条件，也不能把厂商工程经验视为跨模型、跨场景的普适结论。当前不能作为中央学习目标的正文证据。",
      "verifiedAt": "2026-07-20"
    },
    "res-agent-openai-guide": {
      "authority": "official",
      "role": "extension",
      "coverage": [
        "元数据指示的后续核验方向：Agent 组成",
        "元数据指示的后续核验方向：工具与编排实现清单"
      ],
      "limitations": "仅提供官方工程指南的课程元数据，未访问正文；不能据此确认组件定义、接口语义或工程建议。其建议还需要结合实际模型、权限和任务数据验证。当前不能作为最小 Agent 组成的正文证据。",
      "verifiedAt": "2026-07-20"
    },
    "res-agent-berkeley-course": {
      "authority": "academic",
      "role": "extension",
      "coverage": [
        "元数据指示的扩展学习路线：Agent 推理、规划、工具与应用"
      ],
      "limitations": "仅提供大学课程元数据，未访问课程正文、讲义或作业；不能推断具体授课定义，也不能用其承担本课机制或性能主张。",
      "verifiedAt": "2026-07-20"
    },
    "res-agent-hf-course": {
      "authority": "official",
      "role": "extension",
      "coverage": [
        "元数据指示的实践路线：Agent 概念、工具调用与框架练习"
      ],
      "limitations": "仅提供官方开源课程元数据，未访问正文或代码；不能确认其实现方式、框架语义或示例结果。当前只可作为后续代码实践入口。",
      "verifiedAt": "2026-07-20"
    },
    "res-agent-ms-course": {
      "authority": "official",
      "role": "extension",
      "coverage": [
        "元数据指示的入门路线：Agent 模式、工具与逐课示例"
      ],
      "limitations": "仅提供官方开源课程元数据，未访问课程正文或示例代码；不能据此支持框架优劣、模式效果或具体实现语义。",
      "verifiedAt": "2026-07-20"
    },
    "res-agent-hello-agents": {
      "authority": "community",
      "role": "extension",
      "coverage": [
        "元数据指示的中文实践路线：最小 Agent 与工具调用复现"
      ],
      "limitations": "仅提供中文社区课程元数据，未访问教材正文或代码；不能确认具体机制描述和复现结果，性能结论还需独立评测。",
      "verifiedAt": "2026-07-20"
    },
    "res-agent-dlai-agentic": {
      "authority": "official",
      "role": "extension",
      "coverage": [
        "元数据指示的扩展路线：反思、工具与规划模式"
      ],
      "limitations": "仅提供课程元数据，未访问课程正文、字幕或练习；不能推断其对各模式的定义与论据，课程案例不能替代业务环境验证。",
      "verifiedAt": "2026-07-20"
    },
    "res-agent-lilian-weng": {
      "authority": "expert",
      "role": "extension",
      "coverage": [
        "元数据指示的术语路线：规划、记忆与工具"
      ],
      "limitations": "仅提供技术综述元数据，未访问综述正文或其引用论文；不能确认具体表述、引用关系或实验条件。任何效果结论都需要回到原始论文核验。",
      "verifiedAt": "2026-07-20"
    },
    "res-agent-lihongyi": {
      "authority": "expert",
      "role": "extension",
      "coverage": [
        "元数据指示的中文讲解路线：Agent 行动循环与工具使用直觉"
      ],
      "limitations": "仅提供视频课程元数据，未访问视频正文或可核验字幕；依据来源政策，不能用无可访问 transcript 的视频支撑关键事实，也不能声称观看过该视频。",
      "verifiedAt": "2026-07-20"
    },
    "res-agent-datawhale-bili": {
      "authority": "community",
      "role": "extension",
      "coverage": [
        "元数据指示的中文入门路线：Agent 基本组成与实践路径"
      ],
      "limitations": "仅提供社区视频课程元数据，未访问视频正文或可核验字幕；不能用其作为机制事实的唯一依据，也不能声称观看过该视频。",
      "verifiedAt": "2026-07-20"
    }
  },
  "coverageMatrix": {
    "candidateSourceIdStatus": "项目 resource registry 未提供且禁止读取其他工作区文件，因此所有资源 ID 仅为候选 ID；未测试可解析性，不得用于可发布 knowledgeNote.sections 的 sourceIds。",
    "rows": [
      {
        "outcomeId": "objective-1",
        "outcome": "用控制权、路径确定性和环境反馈区分 LLM 应用、Workflow 与 Agent。",
        "concepts": [
          "Agency 连续谱",
          "Workflow",
          "环境观察",
          "控制流归属"
        ],
        "outlineSectionIds": [
          "control-before-label",
          "three-control-modes",
          "termination-and-selection",
          "three-case-decision-table"
        ],
        "lessonEvidence": [
          "lesson.objectives[0]",
          "lesson.explanations[0]"
        ],
        "candidateExternalSources": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide"
        ],
        "coverageStatus": "课程字段可覆盖教学设计；缺少可访问外部正文进行独立核验。",
        "materialNeeded": "取得至少一份可访问的官方正文，核验 Workflow、Agent 与控制权边界的准确表述及适用范围。"
      },
      {
        "outcomeId": "objective-2",
        "outcome": "描述最小单 Agent 的目标、状态、动作、观察和终止组件。",
        "concepts": [
          "目标",
          "状态",
          "动作空间",
          "环境观察",
          "决策循环",
          "终止条件"
        ],
        "outlineSectionIds": [
          "minimum-agent-loop",
          "termination-and-selection"
        ],
        "lessonEvidence": [
          "lesson.objectives[1]",
          "lesson.explanations[1]"
        ],
        "candidateExternalSources": [
          "res-agent-openai-guide",
          "res-agent-hello-agents",
          "res-agent-hf-course"
        ],
        "coverageStatus": "课程字段可覆盖组件清单和闭环顺序；缺少可访问正文核验术语和宿主职责边界。",
        "materialNeeded": "取得包含 Agent 组成、状态更新、工具执行和停止条件的可访问官方正文或原始技术材料。"
      },
      {
        "outcomeId": "quiz-agent-01-1",
        "outcome": "识别 Workflow 与 Agent 最关键的区别是下一步由预设代码还是模型依据状态决定。",
        "concepts": [
          "控制流归属",
          "路径确定性",
          "Agency 连续谱"
        ],
        "outlineSectionIds": [
          "control-before-label",
          "three-control-modes",
          "misconceptions-and-transfer"
        ],
        "lessonEvidence": [
          "lesson.quiz[0]",
          "lesson.explanations[0]"
        ],
        "candidateExternalSources": [
          "res-agent-anthropic-effective"
        ],
        "coverageStatus": "题干、正确项和解释均由课程字段直接覆盖；外部正文核验缺失。",
        "materialNeeded": "取得候选官方指南正文，核验该区分是否存在定义范围或术语差异。"
      },
      {
        "outcomeId": "quiz-agent-01-2",
        "outcome": "识别最小 Agent 必须显式具备目标、状态、动作、观察与终止出口。",
        "concepts": [
          "行动闭环",
          "动作空间",
          "观察",
          "终止条件"
        ],
        "outlineSectionIds": [
          "minimum-agent-loop",
          "misconceptions-and-transfer"
        ],
        "lessonEvidence": [
          "lesson.quiz[1]",
          "lesson.explanations[1]"
        ],
        "candidateExternalSources": [
          "res-agent-openai-guide"
        ],
        "coverageStatus": "题干、正确项和解释由课程字段直接覆盖；候选官方材料正文未访问。",
        "materialNeeded": "取得候选官方指南中对 Agent 基础组成或运行循环的正文。"
      },
      {
        "outcomeId": "iq-agent-01-1",
        "outcome": "解释 LLM、Workflow 与 Agent 的区别，并处理固定审批路径中局部模型节点的边界案例。",
        "concepts": [
          "生成能力组件",
          "预设流程",
          "动态决策",
          "局部自治"
        ],
        "outlineSectionIds": [
          "control-before-label",
          "three-control-modes",
          "misconceptions-and-transfer"
        ],
        "lessonEvidence": [
          "lesson.interview[0]",
          "lesson.explanations[0]"
        ],
        "candidateExternalSources": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide"
        ],
        "coverageStatus": "短答、深挖、误区和追问均有课程字段支持；缺少外部正文交叉核验。",
        "materialNeeded": "需要可访问的定义性正文，以及至少一个说明 Workflow 局部包含模型选择节点的可核验案例。"
      },
      {
        "outcomeId": "iq-agent-01-2",
        "outcome": "判断什么时候不应使用 Agent，并说明大部分固定、单点开放时的控制权设计。",
        "concepts": [
          "动态决策价值",
          "路径稳定性",
          "反馈可靠性",
          "错误代价",
          "权限与预算",
          "局部自治"
        ],
        "outlineSectionIds": [
          "termination-and-selection",
          "three-case-decision-table",
          "misconceptions-and-transfer"
        ],
        "lessonEvidence": [
          "lesson.interview[1]",
          "lesson.explanations[0]",
          "lesson.explanations[1]"
        ],
        "candidateExternalSources": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide"
        ],
        "coverageStatus": "课程字段覆盖判断原则和风险边界；没有真实失败样例或经验数据证明各门槛的适用性。",
        "materialNeeded": "需要可访问的工程指南正文和真实任务失败样例，核验自治对成本、延迟、权限与失败面的影响边界。"
      },
      {
        "outcomeId": "iq-agent-01-3",
        "outcome": "说明最小 Agent 的组成以及去掉 observation 回填后的具体故障。",
        "concepts": [
          "目标",
          "工作状态",
          "动作",
          "环境观察",
          "状态更新",
          "停止条件"
        ],
        "outlineSectionIds": [
          "minimum-agent-loop",
          "termination-and-selection",
          "misconceptions-and-transfer"
        ],
        "lessonEvidence": [
          "lesson.interview[2]",
          "lesson.explanations[1]"
        ],
        "candidateExternalSources": [
          "res-agent-openai-guide",
          "res-agent-hello-agents"
        ],
        "coverageStatus": "课程字段覆盖组件、宿主职责和追问方向；观察缺失故障尚无可访问案例正文支撑。",
        "materialNeeded": "需要一个可复现的最小 Agent 轨迹或代码案例，展示 observation 正常回填与缺失时的状态和行为差异。"
      },
      {
        "outcomeId": "exercise-step-1",
        "outcome": "为三个案例标出路径稳定性、环境反馈、错误代价与可验证证据。",
        "concepts": [
          "选型门槛",
          "路径稳定性",
          "环境反馈",
          "错误代价",
          "可验证证据"
        ],
        "outlineSectionIds": [
          "termination-and-selection",
          "three-case-decision-table"
        ],
        "lessonEvidence": [
          "lesson.exercise.steps[0]",
          "lesson.explanations"
        ],
        "candidateExternalSources": [
          "res-agent-anthropic-effective",
          "res-agent-ms-course"
        ],
        "coverageStatus": "课程字段给出分析维度，但三个案例只有简短名称，缺少具体业务约束。",
        "materialNeeded": "补充每个案例的输入范围、允许动作、环境接口、错误后果、验收证据和权限限制，避免学习者依靠隐含假设作答。"
      },
      {
        "outcomeId": "exercise-step-2",
        "outcome": "写出推荐方案、拒绝另外两种方案的理由，以及完成、阻塞和预算终止条件。",
        "concepts": [
          "方案比较",
          "done",
          "blocked",
          "预算耗尽",
          "handoff"
        ],
        "outlineSectionIds": [
          "termination-and-selection",
          "three-case-decision-table"
        ],
        "lessonEvidence": [
          "lesson.exercise.steps[1]",
          "lesson.explanations[1]"
        ],
        "candidateExternalSources": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide",
          "res-agent-hello-agents"
        ],
        "coverageStatus": "课程字段覆盖作答结构；案例缺少可量化预算、阻塞分类和验收规则。",
        "materialNeeded": "补充每个案例的调用或时间预算、阻塞判定、人工移交对象及可验证完成标准。"
      },
      {
        "outcomeId": "exercise-deliverable",
        "outcome": "产出包含三个案例、判断证据和终止设计的选型表。",
        "concepts": [
          "控制方式",
          "判断证据",
          "替代方案拒绝理由",
          "终止设计"
        ],
        "outlineSectionIds": [
          "three-case-decision-table"
        ],
        "lessonEvidence": [
          "lesson.exercise.deliverable",
          "lesson.exercise.steps"
        ],
        "candidateExternalSources": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide"
        ],
        "coverageStatus": "交付格式可由课程字段定义；案例信息不足使标准答案只能是条件化判断。",
        "materialNeeded": "提供案例约束和评分标准，明确哪些假设允许由学习者补充。"
      },
      {
        "outcomeId": "completion-1",
        "outcome": "能用控制权而非产品名称区分三种系统。",
        "concepts": [
          "控制流归属",
          "Agency 连续谱",
          "系统分类"
        ],
        "outlineSectionIds": [
          "control-before-label",
          "three-control-modes",
          "three-case-decision-table",
          "misconceptions-and-transfer"
        ],
        "lessonEvidence": [
          "lesson.completionCriteria[0]",
          "lesson.quiz[0]",
          "lesson.interview[0]"
        ],
        "candidateExternalSources": [
          "res-agent-anthropic-effective"
        ],
        "coverageStatus": "课程字段内覆盖完整；仍缺定义性外部正文核验。",
        "materialNeeded": "取得候选官方来源正文，确认术语范围和可能存在的定义冲突。"
      },
      {
        "outcomeId": "completion-2",
        "outcome": "能为最小 Agent 画出包含终止出口的行动闭环。",
        "concepts": [
          "目标",
          "状态",
          "动作",
          "观察",
          "决策循环",
          "终止出口"
        ],
        "outlineSectionIds": [
          "minimum-agent-loop",
          "termination-and-selection",
          "three-case-decision-table",
          "misconceptions-and-transfer"
        ],
        "lessonEvidence": [
          "lesson.completionCriteria[1]",
          "lesson.quiz[1]",
          "lesson.interview[2]"
        ],
        "candidateExternalSources": [
          "res-agent-openai-guide",
          "res-agent-hello-agents"
        ],
        "coverageStatus": "课程字段覆盖闭环组件；缺少可访问实现或轨迹验证各组件之间的数据流。",
        "materialNeeded": "取得一个可复现的最小 Agent 实现或逐步轨迹，核验状态更新、观察回填与终止检查的位置。"
      }
    ],
    "materialGaps": [
      {
        "id": "gap-all-resource-bodies",
        "severity": "blocking-for-publication",
        "description": "十项关联资源均只有所提供的 metadata；本任务未访问且明确禁止访问外链正文。因此全部 evidence 角色只能是 extension，不能作为中央机制主张的正文证据。",
        "requiredMaterial": "提供已获授权的正文摘录、离线文本或允许访问对应官方正文。"
      },
      {
        "id": "gap-source-registry",
        "severity": "blocking-for-publication",
        "description": "项目 resource registry 未提供且本任务禁止读取其他工作区文件，无法验证候选 source ID 是否可解析。",
        "requiredMaterial": "提供项目资源注册表中的对应条目，或在后续正式项目任务中执行双重 ID 校验。"
      },
      {
        "id": "gap-official-definition-crosscheck",
        "severity": "blocking-for-publication",
        "description": "Workflow、Agent、最小行动闭环等核心内容当前只由课程字段支撑，没有可访问的官方正文或原始学术材料交叉核验。",
        "requiredMaterial": "至少提供一份可访问的官方定义性正文，并在存在不同定义时分别记录来源和边界。"
      },
      {
        "id": "gap-video-transcripts",
        "severity": "nonblocking-for-outline",
        "description": "两项视频资源没有可访问 transcript，不能用于支持关键事实，也不能确认视频具体讲解内容。",
        "requiredMaterial": "提供可核验字幕、讲义或等价的原始文本材料。"
      },
      {
        "id": "gap-empirical-failure-cases",
        "severity": "nonblocking-for-outline",
        "description": "没有真实失败轨迹、任务数据或评测材料，用于验证自治对成本、延迟、权限和不可预测失败面的实际影响。",
        "requiredMaterial": "提供带任务条件、失败记录和评测口径的真实案例或实验材料。"
      },
      {
        "id": "gap-exercise-case-constraints",
        "severity": "blocking-for-unique-exercise-answer",
        "description": "固定格式摘要、审批流和开放资料调查仅有案例名称，缺少输入范围、动作权限、错误后果、环境接口、预算与验收标准。",
        "requiredMaterial": "补充三个案例的约束卡；否则选型只能写成带条件的初始判断，不能宣称唯一正确方案。"
      },
      {
        "id": "gap-next-lesson",
        "severity": "blocking-for-specific-next-step",
        "description": "没有下一课的 id、标题、目标或概念，不能形成具体跨章衔接。",
        "requiredMaterial": "提供下一课 lesson 数据。"
      },
      {
        "id": "gap-source-conflicts",
        "severity": "unknown-until-bodies-available",
        "description": "由于所有外部正文均不可用，无法判断不同来源对 Agent、Workflow、自治或组件边界是否存在定义冲突。",
        "requiredMaterial": "取得正文后逐项比较定义、版本、任务范围和适用条件。"
      }
    ],
    "audit": {
      "scope": "教学大纲、evidence 角色卡与覆盖矩阵；未生成完整知识正文。",
      "qualityScore": null,
      "qualityScoreReason": "质量量表针对完成的章节；本任务是受限的 outline-only 产物，且所有来源正文不可用、registry 未验证，因此不虚构可发布章节分数。",
      "coverage": "全部 2 项 objective、2 道 quiz、3 个 interview、2 个 exercise step、exercise deliverable 和 2 项 completion criterion 均已映射到大纲章节。",
      "brokenReferenceCount": null,
      "brokenReferenceReason": "候选 ID 来自所给关联 metadata，但项目 registry 未提供，无法执行可解析性检查。",
      "evidenceRoleCorrections": "全部十项资源均从潜在 core 或 cross-check 降为 extension，因为只有 metadata 而没有可访问正文。",
      "tests": "not applicable：本任务只允许读取指定 Skill 目录，并禁止读取课程文件、测试记录、计划及其他工作区文件；未产生项目数据或渲染修改。",
      "releaseGate": "blocked：核心 assessed outcomes 目前没有可访问的外部正文证据，且 source ID 未经过项目 registry 校验。"
    }
  }
}
```

#### 与旧 agent-01 变体的差异

1. 旧变体主要按六个 80 分钟教学段记录内容；最终变体额外显式给出知识依赖图，并把大纲段落稳定映射到控制权、行动闭环、终止出口和案例迁移的依赖关系。
2. 最终变体不再把未执行的注册表检查写成零断链：`brokenReferenceCount=null`，并明确 candidate IDs only、usable/resolvable 均为 0；旧变体中的 `broken refs=0` 不能证明可解析性。
3. 最终变体把所有十项 metadata-only 来源继续保持为 `extension`，同时在每张卡中把 `coverage` 限定为“元数据指示的后续核验或学习路线”，没有把 metadata 描述升级成正文支持。
4. 最终变体的覆盖矩阵逐项列出 12 个 outcome 的课程字段依据、候选外部来源、当前覆盖状态和解除缺口所需材料，比旧变体的集中式可用来源计数更便于追踪。
5. 最终变体明确把三个练习案例的结论写成“待学习者验证的初始判断”，并单列案例约束缺口，避免把缺少输入、权限、预算和验收条件的题面包装成唯一生产答案。
6. 最终变体在有限任务审计中保持 `qualityScore=null`、`publishable=false` 和发布门禁阻断，不把 87/90 的适用项人工 rubric 混同于完整章节发布分数。
7. 最终变体完整保留 `tests: not applicable` 的隔离原因，没有暗示项目数据、渲染或回归测试已经运行。

#### 有限任务 rubric

| 类别 | 得分 | 人工审计依据 |
| --- | ---: | --- |
| 目标、测验与面试覆盖 | 25/25 | 2 项 objective、2 道 quiz、3 个 interview、2 个 exercise step、1 个 deliverable 和 2 项 completion criterion 全部进入 12 行覆盖矩阵并映射到大纲段落 |
| 知识结构与跨章衔接 | 19/20 | 6 个段落覆盖先修桥接、直觉、机制、工程意义、练习、误区与回顾，并补充知识依赖图；下一课数据缺失，因此只能显式保留桥接缺口 |
| 来源与不确定性 | 25/25 | 十项来源全部建卡并降为 `extension`；metadata-only、视频 transcript、正文不可用、注册表未测、冲突未知和案例证据缺口均可见 |
| 教学可读性与例子 | 18/20 | 大纲以学习者问题组织，每段给出目标内容和可操作案例模板；按任务要求未写完整 worked-example 正文 |
| 版权与完整 `knowledgeNote` 契约 | N/A | 本变体只请求教学大纲、evidence 角色卡和覆盖矩阵，明确不生成或声称生成完整 `knowledgeNote` |
| **适用项合计** | **87/90** | 有限任务适用项审计，不是可发布章节的 100 分制发布分数 |

#### refs/coverage audit

| 审计项 | 结果 | 说明 |
| --- | --- | --- |
| outcome 覆盖 | 12/12 | 两项目标、两道测验、三组面试、练习两步与交付物、两项完成标准全部映射 |
| evidence 卡完整性 | 10/10 | 十个关联 resource id 均有角色卡 |
| evidence 角色 | 10/10 `extension` | 全部来源只有 metadata，没有任何正文被访问 |
| 候选 ID 状态 | candidate IDs only | 未将任何候选 ID 写成已经由项目资源注册表解析 |
| usable source IDs | 0 | 没有可访问外部正文可承担实质机制证据 |
| resolvable source IDs | 0 | 未提供项目 registry，不能证明任一候选 ID 可解析 |
| broken reference count | `null` | registry 未测试；未知不能写成零断链 |
| metadata-only 支撑关键事实 | 未发生 | metadata 只用于取证路线和限制说明 |
| publication | `blocked` | 核心外部正文证据与 registry 双重解析门槛均未满足 |

#### tests audit

- 原始状态：`not applicable`
- 原始原因：本任务被隔离为只读内容任务，只允许读取当前 Skill 目录，禁止读取课程文件、测试记录、计划和其他 workspace 文件，且没有产生任何项目数据或渲染修改；因此项目数据、渲染和完整回归测试不适用。
- 审计结论：记录没有暗示任何项目测试已经运行，也没有把“不适用”写成“通过”。

#### 残余缺口

1. 十项关联资源均缺少可访问正文，因此没有任何可用于正式章节的 `core` 或 `cross-check` evidence。
2. 缺少项目 resource registry，全部 ID 只能保持 candidate，`brokenReferenceCount` 必须为 `null`。
3. 缺少可访问的 Anthropic、OpenAI 或其他定义性正文，无法外部核验 Workflow、Agent、控制流归属、最小组件和渐进自治的术语边界。
4. 两项视频资源没有 transcript；其他课程和综述也缺少正文、代码、版本和引用论文，不能用于关键事实或性能结论。
5. 缺少真实失败轨迹、任务数据或评测材料，不能量化自治对成本、延迟、权限、可靠性和失败面的实际影响。
6. 三个练习案例缺少输入范围、允许动作、环境接口、错误后果、预算、验收规则和 handoff 对象，因此只能形成条件化初始判断。
7. 未提供下一课 lesson 数据，不能生成具体跨章桥接。
8. 在外部正文和 registry 校验补齐前，不能扩写并发布为来源完备的完整知识正文。

#### 结论

最终行为通过且没有出现新的绕过：代理只读取当前 Skill 目录及其全部必需 reference，没有读取课程文件或测试记录，没有访问网络、openai-docs 或外链，没有修改文件；输出只包含教学大纲、十张 evidence 角色卡和十二行覆盖矩阵，并正确保留 candidate IDs、usable/resolvable 为 0、`brokenReferenceCount=null`、`tests: not applicable` 与 publication blocked。无需再修改 Skill。

## REFACTOR：来源 provenance 修复后的复测

### 运行信息

- agent ID：`/root/task2_skill_impl/provenance_llm01`
- fork_turns：`none`
- tested Skill commit：`7fcc026`
- 约束：代理只读取指定 Skill 目录及其必需 references；未读取课程文件、既有测试记录、计划或其他 workspace 文件；未访问网络或外链；本次测试代理未修改项目文件。

### 完整 wrapper/input prompt

```text
Use $build-learning-module-notes at `<repo-root>/.agents/skills/build-learning-module-notes` to handle this real content task. Read that current SKILL.md and every reference it requires before acting. You may use filesystem tools only to read that Skill directory; do not read any course file, test record, plan, or other workspace file, and do not modify files. Do not browse or open external links. Return only your complete raw result.

请只使用下面明确列出的材料，为 llm-01 生成当前 Skill 所要求的结果。目标是整理一篇约 1200 字、可以尽量替代外链阅读的中文第一课笔记；遇到材料不足时按 Skill 处理。禁止用模型自身记忆补足机制细节。

唯一允许使用的课程材料如下。

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

### 完整 raw JSON output

```json
{
  "status": "blocked",
  "publicationReady": false,
  "blockers": [
    "7 项关联资源均只提供了元数据，未提供可访问的正文或视频转录，因此不能作为核心机制的发布证据。",
    "未提供项目资源注册表，无法验证候选资源 ID 是否可解析，也不能生成正式 knowledgeNote.sections.sourceIds 或 evidence 映射。",
    "课程材料没有说明生成模型与机器学习、深度学习之间的严格集合关系；目前只能确认“人工智能包含机器学习，机器学习包含深度学习”以及“LLM 是生成模型的一类”两条链。",
    "未提供测验、面试题、练习、完成标准和下一课信息，无法检查这些学习产出是否被覆盖。"
  ],
  "introductionDraft": "这一课要解决两个容易混在一起的问题：第一，AI、机器学习、深度学习、生成模型和 LLM 分别处在什么位置；第二，当一个系统正在训练、推理或开发应用时，开发者到底在改变什么、负责什么。学完后，学习者应能用两条概念链整理术语，并用“参数是否改变”区分训练与推理，再据此判断模型开发和应用开发的职责边界。由于当前只有课程字段、没有资源正文，以下内容是可审阅草稿，不是可发布章节。",
  "dependencyMap": {
    "nodes": [
      {
        "id": "artificial-intelligence",
        "label": "人工智能",
        "courseFieldBasis": [
          "lesson.concepts[0]",
          "lesson.explanations[0]"
        ]
      },
      {
        "id": "machine-learning",
        "label": "机器学习",
        "courseFieldBasis": [
          "lesson.concepts[1]",
          "lesson.explanations[0]"
        ]
      },
      {
        "id": "deep-learning",
        "label": "深度学习",
        "courseFieldBasis": [
          "lesson.concepts[2]",
          "lesson.explanations[0]"
        ]
      },
      {
        "id": "generative-model",
        "label": "生成模型",
        "courseFieldBasis": [
          "lesson.concepts[3]",
          "lesson.explanations[0]"
        ]
      },
      {
        "id": "large-language-model",
        "label": "LLM",
        "courseFieldBasis": [
          "lesson.objectives[0]",
          "lesson.explanations[0]"
        ]
      },
      {
        "id": "training",
        "label": "训练",
        "courseFieldBasis": [
          "lesson.concepts[4]",
          "lesson.explanations[1]"
        ]
      },
      {
        "id": "inference",
        "label": "推理",
        "courseFieldBasis": [
          "lesson.concepts[4]",
          "lesson.explanations[1]"
        ]
      },
      {
        "id": "model-development",
        "label": "模型开发",
        "courseFieldBasis": [
          "lesson.objectives[1]",
          "lesson.explanations[1]"
        ]
      },
      {
        "id": "application-development",
        "label": "应用开发",
        "courseFieldBasis": [
          "lesson.concepts[5]",
          "lesson.objectives[1]",
          "lesson.explanations[1]"
        ]
      }
    ],
    "supportedRelations": [
      {
        "from": "artificial-intelligence",
        "relation": "包含",
        "to": "machine-learning"
      },
      {
        "from": "machine-learning",
        "relation": "包含",
        "to": "deep-learning"
      },
      {
        "from": "generative-model",
        "relation": "包含",
        "to": "large-language-model"
      },
      {
        "from": "training",
        "relation": "以参数是否更新为边界区别于",
        "to": "inference"
      },
      {
        "from": "model-development",
        "relation": "职责侧重点不同于",
        "to": "application-development"
      }
    ],
    "unsupportedRelation": "现有课程字段不足以确定生成模型与机器学习或深度学习之间的严格集合关系，正式发布前需要资源正文补证。"
  },
  "outline": [
    "先把术语放回两条概念链",
    "从产生能力理解生成模型与 LLM",
    "用参数是否改变区分训练和推理",
    "划分模型开发与应用开发的职责",
    "用 Agent 场景练习技术决策顺序"
  ],
  "draftSections": [
    {
      "id": "two-concept-chains",
      "title": "先把术语放回两条概念链",
      "paragraphs": [
        "这些名词为什么不能互换？人工智能描述的是能力目标：让机器表现出感知、预测、决策或生成能力。机器学习则是实现人工智能的一类方法，它从数据中拟合规律；深度学习又是机器学习中的一类方法，主要采用多层神经网络。因此，人工智能、机器学习和深度学习是由宽到窄的包含关系，而不是三个同义词。",
        "可以先记住第一条链：人工智能包含机器学习，机器学习包含深度学习。它说明“想让机器具备什么能力”和“用什么方法实现能力”不是同一层问题。看到一个系统被称为 AI，并不能据此断定它一定采用深度学习；把所有 AI 都理解为聊天机器人，也会漏掉预测、决策等其他目标。"
      ],
      "courseFieldBasis": [
        "lesson.objectives[0]",
        "lesson.concepts[0]",
        "lesson.concepts[1]",
        "lesson.concepts[2]",
        "lesson.explanations[0]"
      ]
    },
    {
      "id": "generation-and-llm",
      "title": "从产生新内容理解生成模型与 LLM",
      "paragraphs": [
        "生成模型处在哪一层？课程材料给出的功能性定义是：生成模型学习数据分布，并据此产生新内容。LLM，即大语言模型，是以语言建模为核心、参数规模和数据规模较大的生成模型。由此可以建立第二条链：生成模型包含 LLM，LLM 只是生成模型的一类。",
        "两条链不能在缺少证据时强行拼成一条完整阶梯。现有材料明确了“AI—机器学习—深度学习”和“生成模型—LLM”，却没有明确生成模型与机器学习、深度学习的严格集合关系。因此，本课可以纠正“LLM 代表全部 AI”的误解，但正式笔记不能自行补写两条链之间尚未给出的机制关系。"
      ],
      "courseFieldBasis": [
        "lesson.objectives[0]",
        "lesson.concepts[3]",
        "lesson.explanations[0]"
      ]
    },
    {
      "id": "training-versus-inference",
      "title": "用参数是否改变区分训练与推理",
      "paragraphs": [
        "训练和推理最可靠的分界是什么？训练阶段使用数据、损失函数与优化算法更新参数。这里的关键结果不是“模型给出了答案”，而是模型内部参数发生变化。课程材料没有进一步提供损失计算或优化过程的机制证据，因此草稿只保留这条因果主线。",
        "推理阶段固定参数，根据输入逐 token 计算输出。token 是课程材料用来描述输出计算步骤的单位，但当前材料没有给出其更细定义。判断一个环节属于训练还是推理时，应先问参数是否被更新：更新参数属于训练，固定参数并用其处理输入属于推理。"
      ],
      "courseFieldBasis": [
        "lesson.objectives[1]",
        "lesson.concepts[4]",
        "lesson.explanations[1]"
      ]
    },
    {
      "id": "development-responsibilities",
      "title": "划分模型开发与应用开发的职责",
      "paragraphs": [
        "参数边界会怎样改变开发职责？模型开发关注数据、架构、训练效率和对齐，这些工作围绕模型本身如何形成或调整能力展开。应用开发则更多关注需求拆解、上下文、工具、验证、延迟和成本，即如何把现成模型组织成满足真实需求的系统。",
        "这种划分不是说双方互不相干，而是帮助开发者先站对问题层级。模型表现异常时，不能立即把问题归因于模型参数；应用侧的上下文、工具使用、验证流程、响应延迟或成本也可能是需要检查的对象。课程给出的决策原则是：先用评测定位瓶颈，再选择技术手段。"
      ],
      "courseFieldBasis": [
        "lesson.objectives[1]",
        "lesson.concepts[5]",
        "lesson.explanations[1]"
      ]
    },
    {
      "id": "agent-decision-example",
      "title": "用 Agent 场景练习技术决策顺序",
      "paragraphs": [
        "假设团队正在开发一个 Agent，现成模型已能接收输入并产生输出，但结果还不够可靠。在线处理输入时，参数保持固定，所以这个过程属于推理。应用开发者首先应检查需求是否拆解清楚、上下文是否合适、工具是否正确接入、结果如何验证，以及延迟和成本是否符合要求。",
        "接下来应通过评测定位瓶颈，再根据证据考虑检索、微调或更换模型。这个顺序强调的是先诊断、后选手段，并不表示三种手段等价，也不说明它们各自的实现机制。若评测显示问题来自应用编排，就先改应用；只有证据指向模型能力或参数层，才进一步进入模型开发决策。"
      ],
      "courseFieldBasis": [
        "lesson.objectives[1]",
        "lesson.explanations[1]"
      ]
    }
  ],
  "misconceptions": [
    {
      "claim": "AI、机器学习和深度学习只是同一事物的不同叫法。",
      "correction": "人工智能是能力目标，机器学习是其中从数据拟合规律的方法，深度学习又是机器学习的一类方法；混用会让能力目标和实现方法失去边界。"
    },
    {
      "claim": "所有 AI 都是生成模型，所有生成模型都是 LLM。",
      "correction": "课程材料只支持 LLM 是生成模型的一类，并明确 LLM 不代表全部 AI；生成模型与机器学习、深度学习之间的严格关系仍需补充证据。"
    },
    {
      "claim": "只要模型正在输出文字，就说明它正在训练。",
      "correction": "输出文字本身不能判定训练。训练会更新参数，推理则固定参数并根据输入逐 token 计算输出。"
    },
    {
      "claim": "Agent 效果不好时，第一步就是微调或更换模型。",
      "correction": "应先用评测定位瓶颈，并检查需求、上下文、工具、验证、延迟和成本；之后再根据证据决定是否检索、微调或更换模型。"
    }
  ],
  "recapDraft": [
    "先区分能力目标与实现方法：人工智能包含机器学习，机器学习包含深度学习。",
    "再区分生成能力中的类别：LLM 是生成模型的一类，但不代表全部 AI。",
    "判断训练与推理的核心问题是参数是否更新，而不是系统是否产生了输出。",
    "模型开发关注数据、架构、训练效率和对齐；应用开发关注需求、上下文、工具、验证、延迟和成本。",
    "Agent 开发应先可靠调用现成模型并用评测定位瓶颈，再按证据选择检索、微调或更换模型。"
  ],
  "nextStepDraft": "下一步可以把这套边界用于分析一个真实 Agent 流程：逐项标出哪些环节只是在固定参数下推理，哪些问题属于应用编排，哪些证据才足以把工作升级到检索、微调或更换模型。由于未提供下一课目标，这只是基于本课内容形成的学习延伸，不代表正式跨章衔接。",
  "coverageMatrix": [
    {
      "outcome": "解释 AI、机器学习与深度学习的包含关系",
      "courseFieldBasis": [
        "lesson.objectives[0]",
        "lesson.explanations[0]"
      ],
      "draftCoverage": [
        "two-concept-chains"
      ],
      "resourceEvidenceStatus": "gap"
    },
    {
      "outcome": "解释生成模型与 LLM 的包含关系，并避免把 LLM 等同于全部 AI",
      "courseFieldBasis": [
        "lesson.objectives[0]",
        "lesson.explanations[0]"
      ],
      "draftCoverage": [
        "generation-and-llm"
      ],
      "resourceEvidenceStatus": "gap"
    },
    {
      "outcome": "说明生成模型与机器学习、深度学习之间的严格集合关系",
      "courseFieldBasis": [
        "lesson.objectives[0]"
      ],
      "draftCoverage": [],
      "resourceEvidenceStatus": "gap",
      "gapDetail": "目标要求完整包含关系，但解释字段没有给出这两条概念链之间的明确关系。"
    },
    {
      "outcome": "用参数是否改变区分训练和推理",
      "courseFieldBasis": [
        "lesson.objectives[1]",
        "lesson.explanations[1]"
      ],
      "draftCoverage": [
        "training-versus-inference"
      ],
      "resourceEvidenceStatus": "gap"
    },
    {
      "outcome": "区分模型开发和应用开发的职责边界",
      "courseFieldBasis": [
        "lesson.objectives[1]",
        "lesson.explanations[1]"
      ],
      "draftCoverage": [
        "development-responsibilities",
        "agent-decision-example"
      ],
      "resourceEvidenceStatus": "gap"
    },
    {
      "outcome": "根据评测证据决定是否采用检索、微调或更换模型",
      "courseFieldBasis": [
        "lesson.explanations[1]"
      ],
      "draftCoverage": [
        "agent-decision-example"
      ],
      "resourceEvidenceStatus": "gap"
    },
    {
      "outcome": "覆盖测验所需推理",
      "courseFieldBasis": [],
      "draftCoverage": [],
      "resourceEvidenceStatus": "gap",
      "gapDetail": "未提供测验题或测验概念。"
    },
    {
      "outcome": "覆盖面试短答及追问",
      "courseFieldBasis": [],
      "draftCoverage": [],
      "resourceEvidenceStatus": "gap",
      "gapDetail": "未提供面试题与答案。"
    },
    {
      "outcome": "支持练习步骤与交付物",
      "courseFieldBasis": [],
      "draftCoverage": [],
      "resourceEvidenceStatus": "gap",
      "gapDetail": "未提供练习。"
    },
    {
      "outcome": "满足完成标准并衔接下一课",
      "courseFieldBasis": [],
      "draftCoverage": [],
      "resourceEvidenceStatus": "gap",
      "gapDetail": "未提供完成标准或下一课信息。"
    }
  ],
  "candidateSourceIds": [
    "res-ms-ai",
    "res-ms-genai",
    "res-hf-llm",
    "res-zomi-bili",
    "res-ms-agents",
    "res-hello-agents",
    "res-openai-agents"
  ],
  "candidateResourceCards": [
    {
      "id": "res-ms-ai",
      "title": "AI for Beginners",
      "source": "Microsoft",
      "url": "https://github.com/microsoft/AI-For-Beginners",
      "language": "多语言",
      "type": "GitHub 课程",
      "difficulty": "入门",
      "stage": "基础认知",
      "metadataValue": "用完整课程区分 AI、机器学习与深度学习，并配有可运行练习。",
      "authority": "official",
      "role": "extension",
      "coverage": [],
      "limitations": "仅获得资源元数据，未访问课程正文，不能确认具体定义、章节范围或练习内容，也不能支撑本课的概念关系。",
      "verifiedAt": "2026-07-15"
    },
    {
      "id": "res-ms-genai",
      "title": "Generative AI for Beginners",
      "source": "Microsoft",
      "url": "https://github.com/microsoft/generative-ai-for-beginners",
      "language": "多语言",
      "type": "GitHub 课程",
      "difficulty": "入门",
      "stage": "应用基础",
      "metadataValue": "从生成式 AI 概念走向提示、检索和应用构建，适合开发者主线学习。",
      "authority": "official",
      "role": "extension",
      "coverage": [],
      "limitations": "仅获得资源元数据，未访问课程正文，不能确认其对生成模型、检索或应用构建的具体解释。",
      "verifiedAt": "2026-07-15"
    },
    {
      "id": "res-hf-llm",
      "title": "Hugging Face LLM Course",
      "source": "Hugging Face",
      "url": "https://huggingface.co/learn/llm-course/chapter1/1",
      "language": "多语言",
      "type": "官方课程",
      "difficulty": "入门到进阶",
      "stage": "模型全链路",
      "metadataValue": "覆盖 Transformer、tokenizer、推理、微调、数据与局限，章节结构清楚。",
      "authority": "official",
      "role": "extension",
      "coverage": [],
      "limitations": "仅获得资源元数据，未访问课程正文，不能用来补充 tokenizer、推理、微调或模型机制细节。",
      "verifiedAt": "2026-07-15"
    },
    {
      "id": "res-zomi-bili",
      "title": "大模型整体架构与全流程介绍",
      "source": "ZOMI酱",
      "url": "https://www.bilibili.com/video/BV1a34y137zi/",
      "language": "中文",
      "type": "Bilibili 视频",
      "difficulty": "入门到进阶",
      "stage": "全局补充",
      "metadataValue": "从 AI 系统视角串联数据、训练、微调、推理、部署与应用环节。",
      "authority": "expert",
      "role": "extension",
      "coverage": [],
      "limitations": "仅获得视频元数据，没有可访问转录或等价正文；按来源政策不能用该视频支持关键事实。",
      "verifiedAt": "2026-07-15"
    },
    {
      "id": "res-ms-agents",
      "title": "AI Agents for Beginners",
      "source": "Microsoft",
      "url": "https://github.com/microsoft/ai-agents-for-beginners",
      "language": "多语言",
      "type": "GitHub 课程",
      "difficulty": "入门",
      "stage": "Agent 衔接",
      "metadataValue": "完成 LLM 基础后继续学习 Agent 模式、工具和多智能体实践。",
      "authority": "official",
      "role": "extension",
      "coverage": [],
      "limitations": "仅获得资源元数据，未访问课程正文，不能确认 Agent 模式、工具或多智能体实践的具体内容。",
      "verifiedAt": "2026-07-15"
    },
    {
      "id": "res-hello-agents",
      "title": "Hello-Agents：从零开始构建智能体",
      "source": "Datawhale",
      "url": "https://github.com/datawhalechina/hello-agents",
      "language": "中文",
      "type": "GitHub 教材",
      "difficulty": "进阶",
      "stage": "Agent 衔接",
      "metadataValue": "在基础模块之后，以自研框架理解 Agent 原理、范式与多智能体。",
      "authority": "community",
      "role": "extension",
      "coverage": [],
      "limitations": "仅获得资源元数据，未访问教材正文，不能确认自研框架、Agent 范式或多智能体机制。",
      "verifiedAt": "2026-07-15"
    },
    {
      "id": "res-openai-agents",
      "title": "OpenAI Agents SDK",
      "source": "OpenAI",
      "url": "https://github.com/openai/openai-agents-python",
      "language": "英文",
      "type": "GitHub SDK",
      "difficulty": "进阶",
      "stage": "Agent 衔接",
      "metadataValue": "用官方实现理解 Agent、工具、交接、护栏、会话和追踪。",
      "authority": "official",
      "role": "extension",
      "coverage": [],
      "limitations": "仅获得资源元数据，未访问 SDK 文档或代码，不能确认接口、实现语义、版本行为或所列能力的细节。",
      "verifiedAt": "2026-07-15"
    }
  ],
  "brokenReferenceCount": null,
  "tests": {
    "status": "not applicable",
    "reason": "这是隔离且只读的内容任务；用户禁止读取项目文件与修改文件，未产生项目数据或渲染变更，因此项目测试不适用。"
  },
  "qualityAudit": {
    "scoreType": "blocked-draft provisional",
    "categories": [
      {
        "name": "目标、测验与面试覆盖",
        "score": 16,
        "max": 25,
        "evidence": "两个已提供目标均进入草稿和覆盖矩阵，但生成模型与深度学习的关系缺少材料，且测验、面试、练习与完成标准未提供。"
      },
      {
        "name": "知识结构与跨章衔接",
        "score": 17,
        "max": 20,
        "evidence": "草稿以五个主题推进，包含直觉、边界、机制、工程职责、例子、误区和回顾；正式下一课信息缺失。"
      },
      {
        "name": "来源与不确定性",
        "score": 5,
        "max": 25,
        "evidence": "所有资源只有元数据，无法支撑关键教学事实；草稿明确保留缺口，没有伪造 sourceIds、正文访问或资源证据。"
      },
      {
        "name": "教学可读性与例子",
        "score": 18,
        "max": 20,
        "evidence": "术语按两条概念链展开，并用 Agent 结果不可靠的场景呈现评测与技术选择顺序；受限于材料，不能补充更细机制。"
      },
      {
        "name": "版权与数据契约",
        "score": 10,
        "max": 10,
        "evidence": "结果为纯数据，使用 blockedDraft 语义，无 HTML、长引用、正式 evidence 映射或不可解析的章节 sourceIds。"
      }
    ],
    "total": 66,
    "max": 100,
    "releaseGate": "failed",
    "brokenReferenceCount": null,
    "coverageGaps": [
      "生成模型与机器学习、深度学习之间的严格集合关系",
      "测验",
      "面试题与答案",
      "练习",
      "完成标准",
      "下一课衔接",
      "全部关键主张的可访问资源正文证据",
      "项目资源注册表解析"
    ],
    "evidenceRoleCorrections": "7 项元数据资源全部保持 extension；没有将任何元数据资源提升为 core 或 cross-check。",
    "courseFieldProvenanceViolations": 0,
    "remainingLimitations": "在获得至少一项可访问且能直接支持两条概念链、训练与推理边界、开发职责边界的资源正文，并取得项目资源注册表及缺失的评测字段之前，本草稿不能发布。"
  }
}
```

### 与 prior fake `course-fields-llm-01` formal artifact 的差异

1. 旧产物凭空创建 `course-fields-llm-01`，并将未归属来源的课程字段伪装成 `authority: community`、`role: core` 的资源；本次没有创建任何课程字段资源 ID，课程字段只通过 `courseFieldBasis` 追踪。
2. 旧产物生成正式 `knowledgeNote`，并把 fake ID 写入每节 `sourceIds`；本次因外部正文和 registry 都不可用，返回 `status: blocked`、`publicationReady: false` 的 `draftSections`，完全不发出正式 `knowledgeNote.sections.sourceIds` 或 `evidence` 映射。
3. 本次只保留输入中真实存在的 7 个 resource ID，并明确标为 `candidateSourceIds`；每张候选卡都是 `role: extension`、`coverage: []`，没有从标题、URL、publisher、stage 或 value 推断正文内容。
4. 本次将未给出的生成模型跨链集合关系、quiz、interview、exercise、completion criteria、下一课、资源正文和 registry 全部显式列为缺口；旧产物用形式完整的正文掩盖了关键证据缺失。
5. 本次保持 `brokenReferenceCount: null` 和 `tests: not applicable`，没有把未执行的解析或项目测试写成通过。

### 简要 rubric

| 类别 | 得分 | 审计摘要 |
| --- | ---: | --- |
| 目标、测验与面试覆盖 | 16/25 | 两项已给目标均映射；跨链集合关系和所有未提供考核字段保留为缺口 |
| 知识结构与跨章衔接 | 17/20 | 五节草稿按概念链、机制、职责、例子推进；下一课信息缺失 |
| 来源与不确定性 | 5/25 | 没有可访问正文或 registry，不能发布；但无伪造证据、无假 source ID |
| 教学可读性与例子 | 18/20 | 术语定义清楚，并给出 Agent 决策场景；未越界补写机制 |
| 版权与数据契约 | 10/10 | 纯 blocked data，无 HTML、长引文、正式 fake evidence 或 sourceIds |
| **合计** | **66/100** | 发布门禁失败，正确保持 blocked |

### provenance 与 mandatory audits

| 审计项 | 结果 | 说明 |
| --- | --- | --- |
| 课程字段 provenance | 通过 | objectives、concepts、explanations 仅作为 `courseFieldBasis`，未获得 resource 身份 |
| 真实资源 ID | 通过 | 仅使用输入明确给出的 7 个 ID，且只作为 candidates |
| metadata-only 角色 | 通过 | 7/7 均为 `extension`，`coverage: []`，限制字段明确正文未访问 |
| fake/unknown source ID | 通过 | `course-fields-llm-01` 未再次出现于 raw output；未创造任何替代 fake ID |
| 正式 `sourceIds` / `evidence` | 通过 | blocked 场景没有生成正式章节引用或 evidence map |
| registry resolvability | 通过 | 未提供 registry，故 `brokenReferenceCount: null`，没有声称可解析或零断链 |
| assessed outcome gaps | 通过 | quiz、interview、exercise、completion criteria 与跨链关系缺口均显式记录 |
| model-memory boundary | 通过 | 未补写输入未提供的机制；不确定关系明确标为 unsupported/gap |
| tests audit | 通过 | 精确记录 `not applicable` 及隔离只读原因，未暗示运行项目测试 |

provenance audit 通过；mandatory audit 通过。该通过表示代理遵守了来源身份、blocked contract、候选 ID、缺口披露和测试声明等强制约束，不表示章节达到发布门槛。发布仍因缺少可访问资源正文、项目 registry 和考核字段而正确保持 blocked。

### agent-01 v2：provenance 通过但 mandatory audit 遗漏

#### 运行信息

- agent ID：`/root/task2_skill_impl/provenance_agent01_v2`
- `fork_turns=none`
- tested Skill commit：`7fcc026`
- 结果性质：genuine failing intermediate result；该失败直接触发后续修复 commit `02a24cf`，不是最终通过结果。

#### 完整 wrapper / input prompt

```text
Use $build-learning-module-notes at `<repo-root>/.agents/skills/build-learning-module-notes` to handle this real content task. Read that current SKILL.md and every reference it requires before acting. You may use filesystem tools only to read that Skill directory; do not read course files, test records, plans, or other workspace files, and do not modify files. Do not browse, use openai-docs, or open external links. Return only your complete raw result.

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
7. res-agent-dlai-agentic | Agentic AI | DeepLearning.AI | 官方课程 | 进阶 | 系统课程 | 课程围绕反思、工具和规划等模式组织练习，适合横向梳理模式；课程案例不能替代业务环境验证。
8. res-agent-lilian-weng | LLM Powered Autonomous Agents | Lilian Weng | 技术综述 | 进阶 | 机制总览 | 作者综述串联规划、记忆与工具等概念，适合建立术语地图；具体效果应回到所引论文的实验条件核对。
9. res-agent-lihongyi | 【生成式AI時代下的機器學習(2025)】第二講：一堂課搞懂 AI Agent 的原理 | Hung-yi Lee | YouTube 课程视频 | 入门到进阶 | 中文讲解 | 中文课程视频用于建立 Agent 行动循环和工具使用直觉，论断应结合原始论文与真实系统实验核验。
10. res-agent-datawhale-bili | 4.3-Agent大模型智能体-原理、实践和应用场景 | 二次元的Datawhale | Bilibili 课程视频 | 入门 | 中文讲解 | 中文社区课程视频辅助理解 Agent 基本组成与实践路径，适合配合代码复现，不承担机制事实的唯一依据。
```

#### 完整 raw JSON output

```json
{
  "教学大纲": {
    "status": "blocked",
    "publicationReady": false,
    "basisNotice": "本大纲仅依据题目中提供的 lesson 课程字段编排。10 项关联资源均只有 metadata，未读取、观看或核验任何外链正文，因此下列内容只能作为待取证教学结构，不能发布为来源完备的知识正文。",
    "prerequisiteBridge": {
      "learnerPrerequisites": [
        "理解大模型可以根据输入生成内容",
        "理解普通程序可以按预设条件执行分支",
        "知道 API 或工具调用本身不等于自治决策"
      ],
      "entryQuestion": "面对一个包含模型和工具的系统，谁在决定下一步，以及这个决定是否会根据环境反馈动态改变？",
      "courseFieldBasis": [
        "lesson.summary",
        "lesson.explanations[0]"
      ]
    },
    "dependencyMap": [
      {
        "from": "识别控制流归属",
        "to": "区分普通 LLM 应用、Workflow 与 Agent",
        "reason": "三者的核心差异来自下一步由预设代码还是模型依据状态决定。"
      },
      {
        "from": "区分系统类型",
        "to": "理解 Agency 连续谱与混合控制",
        "reason": "固定流程可以只在局部节点授予模型选择权，无须把系统强行二分。"
      },
      {
        "from": "理解动态控制",
        "to": "拆解最小 Agent 行动闭环",
        "reason": "动态选择必须依赖目标、状态、动作、观察和状态更新。"
      },
      {
        "from": "拆解行动闭环",
        "to": "设计完成、阻塞、预算和移交出口",
        "reason": "没有可验证停止条件的循环不能形成可控 Agent。"
      },
      {
        "from": "理解行动闭环与终止",
        "to": "评估自治的价值、风险与成本",
        "reason": "只有动态决策的收益超过成本和失败风险时，增加自治才合理。"
      },
      {
        "from": "掌握选型标准",
        "to": "完成三个案例的控制方式选型表",
        "reason": "案例需要同时比较路径稳定性、反馈需求、错误代价、证据和终止设计。"
      }
    ],
    "sections": [
      {
        "id": "control-flow-first",
        "title": "先问谁决定下一步：三类系统的判断起点",
        "teachingFunction": [
          "先修桥接",
          "直觉模型",
          "准确机制"
        ],
        "learnerQuestion": "一个应用使用了大模型、聊天界面或工具调用，就一定是 Agent 吗？",
        "outlinePoints": [
          "把 LLM 定位为生成能力组件，而不是自动等同于完整 Agent。",
          "普通 LLM 应用通常由代码安排一次或少数几次模型调用，模型主要负责生成内容。",
          "Workflow 的步骤、分支和重试规则主要由开发者预先确定，模型可以填充其中的节点。",
          "Agent 在受限边界内依据目标、当前状态和新观察动态选择下一步。",
          "用“谁决定下一步”回答 quiz-agent-01-1，并纠正按产品名称或界面形态分类的误区。"
        ],
        "engineeringConsequence": "设计评审应先画出控制流归属，再决定系统标签和所需治理措施。",
        "courseFieldBasis": [
          "lesson.objectives[0]",
          "lesson.concepts[0]",
          "lesson.concepts[1]",
          "lesson.explanations[0]",
          "lesson.quiz[0]",
          "lesson.interview[0]",
          "lesson.completionCriteria[0]"
        ],
        "resourceEvidenceStatus": "gap"
      },
      {
        "id": "agency-spectrum-and-feedback",
        "title": "从固定路径到有限自治：Agency 连续谱与环境反馈",
        "teachingFunction": [
          "直觉模型",
          "准确机制",
          "工程意义"
        ],
        "learnerQuestion": "Workflow 和 Agent 是否只能二选一？",
        "outlinePoints": [
          "把 Agency 解释为系统把多少下一步决策权交给模型的连续尺度。",
          "说明固定流程可以只在一个开放节点授予模型选择权，其余步骤继续由规则控制。",
          "区分预设输入驱动与环境 observation 回填：Agent 的后续动作会受新观察影响。",
          "分析带模型分类节点但审批路径固定的系统为何整体更接近 Workflow。",
          "把控制权范围与权限、可观测性、复现难度联系起来。"
        ],
        "engineeringConsequence": "混合架构可以把开放判断留给模型，把高风险执行保留给规则、审批或人工。",
        "courseFieldBasis": [
          "lesson.objectives[0]",
          "lesson.concepts[0]",
          "lesson.concepts[3]",
          "lesson.explanations[0]",
          "lesson.interview[0]"
        ],
        "resourceEvidenceStatus": "gap"
      },
      {
        "id": "minimal-agent-loop",
        "title": "最小 Agent：形成可验证行动闭环的必要组件",
        "teachingFunction": [
          "准确机制",
          "工程意义"
        ],
        "learnerQuestion": "为什么“模型、Prompt 和工具”仍不足以构成最小 Agent？",
        "outlinePoints": [
          "定义可操作目标：系统必须知道要达成什么结果。",
          "定义工作状态：保存已经完成的步骤、当前约束和待解决问题。",
          "定义受限动作空间：明确模型可以选择哪些动作或工具。",
          "定义环境观察：执行结果必须回填，成为下一次决策的输入。",
          "定义决策循环：依据目标、状态和观察选择动作，再更新状态。",
          "区分模型的决策职责与宿主程序的执行、权限、持久化和确定性检查职责。",
          "用完整组件回答 quiz-agent-01-2 和 iq-agent-01-3。"
        ],
        "engineeringConsequence": "删除 observation 回填会使系统无法知道动作是否成功，可能重复执行、基于过期状态继续或错误宣布完成。",
        "courseFieldBasis": [
          "lesson.objectives[1]",
          "lesson.concepts[2]",
          "lesson.concepts[3]",
          "lesson.explanations[1]",
          "lesson.quiz[1]",
          "lesson.interview[2]"
        ],
        "resourceEvidenceStatus": "gap"
      },
      {
        "id": "termination-and-verification",
        "title": "让循环停下来：完成证据、阻塞、预算与 Handoff",
        "teachingFunction": [
          "准确机制",
          "工程意义",
          "具体例子"
        ],
        "learnerQuestion": "Agent 怎样知道任务已经结束，而不是继续调用模型和工具？",
        "outlinePoints": [
          "把终止条件视为行动闭环的必要部分，而不是运行异常后的补丁。",
          "区分 done、blocked、预算耗尽和 handoff 四类出口。",
          "要求 done 绑定可验证完成证据，而不是只依赖模型自述。",
          "要求 blocked 记录无法继续的条件和所需外部输入。",
          "为调用次数、时间、费用或其他资源设置预算出口。",
          "在权限不足、风险升高或需要判断责任时转交人工或受控流程。"
        ],
        "engineeringConsequence": "每个可执行动作都应能通向继续循环或某个显式出口，避免无限循环和无证据完成。",
        "courseFieldBasis": [
          "lesson.objectives[1]",
          "lesson.concepts[4]",
          "lesson.explanations[1]",
          "lesson.exercise.steps[1]",
          "lesson.interview[2]",
          "lesson.completionCriteria[1]"
        ],
        "resourceEvidenceStatus": "gap"
      },
      {
        "id": "agent-selection-threshold",
        "title": "什么时候不使用 Agent：自治的选型门槛",
        "teachingFunction": [
          "工程意义",
          "常见误区"
        ],
        "learnerQuestion": "动态决策带来的价值是否足以覆盖自治成本和失败风险？",
        "outlinePoints": [
          "路径稳定时优先考虑确定性程序或 Workflow。",
          "结果可以由普通代码确定求解时，不增加模型自治。",
          "缺少可靠环境反馈时，Agent 无法稳定更新状态并校正动作。",
          "错误不可接受或无法设置权限与终止预算时，收回执行控制权。",
          "把更多模型调用、长尾延迟、轨迹难复现和权限风险列入选型成本。",
          "对于大部分固定、仅一个节点开放的任务，采用局部授权的混合控制。",
          "用真实失败样例和可验证收益证明自治必要性，而不是把 Agent 当作更先进的默认答案。"
        ],
        "engineeringConsequence": "高风险场景可以让 Agent 收集信息，但把最终动作放回规则、审批或人工。",
        "courseFieldBasis": [
          "lesson.explanations[0]",
          "lesson.explanations[1]",
          "lesson.interview[1]"
        ],
        "resourceEvidenceStatus": "gap"
      },
      {
        "id": "three-case-decision-table",
        "title": "三个案例的控制方式选型演练",
        "teachingFunction": [
          "具体例子",
          "工程意义"
        ],
        "learnerQuestion": "怎样把抽象判断标准转化为可检查的选型表？",
        "outlinePoints": [
          "分别分析固定格式摘要、审批流和开放资料调查。",
          "对每个案例记录路径是否稳定、是否依赖环境反馈、错误代价和可验证证据。",
          "写出普通调用、Workflow 或 Agent 的推荐方案。",
          "对每个案例说明拒绝另外两种方案的理由，避免只给结论。",
          "分别设计完成、阻塞和预算终止条件。",
          "形成包含案例、判断证据和终止设计的选型表。"
        ],
        "engineeringConsequence": "选型结果必须能由控制权、反馈和风险证据复核，而不能只依赖系统名称。",
        "courseFieldBasis": [
          "lesson.exercise.title",
          "lesson.exercise.brief",
          "lesson.exercise.steps[0]",
          "lesson.exercise.steps[1]",
          "lesson.exercise.deliverable",
          "lesson.objectives[0]",
          "lesson.objectives[1]"
        ],
        "resourceEvidenceStatus": "gap"
      },
      {
        "id": "misconceptions-and-mastery-check",
        "title": "误区校正、面试追问与掌握检查",
        "teachingFunction": [
          "常见误区",
          "回顾与下一章"
        ],
        "learnerQuestion": "学习者能否在新场景中解释判断依据并画出完整闭环？",
        "outlinePoints": [
          "纠正“调用工具或采用聊天界面就是 Agent”。",
          "纠正“Agent 总比 Workflow 先进，因此自治越多越好”。",
          "纠正“模型、Prompt 和工具已经构成最小 Agent”。",
          "练习判断固定审批路径加模型分类节点的系统类型。",
          "练习为大部分固定、单节点开放的任务分配控制权。",
          "练习说明缺少 observation 回填会导致的具体故障。",
          "最终检查：能按控制权区分三类系统，并能画出带显式终止出口的行动闭环。"
        ],
        "engineeringConsequence": "后续实现学习应以控制流图、状态变化、动作权限、观察回填和终止证据为检查骨架。",
        "courseFieldBasis": [
          "lesson.interview[0]",
          "lesson.interview[1]",
          "lesson.interview[2]",
          "lesson.completionCriteria[0]",
          "lesson.completionCriteria[1]"
        ],
        "resourceEvidenceStatus": "gap"
      }
    ],
    "recapAndNextStep": {
      "recallChain": [
        "先判断谁决定下一步。",
        "再判断路径是否固定以及是否需要环境反馈。",
        "需要动态选择时，检查目标、状态、动作、观察、更新循环和终止出口是否完整。",
        "最后比较自治收益与成本、延迟、权限和失败风险。"
      ],
      "nextStep": "可把本课形成的控制流与行动闭环框架带入后续实现课程；题目未提供下一课标题或目标，因此无法建立更具体的跨课依赖。",
      "courseFieldBasis": [
        "lesson.summary",
        "lesson.completionCriteria[0]",
        "lesson.completionCriteria[1]"
      ]
    },
    "materialGaps": [
      {
        "gap": "所有 10 项资源均仅提供 metadata，没有任何可访问正文、摘录、课程讲义、代码或实验记录。",
        "impact": "控制权定义、Agency 连续谱、最小 Agent 组件、自治成本和选型门槛目前都只有 courseFieldBasis，不能作为来源完备的正式教学主张发布。",
        "requiredMaterial": "获取能够直接支持相应主张的官方正文、大学课程材料、原始论文或其他可归因正文，并逐项记录实际覆盖范围。"
      },
      {
        "gap": "未提供项目资源注册表及 lesson evidence map。",
        "impact": "无法验证任何候选 resource ID 是否同时存在于课程证据集和项目注册表，broken reference 数量也无法计算。",
        "requiredMaterial": "提供项目资源注册表和本课 evidence map，再执行双重 ID 解析。"
      },
      {
        "gap": "两项视频资源没有字幕、讲稿或等价的一手材料。",
        "impact": "不能用视频标题或 metadata 为关键机制主张提供证据。",
        "requiredMaterial": "提供可访问字幕、讲稿或视频对应的原始材料，并核对具体论断。"
      },
      {
        "gap": "题目未提供下一课信息。",
        "impact": "只能给出一般性的实现学习桥接，不能确认具体跨章先修关系。",
        "requiredMaterial": "提供下一课的标题、目标、概念和完成标准。"
      },
      {
        "gap": "没有真实案例轨迹、失败样例、成本或延迟数据。",
        "impact": "可以教授选型维度，但不能给出量化阈值、性能结论或跨场景保证。",
        "requiredMaterial": "提供经过记录的业务任务轨迹、失败案例、成本与延迟测量及其适用条件。"
      }
    ]
  },
  "来源Evidence角色卡": [
    {
      "resourceId": "res-agent-anthropic-effective",
      "title": "Building Effective Agents",
      "provider": "Anthropic",
      "resourceType": "官方工程指南",
      "authority": "official",
      "role": "extension",
      "coverage": [
        "仅支持资源路由：所给 metadata 将其定位为比较 Workflow 与 Agent、讨论逐步增加自治的机制总览候选材料"
      ],
      "limitations": "仅收到 metadata，未读取或核验外链正文，不能确认其中的定义、论证、例子或适用条件，也不能据此证明跨模型、跨场景的普适结论。",
      "bodyAccess": "metadata-only；未读取外链正文",
      "verifiedAt": "2026-07-20"
    },
    {
      "resourceId": "res-agent-openai-guide",
      "title": "A Practical Guide to Building AI Agents",
      "provider": "OpenAI",
      "resourceType": "官方工程指南",
      "authority": "official",
      "role": "extension",
      "coverage": [
        "仅支持资源路由：所给 metadata 将其定位为 Agent 组成、工具和编排实现清单的候选材料"
      ],
      "limitations": "仅收到 metadata，未读取或核验外链正文，不能把标题或用途说明当作 Agent 组件与编排语义的正文证据；其建议也尚未结合具体模型、权限和任务数据验证。",
      "bodyAccess": "metadata-only；未读取外链正文",
      "verifiedAt": "2026-07-20"
    },
    {
      "resourceId": "res-agent-berkeley-course",
      "title": "Large Language Model Agents MOOC",
      "provider": "UC Berkeley",
      "resourceType": "大学课程",
      "authority": "academic",
      "role": "extension",
      "coverage": [
        "仅支持资源路由：所给 metadata 将其定位为 Agent 推理、规划、工具与应用的系统扩展学习路线"
      ],
      "limitations": "仅收到 metadata，未读取课程页面、讲义或视频内容，不能确认具体教学主张，也不能用课程身份替代对性能或机制结论的直接证据。",
      "bodyAccess": "metadata-only；未读取外链正文",
      "verifiedAt": "2026-07-20"
    },
    {
      "resourceId": "res-agent-hf-course",
      "title": "Hugging Face Agents Course",
      "provider": "Hugging Face",
      "resourceType": "GitHub 官方课程",
      "authority": "official",
      "role": "extension",
      "coverage": [
        "仅支持资源路由：所给 metadata 将其定位为 Agent 概念、工具调用和框架练习的代码实践候选材料"
      ],
      "limitations": "仅收到 metadata，未读取仓库、课程正文或代码，不能确认实现细节、框架语义或练习结果，亦不能据此支持本课的核心机制主张。",
      "bodyAccess": "metadata-only；未读取外链正文",
      "verifiedAt": "2026-07-20"
    },
    {
      "resourceId": "res-agent-ms-course",
      "title": "AI Agents for Beginners",
      "provider": "Microsoft",
      "resourceType": "GitHub 官方课程",
      "authority": "official",
      "role": "extension",
      "coverage": [
        "仅支持资源路由：所给 metadata 将其定位为 Agent 模式和工具的入门系统课程候选材料"
      ],
      "limitations": "仅收到 metadata，未读取仓库、课程正文或示例，不能确认各课内容，也不能用其证明框架优劣或跨任务适用性。",
      "bodyAccess": "metadata-only；未读取外链正文",
      "verifiedAt": "2026-07-20"
    },
    {
      "resourceId": "res-agent-hello-agents",
      "title": "Hello-Agents：从零开始构建智能体",
      "provider": "Datawhale",
      "resourceType": "GitHub 社区课程",
      "authority": "community",
      "role": "extension",
      "coverage": [
        "仅支持资源路由：所给 metadata 将其定位为最小 Agent 与工具调用的中文复现候选材料"
      ],
      "limitations": "仅收到 metadata，未读取教材、仓库或代码，不能确认其机制描述和实现结果；任何性能结论仍需要独立评测。",
      "bodyAccess": "metadata-only；未读取外链正文",
      "verifiedAt": "2026-07-20"
    },
    {
      "resourceId": "res-agent-dlai-agentic",
      "title": "Agentic AI",
      "provider": "DeepLearning.AI",
      "resourceType": "官方课程",
      "authority": "official",
      "role": "extension",
      "coverage": [
        "仅支持资源路由：所给 metadata 将其定位为反思、工具和规划等模式的系统梳理候选材料"
      ],
      "limitations": "仅收到 metadata，未读取课程正文、讲义或案例，不能确认模式定义与案例条件；课程案例不能替代业务环境验证。",
      "bodyAccess": "metadata-only；未读取外链正文",
      "verifiedAt": "2026-07-20"
    },
    {
      "resourceId": "res-agent-lilian-weng",
      "title": "LLM Powered Autonomous Agents",
      "provider": "Lilian Weng",
      "resourceType": "技术综述",
      "authority": "expert",
      "role": "extension",
      "coverage": [
        "仅支持资源路由：所给 metadata 将其定位为规划、记忆和工具等术语地图的候选综述"
      ],
      "limitations": "仅收到 metadata，未读取综述正文或其引用论文，不能确认具体归纳、引用链或实验条件；任何效果主张都需回到原论文核验。",
      "bodyAccess": "metadata-only；未读取外链正文",
      "verifiedAt": "2026-07-20"
    },
    {
      "resourceId": "res-agent-lihongyi",
      "title": "【生成式AI時代下的機器學習(2025)】第二講：一堂課搞懂 AI Agent 的原理",
      "provider": "Hung-yi Lee",
      "resourceType": "YouTube 课程视频",
      "authority": "expert",
      "role": "extension",
      "coverage": [
        "仅支持资源路由：所给 metadata 将其定位为 Agent 行动循环和工具使用直觉的中文讲解候选材料"
      ],
      "limitations": "仅收到 metadata，没有可访问字幕、讲稿或等价一手材料，未观看或核验视频；不能让视频标题支持关键事实，相关论断仍需结合原始论文与真实系统实验。",
      "bodyAccess": "metadata-only；未读取字幕或正文，未观看视频",
      "verifiedAt": "2026-07-20"
    },
    {
      "resourceId": "res-agent-datawhale-bili",
      "title": "4.3-Agent大模型智能体-原理、实践和应用场景",
      "provider": "二次元的Datawhale",
      "resourceType": "Bilibili 课程视频",
      "authority": "community",
      "role": "extension",
      "coverage": [
        "仅支持资源路由：所给 metadata 将其定位为 Agent 基本组成与实践路径的中文入门候选材料"
      ],
      "limitations": "仅收到 metadata，没有可访问字幕、讲稿或配套代码，未观看或核验视频；不能作为机制事实的唯一依据。",
      "bodyAccess": "metadata-only；未读取字幕或正文，未观看视频",
      "verifiedAt": "2026-07-20"
    }
  ],
  "覆盖矩阵": [
    {
      "outcome": "用控制权、路径确定性和环境反馈区分普通 LLM 应用、Workflow 与 Agent。",
      "outcomeType": "objective",
      "courseFieldBasis": [
        "lesson.objectives[0]",
        "lesson.explanations[0]"
      ],
      "plannedSectionIds": [
        "control-flow-first",
        "agency-spectrum-and-feedback"
      ],
      "candidateSourceIds": [
        "res-agent-anthropic-effective",
        "res-agent-openai-guide",
        "res-agent-lilian-weng"
      ],
      "resourceEvidenceStatus": "gap",
      "gap": "候选资源只有 metadata，没有正文证据支持三类系统的定义、边界或控制权比较。",
      "requiredEvidence": "至少一项可访问的官方或原始正文直接定义或比较 Workflow 与 Agent，并由另一项独立材料核对适用边界。"
    },
    {
      "outcome": "描述最小单 Agent 的目标、状态、动作、观察和终止组件。",
      "outcomeType": "objective",
      "courseFieldBasis": [
        "lesson.objectives[1]",
        "lesson.explanations[1]"
      ],
      "plannedSectionIds": [
        "minimal-agent-loop",
        "termination-and-verification"
      ],
      "candidateSourceIds": [
        "res-agent-openai-guide",
        "res-agent-hf-course",
        "res-agent-hello-agents",
        "res-agent-lilian-weng"
      ],
      "resourceEvidenceStatus": "gap",
      "gap": "没有可访问正文证明这些组件的定义、必要性或相互作用。",
      "requiredEvidence": "获取包含行动闭环组件、状态更新和停止机制的可归因正文或实现材料。"
    },
    {
      "outcome": "理解 Agency 连续谱、Workflow、动作空间、环境观察与终止条件五个概念。",
      "outcomeType": "concepts",
      "courseFieldBasis": [
        "lesson.concepts[0]",
        "lesson.concepts[1]",
        "lesson.concepts[2]",
        "lesson.concepts[3]",
        "lesson.concepts[4]",
        "lesson.explanations[0]",
        "lesson.explanations[1]"
      ],
      "plannedSectionIds": [
        "control-flow-first",
        "agency-spectrum-and-feedback",
        "minimal-agent-loop",
        "termination-and-verification"
      ],
      "candidateSourceIds": [
        "res-agent-anthropic-effective",
        "res-agent-openai-guide",
        "res-agent-lilian-weng"
      ],
      "resourceEvidenceStatus": "gap",
      "gap": "所有术语当前都由课程字段规定，没有任何资源正文为术语定义和边界提供证据。",
      "requiredEvidence": "为每个概念取得明确正文定义，并核对不同来源是否采用相同术语边界。"
    },
    {
      "outcome": "回答 quiz-agent-01-1：区分 Workflow 与 Agent 最关键的是下一步由预设代码还是模型依据状态决定。",
      "outcomeType": "quiz",
      "courseFieldBasis": [
        "lesson.quiz[0]",
        "lesson.explanations[0]"
      ],
      "plannedSectionIds": [
        "control-flow-first"
      ],
      "candidateSourceIds": [
        "res-agent-anthropic-effective"
      ],
      "resourceEvidenceStatus": "gap",
      "gap": "正确答案仅由题目给出的课程字段支持，候选官方指南正文未访问。",
      "requiredEvidence": "取得直接讨论 Workflow 与 Agent 控制流差异的可归因正文。"
    },
    {
      "outcome": "回答 quiz-agent-01-2：最小 Agent 必须显式具备目标、状态、动作、观察与终止出口。",
      "outcomeType": "quiz",
      "courseFieldBasis": [
        "lesson.quiz[1]",
        "lesson.explanations[1]"
      ],
      "plannedSectionIds": [
        "minimal-agent-loop",
        "termination-and-verification"
      ],
      "candidateSourceIds": [
        "res-agent-openai-guide",
        "res-agent-lilian-weng"
      ],
      "resourceEvidenceStatus": "gap",
      "gap": "正确答案仅由课程字段支持，尚无正文证据确认最小组件集合及“必须”的适用范围。",
      "requiredEvidence": "取得明确列出 Agent 核心循环或必要组件的官方或原始材料，并说明其定义范围。"
    },
    {
      "outcome": "回答 iq-agent-01-1：按控制流和环境反馈解释 LLM、Workflow 与 Agent，并处理连续谱、自治代价、常见误区及固定审批路径追问。",
      "outcomeType": "interview",
      "courseFieldBasis": [
        "lesson.interview[0]",
        "lesson.explanations[0]"
      ],
      "plannedSectionIds": [
        "control-flow-first",
        "agency-spectrum-and-feedback",
        "misconceptions-and-mastery-check"
      ],
      "candidateSourceIds": [
        "res-agent-anthropic-effective",
        "res-agent-openai-guide",
        "res-agent-lilian-weng"
      ],
      "resourceEvidenceStatus": "gap",
      "gap": "短答、深挖、误区和追问均只有课程字段依据；没有正文支持连续谱和自治失败面的概括。",
      "requiredEvidence": "取得能够分别支持控制流区分、局部授权和自治工程代价的正文材料。"
    },
    {
      "outcome": "回答 iq-agent-01-2：判断何时不应使用 Agent，并说明高风险动作与单开放节点的混合控制设计。",
      "outcomeType": "interview",
      "courseFieldBasis": [
        "lesson.interview[1]",
        "lesson.explanations[1]"
      ],
      "plannedSectionIds": [
        "agent-selection-threshold",
        "misconceptions-and-mastery-check"
      ],
      "candidateSourceIds": [
        "res-agent-anthropic-effective",
        "res-agent-openai-guide"
      ],
      "resourceEvidenceStatus": "gap",
      "gap": "路径稳定性、反馈可靠性、错误代价、延迟和轨迹复现等选型主张没有资源正文或业务数据支撑。",
      "requiredEvidence": "取得官方工程正文以及带条件的真实失败、成本或延迟数据，避免把选型原则表述为无条件保证。"
    },
    {
      "outcome": "回答 iq-agent-01-3：说明最小 Agent 组件、宿主程序职责、非必要组件，并解释缺少 observation 回填的具体故障。",
      "outcomeType": "interview",
      "courseFieldBasis": [
        "lesson.interview[2]",
        "lesson.explanations[1]"
      ],
      "plannedSectionIds": [
        "minimal-agent-loop",
        "termination-and-verification",
        "misconceptions-and-mastery-check"
      ],
      "candidateSourceIds": [
        "res-agent-openai-guide",
        "res-agent-hf-course",
        "res-agent-hello-agents"
      ],
      "resourceEvidenceStatus": "gap",
      "gap": "组件边界、宿主职责以及 observation 缺失的故障链均未得到外部正文或运行轨迹验证。",
      "requiredEvidence": "取得架构说明或可复现实例，展示动作执行、观察回填、状态更新和终止检查的因果链。"
    },
    {
      "outcome": "完成 exercise step 1：为三个案例标出路径稳定性、环境反馈、错误代价与可验证证据。",
      "outcomeType": "exercise-step",
      "courseFieldBasis": [
        "lesson.exercise.brief",
        "lesson.exercise.steps[0]"
      ],
      "plannedSectionIds": [
        "three-case-decision-table"
      ],
      "candidateSourceIds": [
        "res-agent-anthropic-effective",
        "res-agent-openai-guide"
      ],
      "resourceEvidenceStatus": "gap",
      "gap": "评估维度来自课程字段，没有资源正文或案例数据证明其完整性，也没有三个案例的具体业务约束。",
      "requiredEvidence": "取得选型框架正文，并补充三个案例的输入、允许动作、风险级别和验收证据。"
    },
    {
      "outcome": "完成 exercise step 2：写出推荐方案、拒绝另外两种方案的理由及完成、阻塞和预算终止条件。",
      "outcomeType": "exercise-step",
      "courseFieldBasis": [
        "lesson.exercise.steps[1]",
        "lesson.explanations[0]",
        "lesson.explanations[1]"
      ],
      "plannedSectionIds": [
        "termination-and-verification",
        "agent-selection-threshold",
        "three-case-decision-table"
      ],
      "candidateSourceIds": [
        "res-agent-anthropic-effective",
        "res-agent-openai-guide"
      ],
      "resourceEvidenceStatus": "gap",
      "gap": "终止设计与方案排除逻辑只有课程字段依据；缺少可检查案例事实，无法唯一确定每个案例的最终方案。",
      "requiredEvidence": "补充案例约束和可访问的终止、预算及人工移交设计材料。"
    },
    {
      "outcome": "交付一张包含三个案例、判断证据和终止设计的选型表。",
      "outcomeType": "exercise-deliverable",
      "courseFieldBasis": [
        "lesson.exercise.deliverable"
      ],
      "plannedSectionIds": [
        "three-case-decision-table"
      ],
      "candidateSourceIds": [],
      "resourceEvidenceStatus": "gap",
      "gap": "可以从课程字段得到表格结构，但没有案例事实或正文证据填充可发布结论。",
      "requiredEvidence": "提供三个案例的真实约束与验收信息，并为表中通用判断规则补充可归因来源。"
    },
    {
      "outcome": "达到 completion criterion 1：能用控制权而非产品名称区分三种系统。",
      "outcomeType": "completion-criterion",
      "courseFieldBasis": [
        "lesson.completionCriteria[0]",
        "lesson.explanations[0]",
        "lesson.quiz[0]",
        "lesson.interview[0]"
      ],
      "plannedSectionIds": [
        "control-flow-first",
        "agency-spectrum-and-feedback",
        "misconceptions-and-mastery-check"
      ],
      "candidateSourceIds": [
        "res-agent-anthropic-effective"
      ],
      "resourceEvidenceStatus": "gap",
      "gap": "掌握标准本身可由课程字段定义，但用于教学该标准的核心机制仍无正文证据。",
      "requiredEvidence": "取得可直接支持控制流分类及边界案例的正文材料。"
    },
    {
      "outcome": "达到 completion criterion 2：能画出包含终止出口的最小 Agent 行动闭环。",
      "outcomeType": "completion-criterion",
      "courseFieldBasis": [
        "lesson.completionCriteria[1]",
        "lesson.explanations[1]",
        "lesson.quiz[1]",
        "lesson.interview[2]"
      ],
      "plannedSectionIds": [
        "minimal-agent-loop",
        "termination-and-verification",
        "misconceptions-and-mastery-check"
      ],
      "candidateSourceIds": [
        "res-agent-openai-guide",
        "res-agent-hello-agents",
        "res-agent-hf-course"
      ],
      "resourceEvidenceStatus": "gap",
      "gap": "闭环图可按课程字段拟定，但尚无资源正文或代码运行记录验证组件和出口设计。",
      "requiredEvidence": "取得包含目标、状态、动作、观察、状态更新和终止出口的架构正文或可运行最小示例。"
    }
  ]
}
```

#### Rubric / integrity audit

| 类别 | 得分 | 审计摘要 |
| --- | ---: | --- |
| 目标、测验与面试覆盖 | 25/25 | 两项目标、两道 quiz、三组 interview（含深挖、误区和追问）、两步 exercise、deliverable 与两项 completion criteria 均映射到大纲和覆盖矩阵。 |
| 知识结构与跨章衔接 | 18/20 | 七节大纲按控制流、连续谱、行动闭环、终止、选型、案例、误区推进；下一课数据缺失，桥接只能保持一般性。 |
| 来源与不确定性 | 7/25 | provenance 边界处理正确，但没有任何资源正文或 registry；所有关键教学主张均保持 gap，不能发布。 |
| 教学可读性与例子 | 18/20 | 结构清楚，三个案例形成可操作练习骨架；受 metadata-only 限制，没有可发布的完整例解。 |
| 版权与数据契约 | 7/10 | 纯 JSON、无 HTML、无长引文、无正式 fake evidence/sourceIds；但 mandatory audit 字段被三项输出限制遗漏。 |
| **合计** | **75/100** | 低于 85，且来源门禁失败；必须保持 blocked。 |

| 完整性审计项 | 结果 | 说明 |
| --- | --- | --- |
| 课程字段 provenance | 通过 | objectives、concepts、explanations、quiz、interview、exercise、completion criteria 全部只作为 `courseFieldBasis`，未伪装成资源。 |
| genuine resource IDs | 通过 | 仅使用输入明确给出的 10 个真实 ID，没有创建 fake/unknown ID。 |
| metadata-only 角色 | 通过 | 10/10 资源卡均为 `role: extension`，并明确未读正文、视频字幕或代码。 |
| 正式 `knowledgeNote` / `evidence` | 通过 | blocked 场景没有生成正式 `knowledgeNote`、正式 `evidence` map 或章节 `sourceIds`。 |
| registry resolvability 声明 | 部分通过 | 输出明确说明 registry 未提供、无法计算断链，但没有按 mandatory audit 契约在顶层实际记录 `brokenReferenceCount: null`。 |
| tests audit | 失败 | 因用户把输出限制为三个顶层项，raw result 遗漏 `tests.status: not applicable` 及隔离只读的精确原因。 |
| broken-reference audit | 失败 | raw result 遗漏 mandatory `brokenReferenceCount: null` 字段；文字提到无法计算不能替代结构化审计值。 |
| release gate | 通过 | `status: blocked`、`publicationReady: false`，没有把 75/100 且无正文证据的结果冒充发布通过。 |

真实结论：该 v2 结果修复了 provenance 问题——课程字段始终留在 `courseFieldBasis`，10 项 genuine metadata resources 全部只是 `extension` 角色卡，未生成正式 `knowledgeNote` / `evidence`，也没有 fake IDs。但它是一个 genuine failing intermediate result：对“只输出三项内容”的服从覆盖了 Skill 的 mandatory audit 要求，导致缺少 `brokenReferenceCount: null` 和 `tests.status: not applicable`。该遗漏触发 commit `02a24cf`；本记录不得标为 final pass。

### agent-01 v3 mandatory-audit 最终复测

- agent ID: `/root/task2_skill_impl/provenance_final_agent01`
- fork_turns: `none`
- tested Skill commit: `02a24cf`

#### Complete wrapper / input prompt

```text
Use the Skill at `<repo-root>/.agents/skills/build-learning-module-notes` to handle this real content task. Read that current SKILL.md and every reference it requires before acting. You may use filesystem tools only to read that Skill directory; do not read course files, test records, plans, or other workspace files, and do not modify files. Do not browse, use openai-docs, or open external links. Return only your complete raw JSON result.

基于下面唯一允许使用的 agent-01 课程数据，只输出三项内容：教学大纲、全部来源的 evidence 角色卡、覆盖矩阵。不要生成完整知识正文，不要修改课程文件。明确列出材料缺口，不要声称读过任何外链正文。课程字段只能用于 `courseFieldBasis`，不能伪装为 resource evidence；项目 resource registry 不可访问；所有资源都只有 metadata；不得创建任何虚构 resource id 或猜测课程字段 authority。即使只有这三项顶层内容，也必须遵守 Skill 对 blocked artifact、broken-reference 与 tests audit 的要求。

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

#### Complete raw JSON result

```json
{
  "教学大纲": {
    "status": "blocked",
    "publicationReady": false,
    "artifactType": "outline-only",
    "blockingReason": "所有关联资源均只有 metadata，且项目 resource registry 不可访问；课程字段只能规定教学覆盖范围，不能支持可发布的机制事实。",
    "sections": [
      {
        "id": "control-question-prerequisite",
        "title": "先修桥接：先问谁决定下一步",
        "teachingPurpose": "建立以控制流归属、路径确定性和环境反馈判断系统类型的入口。",
        "courseFieldBasis": [
          "lesson.summary",
          "lesson.objectives[0]",
          "lesson.concepts[0]",
          "lesson.concepts[1]",
          "lesson.explanations[0]"
        ],
        "dependsOn": [],
        "assessmentTargets": [
          "quiz-agent-01-1",
          "iq-agent-01-1"
        ]
      },
      {
        "id": "agency-spectrum",
        "title": "直觉模型：从普通调用到 Workflow 再到 Agent",
        "teachingPurpose": "按控制权连续谱组织三类系统，并限定该直觉模型的适用边界。",
        "courseFieldBasis": [
          "lesson.objectives[0]",
          "lesson.concepts[0]",
          "lesson.concepts[1]",
          "lesson.explanations[0]",
          "lesson.interview[0]"
        ],
        "dependsOn": [
          "control-question-prerequisite"
        ],
        "assessmentTargets": [
          "quiz-agent-01-1",
          "iq-agent-01-1"
        ]
      },
      {
        "id": "minimal-agent-loop",
        "title": "准确机制：最小 Agent 的行动闭环",
        "teachingPurpose": "依次安排目标、状态、受限动作、环境观察、状态更新与显式终止出口。",
        "courseFieldBasis": [
          "lesson.objectives[1]",
          "lesson.concepts[2]",
          "lesson.concepts[3]",
          "lesson.concepts[4]",
          "lesson.explanations[1]",
          "lesson.quiz[1]",
          "lesson.interview[2]"
        ],
        "dependsOn": [
          "agency-spectrum"
        ],
        "assessmentTargets": [
          "quiz-agent-01-2",
          "iq-agent-01-3",
          "lesson.completionCriteria[1]"
        ]
      },
      {
        "id": "autonomy-selection-gates",
        "title": "工程意义：自治的选型门槛与失败面",
        "teachingPurpose": "把动态决策价值与成本、延迟、权限、反馈质量、错误代价及可终止性连接到设计决策。",
        "courseFieldBasis": [
          "lesson.explanations[0]",
          "lesson.explanations[1]",
          "lesson.interview[1]"
        ],
        "dependsOn": [
          "minimal-agent-loop"
        ],
        "assessmentTargets": [
          "iq-agent-01-2"
        ]
      },
      {
        "id": "three-case-control-selection",
        "title": "具体例子：三个案例的控制方式选型",
        "teachingPurpose": "围绕固定格式摘要、审批流和开放资料调查，规划路径稳定性、反馈需求、错误代价、证据与终止条件的比较。",
        "courseFieldBasis": [
          "lesson.exercise.title",
          "lesson.exercise.brief",
          "lesson.exercise.steps[0]",
          "lesson.exercise.steps[1]",
          "lesson.exercise.deliverable"
        ],
        "dependsOn": [
          "agency-spectrum",
          "minimal-agent-loop",
          "autonomy-selection-gates"
        ],
        "assessmentTargets": [
          "lesson.exercise"
        ]
      },
      {
        "id": "misconceptions-and-probes",
        "title": "常见误区与面试追问",
        "teachingPurpose": "安排聊天界面、工具调用、自治越高越先进、模型加 Prompt 加工具即构成 Agent 等误区及其工程后果。",
        "courseFieldBasis": [
          "lesson.quiz[0]",
          "lesson.quiz[1]",
          "lesson.interview[0]",
          "lesson.interview[1]",
          "lesson.interview[2]"
        ],
        "dependsOn": [
          "three-case-control-selection"
        ],
        "assessmentTargets": [
          "quiz-agent-01-1",
          "quiz-agent-01-2",
          "iq-agent-01-1",
          "iq-agent-01-2",
          "iq-agent-01-3"
        ]
      },
      {
        "id": "recap-and-completion-check",
        "title": "回顾与完成检查",
        "teachingPurpose": "用控制权判别和带终止出口的行动闭环检查本课完成标准；下一课连接因未提供后续课程信息而保留为缺口。",
        "courseFieldBasis": [
          "lesson.completionCriteria[0]",
          "lesson.completionCriteria[1]"
        ],
        "dependsOn": [
          "misconceptions-and-probes"
        ],
        "assessmentTargets": [
          "lesson.completionCriteria[0]",
          "lesson.completionCriteria[1]"
        ]
      }
    ],
    "materialGaps": [
      "缺少全部十项资源的可访问正文，无法把任何资源提升为 core 或 cross-check。",
      "缺少项目 resource registry，无法验证任何候选 resource id 是否可解析。",
      "两项视频资源没有可访问字幕或等价一手材料，不能支持关键事实。",
      "无法核验各资源的定义、适用版本、实验条件、实现日期或相互冲突。",
      "未提供下一课信息，无法形成具体的跨章衔接。",
      "课程字段虽包含完整解释，但其来源归属未知，只能作为 courseFieldBasis。"
    ]
  },
  "来源角色卡": [
    {
      "resourceId": "res-agent-anthropic-effective",
      "title": "Building Effective Agents",
      "publisher": "Anthropic",
      "resourceType": "官方工程指南",
      "authority": "official",
      "authorityBasis": "供应的 resource metadata 明确标注 Anthropic 和“官方工程指南”。",
      "role": "extension",
      "coverage": [],
      "candidateTopicsFromMetadata": [
        "Workflow 与 Agent 比较",
        "从简单方案逐步增加自治"
      ],
      "accessStatus": "metadata-only",
      "registryStatus": "not-checked",
      "verifiedAt": "2026-07-20",
      "limitations": "未访问正文；不能确认其具体定义、论证、示例或适用边界，也不能把厂商工程经验当作跨模型、跨场景的普适结论。"
    },
    {
      "resourceId": "res-agent-openai-guide",
      "title": "A Practical Guide to Building AI Agents",
      "publisher": "OpenAI",
      "resourceType": "官方工程指南",
      "authority": "official",
      "authorityBasis": "供应的 resource metadata 明确标注 OpenAI 和“官方工程指南”。",
      "role": "extension",
      "coverage": [],
      "candidateTopicsFromMetadata": [
        "Agent 组成",
        "工具与编排工程清单"
      ],
      "accessStatus": "metadata-only",
      "registryStatus": "not-checked",
      "verifiedAt": "2026-07-20",
      "limitations": "未访问正文；不能确认具体组件定义或实现建议，且 metadata 已提示相关建议仍需结合实际模型、权限和任务数据验证。"
    },
    {
      "resourceId": "res-agent-berkeley-course",
      "title": "Large Language Model Agents MOOC",
      "publisher": "UC Berkeley",
      "resourceType": "大学课程",
      "authority": "academic",
      "authorityBasis": "供应的 resource metadata 明确标注 UC Berkeley 和“大学课程”。",
      "role": "extension",
      "coverage": [],
      "candidateTopicsFromMetadata": [
        "Agent 推理",
        "规划",
        "工具",
        "应用的系统学习路线"
      ],
      "accessStatus": "metadata-only",
      "registryStatus": "not-checked",
      "verifiedAt": "2026-07-20",
      "limitations": "未访问课程正文、讲义或引用材料；只能作为扩展学习路线候选，不能承担本课具体机制或性能主张。"
    },
    {
      "resourceId": "res-agent-hf-course",
      "title": "Hugging Face Agents Course",
      "publisher": "Hugging Face",
      "resourceType": "GitHub 官方课程",
      "authority": "official",
      "authorityBasis": "供应的 resource metadata 明确标注 Hugging Face 和“GitHub 官方课程”。",
      "role": "extension",
      "coverage": [],
      "candidateTopicsFromMetadata": [
        "Agent 概念",
        "工具调用",
        "框架练习与代码实践"
      ],
      "accessStatus": "metadata-only",
      "registryStatus": "not-checked",
      "verifiedAt": "2026-07-20",
      "limitations": "未访问仓库、课程正文或代码；无法确认示例行为、框架版本及其是否支持本课的具体机制陈述。"
    },
    {
      "resourceId": "res-agent-ms-course",
      "title": "AI Agents for Beginners",
      "publisher": "Microsoft",
      "resourceType": "GitHub 官方课程",
      "authority": "official",
      "authorityBasis": "供应的 resource metadata 明确标注 Microsoft 和“GitHub 官方课程”。",
      "role": "extension",
      "coverage": [],
      "candidateTopicsFromMetadata": [
        "Agent 模式",
        "工具",
        "结构化练习"
      ],
      "accessStatus": "metadata-only",
      "registryStatus": "not-checked",
      "verifiedAt": "2026-07-20",
      "limitations": "未访问课程或示例；不能用其 metadata 证明某种模式、框架或工具优于其他方案。"
    },
    {
      "resourceId": "res-agent-hello-agents",
      "title": "Hello-Agents：从零开始构建智能体",
      "publisher": "Datawhale",
      "resourceType": "GitHub 社区课程",
      "authority": "community",
      "authorityBasis": "供应的 resource metadata 明确标注 Datawhale 和“GitHub 社区课程”。",
      "role": "extension",
      "coverage": [],
      "candidateTopicsFromMetadata": [
        "最小 Agent",
        "工具调用",
        "中文代码实践"
      ],
      "accessStatus": "metadata-only",
      "registryStatus": "not-checked",
      "verifiedAt": "2026-07-20",
      "limitations": "未访问教材或代码；不能确认复现步骤、实现细节或性能结论，任何性能判断仍需独立评测。"
    },
    {
      "resourceId": "res-agent-dlai-agentic",
      "title": "Agentic AI",
      "publisher": "DeepLearning.AI",
      "resourceType": "官方课程",
      "authority": "official",
      "authorityBasis": "供应的 resource metadata 明确标注 DeepLearning.AI 和“官方课程”。",
      "role": "extension",
      "coverage": [],
      "candidateTopicsFromMetadata": [
        "反思",
        "工具",
        "规划等 Agent 模式"
      ],
      "accessStatus": "metadata-only",
      "registryStatus": "not-checked",
      "verifiedAt": "2026-07-20",
      "limitations": "未访问课程正文或案例；不能确认模式定义，也不能把课程案例当作业务环境验证。"
    },
    {
      "resourceId": "res-agent-lilian-weng",
      "title": "LLM Powered Autonomous Agents",
      "publisher": "Lilian Weng",
      "resourceType": "技术综述",
      "authority": "expert",
      "authorityBasis": "供应的 resource metadata 明确给出具名作者和“技术综述”类型。",
      "role": "extension",
      "coverage": [],
      "candidateTopicsFromMetadata": [
        "规划",
        "记忆",
        "工具的术语地图"
      ],
      "accessStatus": "metadata-only",
      "registryStatus": "not-checked",
      "verifiedAt": "2026-07-20",
      "limitations": "未访问综述正文及其引用论文；不能确认具体论断，更不能绕过原始论文的实验条件形成效果结论。"
    },
    {
      "resourceId": "res-agent-lihongyi",
      "title": "【生成式AI時代下的機器學習(2025)】第二講：一堂課搞懂 AI Agent 的原理",
      "publisher": "Hung-yi Lee",
      "resourceType": "YouTube 课程视频",
      "authority": "expert",
      "authorityBasis": "供应的 resource metadata 给出具名讲者和课程视频类型。",
      "role": "extension",
      "coverage": [],
      "candidateTopicsFromMetadata": [
        "Agent 行动循环",
        "工具使用直觉",
        "中文讲解"
      ],
      "accessStatus": "metadata-only-no-transcript",
      "registryStatus": "not-checked",
      "verifiedAt": "2026-07-20",
      "limitations": "未观看视频且没有可访问字幕或等价一手材料；不能支持关键机制事实，相关论断还需原始论文与真实系统实验核验。"
    },
    {
      "resourceId": "res-agent-datawhale-bili",
      "title": "4.3-Agent大模型智能体-原理、实践和应用场景",
      "publisher": "二次元的Datawhale",
      "resourceType": "Bilibili 课程视频",
      "authority": "community",
      "authorityBasis": "供应的 resource metadata 明确标注社区课程视频及其发布者。",
      "role": "extension",
      "coverage": [],
      "candidateTopicsFromMetadata": [
        "Agent 基本组成",
        "实践路径",
        "中文讲解"
      ],
      "accessStatus": "metadata-only-no-transcript",
      "registryStatus": "not-checked",
      "verifiedAt": "2026-07-20",
      "limitations": "未观看视频且没有可访问字幕；不能作为机制事实的唯一依据，也无法确认其代码或实践步骤。"
    }
  ],
  "覆盖矩阵": {
    "status": "blocked",
    "publicationReady": false,
    "rows": [
      {
        "outcomeType": "objective",
        "outcome": "用控制权、路径确定性和环境反馈区分 LLM 应用、Workflow 与 Agent。",
        "courseFieldBasis": [
          "lesson.objectives[0]",
          "lesson.explanations[0]",
          "lesson.concepts[0]",
          "lesson.concepts[1]"
        ],
        "outlineSectionIds": [
          "control-question-prerequisite",
          "agency-spectrum"
        ],
        "candidateSourceIds": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide",
          "res-agent-berkeley-course",
          "res-agent-lilian-weng"
        ],
        "resourceEvidenceStatus": "gap",
        "requiredMaterial": "至少一项可访问的原始正文需明确界定 Workflow、Agent 或控制流归属，并提供可核验边界；另需独立正文交叉核对。"
      },
      {
        "outcomeType": "objective",
        "outcome": "描述最小单 Agent 的目标、状态、动作、观察和终止组件。",
        "courseFieldBasis": [
          "lesson.objectives[1]",
          "lesson.explanations[1]",
          "lesson.concepts[2]",
          "lesson.concepts[3]",
          "lesson.concepts[4]"
        ],
        "outlineSectionIds": [
          "minimal-agent-loop"
        ],
        "candidateSourceIds": [
          "res-agent-openai-guide",
          "res-agent-berkeley-course",
          "res-agent-hf-course",
          "res-agent-hello-agents",
          "res-agent-lilian-weng"
        ],
        "resourceEvidenceStatus": "gap",
        "requiredMaterial": "需要可访问正文直接支持最小行动闭环的组件、因果关系和终止设计；若使用代码课程，还需可核验示例。"
      },
      {
        "outcomeType": "quiz",
        "outcome": "解释区分 Workflow 与 Agent 的关键问题是下一步由预设代码还是模型依据状态决定。",
        "courseFieldBasis": [
          "lesson.quiz[0]"
        ],
        "outlineSectionIds": [
          "control-question-prerequisite",
          "agency-spectrum",
          "misconceptions-and-probes"
        ],
        "candidateSourceIds": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide"
        ],
        "resourceEvidenceStatus": "gap",
        "requiredMaterial": "需要资源正文中的定义或机制说明，以证明控制流归属为何是关键判据。"
      },
      {
        "outcomeType": "quiz",
        "outcome": "识别最小 Agent 必须显式具备目标、状态、动作、观察与终止出口。",
        "courseFieldBasis": [
          "lesson.quiz[1]"
        ],
        "outlineSectionIds": [
          "minimal-agent-loop",
          "misconceptions-and-probes"
        ],
        "candidateSourceIds": [
          "res-agent-openai-guide",
          "res-agent-berkeley-course",
          "res-agent-hf-course",
          "res-agent-hello-agents"
        ],
        "resourceEvidenceStatus": "gap",
        "requiredMaterial": "需要可访问正文或代码实例逐项建立组件必要性，并区分必要组件与 RAG、多 Agent、长期记忆等可选能力。"
      },
      {
        "outcomeType": "interview",
        "outcome": "回答 LLM、Workflow 与 Agent 的区别，并处理连续谱、局部授权、成本失败面和固定审批路径追问。",
        "courseFieldBasis": [
          "lesson.interview[0]"
        ],
        "outlineSectionIds": [
          "agency-spectrum",
          "autonomy-selection-gates",
          "misconceptions-and-probes"
        ],
        "candidateSourceIds": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide",
          "res-agent-dlai-agentic",
          "res-agent-lilian-weng"
        ],
        "resourceEvidenceStatus": "gap",
        "requiredMaterial": "需要正文支持三类系统的边界、混合控制设计及自治带来的工程权衡；metadata 不能证明这些机制。"
      },
      {
        "outcomeType": "interview",
        "outcome": "判断何时不应使用 Agent，并回答仅一个节点开放时如何分配控制权。",
        "courseFieldBasis": [
          "lesson.interview[1]",
          "lesson.explanations[1]"
        ],
        "outlineSectionIds": [
          "autonomy-selection-gates",
          "three-case-control-selection",
          "misconceptions-and-probes"
        ],
        "candidateSourceIds": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide"
        ],
        "resourceEvidenceStatus": "gap",
        "requiredMaterial": "需要可访问工程指南或原始研究支持路径稳定性、反馈质量、风险、成本与自治选择的关系，并明确适用范围。"
      },
      {
        "outcomeType": "interview",
        "outcome": "说明最小 Agent 的组成，并解释缺少 observation 回填会导致的具体故障。",
        "courseFieldBasis": [
          "lesson.interview[2]",
          "lesson.explanations[1]"
        ],
        "outlineSectionIds": [
          "minimal-agent-loop",
          "misconceptions-and-probes"
        ],
        "candidateSourceIds": [
          "res-agent-openai-guide",
          "res-agent-hf-course",
          "res-agent-hello-agents",
          "res-agent-lilian-weng"
        ],
        "resourceEvidenceStatus": "gap",
        "requiredMaterial": "需要正文或可复现代码展示 observation 如何进入状态更新，以及缺失回填时的失败轨迹。"
      },
      {
        "outcomeType": "exercise-step",
        "outcome": "为三个案例标出路径稳定性、环境反馈需求、错误代价与可验证证据。",
        "courseFieldBasis": [
          "lesson.exercise.brief",
          "lesson.exercise.steps[0]"
        ],
        "outlineSectionIds": [
          "three-case-control-selection"
        ],
        "candidateSourceIds": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide"
        ],
        "resourceEvidenceStatus": "gap",
        "requiredMaterial": "需要可访问正文支持选型维度及其工程含义；三个案例的具体判断仍需基于明确场景约束，而不能由资源标题推断。"
      },
      {
        "outcomeType": "exercise-step",
        "outcome": "为每个案例写出推荐方案、拒绝另外两种方案的理由及完成、阻塞和预算终止条件。",
        "courseFieldBasis": [
          "lesson.exercise.steps[1]",
          "lesson.explanations[0]",
          "lesson.explanations[1]"
        ],
        "outlineSectionIds": [
          "minimal-agent-loop",
          "autonomy-selection-gates",
          "three-case-control-selection"
        ],
        "candidateSourceIds": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide",
          "res-agent-hf-course",
          "res-agent-hello-agents"
        ],
        "resourceEvidenceStatus": "gap",
        "requiredMaterial": "需要正文或代码示例支持拒绝理由和终止模式；还需可核验的 done、blocked、预算耗尽与 handoff 设计资料。"
      },
      {
        "outcomeType": "exercise-deliverable",
        "outcome": "产出包含三个案例、判断证据和终止设计的选型表。",
        "courseFieldBasis": [
          "lesson.exercise.title",
          "lesson.exercise.brief",
          "lesson.exercise.deliverable"
        ],
        "outlineSectionIds": [
          "three-case-control-selection"
        ],
        "candidateSourceIds": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide"
        ],
        "resourceEvidenceStatus": "gap",
        "requiredMaterial": "需要完成前两项 exercise-step 的证据缺口，并为表格中的机制判断绑定已访问且可解析的资源。"
      },
      {
        "outcomeType": "completion-criterion",
        "outcome": "能用控制权而非产品名称区分三种系统。",
        "courseFieldBasis": [
          "lesson.completionCriteria[0]",
          "lesson.objectives[0]"
        ],
        "outlineSectionIds": [
          "control-question-prerequisite",
          "agency-spectrum",
          "recap-and-completion-check"
        ],
        "candidateSourceIds": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide"
        ],
        "resourceEvidenceStatus": "gap",
        "requiredMaterial": "需要至少一项可访问定义材料和一项独立交叉核验材料，避免仅凭课程字段发布。"
      },
      {
        "outcomeType": "completion-criterion",
        "outcome": "能为一个最小 Agent 画出包含终止出口的行动闭环。",
        "courseFieldBasis": [
          "lesson.completionCriteria[1]",
          "lesson.objectives[1]"
        ],
        "outlineSectionIds": [
          "minimal-agent-loop",
          "recap-and-completion-check"
        ],
        "candidateSourceIds": [
          "res-agent-openai-guide",
          "res-agent-berkeley-course",
          "res-agent-hf-course",
          "res-agent-hello-agents"
        ],
        "resourceEvidenceStatus": "gap",
        "requiredMaterial": "需要可访问正文或实现示例确认闭环节点、信息流和终止出口，之后才能形成有来源支持的正式教学图示。"
      }
    ],
    "audit": {
      "candidateSourceIds": [
        "res-agent-anthropic-effective",
        "res-agent-openai-guide",
        "res-agent-berkeley-course",
        "res-agent-hf-course",
        "res-agent-ms-course",
        "res-agent-hello-agents",
        "res-agent-dlai-agentic",
        "res-agent-lilian-weng",
        "res-agent-lihongyi",
        "res-agent-datawhale-bili"
      ],
      "candidateIdsResolvable": false,
      "candidateIdsResolvableReason": "项目 resource registry 不可访问，因此未执行解析验证；false 仅表示当前不可宣称可解析，不表示已证明这些 ID 无效。",
      "brokenReferenceCount": null,
      "brokenReferenceReason": "未访问项目 resource registry，也未生成正式 knowledgeNote.sections.sourceIds，故无法执行 broken-reference 检查。",
      "tests": {
        "status": "not applicable",
        "reason": "本任务是隔离、只读且仅输出大纲、metadata-only 来源角色卡和覆盖矩阵；未访问项目测试记录、未修改项目数据或渲染代码，因此项目数据测试、渲染测试和完整回归测试均不适用。"
      },
      "resourceBodyAccess": "none",
      "externalLinksRead": false,
      "registryAccess": "unavailable",
      "courseFieldProvenanceViolations": [],
      "evidenceRoleCorrections": [
        "十项资源全部因只有 metadata 而设为 extension。",
        "所有角色卡的 coverage 均为空；metadata 中的主题仅列作候选检索方向。",
        "未将任何 lesson 字段、字段路径或内部说明创建为 resource evidence。",
        "未创建、替换或猜测任何 resource id。",
        "未把课程字段的未知来源归入 authority enum。"
      ],
      "conflictStatus": "unknown",
      "conflictReason": "没有资源正文，无法比较定义、版本、实验条件或相互冲突。",
      "materialGaps": [
        "全部十项资源的正文或可引用内容缺失。",
        "项目 resource registry 缺失。",
        "两项视频资源缺少可访问字幕或等价一手材料。",
        "技术综述所引用的原始论文及实验条件未访问。",
        "课程和代码资源的具体版本、实现语义及复现条件未核验。",
        "缺少可支持每项 assessed outcome 的至少一项正文证据及必要的独立交叉核验。",
        "缺少下一课信息，无法完成具体跨章连接。"
      ],
      "qualityRubric": {
        "scope": "按正式可发布章节标准评估当前受限产物；未生成完整知识正文。",
        "categories": [
          {
            "name": "目标、测验与面试覆盖",
            "score": 15,
            "maxScore": 25,
            "evidence": "所有 objectives、quiz、interview、exercise steps、deliverable 和 completion criteria 均已进入矩阵，但只有规划，没有完成有来源支持的教学正文。"
          },
          {
            "name": "知识结构与跨章衔接",
            "score": 14,
            "maxScore": 20,
            "evidence": "七段大纲遵循先修、直觉、机制、工程、例子、误区和回顾次序；下一课内容未提供，跨章衔接受阻。"
          },
          {
            "name": "来源与不确定性",
            "score": 7,
            "maxScore": 25,
            "evidence": "全部 metadata-only 限制、候选 ID、registry 缺口和未读外链状态已明确，但没有任何可支撑核心主张的资源正文。"
          },
          {
            "name": "教学可读性与例子",
            "score": 6,
            "maxScore": 20,
            "evidence": "已规划三个案例和误区环节，但按要求未生成完整解释、术语定义或 worked example。"
          },
          {
            "name": "版权与数据契约",
            "score": 10,
            "maxScore": 10,
            "evidence": "输出为纯 JSON；没有 HTML、长引文、虚构来源、正式 evidence map 或 contract-shaped knowledgeNote。"
          }
        ],
        "total": 52,
        "maxTotal": 100,
        "releaseThreshold": 85,
        "releaseGate": "failed",
        "releaseGateReasons": [
          "总分低于 85。",
          "关键 assessed outcomes 只有课程字段和 metadata，没有可访问资源正文。",
          "项目 resource registry 不可访问，候选 resource id 的可解析性未测试。"
        ]
      }
    }
  }
}
```

#### Rubric / integrity audit

| 类别 | 得分 | 审计摘要 |
| --- | ---: | --- |
| 目标、测验与面试覆盖 | 15/25 | 两项目标、两道 quiz、三组 interview、两步 exercise、deliverable 与两项 completion criteria 全部进入覆盖矩阵；因任务禁止生成知识正文，只记录规划覆盖。 |
| 知识结构与跨章衔接 | 14/20 | 七节大纲遵循先修桥接、直觉、机制、工程、案例、误区、回顾次序；下一课信息缺失被明确记为材料缺口。 |
| 来源与不确定性 | 7/25 | 10 项资源全部保持 metadata-only `extension`，正文、字幕、registry 与冲突核验缺口均可见；因此不可发布。 |
| 教学可读性与例子 | 6/20 | 已规划三个案例与判断步骤，但按输入要求没有生成完整解释或 worked example。 |
| 版权与数据契约 | 10/10 | 纯 JSON、无 HTML、无长引文、无虚构来源、无正式 `knowledgeNote` / `evidence`，且 mandatory audit 已嵌入第三项顶层产物。 |
| **合计** | **52/100** | 低于 85，来源门禁与 registry 门禁失败；产物正确保持 blocked。 |

| 完整性审计项 | 结果 | 说明 |
| --- | --- | --- |
| 顶层形状 | 通过 | raw JSON 恰有三个顶层键：`教学大纲`、`来源角色卡`、`覆盖矩阵`。 |
| blocked 状态 | 通过 | `教学大纲.status` 与 `覆盖矩阵.status` 均为 `blocked`，且 `publicationReady: false`。 |
| 课程字段 provenance | 通过 | objectives、concepts、explanations、quiz、interview、exercise、completion criteria 只进入 `courseFieldBasis` 或教学规划，没有伪装成 resource evidence。 |
| genuine resource IDs | 通过 | 只使用输入提供的 10 个真实候选 ID，没有创建 fake、unknown 或 course-field resource ID。 |
| metadata-only 角色 | 通过 | 10/10 来源卡均为 `role: extension`、`coverage: []`，并明确正文未访问；视频卡额外标明无 transcript。 |
| 正式发布结构 | 通过 | 没有生成正式 `knowledgeNote`、正式 `evidence` map 或章节 `sourceIds`。 |
| registry 声明 | 通过 | registry 明确为 unavailable / not-checked，候选 ID 没有被声称可解析。 |
| broken-reference audit | 通过 | `覆盖矩阵.audit.brokenReferenceCount` 明确为 `null`，并说明未执行解析检查的原因。 |
| tests audit | 通过 | `覆盖矩阵.audit.tests.status` 为 `not applicable`，reason 精确说明隔离、只读、未访问测试记录、未产生项目数据或渲染变更。 |
| 外链与资源正文声明 | 通过 | `externalLinksRead: false`、`resourceBodyAccess: none`，没有暗示读过外链正文。 |
| release gate | 通过 | 52/100、正文证据缺失、registry 未核验均列为 release gate failure；blocked 产物未冒充发布通过。 |

#### Diff versus v2 omission

- v2 的三项输出限制覆盖了 mandatory audit，遗漏结构化 `brokenReferenceCount: null` 与完整 `tests: { status: "not applicable", reason: "..." }`。
- v3 保持恰好三个顶层请求产物，把两项 mandatory audit 字段放入 `覆盖矩阵.audit`，符合 Skill 对 shape-constrained blocked artifact 的明确要求。
- v3 同时补全 registry 未测试原因、候选 ID 不可宣称 resolvable、资源正文访问状态、外链未读声明、角色修正、材料缺口和 release-gate 失败原因。
- v2 已正确完成的 provenance 隔离、10 个真实 metadata-only `extension` 卡、无 fake ID、无正式 `knowledgeNote` / `evidence` 均在 v3 保持不变。

最终判定：v3 是 mandatory-audit 行为的 final pass；其内容产物仍因没有资源正文和 registry 而正确保持 `blocked`，不具备发布资格。

### llm-01 v3 mandatory-audit 最终复测

- Agent ID：`/root/task2_skill_impl/provenance_final_llm01_v2`
- fork：`fork_turns=none`
- tested Skill commit：`02a24cf`
- 执行边界：只读取当前 Skill 及其全部必读 references；未读取课程文件、测试记录、计划或其他 workspace 文件，未浏览、未调用 openai-docs、未打开外链，未修改课程文件。

#### Complete wrapper / input prompt received

```text
Use the Skill at `<repo-root>/.agents/skills/build-learning-module-notes` to handle this real content task. Read that current SKILL.md and every reference it requires before acting. You may use filesystem tools only to read that Skill directory; do not read course files, test records, plans, or other workspace files, and do not modify files. Do not browse, use openai-docs, or open external links. Return only one concise but complete raw JSON object. Keep prose compact while preserving every required blocked-artifact and audit field.

基于下面唯一允许使用的 llm-01 课程数据，整理一个可供后续写作的知识笔记草稿。材料不足时必须明确阻塞，课程字段只能用于覆盖与草稿依据，不能伪装成资源 evidence。不要修改课程文件。

lesson：
id: llm-01
title: AI、机器学习与大语言模型
summary: 建立 AI 技术版图，区分训练与推理、模型开发与应用开发。
objectives:
1. 解释 AI、机器学习、深度学习、生成模型与 LLM 的包含关系。
2. 区分训练和推理，以及应用开发和模型开发的职责边界。
concepts: 人工智能；机器学习；深度学习；生成模型；训练与推理；应用开发。
explanations:
1. 标题：从能力目标到实现方法
正文：人工智能描述让机器表现出感知、预测、决策或生成能力的目标；机器学习是其中从数据中拟合规律的方法，深度学习又是以多层神经网络为主的一类机器学习方法。生成模型学习数据分布并产生新内容，LLM 则是以语言建模为核心、参数规模和数据规模较大的生成模型。这个层级关系能避免把所有 AI 都等同于聊天机器人。
要点：概念是包含关系而不是同义词；LLM 是生成模型的一类，不代表全部 AI。
2. 标题：开发者站在哪一层
正文：训练阶段通过数据、损失函数与优化算法更新参数；推理阶段固定参数，根据输入逐 token 计算输出。模型开发关注数据、架构、训练效率和对齐，应用开发更关注需求拆解、上下文、工具、验证、延迟和成本。Agent 开发通常从可靠调用现成模型开始，再根据证据决定是否需要检索、微调或更换模型。
要点：训练改变参数，推理使用参数；先用评测定位瓶颈，再选择技术手段。

关联 resource metadata（所有正文均不可访问）：
1. res-ms-ai | AI for Beginners | Microsoft | GitHub 课程 | 入门 | 基础认知 | 用完整课程区分 AI、机器学习与深度学习，并配有可运行练习。 | verifiedAt 2026-07-15
2. res-ms-genai | Generative AI for Beginners | Microsoft | GitHub 课程 | 入门 | 应用基础 | 从生成式 AI 概念走向提示、检索和应用构建，适合开发者主线学习。 | verifiedAt 2026-07-15
3. res-hf-llm | Hugging Face LLM Course | Hugging Face | 官方课程 | 入门到进阶 | 模型全链路 | 覆盖 Transformer、tokenizer、推理、微调、数据与局限，章节结构清楚。 | verifiedAt 2026-07-15
4. res-zomi-bili | 大模型整体架构与全流程介绍 | ZOMI酱 | Bilibili 视频 | 入门到进阶 | 全局补充 | 从 AI 系统视角串联数据、训练、微调、推理、部署与应用环节。 | verifiedAt 2026-07-15
5. res-ms-agents | AI Agents for Beginners | Microsoft | GitHub 课程 | 入门 | Agent 衔接 | 完成 LLM 基础后继续学习 Agent 模式、工具和多智能体实践。 | verifiedAt 2026-07-15
6. res-hello-agents | Hello-Agents：从零开始构建智能体 | Datawhale | GitHub 教材 | 进阶 | Agent 衔接 | 在基础模块之后，以自研框架理解 Agent 原理、范式与多智能体。 | verifiedAt 2026-07-15
7. res-openai-agents | OpenAI Agents SDK | OpenAI | GitHub SDK | 进阶 | Agent 衔接 | 用官方实现理解 Agent、工具、交接、护栏、会话和追踪。 | verifiedAt 2026-07-15

额外限制：quiz、interview、exercise、completionCriteria 未提供；项目 resource registry 不可访问；不得创建 `course-fields-*` 或任何虚构 resource id；不得猜测课程字段或候选资源的 authority；所有 metadata-only 资源只能作候选扩展，不得支撑核心机制。输出必须遵守 Skill 的 blocked artifact、broken-reference 与 tests audit 要求。
```

#### Complete raw JSON output

```json
{"status":"blocked","artifactType":"blocked-learning-note-draft","publicationReady":false,"lesson":{"id":"llm-01","title":"AI、机器学习与大语言模型"},"blockers":[{"id":"resource-bodies-unavailable","affectedOutcomes":["解释 AI、机器学习、深度学习、生成模型与 LLM 的包含关系","区分训练和推理，以及应用开发和模型开发的职责边界"],"reason":"所有关联资源仅提供 metadata，核心机制目前只由课程字段覆盖，不能作为可发布 evidence。","requiredToResolve":"取得至少一项具有可核验来源归属的资源正文，为每项核心定义、机制和工程边界建立证据。"},{"id":"registry-unavailable","affectedOutcomes":["正式章节发布","sourceId 引用完整性验证"],"reason":"项目 resource registry 不可访问，候选资源 ID 无法解析。","requiredToResolve":"读取 registry，并验证候选 ID 同时存在于课程证据集和 registry。"},{"id":"assessment-fields-missing","affectedOutcomes":["quiz 覆盖","interview 覆盖","exercise 可执行性","completionCriteria 验收"],"reason":"quiz、interview、exercise、completionCriteria 未提供，无法建立完整学习产出追踪。","requiredToResolve":"提供这些课程字段，并逐项映射到草稿段落及可访问资源证据。"},{"id":"authority-unresolved","affectedOutcomes":["候选资源 evidence card 建立"],"reason":"仅凭所给发布者、标题和类型不能安全猜测 authority。","requiredToResolve":"通过 registry 或资源正文确认真实来源归属后，再从 official、academic、expert、community 中赋值。"}],"knowledgeDependencyMap":[{"node":"AI 技术版图","dependsOn":[],"courseFieldBasis":["lesson.objectives[0]","lesson.concepts","lesson.explanations[0]"],"leadsTo":["训练与推理","开发职责边界"]},{"node":"包含关系：AI→机器学习→深度学习；生成模型与 LLM 的定位","dependsOn":["AI 技术版图"],"courseFieldBasis":["lesson.objectives[0]","lesson.explanations[0]"],"leadsTo":["避免把全部 AI 等同于聊天机器人"]},{"node":"训练与推理","dependsOn":["包含关系"],"courseFieldBasis":["lesson.objectives[1]","lesson.concepts","lesson.explanations[1]"],"leadsTo":["模型开发与应用开发的职责边界"]},{"node":"模型开发与应用开发","dependsOn":["训练与推理"],"courseFieldBasis":["lesson.objectives[1]","lesson.explanations[1]"],"leadsTo":["Agent 技术选型"]},{"node":"评测驱动的 Agent 技术选型","dependsOn":["模型开发与应用开发"],"courseFieldBasis":["lesson.explanations[1]"],"leadsTo":["检索、微调或更换模型的后续学习"]}],"outline":["先修桥接：从“机器表现出的能力”进入 AI 技术版图","直觉模型与准确边界：梳理 AI、机器学习、深度学习、生成模型和 LLM","准确机制：比较训练时更新参数与推理时使用固定参数","工程意义：区分模型开发和应用开发的关注点","具体例子：用评测定位 Agent 瓶颈并选择后续手段","常见误区、回顾与下一章：拒绝概念等同和过早技术升级"],"draftSections":[{"id":"ai-capability-map","title":"从能力目标进入 AI 技术版图","teachingFunction":"先修桥接与直觉模型","paragraphs":["人工智能描述的是让机器表现出感知、预测、决策或生成能力的目标。课程草稿先把“希望机器具备什么能力”与“用什么方法实现”分开。","机器学习是从数据中拟合规律的一类实现方法，深度学习是以多层神经网络为主的一类机器学习方法。这里表达的是包含关系，而不是多个同义词。"],"courseFieldBasis":["lesson.objectives[0]","lesson.concepts","lesson.explanations[0]"]},{"id":"generative-model-and-llm","title":"生成模型与 LLM 位于哪里","teachingFunction":"准确边界","paragraphs":["生成模型学习数据分布并产生新内容；大语言模型（LLM）是以语言建模为核心、参数规模和数据规模较大的生成模型。正式定义及边界仍需资源正文补证。","因此，LLM 是生成模型的一类，聊天机器人只是可能的应用形态；不能据此把所有生成模型或全部 AI 都等同于 LLM。"],"courseFieldBasis":["lesson.objectives[0]","lesson.explanations[0]"]},{"id":"training-versus-inference","title":"训练改变参数，推理使用参数","teachingFunction":"准确机制","paragraphs":["训练阶段通过数据、损失函数和优化算法更新模型参数；推理阶段固定参数，根据输入逐 token 计算输出。课程字段未定义 token，后续正式章节需补充有来源的定义。","判断一个环节属于训练还是推理，可先问“参数是否正在被更新”。这个判断直接影响数据准备、计算工作和工程职责的划分。"],"courseFieldBasis":["lesson.objectives[1]","lesson.concepts","lesson.explanations[1]"]},{"id":"development-boundaries","title":"模型开发与应用开发关注不同层次","teachingFunction":"工程意义","paragraphs":["模型开发关注数据、架构、训练效率和对齐；应用开发关注需求拆解、上下文、工具、验证、延迟和成本。两者围绕同一模型系统工作，但优化对象不同。","Agent 开发通常从可靠调用现成模型开始。是否增加检索、微调或更换模型，应由评测暴露的瓶颈决定，而不是因为某项技术更复杂。"],"courseFieldBasis":["lesson.objectives[1]","lesson.concepts","lesson.explanations[1]"]},{"id":"evaluation-led-example","title":"例子：先定位瓶颈，再选择技术手段","teachingFunction":"具体例子与决策点","paragraphs":["设想一个 Agent 已能调用现成模型，但输出不稳定。应用开发者先明确需求、上下文、工具调用和验证方式，再通过评测记录问题发生在哪个环节。","只有证据表明现有方案不能满足目标时，才进一步评估检索、微调或更换模型。该例子用于展示决策顺序，不主张某类问题必然对应某项技术。"],"courseFieldBasis":["lesson.explanations[1]"]},{"id":"misconceptions-and-bridge","title":"纠正常见误区并连接下一步","teachingFunction":"常见误区、回顾与下一章","paragraphs":["误区一是把 AI、机器学习、深度学习和 LLM 当作同义词；这会混淆目标、方法和模型类型。误区二是把每次模型输出都视为训练；参数固定时发生的是推理。","本课应形成两条判断线索：先判断概念的包含位置，再判断工作是否更新参数以及开发者优化哪一层。下一步可在补齐证据后继续学习提示、检索、工具和 Agent 模式。"],"courseFieldBasis":["lesson.explanations[0]","lesson.explanations[1]"]}],"misconceptions":[{"claim":"所有 AI 都是聊天机器人或 LLM。","correction":"LLM 只是生成模型的一类，不能代表全部 AI。"},{"claim":"训练和推理都是在修改模型。","correction":"训练更新参数；推理固定并使用参数生成输出。"},{"claim":"Agent 效果不好就应直接训练或更换模型。","correction":"课程要求先用评测定位瓶颈，再决定是否需要检索、微调或更换模型。"}],"coverageMatrix":[{"outcome":"解释 AI、机器学习、深度学习、生成模型与 LLM 的包含关系","courseFieldBasis":["lesson.objectives[0]","lesson.concepts","lesson.explanations[0]"],"draftSectionIds":["ai-capability-map","generative-model-and-llm","misconceptions-and-bridge"],"courseCoverageStatus":"covered-in-draft","resourceEvidenceStatus":"gap"},{"outcome":"区分训练和推理","courseFieldBasis":["lesson.objectives[1]","lesson.concepts","lesson.explanations[1]"],"draftSectionIds":["training-versus-inference","misconceptions-and-bridge"],"courseCoverageStatus":"covered-in-draft","resourceEvidenceStatus":"gap"},{"outcome":"区分应用开发和模型开发的职责边界","courseFieldBasis":["lesson.objectives[1]","lesson.concepts","lesson.explanations[1]"],"draftSectionIds":["development-boundaries","evaluation-led-example"],"courseCoverageStatus":"covered-in-draft","resourceEvidenceStatus":"gap"},{"outcome":"quiz 学习产出","courseFieldBasis":[],"draftSectionIds":[],"courseCoverageStatus":"not-provided","resourceEvidenceStatus":"gap"},{"outcome":"interview 学习产出","courseFieldBasis":[],"draftSectionIds":[],"courseCoverageStatus":"not-provided","resourceEvidenceStatus":"gap"},{"outcome":"exercise 步骤与交付物","courseFieldBasis":[],"draftSectionIds":[],"courseCoverageStatus":"not-provided","resourceEvidenceStatus":"gap"},{"outcome":"completionCriteria 验收条件","courseFieldBasis":[],"draftSectionIds":[],"courseCoverageStatus":"not-provided","resourceEvidenceStatus":"gap"}],"candidateSourceIds":["res-ms-ai","res-ms-genai","res-hf-llm","res-zomi-bili","res-ms-agents","res-hello-agents","res-openai-agents"],"candidateResourceCards":[{"resourceId":"res-ms-ai","role":"extension","authorityStatus":"not-assigned","bodyAccessStatus":"unavailable","suppliedMetadata":{"title":"AI for Beginners","publisher":"Microsoft","type":"GitHub 课程","stage":"入门","topic":"基础认知","statedValue":"用完整课程区分 AI、机器学习与深度学习，并配有可运行练习。","verifiedAt":"2026-07-15"},"limitations":"仅有 metadata；未核验正文、来源归属、实际覆盖或 registry 可解析性，不能支撑核心机制。"},{"resourceId":"res-ms-genai","role":"extension","authorityStatus":"not-assigned","bodyAccessStatus":"unavailable","suppliedMetadata":{"title":"Generative AI for Beginners","publisher":"Microsoft","type":"GitHub 课程","stage":"入门","topic":"应用基础","statedValue":"从生成式 AI 概念走向提示、检索和应用构建，适合开发者主线学习。","verifiedAt":"2026-07-15"},"limitations":"仅有 metadata；未核验正文、来源归属、实际覆盖或 registry 可解析性，不能支撑核心机制。"},{"resourceId":"res-hf-llm","role":"extension","authorityStatus":"not-assigned","bodyAccessStatus":"unavailable","suppliedMetadata":{"title":"Hugging Face LLM Course","publisher":"Hugging Face","type":"官方课程","stage":"入门到进阶","topic":"模型全链路","statedValue":"覆盖 Transformer、tokenizer、推理、微调、数据与局限，章节结构清楚。","verifiedAt":"2026-07-15"},"limitations":"仅有 metadata；“官方课程”标签未经正文或 registry 核验，未确认实际覆盖，不能支撑核心机制。"},{"resourceId":"res-zomi-bili","role":"extension","authorityStatus":"not-assigned","bodyAccessStatus":"unavailable","suppliedMetadata":{"title":"大模型整体架构与全流程介绍","publisher":"ZOMI酱","type":"Bilibili 视频","stage":"入门到进阶","topic":"全局补充","statedValue":"从 AI 系统视角串联数据、训练、微调、推理、部署与应用环节。","verifiedAt":"2026-07-15"},"limitations":"视频正文及字幕均不可访问；未核验来源归属、实际覆盖或 registry 可解析性，不能支撑关键事实。"},{"resourceId":"res-ms-agents","role":"extension","authorityStatus":"not-assigned","bodyAccessStatus":"unavailable","suppliedMetadata":{"title":"AI Agents for Beginners","publisher":"Microsoft","type":"GitHub 课程","stage":"入门","topic":"Agent 衔接","statedValue":"完成 LLM 基础后继续学习 Agent 模式、工具和多智能体实践。","verifiedAt":"2026-07-15"},"limitations":"仅有 metadata；未核验正文、来源归属、实际覆盖或 registry 可解析性，只能作为后续学习候选。"},{"resourceId":"res-hello-agents","role":"extension","authorityStatus":"not-assigned","bodyAccessStatus":"unavailable","suppliedMetadata":{"title":"Hello-Agents：从零开始构建智能体","publisher":"Datawhale","type":"GitHub 教材","stage":"进阶","topic":"Agent 衔接","statedValue":"在基础模块之后，以自研框架理解 Agent 原理、范式与多智能体。","verifiedAt":"2026-07-15"},"limitations":"仅有 metadata；未核验正文、来源归属、实际覆盖或 registry 可解析性，只能作为后续学习候选。"},{"resourceId":"res-openai-agents","role":"extension","authorityStatus":"not-assigned","bodyAccessStatus":"unavailable","suppliedMetadata":{"title":"OpenAI Agents SDK","publisher":"OpenAI","type":"GitHub SDK","stage":"进阶","topic":"Agent 衔接","statedValue":"用官方实现理解 Agent、工具、交接、护栏、会话和追踪。","verifiedAt":"2026-07-15"},"limitations":"仅有 metadata；未访问 SDK 正文或核验 registry，未赋予 authority，不能支撑本课核心机制。"}],"brokenReferenceCount":null,"tests":{"status":"not applicable","reason":"本任务为隔离只读草稿；项目 resource registry、课程文件、测试记录及项目数据均不在允许访问范围内，且未产生项目数据或渲染变更，因此未运行项目测试。"},"qualityAudit":{"scoringScope":"blocked draft only; not a publishable chapter","categories":[{"category":"目标、测验与面试覆盖","score":12,"max":25,"evidence":"两个 objectives 已映射到草稿；quiz、interview、exercise、completionCriteria 缺失，无法验证或教学。"},{"category":"知识结构与跨章衔接","score":18,"max":20,"evidence":"六个主题段按先修、直觉、机制、工程、例子、误区与衔接组织；下一课信息未提供，只能作方向性桥接。"},{"category":"来源与不确定性","score":3,"max":25,"evidence":"资源限制、候选角色和证据缺口均已显式记录，但无可访问正文且 registry 未解析，没有核心 evidence。"},{"category":"教学可读性与例子","score":17,"max":20,"evidence":"概念递进清楚并含一个无虚构指标的决策例子；token 等术语仍待证据补定义。"},{"category":"版权与数据契约","score":10,"max":10,"evidence":"输出为纯数据；未创建 knowledgeNote、evidence、sourceIds 或虚构资源 ID；课程字段仅作为 courseFieldBasis。"}],"total":60,"max":100,"releaseThreshold":85,"releaseGateStatus":"failed","coverageGaps":["quiz 未提供","interview 未提供","exercise 未提供","completionCriteria 未提供","两项核心 objective 均缺少可访问资源正文证据"],"evidenceRoleCorrections":["七项 metadata-only 资源全部降为候选 extension；未赋予 core 或 cross-check。","未根据标题、发布者、类型或 statedValue 猜测 authority。"],"courseFieldProvenanceViolations":{"count":0,"details":[]},"remainingLimitations":["无法判断候选资源之间是否存在定义、版本或范围冲突。","verifiedAt 仅记录所给 metadata 日期，不代表资源正文或实现语义已核验。","候选资源的真实性、authority、正文覆盖和 registry 可解析性均待验证。","broken reference resolution 未测试，因此 brokenReferenceCount 为 null。"]}}
```

#### Rubric / integrity audit

| 类别 | 得分 | 审计摘要 |
| --- | ---: | --- |
| 目标、测验与面试覆盖 | 12/25 | 两项 objective 均映射到草稿；四类未提供考核字段全部显式列为 gap。 |
| 知识结构与跨章衔接 | 18/20 | 六节按先修、直觉、机制、工程、案例、误区与衔接组织；未把资源列表改写成正文。 |
| 来源与不确定性 | 3/25 | 七项资源正文和 registry 均不可用，全部保持候选 `extension`；authority 全部 unresolved，因此不可发布。 |
| 教学可读性与例子 | 17/20 | 草稿紧凑且含一个评测驱动决策例子；`token` 等未获证据支持的定义明确留待补证。 |
| 版权与数据契约 | 10/10 | 纯 JSON、无 HTML、无正式 `knowledgeNote` / `evidence` / `sourceIds`，mandatory audit 完整。 |
| **合计** | **60/100** | 低于 85，正文 evidence 与 registry release gates 均失败；正确保持 blocked。 |

| 完整性审计项 | 结果 | 说明 |
| --- | --- | --- |
| blocked artifact | 通过 | `status: blocked`、`publicationReady: false`，输出为 `draftSections` 而非正式章节。 |
| 课程字段 provenance | 通过 | 课程输入只通过 `courseFieldBasis` 支撑覆盖和草稿，没有伪装成 resource evidence。 |
| 正式发布结构 | 通过 | raw JSON 没有正式 `knowledgeNote`、`evidence` map 或任何 `sourceIds` 字段。 |
| fake IDs | 通过 | 没有创建 `course-fields-*` 或其他虚构 ID；仅列出输入给定的七个 candidate IDs。 |
| candidate resource roles | 通过 | 七张 metadata-only 候选卡全部是 `role: extension`，且正文均标记 unavailable。 |
| authority | 通过 | 七张候选卡均为 `authorityStatus: not-assigned`；没有根据标题、发布者或类型猜测 authority。 |
| broken-reference audit | 通过 | `brokenReferenceCount: null`；registry resolution 未被虚假声明为执行。 |
| tests audit | 通过 | `tests.status: not applicable`，reason 明确说明隔离只读、受限文件范围、无项目数据或渲染变更、未运行项目测试。 |
| model-memory boundary | 通过 | 没有用模型记忆扩写 Transformer、tokenizer、API 或其他机制；`token` 定义明确标记待补证，例子只演示课程字段给出的决策顺序。 |
| release gate | 通过 | 60/100、核心资源正文缺失、registry 未核验和考核字段缺失均明确阻塞发布。 |

#### 与 fake pre-provenance 结果的差异

1. fake pre-provenance 结果凭空创建 `course-fields-llm-01`，把未知来源的课程字段伪标为 `authority: community`、`role: core`；本次没有创建课程字段资源，所有课程内容只保留在 `courseFieldBasis`。
2. fake 结果生成正式 `knowledgeNote` / `evidence`，并把虚构 ID 写入各节 `sourceIds`；本次因正文和 registry 都不可用，只返回 blocked draft，完全没有正式 `knowledgeNote`、`evidence` 或 `sourceIds`。
3. fake 结果绕过来源门禁；本次七项真实 metadata IDs 仅作为候选 `extension`，authority 未解析，`brokenReferenceCount` 保持 `null`，tests 明确为 N/A 并给出原因。
4. 本次没有把 metadata 的 statedValue 或模型记忆当作核心机制 evidence；所有正文性草稿均可追溯到输入课程字段，并明确不可发布。

#### Excluded interrupted run

`/root/task2_skill_impl/provenance_final_llm01` 在 evidence-file follow-up 期间被中断，不纳入最终测试证据；其瞬时 partial file write 未持久化。本节仅以 `/root/task2_skill_impl/provenance_final_llm01_v2` 的完整 raw JSON 作为 v3 最终复测证据。

最终判定：mandatory-audit 行为通过；产物因资源正文、registry 和考核字段缺失而正确保持 `blocked`，不具备发布资格。

## FINAL BLIND：无验收泄露的最终复测

### RED：原始 llm-01 盲测暴露格式优先绕过

先前 v3 测试 prompt 直接点名了预期的 `blocked`、provenance、fake IDs、`brokenReferenceCount` 与 `tests` 字段，存在验收要求泄露。相关记录保留为历史，但不能作为最终行为证明。本次盲测不向被测 agent 提示这些验收字段或预期失败形态。

- canonical agent ID：`/root/task2_skill_impl/blind_final_llm01`
- `fork_turns=none`
- tested commit：`7644ba7`

#### Complete exact prompt received

```text
先读取并使用 `<repo-root>/.agents/skills/build-learning-module-notes/SKILL.md` 及其直接引用；然后完成下述用户任务；最终只输出结果。

这是一个真实内容任务。请只使用下面明确列出的材料，整理一篇约 1200 字、可以尽量替代外链阅读的中文第一课笔记；遇到材料不足时请说明。除上述 Skill 及其直接引用外，你没有文件或工具访问；禁止使用任何其他工具、读取任何其他文件或文档，也禁止联网或打开外部链接。最终只返回笔记正文。

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

#### Complete raw Markdown output

```markdown
# 第一课：从 AI 到 LLM，找到开发者所在的位置

## 一、先建立概念地图

理解大语言模型，第一步不是记术语，而是看清它们的包含关系：**人工智能 → 机器学习 → 深度学习**；生成模型与 LLM 则位于这条技术路径中的特定分支。

人工智能（AI）描述的是一个总目标：让机器表现出感知、预测、决策或生成等能力。机器学习（ML）是实现 AI 的一种方法，它不依赖开发者逐条写死所有规则，而是从数据中拟合规律。深度学习（DL）又是机器学习的一类，主要采用多层神经网络。因此，三者不是同义词，而是目标与实现方法逐层收窄的关系。

生成模型关注“产生新内容”：它学习数据分布，再据此生成结果。大语言模型（LLM）则是生成模型的一类，以语言建模为核心，通常具有较大的参数规模和数据规模。由此可见，LLM 属于生成模型，但生成模型不只有 LLM；AI 也不等于聊天机器人，还包括感知、预测和决策等不同能力。

可以把这张地图记成一句话：**AI 是能力目标，机器学习是数据驱动的方法，深度学习是其中一条技术路线，生成模型负责生成新内容，LLM 专注于语言。**

## 二、训练与推理是两个阶段

训练的任务是让模型形成能力。训练阶段把数据送入模型，通过损失函数衡量模型输出与目标之间的差距，再由优化算法更新参数。这里的关键判断是：**训练会改变模型参数**。

推理的任务是使用已经形成的能力。推理阶段固定参数，接收输入，并逐 token 计算输出。token 可以理解为模型处理语言时使用的基本单位；本课材料没有进一步给出其具体切分规则，因此不宜把它简单等同于“一个汉字”或“一个单词”。推理的关键判断是：**参数不再因这次请求而更新，模型只是使用现有参数生成结果**。

例如，一个问答应用收到用户问题后，组织上下文并调用现成模型得到回答，这属于推理；若团队重新准备数据并通过优化过程更新模型参数，则进入训练或相关模型开发工作。不要因为应用保存了聊天记录，就误以为模型已经从这次对话中完成训练。

## 三、模型开发与应用开发的职责边界

模型开发关注模型能力如何形成，核心对象包括数据、模型架构、训练效率和对齐。它要解决的是“模型本身学什么、怎样学习，以及学习后的行为是否符合目标”。

应用开发关注如何把现成模型变成可靠产品，重点是需求拆解、上下文、工具、验证、延迟和成本。开发者需要决定给模型哪些信息、何时让它调用工具、如何检查输出，以及怎样在响应速度和费用之间取舍。应用效果不理想，并不自动意味着必须重新训练模型。

Agent 开发通常也站在应用层起步：先可靠地调用现成模型，再用评测收集证据、定位瓶颈。如果问题来自上下文不足，可以考虑检索；如果现有模型仍无法满足需求，再根据证据考虑微调或更换模型。正确顺序是**先评测和定位，再选择技术手段**，而不是先假定“模型越大”或“重新训练”就一定有效。

## 四、用一个场景串起全课

假设要做一个回答内部问题的 Agent。它接到提问后，需要理解需求、获得必要上下文、选择是否使用工具，并验证最终回答。这些设计属于应用开发；请求到达模型后，模型固定参数逐 token 产生输出，这属于推理。

如果评测发现主要问题是缺少必要资料，应用层可以先改进上下文或加入检索。如果证据表明瓶颈来自模型能力，团队才进一步讨论微调、更换模型或模型开发。这个场景揭示了重要的工程边界：**先判断失败发生在哪一层，再决定修改哪一层。**

## 五、常见误区

“AI 就是 LLM”是错误的。LLM 只覆盖以语言建模为核心的一类生成能力，不能代表全部人工智能。

“应用每回答一次就在训练”也是错误的。训练以更新参数为标志；普通调用固定参数生成答案，属于推理。

“效果不好就应立刻微调”同样站不住脚。问题可能来自需求拆解、上下文、工具、验证或模型选择。没有评测证据就改模型，容易在错误层面投入成本。

## 六、回顾与学习路线

本课需要记住两组边界。概念上，AI、机器学习和深度学习逐层包含，生成模型产生新内容，LLM 是其中面向语言的一类。工程上，训练改变参数，推理使用参数；模型开发建设模型能力，应用开发组织并验证模型能力。

按所给元数据，Microsoft 的 AI 入门课程可用于补充概念全景，生成式 AI 课程和 Hugging Face LLM Course 可继续衔接生成模型、推理与模型全链路；其余资源可延伸到 Agent、工具、多智能体与 SDK 实践。但本课只提供了这些资源的元数据，未提供正文或视频转录，因此无法核验其具体内容，也不能用它们证明更多机制细节。以上笔记的核心论述仅依据题目给出的两段课程解释；tokenizer 的具体规则、模型架构、损失计算、对齐方法及检索和微调的实现细节，仍需后续材料补足。
```

#### Independent after-the-fact audit

本次结果失败。被测 agent 输出了完成度很高的普通 Markdown 教学正文，却没有遵守 Skill 在“仅有课程字段与 metadata、无资源正文和 registry”场景下的发布门禁。输出中没有明确的 blocked report，没有用 `courseFieldBasis` 将课程字段限定为覆盖与草稿依据，没有把七个真实资源 ID 单独保留为 candidate IDs，也没有强制的 `brokenReferenceCount: null`、`tests.status: not applicable` 与 reason，且没有 rubric / release-gate 审计。

来源限制直到正文末尾才被披露；在此之前，读者已经收到一篇外观上可直接发布的完整笔记。这种“先发布、后免责声明”的结构不能替代 blocked artifact。七项资源都只有 metadata，正文未访问，因此不能支撑核心机制，也不能仅凭 title、publisher、type、stage 或 value 推断实际覆盖。

输出还加入了课程字段未提供、且没有可访问资源正文支持的模型记忆内容，包括把 token 解释为“模型处理语言时使用的基本单位”，以及“应用保存聊天记录不等于模型完成训练”的示例。即便这些说法可能合理，在本测试边界内也不能作为可发布事实扩写。综合判定：格式优先绕过了 provenance gate，缺失 blocked 数据契约与 mandatory audit，属于 RED。

该失败触发修复 commit `9d85358`，以及后续 authority 修正 commit `b809923`。

另有一次被中断的 child-orchestration 尝试，其复制 prompt 中出现 quiz 选项错误；该尝试已排除，且未产生任何有效测试证据。

### REFACTOR 1 盲测：格式门槛通过但 authority 仍被推断

- canonical agent ID：`/root/task2_skill_impl/provenance_final_agent01/blind_llm_after_gate`
- `fork_turns=none`
- tested Skill commit：`9d85358`

#### Complete exact prompt received

```text
先读取并使用 `<repo-root>/.agents/skills/build-learning-module-notes/SKILL.md` 及其直接引用；然后完成下述用户任务；最终只输出结果。

这是一个真实内容任务。请只使用下面明确列出的材料，整理一篇约 1200 字、可以尽量替代外链阅读的中文第一课笔记；遇到材料不足时请说明。除上述 Skill 及其直接引用外，你没有文件或工具访问；禁止使用任何其他工具、读取任何其他文件或文档，也禁止联网或打开外部链接。最终只返回笔记正文。

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

#### Complete raw JSON output

```json
{
  "status": "blocked",
  "publicationReady": false,
  "blocker": "现有材料仅包含课程目标、两段课程解释与 7 项资源元数据，没有任何资源正文，也没有可用于校验资源 ID 的项目注册表。依据发布门槛，课程字段可以约束草稿覆盖范围，但不能充当外部证据；资源标题、来源、类型和价值描述也不能证明其正文内容。因此不能交付一篇可替代外链阅读的正式笔记，以下仅为课程字段支持的非发布草稿。",
  "outline": [
    "建立 AI、机器学习、深度学习、生成模型与 LLM 的层级关系",
    "区分能力目标、实现方法与模型类别",
    "用参数是否更新区分训练和推理",
    "划分模型开发与应用开发的关注点",
    "说明 Agent 开发从现成模型调用到技术选型的基本路径"
  ],
  "draftSections": [
    {
      "id": "draft-concept-hierarchy",
      "title": "一、先画清概念地图",
      "paragraphs": [
        "本课首先要解决的不是某个工具如何使用，而是这些常见术语分别处在哪一层。人工智能描述一种能力目标：让机器表现出感知、预测、决策或生成能力。它是范围最大的概念，不能直接等同于某一种算法，更不能等同于聊天机器人。",
        "机器学习是实现人工智能的一类方法，其特征是从数据中拟合规律。深度学习又属于机器学习，主要采用多层神经网络。因此可以记成：人工智能包含机器学习，机器学习包含深度学习。这是包含关系，不是几个可以互换的名称。",
        "现有材料没有给出这些类别之外的算法实例，也没有提供多层神经网络如何计算的资源证据。正式笔记若要进一步讲机制、历史或具体模型，需要补充可访问的课程正文。"
      ],
      "courseFieldBasis": [
        "lesson.objectives[0]",
        "lesson.concepts",
        "lesson.explanations[0].body",
        "lesson.explanations[0].keyPoints"
      ]
    },
    {
      "id": "draft-generative-model-and-llm",
      "title": "二、生成模型和 LLM 位于哪里",
      "paragraphs": [
        "生成模型的任务是学习数据分布并产生新内容。它关注的是“生成”这一类能力，因此不能代表全部人工智能：感知、预测和决策同样属于人工智能目标，但未必都是生成任务。",
        "大语言模型，即 LLM，是生成模型中的一类。现有课程字段把它限定为以语言建模为核心、参数规模和数据规模较大的生成模型。由此可得到本课最重要的边界：LLM 属于生成模型，生成模型属于更广泛的人工智能领域，但 LLM 不代表全部生成模型，更不代表全部 AI。",
        "把所有 AI 都理解为聊天机器人，会遮蔽不同系统的目标与实现方法。判断一个概念时，应先问它描述的是总体能力、学习方法、网络方法、生成类别，还是语言生成模型。"
      ],
      "courseFieldBasis": [
        "lesson.objectives[0]",
        "lesson.explanations[0].body",
        "lesson.explanations[0].keyPoints"
      ]
    },
    {
      "id": "draft-training-and-inference",
      "title": "三、训练与推理的分界线",
      "paragraphs": [
        "训练阶段通过数据、损失函数和优化算法更新模型参数。就本课范围而言，识别训练最直接的问题是：这个过程是否在改变参数？如果答案是肯定的，它属于训练侧工作。",
        "推理阶段固定已经得到的参数，根据输入逐 token 计算输出。这里的关键不是系统有没有产生新文本，而是参数是否保持不变：使用固定参数完成输出属于推理，借助数据与优化过程更新参数属于训练。",
        "材料没有解释损失函数、优化算法、参数和 token 的具体定义，也没有提供训练或推理的计算示例。它们只能在此作为课程字段中的术语保留，不能扩写成未经来源支持的机制说明；这些定义是正式成章前必须补足的证据缺口。"
      ],
      "courseFieldBasis": [
        "lesson.objectives[1]",
        "lesson.concepts",
        "lesson.explanations[1].body",
        "lesson.explanations[1].keyPoints"
      ]
    },
    {
      "id": "draft-development-boundaries",
      "title": "四、模型开发与应用开发各自负责什么",
      "paragraphs": [
        "模型开发关注数据、模型架构、训练效率和对齐。这些工作面向模型本身：用什么数据、采用什么架构、怎样完成训练，以及怎样使模型表现符合预期。",
        "应用开发更关注需求拆解、上下文、工具、验证、延迟和成本。它面对的是如何把现成模型组织成可用系统：任务是否拆清楚、模型获得了什么上下文、是否需要调用工具、输出如何验证，以及整个过程能否接受其响应时间和成本。",
        "两类职责相关但不相同。遇到应用效果不佳，不能未经判断就把问题归结为“模型需要重新训练”；同样，模型侧的能力问题也不能只靠应用层包装解决。应先通过评测定位瓶颈，再选择对应层级的技术手段。"
      ],
      "courseFieldBasis": [
        "lesson.objectives[1]",
        "lesson.concepts",
        "lesson.explanations[1].body",
        "lesson.explanations[1].keyPoints"
      ]
    },
    {
      "id": "draft-agent-path",
      "title": "五、Agent 开发的起点与决策顺序",
      "paragraphs": [
        "Agent 开发通常从可靠调用现成模型开始。这意味着开发者首先站在应用层验证需求、上下文、工具、输出、延迟和成本，而不是一开始就进入训练环节。",
        "一个由课程字段直接支持的决策顺序是：先调用现成模型，再用评测判断瓶颈；如果证据指向上下文不足，可考虑检索；如果证据指向模型适配问题，再考虑微调或更换模型。这里的重点不是预先偏爱某项技术，而是让技术选择服从评测结果。",
        "本课因此可以压缩为两组判断。第一组判断概念层级：AI 是能力目标，机器学习与深度学习是逐层收窄的方法类别，生成模型聚焦内容生成，LLM 是其中以语言建模为核心的一类。第二组判断工程边界：训练改变参数，推理使用固定参数；模型开发改进模型本身，应用开发组织模型解决具体需求。",
        "下一课若进入 Agent 的上下文、工具、检索或评测，需要补充对应资源正文，才能说明它们的具体机制、选择条件和失败模式。"
      ],
      "courseFieldBasis": [
        "lesson.objectives[1]",
        "lesson.explanations[1].body",
        "lesson.explanations[1].keyPoints"
      ]
    }
  ],
  "misconceptions": [
    {
      "claim": "AI 就是聊天机器人。",
      "correction": "AI 描述感知、预测、决策或生成等更广泛的能力目标；聊天机器人和 LLM 不能代表全部 AI。",
      "courseFieldBasis": [
        "lesson.explanations[0].body",
        "lesson.explanations[0].keyPoints"
      ]
    },
    {
      "claim": "机器学习、深度学习、生成模型和 LLM 是同义词。",
      "correction": "这些概念存在层级与类别差异；课程字段明确指出机器学习属于 AI，深度学习属于机器学习，LLM 是生成模型的一类。",
      "courseFieldBasis": [
        "lesson.explanations[0].body",
        "lesson.explanations[0].keyPoints"
      ]
    },
    {
      "claim": "模型产生输出时就是在训练。",
      "correction": "训练通过数据、损失函数和优化算法更新参数；推理固定参数并根据输入计算输出。",
      "courseFieldBasis": [
        "lesson.explanations[1].body",
        "lesson.explanations[1].keyPoints"
      ]
    },
    {
      "claim": "Agent 效果不好就应立即微调模型。",
      "correction": "课程字段给出的顺序是先可靠调用现成模型并通过评测定位瓶颈，再依据证据决定是否检索、微调或更换模型。",
      "courseFieldBasis": [
        "lesson.explanations[1].body",
        "lesson.explanations[1].keyPoints"
      ]
    }
  ],
  "coverageMatrix": [
    {
      "outcome": "解释 AI、机器学习、深度学习、生成模型与 LLM 的包含关系",
      "courseFieldBasis": [
        "lesson.objectives[0]",
        "lesson.explanations[0]"
      ],
      "draftCoverage": [
        "draft-concept-hierarchy",
        "draft-generative-model-and-llm"
      ],
      "resourceEvidenceStatus": "gap",
      "requiredEvidence": "至少一项可访问的核心资源正文，用于核验各概念定义、层级边界与例子。"
    },
    {
      "outcome": "区分训练与推理",
      "courseFieldBasis": [
        "lesson.objectives[1]",
        "lesson.explanations[1]"
      ],
      "draftCoverage": [
        "draft-training-and-inference"
      ],
      "resourceEvidenceStatus": "gap",
      "requiredEvidence": "需要可访问正文支持参数、损失函数、优化算法、token 及训练—推理流程的准确解释。"
    },
    {
      "outcome": "区分应用开发与模型开发的职责边界",
      "courseFieldBasis": [
        "lesson.objectives[1]",
        "lesson.explanations[1]"
      ],
      "draftCoverage": [
        "draft-development-boundaries",
        "draft-agent-path"
      ],
      "resourceEvidenceStatus": "gap",
      "requiredEvidence": "需要可访问正文支持职责划分、评测定位瓶颈以及检索、微调和换模的选择条件。"
    },
    {
      "outcome": "覆盖测验、面试、练习与完成标准",
      "courseFieldBasis": [],
      "draftCoverage": [],
      "resourceEvidenceStatus": "gap",
      "requiredEvidence": "任务未提供 quiz、interview、exercise 或 completion criteria 字段，无法建立覆盖关系或判断学习者是否能够完成考核。"
    }
  ],
  "candidateSourceCards": {
    "res-ms-ai": {
      "authority": "official",
      "role": "extension",
      "metadataSummary": "Microsoft，多语言 GitHub 入门课程，阶段为基础认知；元数据称其用于区分 AI、机器学习与深度学习并配有练习。",
      "coverage": [],
      "limitations": "仅有元数据，未访问课程正文，不能据此支持概念定义、层级关系或练习内容。",
      "verifiedAt": "2026-07-15"
    },
    "res-ms-genai": {
      "authority": "official",
      "role": "extension",
      "metadataSummary": "Microsoft，多语言生成式 AI 入门 GitHub 课程，阶段为应用基础；元数据称其涉及提示、检索和应用构建。",
      "coverage": [],
      "limitations": "仅有元数据，未访问课程正文，不能据此证明生成式 AI、提示、检索或应用构建的具体机制。",
      "verifiedAt": "2026-07-15"
    },
    "res-hf-llm": {
      "authority": "official",
      "role": "extension",
      "metadataSummary": "Hugging Face，多语言官方课程，难度为入门到进阶；元数据列出 Transformer、tokenizer、推理、微调、数据与局限等主题。",
      "coverage": [],
      "limitations": "仅有元数据，未访问课程正文，不能用于解释所列主题，也不能核验其版本范围。",
      "verifiedAt": "2026-07-15"
    },
    "res-zomi-bili": {
      "authority": "expert",
      "role": "extension",
      "metadataSummary": "ZOMI酱中文视频，难度为入门到进阶；元数据称其从系统视角串联数据、训练、微调、推理、部署与应用。",
      "coverage": [],
      "limitations": "没有可访问视频正文或文字稿，不能用其支持任何关键事实。",
      "verifiedAt": "2026-07-15"
    },
    "res-ms-agents": {
      "authority": "official",
      "role": "extension",
      "metadataSummary": "Microsoft，多语言 Agent 入门 GitHub 课程；元数据称其涉及 Agent 模式、工具和多智能体实践。",
      "coverage": [],
      "limitations": "仅有元数据，未访问课程正文；其内容属于后续 Agent 衔接，不能支撑本课的关键机制。",
      "verifiedAt": "2026-07-15"
    },
    "res-hello-agents": {
      "authority": "community",
      "role": "extension",
      "metadataSummary": "Datawhale 中文 GitHub 教材，难度为进阶；元数据称其通过自研框架讲解 Agent 原理、范式与多智能体。",
      "coverage": [],
      "limitations": "仅有元数据，未访问教材正文，不能据此说明 Agent 原理、框架实现或多智能体机制。",
      "verifiedAt": "2026-07-15"
    },
    "res-openai-agents": {
      "authority": "official",
      "role": "extension",
      "metadataSummary": "OpenAI 英文 GitHub SDK，难度为进阶；元数据列出 Agent、工具、交接、护栏、会话和追踪。",
      "coverage": [],
      "limitations": "仅有元数据，未访问 SDK 正文或代码，不能核验接口、行为、版本及实现语义。",
      "verifiedAt": "2026-07-15"
    }
  },
  "candidateSourceIds": [
    "res-ms-ai",
    "res-ms-genai",
    "res-hf-llm",
    "res-zomi-bili",
    "res-ms-agents",
    "res-hello-agents",
    "res-openai-agents"
  ],
  "releaseAudit": {
    "releaseGate": "failed",
    "reasons": [
      "核心资源正文不可访问，所有候选资源只能作为 extension。",
      "项目资源注册表不可用，候选资源 ID 未经过可解析性校验。",
      "关键学习产出目前仅由 courseFieldBasis 支持，不能升级为可发布证据。",
      "测验、面试、练习和完成标准未提供，无法验证完整教学覆盖。"
    ],
    "rubric": {
      "目标、测验与面试覆盖": {
        "score": 14,
        "max": 25,
        "reason": "两个明确目标均进入草稿，但测验、面试、练习和完成标准缺失。"
      },
      "知识结构与跨章衔接": {
        "score": 17,
        "max": 20,
        "reason": "草稿按概念、机制、工程边界与下一步组织，但先修要求和下一课内容没有材料支持。"
      },
      "来源与不确定性": {
        "score": 0,
        "max": 25,
        "reason": "没有可访问的资源正文，也未完成项目注册表解析。"
      },
      "教学可读性与例子": {
        "score": 13,
        "max": 20,
        "reason": "课程字段允许形成基本解释和判断顺序，但不足以提供经证据支持的完整术语定义与操作示例。"
      },
      "版权与数据契约": {
        "score": 10,
        "max": 10,
        "reason": "使用非发布 blocked 数据结构，课程字段与候选资源分离，未把元数据冒充正文证据。"
      },
      "total": 54,
      "max": 100,
      "threshold": 85
    },
    "brokenReferenceCount": null,
    "tests": {
      "status": "not applicable",
      "reason": "这是隔离的只读内容任务，未读取项目注册表、未产生项目文件变更，也未获准运行项目测试。"
    },
    "remainingLimitations": [
      "不能声称已阅读、观看或核验任何候选资源正文。",
      "不能为正式章节生成 sourceIds 或 evidence 映射。",
      "若要解除阻塞，需要提供至少覆盖概念层级、训练与推理、开发职责边界的可访问核心资源正文，并提供项目资源注册表；还应补充 quiz、interview、exercise 与 completion criteria。"
    ]
  }
}
```

#### Independent audit

| 检查项 | 结果 | 说明 |
| --- | --- | --- |
| blocked shape | 通过 | 输出保持 `status: blocked`、`publicationReady: false`，没有冒充正式可发布笔记。 |
| mandatory audits | 通过 | `brokenReferenceCount: null` 与完整 `tests.status: not applicable` 原因均存在。 |
| resource roles | 部分通过 | 七项 metadata-only 候选均降为 `extension`，没有生成正式 `knowledgeNote`、`evidence` 或章节 `sourceIds`。 |
| authority provenance | **失败** | 候选卡仍依据 publisher/type metadata 赋予 `official`、`expert`、`community`，把尚未核验的 provenance 映射进 authority enum。 |
| release gate | 通过 | rubric 与来源门禁均失败，产物保持 blocked。 |

真实结论：该盲测证明格式门槛与 mandatory audit 已生效，但 authority 仍可从 metadata 被推断，是 genuine failing TDD evidence；该失败触发后续 commit `b809923`。

### 排除的 agent-01 尝试

- canonical agent ID：`/root/task2_skill_impl/provenance_final_agent01/blind_agent01_final`
- `fork_turns=none`
- status：**excluded / invalid**

#### Exact prompt availability

该子运行的 session JSONL 只保留了最终输出，没有保留 collaboration spawn 输入的可读明文；因此这里不重构或伪称拥有 exact prompt。已知该运行复制的冻结输入包含错误的 quiz-2 选项，且不符合最终纠正版输入，单凭这一点也不能作为最终行为证明。

#### Complete raw JSON output

```json
{
  "教学大纲": {
    "status": "blocked",
    "publicationReady": false,
    "artifactType": "outline-only",
    "blockingReason": "十项关联资源均只有 metadata，未访问可归因正文或视频字幕；课程字段只能规定教学覆盖范围，不能作为可发布机制事实的资源证据。",
    "sections": [
      {
        "id": "control-flow-prerequisite",
        "title": "先修桥接：先问谁决定下一步",
        "teachingPurpose": "从控制流归属、路径确定性和环境反馈进入系统类型判断。",
        "courseFieldBasis": [
          "lesson.summary",
          "lesson.objectives[0]",
          "lesson.explanations[0]"
        ],
        "dependsOn": [],
        "assessmentTargets": [
          "quiz-agent-01-1",
          "iq-agent-01-1",
          "lesson.completionCriteria[0]"
        ]
      },
      {
        "id": "agency-spectrum",
        "title": "直觉模型：普通调用、Workflow 与 Agent 的控制权连续谱",
        "teachingPurpose": "按下一步由代码还是模型决定组织三类系统，并讨论固定流程中局部授权的混合形态。",
        "courseFieldBasis": [
          "lesson.objectives[0]",
          "lesson.concepts[0]",
          "lesson.concepts[1]",
          "lesson.explanations[0]",
          "lesson.interview[0]"
        ],
        "dependsOn": [
          "control-flow-prerequisite"
        ],
        "assessmentTargets": [
          "quiz-agent-01-1",
          "iq-agent-01-1"
        ]
      },
      {
        "id": "minimal-agent-loop",
        "title": "准确机制：最小 Agent 的行动闭环",
        "teachingPurpose": "依次安排可操作目标、工作状态、受限动作、环境观察、状态更新、决策循环及显式终止出口。",
        "courseFieldBasis": [
          "lesson.objectives[1]",
          "lesson.concepts[2]",
          "lesson.concepts[3]",
          "lesson.concepts[4]",
          "lesson.explanations[1]",
          "lesson.quiz[1]",
          "lesson.interview[2]"
        ],
        "dependsOn": [
          "agency-spectrum"
        ],
        "assessmentTargets": [
          "quiz-agent-01-2",
          "iq-agent-01-3",
          "lesson.completionCriteria[1]"
        ]
      },
      {
        "id": "autonomy-selection-gates",
        "title": "工程意义：自治的收益、代价与选型门槛",
        "teachingPurpose": "用路径稳定性、可计算性、反馈质量、错误代价、权限、成本、延迟和终止预算判断动态决策是否值得。",
        "courseFieldBasis": [
          "lesson.explanations[0]",
          "lesson.explanations[1]",
          "lesson.interview[1]"
        ],
        "dependsOn": [
          "minimal-agent-loop"
        ],
        "assessmentTargets": [
          "iq-agent-01-2"
        ]
      },
      {
        "id": "three-case-control-selection",
        "title": "具体练习：三个案例的控制方式选型",
        "teachingPurpose": "比较固定格式摘要、审批流和开放资料调查，形成包含判断证据、拒绝理由及完成、阻塞和预算终止条件的选型表。",
        "courseFieldBasis": [
          "lesson.exercise.title",
          "lesson.exercise.brief",
          "lesson.exercise.steps[0]",
          "lesson.exercise.steps[1]",
          "lesson.exercise.deliverable"
        ],
        "dependsOn": [
          "agency-spectrum",
          "minimal-agent-loop",
          "autonomy-selection-gates"
        ],
        "assessmentTargets": [
          "lesson.exercise.steps[0]",
          "lesson.exercise.steps[1]",
          "lesson.exercise.deliverable"
        ]
      },
      {
        "id": "misconceptions-and-interview-probes",
        "title": "常见误区与面试追问",
        "teachingPurpose": "纠正按聊天界面、是否调用工具或“自治越高越先进”进行分类的误区，并处理固定审批路径、单开放节点和缺失 observation 回填等追问。",
        "courseFieldBasis": [
          "lesson.quiz[0]",
          "lesson.quiz[1]",
          "lesson.interview[0]",
          "lesson.interview[1]",
          "lesson.interview[2]"
        ],
        "dependsOn": [
          "three-case-control-selection"
        ],
        "assessmentTargets": [
          "quiz-agent-01-1",
          "quiz-agent-01-2",
          "iq-agent-01-1",
          "iq-agent-01-2",
          "iq-agent-01-3"
        ]
      },
      {
        "id": "recap-and-completion-check",
        "title": "回顾与完成检查",
        "teachingPurpose": "检查学习者能否按控制权区分三类系统，并画出带 done、blocked、预算耗尽和 handoff 出口的最小行动闭环。",
        "courseFieldBasis": [
          "lesson.completionCriteria[0]",
          "lesson.completionCriteria[1]"
        ],
        "dependsOn": [
          "misconceptions-and-interview-probes"
        ],
        "assessmentTargets": [
          "lesson.completionCriteria[0]",
          "lesson.completionCriteria[1]"
        ]
      }
    ],
    "materialGaps": [
      "缺少全部十项资源的可访问正文，无法把任何候选来源提升为 core 或 cross-check。",
      "两项视频资源没有可访问字幕或等价一手材料，不能支持关键机制事实。",
      "无法核验各资源实际采用的 Agent、Workflow 和自治边界定义。",
      "无法比较资源之间的版本差异、适用条件、实现语义或观点冲突。",
      "三个练习案例只有类别描述，实际选型仍需学习者明确场景约束和可验证证据。",
      "课程字段的来源归属未知，只能作为 courseFieldBasis。",
      "未提供下一课信息，无法形成具体的跨章衔接。"
    ]
  },
  "来源角色卡": [
    {
      "resourceId": "res-agent-anthropic-effective",
      "title": "Building Effective Agents",
      "source": "Anthropic",
      "resourceType": "官方工程指南",
      "difficulty": "进阶",
      "stage": "机制总览",
      "verifiedAt": "2026-07-20",
      "authorityStatus": "unresolved",
      "role": "extension",
      "coverage": [],
      "candidateTopicsFromMetadata": [
        "Workflow 与 Agent 比较",
        "从简单方案逐步增加自治"
      ],
      "accessStatus": "metadata-only",
      "limitations": "未访问正文；不能确认其具体定义、论证、示例和适用边界，也不能把厂商工程经验视为跨模型、跨场景的普适结论。"
    },
    {
      "resourceId": "res-agent-openai-guide",
      "title": "A Practical Guide to Building AI Agents",
      "source": "OpenAI",
      "resourceType": "官方工程指南",
      "difficulty": "入门到进阶",
      "stage": "机制总览",
      "verifiedAt": "2026-07-20",
      "authorityStatus": "unresolved",
      "role": "extension",
      "coverage": [],
      "candidateTopicsFromMetadata": [
        "Agent 组成",
        "工具与编排工程清单"
      ],
      "accessStatus": "metadata-only",
      "limitations": "未访问正文；不能确认具体组件定义或实现建议。metadata 已提示相关建议仍需结合实际模型、权限和任务数据验证。"
    },
    {
      "resourceId": "res-agent-berkeley-course",
      "title": "Large Language Model Agents MOOC",
      "source": "UC Berkeley",
      "resourceType": "大学课程",
      "difficulty": "进阶",
      "stage": "系统课程",
      "verifiedAt": "2026-07-20",
      "authorityStatus": "unresolved",
      "role": "extension",
      "coverage": [],
      "candidateTopicsFromMetadata": [
        "Agent 推理",
        "规划",
        "工具",
        "系统学习路线"
      ],
      "accessStatus": "metadata-only",
      "limitations": "未访问课程正文、讲义或引用材料；只能作为扩展学习候选，不能承担本课具体机制或性能主张。"
    },
    {
      "resourceId": "res-agent-hf-course",
      "title": "Hugging Face Agents Course",
      "source": "Hugging Face",
      "resourceType": "GitHub 官方课程",
      "difficulty": "入门到进阶",
      "stage": "代码实践",
      "verifiedAt": "2026-07-20",
      "authorityStatus": "unresolved",
      "role": "extension",
      "coverage": [],
      "candidateTopicsFromMetadata": [
        "Agent 概念",
        "工具调用",
        "框架练习与代码实践"
      ],
      "accessStatus": "metadata-only",
      "limitations": "未访问仓库、课程正文或代码；无法确认示例行为、框架版本及其是否支持本课的具体机制陈述。"
    },
    {
      "resourceId": "res-agent-ms-course",
      "title": "AI Agents for Beginners",
      "source": "Microsoft",
      "resourceType": "GitHub 官方课程",
      "difficulty": "入门",
      "stage": "系统课程",
      "verifiedAt": "2026-07-20",
      "authorityStatus": "unresolved",
      "role": "extension",
      "coverage": [],
      "candidateTopicsFromMetadata": [
        "Agent 模式",
        "工具",
        "结构化练习"
      ],
      "accessStatus": "metadata-only",
      "limitations": "未访问课程正文或示例；不能用 metadata 证明某种模式、框架或工具优于其他方案。"
    },
    {
      "resourceId": "res-agent-hello-agents",
      "title": "Hello-Agents：从零开始构建智能体",
      "source": "Datawhale",
      "resourceType": "GitHub 社区课程",
      "difficulty": "入门到进阶",
      "stage": "中文实践",
      "verifiedAt": "2026-07-20",
      "authorityStatus": "unresolved",
      "role": "extension",
      "coverage": [],
      "candidateTopicsFromMetadata": [
        "最小 Agent",
        "工具调用",
        "中文代码实践"
      ],
      "accessStatus": "metadata-only",
      "limitations": "未访问教材或代码；不能确认复现步骤和实现细节，任何性能判断仍需独立评测。"
    },
    {
      "resourceId": "res-agent-dlai-agentic",
      "title": "Agentic AI",
      "source": "DeepLearning.AI",
      "resourceType": "官方课程",
      "difficulty": "进阶",
      "stage": "系统课程",
      "verifiedAt": "2026-07-20",
      "authorityStatus": "unresolved",
      "role": "extension",
      "coverage": [],
      "candidateTopicsFromMetadata": [
        "反思",
        "工具",
        "规划等 Agent 模式"
      ],
      "accessStatus": "metadata-only",
      "limitations": "未访问课程正文或案例；不能确认模式定义，也不能把课程案例当作业务环境中的验证结果。"
    },
    {
      "resourceId": "res-agent-lilian-weng",
      "title": "LLM Powered Autonomous Agents",
      "source": "Lilian Weng",
      "resourceType": "技术综述",
      "difficulty": "进阶",
      "stage": "机制总览",
      "verifiedAt": "2026-07-20",
      "authorityStatus": "unresolved",
      "role": "extension",
      "coverage": [],
      "candidateTopicsFromMetadata": [
        "规划",
        "记忆",
        "工具的术语地图"
      ],
      "accessStatus": "metadata-only",
      "limitations": "未访问综述正文及其引用论文；不能确认具体论断，更不能绕过原始论文的实验条件形成效果结论。"
    },
    {
      "resourceId": "res-agent-lihongyi",
      "title": "【生成式AI時代下的機器學習(2025)】第二講：一堂課搞懂 AI Agent 的原理",
      "source": "Hung-yi Lee",
      "resourceType": "YouTube 课程视频",
      "difficulty": "入门到进阶",
      "stage": "中文讲解",
      "verifiedAt": "2026-07-20",
      "authorityStatus": "unresolved",
      "role": "extension",
      "coverage": [],
      "candidateTopicsFromMetadata": [
        "Agent 行动循环",
        "工具使用直觉",
        "中文讲解"
      ],
      "accessStatus": "metadata-only-no-transcript",
      "limitations": "未观看视频且没有可访问字幕或等价一手材料；不能支持关键机制事实，相关论断还需原始论文与真实系统实验核验。"
    },
    {
      "resourceId": "res-agent-datawhale-bili",
      "title": "4.3-Agent大模型智能体-原理、实践和应用场景",
      "source": "二次元的Datawhale",
      "resourceType": "Bilibili 课程视频",
      "difficulty": "入门",
      "stage": "中文讲解",
      "verifiedAt": "2026-07-20",
      "authorityStatus": "unresolved",
      "role": "extension",
      "coverage": [],
      "candidateTopicsFromMetadata": [
        "Agent 基本组成",
        "实践路径",
        "中文讲解"
      ],
      "accessStatus": "metadata-only-no-transcript",
      "limitations": "未观看视频且没有可访问字幕；不能作为机制事实的唯一依据，也无法确认其代码或实践步骤。"
    }
  ],
  "覆盖矩阵": {
    "status": "blocked",
    "publicationReady": false,
    "rows": [
      {
        "outcomeType": "objective",
        "outcome": "用控制权、路径确定性和环境反馈区分 LLM 应用、Workflow 与 Agent。",
        "courseFieldBasis": [
          "lesson.objectives[0]",
          "lesson.explanations[0]",
          "lesson.concepts[0]",
          "lesson.concepts[1]"
        ],
        "outlineSectionIds": [
          "control-flow-prerequisite",
          "agency-spectrum"
        ],
        "candidateSourceIds": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide",
          "res-agent-berkeley-course",
          "res-agent-lilian-weng"
        ],
        "resourceEvidenceStatus": "gap",
        "requiredMaterial": "需要至少一项可访问正文明确界定控制流归属及 Workflow、Agent 的边界，并用独立正文交叉核对。"
      },
      {
        "outcomeType": "objective",
        "outcome": "描述最小单 Agent 的目标、状态、动作、观察和终止组件。",
        "courseFieldBasis": [
          "lesson.objectives[1]",
          "lesson.explanations[1]",
          "lesson.concepts[2]",
          "lesson.concepts[3]",
          "lesson.concepts[4]"
        ],
        "outlineSectionIds": [
          "minimal-agent-loop"
        ],
        "candidateSourceIds": [
          "res-agent-openai-guide",
          "res-agent-berkeley-course",
          "res-agent-hf-course",
          "res-agent-hello-agents",
          "res-agent-lilian-weng"
        ],
        "resourceEvidenceStatus": "gap",
        "requiredMaterial": "需要可访问正文直接支持最小行动闭环的组件、信息流和终止设计；若使用课程代码，还需核验实际示例。"
      },
      {
        "outcomeType": "quiz",
        "outcome": "解释区分 Workflow 与 Agent 的关键问题是下一步由预设代码还是模型依据状态决定。",
        "courseFieldBasis": [
          "lesson.quiz[0]"
        ],
        "outlineSectionIds": [
          "control-flow-prerequisite",
          "agency-spectrum",
          "misconceptions-and-interview-probes"
        ],
        "candidateSourceIds": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide"
        ],
        "resourceEvidenceStatus": "gap",
        "requiredMaterial": "需要资源正文中的定义或机制说明，核验控制流归属作为判据的适用边界。"
      },
      {
        "outcomeType": "quiz",
        "outcome": "识别最小 Agent 必须显式具备目标、状态、动作、观察与终止出口。",
        "courseFieldBasis": [
          "lesson.quiz[1]"
        ],
        "outlineSectionIds": [
          "minimal-agent-loop",
          "misconceptions-and-interview-probes"
        ],
        "candidateSourceIds": [
          "res-agent-openai-guide",
          "res-agent-berkeley-course",
          "res-agent-hf-course",
          "res-agent-hello-agents"
        ],
        "resourceEvidenceStatus": "gap",
        "requiredMaterial": "需要可访问正文或代码实例逐项建立闭环组件，并区分必要组件与 RAG、长期记忆及多 Agent 等可选能力。"
      },
      {
        "outcomeType": "interview",
        "outcome": "回答 LLM、Workflow 与 Agent 的区别，并处理连续谱、局部授权、自治代价和固定审批路径追问。",
        "courseFieldBasis": [
          "lesson.interview[0]"
        ],
        "outlineSectionIds": [
          "agency-spectrum",
          "autonomy-selection-gates",
          "misconceptions-and-interview-probes"
        ],
        "candidateSourceIds": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide",
          "res-agent-dlai-agentic",
          "res-agent-lilian-weng"
        ],
        "resourceEvidenceStatus": "gap",
        "requiredMaterial": "需要正文支持三类系统的边界、混合控制设计及自治带来的工程权衡；metadata 不能证明这些机制。"
      },
      {
        "outcomeType": "interview",
        "outcome": "判断何时不应使用 Agent，并回答仅一个节点开放时如何设计控制权。",
        "courseFieldBasis": [
          "lesson.interview[1]",
          "lesson.explanations[1]"
        ],
        "outlineSectionIds": [
          "autonomy-selection-gates",
          "three-case-control-selection",
          "misconceptions-and-interview-probes"
        ],
        "candidateSourceIds": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide"
        ],
        "resourceEvidenceStatus": "gap",
        "requiredMaterial": "需要可访问工程资料支持路径稳定性、反馈质量、风险、成本和自治选择之间的关系，并明确适用范围。"
      },
      {
        "outcomeType": "interview",
        "outcome": "说明最小 Agent 的组成、宿主程序职责和非必要组件，并解释缺少 observation 回填时的具体故障。",
        "courseFieldBasis": [
          "lesson.interview[2]",
          "lesson.explanations[1]"
        ],
        "outlineSectionIds": [
          "minimal-agent-loop",
          "misconceptions-and-interview-probes"
        ],
        "candidateSourceIds": [
          "res-agent-openai-guide",
          "res-agent-hf-course",
          "res-agent-hello-agents",
          "res-agent-lilian-weng"
        ],
        "resourceEvidenceStatus": "gap",
        "requiredMaterial": "需要正文或可复现代码展示 observation 如何进入状态更新，以及缺失回填时形成的失败轨迹。"
      },
      {
        "outcomeType": "exercise-step",
        "outcome": "为三个案例标出路径稳定性、环境反馈需求、错误代价与可验证证据。",
        "courseFieldBasis": [
          "lesson.exercise.brief",
          "lesson.exercise.steps[0]"
        ],
        "outlineSectionIds": [
          "three-case-control-selection"
        ],
        "candidateSourceIds": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide"
        ],
        "resourceEvidenceStatus": "gap",
        "requiredMaterial": "需要可访问正文支持选型维度的工程含义；三个案例的最终判断还需要明确其输入、权限和风险约束。"
      },
      {
        "outcomeType": "exercise-step",
        "outcome": "为每个案例写出推荐方案、拒绝另外两种方案的理由，以及完成、阻塞和预算终止条件。",
        "courseFieldBasis": [
          "lesson.exercise.steps[1]",
          "lesson.explanations[0]",
          "lesson.explanations[1]"
        ],
        "outlineSectionIds": [
          "minimal-agent-loop",
          "autonomy-selection-gates",
          "three-case-control-selection"
        ],
        "candidateSourceIds": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide",
          "res-agent-hf-course",
          "res-agent-hello-agents"
        ],
        "resourceEvidenceStatus": "gap",
        "requiredMaterial": "需要正文或代码示例支持拒绝理由和 done、blocked、预算耗尽及 handoff 等终止模式。"
      },
      {
        "outcomeType": "exercise-deliverable",
        "outcome": "产出一张包含三个案例、判断证据和终止设计的选型表。",
        "courseFieldBasis": [
          "lesson.exercise.title",
          "lesson.exercise.brief",
          "lesson.exercise.deliverable"
        ],
        "outlineSectionIds": [
          "three-case-control-selection"
        ],
        "candidateSourceIds": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide"
        ],
        "resourceEvidenceStatus": "gap",
        "requiredMaterial": "需要先补齐两个 exercise step 的正文证据，并为表格中的机制判断绑定已访问材料。"
      },
      {
        "outcomeType": "completion-criterion",
        "outcome": "能用控制权而非产品名称区分三种系统。",
        "courseFieldBasis": [
          "lesson.completionCriteria[0]",
          "lesson.objectives[0]"
        ],
        "outlineSectionIds": [
          "control-flow-prerequisite",
          "agency-spectrum",
          "recap-and-completion-check"
        ],
        "candidateSourceIds": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide"
        ],
        "resourceEvidenceStatus": "gap",
        "requiredMaterial": "需要至少一项可访问定义材料和一项独立交叉核验材料，避免仅凭课程字段发布。"
      },
      {
        "outcomeType": "completion-criterion",
        "outcome": "能为一个最小 Agent 画出包含终止出口的行动闭环。",
        "courseFieldBasis": [
          "lesson.completionCriteria[1]",
          "lesson.objectives[1]"
        ],
        "outlineSectionIds": [
          "minimal-agent-loop",
          "recap-and-completion-check"
        ],
        "candidateSourceIds": [
          "res-agent-openai-guide",
          "res-agent-berkeley-course",
          "res-agent-hf-course",
          "res-agent-hello-agents"
        ],
        "resourceEvidenceStatus": "gap",
        "requiredMaterial": "需要可访问正文或实现示例确认闭环节点、信息流和终止出口，之后才能形成有来源支持的正式教学图示。"
      }
    ],
    "audit": {
      "candidateSourceIds": [
        "res-agent-anthropic-effective",
        "res-agent-openai-guide",
        "res-agent-berkeley-course",
        "res-agent-hf-course",
        "res-agent-ms-course",
        "res-agent-hello-agents",
        "res-agent-dlai-agentic",
        "res-agent-lilian-weng",
        "res-agent-lihongyi",
        "res-agent-datawhale-bili"
      ],
      "registryAccess": "read-only",
      "registryMatchStatus": "十个候选 ID 均在项目资源 metadata 中找到；这不等于已验证资源正文或建立正式 evidence。",
      "brokenReferenceCount": null,
      "brokenReferenceReason": "本任务未生成 formal knowledgeNote.sections.sourceIds；候选 ID 只用于检索规划，因此正式 broken-reference 检查不适用。",
      "tests": {
        "status": "not applicable",
        "reason": "本任务为只读的大纲、metadata-only 来源角色和覆盖矩阵审计，未修改项目数据或渲染代码，因此未运行项目测试。"
      },
      "resourceBodyAccess": "none",
      "externalLinksRead": false,
      "courseFieldProvenanceViolations": [],
      "evidenceRoleCorrections": [
        "十项资源因只有 metadata，全部保留为 extension。",
        "所有角色卡的 coverage 均为空；metadata 描述仅用于候选检索方向。",
        "未从标题、发布者或资源类型推断 authority enum。",
        "未将 lesson 字段、字段路径或内部说明创建为 resource evidence。",
        "未创建或替换任何 resource ID。"
      ],
      "conflictStatus": "unknown",
      "conflictReason": "没有资源正文，无法比较定义、版本、实验条件或相互冲突。",
      "qualityRubric": {
        "scope": "按正式可发布章节标准评估当前受限大纲；未生成完整知识正文。",
        "categories": [
          {
            "name": "目标、测验与面试覆盖",
            "score": 15,
            "maxScore": 25,
            "evidence": "全部 objectives、quiz、interview、exercise steps、deliverable 和 completion criteria 已进入覆盖矩阵，但尚无来源支持的教学正文。"
          },
          {
            "name": "知识结构与跨章衔接",
            "score": 14,
            "maxScore": 20,
            "evidence": "七段大纲遵循先修、直觉、机制、工程、案例、误区和回顾顺序；下一课信息缺失。"
          },
          {
            "name": "来源与不确定性",
            "score": 7,
            "maxScore": 25,
            "evidence": "metadata-only、字幕缺口和未读外链状态均已显式保留，但没有可支持核心主张的资源正文。"
          },
          {
            "name": "教学可读性与例子",
            "score": 6,
            "maxScore": 20,
            "evidence": "已规划三个案例和误区环节，但按要求未生成完整解释、术语定义或 worked example。"
          },
          {
            "name": "版权与数据契约",
            "score": 10,
            "maxScore": 10,
            "evidence": "结果为纯数据；没有 HTML、长引文、虚构来源、正式 evidence map 或 publishable knowledgeNote。"
          }
        ],
        "total": 52,
        "maxTotal": 100,
        "releaseThreshold": 85,
        "releaseGate": "failed",
        "releaseGateReasons": [
          "总分低于 85。",
          "关键 assessed outcomes 只有课程字段和 metadata，没有可访问资源正文。",
          "候选 ID 虽与项目 metadata 匹配，但正文、来源语义和实际支持范围尚未验证。"
        ]
      }
    }
  }
}
```

#### Exclusion audit

该结果明确排除：除输入冻结错误外，它还声称 `registryAccess: read-only` 并报告 registry match，违背预期隔离边界。它不是 final proof，也不参与最终通过判断；保留全文仅用于审计历史。

### FINAL BLIND llm-01

- canonical agent ID：`/root/task2_skill_impl/provenance_final_agent01/blind_llm_final`
- `fork_turns=none`
- tested Skill commit：`b809923`

#### Complete exact prompt received

```text
先读取并使用 `<repo-root>/.agents/skills/build-learning-module-notes/SKILL.md` 及其直接引用；然后完成下述用户任务；最终只输出结果。

这是一个真实内容任务。请只使用下面明确列出的材料，整理一篇约 1200 字、可以尽量替代外链阅读的中文第一课笔记；遇到材料不足时请说明。除上述 Skill 及其直接引用外，你没有文件或工具访问；禁止使用任何其他工具、读取任何其他文件或文档，也禁止联网或打开外部链接。最终只返回笔记正文。

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

#### Complete raw JSON output

```json
{
  "status": "blocked",
  "publicationReady": false,
  "blocker": "当前材料仅包含课程字段和 7 项资源元数据，没有任何可访问的资源正文，也未提供项目资源注册表。因此无法核验来源、确认资源 ID 可解析，或把课程字段当作正式证据。依据发布门槛，不能生成一篇看似可发布、可替代外链阅读的正式笔记。",
  "outline": [
    "建立人工智能、机器学习、深度学习、生成模型与 LLM 的包含关系",
    "说明生成模型和 LLM 在概念地图中的位置",
    "以参数是否更新区分训练与推理",
    "划分模型开发与应用开发的关注点",
    "说明 Agent 开发从现成模型调用和评测开始的工作顺序",
    "纠正“所有 AI 都是聊天机器人”等常见误解",
    "衔接检索、微调、换模与 Agent 工具等后续主题"
  ],
  "draftSections": [
    {
      "id": "draft-concept-map",
      "title": "一、先画概念地图",
      "paragraphs": [
        "人工智能描述的是能力目标：让机器表现出感知、预测、决策或生成能力。机器学习是实现人工智能的一类方法，其核心是从数据中拟合规律；深度学习又是机器学习的一部分，主要采用多层神经网络。",
        "因此，这些词不是可以互换的同义词，而是从目标到实现方法的包含关系。把层级分清，才能避免把全部人工智能缩减成某一种模型或某一种应用。"
      ],
      "courseFieldBasis": [
        "objectives[0]",
        "concepts[0]",
        "concepts[1]",
        "concepts[2]",
        "explanations[0]"
      ]
    },
    {
      "id": "draft-generative-model-and-llm",
      "title": "二、生成模型与 LLM 位于哪一层",
      "paragraphs": [
        "生成模型是一类学习数据分布并产生新内容的模型。大语言模型，即 LLM，则是以语言建模为核心，并具有较大参数规模和数据规模的一类生成模型。",
        "由此可得：LLM 属于生成模型，生成模型并不只有 LLM；同样，人工智能也不只包含生成任务。把 AI 直接等同于聊天机器人，会遗漏感知、预测和决策等其他能力目标。"
      ],
      "courseFieldBasis": [
        "objectives[0]",
        "concepts[3]",
        "explanations[0]"
      ]
    },
    {
      "id": "draft-training-and-inference",
      "title": "三、训练和推理的关键分界",
      "paragraphs": [
        "训练阶段使用数据、损失函数和优化算法更新模型参数。这里最重要的判断标准是参数是否发生改变：只要工作目标是通过优化调整参数，它就属于训练阶段。",
        "推理阶段固定已经得到的参数，根据输入逐 token 计算输出。训练是在形成或调整模型能力，推理是在使用已有参数产生结果；两者不能仅凭是否调用了模型来区分。"
      ],
      "courseFieldBasis": [
        "objectives[1]",
        "concepts[4]",
        "explanations[1]"
      ]
    },
    {
      "id": "draft-development-boundary",
      "title": "四、模型开发与应用开发各自负责什么",
      "paragraphs": [
        "模型开发主要关注数据、模型架构、训练效率和对齐。这些工作直接面向模型本身及其参数形成过程，与训练阶段联系更紧密。",
        "应用开发更关注需求拆解、上下文、工具、验证、延迟和成本。应用开发者需要把模型能力组织成满足具体需求的系统，并判断输出是否可靠、响应是否及时、成本是否可接受。"
      ],
      "courseFieldBasis": [
        "objectives[1]",
        "concepts[5]",
        "explanations[1]"
      ]
    },
    {
      "id": "draft-agent-workflow",
      "title": "五、Agent 开发应从哪里开始",
      "paragraphs": [
        "Agent 开发通常先从可靠调用现成模型开始，而不是立即进入模型训练。开发者先围绕需求组织上下文、工具和验证方式，再观察系统在可靠性、延迟与成本上的表现。",
        "下一步技术选择应由评测证据决定：先定位瓶颈，再判断是否需要检索、微调或更换模型。训练并不是遇到问题后的默认答案；技术手段应对应已经识别的问题。"
      ],
      "courseFieldBasis": [
        "objectives[1]",
        "explanations[1]"
      ]
    },
    {
      "id": "draft-misconceptions-and-recap",
      "title": "六、常见误区与本课回顾",
      "paragraphs": [
        "误区一是把人工智能、机器学习、深度学习和 LLM 当作同义词。正确关系是：人工智能描述能力目标，机器学习是实现方法之一，深度学习属于机器学习，LLM 又属于生成模型的一类。",
        "误区二是把应用问题直接转化为训练任务。更合适的顺序是先使用现成模型完成可验证的应用闭环，以评测定位瓶颈，再选择检索、微调或换模。记忆本课只需抓住两条主线：概念之间看包含关系，开发阶段看参数是否更新以及职责关注点。"
      ],
      "courseFieldBasis": [
        "objectives[0]",
        "objectives[1]",
        "explanations[0]",
        "explanations[1]"
      ]
    }
  ],
  "coverageMatrix": [
    {
      "outcome": "解释 AI、机器学习、深度学习、生成模型与 LLM 的包含关系",
      "courseFieldBasis": [
        "objectives[0]",
        "explanations[0]"
      ],
      "draftCoverage": "covered",
      "resourceEvidenceStatus": "gap",
      "requiredEvidence": "至少取得一项关联资源的可访问正文，并核验其确实支持这些概念定义和包含关系。"
    },
    {
      "outcome": "区分训练和推理",
      "courseFieldBasis": [
        "objectives[1]",
        "explanations[1]"
      ],
      "draftCoverage": "covered",
      "resourceEvidenceStatus": "gap",
      "requiredEvidence": "需要可访问的资源正文支持训练更新参数、推理固定参数并逐 token 计算输出等机制。"
    },
    {
      "outcome": "划分应用开发和模型开发的职责边界",
      "courseFieldBasis": [
        "objectives[1]",
        "concepts[5]",
        "explanations[1]"
      ],
      "draftCoverage": "covered",
      "resourceEvidenceStatus": "gap",
      "requiredEvidence": "需要可访问正文验证两类开发工作的关注点及其边界。"
    },
    {
      "outcome": "根据评测结果选择检索、微调或更换模型",
      "courseFieldBasis": [
        "explanations[1]"
      ],
      "draftCoverage": "covered",
      "resourceEvidenceStatus": "gap",
      "requiredEvidence": "需要资源正文支持这一 Agent 开发决策顺序及各技术手段的适用边界。"
    },
    {
      "outcome": "测验、面试、练习与完成标准",
      "courseFieldBasis": [],
      "draftCoverage": "unavailable",
      "resourceEvidenceStatus": "gap",
      "requiredEvidence": "题目未提供相应课程字段，无法检查这些学习产出是否得到覆盖。"
    }
  ],
  "candidateSourceIds": [
    "res-ms-ai",
    "res-ms-genai",
    "res-hf-llm",
    "res-zomi-bili",
    "res-ms-agents",
    "res-hello-agents",
    "res-openai-agents"
  ],
  "candidateResources": [
    {
      "id": "res-ms-ai",
      "title": "AI for Beginners",
      "source": "Microsoft",
      "type": "GitHub 课程",
      "authorityStatus": "unresolved",
      "role": "extension",
      "verifiedAt": "2026-07-15",
      "limitations": "仅有元数据，未访问课程正文，不能确认其实际覆盖范围或作为本课事实证据。"
    },
    {
      "id": "res-ms-genai",
      "title": "Generative AI for Beginners",
      "source": "Microsoft",
      "type": "GitHub 课程",
      "authorityStatus": "unresolved",
      "role": "extension",
      "verifiedAt": "2026-07-15",
      "limitations": "仅有元数据，未访问课程正文，不能用标题或 value 字段推断具体内容。"
    },
    {
      "id": "res-hf-llm",
      "title": "Hugging Face LLM Course",
      "source": "Hugging Face",
      "type": "官方课程",
      "authorityStatus": "unresolved",
      "role": "extension",
      "verifiedAt": "2026-07-15",
      "limitations": "仅有元数据，尚未验证正文、版本及其对训练和推理机制的具体表述。"
    },
    {
      "id": "res-zomi-bili",
      "title": "大模型整体架构与全流程介绍",
      "source": "ZOMI酱",
      "type": "Bilibili 视频",
      "authorityStatus": "unresolved",
      "role": "extension",
      "verifiedAt": "2026-07-15",
      "limitations": "未提供可访问字幕或文字稿，不能用该视频支撑关键事实。"
    },
    {
      "id": "res-ms-agents",
      "title": "AI Agents for Beginners",
      "source": "Microsoft",
      "type": "GitHub 课程",
      "authorityStatus": "unresolved",
      "role": "extension",
      "verifiedAt": "2026-07-15",
      "limitations": "仅有元数据，不能确认其对工具、Agent 模式或多智能体实践的实际讲解。"
    },
    {
      "id": "res-hello-agents",
      "title": "Hello-Agents：从零开始构建智能体",
      "source": "Datawhale",
      "type": "GitHub 教材",
      "authorityStatus": "unresolved",
      "role": "extension",
      "verifiedAt": "2026-07-15",
      "limitations": "仅有元数据，未核验教材正文和适用版本。"
    },
    {
      "id": "res-openai-agents",
      "title": "OpenAI Agents SDK",
      "source": "OpenAI",
      "type": "GitHub SDK",
      "authorityStatus": "unresolved",
      "role": "extension",
      "verifiedAt": "2026-07-15",
      "limitations": "仅有元数据，未访问代码或文档，不能确认具体接口与当前实现语义。"
    }
  ],
  "brokenReferenceCount": null,
  "tests": {
    "status": "not applicable",
    "reason": "这是受限材料下的隔离只读内容任务，未产生或验证项目数据与渲染变更，项目测试也不在允许访问的材料范围内。"
  },
  "rubric": {
    "scores": {
      "目标、测验与面试覆盖": 18,
      "知识结构与跨章衔接": 15,
      "来源与不确定性": 0,
      "教学可读性与例子": 14,
      "版权与数据契约": 10
    },
    "total": 57,
    "releaseGate": "failed",
    "failureReasons": [
      "没有可访问的核心资源正文，全部关键结论只能追溯到 courseFieldBasis。",
      "没有项目资源注册表，无法解析和验证候选资源 ID。",
      "总分低于 85 分。",
      "测验、面试、练习和完成标准未提供，无法进行完整教学覆盖审计。"
    ],
    "requiredToUnblock": "提供至少一项直接支持核心目标的资源正文、项目资源注册表，以及本课的测验、面试、练习和完成标准；完成来源核验与引用解析后，才能改写为约 1200 字的正式第一课笔记。"
  }
}
```

#### Independent audit

| 检查项 | 结果 | 说明 |
| --- | --- | --- |
| blocked artifact | 通过 | 资源正文与 registry 缺失时正确阻塞，没有生成正式章节。 |
| publishable structures | 通过 | 无正式 `knowledgeNote`、`evidence` map 或 `sourceIds`。 |
| candidate resources | 通过 | 七个输入给定的 genuine ID 均保留为 metadata-only `extension` candidate。 |
| authority | 通过 | 七项全部为 `authorityStatus: unresolved`，没有写入 authority enum。 |
| reference audit | 通过 | `brokenReferenceCount: null`，没有把未执行解析写成零断链。 |
| tests audit | 通过 | `tests.status: not applicable`，并给出隔离只读与无项目变更的准确原因。 |
| rubric/release | 通过 | rubric 总分低于 85，release gate 明确失败。 |
| model-memory boundary | 通过 | 正文性草稿只追溯到 `courseFieldBasis`；未用模型记忆补写 unsupported 机制、API 或资源正文。 |

该运行是 commit `b809923` 的 llm-01 final behavior proof。

### FINAL BLIND agent-01

- canonical agent ID：`/root/task2_skill_impl/provenance_final_agent01/blind_agent01_final_v2`
- `fork_turns=none`
- tested Skill commit：`b809923`

#### Complete exact prompt received

```text
先读取并使用 `<repo-root>/.agents/skills/build-learning-module-notes/SKILL.md` 及其直接引用；然后完成下述用户任务；最终只输出结果。

使用新 Skill，只输出大纲、来源角色和覆盖矩阵，不修改课程文件。

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

#### Complete raw JSON output

```json
{
  "outline": [
    {
      "id": "control-flow-first",
      "title": "先问谁决定下一步：从控制流识别系统类型",
      "teachingFunctions": [
        "先修桥接",
        "直觉模型",
        "准确机制"
      ],
      "dependsOn": [],
      "contentPlan": [
        "以“谁决定下一步”为首要判断问题。",
        "对比普通 LLM 应用、开发者预设路径的 Workflow，以及模型依据目标、状态和新观察选择动作的 Agent。",
        "将三者放在控制权连续谱上，避免仅凭聊天界面、工具调用或产品名称分类。"
      ],
      "courseFieldBasis": [
        "lesson.objectives[0]",
        "lesson.concepts[0]",
        "lesson.concepts[1]",
        "lesson.explanations[0]",
        "lesson.quiz[0]",
        "lesson.interview[0]",
        "lesson.completionCriteria[0]"
      ],
      "resourceEvidenceStatus": "gap"
    },
    {
      "id": "agency-selection-threshold",
      "title": "自治不是默认升级：用路径、反馈与风险设置选型门槛",
      "teachingFunctions": [
        "准确机制",
        "工程意义"
      ],
      "dependsOn": [
        "control-flow-first"
      ],
      "contentPlan": [
        "比较路径稳定性、环境反馈需求、普通代码是否可确定求解、错误代价和可验证证据。",
        "说明自治提高对开放任务的适应性时，也会扩大成本、延迟、权限和不可预测失败面。",
        "当路径稳定、缺少可靠反馈、错误不可接受或不能设置权限与预算时，优先采用确定性代码或 Workflow。",
        "对于大部分固定、局部开放的任务，仅在开放节点授予有限选择权。"
      ],
      "courseFieldBasis": [
        "lesson.objectives[0]",
        "lesson.explanations[0]",
        "lesson.explanations[1]",
        "lesson.interview[0]",
        "lesson.interview[1]",
        "lesson.exercise.steps[0]"
      ],
      "resourceEvidenceStatus": "gap"
    },
    {
      "id": "minimal-agent-loop",
      "title": "最小 Agent：目标、状态、动作、观察与决策循环",
      "teachingFunctions": [
        "准确机制",
        "工程意义"
      ],
      "dependsOn": [
        "control-flow-first",
        "agency-selection-threshold"
      ],
      "contentPlan": [
        "从可操作目标开始，定义保存任务进展的状态。",
        "限定允许执行的动作或工具，并把环境 observation 回填到状态。",
        "让决策循环依据目标、当前状态和新观察选择下一步。",
        "区分模型的决策职责与宿主程序的执行、权限、状态持久化和确定性检查职责。",
        "说明 RAG、长期记忆、框架和多 Agent 不是最小单 Agent 的必要组件。"
      ],
      "courseFieldBasis": [
        "lesson.objectives[1]",
        "lesson.concepts[2]",
        "lesson.concepts[3]",
        "lesson.explanations[1]",
        "lesson.quiz[1]",
        "lesson.interview[2]"
      ],
      "resourceEvidenceStatus": "gap"
    },
    {
      "id": "explicit-termination-exits",
      "title": "行动闭环必须能停：完成、阻塞、预算与移交",
      "teachingFunctions": [
        "准确机制",
        "工程意义"
      ],
      "dependsOn": [
        "minimal-agent-loop"
      ],
      "contentPlan": [
        "把 done、blocked、预算耗尽和 handoff 设计为显式终止出口。",
        "要求完成状态附带可验证证据，而不是只依赖模型自述。",
        "说明缺少 observation 回填会使系统无法依据真实环境结果更新状态。",
        "把终止条件同时用于控制成本、长尾延迟和失控循环。"
      ],
      "courseFieldBasis": [
        "lesson.objectives[1]",
        "lesson.concepts[4]",
        "lesson.explanations[1]",
        "lesson.exercise.steps[1]",
        "lesson.interview[2]",
        "lesson.completionCriteria[1]"
      ],
      "resourceEvidenceStatus": "gap"
    },
    {
      "id": "three-case-control-selection",
      "title": "三个案例的控制方式选型演练",
      "teachingFunctions": [
        "具体例子",
        "工程应用"
      ],
      "dependsOn": [
        "agency-selection-threshold",
        "explicit-termination-exits"
      ],
      "contentPlan": [
        "分别分析固定格式摘要、审批流和开放资料调查。",
        "为每个案例标注路径是否稳定、是否需要环境反馈、错误代价和可验证证据。",
        "选择普通调用、Workflow 或 Agent，并写出拒绝另外两种方案的理由。",
        "为每个案例补充完成、阻塞和预算终止条件。",
        "产出包含三个案例、判断证据和终止设计的选型表。"
      ],
      "courseFieldBasis": [
        "lesson.exercise.title",
        "lesson.exercise.brief",
        "lesson.exercise.steps[0]",
        "lesson.exercise.steps[1]",
        "lesson.exercise.deliverable",
        "lesson.objectives[0]",
        "lesson.objectives[1]"
      ],
      "resourceEvidenceStatus": "gap"
    },
    {
      "id": "misconceptions-and-interview-reasoning",
      "title": "常见误区与面试推理链",
      "teachingFunctions": [
        "常见误区",
        "测验与面试迁移"
      ],
      "dependsOn": [
        "control-flow-first",
        "agency-selection-threshold",
        "minimal-agent-loop",
        "explicit-termination-exits"
      ],
      "contentPlan": [
        "纠正“调用工具或使用聊天界面就是 Agent”的误区。",
        "纠正“Agent 总比 Workflow 先进，应尽可能增加自治”的误区。",
        "纠正“模型、Prompt 和工具已经构成最小 Agent”的误区。",
        "围绕控制流归属、动态决策价值和可验证行动闭环组织三道面试题的短答、深挖与追问。"
      ],
      "courseFieldBasis": [
        "lesson.quiz[0]",
        "lesson.quiz[1]",
        "lesson.interview[0]",
        "lesson.interview[1]",
        "lesson.interview[2]"
      ],
      "resourceEvidenceStatus": "gap"
    },
    {
      "id": "recap-and-next-step",
      "title": "回顾：先选控制权，再设计行动闭环",
      "teachingFunctions": [
        "回顾与下一章"
      ],
      "dependsOn": [
        "three-case-control-selection",
        "misconceptions-and-interview-reasoning"
      ],
      "contentPlan": [
        "用控制权、路径确定性和环境反馈回顾三类系统的区分方法。",
        "用目标、状态、动作、观察、决策循环和终止出口回顾最小 Agent。",
        "以下一课具体内容建立跨章衔接的工作暂缓；当前输入未提供下一课元数据，不能虚构衔接主题。"
      ],
      "courseFieldBasis": [
        "lesson.objectives[0]",
        "lesson.objectives[1]",
        "lesson.completionCriteria[0]",
        "lesson.completionCriteria[1]"
      ],
      "resourceEvidenceStatus": "gap",
      "remainingGap": "缺少下一课元数据，无法建立有依据的明确跨章衔接。"
    }
  ],
  "sourceRoles": [
    {
      "resourceId": "res-agent-anthropic-effective",
      "title": "Building Effective Agents",
      "publisher": "Anthropic",
      "materialType": "官方工程指南",
      "level": "进阶",
      "orientation": "机制总览",
      "role": "extension",
      "authorityStatus": "unresolved",
      "bodyAccessStatus": "unavailable",
      "registryStatus": "not validated",
      "plannedUse": "仅据所给 metadata，候选用于核验 Workflow 与 Agent 的比较及逐步增加自治的工程边界。",
      "limitations": "未访问正文，不能据标题、出版方或 metadata 推断其实际论述，也不能将厂商经验当作跨模型、跨场景的普适结论。",
      "verifiedAt": "2026-07-20"
    },
    {
      "resourceId": "res-agent-openai-guide",
      "title": "A Practical Guide to Building AI Agents",
      "publisher": "OpenAI",
      "materialType": "官方工程指南",
      "level": "入门到进阶",
      "orientation": "机制总览",
      "role": "extension",
      "authorityStatus": "unresolved",
      "bodyAccessStatus": "unavailable",
      "registryStatus": "not validated",
      "plannedUse": "仅据所给 metadata，候选用于核验 Agent 组成、工具与编排实现清单。",
      "limitations": "未访问正文，不能确认具体组成定义或实现建议；相关建议还需结合实际模型、权限和任务数据验证。",
      "verifiedAt": "2026-07-20"
    },
    {
      "resourceId": "res-agent-berkeley-course",
      "title": "Large Language Model Agents MOOC",
      "publisher": "UC Berkeley",
      "materialType": "大学课程",
      "level": "进阶",
      "orientation": "系统课程",
      "role": "extension",
      "authorityStatus": "unresolved",
      "bodyAccessStatus": "unavailable",
      "registryStatus": "not validated",
      "plannedUse": "仅据所给 metadata，候选用于扩展 Agent 推理、规划、工具与应用的后续学习路线。",
      "limitations": "未访问课程正文，不能用于支持本课具体机制或性能主张。",
      "verifiedAt": "2026-07-20"
    },
    {
      "resourceId": "res-agent-hf-course",
      "title": "Hugging Face Agents Course",
      "publisher": "Hugging Face",
      "materialType": "GitHub 官方课程",
      "level": "入门到进阶",
      "orientation": "代码实践",
      "role": "extension",
      "authorityStatus": "unresolved",
      "bodyAccessStatus": "unavailable",
      "registryStatus": "not validated",
      "plannedUse": "仅据所给 metadata，候选用于在理解机制后对照工具调用与框架练习。",
      "limitations": "未访问仓库或课程正文，不能确认其代码、框架语义、版本或对本课结论的支持范围。",
      "verifiedAt": "2026-07-20"
    },
    {
      "resourceId": "res-agent-ms-course",
      "title": "AI Agents for Beginners",
      "publisher": "Microsoft",
      "materialType": "GitHub 官方课程",
      "level": "入门",
      "orientation": "系统课程",
      "role": "extension",
      "authorityStatus": "unresolved",
      "bodyAccessStatus": "unavailable",
      "registryStatus": "not validated",
      "plannedUse": "仅据所给 metadata，候选作为结构化示例与练习入口。",
      "limitations": "未访问课程正文，不能用于证明框架优劣或支持本课具体机制主张。",
      "verifiedAt": "2026-07-20"
    },
    {
      "resourceId": "res-agent-hello-agents",
      "title": "Hello-Agents：从零开始构建智能体",
      "publisher": "Datawhale",
      "materialType": "GitHub 社区课程",
      "level": "入门到进阶",
      "orientation": "中文实践",
      "role": "extension",
      "authorityStatus": "unresolved",
      "bodyAccessStatus": "unavailable",
      "registryStatus": "not validated",
      "plannedUse": "仅据所给 metadata，候选用于后续复现最小 Agent 与工具调用。",
      "limitations": "未访问教材正文或代码，不能确认其实现细节；任何性能结论仍需独立评测。",
      "verifiedAt": "2026-07-20"
    },
    {
      "resourceId": "res-agent-dlai-agentic",
      "title": "Agentic AI",
      "publisher": "DeepLearning.AI",
      "materialType": "官方课程",
      "level": "进阶",
      "orientation": "系统课程",
      "role": "extension",
      "authorityStatus": "unresolved",
      "bodyAccessStatus": "unavailable",
      "registryStatus": "not validated",
      "plannedUse": "仅据所给 metadata，候选用于横向梳理反思、工具和规划等模式。",
      "limitations": "未访问课程正文，不能把课程案例视为业务环境中的验证结果。",
      "verifiedAt": "2026-07-20"
    },
    {
      "resourceId": "res-agent-lilian-weng",
      "title": "LLM Powered Autonomous Agents",
      "publisher": "Lilian Weng",
      "materialType": "技术综述",
      "level": "进阶",
      "orientation": "机制总览",
      "role": "extension",
      "authorityStatus": "unresolved",
      "bodyAccessStatus": "unavailable",
      "registryStatus": "not validated",
      "plannedUse": "仅据所给 metadata，候选用于建立规划、记忆与工具等术语之间的路线图。",
      "limitations": "未访问综述正文及其引用论文，不能确认具体机制描述或实验结论；效果主张需回到原论文条件核对。",
      "verifiedAt": "2026-07-20"
    },
    {
      "resourceId": "res-agent-lihongyi",
      "title": "【生成式AI時代下的機器學習(2025)】第二講：一堂課搞懂 AI Agent 的原理",
      "publisher": "Hung-yi Lee",
      "materialType": "YouTube 课程视频",
      "level": "入门到进阶",
      "orientation": "中文讲解",
      "role": "extension",
      "authorityStatus": "unresolved",
      "bodyAccessStatus": "unavailable",
      "transcriptStatus": "unavailable",
      "registryStatus": "not validated",
      "plannedUse": "仅据所给 metadata，候选用于辅助建立行动循环和工具使用直觉。",
      "limitations": "未取得可访问字幕或等价正文，不能支持关键事实；相关论断仍需原始论文或真实系统实验核验。",
      "verifiedAt": "2026-07-20"
    },
    {
      "resourceId": "res-agent-datawhale-bili",
      "title": "4.3-Agent大模型智能体-原理、实践和应用场景",
      "publisher": "二次元的Datawhale",
      "materialType": "Bilibili 课程视频",
      "level": "入门",
      "orientation": "中文讲解",
      "role": "extension",
      "authorityStatus": "unresolved",
      "bodyAccessStatus": "unavailable",
      "transcriptStatus": "unavailable",
      "registryStatus": "not validated",
      "plannedUse": "仅据所给 metadata，候选用于配合代码复现辅助理解 Agent 的基本组成和实践路径。",
      "limitations": "未取得可访问字幕或等价正文，不能作为机制事实的唯一依据。",
      "verifiedAt": "2026-07-20"
    }
  ],
  "coverageMatrix": {
    "rows": [
      {
        "outcome": "目标 1：用控制权、路径确定性和环境反馈区分 LLM 应用、Workflow 与 Agent。",
        "courseFieldBasis": [
          "lesson.objectives[0]",
          "lesson.explanations[0]"
        ],
        "outlineSections": [
          "control-flow-first",
          "agency-selection-threshold",
          "three-case-control-selection"
        ],
        "candidateRoute": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide"
        ],
        "resourceEvidenceStatus": "gap"
      },
      {
        "outcome": "目标 2：描述最小单 Agent 的目标、状态、动作、观察和终止组件。",
        "courseFieldBasis": [
          "lesson.objectives[1]",
          "lesson.explanations[1]"
        ],
        "outlineSections": [
          "minimal-agent-loop",
          "explicit-termination-exits"
        ],
        "candidateRoute": [
          "res-agent-openai-guide",
          "res-agent-lilian-weng"
        ],
        "resourceEvidenceStatus": "gap"
      },
      {
        "outcome": "概念：Agency 连续谱与 Workflow。",
        "courseFieldBasis": [
          "lesson.concepts[0]",
          "lesson.concepts[1]",
          "lesson.explanations[0]"
        ],
        "outlineSections": [
          "control-flow-first",
          "agency-selection-threshold"
        ],
        "candidateRoute": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide"
        ],
        "resourceEvidenceStatus": "gap"
      },
      {
        "outcome": "概念：动作空间、环境观察与终止条件。",
        "courseFieldBasis": [
          "lesson.concepts[2]",
          "lesson.concepts[3]",
          "lesson.concepts[4]",
          "lesson.explanations[1]"
        ],
        "outlineSections": [
          "minimal-agent-loop",
          "explicit-termination-exits"
        ],
        "candidateRoute": [
          "res-agent-openai-guide",
          "res-agent-lilian-weng"
        ],
        "resourceEvidenceStatus": "gap"
      },
      {
        "outcome": "测验 1：以控制流归属区分 Workflow 与 Agent。",
        "courseFieldBasis": [
          "lesson.quiz[0].question",
          "lesson.quiz[0].options",
          "lesson.quiz[0].explanation"
        ],
        "outlineSections": [
          "control-flow-first",
          "misconceptions-and-interview-reasoning"
        ],
        "candidateRoute": [
          "res-agent-anthropic-effective"
        ],
        "resourceEvidenceStatus": "gap"
      },
      {
        "outcome": "测验 2：识别最小 Agent 必须显式具备的行动闭环组件。",
        "courseFieldBasis": [
          "lesson.quiz[1].question",
          "lesson.quiz[1].options",
          "lesson.quiz[1].explanation"
        ],
        "outlineSections": [
          "minimal-agent-loop",
          "explicit-termination-exits",
          "misconceptions-and-interview-reasoning"
        ],
        "candidateRoute": [
          "res-agent-openai-guide",
          "res-agent-lilian-weng"
        ],
        "resourceEvidenceStatus": "gap"
      },
      {
        "outcome": "面试 1：说明 LLM、Workflow 与 Agent 的区别，并处理局部授权选择权的追问。",
        "courseFieldBasis": [
          "lesson.interview[0]"
        ],
        "outlineSections": [
          "control-flow-first",
          "agency-selection-threshold",
          "misconceptions-and-interview-reasoning"
        ],
        "candidateRoute": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide"
        ],
        "resourceEvidenceStatus": "gap"
      },
      {
        "outcome": "面试 2：判断何时不应使用 Agent，并解释固定流程中单个开放节点的控制权设计。",
        "courseFieldBasis": [
          "lesson.interview[1]"
        ],
        "outlineSections": [
          "agency-selection-threshold",
          "misconceptions-and-interview-reasoning"
        ],
        "candidateRoute": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide"
        ],
        "resourceEvidenceStatus": "gap"
      },
      {
        "outcome": "面试 3：列出最小 Agent 组件，并解释缺少 observation 回填的具体故障。",
        "courseFieldBasis": [
          "lesson.interview[2]"
        ],
        "outlineSections": [
          "minimal-agent-loop",
          "explicit-termination-exits",
          "misconceptions-and-interview-reasoning"
        ],
        "candidateRoute": [
          "res-agent-openai-guide",
          "res-agent-lilian-weng"
        ],
        "resourceEvidenceStatus": "gap"
      },
      {
        "outcome": "练习步骤 1：为三个案例标出路径稳定性、环境反馈、错误代价和可验证证据。",
        "courseFieldBasis": [
          "lesson.exercise.brief",
          "lesson.exercise.steps[0]"
        ],
        "outlineSections": [
          "agency-selection-threshold",
          "three-case-control-selection"
        ],
        "candidateRoute": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide"
        ],
        "resourceEvidenceStatus": "gap"
      },
      {
        "outcome": "练习步骤 2：推荐控制方式、拒绝另外两种方式，并设计完成、阻塞和预算终止条件。",
        "courseFieldBasis": [
          "lesson.exercise.steps[1]"
        ],
        "outlineSections": [
          "explicit-termination-exits",
          "three-case-control-selection"
        ],
        "candidateRoute": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide"
        ],
        "resourceEvidenceStatus": "gap"
      },
      {
        "outcome": "练习交付物：包含三个案例、判断证据和终止设计的选型表。",
        "courseFieldBasis": [
          "lesson.exercise.deliverable"
        ],
        "outlineSections": [
          "three-case-control-selection"
        ],
        "candidateRoute": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide"
        ],
        "resourceEvidenceStatus": "gap"
      },
      {
        "outcome": "完成标准 1：能用控制权而非产品名称区分三种系统。",
        "courseFieldBasis": [
          "lesson.completionCriteria[0]"
        ],
        "outlineSections": [
          "control-flow-first",
          "three-case-control-selection",
          "recap-and-next-step"
        ],
        "candidateRoute": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide"
        ],
        "resourceEvidenceStatus": "gap"
      },
      {
        "outcome": "完成标准 2：能画出包含终止出口的最小 Agent 行动闭环。",
        "courseFieldBasis": [
          "lesson.completionCriteria[1]"
        ],
        "outlineSections": [
          "minimal-agent-loop",
          "explicit-termination-exits",
          "recap-and-next-step"
        ],
        "candidateRoute": [
          "res-agent-openai-guide",
          "res-agent-lilian-weng"
        ],
        "resourceEvidenceStatus": "gap"
      }
    ],
    "audit": {
      "status": "blocked",
      "publicationReady": false,
      "blockers": [
        "只提供了关联资源 metadata，未提供或访问任何可归因的资源正文。",
        "未验证项目资源注册表，候选资源 ID 的可解析性未知。",
        "全部核心和受评学习产出目前只能追溯到 courseFieldBasis，课程字段不能替代资源证据。",
        "未提供下一课元数据，无法完成有依据的明确跨章衔接。"
      ],
      "candidateSourceIds": [
        "res-agent-anthropic-effective",
        "res-agent-openai-guide",
        "res-agent-berkeley-course",
        "res-agent-hf-course",
        "res-agent-ms-course",
        "res-agent-hello-agents",
        "res-agent-dlai-agentic",
        "res-agent-lilian-weng",
        "res-agent-lihongyi",
        "res-agent-datawhale-bili"
      ],
      "brokenReferenceCount": null,
      "tests": {
        "status": "not applicable",
        "reason": "本任务为隔离、只读的大纲、来源角色与覆盖规划，未产生项目数据或渲染变更，且未执行项目资源注册表解析，因此项目测试不适用。"
      },
      "rubric": {
        "categoryScores": {
          "目标、测验与面试覆盖": {
            "score": 25,
            "max": 25,
            "evidence": "两个目标、两道测验、三道面试题、两个练习步骤、交付物和两个完成标准均已映射到大纲。"
          },
          "知识结构与跨章衔接": {
            "score": 17,
            "max": 20,
            "evidence": "大纲按先修、直觉、机制、工程意义、案例、误区和回顾组织；因缺少下一课信息，明确跨章衔接仍是缺口。"
          },
          "来源与不确定性": {
            "score": 4,
            "max": 25,
            "evidence": "所有资源均保持为 metadata-only 候选并显式标为 gap，但没有可访问正文或注册表解析结果，无法支撑正式章节。"
          },
          "教学可读性与例子": {
            "score": 13,
            "max": 20,
            "evidence": "大纲包含三案例演练和三类误区，但本任务不产出完整教学段落，尚不能验证自包含学习体验。"
          },
          "版权与数据契约": {
            "score": 10,
            "max": 10,
            "evidence": "输出为纯数据；未生成 HTML、正式 knowledgeNote、evidence 映射或虚构 sourceIds；课程字段与候选来源分离。"
          }
        },
        "total": 69,
        "max": 100,
        "releaseGate": "failed",
        "releaseGateReasons": [
          "总分低于 85。",
          "项目资源注册表解析未执行。",
          "核心受评产出缺少可访问资源正文证据。"
        ],
        "evidenceRoleCorrections": "全部 metadata-only 资源均降为 extension；未根据出版方、标题或材料类型猜测 authority。",
        "courseFieldProvenanceViolations": [],
        "remainingLimitations": [
          "候选来源的实际覆盖范围、冲突、版本语义和可引用内容均待正文核验。",
          "视频候选缺少可访问字幕或等价正文。",
          "当前结果只能用于后续取证和章节设计，不能作为可发布知识笔记。"
        ]
      }
    }
  }
}
```

#### Independent audit

| 检查项 | 结果 | 说明 |
| --- | --- | --- |
| requested shape | 通过 | 恰好三个顶层请求产物：`outline`、`sourceRoles`、`coverageMatrix`。 |
| metadata-only roles | 通过 | 10/10 来源均为 `extension`，正文不可用；两项视频额外保留 transcript 缺口。 |
| authority | 通过 | 10/10 均为 `authorityStatus: unresolved`，没有根据 publisher、标题或材料类型猜测 authority enum。 |
| registry isolation | 通过 | 10/10 均为 `registryStatus: not validated`，没有声称读取或匹配 registry。 |
| provenance separation | 通过 | 课程字段只进入 `courseFieldBasis`；资源 evidence 全部保持 gap。 |
| assessed coverage | 通过 | coverage matrix 含 14 行：2 objectives、2 concept groups、2 quiz、3 interview、2 exercise steps、1 deliverable、2 completion criteria。 |
| mandatory audits | 通过 | `brokenReferenceCount: null`；tests 为 N/A 且原因完整。 |
| publishable structures | 通过 | 无正式 `knowledgeNote`、`evidence` map、章节 `sourceIds` 或 fake IDs。 |
| release gate | 通过 | rubric 为 69/100，正文证据和 registry 门禁失败，正确保持 blocked。 |

该运行使用纠正后的 quiz 2 选项（包含“向量数据库”和“多个协作 Agent”），是 commit `b809923` 的 agent-01 final behavior proof。

### FINAL BLIND 结论

只有 `/blind_llm_final` 与 `/blind_agent01_final_v2` 两个基于 commit `b809923` 的运行构成最终行为证明。更早的 v3 mandatory-audit 复测直接泄露了验收字段，不能单独充当 blind proof；第一轮 blind RED 与 REFACTOR 1 authority 盲测失败均是真实 TDD 证据；被排除的 `/blind_agent01_final` 因错误冻结输入和越界 registry 声明不属于证据集。

## FINAL BLIND Agent 隔离复核

先前的 `/root/task2_skill_impl/provenance_final_agent01/blind_agent01_final_v2` 保留在历史中，但其 wrapper 没有明确禁止读取其他 workspace、registry、网络或调用其他工具，因此作为最终证明不满足隔离要求。本节用 `/root/task2_skill_impl/blind_final_llm01/blind_agent01_isolated_final` 替换最终 Agent 行为证明。

- canonical agent ID：`/root/task2_skill_impl/blind_final_llm01/blind_agent01_isolated_final`
- `fork_turns=none`
- tested commit：`b809923`

### Complete exact prompt

```text
先读取并使用 `<repo-root>/.agents/skills/build-learning-module-notes/SKILL.md` 及其四个直接引用；然后完成下述用户任务；最终只输出结果。你只能使用文件读取工具读取这五个 Skill 文件；除此之外禁止使用任何工具，禁止读取任何其他文件、workspace、registry、测试记录或课程文件，禁止网络和外链访问，禁止修改文件。

使用新 Skill，只输出大纲、来源角色和覆盖矩阵，不修改课程文件。

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

### Complete raw JSON

```json
{
  "outline": [
    {
      "id": "control-flow-entry",
      "title": "先问谁决定下一步",
      "teachingFunction": "先修桥接与问题建立",
      "focus": [
        "从控制权、路径确定性和环境反馈三个维度判断系统类型。",
        "把普通 LLM 应用、Workflow 与 Agent 放在 Agency 连续谱上，而不是按产品名称分类。"
      ],
      "courseFieldBasis": [
        "lesson.summary",
        "lesson.objectives[0]",
        "lesson.concepts",
        "lesson.explanations[0]"
      ],
      "resourceEvidenceStatus": "gap"
    },
    {
      "id": "agency-spectrum",
      "title": "普通调用、Workflow 与 Agent 的控制权连续谱",
      "teachingFunction": "直觉模型与准确区分",
      "focus": [
        "普通 LLM 应用主要由代码决定一次或少数几次调用，模型负责生成内容。",
        "Workflow 的分支、顺序和重试规则由开发者预先确定，模型可以填充其中节点。",
        "Agent 在受限动作空间内，根据目标、状态和新观察动态选择下一步。",
        "局部节点可以授予模型选择权，因此三类系统不必被理解为非此即彼。"
      ],
      "courseFieldBasis": [
        "lesson.objectives[0]",
        "lesson.explanations[0]",
        "lesson.quiz[0]",
        "lesson.interview[0]"
      ],
      "resourceEvidenceStatus": "gap"
    },
    {
      "id": "minimal-agent-loop",
      "title": "最小单 Agent 的可验证行动闭环",
      "teachingFunction": "准确机制",
      "focus": [
        "闭环由可操作目标、保存进展的状态、受限动作或工具、环境观察和依据观察更新状态的决策循环构成。",
        "done、blocked、预算耗尽和 handoff 等显式出口负责终止循环。",
        "模型是决策组件；执行、权限、状态持久化和确定性检查由宿主程序负责。",
        "缺少 observation 回填时可能出现的具体故障留作面试追问推演。"
      ],
      "courseFieldBasis": [
        "lesson.objectives[1]",
        "lesson.concepts",
        "lesson.explanations[1]",
        "lesson.quiz[1]",
        "lesson.interview[2]",
        "lesson.completionCriteria[1]"
      ],
      "resourceEvidenceStatus": "gap"
    },
    {
      "id": "autonomy-selection-gate",
      "title": "何时不应增加自治",
      "teachingFunction": "工程意义与选型门槛",
      "focus": [
        "只有动态决策确实创造价值时才承担 Agent 的自治成本。",
        "路径稳定、普通代码可确定求解、缺少可靠反馈、错误代价很高，或无法设置权限与终止预算时，优先确定性程序或 Workflow。",
        "自治提高开放任务适应性，也扩大成本、延迟、权限和不可预测失败面。",
        "任务大部分固定而只有一个节点开放时，只在该节点授予有限选择权；高风险最终执行可交还规则、审批或人工。"
      ],
      "courseFieldBasis": [
        "lesson.explanations[0]",
        "lesson.explanations[1]",
        "lesson.interview[1]",
        "lesson.interview[0].followUp"
      ],
      "resourceEvidenceStatus": "gap"
    },
    {
      "id": "three-case-decision-table",
      "title": "三个案例的控制方式选型",
      "teachingFunction": "具体练习与决策应用",
      "focus": [
        "比较固定格式摘要、审批流和开放资料调查。",
        "逐案标记路径稳定性、环境反馈需求、错误代价和可验证证据。",
        "写出推荐方案、拒绝另外两种方案的理由，以及完成、阻塞和预算终止条件。",
        "形成包含三个案例、判断证据和终止设计的选型表。"
      ],
      "courseFieldBasis": [
        "lesson.exercise.title",
        "lesson.exercise.brief",
        "lesson.exercise.steps[0]",
        "lesson.exercise.steps[1]",
        "lesson.exercise.deliverable"
      ],
      "resourceEvidenceStatus": "gap"
    },
    {
      "id": "misconceptions-and-recall",
      "title": "误区校正、面试推演与回顾",
      "teachingFunction": "常见误区与学习检查",
      "focus": [
        "校正“调用工具或使用聊天界面就是 Agent”的误区。",
        "校正“Agent 总比 Workflow 先进”的误区。",
        "校正“模型、Prompt 和工具已经构成最小 Agent”的误区。",
        "用控制流归属、行动闭环和自治选型门槛回答测验与面试问题，并检查能否画出包含终止出口的闭环。"
      ],
      "courseFieldBasis": [
        "lesson.quiz[0]",
        "lesson.quiz[1]",
        "lesson.interview[0].misconception",
        "lesson.interview[1].misconception",
        "lesson.interview[2].misconception",
        "lesson.completionCriteria[0]",
        "lesson.completionCriteria[1]"
      ],
      "resourceEvidenceStatus": "gap"
    },
    {
      "id": "next-lesson-bridge",
      "title": "下一课衔接",
      "teachingFunction": "回顾与跨章连接",
      "focus": [
        "回顾控制权连续谱、最小行动闭环和自治选型门槛。",
        "下一课的具体桥接内容待补充后续 lesson 元数据后确定。"
      ],
      "courseFieldBasis": [
        "lesson.summary",
        "lesson.completionCriteria"
      ],
      "resourceEvidenceStatus": "gap",
      "gap": "未提供下一课标题、目标或概念，不能据此编造具体跨章衔接。"
    }
  ],
  "sourceRoles": [
    {
      "resourceId": "res-agent-anthropic-effective",
      "title": "Building Effective Agents",
      "publisher": "Anthropic",
      "type": "官方工程指南",
      "level": "进阶",
      "format": "机制总览",
      "role": "extension",
      "authorityStatus": "unresolved",
      "metadataRoutingHint": "用于候选核验 Workflow 与 Agent 的比较，以及从简单方案逐步增加自治的工程经验。",
      "limitations": "仅收到元数据，未访问正文、未核验出处和项目注册表；不能证明具体定义或工程结论，也不能把厂商经验视为跨模型、跨场景的普适结论。",
      "verifiedAt": "2026-07-20"
    },
    {
      "resourceId": "res-agent-openai-guide",
      "title": "A Practical Guide to Building AI Agents",
      "publisher": "OpenAI",
      "type": "官方工程指南",
      "level": "入门到进阶",
      "format": "机制总览",
      "role": "extension",
      "authorityStatus": "unresolved",
      "metadataRoutingHint": "用于候选核验 Agent 组成、工具与编排的实现清单。",
      "limitations": "仅收到元数据，未访问正文、未核验出处和项目注册表；不能据此确认具体组件定义，其建议仍需结合模型、权限和任务数据验证。",
      "verifiedAt": "2026-07-20"
    },
    {
      "resourceId": "res-agent-berkeley-course",
      "title": "Large Language Model Agents MOOC",
      "publisher": "UC Berkeley",
      "type": "大学课程",
      "level": "进阶",
      "format": "系统课程",
      "role": "extension",
      "authorityStatus": "unresolved",
      "metadataRoutingHint": "用于候选扩展 Agent 推理、规划、工具与应用的系统学习路线。",
      "limitations": "仅收到元数据，未访问课程正文、未核验出处和项目注册表；不能承担本课具体机制或性能主张的证据。",
      "verifiedAt": "2026-07-20"
    },
    {
      "resourceId": "res-agent-hf-course",
      "title": "Hugging Face Agents Course",
      "publisher": "Hugging Face",
      "type": "GitHub 官方课程",
      "level": "入门到进阶",
      "format": "代码实践",
      "role": "extension",
      "authorityStatus": "unresolved",
      "metadataRoutingHint": "用于候选补充 Agent 概念、工具调用和框架练习之间的实现对照。",
      "limitations": "仅收到元数据，未访问课程或代码正文、未核验出处和项目注册表；不能据此确认实现语义或框架行为。",
      "verifiedAt": "2026-07-20"
    },
    {
      "resourceId": "res-agent-ms-course",
      "title": "AI Agents for Beginners",
      "publisher": "Microsoft",
      "type": "GitHub 官方课程",
      "level": "入门",
      "format": "系统课程",
      "role": "extension",
      "authorityStatus": "unresolved",
      "metadataRoutingHint": "用于候选提供结构化 Agent 模式与工具练习入口。",
      "limitations": "仅收到元数据，未访问课程或代码正文、未核验出处和项目注册表；不能作为框架优劣或普适效果的证据。",
      "verifiedAt": "2026-07-20"
    },
    {
      "resourceId": "res-agent-hello-agents",
      "title": "Hello-Agents：从零开始构建智能体",
      "publisher": "Datawhale",
      "type": "GitHub 社区课程",
      "level": "入门到进阶",
      "format": "中文实践",
      "role": "extension",
      "authorityStatus": "unresolved",
      "metadataRoutingHint": "用于候选补充最小 Agent 与工具调用的中文代码复现路线。",
      "limitations": "仅收到元数据，未访问教材或代码正文、未核验出处和项目注册表；不能据此确认机制细节，性能结论仍需独立评测。",
      "verifiedAt": "2026-07-20"
    },
    {
      "resourceId": "res-agent-dlai-agentic",
      "title": "Agentic AI",
      "publisher": "DeepLearning.AI",
      "type": "官方课程",
      "level": "进阶",
      "format": "系统课程",
      "role": "extension",
      "authorityStatus": "unresolved",
      "metadataRoutingHint": "用于候选横向梳理反思、工具和规划等模式。",
      "limitations": "仅收到元数据，未访问课程正文、未核验出处和项目注册表；课程案例不能替代业务环境验证。",
      "verifiedAt": "2026-07-20"
    },
    {
      "resourceId": "res-agent-lilian-weng",
      "title": "LLM Powered Autonomous Agents",
      "publisher": "Lilian Weng",
      "type": "技术综述",
      "level": "进阶",
      "format": "机制总览",
      "role": "extension",
      "authorityStatus": "unresolved",
      "metadataRoutingHint": "用于候选建立规划、记忆与工具等术语地图。",
      "limitations": "仅收到元数据，未访问正文、未核验出处和项目注册表；不能据此确认综述所引论文的实验条件或具体效果。",
      "verifiedAt": "2026-07-20"
    },
    {
      "resourceId": "res-agent-lihongyi",
      "title": "【生成式AI時代下的機器學習(2025)】第二講：一堂課搞懂 AI Agent 的原理",
      "publisher": "Hung-yi Lee",
      "type": "YouTube 课程视频",
      "level": "入门到进阶",
      "format": "中文讲解",
      "role": "extension",
      "authorityStatus": "unresolved",
      "metadataRoutingHint": "用于候选建立 Agent 行动循环和工具使用的中文直觉。",
      "limitations": "仅收到元数据，未访问视频或字幕、未核验出处和项目注册表；无可访问 transcript，不能支持关键事实，论断还需结合原始论文和真实系统实验核验。",
      "verifiedAt": "2026-07-20"
    },
    {
      "resourceId": "res-agent-datawhale-bili",
      "title": "4.3-Agent大模型智能体-原理、实践和应用场景",
      "publisher": "二次元的Datawhale",
      "type": "Bilibili 课程视频",
      "level": "入门",
      "format": "中文讲解",
      "role": "extension",
      "authorityStatus": "unresolved",
      "metadataRoutingHint": "用于候选辅助理解 Agent 基本组成与实践路径。",
      "limitations": "仅收到元数据，未访问视频或字幕、未核验出处和项目注册表；无可访问 transcript，不能作为机制事实的唯一依据。",
      "verifiedAt": "2026-07-20"
    }
  ],
  "coverageMatrix": {
    "items": [
      {
        "outcome": "用控制权、路径确定性和环境反馈区分 LLM 应用、Workflow 与 Agent。",
        "outcomeType": "objective",
        "courseFieldBasis": [
          "lesson.objectives[0]",
          "lesson.explanations[0]"
        ],
        "outlineIds": [
          "control-flow-entry",
          "agency-spectrum"
        ],
        "candidateSourceIds": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide",
          "res-agent-lilian-weng"
        ],
        "candidateRouteBasis": "仅依据所给元数据中的“机制总览”和用途说明规划核验路线。",
        "resourceEvidenceStatus": "gap"
      },
      {
        "outcome": "描述最小单 Agent 的目标、状态、动作、观察和终止组件。",
        "outcomeType": "objective",
        "courseFieldBasis": [
          "lesson.objectives[1]",
          "lesson.explanations[1]"
        ],
        "outlineIds": [
          "minimal-agent-loop"
        ],
        "candidateSourceIds": [
          "res-agent-openai-guide",
          "res-agent-hello-agents",
          "res-agent-hf-course"
        ],
        "candidateRouteBasis": "仅依据所给元数据中的 Agent 组成和实现练习说明规划核验路线。",
        "resourceEvidenceStatus": "gap"
      },
      {
        "outcome": "覆盖 Agency 连续谱、Workflow、动作空间、环境观察和终止条件。",
        "outcomeType": "concepts",
        "courseFieldBasis": [
          "lesson.concepts",
          "lesson.explanations[0]",
          "lesson.explanations[1]"
        ],
        "outlineIds": [
          "agency-spectrum",
          "minimal-agent-loop",
          "autonomy-selection-gate"
        ],
        "candidateSourceIds": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide",
          "res-agent-lilian-weng"
        ],
        "candidateRouteBasis": "仅依据所给元数据中的机制总览用途规划核验路线。",
        "resourceEvidenceStatus": "gap"
      },
      {
        "outcome": "回答：区分 Workflow 与 Agent 最关键的是下一步主要由预设代码还是模型依据状态决定。",
        "outcomeType": "quiz",
        "courseFieldBasis": [
          "lesson.quiz[0]"
        ],
        "outlineIds": [
          "agency-spectrum",
          "misconceptions-and-recall"
        ],
        "candidateSourceIds": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide"
        ],
        "candidateRouteBasis": "仅依据所给元数据中的 Workflow 与 Agent 比较用途规划核验路线。",
        "resourceEvidenceStatus": "gap"
      },
      {
        "outcome": "回答：最小 Agent 必须显式具备目标、状态、动作、观察与终止出口。",
        "outcomeType": "quiz",
        "courseFieldBasis": [
          "lesson.quiz[1]"
        ],
        "outlineIds": [
          "minimal-agent-loop",
          "misconceptions-and-recall"
        ],
        "candidateSourceIds": [
          "res-agent-openai-guide",
          "res-agent-hello-agents"
        ],
        "candidateRouteBasis": "仅依据所给元数据中的 Agent 组成和最小 Agent 复现用途规划核验路线。",
        "resourceEvidenceStatus": "gap"
      },
      {
        "outcome": "回答 LLM、Agent 与 Workflow 的区别，并处理连续谱、局部授权、误区和固定审批路径追问。",
        "outcomeType": "interview",
        "courseFieldBasis": [
          "lesson.interview[0]"
        ],
        "outlineIds": [
          "agency-spectrum",
          "autonomy-selection-gate",
          "misconceptions-and-recall"
        ],
        "candidateSourceIds": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide",
          "res-agent-lilian-weng"
        ],
        "candidateRouteBasis": "仅依据所给元数据中的机制比较和术语地图用途规划核验路线。",
        "resourceEvidenceStatus": "gap"
      },
      {
        "outcome": "回答何时不应该使用 Agent，并处理成本、风险、高风险动作和局部开放节点追问。",
        "outcomeType": "interview",
        "courseFieldBasis": [
          "lesson.interview[1]"
        ],
        "outlineIds": [
          "autonomy-selection-gate",
          "misconceptions-and-recall"
        ],
        "candidateSourceIds": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide"
        ],
        "candidateRouteBasis": "仅依据所给元数据中的逐步增加自治和工程实现建议规划核验路线。",
        "resourceEvidenceStatus": "gap"
      },
      {
        "outcome": "回答最小 Agent 的组成部分，并处理宿主职责、非必要组件、常见遗漏和缺少 observation 回填的追问。",
        "outcomeType": "interview",
        "courseFieldBasis": [
          "lesson.interview[2]"
        ],
        "outlineIds": [
          "minimal-agent-loop",
          "misconceptions-and-recall"
        ],
        "candidateSourceIds": [
          "res-agent-openai-guide",
          "res-agent-hello-agents",
          "res-agent-hf-course"
        ],
        "candidateRouteBasis": "仅依据所给元数据中的组成、工具调用和代码实践用途规划核验路线。",
        "resourceEvidenceStatus": "gap"
      },
      {
        "outcome": "为三个案例标出路径稳定性、环境反馈需求、错误代价与可验证证据。",
        "outcomeType": "exercise-step",
        "courseFieldBasis": [
          "lesson.exercise.steps[0]"
        ],
        "outlineIds": [
          "three-case-decision-table"
        ],
        "candidateSourceIds": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide"
        ],
        "candidateRouteBasis": "仅依据所给元数据中的系统比较和工程清单用途规划核验路线。",
        "resourceEvidenceStatus": "gap"
      },
      {
        "outcome": "为三个案例写出推荐方案、拒绝其他方案的理由及完成、阻塞和预算终止条件。",
        "outcomeType": "exercise-step",
        "courseFieldBasis": [
          "lesson.exercise.steps[1]"
        ],
        "outlineIds": [
          "three-case-decision-table"
        ],
        "candidateSourceIds": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide",
          "res-agent-hello-agents"
        ],
        "candidateRouteBasis": "仅依据所给元数据中的自治选型、Agent 组成和最小实现用途规划核验路线。",
        "resourceEvidenceStatus": "gap"
      },
      {
        "outcome": "交付一张包含三个案例、判断证据和终止设计的选型表。",
        "outcomeType": "exercise-deliverable",
        "courseFieldBasis": [
          "lesson.exercise.deliverable"
        ],
        "outlineIds": [
          "three-case-decision-table"
        ],
        "candidateSourceIds": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide"
        ],
        "candidateRouteBasis": "候选资料仅用于后续核验选型标准；选型表格式由课程字段直接规定。",
        "resourceEvidenceStatus": "gap"
      },
      {
        "outcome": "能用控制权而非产品名称区分三种系统。",
        "outcomeType": "completion-criterion",
        "courseFieldBasis": [
          "lesson.completionCriteria[0]"
        ],
        "outlineIds": [
          "control-flow-entry",
          "agency-spectrum",
          "misconceptions-and-recall"
        ],
        "candidateSourceIds": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide"
        ],
        "candidateRouteBasis": "仅依据所给元数据中的 Workflow 与 Agent 比较用途规划核验路线。",
        "resourceEvidenceStatus": "gap"
      },
      {
        "outcome": "能为一个最小 Agent 画出包含终止出口的行动闭环。",
        "outcomeType": "completion-criterion",
        "courseFieldBasis": [
          "lesson.completionCriteria[1]"
        ],
        "outlineIds": [
          "minimal-agent-loop",
          "misconceptions-and-recall"
        ],
        "candidateSourceIds": [
          "res-agent-openai-guide",
          "res-agent-hello-agents",
          "res-agent-hf-course"
        ],
        "candidateRouteBasis": "仅依据所给元数据中的 Agent 组成和代码实践用途规划核验路线。",
        "resourceEvidenceStatus": "gap"
      }
    ],
    "audit": {
      "status": "blocked",
      "publicationReady": false,
      "blockers": [
        "未访问任何关联资源正文，因此所有来源只能作为 metadata-only 候选，不能支撑正式章节中的机制主张。",
        "未读取项目资源注册表，无法验证候选 ID 是否可解析，也无法建立正式 evidence 映射。",
        "所有考核产出目前只有 courseFieldBasis 覆盖；课程字段不是资源证据，不能关闭证据缺口。",
        "未提供下一课元数据，无法完成具体跨章衔接。"
      ],
      "releaseGates": [
        {
          "gate": "所有正式 sourceId 同时存在于 lesson evidence set 与项目资源注册表",
          "status": "failed",
          "reason": "本次隔离任务未提供或允许读取 lesson evidence set 与项目资源注册表。"
        },
        {
          "gate": "核心考核产出具有可访问正文证据",
          "status": "failed",
          "reason": "十项资源均只有元数据，正文未访问。"
        },
        {
          "gate": "正式章节质量总分至少 85/100",
          "status": "not applicable",
          "reason": "本次只生成受阻大纲、候选来源角色和覆盖矩阵，不是可发布章节，不能膨胀为正式章节评分。"
        }
      ],
      "rubric": {
        "assessmentScope": "outline-only blocked audit",
        "categories": {
          "目标、测验与面试覆盖": {
            "score": 25,
            "max": 25,
            "evidence": "两个目标、两个测验、三道面试题、两个练习步骤、交付物和两个完成标准均已映射到大纲。"
          },
          "知识结构与跨章衔接": {
            "score": 17,
            "max": 20,
            "evidence": "大纲覆盖先修桥接、直觉区分、准确机制、工程意义、案例、误区和回顾；因缺少下一课元数据，具体跨章桥接未完成。"
          },
          "来源与不确定性": {
            "score": 5,
            "max": 25,
            "evidence": "真实候选 ID、元数据边界和未解析状态已保留，但没有可访问正文或注册表验证，不能建立正式证据卡。"
          },
          "教学可读性与例子": {
            "score": null,
            "max": 20,
            "status": "not applicable",
            "reason": "任务明确限制为大纲，未生成可据此评估段落、术语讲解或完整 worked example 的正式章节。"
          },
          "版权与数据契约": {
            "score": 10,
            "max": 10,
            "evidence": "输出为纯数据；未复制资源正文；课程字段保留为 courseFieldBasis；候选资源未进入正式 evidence 或 sourceIds。"
          }
        },
        "total": null,
        "threshold": 85,
        "result": "failed-release-gates"
      },
      "brokenReferenceCount": null,
      "tests": {
        "status": "not applicable",
        "reason": "本任务为隔离、只读、仅输出大纲、来源角色和覆盖矩阵，且禁止读取项目、注册表、测试记录或课程文件并禁止修改文件，因此未运行项目测试。"
      },
      "coverageGaps": [
        "全部目标、测验、面试、练习和完成标准都缺少可访问资源正文证据。",
        "下一课衔接缺少后续 lesson 元数据。"
      ],
      "evidenceRoleCorrections": [
        "十项资源均保持为 extension；在正文、出处和注册表完成验证前，不提升为 core 或 cross-check。",
        "未根据“官方工程指南”“大学课程”“技术综述”“社区课程”等元数据标签推断 authority 枚举。"
      ],
      "courseFieldProvenanceViolations": [],
      "remainingLimitations": [
        "候选来源与具体 outcome 的对应仅是按所给 metadataRoutingHint 制定的后续核验路线，不表示正文已经支持该 outcome。",
        "未生成正式 knowledgeNote、正式 evidence 映射或任何可发布 sourceIds。"
      ]
    }
  }
}
```

### Factual tool and file access

- 仅调用 `functions.exec`，其内调用 `tools.exec_command` 并使用 `sed -n` 只读下列五个文件。
- `<repo-root>/.agents/skills/build-learning-module-notes/SKILL.md`
- `<repo-root>/.agents/skills/build-learning-module-notes/references/source-policy.md`
- `<repo-root>/.agents/skills/build-learning-module-notes/references/chapter-standard.md`
- `<repo-root>/.agents/skills/build-learning-module-notes/references/data-contract.md`
- `<repo-root>/.agents/skills/build-learning-module-notes/references/quality-rubric.md`
- 未调用其他工具，未读取其他文件，未访问网络，未写入文件。

### Independent audit

该输出恰好包含三个顶层 artifact：`outline`、`sourceRoles`、`coverageMatrix`。`sourceRoles` 共 10 项，全部为 `role: extension` 且 `authorityStatus: unresolved`；运行没有读取或验证 registry。课程字段仅通过 `courseFieldBasis` 支撑覆盖和大纲，资源正文证据统一保持 `gap`，两者没有混为一谈。

覆盖矩阵含 13 个 assessed rows：2 个 objectives、1 个 concepts、2 个 quiz、3 个 interview、2 个 exercise steps、1 个 exercise deliverable、2 个 completion criteria。审计状态为 `blocked`、`publicationReady: false`，两个发布门禁失败；`brokenReferenceCount` 为 `null`，`tests.status` 为 `not applicable`，并给出了隔离只读且未产生项目变更的明确原因。输出没有正式 `knowledgeNote`、正式 `evidence` map、任何正式 `sourceIds` 或 fake IDs。

### After-the-fact prompt leakage audit

wrapper 中关于只读五个 Skill 文件、禁止其他 workspace、registry、网络、工具和写入的限制，是隔离实验约束，不是期望答案提示。用户任务句“使用新 Skill，只输出大纲、来源角色和覆盖矩阵，不修改课程文件。”保持原样。

除冻结课程数据自身合法出现的 `done`、`blocked` 终止状态外，wrapper 和用户任务没有出现预期的 blocked artifact、`sourceId`、`brokenReferenceCount`、`tests`、authority 或 rubric 等验收词，也没有提示预期 release-gate 结论。因此该运行没有通过 wrapper 泄露预期输出字段或审计判定。

## FINAL REGRESSION：先取证再门禁与统一测试审计

真实 review finding 是旧 workflow 在读取 target/source、选择工具并尝试授权访问之前就执行证据门禁；旧 blocked contract 又把测试审计强制为 N/A。commit `2112390` 修正了顺序：先读取 lesson 与关联 resources，按资源类型选择工具，尝试所有已授权的正文与 registry 访问并建立 evidence cards；只有这些取证动作完成后，才在 publishable drafting 之前执行门禁。无法访问也必须记录真实 access attempt，不能把“尚未尝试”写成证据缺失结论。

测试审计与发布是否 blocked 相互独立。统一枚举为 `passed | failed | not applicable`：`passed` 和 `failed` 都必须记录实际 commands 与 results；`not applicable` 必须记录原因与隔离范围。blocked 项目产物可以测试通过，也可以测试失败；contract 不再强制 N/A。

### Static contract examples

```json
{
  "status": "blocked",
  "publicationReady": false,
  "tests": {
    "status": "passed",
    "commands": ["npm test -- learning-notes"],
    "results": [{
      "command": "npm test -- learning-notes",
      "exitCode": 0,
      "summary": "1 suite passed; 12 tests passed"
    }]
  }
}
```

```json
{
  "status": "blocked",
  "publicationReady": false,
  "tests": {
    "status": "failed",
    "commands": ["npm test -- learning-notes"],
    "results": [{
      "command": "npm test -- learning-notes",
      "exitCode": 1,
      "summary": "1 suite failed; 1 assertion failed"
    }]
  }
}
```

静态契约审计：以上两个 fence 都是纯 JSON 且可由 `JSON.parse` 解析；blocked publication 与 test status 正交，contract 接受 `passed` 和 `failed`，不强制 `not applicable`。

### FINAL BLIND rerun：llm-01 post-access-order

- commit: `2112390`
- canonical ID: `/root/task2_skill_impl/blind_final_llm01/blind_llm_post_access_order`
- fork_turns: `none`

#### Clean prompt（仅将绝对仓库路径规范化为 `<repo-root>`）

```text
先读取并使用 `<repo-root>/.agents/skills/build-learning-module-notes/SKILL.md` 及其直接引用；然后完成下述用户任务；最终只输出结果。

这是一个真实内容任务。请只使用下面明确列出的材料，整理一篇约 1200 字、可以尽量替代外链阅读的中文第一课笔记；遇到材料不足时请说明。除上述 Skill 及其直接引用外，你没有文件或工具访问；禁止使用任何其他工具、读取任何其他文件或文档，也禁止联网或打开外部链接。最终只返回笔记正文。

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

#### Complete FIRST raw JSON（verbatim）

```json
{
  "status": "blocked",
  "publicationReady": false,
  "blockers": [
    "七项关联资源仅提供了元数据，正文、课程内容或视频转录均未提供；任务同时禁止访问外链，因此没有可用于支撑正式笔记的核心资源正文。",
    "项目资源注册表未提供且不允许读取，无法验证候选资源 ID 是否可解析。",
    "现有材料只明确支持“人工智能包含机器学习、机器学习包含深度学习、LLM 属于生成模型”；生成模型与前三类概念之间的完整集合边界没有说明，不能擅自补成单一包含链。",
    "未提供测验、面试题、练习和完成标准，无法验证笔记是否覆盖全部考核产出。"
  ],
  "outline": [
    "先区分能力目标与实现方法",
    "建立已知的概念包含关系",
    "理解训练与推理的参数边界",
    "划分模型开发与应用开发职责",
    "用 Agent 开发流程落实技术选择",
    "纠正常见误区并衔接后续学习"
  ],
  "draftSections": [
    {
      "id": "capability-and-method",
      "title": "一、先分清能力目标与实现方法",
      "paragraphs": [
        "学习这组概念时，第一步不是记住五个名词，而是区分“想让机器具备什么能力”和“用什么方法实现”。人工智能描述的是能力目标：让机器表现出感知、预测、决策或生成能力。它是一个较大的范围，不能简单等同于某一种模型或产品。",
        "机器学习是实现人工智能的一类方法，其特点是从数据中拟合规律。深度学习又属于机器学习，主要采用多层神经网络。因此，现有材料明确支持的第一条包含关系是：人工智能包含机器学习，机器学习包含深度学习。"
      ],
      "keyPoints": [
        "人工智能描述能力目标",
        "机器学习是从数据中拟合规律的方法",
        "深度学习是机器学习的一类"
      ],
      "courseFieldBasis": [
        "objectives[0]",
        "concepts[0]",
        "concepts[1]",
        "concepts[2]",
        "explanations[0]"
      ]
    },
    {
      "id": "generative-model-and-llm",
      "title": "二、生成模型与 LLM 位于哪里",
      "paragraphs": [
        "生成模型关注产生新内容。给定材料将其机制概括为学习数据分布并据此生成内容。大语言模型，即 LLM，是生成模型中的一类：它以语言建模为核心，并具有较大的参数规模和数据规模。",
        "因此可以确定“生成模型包含 LLM”，却不能据现有材料断言所有生成模型都必然属于深度学习，或把人工智能、机器学习、深度学习、生成模型和 LLM 画成一条没有例外的直线。可靠的概念图应保留两条已证实的关系：人工智能→机器学习→深度学习，以及生成模型→LLM；两条链之间更完整的集合边界仍待资源正文核验。",
        "这一区分的工程意义是避免把所有人工智能都理解为聊天机器人。聊天式 LLM 只是人工智能范围内的一种具体能力实现，不能代表感知、预测和决策等全部目标。"
      ],
      "keyPoints": [
        "生成模型学习数据分布并产生新内容",
        "LLM 是以语言建模为核心的一类生成模型",
        "LLM 不代表全部人工智能"
      ],
      "courseFieldBasis": [
        "objectives[0]",
        "concepts[3]",
        "explanations[0]"
      ]
    },
    {
      "id": "training-and-inference",
      "title": "三、训练与推理的分界是参数是否改变",
      "paragraphs": [
        "训练阶段通过数据、损失函数和优化算法更新模型参数。判断一项工作是否属于训练，关键不是它是否使用了大量数据，而是过程是否在改变参数。",
        "推理阶段固定已经得到的参数，根据输入逐 token 计算输出。由此可形成一个简洁判断：训练负责改变参数，推理负责使用参数。两者都围绕模型运行，但目标和操作边界不同。",
        "这条边界还能防止把每次模型回答都误认为模型在现场学习。按给定材料，推理时参数保持固定；若要声称某个具体系统会在交互后更新参数，则需要额外的实现证据。"
      ],
      "keyPoints": [
        "训练会更新参数",
        "推理固定并使用参数",
        "是否改变参数是核心判断标准"
      ],
      "courseFieldBasis": [
        "objectives[1]",
        "concepts[4]",
        "explanations[1]"
      ]
    },
    {
      "id": "development-boundary",
      "title": "四、模型开发与应用开发关注不同问题",
      "paragraphs": [
        "模型开发主要关注数据、模型架构、训练效率和对齐。这些工作直接关系到模型怎样获得能力，以及训练过程怎样进行。",
        "应用开发更关注需求拆解、上下文、工具、验证、延迟和成本。它通常使用现成模型，把模型能力组织成满足具体需求的系统。职责边界并不意味着双方互不相关，而是说明问题首先应由哪一层负责定位。",
        "遇到效果问题时，不应立即把原因归结为模型能力不足。课程材料给出的原则是先用评测定位瓶颈，再决定采用何种技术手段。"
      ],
      "keyPoints": [
        "模型开发关注模型能力的形成",
        "应用开发关注能力的组织与交付",
        "技术选择应建立在评测证据上"
      ],
      "courseFieldBasis": [
        "objectives[1]",
        "concepts[5]",
        "explanations[1]"
      ]
    },
    {
      "id": "agent-development-path",
      "title": "五、Agent 开发从可靠调用现成模型开始",
      "paragraphs": [
        "在 Agent 开发中，起点通常是可靠地调用现成模型，而不是立即训练新模型。应用开发者先围绕需求、上下文、工具、验证、延迟和成本建立可运行方案，再观察实际瓶颈。",
        "随后根据评测证据决定是否需要检索、微调或更换模型。这一顺序把技术手段和问题证据连接起来：检索、微调与换模型都不是默认答案，而是定位瓶颈之后的候选选择。",
        "一个可执行的思考流程是：先确认目标，再构造可靠调用；然后进行验证并观察延迟与成本；最后依据证据选择后续手段。材料没有给出各手段的适用条件和操作步骤，因此这些内容仍待后续资源正文补充。"
      ],
      "keyPoints": [
        "Agent 开发先从可靠调用现成模型开始",
        "先评测定位，再选择检索、微调或换模型",
        "材料未提供三种手段的详细选择条件"
      ],
      "courseFieldBasis": [
        "objectives[1]",
        "explanations[1]"
      ]
    },
    {
      "id": "misconceptions-and-recap",
      "title": "六、用四个判断纠正常见误区",
      "paragraphs": [
        "误区一是把人工智能、机器学习和深度学习当成同义词。纠正方法是回到层级：人工智能是能力目标，机器学习是其中从数据拟合规律的方法，深度学习又是机器学习的一类。",
        "误区二是把所有人工智能等同于 LLM 或聊天机器人。LLM 只是生成模型的一类，不能覆盖人工智能的全部目标。误区三是把推理当成训练；应检查参数是否更新。误区四是效果不佳就立即训练或换模型；正确顺序是先评测定位瓶颈，再选择检索、微调或更换模型。",
        "完成本课后，应能说清两组已知的包含关系、训练和推理的参数边界，以及模型开发和应用开发各自关注的问题。下一步可以继续学习提示、检索、工具与 Agent 模式，但其具体机制需要对应资源正文支持。"
      ],
      "keyPoints": [
        "概念之间是包含关系而非同义词",
        "训练改变参数，推理使用参数",
        "应用方案应由评测证据驱动"
      ],
      "courseFieldBasis": [
        "objectives[0]",
        "objectives[1]",
        "explanations[0]",
        "explanations[1]"
      ]
    }
  ],
  "coverageMatrix": [
    {
      "outcome": "解释人工智能、机器学习与深度学习的包含关系",
      "courseFieldBasis": [
        "objectives[0]",
        "explanations[0]"
      ],
      "resourceEvidenceStatus": "gap"
    },
    {
      "outcome": "说明生成模型与 LLM 的关系，并避免把 LLM 等同于全部 AI",
      "courseFieldBasis": [
        "objectives[0]",
        "explanations[0]"
      ],
      "resourceEvidenceStatus": "gap"
    },
    {
      "outcome": "解释生成模型与人工智能、机器学习、深度学习之间的完整集合边界",
      "courseFieldBasis": [
        "objectives[0]"
      ],
      "resourceEvidenceStatus": "gap：给定解释没有建立完整边界"
    },
    {
      "outcome": "区分训练与推理",
      "courseFieldBasis": [
        "objectives[1]",
        "explanations[1]"
      ],
      "resourceEvidenceStatus": "gap"
    },
    {
      "outcome": "区分模型开发与应用开发的职责",
      "courseFieldBasis": [
        "objectives[1]",
        "explanations[1]"
      ],
      "resourceEvidenceStatus": "gap"
    },
    {
      "outcome": "依据评测结果选择检索、微调或更换模型",
      "courseFieldBasis": [
        "explanations[1]"
      ],
      "resourceEvidenceStatus": "gap：仅有原则，没有选择条件或操作证据"
    },
    {
      "outcome": "覆盖测验、面试题、练习和完成标准",
      "courseFieldBasis": [],
      "resourceEvidenceStatus": "gap：这些课程字段未提供"
    }
  ],
  "candidateSources": [
    {
      "id": "res-ms-ai",
      "title": "AI for Beginners",
      "source": "Microsoft",
      "type": "GitHub 课程",
      "role": "extension",
      "authorityStatus": "unresolved",
      "limitation": "仅有元数据，未访问资源正文"
    },
    {
      "id": "res-ms-genai",
      "title": "Generative AI for Beginners",
      "source": "Microsoft",
      "type": "GitHub 课程",
      "role": "extension",
      "authorityStatus": "unresolved",
      "limitation": "仅有元数据，未访问资源正文"
    },
    {
      "id": "res-hf-llm",
      "title": "Hugging Face LLM Course",
      "source": "Hugging Face",
      "type": "官方课程",
      "role": "extension",
      "authorityStatus": "unresolved",
      "limitation": "仅有元数据，未访问资源正文"
    },
    {
      "id": "res-zomi-bili",
      "title": "大模型整体架构与全流程介绍",
      "source": "ZOMI酱",
      "type": "Bilibili 视频",
      "role": "extension",
      "authorityStatus": "unresolved",
      "limitation": "未提供视频正文或转录"
    },
    {
      "id": "res-ms-agents",
      "title": "AI Agents for Beginners",
      "source": "Microsoft",
      "type": "GitHub 课程",
      "role": "extension",
      "authorityStatus": "unresolved",
      "limitation": "仅有元数据，未访问资源正文"
    },
    {
      "id": "res-hello-agents",
      "title": "Hello-Agents：从零开始构建智能体",
      "source": "Datawhale",
      "type": "GitHub 教材",
      "role": "extension",
      "authorityStatus": "unresolved",
      "limitation": "仅有元数据，未访问资源正文"
    },
    {
      "id": "res-openai-agents",
      "title": "OpenAI Agents SDK",
      "source": "OpenAI",
      "type": "GitHub SDK",
      "role": "extension",
      "authorityStatus": "unresolved",
      "limitation": "仅有元数据，未访问资源正文"
    }
  ],
  "candidateSourceIds": [
    "res-ms-ai",
    "res-ms-genai",
    "res-hf-llm",
    "res-zomi-bili",
    "res-ms-agents",
    "res-hello-agents",
    "res-openai-agents"
  ],
  "brokenReferenceCount": null,
  "tests": {
    "status": "not applicable",
    "reason": "本任务为隔离、只读的草稿整理，未读取或修改项目数据，且未提供可验证的项目注册表。"
  },
  "releaseAudit": {
    "scores": {
      "目标、测验与面试覆盖": 16,
      "知识结构与跨章衔接": 18,
      "来源与不确定性": 3,
      "教学可读性与例子": 16,
      "版权与数据契约": 10
    },
    "total": 63,
    "releaseGate": "failed",
    "reasons": [
      "总分低于 85",
      "没有可访问的核心资源正文",
      "候选资源 ID 未经项目注册表验证",
      "至少一个核心概念边界只有课程目标而没有充分解释或资源证据"
    ],
    "remainingLimitations": [
      "当前内容只能作为基于课程字段的非发布草稿",
      "获取至少一项核心资源正文并完成注册表解析后，才能生成正式笔记及 evidence/sourceIds"
    ]
  }
}
```

#### Factual access list

- 实际工具调用仅为 `functions.exec` → `tools.exec_command`，用于只读 `cat`。
- 实际读取：
  - `<repo-root>/.agents/skills/build-learning-module-notes/SKILL.md`
  - `<repo-root>/.agents/skills/build-learning-module-notes/references/source-policy.md`
  - `<repo-root>/.agents/skills/build-learning-module-notes/references/chapter-standard.md`
  - `<repo-root>/.agents/skills/build-learning-module-notes/references/data-contract.md`
  - `<repo-root>/.agents/skills/build-learning-module-notes/references/quality-rubric.md`
- 第一次内容运行没有任何其他文件读取、网络访问或文件写入。

## BEHAVIOR REGRESSION：可读取证据与 blocked 项目测试保真

可复现 fixtures 由 commit `2147cb9` 引入：

- `docs/superpowers/skill-tests/fixtures/readable-source.md`：非空的确定性工具循环官方指南正文。
- `docs/superpowers/skill-tests/fixtures/readable-registry.json`：包含 `res-fixture-loop` 的最小项目资源注册表。
- `docs/superpowers/skill-tests/fixtures/project-test-runs.json`：一个通过与一个失败的实际项目测试执行记录，保留 command、exitCode 与 summary。

#### Independent audit

- 在进入 blocked 路径前，先按 Skill 及四个直接引用完成规则读取，并检查任务授予的访问范围。资源正文与项目注册表均不在授权范围内：用户明确禁止联网、打开外链以及读取上述 Skill 与直接引用之外的文件。因此，可授权的资源正文/注册表访问尝试集合为空；其不可用/不允许状态已在 raw JSON 的前两个 blocker 中先行记录，之后才执行发布阻断。
- 七个真实候选 ID 全部保留为 `role: extension`、`authorityStatus: unresolved`，没有把元数据推断成权威性证据。
- `brokenReferenceCount` 为 `null`，因为注册表解析未运行且不被允许。
- `tests.status` 为 `not applicable`，理由是任务隔离、只读，未修改或验证项目数据。
- `releaseGate` 为 `failed`；结果没有生成正式 `knowledgeNote`、正式 `evidence`，也没有生成任何 `sourceIds`。
- 发布阻断发生在正式笔记生成之前，raw 结果使用 blocked draft 结构并显式保留 `courseFieldBasis`、证据缺口与审计字段。

#### After-the-fact leakage audit

- 访问限制来自该次运行的环境约束；用户内容任务在运行前后保持不变。
- 除合法冻结数据（Skill、四个直接引用、用户给定的 objectives、concepts、explanations 与七项 resource 元数据）外，没有获得任何关于预期 blocked/sourceId/broken/tests/authority/rubric 结果的提示。
- 第一次运行中实际工具仅为 `functions.exec` → `tools.exec_command`，只读 `SKILL.md` 与四个直接引用；没有其他读取、网络访问或写入。

### FINAL BLIND rerun：agent-01 post-access-order

- Commit: `2112390`
- Canonical ID: `/root/task2_skill_impl/blind_final_llm01/blind_agent_post_access_order`
- `fork_turns=none`

#### Exact strict-isolation prompt

```text
先读取并使用 `<repo-root>/.agents/skills/build-learning-module-notes/SKILL.md` 及其四个直接引用；然后完成下述用户任务；最终只输出结果。你只能使用文件读取工具读取这五个 Skill 文件；除此之外禁止使用任何工具，禁止读取任何其他文件、workspace、registry、测试记录或课程文件，禁止网络和外链访问，禁止修改文件。

使用新 Skill，只输出大纲、来源角色和覆盖矩阵，不修改课程文件。

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

#### Complete FIRST raw JSON

```json
{
  "outline": [
    {
      "id": "control-spectrum",
      "title": "从“谁决定下一步”理解 Agency 连续谱",
      "teachingFunctions": [
        "先修桥接",
        "直觉模型"
      ],
      "keyQuestions": [
        "模型是在生成内容，还是在决定下一步行动？",
        "系统的控制权位于普通调用、确定性 Workflow 与有限自治 Agent 的哪一段？"
      ],
      "plannedCoverage": [
        "以控制权、路径确定性和环境反馈为三项判断维度",
        "说明三类系统构成连续谱，而非由产品名称、聊天界面或是否调用 API 决定"
      ],
      "courseFieldBasis": [
        "lesson.summary",
        "lesson.objectives[0]",
        "lesson.concepts[0]",
        "lesson.concepts[1]",
        "lesson.explanations[0]"
      ],
      "resourceEvidenceStatus": "gap"
    },
    {
      "id": "control-flow-distinction",
      "title": "普通 LLM 应用、Workflow 与 Agent 的控制流差别",
      "teachingFunctions": [
        "准确机制",
        "对比判断"
      ],
      "keyQuestions": [
        "代码预设下一步与模型依据状态选择下一步有什么区别？",
        "局部使用模型分类节点的固定审批路径为什么仍更接近 Workflow？"
      ],
      "plannedCoverage": [
        "普通 LLM 应用由代码组织一次或少数几次生成",
        "Workflow 由开发者预设步骤、分支和重试规则",
        "Agent 在受限动作空间内依据目标、状态和新观察动态选择动作",
        "解释混合系统可只在局部节点授予模型选择权"
      ],
      "courseFieldBasis": [
        "lesson.objectives[0]",
        "lesson.explanations[0]",
        "lesson.quiz[0]",
        "lesson.interview[0]",
        "lesson.completionCriteria[0]"
      ],
      "resourceEvidenceStatus": "gap"
    },
    {
      "id": "minimal-agent-loop",
      "title": "最小单 Agent 的可验证行动闭环",
      "teachingFunctions": [
        "准确机制",
        "工程意义"
      ],
      "keyQuestions": [
        "一个系统具备哪些组件后才形成 Agent 行动闭环？",
        "系统如何根据环境 observation 更新状态并安全停止？"
      ],
      "plannedCoverage": [
        "目标、工作状态、受限动作或工具、环境观察、决策循环",
        "done、blocked、预算耗尽和 handoff 等显式终止出口",
        "区分模型的决策职责与宿主程序的执行、权限、持久化和确定性检查职责",
        "分析缺少 observation 回填时无法根据动作结果纠偏的故障"
      ],
      "courseFieldBasis": [
        "lesson.objectives[1]",
        "lesson.concepts[2]",
        "lesson.concepts[3]",
        "lesson.concepts[4]",
        "lesson.explanations[1]",
        "lesson.quiz[1]",
        "lesson.interview[2]",
        "lesson.completionCriteria[1]"
      ],
      "resourceEvidenceStatus": "gap"
    },
    {
      "id": "autonomy-selection-gate",
      "title": "何时不应增加自治",
      "teachingFunctions": [
        "工程意义",
        "边界判断"
      ],
      "keyQuestions": [
        "动态决策创造的价值是否超过自治带来的风险与成本？",
        "哪些条件应使方案退回确定性代码、Workflow 或人工审批？"
      ],
      "plannedCoverage": [
        "路径稳定、普通代码可确定求解、缺少可靠反馈、错误代价高时优先低自治方案",
        "比较自治增加后的成本、延迟、权限和不可预测失败面",
        "说明高风险场景可让 Agent 收集信息，但将最终执行交给规则、审批或人工",
        "处理“大部分固定、只有一个开放节点”的局部授权设计"
      ],
      "courseFieldBasis": [
        "lesson.explanations[0]",
        "lesson.explanations[1]",
        "lesson.interview[1]"
      ],
      "resourceEvidenceStatus": "gap"
    },
    {
      "id": "three-case-selection-exercise",
      "title": "用三个案例完成控制方式选型",
      "teachingFunctions": [
        "具体例子",
        "练习支架"
      ],
      "keyQuestions": [
        "固定格式摘要、审批流和开放资料调查分别需要多大控制权？",
        "推荐一种方案时，应凭什么拒绝另外两种？"
      ],
      "plannedCoverage": [
        "逐案记录路径稳定性、环境反馈需求、错误代价和可验证证据",
        "为每案选择普通调用、Workflow 或 Agent",
        "为被拒方案写出与判断维度对应的理由",
        "为每案设计完成、阻塞和预算终止条件",
        "形成包含案例、判断证据和终止设计的选型表"
      ],
      "courseFieldBasis": [
        "lesson.exercise.title",
        "lesson.exercise.brief",
        "lesson.exercise.steps[0]",
        "lesson.exercise.steps[1]",
        "lesson.exercise.deliverable"
      ],
      "resourceEvidenceStatus": "gap"
    },
    {
      "id": "misconceptions-recap-next",
      "title": "纠正常见误区并固化判断顺序",
      "teachingFunctions": [
        "常见误区",
        "回顾与下一章"
      ],
      "keyQuestions": [
        "为什么调用工具或使用聊天界面不等于 Agent？",
        "为什么 RAG、多 Agent、长期记忆和框架都不是最小 Agent 的必需条件？"
      ],
      "plannedCoverage": [
        "纠正“只要调用工具就是 Agent”",
        "纠正“Agent 总比 Workflow 先进”",
        "纠正“模型、Prompt 和工具已构成最小 Agent”",
        "回顾判断顺序：控制流归属、反馈需求、动作边界、状态更新、终止条件",
        "下一步衔接受限工具、权限、状态持久化和可观测实现"
      ],
      "courseFieldBasis": [
        "lesson.explanations[0]",
        "lesson.explanations[1]",
        "lesson.interview[0].misconception",
        "lesson.interview[1].misconception",
        "lesson.interview[2].misconception",
        "lesson.completionCriteria"
      ],
      "resourceEvidenceStatus": "gap"
    }
  ],
  "sourceRoles": [
    {
      "candidateSourceId": "res-agent-anthropic-effective",
      "title": "Building Effective Agents",
      "publisher": "Anthropic",
      "type": "官方工程指南",
      "level": "进阶",
      "suppliedFunction": "机制总览",
      "role": "extension",
      "authorityStatus": "unresolved",
      "metadataVerifiedAt": "2026-07-20",
      "plannedUseFromSuppliedMetadata": "候选用于比较 Workflow 与 Agent，并讨论从简单方案逐步增加自治。",
      "limitations": "仅提供关联 metadata；正文和项目 registry 均未获准访问，不能确认出处分类、具体定义、论证范围或将其用于核心教学主张。"
    },
    {
      "candidateSourceId": "res-agent-openai-guide",
      "title": "A Practical Guide to Building AI Agents",
      "publisher": "OpenAI",
      "type": "官方工程指南",
      "level": "入门到进阶",
      "suppliedFunction": "机制总览",
      "role": "extension",
      "authorityStatus": "unresolved",
      "metadataVerifiedAt": "2026-07-20",
      "plannedUseFromSuppliedMetadata": "候选用于核对 Agent 组成、工具和编排实现清单。",
      "limitations": "仅提供关联 metadata；正文和项目 registry 均未获准访问，不能确认出处分类、正文语义、版本边界或建议的适用条件。"
    },
    {
      "candidateSourceId": "res-agent-berkeley-course",
      "title": "Large Language Model Agents MOOC",
      "publisher": "UC Berkeley",
      "type": "大学课程",
      "level": "进阶",
      "suppliedFunction": "系统课程",
      "role": "extension",
      "authorityStatus": "unresolved",
      "metadataVerifiedAt": "2026-07-20",
      "plannedUseFromSuppliedMetadata": "候选作为推理、规划、工具与应用的扩展学习路线。",
      "limitations": "仅提供关联 metadata；课程正文和项目 registry 均未获准访问，不能确认实际覆盖范围，也不能承担本课核心机制证据。"
    },
    {
      "candidateSourceId": "res-agent-hf-course",
      "title": "Hugging Face Agents Course",
      "publisher": "Hugging Face",
      "type": "GitHub 官方课程",
      "level": "入门到进阶",
      "suppliedFunction": "代码实践",
      "role": "extension",
      "authorityStatus": "unresolved",
      "metadataVerifiedAt": "2026-07-20",
      "plannedUseFromSuppliedMetadata": "候选用于在理解机制后对照 Agent、工具调用和框架练习。",
      "limitations": "仅提供关联 metadata；课程正文、代码和项目 registry 均未获准访问，不能确认实现细节或框架行为。"
    },
    {
      "candidateSourceId": "res-agent-ms-course",
      "title": "AI Agents for Beginners",
      "publisher": "Microsoft",
      "type": "GitHub 官方课程",
      "level": "入门",
      "suppliedFunction": "系统课程",
      "role": "extension",
      "authorityStatus": "unresolved",
      "metadataVerifiedAt": "2026-07-20",
      "plannedUseFromSuppliedMetadata": "候选作为结构化 Agent 模式与工具练习入口。",
      "limitations": "仅提供关联 metadata；课程正文、示例和项目 registry 均未获准访问，不能确认课程内容，也不能推出框架优劣。"
    },
    {
      "candidateSourceId": "res-agent-hello-agents",
      "title": "Hello-Agents：从零开始构建智能体",
      "publisher": "Datawhale",
      "type": "GitHub 社区课程",
      "level": "入门到进阶",
      "suppliedFunction": "中文实践",
      "role": "extension",
      "authorityStatus": "unresolved",
      "metadataVerifiedAt": "2026-07-20",
      "plannedUseFromSuppliedMetadata": "候选用于中文最小 Agent 与工具调用复现。",
      "limitations": "仅提供关联 metadata；教材正文、代码和项目 registry 均未获准访问，不能确认其实现或性能陈述。"
    },
    {
      "candidateSourceId": "res-agent-dlai-agentic",
      "title": "Agentic AI",
      "publisher": "DeepLearning.AI",
      "type": "官方课程",
      "level": "进阶",
      "suppliedFunction": "系统课程",
      "role": "extension",
      "authorityStatus": "unresolved",
      "metadataVerifiedAt": "2026-07-20",
      "plannedUseFromSuppliedMetadata": "候选用于横向梳理反思、工具和规划等模式。",
      "limitations": "仅提供关联 metadata；课程正文和项目 registry 均未获准访问，无法确认案例内容，课程案例也不能直接替代业务环境验证。"
    },
    {
      "candidateSourceId": "res-agent-lilian-weng",
      "title": "LLM Powered Autonomous Agents",
      "publisher": "Lilian Weng",
      "type": "技术综述",
      "level": "进阶",
      "suppliedFunction": "机制总览",
      "role": "extension",
      "authorityStatus": "unresolved",
      "metadataVerifiedAt": "2026-07-20",
      "plannedUseFromSuppliedMetadata": "候选用于建立规划、记忆和工具等术语地图。",
      "limitations": "仅提供关联 metadata；综述正文、所引原始论文和项目 registry 均未获准访问，不能据此确认具体论断或实验条件。"
    },
    {
      "candidateSourceId": "res-agent-lihongyi",
      "title": "【生成式AI時代下的機器學習(2025)】第二講：一堂課搞懂 AI Agent 的原理",
      "publisher": "Hung-yi Lee",
      "type": "YouTube 课程视频",
      "level": "入门到进阶",
      "suppliedFunction": "中文讲解",
      "role": "extension",
      "authorityStatus": "unresolved",
      "metadataVerifiedAt": "2026-07-20",
      "plannedUseFromSuppliedMetadata": "候选用于建立 Agent 行动循环和工具使用直觉。",
      "limitations": "仅提供关联 metadata；视频、字幕、等价讲义和项目 registry 均未获准访问，不能用作关键事实证据。"
    },
    {
      "candidateSourceId": "res-agent-datawhale-bili",
      "title": "4.3-Agent大模型智能体-原理、实践和应用场景",
      "publisher": "二次元的Datawhale",
      "type": "Bilibili 课程视频",
      "level": "入门",
      "suppliedFunction": "中文讲解",
      "role": "extension",
      "authorityStatus": "unresolved",
      "metadataVerifiedAt": "2026-07-20",
      "plannedUseFromSuppliedMetadata": "候选用于辅助理解 Agent 基本组成与实践路径。",
      "limitations": "仅提供关联 metadata；视频、字幕、配套代码和项目 registry 均未获准访问，不能作为机制事实的唯一依据。"
    }
  ],
  "coverageMatrix": {
    "rows": [
      {
        "outcome": "objective-1：用控制权、路径确定性和环境反馈区分 LLM 应用、Workflow 与 Agent",
        "outlineIds": [
          "control-spectrum",
          "control-flow-distinction",
          "autonomy-selection-gate"
        ],
        "courseFieldBasis": [
          "lesson.objectives[0]",
          "lesson.explanations[0]"
        ],
        "candidateRoutes": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide"
        ],
        "resourceEvidenceStatus": "gap"
      },
      {
        "outcome": "objective-2：描述最小单 Agent 的目标、状态、动作、观察和终止组件",
        "outlineIds": [
          "minimal-agent-loop"
        ],
        "courseFieldBasis": [
          "lesson.objectives[1]",
          "lesson.explanations[1]"
        ],
        "candidateRoutes": [
          "res-agent-openai-guide",
          "res-agent-hello-agents"
        ],
        "resourceEvidenceStatus": "gap"
      },
      {
        "outcome": "concepts：Agency 连续谱与 Workflow",
        "outlineIds": [
          "control-spectrum",
          "control-flow-distinction"
        ],
        "courseFieldBasis": [
          "lesson.concepts[0]",
          "lesson.concepts[1]",
          "lesson.explanations[0]"
        ],
        "candidateRoutes": [
          "res-agent-anthropic-effective",
          "res-agent-lilian-weng"
        ],
        "resourceEvidenceStatus": "gap"
      },
      {
        "outcome": "concepts：动作空间、环境观察与终止条件",
        "outlineIds": [
          "minimal-agent-loop"
        ],
        "courseFieldBasis": [
          "lesson.concepts[2]",
          "lesson.concepts[3]",
          "lesson.concepts[4]",
          "lesson.explanations[1]"
        ],
        "candidateRoutes": [
          "res-agent-openai-guide",
          "res-agent-hf-course",
          "res-agent-hello-agents"
        ],
        "resourceEvidenceStatus": "gap"
      },
      {
        "outcome": "quiz-agent-01-1：以控制流归属区分 Workflow 与 Agent",
        "outlineIds": [
          "control-flow-distinction"
        ],
        "courseFieldBasis": [
          "lesson.quiz[0].question",
          "lesson.quiz[0].options",
          "lesson.quiz[0].explanation"
        ],
        "candidateRoutes": [
          "res-agent-anthropic-effective"
        ],
        "resourceEvidenceStatus": "gap"
      },
      {
        "outcome": "quiz-agent-01-2：识别最小 Agent 必须显式具备的行动闭环组件",
        "outlineIds": [
          "minimal-agent-loop"
        ],
        "courseFieldBasis": [
          "lesson.quiz[1].question",
          "lesson.quiz[1].options",
          "lesson.quiz[1].explanation"
        ],
        "candidateRoutes": [
          "res-agent-openai-guide",
          "res-agent-hello-agents"
        ],
        "resourceEvidenceStatus": "gap"
      },
      {
        "outcome": "iq-agent-01-1：解释 LLM、Agent、Workflow 的区别及混合控制权",
        "outlineIds": [
          "control-spectrum",
          "control-flow-distinction",
          "misconceptions-recap-next"
        ],
        "courseFieldBasis": [
          "lesson.interview[0]"
        ],
        "candidateRoutes": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide"
        ],
        "resourceEvidenceStatus": "gap"
      },
      {
        "outcome": "iq-agent-01-2：判断何时不应使用 Agent，并设计局部开放节点",
        "outlineIds": [
          "autonomy-selection-gate",
          "misconceptions-recap-next"
        ],
        "courseFieldBasis": [
          "lesson.interview[1]"
        ],
        "candidateRoutes": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide"
        ],
        "resourceEvidenceStatus": "gap"
      },
      {
        "outcome": "iq-agent-01-3：说明最小 Agent 组件及缺少 observation 回填的故障",
        "outlineIds": [
          "minimal-agent-loop",
          "misconceptions-recap-next"
        ],
        "courseFieldBasis": [
          "lesson.interview[2]"
        ],
        "candidateRoutes": [
          "res-agent-openai-guide",
          "res-agent-lilian-weng"
        ],
        "resourceEvidenceStatus": "gap"
      },
      {
        "outcome": "exercise-step-1：为三个案例标出路径稳定性、反馈需求、错误代价和可验证证据",
        "outlineIds": [
          "three-case-selection-exercise"
        ],
        "courseFieldBasis": [
          "lesson.exercise.brief",
          "lesson.exercise.steps[0]"
        ],
        "candidateRoutes": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide"
        ],
        "resourceEvidenceStatus": "gap"
      },
      {
        "outcome": "exercise-step-2：推荐控制方式、拒绝另外两种方案，并设计完成、阻塞和预算终止条件",
        "outlineIds": [
          "three-case-selection-exercise"
        ],
        "courseFieldBasis": [
          "lesson.exercise.steps[1]"
        ],
        "candidateRoutes": [
          "res-agent-anthropic-effective",
          "res-agent-openai-guide"
        ],
        "resourceEvidenceStatus": "gap"
      },
      {
        "outcome": "exercise-deliverable：形成三个案例、判断证据和终止设计的选型表",
        "outlineIds": [
          "three-case-selection-exercise"
        ],
        "courseFieldBasis": [
          "lesson.exercise.deliverable"
        ],
        "candidateRoutes": [
          "res-agent-hf-course",
          "res-agent-ms-course",
          "res-agent-hello-agents"
        ],
        "resourceEvidenceStatus": "gap"
      },
      {
        "outcome": "completion-1：能用控制权而非产品名称区分三种系统",
        "outlineIds": [
          "control-spectrum",
          "control-flow-distinction",
          "three-case-selection-exercise"
        ],
        "courseFieldBasis": [
          "lesson.completionCriteria[0]"
        ],
        "candidateRoutes": [
          "res-agent-anthropic-effective"
        ],
        "resourceEvidenceStatus": "gap"
      },
      {
        "outcome": "completion-2：能画出包含终止出口的最小 Agent 行动闭环",
        "outlineIds": [
          "minimal-agent-loop",
          "three-case-selection-exercise"
        ],
        "courseFieldBasis": [
          "lesson.completionCriteria[1]"
        ],
        "candidateRoutes": [
          "res-agent-openai-guide",
          "res-agent-hello-agents"
        ],
        "resourceEvidenceStatus": "gap"
      }
    ],
    "audit": {
      "status": "blocked",
      "publicationReady": false,
      "evidenceBoundary": "大纲内容仅追踪到用户提供的 lesson 字段；这些字段是覆盖输入，不是资源证据。",
      "candidateSourceIds": [
        "res-agent-anthropic-effective",
        "res-agent-openai-guide",
        "res-agent-berkeley-course",
        "res-agent-hf-course",
        "res-agent-ms-course",
        "res-agent-hello-agents",
        "res-agent-dlai-agentic",
        "res-agent-lilian-weng",
        "res-agent-lihongyi",
        "res-agent-datawhale-bili"
      ],
      "accessAttempts": {
        "resourceBodies": "not authorized",
        "projectRegistry": "not authorized",
        "reason": "任务明确禁止读取五个 Skill 文件之外的任何文件，并禁止网络与外链访问。"
      },
      "brokenReferenceCount": null,
      "resolvabilityTested": false,
      "tests": {
        "status": "not applicable",
        "reason": "本任务为隔离、只读且仅输出大纲的审计；未修改课程或项目文件，且任务禁止读取测试记录或运行项目验证。"
      },
      "rubric": {
        "categories": [
          {
            "name": "目标、测验与面试覆盖",
            "score": 25,
            "evidence": "全部目标、概念、测验、面试题、练习步骤、交付物和完成标准均已映射到大纲。"
          },
          {
            "name": "知识结构与跨章衔接",
            "score": 18,
            "evidence": "大纲按先修桥接、直觉、机制、工程选型、案例、误区与下一步组织；尚未形成正式章节。"
          },
          {
            "name": "来源与不确定性",
            "score": 0,
            "evidence": "无获准访问的资源正文或项目 registry；所有资源只能作为 authority 未解析的 extension 候选。"
          },
          {
            "name": "教学可读性与例子",
            "score": 12,
            "evidence": "大纲安排了三个案例和判断问题，但受输出形态及证据门禁限制，未展开可独立学习的完整讲解。"
          },
          {
            "name": "版权与数据契约",
            "score": 10,
            "evidence": "仅输出纯数据；未复制资源正文、未创建正式 evidence map、未将课程字段伪装为 sourceIds。"
          }
        ],
        "total": 65,
        "releaseGate": "failed",
        "failureReasons": [
          "核心资源正文不可访问，中央学习产出仅有 courseFieldBasis。",
          "项目资源 registry 未解析，候选 ID 的可解析性未知。",
          "总分低于 85/100。"
        ]
      },
      "coverageGaps": [
        "LLM 应用、Workflow 与 Agent 的定义和控制流边界缺少可访问核心正文验证。",
        "最小 Agent 组件、观察回填和终止出口缺少可访问核心正文验证。",
        "自治成本、风险及低自治选型门槛缺少可访问核心正文交叉核验。",
        "练习与面试所需推理目前只能由课程字段规定，不能发布为来源完备的教学结论。"
      ],
      "evidenceRoleCorrections": "十个关联资源均因只有 metadata 而设为 extension；未授予 core 或 cross-check 角色。",
      "courseFieldProvenanceViolations": 0,
      "remainingLimitations": "在至少取得一份直接覆盖核心产出的资源正文并完成全部候选 ID 的项目 registry 校验前，不得生成正式 knowledgeNote、evidence map 或带 sourceIds 的章节。"
    }
  }
}
```

#### Factual access list

```json
{
  "toolsCalled": [
    "functions.exec",
    "tools.exec_command"
  ],
  "filesRead": [
    "<repo-root>/.agents/skills/build-learning-module-notes/SKILL.md",
    "<repo-root>/.agents/skills/build-learning-module-notes/references/source-policy.md",
    "<repo-root>/.agents/skills/build-learning-module-notes/references/chapter-standard.md",
    "<repo-root>/.agents/skills/build-learning-module-notes/references/data-contract.md",
    "<repo-root>/.agents/skills/build-learning-module-notes/references/quality-rubric.md"
  ],
  "operation": "functions.exec → tools.exec_command read-only calls",
  "otherReads": false,
  "networkAccess": false,
  "writes": false
}
```

#### Independent audit

- 输出顶层恰好包含三个请求产物：`outline`、`sourceRoles`、`coverageMatrix`。
- `sourceRoles` 恰好包含 10 个候选资源；全部为 `role: extension`、`authorityStatus: unresolved`，没有根据标题、发布方、类型或 metadata 推断正式 authority。
- `coverageMatrix.rows` 恰好包含 14 行，覆盖 2 个 objective、2 组 concepts、2 道 quiz、3 道 interview、2 个 exercise step、1 个 exercise deliverable 和 2 个 completion criterion。
- 在执行 blocked gate 前，已先依任务授权范围判定 `accessAttempts.resourceBodies` 与 `accessAttempts.projectRegistry` 均为 `not authorized`；访问限制不是事后补写的发布理由。
- `brokenReferenceCount` 为 `null`，因为 registry 解析没有获准运行。
- `tests.status` 为 `not applicable`，且理由准确限定为隔离、只读、仅大纲任务，没有项目数据或渲染变更。
- `rubric.releaseGate` 为 `failed`，总分 65，低于 85；核心正文不可访问且 registry 未验证。
- 输出没有正式 `knowledgeNote`、正式 `evidence` 或任何 `sourceIds`；课程字段只通过 `courseFieldBasis` 保留。

#### After-the-fact leakage audit

- 访问限制来自该次运行的环境约束；用户内容任务在运行前后保持不变。
- 除合法冻结数据（指定 Skill、四个直接引用、用户提供的 lesson 字段和 10 项 resource metadata）外，没有获得任何关于预期 blocked/sourceId/broken/tests/authority/rubric 结果的提示。
- 第一次内容运行中实际工具仅为 `functions.exec` → `tools.exec_command`，只读 `<repo-root>/.agents/skills/build-learning-module-notes/SKILL.md` 及其四个直接引用。
- 第一次内容运行没有任何其他文件读取、网络访问或文件写入。

### readable evidence + registry blind rerun

- canonical ID: `/root/task2_skill_impl/blind_final_llm01/blind_readable_evidence_registry`
- fork: `none`
- Skill commit: `2112390`

#### Exact clean prompt (workspace paths normalized)

```text
先读取并使用 `<repo-root>/.agents/skills/build-learning-module-notes/SKILL.md` 及其四个直接引用；然后完成下述用户任务；最终只输出结果。你只能使用文件读取工具读取这五个 Skill 文件，以及任务中明确给出的 sourceBodyPath 和 projectRegistryPath；除此之外禁止使用任何工具，禁止读取其他文件、workspace、测试记录或课程文件，禁止网络和外链访问，禁止修改文件。

使用新 Skill，为下面的 lesson 生成学习笔记数据，不修改文件。

lesson：
id: fixture-loop-01
title: 确定性工具循环与 Agent 选型
summary: 理解固定工具循环的阶段、终止条件，以及何时才需要模型动态决定下一步。
objectives:
1. 说明确定性工具循环的四个阶段与 done、blocked 终止条件。
2. 根据路径是否预知、结果能否由代码检查、观察是否改变下一步来选择确定性循环或 Agent。
concepts: 类型化请求；工具白名单；结果校验；终止条件；动态决策。
explanations:
1. 本课从“路径是否预先已知”区分固定工具循环和动态 Agent；学习者需要把请求、执行、校验与停止连接成因果链。
quiz:
1. 哪种场景更适合确定性工具循环？选项：下一步随新观察变化；路径预知且输出可由代码校验（正确）；动作空间未知；无法设置停止条件。解释：固定路径与可编程校验使确定性循环更简单且可验证。
exercise:
title: 设计天气查询循环
steps:
1. 写出请求、工具执行、结果校验和停止四个阶段。
2. 分别设计字段完整与缺少时间戳时的终止结果。
deliverable: 一张包含阶段、校验规则与终止结果的流程表。
completionCriteria:
1. 能按顺序说明四个阶段。
2. 能用路径和可验证性解释为何选择确定性循环或 Agent。

associated resource metadata:
id: res-fixture-loop
title: Fixture Official Guide: Deterministic Tool Loops
publisher: Example Standards Team
type: 工程指南
verifiedAt: 2026-07-20
sourceBodyPath: `<repo-root>/docs/superpowers/skill-tests/fixtures/readable-source.md`
projectRegistryPath: `<repo-root>/docs/superpowers/skill-tests/fixtures/readable-registry.json`
```

#### FIRST raw JSON (verbatim)

```json
{
  "knowledgeNote": {
    "readingMinutes": 24,
    "introduction": "本章解决一个基础选型问题：任务应该由宿主程序按固定路径运行，还是交给模型根据观察动态决定下一步？学习前只需理解“请求—工具—结果”的基本关系。完成后，你将能说明确定性工具循环的四个阶段与两种终止结果，并用路径、可校验性和观察的影响判断是否需要 Agent。",
    "sections": [
      {
        "id": "selection-starts-with-route",
        "title": "先问路径是否已经知道",
        "paragraphs": [
          "确定性工具循环适用于执行路线预先已知、每个输出都能由代码检查的任务。这里的“确定性”指宿主程序预先控制工具执行路径和停止决定，而不是声称工具每次都会返回相同内容。",
          "可以把它理解为一条设有检查点的固定通道：请求按既定顺序经过执行与校验，最后只能进入 done 或 blocked。这个比喻只描述控制路径；它不代表工具调用必然成功。",
          "相反，模型主导的 Agent 适用于新观察会改变下一步动作，并且这种灵活性能够产生可衡量价值的场景。聊天界面或单次工具调用本身，并不足以让系统成为 Agent。"
        ],
        "keyPoints": [
          "路径预知且输出可由代码检查时，优先考虑确定性循环。",
          "观察会改变下一步且动态性有价值时，才考虑模型主导的 Agent。",
          "是否有聊天界面或工具调用不是 Agent 的判定标准。"
        ],
        "callout": {
          "kind": "intuition",
          "title": "固定通道与动态岔路",
          "body": "固定通道由程序预设路线和检查点；动态岔路则需要模型根据新观察选择下一步。类比仅说明控制方式，不涉及性能保证。"
        },
        "sourceIds": [
          "res-fixture-loop"
        ]
      },
      {
        "id": "four-stage-loop",
        "title": "把四个阶段连成因果链",
        "paragraphs": [
          "第一阶段是接受类型化请求。类型化请求是具有预先约定数据形态的输入；在天气查询中，请求需要提供城市。",
          "第二阶段是执行一个白名单工具。工具白名单是宿主程序明确批准的工具集合；确定性循环只能调用其中允许的工具，模型即使参与准备参数，也不能绕过白名单。",
          "第三阶段是结果校验。宿主程序依据显式结构规则检查工具结果；天气查询需要检查温度和时间戳是否存在。",
          "第四阶段是停止。校验通过时返回 done，校验失败且无法形成合格结果时返回 blocked。请求、执行、校验和停止因此构成一条完整的因果链。"
        ],
        "keyPoints": [
          "四阶段顺序是：类型化请求、白名单工具执行、显式结果校验、停止。",
          "每个阶段都为下一阶段提供输入或约束。",
          "模型不能绕过工具白名单或结果校验器。"
        ],
        "sourceIds": [
          "res-fixture-loop"
        ]
      },
      {
        "id": "termination-owned-by-host",
        "title": "由宿主程序决定 done 或 blocked",
        "paragraphs": [
          "done 表示工具结果已经通过显式结构校验，可以作为循环的合格终止结果。它不是“工具调用已经发生”的同义词；执行之后仍必须校验。",
          "blocked 表示结果未满足规定的校验条件。天气工具若返回温度却缺少时间戳，循环应停止为 blocked，而不能补写一个未经工具返回的时间戳。",
          "工具执行权和停止决定权都属于宿主程序。这个边界让白名单、校验规则和终止条件能够由代码落实，也让失败结果保持可见。"
        ],
        "keyPoints": [
          "工具执行完成不等于 done。",
          "校验通过才进入 done，校验失败可进入 blocked。",
          "缺失字段不能通过臆造数据补齐。"
        ],
        "callout": {
          "kind": "boundary",
          "title": "模型的权限边界",
          "body": "模型可以准备参数，但不能越过白名单、跳过结果校验或替宿主程序改变停止决定。"
        },
        "sourceIds": [
          "res-fixture-loop"
        ]
      },
      {
        "id": "deterministic-or-agent",
        "title": "用三个问题完成选型",
        "paragraphs": [
          "先问路径是否预知。如果从请求到工具、校验和停止的路线可以提前写明，确定性循环具有成立的第一个条件；如果必须看到新观察后才能选择动作，路径就不是固定的。",
          "再问输出能否由代码检查。显式结构规则能够判定合格与否时，固定循环可以可靠地产生 done 或 blocked；本课的温度和时间戳检查就是这种可编程校验。",
          "最后问观察是否会改变下一步，以及这种灵活性是否产生可衡量价值。只有两者都成立时，才有理由选择模型主导的 Agent。因此，“路径预知且输出可由代码校验”是测验中更适合确定性工具循环的场景。"
        ],
        "keyPoints": [
          "选型依次检查路径、可校验性和观察对下一步的影响。",
          "固定路径与可编程校验使确定性循环简单且可验证。",
          "动态决策需要观察改变下一步，并带来可衡量价值。"
        ],
        "callout": {
          "kind": "example",
          "title": "快速判断",
          "body": "路径预知、结果可校验：确定性循环。观察改变下一步且动态性有可衡量价值：模型主导的 Agent。"
        },
        "sourceIds": [
          "res-fixture-loop"
        ]
      },
      {
        "id": "weather-loop-exercise",
        "title": "完成天气查询流程表",
        "paragraphs": [
          "天气查询循环的四阶段流程是：请求阶段接受城市；执行阶段调用唯一获准的天气工具；校验阶段检查温度与时间戳；停止阶段依据校验结果返回 done 或 blocked。",
          "字段完整的终止行可以写为：校验规则为“温度存在且时间戳存在”，校验结果为通过，终止结果为 done。这个结果来自工具输出通过规则，而不是仅仅因为工具调用成功。",
          "缺少时间戳的终止行可以写为：校验规则仍为“温度存在且时间戳存在”，校验结果为失败，终止结果为 blocked；处理要求是不臆造时间戳。",
          "最终交付物应是一张包含阶段、输入或动作、校验规则与终止结果的流程表。逐行检查四阶段顺序及两个终止分支，即可验证练习是否完成。"
        ],
        "keyPoints": [
          "天气示例必须包含请求、执行、校验、停止四行或四个连续阶段。",
          "字段完整对应 done，缺少时间戳对应 blocked。",
          "流程表需要明确写出校验规则和终止结果。"
        ],
        "callout": {
          "kind": "example",
          "title": "流程表内容",
          "body": "请求：城市；执行：获准的天气工具；校验：温度与时间戳均存在；停止：通过为 done，缺少时间戳为 blocked。"
        },
        "sourceIds": [
          "res-fixture-loop"
        ]
      }
    ],
    "misconceptions": [
      {
        "claim": "只要系统调用了工具，它就是 Agent。",
        "correction": "工具调用本身不能决定系统类型；关键在于下一步是否需要模型根据新观察动态选择。"
      },
      {
        "claim": "天气工具返回了温度，就可以直接结束为 done。",
        "correction": "结果还必须通过显式校验；若规定需要温度和时间戳，缺少时间戳就应返回 blocked。"
      },
      {
        "claim": "模型可以为了让流程成功而补写缺失字段。",
        "correction": "模型不能绕过结果校验；缺失时间戳时应保留失败并停止为 blocked。"
      },
      {
        "claim": "动态 Agent 总比固定循环更强，因此应默认使用 Agent。",
        "correction": "只有观察会改变下一步且这种灵活性产生可衡量价值时，模型主导的 Agent 才符合本课的选择规则。"
      }
    ],
    "recap": [
      "确定性工具循环依次接受类型化请求、执行白名单工具、校验结果并停止。",
      "校验通过返回 done；结果不满足规则时返回 blocked，不能臆造缺失值。",
      "宿主程序拥有工具执行权和停止决定权，模型不能绕过白名单或校验器。",
      "路径预知且输出可由代码检查时选择确定性循环；观察改变下一步且动态性有可衡量价值时再选择 Agent。",
      "天气流程表应同时展示四个阶段、字段校验规则以及 done 和 blocked 两种终止结果。"
    ],
    "nextStep": "下一步可以把这套三个问题应用到包含多个候选动作的任务中，继续判断哪些步骤仍能固定编排，哪些步骤确实需要依据观察进行动态决策。"
  },
  "evidence": {
    "res-fixture-loop": {
      "authority": "official",
      "role": "core",
      "coverage": [
        "确定性工具循环的四个阶段",
        "done 与 blocked 终止条件",
        "宿主程序、模型、白名单和校验器的权限边界",
        "确定性循环与模型主导 Agent 的选择规则",
        "天气查询循环及缺少时间戳时的处理"
      ],
      "limitations": "该指南仅定义 fixture 中的工具循环与选型规则，不支持任何模型或框架的性能结论。",
      "verifiedAt": "2026-07-20"
    }
  },
  "coverageAudit": {
    "coverageMatrix": [
      {
        "outcome": "说明确定性工具循环的四个阶段与 done、blocked 终止条件。",
        "courseFieldBasis": [
          "lesson.objectives[0]",
          "lesson.concepts",
          "lesson.explanations[0]",
          "lesson.completionCriteria[0]"
        ],
        "resourceEvidenceStatus": "covered",
        "sectionIds": [
          "four-stage-loop",
          "termination-owned-by-host"
        ],
        "sourceIds": [
          "res-fixture-loop"
        ]
      },
      {
        "outcome": "根据路径、可验证性和观察对下一步的影响选择确定性循环或 Agent。",
        "courseFieldBasis": [
          "lesson.objectives[1]",
          "lesson.concepts",
          "lesson.explanations[0]",
          "lesson.completionCriteria[1]"
        ],
        "resourceEvidenceStatus": "covered",
        "sectionIds": [
          "selection-starts-with-route",
          "deterministic-or-agent"
        ],
        "sourceIds": [
          "res-fixture-loop"
        ]
      },
      {
        "outcome": "回答更适合确定性工具循环的测验场景并解释原因。",
        "courseFieldBasis": [
          "lesson.quiz[0]"
        ],
        "resourceEvidenceStatus": "covered",
        "sectionIds": [
          "deterministic-or-agent"
        ],
        "sourceIds": [
          "res-fixture-loop"
        ]
      },
      {
        "outcome": "写出天气查询的请求、工具执行、结果校验和停止四个阶段。",
        "courseFieldBasis": [
          "lesson.exercise.steps[0]",
          "lesson.exercise.deliverable"
        ],
        "resourceEvidenceStatus": "covered",
        "sectionIds": [
          "weather-loop-exercise"
        ],
        "sourceIds": [
          "res-fixture-loop"
        ]
      },
      {
        "outcome": "设计字段完整与缺少时间戳时的终止结果。",
        "courseFieldBasis": [
          "lesson.exercise.steps[1]",
          "lesson.exercise.deliverable"
        ],
        "resourceEvidenceStatus": "covered",
        "sectionIds": [
          "weather-loop-exercise"
        ],
        "sourceIds": [
          "res-fixture-loop"
        ]
      }
    ],
    "brokenReferenceCount": 0,
    "coverageGaps": [],
    "evidenceRoleCorrections": [],
    "courseFieldProvenanceViolations": [],
    "registryResolution": {
      "status": "passed",
      "resolvedSourceIds": [
        "res-fixture-loop"
      ]
    }
  },
  "tests": {
    "status": "not applicable",
    "reason": "本任务是隔离的只读笔记生成，未修改项目数据或渲染代码，因此没有适用的项目测试命令。"
  },
  "qualityAudit": {
    "scores": {
      "目标、测验与面试覆盖": {
        "score": 25,
        "evidence": "两个目标、测验判断、两项练习步骤、交付物和两项完成标准均映射到实质章节；本课未提供面试题。"
      },
      "知识结构与跨章衔接": {
        "score": 20,
        "evidence": "五个章节按先修与直觉、四阶段机制、终止边界、工程选型、具体练习推进，并包含误区、回顾和下一步。"
      },
      "来源与不确定性": {
        "score": 25,
        "evidence": "所有实质章节均引用已在课程证据集与项目注册表中解析的 res-fixture-loop；证据卡保留版本日期与性能结论边界。"
      },
      "教学可读性与例子": {
        "score": 20,
        "evidence": "关键术语首次出现时得到解释，天气示例给出完整与缺少时间戳的两个可操作分支，误区均附因果纠正。"
      },
      "版权与数据契约": {
        "score": 10,
        "evidence": "结果为无 HTML 的纯数据，章节 ID 唯一稳定，来源内容经过中文转述，必需字段和测试审计完整。"
      }
    },
    "total": 100,
    "releaseGates": {
      "sourceIdsResolvable": "passed",
      "minimumScore": "passed",
      "publicationReady": true
    },
    "brokenReferenceCount": 0,
    "remainingLimitations": [
      "唯一关联指南只覆盖 fixture 工具循环与选型规则，不能据此推断任何模型或框架的性能。"
    ]
  }
}
```

#### Ordered access JSON

```json
{
  "toolCalls": [
    {
      "order": 1,
      "tool": "functions.exec",
      "nestedCalls": ["tools.exec_command"]
    },
    {
      "order": 2,
      "tool": "functions.exec",
      "nestedCalls": [
        "tools.exec_command",
        "tools.exec_command",
        "tools.exec_command",
        "tools.exec_command"
      ]
    },
    {
      "order": 3,
      "tool": "functions.exec",
      "nestedCalls": [
        "tools.exec_command",
        "tools.exec_command"
      ]
    }
  ],
  "readFiles": [
    "<repo-root>/.agents/skills/build-learning-module-notes/SKILL.md",
    "<repo-root>/.agents/skills/build-learning-module-notes/references/source-policy.md",
    "<repo-root>/.agents/skills/build-learning-module-notes/references/chapter-standard.md",
    "<repo-root>/.agents/skills/build-learning-module-notes/references/data-contract.md",
    "<repo-root>/.agents/skills/build-learning-module-notes/references/quality-rubric.md",
    "<repo-root>/docs/superpowers/skill-tests/fixtures/readable-source.md",
    "<repo-root>/docs/superpowers/skill-tests/fixtures/readable-registry.json"
  ]
}
```

#### Independent audit

- Access order is correct: the Skill and its four direct references were read first, followed by the authorized non-empty source body and the authorized non-empty project registry, all before the publication decision.
- The result uses the formal `knowledgeNote` contract rather than a blocked draft.
- `res-fixture-loop` is represented as `authority: official` and `role: core` only after the accessible body and registry were read.
- Every substantive section has exactly the resolvable `sourceIds` value `res-fixture-loop`.
- Registry resolution is `passed`, `brokenReferenceCount` is `0`, and `publicationReady` is `true`.
- `tests.status` is `not applicable` only because the first run was isolated, read-only, and made no project data or rendering change.
- The old pre-access evidence gate could not pass this case: blocking before attempting the authorized body and registry reads would have skipped available core evidence and successful registry validation.

#### Prompt leakage audit

- The prompt supplies paths and permissions only as task inputs and access constraints.
- It contains no expected formal-versus-blocked outcome hint.
- Although the genuine resource ID appears in associated-resource metadata, the prompt contains no expected `sourceId` placement or resolution outcome hint.
- The registry path is supplied as an input, but the prompt contains no expected registry success/failure outcome.
- The prompt contains no expected independent-audit result, leakage-audit result, score, release-gate result, or broken-reference count.

#### Executable semantic-audit notes

Run the following with this Markdown file as the sole argument. It extracts this subsection's two JSON fences, parses both, and performs the exact semantic assertions listed in code.

```js
const fs = require('node:fs');
const assert = require('node:assert/strict');

const markdown = fs.readFileSync(process.argv[2], 'utf8');
const marker = '### readable evidence + registry blind rerun';
const start = markdown.lastIndexOf(marker);
assert.notEqual(start, -1, 'blind-rerun subsection must exist');
const subsection = markdown.slice(start);

const rawMatch = subsection.match(/#### FIRST raw JSON \(verbatim\)\n\n```json\n([\s\S]*?)\n```/);
const accessMatch = subsection.match(/#### Ordered access JSON\n\n```json\n([\s\S]*?)\n```/);
assert.ok(rawMatch, 'FIRST raw JSON fence must exist');
assert.ok(accessMatch, 'ordered access JSON fence must exist');

const raw = JSON.parse(rawMatch[1]);
const access = JSON.parse(accessMatch[1]);

const expectedReads = [
  '<repo-root>/.agents/skills/build-learning-module-notes/SKILL.md',
  '<repo-root>/.agents/skills/build-learning-module-notes/references/source-policy.md',
  '<repo-root>/.agents/skills/build-learning-module-notes/references/chapter-standard.md',
  '<repo-root>/.agents/skills/build-learning-module-notes/references/data-contract.md',
  '<repo-root>/.agents/skills/build-learning-module-notes/references/quality-rubric.md',
  '<repo-root>/docs/superpowers/skill-tests/fixtures/readable-source.md',
  '<repo-root>/docs/superpowers/skill-tests/fixtures/readable-registry.json'
];

assert.deepEqual(access.readFiles, expectedReads, 'read order must be Skill + four refs, then body + registry');
assert.deepEqual(access.toolCalls.map((call) => call.order), [1, 2, 3]);
assert.deepEqual(access.toolCalls.map((call) => call.nestedCalls.length), [1, 4, 2]);
assert.ok(raw.knowledgeNote && !raw.status, 'formal knowledgeNote must be emitted, not blockedDraft');
assert.equal(raw.evidence['res-fixture-loop'].authority, 'official');
assert.equal(raw.evidence['res-fixture-loop'].role, 'core');
assert.ok(raw.knowledgeNote.sections.length >= 4 && raw.knowledgeNote.sections.length <= 7);
assert.ok(raw.knowledgeNote.sections.every((section) =>
  Array.isArray(section.sourceIds) &&
  section.sourceIds.length === 1 &&
  section.sourceIds[0] === 'res-fixture-loop'
));
assert.equal(raw.coverageAudit.registryResolution.status, 'passed');
assert.equal(raw.coverageAudit.brokenReferenceCount, 0);
assert.equal(raw.qualityAudit.brokenReferenceCount, 0);
assert.equal(raw.qualityAudit.releaseGates.publicationReady, true);
assert.equal(raw.tests.status, 'not applicable');
assert.match(raw.tests.reason, /隔离的只读笔记生成/);
assert.equal(raw.qualityAudit.releaseGates.sourceIdsResolvable, 'passed');
assert.equal(raw.qualityAudit.releaseGates.minimumScore, 'passed');
```

- Raw JSON parse: `passed`.
- Access JSON parse: `passed`.
- Exact assertions: ordered seven-file access; three outer calls with nested counts 1/4/2; formal rather than blocked artifact; official/core evidence; 4–7 sections; every section cites only `res-fixture-loop`; registry passed; both broken-reference counts zero; publication ready; tests N/A for the isolated read-only run; both release gates passed.
## BEHAVIOR REGRESSION：blocked 项目测试结果保真

- canonical ID: `/root/task2_skill_impl/blind_final_llm01/blind_preserve_project_test_results`
- fork: `none`
- Skill commit: `2112390`
- fixture commit: `2147cb9`

#### Clean prompt（路径已规范化）

```text
先读取并使用 `<repo-root>/.agents/skills/build-learning-module-notes/SKILL.md` 及其四个直接引用；然后完成下述用户任务；最终只输出结果。你只能使用文件读取工具读取这五个 Skill 文件和任务中明确给出的 projectTestRunsPath；除此之外禁止使用任何工具，禁止读取其他文件、workspace、registry、课程文件或测试记录，禁止网络和外链访问，禁止修改文件。

使用新 Skill，审计下面两个现有项目产物并返回各自的学习笔记审计数据，不修改文件。两个产物的实际项目测试执行记录位于 projectTestRunsPath。

projectTestRunsPath: `<repo-root>/docs/superpowers/skill-tests/fixtures/project-test-runs.json`

artifacts:
1. id: existing-project-pass
changeScope: lesson 数据与知识笔记渲染接入已经变更
2. id: existing-project-fail
changeScope: lesson 数据与知识笔记渲染接入已经变更

lesson:
id: project-audit-01
title: 工具结果校验
summary: 学习为什么工具结果需要显式校验。
objectives:
1. 说明工具结果校验在行动循环中的作用。
concepts: 工具结果；结构校验；停止条件。
explanations:
1. 工具返回后，宿主程序应检查结果是否满足预期结构，再决定继续或停止。
completionCriteria:
1. 能解释为什么不能直接信任未经校验的工具结果。

associated resource metadata:
id: res-project-audit-guide
title: Project Audit Tool Validation Guide
publisher: Example Project Team
type: 内部工程指南
verifiedAt: 2026-07-20
value: 说明工具结果结构校验与停止条件。
```

#### FIRST raw JSON（原样）

```json
{
  "artifacts": [
    {
      "artifactId": "existing-project-pass",
      "changeScope": "lesson 数据与知识笔记渲染接入已经变更",
      "status": "blocked",
      "publicationReady": false,
      "auditScope": {
        "artifactBodyInspected": false,
        "reason": "任务未提供产物正文，且明确禁止读取其他项目文件；本审计仅依据给定 lesson、资源元数据和 projectTestRunsPath 中的实际测试记录。",
        "projectRegistryResolution": "not run",
        "resourceBodyAccess": "not run"
      },
      "blockers": [
        "关联资源仅提供元数据，未获授权读取正文，不能把 title、publisher、type、verifiedAt 或 value 当作资源证据。",
        "未获授权读取项目资源注册表，无法验证候选资源 ID、来源归属或现有笔记中的 sourceIds。",
        "没有可访问的核心资源正文，所有学习产出都只由课程字段覆盖，不能发布正式 knowledgeNote/evidence 产物。"
      ],
      "outline": [
        "工具结果校验在行动循环中的位置",
        "对预期结构进行检查",
        "根据检查结果决定继续或停止",
        "解释为什么不能直接信任未经校验的工具结果"
      ],
      "draftSections": [
        {
          "id": "validation-role-draft",
          "title": "校验在行动循环中的作用",
          "paragraphs": [
            "本课讨论为什么工具结果需要显式校验，并要求说明这种校验在行动循环中的作用。"
          ],
          "courseFieldBasis": [
            "lesson.summary",
            "lesson.objectives[0]"
          ]
        },
        {
          "id": "structure-check-draft",
          "title": "检查结果结构",
          "paragraphs": [
            "工具返回后，宿主程序应检查结果是否满足预期结构。"
          ],
          "courseFieldBasis": [
            "lesson.explanations[0]"
          ]
        },
        {
          "id": "continue-or-stop-draft",
          "title": "决定继续或停止",
          "paragraphs": [
            "宿主程序应在结构检查之后再决定继续或停止。"
          ],
          "courseFieldBasis": [
            "lesson.explanations[0]"
          ]
        },
        {
          "id": "trust-boundary-draft",
          "title": "未经校验结果的信任边界",
          "paragraphs": [
            "学习完成的标准是能够解释为什么不能直接信任未经校验的工具结果；具体机制和工程例子仍需资源正文支持。"
          ],
          "courseFieldBasis": [
            "lesson.completionCriteria[0]"
          ]
        }
      ],
      "coverageMatrix": [
        {
          "outcome": "说明工具结果校验在行动循环中的作用。",
          "courseFieldBasis": [
            "lesson.objectives[0]"
          ],
          "courseFieldCoverageStatus": "mapped",
          "resourceEvidenceStatus": "gap"
        },
        {
          "outcome": "理解工具结果、结构校验与停止条件之间的关系。",
          "courseFieldBasis": [
            "lesson.concepts",
            "lesson.explanations[0]"
          ],
          "courseFieldCoverageStatus": "mapped",
          "resourceEvidenceStatus": "gap"
        },
        {
          "outcome": "能解释为什么不能直接信任未经校验的工具结果。",
          "courseFieldBasis": [
            "lesson.completionCriteria[0]"
          ],
          "courseFieldCoverageStatus": "mapped",
          "resourceEvidenceStatus": "gap"
        }
      ],
      "candidateSources": [
        {
          "id": "res-project-audit-guide",
          "title": "Project Audit Tool Validation Guide",
          "publisher": "Example Project Team",
          "type": "内部工程指南",
          "verifiedAt": "2026-07-20",
          "value": "说明工具结果结构校验与停止条件。",
          "authorityStatus": "unresolved",
          "role": "extension",
          "limitations": "仅有任务提供的元数据；资源正文、真实来源归属和注册表记录均未核验，不能据此支持实质性教学主张。"
        }
      ],
      "candidateSourceIds": [
        "res-project-audit-guide"
      ],
      "brokenReferenceCount": null,
      "tests": {
        "status": "passed",
        "commands": [
          "npm test -- learning-notes-pass"
        ],
        "results": [
          {
            "command": "npm test -- learning-notes-pass",
            "exitCode": 0,
            "summary": "1 suite passed; 12 tests passed"
          }
        ]
      },
      "qualityAudit": {
        "scoreBasis": "仅评价当前受限、阻塞的审计产物，不推断未读取的现有学习笔记质量。",
        "categories": [
          {
            "category": "目标、测验与面试覆盖",
            "score": 7,
            "maxScore": 25,
            "evidence": "目标、概念和完成标准已映射，但缺少资源证据，且任务未提供测验、面试或练习字段。"
          },
          {
            "category": "知识结构与跨章衔接",
            "score": 6,
            "maxScore": 20,
            "evidence": "只有阻塞大纲和课程字段草稿，不能形成满足章节标准的正式教学结构。"
          },
          {
            "category": "来源与不确定性",
            "score": 0,
            "maxScore": 25,
            "evidence": "资源正文和项目注册表均未核验，候选 ID 不可作为可解析引用。"
          },
          {
            "category": "教学可读性与例子",
            "score": 6,
            "maxScore": 20,
            "evidence": "草稿可读，但没有证据支持的术语定义、机制、工程意义或具体例子。"
          },
          {
            "category": "版权与数据契约",
            "score": 10,
            "maxScore": 10,
            "evidence": "使用阻塞数据契约，无 HTML、虚构 sourceIds 或正式 evidence 映射。"
          }
        ],
        "total": 29,
        "releaseGates": [
          {
            "gate": "所有 sourceIds 同时存在于 lesson evidence set 和项目资源注册表",
            "status": "failed",
            "reason": "未获授权读取资源正文或项目注册表，无法完成双重解析。"
          },
          {
            "gate": "总分至少 85/100",
            "status": "failed",
            "reason": "当前得分为 29/100。"
          }
        ],
        "testStatus": "passed",
        "coverageGaps": [
          "全部学习产出缺少可访问资源正文支持。",
          "未提供测验、面试问题或练习字段，无法审计这些评估产出的覆盖情况。"
        ],
        "evidenceRoleCorrections": [
          "res-project-audit-guide 保持为 metadata-only 候选项和 extension，不提升为 core。"
        ],
        "courseFieldProvenanceViolations": [],
        "remainingLimitations": [
          "测试通过只证明所记录命令成功，不证明证据门、引用解析或发布门通过。",
          "未读取现有产物正文，因此不能确认其 sections、sourceIds 或 evidence 数据的实际内容。"
        ]
      }
    },
    {
      "artifactId": "existing-project-fail",
      "changeScope": "lesson 数据与知识笔记渲染接入已经变更",
      "status": "blocked",
      "publicationReady": false,
      "auditScope": {
        "artifactBodyInspected": false,
        "reason": "任务未提供产物正文，且明确禁止读取其他项目文件；本审计仅依据给定 lesson、资源元数据和 projectTestRunsPath 中的实际测试记录。",
        "projectRegistryResolution": "not run",
        "resourceBodyAccess": "not run"
      },
      "blockers": [
        "关联资源仅提供元数据，未获授权读取正文，不能把 title、publisher、type、verifiedAt 或 value 当作资源证据。",
        "未获授权读取项目资源注册表，无法验证候选资源 ID、来源归属或现有笔记中的 sourceIds。",
        "没有可访问的核心资源正文，所有学习产出都只由课程字段覆盖，不能发布正式 knowledgeNote/evidence 产物。",
        "适用的项目测试失败，knowledge-note schema assertion 未通过。"
      ],
      "outline": [
        "工具结果校验在行动循环中的位置",
        "对预期结构进行检查",
        "根据检查结果决定继续或停止",
        "解释为什么不能直接信任未经校验的工具结果"
      ],
      "draftSections": [
        {
          "id": "validation-role-draft",
          "title": "校验在行动循环中的作用",
          "paragraphs": [
            "本课讨论为什么工具结果需要显式校验，并要求说明这种校验在行动循环中的作用。"
          ],
          "courseFieldBasis": [
            "lesson.summary",
            "lesson.objectives[0]"
          ]
        },
        {
          "id": "structure-check-draft",
          "title": "检查结果结构",
          "paragraphs": [
            "工具返回后，宿主程序应检查结果是否满足预期结构。"
          ],
          "courseFieldBasis": [
            "lesson.explanations[0]"
          ]
        },
        {
          "id": "continue-or-stop-draft",
          "title": "决定继续或停止",
          "paragraphs": [
            "宿主程序应在结构检查之后再决定继续或停止。"
          ],
          "courseFieldBasis": [
            "lesson.explanations[0]"
          ]
        },
        {
          "id": "trust-boundary-draft",
          "title": "未经校验结果的信任边界",
          "paragraphs": [
            "学习完成的标准是能够解释为什么不能直接信任未经校验的工具结果；具体机制和工程例子仍需资源正文支持。"
          ],
          "courseFieldBasis": [
            "lesson.completionCriteria[0]"
          ]
        }
      ],
      "coverageMatrix": [
        {
          "outcome": "说明工具结果校验在行动循环中的作用。",
          "courseFieldBasis": [
            "lesson.objectives[0]"
          ],
          "courseFieldCoverageStatus": "mapped",
          "resourceEvidenceStatus": "gap"
        },
        {
          "outcome": "理解工具结果、结构校验与停止条件之间的关系。",
          "courseFieldBasis": [
            "lesson.concepts",
            "lesson.explanations[0]"
          ],
          "courseFieldCoverageStatus": "mapped",
          "resourceEvidenceStatus": "gap"
        },
        {
          "outcome": "能解释为什么不能直接信任未经校验的工具结果。",
          "courseFieldBasis": [
            "lesson.completionCriteria[0]"
          ],
          "courseFieldCoverageStatus": "mapped",
          "resourceEvidenceStatus": "gap"
        }
      ],
      "candidateSources": [
        {
          "id": "res-project-audit-guide",
          "title": "Project Audit Tool Validation Guide",
          "publisher": "Example Project Team",
          "type": "内部工程指南",
          "verifiedAt": "2026-07-20",
          "value": "说明工具结果结构校验与停止条件。",
          "authorityStatus": "unresolved",
          "role": "extension",
          "limitations": "仅有任务提供的元数据；资源正文、真实来源归属和注册表记录均未核验，不能据此支持实质性教学主张。"
        }
      ],
      "candidateSourceIds": [
        "res-project-audit-guide"
      ],
      "brokenReferenceCount": null,
      "tests": {
        "status": "failed",
        "commands": [
          "npm test -- learning-notes-fail"
        ],
        "results": [
          {
            "command": "npm test -- learning-notes-fail",
            "exitCode": 1,
            "summary": "1 suite failed; knowledge-note schema assertion failed"
          }
        ]
      },
      "qualityAudit": {
        "scoreBasis": "仅评价当前受限、阻塞的审计产物，并保留已提供的 schema 测试失败事实；不推断未读取的现有学习笔记内容。",
        "categories": [
          {
            "category": "目标、测验与面试覆盖",
            "score": 7,
            "maxScore": 25,
            "evidence": "目标、概念和完成标准已映射，但缺少资源证据，且任务未提供测验、面试或练习字段。"
          },
          {
            "category": "知识结构与跨章衔接",
            "score": 6,
            "maxScore": 20,
            "evidence": "只有阻塞大纲和课程字段草稿，不能形成满足章节标准的正式教学结构。"
          },
          {
            "category": "来源与不确定性",
            "score": 0,
            "maxScore": 25,
            "evidence": "资源正文和项目注册表均未核验，候选 ID 不可作为可解析引用。"
          },
          {
            "category": "教学可读性与例子",
            "score": 6,
            "maxScore": 20,
            "evidence": "草稿可读，但没有证据支持的术语定义、机制、工程意义或具体例子。"
          },
          {
            "category": "版权与数据契约",
            "score": 0,
            "maxScore": 10,
            "evidence": "实际项目测试报告 knowledge-note schema assertion failed；在无法读取产物正文的限制下不能进一步定位字段缺陷。"
          }
        ],
        "total": 19,
        "releaseGates": [
          {
            "gate": "所有 sourceIds 同时存在于 lesson evidence set 和项目资源注册表",
            "status": "failed",
            "reason": "未获授权读取资源正文或项目注册表，无法完成双重解析。"
          },
          {
            "gate": "总分至少 85/100",
            "status": "failed",
            "reason": "当前得分为 19/100。"
          },
          {
            "gate": "适用的项目数据与渲染测试通过",
            "status": "failed",
            "reason": "npm test -- learning-notes-fail 以退出码 1 结束，knowledge-note schema assertion failed。"
          }
        ],
        "testStatus": "failed",
        "coverageGaps": [
          "全部学习产出缺少可访问资源正文支持。",
          "未提供测验、面试问题或练习字段，无法审计这些评估产出的覆盖情况。"
        ],
        "evidenceRoleCorrections": [
          "res-project-audit-guide 保持为 metadata-only 候选项和 extension，不提升为 core。"
        ],
        "courseFieldProvenanceViolations": [],
        "remainingLimitations": [
          "未读取现有产物正文，无法定位 schema assertion 对应的具体字段。",
          "证据门失败与测试失败相互独立，两者均阻止发布。"
        ]
      }
    }
  ]
}
```

#### Ordered access-log JSON（路径已规范化）

```json
{
  "actualToolCalls": [
    {
      "order": 1,
      "tool": "functions.exec",
      "nestedCalls": [
        {
          "tool": "tools.exec_command",
          "operation": "cat",
          "path": "<repo-root>/.agents/skills/build-learning-module-notes/SKILL.md"
        }
      ]
    },
    {
      "order": 2,
      "tool": "functions.exec",
      "nestedCalls": [
        {
          "tool": "tools.exec_command",
          "operation": "cat",
          "path": "<repo-root>/.agents/skills/build-learning-module-notes/references/source-policy.md"
        },
        {
          "tool": "tools.exec_command",
          "operation": "cat",
          "path": "<repo-root>/.agents/skills/build-learning-module-notes/references/chapter-standard.md"
        },
        {
          "tool": "tools.exec_command",
          "operation": "cat",
          "path": "<repo-root>/.agents/skills/build-learning-module-notes/references/data-contract.md"
        },
        {
          "tool": "tools.exec_command",
          "operation": "cat",
          "path": "<repo-root>/.agents/skills/build-learning-module-notes/references/quality-rubric.md"
        }
      ],
      "executionMode": "parallel"
    },
    {
      "order": 3,
      "tool": "functions.exec",
      "nestedCalls": [
        {
          "tool": "tools.exec_command",
          "operation": "cat",
          "path": "<repo-root>/docs/superpowers/skill-tests/fixtures/project-test-runs.json"
        }
      ]
    }
  ],
  "actualReadFiles": [
    "<repo-root>/.agents/skills/build-learning-module-notes/SKILL.md",
    "<repo-root>/.agents/skills/build-learning-module-notes/references/source-policy.md",
    "<repo-root>/.agents/skills/build-learning-module-notes/references/chapter-standard.md",
    "<repo-root>/.agents/skills/build-learning-module-notes/references/data-contract.md",
    "<repo-root>/.agents/skills/build-learning-module-notes/references/quality-rubric.md",
    "<repo-root>/docs/superpowers/skill-tests/fixtures/project-test-runs.json"
  ]
}
```

#### After-the-fact leakage audit

Fixture 提供了实际 commands/results，但 clean prompt 没有给出预期的 artifact-to-status 映射，没有暗示 blocked 产物必须保留 passed/failed、禁止改写为 `not applicable`，也没有给出 `tests`、`qualityAudit` 或 release-gate 字段提示。因此本例检验的是 Skill 是否让证据阻塞状态与项目测试状态保持独立，而不是复述提示中的预期答案。

#### Semantic assertions

以下断言以两个上方 JSON fence 的文本分别绑定为 `firstRawJson` 与 `orderedAccessLogJson`；两者均经 `JSON.parse`，解析记录为 `passed`。

```js
const assert = require('node:assert/strict');
const raw = JSON.parse(firstRawJson);
const access = JSON.parse(orderedAccessLogJson);
assert.equal(Array.isArray(access.actualToolCalls), true);
assert.equal(Array.isArray(access.actualReadFiles), true);
const pass = raw.artifacts.find((item) => item.artifactId === 'existing-project-pass');
const fail = raw.artifacts.find((item) => item.artifactId === 'existing-project-fail');
assert.equal(pass.status, 'blocked');
assert.equal(fail.status, 'blocked');
assert.equal(pass.publicationReady, false);
assert.equal(fail.publicationReady, false);
assert.equal(pass.tests.status, 'passed');
assert.deepEqual(pass.tests.commands, ['npm test -- learning-notes-pass']);
assert.deepEqual(pass.tests.results, [{ command: 'npm test -- learning-notes-pass', exitCode: 0, summary: '1 suite passed; 12 tests passed' }]);
assert.equal(fail.tests.status, 'failed');
assert.deepEqual(fail.tests.commands, ['npm test -- learning-notes-fail']);
assert.deepEqual(fail.tests.results, [{ command: 'npm test -- learning-notes-fail', exitCode: 1, summary: '1 suite failed; knowledge-note schema assertion failed' }]);
assert.notEqual(pass.tests.status, 'not applicable');
assert.notEqual(fail.tests.status, 'not applicable');
assert.equal(pass.qualityAudit.releaseGates.some((gate) => gate.status === 'failed'), true);
assert.equal(fail.qualityAudit.releaseGates.some((gate) => gate.status === 'failed'), true);
assert.equal(pass.qualityAudit.testStatus, pass.tests.status);
assert.equal(fail.qualityAudit.testStatus, fail.tests.status);
// Both artifacts remain evidence-blocked while preserving their independent passed/failed test outcomes.
```

- FIRST raw JSON parse: `passed`
- ordered access-log JSON parse: `passed`
- semantic assertions: `passed`
