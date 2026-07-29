import fs from "node:fs/promises"
import path from "node:path"

import fg from "fast-glob"
import matter from "gray-matter"

export const ROOT_DIR = process.cwd()
export const KNOWLEDGE_DIR = path.join(ROOT_DIR, "knowledge")

const CONTENT_PATTERNS = [
  "knowledge/books/**/index.md",
  "knowledge/people/*.md",
  "knowledge/memes/*.md",
  "knowledge/context/**/*.md"
]

export async function discoverContentFiles() {
  const files = await fg(CONTENT_PATTERNS, {
    cwd: ROOT_DIR,
    absolute: true,
    onlyFiles: true,
    unique: true
  })
  return files
    .filter((absPath) => path.basename(absPath) !== "_template.md")
    .sort((a, b) => toPosixRelative(a).localeCompare(toPosixRelative(b), "zh-HK"))
}

export function toPosixRelative(absPath) {
  return path.relative(ROOT_DIR, absPath).split(path.sep).join("/")
}

export function detectEntityKind(relPath) {
  if (relPath.startsWith("knowledge/books/")) {
    return "book"
  }
  if (relPath.startsWith("knowledge/people/")) {
    return "person"
  }
  if (relPath.startsWith("knowledge/memes/")) {
    return "meme"
  }
  if (relPath.startsWith("knowledge/context/")) {
    return "context"
  }
  return "unknown"
}

export function parseSlug(relPath, kind) {
  const parts = relPath.split("/")
  if (kind === "book") {
    return parts[3] ?? ""
  }
  if (kind === "person") {
    const filename = parts[parts.length - 1] ?? ""
    return filename.replace(/\.md$/i, "")
  }
  if (kind === "meme" || kind === "context") {
    const filename = parts[parts.length - 1] ?? ""
    return filename.replace(/\.md$/i, "")
  }
  return ""
}

export function parseContextCategory(relPath) {
  const parts = relPath.split("/")
  if (parts.length >= 4) {
    return parts[2]
  }
  return ""
}

export async function parseMarkdownFile(absPath) {
  const raw = await fs.readFile(absPath, "utf8")
  let source = raw

  if (!raw.startsWith("---")) {
    const normalized = raw.replace(/^\uFEFF/, "")
    const stripped = normalized.replace(/^(?:\s*<!--([\s\S]*?)-->\s*)+/, "")
    if (stripped.startsWith("---")) {
      source = stripped
    }
  }

  const parsed = matter(source)
  return {
    data: parsed.data ?? {},
    body: parsed.content ?? "",
    raw
  }
}

export async function loadEntries() {
  const files = await discoverContentFiles()
  const entries = []

  for (const absPath of files) {
    const relPath = toPosixRelative(absPath)
    const kind = detectEntityKind(relPath)
    const slug = parseSlug(relPath, kind)
    const category = kind === "context" ? parseContextCategory(relPath) : ""
    const parsed = await parseMarkdownFile(absPath)

    entries.push({
      absPath,
      relPath,
      kind,
      slug,
      category,
      data: parsed.data,
      body: parsed.body,
      raw: parsed.raw
    })
  }

  return entries
}

export function normalizeWhitespace(text) {
  return String(text ?? "").replace(/\s+/g, " ").trim()
}

export function normalizeComparable(text) {
  return normalizeWhitespace(text)
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
}

export function splitH2Sections(markdown) {
  const lines = String(markdown ?? "").split(/\r?\n/)
  const sections = []
  let current = null

  for (const line of lines) {
    const match = line.match(/^##\s+(.+)\s*$/)
    if (match) {
      if (current) {
        sections.push(current)
      }
      current = {
        heading: match[1].trim(),
        content: []
      }
      continue
    }

    if (current) {
      current.content.push(line)
    }
  }

  if (current) {
    sections.push(current)
  }

  return sections.map((s) => ({
    heading: s.heading,
    content: s.content.join("\n").trim()
  }))
}

export function getSectionContent(markdown, headingName) {
  const target = normalizeComparable(headingName)
  const sections = splitH2Sections(markdown)
  for (const section of sections) {
    if (normalizeComparable(section.heading) === target) {
      return section.content
    }
  }
  return ""
}

export function stripMarkdownNoise(text) {
  return String(text ?? "")
    .replace(/<!--([\s\S]*?)-->/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/[*_>#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export function countWords(text) {
  const words = String(text ?? "").match(/[\p{L}\p{N}]+/gu)
  return words ? words.length : 0
}

export function findLongBlockquotes(markdown, maxWords = 120) {
  const lines = String(markdown ?? "").split(/\r?\n/)
  const warnings = []
  let buffer = []
  let startLine = 0

  function flush() {
    if (!buffer.length) {
      return
    }
    const blockText = buffer
      .map((line) => line.replace(/^>\s?/, ""))
      .join("\n")
    const wordCount = countWords(stripMarkdownNoise(blockText))
    if (wordCount > maxWords) {
      warnings.push({
        line: startLine,
        words: wordCount,
        excerpt: blockText.slice(0, 120)
      })
    }
    buffer = []
    startLine = 0
  }

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]
    if (/^>\s?/.test(line)) {
      if (!buffer.length) {
        startLine = i + 1
      }
      buffer.push(line)
    } else {
      flush()
    }
  }
  flush()

  return warnings
}

export function extractMarkdownLinks(markdown) {
  const text = String(markdown ?? "")
  const links = []
  const regex = /\[[^\]]+\]\(([^)]+)\)/g
  let match

  while ((match = regex.exec(text)) !== null) {
    links.push(match[1].trim())
  }

  return links
}

export function toEntityUrlPath(relPath) {
  if (!relPath.startsWith("knowledge/")) {
    return "/"
  }

  const body = relPath.replace(/^knowledge\//, "")
  if (body.endsWith("/index.md")) {
    return `/${body.replace(/\/index\.md$/, "")}/`
  }
  return `/${body.replace(/\.md$/, "")}/`
}

export function resolveEditBaseUrl() {
  const explicit = process.env.HKB_GITHUB_REPO_URL
  if (explicit) {
    return explicit.replace(/\/$/, "")
  }

  const org = process.env.HKB_GITHUB_ORG ?? "YOUR_ORG"
  const repo = process.env.HKB_GITHUB_REPO ?? "YOUR_REPO"
  return `https://github.com/${org}/${repo}`
}

export function buildEditUrl(relPath) {
  const branch = process.env.HKB_GITHUB_BRANCH ?? "main"
  const base = resolveEditBaseUrl()
  return `${base}/edit/${branch}/${relPath}`
}

export async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true })
}

export async function writeTextFile(absPath, content) {
  await ensureDir(path.dirname(absPath))
  await fs.writeFile(absPath, content, "utf8")
}
