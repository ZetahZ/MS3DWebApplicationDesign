import { useState } from "react";
import type { View, Order } from "../types";

interface Props {
  navigate: (v: View) => void;
  onAdd: (order: Omit<Order, "id">) => void;
}

const PRINTERS = ["Bambu Lab X1C", "Prusa MK4", "Ender 3 Pro", "Creality CR-10 S5", "Bambu Lab P1S"];
const MATERIALS = ["PLA+", "PLA Silk", "PLA Matte", "PETG", "ABS", "TPU", "PLA Wood", "ASA"];
const ACCENT_COLORS = ["#00c8ff", "#ff6b2b", "#a855f7", "#00dc64", "#ffb400", "#64b5f6"];

export default function NewOrderPage({ navigate, onAdd }: Props) {
  const [form, setForm] = useState({
    client: "",
    product: "",
    qty: 1,
    notes: "",
    material: "PLA+",
    estimatedTime: "",
    printer: "Bambu Lab X1C",
    color: "#00c8ff",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client.trim() || !form.product.trim()) return;
    onAdd({
      client: form.client,
      product: `${form.product} x${form.qty}`,
      qty: form.qty,
      status: "pending",
      createdAt: new Date().toISOString().split("T")[0],
      color: form.color,
      notes: form.notes,
      material: form.material,
      estimatedTime: form.estimatedTime,
      printer: form.printer,
      progress: 0,
    });
    setSubmitted(true);
    setTimeout(() => navigate({ page: "creator" }), 1500);
  };

  const inputClass = "w-full bg-[#111928] border border-[rgba(0,200,255,0.1)] rounded px-3 py-2.5 text-sm text-white placeholder:text-[#5a7090] focus:outline-none focus:border-[rgba(0,200,255,0.4)] transition-colors font-mono-data";
  const selectClass = `${inputClass} cursor-pointer`;

  return (
    <section className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 font-mono-data text-xs text-[#5a7090]">
        <button onClick={() => navigate({ page: "creator" })} className="hover:text-[#00c8ff] transition-colors">Panel Creador</button>
        <span>/</span>
        <span className="text-[#a855f7]">Nuevo Encargo</span>
      </div>

      <div className="mb-8">
        <div className="font-mono-data text-[#a855f7] text-xs tracking-widest uppercase mb-2">// Registrar producción</div>
        <h1 className="font-display font-700 text-3xl sm:text-4xl text-white section-title">Nuevo Encargo</h1>
      </div>

      {submitted ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-[rgba(0,220,100,0.15)] border border-[rgba(0,220,100,0.3)] flex items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00dc64" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h3 className="font-display font-700 text-xl text-white">Encargo registrado</h3>
          <p className="font-mono-data text-xs text-[#5a7090] mt-2">Redirigiendo al panel...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-[#0f1520] border border-[rgba(168,85,247,0.2)] rounded p-6 space-y-5">
          {/* Client & Product */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-mono-data text-[10px] text-[#5a7090] tracking-widest uppercase block mb-1.5">Nombre del Cliente *</label>
              <input value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} placeholder="Valentina Rodríguez" className={inputClass} required />
            </div>
            <div>
              <label className="font-mono-data text-[10px] text-[#5a7090] tracking-widest uppercase block mb-1.5">Pieza / Modelo *</label>
              <input value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} placeholder="Mate Geométrico" className={inputClass} required />
            </div>
          </div>

          {/* Qty & Material */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-mono-data text-[10px] text-[#5a7090] tracking-widest uppercase block mb-1.5">Cantidad</label>
              <input type="number" min={1} value={form.qty} onChange={(e) => setForm({ ...form, qty: parseInt(e.target.value) || 1 })} className={inputClass} />
            </div>
            <div>
              <label className="font-mono-data text-[10px] text-[#5a7090] tracking-widest uppercase block mb-1.5">Material</label>
              <select value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} className={selectClass}>
                {MATERIALS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          {/* Printer & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-mono-data text-[10px] text-[#5a7090] tracking-widest uppercase block mb-1.5">Impresora asignada</label>
              <select value={form.printer} onChange={(e) => setForm({ ...form, printer: e.target.value })} className={selectClass}>
                {PRINTERS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="font-mono-data text-[10px] text-[#5a7090] tracking-widest uppercase block mb-1.5">Tiempo estimado</label>
              <input value={form.estimatedTime} onChange={(e) => setForm({ ...form, estimatedTime: e.target.value })} placeholder="Ej: 8h 30min" className={inputClass} />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="font-mono-data text-[10px] text-[#5a7090] tracking-widest uppercase block mb-1.5">Notas / Color de filamento</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Color, instrucciones especiales, temperatura, adhesión..." className={`${inputClass} resize-none h-20`} />
          </div>

          {/* Color tag */}
          <div>
            <label className="font-mono-data text-[10px] text-[#5a7090] tracking-widest uppercase block mb-2">Color de etiqueta en kanban</label>
            <div className="flex gap-2">
              {ACCENT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className={`w-7 h-7 rounded-full transition-all ${form.color === c ? "ring-2 ring-white ring-offset-2 ring-offset-[#0f1520] scale-110" : "hover:scale-105"}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-[#111928] rounded p-3 border border-[rgba(0,200,255,0.06)]">
            <div className="font-mono-data text-[9px] text-[#5a7090] uppercase tracking-widest mb-2">Vista previa del encargo</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: form.color }} />
              <span className="font-display font-700 text-sm text-white">{form.client || "Cliente"}</span>
              <span className="font-mono-data text-[10px] text-[#5a7090]">—</span>
              <span className="font-mono-data text-[10px] text-[#5a7090] truncate">{form.product || "Pieza"} x{form.qty}</span>
            </div>
            {form.material && <p className="font-mono-data text-[10px] text-[#5a7090] mt-1 ml-4">▲ {form.material} {form.estimatedTime && `· ⏱ ${form.estimatedTime}`}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate({ page: "creator" })} className="px-4 py-3 rounded border border-[rgba(0,200,255,0.2)] text-[#5a7090] hover:text-[#00c8ff] font-display font-700 text-sm tracking-widest uppercase transition-colors">
              Cancelar
            </button>
            <button type="submit" className="flex-1 py-3 rounded bg-[rgba(168,85,247,0.2)] border border-[rgba(168,85,247,0.4)] text-[#a855f7] hover:bg-[#a855f7] hover:text-white font-display font-700 text-sm tracking-widest uppercase transition-all duration-200">
              Registrar Encargo +
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
