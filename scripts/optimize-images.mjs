#!/usr/bin/env node
/**
 * public/ 图片压缩管线（P2 性能整改，2026-10-05）
 *
 * - PNG：宽度 > 1920 先等比缩放，再做 libimagequant 风格调色板压缩（quality 70-90）
 * - JPEG：mozjpeg 质量 80
 * - 跳过 public/yyc3/（全端品牌图标矩阵，保持无损）与已足够小的文件
 * - 压缩无收益（结果更大）时保留原文件
 *
 * 用法:
 *   node scripts/optimize-images.mjs --dry   # 仅预览
 *   node scripts/optimize-images.mjs         # 实际压缩（覆盖原文件）
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import { join, extname } from "node:path"
import sharp from "sharp"

const DRY = process.argv.includes("--dry")
const PUBLIC_DIR = "public"
const SKIP_DIRS = new Set(["yyc3"]) // 品牌图标矩阵保持无损
const MIN_BYTES = 200 * 1024 // 只处理 >200KB
const MAX_WIDTH = 1920

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      if (SKIP_DIRS.has(entry)) continue
      yield* walk(full)
    } else {
      yield full
    }
  }
}

const fmtKB = (n) => `${(n / 1024).toFixed(0)}KB`
let beforeTotal = 0
let afterTotal = 0
let changed = 0

for (const file of walk(PUBLIC_DIR)) {
  const ext = extname(file).toLowerCase()
  if (![".png", ".jpg", ".jpeg"].includes(ext)) continue
  const before = statSync(file).size
  if (before < MIN_BYTES) continue
  beforeTotal += before

  let pipeline = sharp(readFileSync(file), { failOn: "none" })
  const meta = await pipeline.metadata()
  if ((meta.width ?? 0) > MAX_WIDTH) {
    pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true })
  }
  pipeline = ext === ".png" ? pipeline.png({ palette: true, quality: 80, effort: 10 }) : pipeline.jpeg({ quality: 80, mozjpeg: true })

  const output = await pipeline.toBuffer()
  if (output.length >= before) {
    console.log(`⏭️  跳过（无收益） ${file} ${fmtKB(before)}`)
    afterTotal += before
    continue
  }
  afterTotal += output.length
  changed++
  console.log(`🗜️  ${DRY ? "[dry] " : ""}${file}: ${fmtKB(before)} → ${fmtKB(output.length)}（-${Math.round((1 - output.length / before) * 100)}%）`)
  if (!DRY) {
    writeFileSync(file, output)
  }
}

console.log(`\n📊 合计: ${fmtKB(beforeTotal)} → ${fmtKB(afterTotal)}（节省 ${fmtKB(beforeTotal - afterTotal)}，${changed} 个文件${DRY ? "预览" : "已写入"}）`)
