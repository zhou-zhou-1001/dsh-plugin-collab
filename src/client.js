// 客户端半边源码（ESM）——构建时打包成 DSH 闭包工厂格式。
// 样式全部走 DSH 主题 token，不写死颜色：浅色/深色主题都能用。
import { createElement as h, Fragment, useCallback, useEffect, useState } from 'react';

const css = `
.cw-page { padding: 28px 32px 48px; max-width: 980px; margin: 0 auto;
  color: var(--dsw-alias-label-primary, #101619); font-size: 13px; }
.cw-head { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.cw-title { font-size: 20px; font-weight: 600; margin: 0; letter-spacing: -0.2px; }
.cw-sub { margin: 6px 0 0; font-size: 12px; color: var(--dsw-alias-label-tertiary, #8b959b); }
.cw-path { font-family: var(--dsw-font-family-mono, ui-monospace, Menlo, monospace); word-break: break-all; }
.cw-stats { display: flex; flex-wrap: wrap; gap: 0; margin: 22px 0 4px;
  border: 1px solid var(--dsw-alias-border-l2, #ffffff1f); border-radius: var(--dsw-radius-md, 8px); overflow: hidden; }
.cw-stat { flex: 1 1 120px; padding: 12px 16px; border-right: 1px solid var(--dsw-alias-border-l2, #ffffff1f); }
.cw-stat:last-child { border-right: 0; }
.cw-stat-num { display: block; font-size: 22px; font-weight: 600; line-height: 1.15; font-variant-numeric: tabular-nums; }
.cw-stat-num.is-gap { color: var(--cw-danger); }
.cw-stat-label { display: block; margin-top: 2px; font-size: 11.5px; color: var(--dsw-alias-label-tertiary, #8b959b); }
.cw-section { display: flex; align-items: baseline; gap: 8px; margin: 28px 0 10px; }
.cw-section h2 { font-size: 13.5px; font-weight: 600; margin: 0; }
.cw-count { font-size: 12px; color: var(--dsw-alias-label-tertiary, #8b959b); font-variant-numeric: tabular-nums; }
.cw-list { display: flex; flex-direction: column; gap: 8px; }
.cw-task { display: flex; align-items: center; gap: 12px; padding: 12px 14px; flex-wrap: wrap;
  border: 1px solid var(--dsw-alias-border-l2, #ffffff1f); border-radius: var(--dsw-radius-md, 8px);
  background: var(--dsw-alias-bg-module-platform, #f7f8f7); }
.cw-task-main { flex: 1 1 220px; min-width: 0; }
.cw-task-id { font-weight: 600; font-size: 13px; word-break: break-all; }
.cw-task-meta { margin-top: 3px; font-size: 11.5px; color: var(--dsw-alias-label-tertiary, #8b959b); }
.cw-chip { display: inline-flex; align-items: center; gap: 4px; padding: 1px 8px; font-size: 11px; font-weight: 600;
  border-radius: 999px; white-space: nowrap; }
.cw-chip.gap { color: var(--cw-danger); background: var(--cw-danger-wash); }
.cw-chip.ok { color: var(--cw-ok); background: var(--cw-ok-wash); }
.cw-chip.pending { color: var(--cw-warn); background: var(--cw-warn-wash); }
.cw-actions { display: flex; gap: 6px; flex-shrink: 0; }
.cw-btn { font: inherit; font-size: 12px; line-height: 1.4; padding: 5px 10px; cursor: pointer;
  color: var(--dsw-alias-label-primary, #101619); background: transparent;
  border: 1px solid var(--dsw-alias-border-l3, #ffffff29); border-radius: var(--dsw-radius-sm, 8px); }
.cw-btn:hover { background: var(--dsw-alias-bg-multi-select, #eef1f4); }
.cw-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
.cw-table th { text-align: left; font-weight: 600; font-size: 11.5px; padding: 6px 10px;
  color: var(--dsw-alias-label-tertiary, #8b959b); border-bottom: 1px solid var(--dsw-alias-border-l3, #ffffff29); }
.cw-table td { padding: 8px 10px; vertical-align: top; border-bottom: 1px solid var(--dsw-alias-border-l1, #ffffff0f); }
.cw-table tr:last-child td { border-bottom: 0; }
.cw-col-path { font-family: var(--dsw-font-family-mono, ui-monospace, Menlo, monospace);
  font-size: 11.5px; color: var(--dsw-alias-label-secondary, #5a666e); word-break: break-all; width: 34%; }
.cw-col-val { width: 18%; color: var(--cw-danger); font-family: var(--dsw-font-family-mono, ui-monospace, Menlo, monospace); font-size: 11.5px; }
.cw-col-why { color: var(--dsw-alias-label-secondary, #5a666e); }
.cw-empty { padding: 22px 14px; text-align: center; font-size: 12.5px;
  color: var(--dsw-alias-label-tertiary, #8b959b); border: 1px dashed var(--dsw-alias-border-l2, #ffffff1f);
  border-radius: var(--dsw-radius-md, 8px); }
.cw-ev { border: 1px solid var(--dsw-alias-border-l2, #ffffff1f); border-radius: var(--dsw-radius-md, 8px); overflow: hidden; }
.cw-ev + .cw-ev { margin-top: 8px; }
.cw-ev-head { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 14px;
  font: inherit; font-size: 12.5px; text-align: left; cursor: pointer; color: inherit;
  background: transparent; border: 0; }
.cw-ev-head:hover { background: var(--dsw-alias-bg-multi-select, #eef1f4); }
.cw-ev-tool { font-weight: 600; }
.cw-ev-digest { margin-left: auto; font-family: var(--dsw-font-family-mono, ui-monospace, Menlo, monospace);
  font-size: 11px; color: var(--dsw-alias-label-tertiary, #8b959b); }
.cw-ev-body { padding: 0 14px 12px; }
.cw-pre { margin: 0; padding: 10px 12px; font-family: var(--dsw-font-family-mono, ui-monospace, Menlo, monospace);
  font-size: 11.5px; line-height: 1.5; white-space: pre-wrap; word-break: break-word;
  color: var(--dsw-alias-label-secondary, #5a666e); background: var(--dsw-alias-bg-base, #f5f6f7);
  border: 1px solid var(--dsw-alias-border-l1, #ffffff0f); border-radius: var(--dsw-radius-sm, 8px); }
.cw-error { padding: 10px 14px; font-size: 12.5px; border-radius: var(--dsw-radius-sm, 8px);
  color: var(--cw-danger); background: var(--cw-danger-wash); }
@media (max-width: 640px) {
  .cw-page { padding: 20px 16px 40px; }
  .cw-stat { flex-basis: 50%; }
  .cw-actions { width: 100%; }
}
`;

