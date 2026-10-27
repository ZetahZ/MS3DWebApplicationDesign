import { useState } from "react";
import type { View, CartItem } from "../types";
import { whatsappUrl } from "../config";

interface Props {
  items: CartItem[];
  navigate: (v: View) => void;
  onClearCart: () => void;
}

type ShippingMethod = "andreani" | "oca" | "local" | "retiro";

export default function CheckoutPage({ items, navigate, onClearCart }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", address: "", city: "", province: "", notes: "",
  });
  const [shipping, setShipping] = useState<ShippingMethod>("andreani");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shippingCost = shipping === "retiro" || shipping === "local" ? 0 : subtotal > 10000 ? 0 : 1500;
  const total = subtotal + shippingCost;

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const currentUserId = localStorage.getItem("user_id");

    try {
      // 1. Guardar cada producto del carrito como un encargo en el backend (FastAPI)
      for (const item of items) {
        const especificaciones = `Envío: ${shipping} | Dirección: ${form.address}, ${form.city}, ${form.province} | Tel: ${form.phone} | Notas: ${form.notes || "N/A"}`;

        const resEncargo = await fetch("http://localhost:8000/api/v1/encargos/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cliente_nombre: form.name,
            producto_nombre: item.name,
            cantidad: item.qty,
            especificaciones: especificaciones,
            estado: "por_imprimir",
            progreso: 0,
            usuario_id: currentUserId ? parseInt(currentUserId) : null,
          }),
        });

        if (!resEncargo.ok) {
          throw new Error("No se pudo registrar el pedido en el taller.");
        }
      }

      // 2. Crear la preferencia de pago en Mercado Pago
      const resMp = await fetch("http://localhost:8000/api/v1/payments/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            title: i.name,
            quantity: i.qty,
            unit_price: i.price,
          })),
          shipping_cost: shippingCost,
          payer_email: form.email || "cliente@ms3d.com",
        }),
      });

      const mpData = await resMp.json();

      if (!resMp.ok) {
        throw new Error(mpData.detail || "Error al generar la pasarela de pago");
      }

      // 3. Limpiar carrito y redirigir al link oficial de Mercado Pago
      onClearCart();
      if (mpData.init_point) {
        window.location.href = mpData.init_point;
      } else {
        navigate({ page: "catalog" });
      }

    } catch (err: any) {
      console.error("Error en checkout:", err);
      setError(err.message || "Error al procesar la compra.");
      setLoading(false);
    }
  };

  const stepLabel = ["Datos personales", "Método de envío", "Confirmar pago"];
  const inputClass = "w-full bg-[#111928] border border-[rgba(0,200,255,0.1)] rounded px-3 py-2.5 text-sm text-white placeholder:text-[#5a7090] focus:outline-none focus:border-[rgba(0,200,255,0.4)] transition-colors font-mono-data";

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <div className="font-mono-data text-[#00c8ff] text-xs tracking-widest uppercase mb-2">// Finalizar pedido</div>
        <h1 className="font-display font-700 text-3xl sm:text-4xl text-white section-title">Checkout</h1>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 font-mono-data text-xs">
          {error}
        </div>
      )}

      {/* Steps */}
      <div className="flex items-center gap-0 mb-10">
        {stepLabel.map((label, i) => {
          const n = i + 1;
          const active = step === n;
          const done = step > n;
          return (
            <div key={label} className="flex items-center flex-1">
              <div className="flex items-center gap-2 shrink-0">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-mono-data text-xs font-700 transition-all ${
                  done ? "bg-[#00dc64] text-[#080b0f]" : active ? "bg-[#00c8ff] text-[#080b0f]" : "bg-[#111928] border border-[rgba(0,200,255,0.2)] text-[#5a7090]"
                }`}>
                  {done ? "✓" : n}
                </div>
                <span className={`font-display font-600 text-xs tracking-wider hidden sm:inline ${active ? "text-white" : done ? "text-[#00dc64]" : "text-[#5a7090]"}`}>
                  {label}
                </span>
              </div>
              {n < 3 && <div className={`flex-1 h-px mx-3 ${done ? "bg-[#00dc64]" : "bg-[rgba(0,200,255,0.1)]"}`} />}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Step 1: Datos Personales */}
          {step === 1 && (
            <div className="bg-[#0f1520] border border-[rgba(0,200,255,0.1)] rounded p-6 space-y-4">
              <h3 className="font-display font-700 text-lg text-white mb-2">Datos Personales y de Envío</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-mono-data text-[10px] text-[#5a7090] tracking-widest uppercase block mb-1.5">Nombre completo *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Valentina Rodríguez" className={inputClass} />
                </div>
                <div>
                  <label className="font-mono-data text-[10px] text-[#5a7090] tracking-widest uppercase block mb-1.5">Teléfono *</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+54 387 1234567" className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-mono-data text-[10px] text-[#5a7090] tracking-widest uppercase block mb-1.5">Email *</label>
                  <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="valen@email.com" className={inputClass} type="email" />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-mono-data text-[10px] text-[#5a7090] tracking-widest uppercase block mb-1.5">Dirección *</label>
                  <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Calle y altura" className={inputClass} />
                </div>
                <div>
                  <label className="font-mono-data text-[10px] text-[#5a7090] tracking-widest uppercase block mb-1.5">Ciudad</label>
                  <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Salta" className={inputClass} />
                </div>
                <div>
                  <label className="font-mono-data text-[10px] text-[#5a7090] tracking-widest uppercase block mb-1.5">Provincia</label>
                  <input value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} placeholder="Salta" className={inputClass} />
                </div>
              </div>
              <button
                onClick={() => form.name && form.phone && form.email && form.address && setStep(2)}
                disabled={!form.name || !form.phone || !form.email || !form.address}
                className="mt-2 px-6 py-3 rounded bg-[#00c8ff] hover:bg-white text-[#080b0f] font-display font-700 text-sm tracking-widest uppercase transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continuar a Envío →
              </button>
            </div>
          )}

          {/* Step 2: Método de Envío */}
          {step === 2 && (
            <div className="bg-[#0f1520] border border-[rgba(0,200,255,0.1)] rounded p-6 space-y-6">
              <div>
                <h3 className="font-display font-700 text-lg text-white mb-4">Método de Envío</h3>
                <div className="space-y-2">
                  {([
                    { id: "andreani", label: "Andreani", detail: "3-5 días hábiles", price: subtotal > 10000 ? "GRATIS" : "$1.500" },
                    { id: "oca", label: "OCA", detail: "4-7 días hábiles", price: subtotal > 10000 ? "GRATIS" : "$1.500" },
                    { id: "local", label: "Envío local (Salta)", detail: "24-48hs hábiles", price: "GRATIS" },
                    { id: "retiro", label: "Retiro en taller", detail: "Coordinar por WhatsApp", price: "GRATIS" },
                  ] as { id: ShippingMethod; label: string; detail: string; price: string }[]).map((opt) => (
                    <label key={opt.id} className={`flex items-center justify-between p-3.5 rounded border cursor-pointer transition-all ${shipping === opt.id ? "border-[rgba(0,200,255,0.4)] bg-[rgba(0,200,255,0.05)]" : "border-[rgba(0,200,255,0.08)] hover:border-[rgba(0,200,255,0.2)]"}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${shipping === opt.id ? "border-[#00c8ff]" : "border-[#5a7090]"}`}>
                          {shipping === opt.id && <div className="w-2 h-2 rounded-full bg-[#00c8ff]" />}
                        </div>
                        <input type="radio" name="shipping" value={opt.id} className="sr-only" checked={shipping === opt.id} onChange={() => setShipping(opt.id)} />
                        <div>
                          <div className="font-display font-600 text-sm text-white">{opt.label}</div>
                          <div className="font-mono-data text-[10px] text-[#5a7090]">{opt.detail}</div>
                        </div>
                      </div>
                      <span className={`font-mono-data text-xs font-700 ${opt.price === "GRATIS" ? "text-[#00dc64]" : "text-white"}`}>{opt.price}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-mono-data text-[10px] text-[#5a7090] tracking-widest uppercase block mb-1.5">Notas adicionales (opcional)</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Colores específicos, horarios de entrega, instrucciones..." className={`${inputClass} resize-none h-20`} />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="px-4 py-3 rounded border border-[rgba(0,200,255,0.2)] text-[#5a7090] hover:text-[#00c8ff] font-display font-700 text-sm tracking-widest uppercase transition-colors">
                  ← Atrás
                </button>
                <button onClick={() => setStep(3)} className="flex-1 py-3 rounded bg-[#00c8ff] hover:bg-white text-[#080b0f] font-display font-700 text-sm tracking-widest uppercase transition-colors">
                  Continuar a Pago →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmar Pago (Mercado Pago) */}
          {step === 3 && (
            <div className="bg-[#0f1520] border border-[rgba(0,200,255,0.1)] rounded p-6 space-y-6">
              <h3 className="font-display font-700 text-lg text-white mb-2">Confirmación y Pago</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-[#111928] rounded p-3">
                  <div className="font-mono-data text-[10px] text-[#5a7090] uppercase tracking-widest mb-1">Cliente</div>
                  <div className="font-display font-600 text-white">{form.name}</div>
                  <div className="font-mono-data text-[10px] text-[#5a7090] mt-0.5">{form.phone}</div>
                </div>
                <div className="bg-[#111928] rounded p-3">
                  <div className="font-mono-data text-[10px] text-[#5a7090] uppercase tracking-widest mb-1">Dirección</div>
                  <div className="font-display font-600 text-white text-sm leading-tight">{form.address || "—"}</div>
                  <div className="font-mono-data text-[10px] text-[#5a7090] mt-0.5">{form.city} {form.province}</div>
                </div>
                <div className="bg-[#111928] rounded p-3 col-span-2">
                  <div className="font-mono-data text-[10px] text-[#5a7090] uppercase tracking-widest mb-1">Método de Envío Seleccionado</div>
                  <div className="font-display font-600 text-white text-sm capitalize">{shipping}</div>
                </div>
              </div>

              {/* Banner Mercado Pago */}
              <div className="p-4 rounded bg-[rgba(0,157,240,0.1)] border border-[rgba(0,157,240,0.3)] flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#009ee3] flex items-center justify-center font-bold text-white text-sm shrink-0">MP</div>
                <div>
                  <p className="font-display font-700 text-sm text-white">Mercado Pago (Pago Seguro)</p>
                  <p className="font-mono-data text-[10px] text-[#5a7090]">Al hacer clic en pagar, se generará tu orden en el taller y serás redirigido al portal de pago oficial.</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(2)} className="px-4 py-3 rounded border border-[rgba(0,200,255,0.2)] text-[#5a7090] hover:text-[#00c8ff] font-display font-700 text-sm tracking-widest uppercase transition-colors">
                  ← Atrás
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-3 rounded bg-[#009ee3] hover:bg-[#0073a8] text-white font-display font-700 text-sm tracking-widest uppercase transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? "Generando link de pago..." : "Pagar con Mercado Pago ➔"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-[#0f1520] border border-[rgba(0,200,255,0.1)] rounded p-5 sticky top-20">
            <h3 className="font-display font-700 text-base text-white mb-3">Tu pedido</h3>
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded overflow-hidden shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono-data text-[10px] text-[#a0b0c8] truncate">{item.name}</p>
                    <p className="font-mono-data text-[9px] text-[#5a7090]">x{item.qty}</p>
                  </div>
                  <span className="font-mono-data text-xs text-white shrink-0">${(item.price * item.qty).toLocaleString("es-AR")}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-[rgba(0,200,255,0.08)] pt-3 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#5a7090] font-mono-data">Subtotal</span>
                <span className="text-white font-mono-data">${subtotal.toLocaleString("es-AR")}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#5a7090] font-mono-data">Envío</span>
                <span className={`font-mono-data ${shippingCost === 0 ? "text-[#00dc64]" : "text-white"}`}>{shippingCost === 0 ? "GRATIS" : `$${shippingCost.toLocaleString("es-AR")}`}</span>
              </div>
              <div className="flex justify-between font-display font-700 text-base text-white pt-1 border-t border-[rgba(0,200,255,0.08)]">
                <span>Total</span>
                <span>${total.toLocaleString("es-AR")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}