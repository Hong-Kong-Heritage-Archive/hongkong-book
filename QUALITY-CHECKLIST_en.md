# Quality checklist

Used by reviewers before merging any entry under `knowledge/`. This is the human-run version of what `validate.js` will eventually automate (see `docs/spec.md`, §6/§7 — not built yet in Phase 0).

## Every entry

- [ ] Frontmatter is complete and matches the schema in the relevant `.github/instructions/*.md` file.
- [ ] No field contains a guessed fact — anything uncertain is blank with a `<!-- verify -->` comment, and that's been chased down before merge (not left for later).
- [ ] Writing is original. No verbatim passage from the book, even a short one presented as a blockquote.
- [ ] Any quoted excerpt is short, attributed, and serves criticism/commentary rather than substituting for the source.
- [ ] `status:` field reflects reality (not left on `draft` if the entry is actually complete).
- [ ] Title/author/ISBN checked against existing entries — this isn't a duplicate under a different slug.

## Book entries specifically

- [ ] All three body sections present: 30-Second Overview, 5-Minute Summary, Why It Matters.
- [ ] If `editions:` has more than one entry, `## Edition Differences` is present **and substantive** — not a placeholder sentence.
- [ ] `era:` tags match the canonical list in `TERMINOLOGY.md` — no ad hoc new era tags without checking there first.
- [ ] Every `memes:` reference resolves to an existing file in `knowledge/memes/`, or the PR description flags it as a proposed new meme.

## Meme entries specifically

- [ ] Doesn't duplicate an existing meme under a different slug.
- [ ] `books:` field is absent or untouched by the contributor (it's generated).

## Context essays specifically

- [ ] If the topic is politically or historically contested, `## Perspectives` is present, and two core reviewers have signed off (see `EDITORIAL.md`).
- [ ] Doesn't restate a book's summary — links to the book entry instead.
