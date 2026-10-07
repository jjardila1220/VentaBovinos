import { Link } from "@remix-run/react";
import { ShieldCheck, Award, HeartHandshake, Sparkles, ChevronRight, CheckCircle2 } from "lucide-react";

export default function Nosotros() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-stone-500 font-medium">
        <Link to="/" className="hover:text-[#B3202A]">Inicio</Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="text-stone-900 font-bold">Nosotros</span>
      </nav>

      {/* Hero Nosotros */}
      <div className="bg-gradient-to-br from-[#8B1820] to-[#B3202A] text-white p-8 sm:p-14 rounded-3xl shadow-xl relative overflow-hidden space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 text-rose-100 text-xs font-semibold backdrop-blur-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Tradición, Genética y Confianza Ganadera</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
          Sobre GanadoCarnes
        </h1>
        <p className="text-rose-100 text-sm sm:text-base max-w-2xl font-light leading-relaxed">
          Somos la plataforma líder en Colombia para la comercialización transparente y segura de ganado lechero y carnal de alto valor zootécnico.
        </p>
      </div>

      {/* Misión y Visión */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#B3202A] flex items-center justify-center font-black text-xl">
            🎯
          </div>
          <h2 className="text-xl font-black text-stone-900">Nuestra Misión</h2>
          <p className="text-xs text-stone-600 leading-relaxed">
            Conectar a ganaderos, criadores y cebadores de toda Colombia a través de un canal comercial confiable, moderno y ágil, garantizando la trazabilidad sanitaria, el bienestar animal y el justo valor de cada ejemplar en pie.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#B3202A] flex items-center justify-center font-black text-xl">
            🔭
          </div>
          <h2 className="text-xl font-black text-stone-900">Nuestra Visión</h2>
          <p className="text-xs text-stone-600 leading-relaxed">
            Consolidarnos para el 2030 como el principal referente digital agropecuario en la región andina y los llanos orientales, promoviendo hatos sustentables con bajas emisiones y alta eficiencia productiva.
          </p>
        </div>
      </div>

      {/* Compromisos y Sellos de Calidad */}
      <div className="bg-[#F9E3E3] p-8 sm:p-10 rounded-3xl border border-rose-200/80 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-black text-[#8B1820]">Compromiso Integral Ganadero</h2>
          <p className="text-xs text-stone-600">
            Cada animal que ingresa a nuestro catálogo cumple con rigurosos protocolos técnicos avalados por las autoridades sanitarias.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-rose-100 space-y-2">
            <ShieldCheck className="w-8 h-8 text-[#B3202A]" />
            <h3 className="font-bold text-stone-900 text-sm">Certificación ICA</h3>
            <p className="text-xs text-stone-500">
              Hatos libres de Brucelosis y Tuberculosis, vacunación oficial RUV y Guías Sanitarias de Movilización Interna.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-xs border border-rose-100 space-y-2">
            <HeartHandshake className="w-8 h-8 text-[#B3202A]" />
            <h3 className="font-bold text-stone-900 text-sm">Bienestar Animal</h3>
            <p className="text-xs text-stone-500">
              Protocolos de manejo libre de estrés, embarque técnico con camas de aserrín y descanso reglamentario en ruta.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-xs border border-rose-100 space-y-2">
            <Award className="w-8 h-8 text-[#B3202A]" />
            <h3 className="font-bold text-stone-900 text-sm">Genética Comprobada</h3>
            <p className="text-xs text-stone-500">
              Líneas lecheras con curvas de producción certificadas y novillos con óptima conversión alimenticia y marmoleo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
