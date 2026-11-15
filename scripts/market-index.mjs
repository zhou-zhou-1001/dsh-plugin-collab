// 生成插件市场索引：读 package.json 的版本 + 当前 git commit，写出 market/index.json。
// 用法：node scripts/market-index.mjs [--repo <git url>] [--out market/index.json]
// 注意：source.type='git' 要求仓库是公开可访问的，否则安装会失败。
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
const commit = execSync('git rev-parse HEAD', { cwd: root }).toString().trim();
const repo = getArg('--repo', 'https://github.com/zhou-zhou-1001/dsh-plugin-collab');
const out = path.resolve(root, getArg('--out', 'market/index.json'));
const now = Math.floor(Date.now() / 1000);

const index = {
  format: 1,
  title: { en: 'CairnWeave Evidence Market', zh: 'CairnWeave 证据市场' },
  description: {
    en: 'Bundles that keep agent output verifiable.',
    zh: '让 agent 的产出可以被核验的插件。',
  },
  metadata: {
    categories: { evidence: { title: { en: 'Evidence & Audit', zh: '证据与审计' } } },
    labels: { 'open-source': { title: { en: 'Open source', zh: '开源' } } },
    sortKeys: { updated: { title: { en: 'Updated', zh: '更新时间' }, order: 'desc' } },
  },
  plugins: [
    {
      name: pkg.name,
      title: { en: 'Collab Evidence Board', zh: '协同证据台' },
      description: {
        en: 'Inspect what each agent produced and whether it can be recomputed.',
        zh: '查看每个 agent 产出了什么、能不能被复算。',
      },
      author: 'zhou-zhou',
      repository: { url: repo },
      metadata: {
        category: 'evidence',
        keywords: ['evidence', 'audit', 'provenance', 'cairnweave'],
        labels: ['open-source'],
        sortKeys: { updated: now },
      },
      versions: [
        {
          version: pkg.version,
          publishTimestamp: now,
          source: { type: 'git', url: repo, commit },
          engines: { dsh: '>=0.2.2-rc.1' },
        },
      ],
    },
  ],
};

mkdirSync(path.dirname(out), { recursive: true });
writeFileSync(out, `${JSON.stringify(index, null, 2)}\n`, 'utf8');
console.log(`index written: ${out}`);
console.log(`  ${pkg.name}@${pkg.version} → ${repo} @ ${commit.slice(0, 12)}`);
