'use client'

import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/Button'
import { Download, FileText, FileSpreadsheet, File, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { exportDataToPDF, exportDataToExcel, exportDataToCSV, ExportData } from '@/lib/exportUtils'
import toast from 'react-hot-toast'

interface ExportDropdownPortalProps {
  data: any[]
  title: string
  filename: string
  columns: Array<{ key: string; label: string; type: string }>
  className?: string
  size?: 'sm' | 'md' | 'lg'
  filters?: Record<string, any>
  dateRange?: { start: string; end: string }
}

export function ExportDropdownPortal({
  data,
  title,
  filename,
  columns,
  className = '',
  size = 'sm',
  filters,
  dateRange
}: ExportDropdownPortalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<string | null>(null)
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Actualizar posición del botón
  useEffect(() => {
    if (buttonRef.current) {
      setButtonRect(buttonRef.current.getBoundingClientRect())
    }
  }, [isOpen])

  // Cerrar dropdown al hacer click fuera y al hacer scroll
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleScroll = () => {
      // Cerrar dropdown cuando se hace scroll para evitar problemas de posicionamiento
      setIsOpen(false)
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      window.addEventListener('scroll', handleScroll, true) // true para capturar scroll en todos los elementos
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [isOpen])

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    if (isExporting) return

    setIsExporting(true)
    setExportFormat(format)
    setIsOpen(false)

    try {
      console.log('=== INICIANDO EXPORTACIÓN ===')
      console.log('Formato:', format)
      console.log('Datos recibidos:', data)
      console.log('Columnas recibidas:', columns)
      console.log('Título:', title)
      console.log('Filename:', filename)

      // Verificar si los datos están vacíos
      if (!data || data.length === 0) {
        throw new Error('No hay datos para exportar')
      }

      // Verificar si las columnas están definidas
      if (!columns || columns.length === 0) {
        throw new Error('No hay columnas definidas para la exportación')
      }

      const exportData: ExportData = {
        title,
        data,
        columns,
        filters,
        dateRange
      }

      console.log('Datos de exportación preparados:', exportData)

      // Probar primero con CSV que es más simple
      if (format === 'csv') {
        console.log('Iniciando exportación CSV...')

        // Crear CSV manualmente para debugging
        const headers = columns.map(col => col.label).join(',')
        const rows = data.map(row =>
          columns.map(col => {
            const value = row[col.key]
            return value ? String(value).replace(/,/g, ';') : ''
          }).join(',')
        )
        const csvContent = [headers, ...rows].join('\n')

        console.log('Contenido CSV generado:', csvContent)

        // Crear y descargar archivo
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${filename}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        console.log('Archivo CSV descargado exitosamente')
        toast.success('Archivo CSV descargado exitosamente')
        return
      }

      // Para PDF y Excel, usar las funciones originales
      switch (format) {
        case 'pdf':
          console.log('Exportando a PDF...')
          exportDataToPDF(exportData)
          toast.success('Reporte PDF generado exitosamente')
          break
        case 'excel':
          console.log('Exportando a Excel...')
          exportDataToExcel(exportData)
          toast.success('Reporte Excel generado exitosamente')
          break
      }
    } catch (error) {
      console.error('ERROR EN EXPORTACIÓN:', error)
      toast.error(`Error al generar el reporte: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setIsExporting(false)
      setExportFormat(null)
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm'
      case 'lg':
        return 'px-6 py-3 text-lg'
      default:
        return 'px-4 py-2'
    }
  }

  const exportOptions = [
    {
      key: 'pdf',
      label: 'PDF (Datos)',
      icon: <FileText className="h-4 w-4" />,
      description: 'Documento PDF',
      color: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
    },
    {
      key: 'excel',
      label: 'Excel',
      icon: <FileSpreadsheet className="h-4 w-4" />,
      description: 'Hoja de cálculo',
      color: 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
    },
    {
      key: 'csv',
      label: 'CSV',
      icon: <File className="h-4 w-4" />,
      description: 'Datos separados',
      color: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
    }
  ]

  const dropdownContent = isOpen && buttonRect && (
    <div
      className="fixed bg-white rounded-xl shadow-2xl border border-gray-200 z-[9999] overflow-hidden"
      style={{
        left: buttonRect.right - 224, // 224px es el ancho del dropdown (w-56)
        top: buttonRect.top - 10,
        width: '224px'
      }}
    >
      <div className="p-2">
        {exportOptions.map((option) => (
          <button
            key={option.key}
            onClick={() => handleExport(option.key as any)}
            disabled={isExporting}
            className={`w-full p-3 rounded-lg transition-all duration-200 flex items-center space-x-3 ${option.color} ${isExporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'
              }`}
          >
            {isExporting && exportFormat === option.key ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              option.icon
            )}
            <div className="text-left">
              <p className="font-medium text-sm">{option.label}</p>
              <p className="text-xs opacity-75">{option.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 px-4 py-2 bg-gray-50">
        <p className="text-xs text-gray-500 text-center">
          {data.length} registros disponibles
        </p>
      </div>
    </div>
  )

  return (
    <>
      <Button
        ref={buttonRef}
        variant="outline"
        size={size}
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className={`${getSizeClasses()} ${className} flex items-center space-x-2`}
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        <span>{isExporting ? 'Exportando...' : 'Exportar'}</span>
        {isOpen ? (
          <ChevronUp className="h-3 w-3 transition-transform duration-200" />
        ) : (
          <ChevronDown className="h-3 w-3 transition-transform duration-200" />
        )}
      </Button>

      {/* Renderizar dropdown usando portal */}
      {typeof window !== 'undefined' && createPortal(dropdownContent, document.body)}
    </>
  )
}
