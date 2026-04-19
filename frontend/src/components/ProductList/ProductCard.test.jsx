import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import ProductCard from './ProductCard'

// Mock de LazyImage para simplificar el test (no necesitamos IntersectionObserver)
vi.mock('../LazyImage/LazyImage', () => ({
  default: ({ src, alt, className }) => (
    <img src={src} alt={alt} className={className} />
  ),
}))

// Mock de FavoritesContext — evita necesitar el Provider y llamadas a API
vi.mock('../../contexts/FavoritesContext', () => ({
  useFavorites: () => ({
    isFavorite: () => false,
    toggle: vi.fn(),
  }),
}))

// Mock de AuthContext — usuario no logueado por defecto
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: null }),
}))

const mockProduct = {
  id: 1,
  titulo: 'Figura Goku SSJ',
  precio: 15000,
  imagen_principal: 'https://res.cloudinary.com/demo/image/upload/goku.jpg',
  imagenes_adicionales: ['https://res.cloudinary.com/demo/image/upload/goku2.jpg'],
  promedio_calificacion: '4.2',
  stock: 5,
}

const defaultProps = {
  product: mockProduct,
  onClick: vi.fn(),
  onAddToCart: vi.fn(),
  outOfStock: false,
}

function renderCard(overrides = {}) {
  return render(
    <MemoryRouter>
      <ProductCard {...defaultProps} {...overrides} />
    </MemoryRouter>
  )
}

describe('ProductCard', () => {
  // ─── Renderizado básico ────────────────────────────────────────
  it('muestra el título del producto', () => {
    renderCard()
    expect(screen.getByText('Figura Goku SSJ')).toBeInTheDocument()
  })

  it('muestra el precio formateado en CLP', () => {
    renderCard()
    expect(screen.getByText('$15.000')).toBeInTheDocument()
  })

  it('renderiza la imagen principal', () => {
    renderCard()
    const imgs = screen.getAllByRole('img')
    expect(imgs[0]).toHaveAttribute('alt', 'Figura Goku SSJ')
  })

  it('renderiza la imagen alternativa si hay imagenes_adicionales', () => {
    renderCard()
    const imgs = screen.getAllByRole('img')
    expect(imgs).toHaveLength(2)
    expect(imgs[1]).toHaveAttribute('alt', 'Figura Goku SSJ alternativa')
  })

  it('no renderiza imagen alternativa si no hay imagenes_adicionales', () => {
    const product = { ...mockProduct, imagenes_adicionales: [] }
    renderCard({ product })
    const imgs = screen.getAllByRole('img')
    expect(imgs).toHaveLength(1)
  })

  // ─── Estrellas de rating ──────────────────────────────────────
  it('renderiza 5 estrellas siempre', () => {
    renderCard()
    const stars = document.querySelectorAll('svg polygon')
    expect(stars).toHaveLength(5)
  })

  it('llena las estrellas según el promedio redondeado', () => {
    renderCard() // promedio_calificacion: '4.2' → 4 estrellas llenas
    const filledStars = document.querySelectorAll('.fill-yellow-400')
    expect(filledStars).toHaveLength(4)
  })

  // ─── Botón agregar al carrito ─────────────────────────────────
  it('muestra botón "Agregar al carrito" cuando hay stock', () => {
    renderCard()
    expect(screen.getByText('Agregar al carrito')).toBeInTheDocument()
  })

  it('llama onAddToCart al hacer clic en el botón', async () => {
    const onAddToCart = vi.fn()
    renderCard({ onAddToCart })

    const user = userEvent.setup()
    await user.click(screen.getByText('Agregar al carrito'))

    expect(onAddToCart).toHaveBeenCalledWith(mockProduct)
  })

  it('no propaga el clic del botón al contenedor', async () => {
    const onClick = vi.fn()
    const onAddToCart = vi.fn()
    renderCard({ onClick, onAddToCart })

    const user = userEvent.setup()
    await user.click(screen.getByText('Agregar al carrito'))

    expect(onAddToCart).toHaveBeenCalled()
    expect(onClick).not.toHaveBeenCalled()
  })

  // ─── Estado sin stock ─────────────────────────────────────────
  it('muestra "Sin stock" cuando outOfStock es true', () => {
    renderCard({ outOfStock: true })
    expect(screen.getByText('Sin stock')).toBeInTheDocument()
    expect(screen.queryByText('Agregar al carrito')).not.toBeInTheDocument()
  })

  it('el botón está deshabilitado cuando no hay stock', () => {
    renderCard({ outOfStock: true })
    expect(screen.getByText('Sin stock')).toBeDisabled()
  })

  it('no llama onAddToCart cuando no hay stock', async () => {
    const onAddToCart = vi.fn()
    renderCard({ outOfStock: true, onAddToCart })

    const user = userEvent.setup()
    await user.click(screen.getByText('Sin stock'))

    expect(onAddToCart).not.toHaveBeenCalled()
  })

  // ─── Clic en la tarjeta ───────────────────────────────────────
  it('llama onClick con el producto al hacer clic en la tarjeta', async () => {
    const onClick = vi.fn()
    renderCard({ onClick })

    const user = userEvent.setup()
    await user.click(screen.getByText('Figura Goku SSJ'))

    expect(onClick).toHaveBeenCalledWith(mockProduct)
  })
})
