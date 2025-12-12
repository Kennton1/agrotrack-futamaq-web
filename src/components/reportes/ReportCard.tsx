'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProfessionalExportButton } from '@/components/export/ProfessionalExportButton'
import { downloadPDF } from '@/lib/reportUtils'
import toast from 'react-hot-toast'
import { 
  Eye, Loader2, FileText, Download, Monitor, X, ChevronDown
} from 'lucide-react'

interface ReportCardProps {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
  stats: Record<string, any>
  onGenerate: (reportId: string) => void
  exportData?: {
    data: any[]
    columns: Array<{ key: string; label: string; type: string }>
    title: string
    filename: string
  }
  isGenerating?: boolean
}

export function ReportCard({ 
  id, 
  name, 
  description, 
  icon, 
  color, 
  stats, 
  onGenerate, 
  exportData,
  isGenerating = false 
}: ReportCardProps) {
  const [showViewOptions, setShowViewOptions] = useState(false)

  const handleView = () => {
    setShowViewOptions(true)
  }

  const handleViewInBrowser = () => {
    // Simplemente activar la visualización en la misma página (mostrar gráficos abajo)
    onGenerate(id)
    setShowViewOptions(false)
  }

  const handleDownloadPDF = async () => {
    if (!exportData) {
      toast.error('No hay datos de exportación disponibles')
      setShowViewOptions(false)
      return
    }
    
    try {
      // Verificar que hay datos
      if (!exportData.data || exportData.data.length === 0) {
        toast.error('No hay datos para exportar. Por favor, ajusta los filtros o agrega datos al sistema.')
        setShowViewOptions(false)
        return
      }
      
      // Verificar que hay columnas
      if (!exportData.columns || exportData.columns.length === 0) {
        toast.error('Error: No hay columnas definidas para el reporte')
        setShowViewOptions(false)
        return
      }
      
      console.log('Iniciando descarga de PDF...', {
        title: exportData.title,
        dataCount: exportData.data.length,
        columnsCount: exportData.columns.length
      })
      
      // Mostrar notificación de carga
      const loadingToast = toast.loading('Generando PDF...')
      
      try {
        // Usar la función de exportUtils que funciona correctamente
        const { exportDataToPDF } = await import('@/lib/exportUtils')
        
        const exportDataFormatted = {
          title: exportData.title,
          data: exportData.data,
          columns: exportData.columns
        }
        
        await exportDataToPDF(exportDataFormatted)
        toast.dismiss(loadingToast)
        toast.success('PDF descargado exitosamente')
        console.log('PDF descargado exitosamente')
      } catch (pdfError) {
        toast.dismiss(loadingToast)
        console.error('Error al descargar PDF:', pdfError)
        const errorMessage = pdfError instanceof Error ? pdfError.message : 'Error desconocido al generar el PDF'
        toast.error(`Error al generar el PDF: ${errorMessage}`)
        throw pdfError // Re-lanzar para que el catch externo lo maneje
      }
    } catch (error) {
      console.error('Error general al descargar PDF:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al generar el PDF'
      toast.error(`Error al generar el PDF: ${errorMessage}`)
    } finally {
      setShowViewOptions(false)
    }
  }

  const handleViewExcel = () => {
    if (exportData) {
      try {
        // Usar la función de exportUtils que funciona correctamente
        const { exportDataToExcel } = require('@/lib/exportUtils')
        
        const exportDataFormatted = {
          title: exportData.title,
          data: exportData.data,
          columns: exportData.columns
        }
        
        exportDataToExcel(exportDataFormatted)
        console.log('Excel descargado exitosamente')
      } catch (error) {
        console.error('Error al descargar Excel:', error)
      }
    }
    setShowViewOptions(false)
  }

  const formatStatValue = (value: any): string => {
    if (typeof value === 'number') {
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`
      }
      return value.toString()
    }
    return String(value)
  }

  return (
    <Card 
      variant="modern" 
      className="hover:shadow-xl transition-all duration-300 group h-full relative"
    >
      <CardContent className="p-6 flex flex-col h-full relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 flex-1">
            <div className={`p-3 rounded-xl ${
              color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
              color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
              color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
              color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30' :
              color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' :
              'bg-red-100 dark:bg-red-900/30'
            }`}>
              <div className={`${
                color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                color === 'green' ? 'text-green-600 dark:text-green-400' :
                color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                'text-red-600 dark:text-red-400'
              }`}>
                {icon}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-1">
                {name}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">{description}</p>
            </div>
          </div>
        </div>

        {/* Estadísticas del reporte */}
        <div className="space-y-2 mb-6 flex-grow">
          {Object.entries(stats).map(([key, value], index) => (
            <div key={key} className="flex items-center justify-between text-sm">
              <span className="text-gray-700 dark:text-gray-300 font-medium">{key}:</span>
              <span className={`font-bold ${
                color === 'blue' ? 'text-blue-700 dark:text-blue-400' :
                color === 'green' ? 'text-green-700 dark:text-green-400' :
                color === 'yellow' ? 'text-yellow-700 dark:text-yellow-400' :
                color === 'orange' ? 'text-orange-700 dark:text-orange-400' :
                color === 'purple' ? 'text-purple-700 dark:text-purple-400' :
                'text-red-700 dark:text-red-400'
              }`}>
                {formatStatValue(value)}
              </span>
            </div>
          ))}
        </div>
        
        <div className="mt-auto">
          <button
            type="button"
            className="w-full h-8 px-4 text-sm inline-flex items-center justify-center space-x-2 rounded-xl font-semibold bg-blue-400 hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700 text-white dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
            onClick={handleView}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            <span>{isGenerating ? 'Generando...' : 'Ver'}</span>
          </button>
        </div>

      </CardContent>
      
      {/* Modal de opciones de visualización - Renderizado fuera del Card usando portal */}
      {typeof window !== 'undefined' && showViewOptions && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border dark:border-gray-700 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Opciones de Visualización</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowViewOptions(false)}
                className="p-1 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              ¿Cómo te gustaría ver el reporte <strong className="text-gray-900 dark:text-white">{name}</strong>?
            </p>
            
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleViewInBrowser}
              >
                <Monitor className="h-4 w-4 mr-2" />
                Ver en el navegador
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleViewExcel}
              >
                <FileText className="h-4 w-4 mr-2" />
                Excel
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleDownloadPDF}
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar PDF automáticamente
              </Button>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="ghost"
                className="w-full dark:text-gray-300 dark:hover:bg-gray-700"
                onClick={() => setShowViewOptions(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </Card>
  )
}
