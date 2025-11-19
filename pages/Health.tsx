
import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, Syringe, Pill, Activity, Calendar, AlertTriangle, 
  CheckCircle, Plus, Search, FileText, Filter, X, Save, DollarSign,
  Clock, User, Thermometer, ArrowRight, ChevronRight, Check, Sparkles, Loader2, BrainCircuit
} from 'lucide-react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { HealthRecord } from '../types';
import { getVeterinaryAdvice } from '../services/geminiService';
import { api } from '../services/api';
import { useToast } from '../contexts/ToastContext';

// --- Mock Data Enhanced (Static for dashboard parts, dynamic for lists) ---

const COST_HISTORY_DATA = [
  { month: 'Jun', Vacina: 1200, Tratamento: 450, Exame: 200 },
  { month: 'Jul', Vacina: 0, Tratamento: 600, Exame: 150 },
  { month: 'Ago', Vacina: 300, Tratamento: 200, Exame: 0 },
  { month: 'Set', Vacina: 150, Tratamento: 800, Exame: 300 },
  { month: 'Out', Vacina: 2500, Tratamento: 350, Exame: 100 }, 
  { month: 'Nov', Vacina: 500, Tratamento: 400, Exame: 120 },
];

interface ExtendedTreatment {
  id: string;
  animalId: string;
  diagnosis: string;
  protocol: string;
  medication: string;
  dosage: string;
  frequency: string;
  startDate: string;
  daysLeft: number;
  risk: 'High' | 'Medium' | 'Low';
  logs: { date: string; action: string; responsible: string; status: 'Done' | 'Pending'; }[];
  evolution: { date: string; note: string; condition: 'Improved' | 'Stable' | 'Worsened'; }[];
}

// Mock active treatments for the detail view
const ACTIVE_TREATMENTS: ExtendedTreatment[] = [
  { 
    id: 't1', 
    animalId: 'Mimoso (ID: 9032)', 
    diagnosis: 'Pneumonia Leve', 
    protocol: 'Antibioticoterapia Sistêmica', 
    medication: 'Draxxin',
    dosage: '2.5ml / 50kg',
    frequency: 'Dose Única',
    startDate: '2023-11-01', 
    daysLeft: 2, 
    risk: 'Medium',
    logs: [
      { date: '01/11 - 08:00', action: 'Aplicação Inicial', responsible: 'Dr. Mario', status: 'Done' },
      { date: '03/11 - 08:00', action: 'Avaliação Clínica', responsible: 'Dr. Mario', status: 'Done' }
    ],
    evolution: [
      { date: '01/11', note: 'Animal apresentou tosse seca e febre (39.5°C).', condition: 'Worsened' },
      { date: '03/11', note: 'Redução da febre. Voltou a se alimentar.', condition: 'Improved' }
    ]
  },
];

const HEALTH_STATS = [
  { name: 'Saudáveis', value: 85, color: '#10b981' },
  { name: 'Em Tratamento', value: 10, color: '#f59e0b' },
  { name: 'Quarentena', value: 5, color: '#ef4444' },
];

