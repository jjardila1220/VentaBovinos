import { Link } from "@remix-run/react";
import { formatCOP } from "~/utils/formatters.ts";
import { Eye } from "lucide-react";

interface BovineCardProps {
  bovine: {
    id: number;
    name: string;
    breedName?: string | null;
    category: string;
    sex: string;
    weight: string | number;
    price: string | number;
    imageUrls?: string[] | null;
    status: "Disponible" | "Reservado" | "Vendido";
    location?: string | null;
  };
}

export function BovineCard({ bovine }: BovineCardProps) {
  const isAvailable = bovine.status === "Disponible";
  const isReserved = bovine.status === "Reservado";
  const image = bovine.imageUrls?.[0] || "https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-200/90 flex flex-col group">
      {/* Imagen */}
      <div className="relative h-44 overflow-hidden bg-stone-100">
        <img
          src={image}
          alt={bovine.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {/* Status Badge */}
        <div className="absolute top-2.5 right-2.5">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md uppercase tracking-wide ${
              isAvailable
                ? "bg-emerald-600 text-white"
                : isReserved
                ? "bg-amber-500 text-white"
                : "bg-red-700 text-white"
            }`}
          >
            {bovine.status}
          </span>
        </div>
        {/* ID Tag */}
        <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold">
          #{bovine.id}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-[10px] font-bold text-stone-400 uppercase">
            <span>{bovine.category}</span>
            <span className="text-[#8B1820]">{bovine.breedName || "Puro"}</span>
          </div>
          <Link to={`/bovinos/${bovine.id}`}>
            <h3
              className="font-bold text-sm text-stone-900 group-hover:text-[#B3202A] transition-colors truncate mt-1 cursor-pointer"
              title={bovine.name}
            >
              {bovine.name}
            </h3>
          </Link>
          <div className="mt-2 flex items-center gap-3 text-xs text-stone-500 bg-stone-50 p-2 rounded-lg border border-stone-100">
            <span><strong>{bovine.weight}</strong> kg</span>
            <span>•</span>
            <span>{bovine.sex}</span>
            {bovine.location && (
              <>
                <span>•</span>
                <span className="truncate max-w-[90px]">{bovine.location.split(",")[0]}</span>
              </>
            )}
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

          <Link
            to={`/bovinos/${bovine.id}`}
            className="w-full py-2 bg-stone-100 hover:bg-[#B3202A] hover:text-white text-stone-800 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Ver más</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
