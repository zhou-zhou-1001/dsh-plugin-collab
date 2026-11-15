# CairnWeave × DeepSeek Harness 插件设计 v0.1

> 状态：草案。写这份是为了先把「什么算证据」定死，再写代码。
> 口径没定就动手，后面一定返工。

## 1. 一句话定位

**DSH 负责跑 agent，CairnWeave 负责留痕和验收，本插件把证据放进 DSH 的 Web GUI。**

不做的事：

- 不做「另一个多 agent 协同展示」。DSH 0.2 已有 `ui-agent-team`（成员列表 + 共享任务板），那一块不碰。
- 不 fork 仓库、不改 DSH 本体，以仓外 npm 包 + profile 挂载接入。
- 不把展示数据写进 session log。展示是展示，模型可见的输入才需要 session event。

## 2. 三个面（界面结构，对应 B 方案）

侧栏一个入口 → `main` 槽位全屏页，页内三块：

| 面 | 回答的问题 | 数据来源 |
|---|---|---|
| 协同图 | 谁把活派给了谁，此刻谁在跑 | subagent catalog / activation |
| 任务流 | 每个 agent 手上有哪些活、交接了什么 | activation + 子 agent inbox |
| 证据层 | 产出挂了什么证据、谁验的、能不能复算 | CairnWeave（本插件写入） |

## 3. 采集口径（本文档的核心）

只有下面五类信号进 CairnWeave。其余一律不入库，宁缺勿滥。

| # | DSH 信号 | 采集点 | 生成记录 | 说明 |
|---|---|---|---|---|
| 1 | 子 agent 启动 | `startActivation` / catalog 新增 | `task.captured` + `task.started` | 记 parent、child、label、mode（local / acp / codex…） |
| 2 | 子 agent 结束 | `activation.result` 结算 | `handoff` | 带 result 的摘要与状态；失败也必须落一条 |
| 3 | tool 调用结果 | session event `tool/call` / `tool/result` | `evidence.attempt` | 只有**产生可复算产物**的才算证据；只读查询不算 |
| 4 | 文件产物 | 写文件类 tool 的成功结果 | `artifact` envelope | 内容 canonical 后算 sha256，落 `artifacts/` |
| 5 | 验收决策 | 人（或显式授权的父 agent）在页面上提交 | `reviewed` | 取值集合：`accepted` / `rejected` / `changes_requested` / `inconclusive` |

### 什么不算证据

这条要写死，否则会被「看起来像证据」的东西灌满：

- 自然语言总结（「已完成」「已验证通过」）
- 只读查询的结果（读文件、`ls`、搜索）
- agent 对自己产出的自评
- 没有 digest 的「产物存在」声明

一条记录要么带可复算物件（digest / 命令输出 / 截图），要么进「未证明清单」。

## 4. 三条硬规则

1. **产出方 ≠ 验收方。** 若验收人等于产出人，`reviewed` 记录只标 `self_review`，不计入「已验收」。
2. **未证明与已证明同等醒目。** 页面默认展开缺口，不许折叠成小字。
3. **digest 只证明一致性，不证明正确性。** 它防篡改，不防一开始就做错；文档和界面都不能暗示它能。

## 5. 架构

```
浏览器 (React, main 槽位)
   │  remote RPC
   ▼
宿主插件 (cordis service, 进程内)
   ├─ 订阅 session/* 与 subagent catalog
   ├─ 映射成 CairnWeave 记录（复用 agent-integrity-guard 的 relay / result-store / artifact-store）
   └─ 落盘：<workspace>/.cairnweave/{events.ndjson, artifacts/*.json}
```

- **无独立 daemon**：DSH 进程就是宿主，插件生命周期跟着 profile 走。
- **复用而非重写**：`agent-integrity-guard` 已在 `~/Developer/agent-integrity-guard`，六个 store/relay 模块直接引用，不复制实现。
- **失败降级**：CairnWeave 写失败不能让 DSH 会话崩。采集器所有写入包 try/catch，失败只记诊断，不影响 agent 运行。

## 6. 存储格式

```
.cairnweave/
├─ events.ndjson        一行一个事件，append-only
└─ artifacts/<sha256>.json    artifact envelope（含 integrity.digest）
```

events 行结构：

```json
{
  "at": "2026-11-15T12:30:00+08:00",
  "kind": "task.started | handoff | evidence.attempt | reviewed",
  "sessionId": "...",
  "parentSessionId": "...",
  "childSessionId": "...",
  "agent": "codex | acp | in-process",
  "task": "label",
  "decision": "accepted | rejected | changes_requested | inconclusive",
  "artifact": { "path": "...", "digest": "..." },
  "source": { "event": "tool/result", "ref": "..." }
}
```

## 7. 明确不做 / 待定

**不做（v0.1）**

- 不做跨机器同步、不做云端存储
- 不做自动验收（没有人工决策就一直是 `inconclusive`）
- 不做 replay / import
- 不做签名或密码学验证

**待定**

- 验收决策持久化位置：`.cairnweave/events.ndjson` 还是 DSH 的存储层？倾向前者（可脱离 DSH 单独审计）。
- 多 run 聚合口径：按 session 还是按 workspace？倾向按 workspace，session 作为一次 run。
- 是否需要给模型提供「查证据」的 tool：先不给，避免工具面膨胀。

## 8. 验收标准（本插件自己怎么算做完）

- 装进隔离 profile 后，侧栏出现入口、页面能打开
- 跑一次带子 agent 的会话，页面出现对应 task 与 handoff，条数与 catalog 一致
- 写一个文件产物，`artifacts/` 出现对应 envelope，digest 可复算
- 手动改坏一个 envelope，页面显示断链
- 卸载插件后 DSH 会话功能不受影响
