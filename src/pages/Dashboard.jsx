import { useState } from 'react';
import EntryForm from '../components/entry/EntryForm';
import StatCard from '../components/shared/StatCard';
import ChartPanel from '../components/chart/ChartPanel';
import RecordTable from '../components/table/RecordTable';
import MemberSelector from '../components/shared/MemberSelector';
import { useHealth } from '../context/HealthContext';
import { useI18n } from '../context/I18nContext';

export default function Dashboard() {
  const { records, currentMember } = useHealth();
  const { t, toggleLang, lang } = useI18n();
  const [editRecord, setEditRecord] = useState(null);

  return (
    <div className="app-shell">
      {/* NavBar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="brand-icon">❤️</div>
          {t('appTitle')}
        </div>
        <div style={{ flex: 1, paddingLeft: 16, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          {currentMember?.name} · {records.length} {t('recordsCount')}
        </div>
        <button className="btn-icon" onClick={toggleLang} style={{ marginRight: 8, fontSize: '0.9rem', padding: '4px 8px', borderRadius: 4, background: 'var(--bg-secondary)' }}>
          {t('switchLang')}
        </button>
        <MemberSelector />
      </nav>

      {/* 主體 */}
      <div className="main-content">
        {/* 側邊欄：輸入表單 + 統計卡片 */}
        <aside className="sidebar">
          <EntryForm
            editRecord={editRecord}
            onEditDone={() => setEditRecord(null)}
          />
          <StatCard records={records} />
        </aside>

        {/* 主區域：圖表 + 表格 */}
        <main className="content-area">
          <div>
            <div className="section-title">📈 {t('trendChart')}</div>
            <div className="section-sub">{t('trendChartSub')}</div>
            <ChartPanel />
          </div>
          <RecordTable onEdit={r => { setEditRecord(r); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
        </main>
      </div>
    </div>
  );
}
