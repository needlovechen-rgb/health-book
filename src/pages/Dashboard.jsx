import { useState } from 'react';
import EntryForm from '../components/entry/EntryForm';
import StatCard from '../components/shared/StatCard';
import ChartPanel from '../components/chart/ChartPanel';
import RecordTable from '../components/table/RecordTable';
import MemberSelector from '../components/shared/MemberSelector';
import { useHealth } from '../context/HealthContext';

export default function Dashboard() {
  const { records, currentMember } = useHealth();
  const [editRecord, setEditRecord] = useState(null);

  return (
    <div className="app-shell">
      {/* NavBar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="brand-icon">❤️</div>
          血壓血糖健康手冊
        </div>
        <div style={{ flex: 1, paddingLeft: 16, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          {currentMember?.name} · {records.length} 筆紀錄
        </div>
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
            <div className="section-title">📈 趨勢圖表</div>
            <div className="section-sub">選擇日 / 週 / 月 / 年 觀看量測趨勢，點 ‹ › 切換期間</div>
            <ChartPanel />
          </div>
          <RecordTable onEdit={r => { setEditRecord(r); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
        </main>
      </div>
    </div>
  );
}
