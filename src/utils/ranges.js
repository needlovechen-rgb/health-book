// 血壓/血糖正常範圍常數
export const BP_RANGES = [
  { label: '理想',     color: '#22c55e', sys: [0,   120], dia: [0,  80] },
  { label: '正常',     color: '#84cc16', sys: [120, 130], dia: [80, 85] },
  { label: '偏高',     color: '#f59e0b', sys: [130, 140], dia: [85, 90] },
  { label: '高血壓一期', color: '#f97316', sys: [140, 160], dia: [90, 100] },
  { label: '高血壓二期', color: '#ef4444', sys: [160, 180], dia: [100, 110] },
  { label: '高血壓三期', color: '#dc2626', sys: [180, Infinity], dia: [110, Infinity] },
];

export const HR_RANGE = { min: 60, max: 100 }; // bpm 靜息正常

export const BG_RANGES = {
  fasting:  { ok: 100, warn: 126 },  // mg/dL 空腹
  postMeal: { ok: 140, warn: 200 },  // mg/dL 飯後
};

export function getBPStatus(sys, dia) {
  if (sys >= 180 || dia >= 110) return { key: 'statusStage3', label: '高血壓三期', cls: 'range-danger' };
  if (sys >= 160 || dia >= 100) return { key: 'statusStage2', label: '高血壓二期', cls: 'range-danger' };
  if (sys >= 140 || dia >= 90)  return { key: 'statusStage1', label: '高血壓一期', cls: 'range-warn' };
  if (sys >= 130 || dia >= 85)  return { key: 'statusElevated', label: '偏高',       cls: 'range-warn' };
  if (sys >= 120 || dia >= 80)  return { key: 'statusNormal', label: '正常',       cls: 'range-ok' };
  return                                { key: 'statusIdeal', label: '理想',       cls: 'range-ok' };
}

export function getBGStatus(value, mealType = 'fasting') {
  const range = BG_RANGES[mealType];
  if (value >= range.warn) return { key: 'statusDiabetesRisk', label: '糖尿病風險', cls: 'range-danger' };
  if (value >= range.ok)   return { key: 'statusPrediabetes', label: '糖尿病前期', cls: 'range-warn' };
  return                          { key: 'statusNormal', label: '正常',       cls: 'range-ok' };
}

export function getHRStatus(hr) {
  if (hr < 50 || hr > 120) return { key: 'statusAbnormal', label: '異常',    cls: 'range-danger' };
  if (hr < 60 || hr > 100) return { key: 'statusWarning', label: '注意',    cls: 'range-warn' };
  return                          { key: 'statusNormal', label: '正常',     cls: 'range-ok' };
}
