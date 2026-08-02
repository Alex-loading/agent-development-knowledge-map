import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { courseRegistry } from '../src/data/courses.js';
import { getPrimaryReference } from '../src/data/primary-references.js';
import {
  readMarkdownTable,
  unwrapSingleCodeSpan,
} from './helpers/markdown-table.js';

const expectedModuleLessons = Object.freeze({
  'llm-foundation': Array.from({ length: 8 }, (_, index) => `llm-${String(index + 1).padStart(2, '0')}`),
  'agent-mechanism': Array.from({ length: 8 }, (_, index) => `agent-${String(index + 1).padStart(2, '0')}`),
  'agent-harness': Array.from({ length: 8 }, (_, index) => `harness-${String(index + 1).padStart(2, '0')}`),
  'context-rag-memory': Array.from({ length: 8 }, (_, index) => `context-${String(index + 1).padStart(2, '0')}`),
  'backend-engineering': Array.from({ length: 8 }, (_, index) => `backend-${String(index + 1).padStart(2, '0')}`),
});

const acceptedContributions = new Set([
  'adopted',
  'corrected',
  'deepened',
  'rejected',
  'duplicate',
]);

test('freezes the exact five-module, forty-lesson public identity contract', () => {
  assert.deepEqual(Object.keys(courseRegistry), Object.keys(expectedModuleLessons));
  assert.deepEqual(
    Object.fromEntries(Object.entries(courseRegistry).map(([moduleId, course]) => [
      moduleId,
      course.lessons.map(({ id }) => id),
    ])),
    expectedModuleLessons,
  );
  assert.equal(Object.values(courseRegistry).flatMap(({ lessons }) => lessons).length, 40);
});

test('resolves every globally unique resource and every canonical primary binding', () => {
  const resources = Object.values(courseRegistry).flatMap(({ resources }) => resources);
  assert.equal(new Set(resources.map(({ id }) => id)).size, resources.length);

  for (const resource of resources) {
    if (resource.sourceTier !== 'primary-narrative') continue;
    const canonical = getPrimaryReference(resource.canonicalSourceId);
    assert.ok(canonical, `${resource.id}: canonical primary source must resolve`);
    assert.equal(resource.title, canonical.title, resource.id);
    assert.equal(resource.url, canonical.canonicalUrl, resource.id);
    assert.equal(resource.sourceFamily, canonical.sourceFamily, resource.id);
  }
});

test('requires primary narrative, independent verification and section evidence in all forty lessons', () => {
  for (const course of Object.values(courseRegistry)) {
    const resourcesById = new Map(course.resources.map((resource) => [resource.id, resource]));
    for (const lesson of course.lessons) {
      const lessonResources = lesson.resourceIds.map((id) => resourcesById.get(id));
      assert.ok(
        lessonResources.every(Boolean),
        `${course.id}/${lesson.id}: every lesson resource must resolve`,
      );
      assert.ok(
        lessonResources.some(({ sourceTier }) => sourceTier === 'primary-narrative'),
        `${course.id}/${lesson.id}: missing primary narrative`,
      );
      assert.ok(
        lessonResources.some(({ evidence }) => ['official', 'academic'].includes(evidence?.authority)),
        `${course.id}/${lesson.id}: missing independent verification`,
      );

      for (const section of lesson.knowledgeNote.sections) {
        assert.ok(section.sourceIds.length > 0, `${course.id}/${lesson.id}/${section.id}`);
        const sectionResources = section.sourceIds.map((id) => resourcesById.get(id));
        assert.ok(
          sectionResources.every((resource) => resource && resource.evidence),
          `${course.id}/${lesson.id}/${section.id}: unresolved or unevidenced source`,
        );
        assert.ok(
          sectionResources.some(({ sourceTier, evidence }) => (
            sourceTier === 'primary-narrative'
            || ['official', 'academic'].includes(evidence.authority)
          )),
          `${course.id}/${lesson.id}/${section.id}: no primary or verification evidence`,
        );
      }
    }
  }
});

