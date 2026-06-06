// Placeholder con la marca para cuando un producto aún no tiene foto.
// `compact` lo usa en miniaturas pequeñas (sin texto, ícono más chico).
export default function MediaPlaceholder({ compact = false, label = 'Foto próximamente', className = '' }) {
  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-marca-50 to-marca-100 text-marca-300 ${className}`}
    >
      <svg
        className={compact ? 'w-6 h-6' : 'w-10 h-10'}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 12v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8" />
        <path d="M2 7h20v5H2z" />
        <path d="M12 22V7" />
        <path d="M12 7S10.5 3 8 3a2 2 0 0 0 0 4h4z" />
        <path d="M12 7s1.5-4 4-4a2 2 0 0 1 0 4h-4z" />
      </svg>
      {!compact && <span className="text-[11px] font-medium">{label}</span>}
    </div>
  )
}
