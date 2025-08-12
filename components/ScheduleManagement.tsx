


import React, { useState, useMemo, useEffect } from 'react';
import { useGuardian } from '../contexts/GuardianContext';
import Icon from './Icon';
import { useTranslations } from '../hooks/useTranslations';
import ShiftSelector from './ShiftSelector';
import CustomSelect from './CustomSelect';

const getMonthDays = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(year, month, i));
    }
    return days;
};

const ScheduleManagement: React.FC = () => {
    const { guards, shifts, schedule, updateSchedule, language, currentUser, loadRange } = useGuardian();
    const { t } = useTranslations();
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const [shiftFilter, setShiftFilter] = useState('all');
    const [isCondensed, setIsCondensed] = useState(false);

    const isViewer = currentUser?.role === 'viewer';
    const monthDays = useMemo(() => getMonthDays(currentMonth), [currentMonth]);

    useEffect(() => {
        // Load selected month from Supabase when navigated
        const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString().split('T')[0];
        const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).toISOString().split('T')[0];
        loadRange(start, end);
    }, [currentMonth, loadRange]);

    const filteredGuards = useMemo(() => {
        if (shiftFilter === 'all') {
            return guards;
        }
        return guards.filter(guard => {
            return monthDays.some(day => {
                const dateString = day.toISOString().split('T')[0];
                const shiftId = schedule[dateString]?.[guard.id]?.shiftId ?? guard.defaultShiftId;
                return shiftId === shiftFilter;
            });
        });
    }, [guards, shifts, shiftFilter, monthDays, schedule]);

    const handleShiftChange = (date: string, guardId: string, shiftId: string) => {
        if (isViewer) return;
        updateSchedule(date, guardId, shiftId);
    };

    const goToPreviousMonth = () => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };
    
    const monthDisplayString = currentMonth.toLocaleDateString(language, { month: 'long', year: 'numeric' });
    const shiftOptions = [{ value: 'all', label: t('allShifts') }, ...shifts.map(s => ({ value: s.id, label: s.name }))];

    return (
        <div className="mx-auto max-w-screen-2xl p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Left: Filters */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-2">
                    <div>
                        <label id="shift-filter-label" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('filterByShift')}</label>
                        <CustomSelect
                            aria-labelledby="shift-filter-label"
                            className="mt-1 w-full sm:w-48"
                            options={shiftOptions}
                            value={shiftFilter}
                            onChange={setShiftFilter}
                        />
                    </div>
                    <div className="flex items-center self-start sm:self-end sm:mt-6">
                        <label htmlFor="condensed-view-toggle" className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                           <input
                                type="checkbox"
                                id="condensed-view-toggle"
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-indigo-600"
                                checked={isCondensed}
                                onChange={(e) => setIsCondensed(e.target.checked)}
                            />
                            {t('condensedView')}
                        </label>
                    </div>
                </div>

                {/* Right: Month Navigation */}
                <div className="flex items-center justify-center gap-2 sm:gap-4">
                    <button onClick={goToPreviousMonth} className="rounded-md p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100" aria-label="Previous Month">
                        <Icon icon="arrow-left" className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <span className="w-40 text-center font-semibold text-gray-900 sm:w-48 sm:text-lg dark:text-gray-100" aria-live="polite">{monthDisplayString}</span>
                    <button onClick={goToNextMonth} className="rounded-md p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100" aria-label="Next Month">
                        <Icon icon="arrow-right" className="h-5 w-5" aria-hidden="true" />
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <table className={`min-w-full divide-y divide-gray-200 dark:divide-gray-700 ${isCondensed ? 'text-xs' : ''}`}>
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th scope="col" className={`sticky left-0 z-10 whitespace-nowrap bg-gray-50 px-6 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:bg-gray-800 dark:text-gray-400 ${isCondensed ? 'py-2' : 'py-3'}`}>{t('guard')}</th>
                            {monthDays.map(day => (
                                <th key={day.toISOString()} scope="col" className={`w-20 px-1 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 ${isCondensed ? 'py-2' : 'py-3'}`}>
                                    {day.toLocaleDateString(language, { weekday: 'short' })}
                                    <br />
                                    <span className={`font-normal text-gray-900 dark:text-gray-100 ${isCondensed ? 'text-lg' : 'text-xl'}`}>{day.getDate()}</span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                        {filteredGuards.map(guard => (
                            <tr key={guard.id}>
                                <td className={`sticky left-0 z-10 whitespace-nowrap bg-white px-6 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100 ${isCondensed ? 'py-2 text-sm' : 'py-4'}`}>
                                    {guard.name}
                                </td>
                                {monthDays.map(day => {
                                    const dateString = day.toISOString().split('T')[0];
                                    const shiftId = schedule[dateString]?.[guard.id]?.shiftId ?? guard.defaultShiftId;
                                    return (
                                        <td key={day.toISOString()} className={`whitespace-nowrap px-1 align-middle ${isCondensed ? 'py-0' : 'py-1'}`}>
                                            <div className={`mx-auto flex justify-center ${isCondensed ? 'w-12' : 'w-16'}`}>
                                                <ShiftSelector
                                                    shifts={shifts}
                                                    selectedShiftId={shiftId}
                                                    onShiftChange={(newShiftId) => handleShiftChange(dateString, guard.id, newShiftId)}
                                                    disabled={isViewer}
                                                    isCondensed={isCondensed}
                                                />
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ScheduleManagement;