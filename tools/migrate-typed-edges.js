#!/usr/bin/env node
//
// 一次性遷移腳本：將所有 book 的 memes: 欄位由純字串陣列改為 {slug, relation} 物件陣列。
// 執行一次即可，不屬於 tools/sync.js 或 tools/validate.js 的常規流程一部分。
// 所有既有連結的隱含意義皆為 exemplifies（此欄位過去唯一的意涵），因此遷移時一律指定
// relation: exemplifies；本腳本不會嘗試自動判斷 subverts / critiques / originates，
// 那需要人工覆核個別書目與母題文本的實際論述方式。
//
// One-time migration script: converts every book's memes: field from a bare-string
// array into an array of {slug, relation} objects. Run once; not part of the regular
// tools/sync.js or tools/validate.js pipeline. Every existing link's implicit meaning
// is exemplifies (the only meaning this field carried before), so the migration always
// assigns relation: exemplifies. This script does not attempt to auto-infer subverts /
// critiques / originates — that requires a human actually reading how each book and
// meme talk about each other, the same "verify, don't pattern-match" discipline this
// project already applies to fabricated-fact checks.

import fs from "node:fs/promises"
import path from "node:path"

import fg from "fast-glob"
import { ROOT_DIR, parseMarkdownFile } from "./lib/content.js"

const SUBVERSION_HINT_WORDS = ["顛覆", "反轉", "推翻", "質疑", "批判", "挑戰", "複雜化"]
const ORIGIN_HINT_WORDS = ["首見", "首次", "最早", "首度提出", "本站原創"]

function buildMemesBlock(slugs) {
  const lines = slugs.map((slug) => `  - slug: ${slug}\n    relation: exemplifies`)
  return `memes:\n${lines.join("\n")}\n`
}

async function loadMemeShowsUpText(slug) {
  const memePath = path.join(ROOT_DIR, "knowledge", "memes", `${slug}.md`)
  try {
    const parsed = await parseMarkdownFile(memePath)
    const match = parsed.body.match(/##\s*Where it shows up([\s\S]*?)(\n##\s|\n?$)/)
    return match ? match[1] : ""
  } catch {
    return ""
  }
}

async function main() {
  const files = await fg(["knowledge/books/**/index.md"], { cwd: ROOT_DIR, absolute: true })
  files.sort()

  let migratedCount = 0
  let skippedAlreadyTyped = 0
  let skippedEmpty = 0
  const flags = []

  for (const absPath of files) {
    const parsed = await parseMarkdownFile(absPath)
    const raw = parsed.raw
    const relPath = path.relative(ROOT_DIR, absPath).split(path.sep).join("/")
    const memes = parsed.data.memes

    if (!Array.isArray(memes) || memes.length === 0) {
      skippedEmpty += 1
      continue
    }

    if (typeof memes[0] === "object") {
      skippedAlreadyTyped += 1
      continue
    }

    const slugs = memes.map((slug) => String(slug))

    // 舊格式有兩種：單行 flow-style（memes: [a, b, c]）或多行 block-style
    // （memes:\n  - a\n  - b）。兩者皆可安全地以區段取代方式處理，不需要完整
    // 重新序列化整個 frontmatter，避免影響其他欄位的既有排版。
    // The legacy format is either single-line flow-style (memes: [a, b, c]) or
    // multi-line block-style (memes:\n  - a\n  - b). Both can be safely replaced
    // as a targeted span, avoiding a full frontmatter re-serialization that would
    // reformat unrelated fields.
    const flowPattern = /^memes:\s*\[[^\]]*\]\r?\n?/m
    const blockPattern = /^memes:\n(?:[ \t]*-[ \t]*.+\r?\n?)+/m

    let matchedPattern = null
    if (flowPattern.test(raw)) {
      matchedPattern = flowPattern
    } else if (blockPattern.test(raw)) {
      matchedPattern = blockPattern
    } else {
      console.warn(`[跳過／skip] ${relPath}：memes: 不是預期的格式，請人工處理 / not an expected format, handle manually`)
      continue
    }

    const updated = raw.replace(matchedPattern, buildMemesBlock(slugs))
    await fs.writeFile(absPath, updated, "utf8")
    migratedCount += 1

    for (const slug of slugs) {
      const showsUpText = await loadMemeShowsUpText(slug)

      const hasSubversionHint = SUBVERSION_HINT_WORDS.some((w) => showsUpText.includes(w))
      const hasOriginHint = ORIGIN_HINT_WORDS.some((w) => showsUpText.includes(w))

      if (hasSubversionHint || hasOriginHint) {
        flags.push({
          book: relPath,
          slug,
          suggestion: hasOriginHint ? "originates？" : "subverts／critiques？"
        })
      }
    }
  }

  console.log(`\n[完成／done] 已遷移 ${migratedCount} 個檔案，已是新格式 ${skippedAlreadyTyped} 個，無 memes 可遷移 ${skippedEmpty} 個。`)
  console.log(`[done] Migrated ${migratedCount} files, already-typed ${skippedAlreadyTyped}, nothing to migrate ${skippedEmpty}.`)

  if (flags.length > 0) {
    console.log(`\n[建議人工覆核／flagged for human review] 以下書目-母題配對的母題文本含有暗示非 exemplifies 關係的字眼，全部已先遷移為 exemplifies，請自行判斷是否要改：`)
    for (const flag of flags) {
      console.log(`- ${flag.book} ↔ ${flag.slug}（建議檢查是否應為 ${flag.suggestion}）`)
    }
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
