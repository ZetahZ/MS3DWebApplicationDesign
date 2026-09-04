import { useState } from "react";
import type { Product } from "../types";

interface Props {
  product: Product;
  onAddToCart: () => void;
  onClick: () => void;
}

export default function ProductCard({ product, onAddToCart, onClick }: Props) {
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart();
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div
      className="product-card bg-[#0f1520] border border-[rgba(0,200,255,0.08)] rounded overflow-hidden group hover:border-[rgba(0,200,255,0.25)] cursor-pointer"
      onClick={onClick}
    >
      <div className="relative overflow-hidden h-48 bg-[#111928]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-400"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1520] via-transparent to-transparent" />
        <span
          className="absolute top-3 left-3 font-mono-data text-[10px] px-2 py-0.5 rounded font-500 tracking-wider"
          style={{ background: `${product.tagColor}22`, color: product.tagColor, border: `1px solid ${product.tagColor}44` }}
        >
          {product.tag}
        </span>
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="font-mono-data text-[9px] bg-[#080b0f]/80 text-[#5a7090] px-2 py-0.5 rounded">Ver detalle →</span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-display font-700 text-base text-white mb-3 leading-tight">{product.name}</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="font-mono-data text-[10px] text-[#5a7090] px-2 py-1 bg-[#111928] rounded flex items-center gap-1">
            <span className="text-[#00c8ff]">▲</span> {product.material}
          </span>
          <span className="font-mono-data text-[10px] text-[#5a7090] px-2 py-1 bg-[#111928] rounded">⏱ {product.printTime}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-display font-700 text-xl text-white">
            <span className="text-[#5a7090] text-sm font-400 font-mono-data">$</span>
            {product.price.toLocaleString("es-AR")}
          </span>
          <button
            onClick={handleAdd}
            className={`font-display font-600 text-xs tracking-widest uppercase px-3 py-2 rounded transition-all duration-200 ${
              added
                ? "bg-[#00dc64] text-[#080b0f]"
                : "bg-[rgba(0,200,255,0.1)] text-[#00c8ff] border border-[rgba(0,200,255,0.3)] hover:bg-[#00c8ff] hover:text-[#080b0f]"
            }`}
          >
            {added ? "✓ OK" : "+ Carrito"}
          </button>
        </div>
      </div>
    </div>
  );
}
