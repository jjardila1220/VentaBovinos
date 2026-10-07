import React, { useState } from 'react';
import { bovineService } from '../services/bovineService.ts';
import { formatCOP } from '../utils/formatters.ts';
import { BovineCategory, Bovine } from '../types/database.ts';
import { Search, ArrowRight, ShieldCheck, CheckCircle2, Award, Sparkles } from 'lucide-react';

interface HomeViewProps {
  onNavigate: (view: string, params?: any) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const allBovines = bovineService.getAll();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('catalog', { search: searchQuery });
  };

  // 4 Main Product Categories as specified in Mockup Pantalla 1
  const categories: Array<{
    title: BovineCategory;
    description: string;
    image: string;
    minPrice: number;
    badge: string;
  }> = [
    {
      title: 'Vacas lecheras',
      description: 'Líneas Holstein, Jersey y Gyr con alto rendimiento en sólidos y producción comprobada.',
      image: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80',
      minPrice: 5900000,
      badge: 'Alta Producción'
    },
    {
      title: 'Novillos',
      description: 'Machos seleccionados de ceba y levante con óptima conversión cárnica y rusticidad.',
      image: 'https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?auto=format&fit=crop&w=800&q=80',
      minPrice: 4900000,
      badge: 'Ceba y Levante'
    },
    {
      title: 'Terneros',
      description: 'Crías destetas de genética superior para reemplazo de hato y programas de engorde.',
      image: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=800&q=80',
      minPrice: 2800000,
      badge: 'Genética Joven'
    },
    {
      title: 'Toros',
      description: 'Reproductores evaluados con andrológico vigente, pedigree cerrado y gran vigor híbrido.',
      image: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=800&q=80',
      minPrice: 12800000,
      badge: 'Sementales Élite'
    }
  ];

  // Featured 4 available bovines
  const featuredBovines = allBovines
    .filter((b) => b.status === 'Disponible')
    .slice(0, 4);

  return (
    <div className="space-y-12">
      {/* 1. Hero Banner as specified:
          Título: "Ganado Lechero y Ganado Carnal"
          Eslogan: "Calidad, confianza y el mejor precio"
          Barra de búsqueda con botón "Filtrar"
      */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#8B1820] via-[#B3202A] to-[#6E1017] text-white py-16 sm:py-24 px-4 sm:px-6 shadow-md">
        {/* Decorative background glow */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 text-rose-100 text-xs font-semibold backdrop-blur-xs border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Comercialización Directa de Ganado en Colombia</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Ganado Lechero y Ganado Carnal
          </h1>

          <p className="text-lg sm:text-2xl font-light text-rose-100 max-w-2xl mx-auto">
            Calidad, confianza y el mejor precio
          </p>

          {/* Search Bar with button "Filtrar" (as explicitly specified in Pantalla 1) */}
          <form 
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto mt-8 flex flex-col sm:flex-row items-center gap-2 bg-white p-2 rounded-2xl shadow-2xl border border-rose-200"
          >
            <div className="flex items-center gap-3 px-3 flex-1 w-full">
              <Search className="w-5 h-5 text-stone-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por raza (Holstein, Brahman, Angus...), peso o ID..."
                className="w-full text-stone-900 placeholder-stone-400 text-sm focus:outline-none py-2"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-[#B3202A] hover:bg-[#8B1820] text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Filtrar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Category Badges */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-rose-100">
            <span className="text-rose-200">Exploración rápida:</span>
            {categories.map((cat) => (
              <button
                key={cat.title}
                onClick={() => onNavigate('catalog', { category: cat.title })}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/25 transition-colors border border-white/15"
              >
                {cat.title}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Sección "Nuestros productos" con fondo rosa claro (#F9E3E3) y tarjetas de categoría
          (Vacas lecheras, Novillos, Terneros, Toros), precio desde y botón "Ver más".
      */}
      <section className="bg-[#F9E3E3] py-16 px-4 sm:px-6 border-y border-rose-200/80">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#B3202A]">
              Catálogo Especializado
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#8B1820] tracking-tight">
              Nuestros Productos
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto">
              Seleccione la categoría de su interés para visualizar los ejemplares con trazabilidad, pesaje exacto y disponibilidad en tiempo real.
            </p>
          </div>

          {/* 4 Category Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.title}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-rose-100 flex flex-col group"
              >
                {/* Category Image */}
                <div className="relative h-48 overflow-hidden bg-stone-100">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[#B3202A] text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-md">
                    {cat.badge}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-lg text-stone-900 group-hover:text-[#B3202A] transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1.5 leading-relaxed line-clamp-2">
                      {cat.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-100 space-y-3">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 block">
                        Precio desde
                      </span>
                      <span className="text-lg font-black text-[#B3202A]">
                        {formatCOP(cat.minPrice)}
                      </span>
                    </div>

                    <button
                      onClick={() => onNavigate('catalog', { category: cat.title })}
                      className="w-full py-2.5 px-4 bg-[#B3202A] hover:bg-[#8B1820] text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Ver más</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Featured Bovines Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#B3202A]">
              Disponibilidad Inmediata
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Ejemplares Destacados en Subasta
            </h2>
          </div>
          <button
            onClick={() => onNavigate('catalog')}
            className="text-xs font-bold text-[#B3202A] hover:text-[#8B1820] flex items-center gap-1.5"
          >
            <span>Ver todo el catálogo ({allBovines.length} bovinos)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredBovines.map((bovine) => (
            <div
              key={bovine.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-stone-200/80 flex flex-col group"
            >
              <div className="relative h-44 overflow-hidden bg-stone-100">
                <img
                  src={bovine.images[0]}
                  alt={bovine.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2.5 right-2.5 bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md">
                  {bovine.status}
                </div>
                <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded">
                  {bovine.id}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-stone-400">
                    {bovine.category} • {bovine.breed}
                  </span>
                  <h3 className="font-bold text-sm text-stone-900 truncate mt-0.5">
                    {bovine.name}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-stone-500 mt-2">
                    <span><strong>{bovine.weight}</strong> kg</span>
                    <span>•</span>
                    <span><strong>{bovine.age}</strong> meses</span>
                    <span>•</span>
                    <span>{bovine.sex}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-stone-400 block font-medium">Precio</span>
                    <span className="text-sm font-black text-[#B3202A]">
                      {formatCOP(bovine.price)}
                    </span>
                  </div>
                  <button
                    onClick={() => onNavigate('detail', { id: bovine.id })}
                    className="px-3.5 py-1.5 bg-stone-100 hover:bg-[#B3202A] hover:text-white text-stone-800 text-xs font-bold rounded-lg transition-colors"
                  >
                    Ver más
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Trust & Sanitary Verification Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="rounded-3xl bg-gradient-to-r from-stone-900 to-stone-800 text-white p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Garantía Sanitaria GanadoCarnes</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              ¿Por qué comprar a través de nuestra plataforma?
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              Cada bovino cuenta con verificación veterinaria previa, pesaje certificado en báscula digital calibrada, vacunación oficial al 100% y entrega con guía de movilización del Instituto Colombiano Agropecuario (ICA).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={() => onNavigate('catalog')}
              className="px-6 py-3 bg-[#B3202A] hover:bg-[#8B1820] text-white text-xs font-bold rounded-xl shadow-lg transition-colors text-center"
            >
              Explorar Catálogo Completo
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-colors text-center"
            >
              Contactar un Asesor
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
