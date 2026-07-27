---
description: "Design and build the hongkong-book.md landing page — objective, how it works, how to contribute, and a clear path into the GitHub repo. Structurally modeled on taiwan.md's homepage, scaled honestly to a Phase 0 pilot."
mode: agent
---

# Task: build the landing page

This is the page a stranger reaches first, before reading a single book entry. Look at taiwan.md's current homepage (https://taiwan.md) directly for structural reference — but taiwan.md has 867+ articles, 67 contributors, and years of real usage behind it. This project has ~5 pilot entries and no public users yet. Borrow the *patterns*, not the *scale* — a landing page that performs taiwan.md's maturity before earning it would undercut the exact lawfulness/honesty premise this project exists for. Every section below says explicitly whether it's usable now or deferred.

## Sections to build now

1. **Hero** — objective stated in one or two sentences, pulled from `README.md`'s "為何要做這件事" verbatim in meaning (don't reword it differently here — keep the framing consistent site-wide). One primary CTA ("開始探索瀏覽" → into `knowledge/books`) and one secondary ("GitHub 專案" → the repo). No fabricated tagline aiming for taiwan.md's polish ("策展島嶼的深度敘事") — write something that's actually true of a 5-entry pilot.

2. **AI-assistance disclosure banner** — taiwan.md has one of these near the top ("本站部分文章由 AI 輔助產生初稿...歡迎指正"), and it maps *exactly* onto this project's own convention: every pilot entry is already marked `status: draft` with an AI-assistance comment at the top of the file. Surface that honestly on the homepage itself, with a link to open an issue/PR for corrections — don't bury it in individual files only.

3. **How it's structured** — three cards: books / memes / context essays, one line each (not the full schema), linking to `docs/spec.md` for detail. This replaces taiwan.md's 4-card "為什麼需要 Taiwan.md" value-prop section — write hongkong-book.md's actual differentiators (lawful/CC0, fiction+non-fiction together, the meme graph linking across genres) rather than porting taiwan.md's wording.

4. **Current status, pulled from real data** — book/meme/context counts, sourced from `tools/sync.js`'s build-time output, never hardcoded. State plainly this is a Phase 0 pilot. Do not display contributor counts, "N readers", or anything resembling taiwan.md's stats unless the number is real and current.

5. **Explore the meme graph** — link to the generated knowledge graph view (see `scaffold-site.prompt.md` step 3) and a direct link to browse `knowledge/` on GitHub itself, same as taiwan.md's "📂 瀏覽 SSOT 原始資料" link. This is the single most important link on the page — the repo *is* the product.

6. **Why zh-HK** — adapt taiwan.md's "為什麼用繁體中文" section, but don't just copy its reasoning wholesale: taiwan.md's point is that Traditional Chinese is Taiwan's distinguishing script. That argument doesn't map directly here — Hong Kong's distinguishing feature is spoken/written Cantonese conventions within Traditional Chinese, not the script itself (mainland Taiwan also uses Traditional Chinese). Write this section's reasoning from `TERMINOLOGY.md`'s actual Jyutping/zh-HK conventions, not a reskinned version of taiwan.md's argument.

7. **How to contribute** — state plainly that contributions use real GitHub identity, same wording as `CONTRIBUTING.md` — don't soften it here just because it's the marketing-facing page. Link to `CONTRIBUTING.md` and the templates.

8. **License footer** — CC0, linking to `NOTICE.md` for the scope caveat (books' own copyright is untouched — don't let the footer imply blanket public-domain status).

## Sections to explicitly skip for now — don't build these yet

- **Testimonials wall.** taiwan.md's is full of real, named quotes accumulated over time. Do not fabricate placeholder testimonials to fill this space. Add it back only once real ones exist.
- **Live commit/activity feed.** Meaningful at 867 articles and daily contributor activity; noise at 5 pilot entries with no public contributors yet.
- **"Digital organism" health dashboard** (taiwan.md's 心臟/免疫系統/DNA metaphor). This is taiwan.md's own house style for communicating system maturity — it's not a pattern to inherit, and it would read as costume on a project this size.
- **Newsletter signup.** Premature without an audience to send to.
- **Multi-language switcher.** The project's translation pipeline isn't built yet (see `docs/spec.md` §7/§12 roadmap) — a language switcher with nothing behind it is worse than no switcher.
- **"5 articles in 30 minutes" curated starter path** — genuinely nice pattern, but needs enough entries to curate a real path from. Revisit once the pilot has grown past its first ~20 entries.

## Constraints

- Copy in zh-HK throughout, consistent with every other root document — see `TERMINOLOGY.md`.
- This is the Quartz site's entry point (`index.md` or equivalent), built by the same pipeline as every other page — not a separately hosted marketing page.
- Every number on this page must trace back to something `tools/sync.js` actually computed. If a section needs a number that doesn't exist yet, cut the section rather than estimate.
