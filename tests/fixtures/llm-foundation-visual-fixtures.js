function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

export function formatFixtureExpected(result) {
  return `结构化 result：${JSON.stringify(result, (_key, value) => {
    if (value === Infinity) return 'Infinity';
    if (value === -Infinity) return '-Infinity';
    return value;
  })}`;
}

function fixture(visualId, fields, data, result) {
  return {
    id: visualId.replace(/^visual-/, 'fixture-'),
    visualId,
    fields: {
      Input: fields.Input,
      Method: fields.Method,
      Expected: formatFixtureExpected(result),
      Rounding: fields.Rounding,
    },
    data,
    result,
  };
}

export const llmFoundationVisualFixtures = deepFreeze([
  fixture(
    'visual-llm-01-autoregressive-generation',
    {
      Input:
        '教学 tokenizer v1 的原始 prompt、固定词表、首步候选 logits 与下一状态。',
      Method: '最长匹配编码 → stable softmax → greedy → 固定下一状态。',
      Rounding: '概率四位小数；ID 与步数为整数。',
    },
    {
      rawPrompt: '资料助理：查',
      vocabulary: {
        资料: 10,
        助理: 11,
        '：': 12,
        查: 13,
        天气: 14,
        资: 90,
        料: 91,
        助: 92,
        理: 93,
      },
      candidates: ['天气', '资料'],
      logits: [2, 1],
      nextStateToken: 'EOS',
    },
    {
      segments: ['资料', '助理', '：', '查'],
      encodedIds: [10, 11, 12, 13],
      probabilities: [0.7310585786300049, 0.2689414213699951],
      selectedId: 14,
      nextToken: 'EOS',
    },
  ),
  fixture(
    'visual-llm-02-training-cycle',
    {
      Input:
        'X=[[1,0,2],[0,1,1]]、W=[[1,0],[0,1],[1,1]]、b=[0,0]、Y=[[2,2],[1,1]]、学习率 0.1。',
      Method:
        'Z=XW+b → 四元素 MSE → backward 求 dZ/dW/db → SGD 更新 → 用同一批次复算。',
      Rounding: '矩阵最多两位小数；loss 展示六位小数，计算使用未舍入值。',
    },
    {
      X: [
        [1, 0, 2],
        [0, 1, 1],
      ],
      W: [
        [1, 0],
        [0, 1],
        [1, 1],
      ],
      b: [0, 0],
      Y: [
        [2, 2],
        [1, 1],
      ],
      learningRate: 0.1,
    },
    {
      Z: [
        [3, 2],
        [1, 2],
      ],
      loss: 0.5,
      dZ: [
        [0.5, 0],
        [0, 0.5],
      ],
      dW: [
        [0.5, 0],
        [0, 0.5],
        [1, 0.5],
      ],
      db: [0.5, 0.5],
      newW: [
        [0.95, 0],
        [0, 0.95],
        [0.9, 0.95],
      ],
      newB: [-0.05, -0.05],
      newZ: [
        [2.7, 1.85],
        [0.85, 1.85],
      ],
      newLoss: 0.314375,
    },
  ),
  fixture(
    'visual-llm-02-neuron-forward',
    {
      Input: 'x=2、w=0.2、b=0、标签 y=1。',
      Method: 'z=wx+b → sigmoid(z) → 二元交叉熵 -ln(p)。',
      Rounding: '展示四位小数；断言使用未舍入值。',
    },
    { x: 2, w: 0.2, b: 0, y: 1 },
    {
      z: 0.4,
      probability: 0.598687660112452,
      loss: 0.5130152523999526,
    },
  ),
  fixture(
    'visual-llm-02-backprop-graph',
    {
      Input: '共享变量 x=2、参数 w=3；a=xw、b=x²、c=a+b、L=c²/2。',
      Method:
        '先冻结 forward；再冻结每条局部导数，沿 a 与 b 两条分支反传，并在共享 x 汇合相加。',
      Rounding: '本整数教学图不舍入。',
    },
    { x: 2, w: 3 },
    {
      forward: { a: 6, b: 4, c: 10, loss: 50 },
      localGradients: {
        dLossDc: 10,
        dCda: 1,
        dCdb: 1,
        dAdx: 3,
        dAdw: 2,
        dBdx: 4,
      },
      pathContributionsToX: { viaA: 30, viaB: 40 },
      accumulated: { dLossDx: 70, dLossDw: 20 },
    },
  ),
  fixture(
    'visual-llm-02-learning-rate-trajectories',
    {
      Input: 'L(w)=(w-1)²、w0=0、η 分别为 0.1/0.5/1.1，各执行三步。',
      Method: '教学 SGD：w_next=w-η·2(w-1)，每步更新后计算 L。',
      Rounding: 'w 三位、loss 四位；断言使用未舍入值。',
    },
    { initialW: 0, targetW: 1, learningRates: [0.1, 0.5, 1.1], steps: 3 },
    {
      trajectories: [
        {
          learningRate: 0.1,
          weights: [0.2, 0.36, 0.488],
          losses: [0.64, 0.4096, 0.262144],
        },
        {
          learningRate: 0.5,
          weights: [1, 1, 1],
          losses: [0, 0, 0],
        },
        {
          learningRate: 1.1,
          weights: [2.2, -0.44, 2.728],
          losses: [1.44, 2.0736, 2.985984],
        },
      ],
    },
  ),
  fixture(
    'visual-llm-02-generalization-curves',
    {
      Input:
        'epoch=[1,2,3,4,5]，分别提供欠拟合、训练/验证同步改善、过拟合三组 train/validation loss 数组。',
      Method:
        '按完整数组比较绝对损失、同步趋势、首次 validation 最小点及其后的分叉。',
      Rounding: 'loss 两位小数；epoch 为整数。',
    },
    {
      epochs: [1, 2, 3, 4, 5],
      series: {
        underfit: {
          train: [0.95, 0.9, 0.86, 0.83, 0.81],
          validation: [1, 0.96, 0.92, 0.9, 0.89],
        },
        improving: {
          train: [0.9, 0.7, 0.55, 0.45, 0.38],
          validation: [0.95, 0.75, 0.6, 0.5, 0.44],
        },
        overfit: {
          train: [0.9, 0.6, 0.4, 0.3, 0.2],
          validation: [1, 0.7, 0.5, 0.52, 0.65],
        },
      },
    },
    {
      underfit: {
        trainMonotonicDown: true,
        validationMonotonicDown: true,
        finalTrain: 0.81,
        finalValidation: 0.89,
      },
      improving: { trainMonotonicDown: true, validationMonotonicDown: true },
      overfit: {
        trainMonotonicDown: true,
        bestEpoch: 3,
        divergenceStartsAtEpoch: 4,
      },
    },
  ),
  fixture(
    'visual-llm-03-text-to-context',
    {
      Input:
        '教学 tokenizer 将“猫坐”编码为 [4,7]；E4=[1,0]、E7=[0,1]、P0=[0.1,0]、P1=[0,0.1]。',
      Method: '固定查表并按位置逐元素相加；交换 token 顺序时位置向量不跟 token 移动。',
      Rounding: '向量一位小数。',
    },
    {
      tokenIds: [4, 7],
      embeddings: { 4: [1, 0], 7: [0, 1] },
      positions: [
        [0.1, 0],
        [0, 0.1],
      ],
    },
    {
      ordered: [
        [1.1, 0],
        [0, 1.1],
      ],
      swapped: [
        [0.1, 1],
        [1, 0.1],
      ],
    },
  ),
  fixture(
    'visual-llm-03-tokenization-comparison',
    {
      Input: '三段原始文本、教学 tokenizer A 的固定词表与 tokenizer B 的字符规则。',
      Method: 'tokenizer A 从原文执行 longest-match；tokenizer B 按 Unicode code point 切分。',
      Rounding: '计数为整数。',
    },
    {
      texts: ['AI好', '{"x":1}', 'x+=1'],
      tokenizerAVocabulary: {
        AI: 1,
        好: 2,
        '{"x":': 3,
        1: 4,
        '}': 5,
        x: 6,
        '+=': 7,
        A: 8,
        I: 9,
        '+': 10,
        '=': 11,
      },
    },
    { tokenizerACounts: [2, 3, 3], tokenizerBCounts: [3, 7, 4] },
  ),
  fixture(
    'visual-llm-03-embedding-position-space',
    {
      Input: 'IDs [4,7]、E4/E7 与 P0/P1 的固定二维教学向量。',
      Method: 'H_i=E_id+P_i，并对 [4,7] 与 [7,4] 两种顺序分别计算。',
      Rounding: '向量一位小数。',
    },
    {
      orders: [
        [4, 7],
        [7, 4],
      ],
      embeddings: { 4: [1, 0], 7: [0, 1] },
      positions: [
        [0.1, 0],
        [0, 0.1],
      ],
    },
    {
      representations: [
        [
          [1.1, 0],
          [0, 1.1],
        ],
        [
          [0.1, 1],
          [1, 0.1],
        ],
      ],
    },
  ),
  fixture(
    'visual-llm-03-context-budget',
    {
      Input:
        '窗口 100；system=20、user=15、history=25、retrieval=20、output=15、margin=5；再令 retrieval +10。',
      Method: '先预留 output/margin，再求和；超限时先从 history 删除 overflow。',
      Rounding: 'token 数为整数。',
    },
    {
      window: 100,
      allocations: {
        system: 20,
        user: 15,
        history: 25,
        retrieval: 20,
        output: 15,
        margin: 5,
      },
      retrievalIncrease: 10,
      trimFirst: 'history',
    },
    { baselineTotal: 100, expandedTotal: 110, overflow: 10, trimmedHistory: 15, finalTotal: 100 },
  ),
  fixture(
    'visual-llm-04-qkv-flow',
    {
      Input: '已缩放 scores=[0,ln2]，V1=[1,0]、V2=[0,3]。',
      Method: 'stable softmax(scores) → 对 V 加权求和。',
      Rounding: '图中三位小数；断言保留分数精度。',
    },
    {
      scaledScores: [0, Math.log(2)],
      values: [
        [1, 0],
        [0, 3],
      ],
    },
    { weights: [1 / 3, 2 / 3], output: [1 / 3, 2] },
  ),
  fixture(
    'visual-llm-04-score-mask-softmax',
    {
      Input: '原始 QK 分数 [0,2ln2,18]、d_k=4、未来位置索引 2、V=[[1,0],[0,3],[9,9]]。',
      Method:
        '除以 sqrt(d_k) 得缩放分数 → 未来位置置 -Infinity → stable softmax → 乘 V。',
      Rounding: '权重与输出三位小数；-Infinity 原样。',
    },
    {
      rawQKScores: [0, 2 * Math.log(2), 18],
      dK: 4,
      maskedIndices: [2],
      values: [
        [1, 0],
        [0, 3],
        [9, 9],
      ],
    },
    {
      scaledScores: [0, Math.log(2), 9],
      maskedScores: [0, Math.log(2), -Infinity],
      weights: [1 / 3, 2 / 3, 0],
      output: [1 / 3, 2],
    },
  ),
  fixture(
    'visual-llm-04-multi-head-merge',
    {
      Input:
        'Head1 scores=[0,ln3]、V=[[-1],[3]]；Head2 scores=[0,0]、V=[[2],[4]]；W_O=[[1,1],[1,-1]]。',
      Method: '每头 stable softmax → Σ(w_i V_i) 得 Hn → 沿特征维 concat → 行向量乘输出投影。',
      Rounding: '权重三位小数；整数输出不舍入。',
    },
    {
      heads: [
        {
          scores: [0, Math.log(3)],
          values: [[-1], [3]],
        },
        {
          scores: [0, 0],
          values: [[2], [4]],
        },
      ],
      outputProjection: [
        [1, 1],
        [1, -1],
      ],
    },
    {
      heads: [
        { weights: [0.25, 0.75], output: [2] },
        { weights: [0.5, 0.5], output: [3] },
      ],
      concatenated: [2, 3],
      output: [5, -1],
    },
  ),
  fixture(
    'visual-llm-04-causal-visibility',
    {
      Input: '序列长度 n=4，所有允许位置的 score 均为 0。',
      Method: '0-based 规则 j≤i 生成嵌套 0/1 可见矩阵；每行仅对可见位置 softmax。',
      Rounding: '权重四位小数；矩阵元素为整数 0/1。',
    },
    {
      allowedScores: [[0], [0, 0], [0, 0, 0], [0, 0, 0, 0]],
    },
    {
      visibility: [
        [1, 0, 0, 0],
        [1, 1, 0, 0],
        [1, 1, 1, 0],
        [1, 1, 1, 1],
      ],
      rowWeights: [
        [1, 0, 0, 0],
        [0.5, 0.5, 0, 0],
        [1 / 3, 1 / 3, 1 / 3, 0],
        [0.25, 0.25, 0.25, 0.25],
      ],
    },
  ),
  fixture(
    'visual-llm-05-lora-update',
    {
      Input: '冻结 W 为 4×4、rank=1、A=[1,0,-1,0]、B=[1,2,0,-1]^T。',
      Method: 'ΔW=BA；adapter 参数量为 A 与 B 元素数之和。',
      Rounding: '整数原样。',
    },
    {
      baseShape: [4, 4],
      rank: 1,
      A: [1, 0, -1, 0],
      B: [1, 2, 0, -1],
    },
    {
      deltaW: [
        [1, 0, -1, 0],
        [2, 0, -2, 0],
        [0, 0, 0, 0],
        [-1, 0, 1, 0],
      ],
      adapterParameters: 8,
      fullParameters: 16,
    },
  ),
  fixture(
    'visual-llm-05-rag-finetune-matrix',
    {
      Input: '四个用例的命名决策轴、结构化示例证据、计算预算与风险等级。',
      Method:
        '更新频率或引用需求达到高阈值时选 RAG；否则仅稳定行为目标且已有代表性示例时选 SFT/LoRA；其余停在 Prompt/工具基线与继续收集数据。',
      Rounding: '等级为整数；布尔证据不换算总分。',
    },
    {
      highThreshold: 3,
      cases: [
        {
          name: '每日制度问答',
          axes: {
            citationNeed: 3,
            risk: 3,
            updateFrequency: 3,
            stableBehavior: false,
            computeBudget: 1,
          },
          hasExamples: false,
        },
        {
          name: '稳定客服语气',
          axes: {
            computeBudget: 2,
            stableBehavior: true,
            citationNeed: 1,
            risk: 2,
            updateFrequency: 1,
          },
          hasExamples: true,
        },
        {
          name: '不稳定任务目标',
          axes: {
            risk: 2,
            updateFrequency: 1,
            stableBehavior: false,
            computeBudget: 2,
            citationNeed: 1,
          },
          hasExamples: true,
        },
        {
          name: '稳定但无示例',
          axes: {
            stableBehavior: true,
            updateFrequency: 1,
            citationNeed: 1,
            computeBudget: 2,
            risk: 2,
          },
          hasExamples: false,
        },
      ],
    },
    {
      decisions: [
        {
          name: '每日制度问答',
          route: 'RAG',
          reason: 'updateFrequency/citationNeed reached high threshold',
          nextStep: 'evaluate retrieval, citations and permissions',
          evaluationProfile: {
            riskControl: 'high-risk slices + rollback',
            costCheck: 'low-compute baseline required',
          },
        },
        {
          name: '稳定客服语气',
          route: 'SFT/LoRA',
          reason: 'stable behavior gap with representative examples',
          nextStep: 'compare against the Prompt/tool baseline before training',
          evaluationProfile: {
            riskControl: 'standard slices + rollback',
            costCheck: 'compare training and serving cost',
          },
        },
        {
          name: '不稳定任务目标',
          route: 'insufficient evidence—do not fine-tune',
          reason: 'behavior target is not stable',
          nextStep: 'establish Prompt/tool baseline and clarify the target',
          evaluationProfile: {
            riskControl: 'standard slices + rollback',
            costCheck: 'compare training and serving cost',
          },
        },
        {
          name: '稳定但无示例',
          route: 'insufficient evidence—do not fine-tune',
          reason: 'representative examples are missing',
          nextStep: 'establish Prompt/tool baseline and continue collecting data',
          evaluationProfile: {
            riskControl: 'standard slices + rollback',
            costCheck: 'compare training and serving cost',
          },
        },
      ],
    },
  ),
  fixture(
    'visual-llm-06-generation-loop',
    {
      Input: '故意乱序的候选及对应 logits、温度、top-p、固定抽样值与下一状态。',
      Method: 'stable softmax → 最小 nucleus → 集合内重归一化 → 逆 CDF 抽样。',
      Rounding: '概率四位小数；累计比较使用未舍入值。',
    },
    {
      candidates: ['C', 'A', 'B'],
      logits: [0, 2, 1],
      temperature: 1,
      topP: 0.8,
      uniformSample: 0.7,
      nextStateToken: 'EOS',
    },
    {
      probabilities: [0.09003057317038046, 0.6652409557748218, 0.24472847105479764],
      nucleus: ['A', 'B'],
      renormalized: [0.7310585786300049, 0.2689414213699951],
      selected: 'A',
      nextToken: 'EOS',
    },
  ),
  fixture(
    'visual-llm-06-logit-softmax',
    {
      Input: '候选 A/B/C logits=[2,1,0]。',
      Method: '减最大值的 stable softmax，最后对概率 argmax。',
      Rounding: '指数与概率四位小数。',
    },
    { candidates: ['A', 'B', 'C'], logits: [2, 1, 0] },
    {
      shiftedExponentials: [1, Math.exp(-1), Math.exp(-2)],
      probabilities: [0.6652409557748218, 0.24472847105479764, 0.09003057317038046],
      sum: 1,
      greedy: 'A',
    },
  ),
  fixture(
    'visual-llm-06-temperature-top-p',
    {
      Input: '故意乱序的候选及对应 logits、三组温度，并在基准温度使用 top-p。',
      Method: 'p=softmax(z/T)；top-p 取累计质量达到阈值的最小前缀。',
      Rounding: '概率四位小数；阈值比较使用未舍入值。',
    },
    {
      candidates: ['C', 'A', 'B'],
      logits: [0, 2, 1],
      temperatures: [0.5, 1, 2],
      topP: 0.8,
      nucleusTemperature: 1,
    },
    {
      distributions: [
        [0.015876239976466765, 0.8668133321973347, 0.11731042782619835],
        [0.09003057317038046, 0.6652409557748218, 0.24472847105479764],
        [0.1863237232258476, 0.506480391055654, 0.3071958857184984],
      ],
      nucleus: ['A', 'B'],
    },
  ),
  fixture(
    'visual-llm-06-kv-cache',
    {
      Input: 'layers=2、length=4、KV heads=1、head dim=2、bytes=2、预算 576 bytes。',
      Method: '2×layers×sequences×length×heads×dim×bytes；容量向下取整。',
      Rounding: 'bytes 与序列数为整数。',
    },
    { layers: 2, length: 4, kvHeads: 1, headDimension: 2, bytesPerElement: 2, budgetBytes: 576 },
    {
      bytesPerSequence: 64,
      maxSequences: 9,
      doubledLengthBytesPerSequence: 128,
      doubledLengthMaxSequences: 4,
    },
  ),
  fixture(
    'visual-llm-06-latency-breakdown',
    {
      Input: 'queue=40ms、prefill=80ms、首包=20ms、5 个 decode 间隔各 20ms；20 个固定样本。',
      Method: 'TTFT 分段求和；端到端加入 decode；P95=nearest-rank ceil(0.95N)。',
      Rounding: '毫秒整数；P95 不插值。',
    },
    {
      queueMs: 40,
      prefillMs: 80,
      firstPacketMs: 20,
      decodeIntervalsMs: [20, 20, 20, 20, 20],
      samplesMs: [
        500, 120, 260, 100, 210, 150, 280, 180, 230, 110, 250, 170, 200, 140,
        270, 160, 240, 130, 220, 190,
      ],
      percentile: 0.95,
    },
    { ttftMs: 140, endToEndMs: 240, nearestRank: 19, p95Ms: 280, maxMs: 500 },
  ),
  fixture(
    'visual-llm-07-retry-state-machine',
    {
      Input: '两次结构化输出尝试，以及包含 key/payload 的首次、重复、不同 key 和非法 key 事件。',
      Method:
        'Schema 通过后逐事件执行：合法新 key 执行并缓存，相同 key 复用结果，不同 key 再执行，空或非法 key 拒绝且无副作用。',
      Rounding: 'attempt 与执行次数为整数。',
    },
    {
      attempts: [{ priority: 'urgent' }, { priority: 'high' }],
      allowedPriorities: ['low', 'high'],
      maxAttempts: 2,
      idempotencyKeyPattern: '^[a-z0-9-]+:v[0-9]+$',
      events: [
        {
          key: 'ticket-42:v1',
          payload: { ticketId: 42, priority: 'high' },
        },
        {
          key: 'ticket-42:v1',
          payload: { ticketId: 42, priority: 'high' },
        },
        {
          key: 'ticket-43:v1',
          payload: { ticketId: 43, priority: 'low' },
        },
        {
          key: '',
          payload: { ticketId: 44, priority: 'high' },
        },
        {
          key: 'invalid key',
          payload: { ticketId: 45, priority: 'high' },
        },
      ],
    },
    {
      states: ['schema-failed', 'retry', 'validated', 'events-processed'],
      attemptsUsed: 2,
      eventResults: [
        {
          key: 'ticket-42:v1',
          status: 'executed',
          result: {
            receiptId: 'effect-1',
            payload: { ticketId: 42, priority: 'high' },
          },
        },
        {
          key: 'ticket-42:v1',
          status: 'deduplicated',
          result: {
            receiptId: 'effect-1',
            payload: { ticketId: 42, priority: 'high' },
          },
        },
        {
          key: 'ticket-43:v1',
          status: 'executed',
          result: {
            receiptId: 'effect-2',
            payload: { ticketId: 43, priority: 'low' },
          },
        },
        {
          key: '',
          status: 'rejected',
          error: 'invalid idempotency key',
          result: null,
        },
        {
          key: 'invalid key',
          status: 'rejected',
          error: 'invalid idempotency key',
          result: null,
        },
      ],
      sideEffectExecutions: 2,
      cacheKeys: ['ticket-42:v1', 'ticket-43:v1'],
    },
  ),
  fixture(
    'visual-llm-07-version-eval-loop',
    {
      Input: '固定四条 eval；样本 3 属于安全切片；v1=[1,1,0,1]、v2=[1,1,1,1]；安全 hard gate=100%。',
      Method: '按通过数/4 算总通过率，并独立计算安全切片通过率；安全门先于总分。',
      Rounding: '百分比一位小数；门判断使用精确比率。',
    },
    {
      sampleIds: [1, 2, 3, 4],
      safetySampleIds: [3],
      versions: {
        v1: [1, 1, 0, 1],
        v2: [1, 1, 1, 1],
      },
      safetyGate: 1,
    },
    {
      v1: { overallRate: 0.75, safetyRate: 0, blocked: true, failedSafetySampleIds: [3] },
      v2: { overallRate: 1, safetyRate: 1, blocked: false, failedSafetySampleIds: [] },
    },
  ),
  fixture(
    'visual-llm-08-eval-funnel',
    {
      Input: 'normal 6/6、boundary 4/5、adversarial 3/4，共 15 条。',
      Method: '分别计算切片通过率与总通过率；adversarial hard gate=100%。',
      Rounding: '展示百分比一位小数；门判断使用精确比率。',
    },
    {
      slices: {
        normal: { passed: 6, total: 6 },
        boundary: { passed: 4, total: 5 },
        adversarial: { passed: 3, total: 4 },
      },
      adversarialGate: 1,
    },
    {
      rates: { normal: 1, boundary: 0.8, adversarial: 0.75 },
      overallRate: 13 / 15,
      blocked: true,
    },
  ),
  fixture(
    'visual-llm-08-release-pareto',
    {
      Input: 'A–E 的固定质量、安全、成本、P95 指标；安全硬门为 99.5%。',
      Method:
        '先按安全门过滤；再以质量不低、成本和延迟均不高且至少一项严格更优判定 dominance。',
      Rounding: '质量/安全/成本一位小数；延迟整数毫秒。',
    },
    {
      safetyGate: 99.5,
      candidates: [
        { id: 'A', quality: 82, safety: 99.7, cost: 1, latency: 450 },
        { id: 'B', quality: 88, safety: 99.8, cost: 2, latency: 700 },
        { id: 'C', quality: 86, safety: 99.4, cost: 1.5, latency: 500 },
        { id: 'D', quality: 88, safety: 99.8, cost: 2.4, latency: 850 },
        { id: 'E', quality: 91, safety: 99.6, cost: 3.4, latency: 1100 },
      ],
    },
    { rejectedBySafety: ['C'], dominancePairs: [['B', 'D']], nonDominated: ['A', 'B', 'E'] },
  ),
]);
