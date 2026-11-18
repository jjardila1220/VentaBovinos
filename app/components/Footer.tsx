import { Link } from "@remix-run/react";
import { Truck, Award, Headphones, MapPin, Phone, Mail, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto print:hidden">
      {/* Tres beneficios en fondo rosa claro (#F9E3E3) */}
      <section className="bg-[#F9E3E3] py-12 px-4 sm:px-6 border-t border-rose-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Beneficio 1 */}
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

            {/* Beneficio 2 */}
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

            {/* Beneficio 3 */}
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

      {/* Pie de página oscuro */}
      <div className="bg-[#8B1820] text-rose-100 text-xs py-12 px-4 sm:px-6 border-t border-red-950">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#B3202A]">
                <svg className="w-5 h-5 fill-current text-[#B3202A]" viewBox="0 0 24 24">
                  <path d="M21 4c-.6 0-1.7.5-2.5 1.5-1.2 1.5-2.5 2.5-4.5 2.5H10c-2 0-3.3-1-4.5-2.5C4.7 4.5 3.6 4 3 4c-.6 0-1 .4-1 1 0 1.2 1 3.5 2.5 5 1.1 1.1 2.2 1.8 3.5 2v1.5c0 2.5 1.8 4.5 4 4.5s4-2 4-4.5V12c1.3-.2 2.4-.9 3.5-2 1.5-1.5 2.5-3.8 2.5-5 0-.6-.4-1-1-1zm-9 13c-1.1 0-2-.9-2-2v-.5c.6.3 1.3.5 2 .5s1.4-.2 2-.5v.5c0 1.1-.9 2-2 2z" />
                </svg>
              </div>
              <span className="text-lg font-black text-white tracking-tight">GanadoCarnes</span>
            </div>
            <p className="text-rose-200 text-xs leading-relaxed">
              Plataforma líder para la compra y venta de ganado lechero y carnal con trazabilidad y sanidad oficial.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-amber-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Transacciones seguras en PostgreSQL</span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-3">Navegación</h4>
            <ul className="space-y-2 text-rose-200">
              <li><Link to="/" className="hover:text-white">Inicio</Link></li>
              <li><Link to="/catalogo" className="hover:text-white">Catálogo de Bovinos</Link></li>
              <li><Link to="/nosotros" className="hover:text-white">Quiénes Somos</Link></li>
              <li><Link to="/contacto" className="hover:text-white">Contacto y Sedes</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-3">Categorías</h4>
            <ul className="space-y-2 text-rose-200">
              <li><Link to="/catalogo?category=Vacas+lecheras" className="hover:text-white">Vacas Lecheras</Link></li>
              <li><Link to="/catalogo?category=Novillos" className="hover:text-white">Novillos de Ceba</Link></li>
              <li><Link to="/catalogo?category=Terneros" className="hover:text-white">Terneros Destetos</Link></li>
              <li><Link to="/catalogo?category=Toros" className="hover:text-white">Toros Reproductores</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-3">Atención</h4>
            <ul className="space-y-2.5 text-rose-200">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 shrink-0 text-rose-300 mt-0.5" />
                <span>Montería, Córdoba & Llanos Orientales, Colombia</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0 text-rose-300" />
                <span>+57 (310) 800-4262 (800-GANADO)</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0 text-rose-300" />
                <span>contacto@ganadocarnes.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-red-900/60 text-center text-[11px] text-rose-300">
          © {new Date().getFullYear()} GanadoCarnes S.A.S. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
