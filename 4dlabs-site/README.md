# 4Dlabs 官網初稿 (draft v0.1)

依《4Dlabs 官網修改建議書》(v1.0, 2026-07-31) 製作的網站初稿。
純靜態、無建置工具——直接用瀏覽器開啟 `index.html` 即可預覽。

```sh
open 4dlabs-site/index.html
```

## 檔案

| 檔案 | 內容 |
|---|---|
| `index.html` | 全站單頁（語意化 HTML、SEO/OG meta、favicon 內嵌） |
| `styles.css` | Design tokens、CTA 系統、RWD（375/768/1280/1536 已驗證無水平溢出） |
| `app.js` | 漸進增強：手機選單、B2B accordion、捲動 reveal（尊重 `prefers-reduced-motion`） |

## 建議書對照：這一版做了什麼

### P0（全部實作）

| 建議 | 實作 |
|---|---|
| 全站唯一 accent 色 + CTA 系統 | Cyan `#2AD4FF` 為全站唯一色相，用於 CTA／關鍵數據（統計數字、步驟編號）／eyebrow 標籤／互動狀態；狀態 badge 亦改為單色＋cyan 圓點（不引入第二色相）；主 CTA accent 實心、次 CTA 描邊、第三層 ghost，全站一致 |
| Hero 改版（§4 示意） | Eyebrow 縮小＋logo、H1 引號字距修正（維持原設計的大寫顯示風格，HTML 為真實混合大小寫文字）、副標改價值主張（建議書英文版原句）、雙 CTA 受眾分流 |
| Stats bar + Backers 列 | Hero 下方四格數據＋Backed by YZi Labs 列（數字為排版用樣本，已標註待接真實數據；無數字期可換 Backers/Alpha 名額版本） |
| Team & Backers 區 | 一人一行（PhD／Meta Reality Labs／SenseTime／Baidu 經歷），姓名與照片留槽待填；投資人 logo 列 |
| 文字系統 tokens | `#F5F5F5 / #B3B3B3 / #8C8C8C` 三階（於各底色皆過 WCAG AA）；段落內文 16px、行高 1.6、≤75ch（規格行／管線說明等標籤層 15px，皆用 secondary 色）；全大寫僅限 eyebrow／標籤且 ≥11px；內文與按鈕 sentence case |
| 產品區可辨識視覺 + 狀態 badge | 每產品有可辨識線稿佔位（DexUmi 手持硬體／EgoDo App 介面／Ego Suite 眼鏡），實機渲染槽已標註；「In production」改為狀態 badge（附綠點，非按鈕樣式）；每卡有真 CTA |
| 結尾 CTA 明暗對齊語意 | 「real-world data for Physical AI」為亮行 |
| 上線前 QA 基礎 | 單一 h1（真文字）、h1→h2→h3 層級、title/description/OG/favicon、SVG 皆有 aria 標註、skip link、鍵盤焦點樣式 |

### P1（大部分涵蓋）

| 建議 | 實作 |
|---|---|
| 貢獻者 3 步驟 Onboarding | 下載 App → 日常採集 → 積分＋early access（不談 token） |
| B2B 規格 + 出口 | Accordion 預設展開第一項（無 JS 時全開，JS 載入後收合）；六垂直各附 Modality／Scale／Annotation 規格卡＋Request dataset access（各帶垂直主旨的 mailto）；區塊結尾 Talk to us；規格數字標註為樣本 |
| 版式節奏 | Data Engine 改左右分欄（左敘事右管線圖）；Ego Suite 獨立 full-width 旗艦區 |
| 導覽精簡 | 4 項＋右側常駐 accent CTA；雙入口（Start contributing／For Business）；Docs 待有真實文件站後回到導覽列 |
| 互動狀態 | hover/focus/active 三態統一；無偽按鈕；Escape 關閉手機選單 |
| RWD | 四斷點驗證；行動版 hero 改 4:3 取景、卡片堆疊、觸控目標 ≥44px |
| 效能 | 無外部資源（零 webfont/圖片請求）、動畫僅 transform/opacity、IntersectionObserver 控制 reveal |
| Demo loop 槽位 | Data Engine 區 16:9 影片槽（採集→上傳→訓練→執行），附 poster/播放鍵樣式 |
| `prefers-reduced-motion` | 全站動畫與 smooth scroll 皆停用 |

### P2（先行納入的部分）

- FAQ 六題（隱私去識別化／報酬／裝置需求／採集內容／B2B 授權／token）。
- Footer 補全：五欄（Product／Company／Resources／Legal & contact），含 Docs、Whitepaper、Careers、Brand kit、Data licensing terms、BD 信箱、社群成員數槽位。

## 待補清單（正式上線前）

- [ ] **真實素材**：Hero 雙手渲染（沿用現稿）、產品實機渲染/實拍、EgoDo App 截圖、demo loop 影片——頁面中所有虛線 `Asset slot` 皆為落位框。
- [ ] **真實數據**：Stats bar、B2B 規格數字、社群成員數（現為樣本值，頁面已標註 "Sample figures"）。
- [ ] **團隊姓名/照片/完整履歷**、其他投資人 logo。
- [ ] **連結目的地**：Docs／Blog／Careers／法務頁為虛線底線佔位連結（`.link-todo`）；Alpha 註冊、各式 waitlist 與規格索取現以 `mailto:`（alpha@ / bd@4dlabs.ai）作為草稿期終點，上線前換成表單／App 下載連結。
- [ ] OG image 實檔（1200×630）與正式網域絕對路徑。
- [ ] 埋點（CTA click／區塊曝光／註冊漏斗）與 EN/繁中雙語（P2）。
