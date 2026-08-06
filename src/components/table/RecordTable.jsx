import { useState, useMemo } from 'react';
import { useHealth } from '../../context/HealthContext';
import { getBPStatus, getHRStatus, getBGStatus } from '../../utils/ranges';
import { useI18n } from '../../context/I18nContext';
import Tooltip from '../shared/Tooltip';

const PAGE_SIZE = 20;

const COLS = [
  { key: 'datetime',  label: '日期時間' },
  { key: 'systolic',  label: '收縮壓' },
  { key: 'diastolic', label: '舒張壓' },
  { key: 'heartRate', label: '心跳' },
  { key: 'bloodSugar',label: '血糖' },
  { key: 'note',      label: '備註' },
];

export default function RecordTable({ onEdit }) {
  const { records, deleteRecord, showToast } = useHealth();
  const { t } = useI18n();
  const [page, setPage]             = useState(1);
  const [sortKey, setSortKey]       = useState('datetime');
  const [sortDir, setSortDir]       = useState('desc');
  const [search, setSearch]         = useState('');

  const filtered = useMemo(() => {
    let list = records;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        r.datetime.includes(q) || (r.note || '').toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [records, sortKey, sortDir, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = key => {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const handleDelete = id => {
    if (confirm(t('confirmDelete'))) {
      deleteRecord(id);
      showToast(t('deleted'));
    }
  };

  const sortIcon = key => sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

  return (
    <div className="card" style={{ padding: '16px 18px' }}>
      {/* 工具列 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="section-title" style={{ marginBottom: 0, flex: 1 }}>
          {t('recordsTitle')}
          <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>
            {t('total')} {filtered.length} {t('countUnit')}
          </span>
        </div>
        <input
          className="form-input"
          style={{ width: 180, padding: '6px 10px', fontSize: '0.82rem' }}
          placeholder={t('searchHint')}
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {t('exportHint')}
        </span>
      </div>

      {/* 表格 */}
      {pageData.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <p>{t('noRecords')}</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="record-table">
            <thead>
              <tr>
                {COLS.map(c => (
                  <th key={c.key} onClick={() => handleSort(c.key)}>
                    {t(c.key)}{sortIcon(c.key)}
                  </th>
                ))}
                <th>{t('action')}</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map(r => {
                const bpSt = getBPStatus(r.systolic, r.diastolic);
                const hrSt = getHRStatus(r.heartRate);
                const bgSt = r.bloodSugar ? getBGStatus(r.bloodSugar, r.mealType) : null;
                return (
                  <tr key={r.id}>
                    <td className="val-muted" style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      {r.datetime.replace('T', ' ')}
                    </td>
                    <td>
                      <span className="val-systolic">{r.systolic}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}> mmHg</span>
                    </td>
                    <td>
                      <span className="val-diastolic">{r.diastolic}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}> mmHg</span>
                    </td>
                    <td>
                      <span className="val-hr">{r.heartRate}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}> bpm</span>
                    </td>
                    <td>
                      {r.bloodSugar
                        ? <><span className="val-bg-sugar">{r.bloodSugar}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}> mg/dL {r.mealType === 'postMeal' ? `(${t('postMeal')})` : `(${t('fasting')})`}</span></>
                        : <span className="val-muted">—</span>}
                    </td>
                    <td>
                      {r.note ? (
                        <Tooltip content={r.note}>
                          <span className="note-icon">📝</span>
                        </Tooltip>
                      ) : <span className="val-muted">—</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost" style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                          onClick={() => onEdit(r)}>{t('edit')}</button>
                        <button className="btn btn-danger-ghost"
                          onClick={() => handleDelete(r.id)}>✕</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 分頁 */}
      {totalPages > 1 && (
        <div className="pagination">
          <button className="page-btn" disabled={page <= 1} onClick={() => setPage(1)}>«</button>
          <button className="page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹</button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
            return (
              <button key={p} className={`page-btn${page === p ? ' active' : ''}`} onClick={() => setPage(p)}>
                {p}
              </button>
            );
          })}
          <button className="page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>›</button>
          <button className="page-btn" disabled={page >= totalPages} onClick={() => setPage(totalPages)}>»</button>
        </div>
      )}
    </div>
  );
}
