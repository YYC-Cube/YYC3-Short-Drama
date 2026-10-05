import { createUser } from "@/lib/models/user.model"
import { query } from "@/lib/db"

// 生产环境护栏：本脚本会创建"已知密码"的测试账号（含管理员），
// 若曾在真实数据库执行过，请按 docs/security/ 决策文档清理相关账号
if (process.env.NODE_ENV === "production" && process.argv[2] !== "--force") {
  console.error("🚫 拒绝执行：生产环境禁止填充测试用户（确需时显式追加 --force，并在事后清理账号）")
  process.exit(1)
}

async function seedTestUsers() {
  console.log("🌱 开始创建测试用户...")

  const testUsers = [
    {
      username: "管理员",
      phone: "13800138000",
      email: "admin@0379.email",
      password: "Admin@2024",
      is_local_user: true,
    },
    {
      username: "张三",
      phone: "13700000001",
      email: "zhangsan@0379.email",
      password: "User@123456",
      is_local_user: true,
    },
    {
      username: "李四",
      phone: "18600000002",
      email: "lisi@example.com",
      password: "User@123456",
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
  } catch (error) {
    console.error("❌ 创建测试用户失败:", error)
    process.exit(1)
  }
}

seedTestUsers()
