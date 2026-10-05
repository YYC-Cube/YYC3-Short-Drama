/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  // 仅供 Jest 的 Babel 转换（TS/ESM → CJS）。
  // ⚠️ 文件名刻意避开 Next.js 的 babel 配置探测（babel.config.*），否则 next build 会切换到
  // Next Babel loader 并报错；next build 必须继续走 SWC。
  transform: {
    '^.+\\.(t|j)sx?$': ['babel-jest', { configFile: require.resolve('./babel.jest.config.cjs') }],
  },
  // 2026-10-05 整改（P0-4）：collectCoverageFrom 从不存在的 src/** 改为真实源码目录；
  // 移除从未生效的 80% 阈值——先以"测试全部通过"为硬门禁，测出真实覆盖率基线后再设阈值
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'contexts/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'services/**/*.{js,jsx,ts,tsx}',
    'utils/**/*.{js,jsx,ts,tsx}',
  ],
};

module.exports = config;
