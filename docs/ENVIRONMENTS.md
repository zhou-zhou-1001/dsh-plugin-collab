# 目录与环境说明

> 今天一天下来堆了不少东西，这份文件负责让它不再像垃圾场。
> 规则：**临时的走 /tmp，留着的进 ~/Developer，每个都是干什么的写清楚。**

## 有用的

| 路径 | 是什么 | 能不能删 |
|---|---|---|
| `~/Developer/dsh-plugin-collab` | **主项目**。CairnWeave × DSH 插件 | ❌ 不能 |
| `~/Developer/dsh-latest` | DSH 0.2.2-rc.3 源码副本（只读参考，用来查 API） | ✅ 可删，重拉即可 |
| `~/Developer/agent-integrity-guard` | CairnWeave 本体。插件要复用的 store / digest 规则都在这 | ❌ 不能 |
| `~/.dsh` | 你真实的 DSH 环境 | ❌ 不能 |
| `~/.dsh.bak-20261115-1205` | 升级 CLI 前的备份（28K） | 观察几天再删 |

## 今天试过、已经放弃的

| 路径 | 是什么 | 处理 |
|---|---|---|
| `~/Developer/proofboard` | 中间产物：误做的独立 Web 应用（Node + React）。方向已废 | 留着当参考，随时可删 |
| `~/.openclaw/workspace/projects/proof-board` | 更早的静态 HTML 版 | 可删 |

## 隔离测试环境（按需重建，不常驻）

```sh
export DSH_HOME=/tmp/dsh-collab-test      # 用完就删，不污染 ~/.dsh
dsh plugin --profile web list             # 初始化
dsh plugin --profile web add file:~/Developer/dsh-plugin-collab
# cordis.patch.yml 加 insert 行
dsh web --port 3098 --no-open
```

今天跑完已经全部清掉（进程和 /tmp 目录都清了）。

## 清理习惯

- 测试一律 `DSH_HOME=/tmp/...`，结束 `kill` + `rm -rf`
- 不要从任意目录直接 `dsh web`：以前插件把证据目录写到了启动目录，已改成配置指定
- 日志写 `/tmp/xxx.log`，不堆在项目里
- 每次换方向，旧目录在本文档里降级成「已放弃」，不默默留着
