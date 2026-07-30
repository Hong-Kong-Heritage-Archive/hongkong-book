import fs from "node:fs/promises"
import path from "node:path"

import Ajv2020 from "ajv/dist/2020.js"

import {
  ROOT_DIR,
  findLongBlockquotes,
  getSectionContent,
  loadEntries,
  normalizeComparable,
  stripMarkdownNoise
} from "./content.js"

function levenshtein(a, b) {
  const aa = String(a ?? "")
  const bb = String(b ?? "")
  if (!aa.length) {
    return bb.length
  }
  if (!bb.length) {
    return aa.length
  }

  const dp = Array.from({ length: aa.length + 1 }, () => Array(bb.length + 1).fill(0))
  for (let i = 0; i <= aa.length; i += 1) {
    dp[i][0] = i
  }
  for (let j = 0; j <= bb.length; j += 1) {
    dp[0][j] = j
  }

  for (let i = 1; i <= aa.length; i += 1) {
    for (let j = 1; j <= bb.length; j += 1) {
      const cost = aa[i - 1] === bb[j - 1] ? 0 : 1
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      )
    }
  }

  return dp[aa.length][bb.length]
}

async function loadSchema(schemaPath) {
  const fullPath = path.join(ROOT_DIR, schemaPath)
  const raw = await fs.readFile(fullPath, "utf8")
  return JSON.parse(raw)
}

function formatAjvPath(instancePath) {
  if (!instancePath) {
    return "frontmatter"
  }
  return `frontmatter${instancePath}`
}

function nonEmptySection(text) {
  return stripMarkdownNoise(text).length > 0
}

function asArray(value) {
  return Array.isArray(value) ? value : []
}

function getBookAuthors(entry) {
  const authors = asArray(entry.data.authors)
  if (authors.length > 0) {
    return authors
  }

  const legacyAuthor = String(entry.data.author ?? "").trim()
  return legacyAuthor ? [legacyAuthor] : []
}

function getBookPeople(entry) {
  return asArray(entry.data.people)
}

function normalizeNameKey(value) {
  return normalizeComparable(value)
}

function buildPersonLookup(entries) {
  const personEntries = entries.filter((entry) => entry.kind === "person")
  const bySlug = new Map(personEntries.map((entry) => [entry.slug, entry]))
  const byName = new Map()

  for (const person of personEntries) {
    for (const candidate of [person.data.name, person.data.name_en]) {
      const key = normalizeNameKey(candidate)
      if (!key) {
        continue
      }
      if (!byName.has(key)) {
        byName.set(key, person)
      }
    }
  }

  return { bySlug, byName }
}

function resolvePersonReference(reference, lookup) {
  if (!reference) {
    return { kind: "empty" }
  }

  if (lookup.bySlug.has(reference)) {
    return { kind: "slug", person: lookup.bySlug.get(reference) }
  }

  const normalized = normalizeNameKey(reference)
  if (lookup.byName.has(normalized)) {
    return { kind: "name", person: lookup.byName.get(normalized) }
  }

  return { kind: "unknown" }
}

