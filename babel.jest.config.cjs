/**
 * Babel 配置 —— 仅供 Jest 转换 TS/ESM 测试文件使用（经 jest.config.cjs 的 transform 显式引用）。
 *
 * ⚠️ 注意：文件名刻意避开 Next.js 的 babel 配置探测（babel.config.js / .babelrc），
 * 因此 `next build` 仍走 SWC 编译，互不影响。
 * 本仓库 package.json 为 "type": "module"，故本文件必须用 .cjs 后缀以 CommonJS 导出。
 */
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',
  ],
};
