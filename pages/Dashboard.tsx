import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { 
  Beef, TrendingUp, AlertTriangle, Droplets, Settings, Check, Layout, 
  DollarSign, Activity, Milk, Sparkles, Loader2, ArrowLeft, Download, Share2
} from 'lucide-react';
import { analyzeHerdPerformance } from '../services/geminiService';
import { generatePDF, downloadPDF, sharePDF } from '../services/reportService';
import { useToast } from '../contexts/ToastContext';

// --- Mock Data ---

const weightData = [
  { month: 'Jan', peso: 320 },
  { month: 'Fev', peso: 335 },
  { month: 'Mar', peso: 350 },
  { month: 'Abr', peso: 362 },
  { month: 'Mai', peso: 380 },
  { month: 'Jun', peso: 395 },
];

const financeData = [
  { month: 'Jan', receita: 12000, despesa: 8000 },
  { month: 'Fev', receita: 15000, despesa: 9500 },
  { month: 'Mar', receita: 11000, despesa: 7000 },
  { month: 'Abr', receita: 22000, despesa: 12000 },
  { month: 'Mai', receita: 18000, despesa: 8500 },
  { month: 'Jun', receita: 25000, despesa: 10000 },
];

const reproductionData = [
  { name: 'Prenhes', value: 450, color: '#10b981' }, // Emerald 500
  { name: 'Vazias', value: 120, color: '#f43f5e' }, // Rose 500
  { name: 'Em Serviço', value: 230, color: '#3b82f6' }, // Blue 500
  { name: 'Lactantes', value: 180, color: '#f59e0b' }, // Amber 500
];

const milkData = [
  { day: 'Seg', volume: 1200 },
  { day: 'Ter', volume: 1250 },
  { day: 'Qua', volume: 1180 },
  { day: 'Qui', volume: 1300 },
  { day: 'Sex', volume: 1280 },
  { day: 'Sáb', volume: 1350 },
  { day: 'Dom', volume: 1320 },
];

// --- Loading Skeletons ---

const StatCardSkeleton = () => (
  <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6 h-[140px] animate-pulse relative overflow-hidden">
    <div className="h-4 bg-slate-800 rounded w-1/2 mb-4"></div>
    <div className="h-8 bg-slate-800 rounded w-3/4 mb-2"></div>
    <div className="absolute top-6 right-6 w-10 h-10 bg-slate-800 rounded-lg"></div>
  </div>
);

const WidgetSkeleton = () => (
  <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6 h-96 animate-pulse flex flex-col">
    <div className="flex justify-between mb-6">
      <div className="h-5 bg-slate-800 rounded w-1/3"></div>
      <div className="h-5 bg-slate-800 rounded w-10"></div>
    </div>
    <div className="flex-1 bg-slate-800/30 rounded-lg"></div>
  </div>
);

// --- Components ---

