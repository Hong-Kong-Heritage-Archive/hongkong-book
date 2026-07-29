---
applyTo: "knowledge/books/**/*.md"
---

# Book entries

**No isolated entries.** Every new book must connect to at least one entity already in the knowledge base, through `memes: [...]`, `people: [...]`, or an `authors:` slug that matches an existing person page. A book with all three empty (or only plain-name placeholders nobody else references) is not ready to merge — it's a disconnected island in the graph, which defeats the point of the meme/people layers existing at all. This is checked by `tools/validate.js`, not just a style suggestion. If a genuinely new book doesn't obviously connect to anything yet, that's a sign to look harder for the connection (an era, a place, a person, a recurring motif) before submitting — see the prompt-assisted helper described in `docs/spec.md` and built via `.github/prompts/contribution-prompt-builder.prompt.md`, which exists specifically to make finding that connection easier for non-technical contributors.

Copy `knowledge/books/_template.md` as the starting point. Required frontmatter:

```yaml
title: ""              # zh-HK, canonical
title_en: ""            # reference only — full translation is generated elsewhere
authors: []              # list of knowledge/people/ slugs. If a person doesn't have a page
                          # yet, a plain name string is an acceptable placeholder — but once
                          # a page exists for them, switch every book referencing them to the
                          # slug, don't leave it on the plain-name fallback.
people: []                # OPTIONAL. Real people who are significant subjects discussed in
                           # the book — not its author(s). E.g. a critical biography's subject.
                           # Same slug-or-placeholder rule as authors:. See
                           # .github/instructions/people.instructions.md for the distinction.
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
