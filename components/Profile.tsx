
import React, { useState } from 'react';
import { useGuardian } from '../contexts/GuardianContext';
import { Language, User, Theme } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import Icon from './Icon';
import CustomSelect from './CustomSelect';
import ConfirmDialog from './ConfirmDialog';

const languageOptions: { value: Language; label: string }[] = [
    { value: 'en', label: 'English' },
    { value: 'lo', label: 'ລາວ (Lao)' },
    { value: 'th', label: 'ไทย (Thai)' },
    { value: 'ru', label: 'Русский (Russian)' },
    { value: 'zh', label: '中文 (Chinese)' },
    { value: 'ja', label: '日本語 (Japanese)' },
];

const Settings: React.FC = () => {
    const { language, setLanguage, theme, setTheme, currentUser, users, addUser, deleteUser, logout } = useGuardian();
    const { t } = useTranslations();

    const [lastCreatedUser, setLastCreatedUser] = useState<User | null>(null);
    const [copySuccess, setCopySuccess] = useState('');
    const [confirmState, setConfirmState] = useState<{ open: boolean; user: User | null }>({ open: false, user: null });

    const isViewer = currentUser?.role === 'viewer';
    const viewerUsers = users.filter(u => u.role === 'viewer');

    const handleGenerateUser = () => {
        const nextViewerNumber = viewerUsers.length + 1;
        const newUsername = `viewer${nextViewerNumber}`;
        const newUser = addUser(newUsername);
        if (newUser) {
            setLastCreatedUser(newUser);
            setCopySuccess('');
        }
    };

    const handleDeleteUser = (user: User) => {
        setConfirmState({ open: true, user });
    };

    const confirmDeleteUser = () => {
        if (confirmState.user) {
            deleteUser(confirmState.user.id);
        }
        setConfirmState({ open: false, user: null });
    };

    const cancelDeleteUser = () => setConfirmState({ open: false, user: null });
    
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopySuccess(t('copied'));
            setTimeout(() => setCopySuccess(''), 2000);
        }, (err) => {
            console.error('Could not copy text: ', err);
        });
    };
    
    return (
        <div className="flex flex-1 justify-center bg-gray-50 p-4 sm:p-6 lg:p-8 dark:bg-gray-900">
            <div className="w-full max-w-2xl space-y-8">
                <ConfirmDialog
                    open={confirmState.open}
                    title={t('confirmDeletion')}
                    message={confirmState.user ? t('deleteUserConfirmation', { username: confirmState.user.username }) : ''}
                    confirmLabel={t('yes')}
                    cancelLabel={t('no')}
                    onConfirm={confirmDeleteUser}
                    onCancel={cancelDeleteUser}
                />
                {/* --- Settings Card --- */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                    <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-gray-100">{t('settings')}</h2>
                    <div className="space-y-6">
                        <div>
                            <label id="language-select-label" className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-300">
                                {t('language')}
                            </label>
                             <CustomSelect
                                aria-labelledby="language-select-label"
                                options={languageOptions}
                                value={language}
                                onChange={(value) => setLanguage(value as Language)}
                            />
                        </div>

                        <div>
                           <label className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-300" id="theme-label">
                               {t('theme')}
                           </label>
                           <div className="relative mt-2 flex w-full rounded-lg bg-gray-100 p-1 dark:bg-gray-700/50" role="group" aria-labelledby="theme-label">
                                <span
                                    className="absolute top-1 left-1 bottom-1 w-[calc(50%-0.25rem)] rounded-md bg-white shadow-sm transition-transform duration-300 ease-in-out dark:bg-gray-700"
                                    style={{ transform: theme === 'dark' ? 'translateX(100%)' : 'translateX(0)' }}
                                    aria-hidden="true"
                                />
                                <button
                                    onClick={() => setTheme('light')}
                                    className={`relative z-10 flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:focus-visible:ring-offset-gray-800 ${
                                        theme === 'light' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                    }`}
                                    aria-pressed={theme === 'light'}
                                >
                                    <Icon icon="sun" className="h-5 w-5" />
                                    {t('light')}
                                </button>
                                <button
                                    onClick={() => setTheme('dark')}
                                    className={`relative z-10 flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:focus-visible:ring-offset-gray-800 ${
                                        theme === 'dark' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                    }`}
                                    aria-pressed={theme === 'dark'}
                                >
                                    <Icon icon="moon" className="h-5 w-5" />
                                    {t('dark')}
                                </button>
                            </div>
                       </div>
                    </div>
                </div>

                {/* --- User Management Card --- */}
                {!isViewer && (
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('userManagement')}</h2>
                            <button
                                onClick={handleGenerateUser}
                                className="flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                            >
                                <Icon icon="plus" className="h-4 w-4" aria-hidden="true" />
                                <span>{t('generateViewerAccount')}</span>
                            </button>
                        </div>

                        {/* --- Newly Generated User Credentials Box --- */}
                        {lastCreatedUser && (
                            <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:bg-blue-900/20 dark:border-blue-500/30">
                                <h3 className="text-md font-semibold text-blue-800 dark:text-blue-300">{t('viewerAccountCredentials')}</h3>
                                <div className="mt-2 space-y-2 text-sm text-blue-700 dark:text-blue-400">
                                    <p><strong className="font-medium text-blue-900 dark:text-blue-200">{t('username')}:</strong> {lastCreatedUser.username}</p>
                                    <p><strong className="font-medium text-blue-900 dark:text-blue-200">{t('password')}:</strong> {lastCreatedUser.password}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => copyToClipboard(`Username: ${lastCreatedUser.username}, Password: ${lastCreatedUser.password}`)}
                                        className="mt-4 inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-blue-50 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-offset-gray-800"
                                    >
                                        <Icon icon="copy" className="h-4 w-4" aria-hidden="true"/>
                                        <span>{copySuccess ? t('copied') : t('copy')}</span>
                                    </button>
                                    <span className="mt-4 text-xs text-green-700 dark:text-green-400" aria-live="polite">{copySuccess && t('copied')}</span>
                                </div>
                            </div>
                        )}
                        
                        {/* --- User List --- */}
                        <div className="flow-root">
                            <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                                {viewerUsers.map((user) => (
                                <li key={user.id} className="flex items-center justify-between py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300" aria-hidden="true">
                                            <Icon icon="user" className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.username}</p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">{t('password')}: ********</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteUser(user)}
                                        className="rounded-md p-2 text-red-500 transition-colors hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/20 dark:text-red-500 dark:hover:text-red-400"
                                        aria-label={t('deleteUser', { username: user.username })}
                                    >
                                        <Icon icon="trash" className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* --- Logout Button --- */}
                <div>
                    <button
                        onClick={logout}
                        className="flex w-full items-center justify-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-red-600 shadow-sm transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-gray-800 dark:border-gray-600 dark:text-red-500 dark:hover:bg-red-900/20"
                    >
                         <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                         </svg>
                        <span>{t('logout')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;