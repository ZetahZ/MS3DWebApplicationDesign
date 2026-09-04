export type CategorySlug =
  | "juguetes"
  | "llaveros"
  | "macetas"
  | "figuras"
  | "antistress"
  | "repuestos";

export type View =
  | { page: "catalog" }
  | { page: "category"; slug: CategorySlug }
  | { page: "product"; id: number }
  | { page: "models" }
  | { page: "cart" }
  | { page: "checkout" }
  | { page: "creator" }
  | { page: "new-order" }
  | { page: "order-detail"; id: number }
  | { page: "about" }
  | { page: "contact" };

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  images?: string[];
  material: string;
  printTime: string;
  tag: string;
  tagColor: string;
  category: CategorySlug;
  description: string;
  colors: FilamentColor[];
  weight: string;
  layer: string;
  infill: string;
  stock: number;
}

export interface FilamentColor {
  name: string;
  hex: string;
}

export interface STLModel {
  id: number;
  name: string;
  image: string;
  format: string;
  price: number | "free";
  category: string;
  complexity: string;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  type: "product" | "model";
  image: string;
  selectedColor?: string;
}

export type OrderStatus = "pending" | "printing" | "done";

export interface Order {
  id: number;
  client: string;
  product: string;
  qty: number;
  status: OrderStatus;
  createdAt: string;
  color: string;
  notes: string;
  material?: string;
  estimatedTime?: string;
  printer?: string;
  progress?: number;
}

export interface CategoryMeta {
  slug: CategorySlug;
  label: string;
  icon: string;
  accent: string;
  description: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { slug: "juguetes", label: "Juguetes y Juegos", icon: "🎮", accent: "#ff6b2b", description: "Piezas impresas para el juego y la diversión" },
  { slug: "llaveros", label: "Llaveros Personalizados", icon: "🔑", accent: "#00c8ff", description: "Accesorios únicos e identitarios" },
  { slug: "macetas", label: "Macetas y Decoración", icon: "🌿", accent: "#00dc64", description: "Hogar y deco con geometría 3D" },
  { slug: "figuras", label: "Figuras y Coleccionables", icon: "⚔️", accent: "#a855f7", description: "Estatuillas, bustos y modelos de alta fidelidad" },
  { slug: "antistress", label: "Anti-estrés y Fidgets", icon: "🌀", accent: "#ffb400", description: "Articulados, giroscopios y juguetes sensoriales" },
  { slug: "repuestos", label: "Repuestos y Piezas Técnicas", icon: "⚙️", accent: "#64b5f6", description: "Ingeniería funcional impresa bajo pedido" },
];
