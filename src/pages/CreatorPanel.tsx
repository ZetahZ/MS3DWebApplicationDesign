import { useState, useEffect } from "react";
import type { View, OrderStatus } from "../types";

const mapDbToUiStatus = (dbStatus: string): OrderStatus => {
  if (dbStatus === 'en_impresion') return 'printing';
  if (dbStatus === 'completado') return 'done';
  return 'pending';
};

const STATUS_META: Record<OrderStatus, { label: string; icon: string; next: OrderStatus | null; nextLabel: string; borderColor: string; bgColor: string }> = {
  pending: { label: "Por Imprimir", icon: "⏳", next: "printing", nextLabel: "→ Iniciar Impresión", borderColor: "rgba(255,180,0,0.15)", bgColor: "rgba(255,180,0,0.04)" },
  printing: { label: "En Impresión", icon: "⚙️", next: "done", nextLabel: "✓ Marcar Completo", borderColor: "rgba(0,200,255,0.15)", bgColor: "rgba(0,200,255,0.04)" },
  done: { label: "Completados", icon: "✅", next: null, nextLabel: "", borderColor: "rgba(0,220,100,0.15)", bgColor: "rgba(0,220,100,0.04)" },
};

interface Props {
  navigate: (v: View) => void;
}

function OrderCard({ order, onAdvance, onDelete, onDetail }: {
  order: any;
  onAdvance: (id: number) => void;
  onDelete: (id: number) => void;
  onDetail: (id: number) => void;
}) {
  const uiStatus = mapDbToUiStatus(order.estado);
  const meta = STATUS_META[uiStatus];

  return (
    <div className="kanban-card bg-[#111928] border border-[rgba(0,200,255,0.08)] rounded p-3 mb-2 cursor-pointer group" onClick={() => onDetail(order.id)}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <p className="font-display font-700 text-sm text-white leading-tight truncate">{order.cliente_nombre}</p>
          <p className="font-mono-data text-[10px] text-[#5a7090] mt-0.5 truncate">{order.producto_nombre}</p>
        </div>
        <div className="flex items-center gap-1.5 ml-2 shrink-0">
          <span className="font-mono-data text-[10px] text-[#5a7090]">x{order.cantidad}</span>
          <div className="w-2 h-2 rounded-full" style={{ background: order.color || "#00c8ff" }} />
        </div>
      </div>

      {uiStatus === "printing" && order.progreso !== undefined && (
        <div className="mb-2">
          <div className="flex justify-between items-center mb-1">
            <span className="font-mono-data text-[9px] text-[#5a7090]">Progreso</span>
            <span className="font-mono-data text-[9px] text-[#00c8ff]">{order.progreso}%</span>
          </div>
          <div className="h-1 bg-[#0f1520] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#00c8ff] to-[#00dc64] rounded-full transition-all" style={{ width: `${order.progreso}%` }} />
          </div>
        </div>
      )}

      {order.especificaciones && (
        <p className="text-[9px] text-[#5a7090] bg-[#0f1520] rounded px-2 py-1 mb-2 font-mono-data italic truncate">"{order.especificaciones}"</p>
      )}

      <div className="flex items-center justify-between">
        <span className="font-mono-data text-[9px] text-[#5a7090]">{order.fecha_creacion}</span>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {meta.next && (
            <button
              onClick={() => onAdvance(order.id)}
              className="font-mono-data text-[9px] tracking-wider px-2 py-1 rounded border transition-all hover:bg-[rgba(0,200,255,0.1)] text-[#00c8ff] border-[rgba(0,200,255,0.2)]"
            >
              {meta.nextLabel}
            </button>
          )}
          <button onClick={() => onDelete(order.id)} className="text-[#5a7090] hover:text-red-400 transition-colors p-1 opacity-0 group-hover:opacity-100">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CreatorPanel({ navigate }: Props) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      // 1. Obtenemos el ID del usuario logueado desde localStorage (directo o parseando el JSON de user)
      let currentUserId = localStorage.getItem("user_id");

      if (!currentUserId) {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            currentUserId = parsed.id || parsed.user?.id || null;
          } catch (e) {
            console.error("Error al parsear el objeto de usuario:", e);
          }
        }
      }

      // 2. Si existe un usuario activo, filtramos la consulta enviando usuario_id en la URL
      const url = currentUserId
        ? `http://localhost:8000/api/v1/encargos/?usuario_id=${currentUserId}`
        : "http://localhost:8000/api/v1/encargos/";

      const res = await fetch(url);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Error al cargar encargos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAdvance = async (id: number) => {
    const order = orders.find((o: any) => o.id === id);
    if (!order) return;

    let nextDbStatus = "en_impresion";
    let nextProgress = 50;
    if (order.estado === "en_impresion") {
      nextDbStatus = "completado";
      nextProgress = 100;
    } else if (order.estado === "completado") {
      return;
    }

    // Actualización optimista instantánea en pantalla
    setOrders((prevOrders: any) =>
      prevOrders.map((o: any) =>
        o.id === id ? { ...o, estado: nextDbStatus, progreso: nextProgress } : o
      )
    );

    try {
      const res = await fetch(`http://localhost:8000/api/v1/encargos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nextDbStatus, progreso: nextProgress }),
      });
      if (!res.ok) {
        fetchOrders(); // Revertir si la BD falla
      }
    } catch (err) {
      console.error("Error al actualizar estado:", err);
      fetchOrders(); // Revertir en caso de error de red
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/encargos/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setOrders(orders.filter((o: any) => o.id !== id));
      }
    } catch (err) {
      console.error("Error al eliminar encargo:", err);
    }
  };

  const byStatus = (s: OrderStatus) => orders.filter((o: any) => mapDbToUiStatus(o.estado) === s);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="font-mono-data text-[#a855f7] text-xs tracking-widest uppercase mb-2">// Gestión interna</div>
          <h2 className="font-display font-700 text-3xl sm:text-4xl text-white section-title">Panel del Creador</h2>
          <p className="text-[#5a7090] mt-4 text-sm max-w-xl">Control de producción del taller. Hacé clic en un pedido para ver su ficha técnica.</p>
        </div>
        <button
          onClick={() => navigate({ page: "new-order" })}
          className="px-5 py-2.5 rounded bg-[rgba(168,85,247,0.15)] border border-[rgba(168,85,247,0.3)] text-[#a855f7] hover:bg-[#a855f7] hover:text-white font-display font-700 text-sm tracking-widest uppercase transition-all duration-200 flex items-center gap-2 shrink-0"
        >
          <span className="text-lg leading-none">+</span> Nuevo Encargo
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {(["pending", "printing", "done"] as OrderStatus[]).map((s) => {
          const meta = STATUS_META[s];
          return (
            <div key={s} className="p-4 rounded border text-center" style={{ background: meta.bgColor, borderColor: meta.borderColor }}>
              <div className="text-2xl mb-1">{meta.icon}</div>
              <div className="font-display font-700 text-3xl text-white">{byStatus(s).length}</div>
              <div className="font-mono-data text-[10px] text-[#5a7090] tracking-widest mt-0.5">{meta.label.toUpperCase()}</div>
            </div>
          );
        })}
      </div>

      {/* Kanban */}
      {loading ? (
        <div className="text-center py-20 text-[#5a7090] font-mono-data">Cargando taller...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {(["pending", "printing", "done"] as OrderStatus[]).map((s) => {
            const meta = STATUS_META[s];
            const colOrders = byStatus(s);
            return (
              <div key={s} className="flex flex-col">
                <div className="flex items-center justify-between mb-3 p-2.5 rounded" style={{ background: meta.bgColor, border: `1px solid ${meta.borderColor}` }}>
                  <div className="flex items-center gap-2">
                    <span>{meta.icon}</span>
                    <span className="font-display font-700 text-sm text-white">{meta.label}</span>
                  </div>
                  <span className="font-mono-data text-xs px-2 py-0.5 rounded-full" style={{
                    background: s === "pending" ? "rgba(255,180,0,0.15)" : s === "printing" ? "rgba(0,200,255,0.15)" : "rgba(0,220,100,0.15)",
                    color: s === "pending" ? "#ffb400" : s === "printing" ? "#00c8ff" : "#00dc64",
                  }}>
                    {colOrders.length}
                  </span>
                </div>
                <div className="flex-1 min-h-[180px]">
                  {colOrders.length === 0 && (
                    <div className="flex items-center justify-center h-24 border border-dashed border-[rgba(255,255,255,0.06)] rounded text-[#5a7090] text-xs font-mono-data">
                      Sin pedidos
                    </div>
                  )}
                  {colOrders.map((o: any) => (
                    <OrderCard
                      key={o.id}
                      order={o}
                      onAdvance={handleAdvance}
                      onDelete={handleDelete}
                      onDetail={(id) => navigate({ page: "order-detail", id })}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}