import React, { useState, useEffect, useMemo } from 'react';
import { bovineService, BOVINE_CHANGE_EVENT } from '../services/bovineService.ts';
import { formatCOP } from '../utils/formatters.ts';
import { Bovine, BovineCategory, BovineSex, FilterParams } from '../types/database.ts';
import { 
  ChevronRight, 
  Filter, 
  RotateCcw, 
  SlidersHorizontal, 
  Check, 
  Eye, 
  Tag, 
  ArrowUpDown,
  Search,
  Sparkles
} from 'lucide-react';

interface CatalogViewProps {
  initialFilters?: FilterParams;
  onNavigate: (view: string, params?: any) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({ initialFilters, onNavigate }) => {
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>(initialFilters?.category || 'Todos');
  const [selectedBreed, setSelectedBreed] = useState<string>(initialFilters?.breed || 'Todas');
  const [minWeight, setMinWeight] = useState<string>(initialFilters?.minWeight ? String(initialFilters.minWeight) : '');
  const [maxWeight, setMaxWeight] = useState<string>(initialFilters?.maxWeight ? String(initialFilters.maxWeight) : '');
  const [minAge, setMinAge] = useState<string>(initialFilters?.minAge ? String(initialFilters.minAge) : '');
  const [maxAge, setMaxAge] = useState<string>(initialFilters?.maxAge ? String(initialFilters.maxAge) : '');
  const [selectedSex, setSelectedSex] = useState<string>(initialFilters?.sex || 'Todos');
  const [minPrice, setMinPrice] = useState<string>(initialFilters?.minPrice ? String(initialFilters.minPrice) : '');
  const [maxPrice, setMaxPrice] = useState<string>(initialFilters?.maxPrice ? String(initialFilters.maxPrice) : '');
  const [searchTerm, setSearchTerm] = useState<string>(initialFilters?.search || '');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'weight_desc' | 'newest'>('newest');

  // Applied filter state (when user clicks "Aplicar filtros")
  const [appliedFilters, setAppliedFilters] = useState<FilterParams>({
    category: initialFilters?.category || 'Todos',
    breed: initialFilters?.breed || 'Todas',
    minWeight: initialFilters?.minWeight,
    maxWeight: initialFilters?.maxWeight,
    minAge: initialFilters?.minAge,
    maxAge: initialFilters?.maxAge,
    sex: initialFilters?.sex || 'Todos',
    minPrice: initialFilters?.minPrice,
    maxPrice: initialFilters?.maxPrice,
    search: initialFilters?.search || '',
    sortBy: 'newest'
  });

  const [bovines, setBovines] = useState<Bovine[]>([]);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Pagination (8 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const loadData = () => {
    const data = bovineService.getAll({
      ...appliedFilters,
      sortBy
    });
    setBovines(data);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener(BOVINE_CHANGE_EVENT, handleUpdate);
    return () => window.removeEventListener(BOVINE_CHANGE_EVENT, handleUpdate);
  }, [appliedFilters, sortBy]);

  // Synchronize when initialFilters change from navigation
  useEffect(() => {
    if (initialFilters) {
      if (initialFilters.category) setSelectedCategory(initialFilters.category);
      if (initialFilters.search) setSearchTerm(initialFilters.search);
      setAppliedFilters((prev) => ({
        ...prev,
        category: initialFilters.category || prev.category,
        search: initialFilters.search || prev.search
      }));
      setCurrentPage(1);
    }
  }, [initialFilters]);

  // Dynamic breeds list from catalog
  const availableBreeds = useMemo(() => {
    const all = bovineService.getAll();
    const unique = Array.from(new Set(all.map((b) => b.breed)));
    return ['Todas', ...unique];
  }, []);

  const handleApplyFilters = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAppliedFilters({
      category: selectedCategory,
      breed: selectedBreed,
      minWeight: minWeight ? parseFloat(minWeight) : undefined,
      maxWeight: maxWeight ? parseFloat(maxWeight) : undefined,
      minAge: minAge ? parseInt(minAge, 10) : undefined,
      maxAge: maxAge ? parseInt(maxAge, 10) : undefined,
      sex: selectedSex,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      search: searchTerm.trim()
    });
    setCurrentPage(1);
    setMobileFilterOpen(false);
  };

