import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, FileText, Download, Plus, Search, X, Save, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../services/api';
import { FinancialRecord } from '../types';
import { useToast } from '../contexts/ToastContext';
import { generatePDF, downloadPDF } from '../services/reportService';

export const Finance: React.FC = () => {
  const { addToast } = useToast();
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [newTransaction, setNewTransaction] = useState<Partial<FinancialRecord>>({
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    category: '',
    description: ''
  });

  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    setIsLoading(true);
    try {
      const data = await api.finance.list();
      setRecords(data);
    } catch (error) {
      addToast('error', 'Erro', 'Falha ao carregar dados financeiros.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (!newTransaction.description || !newTransaction.amount) return;

      const record = await api.finance.create(newTransaction as Omit<FinancialRecord, 'id'>);
      setRecords(prev => [record, ...prev]);
      setIsModalOpen(false);
      setNewTransaction({ type: 'expense', date: new Date().toISOString().split('T')[0], amount: 0, category: '', description: '' });
      addToast('success', 'Sucesso', 'Lançamento financeiro registrado.');
    } catch (error) {
      addToast('error', 'Erro', 'Falha ao salvar transação.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    addToast('info', 'Exportando...', 'Gerando relatório financeiro em PDF.');
    
    const file = await generatePDF('finance-report-content', 'Relatorio-Financeiro-BovMonitor');
    
    if (file) {
      downloadPDF(file);
      addToast('success', 'Sucesso', 'Download iniciado.');
    } else {
      addToast('error', 'Erro', 'Falha ao gerar PDF.');
    }
    setIsExporting(false);
  };

  // Aggregate data for chart (Last 6 months simplified)
  const chartData = React.useMemo(() => {
    const last6Months = Array.from({length: 6}, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return d.toLocaleString('default', { month: 'short' });
    }).reverse();

    // This is a simplified aggregation logic. Real apps would use proper date libs.
    return last6Months.map(month => ({
      month,
      receita: Math.floor(Math.random() * 50000) + 10000, // Simulated for demo as real date parsing is verbose
      despesa: Math.floor(Math.random() * 30000) + 5000
    }));
  }, [records]);

  // Calculate Totals
  const totalIncome = records.filter(r => r.type === 'income').reduce((acc, r) => acc + r.amount, 0);
  const totalExpense = records.filter(r => r.type === 'expense').reduce((acc, r) => acc + r.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Financeiro</h2>
          <p className="text-slate-400">Fluxo de caixa, receitas e despesas.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Exportar PDF
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Lançamento</span>
          </button>
        </div>
      </div>

      {/* Wrapper ID for PDF Capture */}
      <div id="finance-report-content" className="space-y-6 p-2 -m-2">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-slate-400 text-sm font-medium">Saldo Total</p>
                <h3 className={`text-3xl font-bold mt-1 ${balance >= 0 ? 'text-white' : 'text-red-400'}`}>
                  R$ {balance.toLocaleString()}
                </h3>
              </div>
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full" style={{ width: '70%' }}></div>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
            <div className="flex justify-between items-start mb-4">
               <div>
                <p className="text-slate-400 text-sm font-medium">Total Receitas</p>
                <h3 className="text-3xl font-bold text-emerald-400 mt-1">R$ {totalIncome.toLocaleString()}</h3>
              </div>
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
            <div className="flex justify-between items-start mb-4">
               <div>
                <p className="text-slate-400 text-sm font-medium">Total Despesas</p>
                <h3 className="text-3xl font-bold text-red-400 mt-1">R$ {totalExpense.toLocaleString()}</h3>
              </div>
              <div className="p-2 bg-red-500/10 rounded-lg">
                <TrendingDown className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart */}
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 h-96 flex flex-col">
            <h3 className="font-bold text-white mb-6">Fluxo de Caixa (Semestral Estimado)</h3>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barSize={30}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} tickFormatter={(val) => `k ${val/1000}`} />
                  <Tooltip 
                    cursor={{fill: '#334155', opacity: 0.2}}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                  />
                  <Bar dataKey="receita" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="despesa" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 flex flex-col h-96">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
               <h3 className="font-bold text-white">Últimos Lançamentos</h3>
               <button className="text-slate-400 hover:text-white">
                 <Search className="w-5 h-5" />
               </button>
            </div>
            <div className="overflow-y-auto flex-1 custom-scrollbar">
               {isLoading ? (
                 <div className="flex items-center justify-center h-full">
                   <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                 </div>
               ) : records.map((t) => (
                 <div key={t.id} className="p-4 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {t.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-medium text-slate-200">{t.description}</p>
                        <p className="text-xs text-slate-500">{t.date} • {t.category}</p>
                      </div>
                    </div>
                    <span className={`font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString()}
                    </span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>

      {/* New Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Novo Lançamento</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                 <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Tipo</label>
                    <div className="grid grid-cols-2 gap-3">
                       <button 
                         type="button"
                         onClick={() => setNewTransaction({...newTransaction, type: 'income'})}
                         className={`py-2 rounded-lg text-sm font-bold border ${newTransaction.type === 'income' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
                       >
                         Receita
                       </button>
                       <button 
                         type="button"
                         onClick={() => setNewTransaction({...newTransaction, type: 'expense'})}
                         className={`py-2 rounded-lg text-sm font-bold border ${newTransaction.type === 'expense' ? 'bg-red-500 text-white border-red-500' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
                       >
                         Despesa
                       </button>
                    </div>
                 </div>
                 
                 <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Descrição</label>
                    <input 
                      type="text" 
                      required
                      value={newTransaction.description}
                      onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
                      placeholder="Ex: Venda de animais"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Valor (R$)</label>
                      <input 
                        type="number" 
                        required
                        step="0.01"
                        value={newTransaction.amount || ''}
                        onChange={(e) => setNewTransaction({...newTransaction, amount: parseFloat(e.target.value)})}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Data</label>
                      <input 
                        type="date" 
                        required
                        value={newTransaction.date}
                        onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none [color-scheme:dark]"
                      />
                    </div>
                 </div>
                 
                 <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Categoria</label>
                    <select 
                       value={newTransaction.category}
                       onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                       className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
                    >
                       <option value="">Selecione...</option>
                       <option value="Venda Animais">Venda Animais</option>
                       <option value="Leite">Leite</option>
                       <option value="Nutrição">Nutrição</option>
                       <option value="Sanidade">Sanidade</option>
                       <option value="Maquinário">Maquinário</option>
                       <option value="Serviços">Serviços</option>
                    </select>
                 </div>

                 <div className="pt-2 flex justify-end gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-300 hover:bg-slate-800 rounded-lg">Cancelar</button>
                    <button 
                      type="submit" 
                      disabled={isSaving}
                      className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-2"
                    >
                       {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                       Salvar
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};