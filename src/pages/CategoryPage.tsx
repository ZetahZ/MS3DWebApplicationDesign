import { useState, useEffect } from "react";
import type { View, CategorySlug, Product } from "../types";
import { CATEGORIES } from "../types";
import ProductCard from "../components/ProductCard";

interface Props {
  slug: CategorySlug;
  navigate: (v: View) => void;
  onAddToCart: (p: Product) => void;
}

// Mapeo de los slugs del frontend al ID numérico de tu base de datos PostgreSQL
const CATEGORY_ID_MAP: Record<CategorySlug, number> = {
  "juguetes": 7,
  "llaveros": 2, 
  "macetas": 3,
  "figuras": 4,
  "fidgets": 5,
  "repuestos": 6,
};

export default function CategoryPage({ slug, navigate, onAddToCart }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc">("default");
  
  const cat = CATEGORIES.find((c) => c.slug === slug)!;

  useEffect(() => {
    const fetchProductsByCategory = async () => {
      setLoading(true);
      try {
        const categoryId = CATEGORY_ID_MAP[slug] || 1;
        const res = await fetch(`http://127.0.0.1:8000/api/v1/productos/categoria/${categoryId}`);
        const data = await res.json();
        
        // Mapeamos los datos del backend (español) a la estructura que ProductCard espera (inglés)
        const mappedProducts = data.map((item: any) => ({
          ...item,
          name: item.nombre || item.name,
          price: item.precio ?? item.price,
          image: item.imagen || item.image || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60",
        }));

        setProducts(mappedProducts);
      } catch (error) {
        console.error("Error al cargar productos de la API:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsByCategory();
  }, [slug]);

  let sortedProducts = [...products];
  if (sortBy === "price-asc") sortedProducts.sort((a, b) => a.price - b.price);
  if (sortBy === "price-desc") sortedProducts.sort((a, b) => b.price - a.price);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 font-mono-data text-xs text-[#5a7090]">
        <button onClick={() => navigate({ page: "catalog" })} className="hover:text-[#00c8ff] transition-colors">Catálogo</button>
        <span>/</span>
        <span style={{ color: cat.accent }}>{cat.label}</span>
      </div>

      {/* Category header */}
      <div className="relative overflow-hidden rounded border p-8 mb-8" style={{ borderColor: `${cat.accent}33`, background: `${cat.accent}08` }}>
        <div className="flex items-start gap-6">
          <div className="text-6xl opacity-80">{cat.icon}</div>
          <div>
            <div className="font-mono-data text-xs tracking-widest uppercase mb-1" style={{ color: cat.accent }}>
              // Categoría
            </div>
            <h1 className="font-display font-700 text-3xl sm:text-4xl text-white">{cat.label}</h1>
            <p className="text-[#5a7090] mt-2 text-sm max-w-lg">{cat.description}</p>
            <div className="flex gap-3 mt-4 flex-wrap">
              <span className="font-mono-data text-[10px] px-3 py-1 rounded-full text-white" style={{ background: `${cat.accent}22`, border: `1px solid ${cat.accent}44` }}>
                {sortedProducts.length} productos
              </span>
              <span className="font-mono-data text-[10px] px-3 py-1 rounded-full bg-[rgba(0,200,255,0.1)] text-[#00c8ff] border border-[rgba(0,200,255,0.2)]">
                Envío a todo el país
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div className="font-mono-data text-xs text-[#5a7090]">
          {sortedProducts.length} resultado{sortedProducts.length !== 1 ? "s" : ""}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono-data text-[10px] text-[#5a7090] uppercase tracking-widest">Ordenar:</span>
          {(["default", "price-asc", "price-desc"] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setSortBy(opt)}
              className={`font-mono-data text-[10px] px-3 py-1.5 rounded transition-colors ${
                sortBy === opt
                  ? "bg-[rgba(0,200,255,0.15)] text-[#00c8ff] border border-[rgba(0,200,255,0.3)]"
                  : "text-[#5a7090] border border-[rgba(255,255,255,0.06)] hover:text-[#a0b0c8]"
              }`}
            >
              {opt === "default" ? "Relevancia" : opt === "price-asc" ? "Menor precio" : "Mayor precio"}
            </button>
          ))}
        </div>
      </div>

      {/* Products grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-[#00c8ff] font-mono-data text-sm">
          Cargando productos desde la base de datos...
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-[#5a7090]">
          <span className="text-5xl mb-4">{cat.icon}</span>
          <p className="font-mono-data text-sm">Sin productos en esta categoría aún.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {sortedProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onAddToCart={() => onAddToCart(p)}
              onClick={() => navigate({ page: "product", id: p.id })}
            />
          ))}
        </div>
      )}

      {/* Other categories */}
      <div className="mt-12 pt-8 border-t border-[rgba(0,200,255,0.08)]">
        <div className="font-mono-data text-[10px] text-[#5a7090] tracking-widest uppercase mb-4">// Otras categorías</div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.filter((c) => c.slug !== slug).map((c) => (
            <button
              key={c.slug}
              onClick={() => navigate({ page: "category", slug: c.slug })}
              className="flex items-center gap-2 px-4 py-2 rounded bg-[#0f1520] border border-[rgba(0,200,255,0.08)] hover:border-[rgba(0,200,255,0.25)] transition-all font-display font-600 text-sm text-[#a0b0c8] hover:text-white"
            >
              <span>{c.icon}</span> {c.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}