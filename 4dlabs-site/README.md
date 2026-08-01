# 4Dlabs 官網初稿 (draft v0.3)

依《4Dlabs 官網修改建議書》(v1.0, 2026-07-31) 製作的網站初稿，並經兩輪
設計審查迭代（多代理驗收 59 項 → 修正；藝術指導 delta 複審 → 修正），
向一線 AI 官網（Scale / Physical Intelligence / Figure）的工藝標準對齊，
同時保留原稿的液態金屬 monochrome 藝術方向。
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
| `fonts/space-grotesk-latin.woff2` | 展示字體（variable 300–700，OFL 授權，自託管零外部請求） |
| `fonts/inter-latin.woff2` | 內文字體（Inter variable，OFL 授權，自託管） |

## 視覺系統（v0.2 迭代後）

- **原稿風格保留**：液態金屬 monochrome、全大寫寬字距展示標題、等高線
  背景語言、膠片顆粒、鉻金屬漸層文字（H1／統計數字／結尾標題）、
  Hero「雙手＋方塊」構圖佔位、線框幾何圖示家族。內文維持 sentence case
  與 WCAG AA 可讀性（建議書 P0）。
- **字體**：展示層 Space Grotesk（標題／按鈕／導覽／數字），內文 Inter——
  兩者皆自託管，任何平台都不落入系統 fallback。
- **Logo**：線框等距方塊 monogram（導覽／footer／favicon 一致，呼應 Hero 幾何）。
- **背景**：單一 `#0A0A0A` 連續場域＋一致 hairline 分隔（不用斑馬紋色帶）；
  中段區塊帶低透明度等高線氛圍。
- **CTA 紀律**：cyan 實心＝貢獻者轉換動線（nav／hero「Start contributing」、
  「Join alpha」）；B 端一律描邊；三級文字連結為銀色、hover 才轉 cyan；
  每屏至多一個 accent 焦點。
- **編號系統**：全站統一 mono 小徽章、補零（01–05 管線、01/02 產品、
  01–03 步驟、01–06 B2B）。


## v0.3：依《4D Labs 官网模块设计》表逐區對照重建

以模組表（zh/en 雙 sheet）為結構藍本，逐區塊落實並保留建議書要求的
補充區（Contribute 三步驟、Team & Backers、FAQ）。

| 模組表要求 | 實作 |
|---|---|
| 頭部導航：錨點 6 項＋吸頂毛玻璃＋右上唯一強按鈕 Launch App | ✅（Whitepaper/Docs 為虛線佔位連結，待 PDF/GitBook） |
| 模組1 Hero：主標題＋定位句＋副標（表列原句）＋雙受眾 CTA（Join Alpha／Request Data） | ✅ |
| 模組2：信任徽標條（YZi Labs＋2–3 預留位）＋數據統計條（5 格滾動數字） | ✅（數字為樣本並標 Alpha in progress；滾動動效尊重 reduced-motion） |
| 模組3：五層管線（表列逐層文案：多設備採集／鏈上確權／清洗標註質檢／AXON 訓練／分發）＋滾動點亮流光 | ✅ |
| 模組3：三模組（ViTam 視觸融合／跨實體映射／AXON 世界模型引擎） | ✅ |
| 模組3：資料品質與可驗證性（自動質檢＋人工抽檢、採集即確權；採集→質檢→確權→入庫流程組） | ✅ |
| 模組3：相容性徽章（VLA · World Models · Dexterous Manipulation · Generalist Embodied Agents） | ✅ |
| 模組4：DexUMI（精度下限）／EgoBio（觸覺模態）／Ego 套裝（主力，RGB+IMU+觸覺手套）／手機 3D 掃描（零門檻，代幣收益＋商店徽章/QR 佔位） | ✅（狀態標籤以 Status TBD 佔位待定） |
| 模組4：採集梯度階梯圖（手機→Ego 套裝→EgoBio→DexUMI，X 規模／Y 精度模態） | ✅（SVG 資訊圖） |
| 模組5：Model Store 四類資產＋Phase 2 Coming Soon 角標＋六種分發能力 | ✅ |
| 模組6：六宮格場景卡（工業製造/電力巡檢/醫療輔助/家庭服務/物流倉儲/科研訓練場）＋授權類別＋標竿客戶標籤牆 | ✅（實景圖為落位框） |
| 模組7：全寬轉化 Banner（表列標語＋Join Alpha＋X/Telegram/Discord icon） | ✅ |
| 底部：Resources（Whitepaper/Brand kit/Docs）＋Community icon 右下＋法務右下、版權左下 | ✅ |
| 全局：近黑藍底、點雲/線框美學、線性圖標、Inter/Space Grotesk、三類動效＋reduced-motion | ✅ |

