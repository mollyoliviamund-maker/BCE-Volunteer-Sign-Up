import React, { useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Wizard } from './views/Wizard';
import { AdminDashboard } from './views/AdminDashboard';
import { VolunteerProvider } from './store/VolunteerContext';

const App: React.FC = () => {
  const [isAdminView, setIsAdminView] = useState(false);

  return (
    <VolunteerProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
        <Header />
        
        <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-8 md:py-12">
          {isAdminView ? (
            <AdminDashboard onLogout={() => setIsAdminView(false)} />
          ) : (
            <Wizard />
          )}
        </main>

        <Footer onAdminClick={() => setIsAdminView(true)} />
      </div>
    </VolunteerProvider>
  );
};

export default App;
