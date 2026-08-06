import { useState } from 'react';
import {
  ResponsiveContainer, ComposedChart, Line, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ReferenceLine,
} from 'recharts';
import { useHealth } from '../../context/HealthContext';
import { getAggregated, navigators } from '../../utils/aggregation';
import { useI18n } from '../../context/I18nContext';

const MODES = [
  { key: 'day',   labelKey: 'day' },
  { key: 'week',  labelKey: 'week' },
  { key: 'month', labelKey: 'month' },
  { key: 'year',  labelKey: 'year' },
];

const CHART_TYPES = [
  { key: 'bp',   labelKey: 'bloodPressure' },
  { key: 'hr',   labelKey: 'heartRate' },
  { key: 'bg',   labelKey: 'bloodSugar' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '10px 14px', fontSize: '0.8rem',
    }}>
      <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text)' }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color, display: 'flex', gap: 8 }}>
          <span>{p.name}</span>
          <span style={{ fontWeight: 600 }}>{p.value ?? '—'}</span>
        </div>
      ))}
    </div>
  );
};

const generateTicks = (min, max, step = 5) => {
  const ticks = [];
  for (let i = min; i <= max; i += step) {
    ticks.push(i);
  }
  return ticks;
};

export default function ChartPanel() {
  const { records } = useHealth();
  const { t } = useI18n();
  const [mode, setMode]         = useState('day');
  const [chartType, setChartType] = useState('bp');
  const [refDate, setRefDate]   = useState(new Date());

  const nav   = navigators[mode];
  const data  = getAggregated(mode, records, refDate);
  const today = new Date();

  return (
    <div className="card chart-panel">
      {/* 時間模式切換 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div className="chart-tabs">
          {MODES.map(m => (
            <button key={m.key} className={`chart-tab${mode === m.key ? ' active' : ''}`}
              onClick={() => { setMode(m.key); setRefDate(new Date()); }}>
              {t(m.labelKey)}
            </button>
          ))}
        </div>
        {/* 圖表類型切換 */}
        <div className="chart-type-tabs">
          {CHART_TYPES.map(typeItem => (
            <button key={typeItem.key} className={`chart-type-btn${chartType === typeItem.key ? ' active' : ''}`}
              onClick={() => setChartType(typeItem.key)}>
              {t(typeItem.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* 日期導航 */}
      <div className="chart-nav">
        <button className="btn btn-ghost" onClick={() => setRefDate(nav.prev(refDate))}>‹</button>
        <span className="chart-date-label">{nav.label(refDate)}</span>
        <button className="btn btn-ghost"
          onClick={() => setRefDate(nav.next(refDate))}
          disabled={nav.next(refDate) > today}>›</button>
        <button className="btn btn-ghost" onClick={() => setRefDate(new Date())}>{t('todayBtn')}</button>
      </div>

      {/* 圖表 */}
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />

          {chartType === 'bp' && <>
            <YAxis domain={[40, 200]} ticks={generateTicks(40, 200, 5)} interval={0} tick={{ fill: 'var(--text-muted)', fontSize: 9 }} />
            <Legend wrapperStyle={{ fontSize: '0.78rem', paddingTop: 8 }} />
            <ReferenceLine y={140} stroke="var(--danger)" strokeDasharray="4 3"
              label={{ value: t('highBp'), fill: 'var(--danger)', fontSize: 10, position: 'right' }} />
            <ReferenceLine y={120} stroke="var(--warn)" strokeDasharray="4 3"
              label={{ value: t('high'), fill: 'var(--warn)', fontSize: 10, position: 'right' }} />
            <Line type="monotone" dataKey="systolic"  name={t('systolic')} stroke="var(--systolic)"
              strokeWidth={2.5} dot={{ r: 3 }} connectNulls activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="diastolic" name={t('diastolic')} stroke="var(--diastolic)"
              strokeWidth={2.5} dot={{ r: 3 }} connectNulls activeDot={{ r: 5 }} />
          </>}

          {chartType === 'hr' && <>
            <YAxis domain={[40, 160]} ticks={generateTicks(40, 160, 5)} interval={0} tick={{ fill: 'var(--text-muted)', fontSize: 9 }} />
            <Legend wrapperStyle={{ fontSize: '0.78rem', paddingTop: 8 }} />
            <ReferenceLine y={100} stroke="var(--warn)" strokeDasharray="4 3"
              label={{ value: t('high'), fill: 'var(--warn)', fontSize: 10, position: 'right' }} />
            <ReferenceLine y={60} stroke="var(--warn)" strokeDasharray="4 3"
              label={{ value: t('low'), fill: 'var(--warn)', fontSize: 10, position: 'right' }} />
            <Line type="monotone" dataKey="heartRate" name={`${t('heartRate')} (bpm)`} stroke="var(--hr-color)"
              strokeWidth={2.5} dot={{ r: 3 }} connectNulls activeDot={{ r: 5 }} />
          </>}

          {chartType === 'bg' && <>
            <YAxis domain={[60, 250]} ticks={generateTicks(60, 250, 5)} interval={0} tick={{ fill: 'var(--text-muted)', fontSize: 9 }} />
            <Legend wrapperStyle={{ fontSize: '0.78rem', paddingTop: 8 }} />
            <ReferenceLine y={126} stroke="var(--danger)" strokeDasharray="4 3"
              label={{ value: t('diabetes'), fill: 'var(--danger)', fontSize: 10, position: 'right' }} />
            <ReferenceLine y={100} stroke="var(--warn)" strokeDasharray="4 3"
              label={{ value: t('fastingHigh'), fill: 'var(--warn)', fontSize: 10, position: 'right' }} />
            <Line type="monotone" dataKey="bloodSugar" name={`${t('bloodSugar')} (mg/dL)`} stroke="var(--bg-sugar)"
              strokeWidth={2.5} dot={{ r: 3 }} connectNulls activeDot={{ r: 5 }} />
          </>}
        </ComposedChart>
      </ResponsiveContainer>

      {/* 無資料提示 */}
      {data.every(d => d.count === 0) && (
        <div className="empty-state" style={{ padding: '20px 0 8px' }}>
          <p>{t('noDataForPeriod')}</p>
        </div>
      )}
    </div>
  );
}
