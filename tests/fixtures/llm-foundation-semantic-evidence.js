const evidence = (patterns) => Object.freeze([...patterns]);

export const assessmentTextEvidenceContracts = Object.freeze({
  'quiz-llm-01-1': Object.freeze({
    'field-map': evidence([/LLM.*深度学习|深度学习.*LLM/s]),
    'model-boundary': evidence([/LLM.*生成模型.*视觉、语音/s]),
  }),
  'quiz-llm-01-2': Object.freeze({
    'application-diagnosis': evidence([/事实错误.*可复现样例.*定位错误来源/s, /知识、检索、提示.*模型能力/s]),
  }),
  'quiz-llm-02-1': Object.freeze({
    'training-cycle': evidence([/反向传播.*梯度.*优化器/s]),
    backpropagation: evidence([/反向传播.*链式法则.*梯度/s]),
    optimizer: evidence([/参数修改.*优化器/s]),
  }),
  'quiz-llm-02-2': Object.freeze({
    activation: evidence([/非线性激活.*线性变换.*非线性关系/s]),
  }),
  'quiz-llm-03-1': Object.freeze({
    tokenization: evidence([/token.*tokenizer.*词表.*编码规则/is]),
  }),
  'quiz-llm-03-2': Object.freeze({
    'context-budget': evidence([/上下文.*窗口上限.*容量约束/s]),
    'context-strategy': evidence([/无关或冲突信息.*噪声、冲突.*关键证据/s]),
  }),
  'quiz-llm-04-1': Object.freeze({
    'qkv-attention': evidence([/Query.*Key.*权重.*Value/s]),
    'scaled-dot-product': evidence([/Query.*Key.*缩放点积.*softmax.*Value/is]),
  }),
  'quiz-llm-04-2': Object.freeze({
    'causal-mask': evidence([/因果掩码.*未来 token.*下一 token/s]),
  }),
  'quiz-llm-05-1': Object.freeze({
    'method-selection': evidence([/每天更新.*给出处.*优先.*RAG/s]),
    'rag-finetuning': evidence([/RAG.*可更新.*可引用.*权限.*版本/s]),
  }),
  'quiz-llm-05-2': Object.freeze({
    lora: evidence([/LoRA.*低秩.*冻结.*训练数据.*验证/s]),
  }),
  'quiz-llm-06-1': Object.freeze({
    'logit-softmax': evidence([/temperature.*logits.*概率分布/is]),
    'temperature-top-p': evidence([/temperature.*分布.*更平.*更尖/s]),
  }),
  'quiz-llm-06-2': Object.freeze({
    'kv-cache': evidence([/KV Cache.*历史 token.*K\/V.*复用/s]),
  }),
  'quiz-llm-07-1': Object.freeze({
    'schema-pipeline': evidence([/JSON.*Schema.*业务规则校验/s]),
  }),
  'quiz-llm-07-2': Object.freeze({
    'instruction-boundary': evidence([/忽略之前规则.*不可信数据.*高层规则/s]),
  }),
  'quiz-llm-08-1': Object.freeze({
    'injection-defense': evidence([/Prompt Injection.*最小权限.*参数校验.*敏感动作确认/s]),
    'model-application-boundary': evidence([/安全边界.*权限.*验证.*隔离.*人工控制/s]),
  }),
  'quiz-llm-08-2': Object.freeze({
    'eval-funnel': evidence([/离线评测集.*真实需求.*生产失败样例.*回归/s]),
  }),
  'iq-llm-01-1': Object.freeze({
    'field-map': evidence([/AI.*机器学习.*深度学习.*LLM/s]),
    'model-boundary': evidence([/LLM.*深度学习.*语言建模.*生成模型/s]),
  }),
  'iq-llm-01-2': Object.freeze({
    'training-inference-boundary': evidence([/损失.*反向传播.*优化器.*更新参数.*推理.*固定/s]),
    'autoregressive-generation': evidence([/自回归推理.*下一 token.*追加.*停止条件/s]),
  }),
  'iq-llm-01-3': Object.freeze({
    'application-diagnosis': evidence([/应用开发.*模型开发.*评测.*微调.*训练/s]),
  }),
  'iq-llm-02-1': Object.freeze({
    'training-cycle': evidence([/预测.*损失.*反向传播.*优化器.*更新参数/s]),
    backpropagation: evidence([/反向传播.*链式法则.*参数梯度/s]),
    optimizer: evidence([/优化器.*学习率.*更新参数/s]),
    'learning-rate': evidence([/学习率过小.*过大.*震荡.*发散/s]),
  }),
  'iq-llm-02-2': Object.freeze({
    activation: evidence([/激活函数.*非线性.*多层.*线性变换/s]),
  }),
  'iq-llm-02-3': Object.freeze({
    generalization: evidence([/训练损失.*验证集.*过拟合.*上线/s]),
  }),
  'iq-llm-03-1': Object.freeze({
    tokenization: evidence([/Token.*tokenizer.*词表.*编码规则/is]),
  }),
  'iq-llm-03-2': Object.freeze({
    'embedding-position': evidence([/Embedding.*token ID.*连续向量.*位置表示/s]),
  }),
  'iq-llm-03-3': Object.freeze({
    'context-budget': evidence([/长上下文.*系统指令.*输出.*token 预算.*截断/s]),
    'context-strategy': evidence([/检索、摘要、分段.*结构化状态.*压缩历史/s]),
  }),
  'iq-llm-04-1': Object.freeze({
    'qkv-attention': evidence([/Query.*Key.*权重.*Value/s]),
    'scaled-dot-product': evidence([/缩放点积|除以.*平方根/s]),
  }),
  'iq-llm-04-2': Object.freeze({
    'multi-head': evidence([/多头注意力.*多组独立投影.*并行.*拼接/s]),
  }),
  'iq-llm-04-3': Object.freeze({
    'transformer-block': evidence([/残差连接.*归一化.*Transformer.*深层/s]),
  }),
  'iq-llm-05-1': Object.freeze({
    'training-stages': evidence([/预训练.*SFT.*偏好优化/s]),
    'preference-boundary': evidence([/成对偏好.*奖励信号.*有用性、安全性.*回答风格/s]),
  }),
  'iq-llm-05-2': Object.freeze({
    'method-selection': evidence([/微调.*RAG.*选择/s]),
    'rag-finetuning': evidence([/稳定行为.*微调.*频繁更新.*出处.*RAG/s]),
  }),
  'iq-llm-05-3': Object.freeze({
    lora: evidence([
      /LoRA.*冻结.*低秩矩阵.*增量/s,
      /微调成本.*训练显存.*存储.*成本/s,
    ]),
  }),
  'iq-llm-06-1': Object.freeze({
    'logit-softmax': evidence([/logits.*temperature.*softmax.*概率/is]),
    'temperature-top-p': evidence([/temperature.*top-p.*候选集合/s]),
    'sampling-loop': evidence([/采样.*追加.*KV Cache.*停止条件/s]),
  }),
  'iq-llm-06-2': Object.freeze({
    'kv-cache': evidence([/KV Cache.*Key、Value.*复用.*前缀/s]),
    'latency-cost': evidence([/代价.*显存.*并发/s]),
  }),
  'iq-llm-06-3': Object.freeze({
    'latency-cost': evidence([/推理延迟.*成本.*首 token 延迟.*排队时间/s]),
  }),
  'iq-llm-07-1': Object.freeze({
    'runtime-contract': evidence([/Prompt.*任务.*输入边界.*约束.*成功标准.*失败行为/s]),
    'instruction-boundary': evidence([/高层指令.*不可信数据/s]),
    'versioned-evaluation': evidence([/提示版本.*模型版本.*评测集.*变更记录/s]),
  }),
  'iq-llm-07-2': Object.freeze({
    'schema-pipeline': evidence([/JSON.*Schema.*业务校验/s]),
    'retry-repair': evidence([/重试.*限制次数|有限重试.*降级/s]),
  }),
  'iq-llm-07-3': Object.freeze({
    'instruction-boundary': evidence([/指令层级.*Prompt Injection.*不可信数据.*模型之外/s]),
  }),
  'iq-llm-08-1': Object.freeze({
    'failure-taxonomy': evidence([/知识缺失.*检索失败.*推理错误.*格式错误/s]),
    grounding: evidence([/证据检索.*引用.*工具.*人工复核/s]),
  }),
  'iq-llm-08-2': Object.freeze({
    'eval-funnel': evidence([/LLM Evals.*真实需求.*失败日志.*版本化样本.*持续回归/s]),
  }),
  'iq-llm-08-3': Object.freeze({
    'release-pareto': evidence([/质量、安全、成本和延迟.*发布决策.*Pareto/s]),
  }),
});

