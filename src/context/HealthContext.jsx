import { createContext, useContext, useReducer, useEffect, useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { loadRecords, saveRecords, loadMembers, saveMembers } from '../utils/storage';

const HealthContext = createContext(null);

function recordsReducer(state, action) {
  switch (action.type) {
    case 'LOAD':   return action.payload;
    case 'ADD':    return [action.payload, ...state];
    case 'UPDATE': return state.map(r => r.id === action.payload.id ? { ...r, ...action.payload } : r);
    case 'DELETE': return state.filter(r => r.id !== action.payload);
    default:       return state;
  }
}

export function HealthProvider({ children }) {
  // ─── 成員管理 ───────────────────────────────────────────────
  const [members, setMembersState] = useState(loadMembers);
  const [currentMemberId, setCurrentMemberId] = useState(() => loadMembers()[0]?.id ?? 'self');

  // ─── 紀錄（依當前成員） ─────────────────────────────────────
  const [records, dispatch] = useReducer(recordsReducer, []);
  const [toast, setToast]   = useState(null);

  // 切換成員時重新載入紀錄
  useEffect(() => {
    dispatch({ type: 'LOAD', payload: loadRecords(currentMemberId) });
  }, [currentMemberId]);

  // 紀錄變動時儲存
  const saveOnChange = useCallback((newRecords) => {
    saveRecords(newRecords, currentMemberId);
  }, [currentMemberId]);

  const addRecord = useCallback(data => {
    const r = { ...data, id: uuidv4(), createdAt: Date.now() };
    dispatch({ type: 'ADD', payload: r });
    const next = [r, ...loadRecords(currentMemberId)];
    saveRecords(next, currentMemberId);
  }, [currentMemberId]);

  const updateRecord = useCallback(data => {
    dispatch({ type: 'UPDATE', payload: data });
    const current = loadRecords(currentMemberId);
    saveRecords(current.map(r => r.id === data.id ? { ...r, ...data } : r), currentMemberId);
  }, [currentMemberId]);

  const deleteRecord = useCallback(id => {
    dispatch({ type: 'DELETE', payload: id });
    saveRecords(loadRecords(currentMemberId).filter(r => r.id !== id), currentMemberId);
  }, [currentMemberId]);

  const importRecords = useCallback(imported => {
    // 合併匯入（id 去重）
    const existing = loadRecords(currentMemberId);
    const existIds = new Set(existing.map(r => r.id));
    const merged = [
      ...imported.filter(r => !existIds.has(r.id)).map(r => ({ ...r, id: r.id || uuidv4() })),
      ...existing,
    ].slice(0, 10_000);
    saveRecords(merged, currentMemberId);
    dispatch({ type: 'LOAD', payload: merged });
    return merged.length - existing.length; // 回傳新增筆數
  }, [currentMemberId]);

  // ─── 成員 CRUD ──────────────────────────────────────────────
  const addMember = useCallback(name => {
    const m = { id: uuidv4(), name: name.trim() };
    const next = [...members, m];
    setMembersState(next);
    saveMembers(next);
    setCurrentMemberId(m.id);
  }, [members]);

  const renameMember = useCallback((id, name) => {
    const next = members.map(m => m.id === id ? { ...m, name } : m);
    setMembersState(next);
    saveMembers(next);
  }, [members]);

  const deleteMember = useCallback(id => {
    if (members.length <= 1) return; // 至少保留一位
    const next = members.filter(m => m.id !== id);
    setMembersState(next);
    saveMembers(next);
    if (currentMemberId === id) setCurrentMemberId(next[0].id);
  }, [members, currentMemberId]);

  // ─── Toast ──────────────────────────────────────────────────
  const showToast = useCallback((msg, kind = 'ok') => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const currentMember = members.find(m => m.id === currentMemberId) ?? members[0];

  return (
    <HealthContext.Provider value={{
      records, toast,
      members, currentMemberId, currentMember,
      addRecord, updateRecord, deleteRecord, importRecords,
      addMember, renameMember, deleteMember,
      switchMember: setCurrentMemberId,
      showToast,
    }}>
      {children}
    </HealthContext.Provider>
  );
}

export const useHealth = () => useContext(HealthContext);
