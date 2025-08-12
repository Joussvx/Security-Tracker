import { Guard, Shift, FullSchedule } from './types';

export const SHIFTS: Shift[] = [
  { id: 'a', name: 'A Shift', startTime: '06:00', endTime: '14:00' },
  { id: 'b', name: 'B Shift', startTime: '14:00', endTime: '22:00' },
  { id: 'c', name: 'C Shift', startTime: '22:00', endTime: '06:00' },
  { id: 'off', name: 'Off Duty', startTime: '', endTime: '' },
];

export const GUARDS: Guard[] = [
  { id: 'guard-1', employeeId: '13008', name: 'ທ ທີ', defaultShiftId: 'a' },
  { id: 'guard-2', employeeId: '13912', name: 'ທ ເຕືອງ', defaultShiftId: 'a' },
  { id: 'guard-3', employeeId: '14709', name: 'ທ ອໍລະວີ', defaultShiftId: 'a' },
  { id: 'guard-4', employeeId: '14799', name: 'ທ ຂຽວ', defaultShiftId: 'a' },
  { id: 'guard-5', employeeId: '14291', name: 'ທ ຫັວງມີໄຊ', defaultShiftId: 'b' },
  { id: 'guard-6', employeeId: '14797', name: 'ທ ໂສພາ', defaultShiftId: 'b' },
  { id: 'guard-7', employeeId: '14684', name: 'ທ ກອງແກ້ວ', defaultShiftId: 'b' },
  { id: 'guard-8', employeeId: '14718', name: 'ທ ຈືວ່າງ', defaultShiftId: 'b' },
  { id: 'guard-9', employeeId: '14802', name: 'ທ ໄມ', defaultShiftId: 'c' },
  { id: 'guard-10', employeeId: '14662', name: 'ທ ສີສະຫັວນ', defaultShiftId: 'c' },
  { id: 'guard-11', employeeId: '14679', name: 'ທ ຄໍາຫຼ້າ', defaultShiftId: 'c' },
  { id: 'guard-12', employeeId: '14532', name: 'ທ ໄຊ', defaultShiftId: 'c' },
  { id: 'guard-13', employeeId: '14671', name: 'ທ ໄມລອນ', defaultShiftId: 'a' },
  { id: 'guard-14', employeeId: '14723', name: 'ທ ກັນລະຍາ', defaultShiftId: 'c' },
];

export const generateInitialSchedule = (): FullSchedule => {
  const schedule: FullSchedule = {};
  const today = new Date();
  for (let i = -30; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateString = date.toISOString().split('T')[0];
    schedule[dateString] = {};
  }
  return schedule;
};