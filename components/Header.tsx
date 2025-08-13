

import React, { useState, useRef, useEffect } from 'react';
import { View } from '../types';
import Icon from './Icon';
import { useGuardian } from '../contexts/GuardianContext';
import { useTranslations } from '../hooks/useTranslations';

interface HeaderProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
  const { t } = useTranslations();
  const { currentUser, logout } = useGuardian();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        const button = menuRef.current.previousElementSibling;
        if (button && !button.contains(event.target as Node)) {
          setMenuOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  interface NavItem {
    view: View;
    key: string;
  }

  const navItems: NavItem[] = [
    { view: 'Dashboard', key: 'dashboard' },
    { view: 'Schedule', key: 'schedulePlanner' },
    { view: 'Guards', key: 'guards' },
    { view: 'Reports', key: 'reports' },
  ];

  return (
    <header className="sticky top-0 z-20 hidden h-16 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6 md:flex dark:bg-gray-800 dark:border-gray-700 transition-colors duration-200">
      {/* Left Section */}
      <div className="flex-1">
        <div className="flex items-center gap-4">
            <Icon icon="logo" className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Security Tracker</h1>
        </div>
      </div>

      {/* Center Section */}
      <div className="flex-1 text-center">
         <nav className="flex items-center justify-center gap-6">
            {navItems.map(item => (
            <a
                key={item.view}
                href="#"
                onClick={(e) => { e.preventDefault(); setCurrentView(item.view); }}
                className={`text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors px-1 py-2 dark:text-gray-400 dark:hover:text-indigo-400 ${
                currentView === item.view ? 'font-semibold text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : ''
                }`}
            >
                {t(item.key)}
            </a>
            ))}
        </nav>
      </div>

      {/* Right Section */}
      <div className="flex flex-1 justify-end">
        <div className="flex items-center gap-4">
            <div className="relative">
            <button
                onClick={() => setMenuOpen(o => !o)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 ring-2 ring-gray-200 ring-offset-2 ring-offset-white dark:bg-indigo-500 dark:ring-gray-600 dark:ring-offset-gray-800"
                aria-label={t('userMenu')}
                aria-haspopup="true"
                aria-expanded={isMenuOpen}
            >
              <span className="text-xl font-semibold text-white">
                {currentUser?.username?.charAt(0).toUpperCase() || 'A'}
              </span>
            </button>
            {isMenuOpen && (
                <div ref={menuRef} className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700 dark:ring-white/10" role="menu" aria-orientation="vertical" tabIndex={-1}>
                <div className="py-1" role="none">
                    <button
                        onClick={() => {
                            setCurrentView('Settings');
                            setMenuOpen(false);
                        }}
                        className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                        role="menuitem"
                        tabIndex={-1}
                    >
                        <Icon icon="cog" className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                        <span>{t('settings')}</span>
                    </button>
                     <button
                        onClick={() => {
                            logout();
                            setMenuOpen(false);
                        }}
                        className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-600"
                        role="menuitem"
                        tabIndex={-1}
                    >
                         <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                         </svg>
                        <span>{t('logout')}</span>
                    </button>
                </div>
                </div>
            )}
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;