export const sourceImpactTargetTextContracts = Object.freeze({
  'claim:ai-field-model-application-agent-spine': Object.freeze({
    semanticKey: 'field-spine',
    patterns: evidence([/AI.*模型方法.*应用系统.*Agent runtime.*LLM.*模型组件/s]),
  }),
  'claim:inference-context-does-not-update-parameters': Object.freeze({
    semanticKey: 'training-inference-boundary',
    patterns: evidence([/训练闭环.*反向传播.*优化器.*更新参数.*推理.*前向计算/s]),
  }),
  'claim:context-is-not-persistent-memory': Object.freeze({
    semanticKey: 'context-memory-boundary',
    patterns: evidence([/上下文窗口.*transcript.*持久记忆.*外部系统/s]),
  }),
  'claim:attention-needs-original-mechanism-verification': Object.freeze({
    semanticKey: 'attention-verification',
    patterns: evidence([/Q、K、V.*scaled dot-product.*因果掩码.*Transformer block.*原论文/s]),
  }),
  'claim:version-the-whole-llm-system': Object.freeze({
    semanticKey: 'system-versioning',
    patterns: evidence([/模型.*Prompt.*工具 Schema.*eval set.*版本化.*系统元组/s]),
  }),
  'claim:seed-is-not-cross-version-determinism': Object.freeze({
    semanticKey: 'seed-version-boundary',
    patterns: evidence([/greedy.*seed.*不能保证.*跨模型版本.*一致输出/s]),
  }),
  'claim:valid-json-is-not-valid-action': Object.freeze({
    semanticKey: 'structured-output-validation',
    patterns: evidence([/JSON.*Schema.*权限.*业务不变量.*validate.*repair/s]),
  }),
  'claim:evaluation-is-an-operating-loop': Object.freeze({
    semanticKey: 'evaluation-loop',
    patterns: evidence([/dataset.*rubric.*offline eval.*model grader.*human review.*production monitoring/s]),
  }),
  'claim:model-safety-is-not-application-control': Object.freeze({
    semanticKey: 'model-application-control-boundary',
    patterns: evidence([/模型安全.*最小权限.*参数校验.*人工确认.*监控.*kill switch/s]),
  }),
  'claim:tool-transcript-is-not-execution-proof': Object.freeze({
    semanticKey: 'tool-execution-truth',
    patterns: evidence([/tool call.*transcript.*不能证明.*实际执行.*observation.*日志/s]),
  }),
  'section:llm-07/prompt-as-runtime-contract': Object.freeze({
    semanticKey: 'tool-contract',
    patterns: evidence([/Prompt.*运行时契约.*instruction.*message role.*tool definition.*执行.*observation/s]),
  }),
  'media-candidate:javaguide-llm-mechanism-figures': Object.freeze({
    semanticKey: 'third-party-mechanism-figures',
    patterns: evidence([/JavaGuide LLM 运行机制.*Attention.*Transformer.*第三方图表候选/s]),
  }),
});
