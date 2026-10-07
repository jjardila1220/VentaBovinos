import { Bovine, FilterParams, InventoryMovement } from '../types/database.ts';
import { storage } from './storageService.ts';

// Custom event to notify components when bovine data changes
export const BOVINE_CHANGE_EVENT = 'ganadocarnes:bovines_updated';

function notifyUpdate() {
  window.dispatchEvent(new Event(BOVINE_CHANGE_EVENT));
}

export const bovineService = {
  getAll: (filters?: FilterParams): Bovine[] => {
    let list = storage.getBovines();

    if (!filters) return list;

    if (filters.category && filters.category !== 'Todos') {
      list = list.filter((b) => b.category === filters.category);
    }

    if (filters.breed && filters.breed !== 'Todas') {
      list = list.filter((b) => b.breed.toLowerCase() === filters.breed!.toLowerCase());
    }

    if (filters.sex && filters.sex !== 'Todos') {
      list = list.filter((b) => b.sex === filters.sex);
    }

    if (filters.status && filters.status !== 'Todos') {
      list = list.filter((b) => b.status === filters.status);
    }

    if (filters.minWeight !== undefined && !isNaN(filters.minWeight)) {
      list = list.filter((b) => b.weight >= Number(filters.minWeight));
    }

    if (filters.maxWeight !== undefined && !isNaN(filters.maxWeight)) {
      list = list.filter((b) => b.weight <= Number(filters.maxWeight));
    }

    if (filters.minAge !== undefined && !isNaN(filters.minAge)) {
      list = list.filter((b) => b.age >= Number(filters.minAge));
    }

    if (filters.maxAge !== undefined && !isNaN(filters.maxAge)) {
      list = list.filter((b) => b.age <= Number(filters.maxAge));
    }

    if (filters.minPrice !== undefined && !isNaN(filters.minPrice)) {
      list = list.filter((b) => b.price >= Number(filters.minPrice));
    }

    if (filters.maxPrice !== undefined && !isNaN(filters.maxPrice)) {
      list = list.filter((b) => b.price <= Number(filters.maxPrice));
    }

    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.id.toLowerCase().includes(q) ||
          b.breed.toLowerCase().includes(q) ||
          b.location.toLowerCase().includes(q) ||
          b.color.toLowerCase().includes(q)
      );
    }

    if (filters.sortBy) {
      if (filters.sortBy === 'price_asc') {
        list.sort((a, b) => a.price - b.price);
      } else if (filters.sortBy === 'price_desc') {
        list.sort((a, b) => b.price - a.price);
      } else if (filters.sortBy === 'weight_desc') {
        list.sort((a, b) => b.weight - a.weight);
      } else if (filters.sortBy === 'newest') {
        list.sort((a, b) => new Date(b.registerDay).getTime() - new Date(a.registerDay).getTime());
      }
    }

    return list;
  },

  getById: (id: string): Bovine | undefined => {
    const list = storage.getBovines();
    return list.find((b) => b.id.toLowerCase() === id.toLowerCase());
  },

  create: (bovineData: Omit<Bovine, 'age'>, userName = 'Administrador'): Bovine => {
    // Validate inputs (Rule: no negatives)
    if (!bovineData.name || !bovineData.name.trim()) {
      throw new Error('El nombre del bovino es obligatorio.');
    }
    if (!bovineData.id || !bovineData.id.trim()) {
      throw new Error('El ID del bovino es obligatorio.');
    }
    if (bovineData.price <= 0) {
      throw new Error('El precio debe ser un valor positivo mayor a 0.');
    }
    if (bovineData.weight <= 0) {
      throw new Error('El peso debe ser un valor positivo mayor a 0.');
    }
    if (!bovineData.birthDay) {
      throw new Error('La fecha de nacimiento es obligatoria.');
    }

    const list = storage.getBovines();
    if (list.some((b) => b.id.toLowerCase() === bovineData.id.toLowerCase().trim())) {
      throw new Error(`Ya existe un bovino registrado con el ID ${bovineData.id}.`);
    }

    // Calculate age
    const birth = new Date(bovineData.birthDay);
    const now = new Date();
    const months = Math.max(
      0,
      (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
    );

    const newBovine: Bovine = {
      ...bovineData,
      id: bovineData.id.trim().toUpperCase(),
      name: bovineData.name.trim(),
      age: months,
      status: bovineData.status || 'Disponible',
      registerDay: bovineData.registerDay || new Date().toISOString().split('T')[0],
      images: bovineData.images && bovineData.images.length > 0 
        ? bovineData.images 
        : ['https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=1000&q=80']
    };

    list.unshift(newBovine);
    storage.setBovines(list);

    // Record inventory movement
    const movements = storage.getMovements();
    const movement: InventoryMovement = {
      id: `MOV-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString(),
      type: 'Entrada',
      bovineId: newBovine.id,
      bovineName: newBovine.name,
      reference: 'Registro de nuevo ejemplar',
      user: userName
    };
    movements.unshift(movement);
    storage.setMovements(movements);

    notifyUpdate();
    return newBovine;
  },

  update: (id: string, updates: Partial<Bovine>, userName = 'Administrador'): Bovine => {
    const list = storage.getBovines();
    const idx = list.findIndex((b) => b.id.toLowerCase() === id.toLowerCase());
    if (idx === -1) throw new Error('Bovino no encontrado.');

    if (updates.price !== undefined && updates.price <= 0) {
      throw new Error('El precio debe ser mayor a 0.');
    }
    if (updates.weight !== undefined && updates.weight <= 0) {
      throw new Error('El peso debe ser mayor a 0.');
    }

    const current = list[idx];
    const updated: Bovine = { ...current, ...updates };

    if (updates.birthDay) {
      const birth = new Date(updates.birthDay);
      const now = new Date();
      updated.age = Math.max(
        0,
        (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
      );
    }

    list[idx] = updated;
    storage.setBovines(list);

    if (updates.status && updates.status !== current.status) {
      const movements = storage.getMovements();
      movements.unshift({
        id: `MOV-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString(),
        type: updates.status === 'Disponible' ? 'Entrada' : 'Salida',
        bovineId: updated.id,
        bovineName: updated.name,
        reference: `Cambio de estado: ${current.status} -> ${updated.status}`,
        user: userName
      });
      storage.setMovements(movements);
    }

    notifyUpdate();
    return updated;
  },

  delete: (id: string, userName = 'Administrador'): boolean => {
    const list = storage.getBovines();
    const idx = list.findIndex((b) => b.id.toLowerCase() === id.toLowerCase());
    if (idx === -1) throw new Error('Bovino no encontrado.');

    const target = list[idx];
    if (target.status === 'Vendido') {
      throw new Error('No se puede eliminar un bovino que ya ha sido vendido (posee facturas asociadas).');
    }

    list.splice(idx, 1);
    storage.setBovines(list);

    const movements = storage.getMovements();
    movements.unshift({
      id: `MOV-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString(),
      type: 'Salida',
      bovineId: target.id,
      bovineName: target.name,
      reference: 'Baja del sistema / Eliminación',
      user: userName
    });
    storage.setMovements(movements);

    notifyUpdate();
    return true;
  },

  // Business Rule: Reserve on cart addition
  reserve: (id: string, userId: string): Bovine => {
    const list = storage.getBovines();
    const b = list.find((item) => item.id.toLowerCase() === id.toLowerCase());
    if (!b) throw new Error('Bovino no encontrado.');

    if (b.status === 'Vendido') {
      throw new Error('Este bovino ya fue vendido.');
    }
    if (b.status === 'Reservado' && b.reservedByUserId !== userId) {
      throw new Error('Este bovino ya no está disponible (ha sido reservado por otro usuario).');
    }

    b.status = 'Reservado';
    b.reservedByUserId = userId;
    storage.setBovines(list);
    notifyUpdate();
    return b;
  },

  // Business Rule: Release on cart removal
  release: (id: string, userId: string): Bovine | undefined => {
    const list = storage.getBovines();
    const b = list.find((item) => item.id.toLowerCase() === id.toLowerCase());
    if (!b) return undefined;

    // Only release if reserved by this user or still not sold
    if (b.status === 'Reservado' && (!b.reservedByUserId || b.reservedByUserId === userId)) {
      b.status = 'Disponible';
      b.reservedByUserId = null;
      storage.setBovines(list);
      notifyUpdate();
    }
    return b;
  }
};
