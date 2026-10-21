import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'metrics' | 'users' | 'content'>('metrics');
  const [metrics, setMetrics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [content, setContent] = useState<any[]>([]);

  useEffect(() => {
    // Peticiones al backend de FastAPI
    axios.get('http://127.0.0.1:8000/api/admin/metrics').then(res => setMetrics(res.data));
    axios.get('http://127.0.0.1:8000/api/admin/users').then(res => setUsers(res.data));
    axios.get('http://127.0.0.1:8000/api/admin/content').then(res => setContent(res.data));
  }, []);

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
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-t">
                    <td className="p-3">{user.id}</td>
                    <td className="p-3">{user.nombre}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">{user.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'content' && (
          <div>
            <h1 className="text-2xl font-bold mb-4">Control de Contenido</h1>
            <p className="text-gray-600">No hay contenido registrado todavía.</p>
          </div>
        )}
      </main>
    </div>
  );
}