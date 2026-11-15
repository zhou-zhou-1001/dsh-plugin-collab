// CairnWeave × DSH — host half (v0.1)
// 采集 DSH 会话信号 → CairnWeave 证据记录 → 通过 webServer 路由给前端读取。
// 设计口径见 docs/DESIGN.md。

import { appendFile, mkdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import os from 'node:os';
import path from 'node:path';

export const name = 'collab-evidence';
export const inject = ['webServer'];

const DIR_NAME = '.cairnweave';
const ROUTE_PREFIX = '/collab/api';

function nowIso() {
  return new Date().toISOString();
}

// artifact-store 的 canonical 规则：键名排序，无空格
function canonical(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`;
}

function digestOf(artifact) {
  return createHash('sha256').update(canonical(artifact)).digest('hex');
}

class EvidenceLog {
  constructor(root) {
    this.dir = path.join(root, DIR_NAME);
    this.file = path.join(this.dir, 'events.ndjson');
    this.records = [];
    this.ready = this.load();
  }

  async load() {
    await mkdir(this.dir, { recursive: true });
    try {
      const text = await readFile(this.file, 'utf8');
      this.records = text.split('\n').filter(Boolean).flatMap((line) => {
        try { return [JSON.parse(line)]; } catch { return []; }
      });
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }

  async append(record) {
    await this.ready;
    const row = { at: nowIso(), ...record };
    try {
      await appendFile(this.file, `${JSON.stringify(row)}\n`, 'utf8');
      this.records.push(row);
      return row;
    } catch (error) {
      // 采集失败不许影响 agent 运行
      console.error(`[collab] evidence append failed: ${error.message}`);
      return null;
    }
  }

  // 未证明 = 声称有产出但拿不出可复算物件，或验收人是产出人自己
  gaps() {
    const out = [];
    for (const r of this.records) {
      if (r.kind === 'evidence.attempt' && !r.artifact?.digest) {
        out.push({
          path: `evidence:${r.id || r.task || '?'}`,
          value: r.tool || 'unknown tool',
          why: '有产出声明，但没有 digest 或可复算物件。',
        });
      }
      if (r.kind === 'reviewed' && r.reviewer && r.producer && r.reviewer === r.producer) {
        out.push({
          path: `review:${r.task}`,
          value: 'self_review',
          why: '验收人与产出人相同，按规则不计入「已验收」。',
        });
      }
      if (r.kind === 'reviewed' && r.decision === 'inconclusive') {
        out.push({ path: `review:${r.task}`, value: 'inconclusive', why: '验收结论是「证据不足」。' });
      }
    }
    return out;
  }

  state() {
    const tasks = new Map();
    for (const r of this.records) {
      const id = r.task || r.childSessionId || 'unknown';
      if (!tasks.has(id)) tasks.set(id, { id, status: 'unknown', producer: null, handoffs: 0, evidence: 0, review: null });
      const t = tasks.get(id);
      if (r.kind === 'task.started') t.status = 'running';
      if (r.kind === 'handoff') { t.status = r.status || 'handed-off'; t.handoffs += 1; }
      if (r.kind === 'evidence.attempt') { t.evidence += 1; t.producer = r.agent || t.producer; }
      if (r.kind === 'reviewed') t.review = { decision: r.decision, reviewer: r.reviewer, at: r.at };
    }
    return {
      root: this.dir,
      generatedAt: nowIso(),
      tasks: [...tasks.values()],
      evidence: this.records.filter((r) => r.kind === 'evidence.attempt'),
      reviews: this.records.filter((r) => r.kind === 'reviewed'),
      events: this.records.length,
      gaps: this.gaps(),
    };
  }
}

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(payload);
}

async function readJson(req, limit = 1024 * 512) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new Error('payload too large');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

export function apply(ctx, config = {}) {
  // 默认落在用户家目录，不能跟 cwd 跑——否则从哪个目录启动就往哪儿写
  const root = config.root || path.join(os.homedir(), '.cairnweave');
  const log = new EvidenceLog(root);
  const disposers = [];

  // ---- 采集：tool 结果里能落成证据的，记一条 attempt ----
  if (ctx.get?.('sessions') || ctx.sessions) {
    disposers.push(ctx.on('session/event', (session, event) => {
      try {
        if (event?.type !== 'tool/result') return;
        const data = event.data || {};
        const tool = data.tool || data.name || 'unknown';
        // 只认会产生产物的工具；查询类不算证据
        if (!/write|edit|patch|apply|bash|shell|create/i.test(tool)) return;
        const artifact = data.artifact || null;
        void log.append({
          kind: 'evidence.attempt',
          sessionId: session?.id,
          tool,
          task: data.label || data.task,
          agent: data.agent || 'main',
          artifact: artifact && artifact.path ? { path: artifact.path, digest: digestOf(artifact) } : null,
          source: { event: event.type, seq: event.seq },
        });
      } catch (error) {
        console.error(`[collab] capture error: ${error.message}`);
      }
    }));
  }

  disposers.push(ctx.webServer.register({
    path: `${ROUTE_PREFIX}/state`,
    kind: 'prefix',
    auth: 'required',
    async handler(req, res) {
      if (req.method !== 'GET') return json(res, 405, { error: 'method not allowed' });
      await log.ready;
      json(res, 200, log.state());
    },
  }));

  disposers.push(ctx.webServer.register({
    path: `${ROUTE_PREFIX}/review`,
    kind: 'exact',
    auth: 'required',
    async handler(req, res) {
      if (req.method !== 'POST') return json(res, 405, { error: 'method not allowed' });
      let body;
      try { body = await readJson(req); } catch (error) { return json(res, 400, { error: error.message }); }
      const allowed = ['accepted', 'rejected', 'changes_requested', 'inconclusive'];
      if (!allowed.includes(body.decision)) {
        return json(res, 422, { error: `decision must be one of ${allowed.join(', ')}` });
      }
      const row = await log.append({
        kind: 'reviewed',
        task: body.task,
        decision: body.decision,
        reviewer: body.reviewer || 'human',
        producer: body.producer || null,
        note: body.note || '',
      });
      json(res, row ? 201 : 500, row || { error: 'append failed' });
    },
  }));

  disposers.push(ctx.webServer.register({
    path: `${ROUTE_PREFIX}/evidence`,
    kind: 'exact',
    auth: 'required',
    async handler(req, res) {
      if (req.method !== 'POST') return json(res, 405, { error: 'method not allowed' });
      let body;
      try { body = await readJson(req); } catch (error) { return json(res, 400, { error: error.message }); }
      const artifact = body.artifact || null;
      const row = await log.append({
        kind: 'evidence.attempt',
        task: body.task,
        tool: body.tool || 'manual',
        agent: body.agent || 'main',
        artifact: artifact ? { path: artifact.path, digest: digestOf(artifact) } : null,
        source: { event: 'manual' },
      });
      json(res, row ? 201 : 500, row || { error: 'append failed' });
    },
  }));

  ctx.effect(() => () => {
    for (const dispose of disposers) dispose();
  }, 'collab: routes');
}
