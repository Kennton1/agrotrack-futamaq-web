'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Download, FileText, FileSpreadsheet, File, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface ExportDropdownProps {
  data: any[]
  title: string
  filename: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function ExportDropdown({ 
  data, 
  title, 
  filename, 
  className = '', 
  size = 'sm' 
}: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    if (isExporting) return

    setIsExporting(true)
    setExportFormat(format)
    setIsOpen(false)

    try {
      // Simular exportación
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      switch (format) {
        case 'pdf':
          toast.success('Reporte PDF generado exitosamente')
          break
        case 'excel':
          toast.success('Reporte Excel generado exitosamente')
          break
        case 'csv':
          toast.success('Reporte CSV generado exitosamente')
          break
      }
    } catch (error) {
      toast.error('Error al generar el reporte')
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

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
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

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 bottom-full mb-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          <div className="p-2">
            {exportOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => handleExport(option.key as any)}
                disabled={isExporting}
                className={`w-full p-3 rounded-lg transition-all duration-200 flex items-center space-x-3 ${option.color} ${
                  isExporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'
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
      )}
    </div>
  )
}
