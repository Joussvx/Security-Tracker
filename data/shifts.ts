import { supabase } from '../lib/supabase';
import { Shift } from '../types';
import { SHIFTS } from '../constants';

type DbShiftRow = {
  id: string;
  name: string;
  start_time: string | null;
  end_time: string | null;
  color?: string | null;
};

const dbRowToShift = (row: DbShiftRow): Shift => ({
  id: row.id,
  name: row.name,
  startTime: row.start_time || '',
  endTime: row.end_time || '',
});

export async function listShifts(): Promise<Shift[]> {
  const { data, error } = await supabase
    .from('shifts')
    .select('id, name, start_time, end_time')
    .order('id');
  if (error) throw error;
  return (data || []).map(dbRowToShift);
}

export async function seedDefaultShiftsIfEmpty(): Promise<void> {
  const existing = await listShifts().catch(() => []);
  if ((existing || []).length > 0) return;
  const payload = SHIFTS.map(s => ({ id: s.id, name: s.name, start_time: s.startTime, end_time: s.endTime }));
  await supabase.from('shifts').insert(payload);
}


