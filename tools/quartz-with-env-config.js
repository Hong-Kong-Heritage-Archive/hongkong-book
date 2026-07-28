import { readFile, writeFile } from "node:fs/promises"
import { spawn } from "node:child_process"
import path from "node:path"

const configPath = path.resolve("quartz.config.yaml")
function normalizeBaseUrl(value) {
  const trimmed = value.trim().replace(/\/$/, "")
  if (/^https?:\/\//i.test(trimmed)) {
    const url = new URL(trimmed)
    return `${url.host}${url.pathname}`.replace(/\/$/, "")
  }

  return trimmed.replace(/^\/+/, "")
}

const siteUrl = process.env.HKB_SITE_URL ? normalizeBaseUrl(process.env.HKB_SITE_URL) : ""

if (!siteUrl) {
  console.error("[錯誤] HKB_SITE_URL 未設定，無法注入 Quartz baseUrl")
  process.exit(1)
}

const originalConfig = await readFile(configPath, "utf8")
const updatedConfig = originalConfig.replace(
  /(^\s*baseUrl:\s*)(.*)$/m,
  (_, prefix) => `${prefix}${siteUrl}`,
)

if (updatedConfig === originalConfig) {
  console.error("[錯誤] quartz.config.yaml 內找不到 baseUrl 欄位")
  process.exit(1)
}

await writeFile(configPath, updatedConfig)

const restoreConfig = async () => {
  await writeFile(configPath, originalConfig)
}

const child = spawn("quartz", process.argv.slice(2), {
  stdio: "inherit",
  env: process.env,
})

const cleanup = async (signal) => {
  child.kill(signal)
  await restoreConfig()
}

process.on("SIGINT", () => {
  void cleanup("SIGINT")
})

process.on("SIGTERM", () => {
  void cleanup("SIGTERM")
})

child.on("exit", async (code, signal) => {
  await restoreConfig()
  if (signal) {
    process.kill(process.pid, signal)
    return
  }
  process.exit(code ?? 0)
})