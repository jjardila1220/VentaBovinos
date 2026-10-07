import { useState } from "react";
import { Link } from "@remix-run/react";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";

export default function Contacto() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-stone-500 font-medium">
        <Link to="/" className="hover:text-[#B3202A]">Inicio</Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="text-stone-900 font-bold">Contacto</span>
      </nav>

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-[#B3202A] text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Atención Personalizada & Asesoría Zootécnica</span>
        </div>
        <h1 className="text-3xl font-black text-stone-900 tracking-tight">
          Ponte en Contacto con GanadoCarnes
        </h1>
        <p className="text-stone-500 text-xs mt-1">
          Estamos a tu disposición para visitas a predios, inspecciones de lotes, cotizaciones de transporte o asesoría en genética bovina.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Formulario (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-stone-200 space-y-6">
          <h2 className="text-lg font-black text-stone-900">Envíanos un Mensaje</h2>

          {submitted ? (
            <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-emerald-950 text-base">¡Mensaje Enviado con Éxito!</h3>
              <p className="text-xs text-emerald-800">
                Uno de nuestros asesores comerciales se comunicará contigo vía WhatsApp o llamada en menos de 2 horas hábiles.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="px-5 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold mt-2"
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 block">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: David Restrepo"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#B3202A]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-700 block">Teléfono / Celular *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+57 311 450 8920"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#B3202A]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 block">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  placeholder="tu@correo.com"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#B3202A]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 block">Sede o Región de Interés</label>
                <select className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#B3202A]">
                  <option>Sede Principal - Villavicencio (Meta)</option>
                  <option>Sede Caribe - Montería (Córdoba)</option>
                  <option>Sede Andina - Medellín (Antioquia)</option>
                  <option>Oficina Central - Bogotá D.C.</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-700 block">Mensaje o Detalle del Hato *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Cuéntanos sobre los ejemplares que deseas adquirir, requisitos sanitarios o transporte..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#B3202A]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#B3202A] hover:bg-[#8B1820] text-white font-bold rounded-xl text-xs shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Enviar Consulta Ganadera</span>
              </button>
            </form>
          )}
        </div>

        {/* Sedes y Contacto Directo (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200 space-y-4 text-xs">
            <h3 className="font-black text-stone-900 text-sm uppercase tracking-wide">
              Nuestras Sedes & Centros de Acopio
            </h3>

            <div className="space-y-3.5 text-stone-600">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#B3202A] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-stone-900">Sede Principal & Corrales</p>
                  <p>Km 14 Vía al Llano, Villavicencio, Meta</p>
                  <p className="text-[11px] text-stone-400">Báscula camionera y manga de embarque</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#B3202A] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-stone-900">Sede Costa Caribe</p>
                  <p>Km 18 Vía Cereté, Montería, Córdoba</p>
                  <p className="text-[11px] text-stone-400">Especialidad en Cebú Brahman y Gyr</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#B3202A] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-stone-900">Líneas de Atención Directa</p>
                  <p>+57 311 450 8920 / +57 315 889 2200</p>
                  <p className="text-[11px] text-stone-400">Lunes a Sábado: 6:00 AM - 7:00 PM</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#B3202A] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-stone-900">Correo Electrónico</p>
                  <p>contacto@ganadocarnes.com</p>
                  <p>facturacion@ganadocarnes.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mapa Simulado / Visual */}
          <div className="bg-[#F9E3E3] p-5 rounded-3xl border border-rose-200 space-y-2">
            <span className="text-[10px] font-bold uppercase text-[#8B1820]">Cobertura Nacional</span>
            <p className="text-xs text-stone-700 leading-relaxed">
              Despachamos ganado en pie a toda Colombia con guías oficiales ICA y transporte climatizado apto para semovientes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
