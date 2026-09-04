import { useState } from "react";
import type { View, Product, CartItem, FilamentColor } from "../types";
import { PRODUCTS } from "../data";
import { CATEGORIES } from "../types";

interface Props {
  productId: number;
  navigate: (v: View) => void;
  onAddToCart: (item: CartItem) => void;
}

export default function ProductDetailPage({ productId, navigate, onAddToCart }: Props) {
  const product = PRODUCTS.find((p) => p.id === productId);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="font-mono-data text-[#5a7090]">Producto no encontrado.</p>
        <button onClick={() => navigate({ page: "catalog" })} className="mt-4 text-[#00c8ff] font-mono-data text-sm hover:underline">
          ← Volver al catálogo
        </button>
      </div>
    );
  }

  const [selectedColor, setSelectedColor] = useState<FilamentColor>(product.colors[0]);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);

  const cat = CATEGORIES.find((c) => c.slug === product.category);
  const images = product.images || [product.image];
  const related = PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 3);

  const handleAdd = () => {
    onAddToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      qty,
      type: "product",
      image: product.image,
      selectedColor: selectedColor.name,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    onAddToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      qty,
      type: "product",
      image: product.image,
      selectedColor: selectedColor.name,
    });
    navigate({ page: "checkout" });
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8 font-mono-data text-xs text-[#5a7090] flex-wrap">
        <button onClick={() => navigate({ page: "catalog" })} className="hover:text-[#00c8ff] transition-colors">Catálogo</button>
        <span>/</span>
        <button onClick={() => navigate({ page: "category", slug: product.category })} className="hover:text-[#00c8ff] transition-colors" style={{ color: cat?.accent }}>
          {cat?.label}
        </button>
        <span>/</span>
        <span className="text-[#a0b0c8]">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Images */}
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded border border-[rgba(0,200,255,0.1)] bg-[#0f1520] h-80 sm:h-96">
            <img
              src={images[activeImg]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f1520]/30 to-transparent" />
            <span
              className="absolute top-4 left-4 font-mono-data text-[10px] px-2 py-0.5 rounded"
              style={{ background: `${product.tagColor}22`, color: product.tagColor, border: `1px solid ${product.tagColor}44` }}
            >
              {product.tag}
            </span>
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 rounded overflow-hidden border transition-all ${
                    activeImg === i ? "border-[#00c8ff]" : "border-[rgba(0,200,255,0.1)] opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <div className="font-mono-data text-[10px] tracking-widest uppercase mb-1" style={{ color: cat?.accent }}>
              {cat?.icon} {cat?.label}
            </div>
            <h1 className="font-display font-700 text-3xl sm:text-4xl text-white leading-tight">{product.name}</h1>
            <p className="text-[#5a7090] mt-3 text-sm leading-relaxed">{product.description}</p>
          </div>

          {/* Price */}
          <div className="flex items-end gap-3">
            <span className="font-display font-700 text-4xl text-white">
              <span className="text-[#5a7090] text-xl font-400 font-mono-data">$</span>
              {product.price.toLocaleString("es-AR")}
            </span>
            <span className="font-mono-data text-xs text-[#00dc64] mb-1">● En stock ({product.stock} disponibles)</span>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Material", value: product.material },
              { label: "Tiempo", value: product.printTime },
              { label: "Capa", value: product.layer },
              { label: "Relleno", value: product.infill },
            ].map((spec) => (
              <div key={spec.label} className="bg-[#111928] rounded p-3 border border-[rgba(0,200,255,0.06)]">
                <div className="font-mono-data text-[9px] text-[#5a7090] tracking-widest uppercase">{spec.label}</div>
                <div className="font-display font-700 text-sm text-white mt-1">{spec.value}</div>
              </div>
            ))}
          </div>

          {/* Color selector */}
          <div>
            <div className="font-mono-data text-[10px] text-[#5a7090] tracking-widest uppercase mb-3">
              Filamento / Color: <span className="text-[#a0b0c8]">{selectedColor.name}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((color) => (
                <button
                  key={color.name}
                  title={color.name}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full transition-all duration-150 ${
                    selectedColor.name === color.name ? "ring-2 ring-[#00c8ff] ring-offset-2 ring-offset-[#0f1520] scale-110" : "hover:scale-105"
                  }`}
                  style={{ background: color.hex, border: "2px solid rgba(255,255,255,0.1)" }}
                />
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <div className="font-mono-data text-[10px] text-[#5a7090] tracking-widest uppercase mb-3">Cantidad</div>
            <div className="flex items-center gap-3">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-10 h-10 rounded bg-[#111928] border border-[rgba(0,200,255,0.1)] text-[#00c8ff] hover:bg-[rgba(0,200,255,0.1)] transition-colors flex items-center justify-center font-display font-700 text-lg">
                −
              </button>
              <span className="font-mono-data font-700 text-xl text-white w-8 text-center">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="w-10 h-10 rounded bg-[#111928] border border-[rgba(0,200,255,0.1)] text-[#00c8ff] hover:bg-[rgba(0,200,255,0.1)] transition-colors flex items-center justify-center font-display font-700 text-lg">
                +
              </button>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleAdd}
              className={`flex-1 py-3 px-6 rounded font-display font-700 text-sm tracking-widest uppercase transition-all duration-200 ${
                added
                  ? "bg-[#00dc64] text-[#080b0f]"
                  : "bg-[rgba(0,200,255,0.1)] text-[#00c8ff] border border-[rgba(0,200,255,0.3)] hover:bg-[#00c8ff] hover:text-[#080b0f]"
              }`}
            >
              {added ? "✓ Agregado al carrito" : "+ Añadir al Carrito"}
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 py-3 px-6 rounded bg-[#ff6b2b] hover:bg-[#ff8a50] text-white font-display font-700 text-sm tracking-widest uppercase transition-colors"
            >
              Comprar Ahora →
            </button>
          </div>

          {/* WhatsApp link */}
          <button
            onClick={() => {
              const msg = `Hola M's3D! Me interesa: *${product.name}* — Color: ${selectedColor.name} — Cantidad: ${qty}. ¿Tienen disponibilidad?`;
              window.open(`https://wa.me/5491100000000?text=${encodeURIComponent(msg)}`, "_blank");
            }}
            className="flex items-center gap-2 text-[#25d366] font-mono-data text-xs hover:underline transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>
            Consultar disponibilidad por WhatsApp
          </button>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-14 pt-8 border-t border-[rgba(0,200,255,0.08)]">
          <div className="font-mono-data text-[10px] text-[#5a7090] tracking-widest uppercase mb-2">// También te puede interesar</div>
          <h3 className="font-display font-700 text-xl text-white mb-6">Más de {cat?.label}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {related.map((p) => (
              <button
                key={p.id}
                onClick={() => navigate({ page: "product", id: p.id })}
                className="text-left bg-[#0f1520] border border-[rgba(0,200,255,0.08)] rounded overflow-hidden hover:border-[rgba(0,200,255,0.25)] transition-all group"
              >
                <div className="h-36 overflow-hidden">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-400" />
                </div>
                <div className="p-3">
                  <p className="font-display font-700 text-sm text-white truncate">{p.name}</p>
                  <p className="font-display font-700 text-base text-[#00c8ff] mt-1">${p.price.toLocaleString("es-AR")}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
