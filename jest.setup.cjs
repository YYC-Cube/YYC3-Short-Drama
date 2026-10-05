require('@testing-library/jest-dom');

// 模拟环境变量（与 lib/env.ts 实际读取的变量名保持一致；均为测试桩值，非真实凭据）
// 注意：lib/env.ts 在模块加载时即执行校验，缺失必填项会 process.exit(1)，
// 因此这里必须提供全部必填桩值（JWT_SECRET / REFRESH_TOKEN_SECRET）
process.env.JWT_SECRET = 'test-jwt-secret-32-characters-long';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-token-secret-32-characters-long';
process.env.DB_MASTER_HOST = 'localhost';
process.env.DB_MASTER_PORT = '3306';
process.env.DB_MASTER_USER = 'test';
process.env.DB_MASTER_PASS = 'test';
process.env.DB_MASTER_NAME = 'test';
