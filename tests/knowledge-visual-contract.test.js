import test from 'node:test';
import assert from 'node:assert/strict';

import {
  VISUAL_KINDS,
  VISUAL_PROVENANCE,
  VISUAL_ROLES,
  VISUAL_TAGS,
  deepFreezeVisual,
  validateVisualAsset,
} from '../src/data/visuals/visual-contract.js';

const original = {
  id: 'visual-llm-01-field-map',
  kind: 'diagram',
  role: 'overview',
  tags: ['relationship', 'boundary'],
  title: 'AI 领域关系',
  alt: 'AI 包含机器学习，机器学习包含深度学习，LLM 位于生成式深度学习范围',
  longDescription: '从外到内描述 AI、机器学习、深度学习和 LLM，并标出生成模型交叉范围。',
  caption: 'LLM 是生成式深度学习模型的一类，不等于全部 AI。',
  assetPath: 'assets/visuals/llm-foundation/llm-01-field-map.svg',
  width: 1200,
  height: 675,
  provenance: 'original-synthesis',
  sourceIds: ['res-ms-ai'],
  credit: 'Agent Learner 原创整理',
  permission: null,
  verifiedAt: '2026-07-26',
};

const licensedReproduction = {
  ...original,
  id: 'visual-llm-01-source-figure',
  kind: 'source-figure',
  role: 'mechanism',
  tags: ['comparison'],
  provenance: 'licensed-reproduction',
  credit: 'Example Author，CC BY 4.0',
  creator: 'Example Author',
  sourceUrl: 'https://example.com/article',
  sourceFigure: 'Figure 2',
  permission: {
    basis: 'license',
    name: 'CC BY 4.0',
    url: 'https://creativecommons.org/licenses/by/4.0/',
    allowsRedistribution: true,
    allowsModification: false,
  },
  retrievedAt: '2026-07-26',
  modifications: [],
};

function errorsFor(overrides) {
  return validateVisualAsset({ ...original, ...overrides });
}

test('exports frozen visual kind, provenance, primary role and secondary tag allowlists', () => {
  assert.deepEqual(VISUAL_KINDS, ['diagram', 'source-figure', 'step-diagram']);
  assert.deepEqual(VISUAL_PROVENANCE, [
    'original-synthesis',
    'licensed-reproduction',
    'licensed-adaptation',
    'official-media',
  ]);
  assert.deepEqual(VISUAL_ROLES, [
    'overview',
    'mechanism',
    'process',
    'comparison',
    'boundary',
    'decision',
  ]);
  assert.deepEqual(VISUAL_TAGS, [
    'mechanism',
    'process',
    'comparison',
    'boundary',
    'decision',
    'relationship',
    'failure-mode',
    'tradeoff',
  ]);
  assert.ok([
    VISUAL_KINDS,
    VISUAL_PROVENANCE,
    VISUAL_ROLES,
    VISUAL_TAGS,
  ].every(Object.isFrozen));
});

test('accepts a complete original teaching diagram', () => {
  assert.deepEqual(validateVisualAsset(original), []);
});

test('accepts only the frozen primary role vocabulary', () => {
  for (const role of VISUAL_ROLES) {
    assert.deepEqual(
      errorsFor({ role, tags: [] }),
      [],
      `${role} should be an allowed primary role`,
    );
  }
  for (const role of ['relationship', 'failure', 'failure-mode', 'tradeoff']) {
    assert.match(errorsFor({ role, tags: [] }).join(' '), /role.*allowed/i, role);
  }
});

test('requires all common text fields, original credit and valid enum values', () => {
  for (const field of [
    'id',
    'role',
    'title',
    'alt',
    'longDescription',
    'caption',
    'assetPath',
    'provenance',
    'verifiedAt',
  ]) {
    assert.match(
      errorsFor({ [field]: '   ' }).join(' '),
      new RegExp(field, 'i'),
      `${field} should be required`,
    );
  }
  assert.match(errorsFor({ credit: '' }).join(' '), /credit/i);
  assert.match(errorsFor({ kind: 'illustration' }).join(' '), /kind/i);
  assert.match(errorsFor({ role: 'decoration' }).join(' '), /role/i);
  assert.match(errorsFor({ provenance: 'unknown' }).join(' '), /provenance/i);
});

