# Session summary — 2026-08-16 (contribution tooling)

6 files. Everything else on GitHub was pulled fresh and left untouched.

## Before applying: a pattern worth your attention

This is the **third time this session** something I confirmed as pushed turns out not to have
landed on GitHub:
1. `tools/lib/validation.js`'s author-field fix (caught, re-included, re-confirmed present today).
2. `.github/instructions/resources.instructions.md` — the whole file was simply absent. Re-included
   in this diff.
3. `knowledge/.generated/entity-index.json` — this one's sneakier: the file **exists**, so my
   quick existence check earlier today said "present" — but its *content* is still the stale
   16-entity version from early in the project, not last session's regenerated 73-entity version.
   I only caught this by diffing content, not just checking the file was there. Re-included here,
   regenerated fresh via `tools/sync.js` against the current 37-book corpus.

I can't diagnose the root cause from here (partial patch application, a merge conflict resolved
the wrong way, something in however the diffs are being applied) — but three instances in one
session is a pattern, not a fluke. Worth checking your apply process, especially for anything
under `knowledge/.generated/` or `.github/instructions/`. I'd suggest, after applying this diff,
doing a plain `git status` / `git diff` review before committing rather than trusting that a
copy-paste or patch-apply step got everything — cheaper than another silent gap surfacing next
session.

## What changed

**`.github/prompts/contribution-prompt-builder.prompt.md`** — full rewrite. Was book-only;
now specs a single tool (`/contribute/new`, one page with a type switcher, not five separate
pages, since all five flows share the same entity-index fetch, search-picker component, and
prompt-assembly mechanism) covering all five entity types:

- **§1 Book** — kept, but the old single "existing meme or propose new meme" choice is now a
  repeatable list with five options (existing meme / propose new meme / existing person slug /
  new-face plain-name placeholder / promote an existing placeholder to a real person page). The
  important detail, since this was the actual ask: **option D (new-face placeholder) alone does
  not satisfy "no isolated entries"** — per `books.instructions.md`, only a slug matching an
  *existing* person page counts as a real connection, so the UI has to make clear that a
  brand-new author name still needs a meme (existing or proposed) to go with it. Option E (person
  promotion) is the compound case — it's flagged as producing a 3-file output (new book + new
  person page + an edit to the *other* existing book that already had this person as a
  placeholder), not just the new book.
- **§2 Person** — new. Not a blank-page form — framed correctly as a promotion flow, since
  `people.instructions.md`'s bar is 2+ existing books before a real page is warranted. Form asks
  the contributor to identify those 2 books (the picker can't find them itself — plain-name
  placeholders inside other books' frontmatter aren't in the entity index, said explicitly in the
  spec so whoever builds this doesn't assume otherwise). Generated prompt asks for 3 files: new
  person page + edits to both source books.
- **§3 Meme** — new. Centers the fact-based vs. original-argument branching from
  `memes.instructions.md` as the single most important form field, not an afterthought — flagged
  in the spec as "the most-violated convention in the project's history" per
  `AI-SESSION-HANDOFF.md`'s own notes, so the tool shouldn't be the thing that makes that worse.
  Connects to 1+ existing books with a relation dropdown (exemplifies/originates/subverts/
  critiques, matching this session's earlier typed-edges work).
- **§4 Resource** — new. Same promotion-flow shape as §2.
- **§5 Context essay** — new. Type (era/place/theme), and the contested-topic → required
  `## Perspectives` section branching from `context.instructions.md`, with the 2-reviewer
  sign-off surfaced as an informational note, not something the tool gates on (it can't know
  whether a reviewer will agree the topic is contested).

**`CONTRIBUTING.md`** — added two sections that were **completely missing**: 新增人物 and 新增資源
(both entity types existed in schema/tooling since last session but had zero contributor-facing
guidance in the main doc). Every "新增 X" section now links to the generalized tool instead of
only the book section doing so.

**`.github/prompts/landing-page.prompt.md`** — small fix: its template list mentioned people but
not resources; now lists all five, and notes the tool covers all five types.

**`.github/prompts/scaffold-site.prompt.md`** — small fix: the GitHub-native edit-link partial
was scoped in prose to "every book/meme/context page," missing person/resource pages even though
the mechanism is fully generic. Now says all five.

## Verified before packaging

`node tools/validate.js` and `node tools/sync.js` both run clean — these changes don't touch
`knowledge/` content, only `.github/` specs and `CONTRIBUTING.md`, so this was mainly confirming
nothing broke. The regenerated `entity-index.json` was spot-checked against the live corpus count
(37 books + memes + people + context essays = 73 entities, 0 resources since none exist yet).
