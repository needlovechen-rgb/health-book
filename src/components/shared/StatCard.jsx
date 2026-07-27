import { getBPStatus, getHRStatus, getBGStatus } from '../../utils/ranges';

export default function StatCard({ records }) {
  if (!records.length) return null;
  const latest = records[0];
  const bpStatus = getBPStatus(latest.systolic, latest.diastolic);
  const hrStatus = getHRStatus(latest.heartRate);
  const bgStatus = latest.bloodSugar ? getBGStatus(latest.bloodSugar, latest.mealType) : null;

  return (
    <div className="card">
      <div className="card-title">📊 最新量測值</div>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">收縮壓</div>
          <div className="stat-value stat-systolic">{latest.systolic}</div>
          <div className="stat-unit">mmHg</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">舒張壓</div>
          <div className="stat-value stat-diastolic">{latest.diastolic}</div>
          <div className="stat-unit">mmHg</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">心跳</div>
          <div className="stat-value stat-hr">{latest.heartRate}</div>
          <div className="stat-unit">bpm</div>
        </div>
        {latest.bloodSugar && (
          <div className="stat-card">
            <div className="stat-label">血糖</div>
            <div className="stat-value stat-bg-sugar">{latest.bloodSugar}</div>
            <div className="stat-unit">mg/dL</div>
          </div>
        )}
      </div>
      <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <span className={`range-badge ${bpStatus.cls}`}>血壓：{bpStatus.label}</span>
        <span className={`range-badge ${hrStatus.cls}`}>心跳：{hrStatus.label}</span>
        {bgStatus && <span className={`range-badge ${bgStatus.cls}`}>血糖：{bgStatus.label}</span>}
      </div>
    </div>
  );
}
