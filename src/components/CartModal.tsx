import type { CartItem, View } from "../types";

interface CartModalProps {
  items: CartItem[];
  onClose: () => void;
  onUpdate: (id: number, qty: number) => void;
  onRemove: (id: number) => void;
  navigate: (v: View) => void;
}

export default function CartModal({ items, onClose, onUpdate, onRemove, navigate }: CartModalProps) {
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  const goCheckout = () => {
    onClose();
    navigate({ page: "checkout" });
  };

  const goCart = () => {
    onClose();
    navigate({ page: "cart" });
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-sm sm:max-w-md bg-[#0f1520] border-l border-[rgba(0,200,255,0.15)] flex flex-col h-full animate-in slide-in-from-right">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(0,200,255,0.1)]">
          <div>
            <h2 className="font-display font-700 text-xl text-white">Carrito</h2>
            <div className="font-mono-data text-[10px] text-[#5a7090] tracking-widest">{count} ÍTEM{count !== 1 ? "S" : ""}</div>
          </div>
          <button onClick={onClose} className="text-[#5a7090] hover:text-white transition-colors p-2 rounded hover:bg-[rgba(255,255,255,0.05)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 text-[#5a7090]">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-3 opacity-30">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <p className="text-sm font-mono-data">El carrito está vacío</p>
              <button onClick={onClose} className="mt-3 text-xs text-[#00c8ff] hover:underline font-mono-data">
                Seguir comprando →
              </button>
            </div>
          )}
          {items.map((item) => (
            <div key={item.id} className="flex gap-3 p-3 bg-[#111928] rounded border border-[rgba(0,200,255,0.06)] group">
              <div className="w-14 h-14 rounded overflow-hidden shrink-0 bg-[#0f1520]">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-80" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-600 text-sm text-white leading-tight truncate">{item.name}</p>
                {item.selectedColor && (
                  <p className="font-mono-data text-[10px] text-[#5a7090] mt-0.5">{item.selectedColor}</p>
                )}
                <p className="font-mono-data text-[10px] text-[#5a7090]">${item.price.toLocaleString("es-AR")} c/u</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <button onClick={() => item.qty > 1 && onUpdate(item.id, item.qty - 1)} className="w-6 h-6 rounded bg-[#1a2535] text-[#00c8ff] hover:bg-[rgba(0,200,255,0.2)] transition-colors flex items-center justify-center text-sm">−</button>
                  <span className="font-mono-data text-sm text-white w-4 text-center">{item.qty}</span>
                  <button onClick={() => onUpdate(item.id, item.qty + 1)} className="w-6 h-6 rounded bg-[#1a2535] text-[#00c8ff] hover:bg-[rgba(0,200,255,0.2)] transition-colors flex items-center justify-center text-sm">+</button>
                </div>
              </div>
              <div className="flex flex-col items-end justify-between">
                <span className="font-display font-700 text-base text-white">${(item.price * item.qty).toLocaleString("es-AR")}</span>
                <button onClick={() => onRemove(item.id)} className="text-[#5a7090] hover:text-red-400 transition-colors p-1 opacity-0 group-hover:opacity-100">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-[rgba(0,200,255,0.1)] space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-mono-data text-xs text-[#5a7090] tracking-widest uppercase">Subtotal</span>
              <span className="font-display font-700 text-2xl text-white">${total.toLocaleString("es-AR")}</span>
            </div>
            <button onClick={goCheckout} className="w-full py-3 rounded bg-[#00c8ff] hover:bg-white text-[#080b0f] font-display font-700 text-sm tracking-widest uppercase transition-colors">
              Finalizar Pedido →
            </button>
            <button onClick={goCart} className="w-full py-2 rounded border border-[rgba(0,200,255,0.2)] text-[#5a7090] hover:text-[#00c8ff] hover:border-[rgba(0,200,255,0.4)] font-mono-data text-xs tracking-widest transition-colors">
              Ver carrito completo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
