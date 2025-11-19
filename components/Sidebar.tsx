import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Beef, 
  Stethoscope, 
  DollarSign, 
  Sprout, 
  Settings,
  LogOut,
  Activity
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { logout, user, hasPermission } = useAuth();
  const navigate = useNavigate();

  // A lógica de active funciona automaticamente com HashRouter
  // pois location.pathname retorna o caminho após o hash # (ex: /animals)
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  interface NavItem {
    icon: React.ElementType;
    label: string;
    path: string;
    allowedRoles: UserRole[];
  }

  const navItems: NavItem[] = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      path: '/', 
      allowedRoles: ['owner', 'manager', 'collaborator'] 
    },
    { 
      icon: Beef, 
      label: 'Rebanho', 
      path: '/animals', 
      allowedRoles: ['owner', 'manager', 'collaborator'] 
    },
    { 
      icon: Stethoscope, 
      label: 'Sanidade', 
      path: '/health', 
      allowedRoles: ['owner', 'manager', 'collaborator'] 
    },
    { 
      icon: Sprout, 
      label: 'Manejo & Pasto', 
      path: '/pasture', 
      allowedRoles: ['owner', 'manager', 'collaborator'] 
    },
    { 
      icon: Activity, 
      label: 'Reprodução', 
      path: '/reproduction', 
      allowedRoles: ['owner', 'manager'] 
    },
    { 
      icon: DollarSign, 
      label: 'Financeiro', 
      path: '/finance', 
      allowedRoles: ['owner', 'manager'] 
    },
  ];

  const visibleItems = navItems.filter(item => hasPermission(item.allowedRoles));

  return (
    <div className="h-screen w-64 bg-slate-950 border-r border-slate-800 flex flex-col fixed left-0 top-0 z-20 hidden md:flex shadow-2xl shadow-black">
      {/* Logo Section - Modernized & Dark */}
      <div className="h-32 flex items-center justify-center px-6 py-6 border-b border-slate-800/50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 relative overflow-hidden">
        {/* Ambient Glow Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 w-full group">
            <div className="bg-slate-900/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-800 group-hover:border-emerald-500/30 shadow-lg shadow-black/20 transition-all duration-500 flex justify-center items-center">
              <img 
                src="https://i.postimg.cc/httGw5Qt/LOGO_BOVMONITOR_oficial.png" 
                alt="BovMonitor" 
                className="max-h-12 w-auto object-contain drop-shadow-[0_0_8px_rgba(16,185,129,0.3)] filter brightness-110 contrast-125"
              />
            </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto custom-scrollbar">
        <div className="px-4 mb-2 text-xs font-bold text-slate-600 uppercase tracking-wider">Menu</div>
        {visibleItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-medium group relative overflow-hidden ${
              isActive(item.path)
                ? 'bg-gradient-to-r from-emerald-900/20 to-transparent text-white border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'
            }`}
          >
            <item.icon className={`w-5 h-5 transition-all duration-300 relative z-10 ${
              isActive(item.path) 
                ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)] scale-110' 
                : 'text-slate-500 group-hover:text-emerald-400/70'
            }`} />
            <span className={`relative z-10 transition-all ${isActive(item.path) ? 'translate-x-1' : ''}`}>
              {item.label}
            </span>
            
            {isActive(item.path) && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 shadow-[0_0_10px_#10b981]" />
            )}
          </Link>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-800 bg-slate-950">
        <div className="bg-slate-900/50 rounded-xl p-1">
            {hasPermission(['owner']) && (
              <Link 
                to="/settings"
                className={`flex items-center gap-3 px-4 py-3 w-full rounded-lg transition-all text-sm ${
                  isActive('/settings') ? 'text-white bg-slate-800' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Configurações</span>
              </Link>
            )}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:text-red-300 hover:bg-red-900/10 rounded-lg transition-all mt-1 text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
        </div>
      </div>
    </div>
  );
};