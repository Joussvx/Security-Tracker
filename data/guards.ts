import { supabase } from '../lib/supabase';
import { Guard } from '../types';

type DbGuardRow = {
  id: string;
  name: string;
  employee_id: string;
  default_shift_id: string | null;
};

const dbRowToGuard = (row: DbGuardRow): Guard => ({
  id: row.id,
  name: row.name,
  employeeId: row.employee_id,
  defaultShiftId: row.default_shift_id || 'off',
});

const guardToDbInsert = (guard: Omit<Guard, 'id'>) => ({
  name: guard.name,
  employee_id: guard.employeeId,
  default_shift_id: guard.defaultShiftId,
});

const guardToDbUpdate = (guard: Guard) => ({
  name: guard.name,
  employee_id: guard.employeeId,
  default_shift_id: guard.defaultShiftId,
});

export async function listGuards(): Promise<Guard[]> {
  const { data, error } = await supabase
    .from('guards')
    .select('id, name, employee_id, default_shift_id')
    .order('name');
  if (error) throw error;
  return (data || []).map(dbRowToGuard);
}

export async function createGuard(guard: Omit<Guard, 'id'>): Promise<Guard> {
  const { data, error } = await supabase
    .from('guards')
    .insert(guardToDbInsert(guard))
    .select('id, name, employee_id, default_shift_id')
    .single();
  if (error) throw error;
  return dbRowToGuard(data as DbGuardRow);
}

export async function updateGuardDb(guard: Guard): Promise<Guard> {
  const { data, error } = await supabase
    .from('guards')
    .update(guardToDbUpdate(guard))
    .eq('id', guard.id)
    .select('id, name, employee_id, default_shift_id')
    .single();
  if (error) throw error;
  return dbRowToGuard(data as DbGuardRow);
}

export async function deleteGuardDb(guardId: string): Promise<void> {
  const { error } = await supabase.from('guards').delete().eq('id', guardId);
  if (error) throw error;
}

export function subscribeGuards(onChange: (e: { type: 'INSERT' | 'UPDATE' | 'DELETE'; new?: Guard; oldId?: string }) => void) {
  return supabase
    .channel('guards_changes', { config: { broadcast: { self: false } } })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'guards' }, (payload) => {
      if (payload.eventType === 'INSERT') {
        onChange({ type: 'INSERT', new: dbRowToGuard(payload.new as DbGuardRow) });
      } else if (payload.eventType === 'UPDATE') {
        onChange({ type: 'UPDATE', new: dbRowToGuard(payload.new as DbGuardRow) });
      } else if (payload.eventType === 'DELETE') {
        onChange({ type: 'DELETE', oldId: (payload.old as { id: string }).id });
      }
    })
    .subscribe();
}


