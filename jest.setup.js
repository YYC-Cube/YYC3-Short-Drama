import '@testing-library/jest-dom';

// 模拟环境变量（与 lib/env.ts 实际读取的变量名保持一致；均为测试桩值，非真实凭据）
process.env.JWT_SECRET = 'test-jwt-secret-32-characters-long';
process.env.DB_MASTER_HOST = 'localhost';
process.env.DB_MASTER_PORT = '3306';
process.env.DB_MASTER_USER = 'test';
process.env.DB_MASTER_PASS = 'test';
process.env.DB_MASTER_NAME = 'test';
