# dsh-plugin-collab

CairnWeave 的 DeepSeek Harness 插件：把「谁产出了什么、谁验的、能不能复算」放进 DSH 的 Web GUI。

- 设计口径：[docs/DESIGN.md](docs/DESIGN.md)
- 现状：v0.1 spike，宿主路由 + 前端页面 + NDJSON 证据日志已通

## 结构

```
src/index.js     宿主插件：证据日志 + /collab/api 路由
src/client.js    客户端插件源码（手写闭包工厂，见下方说明）
lib/             实际被加载的产物（src 改完 cp 过去）
```

## 接口

| 方法 | 路径 | 作用 |
|---|---|---|
| GET | /collab/api/state | 任务、证据、验收、未证明清单 |
| POST | /collab/api/evidence | 写一条证据（带 artifact 会算 sha256） |
| POST | /collab/api/review | 记录验收决策 accepted / rejected / changes_requested / inconclusive |

## 在隔离环境里试

```sh
export DSH_HOME=/tmp/dsh-collab-test
dsh plugin --profile web list
dsh plugin --profile web add file:$PWD
# cordis.patch.yml 里加：
#   - insert:
#       - id: collab
#         name: dsh-plugin-collab
dsh web --port 3098 --no-open
```

## 为什么手写 client 产物

DSH 的 client bundle 必须是 `window.__ModuleLoader__.load({id, factory})` 闭包工厂格式，仓库里的 tsdown preset 依赖 monorepo 内部模块，第三方拿不到。v0.1 直接手写产物；下一步换 esbuild 打包 + 套壳，形状不变。
