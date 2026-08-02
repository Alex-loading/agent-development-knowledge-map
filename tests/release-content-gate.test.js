import test from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';

import {
  findReleaseMarkers,
  scanReleaseContent,
} from '../scripts/check-release-content.mjs';

test('release marker policy catches authoring debt without flagging domain prose', () => {
  assert.equal(findReleaseMarkers('TODO: 补写').length, 1);
  assert.equal(findReleaseMarkers('TBD: 核验来源').length, 1);
  assert.equal(findReleaseMarkers('todo=0').length, 0);
  assert.equal(findReleaseMarkers('状态：未完成。').length, 1);
  assert.equal(findReleaseMarkers('请求已接纳但处理尚未完成').length, 0);
  assert.equal(findReleaseMarkers('```\nTODO\n```', { markdown: true }).length, 0);
});

test('published course data and content audits contain no unresolved authoring markers', async () => {
  const findings = await scanReleaseContent(resolve(new URL('..', import.meta.url).pathname));
  assert.deepEqual(findings, []);
});
