# Hong Kong Book SSOT — Project Specification (v0.1)

**Working name:** `hongkong-book.md`
**Storage:** GitHub (public repo)
**Audience:** Human readers *and* AI/LLM systems (RAG + potential fine-tuning), by design

---

## 0. Assumptions made in this draft — please confirm or correct

These weren't settled in our discussion, so I've picked defaults. Flag any you want changed:

| Item | Status | Detail |
|---|---|---|
| Project name | **Resolved** | `hongkong-book.md` |
| Book editions/translations | **Resolved** | One canonical entry per work, `editions:` array — plus a required **Edition Differences** section, see §4 |
| CLI tool (`npx hongkongbookmd` style) | Still assumed | Deferred to post-pilot (Phase 2) — flag if you want it earlier |
| Perspectives panel (contested topics) | Still assumed | Adopted, same pattern as taiwan.md |
| Validation tooling language | Still assumed | Node.js/TypeScript |
| SSOT language | Resolved (earlier round) | zh-HK canonical; English + others generated as translations |

---

## 1. Purpose

A single source of truth for books about Hong Kong (fiction and non-fiction), maintained as structured, lawful, openly-licensed markdown — legible to human readers and directly consumable by AI systems via RAG or future fine-tuning.

**Motivating problem** (per the ckxpress essay this project responds to): shadow libraries that disproportionately train today's LLMs carry very few Hong Kong or Taiwan editions, because these markets are comparatively law-abiding and too small for piracy at scale. The practical effect is that Hong Kong's literary and historical perspective is structurally under-represented in AI's worldview — not through malice, just absence. Lawful, open, AI-readable content is the direct countermeasure. This means **lawfulness of every entry is not a compliance afterthought — it's the entire premise of the project**, and the spec treats it that way throughout.

---

## 2. Content model — three entity types

1. **Books** (primary, first-class) — the catalog: bibliographic fact + original curated analysis. Never the book's own text.
2. **Memes** (cross-cutting concepts) — recurring motifs, idioms, or cultural phenomena that appear across multiple books (e.g. 獅子山精神 Lion Rock Spirit). Many-to-many by nature — a graph problem, not a narrative one.
3. **Context essays** (secondary, optional) — long-form pieces on eras, places, or themes, taiwan.md-style, which cite and link out to relevant books as further reading.

Books stay the entry point. Memes and context essays exist to connect books to each other, not to compete with them as the primary object.

---

## 3. Repository structure

```
hongkong-book-md/
├── knowledge/                         ← SSOT — everything else is generated from this
│   ├── books/
│   │   ├── fiction/
│   │   │   └── {slug}/
│   │   │       ├── index.md           ← required
│   │   │       └── {essay-slug}.md     ← optional, only if it earns a standalone piece
│   │   └── non-fiction/
│   │       └── {slug}/
│   │           └── index.md
│   ├── memes/
│   │   └── {slug}.md
│   └── context/
│       ├── eras/{slug}.md
│       ├── places/{slug}.md
│       └── themes/{slug}.md
│
├── schemas/                           ← JSON Schema — the actual enforcement mechanism
│   ├── book.schema.json
│   ├── meme.schema.json
│   └── context.schema.json
│
├── tools/
│   ├── new-book.js                    ← scaffolds a compliant skeleton file (form-like CLI)
│   ├── validate.js                    ← pre-commit + CI check, shared logic
│   └── sync.js                        ← knowledge/ → site + graph + RAG export + llms.txt
│
├── export/
│   └── rag.jsonl                      ← generated, not hand-edited
│
├── site/                              ← generated site output (build artifact, not SSOT)
│
├── LICENSE                            ← CC0
├── NOTICE.md                          ← disambiguates CC0 scope from quoted-excerpt copyright
├── EDITORIAL.md                       ← review pipeline for the trusted team
├── QUALITY-CHECKLIST.md
├── TERMINOLOGY.md
├── CONTRIBUTING.md
└── llms.txt                           ← generated index for AI crawlers
```

**Why fiction/non-fiction as the physical fork, not era or theme:** it's the one facet that's almost never ambiguous per book. Era and theme are tags, not folders, because a book can span several.

