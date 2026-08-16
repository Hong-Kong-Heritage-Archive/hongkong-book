# hongkong-book.md — Copilot instructions

**What this repo is:** a single source of truth cataloguing books about Hong Kong (fiction and non-fiction), written for both human readers and AI/RAG systems. Content lives entirely under `knowledge/`; everything else (site, graph, RAG export) is generated from it and should not be hand-edited. Full spec: `docs/spec.md`. Full seed list: `docs/seed-list.md`.

**Status:** Phase 0/1 boundary — pilot has grown well past the original 10–20 book target. Don't hardcode a book count here; it goes stale immediately. Check `docs/AI-SESSION-HANDOFF.md`'s "Current state" section for the live number, or better, run `node tools/validate.js` yourself against a fresh pull.

**Build tooling exists and is required, not optional.** `node tools/validate.js` (schema + cross-reference validation) and `node tools/sync.js` (generates the site content, `graph.json`, the RAG export, and `llms.txt` under `generated/`/`export/`) both run from repo root after `npm install`. Run `validate.js` before treating any drafted entry as done — it catches schema violations, isolated entries, and broken cross-references that are easy to miss by eye.

## Repo structure
```
knowledge/books/{fiction|non-fiction}/{slug}/index.md   ← one file per book (primary content)
knowledge/people/{slug}.md                                ← real people: authors, critics, subjects
knowledge/memes/{slug}.md                                 ← recurring cross-book concepts/motifs
knowledge/resources/{slug}.md                              ← where to get a physical copy (library, lending app, bookstore)
knowledge/context/{eras|places|themes}/{slug}.md          ← optional topic essays
```
Five entity types, not four — `resources` was added after this file was first written; if you're working from an older mental model of this repo, re-read `docs/spec.md` §2 rather than assuming books/people/memes/context is still the complete list.

Path-specific rules live in `.github/instructions/*.md` and apply automatically when you're editing files in that folder — read the relevant one before drafting an entry.

## Non-negotiable rules
- **Never reproduce a book's actual text.** Summaries and analysis must be original writing. Short attributed quotes only, and only in service of criticism/commentary — this project exists specifically to demonstrate lawful, non-infringing AI-readable content about Hong Kong books.
- **Every book entry needs frontmatter matching the schema** in `.github/instructions/books.instructions.md` — don't invent or omit fields.
- **Don't fabricate bibliographic facts.** If you're not confident of a year, ISBN, or publisher, leave it blank and add an inline `<!-- verify: ... -->` comment rather than guessing.
- **SSOT language is Hong Kong Traditional Chinese (zh-HK).** Write the canonical content in zh-HK; an `title_en` field exists for reference but full translations are generated, not hand-authored here.
- **All contributions use real GitHub identity**, per project policy — no anonymous/pseudonymous submissions.
- **Content is CC0.** Don't add any per-file license/copyright notices — see `NOTICE.md` for how that interacts with quoted material.
- **No isolated books**, enforced by `tools/validate.js`, not just by convention: every book needs at least one `memes:` entry (now `{slug, relation}`, not a bare string — see `books.instructions.md`) or an `authors:`/`people:` slug matching an *existing* person page. A brand-new plain-name placeholder does not by itself satisfy this.
- **Generated fields are generated, not hand-authored.** `books:` on a meme/person/resource entry, `knowledge/.generated/entity-index.json`, everything under `generated/`/`export/` — these come from `tools/sync.js`. Hand-editing them gets silently overwritten (or, worse, rejected by `validate.js` for `books:` specifically) on the next run.

## When drafting a new entry
Start from the matching template (`knowledge/books/_template.md`, `knowledge/people/_template.md`, `knowledge/memes/_template.md`, `knowledge/resources/_template.md`, or `knowledge/context/_template.md`) rather than writing frontmatter from scratch. A non-technical contributor can also generate a starting prompt for any of the five types via the tool specified in `.github/prompts/contribution-prompt-builder.prompt.md` — point them there instead of walking them through frontmatter by hand.

## Regenerating the site-facing specs when the entity model changes
`.github/prompts/landing-page.prompt.md` and `.github/prompts/scaffold-site.prompt.md` describe the actual site (its landing page, its Quartz-based build, its GitHub-native edit flow) — they are specs for an agent to build from, not a one-time build log. They describe the entity model, templates, and contribution tooling *as of when they were last edited*, so when the entity model changes (new entity type, new frontmatter fields, a new/renamed contribution flow) they can drift out of sync with reality the same way this file itself just did — its "Status" section above previously claimed `validate.js`/`sync.js` didn't exist, well after they'd been built. Before building or rebuilding the site from either spec, diff its description against the current `docs/spec.md` §2–§4 and the current `.github/instructions/*.md` files, and update the spec first if it's describing an older entity model. As of this file's last edit, both specs are current for the five-entity-type model (book/person/meme/resource/context) with typed `memes:`/`related_books:` relations and the multi-type contribution-prompt-builder — if you're reading this later and that's no longer true, that drift is exactly the failure mode this section exists to flag.
