import { useState } from "react";
import type { View, CartItem, Order, OrderStatus } from "./types";
import { INITIAL_ORDERS } from "./data";

import Header from "./components/Header";
import CartModal from "./components/CartModal";

import CatalogPage from "./pages/CatalogPage";
import CategoryPage from "./pages/CategoryPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ModelsPage from "./pages/ModelsPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import CreatorPanel from "./pages/CreatorPanel";
import NewOrderPage from "./pages/NewOrderPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";

// ─── Logo / Footer ────────────────────────────────────────────────────────────

function FooterLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-7 h-7 opacity-60">
        <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
          <polygon points="18,2 34,10 34,26 18,34 2,26 2,10" stroke="#00c8ff" strokeWidth="1.5" fill="none" opacity="0.5" />
          <circle cx="18" cy="18" r="3" fill="#00c8ff" opacity="0.5" />
        </svg>
      </div>
      <div>
        <span className="font-display text-base font-700 text-white/60 tracking-widest">M's<span className="text-[#00c8ff]/60">3D</span></span>
        <div className="text-[8px] font-mono-data text-[#5a7090] tracking-widest uppercase">Print Studio</div>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState<View>({ page: "catalog" });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [nextOrderId, setNextOrderId] = useState(100);

  const navigate = (v: View) => {
    setView(v);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) return prev.map((i) => i.id === item.id ? { ...i, qty: i.qty + item.qty } : i);
      return [...prev, item];
    });
  };

  const updateQty = (id: number, qty: number) => setCart((prev) => prev.map((i) => i.id === id ? { ...i, qty } : i));
  const removeItem = (id: number) => setCart((prev) => prev.filter((i) => i.id !== id));
  const clearCart = () => setCart([]);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const advanceOrder = (id: number) => {
    setOrders((prev) => prev.map((o) => {
      if (o.id !== id) return o;
      const next: Record<OrderStatus, OrderStatus | null> = { pending: "printing", printing: "done", done: null };
      const nextStatus = next[o.status];
      return nextStatus ? { ...o, status: nextStatus, progress: nextStatus === "done" ? 100 : o.progress } : o;
    }));
  };

  const deleteOrder = (id: number) => setOrders((prev) => prev.filter((o) => o.id !== id));

  const addOrder = (orderData: Omit<Order, "id">) => {
    setOrders((prev) => [...prev, { id: nextOrderId, ...orderData }]);
    setNextOrderId((n) => n + 1);
  };

  return (
    <div className="min-h-full grid-bg relative flex flex-col">
      <Header view={view} navigate={navigate} cartCount={cartCount} onCartOpen={() => setCartOpen(true)} />

      <main className="flex-1">
        {view.page === "catalog" && (
          <CatalogPage navigate={navigate} onAddToCart={(p) => addToCart({ id: p.id, name: p.name, price: p.price, qty: 1, type: "product", image: p.image })} />
        )}
        {view.page === "category" && (
          <CategoryPage slug={view.slug} navigate={navigate} onAddToCart={(p) => addToCart({ id: p.id, name: p.name, price: p.price, qty: 1, type: "product", image: p.image })} />
        )}
        {view.page === "product" && (
          <ProductDetailPage productId={view.id} navigate={navigate} onAddToCart={addToCart} />
        )}
        {view.page === "models" && (
          <ModelsPage navigate={navigate} onAddToCart={addToCart} />
        )}
        {view.page === "cart" && (
          <CartPage items={cart} navigate={navigate} onUpdate={updateQty} onRemove={removeItem} />
        )}
        {view.page === "checkout" && (
          <CheckoutPage items={cart} navigate={navigate} onClearCart={clearCart} />
        )}
        {view.page === "creator" && (
          <CreatorPanel orders={orders} navigate={navigate} onAdvance={advanceOrder} onDelete={deleteOrder} />
        )}
        {view.page === "new-order" && (
          <NewOrderPage navigate={navigate} onAdd={addOrder} />
        )}
        {view.page === "order-detail" && (
          <OrderDetailPage orderId={view.id} orders={orders} navigate={navigate} onAdvance={advanceOrder} />
        )}
        {view.page === "about" && (
          <AboutPage navigate={navigate} />
        )}
        {view.page === "contact" && (
          <ContactPage navigate={navigate} />
        )}
      </main>

      <footer className="border-t border-[rgba(0,200,255,0.06)] mt-10 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <FooterLogo />
            <nav className="flex flex-wrap gap-x-6 gap-y-2">
              {[
                { label: "Catálogo", v: { page: "catalog" } as View },
                { label: "Modelos STL", v: { page: "models" } as View },
                { label: "Sobre Nosotros", v: { page: "about" } as View },
                { label: "Contacto", v: { page: "contact" } as View },
              ].map((item) => (
                <button key={item.label} onClick={() => navigate(item.v)} className="font-mono-data text-[11px] text-[#5a7090] hover:text-[#00c8ff] transition-colors tracking-widest uppercase">
                  {item.label}
                </button>
              ))}
            </nav>
            <p className="font-mono-data text-[10px] text-[#5a7090] tracking-widest">
              © 2026 M's3D — Print Studio
            </p>
          </div>
        </div>
      </footer>

      {cartOpen && (
        <CartModal
          items={cart}
          onClose={() => setCartOpen(false)}
          onUpdate={updateQty}
          onRemove={removeItem}
          navigate={navigate}
        />
      )}
    </div>
  );
}
