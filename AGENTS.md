# AGENTS.md — 零用金支錢系統（AI 編程助手交接說明）

## 呢個 repo 係咩

則仁中心忠孝宿舍「零用金支錢系統」，2026-09-23 起由主網站（cycportal.netlify.app，repo `simonho1016/housebnamelist`）抽離成獨立系統。純靜態網站，冇 build step，`netlify.toml` 將 `public/` 直接 publish。push `main` → Netlify 自動部署。

## 頁面結構

- `public/index.html` — 前置登入頁。密碼統一喺度輸入，驗證方式係讀 Supabase `settings` 表嘅 `admin_pw`（同後台同一組密碼，可喺後台更改；預設 `8888`）。登入後寫兩個 sessionStorage：`cyc-portal-auth`（{p, exp}，15 分鐘）同 `cyc-admin-auth`（{exp}），所以入 /admin/ 同 /vault/ 唔使再入密碼。撳功能卡會經 `#key=...&t=...` hash 帶密碼過頁。
- `public/apply/index.html` — 支錢主頁：填單 → 簽名（全螢幕橫向簽名板，自動轉正）→ 列印海報風格 PDF／電子存檔上 Supabase Storage bucket `apply-archive`。何文諾、何樂軒有簽名檔保護，支錢時要佢哋各自密碼（`staff-ok-<name>` session，15 分鐘）。
- `public/admin/index.html` — 後台：統計圖表、按社別/職員分類、匯出 CSV、勾選下載 ZIP／列印 PDF、結算、刪除記錄（只有呢頁可以刪）。
- `public/vault/index.html` — 夾萬・舍友現存：忠孝各有大夾萬（宿舍夾萬）同細夾萬（家社夾萬），過錢、舍友現存、對數。

## 金錢邏輯（重要）

- 夾萬存於 `settings` 表 key=`safe_vault`，格式 `{zhong_big, zhong_small, xiao_big, xiao_small}`。
- 舍友結存存於 key=`member_bal`。
- 一般申請：要喺後台「結算」先扣細夾萬；「夾萬支付」嘅單即時扣細夾萬，唔使再結算。
- 結算時同時扣舍友結存；結存唔夠會彈 confirm。
- 刪單會自動回補舍友結存同細夾萬。
- 序號：`settings` key=`serial_counter`，只增唔減，刪咗唔會補返。

## Supabase

- URL `https://abtsyfbbtpvozywqaofs.supabase.co`，anon key 寫喺各頁 `SUPABASE_ANON_KEY`。
- 表：`applications`（serial、payee_sign、pdf_path、settled_at、settled_by、safe_pay 等）、`settings`（key-value）、**`ledger`（流水賬，月結紀錄嘅根基）**。
- ledger 欄位：`house(zhong/xiao)、kind(opening/deposit/expense/settle/transfer/adjust/rollback)、member_id、member_name、amount、member_delta、account(big/small)、account_delta、member_bal_after、account_bal_after、receipt_no、serial、staff、staff2、note、created_at`。
  - 每個銀錢變動寫一筆：`member_bal_after`／`account_bal_after` 係事件後結存快照，月結嘅「承前結存」＝月起前最後一筆嘅快照。
  - transfer 過錢寫兩筆（big 出、small 入）；支出（expense）即時記 member_delta，夾萬支付先帶 account_delta；墊支單由 admin 結算嗰陣記 settle（account_delta）；刪單記 rollback 回補。
- 收款編號：`settings` key=`receipt_counter`（整數，下一個號），格式 `CYC xxxxxx`，只限存入；預設由 101334 接續舊系統，vault 頁可改。
- 結存起點：vault 頁「🚩 結存起點」一次性寫 opening 流水（ledger 有記錄後鎖定）。
- 月結輸出：admin「🧾 零用月結紀錄（社別）」，照舊系統格式（現存現金＝大夾萬、代管現金＝細夾萬），A4 直向列印。
- Storage：bucket `apply-archive`，路徑只准英數（zhong/xiao/payeeId）。
- 主網站（舍務抽籤、舍友名單）用**另一個** Supabase project，唔好搞亂。

## 測試流程

1. 寫 `public/_t.html` 測試頁（開頭 set `cyc-portal-auth` sessionStorage，iframe 載目標頁，`w.eval()` 檢查，結果落 `<pre id="log">`）。
2. `node --check` 抽 script 檢查語法。
3. push → 等約 35 秒 Netlify 部署 → headless Chrome `--dump-dom` 讀結果。
4. **一定要 git rm _t.html 再 push**，唔好留測試頁上線。

## commit

用 `git -c user.name=simonho1016 -c user.email=simonho1016@gmail.com commit ...`。
