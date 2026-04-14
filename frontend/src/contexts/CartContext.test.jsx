import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { CartContext, CartProvider } from './CartContext'
import { useContext } from 'react'

// Helper: renderiza el hook useContext(CartContext) dentro del CartProvider
function useTestCart() {
  return useContext(CartContext)
}

function renderCartHook() {
  return renderHook(() => useTestCart(), {
    wrapper: ({ children }) => <CartProvider>{children}</CartProvider>,
  })
}

// Producto de ejemplo
const mockProduct = {
  id: 1,
  titulo: 'Figura Goku',
  precio: 15000,
  imagen_principal: '/img/goku.jpg',
  stock: 5,
}

const mockProduct2 = {
  id: 2,
  titulo: 'Figura Vegeta',
  precio: 12000,
  imagen_principal: '/img/vegeta.jpg',
  stock: 3,
}

describe('CartContext', () => {
  // ─── Estado inicial ────────────────────────────────────────────
  it('inicia con carrito vacío', () => {
    const { result } = renderCartHook()
    expect(result.current.cart).toEqual([])
    expect(result.current.cartCount).toBe(0)
    expect(result.current.cartTotal).toBe(0)
  })

  // ─── addToCart ─────────────────────────────────────────────────
  it('agrega un producto al carrito', () => {
    const { result } = renderCartHook()

    act(() => result.current.addToCart(mockProduct))

    expect(result.current.cart).toHaveLength(1)
    expect(result.current.cart[0].titulo).toBe('Figura Goku')
    expect(result.current.cart[0].quantity).toBe(1)
  })

  it('incrementa quantity si el producto ya existe', () => {
    const { result } = renderCartHook()

    act(() => result.current.addToCart(mockProduct))
    act(() => result.current.addToCart(mockProduct))

    expect(result.current.cart).toHaveLength(1)
    expect(result.current.cart[0].quantity).toBe(2)
  })

  it('no excede el stock al agregar', () => {
    const lowStock = { ...mockProduct, stock: 2 }
    const { result } = renderCartHook()

    act(() => result.current.addToCart(lowStock))
    act(() => result.current.addToCart(lowStock))
    act(() => result.current.addToCart(lowStock)) // 3ra vez, stock es 2

    expect(result.current.cart[0].quantity).toBe(2)
  })

  // ─── removeFromCart ────────────────────────────────────────────
  it('elimina un producto del carrito', () => {
    const { result } = renderCartHook()

    act(() => result.current.addToCart(mockProduct))
    act(() => result.current.addToCart(mockProduct2))
    act(() => result.current.removeFromCart(1))

    expect(result.current.cart).toHaveLength(1)
    expect(result.current.cart[0].id).toBe(2)
  })

  // ─── updateQuantity ───────────────────────────────────────────
  it('actualiza la cantidad de un producto', () => {
    const { result } = renderCartHook()

    act(() => result.current.addToCart(mockProduct))
    act(() => result.current.updateQuantity(1, 4))

    expect(result.current.cart[0].quantity).toBe(4)
  })

  it('no permite cantidad menor a 1', () => {
    const { result } = renderCartHook()

    act(() => result.current.addToCart(mockProduct))
    act(() => result.current.updateQuantity(1, 0))

    expect(result.current.cart[0].quantity).toBe(1)
  })

  it('no permite cantidad mayor al stock', () => {
    const { result } = renderCartHook()

    act(() => result.current.addToCart(mockProduct)) // stock: 5
    act(() => result.current.updateQuantity(1, 99))

    expect(result.current.cart[0].quantity).toBe(5)
  })

  // ─── clearCart ─────────────────────────────────────────────────
  it('vacía el carrito completamente', () => {
    const { result } = renderCartHook()

    act(() => result.current.addToCart(mockProduct))
    act(() => result.current.addToCart(mockProduct2))
    act(() => result.current.clearCart())

    expect(result.current.cart).toEqual([])
    expect(result.current.cartCount).toBe(0)
    expect(result.current.cartTotal).toBe(0)
  })

  // ─── cartCount y cartTotal ────────────────────────────────────
  it('calcula correctamente el conteo total de items', () => {
    const { result } = renderCartHook()

    act(() => result.current.addToCart(mockProduct))
    act(() => result.current.addToCart(mockProduct)) // qty: 2
    act(() => result.current.addToCart(mockProduct2)) // qty: 1

    expect(result.current.cartCount).toBe(3)
  })

  it('calcula correctamente el total del carrito', () => {
    const { result } = renderCartHook()

    act(() => result.current.addToCart(mockProduct))  // 15000 x 1
    act(() => result.current.addToCart(mockProduct2)) // 12000 x 1

    expect(result.current.cartTotal).toBe(27000)
  })

  // ─── isStockExceeded ──────────────────────────────────────────
  it('detecta cuando el stock fue alcanzado', () => {
    const lowStock = { ...mockProduct, stock: 1 }
    const { result } = renderCartHook()

    act(() => result.current.addToCart(lowStock))

    expect(result.current.isStockExceeded(lowStock)).toBe(true)
  })

  it('retorna false si hay stock disponible', () => {
    const { result } = renderCartHook()

    act(() => result.current.addToCart(mockProduct)) // stock: 5, qty: 1

    expect(result.current.isStockExceeded(mockProduct)).toBe(false)
  })

  // ─── localStorage ─────────────────────────────────────────────
  it('persiste el carrito en localStorage', () => {
    const { result } = renderCartHook()

    act(() => result.current.addToCart(mockProduct))

    const stored = JSON.parse(localStorage.getItem('cart'))
    expect(stored).toHaveLength(1)
    expect(stored[0].titulo).toBe('Figura Goku')
  })

  it('limpia localStorage al vaciar el carrito', () => {
    const { result } = renderCartHook()

    act(() => result.current.addToCart(mockProduct))
    act(() => result.current.clearCart())

    expect(localStorage.getItem('cart')).toBeNull()
  })
})
