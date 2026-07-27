# hongkong-book.md

一個以香港書籍為題的單一事實來源（Single Source of Truth）——涵蓋虛構與非虛構作品——寫給人類讀者，同時可直接供AI系統（RAG，未來或會用於微調）使用，毋須依賴盜版或侵犯版權。

## 為何要做這件事

現時訓練大型語言模型的資料，很大程度依賴各類「影子圖書館」，而香港（及台灣）版本的書籍在當中比例極低——這些市場規模相對小，亦相對守法。實際效果是：香港的文學及歷史觀點，在AI對世界的認知圖像中，結構性地缺席——並非出於惡意，只是「不存在」。本計劃正是要以合法、開放授權的方式，提供這一缺口的對策：結構化、原創、可供AI閱讀的香港書籍內容。

直接啟發自 [taiwan.md](https://taiwan.md)，該計劃已在實際規模上證明此模式可行。

## 結構

所有內容存放於 `knowledge/` 之下，分為三種實體類型：

- **`knowledge/books/`** — 主要目錄。每本書一個檔案：書目資料、原創摘要，以及策展式的「為何重要」分析。絕不收錄書籍本身的文字內容。
- **`knowledge/memes/`** — 跨書籍反覆出現的概念與文化母題（例如獅子山精神），與所有涉及該概念的書籍互相連結。
- **`knowledge/context/`** — 選用的長文，探討年代、地點及主題，並引用相關書籍作延伸閱讀。

其餘一切——網站、知識圖譜、RAG匯出、`llms.txt`——皆由 `knowledge/` 自動生成，不應手動編輯。

完整架構及理據：[`docs/spec.md`](docs/spec.md)。試點書單：[`docs/seed-list.md`](docs/seed-list.md)。

## 現況

**Phase 0 — 試點階段。** 正建立約10至20本書的小規模試點條目，由小型信任團隊審核，以驗證內容模式，其後才考慮開放更廣泛的貢獻。建置工具（驗證腳本、網站產生器）尚未搭建完成。

## 貢獻

見 [`CONTRIBUTING.md`](CONTRIBUTING.md)。簡言之：以真實GitHub身分透過pull request貢獻，並依 [`QUALITY-CHECKLIST.md`](QUALITY-CHECKLIST.md) 審核。

## 授權

本庫房內的原創內容，依 [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) 貢獻至公有領域。此授權並不延伸至被收錄書籍本身的引文——見 [`NOTICE.md`](NOTICE.md)。
