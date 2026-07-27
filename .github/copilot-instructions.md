# hongkong-book.md — Copilot instructions

**What this repo is:** a single source of truth cataloguing books about Hong Kong (fiction and non-fiction), written for both human readers and AI/RAG systems. Content lives entirely under `knowledge/`; everything else (site, graph, RAG export) is generated from it and should not be hand-edited. Full spec: `docs/spec.md`. Full seed list: `docs/seed-list.md`.

**Status:** Phase 0 — pilot of 10–20 books, small trusted-team review. No build tooling (`validate.js`, `sync.js`) exists yet; don't invent commands to run them.

## Repo structure
```
knowledge/books/{fiction|non-fiction}/{slug}/index.md   ← one file per book (primary content)
knowledge/memes/{slug}.md                                 ← recurring cross-book concepts/motifs
knowledge/context/{eras|places|themes}/{slug}.md          ← optional topic essays
```
Path-specific rules live in `.github/instructions/*.md` and apply automatically when you're editing files in that folder — read the relevant one before drafting an entry.

## Non-negotiable rules
- **Never reproduce a book's actual text.** Summaries and analysis must be original writing. Short attributed quotes only, and only in service of criticism/commentary — this project exists specifically to demonstrate lawful, non-infringing AI-readable content about Hong Kong books.
- **Every book entry needs frontmatter matching the schema** in `.github/instructions/books.instructions.md` — don't invent or omit fields.
- **Don't fabricate bibliographic facts.** If you're not confident of a year, ISBN, or publisher, leave it blank and add an inline `<!-- verify: ... -->` comment rather than guessing.
- **SSOT language is Hong Kong Traditional Chinese (zh-HK).** Write the canonical content in zh-HK; an `title_en` field exists for reference but full translations are generated, not hand-authored here.
- **All contributions use real GitHub identity**, per project policy — no anonymous/pseudonymous submissions.
- **Content is CC0.** Don't add any per-file license/copyright notices — see `NOTICE.md` for how that interacts with quoted material.

## When drafting a new entry
Start from the matching template (`knowledge/books/_template.md`, `knowledge/memes/_template.md`, or `knowledge/context/_template.md`) rather than writing frontmatter from scratch.
