# hongkong-book.md

A single source of truth for books about Hong Kong — fiction and non-fiction — written to be useful to human readers and directly consumable by AI systems (RAG, and potentially fine-tuning) without relying on piracy or copyright infringement.

## Why

Shadow libraries, which disproportionately train today's large language models, carry very few Hong Kong (or Taiwan) editions — these markets are comparatively small and law-abiding. The practical effect is that Hong Kong's literary and historical perspective is structurally under-represented in AI's picture of the world, not through malice, just absence. This project is a lawful, openly-licensed countermeasure: structured, original, AI-readable content about Hong Kong books.

Directly inspired by [taiwan.md](https://taiwan.md), which demonstrated this model works at real scale.

## How it's structured

All content lives under `knowledge/`, as three entity types:

- **`knowledge/books/`** — the primary catalog. One file per book: bibliographic metadata, an original summary, and curated "why it matters" analysis. Never the book's own text.
- **`knowledge/memes/`** — recurring cross-book concepts and cultural motifs (e.g. Lion Rock Spirit), linked to every book that touches them.
- **`knowledge/context/`** — optional long-form essays on eras, places, and themes, citing relevant books as further reading.

Everything else — the website, the knowledge graph, the RAG export, `llms.txt` — is generated from `knowledge/` and shouldn't be edited by hand.

Full architecture and rationale: [`docs/spec.md`](docs/spec.md). Pilot seed list: [`docs/seed-list.md`](docs/seed-list.md).

## Status

**Phase 0 — pilot.** Building a small, curated set of ~10–20 book entries with a small trusted-team review process, to validate the content model before opening contributions more broadly. Build tooling (validation script, site generator) is not wired up yet.

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md). Short version: real-name/GitHub-identity contributions via pull request, reviewed against [`QUALITY-CHECKLIST.md`](QUALITY-CHECKLIST.md).

## License

Original content in this repository is dedicated to the public domain under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). This does **not** extend to quoted excerpts from the books being catalogued — see [`NOTICE.md`](NOTICE.md).
