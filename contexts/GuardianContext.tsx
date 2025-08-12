import React, { createContext, useContext, useReducer, useCallback, useMemo, ReactNode, useEffect } from 'react';
import { Guard, Shift, AttendanceRecord, FullSchedule, AttendanceStatus, GuardianContextType, Language, User, AppState, Action, ReportTemplate, Theme } from '../types';
import { GUARDS, SHIFTS, generateInitialSchedule } from '../constants';
import { supabase } from '../lib/supabase';
import { listGuards, createGuard as createGuardDb, updateGuardDb, deleteGuardDb, subscribeGuards } from '../data/guards';
import { seedDefaultShiftsIfEmpty, listShifts } from '../data/shifts';
import { listScheduleRange, upsertSchedule, subscribeSchedule } from '../data/schedule';
import { listAttendanceRange, upsertAttendance, subscribeAttendance } from '../data/attendance';

// --- Data Generation & Persistence ---

// FIX: The 'imageScheduleData' constant has been removed.
// The function below is updated to no longer reference it.

const generateInitialScheduleWithData = (guards: Guard[]): FullSchedule => {
    const schedule = generateInitialSchedule();
    const today = new Date();
    const year = today.getFullYear();
    const july = 6; // 0-indexed month for July

    // Ensure all 31 days of July are initialized in the schedule object
    for (let day = 1; day <= 31; day++) {
        const date = new Date(Date.UTC(year, july, day));
        const dateString = date.toISOString().split('T')[0];
        if (!schedule[dateString]) {
            schedule[dateString] = {};
        }
    }

    // Assign every guard their default shift for every day in the schedule
    guards.forEach(guard => {
        Object.keys(schedule).forEach(dateStr => {
            // The complex logic using imageScheduleData has been removed.
            // We now simply assign the guard's default shift.
            if (!schedule[dateStr]) schedule[dateStr] = {};
            schedule[dateStr][guard.id] = { 
                guardId: guard.id, 
                shiftId: guard.defaultShiftId 
            };
        });
    });

    return schedule;
};

const generateInitialAttendance = (schedule: FullSchedule): Record<string, Record<string, AttendanceRecord>> => {
    const attendance: Record<string, Record<string, AttendanceRecord>> = {};
    const year = new Date().getFullYear();
    const july = 6; // 0-indexed month for July

    for (let day = 1; day <= 31; day++) {
        const date = new Date(Date.UTC(year, july, day));
        const dateString = date.toISOString().split('T')[0];
        
        const dailySchedule = schedule[dateString];
        if (!dailySchedule) continue;

        attendance[dateString] = {};

        const allGuardIds = Object.keys(dailySchedule);
        
        const onDutyGuardIds = allGuardIds.filter(guardId => dailySchedule[guardId].shiftId !== 'off');
        const offDutyGuardIds = allGuardIds.filter(guardId => dailySchedule[guardId].shiftId === 'off');
        
        let availableCovers = [...offDutyGuardIds];

        for (const guardId of onDutyGuardIds) {
            const shiftId = dailySchedule[guardId].shiftId;
            const isAbsent = Math.random() < 0.15;

            if (isAbsent) {
                const record: AttendanceRecord = { guardId, shiftId, status: AttendanceStatus.Absent };
                if (availableCovers.length > 0) {
                    const coverGuardId = availableCovers.splice(Math.floor(Math.random() * availableCovers.length), 1)[0];
                    record.coveredBy = coverGuardId;
                    if (Math.random() < 0.5) record.isOvertime = true;
                }
                attendance[dateString][guardId] = record;
            } else {
                attendance[dateString][guardId] = { guardId, shiftId, status: AttendanceStatus.Present };
            }
        }
    }
    return attendance;
};

const defaultAdminUser: User = { id: 'admin-user-01', username: 'admin', password: 'password', role: 'admin' };