  const handleResetFilters = () => {
    setSelectedCategory('Todos');
    setSelectedBreed('Todas');
    setMinWeight('');
    setMaxWeight('');
    setMinAge('');
    setMaxAge('');
    setSelectedSex('Todos');
    setMinPrice('');
    setMaxPrice('');
    setSearchTerm('');
    setAppliedFilters({
      category: 'Todos',
      breed: 'Todas',
      sex: 'Todos'
    });
    setCurrentPage(1);
  };

  // Pagination calculation
  const totalPages = Math.ceil(bovines.length / ITEMS_PER_PAGE) || 1;
  const paginatedBovines = bovines.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Breadcrumb as explicitly specified: Inicio > Catálogo */}
      <div className="flex items-center gap-2 text-xs text-stone-500">
        <button 
          onClick={() => onNavigate('home')} 
          className="hover:text-[#B3202A] transition-colors"
        >
          Inicio
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="font-semibold text-stone-800">Catálogo</span>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="text-[#B3202A] font-bold">Bovinos</span>
      </div>

      {/* Page Title & Mobile Filter Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#8B1820] tracking-tight">
            Bovinos
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Mostrando <strong>{bovines.length}</strong> ejemplares encontrados
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort By selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-500 hidden sm:inline">Ordenar por:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-rose-300 shadow-xs cursor-pointer"
              >
                <option value="newest">Más reciente</option>
                <option value="price_asc">Precio: menor a mayor</option>
                <option value="price_desc">Precio: mayor a menor</option>
                <option value="weight_desc">Mayor peso (kg)</option>
              </select>
            </div>
          </div>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden flex items-center gap-1.5 px-3.5 py-2 bg-[#B3202A] text-white rounded-xl text-xs font-bold shadow-xs"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filtros</span>
          </button>
        </div>
      </div>

      {/* Main Layout: 2 Columns (Filters on Left, Grid on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Left Column Filters (Columna izquierda de filtros) */}
        <aside
          className={`lg:block ${
            mobileFilterOpen ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto' : 'hidden'
          } lg:relative lg:p-0 bg-white lg:bg-transparent rounded-2xl`}
        >
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-200 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2 text-[#8B1820] font-bold text-sm">
                <Filter className="w-4 h-4 text-[#B3202A]" />
                <span>Filtros de Búsqueda</span>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] text-stone-500 hover:text-[#B3202A] flex items-center gap-1 font-medium transition-colors"
                title="Limpiar filtros"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Limpiar</span>
              </button>
            </div>

            {/* Live Text Search */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                Búsqueda Rápida
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ID, nombre o ciudad..."
                  className="w-full pl-8 pr-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-300 focus:outline-none"
                />
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-3" />
              </div>
            </div>

            {/* 1. Categoría (Todos, Vacas lecheras, Novillos, Terneros, Toros) */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                Categoría
              </label>
              <div className="space-y-1">
                {['Todos', 'Vacas lecheras', 'Novillos', 'Terneros', 'Toros'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                      selectedCategory === cat
                        ? 'bg-[#F9E3E3] text-[#8B1820] font-bold'
                        : 'text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <span>{cat}</span>
                    {selectedCategory === cat && <Check className="w-3.5 h-3.5 text-[#B3202A]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Raza */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                Raza
              </label>
              <select
                value={selectedBreed}
                onChange={(e) => setSelectedBreed(e.target.value)}
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-xs bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-rose-300"
              >
                {availableBreeds.map((br) => (
                  <option key={br} value={br}>
                    {br}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Sexo */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                Sexo
              </label>
              <div className="grid grid-cols-3 gap-1 bg-stone-100 p-1 rounded-xl text-xs">
                {['Todos', 'Macho', 'Hembra'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSex(s)}
                    className={`py-1 rounded-lg text-center font-semibold transition-all ${
                      selectedSex === s
                        ? 'bg-white text-[#B3202A] shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Rango de Peso (en kg) */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                Rango de Peso (kg)
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <input
                    type="number"
                    min="0"
                    placeholder="Mín. (kg)"
                    value={minWeight}
                    onChange={(e) => setMinWeight(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-400"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    min="0"
                    placeholder="Máx. (kg)"
                    value={maxWeight}
                    onChange={(e) => setMaxWeight(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-400"
                  />
                </div>
              </div>
            </div>

            {/* 5. Rango de Edad (en meses) */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                Rango de Edad (Meses)
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <input
                    type="number"
                    min="0"
                    placeholder="Mín. meses"
                    value={minAge}
                    onChange={(e) => setMinAge(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-400"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    min="0"
                    placeholder="Máx. meses"
                    value={maxAge}
                    onChange={(e) => setMaxAge(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-400"
                  />
                </div>
              </div>
            </div>

            {/* 6. Rango de Precio */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                Rango de Precio ($)
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <input
                    type="number"
                    min="0"
                    step="500000"
                    placeholder="Precio mín."
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-400"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    min="0"
                    step="500000"
                    placeholder="Precio máx."
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-400"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons as specified: "Aplicar filtros" y "Limpiar filtros" */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => handleApplyFilters()}
                className="w-full py-2.5 bg-[#B3202A] hover:bg-[#8B1820] text-white font-bold rounded-xl text-xs shadow-md transition-colors"
              >
                Aplicar filtros
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl text-xs transition-colors"
              >
                Limpiar filtros
              </button>
              {mobileFilterOpen && (
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full py-2 text-stone-500 text-xs text-center"
                >
                  Cerrar panel
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Right Column: Cuadrícula de tarjetas (4 cols escritorio, 2 tablet, 1 móvil) */}
        <main className="lg:col-span-3 space-y-6">
          {paginatedBovines.length === 0 ? (
            /* Empty state */
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 flex items-center justify-center text-[#B3202A]">
                <Tag className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg text-stone-900">No se encontraron bovinos</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                No hay ejemplares que coincidan con los filtros aplicados. Intente ajustar el rango de peso, precio o limpiar los filtros.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-[#B3202A] text-white rounded-xl text-xs font-bold shadow hover:bg-[#8B1820] transition-colors"
              >
                Restablecer todos los filtros
              </button>
            </div>
          ) : (
            <>
              {/* Responsive Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {paginatedBovines.map((bovine) => {
                  const isAvailable = bovine.status === 'Disponible';
                  const isReserved = bovine.status === 'Reservado';
                  return (
                    <div
                      key={bovine.id}
                      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-200/90 flex flex-col group"
                    >
                      {/* Image + status badge */}
                      <div className="relative h-44 overflow-hidden bg-stone-100">
                        <img
                          src={bovine.images[0]}
                          alt={bovine.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Status Badge */}
                        <div className="absolute top-2.5 right-2.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md uppercase tracking-wide ${
                              isAvailable
                                ? 'bg-emerald-600 text-white'
                                : isReserved
                                ? 'bg-amber-500 text-white'
                                : 'bg-red-700 text-white'
                            }`}
                          >
                            {bovine.status}
                          </span>
                        </div>
                        {/* ID Tag */}
                        <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                          {bovine.id}
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-center justify-between text-[10px] font-bold text-stone-400 uppercase">
                            <span>{bovine.category}</span>
                            <span className="text-[#8B1820]">{bovine.breed}</span>
                          </div>
                          <h3 
                            onClick={() => onNavigate('detail', { id: bovine.id })}
                            className="font-bold text-sm text-stone-900 group-hover:text-[#B3202A] transition-colors truncate mt-1 cursor-pointer"
                            title={bovine.name}
                          >
                            {bovine.name}
                          </h3>

                          {/* Quick specs */}
                          <div className="mt-2 grid grid-cols-2 gap-1 text-[11px] text-stone-600 bg-stone-50 p-2 rounded-lg border border-stone-100">
                            <div>
                              <span className="text-stone-400 block text-[9px] uppercase">Peso</span>
                              <span className="font-bold">{bovine.weight} kg</span>
                            </div>
                            <div>
                              <span className="text-stone-400 block text-[9px] uppercase">Edad</span>
                              <span className="font-bold">{bovine.age} meses</span>
                            </div>
                          </div>
                        </div>

                        {/* Price & "Ver más" button */}
                        <div className="pt-3 border-t border-stone-100 space-y-2">
                          <div className="flex items-baseline justify-between">
                            <span className="text-[10px] uppercase font-semibold text-stone-400">
                              Precio
                            </span>
                            <span className="text-sm font-black text-[#B3202A]">
                              {formatCOP(bovine.price)}
                            </span>
                          </div>

                          <button
                            onClick={() => onNavigate('detail', { id: bovine.id })}
                            className="w-full py-2 bg-stone-100 hover:bg-[#B3202A] hover:text-white text-stone-800 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver más</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="pt-6 flex items-center justify-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50 disabled:opacity-40 transition-colors"
                  >
                    Anterior
                  </button>

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                          currentPage === pageNum
                            ? 'bg-[#B3202A] text-white shadow-sm'
                            : 'border border-stone-200 text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50 disabled:opacity-40 transition-colors"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
