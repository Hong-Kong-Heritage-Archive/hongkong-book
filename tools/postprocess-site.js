import { readFile, readdir, stat, writeFile } from "node:fs/promises"
import path from "node:path"

const siteRoot = path.resolve("site")
const siteBaseUrl = process.env.HKB_SITE_URL

if (!siteBaseUrl) {
  console.error("[錯誤] HKB_SITE_URL 未設定，無法修正已產生的站點網址")
  process.exit(1)
}

function normalizeBaseUrl(value) {
  const trimmed = value.trim().replace(/\/$/, "")
  if (/^https?:\/\//i.test(trimmed)) {
    const url = new URL(trimmed)
    return `${url.host}${url.pathname}`.replace(/\/$/, "")
  }

  return trimmed.replace(/^\/+/, "")
}

const normalizedBaseUrl = normalizeBaseUrl(siteBaseUrl)
const normalizedOrigin = `https://${normalizedBaseUrl}`

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      await walk(entryPath)
      continue
    }

    if (!/\.(html?|xml)$/i.test(entry.name)) continue

    const original = await readFile(entryPath, "utf8")
    let updated = original

    updated = updated.replace(/(<meta property="twitter:domain" content=")https?:\/\/([^"]+")/g, `$1$2`)
    updated = updated.replace(/(<meta property="og:url" content=")https:\/\/https\/\/([^"]+")/g, `$1https://$2`)
    updated = updated.replace(/(<meta property="twitter:url" content=")https:\/\/https\/\/([^"]+")/g, `$1https://$2`)
    updated = updated.replaceAll('content="example.com"', `content="${normalizedBaseUrl}"`)
    updated = updated.replaceAll("https://https//", "https://")
    updated = updated.replaceAll("https://example.com", normalizedOrigin)

    if (updated !== original) {
      await writeFile(entryPath, updated)
    }
  }
}

await stat(siteRoot)
await walk(siteRoot)