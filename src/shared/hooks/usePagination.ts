// src/shared/hooks/usePagination.ts
// Uso:
//   const { paginated, page, setPage, totalPages, total, pageSize, setPageSize }
//     = usePagination(filtered)
//   <Pagination page={page} totalPages={totalPages} total={total}
//               pageSize={pageSize} onPageSizeChange={setPageSize}
//               onChange={setPage} />
import { useState, useMemo, useEffect } from 'react'

const DEFAULT_PAGE_SIZE = 5
export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100]

export function usePagination<T>(items: T[], initialPageSize = DEFAULT_PAGE_SIZE) {
  const [page,     setPage]     = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)

  // Resetear a página 1 solo cuando cambia el tamaño de página. NO se resetea
  // cuando cambia `items` (referencia nueva en cada refetch/patch optimista,
  // incluso si el contenido es casi idéntico) — eso mandaba al usuario de
  // vuelta a la página 1 en cada actualización en segundo plano, haciendo
  // "desaparecer" filas que estaban en otras páginas. safePage ya clampa
  // correctamente cuando la página actual deja de ser válida (ej. al filtrar).
  useEffect(() => { setPage(1) }, [pageSize])

  const total      = items.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage   = Math.min(page, totalPages)

  const paginated = useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, safePage, pageSize]
  )

  return { paginated, page: safePage, setPage, totalPages, total, pageSize, setPageSize }
}