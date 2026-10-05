import { randomBytes } from "node:crypto"
import { createUser } from "@/lib/models/user.model"
import { query } from "@/lib/db"

// 生产环境护栏：本脚本会创建测试账号（含管理员角色），
// 若曾在真实数据库执行过，请按 docs/security/ 决策文档清理相关账号
if (process.env.NODE_ENV === "production" && process.argv[2] !== "--force") {
  console.error("🚫 拒绝执行：生产环境禁止填充测试用户（确需时显式追加 --force，并在事后清理账号）")
  process.exit(1)
}

// 密码不写入源码（2026-10-05 终审整改）：默认随机生成并在结束后打印一次；
// 需要固定口令时用 SEED_PASSWORD 环境变量提供（勿提交到版本库）
const SEED_PASSWORD = process.env.SEED_PASSWORD || randomBytes(12).toString("base64url")

async function seedTestUsers() {
  console.log("🌱 开始创建测试用户...")

  const testUsers = [
    {
      username: "管理员",
      phone: "13800138000",
      email: "admin@0379.email",
      password: SEED_PASSWORD,
      is_local_user: true,
    },
    {
      username: "张三",
      phone: "13700000001",
      email: "zhangsan@0379.email",
      password: SEED_PASSWORD,
      is_local_user: true,
    },
    {
      username: "李四",
      phone: "18600000002",
      email: "lisi@example.com",
      password: SEED_PASSWORD,
      is_local_user: false,
    },
  ]

  try {
    for (const userData of testUsers) {
      try {
        // 检查用户是否已存在
        const [existing] = await query<any[]>("SELECT id FROM users WHERE phone = ?", [userData.phone])

        if (existing) {
          console.log(`⏭️  用户 ${userData.username} (${userData.phone}) 已存在，跳过`)
          continue
        }

        await createUser(userData)
        console.log(`✅ 创建测试用户: ${userData.username} (${userData.phone})`)
      } catch (error) {
        console.error(`❌ 创建用户 ${userData.username} 失败:`, error)
      }
    }

    console.log("🎉 测试用户创建完成！")
    console.log(`🔑 本次种子账号统一密码（仅打印一次，请妥善保管）: ${SEED_PASSWORD}`)
  } catch (error) {
    console.error("❌ 创建测试用户失败:", error)
    process.exit(1)
  }
}

seedTestUsers()
