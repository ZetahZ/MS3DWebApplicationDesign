import { useState } from "react";
import type { View, Product } from "../types";
import { CATEGORIES } from "../types";
import ProductCard from "../components/ProductCard";

interface Props {
  navigate: (v: View) => void;
  onAddToCart: (p: Product) => void;
  products?: any[]; // Recibe los productos de la base de datos
  loading?: boolean; // Estado de carga opcional
}

type Orden = "original" | "az" | "za" | "precio-asc" | "precio-desc";

export default function CatalogPage({ navigate, onAddToCart, products = [], loading = false }: Props) {
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState<Orden>("original");

  const texto = busqueda.trim().toLowerCase();
  const filtrados = products.filter(
    (p) =>
      texto === "" ||
      (p.name || "").toLowerCase().includes(texto) ||
      (p.material || "").toLowerCase().includes(texto) ||
      (p.tag || "").toLowerCase().includes(texto)
  );

  const ordenados = [...filtrados].sort((a, b) => {
    switch (orden) {
      case "az":
        return (a.name || "").localeCompare(b.name || "", "es");
      case "za":
        return (b.name || "").localeCompare(a.name || "", "es");
      case "precio-asc":
        return (a.price ?? 0) - (b.price ?? 0);
      case "precio-desc":
        return (b.price ?? 0) - (a.price ?? 0);
      default:
        return 0;
    }
  });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Hero strip */}
      <div className="relative overflow-hidden rounded border border-[rgba(0,200,255,0.1)] bg-[#0f1520] mb-10 p-8 sm:p-12">
        <div className="absolute inset-0 bg-gradient-to-r from-[#080b0f] via-transparent to-transparent z-10" />
        <img
          src="https://images.unsplash.com/photo-1563770660941-20978e870e26?w=1200&h=400&fit=crop&auto=format"
          alt="Taller de impresión 3D"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative z-20">
          <div className="font-mono-data text-[#00c8ff] text-xs tracking-widest uppercase mb-2">// Impresión 3D Argentina</div>
          <h1 className="font-display font-700 text-4xl sm:text-5xl text-white leading-tight">
            Todo lo que<br /><span className="text-[#00c8ff] text-glow">imprimimos</span>
          </h1>
          <p className="text-[#5a7090] mt-4 max-w-lg text-sm">Desde juguetes articulados hasta repuestos técnicos. Cada pieza sale directo del taller a tu puerta.</p>
        </div>
      </div>

      {/* Category grid */}
      <div className="mb-10">
        <div className="font-mono-data text-[#5a7090] text-xs tracking-widest uppercase mb-4">// Navegar por categoría</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => navigate({ page: "category", slug: cat.slug })}
              className="flex flex-col items-center gap-2 p-4 bg-[#0f1520] border border-[rgba(0,200,255,0.08)] rounded hover:border-[rgba(0,200,255,0.25)] transition-all duration-200 group"
              style={{ "--cat-accent": cat.accent } as React.CSSProperties}
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="font-display font-600 text-xs text-center text-[#a0b0c8] group-hover:text-white transition-colors leading-tight">
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Buscador + orden */}
      <div className="mb-6">
        <div className="font-mono-data text-[#00c8ff] text-xs tracking-widest uppercase mb-2">// Catálogo completo</div>
        <h2 className="font-display font-700 text-2xl sm:text-3xl text-white section-title mb-5">Todos los productos</h2>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Input con lupita */}
          <div className="relative flex-1">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#5a7090"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" />
            </svg>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar productos, material..."
              className="w-full bg-[#0f1520] border border-[rgba(0,200,255,0.15)] rounded pl-10 pr-10 py-2.5 font-mono-data text-sm text-white placeholder-[#5a7090] focus:outline-none focus:border-[#00c8ff] transition-colors"
            />
            {busqueda !== "" && (
              <button
                onClick={() => setBusqueda("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a7090] hover:text-white transition-colors text-sm"
                aria-label="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>

          {/* Selector de orden */}
          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value as Orden)}
            className="bg-[#0f1520] border border-[rgba(0,200,255,0.15)] rounded px-4 py-2.5 font-mono-data text-sm text-[#a0b0c8] focus:outline-none focus:border-[#00c8ff] cursor-pointer transition-colors"
          >
            <option value="original">Orden original</option>
            <option value="az">Nombre: A → Z</option>
            <option value="za">Nombre: Z → A</option>
            <option value="precio-asc">Precio: menor a mayor</option>
            <option value="precio-desc">Precio: mayor a menor</option>
          </select>
        </div>

        {/* Contador de resultados */}
        {!loading && products.length > 0 && (
          <p className="font-mono-data text-[10px] text-[#5a7090] mt-3">
            {ordenados.length} de {products.length} productos
            {busqueda !== "" && ` · "${busqueda}"`}
          </p>
        )}
      </div>

      {loading ? (
        <p className="text-[#00c8ff] font-mono-data text-sm py-10">Cargando productos desde la base de datos...</p>
      ) : products.length === 0 ? (
        <p className="text-[#5a7090] font-mono-data text-sm py-10">No hay productos cargados en la base de datos todavía. ¡Agrega algunos desde la API o Swagger!</p>
      ) : ordenados.length === 0 ? (
        <p className="text-[#5a7090] font-mono-data text-sm py-10">
          No se encontraron productos para "{busqueda}". Probá con otra palabra.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
          {ordenados.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onAddToCart={() => onAddToCart(p)}
              onClick={() => navigate({ page: "product", id: p.id })}
            />
          ))}
        </div>
      )}

      {/* CTA to categories */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {CATEGORIES.slice(0, 3).map((cat) => {
          const catProducts = products.filter((p) => p.category === cat.slug);
          return (
            <button
              key={cat.slug}
              onClick={() => navigate({ page: "category", slug: cat.slug })}
              className="relative overflow-hidden rounded border border-[rgba(0,200,255,0.08)] bg-[#0f1520] p-6 text-left hover:border-[rgba(0,200,255,0.2)] transition-all group"
            >
              <div className="text-3xl mb-2">{cat.icon}</div>
              <div className="font-display font-700 text-base text-white">{cat.label}</div>
              <div className="font-mono-data text-[10px] text-[#5a7090] mt-1">{catProducts.length} productos</div>
              <div className="mt-3 font-mono-data text-xs text-[#00c8ff] group-hover:translate-x-1 transition-transform">
                Ver categoría →
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
