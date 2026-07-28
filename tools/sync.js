#!/usr/bin/env node

import fs from "node:fs/promises"
import path from "node:path"

import matter from "gray-matter"

import {
  ROOT_DIR,
  buildEditUrl,
  ensureDir,
  extractMarkdownLinks,
  getSectionContent,
  normalizeWhitespace,
  resolveEditBaseUrl,
  splitH2Sections,
  toEntityUrlPath,
  writeTextFile
} from "./lib/content.js"
import { runValidation } from "./lib/validation.js"

const GENERATED_ROOT = path.join(ROOT_DIR, "generated")
const GENERATED_CONTENT_DIR = path.join(GENERATED_ROOT, "quartz-content")
const GENERATED_GRAPH_PATH = path.join(GENERATED_ROOT, "graph.json")
const RAG_EXPORT_PATH = path.join(ROOT_DIR, "export", "rag.jsonl")
const LLMS_PATH = path.join(ROOT_DIR, "llms.txt")

function normalizeLinkTarget(link, sourceRelPath) {
  if (!link) {
    return ""
  }

  if (/^(https?:|mailto:|#)/i.test(link)) {
    return ""
  }

  let cleaned = link.split("#")[0].trim()
  if (!cleaned) {
    return ""
  }

  if (cleaned.startsWith("/")) {
    cleaned = cleaned.slice(1)
  }

  if (cleaned.startsWith("knowledge/")) {
    return cleaned
  }

  const sourceDir = path.posix.dirname(sourceRelPath)
  const resolved = path.posix.normalize(path.posix.join(sourceDir, cleaned))
  if (resolved.startsWith("knowledge/")) {
    return resolved
  }

  return ""
}

function toRecordsForBook(entry) {
  const overview = getSectionContent(entry.body, "30-Second Overview")
  const summary = getSectionContent(entry.body, "5-Minute Summary")
  const analysis = getSectionContent(entry.body, "Why It Matters")

  return [
    { depth: "overview", text: normalizeWhitespace(overview) },
    { depth: "summary", text: normalizeWhitespace(summary) },
    { depth: "analysis", text: normalizeWhitespace(analysis) }
  ]
}

function toRecordsForMeme(entry) {
  const overview = getSectionContent(entry.body, "What it is")
  const summary = getSectionContent(entry.body, "Where it shows up")
  const analysis = normalizeWhitespace(entry.body)

  return [
    { depth: "overview", text: normalizeWhitespace(overview) },
    { depth: "summary", text: normalizeWhitespace(summary) },
    { depth: "analysis", text: analysis }
  ]
}

function toRecordsForContext(entry) {
  const sections = splitH2Sections(entry.body)
  const overview = sections[0]?.content ?? ""
  const summary = sections[1]?.content ?? ""
  const analysis = sections.slice(2).map((s) => s.content).join("\n\n") || entry.body

  return [
    { depth: "overview", text: normalizeWhitespace(overview) },
    { depth: "summary", text: normalizeWhitespace(summary) },
    { depth: "analysis", text: normalizeWhitespace(analysis) }
  ]
}

function metadataForEntry(entry) {
  return {
    kind: entry.kind,
    type: entry.data.type ?? "",
    era: Array.isArray(entry.data.era) ? entry.data.era : [],
    places: Array.isArray(entry.data.places) ? entry.data.places : [],
    themes: Array.isArray(entry.data.themes) ? entry.data.themes : [],
    status: entry.data.status ?? ""
  }
}

function toRagRecords(entry) {
  let chunks = []
  if (entry.kind === "book") {
    chunks = toRecordsForBook(entry)
  } else if (entry.kind === "meme") {
    chunks = toRecordsForMeme(entry)
  } else {
    chunks = toRecordsForContext(entry)
  }

  return chunks.map((chunk) => ({
    id: `${entry.relPath}#${chunk.depth}`,
    type: entry.kind,
    title: String(entry.data.title ?? ""),
    metadata: metadataForEntry(entry),
    depth: chunk.depth,
    text: chunk.text,
    source_path: entry.relPath
  }))
}

function isPublishedForLlms(entry) {
  if (entry.kind === "book") {
    return entry.data.status === "published"
  }
  return true
}

function withEditLink(body, relPath) {
  const editUrl = buildEditUrl(relPath)
  const marker = "[在 GitHub 上編輯]"
  if (body.includes(marker)) {
    return body
  }
  return `${body.trim()}\n\n---\n\n[在 GitHub 上編輯](${editUrl})\n`
}

function generateLandingPageMarkdown({ counts, generatedAt, repoBaseUrl, branch }) {
  const exploreUrl = "./knowledge/books/"
  const graphViewUrl = "./graph/"
  const knowledgeTreeUrl = `${repoBaseUrl}/tree/${branch}/knowledge`
  const issueUrl = `${repoBaseUrl}/issues/new`
  const pullsUrl = `${repoBaseUrl}/pulls`
  const specUrl = `${repoBaseUrl}/blob/${branch}/docs/spec.md`
  const terminologyUrl = `${repoBaseUrl}/blob/${branch}/TERMINOLOGY.md`
  const contributingUrl = `${repoBaseUrl}/blob/${branch}/CONTRIBUTING.md`
  const noticeUrl = `${repoBaseUrl}/blob/${branch}/NOTICE.md`
  const bookTemplateUrl = `${repoBaseUrl}/blob/${branch}/knowledge/books/_template.md`
  const memeTemplateUrl = `${repoBaseUrl}/blob/${branch}/knowledge/memes/_template.md`
  const contextTemplateUrl = `${repoBaseUrl}/blob/${branch}/knowledge/context/_template.md`
  const generatedDate = new Date(generatedAt).toISOString().slice(0, 10)

  return `---
title: hongkong-book.md
description: 以合法、開放授權方式建立可供人類與 AI 閱讀的香港書籍知識庫
---

# hongkong-book.md

現時訓練大型語言模型的資料，很大程度依賴各類「影子圖書館」，而香港（及台灣）版本的書籍在當中比例極低——這些市場規模相對小，亦相對守法。實際效果是：香港的文學及歷史觀點，在AI對世界的認知圖像中，結構性地缺席——並非出於惡意，只是「不存在」。

[開始探索瀏覽](${exploreUrl}) ｜ [GitHub 專案](${repoBaseUrl})

> ⚠️ 本站部分條目由 AI 輔助產生初稿，現正持續由人手審核改善中。現有試點條目保留 AI 協作註記，並按狀態欄位進入審核流程，歡迎你透過 [Issue](${issueUrl}) 或 [Pull Request](${pullsUrl}) 指正與修訂。

## 如何組成

### 書籍（books）

每本書一個條目，包含書目資料、原創摘要與策展分析，不收錄原書全文。

### 概念母題（memes）

把跨書重複出現的概念連成圖譜，讓虛構與非虛構作品可以互相對讀。

### 脈絡長文（context essays）

補充年代、地點與主題背景，作為延伸閱讀而非取代書籍條目。

詳細欄位與生成規則： [docs/spec.md](${specUrl})。

## 現況

目前為 Phase 0 試點階段。

- 書籍條目：${counts.books}
- 概念母題：${counts.memes}
- 脈絡長文：${counts.context}
- 最後同步：${generatedDate}

## 探索圖譜與原始資料

- [探索知識圖譜](${graphViewUrl})
- [瀏覽 SSOT 原始資料（knowledge/）](${knowledgeTreeUrl})

## 為何採用 zh-HK

本計劃以 zh-HK 作為單一事實來源語言，不是為了把繁體字本身當成宣言，而是為了保留香港語境中實際使用的書寫慣例與詞彙系統。根據 [TERMINOLOGY.md](${terminologyUrl})，新詞拼寫預設採用粵拼（Jyutping），並以香港慣用表達維持條目一致性。這樣做的目的，是讓下游讀者與 AI 系統讀到的不是抽象「中文」，而是可追溯、可維護、屬於香港語境的表述。

## 如何貢獻

貢獻須使用你真實的GitHub身分。本計劃現階段不支援匿名或化名提交。

- [貢獻指南（CONTRIBUTING.md）](${contributingUrl})
- [書籍模板](${bookTemplateUrl})
- [概念模板](${memeTemplateUrl})
- [脈絡模板](${contextTemplateUrl})

## 授權

本庫房原創內容以 CC0 釋出；書籍本身版權不受影響。範圍說明見 [NOTICE.md](${noticeUrl})。
`
}

function generateGraphPageMarkdown({ nodeCount, edgeCount, generatedAt }) {
  const generatedDate = new Date(generatedAt).toISOString()
  return `---
title: 知識圖譜
description: 由 frontmatter 明確連結生成的圖譜視圖與資料檔
---

# 知識圖譜

此頁顯示的關聯只來自明確欄位連結（例如 books 的 memes 參照），不從內文語意推論。

- 節點數：${nodeCount}
- 連線數：${edgeCount}
- 產生時間：${generatedDate}

[下載圖譜資料（graph.json）](../graph.json)
`
}

async function main() {
  const result = await runValidation()

  if (result.failures.length > 0) {
    console.error("\n[失敗] sync 前置驗證未通過：")
    for (const failure of result.failures) {
      console.error(`- ${failure.relPath}: ${failure.reason}`)
    }
    process.exit(1)
  }

  if (result.warnings.length > 0) {
    console.log("\n[警告] sync 持續執行，但請人工覆核以下項目：")
    for (const warning of result.warnings) {
      console.log(`- ${warning.relPath}: ${warning.reason}`)
    }
  }

  const entries = result.entries
  const generatedAt = new Date().toISOString()
  const branch = process.env.HKB_GITHUB_BRANCH ?? "main"
  const repoBaseUrl = resolveEditBaseUrl()
  const entryByPath = new Map(entries.map((entry) => [entry.relPath, entry]))

  const memeBacklinks = new Map(entries.filter((e) => e.kind === "meme").map((e) => [e.slug, []]))
  for (const book of entries.filter((e) => e.kind === "book")) {
    const memeSlugs = Array.isArray(book.data.memes) ? book.data.memes : []
    for (const slug of memeSlugs) {
      if (memeBacklinks.has(slug)) {
        memeBacklinks.get(slug).push(book.relPath)
      }
    }
  }

  const nodes = entries.map((entry) => ({
    id: entry.relPath,
    slug: entry.slug,
    kind: entry.kind,
    title: entry.data.title ?? "",
    source_path: entry.relPath,
    url_path: toEntityUrlPath(entry.relPath)
  }))

  const edges = []
  for (const book of entries.filter((e) => e.kind === "book")) {
    const memeSlugs = Array.isArray(book.data.memes) ? book.data.memes : []
    for (const slug of memeSlugs) {
      const targetPath = `knowledge/memes/${slug}.md`
      if (entryByPath.has(targetPath)) {
        edges.push({
          from: book.relPath,
          to: targetPath,
          kind: "book-meme"
        })
      }
    }
  }

  for (const context of entries.filter((e) => e.kind === "context")) {
    const links = extractMarkdownLinks(context.body)
    for (const link of links) {
      const targetPath = normalizeLinkTarget(link, context.relPath)
      if (!targetPath) {
        continue
      }
      if (entryByPath.has(targetPath)) {
        edges.push({
          from: context.relPath,
          to: targetPath,
          kind: "context-link"
        })
      }
    }
  }

  await fs.rm(GENERATED_CONTENT_DIR, { recursive: true, force: true })
  await ensureDir(GENERATED_CONTENT_DIR)

  for (const entry of entries) {
    const outputPath = path.join(GENERATED_CONTENT_DIR, entry.relPath)
    const data = JSON.parse(JSON.stringify(entry.data ?? {}))

    if (entry.kind === "meme") {
      data.books = (memeBacklinks.get(entry.slug) ?? []).sort((a, b) => a.localeCompare(b, "en"))
    }

    const bodyWithEdit = withEditLink(entry.body, entry.relPath)
    const output = matter.stringify(bodyWithEdit, data)
    await writeTextFile(outputPath, output)
  }

  const graphPayload = {
    generated_at: generatedAt,
    nodes,
    edges
  }
  await writeTextFile(GENERATED_GRAPH_PATH, `${JSON.stringify(graphPayload, null, 2)}\n`)
  await writeTextFile(path.join(GENERATED_CONTENT_DIR, "graph.json"), `${JSON.stringify(graphPayload, null, 2)}\n`)

  const counts = {
    books: entries.filter((entry) => entry.kind === "book").length,
    memes: entries.filter((entry) => entry.kind === "meme").length,
    context: entries.filter((entry) => entry.kind === "context").length
  }

  const landingMarkdown = generateLandingPageMarkdown({
    counts,
    generatedAt,
    repoBaseUrl,
    branch
  })
  await writeTextFile(path.join(GENERATED_CONTENT_DIR, "index.md"), landingMarkdown)

  const graphMarkdown = generateGraphPageMarkdown({
    nodeCount: nodes.length,
    edgeCount: edges.length,
    generatedAt
  })
  await writeTextFile(path.join(GENERATED_CONTENT_DIR, "graph", "index.md"), graphMarkdown)

  const ragRecords = entries.flatMap((entry) => toRagRecords(entry))
  const ragLines = ragRecords.map((record) => JSON.stringify(record)).join("\n")
  await writeTextFile(RAG_EXPORT_PATH, `${ragLines}\n`)

  const siteBaseUrl = (process.env.HKB_SITE_URL ?? "https://example.com").replace(/\/$/, "")
  const llmsLines = [
    "# llms.txt",
    "# 此檔由 tools/sync.js 產生，列出可供 AI 系統抓取的已發布內容。",
    ""
  ]

  for (const entry of entries.filter(isPublishedForLlms)) {
    const title = String(entry.data.title ?? entry.slug)
    const urlPath = toEntityUrlPath(entry.relPath)
    llmsLines.push(`- ${title}: ${siteBaseUrl}${urlPath}`)
  }
  await writeTextFile(LLMS_PATH, `${llmsLines.join("\n")}\n`)

  console.log("\n[完成] sync 輸出已更新：")
  console.log(`- ${path.relative(ROOT_DIR, GENERATED_CONTENT_DIR)}`)
  console.log(`- ${path.relative(ROOT_DIR, GENERATED_GRAPH_PATH)}`)
  console.log(`- ${path.relative(ROOT_DIR, RAG_EXPORT_PATH)}`)
  console.log(`- ${path.relative(ROOT_DIR, LLMS_PATH)}`)
}

main().catch((error) => {
  console.error("\n[錯誤] sync 執行失敗：", error)
  process.exit(1)
})
