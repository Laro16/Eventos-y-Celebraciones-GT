export default function Filters({
  query,
  onQueryChange,
  subcategories,
  subCategory,
  onSubCategoryChange,
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Búsqueda */}
      <div className="relative flex-1">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
        </svg>
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Buscar invitaciones, decoración, recuerdos…"
          className="w-full rounded-full border border-marca-100 bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:border-marca-300 focus:ring-2 focus:ring-marca-100 transition"
        />
      </div>

      {/* Subcategoría (solo si hay opciones) */}
      {subcategories.length > 0 && (
        <select
          value={subCategory}
          onChange={(e) => onSubCategoryChange(e.target.value)}
          className="rounded-full border border-marca-100 bg-white px-4 py-2.5 text-sm outline-none focus:border-marca-300 focus:ring-2 focus:ring-marca-100 transition sm:w-56"
        >
          <option value="Todas">Todas las subcategorías</option>
          {subcategories.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      )}
    </div>
  )
}
