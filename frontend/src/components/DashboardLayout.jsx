import { useState } from 'react';
import Sidebar from './Sidebar';
import { FiMenu } from 'react-icons/fi';

// Dashboard layout wrapper with sidebar + main content area
export default function DashboardLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="dashboard-container min-h-screen bg-slate-50">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-slate-900 text-white shadow-md z-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-extrabold text-sm tracking-tight">AetherMind AI</span>
          </div>
          <button 
            onClick={() => setMobileOpen(!mobileOpen)} 
            className="p-2 text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
          >
            <FiMenu className="w-6 h-6" />
          </button>
        </header>

        <main className="dashboard-main flex-1 p-4 sm:p-6 md:p-8">
          <div className="dashboard-content-wrapper animate-fade-in-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
