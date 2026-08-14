import { getBPStatus, getHRStatus, getBGStatus } from '../../utils/ranges';
import { useI18n } from '../../context/I18nContext';

export default function StatCard({ records }) {
  const { t } = useI18n();
  if (!records.length) return null;
  const latest = records[0];
  const bpStatus = getBPStatus(latest.systolic, latest.diastolic);
  const hrStatus = getHRStatus(latest.heartRate);
  const bgStatus = latest.bloodSugar ? getBGStatus(latest.bloodSugar, latest.mealType) : null;

  return (
    <div className="card">
      <div className="card-title">📊 {t('latestData')}</div>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">{t('systolic')}</div>
          <div className="stat-value stat-systolic">{latest.systolic}</div>
          <div className="stat-unit">mmHg</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t('diastolic')}</div>
          <div className="stat-value stat-diastolic">{latest.diastolic}</div>
          <div className="stat-unit">mmHg</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t('heartRate')}</div>
          <div className="stat-value stat-hr">{latest.heartRate}</div>
          <div className="stat-unit">bpm</div>
        </div>
        {latest.bloodSugar && (
          <div className="stat-card">
            <div className="stat-label">{t('bloodSugar')}</div>
            <div className="stat-value stat-bg-sugar">{latest.bloodSugar}</div>
            <div className="stat-unit">mg/dL</div>
          </div>
        )}
      </div>
      <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <span className={`range-badge ${bpStatus.cls}`}>{t('bpPrefix')}{t(bpStatus.key || bpStatus.label)}</span>
        <span className={`range-badge ${hrStatus.cls}`}>{t('hrPrefix')}{t(hrStatus.key || hrStatus.label)}</span>
        {bgStatus && <span className={`range-badge ${bgStatus.cls}`}>{t('bgPrefix')}{t(bgStatus.key || bgStatus.label)}</span>}
      </div>
    </div>
  );
}
