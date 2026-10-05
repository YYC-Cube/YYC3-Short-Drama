# 可观测性指南（Sentry + Web Vitals）

> 落地日期：2026-10-05 ｜ 关联：技术整改日志 P1（可观测性接入）
> 形态：**静态导出（GitHub Pages）与全栈模式均可使用**——全部为客户端实现，无需服务端。

## 架构

```
instrumentation-client.ts          ← Next 16 约定文件（项目根），应用交互前执行
  ├─ NEXT_PUBLIC_SENTRY_DSN 为空 → 直接返回（SDK 不加载，零开销）
  └─ 有 DSN → 动态 import @sentry/react → Sentry.init → 置位 window.__yyc3Telemetry

components/telemetry/web-vitals-reporter.tsx  ← 挂载于 app/layout.tsx
  ├─ 开发环境：全部指标 console.info
  └─ 生产 + 已激活：rating="poor" → Sentry 告警；其余 → breadcrumb

utils/error-handler.ts (logErrorToServer)
  └─ 已激活 → captureException（ErrorBoundary 捕获的错误同步上报）
      未激活 → 静默（此前的 setTimeout 假上报桩已移除）
```

## 启用步骤

1. 在 [sentry.io](https://sentry.io) 创建项目（平台选 React/JavaScript），复制 DSN
2. 写入本地环境文件（`.env.local` 已被 gitignore）：

   ```bash
   echo "NEXT_PUBLIC_SENTRY_DSN=https://<key>@o<org>.sentry.io/<project>" >> .env.local
   ```

3. 重新构建并部署（`pnpm build`）——`NEXT_PUBLIC_*` 在构建时内联
4. 验证：打开站点控制台执行 `localStorage` 随意触发一个渲染错误，或直接在 Sentry 控制台查看 Issues

> DSN 是设计为公开的浏览器端标识，不属机密；真正的访问控制靠 Sentry 项目的入站过滤与密钥模式（可在 Sentry 后台开启 "Allowed Domains" 限定为 drama.yyc3.top）。

## 采集内容边界

| 采集 | 不采集 |
|---|---|
| 未捕获 JS 错误、ErrorBoundary 捕获的渲染错误 | 会话回放（replaysSessionSampleRate=0） |
| Web Vitals 劣化告警（rating=poor） | 个人信息/表单内容 |
| 性能追踪（10% 采样） | 任意自定义用户行为埋点 |

## 本地观测（无需 Sentry）

开发模式下 Web Vitals 全量打印：

```bash
pnpm dev
# [web-vitals] LCP: 1204ms (good)
# [web-vitals] CLS: 0 (good) ...
```

## 陷阱与约定

- `NEXT_PUBLIC_SENTRY_DSN` 为空时，`@sentry/react` 代码虽在依赖树中，但运行时**不会被加载**（动态 import 被门控），构建产物仅多一个惰性 chunk
- 判断 SDK 是否激活的全局标志是 `window.__yyc3Telemetry`，由 `instrumentation-client.ts` 置位；新代码上报前应检查它，避免未初始化时拉起 SDK
- 监控初始化/上报的全部失败路径都必须吞掉异常——可观测性永不影响业务
