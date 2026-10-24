import { useState, useEffect } from "react";
import type { View, OrderStatus } from "../types";
import { whatsappUrl } from "../config";

const mapDbToUiStatus = (dbStatus: string): OrderStatus => {
  if (dbStatus === 'en_impresion') return 'printing';
  if (dbStatus === 'completado') return 'done';
  return 'pending';
};

const STATUS_META: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: "En cola — Por Imprimir", className: "status-pending" },
  printing: { label: "Activo — En Impresión", className: "status-printing" },
  done: { label: "Completado — Listo para entrega", className: "status-done" },
};

interface Props {
  orderId: number;
  navigate: (v: View) => void;
  onAdvance?: (id: number) => void;
}

export default function OrderDetailPage({ orderId, navigate }: Props) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Consultar encargo por ID a FastAPI
  const fetchOrder = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/encargos/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      } else {
        setOrder(null);
      }
    } catch (err) {
      console.error("Error al obtener detalle del pedido:", err);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  // Avanzar de estado en la BD desde la vista de detalle
  const handleAdvanceState = async () => {
    if (!order) return;

    let nextDbStatus = "en_impresion";
    let nextProgress = 50;
    if (order.estado === "en_impresion") {
      nextDbStatus = "completado";
      nextProgress = 100;
    }

    try {
      const res = await fetch(`http://localhost:8000/api/v1/encargos/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nextDbStatus, progreso: nextProgress }),
      });
      if (res.ok) {
        fetchOrder();
      }
    } catch (err) {
      console.error("Error al actualizar estado:", err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="font-mono-data text-[#5a7090]">Cargando ficha técnica...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="font-mono-data text-[#5a7090]">Pedido no encontrado.</p>
        <button onClick={() => navigate({ page: "creator" })} className="mt-4 text-[#00c8ff] font-mono-data text-sm hover:underline">
          ← Volver al panel
        </button>
      </div>
    );
  }

  const uiStatus = mapDbToUiStatus(order.estado);
  const meta = STATUS_META[uiStatus];

  const statRows = [
    { label: "ID de pedido", value: `#MS3D-${String(order.id).padStart(4, "0")}` },
    { label: "Cliente", value: order.cliente_nombre },
    { label: "Pieza / Modelo", value: order.producto_nombre },
    { label: "Cantidad", value: `${order.cantidad} unidad${order.cantidad > 1 ? "es" : ""}` },
    { label: "Material / Color", value: order.especificaciones || "—" },
    { label: "Fecha de ingreso", value: order.fecha_creacion || "—" },
  ];

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 font-mono-data text-xs text-[#5a7090]">
        <button onClick={() => navigate({ page: "creator" })} className="hover:text-[#00c8ff] transition-colors">Panel Creador</button>
        <span>/</span>
        <span className="text-[#a855f7]">Detalle de Pedido</span>
      </div>

      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="font-mono-data text-[#a855f7] text-xs tracking-widest uppercase mb-2">// Ficha técnica</div>
          <h1 className="font-display font-700 text-3xl text-white">{order.cliente_nombre}</h1>
          <p className="font-mono-data text-sm text-[#5a7090] mt-1">{order.producto_nombre}</p>
        </div>
        <span className={`font-mono-data text-xs px-4 py-2 rounded-full ${meta.className}`}>{meta.label}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Specs table */}
          <div className="bg-[#0f1520] border border-[rgba(168,85,247,0.15)] rounded overflow-hidden">
            <div className="px-5 py-3 border-b border-[rgba(168,85,247,0.1)] bg-[rgba(168,85,247,0.04)]">
              <h3 className="font-display font-700 text-sm text-white tracking-wide">Especificaciones del encargo</h3>
            </div>
            <div className="divide-y divide-[rgba(0,200,255,0.05)]">
              {statRows.map((row) => (
                <div key={row.label} className="flex justify-between px-5 py-3 hover:bg-[rgba(0,200,255,0.02)] transition-colors">
                  <span className="font-mono-data text-[11px] text-[#5a7090] tracking-wider uppercase">{row.label}</span>
                  <span className="font-mono-data text-[11px] text-white text-right max-w-xs truncate">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Progress bar (only for printing) */}
          {uiStatus === "printing" && order.progreso !== undefined && (
            <div className="bg-[#0f1520] border border-[rgba(0,200,255,0.15)] rounded p-5">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-display font-700 text-sm text-white">Progreso de Impresión</h3>
                <span className="font-mono-data text-sm text-[#00c8ff] font-700">{order.progreso}%</span>
              </div>
              <div className="h-3 bg-[#111928] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${order.progreso}%`,
                    background: "linear-gradient(90deg, #00c8ff, #00dc64)",
                    boxShadow: "0 0 10px rgba(0,200,255,0.4)",
                  }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="font-mono-data text-[9px] text-[#5a7090]">0%</span>
                <span className="font-mono-data text-[9px] text-[#5a7090]">100%</span>
              </div>
            </div>
          )}
        </div>

        {/* Actions sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Status card */}
          <div className="bg-[#0f1520] border border-[rgba(168,85,247,0.15)] rounded p-4">
            <h3 className="font-display font-700 text-sm text-white mb-3">Estado actual</h3>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{uiStatus === "pending" ? "⏳" : uiStatus === "printing" ? "⚙️" : "✅"}</span>
              <span className={`font-mono-data text-xs px-3 py-1.5 rounded-full ${meta.className}`}>{meta.label}</span>
            </div>

            {uiStatus !== "done" && (
              <button
                onClick={handleAdvanceState}
                className="w-full py-2.5 rounded font-display font-700 text-xs tracking-widest uppercase transition-all duration-200 bg-[rgba(0,200,255,0.1)] text-[#00c8ff] border border-[rgba(0,200,255,0.3)] hover:bg-[#00c8ff] hover:text-[#080b0f]"
              >
                {uiStatus === "pending" ? "→ Iniciar Impresión" : "✓ Marcar Completado"}
              </button>
            )}

            {uiStatus === "done" && (
              <div className="w-full py-2.5 rounded text-center font-mono-data text-xs text-[#00dc64] bg-[rgba(0,220,100,0.08)] border border-[rgba(0,220,100,0.2)]">
                ✓ Listo para entrega
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="bg-[#0f1520] border border-[rgba(0,200,255,0.08)] rounded p-4 space-y-2">
            <h3 className="font-display font-700 text-sm text-white mb-3">Acciones rápidas</h3>
            <button
              onClick={() => {
                const msg = `Hola ${order.cliente_nombre}! Tu pedido *${order.producto_nombre}* ya está ${uiStatus === "printing" ? "en impresión 🖨️" : "listo para retirar ✅"}. Avisanos cuando quieras coordinar la entrega.`;
                window.open(whatsappUrl(msg), "_blank");
              }}
              className="w-full py-2 flex items-center gap-2 justify-center rounded border border-[rgba(37,211,102,0.2)] text-[#25d366] hover:bg-[rgba(37,211,102,0.08)] font-mono-data text-xs tracking-wider transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>
              Avisar al cliente
            </button>
            <button
              onClick={() => navigate({ page: "creator" })}
              className="w-full py-2 rounded border border-[rgba(0,200,255,0.12)] text-[#5a7090] hover:text-[#00c8ff] font-mono-data text-xs tracking-wider transition-colors"
            >
              ← Volver al Kanban
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}