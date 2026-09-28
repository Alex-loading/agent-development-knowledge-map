# 第六模块核心、实验界面与数据独立审查

审查日期：2026-09-18。范围为 [核心计算](/Users/octopus/codes/Agent-learner/agent-development-knowledge-map/src/core/evals.js)、[实验界面](/Users/octopus/codes/Agent-learner/agent-development-knowledge-map/src/ui/evals-experiments.js)、[固定教学数据](/Users/octopus/codes/Agent-learner/agent-development-knowledge-map/src/data/evals-fixtures.js)和[资源登记表](/Users/octopus/codes/Agent-learner/agent-development-knowledge-map/src/data/evals-resources.js)。审查者没有编写这些文件，审查过程保持只读。

核心计算、输入限制、界面数据表达和资源引用通过本次审查，没有发现待处理的 P1/P2 问题。安全实验明确呈现攻击与正常样本的两个分母。真实浏览器交互由主代理统一执行，本记录不将源码审查或 Node 结果表述为浏览器验证。

## 重点检查结果

### 安全结果区保留两个样本分母

位置：[evals-experiments.js 第 135 行](/Users/octopus/codes/Agent-learner/agent-development-knowledge-map/src/ui/evals-experiments.js:135)。结果区展示检测命中、检测漏报、正常误拒、越权副作用，同时使用核心返回的 `attackSuccesses` 与 `attacks` 呈现攻击成功分子和分母。当前六条数据包含两条攻击和四条正常记录；正常样本数及正常误拒分子也分别可见。

`eval-07` 正文与练习要求逐配置保留攻击分母和正常分母。界面数据表达与这一要求一致，攻击成功比例也明确限定到当前案例的越权动作目标。主代理已通过真实浏览器读取四个配置的这些数值；本审查独立验证了其对应的实际函数输出。

## 核心行为核对

### 发布门槛

[第 30–68 行](/Users/octopus/codes/Agent-learner/agent-development-knowledge-map/src/core/evals.js:30)验证案例 ID 唯一、同一批案例、相同切片和合法评分。`null` 表示未评分，未被转换为失败或成功；分母同时保留总数与已评数。整体及切片下降只在双方评分完整时判断，关键失败优先于证据不足。

直接调用真实导出的函数和六条课程记录，得到以下结果。所有配置采用零下降容差；除特别说明外，每组最少样本为 2，关键失败为 0。

| 真实函数输入 | 总体基线 → 候选 | 状态 | 与教学规则的关系 |
| --- | --- | --- | --- |
| 候选逐项等于基线 | 5/6 → 5/6 | pass | 当前数据满足规则 |
| 同上，每组最少样本为 3 | 5/6 → 5/6 | hold | 长文档仅 2 条 |
| 修好 faq-d，同时 long-b 失败 | 5/6 → 5/6 | block | 长文档 2/2 → 1/2 |
| 候选所有评分为 null | 5/6 → 未知 | hold | 没有完整配对评分 |
| 候选所有评分为 null，关键失败为 1 | 5/6 → 未知 | block | 已知关键失败继续有效 |

界面在“候选与基线相同”时使用每条记录的 `row.passed`，因此保留 `faq-d` 的基线失败，没有将全部案例误写为通过。允许下降按百分点输入，再除以 100 交给核心函数；边界包含 0 与 100。

### 重复试验

[第 71–76 行](/Users/octopus/codes/Agent-learner/agent-development-knowledge-map/src/core/evals.js:71)仅计算给定单任务成功概率、独立同分布尝试下的两种概率。`p=0.8`、`k=3` 实际计算得到至少一次成功 0.992、全部成功约 0.512。浮点表示中的末位误差通过百分比格式化呈现。

UI 输入和结果明确限定同一任务，说明不能代入跨任务平均成功率，也没有将结果描述为发布规则的置信区间。它没有实现经验 pass^k 估计器；课程的统计边界与实际函数一致。

### 追踪采样与字段投影

[第 81–102 行](/Users/octopus/codes/Agent-learner/agent-development-knowledge-map/src/core/evals.js:81)对固定记录进行三种选择，返回已知总体和保留集合的各自分母。直接调用真实课程数据获得：

