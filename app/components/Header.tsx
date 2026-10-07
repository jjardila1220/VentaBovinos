import { Link, Form, useLocation } from "@remix-run/react";
import { useState } from "react";
import { 
  ShoppingBag, 
  User as UserIcon, 
  Search, 
  Menu, 
  X, 
  ShieldCheck, 
  LogOut, 
  ChevronDown, 
  FileText, 
  Users, 
  BarChart3, 
  PlusCircle, 
  Package
} from "lucide-react";

interface HeaderProps {
  user?: {
    id: number;
    name: string;
    email: string;
    role: "Cliente" | "Vendedor" | "Administrador";
  } | null;
  cartCount?: number;
}

export function Header({ user, cartCount = 0 }: HeaderProps) {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = user?.role === "Administrador";
  const isStaff = user?.role === "Administrador" || user?.role === "Vendedor";

  const navLinks = [
    { to: "/", label: "Inicio" },
    { to: "/catalogo", label: "Catálogo" },
    { to: "/nosotros", label: "Nosotros" },
    { to: "/contacto", label: "Contacto" },
  ];

  return (
    <header className="bg-[#B3202A] text-white shadow-md sticky top-0 z-40">
      {/* Micro topbar */}
      <div className="bg-[#8B1820] text-rose-200 text-[11px] py-1 px-4 border-b border-red-900/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">GanadoCarnes Colombia</span>
            <span className="hidden sm:inline">• Registro Pecuario & Guías Oficiales ICA</span>
          </div>
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-rose-200">Sesión activa como:</span>
              <span className="font-bold text-white bg-black/20 px-2 py-0.5 rounded text-[10px]">
                {user.role} ({user.name.split(" ")[0]})
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-white hover:underline font-semibold">
                Iniciar Sesión
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Logo: texto "GanadoCarnes" con ícono de toro sencillo a la izquierda */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#B3202A] shadow-md group-hover:scale-105 transition-transform">
            <svg className="w-6 h-6 fill-current text-[#B3202A]" viewBox="0 0 24 24">
              <path d="M21 4c-.6 0-1.7.5-2.5 1.5-1.2 1.5-2.5 2.5-4.5 2.5H10c-2 0-3.3-1-4.5-2.5C4.7 4.5 3.6 4 3 4c-.6 0-1 .4-1 1 0 1.2 1 3.5 2.5 5 1.1 1.1 2.2 1.8 3.5 2v1.5c0 2.5 1.8 4.5 4 4.5s4-2 4-4.5V12c1.3-.2 2.4-.9 3.5-2 1.5-1.5 2.5-3.8 2.5-5 0-.6-.4-1-1-1zm-9 13c-1.1 0-2-.9-2-2v-.5c.6.3 1.3.5 2 .5s1.4-.2 2-.5v.5c0 1.1-.9 2-2 2z" />
            </svg>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black tracking-tight text-white block leading-none">
              GanadoCarnes
            </span>
            <span className="text-[10px] text-rose-200 font-medium tracking-wide uppercase">
              Ganado Lechero & Carnal
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 font-medium text-sm">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3.5 py-1.5 rounded-lg transition-colors ${
                location.pathname === link.to
                  ? "bg-[#8B1820] text-white font-bold shadow-xs"
                  : "text-rose-100 hover:bg-[#941820] hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Administración dropdown (si es staff o admin) */}
          {isStaff && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-amber-200 hover:bg-[#8B1820] font-semibold"
              >
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>Administración</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {adminMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white text-stone-800 rounded-2xl shadow-2xl border border-stone-200 py-2 z-50"
                  onMouseLeave={() => setAdminMenuOpen(false)}
                >
                  <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100">
                    Panel {user?.role}
                  </div>

                  {isAdmin && (
                    <Link
                      to="/admin/bovinos/nuevo"
                      onClick={() => setAdminMenuOpen(false)}
                      className="block px-3.5 py-2 hover:bg-stone-50 text-xs font-semibold text-stone-700 hover:text-[#B3202A]"
                    >
                      <span className="flex items-center gap-2">
                        <PlusCircle className="w-4 h-4 text-emerald-600" />
                        Registrar Nuevo Bovino
                      </span>
                    </Link>
                  )}

                  <Link
                    to="/admin/inventario"
                    onClick={() => setAdminMenuOpen(false)}
                    className="block px-3.5 py-2 hover:bg-stone-50 text-xs font-semibold text-stone-700 hover:text-[#B3202A]"
                  >
                    <span className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-amber-600" />
                      Inventario & Movimientos
                    </span>
                  </Link>

                  <Link
                    to="/admin/ventas"
                    onClick={() => setAdminMenuOpen(false)}
                    className="block px-3.5 py-2 hover:bg-stone-50 text-xs font-semibold text-stone-700 hover:text-[#B3202A]"
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      Historial de Ventas
                    </span>
                  </Link>

                  {isAdmin && (
                    <>
                      <Link
                        to="/admin/reportes"
                        onClick={() => setAdminMenuOpen(false)}
                        className="block px-3.5 py-2 hover:bg-stone-50 text-xs font-semibold text-stone-700 hover:text-[#B3202A]"
                      >
                        <span className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-purple-600" />
                          Reportes Consolidados
                        </span>
                      </Link>

                      <Link
                        to="/admin/usuarios"
                        onClick={() => setAdminMenuOpen(false)}
                        className="block px-3.5 py-2 hover:bg-stone-50 text-xs font-semibold text-stone-700 hover:text-[#B3202A]"
                      >
                        <span className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-rose-600" />
                          Gestión de Usuarios
                        </span>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Global Search Bar */}
        <Form method="get" action="/catalogo" className="hidden md:flex items-center flex-1 max-w-xs relative">
          <input
            type="text"
            name="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por raza, nombre o ID..."
            className="w-full bg-white text-stone-800 placeholder-stone-400 text-xs pl-3.5 pr-8 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 shadow-inner"
          />
          <button type="submit" className="absolute right-2.5 p-1 text-stone-400 hover:text-[#B3202A]" title="Buscar">
            <Search className="w-4 h-4" />
          </button>
        </Form>

        {/* Right Actions: Cart with counter & User menu */}
        <div className="flex items-center gap-2.5">
          {/* Cart Icon with badge counter */}
          <Link
            to="/carrito"
            className="relative p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center justify-center"
            title="Ver carrito de compras"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-white text-[#B3202A] text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors text-xs font-semibold"
            >
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white">
                <UserIcon className="w-4 h-4" />
              </div>
              <span className="hidden sm:inline truncate max-w-[120px]">
                {user ? user.name.split(" ")[0] : "Mi cuenta"}
              </span>
              <ChevronDown className="w-3 h-3 text-rose-200 hidden sm:inline" />
            </button>

            {userMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-64 bg-white text-stone-800 rounded-2xl shadow-2xl border border-stone-200 py-3 z-50"
                onMouseLeave={() => setUserMenuOpen(false)}
              >
                {user ? (
                  <>
                    <div className="px-4 pb-3 border-b border-stone-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Mi Cuenta</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F9E3E3] text-[#B3202A]">
                          {user.role}
                        </span>
                      </div>
                      <p className="font-bold text-stone-900 text-sm mt-0.5">{user.name}</p>
                      <p className="text-stone-500 text-xs truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/admin/ventas"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 hover:bg-stone-50 text-xs font-medium text-stone-700"
                      >
                        Mis Facturas y Compras
                      </Link>
                    </div>

                    <div className="pt-2 border-t border-stone-100 px-3">
                      <Form method="post" action="/logout">
                        <button
                          type="submit"
                          className="w-full py-1.5 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 text-[#B3202A] text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Cerrar Sesión
                        </button>
                      </Form>
                    </div>
                  </>
                ) : (
                  <div className="p-3 space-y-2">
                    <p className="text-xs text-stone-600 px-1">Acceda para gestionar compras, carrito y facturas.</p>
                    <Link
                      to="/login"
                      onClick={() => setUserMenuOpen(false)}
                      className="block w-full py-2 bg-[#B3202A] hover:bg-[#8B1820] text-white text-xs font-bold rounded-xl text-center transition-colors shadow"
                    >
                      Iniciar Sesión / Registro
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#8B1820] border-t border-red-900 px-4 py-4 space-y-3">
          <Form method="get" action="/catalogo" className="relative">
            <input
              type="text"
              name="search"
              placeholder="Buscar bovinos..."
              className="w-full bg-white text-stone-800 text-xs px-3 py-2 rounded-lg"
            />
          </Form>

          <div className="flex flex-col gap-1 font-medium text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg ${
                  location.pathname === link.to ? "bg-[#B3202A] font-bold text-white" : "text-rose-100"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {isStaff && (
              <>
                <div className="pt-2 text-[10px] uppercase font-bold text-amber-300 px-3">
                  Administración ({user?.role})
                </div>
                {isAdmin && (
                  <Link
                    to="/admin/bovinos/nuevo"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-amber-100"
                  >
                    + Registrar Bovino
                  </Link>
                )}
                <Link
                  to="/admin/inventario"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-amber-100"
                >
                  Inventario & Movimientos
                </Link>
                <Link
                  to="/admin/ventas"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-amber-100"
                >
                  Historial de Ventas
                </Link>
                {isAdmin && (
                  <>
                    <Link
                      to="/admin/reportes"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-lg text-amber-100"
                    >
                      Reportes Consolidados
                    </Link>
                    <Link
                      to="/admin/usuarios"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-lg text-amber-100"
                    >
                      Gestión de Usuarios
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
