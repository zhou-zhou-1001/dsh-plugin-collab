# 发布到 DSH 插件市场

## 现状

索引文件已生成并通过官方校验器：

```
market/index.json  →  dsh-plugin-collab@0.0.2
安装 spec: git+https://github.com/zhou-zhou-1001/dsh-plugin-collab.git#<commit>
```

**唯一阻塞：仓库还不是公开可访问的。** 索引里的 `source.type=git` 要求一个公开仓库和精确 commit，否则用户点安装会失败。

## 三步发布

1. **公开仓库**
   ```sh
   gh repo create zhou-zhou-1001/dsh-plugin-collab --public --source=. --push
   ```
   （或手动在 GitHub 建空仓库再 `git remote add` + `push`）

2. **生成索引**
   ```sh
   node scripts/market-index.mjs        # 读 package.json 版本 + git HEAD
   ```

3. **托管 index.json**
   最简单：把 `market/` 推到仓库里，用 raw 地址：
   ```
   https://raw.githubusercontent.com/zhou-zhou-1001/dsh-plugin-collab/main/market/index.json
   ```
   或在 GitHub Pages 上放 `index.json`。

## 用户怎么装

DSH 桌面端或 web：插件 → 发现 → 添加索引源（上面的 URL）→ 搜到「协同证据台」→ 安装。

或者命令行（不需要索引）：
```sh
dsh plugin --profile web add git+https://github.com/zhou-zhou-1001/dsh-plugin-collab.git#<commit>
```

## 版本更新

改版本号 → `npm run build` → 提交 → `node scripts/market-index.mjs` → 推。索引里的 commit 必须与代码一致，否则装下去的是旧代码。

## 官方生成器（可选）

DSH 仓库自带 `apps/plugin-market-generator`，能从包名/Git URL 列表批量生成索引；我们是单个插件，手写脚本更直接。多插件时再换。
