import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const CartContext = createContext(null)

const STORAGE_KEY = 'ecgt_cart'

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  // Agrega un producto. Guardamos el precio FINAL (ya con descuento aplicado).
  const add = useCallback((product, qty = 1) => {
    if (product.isAvailable === false) return
    setItems((prev) => {
      const found = prev.find((x) => x.id === product.id)
      if (found) {
        return prev.map((x) =>
          x.id === product.id ? { ...x, qty: x.qty + qty } : x
        )
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.finalPrice ?? product.price,
          originalPrice: product.price,
          cover: product.cover,
          qty,
        },
      ]
    })
  }, [])

  const updateQty = useCallback((id, qty) => {
    setItems((prev) =>
      prev.map((x) => (x.id === id ? { ...x, qty: Math.max(1, Number(qty) || 1) } : x))
    )
  }, [])

  const remove = useCallback((id) => {
    setItems((prev) => prev.filter((x) => x.id !== id))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  const count = items.reduce((s, x) => s + x.qty, 0)
  const total = items.reduce((s, x) => s + (x.price || 0) * x.qty, 0)

  const value = { items, add, updateQty, remove, clear, count, total, isOpen, open, close }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>')
  return ctx
}
