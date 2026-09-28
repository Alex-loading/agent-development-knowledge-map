import { readdir, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

// 这些文件依赖模拟浏览器或存储，相关功能通过真实浏览器验证。
const browserVerified = new Set([
  'agent-harness-visual-data.test.js', 'context-rag-memory-visual-data.test.js',
  'guided-ui.test.js', 'interview-supplements.test.js', 'knowledge-visual-ui.test.js',
  'ui-interactions.test.js', 'progress.test.js', 'storage.test.js',
]);
// 来源采集使用外部服务；生成器使用真实资产的 --check 命令单独验证。
const environmentDependent = new Set([
  ...browserVerified,
  'primary-references.test.js',
  'agent-mechanism-artifacts.test.js',
  'backend-engineering-artifacts.test.js',
  'context-rag-memory-artifacts.test.js',
]);
const files = (await readdir('tests')).filter((name) => name.endsWith('.test.js') && !environmentDependent.has(name)).sort();
for (const file of files) {
  const source = await readFile(`tests/${file}`, 'utf8');
  if (/FakeDocument|installFakeDom|createFakeWindow|mock\.|fetchImpl|execFileImpl|tmpdir/.test(source)) {
    throw new Error(`测试文件需要独立环境验证：${file}`);
  }
}
console.log(`数据与计算检查：${files.length} 个测试文件。`);
const actualEnvironmentOnly = '^(?!(?:malformed and non-HTTPS external resources are non-clickable and disabled|valid external resources open safely in a new tab)$)';
const result = spawnSync(process.execPath, [
  '--test', `--test-name-pattern=${actualEnvironmentOnly}`,
  ...files.map((name) => `tests/${name}`),
], { stdio: 'inherit', timeout: 30000 });
if (result.error) throw result.error;
if (result.signal) throw new Error(`测试进程被 ${result.signal} 终止`);
process.exitCode = result.status;