**Why folder-per-book is opt-in, not default:** most books need one file. Promote to a folder only when a book generates a genuinely separate standalone piece (e.g. its specific role in 2019 protest discourse) that deserves its own URL and citations — not for ceremony.

---

## 4. Frontmatter schemas

### Book — `knowledge/books/{fiction|non-fiction}/{slug}/index.md`

```yaml
---
title: ""              # zh-HK, canonical
title_en: ""           # generated translation, not hand-maintained here
author: ""
year: 0
publisher: ""
isbn: ""
type: fiction | non-fiction
era: []                # tags: e.g. [japanese-occupation, handover-1997]
places: []              # e.g. [kowloon-walled-city]
themes: []               # e.g. [identity, migration]
memes: []                # e.g. [lion-rock-spirit] — many-to-many, see §5
editions:                # optional — translations / other editions of the same work
  - lang: en
    title: ""
    year: 0
    publisher: ""
    notes: ""             # one-line flag, e.g. "abridged", "retitled", "chapter 4 removed"
contributors: []         # GitHub usernames — real-name/identity policy per your decision
status: draft | reviewed | published
---

## 30-Second Overview
<!-- one or two sentences -->

## 5-Minute Summary
<!-- original summary, several paragraphs, your own words -->

## Why It Matters
<!-- curated analysis — never verbatim book text -->

## Edition Differences
<!-- Required whenever `editions:` has more than one entry. Document what actually
     changed between editions/translations and, where known, why — retitling,
     abridgment, translation choices, or content altered for a different market
     (e.g. a mainland China edition vs. the original HK edition). This is treated
     as first-class content, not a footnote: for Hong Kong books specifically,
     what was changed between editions is often as informative as the book itself. -->

## Further Reading
<!-- citations, reviews, related context essays -->
```

### Meme — `knowledge/memes/{slug}.md`

```yaml
---
title: ""
title_en: ""
first_documented: 0
themes: []
# books: — do NOT hand-maintain. sync.js generates this from every book's
# `memes:` field via reverse lookup, same mechanism as taiwan.md's backlinks.
---

## What it is
## Where it shows up
```

### Context essay — `knowledge/context/{eras|places|themes}/{slug}.md`

```yaml
---
title: ""
type: era | place | theme
perspectives: []   # optional — required if the topic is politically contested
---
```

---

## 5. Governance — small trusted team model

- A named core team (GitHub org members) holds merge rights; everyone else contributes via PR.
- **Contributor identity: real names / GitHub identity**, matching your decision. Worth flagging explicitly in `CONTRIBUTING.md` so contributors go in with informed consent, given HK's political climate — this is a real tradeoff (traceability and accountability, at the cost of exposure for anyone writing on sensitive topics) and the project should say so plainly rather than leave it implicit.
- `EDITORIAL.md` defines a research → write → verify pipeline (adapted from taiwan.md).
- A `CODEOWNERS` file maps folders to reviewers.
- Any entry touching contested history requires the `perspectives:` field populated and sign-off from ≥2 core team members before merge.

---

## 6. Validation — three layers, before anything is publicly visible

A PR is public the instant it's opened, merged or not — so the check that matters most runs *before* that point, not after.

| Layer | Who | Catches |
|---|---|---|
| `tools/new-book.js` scaffold | Anyone starting a new entry | Compliant by construction: required fields pre-filled, depth-tier sections stubbed with length guidance inline |
| Pre-commit hook (`validate.js` via a git hook) | Contributors editing directly | Schema validation, quote-length ceiling, duplicate ISBN/slug, unresolved `memes:` references |
| CI (GitHub Actions) | Everyone, backstop | Same checks — catches anyone who skipped the hook, plus a full `sync.js` build test |

`validate.js` checks, concretely:
- Frontmatter against `schemas/*.json`
- Any quoted excerpt against a hard word-count ceiling — flagged for manual review, not auto-rejected, since context matters
- Each `memes: [...]` entry resolves to an existing file, or is flagged as "new meme — confirm intentional"
- Summary/overview sections against their depth-tier length caps
- Title+author+ISBN fuzzy-matched against existing entries to catch duplicates pre-submission
- If `editions:` has more than one entry, the `## Edition Differences` section must be non-empty — flagged, not silently allowed to stay blank

