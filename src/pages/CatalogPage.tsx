import type { View, Product } from "../types";
import { CATEGORIES } from "../types";
import { PRODUCTS } from "../data";
import ProductCard from "../components/ProductCard";

interface Props {
  navigate: (v: View) => void;
  onAddToCart: (p: Product) => void;
}

export default function CatalogPage({ navigate, onAddToCart }: Props) {
  const featured = PRODUCTS.slice(0, 6);

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

      {/* Featured products */}
      <div className="mb-3">
        <div className="font-mono-data text-[#00c8ff] text-xs tracking-widest uppercase mb-2">// Destacados</div>
        <h2 className="font-display font-700 text-2xl sm:text-3xl text-white section-title">Lo más pedido</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
        {featured.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            onAddToCart={() => onAddToCart(p)}
            onClick={() => navigate({ page: "product", id: p.id })}
          />
        ))}
      </div>

      {/* CTA to categories */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {CATEGORIES.slice(0, 3).map((cat) => {
          const catProducts = PRODUCTS.filter((p) => p.category === cat.slug);
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
