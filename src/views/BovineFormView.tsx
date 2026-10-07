import React, { useState, useEffect } from 'react';
import { bovineService } from '../services/bovineService.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { calculateAgeMonths } from '../utils/formatters.ts';
import { Bovine, BovineCategory, BovineSex } from '../types/database.ts';
import { 
  ArrowLeft, 
  Save, 
  Sparkles, 
  ShieldAlert, 
  AlertCircle, 
  CheckCircle2, 
  Plus, 
  Trash2,
  Calendar,
  Image as ImageIcon
} from 'lucide-react';

interface BovineFormViewProps {
  editId?: string;
  onNavigate: (view: string, params?: any) => void;
}

export const BovineFormView: React.FC<BovineFormViewProps> = ({ editId, onNavigate }) => {
  const { isAdmin, user } = useAuth();
  const { showToast } = useToast();

  const isEditing = Boolean(editId);

  // Form states
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<BovineCategory>('Vacas lecheras');
  const [breed, setBreed] = useState('Holstein');
  const [sex, setSex] = useState<BovineSex>('Hembra');
  const [birthDay, setBirthDay] = useState('');
  const [calculatedAge, setCalculatedAge] = useState<number>(0);
  const [weight, setWeight] = useState<string>('');
  const [color, setColor] = useState('');
  const [price, setPrice] = useState<string>('');
  const [location, setLocation] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=1000&q=80'
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [status, setStatus] = useState<'Disponible' | 'Reservado' | 'Vendido'>('Disponible');

  // Real-time validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Auto-generate ID helper
  const handleGenerateId = () => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    setId(`BOV-${randomNum}`);
  };

  useEffect(() => {
    if (isEditing && editId) {
      const existing = bovineService.getById(editId);
      if (existing) {
        setId(existing.id);
        setName(existing.name);
        setCategory(existing.category);
        setBreed(existing.breed);
        setSex(existing.sex);
        setBirthDay(existing.birthDay);
        setCalculatedAge(existing.age);
        setWeight(String(existing.weight));
        setColor(existing.color);
        setPrice(String(existing.price));
        setLocation(existing.location);
        setShortDescription(existing.shortDescription);
        setFullDescription(existing.fullDescription);
        setImageUrls(existing.images);
        setStatus(existing.status);
      }
    } else {
      // Default auto-ID for new
      handleGenerateId();
      setBirthDay('2023-06-15');
      setCalculatedAge(calculateAgeMonths('2023-06-15'));
      setLocation('Montería, Córdoba');
    }
  }, [editId, isEditing]);

  // Recalculate age when birthDay changes
  useEffect(() => {
    if (birthDay) {
      const age = calculateAgeMonths(birthDay);
      setCalculatedAge(age);
    }
  }, [birthDay]);

  // Validation function
  const validateField = (field: string, value: any): string => {
    switch (field) {
      case 'id':
        if (!value || !value.trim()) return 'El ID del bovino es obligatorio.';
        if (!isEditing) {
          const exists = bovineService.getById(value.trim());
          if (exists) return 'Ya existe un bovino con este ID.';
        }
        return '';
      case 'name':
        if (!value || !value.trim()) return 'El nombre o identificación es obligatorio.';
        if (value.trim().length < 3) return 'El nombre debe tener al menos 3 caracteres.';
        return '';
      case 'weight':
        const w = parseFloat(value);
        if (isNaN(w) || w <= 0) return 'El peso debe ser un número positivo mayor que 0.';
        return '';
      case 'price':
        const p = parseFloat(value);
        if (isNaN(p) || p <= 0) return 'El precio debe ser un número positivo mayor que 0.';
        return '';
      case 'birthDay':
        if (!value) return 'La fecha de nacimiento es obligatoria.';
        if (new Date(value) > new Date()) return 'La fecha de nacimiento no puede ser futura.';
        return '';
      case 'color':
        if (!value || !value.trim()) return 'El color o tipo de capa es obligatorio.';
        return '';
      case 'location':
        if (!value || !value.trim()) return 'La ubicación o predio es obligatoria.';
        return '';
      case 'shortDescription':
        if (!value || !value.trim()) return 'La descripción corta es obligatoria.';
        return '';
      default:
        return '';
    }
  };

  const handleBlur = (field: string, value: any) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  // Guard: Solo Administradores
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl shadow-xl border border-rose-200 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-rose-100 flex items-center justify-center text-[#B3202A]">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-stone-900">Acceso Restringido</h2>
        <p className="text-xs text-stone-600">
          Esta vista está reservada exclusivamente para usuarios con rol de <strong>Administrador</strong>.
        </p>
        <button
          onClick={() => onNavigate('home')}
          className="px-5 py-2.5 bg-[#B3202A] text-white rounded-xl text-xs font-bold hover:bg-[#8B1820]"
        >
          Volver a la página principal
        </button>
      </div>
    );
  }

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImageUrls((prev) => [...prev, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    if (imageUrls.length <= 1) {
      alert('Debe mantener al menos una imagen para el ejemplar.');
      return;
    }
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all
    const allErrors: Record<string, string> = {
      id: validateField('id', id),
      name: validateField('name', name),
      weight: validateField('weight', weight),
      price: validateField('price', price),
      birthDay: validateField('birthDay', birthDay),
      color: validateField('color', color),
      location: validateField('location', location),
      shortDescription: validateField('shortDescription', shortDescription)
    };

    setErrors(allErrors);
    setTouched({
      id: true,
      name: true,
      weight: true,
      price: true,
      birthDay: true,
      color: true,
      location: true,
      shortDescription: true
    });

    const hasError = Object.values(allErrors).some((err) => Boolean(err));
    if (hasError) {
      showToast('Por favor corrija los campos marcados en rojo antes de guardar.', 'error');
      return;
    }

    try {
      if (isEditing && editId) {
        bovineService.update(
          editId,
          {
            name: name.trim(),
            category,
            breed,
            sex,
            birthDay,
            weight: parseFloat(weight),
            color: color.trim(),
            price: parseFloat(price),
            location: location.trim(),
            shortDescription: shortDescription.trim(),
            fullDescription: fullDescription.trim() || shortDescription.trim(),
            status,
            images: imageUrls
          },
          user?.name || 'Administrador'
        );
        showToast(`Bovino ${name} actualizado exitosamente`, 'success');
        onNavigate('detail', { id: editId });
      } else {
        const created = bovineService.create(
          {
            id: id.trim().toUpperCase(),
            name: name.trim(),
            category,
            breed,
            sex,
            birthDay,
            weight: parseFloat(weight),
            color: color.trim(),
            price: parseFloat(price),
            location: location.trim(),
            status: 'Disponible',
            registerDay: new Date().toISOString().split('T')[0],
            shortDescription: shortDescription.trim(),
            fullDescription: fullDescription.trim() || shortDescription.trim(),
            characteristics: [
              `Peso registrado: ${weight} kg`,
              `Categoría: ${category}`,
              `Procedencia: ${location}`,
              'Plan sanitario verificado'
            ],
            healthHistory: {
              sanitaryRegistry: 'ICA-CERT-2026',
              aftosaVaccine: new Date().toISOString().split('T')[0],
              brucelosisVaccine: sex === 'Hembra' ? 'Vigente' : 'N/A',
              dewormingDate: new Date().toISOString().split('T')[0],
              certified: true
            },
            images: imageUrls
          },
          user?.name || 'Administrador'
        );
        showToast(`¡Bovino ${created.name} (${created.id}) registrado con éxito!`, 'success');
        onNavigate('detail', { id: created.id });
      }
    } catch (err: any) {
      showToast(err.message || 'Error al guardar bovino', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate(isEditing ? 'detail' : 'catalog', { id: editId })}
          className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-[#B3202A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver</span>
        </button>
        <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
          Modo Administrador
        </span>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
        {/* Form Title Banner */}
        <div className="p-6 sm:p-8 bg-stone-900 text-white flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              {isEditing ? `Editar Bovino: ${id}` : 'Registrar Nuevo Bovino'}
            </h1>
            <p className="text-xs text-stone-400 mt-1">
              Complete los datos zootécnicos del ejemplar. Todos los valores numéricos deben ser mayores a 0.
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#B3202A] flex items-center justify-center text-white font-bold">
            🐂
          </div>
        </div>

        {/* Main Form (Pantalla 4) */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          
          {/* Row 1: ID & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-stone-700">
                  ID Único del Bovino *
                </label>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={handleGenerateId}
                    className="text-[10px] font-semibold text-[#B3202A] hover:underline"
                  >
                    Auto-generar
                  </button>
                )}
              </div>
              <input
                type="text"
                disabled={isEditing}
                value={id}
                onChange={(e) => setId(e.target.value.toUpperCase())}
                onBlur={(e) => handleBlur('id', e.target.value)}
                placeholder="Ej. BOV-105"
                className={`w-full px-3 py-2 border rounded-xl text-xs font-mono font-bold focus:outline-none ${
                  touched.id && errors.id ? 'border-red-500 bg-red-50' : 'border-stone-200 focus:ring-2 focus:ring-rose-300'
                }`}
              />
              {touched.id && errors.id && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.id}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Nombre o Identificación *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={(e) => handleBlur('name', e.target.value)}
                placeholder="Ej. Reina Holstein de la Pradera"
                className={`w-full px-3 py-2 border rounded-xl text-xs font-medium focus:outline-none ${
                  touched.name && errors.name ? 'border-red-500 bg-red-50' : 'border-stone-200 focus:ring-2 focus:ring-rose-300'
                }`}
              />
              {touched.name && errors.name && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.name}</p>
              )}
            </div>
          </div>

          {/* Row 2: Categoría, Raza, Sexo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Categoría *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BovineCategory)}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-300"
              >
                <option value="Vacas lecheras">Vacas lecheras</option>
                <option value="Novillos">Novillos</option>
                <option value="Terneros">Terneros</option>
                <option value="Toros">Toros</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Raza *
              </label>
              <select
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-300"
              >
                <option value="Holstein">Holstein</option>
                <option value="Jersey">Jersey</option>
                <option value="Brahman">Brahman</option>
                <option value="Angus">Angus</option>
                <option value="Simmental">Simmental</option>
                <option value="Brangus">Brangus</option>
                <option value="Gyr">Gyr</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Sexo *
              </label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value as BovineSex)}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-300"
              >
                <option value="Hembra">Hembra</option>
                <option value="Macho">Macho</option>
              </select>
            </div>
          </div>

          {/* Row 3: Fecha de Nacimiento (auto-calcula edad) & Peso (kg) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Fecha de Nacimiento *
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={birthDay}
                  onChange={(e) => setBirthDay(e.target.value)}
                  onBlur={(e) => handleBlur('birthDay', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl text-xs focus:outline-none ${
                    touched.birthDay && errors.birthDay ? 'border-red-500 bg-red-50' : 'border-stone-200 focus:ring-2 focus:ring-rose-300'
                  }`}
                />
              </div>
              {touched.birthDay && errors.birthDay && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.birthDay}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Edad Calculada Automáticamente
              </label>
              <div className="px-3 py-2 border border-stone-200 rounded-xl bg-stone-50 text-xs font-bold text-stone-800 flex items-center justify-between">
                <span>{calculatedAge} meses</span>
                <span className="text-[10px] text-stone-400 font-normal">
                  (~{(calculatedAge / 12).toFixed(1)} años)
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Peso (kg, mayor que 0) *
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                onBlur={(e) => handleBlur('weight', e.target.value)}
                placeholder="Ej. 540"
                className={`w-full px-3 py-2 border rounded-xl text-xs font-bold focus:outline-none ${
                  touched.weight && errors.weight ? 'border-red-500 bg-red-50' : 'border-stone-200 focus:ring-2 focus:ring-rose-300'
                }`}
              />
              {touched.weight && errors.weight && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.weight}</p>
              )}
            </div>
          </div>

          {/* Row 4: Precio (>0), Color, Ubicación */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Precio (COP, mayor que 0) *
              </label>
              <input
                type="number"
                step="50000"
                min="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                onBlur={(e) => handleBlur('price', e.target.value)}
                placeholder="Ej. 6500000"
                className={`w-full px-3 py-2 border rounded-xl text-xs font-bold text-[#B3202A] focus:outline-none ${
                  touched.price && errors.price ? 'border-red-500 bg-red-50' : 'border-stone-200 focus:ring-2 focus:ring-rose-300'
                }`}
              />
              {touched.price && errors.price && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Color y Capa *
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                onBlur={(e) => handleBlur('color', e.target.value)}
                placeholder="Ej. Blanco y negro overo"
                className={`w-full px-3 py-2 border rounded-xl text-xs focus:outline-none ${
                  touched.color && errors.color ? 'border-red-500 bg-red-50' : 'border-stone-200 focus:ring-2 focus:ring-rose-300'
                }`}
              />
              {touched.color && errors.color && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.color}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Ubicación / Predio *
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onBlur={(e) => handleBlur('location', e.target.value)}
                placeholder="Ej. Sopó, Cundinamarca"
                className={`w-full px-3 py-2 border rounded-xl text-xs focus:outline-none ${
                  touched.location && errors.location ? 'border-red-500 bg-red-50' : 'border-stone-200 focus:ring-2 focus:ring-rose-300'
                }`}
              />
              {touched.location && errors.location && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.location}</p>
              )}
            </div>
          </div>

          {/* Status selector (if editing) */}
          {isEditing && (
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Estado del Bovino
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['Disponible', 'Reservado', 'Vendido'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(st as any)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      status === st
                        ? 'border-[#B3202A] bg-[#F9E3E3] text-[#8B1820]'
                        : 'border-stone-200 bg-stone-50 text-stone-600'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Descriptions */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Descripción Corta *
            </label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              onBlur={(e) => handleBlur('shortDescription', e.target.value)}
              placeholder="Ej. Ejemplar lechero con 26 Lts diarios comprobados en dos ordeños."
              className={`w-full px-3 py-2 border rounded-xl text-xs focus:outline-none ${
                touched.shortDescription && errors.shortDescription ? 'border-red-500 bg-red-50' : 'border-stone-200 focus:ring-2 focus:ring-rose-300'
              }`}
            />
            {touched.shortDescription && errors.shortDescription && (
              <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.shortDescription}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Descripción Detallada y Genealogía (Opcional)
            </label>
            <textarea
              rows={3}
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              placeholder="Detalles sobre aplomos, ubre, padre, madre o registro de asociación..."
              className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>

          {/* Images Management */}
          <div className="space-y-3 pt-2 border-t border-stone-100">
            <label className="block text-xs font-bold text-stone-700">
              Imágenes del Ejemplar (URLs de fotografías)
            </label>
            
            <div className="flex gap-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Pegar URL de imagen (https://...)"
                className="flex-1 px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Imagen</span>
              </button>
            </div>

            {/* Images List */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {imageUrls.map((url, i) => (
                <div key={i} className="relative group rounded-xl overflow-hidden border border-stone-200 aspect-video bg-stone-100">
                  <img src={url} alt={`Imagen ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(i)}
                    className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-lg opacity-80 hover:opacity-100 transition-opacity"
                    title="Eliminar foto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-6 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => onNavigate(isEditing ? 'detail' : 'catalog', { id: editId })}
              className="px-5 py-2.5 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#B3202A] hover:bg-[#8B1820] text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Guardar Cambios' : 'Registrar Bovino en Hato'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
