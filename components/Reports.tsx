


import React, { useState, useMemo, useRef, useEffect, FC } from 'react';
import { AttendanceStatus, Guard, Shift, FullSchedule, ReportTemplate } from '../types';
import Icon from './Icon';
import { useGuardian } from '../contexts/GuardianContext';
import { iterateDateRange, formatDate } from '../utils/dates';
import { useTranslations } from '../hooks/useTranslations';
import CustomSelect from './CustomSelect';

// --- Type Definitions ---

type AttendanceReportData = {
    guardId: string;
    present: number;
    absent: number;
    totalScheduled: number;
};

type OvertimeReportData = {
    guardId: string;
    shifts: number;
    totalHours: number;
};

type OvertimeDetailReportData = {
    date: string;
    coveringGuardId: string;
    coveredGuardId: string;
    shiftId: string;
};

type ReportData = {
    attendance: AttendanceReportData[];
    overtime: OvertimeReportData[];
    overtimeDetails: OvertimeDetailReportData[];
};


// --- Report Generation Logic ---

type ReportDataContext = {
    schedule: FullSchedule,
    attendance: ReturnType<typeof useGuardian>['attendance'],
    guards: Guard[],
    shifts: Shift[]
}

const generateReportData = (startDate: string, endDate: string, context: ReportDataContext) => {
    const { schedule, attendance, guards } = context;
    const attendanceSummary: Record<string, { present: number; absent: number; totalScheduled: number; }> = {};
    guards.forEach(g => { attendanceSummary[g.id] = { present: 0, absent: 0, totalScheduled: 0 } });

    const overtimeSummaryByGuard: Record<string, { guardId: string; shifts: number; totalHours: number }> = {};
    const overtimeDetails: { date: string, coveringGuardId: string, coveredGuardId: string, shiftId: string }[] = [];

    for (const dateStr of iterateDateRange(startDate, endDate)) {
        const dailySchedule = schedule[dateStr] || {};
        const dailyAttendance = attendance[dateStr] || {};

        guards.forEach(guard => {
            if (dailySchedule[guard.id]?.shiftId !== 'off') {
                attendanceSummary[guard.id].totalScheduled++;
            }
            const record = dailyAttendance[guard.id];
            if (record?.status === AttendanceStatus.Present) attendanceSummary[guard.id].present++;
            if (record?.status === AttendanceStatus.Absent) attendanceSummary[guard.id].absent++;
        });

        Object.values(dailyAttendance).forEach(record => {
            if (record.isOvertime && record.coveredBy) {
                const { coveredBy: coveringGuardId, guardId: coveredGuardId, shiftId } = record;
                if (!overtimeSummaryByGuard[coveringGuardId]) {
                    overtimeSummaryByGuard[coveringGuardId] = { guardId: coveringGuardId, shifts: 0, totalHours: 0 };
                }
                overtimeSummaryByGuard[coveringGuardId].shifts++;
                overtimeDetails.push({ date: dateStr, coveringGuardId, coveredGuardId, shiftId });
            }
        });
    }

    const overtimeSummary = Object.values(overtimeSummaryByGuard).map(s => ({ ...s, totalHours: s.shifts * 8 }));

    return {
        attendance: Object.entries(attendanceSummary).map(([guardId, stats]) => ({ guardId, ...stats })),
        overtime: overtimeSummary,
        overtimeDetails: overtimeDetails.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    };
};

// --- Sub-components for Tables ---

