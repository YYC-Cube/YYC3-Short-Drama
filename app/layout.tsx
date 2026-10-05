import { ThemeProvider } from "@/components/theme-provider"
import ErrorBoundary from "@/components/shared/error-boundary"
import WebVitalsReporter from "@/components/telemetry/web-vitals-reporter"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/auth-context"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import type React from "react"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "言语逸品 - 河洛文化数字传承平台",
  description: "融合AI技术与传统文化，打造全新的数字文化传承体验",
  keywords: "河洛文化,数字传承,AI技术,文化创新,短剧创作",
  authors: [{ name: "言语逸品团队" }],
  creator: "言语逸品",
  publisher: "言语逸品",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  generator: "v0.app",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  colorScheme: "dark light",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* favicon-16x16/32x32 与 apple-icon 由 app/ 目录约定文件自动注入 */}
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            {/* 全局错误边界：任何路由的渲染错误不再白屏（P1 整改接入） */}
            <ErrorBoundary>{children}</ErrorBoundary>
            <Toaster />
            {/* 核心 Web 指标上报（dev 控制台 / Sentry 可选） */}
            <WebVitalsReporter />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
