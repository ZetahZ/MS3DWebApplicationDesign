import { useState } from "react";
import type { View, CartItem } from "../types";
import { STL_MODELS } from "../data";

interface Props {
  navigate: (v: View) => void;
  onAddToCart: (item: CartItem) => void;
}

export default function ModelsPage({ navigate, onAddToCart }: Props) {
  const [downloaded, setDownloaded] = useState<number[]>([]);

  const handleDownload = (id: number, name: string, isFree: boolean) => {
    if (isFree) {
      setDownloaded((d) => [...d, id]);
      setTimeout(() => setDownloaded((d) => d.filter((x) => x !== id)), 2000);
    } else {
      const model = STL_MODELS.find((m) => m.id === id);
      if (model) {
        onAddToCart({ id: 100 + id, name, price: model.price as number, qty: 1, type: "model", image: model.image });
      }
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <div className="font-mono-data text-[#ff6b2b] text-xs tracking-widest uppercase mb-2">// Para makers y creadores</div>
        <h2 className="font-display font-700 text-3xl sm:text-4xl text-white section-title">Modelos 3D Propios</h2>
        <p className="text-[#5a7090] mt-4 text-sm max-w-xl">
          Archivos STL y 3MF diseñados desde cero en el taller. Descargalos y príntalos vos mismo, o encarganos la impresión.
        </p>
      </div>

      {/* Info strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {[
          { icon: "🖨️", label: "Testeados en cama", desc: "Todos los modelos están probados en nuestras impresoras" },
          { icon: "📐", label: "Parámetros incluidos", desc: "Cada archivo incluye un .txt con la configuración recomendada" },
          { icon: "♻️", label: "Actualizaciones libres", desc: "Al comprar, accedés a versiones futuras del modelo sin costo extra" },
        ].map((item) => (
          <div key={item.label} className="flex items-start gap-3 p-4 bg-[#0f1520] border border-[rgba(255,107,43,0.1)] rounded">
            <span className="text-xl shrink-0">{item.icon}</span>
            <div>
              <p className="font-display font-700 text-sm text-white">{item.label}</p>
              <p className="font-mono-data text-[10px] text-[#5a7090] mt-0.5 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Models grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {STL_MODELS.map((model) => {
          const isFree = model.price === "free";
          const isDlDone = downloaded.includes(model.id);
          return (
            <div key={model.id} className="product-card bg-[#0f1520] border border-[rgba(0,200,255,0.08)] rounded overflow-hidden group hover:border-[rgba(255,107,43,0.3)]">
              <div className="relative overflow-hidden h-44 bg-[#111928]">
                <img src={model.image} alt={model.name} className="w-full h-full object-cover opacity-75 group-hover:opacity-95 group-hover:scale-105 transition-all duration-400" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f1520] via-[#0f152044] to-transparent" />
                <div className="absolute top-3 right-3 font-mono-data text-[9px] px-2 py-0.5 rounded bg-[#080b0f]/80 text-[#ff6b2b] border border-[rgba(255,107,43,0.3)] tracking-widest">
                  {model.format}
                </div>
                {isFree && (
                  <div className="absolute top-3 left-3 font-mono-data text-[10px] px-2 py-0.5 rounded bg-[rgba(0,220,100,0.15)] text-[#00dc64] border border-[rgba(0,220,100,0.3)]">
                    GRATIS
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-display font-700 text-base text-white leading-tight mb-2">{model.name}</h3>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className="font-mono-data text-[10px] text-[#5a7090] px-2 py-0.5 bg-[#111928] rounded">{model.category}</span>
                  <span className="font-mono-data text-[10px] px-2 py-0.5 rounded" style={{
                    background: model.complexity === "Alta" ? "rgba(168,85,247,0.1)" : model.complexity === "Media" ? "rgba(0,200,255,0.1)" : "rgba(0,220,100,0.1)",
                    color: model.complexity === "Alta" ? "#a855f7" : model.complexity === "Media" ? "#00c8ff" : "#00dc64",
                  }}>
                    Complejidad {model.complexity}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-display font-700 text-lg text-white">
                    {isFree ? <span className="text-[#00dc64] text-base font-600">Descarga libre</span>
                      : <><span className="text-[#5a7090] text-sm font-400 font-mono-data">$</span>{(model.price as number).toLocaleString("es-AR")}</>}
                  </span>
                  <button
                    onClick={() => handleDownload(model.id, model.name, isFree)}
                    className={`font-display font-600 text-xs tracking-widest uppercase px-3 py-2 rounded transition-all duration-200 flex items-center gap-1.5 ${
                      isDlDone
                        ? "bg-[#00dc64] text-[#080b0f]"
                        : isFree
                          ? "bg-[rgba(0,220,100,0.1)] text-[#00dc64] border border-[rgba(0,220,100,0.3)] hover:bg-[#00dc64] hover:text-[#080b0f]"
                          : "bg-[rgba(255,107,43,0.1)] text-[#ff6b2b] border border-[rgba(255,107,43,0.3)] hover:bg-[#ff6b2b] hover:text-[#080b0f]"
                    }`}
                  >
                    {isDlDone ? "✓ Descargando" : isFree ? (
                      <>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                        Descargar
                      </>
                    ) : "Comprar STL"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="mt-12 p-6 bg-[#0f1520] border border-[rgba(255,107,43,0.15)] rounded text-center">
        <h3 className="font-display font-700 text-xl text-white mb-2">¿Tenés un archivo pero no una impresora?</h3>
        <p className="text-[#5a7090] text-sm mb-5">Subí tu .STL y nosotros lo imprimimos. Cotización sin cargo.</p>
        <button
          onClick={() => navigate({ page: "contact" })}
          className="px-8 py-3 rounded bg-[rgba(255,107,43,0.15)] border border-[rgba(255,107,43,0.3)] text-[#ff6b2b] hover:bg-[#ff6b2b] hover:text-white font-display font-700 text-sm tracking-widest uppercase transition-all duration-200"
        >
          Cotizar impresión →
        </button>
      </div>
    </section>
  );
}
