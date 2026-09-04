import { useState } from "react";
import type { View } from "../types";

interface Props {
  navigate: (v: View) => void;
}

type ServiceType = "cotizacion" | "consulta" | "encargo" | "otro";

export default function ContactPage({ navigate }: Props) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    service: "cotizacion" as ServiceType,
    material: "",
    quantity: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [fileNames, setFileNames] = useState<string[]>([]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) setFileNames(Array.from(files).map((f) => f.name));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hasFiles = fileNames.length > 0 ? `\n📎 Archivos: ${fileNames.join(", ")}` : "";
    const msg = `Hola M's3D! Te escribo desde la web.\n\n👤 Nombre: ${form.name}\n📧 Email: ${form.email}\n📱 Tel: ${form.phone}\n🔧 Tipo: ${form.service}\n${form.material ? `🧵 Material: ${form.material}\n` : ""}${form.quantity ? `📦 Cantidad: ${form.quantity}\n` : ""}${hasFiles}\n\n💬 ${form.message}`;
    window.open(`https://wa.me/5491100000000?text=${encodeURIComponent(msg)}`, "_blank");
    setSubmitted(true);
  };

  const inputClass = "w-full bg-[#111928] border border-[rgba(0,200,255,0.1)] rounded px-3 py-2.5 text-sm text-white placeholder:text-[#5a7090] focus:outline-none focus:border-[rgba(0,200,255,0.4)] transition-colors font-mono-data";

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-[rgba(37,211,102,0.15)] border border-[rgba(37,211,102,0.3)] flex items-center justify-center mx-auto mb-6">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-[#25d366]"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>
        </div>
        <h2 className="font-display font-700 text-3xl text-white mb-3">¡Mensaje enviado!</h2>
        <p className="text-[#5a7090] text-sm mb-6">Te redirigimos a WhatsApp. Si no se abrió automáticamente, escribinos al +54 11 0000-0000.</p>
        <button onClick={() => navigate({ page: "catalog" })} className="px-8 py-3 rounded bg-[rgba(0,200,255,0.1)] text-[#00c8ff] border border-[rgba(0,200,255,0.3)] font-display font-700 text-sm tracking-widest uppercase hover:bg-[#00c8ff] hover:text-[#080b0f] transition-all">
          Volver al Catálogo
        </button>
      </div>
    );
  }

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <div className="font-mono-data text-[#ff6b2b] text-xs tracking-widest uppercase mb-2">// Contacto directo</div>
        <h1 className="font-display font-700 text-3xl sm:text-4xl text-white section-title">Contacto y Cotizaciones</h1>
        <p className="text-[#5a7090] mt-4 text-sm max-w-xl">Completá el formulario y te respondemos en menos de 24 horas. También podés escribirnos directamente por WhatsApp.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-[#0f1520] border border-[rgba(255,107,43,0.15)] rounded p-6 space-y-5">
            {/* Service type */}
            <div>
              <label className="font-mono-data text-[10px] text-[#5a7090] tracking-widest uppercase block mb-2">Tipo de consulta *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {([
                  { id: "cotizacion", label: "💰 Cotización", desc: "Quiero un presupuesto" },
                  { id: "consulta", label: "💬 Consulta", desc: "Tengo una pregunta" },
                  { id: "encargo", label: "🖨️ Encargo", desc: "Quiero imprimir algo" },
                  { id: "otro", label: "📋 Otro", desc: "Otros temas" },
                ] as { id: ServiceType; label: string; desc: string }[]).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setForm({ ...form, service: opt.id })}
                    className={`p-3 rounded border text-left transition-all ${
                      form.service === opt.id
                        ? "border-[rgba(255,107,43,0.4)] bg-[rgba(255,107,43,0.08)]"
                        : "border-[rgba(0,200,255,0.08)] hover:border-[rgba(0,200,255,0.2)]"
                    }`}
                  >
                    <div className="font-display font-700 text-sm text-white">{opt.label}</div>
                    <div className="font-mono-data text-[9px] text-[#5a7090] mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Contact info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-mono-data text-[10px] text-[#5a7090] tracking-widest uppercase block mb-1.5">Nombre *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tu nombre" className={inputClass} required />
              </div>
              <div>
                <label className="font-mono-data text-[10px] text-[#5a7090] tracking-widest uppercase block mb-1.5">WhatsApp *</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+54 11 1234-5678" className={inputClass} required />
              </div>
              <div>
                <label className="font-mono-data text-[10px] text-[#5a7090] tracking-widest uppercase block mb-1.5">Email</label>
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="tu@email.com" className={inputClass} type="email" />
              </div>
              {(form.service === "cotizacion" || form.service === "encargo") && (
                <>
                  <div>
                    <label className="font-mono-data text-[10px] text-[#5a7090] tracking-widest uppercase block mb-1.5">Material preferido</label>
                    <input value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} placeholder="PLA, PETG, TPU..." className={inputClass} />
                  </div>
                  <div>
                    <label className="font-mono-data text-[10px] text-[#5a7090] tracking-widest uppercase block mb-1.5">Cantidad de piezas</label>
                    <input value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="Ej: 3 unidades" className={inputClass} />
                  </div>
                </>
              )}
            </div>

            {/* File upload */}
            <div>
              <label className="font-mono-data text-[10px] text-[#5a7090] tracking-widest uppercase block mb-1.5">
                Adjuntar archivo .STL / .3MF / imagen (opcional)
              </label>
              <label className="flex items-center gap-3 p-4 border border-dashed border-[rgba(0,200,255,0.2)] rounded cursor-pointer hover:border-[rgba(0,200,255,0.4)] transition-colors group bg-[#111928]">
                <div className="w-9 h-9 rounded bg-[rgba(0,200,255,0.1)] flex items-center justify-center shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00c8ff" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  {fileNames.length === 0 ? (
                    <>
                      <p className="font-display font-600 text-sm text-white">Subir archivos</p>
                      <p className="font-mono-data text-[10px] text-[#5a7090]">.STL, .3MF, .OBJ, imágenes — hasta 50MB</p>
                    </>
                  ) : (
                    <div className="space-y-0.5">
                      {fileNames.map((n) => (
                        <p key={n} className="font-mono-data text-[10px] text-[#00c8ff] truncate">{n}</p>
                      ))}
                    </div>
                  )}
                </div>
                <input type="file" multiple accept=".stl,.3mf,.obj,.png,.jpg,.jpeg" className="sr-only" onChange={handleFile} />
              </label>
            </div>

            {/* Message */}
            <div>
              <label className="font-mono-data text-[10px] text-[#5a7090] tracking-widest uppercase block mb-1.5">Mensaje *</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Describí lo que necesitás: dimensiones, colores, cantidad, usos, referencias..."
                className={`${inputClass} resize-none h-28`}
                required
              />
            </div>

            <button
              type="submit"
              disabled={!form.name || !form.phone || !form.message}
              className="w-full py-3 rounded bg-[#25d366] hover:bg-[#20bd5a] text-white font-display font-700 text-sm tracking-widest uppercase transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>
              Enviar por WhatsApp
            </button>
            <p className="font-mono-data text-[10px] text-[#5a7090] text-center">
              Al enviar, se abrirá WhatsApp con tu consulta formateada
            </p>
          </form>
        </div>

        {/* Contact info */}
        <div className="space-y-4">
          {/* Direct channels */}
          <div className="bg-[#0f1520] border border-[rgba(0,200,255,0.1)] rounded p-5">
            <h3 className="font-display font-700 text-base text-white mb-4">Canales directos</h3>
            <div className="space-y-3">
              <a href="https://wa.me/5491100000000" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded bg-[rgba(37,211,102,0.06)] border border-[rgba(37,211,102,0.15)] hover:border-[rgba(37,211,102,0.3)] transition-all group">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#25d366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>
                <div>
                  <p className="font-display font-700 text-sm text-white">WhatsApp</p>
                  <p className="font-mono-data text-[10px] text-[#5a7090]">+54 11 0000-0000</p>
                </div>
              </a>
              <div className="flex items-center gap-3 p-3 rounded bg-[rgba(0,200,255,0.04)] border border-[rgba(0,200,255,0.1)]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00c8ff" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                <div>
                  <p className="font-display font-700 text-sm text-white">Email</p>
                  <p className="font-mono-data text-[10px] text-[#5a7090]">contacto@ms3d.com.ar</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div className="bg-[#0f1520] border border-[rgba(0,200,255,0.08)] rounded p-5">
            <h3 className="font-display font-700 text-base text-white mb-3">Horarios de atención</h3>
            <div className="space-y-2 font-mono-data text-xs">
              <div className="flex justify-between">
                <span className="text-[#5a7090]">Lunes — Viernes</span>
                <span className="text-white">9:00 — 19:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5a7090]">Sábados</span>
                <span className="text-white">10:00 — 14:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5a7090]">Domingos</span>
                <span className="text-[#5a7090]">Cerrado</span>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#00dc64] animate-pulse" />
              <span className="font-mono-data text-[10px] text-[#00dc64]">Impresoras activas 24/7</span>
            </div>
          </div>

          {/* Turnaround */}
          <div className="bg-[#0f1520] border border-[rgba(255,107,43,0.1)] rounded p-5">
            <h3 className="font-display font-700 text-base text-white mb-3">Tiempos de entrega</h3>
            <div className="space-y-2">
              {[
                { type: "Llaveros / piezas pequeñas", time: "24 — 48hs" },
                { type: "Piezas medianas", time: "2 — 4 días" },
                { type: "Figuras grandes / articuladas", time: "4 — 7 días" },
                { type: "Pedidos con volumen", time: "A coordinar" },
              ].map((item) => (
                <div key={item.type} className="flex justify-between gap-2">
                  <span className="font-mono-data text-[10px] text-[#5a7090] flex-1">{item.type}</span>
                  <span className="font-mono-data text-[10px] text-[#ff6b2b] shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
