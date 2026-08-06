import { useState, useEffect } from 'react';
import { useNow, formatLocalDatetime } from '../../hooks/useNow';
import { useHealth } from '../../context/HealthContext';
import { useI18n } from '../../context/I18nContext';

const EMPTY = {
  datetime: '',
  systolic: '',
  diastolic: '',
  heartRate: '',
  bloodSugar: '',
  mealType: 'fasting',
  note: '',
};

function validate(form, t) {
  const errors = {};
  if (!form.systolic || +form.systolic < 60 || +form.systolic > 250)
    errors.systolic = t('sysErr');
  if (!form.diastolic || +form.diastolic < 40 || +form.diastolic > 150)
    errors.diastolic = t('diaErr');
  if (!form.heartRate || +form.heartRate < 30 || +form.heartRate > 220)
    errors.heartRate = t('hrErr');
  if (form.bloodSugar && (+form.bloodSugar < 20 || +form.bloodSugar > 600))
    errors.bloodSugar = t('bgErr');
  return errors;
}

export default function EntryForm({ editRecord, onEditDone }) {
  const now = useNow();
  const { addRecord, updateRecord, showToast } = useHealth();
  const { t } = useI18n();
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
    const errs = validate(form, t);
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
      showToast(t('recordUpdated'));
      onEditDone?.();
    } else {
      addRecord(payload);
      showToast(t('recordSaved'));
      setForm({ ...EMPTY, datetime: formatLocalDatetime(new Date()) });
      setUserTouchedTime(false);
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="card-title">
        {isEdit ? t('editRecordTitle') : t('addRecordTitle')}
      </div>

      {/* 日期時間 */}
      <div className="form-group">
        <div className="form-label">
          {t('measureTime')}
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
            <button type="button" className="datetime-now-badge" onClick={resetTime} title={t('now')}>
              {t('now')}
            </button>
          )}
        </div>
      </div>

      {/* 血壓 */}
      <div className="form-group">
        <div className="form-label" style={{ color: 'var(--systolic)' }}>{t('bloodPressure')}</div>
        <div className="form-row">
          <div className="form-group">
            <div className="form-label">{t('systolic')}</div>
            <input type="number" className={`form-input${errors.systolic ? ' err' : ''}`}
              placeholder="120" min={60} max={250}
              value={form.systolic} onChange={e => set('systolic', e.target.value)} />
            {errors.systolic && <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{errors.systolic}</span>}
          </div>
          <div className="form-group">
            <div className="form-label">{t('diastolic')}</div>
            <input type="number" className={`form-input${errors.diastolic ? ' err' : ''}`}
              placeholder="80" min={40} max={150}
              value={form.diastolic} onChange={e => set('diastolic', e.target.value)} />
            {errors.diastolic && <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{errors.diastolic}</span>}
          </div>
        </div>
      </div>

      {/* 心跳 */}
      <div className="form-group">
        <div className="form-label" style={{ color: 'var(--hr-color)' }}>💓 {t('heartRate')}</div>
        <input type="number" className={`form-input${errors.heartRate ? ' err' : ''}`}
          placeholder="72" min={30} max={220}
          value={form.heartRate} onChange={e => set('heartRate', e.target.value)} />
        {errors.heartRate && <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{errors.heartRate}</span>}
      </div>

      {/* 血糖 */}
      <div className="form-group">
        <div className="form-label" style={{ color: 'var(--bg-sugar)' }}>{t('bloodSugarOpt')}</div>
        <div className="form-row">
          <input type="number" className={`form-input${errors.bloodSugar ? ' err' : ''}`}
            placeholder="95 mg/dL" min={20} max={600}
            value={form.bloodSugar} onChange={e => set('bloodSugar', e.target.value)} />
          <select className="form-select" value={form.mealType} onChange={e => set('mealType', e.target.value)}>
            <option value="fasting">{t('fasting')}</option>
            <option value="postMeal">{t('postMeal')}</option>
          </select>
        </div>
        {errors.bloodSugar && <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{errors.bloodSugar}</span>}
      </div>

      {/* 備註 */}
      <div className="form-group" style={{ position: 'relative' }}>
        <div className="form-label">{t('noteOpt')}</div>
        <textarea
          className="form-textarea"
          placeholder={t('notePlaceholder')}
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
          {isEdit ? t('saveChanges') : t('saveRecord')}
        </button>
        {isEdit && (
          <button type="button" className="btn btn-ghost" onClick={onEditDone}>{t('cancel')}</button>
        )}
      </div>
    </form>
  );
}
