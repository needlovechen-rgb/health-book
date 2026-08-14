import { useState, useRef } from 'react';
import { useHealth } from '../../context/HealthContext';
import { exportCSV, exportJSON, importJSON } from '../../utils/storage';
import { useI18n } from '../../context/I18nContext';
export default function MemberSelector() {
  const {
    members, currentMemberId, currentMember, records,
    addMember, renameMember, deleteMember, switchMember,
    importRecords, showToast,
  } = useHealth();
  const { t } = useI18n();

  const [open, setOpen]       = useState(false);
  const [adding, setAdding]   = useState(false);
  const [newName, setNewName] = useState('');
  const [editing, setEditing] = useState(null); // { id, name }
  const fileRef = useRef();

  const handleAdd = () => {
    if (!newName.trim()) return;
    addMember(newName.trim());
    setNewName(''); setAdding(false);
    showToast(`${t('addedUser')}「${newName.trim()}」`);
  };

  const handleRename = () => {
    if (!editing.name.trim()) return;
    renameMember(editing.id, editing.name.trim());
    setEditing(null);
    showToast(t('updatedUserName'));
  };

  const handleDelete = (id, name) => {
    if (!confirm(`${t('confirmDelete')}「${name}」?`)) return;
    deleteMember(id);
    showToast(`${t('deletedUser')}「${name}」`);
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const imported = await importJSON(file);
      const count = importRecords(imported);
      showToast(`${t('importSuccess')} ${count} ✓`);
    } catch (err) {
      showToast(`${t('importFailed')}: ` + err.message, 'err');
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
        <span>{currentMember?.name ?? ''}</span>
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
                    <button className="btn-icon" onClick={handleRename} title={t('confirm')}>✓</button>
                    <button className="btn-icon" onClick={() => setEditing(null)} title={t('cancel')}>✕</button>
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
                    <button className="btn-icon" title={t('edit')} onClick={() => setEditing({ id: m.id, name: m.name })}>✏️</button>
                    {members.length > 1 && (
                      <button className="btn-icon" title={t('delete')} onClick={() => handleDelete(m.id, m.name)}
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
                  placeholder={t('name')}
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
              >+ {t('addUser')}</button>
            )}

            <div style={{ height: 1, background: 'var(--border)', margin: '6px 0' }} />

            {/* 匯出/匯入 */}
            <div style={{ padding: '4px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
              <button className="nav-btn" style={{ textAlign: 'left' }}
                onClick={() => { exportCSV(records, currentMember?.name); setOpen(false); }}>
                📄 {t('exportCSV')}
              </button>
              <button className="nav-btn" style={{ textAlign: 'left' }}
                onClick={() => { exportJSON(records, currentMember?.name); setOpen(false); }}>
                📦 {t('exportJSON')}
              </button>
              <button className="nav-btn" style={{ textAlign: 'left' }}
                onClick={() => fileRef.current.click()}>
                📥 {t('importJSON')}
              </button>
              <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