test('requires supported contribution decisions for every lesson', () => {
  for (const course of Object.values(courseRegistry)) {
    const lessonIds = new Set(course.lessons.map(({ id }) => id));
    const resourcesById = new Map(course.resources.map((resource) => [resource.id, resource]));
    const auditedLessons = new Set();
    assert.ok(course.sourceImpactAudit.length >= course.lessons.length, course.id);

    for (const decision of course.sourceImpactAudit) {
      assert.ok(lessonIds.has(decision.lessonId), `${course.id}/${decision.decisionId}`);
      assert.ok(resourcesById.has(decision.resourceId), `${course.id}/${decision.decisionId}`);
      assert.ok(acceptedContributions.has(decision.contribution), decision.decisionId);
      assert.ok(decision.summary.length >= 20, decision.decisionId);
      assert.ok(decision.rationale.length >= 20, decision.decisionId);
      auditedLessons.add(decision.lessonId);
    }
    assert.deepEqual(auditedLessons, lessonIds, `${course.id}: every lesson needs a decision`);
  }
});

test('records the reviewed 60/30/10 contribution classification for every module', async () => {
  const markdown = await readFile(
    new URL('../docs/content-audits/2026-07-30-primary-reference-integration-release.md', import.meta.url),
    'utf8',
  );
  const header = [
    'moduleId',
    'primaryUnits',
    'verificationUnits',
    'otherUnits',
    'primaryShare',
    'verificationShare',
    'otherShare',
    'classification rationale',
  ];
  const rows = readMarkdownTable(markdown, header);
  assert.equal(rows.length, 5);
  assert.deepEqual(
    rows.map(([moduleId]) => unwrapSingleCodeSpan(moduleId, 'moduleId')),
    Object.keys(expectedModuleLessons),
  );
  for (const row of rows) {
    assert.deepEqual(row.slice(1, 7), ['6', '3', '1', '60%', '30%', '10%']);
    assert.ok(row[7].length >= 40, row[0]);
  }
  assert.match(markdown, /贡献单元[^\n]{0,100}(?:不是|不等于)[^\n]{0,80}(?:字数|段落|引用|资源)/);
});

test('keeps volatile and contested source claims explicitly bounded', async () => {
  const markdown = await readFile(
    new URL('../docs/research/2026-07-30-primary-reference-claim-matrix.md', import.meta.url),
    'utf8',
  );
  const rows = readMarkdownTable(markdown, [
    'claimId',
    'statement',
    'status',
    'primarySourceIds',
    'verificationNeed',
    'moduleId',
    'lessonId',
    'plannedSection',
    'sourceContribution',
    'limitations',
  ]);
  const bounded = rows.filter((row) => ['volatile', 'contested'].includes(row[2]));
  assert.ok(bounded.length > 0);
  for (const row of bounded) {
    assert.ok(row[4].length >= 20, row[0]);
    assert.ok(['adopted', 'corrected', 'deepened', 'rejected', 'duplicate'].includes(row[8]), row[0]);
    assert.ok(row[9].length >= 20, row[0]);
  }
});

test('keeps Vercel as the only documented deployment and contains no Pages workflow', async () => {
  const [readme, agents, packageJson] = await Promise.all([
    readFile(new URL('../README.md', import.meta.url), 'utf8'),
    readFile(new URL('../AGENTS.md', import.meta.url), 'utf8'),
    readFile(new URL('../package.json', import.meta.url), 'utf8'),
  ]);
  assert.match(readme, /唯一正式部署平台是 Vercel/);
  assert.match(readme, /GitHub Pages 必须保持关闭/);
  assert.match(agents, /sole canonical production deployment/);
  assert.match(agents, /Keep GitHub Pages disabled/);
  assert.doesNotMatch(packageJson, /gh-pages|deploy-pages|github-pages/i);

  let workflowNames = [];
  try {
    workflowNames = await import('node:fs/promises').then(({ readdir }) => (
      readdir(new URL('../.github/workflows/', import.meta.url))
    ));
  } catch (error) {
    assert.equal(error.code, 'ENOENT');
  }
  assert.equal(
    workflowNames.some((name) => /pages|jekyll/i.test(name)),
    false,
  );
});
