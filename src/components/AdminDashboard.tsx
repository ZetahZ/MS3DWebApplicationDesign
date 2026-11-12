import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { API_BASE_URL } from '../config';

const FORM_VACIO = { nombre: '', precio: '', stock: '', categoria_id: 1, activo: true, imagen: '' };

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'metrics' | 'users' | 'content' | 'encargos'>('metrics');
  const [metrics, setMetrics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [editando, setEditando] = useState<number | 'nuevo' | null>(null);
  const [form, setForm] = useState<any>(FORM_VACIO);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [encargos, setEncargos] = useState<any[]>([]);

  const savedUser = localStorage.getItem('user');
  const currentUser = savedUser ? JSON.parse(savedUser) : null;
  const esAdmin = currentUser?.is_admin === true;
  const authHeaders = { headers: { 'X-User-Id': String(currentUser?.id || '') } };

  // -----------------------------------------------------------
  // CÁLCULOS DINÁMICOS PARA LAS NUEVAS MÉTRICAS (1, 3 y 4)
  // -----------------------------------------------------------
  
  // 1. Tarjetas extra (Trabajo y Pedidos)
  const enCola = encargos.filter(e => e.estado === 'por_imprimir').length;
  const imprimiendo = encargos.filter(e => e.estado === 'imprimiendo').length;
  const completados = encargos.filter(e => e.estado === 'terminado' || e.estado === 'entregado').length;

  // 3. Alertas de bajo stock (menor o igual a 3 unidades)
  const productosBajoStock = productos
    .filter(p => p.stock <= 3)
    .sort((a, b) => a.stock - b.stock); // Ordenar de menor a mayor stock

  // 4. Gráfico: Agrupar pedidos por fecha
  const pedidosPorFecha = encargos.reduce((acc, encargo) => {
    const fecha = encargo.fecha_creacion.split(' ')[0]; // "2026-11-04" -> se queda con la fecha
    acc[fecha] = (acc[fecha] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Darle el formato exacto que pide recharts y mostrar solo los últimos 7 días
  const datosGrafico = Object.keys(pedidosPorFecha).map(fecha => ({
    name: fecha.slice(-5), // Acorta "2026-11-04" a "11-04"
    pedidos: pedidosPorFecha[fecha]
  })).slice(-7);


  // -----------------------------------------------------------
  // FUNCIONES DE API
  // -----------------------------------------------------------
  const cargarUsuarios = () => {
    axios.get(`${API_BASE_URL}/api/v1/usuarios/`, authHeaders).then(res => setUsers(res.data)).catch(() => {});
  };

  const cargarProductos = () => {
    axios.get(`${API_BASE_URL}/api/v1/productos/`).then(res => setProductos(res.data)).catch(() => {});
  };

  const cargarCategorias = () => {
    axios.get(`${API_BASE_URL}/api/v1/categorias/`).then(res => setCategorias(res.data)).catch(() => {});
  };

  const cargarEncargos = () => {
    axios.get(`${API_BASE_URL}/api/v1/encargos/`, authHeaders).then(res => setEncargos(res.data)).catch(() => {});
  };

  const cambiarEstadoEncargo = async (e: React.MouseEvent, id: number, estadoActual: string) => {
    e.preventDefault(); 
    const estadoParseado = String(estadoActual).toLowerCase().trim().replace(' ', '_');
    
    let nuevoEstado = '';
    let nuevoProgreso = 0;

    if (estadoParseado === 'por_imprimir') {
      nuevoEstado = 'imprimiendo';
      nuevoProgreso = 50;
    } else if (estadoParseado === 'imprimiendo') {
      nuevoEstado = 'terminado';
      nuevoProgreso = 100;
    } else if (estadoParseado === 'terminado') {
      nuevoEstado = 'entregado';
      nuevoProgreso = 100;
    } else {
      nuevoEstado = 'por_imprimir';
      nuevoProgreso = 0;
    }

    try {
      await axios.put(`${API_BASE_URL}/api/v1/encargos/${id}`, { estado: nuevoEstado, progreso: nuevoProgreso }, authHeaders);
      cargarEncargos();
    } catch (err: any) {
      alert("Error al actualizar el estado: " + (err.response?.data?.detail || err.message));
    }
  };

  const cambiarRol = (id: number, isAdminActual: boolean) => {
    axios.patch(`${API_BASE_URL}/api/v1/usuarios/${id}/role`, { is_admin: !isAdminActual }, authHeaders)
      .then(() => cargarUsuarios())
      .catch(err => alert(err.response?.data?.detail || 'No se pudo cambiar el rol'));
  };

  const cambiarEstado = (id: number, estadoActual: string, activoActual: boolean) => {
    const nuevoEstado = estadoActual === 'suspendido' ? 'activo' : 'suspendido';
    const nuevoActivo = !activoActual;
    axios.patch(`${API_BASE_URL}/api/v1/usuarios/${id}/status`, { status: nuevoEstado, is_active: nuevoActivo }, authHeaders)
      .then(() => cargarUsuarios())
      .catch(err => alert(err.response?.data?.detail || 'No se pudo actualizar el estado'));
  };

  const eliminarUsuarioLogico = (id: number, nombre: string) => {
    if (!confirm(`¿Eliminar lógicamente al usuario "${nombre}"?`)) return;
    axios.delete(`${API_BASE_URL}/api/v1/usuarios/${id}`, authHeaders)
      .then(() => cargarUsuarios())
      .catch(err => alert(err.response?.data?.detail || 'No se pudo eliminar el usuario'));
  };

  const empezarNuevo = () => {
    setEditando('nuevo');
    setForm(FORM_VACIO);
    setArchivo(null);
  };

  const empezarEdicion = (p: any) => {
    setEditando(p.id);
    setForm({
      nombre: p.nombre,
      precio: String(p.precio),
      stock: String(p.stock),
      categoria_id: p.categoria_id,
      activo: p.activo,
      imagen: p.imagen || '',
    });
    setArchivo(null);
  };

  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path; 
    if (path.startsWith('/')) return `${API_BASE_URL}${path}`;
    return `${API_BASE_URL}/static/productos/${path}`;
  };
  
  const guardarProducto = async () => {
    let imagenUrlFinal = form.imagen;

    if (archivo) {
      const data = new FormData();
      data.append('file', archivo);
      try {
        const res = await axios.post(`${API_BASE_URL}/api/admin/upload-imagen`, data, authHeaders);
        imagenUrlFinal = res.data.url; 
      } catch (err: any) {
        alert(err.response?.data?.detail || 'No se pudo subir la imagen a la nube');
        return;
      }
    }

    const body: any = {
      nombre: form.nombre,
      precio: parseFloat(form.precio),
      stock: parseInt(form.stock),
      categoria_id: Number(form.categoria_id),
      activo: form.activo,
      imagen: imagenUrlFinal,
    };

    if (!body.nombre || isNaN(body.precio) || isNaN(body.stock)) {
      alert('Completá nombre, precio y stock');
      return;
    }

    const req = editando === 'nuevo'
      ? axios.post(`${API_BASE_URL}/api/v1/productos/`, body, authHeaders)
      : axios.put(`${API_BASE_URL}/api/v1/productos/${editando}`, body, authHeaders);
      
    req.then(() => { 
      setEditando(null); 
      setArchivo(null); 
      cargarProductos(); 
    }).catch(err => alert(err.response?.data?.detail || 'No se pudo guardar el producto'));
  };

  const eliminarProducto = (id: number, nombre: string) => {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return;
    axios.delete(`${API_BASE_URL}/api/v1/productos/${id}`, authHeaders)
      .then(() => cargarProductos())
      .catch(err => alert(err.response?.data?.detail || 'No se pudo eliminar el producto'));
  };

  useEffect(() => {
    if (!esAdmin) return;
    axios.get(`${API_BASE_URL}/api/admin/metrics`, authHeaders).then(res => setMetrics(res.data)).catch(() => {});
    cargarUsuarios();
    cargarProductos();
    cargarCategorias();
    cargarEncargos();
  }, []);

  if (!esAdmin) {
    return (
      <div className="h-screen flex items-center justify-center grid-bg bg-[#0b0f19] text-red-500 font-display font-bold text-xl">
        Acceso denegado. Iniciá sesión con una cuenta de administrador.
      </div>
    );
  }

  const getTabClass = (tabName: string) => {
    const baseClass = "p-3 rounded flex items-center gap-3 text-xs font-mono-data tracking-widest uppercase transition-all duration-200 border-l-2";
    return activeTab === tabName 
      ? `${baseClass} bg-[rgba(0,200,255,0.1)] text-[#00c8ff] border-[#00c8ff]` 
      : `${baseClass} text-[#5a7090] border-transparent hover:text-[#00c8ff] hover:bg-[rgba(0,200,255,0.05)]`;
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0b0f19] text-white grid-bg relative">
      <aside className="w-64 bg-[#0f1520]/95 backdrop-blur-md border-r border-[rgba(0,200,255,0.1)] p-6 flex flex-col gap-2 h-full overflow-y-auto flex-shrink-0 z-10">
        <h2 className="text-xl font-display font-700 mb-8 text-white flex items-center gap-2">
          <span className="text-[#00c8ff]">{'//'}</span> Panel Admin
        </h2>
        
        <button onClick={() => setActiveTab('metrics')} className={getTabClass('metrics')}>
          <span className="text-lg">📊</span> Métricas
        </button>
        <button onClick={() => setActiveTab('users')} className={getTabClass('users')}>
          <span className="text-lg">👥</span> Usuarios
        </button>
        <button onClick={() => setActiveTab('content')} className={getTabClass('content')}>
          <span className="text-lg">⚙️</span> Contenido
        </button>
        <button onClick={() => setActiveTab('encargos')} className={getTabClass('encargos')}>
          <span className="text-lg">📦</span> Pedidos
        </button>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto z-10">
        
        {activeTab === 'metrics' && metrics && (
          <div className="animate-fade-in max-w-6xl">
            <h1 className="text-3xl font-display font-700 mb-6">Métricas del Sistema</h1>
            
            {/* Fila 1: Estadísticas de Sistema */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-[#0f1520] p-6 rounded border border-[rgba(0,200,255,0.08)] shadow-[0_0_15px_rgba(0,200,255,0.03)] hover:border-[rgba(0,200,255,0.3)] transition-colors">
                <div className="font-mono-data text-[#5a7090] text-xs tracking-widest uppercase mb-2">Usuarios Totales</div>
                <div className="text-4xl font-display text-[#00c8ff] font-bold">{metrics.total_users}</div>
              </div>
              <div className="bg-[#0f1520] p-6 rounded border border-[rgba(0,200,255,0.08)] shadow-[0_0_15px_rgba(0,200,255,0.03)] hover:border-[rgba(0,200,255,0.3)] transition-colors">
                <div className="font-mono-data text-[#5a7090] text-xs tracking-widest uppercase mb-2">Contenido Total</div>
                <div className="text-4xl font-display text-[#00c8ff] font-bold">{metrics.total_content}</div>
              </div>
              <div className="bg-[#0f1520] p-6 rounded border border-[rgba(0,200,255,0.08)] shadow-[0_0_15px_rgba(0,200,255,0.03)] hover:border-[rgba(0,200,255,0.3)] transition-colors">
                <div className="font-mono-data text-[#5a7090] text-xs tracking-widest uppercase mb-2">Sesiones Activas</div>
                <div className="text-4xl font-display text-[#00c8ff] font-bold">{metrics.active_sessions}</div>
              </div>
            </div>

            {/* Fila 2: Estadísticas de Trabajo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-[#0f1520] p-6 rounded border border-[rgba(0,200,255,0.08)] shadow-[0_0_15px_rgba(0,200,255,0.03)] hover:border-[rgba(0,200,255,0.3)] transition-colors">
                <div className="font-mono-data text-[#5a7090] text-xs tracking-widest uppercase mb-2">Pedidos en Cola</div>
                <div className="text-4xl font-display text-orange-400 font-bold">{enCola}</div>
              </div>
              <div className="bg-[#0f1520] p-6 rounded border border-[rgba(0,200,255,0.08)] shadow-[0_0_15px_rgba(0,200,255,0.03)] hover:border-[rgba(0,200,255,0.3)] transition-colors">
                <div className="font-mono-data text-[#5a7090] text-xs tracking-widest uppercase mb-2">Imprimiendo Ahora</div>
                <div className="text-4xl font-display text-[#00c8ff] font-bold">{imprimiendo}</div>
              </div>
              <div className="bg-[#0f1520] p-6 rounded border border-[rgba(0,200,255,0.08)] shadow-[0_0_15px_rgba(0,200,255,0.03)] hover:border-[rgba(0,200,255,0.3)] transition-colors">
                <div className="font-mono-data text-[#5a7090] text-xs tracking-widest uppercase mb-2">Pedidos Completados</div>
                <div className="text-4xl font-display text-green-400 font-bold">{completados}</div>
              </div>
            </div>

            {/* Fila 3: Gráfico y Alertas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Gráfico Visual */}
              <div className="lg:col-span-2 bg-[#0f1520] p-6 rounded border border-[rgba(0,200,255,0.08)] shadow-[0_0_15px_rgba(0,200,255,0.03)]">
                <h2 className="font-mono-data text-[#5a7090] text-xs tracking-widest uppercase mb-6 flex items-center gap-2">
                  <span className="text-[#00c8ff]">📈</span> Actividad de Pedidos (Últimos días)
                </h2>
                <div className="h-64 w-full">
                  {datosGrafico.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={datosGrafico}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,200,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="#5a7090" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#5a7090" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip 
                          cursor={{ fill: 'rgba(0,200,255,0.05)' }}
                          contentStyle={{ backgroundColor: '#0b0f19', borderColor: 'rgba(0,200,255,0.2)', color: '#00c8ff', fontFamily: 'monospace' }}
                          itemStyle={{ color: '#00c8ff' }}
                        />
                        <Bar dataKey="pedidos" fill="#00c8ff" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-[#5a7090] font-mono-data text-xs uppercase tracking-widest">
                      No hay datos suficientes para graficar
                    </div>
                  )}
                </div>
              </div>

              {/* Alertas de Bajo Stock */}
              <div className="bg-[#0f1520] p-6 rounded border border-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.03)]">
                <h2 className="font-mono-data text-[#5a7090] text-xs tracking-widest uppercase mb-4 flex items-center gap-2">
                  <span className="text-red-500 animate-pulse">⚠️</span> Alertas de Stock
                </h2>
                <div className="flex flex-col gap-3 overflow-y-auto h-64 pr-2 custom-scrollbar">
                  {productosBajoStock.length === 0 ? (
                    <div className="text-[#a0b0c8] text-xs font-mono-data h-full flex items-center justify-center border border-dashed border-[rgba(0,200,255,0.1)] rounded">
                      Inventario óptimo
                    </div>
                  ) : (
                    productosBajoStock.map(p => (
                      <div key={p.id} className="flex justify-between items-center p-3 bg-[#0b0f19] rounded border border-red-500/20">
                        <div className="flex flex-col">
                          <span className="text-white text-sm truncate max-w-[120px] font-medium">{p.nombre}</span>
                          <span className="text-[10px] font-mono-data text-[#5a7090]">ID: #{p.id}</span>
                        </div>
                        <span className={`px-2 py-1 rounded text-[10px] font-mono-data font-bold border ${p.stock === 0 ? 'bg-red-900/20 text-red-400 border-red-500/30' : 'bg-orange-900/20 text-orange-400 border-orange-500/30'}`}>
                          {p.stock} unid.
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* --- Pestaña: USUARIOS --- */}
        {activeTab === 'users' && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-display font-700 mb-6">Gestión de Usuarios</h1>
            <div className="overflow-x-auto rounded border border-[rgba(0,200,255,0.08)] bg-[#0f1520]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#131b2b] text-left text-[#00c8ff] font-mono-data text-[10px] uppercase tracking-widest border-b border-[rgba(0,200,255,0.08)]">
                    <th className="p-4">ID</th>
                    <th className="p-4">Nombre</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4">Rol</th>
                    <th className="p-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b border-[rgba(0,200,255,0.04)] hover:bg-[rgba(0,200,255,0.02)] transition-colors text-[#a0b0c8]">
                      <td className="p-4 font-mono-data text-[#5a7090]">#{user.id}</td>
                      <td className="p-4 text-white">{user.nombre}</td>
                      <td className="p-4">{user.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-mono-data tracking-wider uppercase border ${
                          user.status === 'suspendido' 
                            ? 'bg-red-900/20 text-red-400 border-red-500/30' 
                            : 'bg-green-900/20 text-green-400 border-green-500/30'
                        }`}>
                          {user.status || 'activo'}
                        </span>
                      </td>
                      <td className="p-4 font-mono-data uppercase text-[10px] tracking-wider">
                        {user.is_admin ? (
                          <span className="text-[#00c8ff]">Admin</span>
                        ) : (
                          <span className="text-[#5a7090]">Usuario</span>
                        )}
                      </td>
                      <td className="p-4 flex gap-4 text-xs font-mono-data uppercase tracking-wider">
                        <button onClick={() => cambiarRol(user.id, user.is_admin)} className="text-[#00c8ff] hover:text-white transition-colors">
                          {user.is_admin ? 'Quitar Admin' : 'Hacer Admin'}
                        </button>
                        <button onClick={() => cambiarEstado(user.id, user.status, user.is_active)} className="text-orange-400 hover:text-orange-300 transition-colors">
                          {user.status === 'suspendido' ? 'Activar' : 'Suspender'}
                        </button>
                        <button onClick={() => eliminarUsuarioLogico(user.id, user.nombre || user.email)} className="text-red-500 hover:text-red-400 transition-colors">
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- Pestaña: CONTENIDO (Productos) --- */}
        {activeTab === 'content' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-display font-700">Control de Productos</h1>
              <button 
                onClick={empezarNuevo} 
                className="bg-[rgba(0,200,255,0.1)] border border-[#00c8ff] text-[#00c8ff] hover:bg-[#00c8ff] hover:text-black font-mono-data text-xs tracking-widest uppercase px-6 py-2.5 rounded transition-all"
              >
                + Nuevo producto
              </button>
            </div>

            {editando !== null && (
              <div className="bg-[#0f1520] p-6 rounded border border-[rgba(0,200,255,0.2)] mb-8 shadow-[0_0_20px_rgba(0,200,255,0.05)]">
                <h2 className="text-xl font-display text-[#00c8ff] mb-4">
                  {editando === 'nuevo' ? 'Crear Nuevo Producto' : `Editando Producto #${editando}`}
                </h2>
                <div className="grid grid-cols-2 gap-5">
                  <input
                    className="w-full bg-[#0b0f19] border border-[rgba(0,200,255,0.15)] rounded px-4 py-2.5 text-sm text-white placeholder-[#5a7090] focus:outline-none focus:border-[#00c8ff] transition-colors"
                    placeholder="Nombre del producto"
                    value={form.nombre}
                    onChange={e => setForm({ ...form, nombre: e.target.value })}
                  />
                  <input
                    className="w-full bg-[#0b0f19] border border-[rgba(0,200,255,0.15)] rounded px-4 py-2.5 text-sm text-white placeholder-[#5a7090] focus:outline-none focus:border-[#00c8ff] transition-colors"
                    type="number"
                    step="0.01"
                    placeholder="Precio"
                    value={form.precio}
                    onChange={e => setForm({ ...form, precio: e.target.value })}
                  />
                  <input
                    className="w-full bg-[#0b0f19] border border-[rgba(0,200,255,0.15)] rounded px-4 py-2.5 text-sm text-white placeholder-[#5a7090] focus:outline-none focus:border-[#00c8ff] transition-colors"
                    type="number"
                    placeholder="Stock disponible"
                    value={form.stock}
                    onChange={e => setForm({ ...form, stock: e.target.value })}
                  />
                  <select
                    className="w-full bg-[#0b0f19] border border-[rgba(0,200,255,0.15)] rounded px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00c8ff] transition-colors"
                    value={form.categoria_id}
                    onChange={e => setForm({ ...form, categoria_id: Number(e.target.value) })}
                  >
                    {categorias.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre} (#{c.id})</option>
                    ))}
                  </select>
                  <label className="flex items-center gap-3 text-[#a0b0c8] text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.activo}
                      onChange={e => setForm({ ...form, activo: e.target.checked })}
                      className="accent-[#00c8ff] w-4 h-4"
                    />
                    Activo (visible en el catálogo)
                  </label>
                  <div className="col-span-2">
                    <label className="block font-mono-data text-[10px] uppercase tracking-widest text-[#5a7090] mb-2">Imagen del producto</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => setArchivo(e.target.files?.[0] || null)}
                      className="text-sm text-[#a0b0c8] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-mono-data file:tracking-widest file:uppercase file:bg-[rgba(0,200,255,0.1)] file:text-[#00c8ff] hover:file:bg-[rgba(0,200,255,0.2)] cursor-pointer"
                    />
                    {(archivo || form.imagen) && (
                      <img
                        src={archivo ? URL.createObjectURL(archivo) : getImageUrl(form.imagen)}
                        alt="Vista previa"
                        className="mt-4 h-32 w-32 object-cover rounded border border-[rgba(0,200,255,0.2)]"
                      />
                    )}
                  </div>
                </div>
                <div className="mt-8 flex gap-4">
                  <button onClick={guardarProducto} className="bg-[#00c8ff] text-black font-mono-data text-xs tracking-widest uppercase px-6 py-2.5 rounded hover:bg-white transition-colors">
                    Guardar Cambios
                  </button>
                  <button onClick={() => setEditando(null)} className="border border-[#5a7090] text-[#a0b0c8] font-mono-data text-xs tracking-widest uppercase px-6 py-2.5 rounded hover:border-white hover:text-white transition-colors">
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto rounded border border-[rgba(0,200,255,0.08)] bg-[#0f1520]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#131b2b] text-left text-[#00c8ff] font-mono-data text-[10px] uppercase tracking-widest border-b border-[rgba(0,200,255,0.08)]">
                    <th className="p-4">ID</th>
                    <th className="p-4">Imagen</th>
                    <th className="p-4">Nombre</th>
                    <th className="p-4">Precio</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Categoría</th>
                    <th className="p-4">Activo</th>
                    <th className="p-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map(p => (
                    <tr key={p.id} className="border-b border-[rgba(0,200,255,0.04)] hover:bg-[rgba(0,200,255,0.02)] transition-colors text-[#a0b0c8]">
                      <td className="p-4 font-mono-data text-[#5a7090]">#{p.id}</td>
                      <td className="p-4">
                         {p.imagen ? (
                          <img 
                            src={getImageUrl(p.imagen)} 
                            alt={p.nombre} 
                            className="h-10 w-10 object-cover rounded border border-[rgba(0,200,255,0.1)]" 
                          />
                         ) : (
                            <span className="text-[#5a7090] font-mono-data">N/A</span>
                         )}
                      </td>
                      <td className="p-4 text-white font-medium">{p.nombre}</td>
                      <td className="p-4 text-[#00c8ff] font-mono-data">${p.precio}</td>
                      <td className="p-4">{p.stock}</td>
                      <td className="p-4 font-mono-data text-xs">{p.categoria?.nombre || `#${p.categoria_id}`}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-mono-data uppercase tracking-wider ${p.activo ? 'text-[#00c8ff] bg-[#00c8ff]/10' : 'text-[#5a7090] bg-gray-800/50'}`}>
                          {p.activo ? 'Visible' : 'Oculto'}
                        </span>
                      </td>
                      <td className="p-4 flex gap-4 text-xs font-mono-data uppercase tracking-wider mt-2">
                        <button onClick={() => empezarEdicion(p)} className="text-[#00c8ff] hover:text-white transition-colors">Editar</button>
                        <button onClick={() => eliminarProducto(p.id, p.nombre)} className="text-red-500 hover:text-red-400 transition-colors">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- Pestaña: ENCARGOS (Pedidos) --- */}
        {activeTab === 'encargos' && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-display font-700 mb-6">Gestión de Pedidos</h1>
            <div className="overflow-x-auto rounded border border-[rgba(0,200,255,0.08)] bg-[#0f1520]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#131b2b] text-left text-[#00c8ff] font-mono-data text-[10px] uppercase tracking-widest border-b border-[rgba(0,200,255,0.08)]">
                    <th className="p-4">ID</th>
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Producto</th>
                    <th className="p-4 text-center">Cant.</th>
                    <th className="p-4">Especificaciones</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4">Progreso</th>
                    <th className="p-4">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {encargos.length === 0 ? (
                    <tr>
                      <td className="p-8 text-center text-[#5a7090] font-mono-data text-xs tracking-widest uppercase" colSpan={8}>
                        No hay pedidos en cola.
                      </td>
                    </tr>
                  ) : (
                    encargos.map((encargo) => (
                      <tr key={encargo.id} className="border-b border-[rgba(0,200,255,0.04)] hover:bg-[rgba(0,200,255,0.02)] transition-colors text-[#a0b0c8]">
                        <td className="p-4 font-mono-data text-[#5a7090]">#{encargo.id}</td>
                        <td className="p-4 text-white">{encargo.cliente_nombre}</td>
                        <td className="p-4 font-medium text-[#00c8ff]">{encargo.producto_nombre}</td>
                        <td className="p-4 text-center font-mono-data">{encargo.cantidad}</td>
                        <td className="p-4 max-w-[200px] truncate text-xs" title={encargo.especificaciones}>
                          {encargo.especificaciones || '—'}
                        </td>
                        <td className="p-4">
                          <button 
                            type="button"
                            onClick={(e) => cambiarEstadoEncargo(e, encargo.id, encargo.estado)}
                            title="Hacer clic para avanzar de estado"
                            className={`px-3 py-1.5 rounded text-[10px] font-mono-data tracking-wider uppercase transition-all flex items-center gap-2 border ${
                              encargo.estado === 'por_imprimir' ? 'bg-[#131b2b] text-[#5a7090] border-[#5a7090]/30 hover:border-[#00c8ff] hover:text-[#00c8ff]' :
                              encargo.estado === 'imprimiendo' ? 'bg-[#00c8ff]/10 text-[#00c8ff] border-[#00c8ff]/30 hover:bg-[#00c8ff]/20' :
                              encargo.estado === 'terminado' ? 'bg-green-900/20 text-green-400 border-green-500/30 hover:bg-green-900/40' :
                              'bg-orange-900/20 text-orange-400 border-orange-500/30'
                            }`}
                          >
                            {encargo.estado.replace('_', ' ')}
                            <span className="opacity-60 text-xs">⟳</span>
                          </button>
                        </td>
                        <td className="p-4 w-32">
                          <div className="flex items-center gap-3">
                            <div className="w-full bg-[#131b2b] rounded-full h-1.5 border border-[rgba(0,200,255,0.1)] overflow-hidden">
                              <div 
                                className="bg-[#00c8ff] h-1.5 rounded-full shadow-[0_0_8px_#00c8ff] transition-all duration-500" 
                                style={{ width: `${encargo.progreso}%` }}
                              ></div>
                            </div>
                            <span className="text-[10px] font-mono-data text-[#00c8ff]">{encargo.progreso}%</span>
                          </div>
                        </td>
                        <td className="p-4 font-mono-data text-xs text-[#5a7090]">{encargo.fecha_creacion}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}