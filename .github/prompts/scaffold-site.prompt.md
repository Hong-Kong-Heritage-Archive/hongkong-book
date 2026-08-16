---
description: "Scaffold the hongkong-book.md website: JSON schemas, the validate/sync build pipeline, a Quartz-based site reading from knowledge/, GitHub Pages deployment, and an in-browser edit-and-open-PR flow for readers."
mode: agent
---

# Task: build Phase 0 site infrastructure for hongkong-book.md

Read `docs/spec.md` and `TERMINOLOGY.md` first — they're the source of truth for every field name and rule below. Don't invent fields that aren't already documented in `.github/instructions/*.instructions.md`; those files define the actual frontmatter contract for books/memes/context and must stay in sync with the schemas you create here.

This is greenfield tooling — `knowledge/` already contains real pilot content (see `docs/seed-list.md`), but no build tooling exists yet. Build in this order, since each step depends on the last:

## 1. JSON Schemas (`schemas/`)

`schemas/people.schema.json` already exists — use it as the reference pattern (field style, description conventions, the `additionalProperties: false` discipline) rather than inventing a different style for the rest. Create `schemas/book.schema.json`, `schemas/meme.schema.json`, `schemas/context.schema.json`, matching the frontmatter fields documented in the corresponding `.github/instructions/*.instructions.md` file exactly — field names, required vs. optional, enums (e.g. `type: fiction | non-fiction`, `status: draft | reviewed | published`). Note that `book.schema.json` must include `authors: []` and `people: []` (arrays that accept either a `knowledge/people/` slug or a plain-name-string placeholder — see `.github/instructions/books.instructions.md` for why both are valid) — this isn't legacy, it's the current real schema, don't design around an older single `author:` string field. These schemas are the actual enforcement mechanism referenced throughout `docs/spec.md` §6.

## 2. `tools/validate.js`

Node script, run both locally (pre-commit) and in CI. For every file under `knowledge/books/**/index.md`, `knowledge/memes/*.md`, `knowledge/context/**/*.md`:

- Parse frontmatter (use `gray-matter`) and validate against the matching schema (use `ajv`).
- Flag any quoted excerpt over a conservative word-count ceiling for manual review — don't auto-reject, this needs human judgment.
- For books: if `editions` has more than one entry, confirm a non-empty `## Edition Differences` section exists in the body.
- For books: confirm every slug in `memes: [...]` resolves to an existing file in `knowledge/memes/`, or is flagged in the diff as new.
- For books: for each entry in `authors: [...]` and `people: [...]`, check whether it matches an existing `knowledge/people/{slug}.md` file. If it doesn't, that's fine (plain-name placeholders are allowed — see `.github/instructions/people.instructions.md`), but if it's a plain name that *does* match an existing person page's `name:` field under a different string form, flag it — that's a book that should have been updated to use the slug instead of staying on the placeholder.
- **No isolated books.** For every book, confirm at least one of `memes: [...]`, or `authors:`/`people:` slugs resolving to an existing person page, is non-empty. A book with none of these populated fails validation — see the "No isolated entries" rule in `.github/instructions/books.instructions.md`.
- Fuzzy-match title/author/ISBN against existing entries to catch likely duplicates.
- Exit non-zero on any failure, with file path + specific reason in the output — this drives both the pre-commit hook and the CI check.

## 3. `tools/sync.js`

The single build script everything else depends on. Responsibilities, in order:

1. Walk `knowledge/`, parse and validate every entry (reuse `validate.js`'s parsing — don't duplicate it).
2. Build the knowledge graph: nodes are books/memes/context entries; edges come **only** from explicit frontmatter references (a book's `memes: [...]`, a context essay's implied links) — never inferred from prose. For each meme, compute its reverse-linked book list from every book's `memes` field, and make that available to the site templates (e.g. as generated JSON) — meme `.md` files themselves are never written to.
3. Prepare a build-time content directory for the site generator: copy `knowledge/` into it, excluding every `_template.md`, and inject each meme's generated backlink list where the template expects it.
4. Generate `export/rag.jsonl` — one record per depth-tier (overview/summary/analysis) per entity, each with full metadata (`era`, `type`, `themes`, etc.) for pre-filtering before semantic search.
5. Generate `llms.txt` at the site root, indexing every published entry.
6. Generate a lightweight entity index (e.g. `knowledge/.generated/entity-index.json`) listing every published book/meme/person with its slug, title, type, and file path — this is separate from the RAG export (which is chunked prose for embedding); this one is a plain flat list a client-side tool can search over. It's a build-time dependency of `.github/prompts/contribution-prompt-builder.prompt.md` — that tool's picker UI reads this file rather than hardcoding or re-deriving the list itself.

## 4. Site generator: Quartz

Set up Quartz, pointed at the content directory `sync.js` prepares (not `knowledge/` directly, since Quartz's content folder shouldn't contain `_template.md` files or raw unprocessed meme frontmatter). Reasoning for Quartz over alternatives is in `docs/spec.md` §8 — don't relitigate it, just implement it.

## 5. The "propose an edit" UI — use GitHub's native edit flow, not a custom backend

This is the actual requirement behind "let readers open a PR from the site": every rendered page needs a visible "在 GitHub 上編輯" (Edit on GitHub) link pointing to:

```
https://github.com/{org}/{repo}/edit/main/knowledge/{path-to-that-entry's-source-file}
```

Clicking it opens GitHub's own web editor — GitHub auto-forks for anyone without write access, and saving there opens a PR automatically. No custom form, no backend, no auth to build or maintain — this is deliberate, not a shortcut: less infrastructure for a small trusted team to operate, and it's the same mechanism most docs sites (Docusaurus, VitePress, Quartz's own ecosystem) use for exactly this purpose. Add this as a small template partial/component so it appears on every page across all five entity types (book, meme, person, resource, context), deriving the source path from the page's own frontmatter/location rather than hardcoding per-page.

## 6. GitHub Actions

- `.github/workflows/validate.yml` — on every PR touching `knowledge/**`, run `node tools/validate.js`, fail the check on any error.
- `.github/workflows/deploy.yml` — on push to `main`, run `tools/sync.js`, build the Quartz site, deploy to GitHub Pages.

## 7. `package.json` scripts

`validate`, `sync`, `build` (sync + Quartz build), `dev` (local preview). Keep these names — `CONTRIBUTING.md` and `EDITORIAL.md` will eventually reference them by these exact names.

## Constraints

- Don't change any frontmatter field names or folder structure already established in `knowledge/` or documented in `.github/instructions/*.instructions.md` — if something genuinely needs to change, flag it, don't silently rename.
- Don't build a custom contribution form or CMS backend for step 5 — that's explicitly out of scope for Phase 0; the GitHub-native edit link is the whole requirement.
- Root-level docs (`README.md`, `CONTRIBUTING.md`, etc.) are canonically in Traditional Chinese (zh-HK) — any new user-facing text this task generates (e.g. the edit-link label, build error messages meant for contributors) should match that, not default to English.
