// ============================================================
// 社別設定（C 版 v1.25.0 起）：全系統共用
// 新增社別只要喺 HOUSES 加一行，各頁會自動跟住變
// key 用於：Supabase ledger.house、夾萬 settings key（<key>_big / <key>_small）、
//           電子存檔路徑（storage 只准英數）
// ============================================================
window.HOUSES = [
  { name: '忠社', key: 'zhong', color: '#b45309', soft: '#fef3c7' },   // amber
  { name: '孝社', key: 'xiao',  color: '#0f766e', soft: '#ccfbf1' },   // teal
  { name: '德社', key: 'de',    color: '#1d4ed8', soft: '#dbeafe' },   // blue
  { name: '智社', key: 'zhi',   color: '#7c3aed', soft: '#ede9fe' },   // violet
  { name: '禮社', key: 'li',    color: '#be185d', soft: '#fce7f3' },   // pink
  { name: '信社', key: 'xin',   color: '#047857', soft: '#d1fae5' },   // emerald
  { name: '仁社', key: 'ren',   color: '#c2410c', soft: '#ffedd5' }    // orange
];
window.HOUSE_NAMES = window.HOUSES.map(h => h.name);

// 社名 → key（舊資料兜底：未知社名當 zhong，同舊版行為一致）
window.houseKeyOf = function (name) {
  const h = window.HOUSES.find(h => h.name === name);
  if (h) return h.key;
  return name === '孝社' ? 'xiao' : 'zhong';
};
// key → 社名（ledger 舊數據／顯示用）
window.houseNameOf = function (key) {
  const h = window.HOUSES.find(h => h.key === key);
  return h ? h.name : (key || '');
};
// 社名 → 顏色
window.houseColor = function (name) {
  const h = window.HOUSES.find(h => h.name === name);
  return h ? h.color : '#64748b';
};
window.houseSoft = function (name) {
  const h = window.HOUSES.find(h => h.name === name);
  return h ? h.soft : '#f1f5f9';
};

// ============================================================
// 權限社別（v1.26.0 起）：同事可以接觸邊幾個社嘅資料
// 用法：const keys = accessibleHouseKeys(role, staffDirEntry);
//   - 回傳 null ＝ 無限制（admin／管理級，或名冊未設定社別——向後兼容）
//   - 回傳 key 陣列 ＝ 只可以接觸呢啲社（管理夾萬同工＝負責嘅夾萬社別；社工／導師＝所屬社別，可多選）
// entry 係 staff_dir[email]：{ name, title, house, houses[], deleted }
// ============================================================
window.accessibleHouseKeys = function (role, entry) {
  if (role === 'admin' || role === 'manager') return null;
  if (!entry || entry.deleted) return null;
  if (Array.isArray(entry.houses) && entry.houses.length) return entry.houses.slice();
  if (entry.house) return [entry.house];
  return null;
};
// 權限社別（社名陣列版本，已過濾無效 key）
window.accessibleHouseNames = function (role, entry) {
  const ks = window.accessibleHouseKeys(role, entry);
  if (!ks) return null;
  const names = ks.map(window.houseNameOf).filter(n => window.HOUSE_NAMES.includes(n));
  return names.length ? names : null;
};
