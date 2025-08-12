

export enum AttendanceStatus {
  Scheduled = 'Scheduled',
  Present = 'Present',
  Absent = 'Absent',
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'viewer';
}

export interface Guard {
  id:string;
  name:string;
  employeeId: string;
  defaultShiftId: string;
}

export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

export interface AttendanceRecord {
  guardId: string;
  shiftId: string;
  status: AttendanceStatus;
  coveredBy?: string; // guardId of the covering guard
  isOvertime?: boolean;
  notes?: string;
}

export interface ScheduleEntry {
  guardId: string;
  shiftId:string;
}

export type DailySchedule = Record<string, ScheduleEntry>; // Key is guardId

export type FullSchedule = Record<string, DailySchedule>; // Key is date string 'YYYY-MM-DD'

export type View = 'Dashboard' | 'Schedule' | 'Guards' | 'Reports' | 'Settings';

export type Language = 'en' | 'lo' | 'th' | 'ru' | 'zh' | 'ja';

export type Theme = 'light' | 'dark';

export interface ReportTemplate {
  id: string;
  name: string;
  type: 'attendance' | 'overtime' | 'overtime_detailed';
  columns: string[];
}

export interface AppState {
  guards: Guard[];
  shifts: Shift[];
  schedule: FullSchedule;
  attendance: Record<string, Record<string, AttendanceRecord>>;
  language: Language;
  theme: Theme;
  users: User[];
  currentUser: User | null;
  reportTemplates: ReportTemplate[];
}

export type Action =
  | { type: 'LOGIN'; payload: { user: User } }
  | { type: 'LOGOUT' }
  | { type: 'SET_LANGUAGE'; payload: { language: Language } }
  | { type: 'SET_THEME'; payload: { theme: Theme } }
  | { type: 'ADD_USER'; payload: { user: User } }
  | { type: 'DELETE_USER'; payload: { userId: string } }
  | { type: 'ADD_GUARD'; payload: { guard: Guard } }
  | { type: 'UPDATE_GUARD'; payload: { guard: Guard } }
  | { type: 'DELETE_GUARD'; payload: { guardId: string } }
  | { type: 'UPDATE_SCHEDULE'; payload: { date: string; guardId: string; shiftId: string } }
  | { type: 'UPDATE_ATTENDANCE'; payload: { date: string; guardId: string; updates: Partial<AttendanceRecord> } }
  | { type: 'ADD_REPORT_TEMPLATE'; payload: { template: ReportTemplate } }
  | { type: 'DELETE_REPORT_TEMPLATE'; payload: { templateId: string } }
  | { type: 'SET_GUARDS'; payload: { guards: Guard[] } }
  | { type: 'SET_SHIFTS'; payload: { shifts: Shift[] } }
  | { type: 'SET_SCHEDULE'; payload: { schedule: FullSchedule } }
  | { type: 'SET_ATTENDANCE'; payload: { attendance: Record<string, Record<string, AttendanceRecord>> } };


export interface GuardianContextType {
    guards: Guard[];
    shifts: Shift[];
    schedule: FullSchedule;
    attendance: Record<string, Record<string, AttendanceRecord>>;
    loadRange: (startDate: string, endDate: string) => Promise<void>;
    addGuard: (guard: Omit<Guard, 'id'>) => void;
    updateGuard: (updatedGuard: Guard) => void;
    deleteGuard: (guardId: string) => void;
    updateAttendance: (date: string, guardId: string, updates: Partial<AttendanceRecord>) => void;
    updateSchedule: (date: string, guardId: string, shiftId: string) => void;
    language: Language;
    setLanguage: (language: Language) => void;
    theme: Theme;
    setTheme: (theme: Theme) => void;
    currentUser: User | null;
    users: User[];
    login: (username: string, pass: string) => boolean;
    logout: () => void;
    addUser: (username: string) => User | null;
    deleteUser: (userId: string) => void;
    reportTemplates: ReportTemplate[];
    addReportTemplate: (template: Omit<ReportTemplate, 'id'>) => void;
    deleteReportTemplate: (templateId: string) => void;
}