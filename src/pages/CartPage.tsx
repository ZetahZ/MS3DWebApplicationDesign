import type { View, CartItem } from "../types";

interface Props {
  items: CartItem[];
  navigate: (v: View) => void;
  onUpdate: (id: number, qty: number) => void;
  onRemove: (id: number) => void;
}

export default function CartPage({ items, navigate, onUpdate, onRemove }: Props) {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal > 10000 ? 0 : 1500;
  const total = subtotal + shipping;

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <div className="font-mono-data text-[#00c8ff] text-xs tracking-widest uppercase mb-2">// Revisión de compra</div>
        <h1 className="font-display font-700 text-3xl sm:text-4xl text-white section-title">Carrito de Compras</h1>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-[#5a7090]">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" className="mb-4 opacity-20">
            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <p className="font-mono-data text-sm mb-4">Tu carrito está vacío</p>
          <button
            onClick={() => navigate({ page: "catalog" })}
            className="px-6 py-3 rounded bg-[rgba(0,200,255,0.1)] text-[#00c8ff] border border-[rgba(0,200,255,0.3)] font-display font-700 text-sm tracking-widest uppercase hover:bg-[#00c8ff] hover:text-[#080b0f] transition-all"
          >
            Ir al Catálogo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 bg-[#0f1520] border border-[rgba(0,200,255,0.08)] rounded group">
                <div className="w-20 h-20 rounded overflow-hidden shrink-0 bg-[#111928]">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-700 text-base text-white leading-tight">{item.name}</p>
                  {item.selectedColor && (
                    <p className="font-mono-data text-[10px] text-[#5a7090] mt-0.5">Color: {item.selectedColor}</p>
                  )}
                  <p className="font-mono-data text-[10px] text-[#5a7090]">Tipo: {item.type === "product" ? "Producto físico" : "Archivo digital"}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => item.qty > 1 && onUpdate(item.id, item.qty - 1)} className="w-7 h-7 rounded bg-[#111928] border border-[rgba(0,200,255,0.1)] text-[#00c8ff] hover:bg-[rgba(0,200,255,0.1)] transition-colors flex items-center justify-center">−</button>
                      <span className="font-mono-data text-sm text-white w-6 text-center">{item.qty}</span>
                      <button onClick={() => onUpdate(item.id, item.qty + 1)} className="w-7 h-7 rounded bg-[#111928] border border-[rgba(0,200,255,0.1)] text-[#00c8ff] hover:bg-[rgba(0,200,255,0.1)] transition-colors flex items-center justify-center">+</button>
                    </div>
                    <button
                      onClick={() => onRemove(item.id)}
                      className="font-mono-data text-[10px] text-[#5a7090] hover:text-red-400 transition-colors flex items-center gap-1"
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /></svg>
                      Eliminar
                    </button>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-display font-700 text-lg text-white">${(item.price * item.qty).toLocaleString("es-AR")}</p>
                  <p className="font-mono-data text-[10px] text-[#5a7090] mt-0.5">${item.price.toLocaleString("es-AR")} c/u</p>
                </div>
              </div>
            ))}
            <button onClick={() => navigate({ page: "catalog" })} className="font-mono-data text-xs text-[#5a7090] hover:text-[#00c8ff] transition-colors flex items-center gap-1 mt-2">
              ← Seguir comprando
            </button>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#0f1520] border border-[rgba(0,200,255,0.1)] rounded p-5 sticky top-20">
              <h3 className="font-display font-700 text-lg text-white mb-4">Resumen del Pedido</h3>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[#5a7090] font-mono-data">Subtotal ({items.reduce((s, i) => s + i.qty, 0)} ítems)</span>
                  <span className="text-white font-mono-data">${subtotal.toLocaleString("es-AR")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#5a7090] font-mono-data">Envío estimado</span>
                  <span className={`font-mono-data ${shipping === 0 ? "text-[#00dc64]" : "text-white"}`}>
                    {shipping === 0 ? "GRATIS" : `$${shipping.toLocaleString("es-AR")}`}
                  </span>
                </div>
                {shipping === 0 && (
                  <p className="font-mono-data text-[10px] text-[#00dc64]">✓ Envío gratis por compra mayor a $10.000</p>
                )}
                {shipping > 0 && (
                  <p className="font-mono-data text-[10px] text-[#5a7090]">
                    Agregá ${(10000 - subtotal).toLocaleString("es-AR")} más para envío gratis
                  </p>
                )}
                <div className="border-t border-[rgba(0,200,255,0.08)] pt-3 flex justify-between">
                  <span className="font-display font-700 text-base text-white">Total</span>
                  <span className="font-display font-700 text-xl text-white">${total.toLocaleString("es-AR")}</span>
                </div>
              </div>
              <button
                onClick={() => navigate({ page: "checkout" })}
                className="w-full py-3 rounded bg-[#00c8ff] hover:bg-white text-[#080b0f] font-display font-700 text-sm tracking-widest uppercase transition-colors"
              >
                Finalizar Pedido →
              </button>
              <button
                onClick={() => {
                  const lines = items.map((i) => `• ${i.name} x${i.qty} — $${(i.price * i.qty).toLocaleString("es-AR")}`).join("\n");
                  const msg = `Hola M's3D! Quiero hacer un pedido:\n\n${lines}\n\n*Total: $${total.toLocaleString("es-AR")}*`;
                  window.open(`https://wa.me/5491100000000?text=${encodeURIComponent(msg)}`, "_blank");
                }}
                className="w-full mt-2 py-2.5 rounded border border-[rgba(37,211,102,0.3)] text-[#25d366] hover:bg-[rgba(37,211,102,0.08)] font-display font-700 text-xs tracking-widest uppercase transition-colors flex items-center justify-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>
                Pedir por WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
