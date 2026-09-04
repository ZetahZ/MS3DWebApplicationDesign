import type { View } from "../types";

interface Props {
  navigate: (v: View) => void;
}

const PRINTERS = [
  { name: "Bambu Lab X1C", qty: 2, tech: "FDM — CoreXY", speed: "500mm/s", materials: "PLA, PETG, ABS, ASA, TPU, PA", image: "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=400&h=280&fit=crop&auto=format" },
  { name: "Prusa MK4", qty: 1, tech: "FDM — Bed Slinger", speed: "200mm/s", materials: "PLA, PETG, ASA, Flex", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=280&fit=crop&auto=format" },
  { name: "Bambu Lab P1S", qty: 1, tech: "FDM — CoreXY (AMS)", speed: "500mm/s", materials: "Multi-color, PA, CF, PLA", image: "https://images.unsplash.com/photo-1517976487492-5750f3195933?w=400&h=280&fit=crop&auto=format" },
  { name: "Elegoo Saturn 4 Ultra", qty: 1, tech: "MSLA — Resina", speed: "High-res resin", materials: "Standard, ABS-like, Tough, Flexible", image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=280&fit=crop&auto=format" },
];

const MATERIALS_LIST = [
  { name: "PLA / PLA+", desc: "Material base para la mayoría de los prints. Alta definición, colores vibrantes.", color: "#00c8ff" },
  { name: "PLA Silk", desc: "Acabado metálico satinado. Gold, silver, copper y más.", color: "#d4a017" },
  { name: "PLA Matte", desc: "Acabado sin brillo, textura premium. Ideal para deco.", color: "#a0b0c8" },
  { name: "PETG", desc: "Resistente al agua y al calor. Perfecto para piezas funcionales.", color: "#ff6b2b" },
  { name: "TPU", desc: "Flexible y resistente a golpes. Para protectores, partes blandas.", color: "#00dc64" },
  { name: "ABS / ASA", desc: "Resistencia UV y alta temperatura. Para exteriores y automóviles.", color: "#a855f7" },
  { name: "PLA Wood", desc: "Textura y aroma a madera real. Para piezas decorativas.", color: "#8b6248" },
  { name: "Resina MSLA", desc: "Ultradetalle para miniaturas y joyería. Acabado liso.", color: "#ffb400" },
];

const STATS = [
  { value: "500+", label: "Pedidos completados" },
  { value: "4", label: "Impresoras activas" },
  { value: "8+", label: "Materiales disponibles" },
  { value: "48h", label: "Tiempo de entrega promedio" },
];

export default function AboutPage({ navigate }: Props) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Hero */}
      <div className="relative overflow-hidden rounded border border-[rgba(0,200,255,0.1)] bg-[#0f1520] mb-12 p-8 sm:p-12">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1563770660941-20978e870e26?w=1400&h=500&fit=crop&auto=format" alt="Taller M's3D" className="w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080b0f] via-[#080b0f]/80 to-transparent" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="font-mono-data text-[#00c8ff] text-xs tracking-widest uppercase mb-3">// M's3D — Print Studio</div>
          <h1 className="font-display font-700 text-4xl sm:text-5xl text-white leading-tight mb-4">
            El taller detrás de cada <span className="text-[#00c8ff] text-glow">capa</span>
          </h1>
          <p className="text-[#a0b0c8] text-sm leading-relaxed">
            Somos un estudio de impresión 3D independiente nacido de la pasión por el making y el diseño digital. Comenzamos con una sola impresora en 2022 y hoy manejamos 4 máquinas, trabajando desde figuras articuladas hasta piezas técnicas de precisión.
          </p>
          <p className="text-[#5a7090] text-sm leading-relaxed mt-3">
            Cada pieza que sale del taller pasa por revisión manual. No somos una fábrica — somos artesanos digitales.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
        {STATS.map((s) => (
          <div key={s.label} className="bg-[#0f1520] border border-[rgba(0,200,255,0.08)] rounded p-5 text-center">
            <div className="font-display font-700 text-4xl text-[#00c8ff] text-glow">{s.value}</div>
            <div className="font-mono-data text-[10px] text-[#5a7090] tracking-widest mt-1">{s.label.toUpperCase()}</div>
          </div>
        ))}
      </div>

      {/* Printers */}
      <div className="mb-12">
        <div className="font-mono-data text-[#ff6b2b] text-xs tracking-widest uppercase mb-2">// Equipamiento</div>
        <h2 className="font-display font-700 text-2xl sm:text-3xl text-white section-title mb-6">Nuestras Impresoras</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {PRINTERS.map((p) => (
            <div key={p.name} className="flex gap-4 bg-[#0f1520] border border-[rgba(0,200,255,0.08)] rounded overflow-hidden group hover:border-[rgba(0,200,255,0.2)] transition-all">
              <div className="w-32 shrink-0 overflow-hidden">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity" />
              </div>
              <div className="p-4 flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-display font-700 text-base text-white leading-tight">{p.name}</h3>
                  <span className="font-mono-data text-[9px] px-1.5 py-0.5 bg-[rgba(0,200,255,0.1)] text-[#00c8ff] rounded shrink-0">x{p.qty}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex gap-1.5">
                    <span className="font-mono-data text-[9px] text-[#5a7090]">Tecnología:</span>
                    <span className="font-mono-data text-[9px] text-[#a0b0c8]">{p.tech}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="font-mono-data text-[9px] text-[#5a7090]">Velocidad:</span>
                    <span className="font-mono-data text-[9px] text-[#00c8ff]">{p.speed}</span>
                  </div>
                  <div className="mt-1">
                    <span className="font-mono-data text-[9px] text-[#5a7090] block mb-0.5">Materiales:</span>
                    <span className="font-mono-data text-[9px] text-[#a0b0c8] leading-relaxed">{p.materials}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Materials */}
      <div className="mb-12">
        <div className="font-mono-data text-[#a855f7] text-xs tracking-widest uppercase mb-2">// Filamentos y resinas</div>
        <h2 className="font-display font-700 text-2xl sm:text-3xl text-white section-title mb-6">Materiales que Trabajamos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {MATERIALS_LIST.map((m) => (
            <div key={m.name} className="bg-[#0f1520] border border-[rgba(0,200,255,0.06)] rounded p-4 hover:border-[rgba(0,200,255,0.15)] transition-all">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full" style={{ background: m.color }} />
                <span className="font-display font-700 text-sm text-white">{m.name}</span>
              </div>
              <p className="font-mono-data text-[10px] text-[#5a7090] leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Process */}
      <div className="mb-12">
        <div className="font-mono-data text-[#00dc64] text-xs tracking-widest uppercase mb-2">// Proceso de trabajo</div>
        <h2 className="font-display font-700 text-2xl sm:text-3xl text-white section-title mb-6">Cómo Trabajamos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-0">
          {[
            { n: "01", title: "Pedido", desc: "Recibimos tu solicitud vía web o WhatsApp." },
            { n: "02", title: "Slicing", desc: "Configuramos los parámetros óptimos en Bambu Studio / PrusaSlicer." },
            { n: "03", title: "Impresión", desc: "La pieza entra en cola de producción y la monitoreamos en tiempo real." },
            { n: "04", title: "Entrega", desc: "Control de calidad manual, empaque y despacho o retiro en taller." },
          ].map((step, i) => (
            <div key={step.n} className="flex flex-col sm:flex-row items-start">
              <div className="flex sm:flex-col items-center sm:items-start w-full sm:w-auto gap-3 sm:gap-0">
                <div className="bg-[#0f1520] border border-[rgba(0,220,100,0.2)] rounded p-4 sm:p-5 w-full sm:w-36">
                  <div className="font-mono-data text-[#00dc64] text-2xl font-700">{step.n}</div>
                  <div className="font-display font-700 text-base text-white mt-1">{step.title}</div>
                  <p className="font-mono-data text-[10px] text-[#5a7090] mt-1 leading-relaxed">{step.desc}</p>
                </div>
              </div>
              {i < 3 && (
                <div className="hidden sm:flex items-center flex-1 px-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-[rgba(0,220,100,0.3)] to-[rgba(0,220,100,0.05)]" />
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00dc64" strokeWidth="2" opacity="0.4"><polyline points="9 18 15 12 9 6" /></svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => navigate({ page: "catalog" })}
          className="p-6 text-left bg-[#0f1520] border border-[rgba(0,200,255,0.15)] rounded hover:border-[rgba(0,200,255,0.35)] transition-all group"
        >
          <div className="font-mono-data text-xs text-[#00c8ff] mb-2 tracking-widest">// Ver productos →</div>
          <div className="font-display font-700 text-xl text-white">Explorar el catálogo</div>
          <div className="font-mono-data text-[10px] text-[#5a7090] mt-1">Piezas listas para entrega</div>
        </button>
        <button
          onClick={() => navigate({ page: "contact" })}
          className="p-6 text-left bg-[#0f1520] border border-[rgba(255,107,43,0.15)] rounded hover:border-[rgba(255,107,43,0.35)] transition-all group"
        >
          <div className="font-mono-data text-xs text-[#ff6b2b] mb-2 tracking-widest">// Cotizar →</div>
          <div className="font-display font-700 text-xl text-white">Pedir una cotización</div>
          <div className="font-mono-data text-[10px] text-[#5a7090] mt-1">Subí tu STL y te calculamos el precio</div>
        </button>
      </div>
    </section>
  );
}
