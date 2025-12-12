'use client'

import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/Button'
import { Download, FileText, FileSpreadsheet, File, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface SimpleExportButtonProps {
  data: any[]
  title: string
  filename: string
  columns: Array<{ key: string; label: string; type: string }>
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function SimpleExportButton({
  data,
  title,
  filename,
  columns,
  className = '',
  size = 'sm'
}: SimpleExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<string | null>(null)
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Log de renderizado
  console.log('=== SIMPLE EXPORT BUTTON RENDERIZADO ===')
  console.log('Props recibidas:', { data, title, filename, columns, className, size })
  console.log('Estado actual:', { isOpen, isExporting, exportFormat })

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
      setIsOpen(false)
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      window.addEventListener('scroll', handleScroll, true)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [isOpen])

  const formatValue = (value: any, type: string): string => {
    if (value === null || value === undefined) return ''

    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('es-CL', {
          style: 'currency',
          currency: 'CLP',
          minimumFractionDigits: 0,
        }).format(value)
      case 'date':
        return new Date(value).toLocaleDateString('es-CL')
      case 'number':
        return new Intl.NumberFormat('es-CL').format(value)
      default:
        return String(value)
    }
  }

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    console.log('=== HANDLE EXPORT LLAMADO ===')
    console.log('Formato:', format)
    console.log('Estado isExporting:', isExporting)

    if (isExporting) {
      console.log('Ya se está exportando, cancelando...')
      return
    }

    console.log('Iniciando exportación...')
    setIsExporting(true)
    setExportFormat(format)
    setIsOpen(false)

    try {
      console.log('=== EXPORTACIÓN SIMPLE ===')
      console.log('Formato:', format)
      console.log('Datos recibidos:', data)
      console.log('Tipo de datos:', typeof data, Array.isArray(data))
      console.log('Longitud de datos:', data?.length)
      console.log('Columnas recibidas:', columns)
      console.log('Título:', title)
      console.log('Filename:', filename)

      console.log('Procesando datos reales...')
      console.log('Primera fila de datos:', data[0])

      // Preparar datos reales
      const headers = columns.map(col => col.label)
      console.log('Headers:', headers)

      const rows = data.map((row, index) => {
        console.log(`Procesando fila ${index}:`, row)
        return columns.map(col => {
          const value = row[col.key]
          const formatted = formatValue(value, col.type)
          console.log(`Columna ${col.key}: ${value} -> ${formatted}`)
          return formatted
        })
      })

      console.log('Filas procesadas:', rows)

      if (format === 'csv') {
        console.log('Iniciando exportación CSV con datos reales...')
        const csvContent = [
          headers.join(','),
          ...rows.map(row => row.join(','))
        ].join('\n')

        console.log('Contenido CSV final:', csvContent)

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        console.log('Blob creado, tamaño:', blob.size)

        const url = URL.createObjectURL(blob)
        console.log('URL creada:', url)

        const link = document.createElement('a')
        link.href = url
        link.download = `${filename}.csv`
        link.style.display = 'none'

        document.body.appendChild(link)
        console.log('Link agregado al DOM')

        link.click()
        console.log('Click ejecutado')

        setTimeout(() => {
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
          console.log('Limpieza completada')
        }, 100)

        toast.success('Archivo CSV descargado exitosamente')
        return
      }

      if (format === 'excel') {
        // Crear Excel simple usando CSV con extensión .xlsx
        const csvContent = [
          headers.join('\t'),
          ...rows.map(row => row.join('\t'))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${filename}.xls`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        toast.success('Archivo Excel descargado exitosamente')
        return
      }

      if (format === 'pdf') {
        // Crear PDF simple usando HTML
        const htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>${title}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #333; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .footer { margin-top: 30px; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <h1>${title}</h1>
              <p>Generado el: ${new Date().toLocaleDateString('es-CL')}</p>
              <table>
                <thead>
                  <tr>
                    ${headers.map(h => `<th>${h}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${rows.map(row =>
          `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
        ).join('')}
                </tbody>
              </table>
              <div class="footer">
                <p>Generado por AgroTrack FUTAMAQ</p>
              </div>
            </body>
          </html>
        `

        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${filename}.html`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        toast.success('Archivo HTML descargado (puedes imprimir como PDF)')
        return
      }

    } catch (error) {
      console.error('ERROR EN EXPORTACIÓN:', error)
      toast.error(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`)
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
      key: 'csv',
      label: 'CSV',
      icon: <File className="h-4 w-4" />,
      description: 'Datos separados',
      color: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
    },
    {
      key: 'excel',
      label: 'Excel',
      icon: <FileSpreadsheet className="h-4 w-4" />,
      description: 'Hoja de cálculo',
      color: 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
    },
    {
      key: 'pdf',
      label: 'PDF',
      icon: <FileText className="h-4 w-4" />,
      description: 'Documento HTML',
      color: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
    }
  ]

  const dropdownContent = isOpen && buttonRect && (
    <div
      className="fixed bg-white rounded-xl shadow-2xl border border-gray-200 z-[9999] overflow-hidden"
      style={{
        left: buttonRect.right - 224,
        top: buttonRect.top - 10,
        width: '224px'
      }}
    >
      <div className="p-2">
        {exportOptions.map((option) => (
          <button
            key={option.key}
            onClick={() => {
              console.log('=== OPCIÓN EXPORTAR CLICKEADA ===')
              console.log('Opción:', option.key)
              console.log('Estado isExporting:', isExporting)
              handleExport(option.key as any)
            }}
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

      <div className="border-t border-gray-100 px-4 py-2 bg-gray-50">
        <p className="text-xs text-gray-500 text-center">
          {data.length} registros disponibles
        </p>
      </div>
    </div>
  )

  const handleDirectTest = () => {
    console.log('=== TEST DIRECTO CLICKEADO ===')
    const testData = 'Test,Directo,Export\n1,Prueba,Exitosa\n2,Funciona,Perfecto'
    const blob = new Blob([testData], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'test_directo.csv'
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success('Test directo completado')
  }

  return (
    <div className="flex space-x-2">
      <Button
        onClick={handleDirectTest}
        variant="secondary"
        size="sm"
        className="flex items-center space-x-2"
      >
        <Download className="h-4 w-4" />
        <span>Test</span>
      </Button>

      <Button
        ref={buttonRef}
        variant="outline"
        size={size}
        onClick={() => {
          console.log('=== BOTÓN EXPORTAR CLICKEADO ===')
          console.log('Estado actual isOpen:', isOpen)
          console.log('Cambiando a:', !isOpen)
          setIsOpen(!isOpen)
        }}
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

      {typeof window !== 'undefined' && createPortal(dropdownContent, document.body)}
    </div>
  )
}
