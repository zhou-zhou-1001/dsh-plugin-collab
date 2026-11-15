# dsh-plugin-collab

CairnWeave 的 DeepSeek Harness 插件：把「谁产出了什么、谁验的、能不能复算」放进 DSH 的 Web GUI。

- 设计口径：[docs/DESIGN.md](docs/DESIGN.md)
- 现状：v0.1 spike，宿主路由 + 前端页面 + NDJSON 证据日志已通

## 结构

```
src/index.js       宿主插件：证据日志 + /collab/api 路由
src/client.js       客户端插件（ESM 源码）
scripts/build.mjs   构建：拷贝宿主 + esbuild 打包客户端并套闭包工厂外壳
lib/                产物（npm run build 生成，不要手改）
test/               采集逻辑测试（node --test）
```

## 接口

| 方法 | 路径 | 作用 |
|---|---|---|
| GET | /collab/api/state | 任务、证据、验收、未证明清单 |
| POST | /collab/api/evidence | 写一条证据（带 artifact 会算 sha256） |
| POST | /collab/api/review | 记录验收决策 accepted / rejected / changes_requested / inconclusive |

## 安装（bundle 形态）

包已声明 `dsh.bundle`，装上去就自动成为 profile 层，不需要手写 patch：

```sh
dsh plugin --profile web add <包名或本地路径>
```

证据目录默认 `~/.cairnweave`，要改就在 profile 的 `cordis.patch.yml` 里覆盖 `collab` 行的 `config.root`。

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

## 构建

```sh
npm install
npm run build   # src → lib
npm test        # 采集逻辑测试
```

DSH 的 client bundle 必须是 `window.__ModuleLoader__.load({id, factory})` 闭包工厂格式，仓库里的 tsdown preset 依赖 monorepo 内部模块，第三方拿不到，所以用 esbuild 打包后自己套壳（见 `scripts/build.mjs`）。
