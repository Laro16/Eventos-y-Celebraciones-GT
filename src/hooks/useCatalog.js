import { useState, useEffect, useCallback, useMemo } from 'react'
import { fetchProducts } from '../lib/queries'

// Hook central del catálogo.
// - Carga los productos (con su media) desde Supabase.
// - Expone estados de carga/error y una función para recargar.
// - Calcula categorías y subcategorías a partir de los productos.
//
// Uso:  const { products, loading, error, categories, getSubcategories, refresh } = useCatalog()
export function useCatalog({ includeHidden = false } = {}) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchProducts({ includeHidden })
      setProducts(data)
    } catch (err) {
      setError(err.message || 'Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }, [includeHidden])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Lista de categorías únicas (en el orden en que aparecen).
  const categories = useMemo(() => {
    const seen = []
    for (const p of products) {
      if (p.category && !seen.includes(p.category)) seen.push(p.category)
    }
    return seen
  }, [products])

  // Subcategorías disponibles para una categoría dada ('Todos' = todas).
  const getSubcategories = useCallback(
    (category) => {
      const list = category && category !== 'Todos'
        ? products.filter((p) => p.category === category)
        : products
      const seen = []
      for (const p of list) {
        if (p.subcategory && !seen.includes(p.subcategory)) seen.push(p.subcategory)
      }
      return seen
    },
    [products]
  )

  return { products, loading, error, categories, getSubcategories, refresh }
}
