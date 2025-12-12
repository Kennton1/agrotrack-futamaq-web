'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Download, FileText, FileSpreadsheet, File, Loader2, ChevronDown } from 'lucide-react'
import { exportToPDF, exportDataToPDF, exportDataToExcel, exportDataToCSV, ExportData } from '@/lib/exportUtils'
import toast from 'react-hot-toast'

interface ExportButtonProps {
  data: any[]
  columns: Array<{ key: string; label: string; type: 'text' | 'number' | 'date' | 'currency' | 'status' }>
  title: string
  filename: string
  elementId?: string
  subtitle?: string
  filters?: Record<string, any>
  dateRange?: { start: string; end: string }
  className?: string
  variant?: 'primary' | 'outline' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export default function ExportButton({
  data,
  columns,
  title,
  filename,
  elementId,
  subtitle,
  filters,
  dateRange,
  className = '',
  variant = 'outline',
  size = 'md'
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<string | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Cerrar dropdown al hacer click fuera y al hacer scroll
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    const handleScroll = () => {
      // Cerrar dropdown cuando se hace scroll para evitar problemas de posicionamiento
      setIsDropdownOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('scroll', handleScroll, true) // true para capturar scroll en todos los elementos

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [])

  const handleExport = async (format: 'pdf' | 'excel' | 'csv' | 'pdf-element') => {
    if (isExporting) return

    setIsExporting(true)
    setExportFormat(format)
    setIsDropdownOpen(false)

    try {
      if (format === 'pdf-element' && elementId) {
        await exportToPDF(elementId, filename, title, subtitle)
        toast.success('Reporte PDF generado exitosamente')
      } else {
        const exportData: ExportData = {
          title,
          data,
          columns,
          filters,
          dateRange
        }

        switch (format) {
          case 'pdf':
            exportDataToPDF(exportData)
            toast.success('Reporte PDF generado exitosamente')
            break
          case 'excel':
            exportDataToExcel(exportData)
            toast.success('Reporte Excel generado exitosamente')
            break
          case 'csv':
            exportDataToCSV(exportData)
            toast.success('Reporte CSV generado exitosamente')
            break
        }
      }
    } catch (error) {
      console.error('Error al exportar:', error)
      toast.error('Error al generar el reporte')
    } finally {
      setIsExporting(false)
      setExportFormat(null)
    }
  }

  const getIcon = (format: string) => {
    if (isExporting && exportFormat === format) {
      return <Loader2 className="h-4 w-4 animate-spin" />
    }

    switch (format) {
      case 'pdf':
      case 'pdf-element':
        return <FileText className="h-4 w-4" />
      case 'excel':
        return <FileSpreadsheet className="h-4 w-4" />
      case 'csv':
        return <File className="h-4 w-4" />
      default:
        return <Download className="h-4 w-4" />
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
      description: 'Exportar datos en formato PDF'
    },
    {
      key: 'excel',
      label: 'Excel',
      icon: <FileSpreadsheet className="h-4 w-4" />,
      description: 'Exportar datos en formato Excel'
    },
    {
      key: 'csv',
      label: 'CSV',
      icon: <File className="h-4 w-4" />,
      description: 'Exportar datos en formato CSV'
    }
  ]

  // Agregar opción de PDF elemento si existe elementId
  if (elementId) {
    exportOptions.unshift({
      key: 'pdf-element',
      label: 'PDF (Elemento)',
      icon: <FileText className="h-4 w-4" />,
      description: 'Exportar elemento visual en PDF'
    })
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        ref={buttonRef}
        variant={variant}
        className={`${getSizeClasses()} ${className} flex items-center space-x-2 relative`}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        disabled={isExporting}
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        <span>
          {isExporting ? 'Exportando...' : 'Exportar'}
        </span>
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''
          }`} />
      </Button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          <div className="py-2">
            {exportOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => handleExport(option.key as any)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-3 group"
                disabled={isExporting}
              >
                <div className={`p-2 rounded-lg ${option.key === 'pdf' || option.key === 'pdf-element' ? 'bg-red-100 text-red-600' :
                  option.key === 'excel' ? 'bg-green-100 text-green-600' :
                    'bg-blue-100 text-blue-600'
                  } group-hover:scale-110 transition-transform duration-200`}>
                  {option.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{option.label}</p>
                  <p className="text-xs text-gray-500">{option.description}</p>
                </div>
                {isExporting && exportFormat === option.key && (
                  <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
                )}
              </button>
            ))}
          </div>

          {/* Footer con información adicional */}
          <div className="border-t border-gray-100 px-4 py-2 bg-gray-50">
            <p className="text-xs text-gray-500">
              {data.length} registros disponibles
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// Componente simplificado para exportación rápida
export function QuickExportButton({
  data,
  columns,
  title,
  filename,
  format = 'pdf',
  className = '',
  ...props
}: Omit<ExportButtonProps, 'elementId' | 'subtitle' | 'filters' | 'dateRange'> & {
  format?: 'pdf' | 'excel' | 'csv'
}) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    if (isExporting) return

    setIsExporting(true)

    try {
      const exportData: ExportData = {
        title,
        data,
        columns
      }

      switch (format) {
        case 'pdf':
          exportDataToPDF(exportData)
          toast.success('Reporte PDF generado exitosamente')
          break
        case 'excel':
          exportDataToExcel(exportData)
          toast.success('Reporte Excel generado exitosamente')
          break
        case 'csv':
          exportDataToCSV(exportData)
          toast.success('Reporte CSV generado exitosamente')
          break
      }
    } catch (error) {
      console.error('Error al exportar:', error)
      toast.error('Error al generar el reporte')
    } finally {
      setIsExporting(false)
    }
  }

  const getIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <FileText className="h-4 w-4" />
      case 'excel':
        return <FileSpreadsheet className="h-4 w-4" />
      case 'csv':
        return <File className="h-4 w-4" />
      default:
        return <Download className="h-4 w-4" />
    }
  }

  return (
    <Button
      {...props}
      onClick={handleExport}
      disabled={isExporting}
      className={`flex items-center space-x-2 ${className}`}
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        getIcon(format)
      )}
      <span>
        {isExporting ? 'Exportando...' : `Exportar ${format.toUpperCase()}`}
      </span>
    </Button>
  )
}

// Componente para mostrar todas las opciones de exportación de forma visual
export function ExportOptionsGrid({
  data,
  columns,
  title,
  filename,
  elementId,
  subtitle,
  filters,
  dateRange,
  className = ''
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<string | null>(null)

  const handleExport = async (format: 'pdf' | 'excel' | 'csv' | 'pdf-element') => {
    if (isExporting) return

    setIsExporting(true)
    setExportFormat(format)

    try {
      if (format === 'pdf-element' && elementId) {
        await exportToPDF(elementId, filename, title, subtitle)
        toast.success('Reporte PDF generado exitosamente')
      } else {
        const exportData: ExportData = {
          title,
          data,
          columns,
          filters,
          dateRange
        }

        switch (format) {
          case 'pdf':
            exportDataToPDF(exportData)
            toast.success('Reporte PDF generado exitosamente')
            break
          case 'excel':
            exportDataToExcel(exportData)
            toast.success('Reporte Excel generado exitosamente')
            break
          case 'csv':
            exportDataToCSV(exportData)
            toast.success('Reporte CSV generado exitosamente')
            break
        }
      }
    } catch (error) {
      console.error('Error al exportar:', error)
      toast.error('Error al generar el reporte')
    } finally {
      setIsExporting(false)
      setExportFormat(null)
    }
  }

  const exportOptions = [
    {
      key: 'pdf',
      label: 'PDF',
      icon: <FileText className="h-5 w-5" />,
      description: 'Documento PDF',
      color: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
    },
    {
      key: 'excel',
      label: 'Excel',
      icon: <FileSpreadsheet className="h-5 w-5" />,
      description: 'Hoja de cálculo',
      color: 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
    },
    {
      key: 'csv',
      label: 'CSV',
      icon: <File className="h-5 w-5" />,
      description: 'Datos separados',
      color: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
    }
  ]

  // Agregar opción de PDF elemento si existe elementId
  if (elementId) {
    exportOptions.unshift({
      key: 'pdf-element',
      label: 'PDF Visual',
      icon: <FileText className="h-5 w-5" />,
      description: 'Elemento visual',
      color: 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100'
    })
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <p className="text-sm font-medium text-gray-700">Opciones de exportación:</p>
      <div className="grid grid-cols-2 gap-2">
        {exportOptions.map((option) => (
          <button
            key={option.key}
            onClick={() => handleExport(option.key as any)}
            disabled={isExporting}
            className={`p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center space-y-2 ${option.color} ${isExporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'
              }`}
          >
            {isExporting && exportFormat === option.key ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              option.icon
            )}
            <div className="text-center">
              <p className="font-medium text-sm">{option.label}</p>
              <p className="text-xs opacity-75">{option.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}