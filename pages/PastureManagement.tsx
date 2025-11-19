import React, { useState, useEffect } from 'react';
import { Map, Layers, Users, MoreVertical, Droplets, CloudRain, ArrowRight, ArrowLeftRight, X, Save } from 'lucide-react';
import { api } from '../services/api';
import { Pasture } from '../types';
import { useToast } from '../contexts/ToastContext';

export const PastureManagement: React.FC = () => {
  const { addToast } = useToast();
  const [pastures, setPastures] = useState<Pasture[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Rotation State
  const [originId, setOriginId] = useState('');
  const [destId, setDestId] = useState('');
  const [amountToMove, setAmountToMove] = useState(0);

  useEffect(() => {
    loadPastures();
  }, []);

  const loadPastures = async () => {
    const data = await api.pasture.list();
    setPastures(data);
  };

  const handleMove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (originId === destId) {
      addToast('error', 'Erro', 'Origem e destino não podem ser iguais.');
      return;
    }

    const origin = pastures.find(p => p.id === originId);
    const dest = pastures.find(p => p.id === destId);

    if (!origin || !dest) return;
    if (amountToMove > origin.current) {
       addToast('error', 'Erro', 'Quantidade maior que a disponível no pasto de origem.');
       return;
    }

    try {
      await api.pasture.update(originId, { current: origin.current - amountToMove });
      await api.pasture.update(destId, { current: dest.current + amountToMove });
      
      setPastures(prev => prev.map(p => {
         if (p.id === originId) return { ...p, current: p.current - amountToMove };
         if (p.id === destId) return { ...p, current: p.current + amountToMove };
         return p;
      }));

      setIsModalOpen(false);
      addToast('success', 'Sucesso', `Movimentados ${amountToMove} animais.`);
      setOriginId('');
      setDestId('');
      setAmountToMove(0);
    } catch (error) {
      addToast('error', 'Erro', 'Falha ao realizar movimentação.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Manejo e Pastagens</h2>
          <p className="text-slate-400">Controle de lotação, rotação e altura do capim.</p>
        </div>
        <div className="flex gap-3">
           <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-sm">
             <CloudRain className="w-4 h-4 text-blue-400" />
             <span>Previsão: Chuva (15mm)</span>
           </div>
           <button 
             onClick={() => setIsModalOpen(true)}
             className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium"
           >
             <ArrowLeftRight className="w-4 h-4" />
             <span>Mover Lote</span>
           </button>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-1 overflow-hidden h-64 relative group">
         <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/-49.2,-16.7,13,0/800x400?access_token=placeholder')] bg-cover bg-center opacity-40 group-hover:opacity-50 transition-opacity"></div>
         <div className="absolute inset-0 flex items-center justify-center flex-col gap-2">
            <Map className="w-10 h-10 text-slate-500" />
            <p className="text-slate-400 font-medium">Mapa da Propriedade (Satélite)</p>
            <button className="mt-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg text-sm backdrop-blur-sm border border-slate-600 transition-all">
              Abrir Mapa Interativo
            </button>
         </div>
      </div>

      {/* Grid of Pastures */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pastures.map((pasto) => {
          const occupancy = (pasto.current / pasto.capacity) * 100;
          const isFull = occupancy >= 90;
          
          return (
            <div key={pasto.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-emerald-500/30 transition-all shadow-lg shadow-black/20 group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-lg">{pasto.name}</h3>
                    {pasto.status === 'Descanso' && <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded uppercase font-bold">Descanso</span>}
                    {pasto.status === 'Recuperação' && <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded uppercase font-bold">Manutenção</span>}
                  </div>
                  <p className="text-slate-400 text-sm">{pasto.type} • {pasto.area}</p>
                </div>
                <button className="text-slate-500 hover:text-white transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {/* Capacity Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Users className="w-3 h-3" /> Lotação
                  </span>
                  <span className={`${isFull ? 'text-red-400' : 'text-emerald-400'} font-medium`}>
                    {pasto.current} / {pasto.capacity} cab
                  </span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(occupancy, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                  <span className="block text-slate-500 text-xs mb-1">Altura Capim</span>
                  <span className={`font-medium ${pasto.grassHeight === 'Baixo' ? 'text-red-400' : 'text-emerald-400'}`}>
                    {pasto.grassHeight}
                  </span>
                </div>
                <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                  <span className="block text-slate-500 text-xs mb-1">Última Rotação</span>
                  <span className="font-medium text-slate-200">{pasto.lastRotation}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Move Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
               <h3 className="text-lg font-bold text-white">Movimentar Animais</h3>
               <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleMove} className="p-6 space-y-4">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-xs font-bold uppercase text-slate-500">Origem</label>
                     <select 
                       required
                       value={originId}
                       onChange={(e) => setOriginId(e.target.value)}
                       className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                     >
                       <option value="">Selecione...</option>
                       {pastures.filter(p => p.current > 0).map(p => (
                         <option key={p.id} value={p.id}>{p.name} ({p.current})</option>
                       ))}
                     </select>
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold uppercase text-slate-500">Destino</label>
                     <select 
                       required
                       value={destId}
                       onChange={(e) => setDestId(e.target.value)}
                       className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                     >
                       <option value="">Selecione...</option>
                       {pastures.filter(p => p.id !== originId).map(p => (
                         <option key={p.id} value={p.id}>{p.name}</option>
                       ))}
                     </select>
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500">Quantidade</label>
                  <input 
                    type="number" 
                    min="1"
                    max={pastures.find(p => p.id === originId)?.current || 100}
                    value={amountToMove}
                    onChange={(e) => setAmountToMove(parseInt(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  />
               </div>
               <div className="pt-2 flex justify-end">
                  <button type="submit" className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2">
                    <Save className="w-4 h-4" /> Mover
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};