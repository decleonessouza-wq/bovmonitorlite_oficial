import React, { useState } from 'react';
import { HashRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { AnimalManager } from './pages/AnimalManager';
import { PastureManagement } from './pages/PastureManagement';
import { Reproduction } from './pages/Reproduction';
import { Finance } from './pages/Finance';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { Health } from './pages/Health';
import { AIAssistant } from './components/AIAssistant';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { Menu, Bell, X, Check, Trash2, AlertTriangle, Info, CloudRain, Syringe, DollarSign } from 'lucide-react';
import { UserRole } from './types';

// Interface para as notificações locais do Header
interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'alert' | 'info' | 'success' | 'warning';
  read: boolean;
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  { id: '1', title: 'Vacina Atrasada', message: 'Lote A precisa de vacinação contra Aftosa.', time: '2 horas atrás', type: 'alert', read: false },
  { id: '2', title: 'Estoque Baixo', message: 'Sal Mineral atingiu o nível mínimo.', time: '5 horas atrás', type: 'warning', read: false },
  { id: '3', title: 'Previsão de Chuva', message: 'Chuva intensa prevista para amanhã (25mm).', time: '1 dia atrás', type: 'info', read: true },
  { id: '4', title: 'Venda Concluída', message: 'Pagamento do Lote C confirmado.', time: '2 dias atrás', type: 'success', read: true },
];

