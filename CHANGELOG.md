# 更新日志（CHANGELOG）

本项目遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/) 格式，版本遵循语义化版本。

## [Unreleased]

### Planned

- Sentry DSN 正式接入（代码与文档已就绪，见 `docs/observability.md` 三步启用）
- 全栈轨恢复：基于干净重写的 API 路由（历史代码含后门，严禁原样恢复）

## [1.3.0] - 2026-10-05

以《首次技术调研报告》为输入的系统性质量与安全整改（P0 全清 + P1/P2 主体落地）。

### Security

- **历史后门处置**：永久禁止从 git 历史原样恢复 `/app/api/`；危险恢复指引替换为安全警告；决策记录与重评触发条件见 `docs/security/`
- **密钥轮换**：JWT_SECRET 已轮换（本地 `.env.local`，不入仓）；种子管理员脚本加生产护栏（须显式 `--force`）
- **凭据回退清理**：`lib/db.ts` 移除 `yyc3_dj` 默认口令回退，缺失环境变量快速失败
- **CI 加固**：全部 GitHub Actions 固定至 commit SHA；工作流权限最小化（默认 `contents: read`）

### Fixed

- **CI 断供 3 个月**：Node 18→22 / pnpm 9→11（Next 16 要求 ≥20.9），部署管线恢复
- **线上登录必败**：认证双栈（mock + 真实 API fetch）收敛为 mock 单源；登录页如实标注演示模式
- **测试体系崩溃**：补装 `jest-environment-jsdom`、删除 7 个引用已删 API 的悬空套件、修复陈旧断言——从"无法运行"到 20/20 全绿
- **post-deploy 任务**在 PR 事件下必红的逻辑缺陷
- **pnpm `minimumReleaseAge`** 与 frozen-lockfile 工作流的冲突（显式关闭并注明理由）

### Changed

- **死代码清除**：59 文件 / 约 1.4 万行（零引用逐项验证）；保留 `project-dashboard`（核实为在用）
- **图片治理**：产物 41.4MB → 13.5MB（孤儿图删除 8.5MB + sharp 压缩 -71%）；冒烟体积门禁 50MB→25MB
- **错误处理**：`ErrorBoundary` 接入根布局（渲染错误不再白屏）；`logErrorToServer` 假上报桩移除
- **分支保护**：main 启用必需状态检查 + 禁强推 + 会话解决要求（enforce_admins=false 保留 Owner 直推）
- **依赖瘦身**：移除 8 个零引用依赖；`@testing-library/*` 移入 devDependencies；删除陈旧 `package-lock.json`

### Added

- **可观测性**：Sentry 错误上报 + Web Vitals 监控（DSN 门控零成本，`docs/observability.md`）
- **覆盖率棘轮门禁**：真实基线（global 11.47%/12.5%/8.2%/12.29%）入 CI 硬门禁
- **构建冒烟**：路由存在性 / 内部路由不泄漏 / 体积 / 静态纯度四项校验（TC-01~07 自动化）
- **开发者文档五件套**：LICENSE(MIT)、CONTRIBUTING、CODE_OF_CONDUCT、CHANGELOG、SECURITY 增补
- 仓库 topics / 描述 / 主页元信息

### Removed

- 内部 QA 路由 `/test-optimization`、`/functionality-report`（生产泄漏，DEV-2）
- 双锁文件、`performance-baseline` 假基线脚本

## [1.2.0] - 2026-08-29

- 全栈升级：Next.js 16 / React 19 / TypeScript 6 / Tailwind 4；react-hooks 技术债清零
- 依赖漏洞 122→1（low）（注：因 CI 断供，本版本直至 2026-10-05 才实际部署上线）

## [1.1.0] - 2026-05-22

- GitHub Pages 纯静态导出（`output: 'export'`）；API 路由移出构建

## [1.0.0] - 2026-05-22

- 首个 GitHub Pages 自动化部署版本