test('requires positive integer dimensions', () => {
  for (const width of [0, -1, 1.5, NaN, Infinity, '1200']) {
    assert.match(errorsFor({ width }).join(' '), /width.*positive integer/i);
  }
  for (const height of [0, -1, 1.5, NaN, Infinity, '675']) {
    assert.match(errorsFor({ height }).join(' '), /height.*positive integer/i);
  }
});

test('requires non-empty unique source IDs', () => {
  assert.match(errorsFor({ sourceIds: undefined }).join(' '), /sourceIds/i);
  assert.match(errorsFor({ sourceIds: [] }).join(' '), /sourceIds/i);
  assert.match(errorsFor({ sourceIds: ['res-ms-ai', ''] }).join(' '), /sourceIds/i);
  assert.match(
    errorsFor({ sourceIds: ['res-ms-ai', 'res-ms-ai'] }).join(' '),
    /sourceIds.*unique/i,
  );
  assert.match(errorsFor({ sourceIds: Array(1) }).join(' '), /sourceIds.*sparse/i);
});

test('requires a stable kebab-case visual ID', () => {
  for (const id of [
    'llm-01-field-map',
    'visual-LLM-field-map',
    'visual-llm--field-map',
    'visual-llm-field-map-',
    'visual_llm_field_map',
    'visual-llm field-map',
  ]) {
    assert.match(errorsFor({ id }).join(' '), /id.*kebab-case/i, id);
  }
});

test('returns id errors without throwing for malformed main visual IDs', () => {
  const malformedIds = [
    ['symbol', Symbol('visual-id')],
    ['null-prototype object', Object.create(null)],
    ['plain object', {}],
    ['array', []],
    ['function', () => {}],
  ];

  for (const [label, id] of malformedIds) {
    let errors;
    assert.doesNotThrow(() => {
      errors = errorsFor({ id });
    }, label);
    assert.match(errors.join(' '), /id.*kebab-case/i, label);
  }
});

test('requires real YYYY-MM-DD calendar dates', () => {
  assert.deepEqual(errorsFor({ verifiedAt: '2024-02-29' }), []);
  for (const verifiedAt of [
    '2026-02-29',
    '2026-04-31',
    '2026-13-01',
    '2026-00-01',
    '0000-01-01',
    '2026-7-26',
    '2026-07-26T00:00:00Z',
  ]) {
    assert.match(errorsFor({ verifiedAt }).join(' '), /verifiedAt.*YYYY-MM-DD/i);
  }
  assert.match(
    validateVisualAsset({
      ...licensedReproduction,
      retrievedAt: '2026-02-29',
    }).join(' '),
    /retrievedAt.*YYYY-MM-DD/i,
  );
});

