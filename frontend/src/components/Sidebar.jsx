import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome, FiClipboard, FiActivity, FiImage, FiFileText,
  FiTarget, FiLogOut, FiSearch, FiUsers, FiBarChart2, FiHeart
} from 'react-icons/fi';

// Sidebar navigation for Patient and Doctor dashboards
export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user, logout, isDoctor } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Patient sidebar links
  const patientLinks = [
    { to: '/patient/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { to: '/patient/assessment', icon: <FiClipboard />, label: 'Start Assessment' },
    { to: '/patient/clinical', icon: <FiActivity />, label: 'Clinical Prediction' },
    { to: '/patient/mri', icon: <FiImage />, label: 'MRI Upload' },
    { to: '/patient/report', icon: <FiFileText />, label: 'Final Report' },
    { to: '/patient/exercise', icon: <FiTarget />, label: 'Brain Exercise' },
  ];

  // Doctor sidebar links
  const doctorLinks = [
    { to: '/doctor/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { to: '/doctor/search', icon: <FiSearch />, label: 'Search Patient' },
    { to: '/doctor/patients', icon: <FiUsers />, label: 'All Patients' },
  ];

  const links = isDoctor ? doctorLinks : patientLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`sidebar dashboard-sidebar-aside transition-transform duration-300 z-40 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Logo & Mobile Close */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <FiHeart className="text-xl text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">AetherMind AI</h1>
              <p className="text-blue-200 text-xs">Alzheimer's Detection</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <span className="text-lg">{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-9 h-9 rounded-full bg-blue-400/30 flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name || 'User'}</p>
              <p className="text-blue-200 text-xs capitalize">{user?.role || 'patient'}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="sidebar-link w-full text-red-300 hover:text-red-200 hover:bg-red-500/10">
            <FiLogOut className="text-lg" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
