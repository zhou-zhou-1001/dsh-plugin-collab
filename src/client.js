// 客户端半边源码：ESM，构建时打包成 DSH 要求的闭包工厂格式（见 scripts/build.mjs）。
// 只通过 ctx.slots 注册，不碰 ctx 之外的东西；数据走 /collab/api。
import { createElement as h, useCallback, useEffect, useState } from 'react';

const S = {
  page: { padding: '32px 40px', fontFamily: "-apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif", color: '#101619', maxWidth: '1100px' },
  h1: { fontSize: '26px', margin: '0 0 6px', letterSpacing: '-0.4px' },
  sub: { color: '#5a666e', fontSize: '13px', margin: '0 0 24px' },
  stats: { display: 'flex', gap: '28px', margin: '0 0 28px', paddingBottom: '18px', borderBottom: '1px solid #e2e5e3' },
  statNum: { fontSize: '24px', fontWeight: 700, display: 'block', lineHeight: 1.1 },
  statLab: { fontSize: '12px', color: '#8b959b' },
  gapNum: { color: '#b3261e' },
  section: { fontSize: '15px', fontWeight: 700, margin: '26px 0 8px' },
  row: { display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '10px 0', borderBottom: '1px solid #eef0ee', fontSize: '13px' },
  code: { fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '11.5px', color: '#5a666e' },
  gap: { color: '#b3261e', fontWeight: 600 },
  btn: { font: 'inherit', fontSize: '12px', padding: '4px 10px', borderRadius: '4px', border: '1px solid #101619', background: 'transparent', cursor: 'pointer' },
  empty: { color: '#8b959b', fontSize: '13px', padding: '14px 0' },
};

function stat(value, label, isGap) {
  return h('div', { key: label }, h('b', { style: isGap && value > 0 ? { ...S.statNum, ...S.gapNum } : S.statNum }, String(value)), h('span', { style: S.statLab }, label));
}

export function CollabPage() {
  const [state, setState] = useState(null);
  const [err, setErr] = useState('');

  const load = useCallback(() => {
    fetch('/collab/api/state', { headers: { accept: 'application/json' } })
      .then((r) => r.json())
      .then(setState)
      .catch((e) => setErr(String(e.message || e)));
  }, []);
  useEffect(load, [load]);

  const review = useCallback((task, decision) => {
    fetch('/collab/api/review', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ task, decision, reviewer: 'human' }),
    }).then(load);
  }, [load]);

  if (err) return h('div', { style: S.page }, h('p', { style: { color: '#b3261e' } }, `读不到证据记录：${err}`));
  if (!state) return h('div', { style: S.page }, h('p', { style: S.sub }, '读取中…'));

  const gaps = state.gaps || [];
  return h('div', { style: S.page },
    h('h1', { style: S.h1 }, '证据链'),
    h('p', { style: S.sub }, `${state.events} 条记录 · 起点 ${state.root}`),
    h('div', { style: S.stats },
      stat(gaps.length, '未证明', true),
      stat((state.tasks || []).length, '任务'),
      stat((state.evidence || []).length, '证据尝试'),
      stat((state.reviews || []).length, '验收决策'),
    ),
    h('h2', { style: S.section }, '任务'),
    (state.tasks || []).length === 0
      ? h('p', { style: S.empty }, '还没有捕获到任务。跑一次带子 agent 的会话，或者用 POST /collab/api/evidence 手动写入。')
      : (state.tasks || []).map((t) => h('div', { key: t.id, style: S.row },
          h('div', null, h('b', null, t.id), ' ', h('span', { style: S.code }, t.status || '')),
          h('div', null,
            h('span', { style: S.code }, `证据 ${t.evidence} · 交接 ${t.handoffs} · ${t.review ? t.review.decision : '未验收'}`),
            ' ',
            h('button', { style: S.btn, onClick: () => review(t.id, 'accepted') }, '接受'),
            ' ',
            h('button', { style: S.btn, onClick: () => review(t.id, 'changes_requested') }, '要求修改'),
          ),
        )),
    h('h2', { style: S.section }, '未证明清单'),
    gaps.length === 0
      ? h('p', { style: S.empty }, '没有未证明项。')
      : gaps.map((g, i) => h('div', { key: i, style: S.row },
          h('div', null, h('span', { style: S.gap }, g.value), ' ', h('span', { style: S.code }, g.path)),
          h('div', { style: { color: '#5a666e', fontSize: '12px' } }, g.why),
        )),
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
