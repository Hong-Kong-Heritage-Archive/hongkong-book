# Session summary — 2026-08-16

48 files changed/new. Everything else on GitHub was pulled fresh and left untouched.

## Before applying: a gap you should know about, unrelated to this session's build

Diffing against a fresh pull surfaced two things worth flagging on their own:

1. **`tools/lib/validation.js`'s author-field fix from the 2026-08-15 session never actually
   landed on GitHub**, despite being confirmed pushed. 4 of that session's 5 files made it; this
   one didn't (cause unknown — partial apply, a missed hunk, doesn't matter). Re-applied here.
   Lesson for next time, added to `AI-SESSION-HANDOFF.md`: verify a push with a fresh pull, don't
   trust "already fixed" from earlier in the same session.
2. **`knowledge/.generated/entity-index.json` on GitHub is badly stale** — 16 entities, dating
   from early in the project before most of the current 37 books existed. It's supposed to be
   regenerated and committed by `tools/sync.js` each time, and either that step got skipped
   repeatedly or an old commit never got superseded. This diff includes the full regeneration
   (78 entities: all books/memes/people/context essays, per the current corpus). Practical
   effect if this had gone unnoticed: the contribution-prompt-builder tool, whenever it's built,
   would only let contributors connect a new book to 16 old entities instead of the real 37+.

## Typed `memes:` edges — the agreed plan

- `schemas/book.schema.json` — `memes:` is now `{slug, relation}[]` instead of a bare-string
  array. `relation` is one of `exemplifies` (default — what every existing entry already meant),
  `originates`, `subverts`, `critiques`. Every description field is bilingual zh-HK/English per
  your instruction.
- `tools/lib/content.js` — new exported `getBookMemeRefs(entry)`, normalizes either the new
  shape or a legacy bare string (defensive, shouldn't be needed post-migration but matches the
  existing `getBookAuthors` legacy-field pattern). `tools/lib/validation.js` and `tools/sync.js`
  both read memes through this now instead of touching `entry.data.memes` directly.
- `tools/migrate-typed-edges.js` — one-time script, not part of the regular pipeline. Converted
  all 35 books that had a `memes:` field (2 books connect via `people:`/`authors:` only, nothing
  to migrate). Hit two real bugs while building it, both caught before the final run, not after:
  gray-matter was silently returning empty frontmatter on every file with a leading HTML comment
  (fixed by reusing the existing `parseMarkdownFile` helper, which already handles this), and a
  newline-handling bug briefly corrupted one file into `exemplifiesediting: []` on one line
  (fixed, then re-ran from a full reset rather than patching over the bad state). Final run: 35
  migrated, verified by diffing every single changed file — every hunk touches only the `memes:`
  field, confirmed with an automated check, nothing else moved.
- **4 books flagged for your review, not auto-changed:** `love-in-a-fallen-city`,
  `portrait-of-fierce-women`, `the-fall-of-hong-kong` → `first-generation` (script noticed
  origin-suggesting language, currently left as `exemplifies`, maybe `originates`);
  `millennium-blackout` → `individual-vs-system` (currently `exemplifies`, maybe
  `subverts`/`critiques`). The script deliberately didn't decide these itself.
- `graph.json` edges now carry `relation` for `book-meme` edges.

## `related_books:` — book-to-book relations

New optional field, separate from `memes:` since "criticizes/inherits/responds_to/fictionalizes"
describes a book's relation to *another book*, not to a motif. `{slug, relation}[]`, relation one
of `fictionalizes`/`responds_to`/`inherits`/`criticizes`. Declared on one side only — the reverse
view is derived automatically into `graph.json` as a `book-book` edge, no matching entry needed
on the other book. Validated (self-reference and missing-slug checks) and smoke-tested with both
a broken and a valid reference before being reverted out of the actual content — **zero books
have this populated yet**, it's pure plumbing right now. Worth a look once you're populating it:
`i-read-jin-yong` (倪匡's commentary on Jin Yong) plausibly `responds_to` the Jin Yong novels
already catalogued, and `detective-cha-chaan-teng-soul` plausibly `inherits` from
`detective-cha-chaan-teng` (same anthology series) — flagging as candidates, not adding myself.

## `availability:` — ecopy status and physical-access resources

New optional field. `ecopy: available | unavailable | unknown`; if `unavailable`,
`physical_access[]` is required to have at least one entry (`type`, `name`, optional `url`/
`notes`/`slug`) — enforced by `validate.js`, same pattern as `editions:` requiring an `## Edition
Differences` section. Smoke-tested the same way as `related_books:`, then reverted — zero books
populated yet.

## `knowledge/resources/` — new 5th entity type

Per your instruction: same promotion pattern as `knowledge/people/`. A book's
`physical_access[].name` stays a plain-text placeholder on its own; once the same resource is
cited by 2+ books, it gets promoted to `knowledge/resources/{slug}.md`, and books switch to
referencing it via the new optional `physical_access[].slug` (keeping `name` for display).
Built: `schemas/resource.schema.json`, `knowledge/resources/_template.md`, wired into
`tools/lib/content.js`'s entity discovery, `tools/sync.js`'s backlink generation (`books:` field,
generated only, hand-authoring it is rejected same as memes'), and `graph.json`'s new
`book-resource` edge kind. End-to-end smoke-tested (created a real resource, linked a book to it
by slug, confirmed the backlink and graph edge generated correctly, confirmed both the
hand-authored-`books:`-field ban and the broken-slug-reference check actually fire), then
reverted the test data — **zero resource pages exist yet**, nothing needed one.

## Docs updated to match

- `.github/instructions/books.instructions.md` — new frontmatter reference for `memes:`,
  `related_books:`, `availability:`, plus three new "Don't" bullets.
- `.github/instructions/resources.instructions.md` — new file, mirrors
  `people.instructions.md`'s structure and tone.
- `.github/prompts/contribution-prompt-builder.prompt.md` — added the new schema/instructions
  URLs to the reference list the tool points a contributor's AI at. Didn't rewrite the tool's
  logic beyond that; the tool itself still isn't built (this file is a spec for one), and a full
  rewrite of its flow to account for typed relations felt like separate work from what was asked.
- `docs/spec.md` — §2 now five entity types, §3's repo tree includes `people/`, `resources/`,
  the two new schemas, and `migrate-typed-edges.js`, §4's book schema box updated. **Flagging,
  not fixing:** this document was already stale before this session in ways unrelated to today's
  work (e.g. it still shows `author: ""` singular where the real schema has used `authors: []`
  for a while) — added a note pointing at `schemas/book.schema.json` as the actual source of
  truth rather than trying to reconcile every pre-existing drift in the same pass.
- `docs/AI-SESSION-HANDOFF.md` — current-state numbers, the scope decision (books-only, other HK
  culture content goes in a separate knowledge base — your call from earlier this session), a new
  quality-discipline lesson about verifying pushes, and the open items above.

## Verified before packaging

`node tools/validate.js` and `node tools/sync.js` both run clean against the full result (only
the three expected Ni Kuang fuzzy-dup warnings, which are correct, not an error). Every book
file's diff independently re-verified against a fresh pull immediately before packaging, not just
trusted from earlier in the session.
