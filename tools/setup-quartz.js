#!/usr/bin/env node

import fs from "node:fs/promises"
import path from "node:path"

const root = process.cwd()
const quartzSource = path.join(root, "node_modules", "quartz", "quartz")
const quartzTarget = path.join(root, "quartz")

async function ensureQuartzLink() {
  const srcStat = await fs.stat(quartzSource).catch(() => null)
  if (!srcStat || !srcStat.isDirectory()) {
    throw new Error("找不到 Quartz 原始目錄：node_modules/quartz/quartz")
  }

  const targetStat = await fs.lstat(quartzTarget).catch(() => null)
  if (targetStat) {
    if (targetStat.isSymbolicLink()) {
      const current = await fs.readlink(quartzTarget)
      if (path.resolve(root, current) === quartzSource) {
        return
      }
    }
    await fs.rm(quartzTarget, { recursive: true, force: true })
  }

  const relative = path.relative(path.dirname(quartzTarget), quartzSource)
  await fs.symlink(relative, quartzTarget, "dir")
}

async function main() {
  await ensureQuartzLink()
  console.log("[完成] 已建立 Quartz 目錄連結：quartz -> node_modules/quartz/quartz")
}

main().catch((error) => {
  console.error("[錯誤] Quartz 初始化失敗：", error)
  process.exit(1)
})