const AttendanceReportTable: FC<{data: AttendanceReportData[], visibleColumns: Set<string>, guardMap: Map<string, Guard>}> = ({ data, visibleColumns, guardMap }) => {
    const { t } = useTranslations();
    return (
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50"><tr>
                {visibleColumns.has('guard') && <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('guard')}</th>}
                {visibleColumns.has('employeeId') && <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('employeeId')}</th>}
                {visibleColumns.has('present') && <th scope="col" className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('present')}</th>}
                {visibleColumns.has('absent') && <th scope="col" className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('absent')}</th>}
                {visibleColumns.has('totalScheduled') && <th scope="col" className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('totalScheduled')}</th>}
                {visibleColumns.has('attendanceRate') && <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('attendanceRate')}</th>}
            </tr></thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {data.map(({ guardId, present, absent, totalScheduled }) => {
                    const attendanceRate = totalScheduled > 0 ? (present / totalScheduled) * 100 : 0;
                    let rateColorClass = 'bg-red-500';
                    if (attendanceRate > 95) rateColorClass = 'bg-green-500';
                    else if (attendanceRate >= 85) rateColorClass = 'bg-yellow-500';
                    const guard = guardMap.get(guardId);
                    return (
                        <tr key={guardId}>
                            {visibleColumns.has('guard') && <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{guard?.name}</td>}
                            {visibleColumns.has('employeeId') && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{guard?.employeeId}</td>}
                            {visibleColumns.has('present') && <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-green-600 dark:text-green-400">{present}</td>}
                            {visibleColumns.has('absent') && <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-red-600 dark:text-red-400">{absent}</td>}
                            {visibleColumns.has('totalScheduled') && <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-400">{totalScheduled}</td>}
                            {visibleColumns.has('attendanceRate') && <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-24 bg-gray-200 rounded-full h-2 dark:bg-gray-700" aria-hidden="true"><div className={`${rateColorClass} h-2 rounded-full`} style={{ width: `${attendanceRate.toFixed(0)}%` }}></div></div>
                                    <span className="font-medium text-sm text-gray-600 w-12 text-right dark:text-gray-300">{attendanceRate.toFixed(1)}%</span>
                                </div>
                            </td>}
                        </tr>
                    )
                })}
            </tbody>
        </table>
    );
};

const OvertimeReportTable: FC<{data: OvertimeReportData[], visibleColumns: Set<string>, guardMap: Map<string, Guard>}> = ({ data, visibleColumns, guardMap }) => {
    const { t } = useTranslations();
    return (
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50"><tr>
                {visibleColumns.has('guard') && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">{t('guard')}</th>}
                {visibleColumns.has('employeeId') && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">{t('employeeId')}</th>}
                {visibleColumns.has('otShifts') && <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase dark:text-gray-400">{t('otShifts')}</th>}
                {visibleColumns.has('otHours') && <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase dark:text-gray-400">{t('otHours')}</th>}
            </tr></thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {data.length > 0 ? data.map(({ guardId, shifts, totalHours }) => {
                    const guard = guardMap.get(guardId);
                    const isOverLimit = totalHours > 60;
                    return (
                        <tr key={guardId} className={isOverLimit ? 'bg-red-100 dark:bg-red-900/20' : ''}>
                            {visibleColumns.has('guard') && <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{guard?.name}</td>}
                            {visibleColumns.has('employeeId') && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{guard?.employeeId}</td>}
                            {visibleColumns.has('otShifts') && <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-400">{shifts}</td>}
                            {visibleColumns.has('otHours') && <td className={`px-6 py-4 whitespace-nowrap text-sm text-center font-semibold ${isOverLimit ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>{totalHours}</td>}
                        </tr>
                    );
                }) : <tr><td colSpan={visibleColumns.size} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">{t('noOvertimeRecords')}</td></tr>}
            </tbody>
        </table>
    );
};

const OvertimeDetailReportTable: FC<{data: OvertimeDetailReportData[], visibleColumns: Set<string>, guardMap: Map<string, Guard>, shiftMap: Map<string, Shift>}> = ({ data, visibleColumns, guardMap, shiftMap }) => {
    const { t } = useTranslations();
    return (
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50"><tr>
                {visibleColumns.has('date') && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">{t('date')}</th>}
                {visibleColumns.has('guard') && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">{t('guard')}</th>}
                {visibleColumns.has('guardId') && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">{t('employeeId')}</th>}
                {visibleColumns.has('coveredFor') && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">{t('coveredFor')}</th>}
                {visibleColumns.has('coveredForId') && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">{t('employeeId')}</th>}
                {visibleColumns.has('shift') && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">{t('shift')}</th>}
            </tr></thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {data.length > 0 ? data.map((detail, index) => {
                    const coveringGuard = guardMap.get(detail.coveringGuardId);
                    const coveredGuard = guardMap.get(detail.coveredGuardId);
                    const shift = shiftMap.get(detail.shiftId);
                    return (
                        <tr key={index}>
                            {visibleColumns.has('date') && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(detail.date)}</td>}
                            {visibleColumns.has('guard') && <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{coveringGuard?.name}</td>}
                            {visibleColumns.has('guardId') && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{coveringGuard?.employeeId}</td>}
                            {visibleColumns.has('coveredFor') && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{coveredGuard?.name}</td>}
                            {visibleColumns.has('coveredForId') && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{coveredGuard?.employeeId}</td>}
                            {visibleColumns.has('shift') && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{shift?.name}</td>}
                        </tr>
                    );
                }) : <tr><td colSpan={visibleColumns.size} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">{t('noOvertimeRecords')}</td></tr>}
            </tbody>
        </table>
    );
};

// --- Main Reports Component ---

const Reports: React.FC = () => {
  const { schedule, attendance, guards, shifts, reportTemplates, addReportTemplate, deleteReportTemplate, currentUser } = useGuardian();
  const { t } = useTranslations();
  
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  
  const [reportType, setReportType] = useState<'attendance' | 'overtime' | 'overtime_detailed'>('attendance');
  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  const [templateName, setTemplateName] = useState('');
  const [templateError, setTemplateError] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);

  const isViewer = currentUser?.role === 'viewer';

  const guardMap = useMemo(() => new Map(guards.map(g => [g.id, g])), [guards]);
  const shiftMap = useMemo(() => new Map(shifts.map(s => [s.id, s])), [shifts]);

  const allReportColumns = useMemo(() => ({
    attendance: [ { id: 'guard', label: t('guard') }, { id: 'employeeId', label: t('employeeId') }, { id: 'present', label: t('present') }, { id: 'absent', label: t('absent') }, { id: 'totalScheduled', label: t('totalScheduled') }, { id: 'attendanceRate', label: t('attendanceRate') } ],
    overtime: [ { id: 'guard', label: t('guard') }, { id: 'employeeId', label: t('employeeId') }, { id: 'otShifts', label: t('otShifts') }, { id: 'otHours', label: t('otHours') } ],
    overtime_detailed: [ { id: 'date', label: t('date') }, { id: 'guard', label: t('guard') }, { id: 'guardId', label: `${t('guard')} - ${t('employeeId')}` }, { id: 'coveredFor', label: t('coveredFor') }, { id: 'coveredForId', label: `${t('coveredFor')} - ${t('employeeId')}` }, { id: 'shift', label: t('shift') } ],
  }), [t]);
    
  const [visibleColumns, setVisibleColumns] = useState(new Set(allReportColumns[reportType].map(c => c.id)));
  const [isFilterOpen, setFilterOpen] = useState(false);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentReportCols = allReportColumns[reportType] || [];
    setVisibleColumns(new Set(currentReportCols.map(c => c.id)));
  }, [reportType, allReportColumns]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node) && filterButtonRef.current && !filterButtonRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
    };
    if (isFilterOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFilterOpen]);

  const handleToggleColumn = (columnId: string) => {
    setVisibleColumns(prev => {
        const newSet = new Set(prev);
        if (newSet.has(columnId)) { if (newSet.size > 1) newSet.delete(columnId); } 
        else { newSet.add(columnId); }
        return newSet;
    });
  };

  const handleGenerateReport = () => {
    const data = generateReportData(startDate, endDate, { schedule, attendance, guards, shifts });
    setReportData(data);
  };
  
  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewer) return;
    setTemplateError('');

    if (!templateName.trim()) {
        setTemplateError(t('templateNameRequired'));
        return;
    }
    if (reportTemplates.some(t => t.name.toLowerCase() === templateName.trim().toLowerCase())) {
        setTemplateError(t('templateNameExists'));
        return;
    }

    addReportTemplate({
        name: templateName.trim(),
        type: reportType,
        columns: Array.from(visibleColumns),
    });
    setTemplateName('');
    setShowSaveForm(false);
  }

  const handleLoadTemplate = (template: ReportTemplate) => {
    setReportType(template.type);
    setVisibleColumns(new Set(template.columns));
  };
  
  const exportToCSV = () => {
    if (!reportData) return;
    let rows: string[][] = [];
    const visibleCols = (allReportColumns[reportType] || []).filter(c => visibleColumns.has(c.id));
    rows.push(visibleCols.map(c => c.label));
    
    switch (reportType) {
        case 'attendance':
            reportData.attendance.forEach(({ guardId, present, absent, totalScheduled }) => {
                const guard = guardMap.get(guardId);
                if (!guard) return;
                const rate = totalScheduled > 0 ? `${((present / totalScheduled) * 100).toFixed(1)}%` : '0.0%';
                const dataRow: Record<string, string | number> = { guard: guard.name, employeeId: guard.employeeId, present, absent, totalScheduled, attendanceRate: rate };
                rows.push(visibleCols.map(c => String(dataRow[c.id] ?? '')));
            });
            break;
        case 'overtime':
            reportData.overtime.forEach(({ guardId, shifts, totalHours }) => {
                const guard = guardMap.get(guardId);
                if (!guard) return;
                const dataRow: Record<string, string | number> = { guard: guard.name, employeeId: guard.employeeId, otShifts: shifts, otHours: totalHours };
                rows.push(visibleCols.map(c => String(dataRow[c.id] ?? '')));
            });
            break;
        case 'overtime_detailed':
            reportData.overtimeDetails.forEach(detail => {
                const coveringGuard = guardMap.get(detail.coveringGuardId);
                const coveredGuard = guardMap.get(detail.coveredGuardId);
                const shift = shiftMap.get(detail.shiftId);
                if (!coveringGuard || !coveredGuard || !shift) return;
                const dataRow: Record<string, string | number> = { date: formatDate(detail.date), guard: coveringGuard.name, guardId: coveringGuard.employeeId, coveredFor: coveredGuard.name, coveredForId: coveredGuard.employeeId, shift: shift.name };
                rows.push(visibleCols.map(c => String(dataRow[c.id] ?? '')));
            });
            break;
    }

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `${reportType}_report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reportOptions = useMemo(() => [
    { value: 'attendance', label: t('attendanceSummary') },
    { value: 'overtime', label: t('overtimeReport') },
    { value: 'overtime_detailed', label: t('overtimeBreakdown') }
  ], [t]);
  
  const getReportTitle = () => reportOptions.find(opt => opt.value === reportType)?.label || '';
  const currentReportCols = allReportColumns[reportType] || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">{t('savedTemplates')}</h3>
                {reportTemplates.length > 0 ? (
                    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {reportTemplates.map(template => (
                            <li key={template.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 dark:bg-gray-700/50 dark:border-gray-600">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{template.name}</span>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleLoadTemplate(template)} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">{t('load')}</button>
                                    <button onClick={() => deleteReportTemplate(template.id)} className="text-gray-400 hover:text-red-600 dark:hover:text-red-500" aria-label={t('deleteTemplate', { name: template.name })}>
                                        <Icon icon="trash" className="h-4 w-4" aria-hidden="true" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('noTemplatesFound')}</p>
                )}
            </div>
            
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('generateReport')}</h3>
                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <label id="report-type-label" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('reportType')}</label>
                        <div className="mt-1">
                            <CustomSelect aria-labelledby="report-type-label" options={reportOptions} selectedValue={reportType} onChange={(v) => setReportType(v as 'attendance' | 'overtime' | 'overtime_detailed')} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="start-date">{t('startDate')}</label>
                        <input value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400" id="start-date" type="date" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="end-date">{t('endDate')}</label>
                        <input value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400" id="end-date" type="date" />
                    </div>
                    <div className="flex items-end">
                        <button onClick={handleGenerateReport} className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-600" type="button">
                            {t('generate')}
                        </button>
                    </div>
                </div>
            </div>

            {showSaveForm && (
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                    <form onSubmit={handleSaveTemplate}>
                        <label htmlFor="template-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('templateName')}</label>
                        <div className="mt-1 flex gap-2">
                           <input
                                type="text"
                                id="template-name"
                                value={templateName}
                                onChange={(e) => setTemplateName(e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                                required
                            />
                            <button type="submit" className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600">{t('save')}</button>
                            <button type="button" onClick={() => setShowSaveForm(false)} className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500">{t('cancel')}</button>
                        </div>
                        {templateError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{templateError}</p>}
                    </form>
                </div>
            )}
            
            {reportData && (
                <div className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{getReportTitle()}</h3>
                        <div className="flex flex-wrap items-center gap-2">
                             <div className="relative">
                                <button ref={filterButtonRef} onClick={() => setFilterOpen(o => !o)} className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-gray-700 dark:border-gray-500 dark:text-gray-200 dark:hover:bg-gray-600" type="button" aria-haspopup="true" aria-expanded={isFilterOpen}>
                                    <Icon icon="filter" className="h-4 w-4" aria-hidden="true" />{t('filterColumns')}
                                </button>
                                {isFilterOpen && (
                                    <div ref={filterMenuRef} className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700 dark:ring-white/10">
                                        <div className="py-1" role="group" aria-labelledby="filter-button">
                                            {currentReportCols.map(col => (
                                                <label key={col.id} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer dark:text-gray-200 dark:hover:bg-gray-600">
                                                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-500 dark:focus:ring-indigo-600" checked={visibleColumns.has(col.id)} onChange={() => handleToggleColumn(col.id)} disabled={visibleColumns.has(col.id) && visibleColumns.size === 1}/>
                                                    <span>{col.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button onClick={exportToCSV} className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-gray-700 dark:border-gray-500 dark:text-gray-200 dark:hover:bg-gray-600" type="button">
                                <Icon icon="file" className="h-4 w-4" aria-hidden="true" />{t('exportAsCsv')}
                            </button>
                              <button onClick={() => { setShowSaveForm(true); setTemplateError(''); }} className="inline-flex items-center gap-2 rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-600" type="button">
                                  <Icon icon="plus" className="h-4 w-4" aria-hidden="true" />{t('saveTemplate')}
                              </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        {reportType === 'attendance' && <AttendanceReportTable data={reportData.attendance} visibleColumns={visibleColumns} guardMap={guardMap} />}
                        {reportType === 'overtime' && <OvertimeReportTable data={reportData.overtime} visibleColumns={visibleColumns} guardMap={guardMap} />}
                        {reportType === 'overtime_detailed' && <OvertimeDetailReportTable data={reportData.overtimeDetails} visibleColumns={visibleColumns} guardMap={guardMap} shiftMap={shiftMap} />}
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default Reports;