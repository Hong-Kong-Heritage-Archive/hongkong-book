# Contributing to hongkong-book.md

Thanks for considering it. This is currently a **Phase 0 pilot** — a small trusted team is reviewing everything by hand while we validate the content model, so response times may be slower than a mature open-source project.

## Before you start

- **Contributions use your real GitHub identity.** This project doesn't currently support anonymous or pseudonymous submissions. Given Hong Kong's political climate, this is a deliberate tradeoff — traceability and accountability, at the cost of exposure if you're writing about sensitive topics. Go in with that understood. If this is a blocker for you, please open an issue rather than a PR — the team wants to hear about it.
- **By submitting a PR, you're confirming:** the writing is your own original work, you're dedicating it to CC0, and any quoted excerpt falls within fair-dealing limits (research, criticism, or review) rather than reproduction. See `NOTICE.md`.

## Adding a book

1. Check it doesn't already exist — search `knowledge/books/` by title/author/ISBN first.
2. Copy `knowledge/books/_template.md` into `knowledge/books/fiction/{slug}/index.md` or `knowledge/books/non-fiction/{slug}/index.md`.
3. Fill in the frontmatter and body per `.github/instructions/books.instructions.md`.
4. If you're not confident of a fact (year, ISBN, publisher), leave it blank with a `<!-- verify -->` comment rather than guessing — a reviewer will chase it down.
5. Open a PR. If it references a `memes:` tag that doesn't exist yet, say so in the PR description.

## Adding a meme/concept

Copy `knowledge/memes/_template.md`. Check `knowledge/memes/` first to make sure it doesn't already exist under a different slug.

## Adding a context essay

Copy `knowledge/context/_template.md`. If the topic is politically or historically contested, include the `## Perspectives` section — see `.github/instructions/context.instructions.md`.

## Review process

See `EDITORIAL.md` for the full pipeline. In short: research → write → verify, with contested-topic entries requiring sign-off from two core reviewers. Reviewers use `QUALITY-CHECKLIST.md`.
