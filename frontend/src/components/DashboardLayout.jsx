import Sidebar from './Sidebar';

// Dashboard layout wrapper with sidebar + main content area
export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="dashboard-main">
        <div className="dashboard-content-wrapper animate-fade-in-up">
          {children}
        </div>
      </main>
    </div>
  );
}
