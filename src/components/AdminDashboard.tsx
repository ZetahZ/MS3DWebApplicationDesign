import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://127.0.0.1:8000';

const FORM_VACIO = { nombre: '', precio: '', stock: '', categoria_id: 1, activo: true, imagen: '' };

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'metrics' | 'users' | 'content'>('metrics');
  const [metrics, setMetrics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);

  // Estado para la gestión de productos
  const [productos, setProductos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [editando, setEditando] = useState<number | 'nuevo' | null>(null);
  const [form, setForm] = useState<any>(FORM_VACIO);
  const [archivo, setArchivo] = useState<File | null>(null);

  // Usuario logueado — el backend valida is_admin con el header X-User-Id
  const savedUser = localStorage.getItem('user');
  const currentUser = savedUser ? JSON.parse(savedUser) : null;
  const esAdmin = currentUser?.is_admin === true;
  const authHeaders = { headers: { 'X-User-Id': String(currentUser?.id || '') } };

  const cargarUsuarios = () => {
    axios.get(`${API}/api/admin/users`, authHeaders).then(res => setUsers(res.data)).catch(() => {});
  };

  const cargarProductos = () => {
    axios.get(`${API}/api/v1/productos/`).then(res => setProductos(res.data)).catch(() => {});
  };

  const cargarCategorias = () => {
    axios.get(`${API}/api/v1/categorias/`).then(res => setCategorias(res.data)).catch(() => {});
  };

  const hacerAdmin = (id: number) => {
    axios.put(`${API}/api/admin/users/${id}/make-admin`, {}, authHeaders)
      .then(() => cargarUsuarios())
      .catch(err => alert(err.response?.data?.detail || 'No se pudo hacer admin al usuario'));
  };

  // --- CRUD de productos ---

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

  const guardarProducto = async () => {
    const body: any = {
      nombre: form.nombre,
      precio: parseFloat(form.precio),
      stock: parseInt(form.stock),
      categoria_id: Number(form.categoria_id),
      activo: form.activo,
      imagen: form.imagen || null,
    };
    if (!body.nombre || isNaN(body.precio) || isNaN(body.stock)) {
      alert('Completá nombre, precio y stock');
      return;
    }
    // Si eligió un archivo, primero lo subimos y guardamos la URL que devuelve
    if (archivo) {
      const data = new FormData();
      data.append('file', archivo);
      try {
        const res = await axios.post(`${API}/api/admin/upload-imagen`, data, authHeaders);
        body.imagen = res.data.url;
      } catch (err: any) {
        alert(err.response?.data?.detail || 'No se pudo subir la imagen');
        return;
      }
    }
    const req = editando === 'nuevo'
      ? axios.post(`${API}/api/v1/productos/`, body, authHeaders)
      : axios.put(`${API}/api/v1/productos/${editando}`, body, authHeaders);
    req.then(() => { setEditando(null); setArchivo(null); cargarProductos(); })
       .catch(err => alert(err.response?.data?.detail || 'No se pudo guardar el producto'));
  };

  const eliminarProducto = (id: number, nombre: string) => {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return;
    axios.delete(`${API}/api/v1/productos/${id}`, authHeaders)
      .then(() => cargarProductos())
      .catch(err => alert(err.response?.data?.detail || 'No se pudo eliminar el producto'));
  };

  useEffect(() => {
    if (!esAdmin) return;
    // Peticiones al backend de FastAPI
    axios.get(`${API}/api/admin/metrics`, authHeaders).then(res => setMetrics(res.data)).catch(() => {});
    cargarUsuarios();
    cargarProductos();
    cargarCategorias();
  }, []);

  if (!esAdmin) {
    return (
      <div className="p-8 text-center text-red-400">
        Acceso denegado. Iniciá sesión con una cuenta de administrador.
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Barra lateral de navegación */}
      <aside className="w-64 bg-slate-800 text-white p-5 flex flex-col gap-4">
        <h2 className="text-xl font-bold mb-6">Panel Admin</h2>
        <button 
          onClick={() => setActiveTab('metrics')} 
          className={`p-2 rounded text-left ${activeTab === 'metrics' ? 'bg-slate-700' : ''}`}
        >
          📊 Métricas y Estadísticas
        </button>
        <button 
          onClick={() => setActiveTab('users')} 
          className={`p-2 rounded text-left ${activeTab === 'users' ? 'bg-slate-700' : ''}`}
        >
          👥 Gestión de Usuarios
        </button>
        <button 
          onClick={() => setActiveTab('content')} 
          className={`p-2 rounded text-left ${activeTab === 'content' ? 'bg-slate-700' : ''}`}
        >
          ⚙️ Control de Contenido
        </button>
      </aside>

      {/* Contenido principal según la pestaña activa */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'metrics' && metrics && (
          <div>
            <h1 className="text-2xl font-bold mb-4">Métricas del Sistema</h1>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded shadow">Usuarios Totales: {metrics.total_users}</div>
              <div className="bg-white p-6 rounded shadow">Contenido Total: {metrics.total_content}</div>
              <div className="bg-white p-6 rounded shadow">Sesiones Activas: {metrics.active_sessions}</div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h1 className="text-2xl font-bold mb-4">Gestión de Usuarios</h1>
            <table className="w-full bg-white rounded shadow">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="p-3">ID</th>
                  <th className="p-3">Nombre</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Rol</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-t">
                    <td className="p-3">{user.id}</td>
                    <td className="p-3">{user.nombre}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">{user.status}</td>
                    <td className="p-3">
                      {user.is_admin ? (
                        <span className="font-bold text-slate-700">Admin</span>
                      ) : (
                        <button onClick={() => hacerAdmin(user.id)} className="text-blue-600 underline">Hacer admin</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'content' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">Control de Contenido — Productos</h1>
              <button onClick={empezarNuevo} className="bg-slate-800 text-white px-4 py-2 rounded">
                + Nuevo producto
              </button>
            </div>

            {/* Formulario de alta/edición */}
            {editando !== null && (
              <div className="bg-white p-6 rounded shadow mb-6">
                <h2 className="text-lg font-bold mb-3">
                  {editando === 'nuevo' ? 'Nuevo producto' : `Editar producto #${editando}`}
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    className="border p-2 rounded"
                    placeholder="Nombre"
                    value={form.nombre}
                    onChange={e => setForm({ ...form, nombre: e.target.value })}
                  />
                  <input
                    className="border p-2 rounded"
                    type="number"
                    step="0.01"
                    placeholder="Precio"
                    value={form.precio}
                    onChange={e => setForm({ ...form, precio: e.target.value })}
                  />
                  <input
                    className="border p-2 rounded"
                    type="number"
                    placeholder="Stock"
                    value={form.stock}
                    onChange={e => setForm({ ...form, stock: e.target.value })}
                  />
                  <select
                    className="border p-2 rounded"
                    value={form.categoria_id}
                    onChange={e => setForm({ ...form, categoria_id: Number(e.target.value) })}
                  >
                    {categorias.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre} (#{c.id})</option>
                    ))}
                  </select>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.activo}
                      onChange={e => setForm({ ...form, activo: e.target.checked })}
                    />
                    Activo (visible en la tienda)
                  </label>
                  <div className="col-span-2">
                    <label className="block text-sm text-gray-600 mb-1">Imagen del producto</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => setArchivo(e.target.files?.[0] || null)}
                    />
                    {(archivo || form.imagen) && (
                      <img
                        src={archivo ? URL.createObjectURL(archivo) : form.imagen}
                        alt="Vista previa"
                        className="mt-2 h-24 object-cover rounded border"
                      />
                    )}
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  <button onClick={guardarProducto} className="bg-green-600 text-white px-4 py-2 rounded">
                    Guardar
                  </button>
                  <button onClick={() => setEditando(null)} className="bg-gray-300 px-4 py-2 rounded">
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Listado de productos */}
            <table className="w-full bg-white rounded shadow">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="p-3">ID</th>
                  <th className="p-3">Nombre</th>
                  <th className="p-3">Precio</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Categoría</th>
                  <th className="p-3">Activo</th>
                  <th className="p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map(p => (
                  <tr key={p.id} className="border-t">
                    <td className="p-3">{p.id}</td>
                    <td className="p-3">
                      {p.imagen ? <img src={p.imagen} alt="" className="h-10 w-10 object-cover rounded" /> : '—'}
                    </td>
                    <td className="p-3">{p.nombre}</td>
                    <td className="p-3">${p.precio}</td>
                    <td className="p-3">{p.stock}</td>
                    <td className="p-3">{p.categoria?.nombre || `#${p.categoria_id}`}</td>
                    <td className="p-3">{p.activo ? 'Sí' : 'No'}</td>
                    <td className="p-3">
                      <button onClick={() => empezarEdicion(p)} className="text-blue-600 underline mr-3">Editar</button>
                      <button onClick={() => eliminarProducto(p.id, p.nombre)} className="text-red-600 underline">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
