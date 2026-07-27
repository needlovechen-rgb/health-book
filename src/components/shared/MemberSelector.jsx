import { useState, useRef } from 'react';
import { useHealth } from '../../context/HealthContext';
import { exportCSV, exportJSON, importJSON } from '../../utils/storage';

export default function MemberSelector() {
  const {
    members, currentMemberId, currentMember, records,
    addMember, renameMember, deleteMember, switchMember,
    importRecords, showToast,
  } = useHealth();

  const [open, setOpen]       = useState(false);
  const [adding, setAdding]   = useState(false);
  const [newName, setNewName] = useState('');
  const [editing, setEditing] = useState(null); // { id, name }
  const fileRef = useRef();

  const handleAdd = () => {
    if (!newName.trim()) return;
    addMember(newName.trim());
    setNewName(''); setAdding(false);
    showToast(`已新增成員「${newName.trim()}」`);
  };

  const handleRename = () => {
    if (!editing.name.trim()) return;
    renameMember(editing.id, editing.name.trim());
    setEditing(null);
    showToast('成員名稱已更新');
  };

  const handleDelete = (id, name) => {
    if (!confirm(`確定刪除成員「${name}」及其所有紀錄？`)) return;
    deleteMember(id);
    showToast(`已刪除成員「${name}」`);
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const imported = await importJSON(file);
      const count = importRecords(imported);
      showToast(`成功匯入 ${count} 筆新紀錄 ✓`);
    } catch (err) {
      showToast('匯入失敗：' + err.message, 'err');
    }
    fileRef.current.value = '';
    setOpen(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* 成員切換按鈕 */}
      <button
        className="nav-btn"
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: open ? 'var(--accent-glow)' : undefined }}
        onClick={() => setOpen(o => !o)}
      >
        <span>👤</span>
        <span>{currentMember?.name ?? '我'}</span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>▾</span>
      </button>

      {/* 下拉面板 */}
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', top: '100%', right: 0, marginTop: 6,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', minWidth: 220, zIndex: 200,
            boxShadow: 'var(--shadow)', padding: '8px 0',
          }}>
            {/* 成員列表 */}
            {members.map(m => (
              <div key={m.id} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px',
                background: m.id === currentMemberId ? 'var(--accent-glow)' : undefined,
              }}>
                {editing?.id === m.id ? (
                  <>
                    <input
                      autoFocus
                      className="form-input"
                      style={{ flex: 1, padding: '4px 8px', fontSize: '0.85rem' }}
                      value={editing.name}
                      onChange={e => setEditing(ed => ({ ...ed, name: e.target.value }))}
                      onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setEditing(null); }}
                    />
                    <button className="btn-icon" onClick={handleRename} title="確認">✓</button>
                    <button className="btn-icon" onClick={() => setEditing(null)} title="取消">✕</button>
                  </>
                ) : (
                  <>
                    <button
                      style={{ flex: 1, textAlign: 'left', background: 'none', border: 'none',
                        color: m.id === currentMemberId ? 'var(--accent)' : 'var(--text)',
                        cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'var(--font)' }}
                      onClick={() => { switchMember(m.id); setOpen(false); }}
                    >
                      {m.id === currentMemberId ? '● ' : '○ '}{m.name}
                    </button>
                    <button className="btn-icon" title="改名" onClick={() => setEditing({ id: m.id, name: m.name })}>✏️</button>
                    {members.length > 1 && (
                      <button className="btn-icon" title="刪除" onClick={() => handleDelete(m.id, m.name)}
                        style={{ color: 'var(--danger)' }}>✕</button>
                    )}
                  </>
                )}
              </div>
            ))}

            <div style={{ height: 1, background: 'var(--border)', margin: '6px 0' }} />

            {/* 新增成員 */}
            {adding ? (
              <div style={{ padding: '6px 14px', display: 'flex', gap: 6 }}>
                <input
                  autoFocus
                  className="form-input"
                  style={{ flex: 1, padding: '4px 8px', fontSize: '0.85rem' }}
                  placeholder="成員姓名"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAdding(false); }}
                />
                <button className="btn-icon" onClick={handleAdd}>✓</button>
              </div>
            ) : (
              <button
                className="nav-btn"
                style={{ width: '100%', textAlign: 'left', padding: '7px 14px', color: 'var(--accent)' }}
                onClick={() => setAdding(true)}
              >+ 新增成員</button>
            )}

            <div style={{ height: 1, background: 'var(--border)', margin: '6px 0' }} />

            {/* 匯出/匯入 */}
            <div style={{ padding: '4px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
              <button className="nav-btn" style={{ textAlign: 'left' }}
                onClick={() => { exportCSV(records, currentMember?.name); setOpen(false); }}>
                📄 匯出 CSV
              </button>
              <button className="nav-btn" style={{ textAlign: 'left' }}
                onClick={() => { exportJSON(records, currentMember?.name); setOpen(false); }}>
                📦 匯出 JSON
              </button>
              <button className="nav-btn" style={{ textAlign: 'left' }}
                onClick={() => fileRef.current.click()}>
                📥 匯入 JSON
              </button>
              <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
