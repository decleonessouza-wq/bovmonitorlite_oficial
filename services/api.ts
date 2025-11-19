import { Animal, HealthRecord, FinancialRecord, Pasture, AnimalStatus, Breed, Sex, AnimalHistoryRecord } from '../types';

// Simula latência de rede (delay) para parecer uma API real
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Chaves do LocalStorage
const KEYS = {
  ANIMALS: 'animals_db',
  HEALTH: 'health_records',
  FINANCE: 'finance_records',
  PASTURE: 'pasture_records'
};

// --- MOCK DATA SEEDS ---

const MOCK_ANIMALS: Animal[] = [
  { 
    id: '1', 
    name: 'Mimoso', 
    rfid: 'RFID-001', 
    breed: Breed.NELORE, 
    sex: Sex.MALE, 
    birthDate: '2023-01-15', 
    weightKg: 450, 
    status: AnimalStatus.HEALTHY, 
    lotId: 'Lote A', 
    pastureId: 'Pasto 1', 
    sire: 'Touro Bandido', 
    dam: 'Matriz 04',
    history: [
      { id: 'h1', date: '2023-01-15', type: 'GENERAL', description: 'Nascimento cadastrado', value: '35kg' },
      { id: 'h2', date: '2023-06-15', type: 'WEIGHT', description: 'Pesagem Desmama', value: 180, previousValue: 35 },
      { id: 'h3', date: '2023-10-15', type: 'LOCATION', description: 'Movido para Pasto 1', value: 'Pasto 1', previousValue: 'Maternidade' },
      { id: 'h4', date: '2024-01-15', type: 'WEIGHT', description: 'Pesagem de Controle', value: 450, previousValue: 180 }
    ]
  },
  { 
    id: '2', 
    name: 'Estrela', 
    rfid: 'RFID-002', 
    breed: Breed.GIROLANDO, 
    sex: Sex.FEMALE, 
    birthDate: '2022-05-20', 
    weightKg: 380, 
    status: AnimalStatus.PREGNANT, 
    lotId: 'Lote B', 
    pastureId: 'Pasto 2', 
    sire: 'Sansão', 
    dam: 'Estrelinha',
    history: [
       { id: 'h1', date: '2023-11-20', type: 'STATUS', description: 'Diagnóstico de Prenhez Confirmado', value: 'Prenhe', previousValue: 'Saudável' }
    ]
  },
  { 
    id: '3', 
    name: 'Bruto', 
    rfid: 'RFID-003', 
    breed: Breed.ANGUS, 
    sex: Sex.MALE, 
    birthDate: '2023-03-10', 
    weightKg: 410, 
    status: AnimalStatus.SICK, 
    lotId: 'Lote A', 
    pastureId: 'Enfermaria',
    history: [
      { id: 'h1', date: '2023-10-25', type: 'STATUS', description: 'Identificado com Tristeza Parasitária', value: 'Doente', previousValue: 'Saudável' },
      { id: 'h2', date: '2023-10-25', type: 'LOCATION', description: 'Movido para Enfermaria', value: 'Enfermaria', previousValue: 'Pasto 3' }
    ]
  },
];

const MOCK_FINANCE: FinancialRecord[] = [
  { id: '1', description: 'Venda de Bezerras (Lote C)', type: 'income', amount: 45000, date: '2023-10-25', category: 'Venda Animais' },
  { id: '2', description: 'Compra de Suplemento Mineral', type: 'expense', amount: 3200, date: '2023-10-24', category: 'Nutrição' },
  { id: '3', description: 'Manutenção Trator', type: 'expense', amount: 1500, date: '2023-10-22', category: 'Maquinário' },
  { id: '4', description: 'Pagamento Veterinário', type: 'expense', amount: 2800, date: '2023-10-20', category: 'Serviços' },
  { id: '5', description: 'Venda de Leite (Semana 41)', type: 'income', amount: 8400, date: '2023-10-18', category: 'Leite' },
];

const MOCK_PASTURES: Pasture[] = [
  { id: '1', name: 'Pasto Sede A', area: '12 ha', capacity: 25, current: 20, grassHeight: 'Alto', status: 'Ocupado', type: 'Mombaça', lastRotation: '10 dias' },
  { id: '2', name: 'Pasto Sede B', area: '10 ha', capacity: 20, current: 0, grassHeight: 'Alto', status: 'Descanso', type: 'Braquiária', lastRotation: '25 dias' },
  { id: '3', name: 'Piquete Leite 1', area: '5 ha', capacity: 15, current: 12, grassHeight: 'Médio', status: 'Ocupado', type: 'Tifton', lastRotation: '5 dias' },
  { id: '4', name: 'Piquete Leite 2', area: '5 ha', capacity: 15, current: 0, grassHeight: 'Baixo', status: 'Recuperação', type: 'Tifton', lastRotation: '2 dias' },
  { id: '5', name: 'Confinamento 1', area: '2 ha', capacity: 100, current: 85, grassHeight: 'N/A', status: 'Intensivo', type: 'Ração', lastRotation: '-' },
];

// --- GENERIC CRUD HELPERS ---

