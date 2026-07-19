# LLM 基础学习模块与可扩展 Agent 学习站设计

## 1. 背景

现有站点是一个单文件 Agent 知识地图，能够切换八个知识领域，但内容、样式和交互全部嵌在 `index.html` 中。它适合总览，不适合持续扩充课程、资源、练习、面试题和学习状态。

本次把站点改造成数据驱动的交互式学习应用。LLM 基础是第一个完整模块；RAG、Agent 核心机制、Harness、后端工程、评测、安全、Multi-Agent/MCP 和项目面试等后续模块先保留清晰入口与依赖关系，之后使用同一数据协议逐步补充。

## 2. 已确认的产品决策

- 默认学习方式：主线课程与自由探索并存。
- 首版范围：搭建完整学习框架，充实 LLM 基础；其他模块显示简介、依赖和待开放状态。
- 技术方案：原生 ES Modules 数据驱动静态应用，不引入前端框架或构建依赖。
- 进度保存：浏览器 `localStorage`；不可用时降级为当前会话内存状态。
- 页面结构：推荐下一步与迷你地图共存的双层混合布局。
- 视觉方向：纸张研究实验室——温暖纸色、深绿墨色、朱红重点、黄色批注。
- 每个模块必须包含课程、资源、练习和面试高频四类内容。

## 3. 目标与非目标

### 3.1 目标

1. 让初学者始终知道下一步学什么，同时可以查看完整知识依赖。
2. 把知识点转化为可验证的学习产出，而不是仅提供链接收藏。
3. 提供可交互的概念实验、自测、进度和面试复习。
4. 让新增模块主要变成结构化数据工作，不需要重写页面结构。
5. 保持纯静态部署能力，兼容当前托管方式。

### 3.2 非目标

- 首版不提供账号、云同步、服务端数据库或多人协作。
- 首版不训练或微调真实大模型。
- 首版不完整实现后续 Agent 模块，只提供可理解的模块目录和解锁条件。
- 首版不引入 React、Vue、Vite 或第三方状态管理库。

## 4. 信息架构

### 4.1 全局框架

- 顶部：站点品牌、当前模块、总进度、移动端模块选择。
- 左侧：模块导航、模块状态、先修关系。
- 主内容：根据当前视图渲染首页、学习主线、知识地图、资源库、面试高频或学习进度。

### 4.2 六种视图

1. **模块首页**：推荐下一步、总进度、迷你知识地图、最近学习、待复习面试题。
2. **学习主线**：按依赖排序的课程卡片和完成条件。
3. **知识地图**：节点、依赖和状态；点击节点进入相应课程。
4. **资源库**：按语言、平台、类型、难度筛选的精选资料。
5. **面试高频**：问题卡、展开答案、掌握状态和复习队列。
6. **学习进度**：课程进度、面试掌握度、最近活动和重置入口。

## 5. LLM 基础课程

LLM 基础首版包含八节，每节都包含学习目标、核心概念、解释、精选资源、动手练习、自测题、面试题和完成条件。

| 顺序 | 课程 | 核心内容 | 完成产出 |
|---|---|---|---|
| 1 | AI、机器学习与 LLM | AI/ML/DL/生成模型关系；训练与推理；应用开发与模型开发差异 | 画出概念关系并选定 Agent 应用开发主线 |
| 2 | 神经网络与反向传播 | 张量、线性层、激活、损失、梯度、优化 | 用自己的话解释一次参数更新 |
| 3 | Token、Embedding 与上下文 | Tokenization、向量表示、上下文窗口、位置 | 完成 Token 与上下文预算实验 |
| 4 | Attention 与 Transformer | Q/K/V、自注意力、多头注意力、残差、归一化、Decoder-only | 操作 Attention 演示并解释信息流 |
| 5 | 预训练、微调与对齐 | 预训练、SFT、偏好优化、LoRA、数据质量 | 比较训练方式的目标、成本与适用场景 |
| 6 | 推理、采样与 KV Cache | Logits、Softmax、Temperature、Top-p、Stop、KV Cache | 完成采样参数对比实验 |
| 7 | Prompt 与结构化输出 | 指令层级、Few-shot、约束、JSON Schema、校验与重试 | 设计稳定的结构化输出契约 |
| 8 | 能力边界、评测与安全 | 幻觉、非确定性、上下文污染、评测、提示注入、成本与延迟 | 为一个 LLM 功能建立测试清单 |