**待客戶確認（表格標註【待定】的項目）**：任務平台 URL（現以
`https://app.4dlabs.ai` 佔位）、真實營運數據口徑、產品狀態標籤
（已量產/內測/預約中）、App 上線狀態（商店徽章/QR）、Brand kit 主輔色與
logo 規範、合作機構 logo。

## 建議書對照：這一版做了什麼

### P0（全部實作）

| 建議 | 實作 |
|---|---|
| 全站唯一 accent 色 + CTA 系統 | Cyan `#2AD4FF` 為全站唯一色相，用於 CTA／關鍵數據（統計數字、步驟編號）／eyebrow 標籤／互動狀態；狀態 badge 亦改為單色＋cyan 圓點（不引入第二色相）；主 CTA accent 實心、次 CTA 描邊、第三層 ghost，全站一致 |
| Hero 改版（§4 示意） | Eyebrow 縮小＋logo、H1 引號字距修正（維持原設計的大寫顯示風格，HTML 為真實混合大小寫文字）、副標改價值主張（建議書英文版原句）、雙 CTA 受眾分流 |
| Stats bar + Backers 列 | Hero 下方四格數據＋Backed by YZi Labs 列（數字為排版用樣本，已標註待接真實數據；無數字期可換 Backers/Alpha 名額版本） |
| Team & Backers 區 | 一人一行（PhD／Meta Reality Labs／SenseTime／Baidu 經歷），姓名與照片留槽待填；投資人 logo 列 |
| 文字系統 tokens | `#F5F5F5 / #B3B3B3 / #8C8C8C` 三階（於各底色皆過 WCAG AA）；段落內文 16px、行高 1.6、≤75ch（規格行／管線說明等標籤層 15px，皆用 secondary 色）；全大寫僅限 eyebrow／標籤且 ≥11px；內文與按鈕 sentence case |
| 產品區可辨識視覺 + 狀態 badge | 每產品有可辨識金屬渲染佔位（DexUMI 末端執行器／EgoBio 觸覺陣列／Ego Suite 眼鏡／手機掃描），實機素材槽已標註；狀態 badge 非按鈕樣式；每卡有真 CTA |
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

- [ ] **真實素材**：Hero 雙手渲染（沿用現稿）、產品實機渲染/實拍、手機掃描介面截圖、六張場景實拍、demo loop 影片——頁面中所有虛線 `Asset slot` 皆為落位框。
- [ ] **真實數據**：Stats bar、B2B 規格數字、社群成員數（現為樣本值，頁面已標註 "Sample figures"）。
- [ ] **團隊姓名/照片/完整履歷**、其他投資人 logo。
- [ ] **連結目的地**：Docs／Blog／Careers／法務頁為虛線底線佔位連結（`.link-todo`）；Alpha 註冊、各式 waitlist 與規格索取現以 `mailto:`（alpha@ / bd@4dlabs.ai）作為草稿期終點，上線前換成表單／App 下載連結。
- [ ] OG image 實檔（1200×630）與正式網域絕對路徑。
- [ ] 埋點（CTA click／區塊曝光／註冊漏斗）與 EN/繁中雙語（P2）。
