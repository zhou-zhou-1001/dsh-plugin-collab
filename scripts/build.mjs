// 构建：宿主插件直接拷贝，客户端插件用 esbuild 打包后套上 DSH 要求的闭包工厂外壳。
// DSH 的 client bundle 必须是 window.__ModuleLoader__.load({id, factory}) 形式，
// 仓库内置的 tsdown preset 依赖 monorepo 内部模块，第三方拿不到，所以自己套壳。
import { build } from 'esbuild';
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.dirname(new URL(import.meta.url).pathname);
const pkgRoot = path.resolve(root, '..');
const pkg = JSON.parse(await readFile(path.join(pkgRoot, 'package.json'), 'utf8'));

await mkdir(path.join(pkgRoot, 'lib'), { recursive: true });

// 宿主半边：esbuild 打包成自包含 ESM。
// CairnWeave（digest 规则）在构建期内联进来——运行期不再依赖 file: 路径，
// 这样别人 pnpm add 这个包就能跑，不需要先有我们的目录结构。
const host = await build({
  entryPoints: [path.join(pkgRoot, 'src/index.js')],
  bundle: true,
  write: false,
  format: 'esm',
  platform: 'node',
  target: 'node22',
  external: ['@deepseek-ai/*'],
  // CairnWeave 是 CJS，内联进 ESM 后需要真的 require 才能拿到 node: 内建模块
  banner: {
    js: "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);",
  },
  logLevel: 'warning',
});
await writeFile(path.join(pkgRoot, 'lib/index.js'), host.outputFiles[0].text, 'utf8');

// 客户端半边：esbuild 打 CJS，外部依赖交给模块表
const result = await build({
  entryPoints: [path.join(pkgRoot, 'src/client.js')],
  bundle: true,
  write: false,
  format: 'cjs',
  platform: 'browser',
  target: 'es2022',
  jsx: 'transform',
  external: ['react', 'react-dom', 'react/jsx-runtime', '@deepseek-ai/*'],
  logLevel: 'warning',
});

const code = result.outputFiles[0].text;
const wrapped = `window.__ModuleLoader__.load({
  id: ${JSON.stringify(pkg.name)},
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
${code}
    return module.exports;
  }
});
`;

await writeFile(path.join(pkgRoot, 'lib/client.js'), wrapped, 'utf8');
const kb = (n) => `${(Buffer.byteLength(n) / 1024).toFixed(1)}KB`;
console.log(`built ${pkg.name}`);
console.log(`  lib/index.js   ${kb(await readFile(path.join(pkgRoot, 'lib/index.js')))}`);
console.log(`  lib/client.js  ${kb(wrapped)}`);
