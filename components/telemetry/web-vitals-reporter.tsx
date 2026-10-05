"use client"

import { useEffect } from "react"
import { useReportWebVitals } from "next/web-vitals"

type Metric = Parameters<Parameters<typeof useReportWebVitals>[0]>[0]

/**
 * 核心 Web 指标（LCP/INP/CLS/FCP/TTFB）上报器。
 *
 * - 开发环境：全部指标打印到控制台，便于本地观测
 * - 生产 + 已配置 Sentry：rating 为 "poor" 的指标上报告警，其余记为 breadcrumb
 * - 未配置 Sentry：生产环境静默（无网络开销）
 */
export default function WebVitalsReporter() {
  useReportWebVitals((metric: Metric) => {
    const isDev = process.env.NODE_ENV === "development"
    if (isDev) {
      console.info(`[web-vitals] ${metric.name}: ${Math.round(metric.value)}${metric.name === "CLS" ? "" : "ms"} (${metric.rating})`)
    }

    if (typeof window === "undefined" || !(window as typeof window & { __yyc3Telemetry?: boolean }).__yyc3Telemetry) {
      return
    }

    void import("@sentry/react").then((Sentry) => {
      const payload = {
        name: metric.name,
        value: Math.round(metric.value),
        rating: metric.rating,
        id: metric.id,
      }
      if (metric.rating === "poor") {
        Sentry.captureMessage(`Web Vital 劣化: ${metric.name}=${Math.round(metric.value)}`, {
          level: "warning",
          extra: payload,
        })
      } else {
        Sentry.addBreadcrumb({ category: "web-vital", message: `${metric.name}=${Math.round(metric.value)}`, level: "info", data: payload })
      }
    })
  })

  useEffect(() => {
    // 组件无渲染输出；挂载仅用于激活 useReportWebVitals
  }, [])

  return null
}
