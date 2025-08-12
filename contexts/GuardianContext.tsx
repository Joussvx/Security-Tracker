


import React, { useState, useMemo, FC } from 'react';
import { Guard, Shift } from '../types';
import Icon from './Icon';
import { useGuardian } from '../contexts/GuardianContext';
import { useTranslations } from '../hooks/useTranslations';
import CustomSelect, { SelectOption } from './CustomSelect';
import ConfirmDialog from './ConfirmDialog';

interface GuardRowProps {
    guard: Guard;
    isEditing: boolean;
    editedGuardData: Partial<Omit<Guard, 'id'>>;
    onEditClick: (guard: Guard) => void;
    onCancelClick: () => void;
    onSaveClick: () => void;
    onDeleteClick: (guard: Guard) => void;
    onEditInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onShiftChange: (value: string) => void;
    shiftOptions: SelectOption[];
    isViewer: boolean;
}

const GuardRow: FC<GuardRowProps> = React.memo(({
    guard, isEditing, editedGuardData, onEditClick, onCancelClick, onSaveClick,
    onDeleteClick, onEditInputChange, onShiftChange, shiftOptions, isViewer
}) => {
    const { t } = useTranslations();
    const { shifts } = useGuardian();

    if (isEditing && !isViewer) {
        return (
            <tr>
                <td className="whitespace-nowrap px-4 py-2 sm:pl-6">
                    <input type="text" name="name" value={editedGuardData.name || ''} onChange={onEditInputChange} className="block w-full rounded-md border-gray-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
                </td>
                <td className="whitespace-nowrap px-3 py-2">
                    <input type="text" name="employeeId" value={editedGuardData.employeeId || ''} onChange={onEditInputChange} className="block w-full rounded-md border-gray-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
                </td>
                <td className="whitespace-nowrap px-3 py-2">
                    <CustomSelect
                        options={shiftOptions}
                        value={editedGuardData.defaultShiftId || ''}
                        onChange={onShiftChange}
                    />
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <button onClick={onSaveClick} className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">{t('save')}</button>
                    <button onClick={onCancelClick} className="ml-4 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">{t('cancel')}</button>
                </td>
            </tr>
        );
    }
    
    return (
        <tr>
            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 dark:text-gray-100">{guard.name}</td>
            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{guard.employeeId}</td>
            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{shifts.find(s => s.id === guard.defaultShiftId)?.name || 'N/A'}</td>
            {!isViewer && (
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <button onClick={() => onEditClick(guard)} className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300" aria-label={t('editGuard', { name: guard.name })}>{t('edit')}</button>
                    <button onClick={() => onDeleteClick(guard)} className="ml-4 text-red-600 hover:text-red-900 dark:text-red-500 dark:hover:text-red-400" aria-label={t('deleteGuard', { name: guard.name })}>{t('delete')}</button>
                </td>
            )}
        </tr>
    );
});

