export const llm04Note = {
  readingMinutes: 36,
  introduction: '上一课已经把文本拆成 token ID、初始 embedding 与位置相关信息，也说明了有限上下文决定一次请求中哪些 token 可见。但把一串带位置的向量交给网络，并不会自动让每个位置取得自己需要的上下文。Attention 要解决的是“当前位置应该从哪些可见位置读取多少信息”，Transformer 则把这种按内容读取与逐位置非线性变换反复堆叠，逐层形成上下文化表示。本章从 Query、Key、Value 的查询—匹配—聚合直觉出发，推到缩放点积、softmax、多头和因果掩码，再比较原始 encoder-decoder Transformer 的 Post-Norm 与 GPT-like decoder-only 的 Pre-Norm 数据流。学完后，你应能不用死背公式准确解释一次 self-attention，画出 decoder-only 块的信息与梯度通路，并在站内实验中区分教学权重和真实 Attention 计算。',
  sections: [
    {
      id: 'input-representation-goal',
      title: '输入表示与目标：让每个位置按需读取上下文',
      paragraphs: [
        '问题：token 已经有 embedding 和位置线索，为什么还要 Attention？输入网络的每个位置先有一个向量，它包含该 token 的初始内容表示，并以具体模型采用的方式加入位置相关信息。此时同一 token 的查表起点可以相同，却还没有结合本句中的其他词。Attention 的任务是让当前位置根据当前表示，从可见位置选择并汇总信息，使输出变成依赖上下文的新表示；它不是从外部资料库检索一段现成答案。',
        'Self-attention 中，查询位置、候选位置和被汇总内容都来自同一序列的当前表示，因此称为“自”注意力。对长度为 n、每个位置宽度为 d_model 的输入，可以先把它看成 n 行向量；注意力会为每一行产生一组对可见行的权重，再输出同样按位置排列的新向量。形状描述的是计算接口，不代表每个向量维度都能被稳定翻译为某个人类概念。',
        '在因果语言模型里，第 i 个位置只能利用允许可见的前缀形成表示，并用多层更新后的状态参与下一 token 预测。这个目标连接了上一课的上下文预算：材料是否进入窗口决定“候选信息是否可见”，Attention 再决定模型在一次具体计算中如何混合可见表示。窗口足够并不保证关键证据一定得到有效利用，注意力权重也不自动等于人类可接受的解释或某项输出的因果贡献。',
      ],
      keyPoints: [
        'Attention 把初始输入表示更新为依赖可见上下文的表示，而不是执行外部知识检索。',
        '上下文窗口决定候选信息是否可见；注意力计算决定可见表示怎样参与当前位置更新。',
      ],
      callout: {
        kind: 'boundary',
        title: '“关注”不是人的注意或因果解释',
        body: 'Attention 权重是模型内部的一组计算系数；它能展示某次 Value 聚合怎样分配权重，却不能单独证明模型为何作出最终判断，也不能替代干预实验和任务评测。',
      },
      sourceIds: ['res-3b1b-attention', 'res-rasbt', 'res-attention-paper'],
    },
    {
      id: 'qkv-query-match-aggregate',
      title: 'Q、K、V：查询、匹配与聚合的三步协作',
      paragraphs: [
        '问题：同一个位置为什么要产生 Query、Key 和 Value 三种向量？输入表示会经过三组学习到的参数投影，分别得到 Query、Key 与 Value。可以把 Query 理解为“当前位置这次想匹配什么”，Key 理解为“每个候选位置提供的匹配索引”，Value 理解为“候选被选中后实际贡献给输出的内容”。这是计算角色的类比，不表示 Q 必须是一句自然语言问题、K 是数据库主键或 V 是原始文本。',
        '计算先让当前位置 i 的 Query 与候选位置 j 的 Key 做匹配，得到 i 对 j 的分数；这些分数经缩放、掩码和 softmax 变成权重后，再对各位置的 Value 做加权求和。因而第一道测验的答案是 Value：Q 与 K 决定“读多少”，V 承担“读什么”。如果提高某个候选的匹配分数并使其他条件不变，softmax 后它通常获得更大相对权重，它的 Value 也会对输出产生更大贡献。',
        '用矩阵形状可检查这条链而无需绑定某个模型尺寸。若输入 X 有 n 个位置，投影后 Q 与 K 可写成 n×d_k，V 写成 n×d_v；QKᵀ 产生 n×n 的位置匹配表，权重矩阵再乘 V，得到 n×d_v 的聚合结果。Q、K、V 的具体语义由训练和当前上下文共同形成，不能预先规定“这一列只找主语”或“某个向量永远存事实”。',
      ],
      keyPoints: [
        'Query 表达当前检索需求，Key 提供匹配索引，Value 提供最终被加权聚合的内容。',
        'QKᵀ 形成位置间匹配表，归一化权重乘 V 才产生当前位置读取到的信息。',
      ],
      callout: {
        kind: 'intuition',
        title: '类比只覆盖计算职责',
        body: '“查询—索引—内容”有助于记住运算顺序，但三者都是当前表示的学习投影，不是一个真实数据库，也没有开发者预先填写的固定语义。',
      },
      sourceIds: ['res-3b1b-attention', 'res-attention-paper', 'res-rasbt'],
    },
    {
      id: 'scaled-dot-softmax',
      title: '缩放点积与 softmax：从匹配分数到读取权重',
      paragraphs: [
        '问题：点积分数为什么不能直接拿来加权 Value？缩放点积注意力先计算 QKᵀ，再除以 Key 向量维度 d_k 的平方根。原始论文给出的动机是：维度较大时，点积量级可能增大，把 softmax 推入梯度很小的饱和区域；除以 √d_k 用于控制这种量级。它不是对所有数值问题、梯度问题或训练不稳定的通用修复，也不能保证不同输入产生均匀权重。',
        '缩放后的每一行分数经过 softmax，转成在允许位置上非负且总和为一的相对权重。若使用掩码，应在 softmax 前把不允许的位置加上足够大的负值，理想化公式常写成“softmax(QKᵀ/√d_k + mask)”；这样被屏蔽位置的概率趋近于零，其余位置重新归一化。softmax 比较的是同一查询下候选之间的相对分数，所以某项权重变化也会连带改变其他候选的份额。',
        '做一个明确构造的二维 Value 算例：假设缩放并掩码后的两个可见分数为 0 与 ln2，则 softmax 权重恰为 1/3 与 2/3；若对应 Value 分别为 [1,0] 与 [0,3]，聚合输出就是 [1/3,2]。这个数字只用于核对“分数—归一化—加权和”的因果链，不是某个真实模型的参数或测量结果。改变第二个分数时，要先重新计算全部 softmax 权重，再重新聚合 Value，不能只局部修改一个百分比。',
      ],
      keyPoints: [
        '缩放点积用 1/√d_k 控制点积量级和 softmax 饱和风险，不承诺解决所有优化问题。',
        '掩码在 softmax 前限制可见位置，softmax 再把允许候选变成总和为一的相对权重。',
      ],
      callout: {
        kind: 'example',
        title: '先算全行权重，再聚合 Value',
        body: '某个匹配分数升高会改变整行 softmax 分配；真实输出来自全部允许位置 Value 的加权和，而不是把分数最高的 token 原样复制过来。',
      },
      sourceIds: ['res-attention-paper', 'res-rasbt', 'res-3b1b-attention'],
    },
    {
      id: 'multi-head-attention',
      title: '多头注意力：在不同投影子空间并行读取',
      paragraphs: [
        '问题：一组 Q、K、V 为什么不够？多头注意力为各个头使用不同的学习投影，让每个头在自己的表示子空间中计算 Q、K、V、缩放点积、softmax 和 Value 聚合。各头结果沿特征维拼接，再经过输出投影，形成一次联合更新。这里的“多头”不是多轮顺序投票，而是同一层中的多组并行读取方式。',
        '多组投影给模型表达不同位置关系与特征组合的机会，但不能在训练前宣布某一头永久负责语法、另一头永久负责指代。训练后有些头可能呈现可描述模式，也可能功能混合或彼此冗余；观察一张注意力图只能提出分析线索。面试回答“多头比单头多什么”时，应回答多组独立投影、并行权重计算、结果拼接与输出投影，而不是背诵一组固定头职责。',
        '头数也不是能力的线性旋钮。在总表示宽度固定的常见设计里，改变头数会改变每个头的维度和计算组织；在其他配置里还可能同时改变参数量、内存访问与吞吐。多个头学到相似模式时，不代表输出必然错误，却可能反映冗余或可压缩空间。工程判断必须依赖具体架构、训练结果和任务评测，不能由“头更多”直接推出“能力按比例更强”。',
      ],
      keyPoints: [
        '每个头使用独立学习投影完成一次注意力，随后拼接并经输出投影形成联合更新。',
        '头的功能不是开发者预先分配的固定语义，增加头数也不保证能力线性增长。',
      ],
      sourceIds: ['res-attention-paper', 'res-rasbt', 'res-happy-llm'],
    },
    {
      id: 'causal-mask',
      title: '因果掩码：训练位置不能偷看未来答案',
      paragraphs: [
        '问题：训练时整段文本同时存在，decoder-only 模型怎样保持下一 token 预测的因果顺序？对查询位置 i，因果掩码只允许它关注自身及更早的位置，屏蔽右侧未来 token。这样训练每个位置时可见的信息与逐 token 生成时的前缀约束一致，不会通过注意力直接读取要预测的后续答案。这正是第二道测验的核心，而不是为了缩小词表或让多个头共享参数。',
        '实现概念上，先生成所有位置匹配分数，再在 softmax 前把 j>i 的项设为不可选；于是权重表呈下三角可见结构。掩码后的权重仍会在每行允许位置内重新归一化。padding mask、权限过滤或应用层资料隔离解决的是别的问题，不能与因果掩码混为一谈；因果可见性也不会自动防止提示注入、事实错误或越权工具调用。',
        '并非所有 Attention 都使用因果掩码。原始 Transformer 的 encoder self-attention 可以读取整个源序列；其 decoder self-attention 使用未来屏蔽，decoder 到 encoder 输出的 cross-attention 则按源序列可见性读取编码结果。GPT-like decoder-only 架构没有原始 encoder 和 cross-attention，只重复因果 self-attention 块。面试追问两类架构差异时，要沿“有哪些序列、每个查询允许看到什么”回答，而不是说 encoder 与 decoder 只是名称不同。',
      ],
      keyPoints: [
        '因果掩码令当前位置只能读取自身及更早 token，使训练可见性符合自回归生成。',
        '因果 mask 用于 decoder self-attention；encoder self-attention 与 cross-attention 的可见性要分别判断。',
      ],
      callout: {
        kind: 'boundary',
        title: '因果可见性不等于系统安全',
        body: 'Mask 约束序列位置间的信息流，不负责资料权限、事实核验或工具授权；Agent 仍需在应用层实施最小权限、校验和评测。',
      },
      sourceIds: ['res-attention-paper', 'res-rasbt', 'res-happy-llm'],
    },
    {
      id: 'decoder-block-information-flow',
      title: '完整数据流：Attention 只是 Transformer 块的一部分',
      paragraphs: [
        '问题：Value 聚合之后，一个 decoder block 还做什么？先用中性流程画出骨架：token 与位置相关表示进入 masked multi-head self-attention，注意力子层的更新通过残差路径与原表示合并并配合归一化；随后逐位置前馈网络（FFN）对每个位置的特征做相同参数的非线性变换，再经过另一组残差与归一化。多层块重复后，最终表示经线性或语言模型输出头映射为词表 logits，训练损失或生成采样流程再按需要使用 softmax 概率；训练代码可把 softmax 与交叉熵融合以提高数值稳定性，服务接口是否显式返回概率则应以该接口契约为准，不能仅从架构推断。',
        '残差连接把子层输出作为对旧表示的增量相加，使旧信息有直接路径继续向前，也为反向传播提供更短的梯度通路；归一化调节每个位置表示的尺度，改善数值与优化稳定性。FFN 不在 token 位置之间重新匹配，而是分别对每个位置的特征维做非线性变换。三者都不承担 Q–K 内容匹配，却是深层堆叠可训练和有表达力的重要组成，不能当作可随意删除的装饰。',
        '归一化放置要注明架构边界。2017 年原始论文描述的是 encoder-decoder Transformer，并采用 Post-Norm：可简写为 h′=LN(h+Attention(h))，再做 h″=LN(h′+FFN(h′))；原始 decoder 中还夹有读取 encoder 输出的 cross-attention。Raschka 的 GPT-like 教学实现则是 decoder-only 的 Pre-Norm：先把 LN(h) 送进因果注意力再与 h 相加，随后把 LN(h′) 送进 FFN 再相加。两种流程应比较，不能把原始论文改写成现代 GPT 的唯一结构。',
        '画图完成标准是同时标出信息与梯度通路：输入表示如何经 masked multi-head self-attention、残差与归一化、FFN、第二条残差与归一化到达输出头；梯度又可怎样沿子层和残差路径返回。Pre-Norm 与 Post-Norm 的顺序不同，会影响深层训练稳定性与行为，但本课不把某一种宣布为所有模型的通用最优。能够解释这些边界，才算真正追踪了一次 decoder-only 表示更新。',
      ],
      keyPoints: [
        'Decoder block 由因果多头注意力、残差、归一化和逐位置 FFN 共同组成，最后输出头产生下一 token logits。',
        '原始论文是 encoder-decoder/Post-Norm；GPT-like 教学实现可为 decoder-only/Pre-Norm，二者不能混写。',
      ],
      callout: {
        kind: 'boundary',
        title: '论文原型不等于所有现代实现',
        body: '引用 Attention Is All You Need 时要保留 encoder、decoder、cross-attention 与 Post-Norm 语境；解释 GPT-like 结构时再明确切换到 decoder-only 和 Pre-Norm 示例。',
      },
      sourceIds: ['res-attention-paper', 'res-rasbt', 'res-limu-transformer', 'res-happy-llm'],
    },
    {
      id: 'attention-lab',
      title: 'Attention Lab：操纵匹配、可见性与 Value 贡献',
      paragraphs: [
        '问题：怎样把查询—匹配—聚合变成可复现的实验？先在站内 Attention 直觉台选择一个 Query token，保持因果掩码关闭，记录所有位置的“教学关联分”和归一化百分比，作为快照 A。然后只提高一个 Key 位置对应的关联分，记录快照 B；比较整行百分比怎样重新分配，并用一句话说明该位置的 Value 为什么会在真实聚合中获得更大相对贡献。不要把“权重最高”改写成“复制原 token”或“证明它是最终答案原因”。',
        '接着选择序列中间的 Query，打开因果掩码，标出右侧哪些连接被禁止，并核对未来位置权重变为零、允许位置重新归一化。训练意义要写成：decoder self-attention 的当前位置不能读取未来 token，使下一 token 训练的可见性与生成前缀一致。再关闭掩码作对照，同时注明这只是为了观察差异；真实 decoder-only 自回归块不会因为实验方便就允许训练位置偷看未来答案。',
        '必须诚实记录界面边界：项目里的 normalizeAttention 与界面层可见位置筛选使用非负手工分数做线性归一化，即在允许位置之间按分数占比分配；它没有学习到的 Q/K 投影，也没有计算指数 softmax。真实注意力核心是 softmax(QKᵀ/√d_k + mask)，随后用所得权重聚合 Value，并在多头结构中拼接和投影。因此界面百分比适合验证相对分配和 mask 直觉，却不应与真实模型数值、梯度或最终输出声明为相同。',
        '最终交付两张权重对比记录，以及一段完整信息流说明。可按模板自检：“初始 token 与位置表示产生 Q/K/V；Query 与 Key 得到分数，经缩放、mask 和 softmax 得到权重；权重聚合 Value，各头拼接投影；结果再经过残差、归一化与 FFN，堆叠后由输出头产生 logits。实验把___分从___改为___，教学权重由___变为___；开启 mask 后___位置不可见。由于界面采用线性归一化，这些数字只证明___，不能证明___。”若还能不用公式准确解释 Q/K/V，并画出含残差梯度路径的 decoder-only 块，就满足本课完成标准。',
      ],
      keyPoints: [
        '实验要固定 Query、只改变一个匹配分或 mask，并记录两张可比较的完整权重快照。',
        '站内面板采用线性教学归一化；真实注意力使用缩放点积、mask、softmax 和 Value 聚合。',
      ],
      callout: {
        kind: 'warning',
        title: '实验百分比不是模型测量值',
        body: '面板帮助操纵“相对匹配”和“未来不可见”两个概念；没有模型参数、投影、softmax、多头与 Value 向量时，不能把结果外推为真实 Transformer 的 Attention。',
      },
      sourceIds: ['res-3b1b-attention', 'res-attention-paper', 'res-rasbt'],
    },
  ],
  misconceptions: [
    {
      claim: 'Query 是自然语言问句，Key 是数据库主键，Value 就是原始文本。',
      correction: 'Q、K、V 是当前表示经不同学习参数得到的投影；查询、索引和内容只是解释计算职责的类比，不是固定数据类型。',
    },
    {
      claim: 'Self-Attention 最终把 Query 或 Key 加权求和。',
      correction: 'Q 与 K 产生匹配分和读取权重，权重最终聚合的是各候选位置的 Value。',
    },
    {
      claim: '每个注意力头由开发者预先分配固定任务，头越多能力就按比例越强。',
      correction: '各头学习不同投影，训练后可能形成不同模式也可能冗余；头数还会改变维度、参数与计算组织，效果必须实测。',
    },
    {
      claim: '所有 Attention 都必须使用因果掩码。',
      correction: '未来屏蔽用于 decoder self-attention 的自回归可见性；encoder self-attention 和读取 encoder 输出的 cross-attention 要按各自序列判断。',
    },
    {
      claim: 'Attention Is All You Need 描述的就是现代 GPT decoder-only 与 Pre-Norm 唯一结构。',
      correction: '原始论文是 encoder-decoder 并采用 Post-Norm；GPT-like decoder-only/Pre-Norm 是需要另行标注的架构变体。',
    },
    {
      claim: '注意力权重越大，就证明该 token 是最终答案的原因；站内实验百分比也等于真实模型 softmax。',
      correction: '权重只描述一次内部 Value 聚合，不能单独建立最终输出的因果解释；站内面板还是非负手工分数的线性教学归一化，与真实缩放点积 softmax 数值不同。',
    },
  ],
  recap: [
    '初始 token 与位置表示需要 Attention 才能按当前上下文更新，但 Attention 不等于外部资料检索。',
    'Query 表达当前读取需求，Key 提供匹配索引，缩放与 softmax 形成权重，Value 承担最终被聚合的信息。',
    '1/√d_k 用于控制点积量级和 softmax 饱和风险，不是所有训练问题的万能稳定器。',
    '多头注意力用多组投影并行读取、拼接再投影；头的语义不固定，头数更多也不保证能力线性增加。',
    '因果掩码令 decoder self-attention 只能读取当前位置及过去；encoder self-attention 和 cross-attention 不能被一概而论。',
    '完整 decoder 块还包含残差、归一化与逐位置 FFN；原始 encoder-decoder/Post-Norm 和 GPT-like decoder-only/Pre-Norm 必须分开描述。',
    '注意力权重不是充分的因果解释；站内 Attention Lab 的线性权重只用于操纵相对匹配与可见性直觉。',
    '一份合格实验交付包含两张权重快照、mask 连接说明、真实公式边界，以及从输入表示到 logits 的完整信息流。',
  ],
  nextStep: '本章说明了 Transformer 怎样把可见 token 表示逐层混合，并由 decoder-only 输出头得到下一 token 的 logits。下一课将沿训练与行为塑造继续前进：这些参数如何通过大规模预训练获得基础预测能力，SFT 与偏好优化怎样改变行为，以及何时应选择微调、LoRA、RAG、prompt 或工具而不是混为一种方案。',
};
