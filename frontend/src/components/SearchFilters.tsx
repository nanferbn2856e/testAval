import { Eraser, Plus, Search } from 'lucide-react'

interface SearchFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  onClear: () => void
  onNew: () => void
}

export default function SearchFilters({
  search,
  onSearchChange,
  onClear,
  onNew,
}: SearchFiltersProps) {
  return (
    <div className="grid grid-cols-12 items-center gap-3 rounded-2xl bg-white p-4 shadow-xl shadow-black/20 md:grid-cols-24 md:gap-x-0">
      {/* Móvil: 12 de 12. Desde md: columnas 1-12 de 24 */}
      <div className="relative col-span-12">
        <Search
          size={20}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-primary/50"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por nombre, correo, documento, ciudad..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-secondary/50"
        />
      </div>

      {/* Móvil: 6 de 12. Desde md: columnas 14-17 */}
      <button
        type="button"
        onClick={onClear}
        disabled={!search}
        className="col-span-6 flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-white px-4 py-2.5 text-sm font-medium text-primary transition hover:bg-secondary/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white md:col-span-4 md:col-start-14"
      >
        <Eraser size={18} />
        Limpiar
      </button>

      {/* Móvil: 6 de 12. Desde md: columnas 20-24 */}
      <button
        type="button"
        onClick={onNew}
        className="col-span-6 flex items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-bold text-primary shadow-md shadow-secondary/40 transition hover:-translate-y-0.5 hover:bg-secondary-dark active:translate-y-0 md:col-span-5 md:col-start-20"
      >
        <Plus size={18} strokeWidth={3} />
        Nuevo
      </button>
    </div>
  )
}