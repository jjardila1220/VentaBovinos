export type BovineCategory = 'Vacas lecheras' | 'Novillos' | 'Terneros' | 'Toros';
export type BovineSex = 'Macho' | 'Hembra';
export type BovineStatus = 'Disponible' | 'Reservado' | 'Vendido';
export type UserRole = 'Cliente' | 'Vendedor' | 'Administrador';
export type SaleStatus = 'Completado' | 'En proceso' | 'Cancelado';
export type MovementType = 'Entrada' | 'Salida' | 'Venta';

export interface HealthHistory {
  sanitaryRegistry: string; // ej. Registro ICA
  aftosaVaccine: string; // Fecha última dosis
  brucelosisVaccine: string;
  dewormingDate: string;
  certified: boolean;
}

export interface Bovine {
  id: string; // e.g. "BOV-001"
  name: string;
  category: BovineCategory;
  breed: string;
  sex: BovineSex;
  birthDay: string; // YYYY-MM-DD
  age: number; // en meses
  weight: number; // en kg (>0)
  color: string;
  price: number; // en COP (>0)
  status: BovineStatus;
  reservedByUserId?: string | null;
  location: string;
  registerDay: string;
  shortDescription: string;
  fullDescription: string;
  characteristics: string[];
  healthHistory: HealthHistory;
  images: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: 'Activo' | 'Inactivo';
  passwordHash?: string;
  address?: string;
  city?: string;
}

export interface BuyerData {
  name: string;
  document: string; // Cédula o NIT
  phone: string;
  email: string;
  address: string;
  city: string;
  notes?: string;
}

export interface InvoiceItem {
  bovineId: string;
  name: string;
  breed: string;
  category: BovineCategory;
  price: number;
}

export interface Invoice {
  id: string; // Formato FAC-AAAA-000001
  date: string; // ISO
  buyer: BuyerData;
  items: InvoiceItem[];
  subtotal: number;
  shipping: number; // 0
  total: number;
  paymentMethod: string;
  status: SaleStatus;
  createdByName: string;
  createdById?: string;
}

export interface InventoryMovement {
  id: string;
  date: string;
  type: MovementType;
  bovineId: string;
  bovineName: string;
  reference: string; // e.g. "FAC-2026-000001"
  user: string;
}

export interface FilterParams {
  category?: string;
  breed?: string;
  minWeight?: number;
  maxWeight?: number;
  minAge?: number;
  maxAge?: number;
  sex?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  status?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'weight_desc' | 'newest';
}
