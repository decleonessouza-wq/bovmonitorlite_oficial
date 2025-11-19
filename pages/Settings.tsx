import React, { useState } from 'react';
import { Save, User, MapPin, Bell, Smartphone, Users, Shield, Trash2 } from 'lucide-react';

export const Settings: React.FC = () => {
  const [farmName, setFarmName] = useState('Fazenda Boa Esperança');
  const [owner, setOwner] = useState('João Silva');
  
  const [users, setUsers] = useState([
    { id: 1, name: 'Maria Souza', role: 'Gerente', email: 'gerente@bov.com' },
    { id: 2, name: 'Pedro Santos', role: 'Colaborador', email: 'peao@bov.com' },
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight">Configurações</h2>
        <p className="text-slate-400">Gerencie seus dados, equipe e preferências.</p>
      </div>

      {/* Profile Section */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex items-center gap-3">
          <User className="w-5 h-5 text-emerald-500" />
          <h3 className="font-bold text-white">Perfil e Propriedade</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Nome do Proprietário</label>
            <input 
              type="text" 
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Nome da Fazenda</label>
            <input 
              type="text" 
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none transition-colors"
            />
          </div>
           <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-slate-400">Endereço / Localização</label>
            <div className="flex gap-2">
              <div className="bg-slate-800 p-2.5 rounded-lg text-slate-400">
                <MapPin className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                defaultValue="Rodovia BR-153, Km 45, Zona Rural"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Team Management Section - Restricted to Owner implicitly by Route but good to style distinctively */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
         <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
           <div className="flex items-center gap-3">
             <Users className="w-5 h-5 text-blue-500" />
             <h3 className="font-bold text-white">Gestão de Equipe</h3>
           </div>
           <button className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition-colors">
             + Adicionar Usuário
           </button>
         </div>
         <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-800">
                    <th className="pb-3 font-medium">Nome</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Função</th>
                    <th className="pb-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {users.map(u => (
                    <tr key={u.id} className="group">
                      <td className="py-4 text-white font-medium">{u.name}</td>
                      <td className="py-4 text-slate-400">{u.email}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                          u.role === 'Gerente' ? 'bg-blue-900/30 text-blue-400 border border-blue-900/50' : 'bg-amber-900/30 text-amber-400 border border-amber-900/50'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <button className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-900/10 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
         </div>
      </div>

      {/* Preferences Section */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex items-center gap-3">
          <Smartphone className="w-5 h-5 text-emerald-500" />
          <h3 className="font-bold text-white">Preferências do App</h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-800 rounded-lg text-slate-400"><Bell className="w-5 h-5" /></div>
              <div>
                <p className="text-white font-medium">Notificações Push</p>
                <p className="text-xs text-slate-500">Receba alertas de vacinas e manejo.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
         <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-1">
           <Save className="w-5 h-5" />
           Salvar Alterações
         </button>
      </div>
    </div>
  );
};