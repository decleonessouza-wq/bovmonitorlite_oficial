import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Lock, Mail, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@bov.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      } else {
        setError('Credenciais inválidas. Tente admin@bov.com / 123456');
      }
    } catch (err) {
      setError('Ocorreu um erro ao tentar entrar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl shadow-black relative z-10">
        
        <div className="flex flex-col items-center mb-8">
           <div className="w-20 h-20 bg-slate-900 rounded-2xl border border-slate-700 flex items-center justify-center mb-4 shadow-lg shadow-emerald-900/20 p-3">
             <img src="https://i.postimg.cc/httGw5Qt/LOGO-BOVMONITOR-oficial.png" alt="Logo" className="w-full h-full object-contain filter brightness-110" />
           </div>
           <h1 className="text-2xl font-bold text-white">Bem-vindo de volta</h1>
           <p className="text-slate-400 text-sm mt-1">Acesse sua conta para gerenciar o rebanho.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                placeholder="Seu e-mail de acesso"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-900/20 transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                <span>Entrar na Plataforma</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
           <p className="text-slate-500 text-xs mb-2">Contas de demonstração:</p>
           <div className="flex justify-center gap-2 text-xs">
             <button onClick={() => {setEmail('admin@bov.com'); setPassword('123456')}} className="px-2 py-1 bg-slate-800 hover:bg-emerald-900/30 rounded text-slate-300 hover:text-emerald-400 transition-colors">Dono</button>
             <button onClick={() => {setEmail('gerente@bov.com'); setPassword('123456')}} className="px-2 py-1 bg-slate-800 hover:bg-blue-900/30 rounded text-slate-300 hover:text-blue-400 transition-colors">Gerente</button>
             <button onClick={() => {setEmail('peao@bov.com'); setPassword('123456')}} className="px-2 py-1 bg-slate-800 hover:bg-amber-900/30 rounded text-slate-300 hover:text-amber-400 transition-colors">Colaborador</button>
           </div>
        </div>
      </div>
    </div>
  );
};