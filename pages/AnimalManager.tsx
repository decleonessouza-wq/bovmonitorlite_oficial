import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Filter, MoreHorizontal, Tag, X, Save, ChevronDown, ChevronUp, Ruler, Calendar, MapPin, Loader2, Trash2, RefreshCw, Dna, Camera, Sparkles, Upload, Clock, TrendingUp, TrendingDown, Activity, AlertCircle, ArrowRight } from 'lucide-react';
import { Animal, AnimalStatus, Breed, Sex, AnimalHistoryRecord } from '../types';
import { api } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { analyzeAnimalImage } from '../services/geminiService';

// Componente auxiliar para seções colapsáveis
const FormSection: React.FC<{ 
  title: string; 
  icon: React.ElementType; 
  children: React.ReactNode; 
  defaultOpen?: boolean 
}> = ({ title, icon: Icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-slate-700 rounded-xl bg-slate-950/30 overflow-hidden mb-4 transition-all duration-300">
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-4 text-left transition-colors ${
          isOpen ? 'bg-slate-800/50 text-emerald-400' : 'bg-slate-900/50 text-slate-300 hover:bg-slate-800/50'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isOpen ? 'bg-emerald-500/20' : 'bg-slate-800'}`}>
            <Icon className={`w-4 h-4 ${isOpen ? 'text-emerald-500' : 'text-slate-400'}`} />
          </div>
          <span className="font-semibold text-sm tracking-wide">{title}</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-emerald-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
      </button>
      
      {isOpen && (
        <div className="p-5 border-t border-slate-800/50 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
};

export const AnimalManager: React.FC = () => {
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedBreed, setSelectedBreed] = useState<string>('');
  
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedAnimalForHistory, setSelectedAnimalForHistory] = useState<Animal | null>(null);
  
  // AI Vision State
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAnimals();
  }, []);

  const loadAnimals = async () => {
    setIsLoading(true);
    try {
      const data = await api.animals.list();
      setAnimals(data);
    } catch (error) {
      console.error("Erro ao carregar animais", error);
      addToast('error', 'Erro de Conexão', 'Não foi possível carregar o rebanho.');
    } finally {
      setIsLoading(false);
    }
  };

  const [newAnimal, setNewAnimal] = useState<Partial<Animal>>({
    breed: Breed.NELORE,
    sex: Sex.MALE,
    status: AnimalStatus.HEALTHY,
    weightKg: 0
  });

  // Vision Handler
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzingImage(true);
    addToast('info', 'Processando Imagem', 'A IA está analisando a raça e condição corporal...');

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        const analysis = await analyzeAnimalImage(base64String);
        
        // Tenta encontrar a raça correspondente no Enum
        let matchedBreed = newAnimal.breed;
        if (analysis.breed) {
            const normalizedAnalysis = analysis.breed.toLowerCase();
            const foundBreed = Object.values(Breed).find(b => 
                normalizedAnalysis.includes(b.toLowerCase()) || 
                b.toLowerCase().includes(normalizedAnalysis)
            );
            if (foundBreed) matchedBreed = foundBreed;
        }

        setNewAnimal(prev => ({
          ...prev,
          weightKg: analysis.estimatedWeight || prev.weightKg,
          breed: matchedBreed,
        }));

        addToast('success', 'Análise Concluída', `Identificado: ${matchedBreed} (~${analysis.estimatedWeight}kg). ECC: ${analysis.bodyConditionScore}`);
        setIsAnalyzingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      addToast('error', 'Erro na Análise', 'Não foi possível processar a imagem.');
      setIsAnalyzingImage(false);
    }
  };

  const filteredAnimals = animals.filter(a => {
    const matchesText = 
      (a.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) || 
      (a.rfid?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      a.id.includes(searchTerm);
    const matchesStatus = selectedStatus ? a.status === selectedStatus : true;
    const matchesBreed = selectedBreed ? a.breed === selectedBreed : true;
    return matchesText && matchesStatus && matchesBreed;
  });

  const getStatusColor = (status: AnimalStatus) => {
    switch (status) {
      case AnimalStatus.HEALTHY: return 'bg-emerald-900/30 text-emerald-400 border-emerald-900/50';
      case AnimalStatus.SICK: return 'bg-red-900/30 text-red-400 border-red-900/50';
      case AnimalStatus.PREGNANT: return 'bg-purple-900/30 text-purple-400 border-purple-900/50';
      case AnimalStatus.SOLD: return 'bg-slate-800 text-slate-400 border-slate-700';
      case AnimalStatus.QUARANTINE: return 'bg-amber-900/30 text-amber-400 border-amber-900/50';
      default: return 'bg-slate-800 text-slate-400';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewAnimal(prev => ({
      ...prev,
      [name]: name === 'weightKg' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const animalPayload: Animal = {
      id: '',
      name: newAnimal.name || 'Sem Nome',
      rfid: newAnimal.rfid || '',
      breed: newAnimal.breed as Breed,
      sex: newAnimal.sex as Sex,
      birthDate: newAnimal.birthDate || new Date().toISOString().split('T')[0],
      weightKg: newAnimal.weightKg || 0,
      status: newAnimal.status as AnimalStatus,
      lotId: newAnimal.lotId || 'Geral',
      pastureId: newAnimal.pastureId || 'Sede',
      sire: newAnimal.sire,
      dam: newAnimal.dam
    };

    try {
      const createdAnimal = await api.animals.create(animalPayload);
      setAnimals(prev => [createdAnimal, ...prev]);
      setIsModalOpen(false);
      setNewAnimal({ 
        breed: Breed.NELORE, sex: Sex.MALE, status: AnimalStatus.HEALTHY, weightKg: 0, 
        name: '', rfid: '', lotId: '', pastureId: '', sire: '', dam: '' 
      });
      addToast('success', 'Animal Cadastrado', 'O animal foi salvo com sucesso.');
    } catch (error) {
      addToast('error', 'Erro ao Salvar', 'Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
     e.stopPropagation();
     if(!window.confirm("Tem certeza que deseja excluir este animal?")) return;

     try {
        await api.animals.delete(id);
        setAnimals(prev => prev.filter(a => a.id !== id));
        addToast('success', 'Excluído', 'Animal removido do rebanho.');
     } catch(err) {
        addToast('error', 'Erro', 'Não foi possível excluir.');
     }
  };

  const handleViewHistory = (animal: Animal, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAnimalForHistory(animal);
    setIsHistoryOpen(true);
  };

  const clearFilters = () => {
    setSelectedStatus('');
    setSelectedBreed('');
  };

  const hasActiveFilters = selectedStatus !== '' || selectedBreed !== '';

  return (
    <div className="space-y-6 relative">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestão do Rebanho</h2>
          <p className="text-slate-400">Gerencie animais individuais, lotes e genealogia.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 border px-4 py-2 rounded-lg transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-slate-800 border-emerald-500/50 text-emerald-400' 
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filtros {hasActiveFilters && <span className="ml-1 w-2 h-2 bg-emerald-500 rounded-full inline-block"></span>}</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Animal</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Panel */}
      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Buscar por nome, brinco ou RFID..." 
            className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm placeholder:text-slate-600 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {showFilters && (
          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-in slide-in-from-top-2 shadow-xl">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-300 focus:border-emerald-500 outline-none"
              >
                <option value="">Todos os Status</option>
                {Object.values(AnimalStatus).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Raça</label>
              <select 
                value={selectedBreed}
                onChange={(e) => setSelectedBreed(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-300 focus:border-emerald-500 outline-none"
              >
                <option value="">Todas as Raças</option>
                {Object.values(Breed).map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
               <button 
                 onClick={clearFilters}
                 disabled={!hasActiveFilters}
                 className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 <RefreshCw className="w-4 h-4" />
                 Limpar Filtros
               </button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-xl shadow-xl border border-slate-800 overflow-hidden min-h-[400px] relative">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 z-10">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-3" />
            <p className="text-slate-400 text-sm animate-pulse">Sincronizando rebanho...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/50 text-slate-400 border-b border-slate-700 font-medium">
                <tr>
                  <th className="px-6 py-4">Identificação</th>
                  <th className="px-6 py-4">Genealogia</th>
                  <th className="px-6 py-4">Peso</th>
                  <th className="px-6 py-4">Localização</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredAnimals.map((animal) => (
                  <tr key={animal.id} className="hover:bg-slate-800/40 transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-800 p-2 rounded-lg group-hover:bg-slate-700 transition-colors">
                          <Tag className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-200">{animal.name || `#${animal.id}`}</p>
                          <p className="text-xs text-slate-500 font-mono">{animal.rfid}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-300 font-medium">{animal.breed}</div>
                      <div className="flex flex-col gap-0.5 mt-1">
                        {animal.sire && (
                          <div className="text-[10px] text-slate-500 flex items-center gap-1" title="Pai">
                             <Dna className="w-3 h-3 text-blue-500/50" /> Pai: {animal.sire}
                          </div>
                        )}
                        {animal.dam && (
                          <div className="text-[10px] text-slate-500 flex items-center gap-1" title="Mãe">
                             <Dna className="w-3 h-3 text-pink-500/50" /> Mãe: {animal.dam}
                          </div>
                        )}
                        {!animal.sire && !animal.dam && (
                           <div className="text-xs text-slate-600">{animal.sex}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-white">{animal.weightKg} kg</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-300">{animal.lotId}</div>
                      <div className="text-xs text-slate-500">{animal.pastureId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(animal.status)}`}>
                        {animal.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                           onClick={(e) => handleViewHistory(animal, e)}
                           className="text-slate-500 hover:text-blue-400 p-2 rounded-full hover:bg-slate-800 transition-colors" 
                           title="Ver Histórico e Detalhes"
                        >
                          <Clock className="w-5 h-5" />
                        </button>
                        <button className="text-slate-500 hover:text-emerald-400 p-2 rounded-full hover:bg-slate-800 transition-colors" title="Editar">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={(e) => handleDelete(animal.id, e)}
                          className="text-slate-500 hover:text-red-400 p-2 rounded-full hover:bg-slate-800 transition-colors" 
                          title="Excluir"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!isLoading && filteredAnimals.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center">
                        <Search className="w-8 h-8 mb-3 opacity-50" />
                        <p className="font-medium text-slate-400">Nenhum animal encontrado.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* HISTORY MODAL */}
      {isHistoryOpen && selectedAnimalForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/95 backdrop-blur sticky top-0 z-10">
              <div className="flex items-center gap-3">
                 <div className="bg-slate-800 p-2 rounded-full">
                   <Activity className="w-5 h-5 text-emerald-500" />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-white">{selectedAnimalForHistory.name}</h3>
                    <p className="text-xs text-slate-400">Histórico Completo e Evolução</p>
                 </div>
              </div>
              <button onClick={() => setIsHistoryOpen(false)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
               {/* Summary Header */}
               <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                     <p className="text-xs text-slate-500 font-bold uppercase mb-1">Peso Atual</p>
                     <p className="text-2xl font-bold text-white">{selectedAnimalForHistory.weightKg} kg</p>
                  </div>
                   <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                     <p className="text-xs text-slate-500 font-bold uppercase mb-1">Status</p>
                     <p className={`text-sm font-bold inline-flex px-2 py-1 rounded-md ${getStatusColor(selectedAnimalForHistory.status)}`}>{selectedAnimalForHistory.status}</p>
                  </div>
               </div>

               <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                 <Clock className="w-4 h-4 text-slate-500" /> Linha do Tempo
               </h4>

               <div className="space-y-0 relative pl-3 ml-3 border-l-2 border-slate-800">
                  {selectedAnimalForHistory.history?.map((log, idx) => (
                    <div key={log.id || idx} className="relative pl-6 pb-8 last:pb-0 group">
                       {/* Dot */}
                       <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-slate-900 transition-all group-hover:scale-110 ${
                         log.type === 'WEIGHT' ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' : 
                         log.type === 'STATUS' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 
                         log.type === 'LOCATION' ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' : 'bg-slate-500'
                       }`}></div>
                       
                       {/* Content */}
                       <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 hover:bg-slate-800 transition-colors">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-bold text-slate-300 bg-slate-900/50 px-1.5 py-0.5 rounded">{log.date}</span>
                            <span className={`text-[10px] font-bold uppercase ${
                              log.type === 'WEIGHT' ? 'text-blue-400' : 
                              log.type === 'STATUS' ? 'text-emerald-400' : 
                              log.type === 'LOCATION' ? 'text-amber-400' : 'text-slate-400'
                            }`}>{log.type === 'WEIGHT' ? 'Pesagem' : log.type === 'STATUS' ? 'Mudança Status' : log.type === 'LOCATION' ? 'Movimentação' : 'Geral'}</span>
                          </div>
                          <p className="text-sm text-slate-200 font-medium">{log.description}</p>
                          
                          {/* Value Diff logic */}
                          {log.value && (
                            <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center gap-2 text-xs">
                               {log.type === 'WEIGHT' && (
                                 <>
                                   <Ruler className="w-3 h-3 text-slate-500" />
                                   <span className="text-white font-bold">{log.value} kg</span>
                                   {log.previousValue && Number(log.value) > Number(log.previousValue) && (
                                     <span className="text-emerald-400 flex items-center gap-0.5"><TrendingUp className="w-3 h-3" /> +{(Number(log.value) - Number(log.previousValue)).toFixed(1)}</span>
                                   )}
                                    {log.previousValue && Number(log.value) < Number(log.previousValue) && (
                                     <span className="text-red-400 flex items-center gap-0.5"><TrendingDown className="w-3 h-3" /> {(Number(log.value) - Number(log.previousValue)).toFixed(1)}</span>
                                   )}
                                 </>
                               )}
                               {log.type === 'STATUS' && (
                                  <>
                                    <AlertCircle className="w-3 h-3 text-slate-500" />
                                    <span className="text-slate-300">{log.previousValue}</span>
                                    <ArrowRight className="w-3 h-3 text-slate-500" />
                                    <span className="text-white font-bold">{log.value}</span>
                                  </>
                               )}
                               {log.type === 'LOCATION' && (
                                  <>
                                    <MapPin className="w-3 h-3 text-slate-500" />
                                    <span className="text-white font-bold">{log.value}</span>
                                  </>
                               )}
                            </div>
                          )}
                       </div>
                    </div>
                  ))}

                  {(!selectedAnimalForHistory.history || selectedAnimalForHistory.history.length === 0) && (
                    <div className="text-center py-8 text-slate-500 italic text-sm">
                       Nenhum histórico registrado para este animal.
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CADASTRO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/95 backdrop-blur sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-bold text-white">Novo Animal</h3>
                <p className="text-sm text-slate-400">Preencha os dados para cadastrar no rebanho.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6">
              
              {/* AI Camera Feature */}
              <div className="mb-6 bg-gradient-to-r from-slate-800 to-slate-900 p-4 rounded-xl border border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
                 {/* Ambient glow */}
                 <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-2xl rounded-full pointer-events-none"></div>
                 
                 <div className="relative z-10">
                    <h4 className="text-white font-bold text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" /> IA Vision
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                      Tire uma foto para que a IA identifique a <strong>Raça</strong> e estime o <strong>Peso</strong> automaticamente.
                    </p>
                 </div>
                 <div className="relative z-10 flex-shrink-0">
                    <input 
                       type="file" 
                       accept="image/*" 
                       className="hidden" 
                       ref={fileInputRef}
                       onChange={handlePhotoUpload}
                    />
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isAnalyzingImage}
                      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded-lg text-xs font-bold shadow-lg shadow-purple-900/20 transition-all border border-purple-400/20"
                    >
                       {isAnalyzingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                       {isAnalyzingImage ? 'Processando...' : 'Usar Câmera / Upload'}
                    </button>
                 </div>
              </div>

              <FormSection title="Identificação Básica" icon={Tag} defaultOpen={true}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nome / Brinco <span className="text-red-500">*</span></label>
                    <input 
                      name="name"
                      required
                      value={newAnimal.name || ''}
                      onChange={handleInputChange}
                      type="text" 
                      placeholder="Ex: Mimoso 01"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">RFID</label>
                    <input 
                      name="rfid"
                      value={newAnimal.rfid || ''}
                      onChange={handleInputChange}
                      type="text" 
                      placeholder="Código do chip"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </FormSection>

              {/* Nova Seção: Genealogia */}
              <FormSection title="Genealogia (Linhagem)" icon={Dna}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Pai (Touro)</label>
                    <input 
                      name="sire"
                      value={newAnimal.sire || ''}
                      onChange={handleInputChange}
                      type="text" 
                      placeholder="Nome do Pai"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Mãe (Matriz)</label>
                    <input 
                      name="dam"
                      value={newAnimal.dam || ''}
                      onChange={handleInputChange}
                      type="text" 
                      placeholder="Nome da Mãe"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </FormSection>

              <FormSection title="Características Físicas" icon={Ruler}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Raça</label>
                    <select 
                      name="breed"
                      value={newAnimal.breed}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none"
                    >
                      {Object.values(Breed).map(breed => (
                        <option key={breed} value={breed}>{breed}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Sexo</label>
                    <select 
                      name="sex"
                      value={newAnimal.sex}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none"
                    >
                       {Object.values(Sex).map(sex => (
                        <option key={sex} value={sex}>{sex}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Peso (kg)</label>
                    <input 
                      name="weightKg"
                      type="number" 
                      required
                      min="0"
                      step="0.1"
                      value={newAnimal.weightKg || ''}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </FormSection>

               <FormSection title="Datas e Situação" icon={Calendar}>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nascimento</label>
                    <input 
                      name="birthDate"
                      type="date" 
                      value={newAnimal.birthDate || ''}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none [color-scheme:dark]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Status</label>
                    <select 
                      name="status"
                      value={newAnimal.status}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none"
                    >
                       {Object.values(AnimalStatus).map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>
               </FormSection>

              <FormSection title="Localização na Fazenda" icon={MapPin}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Lote</label>
                    <input 
                      name="lotId"
                      type="text" 
                      placeholder="Ex: Lote A"
                      value={newAnimal.lotId || ''}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Pasto / Piquete</label>
                    <input 
                      name="pastureId"
                      type="text" 
                      placeholder="Ex: Piquete 4"
                      value={newAnimal.pastureId || ''}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </FormSection>

              <div className="h-4"></div>
            </form>

             <div className="p-6 border-t border-slate-800 bg-slate-900/95 backdrop-blur z-10 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="px-5 py-2.5 text-slate-300 hover:bg-slate-800 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-lg font-medium shadow-lg shadow-emerald-900/20 transition-all transform hover:translate-y-[-1px] disabled:opacity-70 disabled:cursor-wait"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isSaving ? 'Salvando...' : 'Salvar Animal'}
                </button>
              </div>
          </div>
        </div>
      )}
    </div>
  );
};