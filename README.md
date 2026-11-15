# 协同证据台 · Collab Evidence Board

> 一个 DeepSeek Harness 插件。它回答一个问题：**这些活干完了，凭什么信？**

## 问题

让 agent 干活越来越容易，留下证据越来越难。

一次任务跑完，你看到的通常是它自己写的一句话：「已完成」「已验证」。但真正该问的是：

- 这是谁做的？主 agent 还是某个子 agent？
- 产出在哪？哪个文件、哪个版本？
- 别人能不能独立复算一遍，而不是听它自述？
- 谁验收的？验收人跟产出人是同一个吗？

这些答案现在散在会话记录、日志、文件系统里，没有一处能一眼看全。多 agent 协作时更糟——链路越长，越没人说得清哪一环是真的。

## 它做什么

装进 DSH 之后，侧栏多一个入口，点开是一个全屏的证据台账：

**采集**（自动，无需配置）
- 子 agent 的出生与结束（谁派给谁、第几层）
- 每一次会产生产物的工具调用
- 对产生的文件算 SHA-256，随时可以复算比对

**展示**
- 顶部四个数：未证明 / 任务 / 证据 / 验收
- 任务列表：来源、证据条数、验收状态
- 证据列表：点开看工具、参数、产物路径、完整 digest
- 未证明清单：哪些说法拿不出可复算物件，逐条列明来源字段

**验收**
- 人工对每个任务下决策：接受 / 要求修改
- 验收人与产出人相同时，不计入「已验收」

## 三条设计原则

1. **产出方 ≠ 验收方。** 自己说自己好，不算数。
2. **未证明与已证明同等醒目。** 缺口不会被折叠进角落。
3. **digest 只证明一致性，不证明正确性。** 它防篡改，不防一开始就做错。界面和文档都不暗示它能。

## 什么不算证据

这条是刻意写死的，否则页面会被「看起来像证据」的东西灌满：

- 自然语言总结（「已完成」「已验证通过」）
- 只读查询（读文件、搜索）
- agent 对自己的评价
- 没有 digest 的「产物存在」声明

一条记录要么带可复算物件，要么进未证明清单。

## 安装

```sh
# 命令行
dsh plugin --profile web add git+https://github.com/zhou-zhou-1001/dsh-plugin-collab.git
```

或桌面端：插件 → 发现 → 添加索引源 `https://raw.githubusercontent.com/zhou-zhou-1001/dsh-plugin-collab/main/market/index.json` → 搜「协同证据台」→ 安装。

装完重启，侧栏出现 `collab`。证据落在 `~/.cairnweave/events.ndjson`，纯文本，可脱离 DSH 单独审计。

## 数据长什么样

```json
{
  "at": "2026-11-15T08:16:00.520Z",
  "kind": "evidence.attempt",
  "sessionId": "session-46ca9f1e…",
  "tool": "write",
  "detail": "{\"file_path\": \"…/note-desktop.md\", \"content\": \"hello\\n\"}",
  "artifact": { "path": "…/note-desktop.md", "digest": "16a1823cd4bb40a4…" },
  "source": { "event": "tool/result", "seq": 28, "callId": "call_00_…", "turn": 1 }
}
```

digest 用 CairnWeave 的 canonical 规则（键名排序 + SHA-256）计算，同一份产物在任何地方算出来都一样。

## 边界

- 不改 DSH 本体，以仓外插件接入
- 不起独立守护进程：DSH 进程就是宿主
- 不做自动验收：没有人工决策就一直是 `待验收`
- 不做签名或密码学验证：digest 只保证一致性
- 不做云同步

## 它和 CairnWeave 的关系

本插件是 [CairnWeave](https://github.com/zhou-zhou-1001/cairnweave) 的一个消费者。CairnWeave 定义「证据怎么才算成立」（任务、交接、产物、验收的语义），插件负责在 DSH 里采集与呈现。

依赖方向是单向的：插件依赖 CairnWeave，反过来不成立。这样 CairnWeave 可以独立用于别的 harness。

## 开发

```sh
npm install
npm run build     # src → lib（宿主自包含打包，客户端套 DSH 闭包工厂外壳）
npm test          # 采集与路由的单元测试
npm run market    # 重新生成插件市场索引
```

工程细节见 `docs/DESIGN.md`（采集口径）、`docs/STATUS.md`（验收状态）、`docs/RELEASE.md`（发布流程）。
