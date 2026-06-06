// Formato de moneda en Quetzales
export const moneyFmt = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
  maximumFractionDigits: 2,
})

export function formatMoney(value) {
  return moneyFmt.format(Number(value) || 0)
}

// Calcula el precio final aplicando el porcentaje de descuento (0..100).
export function computeFinalPrice(price, discountPercent) {
  const p = Number(price) || 0
  const d = Number(discountPercent) || 0
  if (d <= 0) return p
  return Math.round((p - (p * d) / 100) * 100) / 100
}
