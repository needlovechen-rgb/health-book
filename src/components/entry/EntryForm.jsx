import { useState, useEffect } from 'react';
import { useNow, formatLocalDatetime } from '../../hooks/useNow';
import { useHealth } from '../../context/HealthContext';

const EMPTY = {
  datetime: '',
  systolic: '',
  diastolic: '',
  heartRate: '',
  bloodSugar: '',
  mealType: 'fasting',
  note: '',
};

function validate(form) {
  const errors = {};
  if (!form.systolic || +form.systolic < 60 || +form.systolic > 250)
    errors.systolic = '收縮壓應在 60–250 mmHg';
  if (!form.diastolic || +form.diastolic < 40 || +form.diastolic > 150)
    errors.diastolic = '舒張壓應在 40–150 mmHg';
  if (!form.heartRate || +form.heartRate < 30 || +form.heartRate > 220)
    errors.heartRate = '心跳應在 30–220 bpm';
  if (form.bloodSugar && (+form.bloodSugar < 20 || +form.bloodSugar > 600))
    errors.bloodSugar = '血糖應在 20–600 mg/dL';
  return errors;
}

export default function EntryForm({ editRecord, onEditDone }) {
  const now = useNow();
  const { addRecord, updateRecord, showToast } = useHealth();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [noteVisible, setNoteVisible] = useState(false);
  const isEdit = !!editRecord;

  // 初始化表單：新增時帶入當前時間，編輯時帶入原始資料
  useEffect(() => {
    if (isEdit) {
      setForm({ ...EMPTY, ...editRecord, bloodSugar: editRecord.bloodSugar ?? '' });
    } else {
      setForm(f => ({ ...f, datetime: formatLocalDatetime(now) }));
    }
  }, [isEdit, editRecord]);

  // 每秒更新時間（僅在新增模式且使用者未手動改過時間時）
  const [userTouchedTime, setUserTouchedTime] = useState(false);
  useEffect(() => {
    if (!isEdit && !userTouchedTime) {
      setForm(f => ({ ...f, datetime: formatLocalDatetime(now) }));
    }
  }, [now, isEdit, userTouchedTime]);

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: undefined }));
    if (field === 'datetime') setUserTouchedTime(true);
  };

  const resetTime = () => {
    setUserTouchedTime(false);
    setForm(f => ({ ...f, datetime: formatLocalDatetime(new Date()) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const payload = {
      datetime:   form.datetime,
      systolic:   +form.systolic,
      diastolic:  +form.diastolic,
      heartRate:  +form.heartRate,
      bloodSugar: form.bloodSugar ? +form.bloodSugar : null,
      mealType:   form.mealType,
      note:       form.note.trim(),
    };

    if (isEdit) {
      updateRecord({ ...editRecord, ...payload });
      showToast('紀錄已更新 ✓');
      onEditDone?.();
    } else {
      addRecord(payload);
      showToast('量測值已儲存 ✓');
      setForm({ ...EMPTY, datetime: formatLocalDatetime(new Date()) });
      setUserTouchedTime(false);
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="card-title">
        {isEdit ? '✏️ 編輯紀錄' : '➕ 新增量測'}
      </div>

      {/* 日期時間 */}
      <div className="form-group">
        <div className="form-label">
          📅 量測時間
        </div>
        <div className="datetime-group">
          <input
            type="datetime-local"
            className="form-input"
            value={form.datetime}
            onChange={e => set('datetime', e.target.value)}
            style={{ flex: 1 }}
          />
          {!isEdit && (
            <button type="button" className="datetime-now-badge" onClick={resetTime} title="重設為現在時間">
              ⏱ 現在
            </button>
          )}
        </div>
      </div>

      {/* 血壓 */}
      <div className="form-group">
        <div className="form-label" style={{ color: 'var(--systolic)' }}>🩸 血壓</div>
        <div className="form-row">
          <div className="form-group">
            <div className="form-label">收縮壓</div>
            <input type="number" className={`form-input${errors.systolic ? ' err' : ''}`}
              placeholder="120" min={60} max={250}
              value={form.systolic} onChange={e => set('systolic', e.target.value)} />
            {errors.systolic && <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{errors.systolic}</span>}
          </div>
          <div className="form-group">
            <div className="form-label">舒張壓</div>
            <input type="number" className={`form-input${errors.diastolic ? ' err' : ''}`}
              placeholder="80" min={40} max={150}
              value={form.diastolic} onChange={e => set('diastolic', e.target.value)} />
            {errors.diastolic && <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{errors.diastolic}</span>}
          </div>
        </div>
      </div>

      {/* 心跳 */}
      <div className="form-group">
        <div className="form-label" style={{ color: 'var(--hr-color)' }}>💓 心跳</div>
        <input type="number" className={`form-input${errors.heartRate ? ' err' : ''}`}
          placeholder="72" min={30} max={220}
          value={form.heartRate} onChange={e => set('heartRate', e.target.value)} />
        {errors.heartRate && <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{errors.heartRate}</span>}
      </div>

      {/* 血糖 */}
      <div className="form-group">
        <div className="form-label" style={{ color: 'var(--bg-sugar)' }}>🍬 血糖（選填）</div>
        <div className="form-row">
          <input type="number" className={`form-input${errors.bloodSugar ? ' err' : ''}`}
            placeholder="95 mg/dL" min={20} max={600}
            value={form.bloodSugar} onChange={e => set('bloodSugar', e.target.value)} />
          <select className="form-select" value={form.mealType} onChange={e => set('mealType', e.target.value)}>
            <option value="fasting">空腹</option>
            <option value="postMeal">飯後</option>
          </select>
        </div>
        {errors.bloodSugar && <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{errors.bloodSugar}</span>}
      </div>

      {/* 備註 */}
      <div className="form-group" style={{ position: 'relative' }}>
        <div className="form-label">📝 備註（選填）</div>
        <textarea
          className="form-textarea"
          placeholder="例如：飯後30分鐘量測、稍作休息後、運動後..."
          value={form.note}
          onChange={e => set('note', e.target.value)}
          onFocus={() => setNoteVisible(true)}
          onBlur={() => setNoteVisible(false)}
        />
        {noteVisible && form.note && (
          <div className="tooltip-box" style={{
            position: 'absolute', bottom: 'calc(100% - 40px)', left: 0,
            transform: 'none', maxWidth: '100%',
          }}>
            {form.note}
          </div>
        )}
      </div>

      {/* 按鈕 */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
          {isEdit ? '✓ 儲存修改' : '✓ 儲存量測值'}
        </button>
        {isEdit && (
          <button type="button" className="btn btn-ghost" onClick={onEditDone}>取消</button>
        )}
      </div>
    </form>
  );
}