test('rejects remote, embedded and ambiguous local asset paths', () => {
  for (const assetPath of [
    'https://example.com/figure.svg',
    '//example.com/figure.svg',
    'data:image/svg+xml,<svg></svg>',
    '<svg onload="alert(1)">',
    'assets/visuals/../secret.svg',
    'assets/visuals/%2e%2e/secret.svg',
    'assets/visuals/llm-foundation\\secret.svg',
    'assets/visuals/llm-foundation/figure.svg?raw=1',
    'assets/visuals/llm-foundation/figure.svg#panel',
    'assets/visuals//llm-foundation/figure.svg',
    'assets/visuals/llm-foundation/foo..svg',
    'assets/visuals/llm..foundation/figure.svg',
    'assets/visuals/%2E%2E/secret.svg',
    'assets/visuals/%252e%252e/secret.svg',
    'assets/visuals/llm-foundation%2Ffigure.svg',
    'assets/visuals/llm-foundation%5cfigure.svg',
    'assets/visuals/llm-foundation/figure\u0000.svg',
    'assets/visuals/llm-foundation/\nfigure.svg',
    './assets/visuals/llm-foundation/figure.svg',
    '/assets/visuals/llm-foundation/figure.svg',
    'assets/visuals/llm-foundation/figure.gif',
    'assets/visuals/llm-foundation/figure.SVG',
  ]) {
    assert.match(
      errorsFor({ assetPath }).join(' '),
      /assetPath.*safe local visual asset/i,
      assetPath,
    );
  }
  for (const assetPath of [
    'assets/visuals/llm-foundation/figure.svg',
    'assets/visuals/llm-foundation/figure.webp',
    'assets/visuals/llm-foundation/figure.png',
    'assets/visuals/llm-foundation/figure.jpg',
    'assets/visuals/llm-foundation/figure.jpeg',
  ]) {
    assert.deepEqual(errorsFor({ assetPath }), [], assetPath);
  }
});

test('returns field errors for malformed URL, date and path value types', () => {
  const malformedValues = [
    ['symbol', Symbol('malformed')],
    ['null-prototype object', Object.create(null)],
    ['plain object', {}],
    ['array', []],
    ['function', () => {}],
  ];

  for (const [label, value] of malformedValues) {
    let assetPathErrors;
    assert.doesNotThrow(() => {
      assetPathErrors = errorsFor({ assetPath: value });
    }, `assetPath ${label}`);
    assert.match(assetPathErrors.join(' '), /assetPath/i, `assetPath ${label}`);

    let verifiedAtErrors;
    assert.doesNotThrow(() => {
      verifiedAtErrors = errorsFor({ verifiedAt: value });
    }, `verifiedAt ${label}`);
    assert.match(verifiedAtErrors.join(' '), /verifiedAt/i, `verifiedAt ${label}`);

    let sourceUrlErrors;
    assert.doesNotThrow(() => {
      sourceUrlErrors = validateVisualAsset({
        ...licensedReproduction,
        sourceUrl: value,
      });
    }, `sourceUrl ${label}`);
    assert.match(sourceUrlErrors.join(' '), /sourceUrl/i, `sourceUrl ${label}`);

    let permissionUrlErrors;
    assert.doesNotThrow(() => {
      permissionUrlErrors = validateVisualAsset({
        ...licensedReproduction,
        permission: {
          ...licensedReproduction.permission,
          url: value,
        },
      });
    }, `permission URL ${label}`);
    assert.match(
      permissionUrlErrors.join(' '),
      /permission URL/i,
      `permission URL ${label}`,
    );
  }
});

test('validates secondary tags against the frozen tag vocabulary', () => {
  assert.deepEqual(errorsFor({ tags: undefined }), []);
  assert.deepEqual(errorsFor({ tags: ['relationship', 'failure-mode'] }), []);
  assert.deepEqual(errorsFor({ tags: ['failure-mode', 'tradeoff'] }), []);
  assert.match(errorsFor({ tags: 'boundary' }).join(' '), /tags.*array/i);
  assert.match(errorsFor({ tags: ['unknown'] }).join(' '), /tag.*allowed/i);
  assert.match(
    errorsFor({ role: 'boundary', tags: ['boundary'] }).join(' '),
    /tag.*primary role/i,
  );
  assert.match(
    errorsFor({ tags: ['relationship', 'relationship'] }).join(' '),
    /tags.*unique/i,
  );
  assert.match(errorsFor({ tags: Array(1) }).join(' '), /tags.*sparse/i);
});

test('rejects permission claims on original synthesis assets', () => {
  assert.match(
    errorsFor({
      permission: {
        basis: 'license',
        name: 'Unrelated source license',
        url: 'https://example.com/license',
        allowsRedistribution: true,
      },
    }).join(' '),
    /original-synthesis.*permission/i,
  );
});