---

## 7. Build pipeline — `tools/sync.js`

Single script, single responsibility per output:

1. Parse and validate every file under `knowledge/`.
2. Generate the knowledge graph (nodes: books, memes, context; edges: explicit frontmatter references only — never inferred).
3. Generate site content for the chosen generator (§8).
4. Generate `export/rag.jsonl` — one chunk per depth-tier per entity, with full metadata for pre-filtering (era, type, genre) before semantic search.
5. Generate `llms.txt` indexing all pages.

Because the SSOT lives entirely in `knowledge/` and is generator-agnostic, the site generator (§8) is a swappable output, not a foundational dependency — changing it later means re-pointing `sync.js`, not rewriting the content.

---

## 8. Site generator — recommendation: **Quartz**

You asked for a recommendation, so: **Quartz** for v1.

Reasoning specific to your pilot phase: Quartz ships the knowledge graph, backlinks, and wiki-browsing UX out of the box — exactly what taiwan.md uses, and exactly what a 10–20 book pilot needs without spending build effort re-implementing graph rendering. The genuinely novel work in this project is the schema, validation, and RAG export — none of which depend on the site generator at all (those are custom scripts regardless of what renders the site). Astro with content collections remains a fine option if the team later wants more layout control than Quartz's opinions allow, and switching is a presentation-layer change only, not a content migration, because of point 7 above.

---

## 9. AI/RAG export

- `export/rag.jsonl`: one record per chunk —
  ```json
  {"id": "", "type": "book|meme|context", "title": "", "metadata": {"era": [], "type": "fiction", "themes": []}, "depth": "overview|summary|analysis", "text": "", "source_path": ""}
  ```
- `llms.txt` at repo/site root, generated, indexing all entries for AI crawlers.
- CLI tool (search/RAG mode, like taiwan.md's `npx taiwanmd`) — deferred to Phase 2, per assumption in §0.

---

## 10. License & lawfulness

- **CC0** on all original contributed content (summaries, analysis, meme descriptions) — maximally open, explicitly enabling AI training use, per your decision.
- `NOTICE.md` must disambiguate scope clearly: CC0 covers *original contributor writing*. It does **not** extend to any quoted excerpt from the underlying book — that text remains under the original rights holder's copyright regardless of the repo's license. This distinction needs to be stated plainly, since "the repo is CC0" could otherwise be misread as "anything in the repo is CC0," which isn't true for quoted material.
- `CONTRIBUTING.md` should include a short contributor affirmation: by submitting, the contributor confirms the writing is their own original work, dedicated to CC0, and any quotes fall within fair-dealing limits (research/criticism/review) rather than reproduction.

---

## 11. Pilot plan (10–20 books)

1. Core team selects the seed list.
2. Build `schemas/`, `validate.js`, and a minimal `sync.js` first — before content, so every pilot entry is validated against the real pipeline, not written and retrofitted later.
3. Write and merge the pilot entries under the real review process (§5), treating it as a dry run of governance, not just content.
4. Use pilot friction points to revise the schema before any wider contribution call.

---

## 12. Roadmap

- **Phase 0 (now):** repo scaffold, schemas, `validate.js`, minimal `sync.js`, Quartz site, pilot content (10–20 books).
- **Phase 1:** evaluate pilot learnings; decide whether/when to open beyond the trusted team.
- **Phase 2:** CLI tool, RAG export refinement, `llms.txt` polish.
- **Phase 3:** revisit governance model (open community vs. continued trusted-team) based on Phase 1 evidence.

---

## Open questions still worth deciding before Phase 0 starts

- Confirm the pilot seed list (see `hongkong-book-seed-list.md`) — swap, add, or cut any titles.
- Confirm the site generator recommendation (§8: Quartz).
- Decide timing for the CLI tool (§0 assumes deferred to Phase 2).
