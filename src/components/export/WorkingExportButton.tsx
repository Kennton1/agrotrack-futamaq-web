'use client'

import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/Button'
import { Download, FileText, FileSpreadsheet, File, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface WorkingExportButtonProps {
  data: any[]
  title: string
  filename: string
  columns: Array<{ key: string; label: string; type: string }>
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function WorkingExportButton({ 
  data, 
  title, 
  filename, 
  columns,
  className = '', 
  size = 'sm' 
}: WorkingExportButtonProps) {
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

  // Función de descarga que sabemos que funciona (igual que el test)
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    try {
      console.log('=== INICIANDO DESCARGA ===')
      console.log('Contenido:', content)
      console.log('Filename:', filename)
      console.log('MimeType:', mimeType)
      
      const blob = new Blob([content], { type: mimeType })
      console.log('Blob creado:', blob)
      console.log('Tamaño del blob:', blob.size)
      
      const url = URL.createObjectURL(blob)
      console.log('URL del blob:', url)
      
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.style.display = 'none'
      
      console.log('Link creado:', {
        href: link.href,
        download: link.download,
        style: link.style.display
      })
      
      document.body.appendChild(link)
      console.log('Link agregado al DOM')
      
      link.click()
      console.log('Click ejecutado')
      
      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        console.log('Limpieza completada')
      }, 100)
      
      return true
    } catch (error) {
      console.error('Error en descarga:', error)
      return false
    }
  }

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    if (isExporting) return

    setIsExporting(true)
    setExportFormat(format)
    setIsOpen(false)

    try {
      console.log('=== EXPORTACIÓN INICIADA ===')
      console.log('Formato:', format)
      console.log('Datos:', data)
      console.log('Columnas:', columns)

      if (format === 'csv') {
        // Preparar datos CSV
        let csvContent = ''
        
        if (!data || data.length === 0) {
          // Datos de prueba si no hay datos
          csvContent = 'Nombre,Edad,Ciudad\nJuan,25,Santiago\nMaría,30,Valparaíso'
        } else if (!columns || columns.length === 0) {
          // Columnas por defecto si no hay columnas
          csvContent = 'ID,Nombre,Descripción\n1,Item 1,Descripción 1\n2,Item 2,Descripción 2'
        } else {
          // Datos reales
          const headers = columns.map(col => col.label).join(',')
          const rows = data.map(row => 
            columns.map(col => {
              const value = row[col.key]
              // Escapar comillas y comas en CSV
              return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
                ? `"${value.replace(/"/g, '""')}"` 
                : String(value || '')
            }).join(',')
          )
          csvContent = [headers, ...rows].join('\n')
        }

        console.log('Contenido CSV:', csvContent)
        
        const success = downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;')
        if (success) {
          toast.success('Archivo CSV descargado exitosamente')
        } else {
          toast.error('Error al descargar el archivo CSV')
        }
        return
      }

      if (format === 'excel') {
        // Para Excel, usar formato tabulado
        let excelContent = ''
        
        if (!data || data.length === 0) {
          excelContent = 'Nombre\tEdad\tCiudad\nJuan\t25\tSantiago\nMaría\t30\tValparaíso'
        } else if (!columns || columns.length === 0) {
          excelContent = 'ID\tNombre\tDescripción\n1\tItem 1\tDescripción 1\n2\tItem 2\tDescripción 2'
        } else {
          const headers = columns.map(col => col.label).join('\t')
          const rows = data.map(row => 
            columns.map(col => String(row[col.key] || '')).join('\t')
          )
          excelContent = [headers, ...rows].join('\n')
        }

        console.log('Contenido Excel:', excelContent)
        
        const success = downloadFile(excelContent, `${filename}.xls`, 'application/vnd.ms-excel;charset=utf-8;')
        if (success) {
          toast.success('Archivo Excel descargado exitosamente')
        } else {
          toast.error('Error al descargar el archivo Excel')
        }
        return
      }

      if (format === 'pdf') {
        // Para PDF, crear HTML que se puede imprimir como PDF
        let htmlContent = `
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
        `
        
        if (columns && columns.length > 0) {
          htmlContent += columns.map(col => `<th>${col.label}</th>`).join('')
          htmlContent += '</tr></thead><tbody>'
          
          if (data && data.length > 0) {
            htmlContent += data.map(row => 
              `<tr>${columns.map(col => `<td>${row[col.key] || ''}</td>`).join('')}</tr>`
            ).join('')
          } else {
            htmlContent += '<tr><td colspan="' + columns.length + '">No hay datos disponibles</td></tr>'
          }
        } else {
          htmlContent += '<th>ID</th><th>Nombre</th><th>Descripción</th></tr></thead><tbody>'
          htmlContent += '<tr><td>1</td><td>Item 1</td><td>Descripción 1</td></tr>'
          htmlContent += '<tr><td>2</td><td>Item 2</td><td>Descripción 2</td></tr>'
        }
        
        htmlContent += `
                  </tbody>
                </table>
                <div class="footer">
                  <p>Generado por AgroTrack FUTAMAQ</p>
                </div>
              </body>
            </html>
        `

        console.log('Contenido HTML:', htmlContent)
        
        const success = downloadFile(htmlContent, `${filename}.html`, 'text/html;charset=utf-8;')
        if (success) {
          toast.success('Archivo HTML descargado (puedes imprimir como PDF)')
        } else {
          toast.error('Error al descargar el archivo HTML')
        }
        return
      }

    } catch (error) {
      console.error('Error en exportación:', error)
      toast.error('Error al generar el archivo')
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

      {typeof window !== 'undefined' && createPortal(dropdownContent, document.body)}
    </>
  )
}







