const StatCard: React.FC<{ 
  title: string; 
  value: string; 
  trend?: string; 
  icon: React.ElementType; 
  color: string;
  trendUp?: boolean;
}> = ({ title, value, trend, icon: Icon, color, trendUp }) => (
  <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-6 rounded-xl border border-slate-800/60 hover:border-emerald-500/30 transition-all duration-500 shadow-lg shadow-black/20 h-full group relative overflow-hidden backdrop-blur-sm">
    {/* Glow Effect */}
    <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all duration-700"></div>
    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none"></div>

    <div className="relative z-10 flex justify-between items-start">
      <div>
        <p className="text-slate-400 text-sm font-medium mb-1 group-hover:text-slate-300 transition-colors">{title}</p>
        <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
      </div>
      <div className={`p-2.5 rounded-xl ${color} bg-opacity-10 border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-300`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
    </div>
    {trend && (
      <div className="mt-4 flex items-center gap-1 text-xs font-medium relative z-10">
        <span className={`${trendUp ? 'text-emerald-400' : 'text-red-400'} flex items-center bg-slate-950/50 px-1.5 py-0.5 rounded border border-slate-800/50`}>
          {trendUp ? '↑' : '↓'} {trend}
        </span>
        <span className="text-slate-500 ml-1">vs mês anterior</span>
      </div>
    )}
  </div>
);

// --- Widget Definitions ---

type WidgetId = 'kpi' | 'weight' | 'finance' | 'sanity' | 'reproduction' | 'milk';

interface WidgetDef {
  id: WidgetId;
  title: string;
  description: string;
  component: React.FC;
  colSpan: 'full' | 'half';
}

// Widget Implementations

const KPIWidget = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <StatCard 
      title="Total de Cabeças" 
      value="1,245" 
      trend="12%" 
      trendUp={true}
      icon={Beef} 
      color="bg-blue-500" 
    />
    <StatCard 
      title="GMD Médio (Ganho)" 
      value="0.85 kg" 
      trend="0.05 kg" 
      trendUp={true}
      icon={TrendingUp} 
      color="bg-emerald-500" 
    />
    <StatCard 
      title="Alertas Sanitários" 
      value="3" 
      trend="Atenção" 
      trendUp={false}
      icon={AlertTriangle} 
      color="bg-amber-500" 
    />
    <StatCard 
      title="Taxa de Prenhez" 
      value="82%" 
      trend="2%" 
      trendUp={true}
      icon={Droplets} 
      color="bg-purple-500" 
    />
  </div>
);

