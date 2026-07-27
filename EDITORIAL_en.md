# Editorial pipeline

Phase 0 governance model: a small trusted team (GitHub org members with merge rights) reviews all contributions. This document describes the pipeline every entry goes through, adapted from taiwan.md's research → write → verify model.

## 1. Research

Before drafting, confirm the basics independently of memory: title, author, year, publisher, ISBN. If any of these can't be confirmed, they stay blank in the draft with a `<!-- verify -->` comment — never filled with a best guess.

## 2. Write

Draft using the relevant template (`knowledge/books/_template.md`, `knowledge/memes/_template.md`, or `knowledge/context/_template.md`). Original writing only — see the lawfulness rules in `.github/copilot-instructions.md`. Set `status: draft` while in progress.

## 3. Verify

A reviewer checks the entry against `QUALITY-CHECKLIST.md` before merge. For book entries with more than one edition, the `## Edition Differences` section is checked for substance, not just presence.

### Contested-topic sign-off

Any context essay carrying a `## Perspectives` section, or any book entry whose "Why It Matters" touches contested history, requires **sign-off from at least two core reviewers**, not one, before merge. This is the one place a single reviewer's judgment isn't sufficient on its own.

## Status field

- `draft` — in progress, not ready for review.
- `reviewed` — passed the checklist, awaiting merge.
- `published` — merged and live.

## Reviewers

CODEOWNERS mapping folders to specific reviewers is TBD for Phase 0 — the whole trusted team reviews everything while the pilot is small. Revisit once the pilot's done (see `docs/spec.md`, Phase 1).
