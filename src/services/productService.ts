// src/services/productService.ts

const API_URL = 'http://127.0.0.1:8000/api/v1/productos';

// Función para traer los productos de la base de datos
export async function obtenerProductos() {
  try {
    const response = await fetch(`${API_URL}/`);
    if (!response.ok) throw new Error('Error al obtener productos');
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Función para crear un producto en la base de datos
export async function crearProducto(nuevoProducto: { nombre: string; precio: number; descripcion: string }) {
  try {
    const response = await fetch(`${API_URL}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nuevoProducto),
    });
    if (!response.ok) throw new Error('Error al crear el producto');
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}