test('accepts a fully attributed licensed reproduction', () => {
  assert.deepEqual(validateVisualAsset(licensedReproduction), []);
  assert.deepEqual(
    validateVisualAsset({
      ...licensedReproduction,
      permission: {
        ...licensedReproduction.permission,
        basis: 'public-domain',
        name: 'Public domain dedication',
        url: 'https://example.com/public-domain',
      },
    }),
    [],
  );
});

test('enforces the kind and provenance matrix in both directions', () => {
  assert.match(
    validateVisualAsset({
      ...original,
      kind: 'source-figure',
    }).join(' '),
    /source-figure.*licensed|source-figure.*official/i,
  );
  assert.match(
    validateVisualAsset({
      ...licensedReproduction,
      kind: 'diagram',
    }).join(' '),
    /diagram.*original-synthesis|sourced provenance.*source-figure/i,
  );
  assert.match(
    validateVisualAsset({
      ...licensedReproduction,
      kind: 'step-diagram',
      steps: [{}, {}],
    }).join(' '),
    /step-diagram.*original-synthesis/i,
  );
});

test('requires source-figure kind and complete third-party attribution', () => {
  assert.match(
    validateVisualAsset({ ...licensedReproduction, kind: 'diagram' }).join(' '),
    /source-figure/i,
  );
  for (const field of ['creator', 'sourceUrl', 'sourceFigure', 'retrievedAt']) {
    assert.match(
      validateVisualAsset({ ...licensedReproduction, [field]: '' }).join(' '),
      new RegExp(field, 'i'),
    );
  }
  assert.match(
    validateVisualAsset({ ...licensedReproduction, modifications: undefined }).join(' '),
    /modifications.*array/i,
  );
  assert.match(
    validateVisualAsset({ ...licensedReproduction, modifications: [''] }).join(' '),
    /modification.*non-empty/i,
  );
});

test('requires valid HTTPS source and permission URLs', () => {
  for (const sourceUrl of [
    'http://example.com/article',
    'https://',
    'https:///article',
    'javascript:alert(1)',
  ]) {
    assert.match(
      validateVisualAsset({ ...licensedReproduction, sourceUrl }).join(' '),
      /sourceUrl.*HTTPS/i,
    );
  }
  for (const url of [
    'http://example.com/license',
    'https://',
    'https:///license',
    '//example.com/license',
  ]) {
    assert.match(
      validateVisualAsset({
        ...licensedReproduction,
        permission: { ...licensedReproduction.permission, url },
      }).join(' '),
      /permission URL.*HTTPS/i,
    );
  }
});

test('requires an explicit permission basis, name and redistribution grant', () => {
  for (const basis of ['', 'fair-use', 'unknown']) {
    assert.match(
      validateVisualAsset({
        ...licensedReproduction,
        permission: { ...licensedReproduction.permission, basis },
      }).join(' '),
      /permission basis/i,
    );
  }
  assert.match(
    validateVisualAsset({
      ...licensedReproduction,
      permission: { ...licensedReproduction.permission, name: '' },
    }).join(' '),
    /permission name/i,
  );
  for (const allowsRedistribution of [false, undefined, 'true']) {
    assert.match(
      validateVisualAsset({
        ...licensedReproduction,
        permission: {
          ...licensedReproduction.permission,
          allowsRedistribution,
        },
      }).join(' '),
      /redistribution permission/i,
    );
  }
});

test('requires modification permission whenever modifications are recorded', () => {
  const adaptation = {
    ...licensedReproduction,
    provenance: 'licensed-adaptation',
    modifications: ['translated labels'],
  };
  assert.match(validateVisualAsset(adaptation).join(' '), /modification permission/i);
  assert.deepEqual(
    validateVisualAsset({
      ...adaptation,
      permission: {
        ...adaptation.permission,
        allowsModification: true,
      },
    }),
    [],
  );
});

