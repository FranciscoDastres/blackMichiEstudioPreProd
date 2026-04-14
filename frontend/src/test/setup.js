import '@testing-library/jest-dom'

// Mock de localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = String(value) },
    removeItem: (key) => { delete store[key] },
    clear: () => { store = {} },
    get length() { return Object.keys(store).length },
    key: (i) => Object.keys(store)[i] || null,
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock de import.meta.env
vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3000')
vi.stubEnv('VITE_API_URL', 'http://localhost:3000')

// Limpiar estado entre tests
afterEach(() => {
  localStorageMock.clear()
  vi.restoreAllMocks()
})
