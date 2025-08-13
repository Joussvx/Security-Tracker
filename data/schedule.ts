import { supabase } from '../lib/supabase';
import { FullSchedule } from '../types';

type DbScheduleRow = {
  id: string;
  date: string; // YYYY-MM-DD
  guard_id: string;
  shift_id: string | null;
};

export async function listScheduleRange(startDate: string, endDate: string): Promise<FullSchedule> {
  const { data, error } = await supabase
    .from('schedule')
    .select('id, date, guard_id, shift_id')
    .gte('date', startDate)
    .lte('date', endDate);
  if (error) throw error;
  const schedule: FullSchedule = {};
  (data || []).forEach((row: DbScheduleRow) => {
    const date = row.date;
    if (!schedule[date]) schedule[date] = {};
    schedule[date][row.guard_id] = { guardId: row.guard_id, shiftId: row.shift_id || 'off' };
  });
  return schedule;
}

async function findScheduleEntryId(date: string, guardId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('schedule')
    .select('id')
    .eq('date', date)
    .eq('guard_id', guardId)
    .limit(1)
    .maybeSingle();
  if (error && error.code !== 'PGRST116') throw error;
  return (data as { id: string } | null)?.id ?? null;
}

export async function upsertSchedule(date: string, guardId: string, shiftId: string): Promise<void> {
  // prefer on-conflict if unique index exists; fallback to select+update
  const { error } = await supabase
    .from('schedule')
    .upsert({ date, guard_id: guardId, shift_id: shiftId }, { onConflict: 'date,guard_id' });
  if (error) {
    const existingId = await findScheduleEntryId(date, guardId);
    if (existingId) {
      const { error: updErr } = await supabase
        .from('schedule')
        .update({ shift_id: shiftId })
        .eq('id', existingId);
      if (updErr) throw updErr;
    } else {
      const { error: insErr } = await supabase
        .from('schedule')
        .insert({ date, guard_id: guardId, shift_id: shiftId });
      if (insErr) throw insErr;
    }
  }
}

export async function bulkInsertScheduleFromFull(full: FullSchedule, startDate: string, endDate: string): Promise<void> {
  const rows: Array<{ date: string; guard_id: string; shift_id: string | null }> = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const daily = full[dateStr];
    if (!daily) continue;
    Object.values(daily).forEach(({ guardId, shiftId }) => {
      rows.push({ date: dateStr, guard_id: guardId, shift_id: shiftId });
    });
  }
  if (rows.length === 0) return;
  const chunkSize = 500;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await supabase.from('schedule').insert(chunk);
    if (error) throw error;
  }
}

export function subscribeSchedule(onChange: (e: { type: 'INSERT' | 'UPDATE' | 'DELETE'; row: DbScheduleRow }) => void) {
  return supabase
    .channel('schedule_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'schedule' }, (payload) => {
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        onChange({ type: payload.eventType, row: payload.new as DbScheduleRow });
      } else if (payload.eventType === 'DELETE') {
        onChange({ type: 'DELETE', row: payload.old as DbScheduleRow });
      }
    })
    .subscribe();
}


