


import React, { useState, useMemo, useCallback, useEffect, FC, useRef } from 'react';
import { AttendanceStatus, Guard, AttendanceRecord, Language, Shift } from '../types';
import { useGuardian } from '../contexts/GuardianContext';
import Icon from './Icon';
import { useTranslations } from '../hooks/useTranslations';
import CustomSelect from './CustomSelect';

const getRowClass = (status: AttendanceStatus) => {
    switch (status) {
        case AttendanceStatus.Absent:
            return 'bg-red-50 dark:bg-red-900/20';
        default:
            return '';
    }
};

// --- Sub-components ---

interface CalendarProps {
    selectedDate: string;
    onDateChange: (date: string) => void;
    month: Date;
    onMonthChange: (newMonth: Date) => void;
    language: Language;
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateChange, month, onMonthChange, language }) => {
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const startDay = startOfMonth.getDay();
    const daysInMonth = endOfMonth.getDate();
    const today = new Date().toISOString().split('T')[0];

    const calendarDays = Array.from({ length: startDay }, (_, i) => <div key={`empty-${i}`}></div>)
        .concat(Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateStr = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === today;
            return (
                <div key={day} className="py-2 text-center bg-white dark:bg-gray-800">
                    <button
                        onClick={() => onDateChange(dateStr)}
                        className={`h-8 w-8 rounded-full text-sm transition-colors ${
                            isSelected ? 'bg-indigo-600 text-white font-semibold dark:bg-indigo-500' : 
                            isToday ? 'bg-blue-100 text-indigo-600 dark:bg-blue-900/50 dark:text-indigo-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        aria-current={isSelected ? 'date' : undefined}
                    >
                        {day}
                    </button>
                </div>
            );
        }));

    return (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
                <button onClick={() => onMonthChange(new Date(month.setMonth(month.getMonth() - 1)))} className="rounded-md p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100" aria-label="Previous month">
                    <Icon icon="arrow-left" className="h-5 w-5" aria-hidden="true" />
                </button>
                <p className="text-lg font-semibold dark:text-gray-100" aria-live="polite">{month.toLocaleString(language, { month: 'long', year: 'numeric' })}</p>
                <button onClick={() => onMonthChange(new Date(month.setMonth(month.getMonth() + 1)))} className="rounded-md p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100" aria-label="Next month">
                    <Icon icon="arrow-right" className="h-5 w-5" aria-hidden="true" />
                </button>
            </div>
            <div className="grid grid-cols-7 gap-px bg-gray-200 p-2 dark:bg-gray-700">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                    <p key={day} className="py-2 text-center text-xs font-bold uppercase text-gray-500 dark:text-gray-400"><abbr title={day}>{day}</abbr></p>
                ))}
                {calendarDays}
            </div>
        </div>
    );
}

const NotesModal: React.FC<{
    isOpen: boolean;
    note: string;
    onNoteChange: (newNote: string) => void;
    onSave: () => void;
    onClose: () => void;
    guardName: string;
    isViewer: boolean;
}> = ({ isOpen, note, onNoteChange, onSave, onClose, guardName, isViewer }) => {
    const { t } = useTranslations();
    const modalRef = useRef<HTMLDivElement>(null);
    const noteTextAreaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isOpen) {
            const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements?.[0];
            const lastElement = focusableElements?.[focusableElements.length - 1];

            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Tab') {
                    if (e.shiftKey) {
                        if (document.activeElement === firstElement) {
                            lastElement?.focus();
                            e.preventDefault();
                        }
                    } else {
                        if (document.activeElement === lastElement) {
                            firstElement?.focus();
                            e.preventDefault();
                        }
                    }
                } else if (e.key === 'Escape') {
                    onClose();
                }
            };
            
            noteTextAreaRef.current?.focus();
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const modalTitleId = "notes-modal-title";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" aria-modal="true" role="dialog" aria-labelledby={modalTitleId}>
            <div ref={modalRef} className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
                <h3 id={modalTitleId} className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('noteForGuard', { name: guardName })}</h3>
                <div className="mt-4">
                    <label htmlFor="note-textarea" className="sr-only">{t('noteForGuard', { name: guardName })}</label>
                    <textarea
                        id="note-textarea"
                        ref={noteTextAreaRef}
                        value={note}
                        onChange={(e) => onNoteChange(e.target.value)}
                        className="w-full h-32 rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 dark:disabled:bg-gray-700/50 dark:disabled:text-gray-400"
                        placeholder={t('enterNotesHere')}
                        readOnly={isViewer}
                        disabled={isViewer}
                    ></textarea>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:bg-gray-700 dark:border-gray-500 dark:text-gray-200 dark:hover:bg-gray-600"
                    >
                        {t('close')}
                    </button>
                    {!isViewer && (
                        <button
                            type="button"
                            onClick={onSave}
                            className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                        >
                            {t('saveNote')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

interface DashboardTableRowProps {
    guard: Guard;
    guardAttendance: AttendanceRecord;
    shift?: Shift;
    isViewer: boolean;
    needsCover: boolean;
    guardCoveringThisShift?: Guard;
    guardBeingCovered?: Guard;
    dailyAttendance: Record<string, AttendanceRecord>;
    coverOptions: {value: string; label: string}[];
    statusOptions: {value: string; label: string}[];
    onUpdateAttendance: (newUpdates: Partial<AttendanceRecord>) => void;
    onUpdateCoverAttendance: (_guardId: string, newUpdates: Partial<AttendanceRecord>) => void;
    onOpenNoteModal: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const DashboardTableRow: FC<DashboardTableRowProps> = React.memo(({
    guard, guardAttendance, shift, isViewer, needsCover, guardBeingCovered, dailyAttendance,
    coverOptions, statusOptions, onUpdateAttendance, onUpdateCoverAttendance, onOpenNoteModal
}) => {
    const { t } = useTranslations();
    
    return (
        <tr className={getRowClass(guardAttendance.status)}>
            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{guard.name}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{guard.employeeId}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                {shift ? `${shift.name}${shift.id !== 'off' ? ` (${shift.startTime}-${shift.endTime})` : ''}` : 'N/A'}
            </td>
            <td className="px-6 py-4 text-sm">
                <CustomSelect
                    options={statusOptions}
                    value={guardAttendance.status}
                    onChange={value => onUpdateAttendance({ status: value as AttendanceStatus })}
                    disabled={isViewer}
                    aria-label={`Status for ${guard.name}`}
                />
            </td>
            <td className="px-6 py-4 text-sm">
                {needsCover ? (
                <CustomSelect
                    options={coverOptions}
                    value={guardAttendance.coveredBy || ''}
                    onChange={value => {
                                const newUpdates: Partial<AttendanceRecord> = { coveredBy: value || undefined };
                                if (!value) newUpdates.isOvertime = false;
                                onUpdateAttendance(newUpdates);
                    }}
                    placeholder={t('assignCover')}
                    allowClear={true}
                    disabled={isViewer}
                    aria-label={`Assign cover for ${guard.name}`}
                />
                ) : guardBeingCovered ? (
                `${t('covering')}: ${guardBeingCovered.name}`
                ) : (
                <span className="text-gray-500 dark:text-gray-400">-</span>
                )}
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm">
                {guardBeingCovered ? (
                    <label htmlFor={`ot-toggle-${guard.id}`} className="relative inline-flex cursor-pointer items-center">
                        <input
                            type="checkbox"
                            id={`ot-toggle-${guard.id}`}
                            className="peer sr-only"
                            checked={!!(dailyAttendance[guardBeingCovered.id]?.isOvertime)}
                            onChange={e => onUpdateCoverAttendance(guardBeingCovered.id, { isOvertime: e.target.checked })}
                            aria-label={`Mark cover shift for ${guardBeingCovered.name} as overtime`}
                            disabled={isViewer}
                        />
                        <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 peer-disabled:cursor-not-allowed peer-disabled:bg-gray-100 dark:bg-gray-600 dark:after:border-gray-500 dark:after:bg-gray-300 dark:peer-checked:bg-green-600 dark:peer-disabled:bg-gray-700"></div>
                    </label>
                ) : (
                    <span className="text-gray-500 dark:text-gray-400">{needsCover ? 'N/A' : '-'}</span>
                )}
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm">
                <button 
                    onClick={onOpenNoteModal} 
                    className={`font-medium ${guardAttendance.notes ? 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200' : 'text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300'} disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:text-gray-400 dark:disabled:text-gray-500`}
                    disabled={isViewer && !guardAttendance.notes}
                    aria-label={guardAttendance.notes ? t('viewNote') : t('addNote')}
                >
                    {guardAttendance.notes ? t('viewNote') : t('addNote')}
                </button>
            </td>
        </tr>
    );
});
DashboardTableRow.displayName = 'DashboardTableRow';

// --- Main Component ---

const Dashboard: React.FC = () => {
    const { guards, shifts, schedule, attendance, updateAttendance, language, currentUser } = useGuardian();
    const { t, tStatus } = useTranslations();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const [isNoteModalOpen, setNoteModalOpen] = useState(false);
    const [editingNoteGuard, setEditingNoteGuard] = useState<Guard | null>(null);
    const [noteText, setNoteText] = useState('');
    const openNoteButtonRef = useRef<HTMLButtonElement | null>(null);

    const isViewer = currentUser?.role === 'viewer';

    const guardMap = useMemo(() => new Map(guards.map(g => [g.id, g])), [guards]);
    const shiftMap = useMemo(() => new Map(shifts.map(s => [s.id, s])), [shifts]);
    
    const dailyAttendance = useMemo(() => attendance[selectedDate] || {}, [attendance, selectedDate]);
    
    const onDutyGuards = useMemo(() => {
        const dailySchedule = schedule[selectedDate] || {};
        return guards.filter(g => {
            const guardSchedule = dailySchedule[g.id];
            const shiftId = guardSchedule?.shiftId ?? g.defaultShiftId;
            return shiftId !== 'off';
        });
    }, [guards, schedule, selectedDate]);

    const getAttendanceForGuard = useCallback((guardId: string): AttendanceRecord => {
        if (dailyAttendance[guardId]) return dailyAttendance[guardId];
        
        const scheduledShiftId = schedule[selectedDate]?.[guardId]?.shiftId || 'a';
        return {
            guardId,
            shiftId: scheduledShiftId,
            status: AttendanceStatus.Scheduled,
        };
    }, [dailyAttendance, schedule, selectedDate]);

    const whoIsCoveringWhoMap = useMemo(() => {
        const map = new Map<string, Guard>(); // Key: covering guard ID, Value: covered guard
        Object.values(dailyAttendance).forEach((record: AttendanceRecord) => {
            if (record.coveredBy && guardMap.has(record.guardId)) {
                map.set(record.coveredBy, guardMap.get(record.guardId)!);
            }
        });
        return map;
    }, [dailyAttendance, guardMap]);
    
    const availableForCoverGuards = useMemo(() => {
        return guards.filter(g => !whoIsCoveringWhoMap.has(g.id));
    }, [guards, whoIsCoveringWhoMap]);

    const handleOpenNoteModal = (guard: Guard, event: React.MouseEvent<HTMLButtonElement>) => {
        openNoteButtonRef.current = event.currentTarget;
        const currentNote = getAttendanceForGuard(guard.id).notes || '';
        setNoteText(currentNote);
        setEditingNoteGuard(guard);
        setNoteModalOpen(true);
    };

    const handleCloseNoteModal = () => {
        setNoteModalOpen(false);
        openNoteButtonRef.current?.focus();
    };

    const handleSaveNote = () => {
        if (isViewer || !editingNoteGuard) return;
        updateAttendance(selectedDate, editingNoteGuard.id, { notes: noteText });
        handleCloseNoteModal();
        setEditingNoteGuard(null);
        setNoteText('');
    };

    const statusOptions = useMemo(() =>
        Object.values(AttendanceStatus).map(s => ({ value: s, label: tStatus(s) }))
    , [tStatus]);

    return (
        <div className="mx-auto max-w-screen-2xl p-4 sm:p-6 lg:p-8">
            <NotesModal
                isOpen={isNoteModalOpen}
                note={noteText}
                onNoteChange={setNoteText}
                onSave={handleSaveNote}
                onClose={handleCloseNoteModal}
                guardName={editingNoteGuard?.name || ''}
                isViewer={isViewer}
            />
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                <div className="lg:col-span-4 xl:col-span-3">
                   <div className="lg:sticky lg:top-24 self-start">
                     <Calendar
                          selectedDate={selectedDate}
                          onDateChange={setSelectedDate}
                          month={currentMonth}
                          onMonthChange={setCurrentMonth}
                          language={language}
                      />
                   </div>
                </div>
                <div className="lg:col-span-8 xl:col-span-9">
                    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                           <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('guardName')}</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('guardId')}</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('scheduledShift')}</th>
                                    <th scope="col" className="w-52 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('status')}</th>
                                    <th scope="col" className="w-52 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('coveredBy')}</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('coveringOt')}</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('notes')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                {onDutyGuards.length > 0 ? (
                                    onDutyGuards.map(guard => {
                                        const guardAttendance = getAttendanceForGuard(guard.id);
                                        const shift = shiftMap.get(guardAttendance.shiftId);
                                        const needsCover = guardAttendance.status === AttendanceStatus.Absent;
                                        const guardCoveringThisShift = guardMap.get(guardAttendance.coveredBy || '');
                                        const guardBeingCovered = whoIsCoveringWhoMap.get(guard.id);

                                        const coverOptions = (() => {
                                            const options = availableForCoverGuards
                                                .filter(g => g.id !== guard.id)
                                                .map(g => ({ value: g.id, label: g.name }));
                                            if (guardCoveringThisShift && !options.some(opt => opt.value === guardCoveringThisShift.id)) {
                                                options.unshift({ value: guardCoveringThisShift.id, label: guardCoveringThisShift.name });
                                            }
                                            return options;
                                        })();

                                        return (
                                            <DashboardTableRow
                                                key={guard.id}
                                                guard={guard}
                                                guardAttendance={guardAttendance}
                                                shift={shift}
                                                isViewer={isViewer}
                                                needsCover={needsCover}
                                                guardCoveringThisShift={guardCoveringThisShift}
                                                guardBeingCovered={guardBeingCovered}
                                                dailyAttendance={dailyAttendance}
                                                coverOptions={coverOptions}
                                                statusOptions={statusOptions}
                                                onUpdateAttendance={(newUpdates) => updateAttendance(selectedDate, guard.id, newUpdates)}
                                                onUpdateCoverAttendance={(gid, newUpdates) => updateAttendance(selectedDate, gid, newUpdates)}
                                                onOpenNoteModal={(e) => handleOpenNoteModal(guard, e)}
                                            />
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="py-10 px-6 text-center text-gray-500 dark:text-gray-400">
                                            {t('noGuardsToDisplay')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;