## 6. 交互实验

### 6.1 Token 与上下文预算

- 用户输入或选择文本。
- 使用明确标注的教学型近似分词规则统计 token，不冒充真实模型 tokenizer。
- 显示系统指令、历史、检索内容和输出预算如何占用上下文窗口。
- 核心计算保持纯函数，便于测试。

### 6.2 Self-Attention 关系演示

- 提供一组短句 token。
- 用户选择当前 token，并调整预设关联权重。
- 界面显示 Q/K 匹配、归一化权重和加权读取的直觉结果。
- 目标是建立直觉，不模拟完整神经网络数值计算。

### 6.3 Temperature / Top-p 采样对比

- 使用固定候选 token 与 logits，确保可重复验证。
- 调整 Temperature 和 Top-p，显示概率分布与候选集合变化。
- 提供“稳定回答”和“创意生成”两个任务，让用户比较参数取舍。

## 7. 面试高频系统

每个模块都必须拥有独立面试题集合。首版完整实现 LLM 基础题库，后续模块在开放时遵守同一协议。

### 7.1 每道题的数据

- 问题文本。
- 30 秒简答。
- 深挖要点。
- 常见误区。
- 追问题。
- 关联课程节点。
- 频率：高 / 中 / 补充。
- 难度：基础 / 进阶 / 深挖。
- 岗位：Agent 开发 / AI 应用 / 后端工程，可多选。

### 7.2 交互

- 默认只显示问题，用户主动展开答案。
- 支持标记“未掌握 / 复习中 / 已掌握”。
- 支持加入复习队列。
- 首页显示待复习题；课程进度和面试掌握度分开统计。
- 每个课程页显示与该课程相关的面试题。

### 7.3 LLM 基础首版覆盖

Transformer、Attention、Embedding、训练与对齐、微调与 RAG 的边界、推理参数、KV Cache、Prompt、结构化输出、幻觉、上下文窗口、模型评测、成本/延迟和提示注入。

## 8. 数据模型

数据使用 JavaScript ES Module 导出，避免运行时请求 JSON 造成 `file://` 兼容问题。

### 8.1 Module

```js
{
  id,
  order,
  title,
  summary,
  status,          // active | planned | locked
  prerequisites,
  lessons,
  resources,
  interviewQuestions
}
```

### 8.2 Lesson

```js
{
  id,
  moduleId,
  order,
  title,
  durationMinutes,
  summary,
  objectives,
  concepts,
  explanations,
  resourceIds,
  exercise,
  quiz,
  interviewQuestionIds,
  completionCriteria
}
```

### 8.3 Resource

```js
{
  id,
  title,
  url,
  source,
  language,
  type,
  difficulty,
  stage,
  value,
  verifiedAt
}
```

### 8.4 ProgressState

```js
{
  version,
  currentModuleId,
  currentLessonId,
  completedLessonIds,
  quizResults,
  interviewStatusById,
  reviewQueue,
  lastVisitedAt
}
```

## 9. 技术架构与文件边界

```text
index.html                 页面壳与语义区域
styles/
  tokens.css               色彩、字体、间距、阴影、动效变量
  app.css                  布局与组件样式
src/
  app.js                   启动、路由和事件协调
  data/
    modules.js             模块目录和待开放信息
    llm-foundation.js      课程、资源、练习和面试题
  core/
    progress.js            状态创建、迁移、统计
    storage.js             localStorage 与内存降级
    filters.js             资源与面试题筛选
    quiz.js                自测评分
    experiments.js         三个实验的纯计算函数
  ui/
    shell.js               全局框架
    dashboard.js           模块首页
    curriculum.js          学习主线与课程详情
    knowledge-map.js       地图渲染与跳转
    resources.js           资源库
    interviews.js          面试题与复习队列
    progress-view.js       进度页
tests/
  *.test.js                Node 内置测试
package.json               仅定义本地测试与静态服务命令
```

