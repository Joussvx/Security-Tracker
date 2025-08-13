


import React from 'react';
import { View } from '../types';
import Icon from './Icon';
import { useTranslations } from '../hooks/useTranslations';

interface BottomNavBarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

interface NavItem {
  view: View;
  labelKey: 'dashboard' | 'schedule' | 'guards' | 'reports' | 'settings';
  icon: 'dashboard' | 'calendar' | 'users' | 'report' | 'cog';
}

const navItems: NavItem[] = [
  { view: 'Dashboard', labelKey: 'dashboard', icon: 'dashboard' },
  { view: 'Schedule', labelKey: 'schedule', icon: 'calendar' },
  { view: 'Guards', labelKey: 'guards', icon: 'users' },
  { view: 'Reports', labelKey: 'reports', icon: 'report' },
  { view: 'Settings', labelKey: 'settings', icon: 'cog' },
];

const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentView, setCurrentView }) => {
  const { t } = useTranslations();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex justify-around border-t border-gray-200 bg-white p-2 md:hidden dark:bg-gray-800 dark:border-gray-700 transition-colors duration-200">
      {navItems.map(item => (
        <button
          key={item.view}
          onClick={() => setCurrentView(item.view)}
          className={`flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-1 text-xs transition-colors w-20 ${
            currentView === item.view
              ? 'font-bold text-indigo-600 dark:text-indigo-400'
              : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
          }`}
          aria-current={currentView === item.view ? 'page' : undefined}
        >
          <Icon icon={item.icon} className="h-5 w-5" />
          <span>{t(item.labelKey)}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNavBar;