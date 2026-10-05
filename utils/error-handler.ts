import type React from "react"
/**
 * 全局错误处理工具
 * 提供统一的错误捕获、记录和展示机制
 */

// 错误类型
export enum ErrorType {
  NETWORK = "network",
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  VALIDATION = "validation",
  SERVER = "server",
  CLIENT = "client",
  UNKNOWN = "unknown",
}

// 错误详情
export interface ErrorDetails {
  type: ErrorType
  code?: string
  message: string
  timestamp: number
  context?: Record<string, any>
  stack?: string
}

// 错误处理选项
export interface ErrorHandlerOptions {
  logToConsole?: boolean
  logToServer?: boolean
  showToUser?: boolean
  retry?: boolean
  fallback?: React.ReactNode
  /** 附加上下文信息（如组件栈、请求ID等） */
  context?: Record<string, unknown>
}

// 默认选项
const defaultOptions: ErrorHandlerOptions = {
  logToConsole: true,
  logToServer: true,
  showToUser: true,
  retry: false,
}

/**
 * 创建标准化错误对象
 */
export function createError(
  error: Error | string,
  type: ErrorType = ErrorType.UNKNOWN,
  context?: Record<string, any>,
): ErrorDetails {
  const message = typeof error === "string" ? error : error.message
  const stack = typeof error === "string" ? undefined : error.stack

  return {
    type,
    message,
    stack,
    context,
    timestamp: Date.now(),
  }
}

/**
 * 处理错误
 */
export function handleError(
  error: Error | string,
  type: ErrorType = ErrorType.UNKNOWN,
  options: ErrorHandlerOptions = {},
): ErrorDetails {
  const mergedOptions = { ...defaultOptions, ...options }
  const errorDetails = createError(error, type)

  // 控制台日志
  if (mergedOptions.logToConsole) {
    console.error("[错误]", errorDetails)
  }

  // 服务器日志
  if (mergedOptions.logToServer) {
    logErrorToServer(errorDetails).catch((e) => {
      console.error("无法将错误记录到服务器:", e)
    })
  }

  return errorDetails
}

/**
 * 将错误上报到监控服务（Sentry，若已通过 instrumentation-client 激活）。
 * 未启用监控时静默完成（无网络请求、不加载 SDK chunk）。
 */
async function logErrorToServer(errorDetails: ErrorDetails): Promise<void> {
  if (typeof window === "undefined" || !(window as typeof window & { __yyc3Telemetry?: boolean }).__yyc3Telemetry) {
    return
  }
  try {
    const Sentry = await import("@sentry/react")
    const error = new Error(errorDetails.message)
    error.stack = errorDetails.stack
    Sentry.captureException(error, { extra: { type: errorDetails.type, context: errorDetails.context } })
  } catch {
    // 上报失败不影响主流程
  }
}

/**
 * 获取用户友好的错误消息
 */
export function getUserFriendlyMessage(errorDetails: ErrorDetails): string {
  switch (errorDetails.type) {
    case ErrorType.NETWORK:
      return "网络连接出现问题，请检查您的网络连接并重试。"
    case ErrorType.AUTHENTICATION:
      return "您的登录会话已过期，请重新登录。"
    case ErrorType.AUTHORIZATION:
      return "您没有执行此操作的权限。"
    case ErrorType.VALIDATION:
      return "提交的数据无效，请检查并重试。"
    case ErrorType.SERVER:
      return "服务器遇到了问题，我们正在努力修复。"
    case ErrorType.CLIENT:
      return "应用程序遇到了问题，请刷新页面重试。"
    default:
      return "发生了未知错误，请稍后重试。"
  }
}
