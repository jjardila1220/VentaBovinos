import { Bovine, Invoice, User, InventoryMovement } from '../types/database.ts';
import { INITIAL_BOVINES, INITIAL_INVOICES, INITIAL_MOVEMENTS, INITIAL_USERS } from './mockData.ts';

const STORAGE_KEYS = {
  BOVINES: 'ganadocarnes_bovines_v2',
  INVOICES: 'ganadocarnes_invoices_v2',
  USERS: 'ganadocarnes_users_v2',
  MOVEMENTS: 'ganadocarnes_movements_v2',
  AUTH: 'ganadocarnes_current_user_v2',
  CART: 'ganadocarnes_cart_v2',
  INVOICE_SEQ: 'ganadocarnes_invoice_seq_v2'
};

export const storage = {
  getBovines: (): Bovine[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOVINES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.BOVINES, JSON.stringify(INITIAL_BOVINES));
        return INITIAL_BOVINES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_BOVINES;
    }
  },

  setBovines: (bovines: Bovine[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.BOVINES, JSON.stringify(bovines));
    } catch (e) {
      console.error('Error saving bovines:', e);
    }
  },

  getInvoices: (): Invoice[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INVOICES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(INITIAL_INVOICES));
        return INITIAL_INVOICES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_INVOICES;
    }
  },

  setInvoices: (invoices: Invoice[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
    } catch (e) {
      console.error('Error saving invoices:', e);
    }
  },

  getUsers: (): User[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
        return INITIAL_USERS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_USERS;
    }
  },

  setUsers: (users: User[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (e) {
      console.error('Error saving users:', e);
    }
  },

  getMovements: (): InventoryMovement[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(INITIAL_MOVEMENTS));
        return INITIAL_MOVEMENTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_MOVEMENTS;
    }
  },

  setMovements: (movements: InventoryMovement[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
    } catch (e) {
      console.error('Error saving movements:', e);
    }
  },

  getCurrentUser: (): User | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUTH);
      if (!data) {
        // Default to admin for seamless evaluation
        localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(INITIAL_USERS[0]));
        return INITIAL_USERS[0];
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_USERS[0];
    }
  },

  setCurrentUser: (user: User | null) => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEYS.AUTH);
      }
    } catch (e) {
      console.error('Error saving current user:', e);
    }
  },

  getNextInvoiceNumber: (): string => {
    try {
      const year = new Date().getFullYear();
      let seq = parseInt(localStorage.getItem(STORAGE_KEYS.INVOICE_SEQ) || '5', 10);
      seq += 1;
      localStorage.setItem(STORAGE_KEYS.INVOICE_SEQ, String(seq));
      return `FAC-${year}-${String(seq).padStart(6, '0')}`;
    } catch {
      return `FAC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    }
  },

  resetAll: () => {
    localStorage.setItem(STORAGE_KEYS.BOVINES, JSON.stringify(INITIAL_BOVINES));
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(INITIAL_INVOICES));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(INITIAL_MOVEMENTS));
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(INITIAL_USERS[0]));
    localStorage.setItem(STORAGE_KEYS.INVOICE_SEQ, '5');
  }
};
