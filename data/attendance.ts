import { supabase } from '../lib/supabase';
import { AttendanceRecord, AttendanceStatus } from '../types';

type DbAttendanceRow = {
  id: string;
  date: string; // YYYY-MM-DD
  guard_id: string;
  shift_id: string | null;
  status: string;
  covered_by: string | null;
  is_overtime: boolean | null;
};

export async function listAttendanceRange(startDate: string, endDate: string): Promise<Record<string, Record<string, AttendanceRecord>>> {
  const { data, error } = await supabase
    .from('attendance')
    .select('id, date, guard_id, shift_id, status, covered_by, is_overtime')
    .gte('date', startDate)
    .lte('date', endDate);
  if (error) throw error;
  const byDate: Record<string, Record<string, AttendanceRecord>> = {};
  (data || []).forEach((row: DbAttendanceRow) => {
    if (!byDate[row.date]) byDate[row.date] = {};
    byDate[row.date][row.guard_id] = {
      guardId: row.guard_id,
      shiftId: row.shift_id || 'off',
      status: (row.status as AttendanceStatus) || AttendanceStatus.Scheduled,
      coveredBy: row.covered_by || undefined,
      isOvertime: row.is_overtime || undefined,
    };
  });
  return byDate;
}

export async function upsertAttendance(date: string, guardId: string, updates: Partial<AttendanceRecord>): Promise<void> {
  const { data: existing, error: findErr } = await supabase
    .from('attendance')
    .select('id')
    .eq('date', date)
    .eq('guard_id', guardId)
    .maybeSingle();
  if (findErr && findErr.code !== 'PGRST116') throw findErr;
  const payload = {
    date,
    guard_id: guardId,
    shift_id: updates.shiftId,
    status: updates.status,
    covered_by: updates.coveredBy ?? null,
    is_overtime: updates.isOvertime ?? null,
  };
  if (existing) {
    const { error } = await supabase.from('attendance').update(payload).eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('attendance').insert(payload);
    if (error) throw error;
  }
}

export function subscribeAttendance(onChange: (e: { type: 'INSERT' | 'UPDATE' | 'DELETE'; row: DbAttendanceRow }) => void) {
  return supabase
    .channel('attendance_changes', { config: { broadcast: { self: false } } })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, (payload) => {
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        onChange({ type: payload.eventType, row: payload.new as DbAttendanceRow });
      } else if (payload.eventType === 'DELETE') {
        onChange({ type: 'DELETE', row: payload.old as DbAttendanceRow });
      }
    })
    .subscribe();
}


