function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

function fixture(visualId, fields, data, result) {
  return {
    id: visualId.replace(/^visual-/, 'fixture-'),
    visualId,
    fields,
    data,
    result,
  };
}

export const llmFoundationVisualFixtures = deepFreeze([
  fixture(
    'visual-llm-01-autoregressive-generation',
    {
      Input:
        '教学 tokenizer v1 词表、四个固定 prompt 片段、两个首步候选及 logits=[2,1]。',
      Method: '最长匹配编码 → stable softmax → greedy → 固定下一状态。',
      Expected:
        'IDs [10,11,12,13] → 概率 [0.7311,0.2689] → 选择“天气” → EOS。',
      Rounding: '概率四位小数；ID 与步数为整数。',
    },
    {
      vocabulary: { 资料: 10, 助理: 11, '：': 12, 查: 13, 天气: 14 },
      promptSegments: ['资料', '助理', '：', '查'],
      candidates: [
        { token: '天气', id: 14 },
        { token: '资料', id: 10 },
      ],
      logits: [2, 1],
      nextStateToken: 'EOS',
    },
    {
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
      Expected:
        'loss 0.5；dW=[[0.5,0],[0,0.5],[1,0.5]]、db=[0.5,0.5]；新 W/b 后 loss=0.314375。',
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
      Expected: 'z=0.4 → p=0.5987 → BCE=0.5130。',
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
      Expected:
        'a=6、b=4、c=10、L=50；经 a 对 x 贡献 30，经 b 贡献 40，累加 dL/dx=70；dL/dw=20。',
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
      Expected:
        'η=0.1 缓慢下降；η=0.5 首步到最优；η=1.1 的 loss 为 [1.44,2.0736,2.985984]。',
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
      Expected:
        '欠拟合组两线仍高；同步改善组两线单调下降；过拟合组 validation 在 epoch 3 最小并于 epoch 4 起反向。',
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
      underfit: { finalTrain: 0.81, finalValidation: 0.89 },
      improving: { trainMonotonicDown: true, validationMonotonicDown: true },
      overfit: { bestEpoch: 3, divergenceStartsAtEpoch: 4 },
    },
  ),
  fixture(
    'visual-llm-03-text-to-context',
    {
      Input:
        '教学 tokenizer 将“猫坐”编码为 [4,7]；E4=[1,0]、E7=[0,1]、P0=[0.1,0]、P1=[0,0.1]。',
      Method: '固定查表并按位置逐元素相加；交换 token 顺序时位置向量不跟 token 移动。',
      Expected:
        '顺序 [4,7] 得 [[1.1,0],[0,1.1]]；顺序 [7,4] 得 [[0.1,1],[1,0.1]]。',
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
      Input: '固定文本“AI好”、`{"x":1}`、`x+=1` 及两个教学 tokenizer 的固定切分。',
      Method: 'tokenizer A 使用冻结的最长匹配结果；tokenizer B 按 Unicode code point 切分。',
      Expected: 'A 计数 [2,3,3]；B 计数 [3,7,4]。',
      Rounding: '计数为整数。',
    },
    {
      texts: ['AI好', '{"x":1}', 'x+=1'],
      tokenizerASegments: [
        ['AI', '好'],
        ['{"x":', '1', '}'],
        ['x', '+=', '1'],
      ],
    },
    { tokenizerACounts: [2, 3, 3], tokenizerBCounts: [3, 7, 4] },
  ),
  fixture(
    'visual-llm-03-embedding-position-space',
    {
      Input: 'IDs [4,7]、E4/E7 与 P0/P1 的固定二维教学向量。',
      Method: 'H_i=E_id+P_i，并对 [4,7] 与 [7,4] 两种顺序分别计算。',
      Expected:
        '[4,7] 得 [[1.1,0],[0,1.1]]；[7,4] 得 [[0.1,1],[1,0.1]]。',
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
      Expected: '基线总计 100；变更后 110、overflow=10；history 从 25 减到 15 后恢复 100。',
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
      Expected: 'weights=[1/3,2/3] → output=[1/3,2]。',
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
      Expected:
        '缩放 [0,ln2,9] → mask 后 [0,ln2,-Infinity] → weights=[1/3,2/3,0] → output=[1/3,2]。',
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
      Input: 'H1=[2]、H2=[3]、W_O=[[1,1],[1,-1]]。',
      Method: '沿特征维 concat，再做行向量乘输出投影。',
      Expected: '[2,3] → [5,-1]。',
      Rounding: '整数算例不舍入。',
    },
    {
      heads: [[2], [3]],
      outputProjection: [
        [1, 1],
        [1, -1],
      ],
    },
    { concatenated: [2, 3], output: [5, -1] },
  ),
  fixture(
    'visual-llm-04-causal-visibility',
    {
      Input: '序列长度 n=4，所有允许位置的 score 均为 0。',
      Method: '0-based 规则 j≤i 生成嵌套 0/1 可见矩阵；每行仅对可见位置 softmax。',
      Expected:
        'mask=[[1,0,0,0],[1,1,0,0],[1,1,1,0],[1,1,1,1]]；行权重依次均匀分配。',
      Rounding: '权重四位小数；矩阵元素为整数 0/1。',
    },
    { sequenceLength: 4, allowedScore: 0 },
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
      Expected: 'ΔW 四行固定；adapter=8 参数，对比全量 W=16 参数。',
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
      Input: '三个用例的五轴 1–3 评分数组。',
      Method: '更新频率或可引用性为 3 时优先 RAG；否则稳定行为且有示例时优先 SFT/LoRA。',
      Expected: '客服语气→SFT/LoRA；每日制度问答→RAG；专业分类→SFT/LoRA。',
      Rounding: '评分为整数；不求伪精确总分。',
    },
    {
      axes: ['stableBehavior', 'compute', 'updateFrequency', 'citationNeed', 'risk'],
      cases: [
        { name: '客服语气', scores: [3, 2, 1, 1, 2] },
        { name: '每日制度问答', scores: [2, 1, 3, 3, 3] },
        { name: '专业分类', scores: [3, 2, 1, 1, 2] },
      ],
    },
    { decisions: ['SFT/LoRA', 'RAG', 'SFT/LoRA'] },
  ),
  fixture(
    'visual-llm-06-generation-loop',
    {
      Input: '候选 A/B/C logits=[2,1,0]、T=1、top-p=0.8、固定 u=0.70、下一状态 EOS。',
      Method: 'stable softmax → 最小 nucleus → 集合内重归一化 → 逆 CDF 抽样。',
      Expected:
        '概率 [0.6652,0.2447,0.0900] → nucleus A/B → [0.7311,0.2689] → A → EOS。',
      Rounding: '概率四位小数；累计比较使用未舍入值。',
    },
    {
      candidates: ['A', 'B', 'C'],
      logits: [2, 1, 0],
      temperature: 1,
      topP: 0.8,
      uniformSample: 0.7,
      nextStateToken: 'EOS',
    },
    {
      probabilities: [0.6652409557748218, 0.24472847105479764, 0.09003057317038046],
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
      Expected: 'exp=[1,0.3679,0.1353] → probabilities 总和 1 → greedy=A。',
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
      Input: 'logits=[2,1,0]、T=[0.5,1,2]，并在 T=1 使用 top-p=0.8。',
      Method: 'p=softmax(z/T)；top-p 取累计质量达到阈值的最小前缀。',
      Expected: '三组概率固定；T=1 的 nucleus=[A,B]。',
      Rounding: '概率四位小数；阈值比较使用未舍入值。',
    },
    {
      candidates: ['A', 'B', 'C'],
      logits: [2, 1, 0],
      temperatures: [0.5, 1, 2],
      topP: 0.8,
      nucleusTemperature: 1,
    },
    {
      distributions: [
        [0.8668133321973347, 0.11731042782619835, 0.015876239976466765],
        [0.6652409557748218, 0.24472847105479764, 0.09003057317038046],
        [0.506480391055654, 0.3071958857184984, 0.1863237232258476],
      ],
      nucleus: ['A', 'B'],
    },
  ),
  fixture(
    'visual-llm-06-kv-cache',
    {
      Input: 'layers=2、length=4、KV heads=1、head dim=2、bytes=2、预算 576 bytes。',
      Method: '2×layers×sequences×length×heads×dim×bytes；容量向下取整。',
      Expected: 'length=4 时每序列 64 bytes、9 序列；length=8 时 128 bytes、4 序列。',
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
      Expected: 'TTFT=140ms、端到端=240ms、P95=第19项 280ms、max=500ms。',
      Rounding: '毫秒整数；P95 不插值。',
    },
    {
      queueMs: 40,
      prefillMs: 80,
      firstPacketMs: 20,
      decodeIntervalsMs: [20, 20, 20, 20, 20],
      samplesMs: [
        100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230,
        240, 250, 260, 270, 280, 500,
      ],
      percentile: 0.95,
    },
    { ttftMs: 140, endToEndMs: 240, nearestRank: 19, p95Ms: 280, maxMs: 500 },
  ),
  fixture(
    'visual-llm-07-retry-state-machine',
    {
      Input: 'attempt1 priority=urgent、Schema enum=[low,high]、maxAttempts=2、幂等键 ticket-42:v1。',
      Method: 'Schema 失败且仍有预算时反馈重试；通过后按幂等键执行；重复键返回既有结果。',
      Expected: 'attempt1 失败 → attempt2 high 通过 → 副作用仅执行一次 → 重复提交复用结果。',
      Rounding: 'attempt 与执行次数为整数。',
    },
    {
      attempts: [{ priority: 'urgent' }, { priority: 'high' }],
      allowedPriorities: ['low', 'high'],
      maxAttempts: 2,
      idempotencyKey: 'ticket-42:v1',
      submissions: 2,
    },
    {
      states: ['schema-failed', 'retry', 'validated', 'executed', 'deduplicated'],
      attemptsUsed: 2,
      sideEffectExecutions: 1,
    },
  ),
  fixture(
    'visual-llm-07-version-eval-loop',
    {
      Input: '固定四条 eval；样本 3 属于安全切片；v1=[1,1,0,1]、v2=[1,1,1,1]；安全 hard gate=100%。',
      Method: '按通过数/4 算总通过率，并独立计算安全切片通过率；安全门先于总分。',
      Expected: 'v1 总计 75%、安全 0%，因样本 3 失败而阻断；v2 总计与安全均 100%。',
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
      Expected: '切片 100%/80%/75%，总计 86.7%；仍因 adversarial 未达硬门而阻断。',
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
      Expected: 'C 被安全门淘汰；B 支配 D；A/B/E 为非支配集合。',
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