const Header: React.FC<{ toggleSidebar: () => void }> = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'success': return <DollarSign className="w-4 h-4 text-emerald-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 md:px-6 fixed top-0 right-0 left-0 md:left-64 z-10 transition-all duration-300">
      <div className="flex items-center gap-3">
        <button onClick={toggleSidebar} className="md:hidden p-2 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
          <Menu className="w-6 h-6" />
        </button>
        
        {/* Nome do App em Destaque no Header */}
        <div className="flex items-center gap-1 select-none">
          <span className="text-lg md:text-xl font-bold text-white tracking-tight">
            BovMonitor<span className="text-emerald-500 font-extrabold">Lite</span>
          </span>
          <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
            v1.0
          </span>
        </div>
      </div>
      
      <div className="flex-1 md:flex-none" />

      <div className="flex items-center gap-4 relative">
        {/* Bell Button */}
        <button 
          onClick={() => setIsNotifOpen(!isNotifOpen)}
          className={`p-2 rounded-full relative transition-all duration-300 ${isNotifOpen ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_5px_rgba(16,185,129,0.5)] animate-pulse"></span>
          )}
        </button>

        {/* Notification Dropdown */}
        {isNotifOpen && (
          <>
            {/* Click Outside Overlay */}
            <div className="fixed inset-0 z-10" onClick={() => setIsNotifOpen(false)}></div>
            
            {/* Dropdown Content */}
            <div className="absolute top-14 right-0 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-black/50 z-20 overflow-hidden animate-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-slate-800 flex justify-between items-center bg-slate-900/95 backdrop-blur">
                <h3 className="font-bold text-white text-sm">Notificações</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Marcar lidas
                  </button>
                )}
              </div>
              
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">Tudo tranquilo por aqui.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/50">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        onClick={() => markAsRead(notif.id)}
                        className={`p-4 hover:bg-slate-800/50 transition-colors cursor-pointer flex gap-3 group relative ${notif.read ? 'opacity-60' : 'bg-slate-800/20'}`}
                      >
                        <div className={`mt-1 p-1.5 rounded-full h-fit ${
                          notif.type === 'alert' ? 'bg-red-500/10' : 
                          notif.type === 'warning' ? 'bg-amber-500/10' :
                          notif.type === 'success' ? 'bg-emerald-500/10' : 'bg-blue-500/10'
                        }`}>
                          {getIcon(notif.type)}
                        </div>
                        <div className="flex-1 pr-6">
                          <p className={`text-sm font-medium ${notif.read ? 'text-slate-400' : 'text-white'}`}>{notif.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                          <p className="text-[10px] text-slate-600 mt-1.5">{notif.time}</p>
                        </div>
                        {!notif.read && (
                          <div className="absolute right-4 top-5 w-2 h-2 rounded-full bg-emerald-500"></div>
                        )}
                        <button 
                          onClick={(e) => removeNotification(notif.id, e)}
                          className="absolute right-2 top-2 p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-900/20 rounded opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="p-3 bg-slate-950 border-t border-slate-800 text-center">
                <button className="text-xs text-slate-400 hover:text-white transition-colors">
                  Ver histórico completo
                </button>
              </div>
            </div>
          </>
        )}

        <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-200">{user?.name || 'Usuário'}</p>
            <div className="flex items-center justify-end gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${
                user?.role === 'owner' ? 'bg-emerald-500' : 
                user?.role === 'manager' ? 'bg-blue-500' : 'bg-amber-500'
              }`}></span>
              <p className="text-xs text-slate-500 capitalize">
                {user?.role === 'owner' ? 'Dono' : user?.role === 'manager' ? 'Gerente' : 'Colaborador'}
              </p>
            </div>
          </div>
          <div className="w-10 h-10 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/20 border border-emerald-500/30">
            {user?.avatarUrl || 'US'}
          </div>
        </div>
      </div>
    </header>
  );
};

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen text-slate-200 selection:bg-emerald-500 selection:text-white flex flex-col relative">
      {/* Global Background Gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/30 via-slate-950 to-black z-0 pointer-events-none" />

      {/* Sidebar com controle de abertura no mobile */}
      <Sidebar isOpen={sidebarOpen} />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <main className="pt-24 px-4 md:pl-72 md:pr-8 max-w-7xl mx-auto w-full flex-1 flex flex-col relative z-1">
        <div className="flex-1">
          {children}
        </div>
        
        {/* Footer */}
        <footer className="mt-12 py-8 border-t border-slate-800/50 flex flex-col items-center justify-center gap-2 text-center">
          <p className="text-slate-500 text-xs font-medium tracking-wide">
            @2025 BovMonitor<span className="text-emerald-500">Lite</span> - By{' '}
            <span className="text-slate-300 font-semibold hover:text-emerald-400 transition-colors cursor-default">
              Decleones Andrade
            </span>
          </p>
          <p className="text-[10px] text-slate-600">
            Todos os direitos reservados. Tecnologia para o campo.
          </p>
        </footer>
      </main>
      
      <AIAssistant />
    </div>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactElement, roles: UserRole[] }> = ({ children, roles }) => {
  const { hasPermission } = useAuth();
  
  if (!hasPermission(roles)) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-500">
        <div className="bg-slate-900 p-8 rounded-2xl shadow-lg border border-slate-800 text-center max-w-md w-full">
          <h2 className="text-xl font-bold text-red-500 mb-2">Acesso Negado</h2>
          <p className="text-slate-400">Seu perfil de usuário não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }
  
  return children;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route
        path="/"
        element={
          <ProtectedLayout>
            <ProtectedRoute roles={['owner', 'manager', 'collaborator']}>
              <Dashboard />
            </ProtectedRoute>
          </ProtectedLayout>
        }
      />
      
      <Route
        path="/animals"
        element={
          <ProtectedLayout>
            <ProtectedRoute roles={['owner', 'manager', 'collaborator']}>
              <AnimalManager />
            </ProtectedRoute>
          </ProtectedLayout>
        }
      />
      
      <Route
        path="/health"
        element={
          <ProtectedLayout>
            <ProtectedRoute roles={['owner', 'manager', 'collaborator']}>
              <Health />
            </ProtectedRoute>
          </ProtectedLayout>
        }
      />
      
      <Route
        path="/pasture"
        element={
          <ProtectedLayout>
            <ProtectedRoute roles={['owner', 'manager', 'collaborator']}>
              <PastureManagement />
            </ProtectedRoute>
          </ProtectedLayout>
        }
      />
      
      <Route
        path="/reproduction"
        element={
          <ProtectedLayout>
            <ProtectedRoute roles={['owner', 'manager']}>
              <Reproduction />
            </ProtectedRoute>
          </ProtectedLayout>
        }
      />
      
      <Route
        path="/finance"
        element={
          <ProtectedLayout>
            <ProtectedRoute roles={['owner', 'manager']}>
              <Finance />
            </ProtectedRoute>
          </ProtectedLayout>
        }
      />
      
      <Route
        path="/settings"
        element={
          <ProtectedLayout>
            <ProtectedRoute roles={['owner']}>
              <Settings />
            </ProtectedRoute>
          </ProtectedLayout>
        }
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