const GuardManagement: React.FC = () => {
  const { guards, shifts, addGuard, updateGuard, deleteGuard, currentUser } = useGuardian();
  const { t } = useTranslations();
  const [newGuard, setNewGuard] = useState({ name: '', employeeId: '', defaultShiftId: 'off' });
  const [isAdding, setIsAdding] = useState(false);
  const [editingGuardId, setEditingGuardId] = useState<string | null>(null);
  const [editedGuardData, setEditedGuardData] = useState<Partial<Omit<Guard, 'id'>>>({});

  const isViewer = currentUser?.role === 'viewer';
  const [confirmState, setConfirmState] = useState<{ open: boolean; guard: Guard | null }>({ open: false, guard: null });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewGuard(prev => ({ ...prev, [name]: value }));
  };

  const handleAddGuard = (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewer) return;
    if (newGuard.name && newGuard.employeeId) {
      addGuard(newGuard);
      setNewGuard({ name: '', employeeId: '', defaultShiftId: 'off' });
      setIsAdding(false);
    }
  };

  const handleEditClick = (guard: Guard) => {
    if (isViewer) return;
    setEditingGuardId(guard.id);
    setEditedGuardData({ name: guard.name, employeeId: guard.employeeId, defaultShiftId: guard.defaultShiftId });
  };

  const handleCancelClick = () => {
    setEditingGuardId(null);
    setEditedGuardData({});
  };
  
  const handleSaveClick = () => {
    if (isViewer || !editingGuardId) return;
    const guardToUpdate = guards.find(g => g.id === editingGuardId);
    if(guardToUpdate) {
        updateGuard({ ...guardToUpdate, ...editedGuardData } as Guard);
    }
    setEditingGuardId(null);
    setEditedGuardData({});
  };
  
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedGuardData(prev => ({ ...prev, [name]: value }));
  };

  const handleDeleteClick = (guard: Guard) => {
    if (isViewer) return;
    setConfirmState({ open: true, guard });
  };

  const confirmDelete = () => {
    if (confirmState.guard) {
      deleteGuard(confirmState.guard.id);
    }
    setConfirmState({ open: false, guard: null });
  };

  const cancelDelete = () => setConfirmState({ open: false, guard: null });

  const shiftOptions = useMemo(() => shifts.map(s => ({ value: s.id, label: s.name })), [shifts]);

  return (
    <div className="flex flex-1 justify-center py-10 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl">
        <ConfirmDialog
          open={confirmState.open}
          title={t('confirmDeletion')}
          message={confirmState.guard ? t('deleteGuardConfirmation', { name: confirmState.guard.name }) : ''}
          confirmLabel={t('yes')}
          cancelLabel={t('no')}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
            {!isViewer && (
              <div className="mb-6 flex justify-end">
                  <button
                      onClick={() => setIsAdding(!isAdding)}
                      className="flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                      aria-expanded={isAdding}
                  >
                      <Icon icon="plus" className="h-4 w-4" aria-hidden="true" />
                      <span>{isAdding ? t('cancel') : t('addNewGuard')}</span>
                  </button>
              </div>
            )}

            {isAdding && !isViewer && (
                <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                    <form onSubmit={handleAddGuard} className="space-y-4">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">{t('newGuardDetails')}</h3>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('fullName')}</label>
                                <input type="text" name="name" id="name" value={newGuard.name} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400" />
                            </div>
                            <div>
                                <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('employeeId')}</label>
                                <input type="text" name="employeeId" id="employeeId" value={newGuard.employeeId} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400" />
                            </div>
                            <div>
                                <label id="default-shift-label" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('defaultShift')}</label>
                                <div className="mt-1">
                                    <CustomSelect
                                        aria-labelledby="default-shift-label"
                                        options={shiftOptions}
                                        value={newGuard.defaultShiftId}
                                        onChange={(value) => setNewGuard(prev => ({ ...prev, defaultShiftId: value }))}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:bg-green-500 dark:hover:bg-green-600">
                                {t('saveGuard')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 dark:text-gray-100">{t('guardName')}</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">{t('employeeId')}</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">{t('defaultShift')}</th>
                                {!isViewer && <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">{t('actions')}</span></th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                            {guards.map(guard => (
                                <GuardRow
                                    key={guard.id}
                                    guard={guard}
                                    isEditing={editingGuardId === guard.id}
                                    editedGuardData={editedGuardData}
                                    onEditClick={handleEditClick}
                                    onCancelClick={handleCancelClick}
                                    onSaveClick={handleSaveClick}
                                    onDeleteClick={handleDeleteClick}
                                    onEditInputChange={handleEditInputChange}
                                    onShiftChange={(value) => setEditedGuardData(prev => ({ ...prev, defaultShiftId: value }))}
                                    shiftOptions={shiftOptions}
                                    isViewer={isViewer}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
  );
};

export default GuardManagement;