// 语义色：深浅主题都要够对比，所以不用 token 里的背景色，用固定的中亮度色
const themeVars = `
.cw-root { --cw-danger: #e5484d; --cw-danger-wash: rgba(229,72,77,0.12);
  --cw-ok: #30a46c; --cw-ok-wash: rgba(48,164,108,0.14);
  --cw-warn: #d97706; --cw-warn-wash: rgba(217,119,6,0.14); }
`;

let styleInjected = false;
function ensureStyle() {
  if (styleInjected || typeof document === 'undefined') return;
  const tag = document.createElement('style');
  tag.dataset.plugin = 'dsh-plugin-collab';
  tag.textContent = themeVars + css;
  document.head.appendChild(tag);
  styleInjected = true;
}

function Stat({ value, label, danger }) {
  return h('div', { className: 'cw-stat' },
    h('b', { className: danger && value > 0 ? 'cw-stat-num is-gap' : 'cw-stat-num' }, String(value)),
    h('span', { className: 'cw-stat-label' }, label),
  );
}

function TaskRow({ task, onReview }) {
  const decided = task.review ? task.review.decision : null;
  const chip = task.evidence === 0
    ? h('span', { className: 'cw-chip gap' }, '无证据')
    : decided === 'accepted'
      ? h('span', { className: 'cw-chip ok' }, '已验收')
      : h('span', { className: 'cw-chip pending' }, decided || '待验收');

  return h('div', { className: 'cw-task' },
    h('div', { className: 'cw-task-main' },
      h('div', { className: 'cw-task-id' }, task.id),
      h('div', { className: 'cw-task-meta' },
        `证据 ${task.evidence} · 交接 ${task.handoffs}${task.parent ? ' · 来源 ' + task.parent : ''}`),
    ),
    chip,
    h('div', { className: 'cw-actions' },
      h('button', { className: 'cw-btn', onClick: () => onReview(task.id, 'accepted') }, '接受'),
      h('button', { className: 'cw-btn', onClick: () => onReview(task.id, 'changes_requested') }, '要求修改'),
    ),
  );
}

function EvidenceRow({ item }) {
  const [open, setOpen] = useState(false);
  const digest = item.artifact?.digest;
  return h('div', { className: 'cw-ev' },
    h('button', { className: 'cw-ev-head', onClick: () => setOpen((v) => !v), 'aria-expanded': open },
      h('span', null, open ? '▾' : '▸'),
      h('span', { className: 'cw-ev-tool' }, item.tool || 'unknown'),
      h('span', { className: 'cw-chip ' + (digest ? 'ok' : 'gap') }, digest ? '有 digest' : '无 digest'),
      h('span', { className: 'cw-ev-digest' }, digest ? digest.slice(0, 16) + '…' : (item.sessionId || '').slice(0, 12)),
    ),
    open && h('div', { className: 'cw-ev-body' },
      h('pre', { className: 'cw-pre' },
        [
          `工具: ${item.tool || '—'}`,
          `来源: ${JSON.stringify(item.source || {})}`,
          item.artifact?.path ? `产物: ${item.artifact.path}` : '产物: （无可复算物件）',
          digest ? `digest: ${digest}` : 'digest: —',
          '',
          item.detail ? `参数/命令:\n${item.detail}` : '（没有记录参数）',
        ].join('\n')),
    ),
  );
}

