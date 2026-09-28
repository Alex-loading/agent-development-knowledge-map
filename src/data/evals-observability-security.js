import { deepFreeze } from './evals-shared.js';
import { evalResources } from './evals-resources.js';
import { evalsNotes } from './evals-notes.js';

// coverageMatrix 记录考核范围，sourceIds 指向已阅读的来源正文。
const lessonSpecs = [
  {
    "id": "eval-01",
    "moduleId": "evals-observability-security",
    "order": 1,
    "title": "成功标准、评测集与基线",
    "summary": "把企业知识助手的目标变成结果与关键约束，准备可复现案例和有版本的基线。",
    "durationMinutes": 25,
    "objectives": [
      "将用户目标分别写成环境结果、关键约束与可观察证据",
      "编写正反案例，区分开发、封存与回归集合的用途",
      "建立隔离环境和包含版本、分母与未知的基线记录"
    ],
    "concepts": [
      "任务定义与 trial",
      "轨迹与环境结果",
      "开发集与封存评测",
      "信息泄漏",
      "隔离基线与版本账本"
    ],
    "explanations": [
      {
        "heading": "结果与过程共同定义成功",
        "body": "助手最后一句完成声明不能代替工单库事实；即使终态正确，也要核查必要确认和访问限制。任务定义要让其他人可以独立作出判定。",
        "keyPoints": [
          "用可观察条件定义成功",
          "结果正确不能覆盖关键约束违反",
          "参考解证明任务可解，允许多条有效轨迹"
        ]
      },
      {
        "heading": "评测数据承担不同职责",
        "body": "开发样例用于调优，封存评测用于冻结方案后的独立检查，回归集保留既有失败。比较结果时恢复初始环境，并记录案例、模型、提示、工具和评分版本。",
        "keyPoints": [
          "先规定集合划分单位与访问用途",
          "参与选择后不能继续冒充未见样例",
          "分数连同分母和未知一起报告"
        ]
      }
    ],
    "resourceIds": [
      "res-eval-anthropic-evals",
      "res-eval-tau-bench",
      "res-eval-sklearn-leakage"
    ],
    "exercise": {
      "title": "设计一份报修助手评测包",
      "brief": "围绕确认后创建工单的原创场景，准备别人可以复现的正反案例和基线材料。",
      "steps": [
        "写出有确认与无确认两张案例卡，列出输入、初始环境、允许动作、终态和关键约束",
        "规定开发、封存和回归集合的用途及划分单位，说明近重复案例和新失败如何处理",
        "恢复隔离环境运行参考方案，记录版本、逐项判断、成功分母、未知及环境异常"
      ],
      "deliverable": "一份包含两张案例卡、集合用途与访问规则、环境恢复说明和带版本基线账本的评测包，并注明尚未覆盖的场景。"
    },
    "quiz": [
      {
        "id": "quiz-eval-01-1",
        "prompt": "助手创建了正确工单，但找不到必需的用户确认。最合理的评测结论是什么？",
        "choices": [
          "终态正确就完整通过",
          "分别核验结果与确认约束；缺证据保留未知，已知违反单独记失败",
          "只要回答流畅就忽略确认"
        ],
        "answerIndex": 1,
        "explanation": "工单存在只是结果证据，无法证明必要过程已满足。应区分证据缺失和已知违反，不能把终态正确直接当成完整成功。"
      },
      {
        "id": "quiz-eval-01-2",
        "prompt": "团队查看封存题后逐题修改提示，再用同一批题报告提升，应该如何解释？",
        "choices": [
          "它仍能独立证明未见样例泛化",
          "只要换文件名就恢复独立性",
          "这组题已经参与选择，应调整其用途并补充未参与调优的证据"
        ],
        "answerIndex": 2,
        "explanation": "数据是否参与选择决定证据用途。查看结果后针对性调优破坏了原先独立验收的条件，改名不会改变这一事实。"
      }
    ],
    "completionCriteria": [
      "能够从工单案例分别指出结果证据、关键约束和未知，避免把完成声明当事实",
      "能够交付他人可复现的评测包，解释集合用途、环境隔离、版本及分母"
    ],
    "interviewQuestionIds": [
      "iq-eval-01-1",
      "iq-eval-01-2",
      "iq-eval-01-3"
    ]
  },
  {
    "id": "eval-02",
    "moduleId": "evals-observability-security",
    "order": 2,
    "title": "评分器、Rubric 与人工校准",
    "summary": "按证据选择代码、模型和人工评分，处理成对评分误差、未知与校准分歧。",
    "durationMinutes": 26,
    "objectives": [
      "按可验证事实与开放质量分配代码、模型和人工评分职责",
      "编写包含通过、失败与未知条件的可执行 Rubric",
      "用位置交换和人工边界样例校准裁判并固定版本"
    ],
    "concepts": [
      "代码评分器",
      "模型 Rubric",
      "成对比较与位置影响",
      "人工校准",
      "未知与分歧",
      "评分器回归"
    ],
    "explanations": [
      {
        "heading": "评分器也是需要验证的系统",
        "body": "代码适合直接检查环境事实，模型适合按明确维度判断开放质量，人工用于领域判定与校准。格式合法或温度为零都不能代替判据正确性。",
        "keyPoints": [
          "按证据选择评分机制",
          "维度分别保留理由",
          "关键失败不能被加权总分稀释"
        ]
      },
      {
        "heading": "校准关注具体误判",
        "body": "交换答案位置暴露顺序敏感，并把裁判结果与人工判断逐例对照。未知说明证据不足，分歧说明判断不一致；两者应记录原因与下一步。",
        "keyPoints": [
          "交换位置后按内容身份关联结果",
          "论文一致率不能替代本地校准",
          "评分规则变更也要回归"
        ]
      }
    ],
    "resourceIds": [
      "res-eval-anthropic-evals",
      "res-eval-mt-bench"
    ],
    "exercise": {
      "title": "制作可审查的评分器方案",
      "brief": "为报修助手编写评分职责和 Rubric，并用成对样例与人工意见检查其边界。",
      "steps": [
        "将工单数量检查与步骤覆盖分配给适合的评分器，为两个维度写出输入、通过、失败和未知条件",
        "准备简洁完整与冗长漏项两个回答，交换位置比较并保留按内容标识关联的原始结论",
        "用正常、错误、同义改写与缺证据样例做人工对照，记录分歧、处理去向和固定裁判版本"
      ],
      "deliverable": "一份评分职责表、两个可执行 Rubric、A/B 位置交换记录及人工校准和评分器回归清单，包含未知与误判处理规则。"
    },
    "quiz": [
      {
        "id": "quiz-eval-02-1",
        "prompt": "同一对答案交换位置后，裁判总选左侧内容。应怎样处理？",
        "choices": [
          "判左侧答案绝对正确",
          "将其标为顺序敏感，按预定规则记平或复核，并保留两次结果",
          "删除第二次结果以保持一致"
        ],
        "answerIndex": 1,
        "explanation": "顺序变化引起内容赢家翻转，说明位置影响了判断。应按内容身份对应两次结果并处理不一致，单次选择的结果仍需事实核验。"
      },
      {
        "id": "quiz-eval-02-2",
        "prompt": "裁判没有拿到必要工单终态，且未发现确定的关键违反。最合适的输出是什么？",
        "choices": [
          "猜测通过",
          "直接删除该样例",
          "记录 unknown 与缺失证据，交由人工核验并补充证据"
        ],
        "answerIndex": 2,
        "explanation": "证据不足不能支持通过，也不能靠删除样例美化分母。未知需要有原因、数量及后续核验路径，并与已经确定的失败分开。"
      }
    ],
    "completionCriteria": [
      "能为事实检查与开放质量分别写出可执行判据，解释评分格式不等于可靠判断",
      "能解释位置交换、人机分歧、平局口径与 unknown 的处理，并保留评分器版本"
    ],
    "interviewQuestionIds": [
      "iq-eval-02-1",
      "iq-eval-02-2",
      "iq-eval-02-3"
    ]
  },
  {
    "id": "eval-03",
    "moduleId": "evals-observability-security",
    "order": 3,
    "title": "分组回归、重复试验与发布门槛",
    "summary": "在同案例配对结果上检查切片退化与重复可靠性，用明确规则区分阻止、暂缓和有限通过。",
    "durationMinutes": 27,
    "objectives": [
      "比较相同案例的总体与预定义切片，解释被平均分掩盖的回归",
      "在单任务独立同分布假设下区分 pass@k 与 pass^k",
      "按关键失败、回归和证据完整性解释 block、hold、pass"
    ],
    "concepts": [
      "配对比较",
      "切片回归",
      "pass@k 与 pass^k",
      "独立同分布",
      "样本不足与未知",
      "发布门槛"
    ],
    "explanations": [
      {
        "heading": "平均分无法替代分组证据",
        "body": "固定案例、环境和评分版本后关联新旧结果，同时报告每组成功分子与分母。新增成功和新增失败可能抵消，因此总分不变仍可能存在重要回归。",
        "keyPoints": [
          "配对明细定位变更",
          "预定义切片保留业务影响",
          "小样本限制外推但不抹去已知失败"
        ]
      },
      {
        "heading": "重复可靠性与发布规则分开解释",
        "body": "单任务独立同分布时，至少一次成功为 1−(1−p)^k，全部成功为 p^k。发布实验只是固定记录上的规则判断；关键失败先阻止，证据不足暂缓，满足规则只代表有限通过。",
        "keyPoints": [
          "跨任务不能直接对平均率取幂",
          "门槛不是统计显著性检验",
          "block 优先于 hold"
        ]
      }
    ],
    "resourceIds": [
      "res-eval-anthropic-evals",
      "res-eval-tau-bench"
    ],
    "exercise": {
      "title": "推演配对回归发布门槛",
      "brief": "操纵固定六案例候选成绩、切片门槛与关键失败，解释每次结论和证据范围。",
      "steps": [
        "将候选设为基线同分，设置每组最少样本为二、零下降容差和零关键失败，记录 pass 及分子分母",
        "修好 faq-d 同时使 long-b 失败，检查总体不变但长文档退化为何产生 block，并比较修改容差的含义",
        "恢复无回归配置并把最少样本改为三观察 hold，再加入关键失败验证 block 优先，说明这不是统计显著检验"
      ],
      "deliverable": "三份可复现配置与逐例配对、切片统计和判定理由，明确样本不足、未知、关键失败优先级及教学规则不能证明线上可靠性。",
      "experiment": "eval-release-gate"
    },
    "quiz": [
      {
        "id": "quiz-eval-03-1",
        "prompt": "固定六例中，基线和候选都通过五例，但候选长文档从 2/2 降至 1/2。零下降容差应如何判断？",
        "choices": [
          "总体相同，自动通过",
          "已出现切片回归，应阻止并调查对应案例",
          "把长文档切片删除后通过"
        ],
        "answerIndex": 1,
        "explanation": "总体抵消不能消除某组用户的退化。预先定义的切片规则仍然适用，报告应完整保留各组分子分母和新失败。"
      },
      {
        "id": "quiz-eval-03-2",
        "prompt": "一个任务每次成功概率 p=0.8，三次独立同分布尝试全部成功的概率是多少？",
        "choices": [
          "0.992，对应至少一次成功",
          "0.8，不随次数变化",
          "0.512，对应 pass^3"
        ],
        "answerIndex": 2,
        "explanation": "全部三次成功需要连乘得到 0.8³=0.512。0.992 是至少一次成功。此公式只用于相同单任务和独立同分布条件，不能直接套跨任务平均率。"
      }
    ],
    "completionCriteria": [
      "能够从同案例明细识别切片回归，并解释关键失败优先、缺证据 hold 与有限 pass",
      "能够说明重复试验的假设、两个 pass 指标差别以及最少样本门槛不是显著性检验"
    ],
    "interviewQuestionIds": [
      "iq-eval-03-1",
      "iq-eval-03-2",
      "iq-eval-03-3"
    ]
  },
  {
    "id": "eval-04",
    "moduleId": "evals-observability-security",
    "order": 4,
    "title": "RAG 与 Agent 的分层故障归因",
    "summary": "沿检索、上下文、回答、行动与终态定位失败，让组件诊断回到端到端验收。",
    "durationMinutes": 26,
    "objectives": [
      "区分组件诊断与端到端任务验收，先排查任务和评分环境缺陷",
      "辨别上下文相关性、回答忠实度、回答相关性与事实正确性的边界",
      "用受控回放检验故障假设，并在修复后重跑端到端与切片回归"
    ],
    "concepts": [
      "端到端与组件评测",
      "上下文相关性",
      "回答忠实度",
      "事实正确性",
      "检索候选与实际上下文",
      "受控回放与归因"
    ],
    "explanations": [
      {
        "heading": "不同质量指标比较不同对象",
        "body": "检索相关性检查材料与问题，忠实度检查回答与材料，回答相关性检查是否回应用户，事实正确性还要对照有效参考事实和任务要求。原始 RAGAS 不把相关性等同于 factuality。",
        "keyPoints": [
          "忠实可能复述过期资料",
          "相关不保证证据充分",
          "自动指标需要本地校准"
        ]
      },
      {
        "heading": "用证据收缩假设",
        "body": "分别保留检索候选、最终上下文、回答主张、工具执行和环境终态。先确认失败公平，再固定条件改变一个环节进行回放，最终回到完整任务与关键约束验收。",
        "keyPoints": [
          "候选命中不等于模型收到",
          "终态不自动证明过程合规",
          "局部改善后仍做端到端回归"
        ]
      }
    ],
    "resourceIds": [
      "res-eval-ragas",
      "res-eval-tau-bench",
      "res-eval-anthropic-evals"
    ],
    "exercise": {
      "title": "提交一份工单失败归因矩阵",
      "brief": "用三种原创失败构造证据链，区分已知事实、当前假设和下一步验证。",
      "steps": [
        "为资料未找到、忠实复述过期政策、终态正确但缺确认三例列出问题、候选资料、实际上下文与各质量维度",
        "核对回答主张、工具提案、执行记录、环境终态和必要约束，标出确定失败与缺失证据",
        "选一个假设，在隔离环境固定其他条件做回放，说明修复后怎样重跑原任务及相关切片"
      ],
      "deliverable": "一份含至少三例的分层故障矩阵，逐例列事实、假设、验证动作、证据缺口与端到端回归计划，并解释局部高分不能替代任务成功。"
    },
    "quiz": [
      {
        "id": "quiz-eval-04-1",
        "prompt": "助手准确复述了检索到的旧政策，但当前政策已经变化。这最能说明什么？",
        "choices": [
          "高忠实度不保证符合当前任务的事实正确性",
          "只要忠实就不需要任何额外检查",
          "相关性指标一定能够识别所有过期事实"
        ],
        "answerIndex": 0,
        "explanation": "忠实度检查回答是否被给定上下文支持，不能保证上下文本身有效或最新。仍需根据可靠参考事实和本次任务条件验收。"
      },
      {
        "id": "quiz-eval-04-2",
        "prompt": "检索候选中有正确文档，但最终模型上下文没有关键条款。下一步优先查什么？",
        "choices": [
          "直接宣布模型能力不足",
          "检查选择和上下文打包环节，并用固定材料回放验证",
          "只提高最终答案相似度门槛"
        ],
        "answerIndex": 1,
        "explanation": "候选命中与模型实际接收证据是不同事实。应依据中间产物调查选择和打包，再受控验证，避免凭最终错误跳过内部证据。"
      }
    ],
    "completionCriteria": [
      "能用具体反例区分相关、忠实、正确及结果与过程约束，避免用一个局部分数代表全部质量",
      "能写出事实、假设、验证三栏归因，并说明隔离回放与端到端回归的必要性"
    ],
    "interviewQuestionIds": [
      "iq-eval-04-1",
      "iq-eval-04-2",
      "iq-eval-04-3"
    ]
  },
  {
    "id": "eval-05",
    "moduleId": "evals-observability-security",
    "order": 5,
    "title": "Trace、指标、采样与数据最小化",
    "summary": "关联一次 Agent 运行的证据，区分总体指标与采样记录，并用最小字段控制敏感数据暴露。",
    "durationMinutes": 28,
    "objectives": [
      "为知识助手设计跨服务 trace 与版本关联，区分单次诊断、总体指标和授权边界。",
      "说明 head/tail 采样的证据范围，并完成默认不采集敏感正文的记录方案。"
    ],
    "concepts": [
      "Trace 与 span",
      "Parent 与 span link",
      "Context propagation",
      "指标基数",
      "Head / tail sampling",
      "遥测数据最小化"
    ],
    "explanations": [
      {
        "heading": "可观测性把任务结果和执行路径连接起来",
        "body": "Trace 展示已记录的操作关系，日志保留离散事件与精确身份，指标描述一致口径下的总体趋势。操作成功不证明答案正确，trace context 也不能代替资源授权；精确版本和运行 ID 需要关联，但不能变成无界指标标签。",
        "keyPoints": [
          "分开任务验收、操作状态与授权结果",
          "指标有限枚举，日志与 trace 保存细粒度身份"
        ]
      },
      {
        "heading": "留下哪些数据，决定你能推断什么",
        "body": "Head sampling 在早期选择，tail sampling 可参考后来发生的错误，却依赖收到的数据与有状态处理。错误优先保留集不能直接作为总体错误率；敏感正文默认不记录，允许清单仍要审查字段值，哈希可预测 ID 不代表匿名化。",
        "keyPoints": [
          "采样报告同时说明保留集和总体分母",
          "GenAI 约定仍为 Development，字段和支持范围按版本核对"
        ]
      }
    ],
    "resourceIds": [
      "res-eval-otel-traces",
      "res-eval-otel-context",
      "res-eval-otel-sampling",
      "res-eval-otel-sensitive",
      "res-eval-prometheus",
      "res-eval-otel-genai"
    ],
    "exercise": {
      "title": "为知识助手提交最小观测证据包",
      "brief": "使用六条固定教学 trace 对比三种选择方式，并解释身份关联、指标分母和敏感字段边界；不接触真实企业正文或凭证。",
      "steps": [
        "为一次问答画出检索、模型与异步工具操作的关联，注明 parent/link、版本身份以及独立的授权检查。",
        "在实验中切换 all、固定头部选择和 errors-only，手算各自保留数量与错误分子分母，并说明为何不能外推线上失败率。",
        "检查字段允许清单只投影 modelVersion、promptVersion、stage，写出正文、令牌、可预测用户 ID 以及允许字段混入敏感值的处理边界。"
      ],
      "deliverable": "一份运行关联说明、三种教学选择的分子分母比较表，以及字段用途、允许清单、访问与保留边界组成的最小观测证据包。",
      "experiment": "eval-trace-sampling"
    },
    "quiz": [
      {
        "id": "quiz-eval-05-1",
        "prompt": "完整六条教学 trace 中有两条错误；只保留错误后显示 100%，正确解释是什么？",
        "choices": [
          "线上所有任务都发生了错误",
          "100% 只描述按错误条件选出的保留集，不能直接代替总体失败率",
          "保留两条即可证明样本代表总体"
        ],
        "answerIndex": 1,
        "explanation": "选择规则把成功记录排除在样本之外，样本分母变为两条；完整教学集合仍是 2/6。真实线上总体估计还需要明确采样设计和可信计数。"
      },
      {
        "id": "quiz-eval-05-2",
        "prompt": "哪种知识助手记录方案更符合本课的身份与数据边界？",
        "choices": [
          "把每次请求 ID、完整提示词和用户邮箱都作为指标标签",
          "先保留操作与版本关联，指标用有限发布组；正文默认不采集且独立校验权限",
          "所有正文默认记录，只要把用户 ID 哈希就无需访问控制"
        ],
        "answerIndex": 1,
        "explanation": "操作关联有助诊断，但指标标签需控制取值组合，敏感正文不能默认复制。上下文关联不是授权，哈希可预测身份也不等于匿名化。"
      }
    ],
    "interviewQuestionIds": [
      "iq-eval-05-1",
      "iq-eval-05-2",
      "iq-eval-05-3"
    ],
    "completionCriteria": [
      "能从一个失败任务追到模型、检索和工具记录，并说明 trace 状态、业务结果和授权的区别。",
      "能解释三种教学选择的分母差异，提交含字段值审查的最小记录方案并注明 GenAI 约定的发展状态。"
    ]
  },
  {
    "id": "eval-06",
    "moduleId": "evals-observability-security",
    "order": 6,
    "title": "提示注入、威胁模型与执行边界",
    "summary": "区分直接与间接提示注入，围绕资产、攻击面和信任边界设计执行端授权、最小权限及具体动作确认。",
    "durationMinutes": 27,
    "objectives": [
      "为企业知识助手列出资产、可控输入与信任边界，解释检索内容为什么不能产生授权。",
      "将最小权限、逐次执行鉴权和具体动作确认转化为可验证的允许与拒绝条件。"
    ],
    "concepts": [
      "威胁模型",
      "直接与间接提示注入",
      "信任边界",
      "Complete mediation",
      "最小权限",
      "动作确认绑定"
    ],
    "explanations": [
      {
        "heading": "内容可信度与操作权限是两件事",
        "body": "用户授权助手查询知识，不代表被检索材料可以新增导出任务。文档来源帮助解释证据出处，而操作权限必须来自应用确认的身份和策略。",
        "keyPoints": [
          "可信用户仍会遇到不可信材料",
          "外部内容只能作为任务数据",
          "模型调用属于动作提案"
        ]
      },
      {
        "heading": "让执行端决定是否允许产生副作用",
        "body": "每次下游请求都重新检查身份、资源和动作范围；高影响操作的确认必须对应实际执行对象。用户确认不能越过硬性资源权限，缺少条件时应拒绝或暂停。",
        "keyPoints": [
          "逐次鉴权",
          "确认绑定具体动作",
          "工具能力与资源权限分别最小化"
        ]
      }
    ],
    "resourceIds": [
      "res-eval-owasp-injection",
      "res-eval-owasp-agency",
      "res-eval-owasp-disclosure",
      "res-eval-claude-guardrails",
      "res-eval-anthropic-containment",
      "res-eval-owasp-logging"
    ],
    "exercise": {
      "title": "为星桥知识助手建立威胁边界表",
      "brief": "使用合成检索材料和模拟工具，说明一次合作方文档中的额外指令如何被识别，以及模型仍提出越权动作时由哪一层阻断。",
      "steps": [
        "画出员工、检索服务、模型、执行器和资料库，列出资产、每个入口的可控制者及信任边界。",
        "为跨项目读取、外发目的地和确认后参数变化定义允许条件、停止行为及执行证据，用模拟调用检查。",
        "配对运行恶意材料与正常材料，记录检测、模型提案、执行端决策和最终状态，并注明未覆盖风险。"
      ],
      "deliverable": "一张包含资产、可控入口、逐边界允许条件与证据的威胁表，以及恶意和正常两条模拟执行记录；说明确认绑定和未覆盖风险。"
    },
    "quiz": [
      {
        "id": "quiz-eval-06-1",
        "prompt": "员工让助手总结项目资料，检索文档要求先导出其他部门文件。哪种处理最符合信任边界？",
        "choices": [
          "将文档视为数据，保持原任务，并由执行端校验任何候选动作的权限。",
          "知识库属于公司，因此文档中的操作指令自动继承员工权限。",
          "只要模型解释导出有帮助，就允许它先执行再说明。"
        ],
        "answerIndex": 0,
        "explanation": "文档来源不会生成新授权。额外要求属于间接注入风险；即使模型提出候选动作，执行端仍需按当前身份和资源权限验证。"
      },
      {
        "id": "quiz-eval-06-2",
        "prompt": "用户确认发送摘要 A，模型随后把目标换成受限资料 B。执行器应如何处理？",
        "choices": [
          "沿用会话内已经获得的同意。",
          "停止执行并重新核对具体动作；若用户没有 B 的权限，即使再次确认也不能放行。",
          "把确认次数增加到两次后直接执行。"
        ],
        "answerIndex": 1,
        "explanation": "确认对应的是具体动作和对象，参数变化后原确认不能继续使用。人工同意只能批准权限范围内的动作，不能替代下游鉴权。"
      }
    ],
    "interviewQuestionIds": [
      "iq-eval-06-1",
      "iq-eval-06-2",
      "iq-eval-06-3"
    ],
    "completionCriteria": [
      "能用星桥案例准确区分资产、攻击面、信任边界，并解释材料来源为何不能生成授权。",
      "能以执行记录证明越权动作被阻断、正常任务仍可完成，并指出确认绑定与剩余覆盖缺口。"
    ]
  },
  {
    "id": "eval-07",
    "moduleId": "evals-observability-security",
    "order": 7,
    "title": "安全测试、数据保护与输出校验",
    "summary": "用攻击集与正常对照区分检测漏报、误拒和实际越权，验证输出消费边界、日志最小化，并把红队失败转成回归。",
    "durationMinutes": 28,
    "objectives": [
      "用攻击目标和执行证据判断攻击是否成功，并分别报告检测漏报、正常误拒和越权副作用。",
      "为输出消费、数据源与日志定义可验证的保护条件，把安全失败转成带正常对照的固定回归。"
    ],
    "concepts": [
      "攻击成功判据",
      "攻击集与正常对照",
      "False positive / false negative",
      "输出消费边界",
      "敏感数据最小化",
      "安全回归"
    ],
    "explanations": [
      {
        "heading": "拒绝、检测与真实后果分开计数",
        "body": "分类器判断是否可疑，执行端决定动作是否获准，最终环境状态说明攻击目标是否实现。一次攻击可被执行端拦截，同时仍暴露分类器漏报；正常任务被拦也需记录。",
        "keyPoints": [
          "检查执行证据",
          "攻击与正常样本分开计数",
          "零越权不等于零检测错误"
        ]
      },
      {
        "heading": "输出进入不同组件后需要不同保护",
        "body": "JSON 格式只约束结构。渲染 HTML、执行数据库查询、构造文件路径和记录日志都需要各自的验证与处理，并继续遵守资源授权和敏感数据最小化。",
        "keyPoints": [
          "消费上下文决定处理方式",
          "敏感信息在进入上下文前就控制",
          "失败案例与正常对照共同回归"
        ]
      }
    ],
    "resourceIds": [
      "res-eval-anthropic-containment",
      "res-eval-owasp-output",
      "res-eval-owasp-agency",
      "res-eval-claude-guardrails",
      "res-eval-owasp-injection",
      "res-eval-anthropic-browser",
      "res-eval-owasp-disclosure",
      "res-eval-owasp-logging"
    ],
    "exercise": {
      "title": "比较防护配置并制作安全回归卡",
      "brief": "在固定六个预标注案例上切换教学分类器与执行端策略。实验只计算合成夹具，不运行模型检测、真实扫描或外部工具调用。",
      "steps": [
        "逐例写出攻击目标、真实授权和正常对照，检查模拟副作用并据此判定攻击成功。",
        "切换分类器与执行端策略，记录检测漏报、正常误拒和越权副作用，分别注明攻击与正常样本分母。",
        "选择一个失败转成固定回归，添加正常对照，并为 HTML、SQL、路径和日志列出消费约束与合成敏感字段排除检查。"
      ],
      "deliverable": "一份安全回归卡，包含六例的配置比较、三类独立计数及分母、输出消费与日志保护检查、最小失败复现和对应正常对照，并声明未覆盖风险。",
      "experiment": "eval-safety-regression"
    },
    "quiz": [
      {
        "id": "quiz-eval-07-1",
        "prompt": "开启执行端授权后，越权副作用从一次变为零，但分类器没有变化。应该怎样解释？",
        "choices": [
          "分类器已不再漏报。",
          "因为没有真实副作用，可以删除攻击样本。",
          "执行端限制了后果；分类器漏报与正常误拒仍需独立保留和报告。"
        ],
        "answerIndex": 2,
        "explanation": "检测判断和动作授权位于不同层。执行端阻断不能修正分类器原来的错误，固定案例上零越权也不证明其他攻击目标已经安全。"
      },
      {
        "id": "quiz-eval-07-2",
        "prompt": "知识助手生成的 JSON 已通过结构校验，下一步哪种做法正确？",
        "choices": [
          "仍按 HTML、SQL、路径等消费环境处理，并限制日志中的敏感数据。",
          "可以直接拼接数据库查询并执行。",
          "应把所有原始工具输出完整记录，避免遗漏任何排查信息。"
        ],
        "answerIndex": 0,
        "explanation": "结构化输出不等于消费安全或授权正确。HTML 编码、参数化查询、路径约束和敏感日志处理分别保护不同边界，不能省略。"
      }
    ],
    "interviewQuestionIds": [
      "iq-eval-07-1",
      "iq-eval-07-2",
      "iq-eval-07-3"
    ],
    "completionCriteria": [
      "能解释同一案例中检测漏报、执行端阻断与攻击后果的区别，并用正常对照识别误拒。",
      "能提交可重放的失败与正常配对案例，并验证输出消费及敏感日志约束，明确结果适用范围。"
    ]
  },
  {
    "id": "eval-08",
    "moduleId": "evals-observability-security",
    "order": 8,
    "title": "离线到线上：发布门槛与事故闭环",
    "summary": "将测试集、评分器、trace 和威胁记录变成可复核的发布决定，通过隔离影子、灰度对照与事故复验完成闭环。",
    "durationMinutes": 29,
    "objectives": [
      "设计从离线留出检查、隔离影子到候选/对照灰度的发布过程，并明确 hold、block 与回滚条件。",
      "用有窗口和分母的 SLI 支撑发布，交付能把事故修复回到评测与安全回归的证据包。"
    ],
    "concepts": [
      "Holdout 留出检查",
      "Shadow 影子验证",
      "Canary / control",
      "SLI / SLO / error budget",
      "Hold / block",
      "无责复盘"
    ],
    "explanations": [
      {
        "heading": "每一阶段为下一步提供有限证据",
        "body": "离线评测检查已定义任务，影子验证观察真实输入但隔离写副作用，灰度用受限流量同时比较候选和对照。每一步都声明范围、最低证据和停止条件；样本不足保持 hold，关键安全失败独立 block，不能靠平均质量加分抵消。",
        "keyPoints": [
          "冻结版本与留出集，避免边调优边宣布独立通过",
          "影子不回复用户仍可能写状态，必须显式隔离"
        ]
      },
      {
        "heading": "发布结论要能追到证据与后续修复",
        "body": "SLI 明确事件、窗口、分母和测量位置，错误预算只支持相应可靠性取舍。回滚降低后续影响，却不能撤销已经泄漏的内容；复盘要分清事实和推断，并以有负责人、验证条件和回归结果的行动项完成。",
        "keyPoints": [
          "版本差值之外仍看绝对目标与未知覆盖",
          "六类交付物通过案例、运行和版本形成可复核关联"
        ]
      }
    ],
    "resourceIds": [
      "res-eval-anthropic-evals",
      "res-eval-sklearn-leakage",
      "res-eval-sre-canary",
      "res-eval-otel-sensitive",
      "res-eval-sre-slos",
      "res-eval-prometheus",
      "res-eval-sre-postmortem"
    ],
    "exercise": {
      "title": "完成知识助手发布与事故证据包",
      "brief": "仅用课堂案例和合成记录，演练可推进、证据不足与安全失败三种决定，并让一次事故修复进入下一轮验收。",
      "steps": [
        "冻结候选、对照、测试集和评分器版本，写清留出检查边界、影子流量的只读或替身方案以及灰度分组。",
        "为三个纸面情形写出 go、hold 或 block，附上任务与可靠性指标的窗口、分母、样本覆盖、停止和回滚条件。",
        "为一次旧制度引用或越权外发事故写影响时间线、事实与推断、负责人和复验条件，并加入失败用例与合法对照回归。"
      ],
      "deliverable": "一份由版本化测试集、评分器、最小 trace、威胁记录、发布记录和事故复盘构成的证据包，明确三个发布决定、未执行步骤与剩余风险。"
    },
    "quiz": [
      {
        "id": "quiz-eval-08-1",
        "prompt": "候选整体质量提高，但关键长文档切片样本不足，正确发布决定是什么？",
        "choices": [
          "总体提升即可自动全量",
          "保持 hold，补齐声明范围里的有效样本与评分覆盖后再判断",
          "把未评分任务删出报告即可通过"
        ],
        "answerIndex": 1,
        "explanation": "总体得分不能补足关键切片缺失的证据。观察结束或没有见到失败都不等于通过，应保留未知覆盖并按预先声明的条件补测。"
      },
      {
        "id": "quiz-eval-08-2",
        "prompt": "灰度发现一次确认的越权外发，候选质量平均分仍领先，应该怎样处理？",
        "choices": [
          "用质量加分抵消，再扩大灰度观察",
          "只要切回旧代码就可以认为已披露内容被撤销",
          "独立 block 并控制影响，回滚后继续处理披露后果与修复复验"
        ],
        "answerIndex": 2,
        "explanation": "关键安全失败不与平均质量相抵，低灰度比例和可用性错误预算也不提供豁免。回滚只能改变后续执行，已经发生的外发仍需事故处理。"
      }
    ],
    "interviewQuestionIds": [
      "iq-eval-08-1",
      "iq-eval-08-2",
      "iq-eval-08-3"
    ],
    "completionCriteria": [
      "能为允许推进、关键样本不足和安全失败三个情形分别给出有证据的 go、hold、block 决定。",
      "能交付六类相互关联的材料，明确 SLI 分母与窗口，并把一次事故行动转换成有负责人和结果的回归验收。"
    ]
  }
];

