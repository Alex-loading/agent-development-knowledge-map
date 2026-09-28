# 第六模块教学图清单

16 张图均为原创 SVG，使用课程核验的事实和明确列出的教学数据。每张图由一个实际章节负责引用；完整 sourceIds、长描述、尺寸和本地路径见 `src/data/visuals/evals-visuals.js`，图形内容见 `src/data/visuals/evals-scenes.js`。

每课总览放在知识笔记目录之前，章节图位于负责章节的第二个正文区块之后，`afterParagraph` 为 1。图形用于表达顺序、边界与数量关系。

| 课程 | 学习问题 | 总览负责章节 | 章节图负责章节 | 图形与考核用途 |
| --- | --- | --- | --- | --- |
| eval-01 | 运行过程怎样支持成功判断，评测集合如何使用？ | eval01-outcome-evidence | eval01-dataset-boundary | 流程与集合用途表，支持任务验收练习 |
| eval-02 | 不同评分器怎样协作，交换顺序怎样检查位置影响？ | eval02-grader-routing | eval02-pairwise-bias | 流程与顺序表，支持评分校准 |
| eval-03 | 总体分数怎样掩盖某个分组的退化？ | eval03-comparable-runs | eval03-slice-regression | 决策流程与按真实比例绘制的条形图 |
| eval-04 | 应该从哪个环节寻找失败证据？ | eval04-end-to-end-map | eval04-quality-dimensions | 处理流程与指标对象表，支持故障归因 |
| eval-05 | 运行记录如何关联，保留规则怎样改变分母？ | trace-evidence | sampling-bias | 关联流程与三种选择结果表 |
| eval-06 | 哪个执行边界检查身份和资源权限？ | eval-threat-model | eval-action-authorization | 授权边界与具体检查条件表 |
| eval-07 | 检测漏报和实际越权分别怎样计数？ | eval-safety-outcomes | eval-regression-fixture | 正常/攻击分组与两种防护结果表 |
| eval-08 | 发布何时停止，事故怎样形成可复验的行动？ | release-evidence | incident-feedback | 发布流程与复盘行动流程 |

## 证据与许可

所有记录使用 `provenance: original-synthesis`、`permission: null`，并署名 Agent Learner。图中案例由课程定义，机制说明引用对应章节资源。原始研究图形和第三方图片的构图均不参与资产生成。

`visual-eval-02-detail` 引用 MT-Bench 与 Anthropic evals，分别支持位置检查与人工复核；`visual-eval-04-detail` 引用 RAGAS、Anthropic evals 与 τ-bench，分别支持质量维度、评分环境与任务结果。

## 可访问性与结构验证

每张图提供 alt、caption 和按阅读顺序编写的 longDescription。数量图的长度直接使用评测计算结果。静态 SVG 检查覆盖外部资源、活动内容和无效属性；引用检查覆盖重复位置、缺失章节、来源集合与文件存在性。

浏览器通过实际 DOM 检查标题、描述、图片加载、文本尺寸、图形内部区域和页面宽度。390px 与 320px 下，较宽的图形使用有标签的局部滚动区域。全部图片加载及文本边界检查通过，完整结果见[课程与集成验收](../content-audits/2026-09-18-evals-observability-security.md)。
