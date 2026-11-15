import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../agent-integrity-guard/artifact-store.js
var require_artifact_store = __commonJS({
  "../agent-integrity-guard/artifact-store.js"(exports, module) {
    "use strict";
    var fsp = __require("node:fs/promises");
    var path2 = __require("node:path");
    var { createHash } = __require("node:crypto");
    var STORE_VERSION = 1;
    var STORE_SCHEMA = "agent-integrity-guard/artifact-envelope";
    function canonical(value) {
      if (value === null || typeof value !== "object") return JSON.stringify(value);
      if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
      return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
    }
    function digest(artifact) {
      return createHash("sha256").update(canonical(artifact)).digest("hex");
    }
    function makeEnvelope(artifact) {
      if (!artifact || typeof artifact !== "object" || Array.isArray(artifact)) throw new TypeError("artifact must be an object");
      return { version: STORE_VERSION, schema: STORE_SCHEMA, artifact: structuredClone(artifact), integrity: { algorithm: "sha256", digest: digest(artifact) } };
    }
    function validateEnvelope(envelope) {
      if (!envelope || typeof envelope !== "object" || envelope.version !== STORE_VERSION || envelope.schema !== STORE_SCHEMA) throw new Error(`unsupported artifact envelope (expected version ${STORE_VERSION})`);
      if (!envelope.artifact || typeof envelope.artifact !== "object" || Array.isArray(envelope.artifact)) throw new TypeError("artifact envelope payload is invalid");
      if (!envelope.integrity || envelope.integrity.algorithm !== "sha256" || typeof envelope.integrity.digest !== "string") throw new TypeError("artifact envelope integrity is invalid");
      if (digest(envelope.artifact) !== envelope.integrity.digest) throw new Error("artifact integrity mismatch");
      return structuredClone(envelope.artifact);
    }
    async function saveArtifact(filePath, artifact) {
      if (typeof filePath !== "string" || filePath.trim() === "") throw new TypeError("filePath must be non-empty");
      const destination = path2.resolve(filePath);
      const envelope = makeEnvelope(artifact);
      const temporary = `${destination}.tmp-${process.pid}-${Date.now()}`;
      await fsp.mkdir(path2.dirname(destination), { recursive: true });
      try {
        await fsp.writeFile(temporary, `${JSON.stringify(envelope, null, 2)}
`, { encoding: "utf8", mode: 384 });
        await fsp.rename(temporary, destination);
        return structuredClone(envelope);
      } catch (error) {
        await fsp.rm(temporary, { force: true }).catch(() => {
        });
        throw error;
      }
    }
    async function loadArtifact(filePath) {
      if (typeof filePath !== "string" || filePath.trim() === "") throw new TypeError("filePath must be non-empty");
      let envelope;
      try {
        envelope = JSON.parse(await fsp.readFile(path2.resolve(filePath), "utf8"));
      } catch (error) {
        if (error instanceof SyntaxError) throw new Error("artifact envelope is not valid JSON");
        throw error;
      }
      return validateEnvelope(envelope);
    }
    module.exports = { STORE_VERSION, STORE_SCHEMA, canonical, digest, makeEnvelope, validateEnvelope, saveArtifact, loadArtifact };
  }
});

