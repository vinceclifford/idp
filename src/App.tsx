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
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Force Dark Mode 
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('login');
  };

  const navigateToPage = (page: Page) => {
    setCurrentPage(page);
  };

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <Toaster position="top-right" theme="dark" />
      </>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      {/* Updated Background to match the new Glassmorphism Theme */}
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