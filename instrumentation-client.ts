/**
 * 客户端监控初始化（Next.js 约定文件，项目根目录）
 *
 * 零成本门控：仅在构建时注入 NEXT_PUBLIC_SENTRY_DSN 时才动态加载 Sentry SDK。
 * 静态导出（默认）未配置 DSN → 此模块不做任何事，Sentry 不进入运行时。
 * 启用方法见 .env.example 与 docs/observability.md。
 *
 * @sentry/react 通过 NEXT_PUBLIC_SENTRY_DSN（公开 DSN，专为浏览器设计）上报，
 * 隐私约束：静态演示站不采集个人信息，仅采集错误事件与核心 Web 指标。
 */
const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

async function initTelemetry(): Promise<void> {
  if (!SENTRY_DSN || typeof window === "undefined") {
    return
  }

  try {
    const Sentry = await import("@sentry/react")
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: process.env.NODE_ENV,
      // 静态展示站：错误全采，性能追踪低采样，不开启会话回放
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0,
    })
    // 供 error-handler / web-vitals 判断 SDK 是否已激活（避免未初始化时加载 SDK chunk）
    ;(window as typeof window & { __yyc3Telemetry?: boolean }).__yyc3Telemetry = true
  } catch (error) {
    // 监控初始化失败绝不能影响应用本身
    console.warn("[telemetry] 初始化失败（不影响应用）:", error)
  }
}

void initTelemetry()
