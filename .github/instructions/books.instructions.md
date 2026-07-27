---
applyTo: "knowledge/books/**/*.md"
---

# Book entries

Copy `knowledge/books/_template.md` as the starting point. Required frontmatter:

```yaml
title: ""              # zh-HK, canonical
title_en: ""            # reference only — full translation is generated elsewhere
author: ""
year: 0
publisher: ""
isbn: ""                 # leave blank + <!-- verify --> comment if unsure, don't guess
type: fiction | non-fiction
era: []                   # from the canonical list in TERMINOLOGY.md — don't invent new era tags without checking there first
places: []
themes: []
memes: []                 # reference existing knowledge/memes/*.md slugs; propose a new one in the PR description if it doesn't exist yet, don't just invent the slug silently
editions:                  # only if more than one edition/translation exists
  - lang: en
    title: ""
    year: 0
    publisher: ""
    notes: ""
contributors: []
status: draft
```

## Body sections, in order
1. `## 30-Second Overview` — one or two sentences.
2. `## 5-Minute Summary` — original prose, several short paragraphs. Never a scene-by-scene retelling detailed enough to substitute for reading the book.
3. `## Why It Matters` — curated analysis: why this book belongs in a Hong Kong book catalog. Original commentary, not summary restated.
4. `## Edition Differences` — **required and must be non-empty if `editions:` has more than one entry.** Document what actually changed between editions (retitling, abridgment, content altered for a different market) and why, if known. Omit this section entirely if there's only one edition.
5. `## Further Reading` — citations/reviews. Any quoted excerpt must be short, attributed, and in service of criticism — not a way to reconstruct the book.

## Don't
- Don't hand-write a long verbatim passage from the book, even inside a blockquote.
- Don't leave `status: draft` when the entry looks complete — that field drives the review queue.
- Don't shard by era or theme in the folder path — those are tags (`era: []`, `themes: []`), not folders. The only folder-level split is `fiction` / `non-fiction`.