| 模式 | 保留数 / 总数 | 保留集合错误率 | 返回结果含教学敏感标记 |
| --- | --- | ---: | --- |
| all | 6/6 | 33.3% | 否 |
| head-demo | 2/6 | 0% | 否 |
| errors-only | 2/6 | 100% | 否 |

返回属性仅保留 `modelVersion`、`promptVersion`、`stage`，并验证值为字符串。原始 `prompt`、`token`、`output` 未进入结果。UI 还明确说明字段允许列表需要配合字段值审查；该函数没有声称可以识别任意字符串中的秘密。

### 安全回归

[第 105–130 行](/Users/octopus/codes/Agent-learner/agent-development-knowledge-map/src/core/evals.js:105)分别计算检测标签、策略拒绝、执行与越权后果。执行端阻止动作不会把分类器漏报重新算作命中。真实六条记录的四个配置结果如下：

| 教学分类器 | 执行端策略 | 检测漏报 | 正常误拒 | 越权副作用 | 当前攻击目标成功率 |
| --- | --- | ---: | ---: | ---: | ---: |
| 开启 | 开启 | 1 | 1 | 0 | 0/2 |
| 开启 | 关闭 | 1 | 1 | 1 | 1/2 |
| 关闭 | 开启 | 2 | 0 | 0 | 0/2 |
| 关闭 | 关闭 | 2 | 0 | 2 | 2/2 |

空攻击集合返回 `null` 比例；正常误拒只统计本来允许且未执行的正常任务。攻击成功率限定到当前记录定义的越权动作，UI 与正文都说明它没有覆盖所有攻击面或真实检测器。

## 界面源码核对范围

- 数字控件通过 `Number.isInteger` 及实际 min/max 检查。空输入转换为 NaN，出现范围提示；正常计算路径没有用兜底文案吞掉核心异常。
- `label` 与输入 ID 关联，结果区域使用 `aria-live="polite"` 与 `aria-atomic="true"`。reset 恢复所有参数并将焦点交回首个控件。
- 用户可见文本经过现有 `element()` 的 `textContent` 路径写入，结果区没有将数据插入可执行 HTML。
- 三个实验调用实际核心函数及课程数据，没有真实模型、网络、收费、导出或工具执行动作。

本节记录源码核对。焦点实际行为、键盘操作、浏览器输入语义和实时区域属性的真实浏览器检查见[课程与集成验收](2026-09-18-evals-observability-security.md)。

## 教学数据与资源登记

三组教学数据均通过 `deepFreeze` 固定。发布数据包含 4 条常规问答与 2 条长文档；追踪数据包含 6 条记录及 2 条错误；安全数据包含 2 条攻击与 4 条正常记录。可见示例、正文计数与真实函数结果一致。

22 个资源具有 22 个唯一 ID 与 22 个唯一 URL，均使用 HTTPS；课程归属双向关联，所有章节引用能解析，来源角色没有把 `extension` 用作核心正文支持。资源卡保留 `authority`、`role`、正文访问范围、核验日期与限制，动态产品文档和固定论文版本分别注明。

本审查独立核验的正文覆盖四课使用的 5 份评测资料和安全课程使用的 8 份官方资料。其余资源的结构与引用纳入本次检查，正文范围由对应研究记录说明；这里没有把字段存在等同于独立阅读完成。安全来源的 URL、读取范围与限制见 [安全资料记录](/Users/octopus/codes/Agent-learner/agent-development-knowledge-map/docs/research/2026-09-18-evals-security-research.md)。

## 实际验证记录

| 命令 | 结果 |
| --- | --- |
| `node --test tests/evals-core.test.js tests/evals-module.test.js` | 7 项通过，0 项失败，退出码 0 |
| `node --test tests/evals-core.test.js tests/evals-module.test.js tests/evals-visuals.test.js` | 9 项通过，0 项失败，退出码 0 |
| `node scripts/generate-evals-visuals.mjs --check` | 16 幅图通过，退出码 0 |
| `node --check src/core/evals.js` | 语法检查通过 |
| `node --check src/ui/evals-experiments.js` | 语法检查通过 |

直接计算使用的是仓库实际导出的函数及实际课程数据，未替换浏览器、DOM、网络或运行环境。审查没有创建 fake/mock 测试，也没有进行截图或视觉检查。主代理的真实浏览器记录与图资产验收记录应独立保留；本报告不能替代这些验证。
