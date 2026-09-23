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
- 表：`applications`（serial、payee_sign、pdf_path、settled_at、settled_by、safe_pay 等）、`settings`（key-value）。
- Storage：bucket `apply-archive`，路徑只准英數（zhong/xiao/payeeId）。
- 主網站（舍務抽籤、舍友名單）用**另一個** Supabase project，唔好搞亂。

## 測試流程

1. 寫 `public/_t.html` 測試頁（開頭 set `cyc-portal-auth` sessionStorage，iframe 載目標頁，`w.eval()` 檢查，結果落 `<pre id="log">`）。
2. `node --check` 抽 script 檢查語法。
3. push → 等約 35 秒 Netlify 部署 → headless Chrome `--dump-dom` 讀結果。
4. **一定要 git rm _t.html 再 push**，唔好留測試頁上線。

## commit

用 `git -c user.name=simonho1016 -c user.email=simonho1016@gmail.com commit ...`。
