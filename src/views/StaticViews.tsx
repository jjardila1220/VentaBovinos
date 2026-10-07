import React from 'react';
import { Award, ShieldCheck, MapPin, Phone, Mail, Clock, HeartHandshake } from 'lucide-react';

export const AboutView: React.FC<{ onNavigate: (v: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-[#B3202A]">Nuestra Historia</span>
        <h1 className="text-3xl sm:text-5xl font-black text-[#8B1820] tracking-tight">
          GanadoCarnes Colombia
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-2xl mx-auto leading-relaxed">
          Nacimos con el propósito de transformar la comercialización ganadera en el país mediante tecnología, trazabilidad zootécnica y transacciones seguras para ganaderos y compradores.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F9E3E3] text-[#B3202A] flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-stone-900">Genética Superior</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Seleccionamos rigurosamente cada lote de ganado lechero y de carne para asegurar rusticidad, adaptabilidad tropical y altos rendimientos.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F9E3E3] text-[#B3202A] flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-stone-900">Sanidad Oficial ICA</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Cada animal se entrega con su plan vacunal contra fiebre aftosa y brucelosis al 100% y con guía sanitaria de movilización interna.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F9E3E3] text-[#B3202A] flex items-center justify-center">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-stone-900">Confianza y Transparencia</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Precios claros, pesaje exacto en báscula digital verificada y facturación electrónica con índice único consecutivo.
          </p>
        </div>
      </div>

      <div className="p-8 sm:p-12 rounded-3xl bg-[#F9E3E3] border border-rose-200 text-center space-y-4">
        <h2 className="text-2xl font-black text-[#8B1820]">¿Listo para renovar su hato ganadero?</h2>
        <p className="text-xs text-stone-600 max-w-lg mx-auto">
          Consulte nuestro catálogo en tiempo real con más de 12 ejemplares disponibles entre vacas lecheras, novillos, terneros y toros reproductores.
        </p>
        <button
          onClick={() => onNavigate('catalog')}
          className="px-6 py-3 bg-[#B3202A] hover:bg-[#8B1820] text-white text-xs font-bold rounded-xl shadow-md transition-colors"
        >
          Explorar Catálogo de Bovinos
        </button>
      </div>
    </div>
  );
};

export const ContactView: React.FC<{ onNavigate: (v: string) => void }> = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-[#B3202A]">Contacto y Sedes</span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#8B1820] tracking-tight">
          Estamos a su Servicio
        </h1>
        <p className="text-xs text-stone-500 max-w-md mx-auto">
          Comuníquese con nuestros asesores comerciales y médicos veterinarios de planta.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6 text-xs text-stone-700">
          <h3 className="font-bold text-sm text-stone-900 border-b border-stone-100 pb-3">Canales de Atención</h3>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-[#B3202A] shrink-0 mt-0.5" />
            <div>
              <strong className="block text-stone-900">Sede Principal Ganadera</strong>
              <span>Cra 4 # 28-30, Montería, Córdoba, Colombia</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-[#B3202A] shrink-0 mt-0.5" />
            <div>
              <strong className="block text-stone-900">Línea Nacional y WhatsApp</strong>
              <span>+57 (310) 800-4262 (800-GANADO)</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-[#B3202A] shrink-0 mt-0.5" />
            <div>
              <strong className="block text-stone-900">Correo Electrónico Oficial</strong>
              <span>contacto@ganadocarnes.com</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-[#B3202A] shrink-0 mt-0.5" />
            <div>
              <strong className="block text-stone-900">Horario de Despacho y Subasta</strong>
              <span>Lunes a Sábado: 6:00 AM - 6:00 PM (Jornada Continua)</span>
            </div>
          </div>
        </div>

        <form 
          onSubmit={(e) => { e.preventDefault(); alert('¡Gracias por contactarnos! Un asesor ganadero le responderá a la brevedad.'); }}
          className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4 text-xs"
        >
          <h3 className="font-bold text-sm text-stone-900 border-b border-stone-100 pb-3">Envíenos un Mensaje</h3>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Nombre Completo *</label>
            <input required type="text" placeholder="Su nombre" className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-400" />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Teléfono Móvil *</label>
            <input required type="text" placeholder="+57 300 000 0000" className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-400" />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Consulta o Interés de Ganado</label>
            <textarea rows={3} placeholder="¿Qué raza o lote de bovinos le interesa cotizar?" className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-400" />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#B3202A] hover:bg-[#8B1820] text-white font-bold rounded-xl shadow transition-colors"
          >
            Enviar Solicitud de Información
          </button>
        </form>
      </div>
    </div>
  );
};
