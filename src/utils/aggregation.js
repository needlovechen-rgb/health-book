import {
  startOfDay, endOfDay, startOfWeek, endOfWeek,
  startOfMonth, endOfMonth, startOfYear, endOfYear,
  eachHourOfInterval, eachDayOfInterval, eachMonthOfInterval,
  format, parseISO, isWithinInterval, getHours, getDay,
  addDays, addWeeks, addMonths, addYears,
  subDays, subWeeks, subMonths, subYears,
} from 'date-fns';
import { zhTW } from 'date-fns/locale';

const avg = arr => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null;

function recordsInInterval(records, start, end) {
  return records.filter(r => {
    const d = parseISO(r.datetime);
    return isWithinInterval(d, { start, end });
  });
}

function aggregate(buckets) {
  return buckets.map(({ label, records }) => ({
    label,
    systolic:  avg(records.map(r => r.systolic).filter(Boolean)),
    diastolic: avg(records.map(r => r.diastolic).filter(Boolean)),
    heartRate: avg(records.map(r => r.heartRate).filter(Boolean)),
    bloodSugar: avg(records.map(r => r.bloodSugar).filter(Boolean)),
    count: records.length,
  }));
}

// ─── 日：每小時分桶 ─────────────────────────────────────────────
export function aggregateDay(records, refDate) {
  const start = startOfDay(refDate);
  const end   = endOfDay(refDate);
  const dayRecords = recordsInInterval(records, start, end);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const buckets = hours.map(h => ({
    label: `${String(h).padStart(2,'0')}:00`,
    records: dayRecords.filter(r => getHours(parseISO(r.datetime)) === h),
  }));
  return aggregate(buckets);
}

// ─── 週：每天分桶（週一到週日）──────────────────────────────────
export function aggregateWeek(records, refDate) {
  const start = startOfWeek(refDate, { weekStartsOn: 1 });
  const end   = endOfWeek(refDate,   { weekStartsOn: 1 });
  const days  = eachDayOfInterval({ start, end });

  const buckets = days.map(day => ({
    label: format(day, 'EEE M/d', { locale: zhTW }),
    records: recordsInInterval(records, startOfDay(day), endOfDay(day)),
  }));
  return aggregate(buckets);
}

// ─── 月：每天分桶 ──────────────────────────────────────────────
export function aggregateMonth(records, refDate) {
  const start = startOfMonth(refDate);
  const end   = endOfMonth(refDate);
  const days  = eachDayOfInterval({ start, end });

  const buckets = days.map(day => ({
    label: format(day, 'd'),
    records: recordsInInterval(records, startOfDay(day), endOfDay(day)),
  }));
  return aggregate(buckets);
}

// ─── 年：每月分桶 ──────────────────────────────────────────────
export function aggregateYear(records, refDate) {
  const start  = startOfYear(refDate);
  const end    = endOfYear(refDate);
  const months = eachMonthOfInterval({ start, end });

  const buckets = months.map(m => ({
    label: format(m, 'M月'),
    records: recordsInInterval(records, startOfMonth(m), endOfMonth(m)),
  }));
  return aggregate(buckets);
}

// ─── 導航輔助 ──────────────────────────────────────────────────
export const navigators = {
  day:   { prev: d => subDays(d, 1),   next: d => addDays(d, 1),   label: d => format(d, 'yyyy年M月d日') },
  week:  { prev: d => subWeeks(d, 1),  next: d => addWeeks(d, 1),  label: d => {
    const s = startOfWeek(d, { weekStartsOn: 1 });
    const e = endOfWeek(d,   { weekStartsOn: 1 });
    return `${format(s,'M/d')} – ${format(e,'M/d')}`;
  }},
  month: { prev: d => subMonths(d, 1), next: d => addMonths(d, 1), label: d => format(d, 'yyyy年M月') },
  year:  { prev: d => subYears(d, 1),  next: d => addYears(d, 1),  label: d => format(d, 'yyyy年') },
};

export function getAggregated(mode, records, refDate) {
  if (mode === 'day')   return aggregateDay(records, refDate);
  if (mode === 'week')  return aggregateWeek(records, refDate);
  if (mode === 'month') return aggregateMonth(records, refDate);
  if (mode === 'year')  return aggregateYear(records, refDate);
  return [];
}
