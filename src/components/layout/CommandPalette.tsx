'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { flattenNav } from '@/lib/navigation'

export default function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const items = useMemo(() => {
    const q = query.toLowerCase().trim()
    const all = flattenNav()
    if (!q) return all
    return all.filter((i) => i.label.toLowerCase().includes(q) || i.href.toLowerCase().includes(q))
  }, [query])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-start justify-center p-4" onClick={() => setOpen(false)}>
      <div className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages and actions..."
            className="w-full bg-transparent outline-none text-sm"
          />
        </div>
        <div className="max-h-[60vh] overflow-auto p-2">
          {items.map((item) => (
            <button
              key={item.href}
              onClick={() => {
                router.push(item.href)
                setOpen(false)
              }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm flex items-center justify-between"
            >
              <span>{item.label}</span>
              <span className="text-xs text-gray-400">{item.href}</span>
            </button>
          ))}
          {!items.length && <p className="text-sm text-gray-500 p-3">No results.</p>}
        </div>
      </div>
    </div>
  )
}
