// 采集逻辑测试：用 DSH 真实事件结构驱动，不依赖真实会话或模型
// 运行：node --test test/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { apply } from '../src/index.js';

// 最小 ctx 替身：只提供插件 inject 需要的服务
function makeCtx() {
  const handlers = [];
  const routes = [];
  const ctx = {
    webServer: { register: (r) => { routes.push(r); return () => {}; } },
    sessions: {},
    on: (name, fn) => { handlers.push({ name, fn }); return () => {}; },
    effect: (fn) => { const d = fn(); return () => {}; },
    get: (name) => (name === 'webServer' ? ctx.webServer : undefined),
    inject: (deps, fn) => { if (!deps.includes('webServer') || ctx.webServer) fn(ctx); return () => {}; },
  };
  return {
    ctx,
    routes,
    emit: (session, event) => handlers.filter((h) => h.name === 'session/event').forEach((h) => h.fn(session, event)),
    fire: (name, session) => handlers.filter((h) => h.name === name).forEach((h) => h.fn(session)),
  };
}

function readRecords(dir) {
  const file = path.join(dir, 'events.ndjson');
  if (!existsSync(file)) return [];
  return readFileSync(file, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
}

test('写文件工具：按 callId 回连工具名并算出 digest', async () => {
  const root = mkdtempSync(path.join(tmpdir(), 'collab-'));
  const { ctx, emit } = makeCtx();
  const target = path.join(root, 'out.md');
  writeFileSync(target, 'hello');

  apply(ctx, { root });
  const session = { id: 's1' };
  emit(session, { type: 'tool/call', data: { turn: 1, step: 1, callId: 'c1', name: 'write_file', arguments: JSON.stringify({ path: target }) } });
  emit(session, { type: 'tool/result', data: { turn: 1, step: 1, message: { toolCallId: 'c1', isError: false } } });

  await new Promise((r) => setTimeout(r, 50));
  const rows = readRecords(root).filter((r) => r.kind === 'evidence.attempt');
  assert.equal(rows.length, 1, '应记录一条证据');
  assert.equal(rows[0].tool, 'write_file', '工具名来自 tool/call');
  assert.ok(rows[0].artifact?.digest, '应算出 digest');
  assert.match(rows[0].artifact.digest, /^[0-9a-f]{64}$/);
});

test('只读工具不算证据', async () => {
  const root = mkdtempSync(path.join(tmpdir(), 'collab-'));
  const { ctx, emit } = makeCtx();
  apply(ctx, { root });
  const session = { id: 's2' };
  emit(session, { type: 'tool/call', data: { turn: 1, step: 1, callId: 'c2', name: 'read_file', arguments: JSON.stringify({ path: '/etc/hosts' }) } });
  emit(session, { type: 'tool/result', data: { turn: 1, step: 1, message: { toolCallId: 'c2', isError: false } } });

  await new Promise((r) => setTimeout(r, 50));
  assert.equal(readRecords(root).filter((r) => r.kind === 'evidence.attempt').length, 0);
});

test('失败的工具结果：记录但仍算未证明（没有 digest）', async () => {
  const root = mkdtempSync(path.join(tmpdir(), 'collab-'));
  const { ctx, emit } = makeCtx();
  apply(ctx, { root });
  const session = { id: 's3' };
  emit(session, { type: 'tool/call', data: { turn: 1, step: 1, callId: 'c3', name: 'write_file', arguments: JSON.stringify({ path: '/nope/missing.md' }) } });
  emit(session, { type: 'tool/result', data: { turn: 1, step: 1, message: { toolCallId: 'c3', isError: true } } });

  await new Promise((r) => setTimeout(r, 50));
  const rows = readRecords(root).filter((r) => r.kind === 'evidence.attempt');
  assert.equal(rows.length, 1);
  assert.equal(rows[0].artifact, null, '失败或读不到文件时不应编造 digest');
  assert.equal(rows[0].source.failed, true);
});

test('路由注册了 state / evidence / review 三个', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'collab-'));
  const { ctx, routes } = makeCtx();
  apply(ctx, { root });
  const paths = routes.map((r) => r.path).sort();
  assert.deepEqual(paths, ['/collab/api/evidence', '/collab/api/review', '/collab/api/state']);
});

test('子 agent 生命周期：created → task.started，disposed → handoff', async () => {
  const root = mkdtempSync(path.join(tmpdir(), 'collab-'));
  const { ctx, fire } = makeCtx();
  apply(ctx, { root });
  const child = { id: 'child-1', header: { origin: 'subagent', parentSession: 'root-1', delegationDepth: 1 } };
  fire('session/created', child);
  fire('session/disposed', child);
  await new Promise((r) => setTimeout(r, 50));

  const rows = readRecords(root);
  const started = rows.filter((r) => r.kind === 'task.started');
  const handoff = rows.filter((r) => r.kind === 'handoff');
  assert.equal(started.length, 1);
  assert.equal(started[0].task, 'child-1');
  assert.equal(started[0].parent, 'root-1');
  assert.equal(handoff.length, 1);
});

test('普通会话（非 subagent）不产生任务记录', async () => {
  const root = mkdtempSync(path.join(tmpdir(), 'collab-'));
  const { ctx, fire } = makeCtx();
  apply(ctx, { root });
  fire('session/created', { id: 'root-1', header: {} });
  await new Promise((r) => setTimeout(r, 50));
  assert.equal(readRecords(root).filter((r) => r.kind === 'task.started').length, 0);
});
