import React, { useState, useEffect } from 'react';
import { authService, AUTH_CHANGE_EVENT } from '../services/authService.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { User, UserRole } from '../types/database.ts';
import { Users, ShieldAlert, CheckCircle2, XCircle, UserCheck, Shield } from 'lucide-react';

interface UsersViewProps {
  onNavigate: (view: string) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({ onNavigate }) => {
  const { isAdmin, user: currentUser } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);

  const loadUsers = () => {
    setUsers(authService.getUsers());
  };

  useEffect(() => {
    loadUsers();
    window.addEventListener(AUTH_CHANGE_EVENT, loadUsers);
    return () => window.removeEventListener(AUTH_CHANGE_EVENT, loadUsers);
  }, []);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl shadow-sm border border-stone-200 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-rose-100 flex items-center justify-center text-[#B3202A]">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-stone-900">Acceso Denegado</h2>
        <p className="text-xs text-stone-500">
          La administración de usuarios requiere permisos de Super Administrador.
        </p>
        <button
          onClick={() => onNavigate('home')}
          className="px-5 py-2.5 bg-[#B3202A] text-white rounded-xl text-xs font-bold hover:bg-[#8B1820]"
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    try {
      authService.updateUserRole(userId, newRole);
      showToast(`Rol actualizado a "${newRole}" con éxito`, 'success');
      loadUsers();
    } catch (err: any) {
      showToast(err.message || 'Error al cambiar rol', 'error');
    }
  };

  const handleToggleStatus = (u: User) => {
    if (u.id === currentUser?.id) {
      alert('No puede desactivar su propia cuenta de administrador activa.');
      return;
    }
    try {
      authService.toggleUserStatus(u.id);
      showToast(`Cuenta de "${u.name}" ${u.status === 'Activo' ? 'desactivada' : 'activada'}.`, 'info');
      loadUsers();
    } catch (err: any) {
      showToast(err.message || 'Error al cambiar estado de usuario', 'error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#8B1820] tracking-tight">
            Gestión de Usuarios y Roles
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Administración de cuentas con permisos de acceso a la plataforma GanadoCarnes.
          </p>
        </div>

        <div className="text-xs font-semibold text-stone-600 bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200">
          Total de cuentas: <strong>{users.length}</strong>
        </div>
      </div>

      {/* Users Table (Pantalla 12) */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-100 text-stone-700 uppercase font-bold text-[10px] tracking-wider border-b border-stone-200">
              <tr>
                <th className="py-3.5 px-4">Usuario</th>
                <th className="py-3.5 px-4">Correo Electrónico</th>
                <th className="py-3.5 px-4">Teléfono</th>
                <th className="py-3.5 px-4">Rol Asignado</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-800">
              {users.map((u) => {
                const isActive = u.status === 'Activo';
                const isSelf = u.id === currentUser?.id;
                return (
                  <tr key={u.id} className="hover:bg-rose-50/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#F9E3E3] text-[#B3202A] font-bold flex items-center justify-center shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-stone-900">{u.name}</p>
                          <span className="text-[10px] text-stone-400 font-mono">{u.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-stone-600 font-medium">
                      {u.email}
                    </td>

                    <td className="py-3.5 px-4 text-stone-500">
                      {u.phone || 'No registrado'}
                    </td>

                    {/* Selector de Rol (Cliente, Vendedor, Administrador) */}
                    <td className="py-3.5 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        className="px-2.5 py-1 border border-stone-200 rounded-lg bg-white font-bold text-xs focus:ring-1 focus:ring-rose-400 focus:outline-none"
                      >
                        <option value="Cliente">Cliente</option>
                        <option value="Vendedor">Vendedor</option>
                        <option value="Administrador">Administrador</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-200 text-stone-600'
                        }`}
                      >
                        {isActive ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3" />}
                        <span>{u.status}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        disabled={isSelf}
                        onClick={() => handleToggleStatus(u)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors disabled:opacity-30 ${
                          isActive
                            ? 'bg-rose-50 text-[#B3202A] hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                        }`}
                      >
                        {isActive ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