export function CollabPage() {
  ensureStyle();
  const [state, setState] = useState(null);
  const [err, setErr] = useState('');

  const load = useCallback(() => {
    fetch('/collab/api/state', { headers: { accept: 'application/json' } })
      .then((r) => r.json())
      .then((next) => { setState(next); setErr(''); })
      .catch((e) => setErr(String(e.message || e)));
  }, []);
  // 首次加载 + 每 5 秒刷新：协同场景里数据一直在变，不能只读一次
  useEffect(() => {
    load();
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, [load]);

  const review = useCallback((task, decision) => {
    fetch('/collab/api/review', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ task, decision, reviewer: 'human' }),
    }).then(load);
  }, [load]);

  const body = err
    ? h('div', { className: 'cw-error' }, `读不到证据记录：${err}`)
    : !state
      ? h('div', { className: 'cw-empty' }, '读取中…')
      : h(Fragment, null,
          h('div', { className: 'cw-stats' },
            h(Stat, { value: state.gaps.length, label: '未证明', danger: true }),
            h(Stat, { value: state.tasks.length, label: '任务' }),
            h(Stat, { value: state.evidence.length, label: '证据' }),
            h(Stat, { value: state.reviews.length, label: '验收' }),
          ),
          h('div', { className: 'cw-section' },
            h('h2', null, '任务'),
            h('span', { className: 'cw-count' }, `${state.tasks.length} 个`),
          ),
          state.tasks.length === 0
            ? h('div', { className: 'cw-empty' }, '还没有捕获到任务。跑一次带子 agent 的会话，或用 POST /collab/api/evidence 手动写入。')
            : h('div', { className: 'cw-list' }, state.tasks.map((t) => h(TaskRow, { key: t.id, task: t, onReview: review }))),
          h('div', { className: 'cw-section' },
            h('h2', null, '证据'),
            h('span', { className: 'cw-count' }, `${state.evidence.length} 条`),
          ),
          state.evidence.length === 0
            ? h('div', { className: 'cw-empty' }, '还没有证据记录。')
            : h('div', null, state.evidence.slice(-20).reverse().map((e, i) => h(EvidenceRow, { key: i, item: e }))),
          h('div', { className: 'cw-section' },
            h('h2', null, '未证明清单'),
            h('span', { className: 'cw-count' }, `${state.gaps.length} 项`),
          ),
          state.gaps.length === 0
            ? h('div', { className: 'cw-empty' }, '没有未证明项。')
            : h('table', { className: 'cw-table' },
                h('thead', null, h('tr', null,
                  h('th', null, '来源字段'), h('th', null, '值'), h('th', null, '为什么算缺口'))),
                h('tbody', null, state.gaps.map((g, i) => h('tr', { key: i },
                  h('td', { className: 'cw-col-path' }, g.path),
                  h('td', { className: 'cw-col-val' }, g.value),
                  h('td', { className: 'cw-col-why' }, g.why),
                ))),
              ),
        );

  return h('div', { className: 'cw-root' },
    h('div', { className: 'cw-page' },
      h('div', { className: 'cw-head' },
        h('div', null,
          h('h1', { className: 'cw-title' }, '证据链'),
          h('p', { className: 'cw-sub' },
            state ? `${state.events} 条记录 · 起点 ` : '读取中…',
            state ? h('span', { className: 'cw-path' }, state.root) : null),
        ),
        h('button', { className: 'cw-btn', onClick: load }, '刷新'),
      ),
      body,
    ),
  );
}

export function CollabIcon({ size }) {
  const s = size || 16;
  return h('svg', { width: s, height: s, viewBox: '0 0 16 16', fill: 'none' },
    h('circle', { cx: 8, cy: 8, r: 5.5, stroke: 'currentColor', strokeWidth: 1.4 }),
    h('circle', { cx: 8, cy: 8, r: 1.8, fill: 'currentColor' }),
  );
}

export const inject = ['slots'];

export function apply(ctx) {
  ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: 'collab', inject: () => ({}) }, CollabPage));
  ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({ name: 'sidebar.panellist', id: 'collab', order: 30 }, CollabIcon));
}
