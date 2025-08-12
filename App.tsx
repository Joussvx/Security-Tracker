


import React, { useState } from 'react';
import { View } from './types';
import { GuardianProvider, useGuardian } from './contexts/GuardianContext';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import GuardManagement from './components/GuardManagement';
import Reports from './components/Reports';
import ScheduleManagement from './components/ScheduleManagement';
import BottomNavBar from './components/BottomNavBar';
import Settings from './components/Profile';
import Login from './components/Login';

const MainApp: React.FC = () => {
  const { currentUser } = useGuardian();
  const [currentView, setCurrentView] = useState<View>('Dashboard');

  if (!currentUser) {
    return <Login />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Schedule':
        return <ScheduleManagement />;
      case 'Guards':
        return <GuardManagement />;
      case 'Reports':
        return <Reports />;
      case 'Settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-200">
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      <main className="flex-grow pb-20 md:pb-0">
        {renderView()}
      </main>
      <BottomNavBar currentView={currentView} setCurrentView={setCurrentView} />
    </div>
  );
};


const App: React.FC = () => {
  return (
    <GuardianProvider>
      <MainApp />
    </GuardianProvider>
  );
};

export default App;