export enum AnimalStatus {
  HEALTHY = 'Saudável',
  SICK = 'Doente',
  PREGNANT = 'Prenhe',
  SOLD = 'Vendido',
  QUARANTINE = 'Quarentena'
}

export enum Breed {
  NELORE = 'Nelore',
  ANGUS = 'Angus',
  BRAHMAN = 'Brahman',
  GIROLANDO = 'Girolando',
  HOLANDES = 'Holandês'
}

export enum Sex {
  MALE = 'Macho',
  FEMALE = 'Fêmea'
}

export interface AnimalHistoryRecord {
  id: string;
  date: string;
  type: 'WEIGHT' | 'STATUS' | 'LOCATION' | 'MEDICAL' | 'GENERAL';
  description: string;
  value?: string | number; // Stores the specific value (e.g., 450 for weight)
  previousValue?: string | number;
}

export interface Animal {
  id: string;
  rfid?: string;
  name?: string;
  breed: Breed;
  sex: Sex;
  birthDate: string;
  weightKg: number;
  status: AnimalStatus;
  lotId: string;
  pastureId: string;
  lastVaccination?: string;
  // Genealogia
  sire?: string; // Pai
  dam?: string; // Mãe
  photoUrl?: string; // Foto do animal
  history?: AnimalHistoryRecord[]; // Timeline of changes
}

export interface HealthRecord {
  id: string;
  animalId: string;
  type: 'Vaccine' | 'Treatment' | 'Exam';
  date: string;
  description: string;
  cost: number;
  status: 'Scheduled' | 'Completed';
}

export interface FinancialRecord {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string; // ISO YYYY-MM-DD
  description: string;
}

export interface Pasture {
  id: string;
  name: string;
  area: string;
  capacity: number;
  current: number;
  grassHeight: string;
  status: 'Ocupado' | 'Descanso' | 'Recuperação' | 'Intensivo' | 'Preservação';
  type: string;
  lastRotation: string;
}

// --- UI TYPES ---

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message: string;
}

// --- AUTH TYPES ---

export type UserRole = 'owner' | 'manager' | 'collaborator';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  farmName: string;
  avatarUrl?: string;
}