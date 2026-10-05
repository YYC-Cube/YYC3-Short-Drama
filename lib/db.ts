/**
 * @file 数据库连接管理
 * @description 处理数据库连接池和查询操作
 * @module lib/db
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 * @updated 2025-01-30
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import mysql from "mysql2/promise";

// 安全整改（2026-10-05）：移除默认凭据回退，凭据仅来自环境变量，缺失时快速失败
// 详见 docs/security/2026-10-05-历史后门处置与密钥轮换决策.md
const dbUser = process.env.DB_MASTER_USER
const dbPass = process.env.DB_MASTER_PASS
if (!dbUser || !dbPass) {
  throw new Error(
    "数据库凭据未配置：请在 .env.local 中设置 DB_MASTER_USER 与 DB_MASTER_PASS（模板见 .env.example）。出于安全考虑，本模块不再提供默认账号密码回退。",
  )
}

// 创建数据库连接池
const pool = mysql.createPool({
  host: process.env.DB_MASTER_HOST || "localhost",
  port: Number.parseInt(process.env.DB_MASTER_PORT || "3306"),
  user: dbUser,
  password: dbPass,
  database: process.env.DB_MASTER_NAME || "yyc3_my",
  charset: process.env.DB_MASTER_CHARSET || "utf8mb4",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
})

// 简单的查询缓存实现
const queryCache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_TTL = 30000 // 缓存有效期 30 秒

// 生成缓存键
function generateCacheKey(sql: string, params?: unknown[]): string {
  return `${sql}:${JSON.stringify(params || [])}`
}

// 查询函数（带缓存）
export async function query<T = unknown>(sql: string, params?: unknown[], useCache: boolean = false): Promise<T> {
  // 检查是否使用缓存且查询是只读的（SELECT 语句）
  if (useCache && sql.trim().toLowerCase().startsWith('select')) {
    const cacheKey = generateCacheKey(sql, params)
    const cachedItem = queryCache.get(cacheKey)

    // 检查缓存是否有效
    if (cachedItem && (Date.now() - cachedItem.timestamp) < CACHE_TTL) {
      console.log("📦 使用缓存查询:", sql.substring(0, 50) + "...")
      return cachedItem.data as T
    }
  }

  try {
    // mysql2 ExecuteValues 要求明确的参数类型（unknown[] 在新版类型下不匹配）
    const [results] = await pool.execute(sql, params as (string | number | boolean | null)[] | undefined)

    // 将结果存入缓存
    if (useCache && sql.trim().toLowerCase().startsWith('select')) {
      const cacheKey = generateCacheKey(sql, params)
      queryCache.set(cacheKey, {
        data: results,
        timestamp: Date.now()
      })

      // 限制缓存大小
      if (queryCache.size > 100) {
        const oldestKey = queryCache.keys().next().value
        if (oldestKey !== undefined) {
          queryCache.delete(oldestKey)
        }
      }
    }

    return results as T
  } catch (error) {
    console.error("数据库查询错误:", error)
    throw error
  }
}

// 清除缓存
export function clearCache(): void {
  queryCache.clear()
  console.log("🗑️  缓存已清除")
}

// 测试数据库连接
export async function testConnection(): Promise<boolean> {
  try {
    await pool.query("SELECT 1")
    console.log("✅ 数据库连接成功")
    return true
  } catch (error) {
    console.error("❌ 数据库连接失败:", error)
    return false
  }
}

// 关闭连接池
export async function closePool(): Promise<void> {
  await pool.end()
  clearCache()
}

// 池访问器（供测试/脚本显式获取，不改变默认导出行为）
export function getPool(): mysql.Pool {
  return pool
}

export default pool
