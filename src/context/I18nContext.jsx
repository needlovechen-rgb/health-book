import { createContext, useContext, useState, useEffect } from 'react';

const I18nContext = createContext(null);

const translations = {
  zh: {
    appTitle: '血壓血糖健康手冊',
    recordsCount: '筆紀錄',
    addUser: '新增用戶',
    editUser: '修改用戶',
    name: '姓名',
    cancel: '取消',
    confirm: '確定',
    delete: '刪除',
    exportCSV: '匯出 CSV',
    exportJSON: '匯出 JSON',
    importJSON: '匯入 JSON',
    latestData: '最新數據',
    systolic: '收縮壓',
    diastolic: '舒張壓',
    heartRate: '脈搏',
    bloodSugar: '血糖',
    time: '時間',
    note: '備註',
    action: '操作',
    trendChart: '趨勢圖表',
    trendChartSub: '選擇日 / 週 / 月 / 年 觀看量測趨勢，點 ‹ › 切換期間',
    edit: '編輯',
    save: '儲存',
    search: '搜尋備註或數值...',
    records: '筆紀錄',
    confirmDelete: '確定刪除嗎？',
    deleted: '已刪除',
    nameExists: '名稱已存在',
    addedUser: '已新增用戶',
    deletedUser: '已刪除用戶',
    switchLang: 'EN',
    sysErr: '收縮壓應在 60–250 mmHg',
    diaErr: '舒張壓應在 40–150 mmHg',
    hrErr: '心跳應在 30–220 bpm',
    bgErr: '血糖應在 20–600 mg/dL',
    editRecordTitle: '✏️ 編輯紀錄',
    addRecordTitle: '➕ 新增量測',
    measureTime: '📅 量測時間',
    now: '⏱ 現在',
    bloodPressure: '🩸 血壓',
    bloodSugarOpt: '🍬 血糖（選填）',
    noteOpt: '📝 備註（選填）',
    notePlaceholder: '例如：飯後30分鐘量測、稍作休息後、運動後...',
    saveChanges: '✓ 儲存修改',
    saveRecord: '✓ 儲存量測值',
    fasting: '空腹',
    postMeal: '飯後',
    recordUpdated: '紀錄已更新 ✓',
    recordSaved: '量測值已儲存 ✓',
    datetime: '日期時間',
    searchHint: '🔍 搜尋備註或日期...',
    exportHint: '（匯出請點右上角 👤）',
    noRecords: '尚無量測紀錄，請在左側輸入第一筆資料',
    recordsTitle: '📋 量測紀錄',
    total: '共',
    countUnit: '筆',
    day: '日',
    week: '週',
    month: '月',
    year: '年',
    todayBtn: '今',
    highBp: '高血壓',
    high: '偏高',
    low: '偏低',
    diabetes: '糖尿病',
    fastingHigh: '空腹偏高',
    noDataForPeriod: '此期間無量測紀錄',
  },
  en: {
    appTitle: 'BP & BG Health Book',
    recordsCount: 'records',
    addUser: 'Add User',
    editUser: 'Edit User',
    name: 'Name',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    exportCSV: 'Export CSV',
    exportJSON: 'Export JSON',
    importJSON: 'Import JSON',
    latestData: 'Latest Data',
    systolic: 'Systolic',
    diastolic: 'Diastolic',
    heartRate: 'Heart Rate',
    bloodSugar: 'Blood Sugar',
    time: 'Time',
    note: 'Note',
    action: 'Action',
    trendChart: 'Trend Chart',
    trendChartSub: 'Select Day/Week/Month/Year to view trend, click ‹ › to switch period',
    edit: 'Edit',
    save: 'Save',
    search: 'Search notes or values...',
    records: 'records',
    confirmDelete: 'Are you sure to delete?',
    deleted: 'Deleted',
    nameExists: 'Name already exists',
    addedUser: 'User added',
    deletedUser: 'User deleted',
    switchLang: '中文',
    sysErr: 'Systolic must be 60–250 mmHg',
    diaErr: 'Diastolic must be 40–150 mmHg',
    hrErr: 'Heart rate must be 30–220 bpm',
    bgErr: 'Blood sugar must be 20–600 mg/dL',
    editRecordTitle: '✏️ Edit Record',
    addRecordTitle: '➕ Add Record',
    measureTime: '📅 Measurement Time',
    now: '⏱ Now',
    bloodPressure: '🩸 Blood Pressure',
    bloodSugarOpt: '🍬 Blood Sugar (Optional)',
    noteOpt: '📝 Note (Optional)',
    notePlaceholder: 'e.g., measured 30 mins after meal...',
    saveChanges: '✓ Save Changes',
    saveRecord: '✓ Save Record',
    fasting: 'Fasting',
    postMeal: 'Post-meal',
    recordUpdated: 'Record updated ✓',
    recordSaved: 'Record saved ✓',
    datetime: 'Datetime',
    searchHint: '🔍 Search notes or date...',
    exportHint: '(Click 👤 top-right to export)',
    noRecords: 'No records yet, enter your first data on the left',
    recordsTitle: '📋 Records',
    total: 'Total',
    countUnit: 'items',
    day: 'Day',
    week: 'Week',
    month: 'Month',
    year: 'Year',
    todayBtn: 'Today',
    highBp: 'High BP',
    high: 'High',
    low: 'Low',
    diabetes: 'Diabetes',
    fastingHigh: 'Fasting High',
    noDataForPeriod: 'No records for this period',
  }
};

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('appLang') || 'zh');

  useEffect(() => {
    localStorage.setItem('appLang', lang);
  }, [lang]);

  const toggleLang = () => {
    setLang(prev => prev === 'zh' ? 'en' : 'zh');
  };

  const t = (key) => {
    return translations[lang][key] || key;
  };

  return (
    <I18nContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
