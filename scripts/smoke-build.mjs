#!/usr/bin/env node
/**
 * 构建产物冒烟检查（调研报告 TC-01~07 的 CI 自动化部分）
 *
 * 校验项：
 *  1. 业务必需路由产物存在（trailingSlash 模式 → <route>/index.html）
 *  2. 内部 QA 路由不得泄漏到生产产物
 *  3. 产物总体积门禁
 *  4. 静态纯度：HTML 不得引用 /api/（静态导出模式无服务端）
 *
 * 用法: node scripts/smoke-build.mjs [outDir]   （默认 out/）
 * 退出码: 0=全部通过 1=存在失败项
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { extname, join } from "node:path"

const outDir = process.argv[2] || "out"
const MAX_TOTAL_BYTES = 25 * 1024 * 1024 // 25MB（2026-10-05 图片治理后由 50MB 收紧；孤儿清理+sharp 压缩使 out/ 约 15MB）

const REQUIRED_ROUTES = [
  "/",
  "/ai-script/",
  "/auth/",
  "/auth/single-page/",
  "/cultural-crossing/",
  "/cultural-gene/",
  "/main/",
  "/profile/",
  "/project-management/",
  "/social-system/",
  "/star-economy/",
]

// 内部 QA 仪表盘已于 2026-10-05 从生产构建移除，此后必须保持缺席
const FORBIDDEN_ROUTES = ["/test-optimization/", "/functionality-report/"]

let failed = false
const pass = (msg) => console.log(`  ✅ ${msg}`)
const fail = (msg) => {
  console.error(`  ❌ ${msg}`)
  failed = true
}

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) {
      yield* walk(full)
    } else {
      yield full
    }
  }
}

console.log(`🔍 构建产物冒烟检查: ${outDir}/`)

if (!existsSync(outDir)) {
  console.error(`  ❌ 构建产物目录不存在: ${outDir}`)
  process.exit(1)
}

console.log("\n[1/4] 必需路由存在性")
for (const route of REQUIRED_ROUTES) {
  const file = join(outDir, route, "index.html")
  if (existsSync(file)) {
    pass(`路由 ${route}`)
  } else {
    fail(`缺少路由产物 ${route}（期望 ${file}）`)
  }
}

console.log("\n[2/4] 内部路由不泄漏")
for (const route of FORBIDDEN_ROUTES) {
  const file = join(outDir, route)
  if (!existsSync(file)) {
    pass(`已保持移除 ${route}`)
  } else {
    fail(`内部 QA 路由泄漏到生产产物: ${route}`)
  }
}

console.log("\n[3/4] 产物体积门禁")
let totalBytes = 0
let fileCount = 0
for (const file of walk(outDir)) {
  totalBytes += statSync(file).size
  fileCount++
}
const totalMB = (totalBytes / 1024 / 1024).toFixed(1)
if (totalBytes <= MAX_TOTAL_BYTES) {
  pass(`总体积 ${totalMB}MB / ${fileCount} 个文件 ≤ ${MAX_TOTAL_BYTES / 1024 / 1024}MB`)
} else {
  fail(`总体积 ${totalMB}MB 超过 ${MAX_TOTAL_BYTES / 1024 / 1024}MB 门禁（${fileCount} 个文件）`)
}

console.log("\n[4/4] 静态纯度（HTML 不得引用 /api/）")
const offenders = []
for (const file of walk(outDir)) {
  if (extname(file) !== ".html") continue
  const html = readFileSync(file, "utf8")
  if (html.includes('"/api/') || html.includes("'/api/")) {
    offenders.push(file)
  }
}
if (offenders.length === 0) {
  pass("所有 HTML 均无 /api/ 引用")
} else {
  fail(`以下 HTML 引用了 /api/（静态模式必然 404）: ${offenders.slice(0, 5).join(", ")}`)
}

console.log(`\n${failed ? "❌ 冒烟检查未通过" : "✅ 冒烟检查全部通过"}`)
process.exit(failed ? 1 : 0)
