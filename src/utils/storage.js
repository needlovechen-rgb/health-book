const MAX = 10_000;
const MEMBERS_KEY = 'health_members';

// ─── 成員管理 ────────────────────────────────────────────────
export function loadMembers() {
  try {
    const raw = localStorage.getItem(MEMBERS_KEY);
    if (raw) return JSON.parse(raw);
    // 預設：我自己
    const defaults = [{ id: 'self', name: '我' }];
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(defaults));
    return defaults;
  } catch { return [{ id: 'self', name: '我' }]; }
}

export function saveMembers(members) {
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
}

// ─── 紀錄（依成員 key 隔離）────────────────────────────────
function recordKey(memberId) { return `health_records_${memberId}`; }

export function loadRecords(memberId = 'self') {
  try {
    const raw = localStorage.getItem(recordKey(memberId));
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveRecords(records, memberId = 'self') {
  if (records.length > MAX) {
    console.warn(`[storage] 已超過 ${MAX} 筆上限`);
  }
  localStorage.setItem(recordKey(memberId), JSON.stringify(records));
}

// ─── CSV 匯出 ────────────────────────────────────────────────
export function exportCSV(records, memberName = '') {
  const header = '日期時間,收縮壓(mmHg),舒張壓(mmHg),心跳(bpm),血糖(mg/dL),量測情境,備註';
  const rows = records.map(r =>
    [r.datetime, r.systolic, r.diastolic, r.heartRate,
     r.bloodSugar ?? '', r.mealType === 'postMeal' ? '飯後' : '空腹',
     `"${(r.note || '').replace(/"/g, '""')}"`].join(',')
  );
  const label = memberName ? `_${memberName}` : '';
  const blob = new Blob(['\uFEFF' + [header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `健康紀錄${label}_${new Date().toLocaleDateString('zh-TW').replace(/\//g,'-')}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

// ─── JSON 匯出 ───────────────────────────────────────────────
export function exportJSON(records, memberName = '') {
  const payload = { exportedAt: new Date().toISOString(), member: memberName, records };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const label = memberName ? `_${memberName}` : '';
  a.href = url; a.download = `健康紀錄${label}_${new Date().toLocaleDateString('zh-TW').replace(/\//g,'-')}.json`;
  a.click(); URL.revokeObjectURL(url);
}

// ─── JSON 匯入 ───────────────────────────────────────────────
export function importJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result);
        // 接受 { records: [...] } 或直接陣列
        const records = Array.isArray(data) ? data : (data.records ?? []);
        if (!Array.isArray(records)) throw new Error('格式錯誤');
        resolve(records);
      } catch (err) { reject(err); }
    };
    reader.onerror = () => reject(new Error('讀取失敗'));
    reader.readAsText(file);
  });
}