// src/index.js
var import_artifact_store = __toESM(require_artifact_store(), 1);
import { appendFile, mkdir, readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
var name = "collab-evidence";
var inject = ["webServer", "sessions"];
var DIR_NAME = ".cairnweave";
var ROUTE_PREFIX = "/collab/api";
function nowIso() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
var EvidenceLog = class {
  constructor(root) {
    this.dir = path.join(root, DIR_NAME);
    this.file = path.join(this.dir, "events.ndjson");
    this.records = [];
    this.ready = this.load();
  }
  async load() {
    await mkdir(this.dir, { recursive: true });
    try {
      const text = await readFile(this.file, "utf8");
      this.records = text.split("\n").filter(Boolean).flatMap((line) => {
        try {
          return [JSON.parse(line)];
        } catch {
          return [];
        }
      });
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  async append(record) {
    await this.ready;
    const row = { at: nowIso(), ...record };
    try {
      await appendFile(this.file, `${JSON.stringify(row)}
`, "utf8");
      this.records.push(row);
      return row;
    } catch (error) {
      console.error(`[collab] evidence append failed: ${error.message}`);
      return null;
    }
  }
  // 未证明 = 声称有产出但拿不出可复算物件，或验收人是产出人自己
  gaps() {
    const out = [];
    for (const r of this.records) {
      if (r.kind === "evidence.attempt" && !r.artifact?.digest) {
        out.push({
          path: `evidence:${r.id || r.task || "?"}`,
          value: r.tool || "unknown tool",
          why: "\u6709\u4EA7\u51FA\u58F0\u660E\uFF0C\u4F46\u6CA1\u6709 digest \u6216\u53EF\u590D\u7B97\u7269\u4EF6\u3002"
        });
      }
      if (r.kind === "reviewed" && r.reviewer && r.producer && r.reviewer === r.producer) {
        out.push({
          path: `review:${r.task}`,
          value: "self_review",
          why: "\u9A8C\u6536\u4EBA\u4E0E\u4EA7\u51FA\u4EBA\u76F8\u540C\uFF0C\u6309\u89C4\u5219\u4E0D\u8BA1\u5165\u300C\u5DF2\u9A8C\u6536\u300D\u3002"
        });
      }
      if (r.kind === "reviewed" && r.decision === "inconclusive") {
        out.push({ path: `review:${r.task}`, value: "inconclusive", why: "\u9A8C\u6536\u7ED3\u8BBA\u662F\u300C\u8BC1\u636E\u4E0D\u8DB3\u300D\u3002" });
      }
    }
    return out;
  }
  state() {
    const tasks = /* @__PURE__ */ new Map();
    for (const r of this.records) {
      const id = r.task || r.childSessionId || "unknown";
      if (!tasks.has(id)) tasks.set(id, { id, status: "unknown", producer: null, handoffs: 0, evidence: 0, review: null });
      const t = tasks.get(id);
      if (r.kind === "task.started") t.status = "running";
      if (r.kind === "handoff") {
        t.status = r.status || "handed-off";
        t.handoffs += 1;
      }
      if (r.kind === "evidence.attempt") {
        t.evidence += 1;
        t.producer = r.agent || t.producer;
      }
      if (r.kind === "reviewed") t.review = { decision: r.decision, reviewer: r.reviewer, at: r.at };
    }
    return {
      root: this.dir,
      generatedAt: nowIso(),
      tasks: [...tasks.values()],
      evidence: this.records.filter((r) => r.kind === "evidence.attempt"),
      reviews: this.records.filter((r) => r.kind === "reviewed"),
      events: this.records.length,
      gaps: this.gaps()
    };
  }
};
function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  res.end(payload);
}
async function readJson(req, limit = 1024 * 512) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new Error("payload too large");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}
function apply(ctx, config = {}) {
  const root = config.root || path.join(os.homedir(), ".cairnweave");
  const log = new EvidenceLog(root);
  const disposers = [];
  const pendingCalls = /* @__PURE__ */ new Map();
  const WRITE_TOOLS = /write|edit|patch|apply|create|bash|shell/i;
  const PATH_KEYS = ["path", "file_path", "filePath", "filename", "target"];
  function digestFile(p) {
    try {
      const content = readFileSync(p, "utf8");
      return { path: p, digest: (0, import_artifact_store.digest)({ path: p, content }) };
    } catch {
      return null;
    }
  }
  function digestFromArguments(argsText) {
    if (!argsText) return null;
    let args;
    try {
      args = JSON.parse(argsText);
    } catch {
      return null;
    }
    for (const key of PATH_KEYS) {
      const value = args?.[key];
      if (typeof value === "string" && value.trim()) {
        const hit = digestFile(value);
        if (hit) return hit;
      }
    }
    return null;
  }
  {
    disposers.push(ctx.on("session/event", (session, event) => {
      try {
        const sessionId = session?.id || "unknown";
        if (event?.type === "tool/call") {
          const d2 = event.data || {};
          pendingCalls.set(`${sessionId}:${d2.callId}`, { name: d2.name, arguments: d2.arguments, turn: d2.turn });
          return;
        }
        if (event?.type !== "tool/result") return;
        const d = event.data || {};
        const callId = d.message?.toolCallId;
        const call = pendingCalls.get(`${sessionId}:${callId}`) || {};
        pendingCalls.delete(`${sessionId}:${callId}`);
        const tool = call.name || "unknown";
        if (!WRITE_TOOLS.test(tool)) return;
        const artifact = d.message?.isError ? null : digestFromArguments(call.arguments);
        void log.append({
          kind: "evidence.attempt",
          sessionId,
          tool,
          agent: "main",
          artifact,
          source: { event: "tool/result", seq: event.seq, callId, turn: d.turn, failed: !!d.message?.isError }
        });
      } catch (error) {
        console.error(`[collab] capture error: ${error.message}`);
      }
    }));
  }
  function taskFromSession(session) {
    const header = session?.header || {};
    if (header.origin !== "subagent") return null;
    return {
      task: session.id,
      parent: header.parentSession || null,
      depth: header.delegationDepth || 1
    };
  }
  disposers.push(ctx.on("session/created", (session) => {
    try {
      const info = taskFromSession(session);
      if (!info) return;
      void log.append({ kind: "task.started", ...info, agent: "subagent" });
    } catch (error) {
      console.error(`[collab] session/created capture error: ${error.message}`);
    }
  }));
  disposers.push(ctx.on("session/disposed", (session) => {
    try {
      const info = taskFromSession(session);
      if (!info) return;
      void log.append({ kind: "handoff", ...info, agent: "subagent", status: "completed" });
    } catch (error) {
      console.error(`[collab] session/disposed capture error: ${error.message}`);
    }
  }));
  disposers.push(ctx.webServer.register({
    path: `${ROUTE_PREFIX}/state`,
    kind: "prefix",
    auth: "required",
    async handler(req, res) {
      if (req.method !== "GET") return json(res, 405, { error: "method not allowed" });
      await log.ready;
      json(res, 200, log.state());
    }
  }));
  disposers.push(ctx.webServer.register({
    path: `${ROUTE_PREFIX}/review`,
    kind: "exact",
    auth: "required",
    async handler(req, res) {
      if (req.method !== "POST") return json(res, 405, { error: "method not allowed" });
      let body;
      try {
        body = await readJson(req);
      } catch (error) {
        return json(res, 400, { error: error.message });
      }
      const allowed = ["accepted", "rejected", "changes_requested", "inconclusive"];
      if (!allowed.includes(body.decision)) {
        return json(res, 422, { error: `decision must be one of ${allowed.join(", ")}` });
      }
      const row = await log.append({
        kind: "reviewed",
        task: body.task,
        decision: body.decision,
        reviewer: body.reviewer || "human",
        producer: body.producer || null,
        note: body.note || ""
      });
      json(res, row ? 201 : 500, row || { error: "append failed" });
    }
  }));
  disposers.push(ctx.webServer.register({
    path: `${ROUTE_PREFIX}/evidence`,
    kind: "exact",
    auth: "required",
    async handler(req, res) {
      if (req.method !== "POST") return json(res, 405, { error: "method not allowed" });
      let body;
      try {
        body = await readJson(req);
      } catch (error) {
        return json(res, 400, { error: error.message });
      }
      const artifact = body.artifact || null;
      const row = await log.append({
        kind: "evidence.attempt",
        task: body.task,
        tool: body.tool || "manual",
        agent: body.agent || "main",
        artifact: artifact ? { path: artifact.path, digest: (0, import_artifact_store.digest)(artifact) } : null,
        source: { event: "manual" }
      });
      json(res, row ? 201 : 500, row || { error: "append failed" });
    }
  }));
  ctx.effect(() => () => {
    for (const dispose of disposers) dispose();
  }, "collab: routes");
}
export {
  apply,
  inject,
  name
};
