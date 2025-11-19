import React from 'react';
import { Calendar, Activity, Heart, Baby, CheckCircle, AlertCircle, Clock, ArrowUpRight } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip } from 'recharts';

const PROTOCOLS = [
  { id: 1, name: 'IATF Lote 01', date: '2023-10-15', stage: 'D0 - Implante', status: 'Em Andamento', animals: 45 },
  { id: 2, name: 'IATF Lote 03', date: '2023-10-20', stage: 'D8 - Retirada', status: 'Agendado', animals: 32 },
  { id: 3, name: 'Diagnóstico Gestação', date: '2023-10-12', stage: 'Toque', status: 'Concluído', animals: 50, result: '82% Prenhez' },
];

const UPCOMING_BIRTHS = [
  { id: 1, mother: 'Matriz 209', date: '15/11/2023', days: '15 dias' },
  { id: 2, mother: 'Matriz 114', date: '18/11/2023', days: '18 dias' },
  { id: 3, mother: 'Matriz 340', date: '22/11/2023', days: '22 dias' },
];

const STATUS_DATA = [
  { name: 'Prenhes', value: 65, color: '#10b981' },
  { name: 'Vazias', value: 20, color: '#ef4444' },
  { name: 'Lactantes', value: 15, color: '#f59e0b' },
];

export const Reproduction: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Reprodução e Genética</h2>
          <p className="text-slate-400">Gestão de coberturas, IATF e previsões de parto.</p>
        </div>
        <button className="bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium shadow-lg shadow-pink-900/20">
          <Heart className="w-4 h-4" />
          <span>Novo Protocolo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI Card 1 */}
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 flex items-center gap-4">
           <div className="p-3 rounded-full bg-pink-500/20 text-pink-500">
             <Activity className="w-6 h-6" />
           </div>
           <div>
             <p className="text-slate-400 text-sm">Taxa de Concepção</p>
             <h3 className="text-2xl font-bold text-white">78.5%</h3>
             <p className="text-xs text-emerald-400 flex items-center gap-1"><ArrowUpRight className="w-3 h-3"/> +2.1% vs ano anterior</p>
           </div>
        </div>
        {/* KPI Card 2 */}
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 flex items-center gap-4">
           <div className="p-3 rounded-full bg-purple-500/20 text-purple-500">
             <Baby className="w-6 h-6" />
           </div>
           <div>
             <p className="text-slate-400 text-sm">Previsão Partos (Mês)</p>
             <h3 className="text-2xl font-bold text-white">24</h3>
             <p className="text-xs text-slate-500">Novembro 2023</p>
           </div>
        </div>
        {/* KPI Card 3 */}
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 flex items-center gap-4">
           <div className="p-3 rounded-full bg-blue-500/20 text-blue-500">
             <CheckCircle className="w-6 h-6" />
           </div>
           <div>
             <p className="text-slate-400 text-sm">Intervalo Partos</p>
             <h3 className="text-2xl font-bold text-white">13.2 m</h3>
             <p className="text-xs text-emerald-400">Meta atingida</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Protocols */}
        <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-500" />
            Protocolos Ativos
          </h3>
          <div className="space-y-3">
            {PROTOCOLS.map((p) => (
              <div key={p.id} className="bg-slate-950/50 p-4 rounded-lg border border-slate-800 flex items-center justify-between hover:border-emerald-500/30 transition-colors">
                <div className="flex items-center gap-4">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                     p.status === 'Em Andamento' ? 'bg-blue-500/20 text-blue-400' : 
                     p.status === 'Concluído' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                   }`}>
                     {p.date.split('-')[2]}
                   </div>
                   <div>
                     <h4 className="text-white font-medium">{p.name}</h4>
                     <p className="text-sm text-slate-400">{p.stage} • {p.animals} animais</p>
                   </div>
                </div>
                <div className="text-right">
                  {p.result ? (
                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded text-xs font-bold">{p.result}</span>
                  ) : (
                    <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs font-bold">{p.status}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart & Births */}
        <div className="space-y-6">
           {/* Status Chart */}
           <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 h-64">
              <h3 className="font-bold text-white mb-2 text-sm">Distribuição do Rebanho</h3>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={STATUS_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {STATUS_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
           </div>

           {/* Upcoming Births */}
           <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-amber-500" />
                Próximos Partos
              </h3>
              <div className="space-y-3">
                {UPCOMING_BIRTHS.map((b) => (
                  <div key={b.id} className="flex items-center justify-between text-sm border-b border-slate-800 pb-2 last:border-0">
                    <span className="text-slate-300">{b.mother}</span>
                    <div className="text-right">
                      <span className="block text-white font-medium">{b.date}</span>
                      <span className="text-xs text-amber-500">Faltam {b.days}</span>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};