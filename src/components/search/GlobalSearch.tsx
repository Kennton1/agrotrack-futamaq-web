'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, FileText, Truck, Wrench, Users, Package, Fuel } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { useRouter } from 'next/navigation'
import { formatDate, formatCLP } from '@/lib/utils'

interface SearchResult {
  id: string | number
  type: 'workOrder' | 'machinery' | 'maintenance' | 'user' | 'sparePart' | 'fuelLoad'
  title: string
  subtitle: string
  description?: string
  url: string
  icon: React.ReactNode
}

export default function GlobalSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  
  const { workOrders, machinery, maintenances, users, spareParts, fuelLoads } = useApp()

  // Función de búsqueda mejorada - busca en todos los campos relevantes
  const performSearch = (term: string) => {
    if (!term.trim()) {
      setResults([])
      return
    }

    const searchResults: SearchResult[] = []
    const lowerTerm = term.toLowerCase().trim()
    const searchWords = lowerTerm.split(/\s+/).filter(w => w.length > 0)

    // Función helper para verificar si un texto contiene todos los términos de búsqueda
    const matchesSearch = (text: string): boolean => {
      if (!text) return false
      const lowerText = text.toLowerCase()
      return searchWords.every(word => lowerText.includes(word))
    }

    // Función helper para verificar si algún campo contiene los términos
    const matchesAnyField = (fields: (string | number | undefined)[]): boolean => {
      return fields.some(field => {
        if (field === undefined || field === null) return false
        return matchesSearch(String(field))
      })
    }

    // Buscar en órdenes de trabajo - busca en todos los campos
    workOrders?.forEach(wo => {
      if (
        matchesSearch(wo.id) ||
        matchesSearch(wo.field_name || '') ||
        matchesSearch(wo.task_type || '') ||
        matchesSearch(wo.assigned_operator || '') ||
        matchesSearch(wo.description || '') ||
        matchesSearch(wo.status || '') ||
        matchesSearch(wo.priority || '') ||
        (wo.client_name && matchesSearch(wo.client_name))
      ) {
        searchResults.push({
          id: wo.id,
          type: 'workOrder',
          title: `OT ${wo.id}`,
          subtitle: `${wo.field_name || 'Sin campo'} - ${wo.task_type || 'Sin tipo'}`,
          description: wo.description || '',
          url: `/ordenes-trabajo`,
          icon: <FileText className="h-4 w-4 text-blue-500" />
        })
      }
    })

    // Buscar en maquinarias - busca en todos los campos
    machinery?.forEach(mach => {
      if (
        matchesSearch(mach.code || '') ||
        matchesSearch(mach.brand || '') ||
        matchesSearch(mach.model || '') ||
        matchesSearch(mach.patent || '') ||
        matchesSearch(mach.type || '') ||
        matchesSearch(mach.status || '') ||
        matchesAnyField([mach.year])
      ) {
        searchResults.push({
          id: mach.id,
          type: 'machinery',
          title: `${mach.brand || ''} ${mach.model || ''}`.trim() || 'Maquinaria sin nombre',
          subtitle: `${mach.patent || 'Sin patente'} - ${mach.status || 'Sin estado'}`,
          description: `${mach.type || 'Sin tipo'} - ${mach.year || 'Sin año'}`,
          url: `/maquinarias`,
          icon: <Truck className="h-4 w-4 text-green-500" />
        })
      }
    })

    // Buscar en mantenimientos - busca en todos los campos
    maintenances?.forEach(maint => {
      const machineryName = maint.machinery_code || 'Maquinaria desconocida'
      if (
        matchesSearch(machineryName) ||
        matchesSearch(maint.description || '') ||
        matchesSearch(maint.technician || '') ||
        matchesSearch(maint.type || '') ||
        matchesSearch(maint.status || '')
      ) {
        searchResults.push({
          id: maint.id,
          type: 'maintenance',
          title: `Mantenimiento ${machineryName}`,
          subtitle: `${maint.type || 'Sin tipo'} - ${maint.technician || 'Sin técnico'}`,
          description: maint.description || '',
          url: `/mantenimientos`,
          icon: <Wrench className="h-4 w-4 text-orange-500" />
        })
      }
    })

    // Buscar en usuarios - busca en todos los campos
    users?.forEach(user => {
      if (
        matchesSearch(user.full_name || '') ||
        matchesSearch(user.email || '') ||
        matchesSearch(user.role || '') ||
        (user.phone && matchesSearch(user.phone))
      ) {
        searchResults.push({
          id: user.id,
          type: 'user',
          title: user.full_name || 'Usuario sin nombre',
          subtitle: `${user.email || 'Sin email'} - ${user.role || 'Sin rol'}`,
          description: user.phone || '',
          url: `/usuarios`,
          icon: <Users className="h-4 w-4 text-purple-500" />
        })
      }
    })

    // Buscar en repuestos - busca en todos los campos
    spareParts?.forEach(part => {
      const partCode = (part as any).code || ''
      if (
        matchesSearch(partCode) ||
        matchesSearch(part.description || '') ||
        matchesSearch(part.category || '') ||
        matchesSearch(part.supplier || '') ||
        matchesAnyField([part.current_stock, part.minimum_stock])
      ) {
        searchResults.push({
          id: part.id,
          type: 'sparePart',
          title: `${partCode || 'Sin código'} - ${part.description || 'Sin descripción'}`,
          subtitle: `${part.category || 'Sin categoría'} - Stock: ${part.current_stock || 0}`,
          description: `${part.supplier || 'Sin proveedor'} - ${formatCLP(part.unit_cost || 0)}`,
          url: `/repuestos`,
          icon: <Package className="h-4 w-4 text-indigo-500" />
        })
      }
    })

    // Buscar en cargas de combustible - busca en todos los campos
    fuelLoads?.forEach(fuel => {
      const operatorName = (fuel as any).operator_name || fuel.operator || ''
      if (
        matchesSearch(fuel.machinery_code || '') ||
        matchesSearch(operatorName) ||
        matchesSearch(fuel.source || '') ||
        matchesSearch((fuel as any).location || '') ||
        matchesAnyField([fuel.liters, fuel.total_cost])
      ) {
        searchResults.push({
          id: fuel.id,
          type: 'fuelLoad',
          title: `Combustible ${fuel.machinery_code || 'Sin código'}`,
          subtitle: `${operatorName || 'Sin operador'} - ${fuel.liters || 0}L`,
          description: `${formatDate(fuel.date || '')} - ${formatCLP(fuel.total_cost || 0)}`,
          url: `/combustible`,
          icon: <Fuel className="h-4 w-4 text-yellow-500" />
        })
      }
    })

    // Limitar resultados a 20 para mostrar más opciones
    setResults(searchResults.slice(0, 20))
  }

  // Efecto para búsqueda en tiempo real
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchTerm)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, workOrders, machinery, maintenances, users, spareParts, fuelLoads])

  // Manejar clicks fuera del componente
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Manejar teclas
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleResultClick(results[selectedIndex])
        }
        break
      case 'Escape':
        setShowResults(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  // Manejar click en resultado
  const handleResultClick = (result: SearchResult) => {
    router.push(result.url)
    setShowResults(false)
    setSearchTerm('')
    setSelectedIndex(-1)
  }

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearchTerm('')
    setResults([])
    setShowResults(false)
    setSelectedIndex(-1)
  }

  return (
    <div ref={searchRef} className="relative flex justify-center w-full">
      <div className="relative flex items-center max-w-3xl w-full mx-auto">
        <div className="relative flex-1 flex items-center bg-gray-800 border border-gray-700 rounded-full overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all duration-300 shadow-lg">
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setShowResults(true)
              setSelectedIndex(-1)
            }}
            onFocus={() => {
              if (searchTerm.trim()) {
                setShowResults(true)
              }
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 pl-4 pr-4 py-2.5 bg-transparent text-white placeholder-gray-400 focus:outline-none text-sm"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="p-1.5 text-gray-400 hover:text-white transition-colors mr-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (searchTerm.trim()) {
                performSearch(searchTerm)
              }
            }}
            className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white transition-colors border-l border-gray-600 flex items-center justify-center"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Resultados de búsqueda */}
      {showResults && results.length > 0 && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-96 overflow-y-auto z-50">
          <div className="p-2">
            <div className="text-xs text-gray-500 px-3 py-2 border-b border-gray-100">
              {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
            </div>
            {results.map((result, index) => (
              <div
                key={`${result.type}-${result.id}`}
                onClick={() => handleResultClick(result)}
                className={`flex items-start space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                  index === selectedIndex
                    ? 'bg-primary-50 border border-primary-200'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  {result.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {result.title}
                  </div>
                  <div className="text-xs text-gray-600 truncate">
                    {result.subtitle}
                  </div>
                  {result.description && (
                    <div className="text-xs text-gray-500 truncate mt-1">
                      {result.description}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sin resultados */}
      {showResults && searchTerm.trim() && results.length === 0 && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-200 z-50">
          <div className="p-6 text-center">
            <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <div className="text-sm text-gray-600">
              No se encontraron resultados para &quot;{searchTerm}&quot;
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Intenta con otros términos de búsqueda
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
