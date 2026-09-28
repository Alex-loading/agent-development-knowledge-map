# 多 Agent 与 MCP 图形清单

每课包含一张总览和一张章节图，共 16 张。`visual-ma-XX-overview` 位于知识笔记目录前，来源归属于下表指定章节；`visual-ma-XX-detail` 位于指定章节的 `afterParagraph: 1` 位置。所有文件位于 `assets/visuals/multi-agent-mcp/`，同名 `.mmd` 和 `.svg` 分别保存关系定义与静态呈现。

| 课程 | 总览认知问题与归属章节 | 章节图认知问题与归属章节 | 考核产出 |
| --- | --- | --- | --- |
| ma-01 | 怎样从基线形成采用决定；`ma01-baseline-question` | 哪些任务依赖输入；`ma01-dependency-graph` | 依赖关系与协作选择依据 |
| ma-02 | 谁负责最终回复；`ma02-control-ownership` | 并发和共享写入怎样改变时长；`ma02-scheduling-model` | 控制责任与 17/13/17 调度推演 |
| ma-03 | 怎样选择任务上下文；`ma03-context-input` | 怎样验收完成声明；`ma03-result-acceptance` | 任务输入与证据验收材料 |
| ma-04 | Host、Client、Server 各做什么；`ma04-integration-roles` | list 与 call/read/get 怎样衔接；`ma04-discovery-to-use` | 角色及原语接入目录 |
| ma-05 | 单次请求需要哪些 metadata；`ma05-request-context` | 两个 revision 的通信前提；`ma05-legacy-compatibility` | 当前请求与历史兼容核对 |
| ma-06 | 怎样区分传输、协议和工具结果；`ma06-layered-failures` | task 状态与查询结果怎样阅读；`ma06-tasks-extension` | 失败分类与恢复记录 |
| ma-07 | 一次调用有哪些授权责任；`ma07-authorization-layers` | 委托动作怎样满足所有许可条件；`ma07-delegation-policy` | 逐层授权证据表 |
| ma-08 | 验收需要哪些证据；`ma08-acceptance-model` | 同一 URI 怎样保持 private 缓存隔离；`ma08-isolation-cases` | 综合验收包与跨用户用例 |

每张图的标题、alt、caption、顺序长描述、事实 `sourceIds` 与尺寸均在 `src/data/visuals/multi-agent/` 中记录。全部为 `original-synthesis`，`permission: null`，署名为 Agent Learner 原创教学图解；没有复制第三方图像。来源均属于唯一归属章节，引用与本地文件由目标测试核验。

2026-09-18 的真实浏览器检查使用 Mermaid 12.0.0 的 `parse` 验证 16 份关系源码；全部通过。浏览器逐个加载 16 份 SVG，通过原生 `getBBox()` 检查每个 text 节点，所有文字均位于 1120×660 范围内。静态资产检查禁止脚本、事件处理器、外部引用和可执行内容。关系与教学语义由独立内容审查记录，响应式页面结果记录于最终验收文档。

验证按用户要求使用 DOM、可访问文本和浏览器原生几何数据，没有使用截图或图像识别。几何检查说明文字边界与页面布局，教学事实还由正文和来源审查共同支持。