export async function runValidation(options = {}) {
  const quoteLimit = Number.isFinite(options.quoteLimit) ? Number(options.quoteLimit) : 120
  const entries = await loadEntries()
  const failures = []
  const warnings = []

  const bookSchema = await loadSchema("schemas/book.schema.json")
  const memeSchema = await loadSchema("schemas/meme.schema.json")
  const contextSchema = await loadSchema("schemas/context.schema.json")
  const peopleSchema = await loadSchema("schemas/people.schema.json")

  const ajv = new Ajv2020({ allErrors: true, strict: false, coerceTypes: true })
  const validators = {
    book: ajv.compile(bookSchema),
    meme: ajv.compile(memeSchema),
    context: ajv.compile(contextSchema),
    person: ajv.compile(peopleSchema)
  }

  const memeSlugs = new Set(entries.filter((e) => e.kind === "meme").map((e) => e.slug))
  const personLookup = buildPersonLookup(entries)

  for (const entry of entries) {
    if (!validators[entry.kind]) {
      continue
    }

    const ok = validators[entry.kind](entry.data)
    if (!ok) {
      for (const error of validators[entry.kind].errors ?? []) {
        failures.push({
          relPath: entry.relPath,
          reason: `Schema 驗證失敗: ${formatAjvPath(error.instancePath)} ${error.message ?? ""}`.trim()
        })
      }
    }

    for (const quote of findLongBlockquotes(entry.body, quoteLimit)) {
      warnings.push({
        relPath: entry.relPath,
        reason: `引用段落字數偏長（第 ${quote.line} 行約 ${quote.words} 字），請人工覆核是否符合引用比例` 
      })
    }

    if (entry.kind === "book") {
      const editions = asArray(entry.data.editions)
      if (editions.length > 1) {
        const editionDiff = getSectionContent(entry.body, "Edition Differences")
        if (!nonEmptySection(editionDiff)) {
          failures.push({
            relPath: entry.relPath,
            reason: "editions 多於一項時，必須提供非空的 ## Edition Differences 章節"
          })
        }
      }

      const memes = asArray(entry.data.memes)
      for (const slug of memes) {
        if (!memeSlugs.has(slug)) {
          failures.push({
            relPath: entry.relPath,
            reason: `memes 引用不存在: ${slug}（請先建立 knowledge/memes/${slug}.md）`
          })
        }
      }

      const authors = getBookAuthors(entry)
      const people = getBookPeople(entry)
      let hasResolvedPersonLink = false

      for (const [fieldName, values] of [
        ["authors", authors],
        ["people", people]
      ]) {
        for (const reference of values) {
          const resolution = resolvePersonReference(reference, personLookup)
          if (resolution.kind === "slug") {
            hasResolvedPersonLink = true
            continue
          }

          if (resolution.kind === "name") {
            failures.push({
              relPath: entry.relPath,
              reason: `${fieldName} 使用了可對應現有人物頁的名稱「${reference}」，請改用 slug「${resolution.person.slug}」`
            })
          }
        }
      }

      if (memes.length === 0 && !hasResolvedPersonLink) {
        failures.push({
          relPath: entry.relPath,
          reason: "book 必須透過 memes: 或 authors:/people: slug 連結至至少一個現有條目"
        })
      }
    }

    if (entry.kind === "meme") {
      if (Object.prototype.hasOwnProperty.call(entry.data, "books")) {
        failures.push({
          relPath: entry.relPath,
          reason: "meme frontmatter 不應包含 books 欄位；此欄位由 sync.js 生成"
        })
      }
    }
  }

  const books = entries.filter((e) => e.kind === "book")
  const isbnMap = new Map()
  const exactMap = new Map()

  for (const book of books) {
    const isbn = normalizeComparable(book.data.isbn)
    if (isbn) {
      if (!isbnMap.has(isbn)) {
        isbnMap.set(isbn, [])
      }
      isbnMap.get(isbn).push(book)
    }

    const key = `${normalizeComparable(book.data.title)}::${normalizeComparable(getBookAuthors(book).join(" / "))}`
    if (!exactMap.has(key)) {
      exactMap.set(key, [])
    }
    exactMap.get(key).push(book)
  }

  for (const [isbn, list] of isbnMap.entries()) {
    if (list.length > 1) {
      const paths = list.map((item) => item.relPath).join("、")
      failures.push({
        relPath: list[0].relPath,
        reason: `可能重複條目：ISBN ${isbn} 同時出現在 ${paths}`
      })
    }
  }

  for (const list of exactMap.values()) {
    if (list.length > 1) {
      const paths = list.map((item) => item.relPath).join("、")
      failures.push({
        relPath: list[0].relPath,
        reason: `可能重複條目：相同書名及作者出現在 ${paths}`
      })
    }
  }

  for (let i = 0; i < books.length; i += 1) {
    for (let j = i + 1; j < books.length; j += 1) {
      const a = books[i]
      const b = books[j]
      const authorA = normalizeComparable(getBookAuthors(a).join(" / "))
      const authorB = normalizeComparable(getBookAuthors(b).join(" / "))
      if (!authorA || !authorB || authorA !== authorB) {
        continue
      }

      const titleA = normalizeComparable(a.data.title)
      const titleB = normalizeComparable(b.data.title)
      if (!titleA || !titleB || titleA === titleB) {
        continue
      }

      const distance = levenshtein(titleA, titleB)
      const threshold = Math.max(2, Math.floor(Math.min(titleA.length, titleB.length) * 0.15))
      if (distance <= threshold) {
        warnings.push({
          relPath: a.relPath,
          reason: `疑似重複（模糊比對）: ${a.data.title} ↔ ${b.data.title}（作者同為 ${a.data.author}）`
        })
      }
    }
  }

  return {
    entries,
    failures,
    warnings
  }
}
