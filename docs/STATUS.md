# 当前状态（2026-11-15 15:10）

## 已完成并有证据

| 项 | 证据 |
|---|---|
| 第三方插件挂进 profile | 宿主 `apply()` 执行，日志 `[collab] mounted` |
| 侧栏入口 + 全屏页（B 方案） | `main` keyed 槽位注册，页面渲染「证据链」 |
| 证据写入 / NDJSON 落盘 | `events.ndjson` 实际写入 |
| digest 来自 CairnWeave | `import { digest } from 'cairnweave/artifact-store'`，三组数据新旧实现一致 |
| 采集按真实事件结构 | `tool/call` 存 callId→name，`tool/result` 回连；源码依据 `packages/core/session/src/types.ts` |
| 子 agent 生命周期采集 | `session/created` + `session/disposed`，按 `header.origin==='subagent'` 判定 |
| 构建脚本 | `npm run build` → 宿主 14KB 自包含 / 客户端 6.9KB 闭包工厂 |
| 测试 | `npm test` 6/6 通过 |
| 打包可安装 | `npm pack` → 新 profile `dsh plugin add *.tgz` → 页面正常 |

## 未验证 / 阻塞

| 项 | 卡在哪 |
|---|---|
| 真实会话采集 | 本机缺 DeepSeek 凭据（`~/.dsh/.credentials.yaml` 为空，openclaw 配置里 deepseek provider 没有 apiKey），`dsh headless` 直接 `MISSING_CREDENTIAL` |
| 子 agent 采集的真实事件顺序 | 同上，只有单元测试，没有真跑过 |
| 插件市场分发 | 需要有 `dsh.bundle` 声明（当前是 plain dependency），以及一个 index 条目 |

## 关键决定

1. **不 fork DSH**：只做仓外插件。
2. **CairnWeave 构建期内联**：`file:` 依赖别人装不上，宿主半边打包时把 digest 规则内联，运行期零外部依赖。
3. **客户端手写闭包工厂外壳**：DSH 的 tsdown preset 第三方拿不到，用 esbuild + 自套壳替代。
4. **证据不写 session log**：`plugin:` 记录是实验接口且有调用者限制，直接写 `.cairnweave/events.ndjson`，可脱离 DSH 审计。

## 下一步

1. 拿到可用凭据后，跑真实会话，核对采集条数与 catalog 一致
2. 加 `dsh.bundle` 声明，让别人 `dsh plugin add` 后自动成为 profile 层
3. 接插件市场 index
