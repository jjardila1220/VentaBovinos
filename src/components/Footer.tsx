import React from 'react';
import { Truck, Award, Headphones, MapPin, Phone, Mail, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="mt-auto">
      {/* 3 Key Benefits Section with light pink background (#F9E3E3) */}
      <section className="bg-[#F9E3E3] py-12 px-4 sm:px-6 border-t border-rose-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Benefit 1: Envíos Seguros */}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white shadow-sm border border-rose-100/60">
              <div className="w-12 h-12 rounded-xl bg-[#B3202A] text-white flex items-center justify-center shrink-0 shadow-md">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-[#8B1820] text-base mb-1">
                  Envíos Seguros y Certificados
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Transporte pecuario especializado con monitoreo en ruta, guías oficiales de movilización ICA y seguro de transporte pecuario incluido.
                </p>
              </div>
            </div>

            {/* Benefit 2: Productos de Calidad Certificados */}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white shadow-sm border border-rose-100/60">
              <div className="w-12 h-12 rounded-xl bg-[#B3202A] text-white flex items-center justify-center shrink-0 shadow-md">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-[#8B1820] text-base mb-1">
                  Productos de Calidad Certificados
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Bovinos con trazabilidad verificada, registros genealógicos, plan vacunal contra fiebre aftosa y brucelosis 100% al día.
                </p>
              </div>
            </div>

            {/* Benefit 3: Atención Personalizada */}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white shadow-sm border border-rose-100/60">
              <div className="w-12 h-12 rounded-xl bg-[#B3202A] text-white flex items-center justify-center shrink-0 shadow-md">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-[#8B1820] text-base mb-1">
                  Atención Personalizada 24/7
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Asesoría técnica y zootécnica directa para la selección de reproductores, vacas lecheras de alto rendimiento y lotes de engorde.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Footer Links & Information */}
      <div className="bg-[#8B1820] text-rose-100 text-xs py-12 px-4 sm:px-6 border-t border-red-950">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#B3202A]">
                <svg className="w-5 h-5 fill-current text-[#B3202A]" viewBox="0 0 24 24">
                  <path d="M21 4c-.6 0-1.7.5-2.5 1.5-1.2 1.5-2.5 2.5-4.5 2.5H10c-2 0-3.3-1-4.5-2.5C4.7 4.5 3.6 4 3 4c-.6 0-1 .4-1 1 0 1.2 1 3.5 2.5 5 1.1 1.1 2.2 1.8 3.5 2v1.5c0 2.5 1.8 4.5 4 4.5s4-2 4-4.5V12c1.3-.2 2.4-.9 3.5-2 1.5-1.5 2.5-3.8 2.5-5 0-.6-.4-1-1-1zm-9 13c-1.1 0-2-.9-2-2v-.5c.6.3 1.3.5 2 .5s1.4-.2 2-.5v.5c0 1.1-.9 2-2 2z"/>
                </svg>
              </div>
              <span className="text-lg font-black text-white tracking-tight">GanadoCarnes</span>
            </div>
            <p className="text-rose-200 text-xs leading-relaxed">
              Plataforma líder en Colombia para la comercialización segura, transparente y certificada de ganado lechero y carnal de alta genética.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-amber-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Transacciones seguras y trazabilidad DIAN</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-3">Navegación</h4>
            <ul className="space-y-2 text-rose-200">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">
                  Inicio
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('catalog')} className="hover:text-white transition-colors">
                  Catálogo de Bovinos
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">
                  Quiénes Somos
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">
                  Contacto y Sedes
                </button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-3">Categorías</h4>
            <ul className="space-y-2 text-rose-200">
              <li>
                <button onClick={() => onNavigate('catalog')} className="hover:text-white transition-colors">
                  Vacas Lecheras de Alta Producción
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('catalog')} className="hover:text-white transition-colors">
                  Novillos de Ceba y Levante
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('catalog')} className="hover:text-white transition-colors">
                  Terneros y Terneras Destetos
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('catalog')} className="hover:text-white transition-colors">
                  Toros Reproductores con Registro
                </button>
              </li>
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-3">Atención Directa</h4>
            <ul className="space-y-2.5 text-rose-200">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 shrink-0 text-rose-300 mt-0.5" />
                <span>Montería, Córdoba & Llanos Orientales, Colombia</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0 text-rose-300" />
                <span>+57 (310) 800-GANADO</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0 text-rose-300" />
                <span>contacto@ganadocarnes.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-red-900/60 text-center text-[11px] text-rose-300">
          © {new Date().getFullYear()} GanadoCarnes S.A.S. Todos los derechos reservados. Registro Pecuario Nacional.
        </div>
      </div>
    </footer>
  );
};
