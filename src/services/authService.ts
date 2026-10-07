import { User, UserRole } from '../types/database.ts';
import { storage } from './storageService.ts';

export const AUTH_CHANGE_EVENT = 'ganadocarnes:auth_updated';

export const authService = {
  getCurrentUser: (): User | null => {
    return storage.getCurrentUser();
  },

  login: (email: string, pass: string): User => {
    const users = storage.getUsers();
    const cleanEmail = email.trim().toLowerCase();
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user || user.passwordHash !== pass) {
      // Generic error message as required: "Credenciales inválidas"
      throw new Error('Credenciales inválidas');
    }

    if (user.status === 'Inactivo') {
      throw new Error('Su cuenta se encuentra desactivada. Contacte al administrador.');
    }

    storage.setCurrentUser(user);
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
    return user;
  },

  register: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role?: UserRole;
  }): User => {
    if (!data.name || !data.email || !data.password) {
      throw new Error('Por favor complete todos los campos obligatorios.');
    }

    const users = storage.getUsers();
    if (users.some((u) => u.email.toLowerCase() === data.email.trim().toLowerCase())) {
      throw new Error('Ya existe un usuario registrado con este correo electrónico.');
    }

    const newUser: User = {
      id: `USR-${Date.now().toString().slice(-4)}`,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone?.trim() || '',
      role: data.role || 'Cliente',
      status: 'Activo',
      passwordHash: data.password
    };

    users.push(newUser);
    storage.setUsers(users);
    storage.setCurrentUser(newUser);
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
    return newUser;
  },

  logout: () => {
    storage.setCurrentUser(null);
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  },

  getUsers: (): User[] => {
    return storage.getUsers();
  },

  updateUserRole: (userId: string, newRole: UserRole): User => {
    const users = storage.getUsers();
    const u = users.find((x) => x.id === userId);
    if (!u) throw new Error('Usuario no encontrado.');

    u.role = newRole;
    storage.setUsers(users);

    const current = storage.getCurrentUser();
    if (current && current.id === userId) {
      storage.setCurrentUser(u);
    }

    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
    return u;
  },

  toggleUserStatus: (userId: string): User => {
    const users = storage.getUsers();
    const u = users.find((x) => x.id === userId);
    if (!u) throw new Error('Usuario no encontrado.');

    u.status = u.status === 'Activo' ? 'Inactivo' : 'Activo';
    storage.setUsers(users);

    const current = storage.getCurrentUser();
    if (current && current.id === userId && u.status === 'Inactivo') {
      storage.setCurrentUser(null);
    }

    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
    return u;
  }
};
