'use client'

import React from 'react'
import { Button } from '@/components/ui/Button'
import { Download } from 'lucide-react'
import toast from 'react-hot-toast'

interface DirectExportButtonProps {
  data: any[]
  title: string
  filename: string
  columns: Array<{ key: string; label: string; type: string }>
}

export function DirectExportButton({ data, title, filename, columns }: DirectExportButtonProps) {
  const downloadCSV = () => {
    try {
      // Datos simples
      const csvData = data.length > 0 
        ? data.map(row => columns.map(col => row[col.key] || '').join(',')).join('\n')
        : 'ID,Nombre\n1,Prueba\n2,Test'
      
      const headers = columns.map(col => col.label).join(',')
      const content = headers + '\n' + csvData
      
      const blob = new Blob([content], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}.csv`
      link.click()
      URL.revokeObjectURL(url)
      
      toast.success('CSV descargado')
    } catch (error) {
      toast.error('Error al descargar')
    }
  }

  const downloadExcel = () => {
    try {
      // Datos simples para Excel
      const excelData = data.length > 0 
        ? data.map(row => columns.map(col => row[col.key] || '').join('\t')).join('\n')
        : 'ID\tNombre\n1\tPrueba\n2\tTest'
      
      const headers = columns.map(col => col.label).join('\t')
      const content = headers + '\n' + excelData
      
      const blob = new Blob([content], { type: 'application/vnd.ms-excel' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}.xls`
      link.click()
      URL.revokeObjectURL(url)
      
      toast.success('Excel descargado')
    } catch (error) {
      toast.error('Error al descargar')
    }
  }

  const downloadPDF = () => {
    try {
      // HTML simple
      const tableRows = data.length > 0 
        ? data.map(row => 
            `<tr>${columns.map(col => `<td>${row[col.key] || ''}</td>`).join('')}</tr>`
          ).join('')
        : '<tr><td>1</td><td>Prueba</td></tr><tr><td>2</td><td>Test</td></tr>'
      
      const headers = columns.map(col => `<th>${col.label}</th>`).join('')
      
      const html = `
        <html>
          <head><title>${title}</title></head>
          <body>
            <h1>${title}</h1>
            <table border="1">
              <tr>${headers}</tr>
              ${tableRows}
            </table>
          </body>
        </html>
      `
      
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}.html`
      link.click()
      URL.revokeObjectURL(url)
      
      toast.success('HTML descargado')
    } catch (error) {
      toast.error('Error al descargar')
    }
  }

  return (
    <div className="flex space-x-2">
      <Button onClick={downloadCSV} size="sm" variant="outline">
        <Download className="h-4 w-4 mr-1" />
        CSV
      </Button>
      <Button onClick={downloadExcel} size="sm" variant="outline">
        <Download className="h-4 w-4 mr-1" />
        Excel
      </Button>
      <Button onClick={downloadPDF} size="sm" variant="outline">
        <Download className="h-4 w-4 mr-1" />
        PDF
      </Button>
    </div>
  )
}







































