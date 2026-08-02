function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const nested of Object.values(value)) deepFreeze(nested);
    Object.freeze(value);
  }
  return value;
}

export const PRIMARY_REFERENCE_IDENTITY_RULES = deepFreeze({
  'feishu-harness-101': {
    idPrefix: 'primary-feishu-',
    canonicalUrlPrefix: 'https://my.feishu.cn/wiki/',
    publisherOrAuthor: 'Harness 101',
    mediaDecision: 'permission-review-required',
    permissionEvidence: 'Authenticated fetch exposed no author license or redistribution and modification grant; every asset requires direct rights evidence.',
  },
  'javaguide-ai': {
    idPrefix: 'primary-javaguide-',
    canonicalUrlPrefix: 'https://javaguide.cn/ai/',
    publisherOrAuthor: 'JavaGuide',
    mediaDecision: 'asset-level-review-required',
    permissionEvidence: 'Apache-2.0 may cover original repository assets, but embedded third-party media needs repository-path, author, and license evidence per asset.',
  },
});

export const primaryReferenceAnnotations = deepFreeze([
  {
    id: 'primary-feishu-harness-101',
    canonicalUrl: 'https://my.feishu.cn/wiki/L082wubkdie8uMkRUjgceKYQnIe',
    moduleCandidates: ['agent-mechanism', 'agent-harness', 'context-rag-memory', 'backend-engineering'],
    limitations: 'Private body is not committed; the root is mainly a navigation frame and product or version claims still require official verification.',
  },
  {
    id: 'primary-feishu-react-loop',
    canonicalUrl: 'https://my.feishu.cn/wiki/N94ZwtUv4iVsUtkvWAYchNKWnhb',
    moduleCandidates: ['agent-mechanism', 'agent-harness'],
    limitations: 'Engineering narrative is primary, while exact SDK loop behavior, tool protocol, and stopping semantics need official verification.',
  },
  {
    id: 'primary-feishu-beyond-model',
    canonicalUrl: 'https://my.feishu.cn/wiki/Y5jYww4MLiL1ulkwTL6cf6Drnbc',
    moduleCandidates: ['agent-harness', 'backend-engineering'],
    limitations: 'The responsibility-boundary framing is adoptable, but platform capability and security guarantees need official verification.',
  },
  {
    id: 'primary-feishu-loop-engineering-intro',
    canonicalUrl: 'https://my.feishu.cn/wiki/SzR6wH3cXi87PPk01NbcaI1EnAc',
    moduleCandidates: ['agent-mechanism', 'agent-harness'],
    limitations: 'Terminology is an engineering teaching frame rather than a standard; implementation claims need comparison with official runtimes.',
  },
  {
    id: 'primary-feishu-react-orchestration',
    canonicalUrl: 'https://my.feishu.cn/wiki/ToaRw8BAUiAyFFkR3EAc05atnsg',
    moduleCandidates: ['agent-mechanism', 'agent-harness', 'backend-engineering'],
    limitations: 'The orchestration taxonomy may vary by framework; strong behavior and durability claims need official implementation evidence.',
  },
  {
    id: 'primary-feishu-dynamic-workflow',
    canonicalUrl: 'https://my.feishu.cn/wiki/TM25wR9ozih8yRkaAVKcFjP1nMq',
    moduleCandidates: ['agent-harness', 'backend-engineering'],
    limitations: 'Code and inferred internals are teaching evidence only; replay, ordering, and side-effect guarantees require official or executable verification.',
  },
  {
    id: 'primary-feishu-agent-version-drifting',
    canonicalUrl: 'https://my.feishu.cn/wiki/XLBWwHi4gipKOpk9R3Bc5KrJnye',
    moduleCandidates: ['llm-foundation', 'agent-harness', 'backend-engineering'],
    limitations: 'Version behavior is volatile and vendor-specific; examples must show an as-of date and be checked against release documentation.',
  },
  {
    id: 'primary-feishu-tool-truth',
    canonicalUrl: 'https://my.feishu.cn/wiki/IiZpwiYOziJnfEknS4FcfJDCnib',
    moduleCandidates: ['agent-mechanism', 'agent-harness', 'backend-engineering'],
    limitations: 'The model-versus-executor boundary is useful, but protocol fields, validation, permission, and execution guarantees need official sources.',
  },
  {
    id: 'primary-feishu-company-brain',
    canonicalUrl: 'https://my.feishu.cn/wiki/OAagwqqaUi3bxwkHAjYc6TFsnoY',
    moduleCandidates: ['context-rag-memory', 'backend-engineering'],
    limitations: 'This is a system-design narrative; access control, freshness, governance, and retrieval quality require independent evidence.',
  },
  {
    id: 'primary-feishu-context-offloading',
    canonicalUrl: 'https://my.feishu.cn/wiki/NDeHwSStnilQ83kX0awcQxUlnld',
    moduleCandidates: ['agent-harness', 'context-rag-memory'],
    limitations: 'Product-specific offloading behavior is volatile; the general external-state pattern must be separated from vendor implementation details.',
  },
  {
    id: 'primary-feishu-microcompact',
    canonicalUrl: 'https://my.feishu.cn/wiki/YSlhwnb5pia6q6kGnU0ckXSZnWe',
    moduleCandidates: ['agent-harness', 'context-rag-memory'],
    limitations: 'Reverse-engineered compression details are volatile and potentially contested; official product documentation must bound publication.',
  },
  {
    id: 'primary-feishu-virtual-filesystem',
    canonicalUrl: 'https://my.feishu.cn/wiki/EJ3TwSP8UinTPmkE08icTvhNneg',
    moduleCandidates: ['agent-harness', 'context-rag-memory', 'backend-engineering'],
    limitations: 'Filesystem, sandbox, and persistence properties depend on the runtime; security claims need official threat-model evidence.',
  },
  {
    id: 'primary-feishu-claude-code-tools',
    canonicalUrl: 'https://my.feishu.cn/wiki/RI28wA2FIiHtork7dE5ckxDJnCb',
    moduleCandidates: ['agent-mechanism', 'agent-harness', 'backend-engineering'],
    limitations: 'Tool availability and behavior are version-specific; current product documentation must verify names, permissions, and semantics.',
  },
  {
    id: 'primary-feishu-claude-ai-memory',
    canonicalUrl: 'https://my.feishu.cn/wiki/YxcxwO0f5iyJIXkCooscCtZKnVg',
    moduleCandidates: ['agent-harness', 'context-rag-memory'],
    limitations: 'Prompt and memory internals are reverse-engineered and volatile; present them as observations with an as-of date.',
  },
  {
    id: 'primary-feishu-autonomous-evolution',
    canonicalUrl: 'https://my.feishu.cn/wiki/OU0mw8Pfaik3Kqk3JUxcT660nwf',
    moduleCandidates: ['agent-mechanism', 'agent-harness'],
    limitations: 'The maturity sequence is a teaching model, not a universal taxonomy; stop, budget, and autonomy behavior need runtime evidence.',
  },
  {
    id: 'primary-feishu-agent-install-md',
    canonicalUrl: 'https://my.feishu.cn/wiki/USSRwjtlvidcD5knMrOcPDMSnIg',
    moduleCandidates: ['agent-mechanism', 'agent-harness'],
    limitations: 'Install.md is a proposed operational pattern rather than a standard; security and tool-loading behavior require official verification.',
  },
  {
    id: 'primary-javaguide-ai',
    canonicalUrl: 'https://javaguide.cn/ai/',
    moduleCandidates: ['llm-foundation', 'agent-mechanism', 'agent-harness', 'context-rag-memory', 'backend-engineering'],
    limitations: 'The root is a narrative index; every protocol, product, performance, security, and numerical claim needs source-level verification.',
  },
  {
    id: 'primary-javaguide-ai-core-concepts',
    canonicalUrl: 'https://javaguide.cn/ai/ai-core-concepts.html',
    moduleCandidates: ['llm-foundation', 'agent-mechanism', 'agent-harness', 'context-rag-memory'],
    limitations: 'Concept relationships are primary narrative; normative protocol wording and vendor-specific behavior need official sources.',
  },
  {
    id: 'primary-javaguide-ai-interview-guide',
    canonicalUrl: 'https://javaguide.cn/ai/interview-questions/ai-interview-guide.html',
    moduleCandidates: ['llm-foundation', 'agent-mechanism', 'agent-harness', 'context-rag-memory', 'backend-engineering'],
    limitations: 'Interview framing is supplemental teaching structure; answers with strong facts, versions, or guarantees need independent verification.',
  },
  {
    id: 'primary-javaguide-llm-interview',
    canonicalUrl: 'https://javaguide.cn/ai/interview-questions/llm-interview-questions.html',
    moduleCandidates: ['llm-foundation'],
    limitations: 'Interview summaries compress nuance; formulas, architecture details, and numerical assertions need papers or official documentation.',
  },
  {
    id: 'primary-javaguide-agent-interview',
    canonicalUrl: 'https://javaguide.cn/ai/interview-questions/agent-interview-questions.html',
    moduleCandidates: ['agent-mechanism', 'agent-harness'],
    limitations: 'Framework terminology varies; SDK, protocol, autonomy, and safety claims need primary official evidence.',
  },
  {
    id: 'primary-javaguide-rag-interview',
    canonicalUrl: 'https://javaguide.cn/ai/interview-questions/rag-interview-questions.html',
    moduleCandidates: ['context-rag-memory'],
    limitations: 'Interview answers are concise; algorithm, metric, and production-performance claims need papers and system-specific evaluation.',
  },
  {
    id: 'primary-javaguide-system-design-interview',
    canonicalUrl: 'https://javaguide.cn/ai/interview-questions/ai-system-design-interview-questions.html',
    moduleCandidates: ['backend-engineering'],
    limitations: 'Design answers depend on workload assumptions; availability, throughput, latency, and cost claims need explicit models and measurements.',
  },
  {
    id: 'primary-javaguide-llm-operation-mechanism',
    canonicalUrl: 'https://javaguide.cn/ai/llm-basis/llm-operation-mechanism.html',
    moduleCandidates: ['llm-foundation'],
    limitations: 'The explanatory model is primary narrative; formulas and model-specific context or sampling behavior need papers and provider docs.',
  },
  {
    id: 'primary-javaguide-llm-api-engineering',
    canonicalUrl: 'https://javaguide.cn/ai/llm-basis/llm-api-engineering.html',
    moduleCandidates: ['llm-foundation', 'backend-engineering'],
    limitations: 'API fields, retry safety, quotas, and provider behavior are volatile and must be checked against current official documentation.',
  },
  {
    id: 'primary-javaguide-structured-output-function-calling',
    canonicalUrl: 'https://javaguide.cn/ai/llm-basis/structured-output-function-calling.html',
    moduleCandidates: ['llm-foundation', 'agent-mechanism', 'backend-engineering'],
    limitations: 'Schema support and function-calling semantics differ by provider; current official API contracts are required.',
  },
  {
    id: 'primary-javaguide-llm-evaluation',
    canonicalUrl: 'https://javaguide.cn/ai/llm-basis/llm-evaluation.html',
    moduleCandidates: ['llm-foundation', 'backend-engineering'],
    limitations: 'Evaluation methodology is context-dependent; threshold, judge, and production-effect claims require dataset and measurement evidence.',
  },
  {
    id: 'primary-javaguide-agent-basis',
    canonicalUrl: 'https://javaguide.cn/ai/agent/agent-basis.html',
    moduleCandidates: ['agent-mechanism', 'agent-harness'],
    limitations: 'The taxonomy spans non-equivalent frameworks; protocol and implementation behavior need official source boundaries.',
  },
  {
    id: 'primary-javaguide-agent-memory',
    canonicalUrl: 'https://javaguide.cn/ai/agent/agent-memory.html',
    moduleCandidates: ['agent-mechanism', 'context-rag-memory'],
    limitations: 'Memory categories are a design model; persistence, privacy, retrieval quality, and product behavior need system-specific evidence.',
  },
  {
    id: 'primary-javaguide-prompt-engineering',
    canonicalUrl: 'https://javaguide.cn/ai/agent/prompt-engineering.html',
    moduleCandidates: ['llm-foundation', 'agent-mechanism'],
    limitations: 'Prompt techniques are model- and task-sensitive; effect sizes must be evaluated rather than generalized.',
  },
  {
    id: 'primary-javaguide-context-engineering',
    canonicalUrl: 'https://javaguide.cn/ai/agent/context-engineering.html',
    moduleCandidates: ['agent-harness', 'context-rag-memory'],
    limitations: 'The prompt-context distinction is a teaching frame; vendor limits, caching, and context behavior need official sources.',
  },
  {
    id: 'primary-javaguide-agent-skills',
    canonicalUrl: 'https://javaguide.cn/ai/agent/skills.html',
    moduleCandidates: ['agent-mechanism', 'agent-harness'],
    limitations: 'Skill semantics differ across products; loading, trust, permission, and discovery behavior need official verification.',
  },
  {
    id: 'primary-javaguide-mcp',
    canonicalUrl: 'https://javaguide.cn/ai/agent/mcp.html',
    moduleCandidates: ['agent-mechanism', 'agent-harness', 'backend-engineering'],
    limitations: 'MCP is a protocol with evolving versions; normative fields, transport, and security claims require the official specification.',
  },
  {
    id: 'primary-javaguide-harness-engineering',
    canonicalUrl: 'https://javaguide.cn/ai/agent/harness-engineering.html',
    moduleCandidates: ['agent-harness', 'backend-engineering'],
    limitations: 'Six layers are an explanatory architecture, not a standard; team examples and product behavior need primary corroboration.',
  },
  {
    id: 'primary-javaguide-workflow-graph-loop',
    canonicalUrl: 'https://javaguide.cn/ai/agent/workflow-graph-loop.html',
    moduleCandidates: ['agent-mechanism', 'agent-harness'],
    limitations: 'Terminology and execution guarantees vary by framework; examples require implementation-specific verification.',
  },
  {
    id: 'primary-javaguide-loop-engineering',
    canonicalUrl: 'https://javaguide.cn/ai/agent/loop-engineering.html',
    moduleCandidates: ['agent-mechanism', 'agent-harness'],
    limitations: 'The historical interpretation is contestable; retain competing terminology and verify concrete runtime behavior separately.',
  },
  {
    id: 'primary-javaguide-rag-basis',
    canonicalUrl: 'https://javaguide.cn/ai/rag/rag-basis.html',
    moduleCandidates: ['context-rag-memory'],
    limitations: 'RAG trade-offs depend on corpus and workload; algorithm and quality claims need papers plus local evaluation.',
  },
  {
    id: 'primary-javaguide-rag-document-processing',
    canonicalUrl: 'https://javaguide.cn/ai/rag/rag-document-processing.html',
    moduleCandidates: ['context-rag-memory', 'backend-engineering'],
    limitations: 'Chunking is data-dependent; parser support, multimodal behavior, and quality claims need tool documentation and evaluation.',
  },
  {
    id: 'primary-javaguide-rag-vector-store',
    canonicalUrl: 'https://javaguide.cn/ai/rag/rag-vector-store.html',
    moduleCandidates: ['context-rag-memory', 'backend-engineering'],
    limitations: 'Algorithm and parameter claims need papers and database docs; performance depends on data, hardware, and tuning.',
  },
  {
    id: 'primary-javaguide-rag-knowledge-update',
    canonicalUrl: 'https://javaguide.cn/ai/rag/rag-knowledge-update.html',
    moduleCandidates: ['context-rag-memory', 'backend-engineering'],
    limitations: 'Update rules depend on storage topology; thresholds and exact consistency guarantees need system-specific evidence.',
  },
  {
    id: 'primary-javaguide-graphrag',
    canonicalUrl: 'https://javaguide.cn/ai/rag/graphrag.html',
    moduleCandidates: ['context-rag-memory'],
    limitations: 'GraphRAG benefits are query- and corpus-dependent; algorithm and benchmark claims need papers and reproducible evaluation.',
  },
  {
    id: 'primary-javaguide-rag-optimization',
    canonicalUrl: 'https://javaguide.cn/ai/rag/rag-optimization.html',
    moduleCandidates: ['context-rag-memory', 'backend-engineering'],
    limitations: 'Optimization recipes are workload-specific; ranking, latency, and quality improvements need explicit baselines and evaluation.',
  },
  {
    id: 'primary-javaguide-ai-application-architecture',
    canonicalUrl: 'https://javaguide.cn/ai/system-design/ai-application-architecture.html',
    moduleCandidates: ['agent-harness', 'backend-engineering'],
    limitations: 'Production architecture depends on SLOs and workload; capacity, security, and availability claims require explicit verification.',
  },
  {
    id: 'primary-javaguide-llm-gateway',
    canonicalUrl: 'https://javaguide.cn/ai/system-design/llm-gateway.html',
    moduleCandidates: ['backend-engineering'],
    limitations: 'Provider APIs, quotas, prices, and failover behavior are volatile; official docs and live tests are required.',
  },
  {
    id: 'primary-javaguide-ai-voice',
    canonicalUrl: 'https://javaguide.cn/ai/system-design/ai-voice.html',
    moduleCandidates: ['backend-engineering'],
    limitations: 'Speech latency and quality depend on provider, language, network, and workload; quantitative claims need current measurements.',
  },
  {
    id: 'primary-javaguide-interview-index',
    canonicalUrl: 'https://javaguide.cn/ai/interview-questions/',
    moduleCandidates: ['llm-foundation', 'agent-mechanism', 'agent-harness', 'context-rag-memory', 'backend-engineering'],
    limitations: 'This is a topical index and duplicates article discovery; individual answers must be traced to their article and verification source.',
  },
  {
    id: 'primary-javaguide-llm-index',
    canonicalUrl: 'https://javaguide.cn/ai/llm-basis/',
    moduleCandidates: ['llm-foundation', 'backend-engineering'],
    limitations: 'This index contributes navigation rather than independent evidence; claims resolve to its linked articles and official sources.',
  },
  {
    id: 'primary-javaguide-agent-index',
    canonicalUrl: 'https://javaguide.cn/ai/agent/',
    moduleCandidates: ['agent-mechanism', 'agent-harness', 'context-rag-memory'],
    limitations: 'This index contributes navigation rather than independent evidence; claims resolve to its linked articles and official sources.',
  },
  {
    id: 'primary-javaguide-rag-index',
    canonicalUrl: 'https://javaguide.cn/ai/rag/',
    moduleCandidates: ['context-rag-memory', 'backend-engineering'],
    limitations: 'This index contributes navigation rather than independent evidence; claims resolve to its linked articles, papers, and system tests.',
  },
  {
    id: 'primary-javaguide-system-design-index',
    canonicalUrl: 'https://javaguide.cn/ai/system-design/',
    moduleCandidates: ['backend-engineering'],
    limitations: 'This index contributes navigation rather than independent evidence; architecture claims require linked articles and workload evidence.',
  },
]);