const getInitialState = (): AppState => {
    let users: User[] = [defaultAdminUser];
    let currentUser: User | null = null;
    let reportTemplates: ReportTemplate[] = [];
    let theme: Theme = 'light';

    try {
        const usersJson = localStorage.getItem('users');
        if (usersJson) users = JSON.parse(usersJson);
        
        const currentUserJson = sessionStorage.getItem('currentUser');
        if(currentUserJson) currentUser = JSON.parse(currentUserJson);

        const templatesJson = localStorage.getItem('reportTemplates');
        if (templatesJson) reportTemplates = JSON.parse(templatesJson);

        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'dark' || storedTheme === 'light') {
            theme = storedTheme;
        }

    } catch (e) {
        console.error('Failed to parse data from storage', e);
    }

    const initialSchedule = generateInitialScheduleWithData(GUARDS);
    const initialAttendance = generateInitialAttendance(initialSchedule);

    // Ensure at least one admin exists
    if (!users.some(u => u.role === 'admin')) {
        users = [defaultAdminUser, ...users];
    }

    return {
        guards: GUARDS,
        shifts: SHIFTS,
        schedule: initialSchedule,
        attendance: initialAttendance,
        language: 'en',
        theme,
        users,
        currentUser,
        reportTemplates,
    };
};

// --- Reducer ---

const appReducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'SET_GUARDS':
            return { ...state, guards: action.payload.guards };
        case 'SET_SHIFTS':
            return { ...state, shifts: action.payload.shifts };
        case 'SET_SCHEDULE':
            return { ...state, schedule: action.payload.schedule };
        case 'SET_ATTENDANCE':
            return { ...state, attendance: action.payload.attendance };
        case 'LOGIN':
            return { ...state, currentUser: action.payload.user };
        case 'LOGOUT':
            return { ...state, currentUser: null };
        case 'SET_LANGUAGE':
            return { ...state, language: action.payload.language };
        case 'SET_THEME':
            return { ...state, theme: action.payload.theme };
        case 'ADD_USER':
            return { ...state, users: [...state.users, action.payload.user] };
        case 'DELETE_USER': {
            // Never delete admin users
            const filteredUsers = state.users.filter(u => u.role === 'admin' || u.id !== action.payload.userId);
            return { ...state, users: filteredUsers };
        }
        case 'ADD_GUARD': {
            const newGuard = action.payload.guard;
            const todayStr = new Date().toISOString().split('T')[0];
            const newSchedule = { ...state.schedule };
            Object.keys(newSchedule)
                .filter(dateStr => dateStr >= todayStr)
                .forEach(dateStr => {
                    if (newSchedule[dateStr]) {
                        newSchedule[dateStr][newGuard.id] = { guardId: newGuard.id, shiftId: newGuard.defaultShiftId };
                    }
                });
            return { ...state, guards: [...state.guards, newGuard], schedule: newSchedule };
        }
        case 'UPDATE_GUARD': {
            const updatedGuard = action.payload.guard;
            const oldGuard = state.guards.find(g => g.id === updatedGuard.id);
            const newGuards = state.guards.map(g => g.id === updatedGuard.id ? updatedGuard : g);

            if (!oldGuard || oldGuard.defaultShiftId === updatedGuard.defaultShiftId) {
                return { ...state, guards: newGuards };
            }
            
            const todayStr = new Date().toISOString().split('T')[0];
            const newSchedule = { ...state.schedule };
            Object.keys(newSchedule).filter(d => d >= todayStr).forEach(d => {
                if (newSchedule[d][updatedGuard.id]?.shiftId === oldGuard.defaultShiftId) {
                    newSchedule[d][updatedGuard.id].shiftId = updatedGuard.defaultShiftId;
                }
            });

            return { ...state, guards: newGuards, schedule: newSchedule };
        }
        case 'DELETE_GUARD': {
            const { guardId } = action.payload;
            return {
                ...state,
                guards: state.guards.filter(g => g.id !== guardId),
                schedule: Object.fromEntries(
                    Object.entries(state.schedule).map(([date, daily]) => {
                        const { [guardId]: _, ...rest } = daily;
                        return [date, rest];
                    })
                ),
                attendance: Object.fromEntries(
                    Object.entries(state.attendance).map(([date, daily]) => {
                        const { [guardId]: _, ...rest } = daily;
                        const cleaned = Object.fromEntries(
                            Object.entries(rest).map(([gId, record]) => {
                                if (record.coveredBy === guardId) {
                                    const { coveredBy, ...restOfRecord } = record;
                                    return [gId, restOfRecord];
                                }
                                return [gId, record];
                            })
                        );
                        return [date, cleaned];
                    })
                ),
            };
        }
        case 'UPDATE_SCHEDULE': {
            const { date, guardId, shiftId } = action.payload;
            const newSchedule = { ...state.schedule };
            if (!newSchedule[date]) newSchedule[date] = {};
            newSchedule[date][guardId] = { guardId, shiftId };
            return { ...state, schedule: newSchedule };
        }
        case 'UPDATE_ATTENDANCE': {
            const { date, guardId, updates } = action.payload;
            const daily = state.attendance[date] || {};
            const record = daily[guardId] || {
                guardId,
                shiftId: state.schedule[date]?.[guardId]?.shiftId || 'a',
                status: AttendanceStatus.Scheduled,
            };
            const newRecord = { ...record, ...updates };
            if (newRecord.status !== AttendanceStatus.Absent) {
                delete newRecord.coveredBy;
                delete newRecord.isOvertime;
            }
            return { ...state, attendance: { ...state.attendance, [date]: { ...daily, [guardId]: newRecord } } };
        }
        case 'ADD_REPORT_TEMPLATE':
            return { ...state, reportTemplates: [...state.reportTemplates, action.payload.template] };
        case 'DELETE_REPORT_TEMPLATE':
            return { ...state, reportTemplates: state.reportTemplates.filter(t => t.id !== action.payload.templateId) };
        default:
            return state;
    }
};

