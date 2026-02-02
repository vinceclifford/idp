import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Components
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import TeamManagement from './components/TeamManagement';
import TrainingManager from './components/TrainingManager';
import ExercisesLibrary from './components/ExercisesLibrary';
import BasicsLibrary from './components/BasicsLibrary';
import PrinciplesLibrary from './components/PrinciplesLibrary';
import TacticsLibrary from './components/TacticsLibrary';
import MatchLineup from './components/MatchLineup';
import Navigation from './components/Navigation';

export type Page = 'login' | 'dashboard' | 'team' | 'session-planner' | 'training' | 'basics' | 'principles' | 'tactics' | 'match';

export default function App() {
  // 1. Initialize Auth State from LocalStorage
  // If 'isAuthenticated' exists in browser memory, start as true.
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  // 2. Initialize Page State
  // If logged in, start at 'dashboard', otherwise 'login'
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    return localStorage.getItem('isAuthenticated') === 'true' ? 'dashboard' : 'login';
  });

  // Force Dark Mode 
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleLogin = () => {
    // Save to browser memory
    localStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    // Clear from browser memory
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user'); // Clean up user data if any
    setIsAuthenticated(false);
    setCurrentPage('login');
  };

  const navigateToPage = (page: Page) => {
    setCurrentPage(page);
  };

  // If not authenticated, show Login Page
  if (!isAuthenticated) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <Toaster position="top-right" theme="dark" />
      </>
    );
  }

  // If authenticated, show the Main App
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-[#0b0f19] text-slate-200 selection:bg-blue-500/30">
        <Navigation 
          currentPage={currentPage} 
          onNavigate={navigateToPage}
          onLogout={handleLogout}
        />
        
        <main className="max-w-[1600px] mx-auto">
          {currentPage === 'dashboard' && <Dashboard onNavigate={navigateToPage} />}
          {currentPage === 'team' && <TeamManagement />}
          {currentPage === 'training' && <ExercisesLibrary />}
          {currentPage === 'session-planner' && <TrainingManager />}
          {currentPage === 'basics' && <BasicsLibrary />}
          {currentPage === 'principles' && <PrinciplesLibrary />}
          {currentPage === 'tactics' && <TacticsLibrary />}
          {currentPage === 'match' && <MatchLineup />}
        </main>
        
        <Toaster position="top-right" theme="dark" />
      </div>
    </DndProvider>
  );
}