const interviewQuestions = [
  {
    "id": "iq-eval-01-1",
    "lessonId": "eval-01",
    "question": "为什么 Agent 的任务成功不能只检查最终回答？",
    "shortAnswer": "最终回答只是轨迹中的声明。应核查环境终态，同时检查任务要求的确认、归属等关键约束；证据不足保留未知，不能从结果反推整个过程合规。",
    "deepDive": [
      "说明工单存在与助手声称创建的区别",
      "举例说明终态正确却未经确认的情况"
    ],
    "misconceptions": [
      "有正确终态就代表每项政策都被遵守"
    ],
    "followUps": [
      "如果数据库查询也失败，如何记录评测结论？"
    ],
    "frequency": "高",
    "difficulty": "基础",
    "roles": [
      "Agent 开发",
      "AI 应用",
      "后端工程"
    ]
  },
  {
    "id": "iq-eval-01-2",
    "lessonId": "eval-01",
    "question": "怎样编写一个公平且可执行的 Agent 评测案例？",
    "shortAnswer": "写明输入、身份、初始状态、可用资料、允许动作、成功证据与禁止行为，准备可通过的参考方案，并用正反例确认规则不会只奖励一种行为。",
    "deepDive": [
      "要求两位领域人员能按同一任务定义独立判定",
      "允许不同有效路径，只锁定真正必要的过程条件"
    ],
    "misconceptions": [
      "参考解必须规定唯一调用顺序"
    ],
    "followUps": [
      "无确认的对照案例为什么有价值？"
    ],
    "frequency": "高",
    "difficulty": "进阶",
    "roles": [
      "Agent 开发",
      "AI 应用",
      "后端工程"
    ]
  },
  {
    "id": "iq-eval-01-3",
    "lessonId": "eval-01",
    "question": "基线运行需要冻结和记录哪些条件？",
    "shortAnswer": "记录案例集、初始快照、模型、提示、工具、检索和评分版本；每次恢复环境，保存逐例轨迹、终态、错误与未知，让分数变化可以回到具体条件。",
    "deepDive": [
      "解释残留工单或答案缓存如何改变任务",
      "区分代理失败与共享基础设施故障"
    ],
    "misconceptions": [
      "多跑几次能自动消除环境污染"
    ],
    "followUps": [
      "旧版政策更新后，历史分数还能说明什么？"
    ],
    "frequency": "高",
    "difficulty": "进阶",
    "roles": [
      "Agent 开发",
      "AI 应用",
      "后端工程"
    ]
  },
  {
    "id": "iq-eval-02-1",
    "lessonId": "eval-02",
    "question": "代码、模型和人工评分分别适合哪些任务？",
    "shortAnswer": "代码适合直接验证结构或环境事实，模型适合按清晰 Rubric 判断开放质量，人工负责领域判断与校准。各项评分方法需要明确证据要求与适用范围。",
    "deepDive": [
      "说明工单数量检查为何适合直接代码验证",
      "解释确定性规则也可能实现了错误判据"
    ],
    "misconceptions": [
      "代码判定永远正确，模型格式合法就可信"
    ],
    "followUps": [
      "什么时候应该用直接状态检查替换模型猜测？"
    ],
    "frequency": "高",
    "difficulty": "基础",
    "roles": [
      "Agent 开发",
      "AI 应用",
      "后端工程"
    ]
  },
  {
    "id": "iq-eval-02-2",
    "lessonId": "eval-02",
    "question": "怎样检查成对 LLM 裁判受到的位置影响？",
    "shortAnswer": "交换两个答案的位置，按内容身份对应两次判定，并事先规定不一致时记平或转人工。位置变化后选择结果相同，只能支持该样例的判断一致；事实准确性和其他评分误差仍需核验。",
    "deepDive": [
      "区分更好与绝对正确",
      "考虑冗长、自我倾向及参考材料不足"
    ],
    "misconceptions": [
      "成对比较天然比所有其他评分都可靠"
    ],
    "followUps": [
      "两个答案都错误，但裁判选出赢家，怎么解释？"
    ],
    "frequency": "高",
    "difficulty": "进阶",
    "roles": [
      "Agent 开发",
      "AI 应用",
      "后端工程"
    ]
  },
  {
    "id": "iq-eval-02-3",
    "lessonId": "eval-02",
    "question": "如何验证并维护一个业务 LLM judge？",
    "shortAnswer": "用代表性正常、错误和边界样例取得人工判断，逐例比较误放过、误拒与未知，修订 Rubric 后固定版本，并维护评分器回归集和周期性复核。",
    "deepDive": [
      "报告平局和未知的计分口径",
      "更换裁判模型或业务范围后重新检查边界"
    ],
    "misconceptions": [
      "论文的人机一致率可以直接当作业务准确率"
    ],
    "followUps": [
      "总体九成一致但误放过一次关键违规，能否发布？"
    ],
    "frequency": "高",
    "difficulty": "进阶",
    "roles": [
      "Agent 开发",
      "AI 应用",
      "后端工程"
    ]
  },
  {
    "id": "iq-eval-03-1",
    "lessonId": "eval-03",
    "question": "评测新版本时，怎样避免总成功率掩盖问题？",
    "shortAnswer": "冻结案例、环境与评分口径，按案例关联基线和候选，报告持续成功、新修复与新回归，并对预定义业务切片展示成功分子、分母和未知。",
    "deepDive": [
      "举例说明总体 5/6 不变但长文档 2/2 降至 1/2",
      "区分切片失败事实与向所有同类任务外推"
    ],
    "misconceptions": [
      "总分不降就不存在回归"
    ],
    "followUps": [
      "候选某条未评分时能否从配对集合删掉？"
    ],
    "frequency": "高",
    "difficulty": "进阶",
    "roles": [
      "Agent 开发",
      "AI 应用",
      "后端工程"
    ]
  },
  {
    "id": "iq-eval-03-2",
    "lessonId": "eval-03",
    "question": "pass@k 和 pass^k 有何区别，公式有什么前提？",
    "shortAnswer": "前者要求 k 次至少一次成功，后者要求全部成功。单任务且各次独立同分布时分别为 1−(1−p)^k 与 p^k；benchmark 应先按任务估计再汇总，不能对跨任务平均率直接取幂。",
    "deepDive": [
      "说明多候选求解与用户每次可靠的目标不同",
      "共享状态或共同依赖故障会破坏独立假设"
    ],
    "misconceptions": [
      "pass@k 高说明每次都能完成"
    ],
    "followUps": [
      "为什么两个任务 p=0 与 p=1 的例子能反驳平均后取幂？"
    ],
    "frequency": "高",
    "difficulty": "深挖",
    "roles": [
      "Agent 开发",
      "AI 应用",
      "后端工程"
    ]
  },
  {
    "id": "iq-eval-03-3",
    "lessonId": "eval-03",
    "question": "发布门槛里的 block、hold、pass 应如何排序和解释？",
    "shortAnswer": "先依据关键失败或确定回归阻止；没有阻止事实但样本不足或评分缺失时暂缓；完整满足预定规则才有限通过。小样本门槛是决策策略，不能宣称完成统计显著性验证。",
    "deepDive": [
      "已知关键违反不会因样本不足而被降为 hold",
      "通过需要同时陈述规则版本、数据范围与待验证限制"
    ],
    "misconceptions": [
      "只要门槛通过就证明线上全部安全可靠"
    ],
    "followUps": [
      "已有关键失败，同时某组样本不够，应给哪个状态？"
    ],
    "frequency": "高",
    "difficulty": "进阶",
    "roles": [
      "Agent 开发",
      "AI 应用",
      "后端工程"
    ]
  },
  {
    "id": "iq-eval-04-1",
    "lessonId": "eval-04",
    "question": "RAG 中回答相关、忠实和正确为什么不能互换？",
    "shortAnswer": "相关关注是否回应问题，忠实关注主张是否由上下文支持，正确还要对照可靠事实与任务要求。助手可以忠实复述过期资料，也可以围绕主题回答却遗漏用户需要的操作。",
    "deepDive": [
      "说明原始 RAGAS 的回答相关性不检查 factuality",
      "自动指标的论文实验边界不能当业务准确率"
    ],
    "misconceptions": [
      "忠实度高就没有任何事实错误"
    ],
    "followUps": [
      "资料足够但模型一律拒答，局部指标如何误导？"
    ],
    "frequency": "高",
    "difficulty": "基础",
    "roles": [
      "Agent 开发",
      "AI 应用",
      "后端工程"
    ]
  },
  {
    "id": "iq-eval-04-2",
    "lessonId": "eval-04",
    "question": "检索指标不错但 RAG 回答错误，怎样继续定位？",
    "shortAnswer": "分别检查候选资料、实际送入模型的上下文和回答主张，核对有效版本与必要证据是否保留；用受控回放改变一个环节，检验假设后再做端到端回归。",
    "deepDive": [
      "候选文档找到但打包删掉关键条款的情况",
      "相关材料缺少适用范围和例外条件仍可能不足"
    ],
    "misconceptions": [
      "检索命中说明模型一定获得了所有必要证据"
    ],
    "followUps": [
      "一次替换上下文成功能否证明全部失败同因？"
    ],
    "frequency": "高",
    "difficulty": "进阶",
    "roles": [
      "Agent 开发",
      "AI 应用",
      "后端工程"
    ]
  },
  {
    "id": "iq-eval-04-3",
    "lessonId": "eval-04",
    "question": "Agent 工单终态正确，是否还需要分析轨迹？",
    "shortAnswer": "需要。终态不能证明创建前得到必要确认或未越界访问，应分别核验工具提案、可信执行、数据库结果与关键过程条件，缺少证据时保留未知。",
    "deepDive": [
      "引用 τ-bench reward 必要非充分的边界",
      "区分合法的不同工具路径与必须满足的业务条件"
    ],
    "misconceptions": [
      "数据库正确就可以忽略所有过程信息"
    ],
    "followUps": [
      "为什么隔离回放不能直接重复真实写操作？"
    ],
    "frequency": "高",
    "difficulty": "进阶",
    "roles": [
      "Agent 开发",
      "AI 应用",
      "后端工程"
    ]
  },
  {
    "id": "iq-eval-05-1",
    "lessonId": "eval-05",
    "question": "一次跨队列的 Agent 请求怎样留下可诊断证据，为什么 traceId 不能当授权？",
    "shortAnswer": "用运行身份关联 trace、日志和结果，跨边界注入与提取上下文，按实际包含或因果关系使用 parent/link；资源权限仍按业务身份独立检查。",
    "deepDive": [
      "区分任务成功、span 操作状态与工具授权三个结果，不能由其中一个推出另外两个。",
      "验证队列、重试和第三方边界的传播与信任来源，敏感内容不能随 baggage 扩散。"
    ],
    "misconceptions": [
      "关联 ID 格式合法就意味着来源可信、权限有效。"
    ],
    "followUps": [
      "异步工作进入新 trace 时，怎样保留原任务与因果关系？"
    ],
    "frequency": "高",
    "difficulty": "进阶",
    "roles": [
      "Agent 开发",
      "AI 应用",
      "后端工程"
    ]
  },
  {
    "id": "iq-eval-05-2",
    "lessonId": "eval-05",
    "question": "错误 trace 都被保留后，如何避免把观测样本当成总体质量？",
    "shortAnswer": "先报告选择策略、保留数量和已知总体，再把诊断样本错误率与总体 SLI 分开；head/tail 组合也无法恢复上游丢掉的记录。",
    "deepDive": [
      "head 在早期决定，tail 可依据后续错误但需要缓存、等待和容量监控；完整性仍取决于收集链路。",
      "本课固定六条不是概率实验。all 为 2/6，固定第 1、4 条为 0/2，errors-only 为 2/2，不能据此估计真实线上质量。"
    ],
    "misconceptions": [
      "tail sampling 既保留错误，又自动保证样本代表全部流量。"
    ],
    "followUps": [
      "如果采样器过载、晚到 span 未进入选择，报告应补充什么边界？"
    ],
    "frequency": "高",
    "difficulty": "深挖",
    "roles": [
      "Agent 开发",
      "AI 应用",
      "后端工程"
    ]
  },
  {
    "id": "iq-eval-05-3",
    "lessonId": "eval-05",
    "question": "怎样记录模型和提示版本，同时避免高基数与敏感数据暴露？",
    "shortAnswer": "精确版本与运行身份进入日志和 trace，指标使用有限发布组并保留映射；默认不采集指令和正文，允许字段还要审查值，哈希也不能代替访问控制。",
    "deepDive": [
      "每个标签组合会增加时间序列，自动生成的提示词哈希并非天然低基数。",
      "截至 2026-09-18，GenAI 约定位于新官方仓库且为 Development；按固定版本核对真实导出，教学字段不能冒充标准属性。"
    ],
    "misconceptions": [
      "只要字段名称在允许清单里，任何字段值都可以安全存储。"
    ],
    "followUps": [
      "为了调查一次错误引用，哪些信息可以用受控引用代替正文？"
    ],
    "frequency": "高",
    "difficulty": "进阶",
    "roles": [
      "Agent 开发",
      "AI 应用",
      "后端工程"
    ]
  },
  {
    "id": "iq-eval-06-1",
    "lessonId": "eval-06",
    "question": "可信用户发起的知识查询为什么仍需要防范间接提示注入？",
    "shortAnswer": "可信用户授权的是查询任务，检索文档和工具结果可能由第三方控制；这些材料中的指令不能扩展原目标或资源权限，后续候选调用仍必须通过执行端鉴权。",
    "deepDive": [
      "从原任务、材料可控者和进入位置解释直接与间接注入的不同测试入口。",
      "保留材料来源有助于判断内容性质，但来源标签不等于当前用户授权，更不能替代下游策略。"
    ],
    "misconceptions": [
      "公司知识库返回的所有文字都可以当系统指令。"
    ],
    "followUps": [
      "如果连接器已经经过审核，它返回的文档是否还要按不可信内容处理？"
    ],
    "frequency": "高",
    "difficulty": "基础",
    "roles": [
      "Agent 开发",
      "AI 应用",
      "后端工程"
    ]
  },
  {
    "id": "iq-eval-06-2",
    "lessonId": "eval-06",
    "question": "怎样在工具执行端实现 complete mediation，并避免一次批准被套用于另一项动作？",
    "shortAnswer": "执行端对每次请求核对应用确认的用户身份、目标资源和操作权限；必要确认绑定动作、对象、目的地与内容，参数变化后重新核对，并始终保留不可绕过的权限限制。",
    "deepDive": [
      "模型提出的是工具调用提案，不能用它自行填写的身份或授权描述作为许可依据。",
      "先验证硬性权限，再检查具体确认；缺授权时拒绝，缺可补充确认时暂停，不能通过重复调用碰运气。"
    ],
    "misconceptions": [
      "只要用户点过同意，后续所有相似操作都获得授权。"
    ],
    "followUps": [
      "如果动作对象已经变化，但用户确认文本没有变化，执行器应验证什么？"
    ],
    "frequency": "高",
    "difficulty": "进阶",
    "roles": [
      "Agent 开发",
      "AI 应用",
      "后端工程"
    ]
  },
  {
    "id": "iq-eval-06-3",
    "lessonId": "eval-06",
    "question": "为什么提示防护、工具最小权限与环境隔离需要一起设计？",
    "shortAnswer": "提示防护降低不当提案概率，工具和下游身份限制可执行能力，环境隔离约束文件与网络可达范围；任一层失效时其他层仍应限制后果，不能用可信连接器代替内容边界。",
    "deepDive": [
      "只读总结不应同时提供无关发送、修改与任意命令能力；收紧功能和资源权限是不同动作。",
      "工具实现可被审核，返回材料仍可能被第三方改变；域名允许也不能自动推导其所有功能均适用。"
    ],
    "misconceptions": [
      "只要加了沙箱，所有提示注入都不再需要测试。"
    ],
    "followUps": [
      "如何在合成数据环境中检查执行端阻止越权读取的实际证据？"
    ],
    "frequency": "中",
    "difficulty": "深挖",
    "roles": [
      "Agent 开发",
      "AI 应用",
      "后端工程"
    ]
  },
  {
    "id": "iq-eval-07-1",
    "lessonId": "eval-07",
    "question": "如何设计安全评测，避免只看拒绝率或只看攻击成功率？",
    "shortAnswer": "先定义攻击目标与可观察副作用，再保留攻击集和正常对照，分别统计检测漏报、误报导致的正常误拒和实际越权；报告各自分母、配置及覆盖范围。",
    "deepDive": [
      "模型可能先执行后拒绝，必须核对工具与环境终态；执行端阻断也不能把原来的检测漏报改成命中。",
      "正常对照应包含容易误判的合法操作，避免全部拒绝取得表面安全；有限样本通过不能覆盖未知攻击。"
    ],
    "misconceptions": [
      "最终拒绝文字足以证明攻击没有成功。"
    ],
    "followUps": [
      "执行端策略开启后副作用为零，为什么仍要继续修复检测漏报？"
    ],
    "frequency": "高",
    "difficulty": "进阶",
    "roles": [
      "Agent 开发",
      "AI 应用",
      "后端工程"
    ]
  },
  {
    "id": "iq-eval-07-2",
    "lessonId": "eval-07",
    "question": "结构化输出为什么不能替代下游消费校验？",
    "shortAnswer": "JSON 校验只说明字段结构符合约定，字段内容进入 HTML、SQL 或文件路径后仍可能被解释成不同操作；应用需按消费环境编码、参数化或限制路径，并继续核对授权。",
    "deepDive": [
      "HTML 展示关注文本与可执行内容的处理，SQL 参数化关注查询结构与数据的分离，两者不能用同一条正则替代。",
      "路径必须由执行代码验证在允许范围内；即使参数完全合法，也仍需确定当前用户有权访问目标。"
    ],
    "misconceptions": [
      "只要模型返回合法 JSON，就能直接把每个字段传给任意后端函数。"
    ],
    "followUps": [
      "参数化查询与数据库资源权限分别防止什么问题？"
    ],
    "frequency": "高",
    "difficulty": "基础",
    "roles": [
      "Agent 开发",
      "AI 应用",
      "后端工程"
    ]
  },
  {
    "id": "iq-eval-07-3",
    "lessonId": "eval-07",
    "question": "怎样把一次红队发现变成可长期使用、又不扩大数据暴露的回归？",
    "shortAnswer": "保留原任务、可控入口、预期策略和实际后果，提炼最小复现并替换敏感原文；加入正常对照与执行断言，固定版本和配置，在相关变更后同时检查漏防、误拒及日志保护。",
    "deepDive": [
      "失败归档需要足够复现但不需要复制全部上下文，用合成标记定位泄漏路径并保留关联和决策证据。",
      "修复后同时回放攻击与正常任务，独立检查输出消费及日志异常分支，避免模型行为改善掩盖其他边界退化。"
    ],
    "misconceptions": [
      "为了复现，日志必须永久保存完整敏感工具响应。"
    ],
    "followUps": [
      "如果失败只出现在异常日志中，应给回归增加什么断言？"
    ],
    "frequency": "中",
    "difficulty": "深挖",
    "roles": [
      "Agent 开发",
      "AI 应用",
      "后端工程"
    ]
  },
  {
    "id": "iq-eval-08-1",
    "lessonId": "eval-08",
    "question": "离线指标提高后，怎样设计影子与灰度验证，避免把未知当通过？",
    "shortAnswer": "先冻结候选与留出检查，再用无真实写副作用的影子路径观察差异，最后按受限流量比较候选和对照；关键切片缺少有效样本时保持 hold。",
    "deepDive": [
      "影子输出不对外展示仍可能写共享缓存、记忆或调用写工具，必须用只读范围、隔离状态和替身控制。",
      "灰度要声明分组、窗口、有效样本和停止条件，不能用发布前后均值排除时间混杂，也不能忽略共享故障域。"
    ],
    "misconceptions": [
      "离线通过、影子不回复用户，就足以保证可以安全全量。"
    ],
    "followUps": [
      "如果影子候选必须调用真实写工具才能继续，你怎样调整验证方式？"
    ],
    "frequency": "高",
    "difficulty": "进阶",
    "roles": [
      "Agent 开发",
      "AI 应用",
      "后端工程"
    ]
  },
  {
    "id": "iq-eval-08-2",
    "lessonId": "eval-08",
    "question": "怎样定义 Agent 的 SLI 和错误预算，为什么安全失败不能被平均质量抵消？",
    "shortAnswer": "分别定义技术成功、任务合格与时延的事件口径、分母、窗口和测量位置，报告未评分覆盖；可靠性预算不允许越权或泄漏，本课安全硬门独立 block。",
    "deepDive": [
      "已评分样本的 84/90 不能冒充一百次总运行的确定质量，另外十次未知必须单独报告。",
      "候选优于对照仍可能两者一起违反绝对 SLO；低灰度比例只限制部分影响，不能为数据披露提供豁免。"
    ],
    "misconceptions": [
      "所有指标都可以汇成一个分数，只要总分升高就能发布。"
    ],
    "followUps": [
      "评分延迟或网关失败没有进入 worker 计数，会怎样影响你的分母？"
    ],
    "frequency": "高",
    "difficulty": "深挖",
    "roles": [
      "Agent 开发",
      "AI 应用",
      "后端工程"
    ]
  },
  {
    "id": "iq-eval-08-3",
    "lessonId": "eval-08",
    "question": "回滚后怎样证明事故形成了有效闭环，最终交付应包含什么？",
    "shortAnswer": "确认影响控制后重建事实时间线，把缺口变成有负责人和复验条件的行动；交付测试集、评分器、trace、威胁、发布记录与复盘，并验证回归和合法对照。",
    "deepDive": [
      "回滚无法撤销已披露内容、已经执行的写入或在途副作用，技术恢复与事故后果处理应分开记录。",
      "六类材料通过案例、运行和版本互相对应；行动项有完成结果，修复既阻止旧失败也保持正常任务可用。"
    ],
    "misconceptions": [
      "复盘写出“模型错误”或“加强测试”，就算根因和行动项已完成。"
    ],
    "followUps": [
      "修复后所有请求都被拒绝，为什么仍不能关闭该事故行动？"
    ],
    "frequency": "高",
    "difficulty": "进阶",
    "roles": [
      "Agent 开发",
      "AI 应用",
      "后端工程"
    ]
  }
];

