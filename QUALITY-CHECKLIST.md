# 品質檢查清單

審核者於合併 `knowledge/` 下任何條目前使用此清單。這是 `validate.js`（見 `docs/spec.md` §6/§7）未來將自動化執行的人手版本。

## 所有條目

- [ ] Frontmatter完整，並符合相應 `.github/instructions/*.md` 中的schema。
- [ ] 沒有任何欄位是憑空猜測的事實——凡不確定者均留空並附 `<!-- verify -->` 註解，且合併前已完成查證（不留待日後處理）。
- [ ] 文字為原創寫作。沒有任何一句取自書籍原文的逐字段落，即使以引用區塊呈現亦然。
- [ ] 任何引文均簡短、有標明出處，並服務於評論／分析目的，而非取代原文閱讀。
- [ ] `status:` 欄位反映實際狀態（條目已完成則不應仍為 `draft`）。
- [ ] 已核對書名／作者／ISBN與現有條目，確認並非以不同slug重複收錄。

## 書籍條目專項

- [ ] 三個內文段落齊備：30-Second Overview、5-Minute Summary、Why It Matters。
- [ ] 若 `editions:` 有多於一項，`## Edition Differences` 存在**且內容充實**——並非流於形式的一句話。
- [ ] `era:` 標籤符合 `TERMINOLOGY.md` 中的標準清單——未經查核不擅自新增年代標籤。
- [ ] 每個 `memes:` 引用均能對應至 `knowledge/memes/` 中實際存在的檔案，或PR描述中已註明為建議新增的meme。

## Meme條目專項

- [ ] 沒有以不同slug重複收錄既有meme。
- [ ] `books:` 欄位維持空白或未被貢獻者更動（此欄位為自動生成）。

## Context文章專項

- [ ] 若題材具政治或歷史爭議性，`## Perspectives` 一節存在，且已有兩位核心審核者聯署（見 `EDITORIAL.md`）。
- [ ] 沒有重述書籍摘要——而是連結至該書條目。
