# 編輯流程

Phase 0 治理模式：由小型信任團隊（具合併權限的GitHub組織成員）審核所有貢獻。本文件描述每個條目須經歷的流程，改編自taiwan.md的「研究→撰寫→查證」模式。

## 一、研究

動筆前，先獨立確認基本資料，不憑記憶：書名、作者、年份、出版社、ISBN。若任何一項無法確認，草稿中留空並加上 `<!-- verify -->` 註解——絕不以猜測填補。

## 二、撰寫

以相應範本（`knowledge/books/_template.md`、`knowledge/memes/_template.md` 或 `knowledge/context/_template.md`）為起點撰寫。只寫原創文字——見 `.github/copilot-instructions.md` 中的合法性規則。撰寫期間將 `status` 設為 `draft`。

## 三、查證

審核者於合併前依 `QUALITY-CHECKLIST.md` 檢查條目。對於有多於一個版本的書籍條目，`## Edition Differences` 一節須檢查其實質內容，而非只確認欄位存在。

### 爭議題材聯署要求

任何附有 `## Perspectives` 一節的context文章，或書籍條目中「Why It Matters」觸及爭議歷史的部分，合併前須經**至少兩位核心審核者聯署**，而非單一審核者的判斷即可。這是唯一一處單一審核者的判斷並不足夠的地方。

## Status欄位

- `draft` — 撰寫中，尚未可供審核。
- `reviewed` — 已通過查證，等待合併。
- `published` — 已合併並上線。

## 審核者

Phase 0階段的CODEOWNERS（將資料夾對應至特定審核者）尚待建立——現階段試點規模小，由整個信任團隊共同審核所有內容。待試點完成後重新檢視（見 `docs/spec.md` Phase 1）。