核心规则：数据不包含任意 HTML；UI 使用 DOM API 和 `textContent` 渲染用户可见内容。地图、课程页、首页和面试视图都从同一模块数据派生。

## 10. 本地状态与错误处理

- 存储键包含应用名和 schema 版本。
- 读取时验证必要字段，损坏或过期状态迁移为安全默认值。
- `localStorage` 抛错时切换到内存存储，并在界面显示非阻断提示。
- 数据引用缺失时跳过孤立条目并输出开发期诊断，不让整页崩溃。
- 外部资源始终使用 HTTPS、新窗口打开，并设置 `noopener noreferrer`。
- 重置进度需要二次确认，只清理本应用的存储键。

## 11. 视觉与交互规范

- 视觉隐喻：一本持续增补的研究手册，而不是管理后台。
- 主色：深绿墨色；强调：朱红；批注：暖黄；背景：温暖纸色。
- 标题使用书刊感衬线字体栈，正文使用清晰的中文无衬线字体栈；不依赖字体下载才能阅读。
- 卡片边界更接近纸张分隔、批注线和标签，避免大量圆角悬浮卡片。
- 动效只用于进度、节点状态和视图切换，并尊重 `prefers-reduced-motion`。
- 桌面使用侧栏和双栏内容；移动端使用模块选择器和单栏学习流。
- 所有可交互元素支持键盘操作、清晰焦点、语义标签和足够对比度。

## 12. 资源准入规则

优先级：官方文档/课程与代码库 > 高校课程 > 原作者讲解 > 高质量社区项目 > 内容平台补充。

资源条目必须能确认真实链接、作者或机构、适合阶段和学习价值。小红书、抖音等难以公开核验或内容碎片化的平台不承担主学习路线，只在能稳定验证时作为补充。

首版核心来源包括：

- Microsoft AI for Beginners、Generative AI for Beginners、AI Agents for Beginners。
- Hugging Face LLM Course 与 Agents Course。
- Karpathy `nn-zero-to-hero` 与 Let’s build GPT。
- Sebastian Raschka `LLMs-from-scratch`。
- Datawhale `happy-llm`、`llm-universe`、`hello-agents`。
- OpenAI Cookbook 与 Agents SDK。
- Anthropic Building Effective Agents。
- 3Blue1Brown、跟李沐学 AI、王木头学科学、ZOMI 酱等已核验视频入口。

## 13. 测试与验收

### 13.1 自动测试

- 进度计算、课程完成和面试掌握度分开统计。
- 状态 schema 迁移与损坏状态降级。
- 存储不可用时的内存回退。
- 资源和面试题多条件筛选。
- 自测评分与解释选择。
- Token 预算、Attention 权重归一化、Temperature/Top-p 计算。

### 13.2 手动与视觉验收

- 主导航、课程跳转、地图跳转、筛选、自测、完成、复习和重置流程可用。
- 刷新后学习状态保留。
- 桌面宽屏与窄屏移动布局无横向溢出。
- 键盘可遍历所有核心操作，焦点始终可见。
- 减少动效设置生效。
- 资源外链正确且不替换当前学习页面。

## 14. 扩展协议

新增模块时必须：

1. 在模块目录声明顺序、状态、简介和先修依赖。
2. 提供课程节点、精选资源、动手练习和面试题。
3. 保证所有资源 ID、课程 ID 和面试题 ID 引用有效。
4. 为新增纯计算逻辑添加测试。
5. 不直接修改通用视图来适配单一模块；确需新交互时以独立组件扩展。

## 15. 首版完成标准

- 新结构替代当前单文件嵌套可视化实现，并保持静态部署。
- LLM 基础八节均可浏览，内容、资源、练习、自测和高频面试题完整可用。
- 三个交互实验可操作且核心计算有自动测试。
- 六种视图可切换，地图和课程共享状态。
- 本地进度能保存、恢复、统计和重置，并能安全降级。
- 后续模块入口清晰，新增模块有明确数据协议。
- 自动测试通过，桌面与移动视觉验收完成。