test('licensed reproduction forbids modifications and official media policy', () => {
  assert.match(
    validateVisualAsset({
      ...licensedReproduction,
      permission: {
        ...licensedReproduction.permission,
        allowsModification: true,
      },
      modifications: ['translated labels'],
    }).join(' '),
    /licensed-reproduction.*modifications.*empty|use licensed-adaptation/i,
  );
  assert.match(
    validateVisualAsset({
      ...licensedReproduction,
      permission: {
        ...licensedReproduction.permission,
        basis: 'official-media-policy',
        name: 'Example media policy',
        url: 'https://example.com/media-policy',
      },
    }).join(' '),
    /official-media-policy.*official-media/i,
  );
});

test('requires a licensed adaptation to record at least one modification', () => {
  assert.match(
    validateVisualAsset({
      ...licensedReproduction,
      provenance: 'licensed-adaptation',
      permission: {
        ...licensedReproduction.permission,
        allowsModification: true,
      },
      modifications: [],
    }).join(' '),
    /licensed-adaptation.*modification/i,
  );
  assert.match(
    validateVisualAsset({
      ...licensedReproduction,
      provenance: 'licensed-adaptation',
      permission: {
        ...licensedReproduction.permission,
        allowsModification: true,
      },
      modifications: Array(1),
    }).join(' '),
    /modifications.*sparse/i,
  );
});

test('licensed adaptation accepts only modifiable license or public domain basis', () => {
  const adaptation = {
    ...licensedReproduction,
    provenance: 'licensed-adaptation',
    permission: {
      ...licensedReproduction.permission,
      allowsModification: true,
    },
    modifications: ['translated labels'],
  };
  assert.deepEqual(validateVisualAsset(adaptation), []);
  assert.deepEqual(
    validateVisualAsset({
      ...adaptation,
      permission: {
        ...adaptation.permission,
        basis: 'public-domain',
        name: 'Public domain dedication',
        url: 'https://example.com/public-domain',
      },
    }),
    [],
  );
  assert.match(
    validateVisualAsset({
      ...adaptation,
      permission: {
        ...adaptation.permission,
        basis: 'official-media-policy',
        name: 'Example media policy',
        url: 'https://example.com/media-policy',
      },
    }).join(' '),
    /official-media-policy.*official-media/i,
  );
});

test('requires official media to cite a redistributable official media policy', () => {
  const official = {
    ...licensedReproduction,
    provenance: 'official-media',
    permission: {
      ...licensedReproduction.permission,
      basis: 'official-media-policy',
      name: 'Example media usage policy',
      url: 'https://example.com/media-policy',
    },
  };
  assert.deepEqual(validateVisualAsset(official), []);
  assert.match(
    validateVisualAsset({
      ...official,
      permission: { ...official.permission, basis: 'license' },
    }).join(' '),
    /official-media-policy/i,
  );
  assert.match(
    validateVisualAsset({
      ...official,
      permission: { ...official.permission, allowsRedistribution: false },
    }).join(' '),
    /redistribution permission/i,
  );
  assert.deepEqual(
    validateVisualAsset({
      ...official,
      permission: {
        ...official.permission,
        allowsModification: true,
      },
      modifications: ['cropped whitespace'],
    }),
    [],
  );
  assert.match(
    validateVisualAsset({
      ...official,
      modifications: ['cropped whitespace'],
    }).join(' '),
    /modification permission/i,
  );
});

test('accepts a complete original step diagram', () => {
  const stepDiagram = {
    ...original,
    id: 'visual-llm-04-qkv-steps',
    kind: 'step-diagram',
    role: 'process',
    tags: ['mechanism'],
    assetPath: 'assets/visuals/llm-foundation/llm-04-qkv-all.svg',
    steps: [
      {
        id: 'project',
        title: '投影',
        description: '从当前位置与可见位置分别得到 Q、K 和 V。',
        alt: '输入表示分别投影为 Q、K 和 V',
        assetPath: 'assets/visuals/llm-foundation/llm-04-qkv-step-01.svg',
      },
      {
        id: 'match',
        title: '匹配',
        description: 'Q 与 K 形成相似度分数，再得到读取权重。',
        alt: 'Q 与三个 K 比较并形成权重',
        assetPath: 'assets/visuals/llm-foundation/llm-04-qkv-step-02.svg',
      },
    ],
  };
  assert.deepEqual(validateVisualAsset(stepDiagram), []);
});

