# 貢獻指南 — hongkong-book.md

多謝你考慮參與。本計劃現處於 **Phase 0 試點階段**——由小型信任團隊逐一人手審核所有內容，以驗證內容模式，故回應時間可能較成熟的開源項目為慢。

## 開始之前

- **貢獻須使用你真實的GitHub身分。** 本計劃現階段不支援匿名或化名提交。考慮到香港的政治環境，這是刻意的取捨——換取可追溯性與問責性，代價是若你書寫敏感題材，身分或會因此曝光。請在充分理解這一點後再決定是否參與。若這是你參與的障礙，請開issue而非直接PR——團隊希望聽到你的想法。
- **提交PR即表示你確認：** 該文字為你原創寫作，你願意將其貢獻至CC0公有領域，並且任何引文均在合理使用（研究、評論）範圍之內，而非重製原文。詳見 `NOTICE.md`。

## 新增一本書

1. 先檢查是否已存在——以書名／作者／ISBN搜尋 `knowledge/books/`。
2. 複製 `knowledge/books/_template.md` 至 `knowledge/books/fiction/{slug}/index.md` 或 `knowledge/books/non-fiction/{slug}/index.md`。
3. 依 `.github/instructions/books.instructions.md` 填寫frontmatter及內文。
4. 若對某項事實（年份、ISBN、出版社）沒有把握，留空並加上 `<!-- verify -->` 註解，不要憑猜測填寫——審核者會跟進查證。
5. 開PR。若引用了尚未存在的 `memes:` 標籤，請在PR描述中註明。

## 新增一個meme／概念

複製 `knowledge/memes/_template.md`。先檢查 `knowledge/memes/` 中是否已有相同概念、只是用了不同slug。

## 新增一篇context文章

複製 `knowledge/context/_template.md`。若題材具政治或歷史爭議性，須加入 `## Perspectives` 一節——見 `.github/instructions/context.instructions.md`。

## 審核流程

完整流程見 `EDITORIAL.md`。簡言之：研究→撰寫→查證，涉及爭議題材的條目須經兩位核心審核者聯署通過。審核者依 `QUALITY-CHECKLIST.md` 進行審核。