export const Health: React.FC = () => {
  const { addToast } = useToast();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'history'>('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState<ExtendedTreatment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // AI Analysis States
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [newRecord, setNewRecord] = useState<Partial<HealthRecord>>({
    type: 'Vaccine',
    status: 'Scheduled',
    date: new Date().toISOString().split('T')[0],
    cost: 0
  });

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    const data = await api.health.list();
    setRecords(data);
  };

  // Reset AI analysis when a new treatment is selected
  useEffect(() => {
    setAiAnalysis(null);
    setIsAnalyzing(false);
  }, [selectedTreatment]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newRecord.animalId || !newRecord.description) return;
      
      const record = await api.health.create(newRecord as HealthRecord);
      setRecords(prev => [record, ...prev]);
      setIsModalOpen(false);
      setNewRecord({ type: 'Vaccine', status: 'Scheduled', date: new Date().toISOString().split('T')[0], cost: 0, animalId: '', description: '' });
      addToast('success', 'Sucesso', 'Registro sanitário salvo.');
    } catch (err) {
      addToast('error', 'Erro', 'Falha ao salvar registro.');
    }
  };

  const handleCompleteRecord = async (id: string) => {
    if (window.confirm('Deseja marcar esta aplicação como realizada?')) {
      try {
        await api.health.updateStatus(id, 'Completed');
        setRecords(prev => prev.map(rec => rec.id === id ? { ...rec, status: 'Completed' } : rec));
        addToast('success', 'Concluído', 'Status atualizado para realizado.');
      } catch (err) {
        addToast('error', 'Erro', 'Não foi possível atualizar.');
      }
    }
  };

  const handleAnalyzeCase = async () => {
    if (!selectedTreatment) return;
    setIsAnalyzing(true);

    const prompt = `
      Analise este caso clínico veterinário:
      Diagnóstico: ${selectedTreatment.diagnosis}
      Protocolo: ${selectedTreatment.medication} (${selectedTreatment.dosage})
      Evolução: ${selectedTreatment.evolution.map(e => `${e.date}: ${e.note}`).join('. ')}
      
      Forneça recomendações breves.
    `;

    const result = await getVeterinaryAdvice(prompt);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  const pendingVaccines = records.filter(r => r.type === 'Vaccine' && r.status === 'Scheduled').length;
  const monthlyCost = records.reduce((acc, r) => acc + (r.cost || 0), 0);
  const today = new Date().toISOString().split('T')[0];
  
  const overdueVaccines = records.filter(r => r.type === 'Vaccine' && r.status === 'Scheduled' && r.date < today);
  const upcomingVaccines = records.filter(r => r.type === 'Vaccine' && r.status === 'Scheduled' && r.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const filteredRecords = records.filter(r => r.description.toLowerCase().includes(searchTerm.toLowerCase()) || r.animalId.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Sanidade Animal</h2>
          <p className="text-slate-400">Controle de vacinas, tratamentos e protocolos veterinários.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-4 py-2.5 rounded-lg hover:shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center gap-2 font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Registro</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 flex items-center gap-4 shadow-lg">
           <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
             <Activity className="w-6 h-6" />
           </div>
           <div>
             <p className="text-slate-400 text-xs font-bold uppercase">Índice de Saúde</p>
             <h3 className="text-2xl font-bold text-white">92%</h3>
             <p className="text-[10px] text-emerald-400">Rebanho saudável</p>
           </div>
        </div>
        
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 flex items-center gap-4 shadow-lg">
           <div className="p-3 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
             <AlertTriangle className="w-6 h-6" />
           </div>
           <div>
             <p className="text-slate-400 text-xs font-bold uppercase">Alertas Ativos</p>
             <h3 className="text-2xl font-bold text-white">1</h3>
             <p className="text-[10px] text-amber-400">Animais em observação</p>
           </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 flex items-center gap-4 shadow-lg">
           <div className="p-3 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
             <Syringe className="w-6 h-6" />
           </div>
           <div>
             <p className="text-slate-400 text-xs font-bold uppercase">Vacinas Pendentes</p>
             <h3 className="text-2xl font-bold text-white">{pendingVaccines}</h3>
             <p className="text-[10px] text-slate-500">Agendadas</p>
           </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 flex items-center gap-4 shadow-lg">
           <div className="p-3 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
             <DollarSign className="w-6 h-6" />
           </div>
           <div>
             <p className="text-slate-400 text-xs font-bold uppercase">Custo Sanitário</p>
             <h3 className="text-2xl font-bold text-white">R$ {monthlyCost.toLocaleString()}</h3>
             <p className="text-[10px] text-slate-500">Total acumulado</p>
           </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-800 flex gap-6 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'overview' ? 'text-emerald-400' : 'text-slate-400 hover:text-white'}`}
        >
          Visão Geral
          {activeTab === 'overview' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('calendar')}
          className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'calendar' ? 'text-emerald-400' : 'text-slate-400 hover:text-white'}`}
        >
          Calendário de Vacinação
          {activeTab === 'calendar' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'history' ? 'text-emerald-400' : 'text-slate-400 hover:text-white'}`}
        >
          Histórico Completo
          {activeTab === 'history' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>}
        </button>
      </div>

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Treatments List */}
            <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-amber-500" />
                  Tratamentos em Andamento
                </h3>
              </div>
              <div className="space-y-3">
                {ACTIVE_TREATMENTS.map((t) => (
                  <div 
                    key={t.id} 
                    onClick={() => setSelectedTreatment(t)}
                    className="bg-slate-950/50 p-4 rounded-lg border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-12 rounded-full transition-all group-hover:h-14 ${
                        t.risk === 'High' ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 
                        t.risk === 'Medium' ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' : 'bg-blue-500'
                      }`}></div>
                      <div>
                        <h4 className="text-white font-bold group-hover:text-emerald-400 transition-colors">{t.animalId}</h4>
                        <p className="text-sm text-slate-400">{t.diagnosis}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-right hidden sm:block">
                         <span className="block text-slate-500 text-xs">Início</span>
                         <span className="text-slate-300">{t.startDate}</span>
                      </div>
                      <div className="bg-slate-800 px-3 py-1 rounded-lg border border-slate-700 text-center min-w-[80px] group-hover:bg-slate-700 transition-colors">
                         <span className="block text-[10px] text-slate-500 uppercase">Restam</span>
                         <span className="font-bold text-white">{t.daysLeft} dias</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Health Distribution Chart */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 flex flex-col">
               <h3 className="font-bold text-white mb-2 text-sm">Distribuição do Rebanho</h3>
               <div className="flex-1 min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={HEALTH_STATS}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {HEALTH_STATS.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
               </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
             <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-500" />
                Evolução de Custos Sanitários (Últimos 6 Meses)
             </h3>
             <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={COST_HISTORY_DATA} barGap={8} barSize={24}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(val) => `R$${val}`} dx={-10} />
                      <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px' }} cursor={{ fill: '#334155', opacity: 0.2 }} />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      <Bar dataKey="Vacina" name="Vacinas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Tratamento" name="Tratamentos" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Exame" name="Exames" fill="#a855f7" radius={[4, 4, 0, 0]} />
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
           <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Cronograma de Vacinação
              </h3>
              
              <div className="relative border-l-2 border-slate-800 ml-3 space-y-8 pb-4">
                {/* Overdue */}
                <div className="relative pl-8">
                   <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-red-500 border-4 border-slate-900"></div>
                   <h4 className="text-red-400 font-bold text-sm uppercase tracking-wide mb-3">Atrasado / Atenção</h4>
                   {overdueVaccines.map(vac => (
                      <div key={vac.id} className="bg-red-900/10 border border-red-500/20 rounded-lg p-4 hover:bg-red-900/20 transition-colors mb-3">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div>
                            <h5 className="text-white font-bold flex items-center gap-2">{vac.description} <span className="text-[10px] bg-red-500 text-white px-1.5 rounded">ATRASADO</span></h5>
                            <p className="text-slate-400 text-sm mt-1">{vac.animalId} • Vencimento: {vac.date}</p>
                          </div>
                          <button onClick={() => handleCompleteRecord(vac.id)} className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg font-bold shadow-lg flex items-center gap-2"><CheckCircle className="w-3 h-3" /> Registrar Aplicação</button>
                        </div>
                      </div>
                   ))}
                   {overdueVaccines.length === 0 && <p className="text-slate-500 text-sm italic">Nenhuma vacina em atraso.</p>}
                </div>

                {/* Upcoming */}
                <div className="relative pl-8">
                   <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-4 border-slate-900 shadow-[0_0_10px_#10b981]"></div>
                   <h4 className="text-emerald-400 font-bold text-sm uppercase tracking-wide mb-3">Próximos Agendamentos</h4>
                   {upcomingVaccines.map((vac, idx) => (
                    <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-3 hover:border-emerald-500/30 transition-colors">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div>
                            <h5 className="text-white font-bold">{vac.description}</h5>
                            <p className="text-slate-400 text-sm mt-1">{vac.animalId} • {vac.date}</p>
                          </div>
                          <button onClick={() => handleCompleteRecord(vac.id)} className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-lg"><Check className="w-3 h-3" /> <span>Concluir</span></button>
                        </div>
                    </div>
                  ))}
                  {upcomingVaccines.length === 0 && <p className="text-slate-500 text-sm italic">Nada agendado para os próximos dias.</p>}
                </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input type="text" placeholder="Buscar registros..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
              </div>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left text-sm">
               <thead className="bg-slate-950/50 text-slate-400 font-medium border-b border-slate-800">
                 <tr>
                   <th className="px-6 py-3">Data</th>
                   <th className="px-6 py-3">Animal/Lote</th>
                   <th className="px-6 py-3">Tipo</th>
                   <th className="px-6 py-3">Descrição</th>
                   <th className="px-6 py-3">Custo</th>
                   <th className="px-6 py-3">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-800">
                 {filteredRecords.map((r) => (
                   <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                     <td className="px-6 py-4 text-slate-300">{r.date}</td>
                     <td className="px-6 py-4 font-medium text-white">{r.animalId}</td>
                     <td className="px-6 py-4">
                       <span className={`flex items-center gap-2 ${r.type === 'Vaccine' ? 'text-blue-400' : r.type === 'Treatment' ? 'text-amber-400' : 'text-purple-400'}`}>
                         {r.type === 'Vaccine' && <Syringe className="w-4 h-4" />}
                         {r.type === 'Treatment' && <Pill className="w-4 h-4" />}
                         {r.type === 'Exam' && <FileText className="w-4 h-4" />}
                         {r.type === 'Vaccine' ? 'Vacina' : r.type === 'Treatment' ? 'Tratamento' : 'Exame'}
                       </span>
                     </td>
                     <td className="px-6 py-4 text-slate-300">{r.description}</td>
                     <td className="px-6 py-4 text-slate-300">R$ {r.cost.toFixed(2)}</td>
                     <td className="px-6 py-4">
                       <span className={`px-2 py-1 rounded text-xs font-bold ${r.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>{r.status === 'Completed' ? 'Concluído' : 'Agendado'}</span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      )}

      {selectedTreatment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-900">
              <h3 className="text-xl font-bold text-white">{selectedTreatment.animalId}</h3>
              <button onClick={() => setSelectedTreatment(null)} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                     <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-5">
                        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2"><FileText className="w-4 h-4 text-emerald-500" /> Protocolo Clínico</h4>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1"><span className="text-xs text-slate-500 block">Medicamento</span><span className="font-bold text-white text-lg">{selectedTreatment.medication}</span></div>
                           <div className="space-y-1"><span className="text-xs text-slate-500 block">Dosagem</span><span className="font-bold text-white text-lg">{selectedTreatment.dosage}</span></div>
                        </div>
                     </div>
                  </div>
                  <div className="space-y-6">
                     <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-5 h-full flex flex-col relative">
                        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2"><Thermometer className="w-4 h-4 text-pink-500" /> Análise IA</h4>
                        {!aiAnalysis && !isAnalyzing ? (
                           <button onClick={handleAnalyzeCase} className="w-full mb-4 py-2.5 bg-emerald-900/20 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all"><Sparkles className="w-3.5 h-3.5" /> Analisar Caso</button>
                        ) : isAnalyzing ? (
                           <div className="flex justify-center py-4"><Loader2 className="animate-spin text-emerald-500" /></div>
                        ) : (
                           <div className="prose prose-invert prose-sm text-xs text-slate-300 max-h-60 overflow-y-auto">{aiAnalysis}</div>
                        )}
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
               <h3 className="text-lg font-bold text-white">Novo Registro</h3>
               <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
             </div>
             <form onSubmit={handleSave} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-xs text-slate-500 font-bold uppercase">Tipo</label>
                     <select value={newRecord.type} onChange={(e) => setNewRecord({...newRecord, type: e.target.value as any})} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none">
                       <option value="Vaccine">Vacina</option>
                       <option value="Treatment">Tratamento</option>
                       <option value="Exam">Exame</option>
                     </select>
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs text-slate-500 font-bold uppercase">Data</label>
                     <input type="date" value={newRecord.date} onChange={(e) => setNewRecord({...newRecord, date: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none [color-scheme:dark]" />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-xs text-slate-500 font-bold uppercase">Animal/Lote</label>
                   <input type="text" value={newRecord.animalId} onChange={(e) => setNewRecord({...newRecord, animalId: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white" required />
                </div>
                <div className="space-y-2">
                   <label className="text-xs text-slate-500 font-bold uppercase">Descrição</label>
                   <input type="text" value={newRecord.description} onChange={(e) => setNewRecord({...newRecord, description: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white" required />
                </div>
                <div className="space-y-2">
                     <label className="text-xs text-slate-500 font-bold uppercase">Custo (R$)</label>
                     <input type="number" step="0.01" value={newRecord.cost} onChange={(e) => setNewRecord({...newRecord, cost: parseFloat(e.target.value)})} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white" />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                   <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg">Cancelar</button>
                   <button type="submit" className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-lg flex items-center gap-2"><Save className="w-4 h-4" /> Salvar</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};