// --- Context & Provider ---

const GuardianContext = createContext<GuardianContextType | undefined>(undefined);

// Create a BroadcastChannel for real-time updates across tabs.
const channel = new BroadcastChannel('guardian_updates');

export const GuardianProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, getInitialState());

    // Initial load from Supabase with seeding and realtime
    useEffect(() => {
        const init = async () => {
            try {
                await seedDefaultShiftsIfEmpty();
                const remoteShifts = await listShifts();
                dispatch({ type: 'SET_SHIFTS', payload: { shifts: remoteShifts } });

                const remoteGuards = await listGuards();
                dispatch({ type: 'SET_GUARDS', payload: { guards: remoteGuards } });

                // Load current month schedule and attendance
                const today = new Date();
                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
                const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

                const scheduleRange = await listScheduleRange(firstDay, lastDay);
                dispatch({ type: 'SET_SCHEDULE', payload: { schedule: scheduleRange } });
                const attendanceRange = await listAttendanceRange(firstDay, lastDay);
                dispatch({ type: 'SET_ATTENDANCE', payload: { attendance: attendanceRange } });

                // Realtime subscription for guards
                const sub = subscribeGuards((evt) => {
                    if (evt.type === 'INSERT' && evt.new) {
                        dispatch({ type: 'ADD_GUARD', payload: { guard: evt.new } });
                    } else if (evt.type === 'UPDATE' && evt.new) {
                        dispatch({ type: 'UPDATE_GUARD', payload: { guard: evt.new } });
                    } else if (evt.type === 'DELETE' && evt.oldId) {
                        dispatch({ type: 'DELETE_GUARD', payload: { guardId: evt.oldId } });
                    }
                });
                // Realtime for schedule
                const subSchedule = subscribeSchedule((evt) => {
                    const row = evt.row;
                    const dateStr = row.date;
                    const shiftId = row.shift_id || 'off';
                    dispatch({ type: 'UPDATE_SCHEDULE', payload: { date: dateStr, guardId: row.guard_id, shiftId } });
                });
                // Realtime for attendance
                const subAttendance = subscribeAttendance((evt) => {
                    const r = evt.row;
                    const updates: Partial<AttendanceRecord> = {
                        shiftId: r.shift_id || 'off',
                        status: (r.status as AttendanceStatus) || AttendanceStatus.Scheduled,
                        coveredBy: r.covered_by || undefined,
                        isOvertime: r.is_overtime || undefined,
                    };
                    dispatch({ type: 'UPDATE_ATTENDANCE', payload: { date: r.date, guardId: r.guard_id, updates } });
                });
                return () => { sub.unsubscribe(); subSchedule.unsubscribe(); subAttendance.unsubscribe(); };
            } catch (e) {
                console.error('Failed to initialize from Supabase', e);
            }
        };
        const cleanup = init();
        return () => { Promise.resolve(cleanup).catch(() => undefined); };
    }, []);

    // Effect to listen for actions broadcasted from other tabs
    useEffect(() => {
        const handleMessage = (event: MessageEvent<Action>) => {
            // When an action is received from another tab, dispatch it to update the local state.
            // This syncs the state without causing a broadcast loop.
            dispatch(event.data);
        };

        channel.addEventListener('message', handleMessage);
        
        // Cleanup listener on component unmount
        return () => {
            channel.removeEventListener('message', handleMessage);
        };
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('users', JSON.stringify(state.users));
            localStorage.setItem('reportTemplates', JSON.stringify(state.reportTemplates));
        } catch (e) { console.error('Failed to save data to localStorage', e); }
    }, [state.users, state.reportTemplates]);

    useEffect(() => {
        try {
            if (state.currentUser) {
                sessionStorage.setItem('currentUser', JSON.stringify(state.currentUser));
            } else {
                sessionStorage.removeItem('currentUser');
            }
        } catch (e) { console.error('Failed to update currentUser in sessionStorage', e); }
    }, [state.currentUser]);
    
    useEffect(() => {
        const root = window.document.documentElement;
        if (state.theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        try {
            localStorage.setItem('theme', state.theme);
        } catch (e) {
            console.error("Failed to save theme to localStorage", e);
        }
    }, [state.theme]);


    // Create a new dispatcher function that also broadcasts the action to other tabs.
    const dispatchAndBroadcast = useCallback((action: Action) => {
        dispatch(action);
        channel.postMessage(action);
    }, []);

    const login = useCallback((username: string, pass: string): boolean => {
        const user = state.users.find(u => u.username === username && u.password === pass);
        if (user) {
            dispatch({ type: 'LOGIN', payload: { user } });
            return true;
        }
        return false;
    }, [state.users]);

    const logout = useCallback(() => dispatch({ type: 'LOGOUT' }), []);
    
    const addUser = useCallback((username: string): User | null => {
        if (state.users.some(u => u.username === username)) {
            console.error("Username already exists");
            return null;
        }
        const newUser: User = {
            id: crypto.randomUUID(),
            username,
            password: Math.random().toString(36).slice(-8),
            role: 'viewer'
        };
        dispatchAndBroadcast({ type: 'ADD_USER', payload: { user: newUser } });
        return newUser;
    }, [state.users, dispatchAndBroadcast]);
    
    const deleteUser = useCallback((userId: string) => dispatchAndBroadcast({ type: 'DELETE_USER', payload: { userId } }), [dispatchAndBroadcast]);

    const setLanguage = useCallback((language: Language) => dispatch({ type: 'SET_LANGUAGE', payload: { language } }), []);
    const setTheme = useCallback((theme: Theme) => dispatchAndBroadcast({ type: 'SET_THEME', payload: { theme } }), [dispatchAndBroadcast]);

    const addGuard = useCallback(async (guard: Omit<Guard, 'id'>) => {
        try {
            const created = await createGuardDb(guard);
            dispatchAndBroadcast({ type: 'ADD_GUARD', payload: { guard: created } });
        } catch (e) {
            console.error('Failed to create guard in Supabase, falling back to local', e);
            const newGuard: Guard = { ...guard, id: crypto.randomUUID() };
            dispatchAndBroadcast({ type: 'ADD_GUARD', payload: { guard: newGuard } });
        }
    }, [dispatchAndBroadcast]);

    const updateGuard = useCallback(async (guard: Guard) => {
        try {
            const updated = await updateGuardDb(guard);
            dispatchAndBroadcast({ type: 'UPDATE_GUARD', payload: { guard: updated } });
        } catch (e) {
            console.error('Failed to update guard in Supabase, applying local update', e);
            dispatchAndBroadcast({ type: 'UPDATE_GUARD', payload: { guard } });
        }
    }, [dispatchAndBroadcast]);

    const deleteGuard = useCallback(async (guardId: string) => {
        try {
            await deleteGuardDb(guardId);
        } catch (e) {
            console.error('Failed to delete guard in Supabase, removing locally', e);
        }
        dispatchAndBroadcast({ type: 'DELETE_GUARD', payload: { guardId } });
    }, [dispatchAndBroadcast]);
    const updateSchedule = useCallback(async (date: string, guardId: string, shiftId: string) => {
        dispatchAndBroadcast({ type: 'UPDATE_SCHEDULE', payload: { date, guardId, shiftId } });
        try {
            await upsertSchedule(date, guardId, shiftId);
        } catch (e) {
            console.error('Failed to persist schedule to Supabase', e);
        }
    }, [dispatchAndBroadcast]);

    const updateAttendance = useCallback(async (date: string, guardId: string, updates: Partial<AttendanceRecord>) => {
        dispatchAndBroadcast({ type: 'UPDATE_ATTENDANCE', payload: { date, guardId, updates } });
        try {
            await upsertAttendance(date, guardId, updates);
        } catch (e) {
            console.error('Failed to persist attendance to Supabase', e);
        }
    }, [dispatchAndBroadcast]);

    const addReportTemplate = useCallback((template: Omit<ReportTemplate, 'id'>) => {
        const newTemplate = { ...template, id: crypto.randomUUID() };
        dispatchAndBroadcast({ type: 'ADD_REPORT_TEMPLATE', payload: { template: newTemplate }});
    }, [dispatchAndBroadcast]);
    
    const deleteReportTemplate = useCallback((templateId: string) => {
        dispatchAndBroadcast({ type: 'DELETE_REPORT_TEMPLATE', payload: { templateId }});
    }, [dispatchAndBroadcast]);

    const loadRange = useCallback(async (startDate: string, endDate: string) => {
        try {
            const scheduleRange = await listScheduleRange(startDate, endDate);
            dispatch({ type: 'SET_SCHEDULE', payload: { schedule: { ...state.schedule, ...scheduleRange } } });
            const attendanceRange = await listAttendanceRange(startDate, endDate);
            dispatch({ type: 'SET_ATTENDANCE', payload: { attendance: { ...state.attendance, ...attendanceRange } } });
        } catch (e) {
            console.error('Failed to load range from Supabase', e);
        }
    }, [state.schedule, state.attendance]);

    const value = useMemo(() => ({
        ...state,
        loadRange,
        addGuard,
        updateGuard,
        deleteGuard,
        updateAttendance,
        updateSchedule,
        setLanguage,
        setTheme,
        login,
        logout,
        addUser,
        deleteUser,
        addReportTemplate,
        deleteReportTemplate,
    }), [state, loadRange, addGuard, updateGuard, deleteGuard, updateAttendance, updateSchedule, setLanguage, setTheme, login, logout, addUser, deleteUser, addReportTemplate, deleteReportTemplate]);

    return <GuardianContext.Provider value={value}>{children}</GuardianContext.Provider>;
};

export const useGuardian = (): GuardianContextType => {
    const context = useContext(GuardianContext);
    if (context === undefined) {
        throw new Error('useGuardian must be used within a GuardianProvider');
    }
    return context;
};