test('requires original provenance and at least two complete steps', () => {
  assert.match(
    errorsFor({ kind: 'step-diagram', steps: [] }).join(' '),
    /at least two steps/i,
  );
  assert.match(
    errorsFor({
      kind: 'step-diagram',
      provenance: 'licensed-reproduction',
      steps: [{}, {}],
    }).join(' '),
    /step-diagram.*original-synthesis/i,
  );
  const sparseSteps = Array(2);
  sparseSteps[1] = {
    id: 'second',
    title: '第二步',
    description: '展示第二步发生的机制。',
    alt: '第二步机制图',
    assetPath: 'assets/visuals/llm-foundation/second.svg',
  };
  assert.match(
    errorsFor({ kind: 'step-diagram', steps: sparseSteps }).join(' '),
    /steps.*sparse/i,
  );
  for (const field of ['id', 'title', 'description', 'alt', 'assetPath']) {
    const step = {
      id: 'step-one',
      title: '第一步',
      description: '描述第一步发生的机制。',
      alt: '第一步机制图',
      assetPath: 'assets/visuals/llm-foundation/step-one.svg',
      [field]: '',
    };
    assert.match(
      errorsFor({ kind: 'step-diagram', steps: [step, { ...step, id: 'step-two' }] })
        .join(' '),
      new RegExp(`step.*${field}`, 'i'),
    );
  }
});

test('requires unique stable step IDs and unique paths', () => {
  const step = {
    id: 'match',
    title: '匹配',
    description: 'Q 与 K 形成相似度分数。',
    alt: 'Q 与三个 K 比较',
    assetPath: 'assets/visuals/llm-foundation/step-match.svg',
  };
  assert.match(
    errorsFor({
      kind: 'step-diagram',
      steps: [step, { ...step }],
    }).join(' '),
    /step ids.*unique/i,
  );
  assert.match(
    errorsFor({
      kind: 'step-diagram',
      steps: [step, { ...step, id: 'aggregate' }],
    }).join(' '),
    /step asset paths.*unique/i,
  );
  assert.match(
    errorsFor({
      kind: 'step-diagram',
      steps: [step, { ...step, id: 'Step Two', assetPath: 'assets/visuals/llm-foundation/step-two.svg' }],
    }).join(' '),
    /step.*id.*kebab-case/i,
  );
});

test('returns step id errors without throwing for malformed step IDs', () => {
  const malformedIds = [
    ['symbol', Symbol('step-id')],
    ['null-prototype object', Object.create(null)],
    ['plain object', {}],
    ['array', []],
    ['function', () => {}],
  ];
  const validStep = {
    id: 'second',
    title: '第二步',
    description: '展示第二步发生的机制。',
    alt: '第二步机制图',
    assetPath: 'assets/visuals/llm-foundation/second.svg',
  };

  for (const [label, id] of malformedIds) {
    let errors;
    assert.doesNotThrow(() => {
      errors = errorsFor({
        kind: 'step-diagram',
        steps: [
          {
            id,
            title: '第一步',
            description: '展示第一步发生的机制。',
            alt: '第一步机制图',
            assetPath: 'assets/visuals/llm-foundation/first.svg',
          },
          validStep,
        ],
      });
    }, label);
    assert.match(errors.join(' '), /steps\[0\]\.id.*kebab-case/i, label);
  }
});

