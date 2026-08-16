# 貢獻指南 — hongkong-book.md

多謝你考慮參與。本計劃現處於 **Phase 0 試點階段**——由小型信任團隊逐一人手審核所有內容，以驗證內容模式，故回應時間可能較成熟的開源項目為慢。

## 開始之前

- **貢獻須使用你真實的GitHub身分。** 本計劃現階段不支援匿名或化名提交。考慮到香港的政治環境，這是刻意的取捨——換取可追溯性與問責性，代價是若你書寫敏感題材，身分或會因此曝光。請在充分理解這一點後再決定是否參與。若這是你參與的障礙，請開issue而非直接PR——團隊希望聽到你的想法。
- **提交PR即表示你確認：** 該文字為你原創寫作，你願意將其貢獻至CC0公有領域，並且任何引文均在合理使用（研究、評論）範圍之內，而非重製原文。詳見 `NOTICE.md`。

## 新增一本書

**新書必須連結至知識庫中至少一個現有條目**——透過 `memes:`、`people:`，或指向現有人物頁面的 `authors:` slug 皆可。完全孤立、與現有內容毫無連結的新書條目不會被接受，因為這正正違背了meme／people層存在的意義。若想不到新書該如何連結，可以使用[貢獻提示產生工具](#不熟悉格式使用貢獻提示產生工具)（見下）幫忙尋找合適的連結點，或者一併提出新 meme／升級現有人物頁面。

1. 檢查是否已存在——以書名／作者／ISBN搜尋 `knowledge/books/`。
2. 複製 `knowledge/books/_template.md` 至 `knowledge/books/fiction/{slug}/index.md` 或 `knowledge/books/non-fiction/{slug}/index.md`。
3. 依 `.github/instructions/books.instructions.md` 填寫frontmatter及內文。`memes:` 現在每項須附 `relation`（見該檔案說明）。
4. 若對某項事實（年份、ISBN、出版社）沒有把握，留空並加上 `<!-- verify -->` 註解，不要憑猜測填寫——審核者會跟進查證。
5. 開PR。若引用了尚未存在的 `memes:` 標籤，請在PR描述中註明。

## 新增人物

人物頁面**不是**隨意可建立的獨立條目——一個人物必須已經在**2 本或以上**現有書籍中出現（作為作者或被討論的對象），先以純文字姓名作佔位符即可，達到門檻後才升級為正式頁面 `knowledge/people/{slug}.md`。這樣做是為咗避免同一人物嘅簡介喺唔同書目檔案中重複貼上、逐漸失去同步。

1. 確認此人物已在2本或以上現有書籍中以純文字姓名出現。
2. 複製 `knowledge/people/_template.md`，依 `.github/instructions/people.instructions.md` 填寫。
3. **同時修改**上述現有書籍，將其 `authors:`/`people:` 中的純文字姓名改為新建立的 slug。
4. 若人物生平涉及具爭議性的政治或法律歷史，須依 `.github/instructions/people.instructions.md`「Political sensitivity」一節處理，並經兩位核心審核者聯署方可合併。
5. 開PR（新人物頁面及修改現有書籍可合併或分開提交）。

不確定點寫？可用[貢獻提示產生工具](#不熟悉格式使用貢獻提示產生工具)，選擇「人物」分頁。

## 新增一個meme／概念

複製 `knowledge/memes/_template.md`。先檢查 `knowledge/memes/` 中是否已有相同概念、只是用了不同slug。

**最重要的規定**：每個 meme 必須表明自己是 fact-based（可查證的歷史事實）定 original-argument（本站自行提出的詮釋框架）——後者必須喺「## What it is」開頭明確聲明並非既有共識，詳見 `.github/instructions/memes.instructions.md`。混淆兩者、以事實的語氣陳述本站自己的論述，是本知識庫歷來最常被違反的規定。

不確定如何選擇、或想順便連結至現有書籍？可用[貢獻提示產生工具](#不熟悉格式使用貢獻提示產生工具)，選擇「Meme／概念」分頁。

## 新增資源

資源頁面（圖書館、借閱平台、書店等）與人物頁面同一邏輯：純文字佔位符優先，達到**2 本或以上**書籍引用同一資源時，才升級為正式頁面 `knowledge/resources/{slug}.md`。詳見 `.github/instructions/resources.instructions.md`。

不確定點寫？可用[貢獻提示產生工具](#不熟悉格式使用貢獻提示產生工具)，選擇「資源」分頁。

## 新增一篇context文章

複製 `knowledge/context/_template.md`。若題材具政治或歷史爭議性，須加入 `## Perspectives` 一節——見 `.github/instructions/context.instructions.md`。不確定題材是否具爭議性時，預設加入該節較為安全，審核時刪走比事後補寫容易。

想連結至相關現有書籍、或不確定格式？可用[貢獻提示產生工具](#不熟悉格式使用貢獻提示產生工具)，選擇「Context 文章」分頁。

### 不熟悉格式？使用貢獻提示產生工具

網站上的〈生成貢獻提示〉工具（見首頁或 [contribution-prompt-builder](.github/prompts/contribution-prompt-builder.prompt.md)）涵蓋以上全部五種條目類型（書籍、人物、meme／概念、資源、context文章），可協助你：選定想新增的類型，填寫已知資料，選定連結方式（包括提出全新 meme、或升級現有人物／資源頁面），工具會自動組合出一段完整提示文字，供你複製並貼到任何AI聊天工具（如ChatGPT、Claude等），請AI代為生成符合本站格式的Markdown檔案初稿——涉及升級人物／資源頁面時，AI亦會一併生成需要修改的現有書籍檔案內容。生成後，你仍需按上述步驟檢查、開PR——這個工具只是幫你寫出格式正確的初稿，不代替人手審核流程。

## 審核流程

完整流程見 `EDITORIAL.md`。簡言之：研究→撰寫→查證，涉及爭議題材的條目須經兩位核心審核者聯署通過。審核者依 `QUALITY-CHECKLIST.md` 進行審核。
