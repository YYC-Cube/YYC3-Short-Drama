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
  // 2026-10-05 整改（P0-4）：collectCoverageFrom 从不存在的 src/** 改为真实源码目录
  // 2026-10-05 P1：真实覆盖率基线已测量（global 12.29% / lib 38.38% lines），
  // 按棘轮原则设为"略低于当前值"——防止覆盖回退，新增代码稀释阈值属预期（补测或显式上调）
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'contexts/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'services/**/*.{js,jsx,ts,tsx}',
    'utils/**/*.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    // 2026-10-05 实测基线: statements 11.47 / branches 12.5 / functions 8.2 / lines 12.29
    // 阈值取略低于基线防回退（棘轮）。
    // 注意：coverageThreshold 的 glob 键是"逐文件"比较语义（而非目录汇总），
    // lib/ 内存在无测试文件，故只设 global 汇总棘轮；细化门禁待补测后评估。
    global: {
      statements: 11,
      branches: 12,
      functions: 7,
      lines: 12,
    },
  },
};

module.exports = config;
