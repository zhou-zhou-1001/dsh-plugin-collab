# 测试记录（2026-11-15）

## 第 1 轮：单元测试

```
npm test  →  7/7 通过
```

覆盖：写文件工具算出 digest / 只读工具不算证据 / 失败结果不编造 digest /
三个路由注册 / 子 agent 生命周期 / 普通会话不误判 / 磁盘为准（文件被删后 state 归零）。

## 第 2 轮：市场安装（全新环境）

```
全新 DSH_HOME → 初始化 profile
dsh plugin add git+https://github.com/zhou-zhou-1001/dsh-plugin-collab.git#18f854f4
→ 5.8 秒装完 0.0.3
→ /collab/api/state 200
→ POST /collab/api/evidence 201
```

结论：不依赖本机目录结构，任何人可装。

## 第 3 轮：桌面端界面

```
重启桌面端 → 侧栏 collab → 页面渲染
state events=0（与磁盘一致）
空状态文案正常，横向溢出 0
```

## 第 4 轮：桌面端真实会话采集

```
在桌面端发任务「创建 regression.md，内容 ok，用写文件工具」
→ 会话完成
→ events.ndjson 出现 1 条 evidence.attempt，tool=write，artifact 有 digest
→ 界面显示 events=1、evidence=1
```

## 修掉的 bug（本轮发现）

**内存与磁盘不一致**：外部删除 `events.ndjson` 后，界面仍显示 5 条旧记录，磁盘只有 1 条。
原因：日志以内存为准。修法：`state` 前比对文件 size+mtime，不一致就重读；补了对应单元测试。

## 已知限制

- 默认证据目录是 `~/.cairnweave`，**同一台机器的多个 profile 共用一个台账**。多 profile 混用时任务会混在一起；需要隔离就在 profile 的 `cordis.patch.yml` 里覆盖 `collab` 的 `config.root`。
- 桌面端目前是 `link:` 安装（指向本地仓库），市场安装路径已在第 2 轮用命令行验证；桌面端 Discover 的「安装」按钮尚未点过（条目显示为已安装）。
