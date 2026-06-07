import { WHATSAPP } from './config'
import { formatMoney } from './format'

// Genera el enlace de WhatsApp para consultar por un producto específico.
// El mensaje incluye el nombre y precio para que sepas de cuál se trata.
export function linkWhatsAppProducto(product) {
  const precio = formatMoney(product.finalPrice ?? product.price)
  const msg =
    'Hola 👋, me interesa este producto: *' +
    product.name +
    '* (' +
    precio +
    '). ¿Me podrían dar más información?'
  return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(msg)
}