const coverageMatrix = {
  "eval-01": [
    {
      "fieldPath": "objectives[0]",
      "sectionId": "eval01-outcome-evidence",
      "sourceIds": [
        "res-eval-anthropic-evals",
        "res-eval-tau-bench"
      ]
    },
    {
      "fieldPath": "objectives[1]",
      "sectionId": "eval01-dataset-boundary",
      "sourceIds": [
        "res-eval-sklearn-leakage",
        "res-eval-anthropic-evals"
      ]
    },
    {
      "fieldPath": "objectives[2]",
      "sectionId": "eval01-version-ledger",
      "sourceIds": [
        "res-eval-anthropic-evals",
        "res-eval-sklearn-leakage"
      ]
    },
    {
      "fieldPath": "quiz[0]",
      "sectionId": "eval01-outcome-evidence",
      "sourceIds": [
        "res-eval-anthropic-evals",
        "res-eval-tau-bench"
      ]
    },
    {
      "fieldPath": "quiz[1]",
      "sectionId": "eval01-dataset-boundary",
      "sourceIds": [
        "res-eval-sklearn-leakage",
        "res-eval-anthropic-evals"
      ]
    },
    {
      "fieldPath": "interviewQuestionIds[0]",
      "sectionId": "eval01-outcome-evidence",
      "sourceIds": [
        "res-eval-anthropic-evals",
        "res-eval-tau-bench"
      ]
    },
    {
      "fieldPath": "interviewQuestionIds[1]",
      "sectionId": "eval01-case-contract",
      "sourceIds": [
        "res-eval-anthropic-evals",
        "res-eval-tau-bench"
      ]
    },
    {
      "fieldPath": "interviewQuestionIds[2]",
      "sectionId": "eval01-isolated-baseline",
      "sourceIds": [
        "res-eval-anthropic-evals"
      ]
    },
    {
      "fieldPath": "exercise.steps[0]",
      "sectionId": "eval01-case-contract",
      "sourceIds": [
        "res-eval-anthropic-evals",
        "res-eval-tau-bench"
      ]
    },
    {
      "fieldPath": "exercise.steps[1]",
      "sectionId": "eval01-dataset-boundary",
      "sourceIds": [
        "res-eval-sklearn-leakage",
        "res-eval-anthropic-evals"
      ]
    },
    {
      "fieldPath": "exercise.steps[2]",
      "sectionId": "eval01-version-ledger",
      "sourceIds": [
        "res-eval-anthropic-evals",
        "res-eval-sklearn-leakage"
      ]
    },
    {
      "fieldPath": "completionCriteria[0]",
      "sectionId": "eval01-outcome-evidence",
      "sourceIds": [
        "res-eval-anthropic-evals",
        "res-eval-tau-bench"
      ]
    },
    {
      "fieldPath": "completionCriteria[1]",
      "sectionId": "eval01-design-review",
      "sourceIds": [
        "res-eval-anthropic-evals",
        "res-eval-tau-bench"
      ]
    },
    {
      "fieldPath": "exercise.deliverable",
      "sectionId": "eval01-design-review",
      "sourceIds": [
        "res-eval-anthropic-evals",
        "res-eval-tau-bench"
      ]
    }
  ],
  "eval-02": [
    {
      "fieldPath": "objectives[0]",
      "sectionId": "eval02-grader-routing",
      "sourceIds": [
        "res-eval-anthropic-evals",
        "res-eval-mt-bench"
      ]
    },
    {
      "fieldPath": "objectives[1]",
      "sectionId": "eval02-rubric-design",
      "sourceIds": [
        "res-eval-anthropic-evals",
        "res-eval-mt-bench"
      ]
    },
    {
      "fieldPath": "objectives[2]",
      "sectionId": "eval02-human-calibration",
      "sourceIds": [
        "res-eval-anthropic-evals",
        "res-eval-mt-bench"
      ]
    },
    {
      "fieldPath": "quiz[0]",
      "sectionId": "eval02-pairwise-bias",
      "sourceIds": [
        "res-eval-mt-bench"
      ]
    },
    {
      "fieldPath": "quiz[1]",
      "sectionId": "eval02-unknown-disagreement",
      "sourceIds": [
        "res-eval-anthropic-evals",
        "res-eval-mt-bench"
      ]
    },
    {
      "fieldPath": "interviewQuestionIds[0]",
      "sectionId": "eval02-grader-routing",
      "sourceIds": [
        "res-eval-anthropic-evals",
        "res-eval-mt-bench"
      ]
    },
    {
      "fieldPath": "interviewQuestionIds[1]",
      "sectionId": "eval02-pairwise-bias",
      "sourceIds": [
        "res-eval-mt-bench"
      ]
    },
    {
      "fieldPath": "interviewQuestionIds[2]",
      "sectionId": "eval02-human-calibration",
      "sourceIds": [
        "res-eval-anthropic-evals",
        "res-eval-mt-bench"
      ]
    },
    {
      "fieldPath": "exercise.steps[0]",
      "sectionId": "eval02-rubric-design",
      "sourceIds": [
        "res-eval-anthropic-evals",
        "res-eval-mt-bench"
      ]
    },
    {
      "fieldPath": "exercise.steps[1]",
      "sectionId": "eval02-pairwise-bias",
      "sourceIds": [
        "res-eval-mt-bench"
      ]
    },
    {
      "fieldPath": "exercise.steps[2]",
      "sectionId": "eval02-grader-regression",
      "sourceIds": [
        "res-eval-anthropic-evals",
        "res-eval-mt-bench"
      ]
    },
    {
      "fieldPath": "completionCriteria[0]",
      "sectionId": "eval02-rubric-design",
      "sourceIds": [
        "res-eval-anthropic-evals",
        "res-eval-mt-bench"
      ]
    },
    {
      "fieldPath": "completionCriteria[1]",
      "sectionId": "eval02-human-calibration",
      "sourceIds": [
        "res-eval-anthropic-evals",
        "res-eval-mt-bench"
      ]
    },
    {
      "fieldPath": "exercise.deliverable",
      "sectionId": "eval02-grader-regression",
      "sourceIds": [
        "res-eval-anthropic-evals",
        "res-eval-mt-bench"
      ]
    }
  ],
  "eval-03": [
    {
      "fieldPath": "objectives[0]",
      "sectionId": "eval03-slice-regression",
      "sourceIds": [
        "res-eval-anthropic-evals"
      ]
    },
    {
      "fieldPath": "objectives[1]",
      "sectionId": "eval03-repeated-trials",
      "sourceIds": [
        "res-eval-tau-bench",
        "res-eval-anthropic-evals"
      ]
    },
    {
      "fieldPath": "objectives[2]",
      "sectionId": "eval03-release-policy",
      "sourceIds": [
        "res-eval-anthropic-evals",
        "res-eval-tau-bench"
      ]
    },
    {
      "fieldPath": "quiz[0]",
      "sectionId": "eval03-slice-regression",
      "sourceIds": [
        "res-eval-anthropic-evals"
      ]
    },
    {
      "fieldPath": "quiz[1]",
      "sectionId": "eval03-repeated-trials",
      "sourceIds": [
        "res-eval-tau-bench",
        "res-eval-anthropic-evals"
      ]
    },
    {
      "fieldPath": "interviewQuestionIds[0]",
      "sectionId": "eval03-comparable-runs",
      "sourceIds": [
        "res-eval-anthropic-evals",
        "res-eval-tau-bench"
      ]
    },
    {
      "fieldPath": "interviewQuestionIds[1]",
      "sectionId": "eval03-repeated-trials",
      "sourceIds": [
        "res-eval-tau-bench",
        "res-eval-anthropic-evals"
      ]
    },
    {
      "fieldPath": "interviewQuestionIds[2]",
      "sectionId": "eval03-release-policy",
      "sourceIds": [
        "res-eval-anthropic-evals",
        "res-eval-tau-bench"
      ]
    },
    {
      "fieldPath": "exercise.steps[0]",
      "sectionId": "eval03-gate-experiment",
      "sourceIds": [
        "res-eval-anthropic-evals",
        "res-eval-tau-bench"
      ]
    },
    {
      "fieldPath": "exercise.steps[1]",
      "sectionId": "eval03-gate-experiment",
      "sourceIds": [
        "res-eval-anthropic-evals",
        "res-eval-tau-bench"
      ]
    },
    {
      "fieldPath": "exercise.steps[2]",
      "sectionId": "eval03-gate-experiment",
      "sourceIds": [
        "res-eval-anthropic-evals",
        "res-eval-tau-bench"
      ]
    },
    {
      "fieldPath": "completionCriteria[0]",
      "sectionId": "eval03-release-policy",
      "sourceIds": [
        "res-eval-anthropic-evals",
        "res-eval-tau-bench"
      ]
    },
    {
      "fieldPath": "completionCriteria[1]",
      "sectionId": "eval03-evidence-uncertainty",
      "sourceIds": [
        "res-eval-anthropic-evals",
        "res-eval-tau-bench"
      ]
    },
    {
      "fieldPath": "exercise.deliverable",
      "sectionId": "eval03-gate-experiment",
      "sourceIds": [
        "res-eval-anthropic-evals",
        "res-eval-tau-bench"
      ]
    }
  ],
  "eval-04": [
    {
      "fieldPath": "objectives[0]",
      "sectionId": "eval04-end-to-end-map",
      "sourceIds": [
        "res-eval-ragas",
        "res-eval-tau-bench",
        "res-eval-anthropic-evals"
      ]
    },
    {
      "fieldPath": "objectives[1]",
      "sectionId": "eval04-quality-dimensions",
      "sourceIds": [
        "res-eval-ragas"
      ]
    },
    {
      "fieldPath": "objectives[2]",
      "sectionId": "eval04-controlled-replay",
      "sourceIds": [
        "res-eval-anthropic-evals",
        "res-eval-ragas",
        "res-eval-tau-bench"
      ]
    },
    {
      "fieldPath": "quiz[0]",
      "sectionId": "eval04-quality-dimensions",
      "sourceIds": [
        "res-eval-ragas"
      ]
    },
    {
      "fieldPath": "quiz[1]",
      "sectionId": "eval04-retrieval-diagnosis",
      "sourceIds": [
        "res-eval-ragas",
        "res-eval-anthropic-evals"
      ]
    },
    {
      "fieldPath": "interviewQuestionIds[0]",
      "sectionId": "eval04-quality-dimensions",
      "sourceIds": [
        "res-eval-ragas"
      ]
    },
    {
      "fieldPath": "interviewQuestionIds[1]",
      "sectionId": "eval04-retrieval-diagnosis",
      "sourceIds": [
        "res-eval-ragas",
        "res-eval-anthropic-evals"
      ]
    },
    {
      "fieldPath": "interviewQuestionIds[2]",
      "sectionId": "eval04-answer-action-boundary",
      "sourceIds": [
        "res-eval-ragas",
        "res-eval-tau-bench",
        "res-eval-anthropic-evals"
      ]
    },
    {
      "fieldPath": "exercise.steps[0]",
      "sectionId": "eval04-attribution-report",
      "sourceIds": [
        "res-eval-anthropic-evals",
        "res-eval-ragas",
        "res-eval-tau-bench"
      ]
    },
    {
      "fieldPath": "exercise.steps[1]",
      "sectionId": "eval04-answer-action-boundary",
      "sourceIds": [
        "res-eval-ragas",
        "res-eval-tau-bench",
        "res-eval-anthropic-evals"
      ]
    },
    {
      "fieldPath": "exercise.steps[2]",
      "sectionId": "eval04-controlled-replay",
      "sourceIds": [
        "res-eval-anthropic-evals",
        "res-eval-ragas",
        "res-eval-tau-bench"
      ]
    },
    {
      "fieldPath": "completionCriteria[0]",
      "sectionId": "eval04-quality-dimensions",
      "sourceIds": [
        "res-eval-ragas"
      ]
    },
    {
      "fieldPath": "completionCriteria[1]",
      "sectionId": "eval04-attribution-report",
      "sourceIds": [
        "res-eval-anthropic-evals",
        "res-eval-ragas",
        "res-eval-tau-bench"
      ]
    },
    {
      "fieldPath": "exercise.deliverable",
      "sectionId": "eval04-attribution-report",
      "sourceIds": [
        "res-eval-anthropic-evals",
        "res-eval-ragas",
        "res-eval-tau-bench"
      ]
    }
  ],
  "eval-05": [
    {
      "fieldPath": "objectives[0]",
      "sectionId": "trace-evidence",
      "sourceIds": [
        "res-eval-otel-traces",
        "res-eval-otel-context"
      ]
    },
    {
      "fieldPath": "objectives[1]",
      "sectionId": "sampling-bias",
      "sourceIds": [
        "res-eval-otel-sampling",
        "res-eval-prometheus"
      ]
    },
    {
      "fieldPath": "quiz[0]",
      "sectionId": "sampling-bias",
      "sourceIds": [
        "res-eval-otel-sampling"
      ]
    },
    {
      "fieldPath": "quiz[1]",
      "sectionId": "minimal-data",
      "sourceIds": [
        "res-eval-otel-sensitive",
        "res-eval-otel-context"
      ]
    },
    {
      "fieldPath": "interviewQuestionIds[0]",
      "sectionId": "propagation-boundaries",
      "sourceIds": [
        "res-eval-otel-context",
        "res-eval-otel-traces"
      ]
    },
    {
      "fieldPath": "interviewQuestionIds[1]",
      "sectionId": "sampling-bias",
      "sourceIds": [
        "res-eval-otel-sampling"
      ]
    },
    {
      "fieldPath": "interviewQuestionIds[2]",
      "sectionId": "genai-conventions",
      "sourceIds": [
        "res-eval-otel-genai",
        "res-eval-otel-sensitive"
      ]
    },
    {
      "fieldPath": "exercise.steps[0]",
      "sectionId": "propagation-boundaries",
      "sourceIds": [
        "res-eval-otel-context",
        "res-eval-otel-traces"
      ]
    },
    {
      "fieldPath": "exercise.steps[1]",
      "sectionId": "sampling-bias",
      "sourceIds": [
        "res-eval-otel-sampling"
      ]
    },
    {
      "fieldPath": "exercise.steps[2]",
      "sectionId": "minimal-data",
      "sourceIds": [
        "res-eval-otel-sensitive",
        "res-eval-otel-genai"
      ]
    },
    {
      "fieldPath": "exercise.deliverable",
      "sectionId": "minimal-data",
      "sourceIds": [
        "res-eval-otel-sensitive",
        "res-eval-otel-context"
      ]
    },
    {
      "fieldPath": "completionCriteria[0]",
      "sectionId": "trace-evidence",
      "sourceIds": [
        "res-eval-otel-traces",
        "res-eval-otel-context"
      ]
    },
    {
      "fieldPath": "completionCriteria[1]",
      "sectionId": "minimal-data",
      "sourceIds": [
        "res-eval-otel-sensitive",
        "res-eval-otel-genai"
      ]
    }
  ],
  "eval-06": [
    {
      "fieldPath": "objectives[0]",
      "sectionId": "eval-threat-model",
      "sourceIds": [
        "res-eval-owasp-injection",
        "res-eval-owasp-agency"
      ]
    },
    {
      "fieldPath": "objectives[1]",
      "sectionId": "eval-action-authorization",
      "sourceIds": [
        "res-eval-owasp-agency",
        "res-eval-claude-guardrails"
      ]
    },
    {
      "fieldPath": "quiz[0]",
      "sectionId": "eval-injection-path",
      "sourceIds": [
        "res-eval-owasp-injection",
        "res-eval-claude-guardrails"
      ]
    },
    {
      "fieldPath": "quiz[1]",
      "sectionId": "eval-action-authorization",
      "sourceIds": [
        "res-eval-owasp-agency"
      ]
    },
    {
      "fieldPath": "interviewQuestionIds[0]",
      "sectionId": "eval-injection-path",
      "sourceIds": [
        "res-eval-owasp-injection",
        "res-eval-claude-guardrails"
      ]
    },
    {
      "fieldPath": "interviewQuestionIds[1]",
      "sectionId": "eval-action-authorization",
      "sourceIds": [
        "res-eval-owasp-agency",
        "res-eval-claude-guardrails"
      ]
    },
    {
      "fieldPath": "interviewQuestionIds[2]",
      "sectionId": "eval-minimum-capability",
      "sourceIds": [
        "res-eval-owasp-agency",
        "res-eval-anthropic-containment"
      ]
    },
    {
      "fieldPath": "exercise.steps[0]",
      "sectionId": "eval-threat-exercise",
      "sourceIds": [
        "res-eval-owasp-agency",
        "res-eval-claude-guardrails"
      ]
    },
    {
      "fieldPath": "exercise.steps[1]",
      "sectionId": "eval-action-authorization",
      "sourceIds": [
        "res-eval-owasp-agency",
        "res-eval-claude-guardrails"
      ]
    },
    {
      "fieldPath": "exercise.steps[2]",
      "sectionId": "eval-malicious-retrieval",
      "sourceIds": [
        "res-eval-owasp-agency",
        "res-eval-anthropic-containment"
      ]
    },
    {
      "fieldPath": "exercise.deliverable",
      "sectionId": "eval-threat-exercise",
      "sourceIds": [
        "res-eval-owasp-agency",
        "res-eval-owasp-logging"
      ]
    },
    {
      "fieldPath": "completionCriteria[0]",
      "sectionId": "eval-threat-model",
      "sourceIds": [
        "res-eval-owasp-injection",
        "res-eval-owasp-agency"
      ]
    },
    {
      "fieldPath": "completionCriteria[1]",
      "sectionId": "eval-threat-exercise",
      "sourceIds": [
        "res-eval-owasp-agency",
        "res-eval-claude-guardrails"
      ]
    }
  ],
  "eval-07": [
    {
      "fieldPath": "objectives[0]",
      "sectionId": "eval-safety-outcomes",
      "sourceIds": [
        "res-eval-anthropic-containment",
        "res-eval-owasp-agency"
      ]
    },
    {
      "fieldPath": "objectives[1]",
      "sectionId": "eval-security-release",
      "sourceIds": [
        "res-eval-owasp-output",
        "res-eval-owasp-logging",
        "res-eval-claude-guardrails"
      ]
    },
    {
      "fieldPath": "quiz[0]",
      "sectionId": "eval-regression-fixture",
      "sourceIds": [
        "res-eval-owasp-agency",
        "res-eval-anthropic-containment"
      ]
    },
    {
      "fieldPath": "quiz[1]",
      "sectionId": "eval-output-consumers",
      "sourceIds": [
        "res-eval-owasp-output",
        "res-eval-owasp-agency"
      ]
    },
    {
      "fieldPath": "interviewQuestionIds[0]",
      "sectionId": "eval-safety-outcomes",
      "sourceIds": [
        "res-eval-anthropic-containment",
        "res-eval-owasp-agency"
      ]
    },
    {
      "fieldPath": "interviewQuestionIds[1]",
      "sectionId": "eval-output-consumers",
      "sourceIds": [
        "res-eval-owasp-output",
        "res-eval-owasp-agency"
      ]
    },
    {
      "fieldPath": "interviewQuestionIds[2]",
      "sectionId": "eval-security-release",
      "sourceIds": [
        "res-eval-claude-guardrails",
        "res-eval-owasp-logging"
      ]
    },
    {
      "fieldPath": "exercise.steps[0]",
      "sectionId": "eval-safety-corpus",
      "sourceIds": [
        "res-eval-owasp-injection",
        "res-eval-claude-guardrails"
      ]
    },
    {
      "fieldPath": "exercise.steps[1]",
      "sectionId": "eval-regression-fixture",
      "sourceIds": [
        "res-eval-owasp-agency",
        "res-eval-anthropic-containment"
      ]
    },
    {
      "fieldPath": "exercise.steps[2]",
      "sectionId": "eval-security-release",
      "sourceIds": [
        "res-eval-claude-guardrails",
        "res-eval-owasp-output",
        "res-eval-owasp-logging"
      ]
    },
    {
      "fieldPath": "exercise.deliverable",
      "sectionId": "eval-security-release",
      "sourceIds": [
        "res-eval-owasp-output",
        "res-eval-owasp-logging",
        "res-eval-anthropic-containment"
      ]
    },
    {
      "fieldPath": "completionCriteria[0]",
      "sectionId": "eval-safety-outcomes",
      "sourceIds": [
        "res-eval-anthropic-containment",
        "res-eval-owasp-agency"
      ]
    },
    {
      "fieldPath": "completionCriteria[1]",
      "sectionId": "eval-security-release",
      "sourceIds": [
        "res-eval-claude-guardrails",
        "res-eval-owasp-output",
        "res-eval-owasp-logging"
      ]
    }
  ],
  "eval-08": [
    {
      "fieldPath": "objectives[0]",
      "sectionId": "canary-decisions",
      "sourceIds": [
        "res-eval-sre-canary",
        "res-eval-anthropic-evals"
      ]
    },
    {
      "fieldPath": "objectives[1]",
      "sectionId": "delivery-evidence",
      "sourceIds": [
        "res-eval-sre-slos",
        "res-eval-sre-postmortem",
        "res-eval-anthropic-evals"
      ]
    },
    {
      "fieldPath": "quiz[0]",
      "sectionId": "canary-decisions",
      "sourceIds": [
        "res-eval-sre-canary",
        "res-eval-anthropic-evals"
      ]
    },
    {
      "fieldPath": "quiz[1]",
      "sectionId": "canary-decisions",
      "sourceIds": [
        "res-eval-sre-canary",
        "res-eval-sre-slos"
      ]
    },
    {
      "fieldPath": "interviewQuestionIds[0]",
      "sectionId": "shadow-isolation",
      "sourceIds": [
        "res-eval-sre-canary",
        "res-eval-otel-sensitive"
      ]
    },
    {
      "fieldPath": "interviewQuestionIds[1]",
      "sectionId": "sli-denominators",
      "sourceIds": [
        "res-eval-sre-slos",
        "res-eval-prometheus"
      ]
    },
    {
      "fieldPath": "interviewQuestionIds[2]",
      "sectionId": "incident-feedback",
      "sourceIds": [
        "res-eval-sre-postmortem",
        "res-eval-sre-canary",
        "res-eval-anthropic-evals"
      ]
    },
    {
      "fieldPath": "exercise.steps[0]",
      "sectionId": "release-evidence",
      "sourceIds": [
        "res-eval-anthropic-evals",
        "res-eval-sklearn-leakage",
        "res-eval-sre-canary"
      ]
    },
    {
      "fieldPath": "exercise.steps[1]",
      "sectionId": "canary-decisions",
      "sourceIds": [
        "res-eval-sre-canary",
        "res-eval-sre-slos"
      ]
    },
    {
      "fieldPath": "exercise.steps[2]",
      "sectionId": "incident-feedback",
      "sourceIds": [
        "res-eval-sre-postmortem",
        "res-eval-anthropic-evals"
      ]
    },
    {
      "fieldPath": "exercise.deliverable",
      "sectionId": "delivery-evidence",
      "sourceIds": [
        "res-eval-anthropic-evals",
        "res-eval-sre-canary",
        "res-eval-sre-postmortem"
      ]
    },
    {
      "fieldPath": "completionCriteria[0]",
      "sectionId": "canary-decisions",
      "sourceIds": [
        "res-eval-sre-canary",
        "res-eval-anthropic-evals"
      ]
    },
    {
      "fieldPath": "completionCriteria[1]",
      "sectionId": "delivery-evidence",
      "sourceIds": [
        "res-eval-sre-slos",
        "res-eval-sre-postmortem"
      ]
    }
  ]
};

const lessons = lessonSpecs.map((lesson) => ({ ...lesson, knowledgeNote: evalsNotes[lesson.id] }));
const resources = evalResources.map((resource) => ({
  ...resource,
  lessonIds: lessons.filter((lesson) => lesson.resourceIds.includes(resource.id)).map(({ id }) => id),
}));

export const evalsObservabilitySecurity = deepFreeze({
  id: 'evals-observability-security',
  title: '评测、可观测与安全',
  summary: '用任务结果、分组回归、运行证据与执行边界，判断 Agent 是否值得发布，并把线上失败变成可复验的改进。',
  lessons,
  resources,
  interviewQuestions,
  interviewSupplements: [],
  coverageMatrix,
});