const getStored = <T>(key: string, initial: T[]): T[] => {
  const saved = localStorage.getItem(key);
  if (saved) return JSON.parse(saved);
  localStorage.setItem(key, JSON.stringify(initial)); // Init if empty
  return initial;
};

const setStored = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// --- API SERVICE OBJECT ---

export const api = {
  animals: {
    list: async (): Promise<Animal[]> => {
      await delay(600);
      return getStored<Animal>(KEYS.ANIMALS, MOCK_ANIMALS);
    },
    create: async (animal: Animal): Promise<Animal> => {
      await delay(800);
      const current = getStored<Animal>(KEYS.ANIMALS, MOCK_ANIMALS);
      const newAnimal: Animal = { 
        ...animal, 
        id: Date.now().toString(),
        history: [{
          id: Date.now().toString(),
          date: new Date().toISOString().split('T')[0],
          type: 'GENERAL',
          description: 'Animal cadastrado no sistema',
          value: 'Inicial'
        }]
      };
      setStored(KEYS.ANIMALS, [newAnimal, ...current]);
      return newAnimal;
    },
    update: async (id: string, data: Partial<Animal>): Promise<Animal> => {
        await delay(500);
        const current = getStored<Animal>(KEYS.ANIMALS, MOCK_ANIMALS);
        const index = current.findIndex(a => a.id === id);
        if (index === -1) throw new Error("Animal not found");
        
        const oldAnimal = current[index];
        const updatedAnimal = { ...oldAnimal, ...data };
        
        // Auto-generate history
        const history: AnimalHistoryRecord[] = updatedAnimal.history || [];
        const today = new Date().toISOString().split('T')[0];

        if (data.weightKg && data.weightKg !== oldAnimal.weightKg) {
          history.unshift({
            id: Date.now().toString() + 'w',
            date: today,
            type: 'WEIGHT',
            description: 'Pesagem realizada',
            value: data.weightKg,
            previousValue: oldAnimal.weightKg
          });
        }

        if (data.status && data.status !== oldAnimal.status) {
          history.unshift({
            id: Date.now().toString() + 's',
            date: today,
            type: 'STATUS',
            description: `Status alterado para ${data.status}`,
            value: data.status,
            previousValue: oldAnimal.status
          });
        }

        if (data.lotId && data.lotId !== oldAnimal.lotId) {
           history.unshift({
            id: Date.now().toString() + 'l',
            date: today,
            type: 'LOCATION',
            description: `Movido para ${data.lotId}`,
            value: data.lotId,
            previousValue: oldAnimal.lotId
          }); 
        }

        updatedAnimal.history = history;
        current[index] = updatedAnimal;
        setStored(KEYS.ANIMALS, current);
        return updatedAnimal;
    },
    delete: async (id: string): Promise<void> => {
        await delay(500);
        const current = getStored<Animal>(KEYS.ANIMALS, MOCK_ANIMALS);
        const filtered = current.filter(a => a.id !== id);
        setStored(KEYS.ANIMALS, filtered);
    }
  },

  health: {
    list: async (): Promise<HealthRecord[]> => {
      await delay(600);
      return getStored<HealthRecord>(KEYS.HEALTH, []);
    },
    create: async (record: HealthRecord): Promise<HealthRecord> => {
      await delay(600);
      const current = getStored<HealthRecord>(KEYS.HEALTH, []);
      const newRecord = { ...record, id: Date.now().toString() };
      setStored(KEYS.HEALTH, [newRecord, ...current]);
      return newRecord;
    },
    updateStatus: async (id: string, status: 'Scheduled' | 'Completed'): Promise<void> => {
       await delay(400);
       const current = getStored<HealthRecord>(KEYS.HEALTH, []);
       const updated = current.map(r => r.id === id ? { ...r, status } : r);
       setStored(KEYS.HEALTH, updated);
    }
  },

  finance: {
    list: async (): Promise<FinancialRecord[]> => {
      await delay(600);
      return getStored<FinancialRecord>(KEYS.FINANCE, MOCK_FINANCE);
    },
    create: async (record: Omit<FinancialRecord, 'id'>): Promise<FinancialRecord> => {
      await delay(600);
      const current = getStored<FinancialRecord>(KEYS.FINANCE, MOCK_FINANCE);
      const newRecord = { ...record, id: Date.now().toString() };
      setStored(KEYS.FINANCE, [newRecord, ...current]);
      return newRecord;
    }
  },

  pasture: {
    list: async (): Promise<Pasture[]> => {
        await delay(500);
        return getStored<Pasture>(KEYS.PASTURE, MOCK_PASTURES);
    },
    update: async (id: string, data: Partial<Pasture>): Promise<Pasture> => {
        await delay(400);
        const current = getStored<Pasture>(KEYS.PASTURE, MOCK_PASTURES);
        const index = current.findIndex(p => p.id === id);
        if (index === -1) throw new Error("Pasture not found");
        const updated = { ...current[index], ...data };
        current[index] = updated;
        setStored(KEYS.PASTURE, current);
        return updated;
    }
  }
};