test('requires step assets to share the main visual directory and format', () => {
  const commonStep = {
    title: '阶段',
    description: '展示这个阶段的机制。',
    alt: '阶段机制图',
  };
  assert.match(
    errorsFor({
      kind: 'step-diagram',
      assetPath: 'assets/visuals/llm-foundation/all.svg',
      steps: [
        {
          ...commonStep,
          id: 'first',
          assetPath: 'assets/visuals/other-module/first.svg',
        },
        {
          ...commonStep,
          id: 'second',
          assetPath: 'assets/visuals/llm-foundation/second.svg',
        },
      ],
    }).join(' '),
    /same directory/i,
  );
  assert.match(
    errorsFor({
      kind: 'step-diagram',
      assetPath: 'assets/visuals/llm-foundation/all.svg',
      steps: [
        {
          ...commonStep,
          id: 'first',
          assetPath: 'assets/visuals/llm-foundation/first.png',
        },
        {
          ...commonStep,
          id: 'second',
          assetPath: 'assets/visuals/llm-foundation/second.svg',
        },
      ],
    }).join(' '),
    /same format/i,
  );
  assert.match(
    errorsFor({
      kind: 'step-diagram',
      assetPath: 'assets/visuals/llm-foundation/all.svg',
      steps: [
        {
          ...commonStep,
          id: 'first',
          assetPath: 'assets/visuals/llm-foundation/all.svg',
        },
        {
          ...commonStep,
          id: 'second',
          assetPath: 'assets/visuals/llm-foundation/second.svg',
        },
      ],
    }).join(' '),
    /step asset path.*main assetPath/i,
  );
});

test('deep-freezes nested plain records and arrays without recursing forever on cycles', () => {
  const value = {
    ...licensedReproduction,
    nested: {
      steps: [{ id: 'one' }],
    },
  };
  value.self = value;

  const frozen = deepFreezeVisual(value);

  assert.equal(frozen, value);
  assert.ok(Object.isFrozen(frozen));
  assert.ok(Object.isFrozen(frozen.permission));
  assert.ok(Object.isFrozen(frozen.modifications));
  assert.ok(Object.isFrozen(frozen.nested));
  assert.ok(Object.isFrozen(frozen.nested.steps));
  assert.ok(Object.isFrozen(frozen.nested.steps[0]));
});

test('deep-freezes symbol-keyed data properties without invoking getters', () => {
  const recordKey = Symbol('record');
  const itemKey = Symbol('item');
  let getterReads = 0;
  const value = {
    [recordKey]: {
      items: [],
    },
  };
  value[recordKey].items[itemKey] = { owner: value };
  Object.defineProperty(value, 'computed', {
    get() {
      getterReads += 1;
      return {};
    },
  });

  deepFreezeVisual(value);

  assert.equal(getterReads, 0);
  assert.ok(Object.isFrozen(value));
  assert.ok(Object.isFrozen(value[recordKey]));
  assert.ok(Object.isFrozen(value[recordKey].items));
  assert.ok(Object.isFrozen(value[recordKey].items[itemKey]));
  assert.equal(value[recordKey].items[itemKey].owner, value);
});

test('deepFreezeVisual leaves Date, Map and class instances untouched', () => {
  class VisualMetadata {}
  const date = new Date('2026-07-26T00:00:00Z');
  const map = new Map([['nested', {}]]);
  const instance = new VisualMetadata();
  instance.nested = {};
  const value = { date, map, instance };

  deepFreezeVisual(value);

  assert.ok(Object.isFrozen(value));
  assert.equal(Object.isFrozen(date), false);
  assert.equal(Object.isFrozen(map), false);
  assert.equal(Object.isFrozen(map.get('nested')), false);
  assert.equal(Object.isFrozen(instance), false);
  assert.equal(Object.isFrozen(instance.nested), false);
});

test('returns readable errors instead of throwing for ordinary invalid input', () => {
  for (const value of [undefined, null, '', 42, [], {}]) {
    let errors;
    assert.doesNotThrow(() => {
      errors = validateVisualAsset(value);
    });
    assert.ok(Array.isArray(errors));
    assert.ok(errors.length > 0);
    assert.ok(errors.every((error) => typeof error === 'string' && error.length > 0));
  }
});