const WeightWidget = () => {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setShowAnalysis(true);
    if (analysis) return; 

    setIsAnalyzing(true);
    const dataSummary = weightData.map(d => `${d.month}: ${d.peso}kg`).join('; ');
    const prompt = `Dados de evolução de peso médio do Lote A nos últimos 6 meses: ${dataSummary}. O objetivo é maximizar o ganho de peso.`;
    
    const result = await analyzeHerdPerformance(prompt);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-6 rounded-xl border border-slate-800/60 shadow-xl shadow-black/20 h-96 flex flex-col relative overflow-hidden transition-all hover:border-slate-700/80">
      <div className="flex justify-between items-center mb-6 relative z-10">
        <h3 className="font-bold text-slate-200 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
          Evolução de Peso (Lote A)
        </h3>
        {!showAnalysis ? (
          <button 
            onClick={handleAnalyze}
            className="flex items-center gap-2 text-xs font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 px-3 py-1.5 rounded-lg transition-all shadow-[0_0_10px_rgba(16,185,129,0.1)] hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            IA Análise
          </button>
        ) : (
          <button 
            onClick={() => setShowAnalysis(false)}
            className="flex items-center gap-2 text-xs font-medium bg-slate-800 text-slate-400 hover:text-white border border-slate-700 px-3 py-1.5 rounded-lg transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar ao Gráfico
          </button>
        )}
      </div>

      <div className="flex-1 min-h-0 relative z-10">
        {!showAnalysis ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weightData}>
              <defs>
                <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} unit="kg" dx={-10} />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#334155', color: '#f8fafc', borderRadius: '12px', backdropFilter: 'blur(8px)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                itemStyle={{ color: '#10b981' }}
                cursor={{ stroke: '#334155', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area 
                type="monotone" 
                dataKey="peso" 
                stroke="#10b981" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorPeso)" 
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full bg-slate-950/30 rounded-lg p-4 border border-slate-800/50 overflow-y-auto custom-scrollbar backdrop-blur-sm">
            {isAnalyzing ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                <p className="text-sm animate-pulse">Processando dados do rebanho...</p>
              </div>
            ) : (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="flex items-center gap-2 text-emerald-400 mb-2">
                    <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider">Relatório Inteligente</span>
                 </div>
                 <div className="prose prose-invert prose-sm max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                   {analysis}
                 </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const FinanceWidget = () => (
  <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-6 rounded-xl border border-slate-800/60 shadow-xl shadow-black/20 h-96 flex flex-col">
    <div className="flex justify-between items-center mb-6">
      <h3 className="font-bold text-slate-200 flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-emerald-500" />
        Fluxo de Caixa
      </h3>
      <div className="flex gap-3 bg-slate-950/50 px-3 py-1.5 rounded-lg border border-slate-800/50">
        <div className="flex items-center gap-1.5 text-xs text-slate-400"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]"></div> Receita</div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400"><div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_#ef4444]"></div> Despesa</div>
      </div>
    </div>
    <div className="flex-1 min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={financeData} barSize={20} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `K ${value/1000}`} dx={-10} />
          <RechartsTooltip 
            cursor={{fill: '#334155', opacity: 0.1}} 
            contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#334155', color: '#f8fafc', borderRadius: '12px', backdropFilter: 'blur(8px)' }}
          />
          <Bar dataKey="receita" fill="#10b981" radius={[4, 4, 0, 0]} animationDuration={1500} />
          <Bar dataKey="despesa" fill="#ef4444" radius={[4, 4, 0, 0]} animationDuration={1500} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const SanityWidget = () => (
  <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-6 rounded-xl border border-slate-800/60 shadow-xl shadow-black/20 h-96 flex flex-col">
    <div className="flex justify-between items-center mb-4">
      <h3 className="font-bold text-slate-200 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-amber-500" />
        Alertas Sanitários
      </h3>
      <span className="text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-full animate-pulse">3 Pendentes</span>
    </div>
    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
      <div className="space-y-2">
        {[
          { title: 'Vacinação Aftosa - Lote B', date: 'Hoje', status: 'Urgente', type: 'alert' },
          { title: 'Queda de peso - Animal #9032', date: 'Ontem', status: 'Investigar', type: 'warning' },
          { title: 'Protocolo IATF - Matriz #102', date: 'Amanhã', status: 'Agendado', type: 'info' },
          { title: 'Vermifugação - Bezerros', date: '15/10', status: 'Planejado', type: 'info' },
          { title: 'Exame Brucelose', date: '20/10', status: 'Pendente', type: 'warning' },
        ].map((item, i) => (
          <div key={i} className="p-3 flex items-center justify-between hover:bg-slate-800/40 transition-colors rounded-xl border border-transparent hover:border-slate-700/50 group cursor-pointer">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 shadow-[0_0_8px] transition-all ${
                item.type === 'alert' ? 'bg-red-500 shadow-red-500/50' : item.type === 'warning' ? 'bg-amber-500 shadow-amber-500/50' : 'bg-blue-500 shadow-blue-500/50'
              }`} />
              <div>
                <p className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors line-clamp-1">{item.title}</p>
                <p className="text-xs text-slate-500">{item.date}</p>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
              item.type === 'alert' ? 'bg-red-900/20 text-red-400 border-red-900/30' : 
              item.type === 'warning' ? 'bg-amber-900/20 text-amber-400 border-amber-900/30' : 'bg-blue-900/20 text-blue-400 border-blue-900/30'
            }`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ReproductionWidget = () => (
  <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-6 rounded-xl border border-slate-800/60 shadow-xl shadow-black/20 h-96 flex flex-col">
    <div className="flex justify-between items-center mb-4">
      <h3 className="font-bold text-slate-200 flex items-center gap-2">
        <Activity className="w-5 h-5 text-pink-500" />
        Status Reprodutivo
      </h3>
    </div>
    <div className="flex-1 min-h-0 flex items-center justify-center relative">
      {/* Center Stats */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-3xl font-bold text-white">980</span>
        <span className="text-xs text-slate-500">Matrizes</span>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={reproductionData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={90}
            paddingAngle={4}
            dataKey="value"
            stroke="none"
            startAngle={90}
            endAngle={-270}
            animationDuration={2000}
          >
            {reproductionData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} className="stroke-slate-900 stroke-2" />
            ))}
          </Pie>
          <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#334155', color: '#f8fafc', borderRadius: '12px', backdropFilter: 'blur(8px)' }} />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle" 
            wrapperStyle={{ color: '#94a3b8', paddingTop: '20px' }} 
            formatter={(value) => <span className="text-slate-400 text-xs font-medium ml-1">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const MilkWidget = () => (
  <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-6 rounded-xl border border-slate-800/60 shadow-xl shadow-black/20 h-96 flex flex-col">
    <div className="flex justify-between items-center mb-4">
      <h3 className="font-bold text-slate-200 flex items-center gap-2">
        <Milk className="w-5 h-5 text-sky-500" />
        Produção de Leite (L/Dia)
      </h3>
    </div>
    <div className="flex-1 min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={milkData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} domain={['dataMin - 100', 'dataMax + 100']} dx={-10} />
          <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#334155', color: '#f8fafc', borderRadius: '12px', backdropFilter: 'blur(8px)' }} />
          <Line 
            type="monotone" 
            dataKey="volume" 
            stroke="#0ea5e9" 
            strokeWidth={3} 
            dot={{fill: '#0f172a', stroke: '#0ea5e9', strokeWidth: 2, r: 4}} 
            activeDot={{r: 6, fill: '#0ea5e9', stroke: '#fff', strokeWidth: 0}}
            animationDuration={2000}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

// Widget Config Map
const WIDGETS: Record<WidgetId, WidgetDef> = {
  kpi: { id: 'kpi', title: 'Indicadores KPI', description: 'Cartões de resumo geral', component: KPIWidget, colSpan: 'full' },
  weight: { id: 'weight', title: 'Ganho de Peso', description: 'Gráfico de evolução de peso', component: WeightWidget, colSpan: 'half' },
  finance: { id: 'finance', title: 'Financeiro', description: 'Receitas e despesas', component: FinanceWidget, colSpan: 'half' },
  sanity: { id: 'sanity', title: 'Sanidade', description: 'Lista de alertas e vacinas', component: SanityWidget, colSpan: 'half' },
  reproduction: { id: 'reproduction', title: 'Reprodução', description: 'Gráfico de status do rebanho', component: ReproductionWidget, colSpan: 'half' },
  milk: { id: 'milk', title: 'Produção de Leite', description: 'Volume diário ordenhado', component: MilkWidget, colSpan: 'half' },
};

// --- Main Dashboard Component ---

export const Dashboard: React.FC = () => {
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const { addToast } = useToast();
  
  // Load saved preference or default
  const [visibleWidgets, setVisibleWidgets] = useState<WidgetId[]>(() => {
    const saved = localStorage.getItem('dashboard_widgets');
    return saved ? JSON.parse(saved) : ['kpi', 'weight', 'finance', 'sanity', 'reproduction'];
  });

  // Save preferences
  useEffect(() => {
    localStorage.setItem('dashboard_widgets', JSON.stringify(visibleWidgets));
  }, [visibleWidgets]);

  // Simulate initial loading for Skeleton effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const toggleWidget = (id: WidgetId) => {
    setVisibleWidgets(prev => 
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (visibleWidgets.length === Object.keys(WIDGETS).length) {
      setVisibleWidgets(['kpi']); // Keep at least one
    } else {
      setVisibleWidgets(Object.keys(WIDGETS) as WidgetId[]);
    }
  };

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    addToast('info', 'Gerando PDF', 'Aguarde enquanto o relatório é criado...');
    const file = await generatePDF('dashboard-content', 'BovMonitor-Relatorio-Dashboard');
    if (file) {
      downloadPDF(file);
      addToast('success', 'Download Iniciado', 'O PDF foi gerado com sucesso.');
    } else {
      addToast('error', 'Erro', 'Não foi possível gerar o PDF.');
    }
    setIsExporting(false);
  };

  const handleShare = async () => {
    setIsExporting(true);
    addToast('info', 'Preparando Compartilhamento', 'Gerando imagem do relatório...');
    const file = await generatePDF('dashboard-content', 'BovMonitor-Dashboard');
    if (file) {
      const shared = await sharePDF(file, 'Relatório BovMonitor', 'Confira o status atual da fazenda.');
      if (!shared) {
        addToast('info', 'Download Realizado', 'Compartilhamento direto não suportado. Arquivo baixado.');
      }
    } else {
      addToast('error', 'Erro', 'Não foi possível gerar o relatório.');
    }
    setIsExporting(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
          <h2 className="text-3xl font-bold text-white tracking-tight">Dashboard</h2>
          <p className="text-slate-400 mt-1">Visão estratégica da propriedade.</p>
        </div>
        
        <div className="flex gap-2">
          {/* Report Buttons */}
          <button 
             onClick={handleShare}
             disabled={isExporting}
             className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
             title="Compartilhar Relatório"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
          </button>
          <button 
             onClick={handleDownloadPDF}
             disabled={isExporting}
             className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
             title="Baixar PDF"
          >
            <Download className="w-4 h-4" />
          </button>

          <button 
            onClick={() => setIsCustomizing(!isCustomizing)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 font-medium text-sm border ${
              isCustomizing 
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/30 border-transparent' 
                : 'bg-slate-900/50 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-600'
            }`}
          >
            {isCustomizing ? <Check className="w-4 h-4" /> : <Layout className="w-4 h-4" />}
            <span>{isCustomizing ? 'Concluir Edição' : 'Personalizar'}</span>
          </button>
        </div>
      </div>

      {/* Customization Panel */}
      {isCustomizing && (
        <div className="bg-slate-900/95 backdrop-blur-xl text-slate-200 p-6 rounded-2xl border border-slate-700/50 shadow-2xl animate-in slide-in-from-top-4 duration-300 ring-1 ring-emerald-500/20">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold flex items-center gap-2 text-white">
              <div className="p-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <Settings className="w-4 h-4 text-emerald-400" />
              </div>
              Gerenciar Widgets
            </h3>
            <button onClick={toggleAll} className="text-xs text-emerald-400 hover:text-emerald-300 underline decoration-emerald-500/30 underline-offset-4">
              {visibleWidgets.length === Object.keys(WIDGETS).length ? 'Desmarcar todos' : 'Selecionar todos'}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {(Object.values(WIDGETS) as WidgetDef[]).map((widget) => (
              <button
                key={widget.id}
                onClick={() => toggleWidget(widget.id)}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 group ${
                  visibleWidgets.includes(widget.id)
                    ? 'bg-emerald-900/10 border-emerald-500/40 text-white shadow-[0_0_15px_rgba(16,185,129,0.05)]'
                    : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                <div className="text-left">
                  <span className="block font-bold text-sm group-hover:text-emerald-200 transition-colors">{widget.title}</span>
                  <span className="block text-[11px] opacity-60 mt-1">{widget.description}</span>
                </div>
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-300 ${
                  visibleWidgets.includes(widget.id) ? 'bg-emerald-500 border-emerald-500 scale-100' : 'border-slate-600 bg-slate-800/50 scale-90'
                }`}>
                  {visibleWidgets.includes(widget.id) && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Widget Grid Container for Capture */}
      <div id="dashboard-content" className="p-2 -m-2"> 
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Full Width Widgets (KPI) */}
          {visibleWidgets.includes('kpi') && (
            <div className="lg:col-span-2">
              {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                  </div>
              ) : (
                  <div className="animate-in fade-in zoom-in-95 duration-500">
                    <WIDGETS.kpi.component />
                  </div>
              )}
            </div>
          )}

          {/* Half Width Widgets (Charts) */}
          {visibleWidgets.filter(id => id !== 'kpi').map((id) => {
            const Widget = WIDGETS[id].component;
            return (
              <div key={id}>
                {isLoading ? (
                  <WidgetSkeleton />
                ) : (
                  <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards">
                    <Widget />
                  </div>
                )}
              </div>
            );
          })}
          
          {!isLoading && visibleWidgets.length === 0 && (
            <div className="lg:col-span-2 py-20 text-center border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
              <div className="text-slate-600 mb-4 flex justify-center">
                <div className="p-4 bg-slate-900 rounded-full border border-slate-800">
                    <Layout className="w-10 h-10 opacity-50" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-300">Seu dashboard está vazio</h3>
              <p className="text-slate-500 font-medium mt-1 mb-6">Selecione widgets para visualizar seus dados.</p>
              <button 
                onClick={() => setIsCustomizing(true)}
                className="text-emerald-400 text-sm font-bold hover:text-emerald-300 hover:underline underline-offset-4 decoration-emerald-500/30"
              >
                Personalizar Agora
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};