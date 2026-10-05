# Security Policy

## Critical Security Requirements

### JWT Secret Configuration

**IMPORTANT**: This application requires a strong JWT secret for secure authentication.

#### Requirements:
- **JWT_SECRET** environment variable MUST be set before starting the application
- The secret MUST be at least 32 characters long
- Use a cryptographically secure random string
- Never commit secrets to version control

#### Generating a Secure JWT Secret:

```bash
# Using OpenSSL (recommended)
openssl rand -base64 48

# Using Node.js
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"

# Using Python
python3 -c "import secrets; print(secrets.token_urlsafe(48))"
```

#### Setting the JWT Secret:

Create a `.env.local` file in the project root with:

```env
JWT_SECRET=your_generated_secure_random_string_here_minimum_32_chars
```

**Example** (DO NOT USE IN PRODUCTION - FOR ILLUSTRATION ONLY):
```env
# ⚠️ WARNING: This is just an example format!
# ⚠️ NEVER use this example value in any environment!
# ⚠️ Generate your own unique secret using the commands above!
JWT_SECRET=8a7d9c6b5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b
```

#### Security Impact:

Without a properly configured JWT_SECRET:
- ❌ Application will fail to start (secure by default)
- ❌ Authentication will not work
- ✅ Prevents use of weak default secrets
- ✅ Forces secure configuration

## Vulnerability Fix History

### 2024-12-22: Fixed JWT Secret Hardcoding Vulnerability

**Severity**: Critical

**Description**: 
Previous versions contained a hardcoded fallback JWT secret (`"your-secret-key-change-in-production"`) which could allow attackers to:
- Forge authentication tokens
- Bypass authentication mechanisms
- Impersonate any user account
- Gain unauthorized system access

**Fix**:
- Removed all hardcoded JWT secret fallback values
- Implemented centralized JWT configuration with validation
- Application now fails fast if JWT_SECRET is not properly configured
- Added minimum length validation (32 characters)
- Updated documentation with security requirements

**Affected Files**:
- `middleware.ts`
- `app/api/auth/login/route.ts`
- `app/api/auth/register/route.ts`
- `app/api/auth/me/route.ts`

**Action Required**:
All deployments must set a strong JWT_SECRET environment variable.

## 历史后门声明与密钥轮换（2026-10-05）

**历史后门声明**：git 历史中（commit `af17ee1` 之前的 `app/api/auth/login/route.ts`）存在硬编码管理员后门（手机号 `13800138000` + 验证码 `123456` 直发管理员 JWT）。该代码已随静态导出改造从工作树删除，当前部署形态（GitHub Pages 纯静态）不含任何服务端代码，**后门在当前生产不可利用**。

**规则**：严禁从 git 历史原样恢复 `/app/api/`；恢复全栈能力必须基于干净重写。处置决策与历史改写 runbook 见 [docs/security/2026-10-05-历史后门处置与密钥轮换决策.md](docs/security/2026-10-05-历史后门处置与密钥轮换决策.md)。

**密钥轮换速查**（详情见上述决策文档）：

| 密钥/凭据 | 风险来源 | 轮换动作 |
|---|---|---|
| JWT_SECRET | 历史版本存在弱默认值 | 全栈部署前生成新值：`openssl rand -base64 48`，写入 `.env.local`（不入仓） |
| DB_MASTER_PASS | 仓库曾公开默认口令（代码回退已移除） | 若任何可达 MySQL 实例曾用默认口令，立即改密 |
| SMTP 凭据 | 历史 API 曾以环境变量引用 | 如曾配置真实凭据，评估泄露面并轮换 |
| 种子管理员 `13800138000` | 已知密码（历史/文档可见） | 若曾在真实库执行 `db:seed`，删除该账号（种子脚本已加生产护栏） |

## Supported Versions

Use this section to tell people about which versions of your project are
currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 5.1.x   | :white_check_mark: |
| 5.0.x   | :x:                |
| 4.0.x   | :white_check_mark: |
| < 4.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability, please email: admin@0379.email

**Please include**:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

**Response Time**:
- Initial acknowledgment: Within 24 hours
- Status update: Within 48 hours
- Fix timeline: Depends on severity (Critical: 24-48 hours, High: 1 week, Medium: 2 weeks)

We take security seriously and appreciate responsible disclosure.
