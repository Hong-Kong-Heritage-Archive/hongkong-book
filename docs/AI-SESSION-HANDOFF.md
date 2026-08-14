<!-- Meant to be read by an AI assistant (Claude or otherwise) at the start of a session on
     this repo, not just a human. If you're an AI reading this: read it fully before touching
     any files. -->

# AI Session Handoff — hongkong-book.md

This file exists so a **new chat session** can pick up this project without re-deriving decisions already made. It's not a full history — that lives in `docs/spec.md` (architecture) and `docs/seed-list.md` (content tracking, kept up to date turn by turn). This file is the operational layer: how to actually work on this repo session to session, and the hard-won lessons that aren't written down anywhere else.

## How to start a new session on this repo

Say something like: *"Continue work on https://github.com/Hong-Kong-Heritage-Archive/hongkong-book — read `docs/AI-SESSION-HANDOFF.md`, `docs/spec.md`, and `docs/seed-list.md` first."* That's enough. Everything else below is what the assistant should already be doing once it's read this.

## The working workflow — this is the part that actually matters

**GitHub is the source of truth, not the assistant's local sandbox or memory.** This became necessary after a sandbox reset mid-session lost local state, and separately after multiple rounds of content being added directly on GitHub outside of chat. The workflow that resulted:

1. **Before generating or editing anything**, pull the repo fresh:
   ```
   curl -sL "https://codeload.github.com/Hong-Kong-Heritage-Archive/hongkong-book/tar.gz/refs/heads/main" -o repo.tar.gz
   tar xzf repo.tar.gz && mv hongkong-book-main github-source
   ```
   (`codeload.github.com` avoids the API rate limits `api.github.com` hits quickly. Both are reachable directly from the sandbox — no need to route through the browser-facing fetch tool, which also can't fetch arbitrary GitHub URLs without them appearing in a prior search result anyway.)
2. **Work in a copy of that fresh pull**, not a stale local directory.
3. **Before presenting anything back**, diff the working copy against the fresh pull. Only package files that are genuinely new or changed:
   ```
   for f in $(find working-copy -type f); do
     rel="${f#working-copy/}"
     diff -q "$f" "github-source/$rel" >/dev/null 2>&1 || echo "$rel"
   done
   ```
4. **Present only the diff**, zipped, with a plain-language summary of what changed and why. Never re-upload content that's already correct on GitHub — the person applies the diff themselves (PR, direct commit, whatever their process is).

This matters more than it sounds like it should. Content has been added directly on GitHub, outside of chat, several times — sometimes well (new books, new person pages, genuine improvements the assistant should adopt), sometimes with real problems (schema violations, missing required disclosures, at least one case of fabricated book titles cited as fact). Always diff before assuming the assistant's last-known state is current, and always actually read new content someone else added rather than trusting a summary of it.

## Quality discipline — lessons paid for the hard way

- **Two entity types for connections: `authors:`/`people:` slugs vs. plain-name-string placeholders.** A person gets a real page (`knowledge/people/{slug}.md`) once they connect to **2 or more** already-catalogued books or memes — not before. Don't create stub person pages just because someone seems important; wait for the second real connection.
- **Every meme is either fact-based or an original argument, and must say which.** Fact-based memes (a treaty, a ban, a monument) state their claim with normal confidence. Original-argument memes — anything this project is proposing itself, not reporting — must open with an explicit "this is this site's own framing, not established consensus" disclosure, every time, no exceptions. This got violated more than once by content added directly on GitHub; it's the single most important convention to enforce on any new meme.
- **Don't force a connection because it's thematically adjacent.** Same place, same author, same rough era — none of that is sufficient on its own. Check the actual claimed mechanism. Several proposed connections got rejected or split into separate memes specifically because "related" isn't "the same claim" (e.g. `sai-gaai-jai` vs `zaap-ga`, `individual-vs-system` vs `shadow-of-globalization`).
- **Corrections stay visible, not silent.** When new sourcing changes an earlier judgment (e.g. 命運 and 新年 both got corrected after a real academic source turned up), the file keeps a strikethrough and explanation rather than quietly rewriting history.
- **Verify specific facts, don't pattern-match.** At least two fabricated book titles made it into meme files (attributed to a real author, but not present in his actual bibliography anywhere checked) before being caught by actually looking them up rather than trusting confident-sounding prose. Confident, detailed, specific-sounding text is not the same thing as sourced text.
- **No isolated books.** Every new book needs at least one populated `memes:` or `people:`/`authors:` connection to something already in the knowledge base. This is enforced in `.github/instructions/books.instructions.md` and should be by `tools/validate.js` once built.
- **zh-HK is the SSOT language for all content.** Root docs, book/meme/person/context bodies — all zh-HK canonical. `.github/instructions/*.instructions.md` (schema/field-name references for Copilot) are the one exception, since those are technical reference, not prose.

## Current state (as of this snapshot — always verify against the live repo, don't trust this number)

36 books, 23 memes, 13 people, 3 context essays. Full breakdown with rationale for every non-obvious connection: `docs/seed-list.md`.

## Phase 1 — open items

Per `docs/spec.md`'s roadmap: evaluate pilot learnings from Phase 0, decide whether/when to open contribution beyond the trusted team, and revisit governance based on how the pilot actually went. Concretely, still outstanding:

- `schemas/book.schema.json`, `schemas/meme.schema.json`, `schemas/context.schema.json` don't exist yet (`schemas/people.schema.json` does, and is the reference pattern to follow).
- `tools/validate.js` isn't built — the "no isolated books," disclosure-requirement, and duplicate-detection rules are currently enforced by convention and manual review only, not automated.
- The contribution-prompt-builder tool (`.github/prompts/contribution-prompt-builder.prompt.md`) depends on `knowledge/.generated/entity-index.json` from `tools/sync.js` — confirm this is actually wired up before pointing contributors at it.
- No CLI tool yet (deferred to Phase 2 per the original spec).
- The pilot's real size has grown well past the original 10–20 book target — worth deciding whether that changes the Phase 1 timeline for opening up contribution, or whether the trusted-team model should just continue longer.
