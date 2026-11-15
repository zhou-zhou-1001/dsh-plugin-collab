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
var S = {
  page: { padding: "32px 40px", fontFamily: "-apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif", color: "#101619", maxWidth: "1100px" },
  h1: { fontSize: "26px", margin: "0 0 6px", letterSpacing: "-0.4px" },
  sub: { color: "#5a666e", fontSize: "13px", margin: "0 0 24px" },
  stats: { display: "flex", gap: "28px", margin: "0 0 28px", paddingBottom: "18px", borderBottom: "1px solid #e2e5e3" },
  statNum: { fontSize: "24px", fontWeight: 700, display: "block", lineHeight: 1.1 },
  statLab: { fontSize: "12px", color: "#8b959b" },
  gapNum: { color: "#b3261e" },
  section: { fontSize: "15px", fontWeight: 700, margin: "26px 0 8px" },
  row: { display: "flex", justifyContent: "space-between", gap: "12px", padding: "10px 0", borderBottom: "1px solid #eef0ee", fontSize: "13px" },
  code: { fontFamily: "ui-monospace, Menlo, monospace", fontSize: "11.5px", color: "#5a666e" },
  gap: { color: "#b3261e", fontWeight: 600 },
  btn: { font: "inherit", fontSize: "12px", padding: "4px 10px", borderRadius: "4px", border: "1px solid #101619", background: "transparent", cursor: "pointer" },
  empty: { color: "#8b959b", fontSize: "13px", padding: "14px 0" }
};
function stat(value, label, isGap) {
  return (0, import_react.createElement)("div", { key: label }, (0, import_react.createElement)("b", { style: isGap && value > 0 ? { ...S.statNum, ...S.gapNum } : S.statNum }, String(value)), (0, import_react.createElement)("span", { style: S.statLab }, label));
}
function CollabPage() {
  const [state, setState] = (0, import_react.useState)(null);
  const [err, setErr] = (0, import_react.useState)("");
  const load = (0, import_react.useCallback)(() => {
    fetch("/collab/api/state", { headers: { accept: "application/json" } }).then((r) => r.json()).then(setState).catch((e) => setErr(String(e.message || e)));
  }, []);
  (0, import_react.useEffect)(load, [load]);
  const review = (0, import_react.useCallback)((task, decision) => {
    fetch("/collab/api/review", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ task, decision, reviewer: "human" })
    }).then(load);
  }, [load]);
  if (err) return (0, import_react.createElement)("div", { style: S.page }, (0, import_react.createElement)("p", { style: { color: "#b3261e" } }, `\u8BFB\u4E0D\u5230\u8BC1\u636E\u8BB0\u5F55\uFF1A${err}`));
  if (!state) return (0, import_react.createElement)("div", { style: S.page }, (0, import_react.createElement)("p", { style: S.sub }, "\u8BFB\u53D6\u4E2D\u2026"));
  const gaps = state.gaps || [];
  return (0, import_react.createElement)(
    "div",
    { style: S.page },
    (0, import_react.createElement)("h1", { style: S.h1 }, "\u8BC1\u636E\u94FE"),
    (0, import_react.createElement)("p", { style: S.sub }, `${state.events} \u6761\u8BB0\u5F55 \xB7 \u8D77\u70B9 ${state.root}`),
    (0, import_react.createElement)(
      "div",
      { style: S.stats },
      stat(gaps.length, "\u672A\u8BC1\u660E", true),
      stat((state.tasks || []).length, "\u4EFB\u52A1"),
      stat((state.evidence || []).length, "\u8BC1\u636E\u5C1D\u8BD5"),
      stat((state.reviews || []).length, "\u9A8C\u6536\u51B3\u7B56")
    ),
    (0, import_react.createElement)("h2", { style: S.section }, "\u4EFB\u52A1"),
    (state.tasks || []).length === 0 ? (0, import_react.createElement)("p", { style: S.empty }, "\u8FD8\u6CA1\u6709\u6355\u83B7\u5230\u4EFB\u52A1\u3002\u8DD1\u4E00\u6B21\u5E26\u5B50 agent \u7684\u4F1A\u8BDD\uFF0C\u6216\u8005\u7528 POST /collab/api/evidence \u624B\u52A8\u5199\u5165\u3002") : (state.tasks || []).map((t) => (0, import_react.createElement)(
      "div",
      { key: t.id, style: S.row },
      (0, import_react.createElement)("div", null, (0, import_react.createElement)("b", null, t.id), " ", (0, import_react.createElement)("span", { style: S.code }, t.status || "")),
      (0, import_react.createElement)(
        "div",
        null,
        (0, import_react.createElement)("span", { style: S.code }, `\u8BC1\u636E ${t.evidence} \xB7 \u4EA4\u63A5 ${t.handoffs} \xB7 ${t.review ? t.review.decision : "\u672A\u9A8C\u6536"}`),
        " ",
        (0, import_react.createElement)("button", { style: S.btn, onClick: () => review(t.id, "accepted") }, "\u63A5\u53D7"),
        " ",
        (0, import_react.createElement)("button", { style: S.btn, onClick: () => review(t.id, "changes_requested") }, "\u8981\u6C42\u4FEE\u6539")
      )
    )),
    (0, import_react.createElement)("h2", { style: S.section }, "\u672A\u8BC1\u660E\u6E05\u5355"),
    gaps.length === 0 ? (0, import_react.createElement)("p", { style: S.empty }, "\u6CA1\u6709\u672A\u8BC1\u660E\u9879\u3002") : gaps.map((g, i) => (0, import_react.createElement)(
      "div",
      { key: i, style: S.row },
      (0, import_react.createElement)("div", null, (0, import_react.createElement)("span", { style: S.gap }, g.value), " ", (0, import_react.createElement)("span", { style: S.code }, g.path)),
      (0, import_react.createElement)("div", { style: { color: "#5a666e", fontSize: "12px" } }, g.why)
    ))
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
