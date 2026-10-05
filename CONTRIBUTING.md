# 贡献指南（CONTRIBUTING）

感谢关注言语逸品（YYC³ 河洛文化数字传承平台）。本文档描述参与开发所需了解的全部流程与约定。

## 环境要求

- Node.js ≥ 22、pnpm ≥ 11（`corepack enable` 自动启用）、Git

```bash
pnpm install        # 安装依赖（CI 使用 --frozen-lockfile，请提交前同步 pnpm-lock.yaml）
pnpm dev            # 开发服务器 http://localhost:3030
```

## 开发工作流（重要：main 已启用分支保护）

1. 从 `main` 拉出功能分支：`git checkout -b feat/your-feature`
2. 本地通过全部质量门禁（见下）
3. 推送分支并创建 **Pull Request** → CI 通过 + 会话解决后合并（squash）
4. 合并到 `main` 后自动部署至 https://drama.yyc3.top

> Owner 保留紧急直推权（`enforce_admins=false`），但常规变更请一律走 PR。

## 质量门禁（CI 硬性执行，缺一不可）

| 门禁 | 本地命令 | 基线 |
|---|---|---|
| ESLint 9 | `pnpm lint` | 0 错误 |
| TypeScript 6 strict | `pnpm type-check` | 0 错误（含测试文件） |
| 测试 + 覆盖率棘轮 | `pnpm test:coverage` | 20 用例全绿；阈值 global 11/12/7/12（防回退，勿随意下调） |
| 生产构建 | `pnpm build` | 15 页静态导出 |
| 构建冒烟 | `node scripts/smoke-build.mjs out` | 路由/泄漏/体积≤25MB/静态纯度 |

图片资源变更请运行 `node scripts/optimize-images.mjs --dry` 预览后再压缩。

## 提交规范（Conventional Commits）

```
feat: 新功能        fix: 修复缺陷       perf: 性能优化
docs: 文档          chore: 构建/工具    refactor: 重构
test: 测试          ci: 流水线          security: 安全
```

示例：`fix(auth): 认证双栈收敛为mock单源，修复线上登录必败缺陷 (P0-3)`

## 代码约定

- 组件 PascalCase、文件 kebab-case；业务组件置于 `components/<业务域>/`
- 新页面放 `app/<route>/page.tsx`；注意静态导出约束（**禁止** 引入服务端 API/middleware）
- 认证/会话：静态演示模式唯一数据源为 `services/auth-service`；切换全栈轨时只改 `contexts/auth-context`
- 可观测性：上报逻辑必须门控 `window.__yyc3Telemetry`，失败必须吞掉异常（见 `docs/observability.md`）
- 凭据红线：任何真实密钥/口令不得入库（`.env*` 已 ignore；示例文件只允许占位符）

## 分支命名

`feat/*` 功能 · `fix/*` 修复 · `chore/*` 杂务 · `docs/*` 文档 · `security/*` 安全

## 问题反馈

- 缺陷/建议：GitHub Issues（模板化标签：`bug` / `proposal` / `incident`）
- 安全漏洞：**不要**公开 issue，见 [SECURITY.md](SECURITY.md) 与 [安全决策文档](docs/security/2026-10-05-历史后门处置与密钥轮换决策.md)
