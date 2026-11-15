window.__ModuleLoader__.load({
  id: "dsh-plugin-collab",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client.js
var client_exports = {};
__export(client_exports, {
  CollabIcon: () => CollabIcon,
  CollabPage: () => CollabPage,
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(client_exports);
var import_react = require("react");
var css = `
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
var themeVars = `
.cw-root { --cw-danger: #e5484d; --cw-danger-wash: rgba(229,72,77,0.12);
  --cw-ok: #30a46c; --cw-ok-wash: rgba(48,164,108,0.14);
  --cw-warn: #d97706; --cw-warn-wash: rgba(217,119,6,0.14); }
`;
var styleInjected = false;
function ensureStyle() {
  if (styleInjected || typeof document === "undefined") return;
  const tag = document.createElement("style");
  tag.dataset.plugin = "dsh-plugin-collab";
  tag.textContent = themeVars + css;
  document.head.appendChild(tag);
  styleInjected = true;
}
function Stat({ value, label, danger }) {
  return (0, import_react.createElement)(
    "div",
    { className: "cw-stat" },
    (0, import_react.createElement)("b", { className: danger && value > 0 ? "cw-stat-num is-gap" : "cw-stat-num" }, String(value)),
    (0, import_react.createElement)("span", { className: "cw-stat-label" }, label)
  );
}
function TaskRow({ task, onReview }) {
  const decided = task.review ? task.review.decision : null;
  const chip = task.evidence === 0 ? (0, import_react.createElement)("span", { className: "cw-chip gap" }, "\u65E0\u8BC1\u636E") : decided === "accepted" ? (0, import_react.createElement)("span", { className: "cw-chip ok" }, "\u5DF2\u9A8C\u6536") : (0, import_react.createElement)("span", { className: "cw-chip pending" }, decided || "\u5F85\u9A8C\u6536");
  return (0, import_react.createElement)(
    "div",
    { className: "cw-task" },
    (0, import_react.createElement)(
      "div",
      { className: "cw-task-main" },
      (0, import_react.createElement)("div", { className: "cw-task-id" }, task.id),
      (0, import_react.createElement)(
        "div",
        { className: "cw-task-meta" },
        `\u8BC1\u636E ${task.evidence} \xB7 \u4EA4\u63A5 ${task.handoffs}${task.parent ? " \xB7 \u6765\u6E90 " + task.parent : ""}`
      )
    ),
    chip,
    (0, import_react.createElement)(
      "div",
      { className: "cw-actions" },
      (0, import_react.createElement)("button", { className: "cw-btn", onClick: () => onReview(task.id, "accepted") }, "\u63A5\u53D7"),
      (0, import_react.createElement)("button", { className: "cw-btn", onClick: () => onReview(task.id, "changes_requested") }, "\u8981\u6C42\u4FEE\u6539")
    )
  );
}
function EvidenceRow({ item }) {
  const [open, setOpen] = (0, import_react.useState)(false);
  const digest = item.artifact?.digest;
  return (0, import_react.createElement)(
    "div",
    { className: "cw-ev" },
    (0, import_react.createElement)(
      "button",
      { className: "cw-ev-head", onClick: () => setOpen((v) => !v), "aria-expanded": open },
      (0, import_react.createElement)("span", null, open ? "\u25BE" : "\u25B8"),
      (0, import_react.createElement)("span", { className: "cw-ev-tool" }, item.tool || "unknown"),
      (0, import_react.createElement)("span", { className: "cw-chip " + (digest ? "ok" : "gap") }, digest ? "\u6709 digest" : "\u65E0 digest"),
      (0, import_react.createElement)("span", { className: "cw-ev-digest" }, digest ? digest.slice(0, 16) + "\u2026" : (item.sessionId || "").slice(0, 12))
    ),
    open && (0, import_react.createElement)(
      "div",
      { className: "cw-ev-body" },
      (0, import_react.createElement)(
        "pre",
        { className: "cw-pre" },
        [
          `\u5DE5\u5177: ${item.tool || "\u2014"}`,
          `\u6765\u6E90: ${JSON.stringify(item.source || {})}`,
          item.artifact?.path ? `\u4EA7\u7269: ${item.artifact.path}` : "\u4EA7\u7269: \uFF08\u65E0\u53EF\u590D\u7B97\u7269\u4EF6\uFF09",
          digest ? `digest: ${digest}` : "digest: \u2014",
          "",
          item.detail ? `\u53C2\u6570/\u547D\u4EE4:
${item.detail}` : "\uFF08\u6CA1\u6709\u8BB0\u5F55\u53C2\u6570\uFF09"
        ].join("\n")
      )
    )
  );
}
function CollabPage() {
  ensureStyle();
  const [state, setState] = (0, import_react.useState)(null);
  const [err, setErr] = (0, import_react.useState)("");
  const load = (0, import_react.useCallback)(() => {
    fetch("/collab/api/state", { headers: { accept: "application/json" } }).then((r) => r.json()).then((next) => {
      setState(next);
      setErr("");
    }).catch((e) => setErr(String(e.message || e)));
  }, []);
  (0, import_react.useEffect)(() => {
    load();
    const timer = setInterval(load, 5e3);
    return () => clearInterval(timer);
  }, [load]);
  const review = (0, import_react.useCallback)((task, decision) => {
    fetch("/collab/api/review", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ task, decision, reviewer: "human" })
    }).then(load);
  }, [load]);
  const body = err ? (0, import_react.createElement)("div", { className: "cw-error" }, `\u8BFB\u4E0D\u5230\u8BC1\u636E\u8BB0\u5F55\uFF1A${err}`) : !state ? (0, import_react.createElement)("div", { className: "cw-empty" }, "\u8BFB\u53D6\u4E2D\u2026") : (0, import_react.createElement)(
    import_react.Fragment,
    null,
    (0, import_react.createElement)(
      "div",
      { className: "cw-stats" },
      (0, import_react.createElement)(Stat, { value: state.gaps.length, label: "\u672A\u8BC1\u660E", danger: true }),
      (0, import_react.createElement)(Stat, { value: state.tasks.length, label: "\u4EFB\u52A1" }),
      (0, import_react.createElement)(Stat, { value: state.evidence.length, label: "\u8BC1\u636E" }),
      (0, import_react.createElement)(Stat, { value: state.reviews.length, label: "\u9A8C\u6536" })
    ),
    (0, import_react.createElement)(
      "div",
      { className: "cw-section" },
      (0, import_react.createElement)("h2", null, "\u4EFB\u52A1"),
      (0, import_react.createElement)("span", { className: "cw-count" }, `${state.tasks.length} \u4E2A`)
    ),
    state.tasks.length === 0 ? (0, import_react.createElement)("div", { className: "cw-empty" }, "\u8FD8\u6CA1\u6709\u6355\u83B7\u5230\u4EFB\u52A1\u3002\u8DD1\u4E00\u6B21\u5E26\u5B50 agent \u7684\u4F1A\u8BDD\uFF0C\u6216\u7528 POST /collab/api/evidence \u624B\u52A8\u5199\u5165\u3002") : (0, import_react.createElement)("div", { className: "cw-list" }, state.tasks.map((t) => (0, import_react.createElement)(TaskRow, { key: t.id, task: t, onReview: review }))),
    (0, import_react.createElement)(
      "div",
      { className: "cw-section" },
      (0, import_react.createElement)("h2", null, "\u8BC1\u636E"),
      (0, import_react.createElement)("span", { className: "cw-count" }, `${state.evidence.length} \u6761`)
    ),
    state.evidence.length === 0 ? (0, import_react.createElement)("div", { className: "cw-empty" }, "\u8FD8\u6CA1\u6709\u8BC1\u636E\u8BB0\u5F55\u3002") : (0, import_react.createElement)("div", null, state.evidence.slice(-20).reverse().map((e, i) => (0, import_react.createElement)(EvidenceRow, { key: i, item: e }))),
    (0, import_react.createElement)(
      "div",
      { className: "cw-section" },
      (0, import_react.createElement)("h2", null, "\u672A\u8BC1\u660E\u6E05\u5355"),
      (0, import_react.createElement)("span", { className: "cw-count" }, `${state.gaps.length} \u9879`)
    ),
    state.gaps.length === 0 ? (0, import_react.createElement)("div", { className: "cw-empty" }, "\u6CA1\u6709\u672A\u8BC1\u660E\u9879\u3002") : (0, import_react.createElement)(
      "table",
      { className: "cw-table" },
      (0, import_react.createElement)("thead", null, (0, import_react.createElement)(
        "tr",
        null,
        (0, import_react.createElement)("th", null, "\u6765\u6E90\u5B57\u6BB5"),
        (0, import_react.createElement)("th", null, "\u503C"),
        (0, import_react.createElement)("th", null, "\u4E3A\u4EC0\u4E48\u7B97\u7F3A\u53E3")
      )),
      (0, import_react.createElement)("tbody", null, state.gaps.map((g, i) => (0, import_react.createElement)(
        "tr",
        { key: i },
        (0, import_react.createElement)("td", { className: "cw-col-path" }, g.path),
        (0, import_react.createElement)("td", { className: "cw-col-val" }, g.value),
        (0, import_react.createElement)("td", { className: "cw-col-why" }, g.why)
      )))
    )
  );
  return (0, import_react.createElement)(
    "div",
    { className: "cw-root" },
    (0, import_react.createElement)(
      "div",
      { className: "cw-page" },
      (0, import_react.createElement)(
        "div",
        { className: "cw-head" },
        (0, import_react.createElement)(
          "div",
          null,
          (0, import_react.createElement)("h1", { className: "cw-title" }, "\u8BC1\u636E\u94FE"),
          (0, import_react.createElement)(
            "p",
            { className: "cw-sub" },
            state ? `${state.events} \u6761\u8BB0\u5F55 \xB7 \u8D77\u70B9 ` : "\u8BFB\u53D6\u4E2D\u2026",
            state ? (0, import_react.createElement)("span", { className: "cw-path" }, state.root) : null
          )
        ),
        (0, import_react.createElement)("button", { className: "cw-btn", onClick: load }, "\u5237\u65B0")
      ),
      body
    )
  );
}
function CollabIcon({ size }) {
  const s = size || 16;
  return (0, import_react.createElement)(
    "svg",
    { width: s, height: s, viewBox: "0 0 16 16", fill: "none" },
    (0, import_react.createElement)("circle", { cx: 8, cy: 8, r: 5.5, stroke: "currentColor", strokeWidth: 1.4 }),
    (0, import_react.createElement)("circle", { cx: 8, cy: 8, r: 1.8, fill: "currentColor" })
  );
}
var inject = ["slots"];
function apply(ctx) {
  ctx.slots.inject("main", () => ctx.slots.register({ name: "main", key: "collab", inject: () => ({}) }, CollabPage));
  ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({ name: "sidebar.panellist", id: "collab", order: 30 }, CollabIcon));
}

    return module.exports;
  }
});
