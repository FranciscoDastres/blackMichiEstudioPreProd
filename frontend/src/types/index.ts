// Tipos de dominio compartidos en el frontend

export interface Product {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  imagen_url?: string;
  categoria?: string;
  promedio_calificacion?: number;
}

export interface User {
  id: number | string;
  email: string;
  nombre?: string;
  rol?: 'admin' | 'user' | string;
  auth_id?: string;
}

export interface Order {
  id: number;
  estado: string;
  total: number;
  comprador_nombre?: string;
  usuario_nombre?: string;
  usuario_email?: string;
  cupon_codigo?: string;
  descuento?: number;
  created_at?: string;
}

export interface AdminStats {
  totalSales: number;
  orders: number;
  users: number;
  products: number;
}
