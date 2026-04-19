import { describe, it, expect } from 'vitest'
import { getImageUrl } from './getImageUrl'

describe('getImageUrl', () => {
  // ─── Sin imagen ────────────────────────────────────────────────
  it('retorna placeholder cuando no hay imagen', () => {
    expect(getImageUrl(null)).toBe('/placeholder.svg')
    expect(getImageUrl(undefined)).toBe('/placeholder.svg')
    expect(getImageUrl('')).toBe('/placeholder.svg')
  })

  // ─── Cloudinary ────────────────────────────────────────────────
  describe('URLs de Cloudinary', () => {
    const cloudinaryUrl =
      'https://res.cloudinary.com/demo/image/upload/blackmichi/productos/foto.jpg'

    it('aplica transformaciones por defecto (f_webp, q_75)', () => {
      const result = getImageUrl(cloudinaryUrl)
      expect(result).toContain('/upload/f_webp,q_75/')
    })

    it('aplica width y height cuando se pasan', () => {
      const result = getImageUrl(cloudinaryUrl, 300, 200, 80)
      expect(result).toContain('w_300')
      expect(result).toContain('h_200')
      expect(result).toContain('q_80')
      expect(result).toContain('f_webp')
    })

    it('mantiene el resto de la URL intacta', () => {
      const result = getImageUrl(cloudinaryUrl, 300)
      expect(result).toContain('blackmichi/productos/foto.jpg')
    })

    it('agrega c_fill cuando crop="fill" con width y height', () => {
      const result = getImageUrl(cloudinaryUrl, 300, 240, 80, 'fill')
      expect(result).toContain('c_fill')
      expect(result).toContain('w_300')
      expect(result).toContain('h_240')
    })

    it('no agrega c_fill si solo hay width (sin height)', () => {
      const result = getImageUrl(cloudinaryUrl, 300, null, 80, 'fill')
      expect(result).not.toContain('c_fill')
    })
  })

  // ─── Supabase ──────────────────────────────────────────────────
  describe('URLs de Supabase', () => {
    it('retorna la URL tal cual sin transformaciones', () => {
      const supabaseUrl =
        'https://abc.supabase.co/storage/v1/object/public/images/foto.jpg'
      expect(getImageUrl(supabaseUrl)).toBe(supabaseUrl)
    })
  })

  // ─── URLs externas genéricas ───────────────────────────────────
  describe('URLs externas genéricas', () => {
    it('agrega query params de width, height y quality', () => {
      const url = 'https://example.com/image.jpg'
      const result = getImageUrl(url, 400, 300, 90)
      expect(result).toBe('https://example.com/image.jpg?width=400&height=300&quality=90')
    })

    it('usa & si la URL ya tiene query params', () => {
      const url = 'https://example.com/image.jpg?v=1'
      const result = getImageUrl(url, 400)
      expect(result).toContain('?v=1&width=400')
    })
  })

  // ─── Rutas relativas ──────────────────────────────────────────
  describe('rutas relativas (backend)', () => {
    it('construye URL completa con base URL y convierte a webp', () => {
      const result = getImageUrl('/images/foto.jpg', 300)
      expect(result).toContain('http://localhost:3000')
      expect(result).toContain('/images/foto.webp')
      expect(result).toContain('width=300')
    })

    it('agrega / al inicio si falta', () => {
      const result = getImageUrl('images/foto.png')
      expect(result).toContain('/images/foto.webp')
    })
  })
})
