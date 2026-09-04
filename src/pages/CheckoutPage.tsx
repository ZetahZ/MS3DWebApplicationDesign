import { useState } from "react";
import type { View, CartItem } from "../types";

interface Props {
  items: CartItem[];
  navigate: (v: View) => void;
  onClearCart: () => void;
}

type ShippingMethod = "andreani" | "oca" | "local" | "retiro";
type PaymentMethod = "transferencia" | "mercadopago" | "efectivo" | "whatsapp";

export default function CheckoutPage({ items, navigate, onClearCart }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", address: "", city: "", province: "", notes: "",
  });
  const [shipping, setShipping] = useState<ShippingMethod>("andreani");
  const [payment, setPayment] = useState<PaymentMethod>("transferencia");
  const [submitted, setSubmitted] = useState(false);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shippingCost = shipping === "retiro" || shipping === "local" ? 0 : subtotal > 10000 ? 0 : 1500;
  const total = subtotal + shippingCost;

  const handleSubmit = () => {
    if (payment === "whatsapp") {
      const lines = items.map((i) => `• ${i.name} x${i.qty}`).join("\n");
      const msg = `Nuevo pedido de *${form.name}*\n📦 Productos:\n${lines}\n\n💰 Total: $${total.toLocaleString("es-AR")}\n📍 ${form.address}, ${form.city}\n📱 ${form.phone}\n\nForma de pago: ${payment}`;
      window.open(`https://wa.me/5491100000000?text=${encodeURIComponent(msg)}`, "_blank");
    }
    setSubmitted(true);
    onClearCart();
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-[rgba(0,220,100,0.15)] border border-[rgba(0,220,100,0.3)] flex items-center justify-center mx-auto mb-6">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00dc64" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <h2 className="font-display font-700 text-3xl text-white mb-3">¡Pedido Enviado!</h2>
        <p className="text-[#5a7090] text-sm mb-8">Nos comunicaremos con vos en las próximas horas para confirmar el pedido y coordinar el pago.</p>
        <button onClick={() => navigate({ page: "catalog" })} className="px-8 py-3 rounded bg-[#00c8ff] text-[#080b0f] font-display font-700 text-sm tracking-widest uppercase hover:bg-white transition-colors">
          Volver al Catálogo
        </button>
      </div>
    );
  }

  const stepLabel = ["Datos personales", "Envío y pago", "Confirmar"];

  const inputClass = "w-full bg-[#111928] border border-[rgba(0,200,255,0.1)] rounded px-3 py-2.5 text-sm text-white placeholder:text-[#5a7090] focus:outline-none focus:border-[rgba(0,200,255,0.4)] transition-colors font-mono-data";

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <div className="font-mono-data text-[#00c8ff] text-xs tracking-widest uppercase mb-2">// Finalizar pedido</div>
        <h1 className="font-display font-700 text-3xl sm:text-4xl text-white section-title">Checkout</h1>
      </div>

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
          {/* Step 1 */}
          {step === 1 && (
            <div className="bg-[#0f1520] border border-[rgba(0,200,255,0.1)] rounded p-6 space-y-4">
              <h3 className="font-display font-700 text-lg text-white mb-2">Datos Personales</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-mono-data text-[10px] text-[#5a7090] tracking-widest uppercase block mb-1.5">Nombre completo *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Valentina Rodríguez" className={inputClass} />
                </div>
                <div>
                  <label className="font-mono-data text-[10px] text-[#5a7090] tracking-widest uppercase block mb-1.5">Teléfono *</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+54 11 1234-5678" className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-mono-data text-[10px] text-[#5a7090] tracking-widest uppercase block mb-1.5">Email</label>
                  <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="valen@email.com" className={inputClass} type="email" />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-mono-data text-[10px] text-[#5a7090] tracking-widest uppercase block mb-1.5">Dirección</label>
                  <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Calle Falsa 123, Piso 4, Dto B" className={inputClass} />
                </div>
                <div>
                  <label className="font-mono-data text-[10px] text-[#5a7090] tracking-widest uppercase block mb-1.5">Ciudad</label>
                  <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Buenos Aires" className={inputClass} />
                </div>
                <div>
                  <label className="font-mono-data text-[10px] text-[#5a7090] tracking-widest uppercase block mb-1.5">Provincia</label>
                  <input value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} placeholder="CABA" className={inputClass} />
                </div>
              </div>
              <button
                onClick={() => form.name && form.phone && setStep(2)}
                disabled={!form.name || !form.phone}
                className="mt-2 px-6 py-3 rounded bg-[#00c8ff] hover:bg-white text-[#080b0f] font-display font-700 text-sm tracking-widest uppercase transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continuar →
              </button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="bg-[#0f1520] border border-[rgba(0,200,255,0.1)] rounded p-6 space-y-6">
              <div>
                <h3 className="font-display font-700 text-lg text-white mb-4">Método de Envío</h3>
                <div className="space-y-2">
                  {([
                    { id: "andreani", label: "Andreani", detail: "3-5 días hábiles", price: subtotal > 10000 ? "GRATIS" : "$1.500" },
                    { id: "oca", label: "OCA", detail: "4-7 días hábiles", price: subtotal > 10000 ? "GRATIS" : "$1.500" },
                    { id: "local", label: "Envío local (CABA/GBA)", detail: "24-48hs hábiles", price: "GRATIS" },
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
                <h3 className="font-display font-700 text-lg text-white mb-4">Método de Pago</h3>
                <div className="space-y-2">
                  {([
                    { id: "transferencia", label: "Transferencia bancaria / CVU", detail: "Alias: MS3D.PRINT" },
                    { id: "mercadopago", label: "MercadoPago", detail: "Link de pago por WhatsApp" },
                    { id: "efectivo", label: "Efectivo (al retirar o en entrega)", detail: "Solo local o retiro en taller" },
                    { id: "whatsapp", label: "Coordinar por WhatsApp", detail: "Te enviamos el pedido y acordamos" },
                  ] as { id: PaymentMethod; label: string; detail: string }[]).map((opt) => (
                    <label key={opt.id} className={`flex items-center gap-3 p-3.5 rounded border cursor-pointer transition-all ${payment === opt.id ? "border-[rgba(0,200,255,0.4)] bg-[rgba(0,200,255,0.05)]" : "border-[rgba(0,200,255,0.08)] hover:border-[rgba(0,200,255,0.2)]"}`}>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${payment === opt.id ? "border-[#00c8ff]" : "border-[#5a7090]"}`}>
                        {payment === opt.id && <div className="w-2 h-2 rounded-full bg-[#00c8ff]" />}
                      </div>
                      <input type="radio" name="payment" value={opt.id} className="sr-only" checked={payment === opt.id} onChange={() => setPayment(opt.id)} />
                      <div>
                        <div className="font-display font-600 text-sm text-white">{opt.label}</div>
                        <div className="font-mono-data text-[10px] text-[#5a7090]">{opt.detail}</div>
                      </div>
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
                  Revisar Pedido →
                </button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="bg-[#0f1520] border border-[rgba(0,200,255,0.1)] rounded p-6 space-y-4">
              <h3 className="font-display font-700 text-lg text-white mb-2">Confirmación de Pedido</h3>
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
                <div className="bg-[#111928] rounded p-3">
                  <div className="font-mono-data text-[10px] text-[#5a7090] uppercase tracking-widest mb-1">Envío</div>
                  <div className="font-display font-600 text-white text-sm capitalize">{shipping}</div>
                </div>
                <div className="bg-[#111928] rounded p-3">
                  <div className="font-mono-data text-[10px] text-[#5a7090] uppercase tracking-widest mb-1">Pago</div>
                  <div className="font-display font-600 text-white text-sm capitalize">{payment}</div>
                </div>
              </div>
              <div className="border-t border-[rgba(0,200,255,0.08)] pt-4">
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-[#a0b0c8] font-mono-data truncate mr-4">{item.name} x{item.qty}</span>
                      <span className="text-white font-mono-data shrink-0">${(item.price * item.qty).toLocaleString("es-AR")}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(2)} className="px-4 py-3 rounded border border-[rgba(0,200,255,0.2)] text-[#5a7090] hover:text-[#00c8ff] font-display font-700 text-sm tracking-widest uppercase transition-colors">
                  ← Atrás
                </button>
                <button onClick={handleSubmit} className="flex-1 py-3 rounded bg-[#ff6b2b] hover:bg-[#ff8a50] text-white font-display font-700 text-sm tracking-widest uppercase transition-colors">
                  Confirmar Pedido ✓
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
