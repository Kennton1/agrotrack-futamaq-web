'use client'

import React from 'react'
import { Button } from '@/components/ui/Button'
import { Download } from 'lucide-react'
import toast from 'react-hot-toast'

interface ProfessionalExportButtonProps {
  data: any[]
  title: string
  filename: string
  columns: Array<{ key: string; label: string; type: string }>
}

export function ProfessionalExportButton({ data, title, filename, columns }: ProfessionalExportButtonProps) {
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

  const generateCSV = () => {
    try {
      // Usar punto y coma como separador para mejor compatibilidad con Excel en español
      const SEPARATOR = ';'
      const LINE_BREAK = '\r\n' // CRLF para mejor compatibilidad con Windows
      
      const headers = columns.map(col => col.label).join(SEPARATOR)
      const rows = data.map(row => 
        columns.map(col => {
          const value = formatValue(row[col.key], col.type)
          const stringValue = String(value)
          
          // Solo poner comillas si el valor contiene el separador, comillas o saltos de línea
          if (stringValue.includes(SEPARATOR) || stringValue.includes('"') || stringValue.includes('\n') || stringValue.includes('\r')) {
            return `"${stringValue.replace(/"/g, '""')}"`
          }
          return stringValue
        }).join(SEPARATOR)
      )
      
      const content = headers + LINE_BREAK + rows.join(LINE_BREAK)
      
      // Crear blob con encoding específico para Excel
      const blob = new Blob([content], { 
        type: 'text/csv;charset=utf-8;' 
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}.csv`
      link.click()
      URL.revokeObjectURL(url)
      
      toast.success('CSV descargado exitosamente (usa punto y coma como separador)')
    } catch (error) {
      toast.error('Error al descargar CSV')
    }
  }

  const generateExcel = () => {
    try {
      // Crear un archivo HTML que Excel puede abrir con formato
      const currentDate = new Date().toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })

      const tableRows = data.map((row, index) => {
        const rowClass = index % 2 === 0 ? 'even-row' : 'odd-row'
        const cells = columns.map(col => {
          const value = formatValue(row[col.key], col.type)
          return `<td class="cell">${value}</td>`
        }).join('')
        return `<tr class="${rowClass}">${cells}</tr>`
      }).join('')

      const headers = columns.map(col => `<th class="header-cell">${col.label}</th>`).join('')

      const html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" 
              xmlns:x="urn:schemas-microsoft-com:office:excel" 
              xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8">
          <meta name="ProgId" content="Excel.Sheet">
          <meta name="Generator" content="Microsoft Excel 11">
          <title>${title}</title>
          <style>
            @page { 
              margin: 0.75in 0.5in 0.75in 0.5in; 
              mso-header-margin: 0.5in; 
              mso-footer-margin: 0.5in; 
            }
            
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              font-size: 11pt;
              color: #333;
              margin: 0;
              padding: 20px;
            }
            
            .report-header {
              text-align: center;
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 2px solid #2c3e50;
            }
            
            .report-title {
              font-size: 18pt;
              font-weight: bold;
              color: #2c3e50;
              margin-bottom: 5px;
            }
            
            .report-subtitle {
              font-size: 10pt;
              color: #666;
            }
            
            .report-info {
              margin-bottom: 20px;
              padding: 10px;
              background-color: #f8f9fa;
              border-radius: 5px;
              font-size: 9pt;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
              font-size: 10pt;
            }
            
            .header-cell {
              background-color: #2c3e50;
              color: white;
              font-weight: bold;
              text-align: center;
              padding: 8px 6px;
              border: 1px solid #34495e;
              font-size: 9pt;
            }
            
            .cell {
              padding: 6px;
              border: 1px solid #ddd;
              text-align: left;
              vertical-align: middle;
            }
            
            .even-row {
              background-color: #ffffff;
            }
            
            .odd-row {
              background-color: #f8f9fa;
            }
            
            .report-footer {
              margin-top: 20px;
              padding-top: 15px;
              border-top: 1px solid #ddd;
              text-align: center;
              font-size: 8pt;
              color: #666;
            }
            
            .status-badge {
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 8pt;
              font-weight: bold;
              text-transform: uppercase;
            }
            
            .status-disponible {
              background-color: #d4edda;
              color: #155724;
            }
            
            .status-en_ejecucion {
              background-color: #fff3cd;
              color: #856404;
            }
            
            .status-planificada {
              background-color: #d1ecf1;
              color: #0c5460;
            }
            
            .status-en_mantencion {
              background-color: #f8d7da;
              color: #721c24;
            }
            
            .priority-badge {
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 8pt;
              font-weight: bold;
              text-transform: uppercase;
            }
            
            .priority-critica {
              background-color: #f8d7da;
              color: #721c24;
            }
            
            .priority-alta {
              background-color: #fff3cd;
              color: #856404;
            }
            
            .priority-media {
              background-color: #d1ecf1;
              color: #0c5460;
            }
            
            .priority-baja {
              background-color: #d4edda;
              color: #155724;
            }
          </style>
        </head>
        <body>
          <div class="report-header">
            <div class="report-title">${title}</div>
            <div class="report-subtitle">Reporte generado el ${currentDate}</div>
          </div>
          
          <div class="report-info">
            <strong>Total de registros:</strong> ${data.length} | 
            <strong>Empresa:</strong> AgroTrack FUTAMAQ | 
            <strong>Fecha:</strong> ${currentDate}
          </div>
          
          <table>
            <thead>
              <tr>
                ${headers}
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          
          <div class="report-footer">
            AgroTrack FUTAMAQ - Sistema de Gestión Agrícola Integral<br>
            Generado automáticamente el ${currentDate}
          </div>
        </body>
        </html>
      `
      
      const blob = new Blob([html], { 
        type: 'application/vnd.ms-excel;charset=utf-8;' 
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}.xls`
      link.click()
      URL.revokeObjectURL(url)
      
      toast.success('Excel descargado exitosamente')
    } catch (error) {
      toast.error('Error al descargar Excel')
    }
  }

  const generatePDF = () => {
    try {
      const currentDate = new Date().toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })

      const tableRows = data.map((row, index) => {
        const rowClass = index % 2 === 0 ? 'even-row' : 'odd-row'
        const cells = columns.map(col => {
          const value = formatValue(row[col.key], col.type)
          return `<td class="cell">${value}</td>`
        }).join('')
        return `<tr class="${rowClass}">${cells}</tr>`
      }).join('')

      const headers = columns.map(col => `<th class="header-cell">${col.label}</th>`).join('')

      const html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              padding: 20px;
            }
            
            .report-container {
              max-width: 1200px;
              margin: 0 auto;
              background: white;
              border-radius: 16px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              overflow: hidden;
            }
            
            .report-header {
              background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
              color: white;
              padding: 30px;
              text-align: center;
              position: relative;
            }
            
            .report-header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 4px;
              background: linear-gradient(90deg, #3498db, #e74c3c, #f39c12, #27ae60);
            }
            
            .report-title {
              font-size: 2.5rem;
              font-weight: 700;
              margin-bottom: 10px;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            
            .report-subtitle {
              font-size: 1.1rem;
              opacity: 0.9;
              font-weight: 300;
            }
            
            .report-info {
              background: #f8f9fa;
              padding: 20px 30px;
              border-bottom: 1px solid #e9ecef;
              display: flex;
              justify-content: space-between;
              align-items: center;
              flex-wrap: wrap;
              gap: 15px;
            }
            
            .info-item {
              display: flex;
              align-items: center;
              gap: 8px;
              color: #495057;
              font-weight: 500;
            }
            
            .info-icon {
              width: 20px;
              height: 20px;
              background: #3498db;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 12px;
              font-weight: bold;
            }
            
            .report-content {
              padding: 30px;
            }
            
            .table-container {
              overflow-x: auto;
              border-radius: 12px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              border: 1px solid #e9ecef;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              background: white;
            }
            
            .header-cell {
              background: linear-gradient(135deg, #34495e 0%, #2c3e50 100%);
              color: white;
              padding: 16px 12px;
              text-align: left;
              font-weight: 600;
              font-size: 0.9rem;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              border-right: 1px solid rgba(255,255,255,0.1);
              position: sticky;
              top: 0;
              z-index: 10;
            }
            
            .header-cell:last-child {
              border-right: none;
            }
            
            .cell {
              padding: 14px 12px;
              border-bottom: 1px solid #e9ecef;
              border-right: 1px solid #f8f9fa;
              font-size: 0.9rem;
              color: #495057;
              vertical-align: middle;
            }
            
            .cell:last-child {
              border-right: none;
            }
            
            .even-row {
              background: #ffffff;
            }
            
            .odd-row {
              background: #f8f9fa;
            }
            
            .even-row:hover,
            .odd-row:hover {
              background: #e3f2fd !important;
              transform: scale(1.001);
              transition: all 0.2s ease;
            }
            
            .status-badge {
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 0.75rem;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .status-disponible {
              background: #d4edda;
              color: #155724;
            }
            
            .status-en_ejecucion {
              background: #fff3cd;
              color: #856404;
            }
            
            .status-planificada {
              background: #d1ecf1;
              color: #0c5460;
            }
            
            .status-en_mantencion {
              background: #f8d7da;
              color: #721c24;
            }
            
            .priority-badge {
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 0.75rem;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .priority-critica {
              background: #f8d7da;
              color: #721c24;
            }
            
            .priority-alta {
              background: #fff3cd;
              color: #856404;
            }
            
            .priority-media {
              background: #d1ecf1;
              color: #0c5460;
            }
            
            .priority-baja {
              background: #d4edda;
              color: #155724;
            }
            
            .report-footer {
              background: #f8f9fa;
              padding: 20px 30px;
              border-top: 1px solid #e9ecef;
              text-align: center;
              color: #6c757d;
              font-size: 0.9rem;
            }
            
            .footer-logo {
              font-weight: 700;
              color: #2c3e50;
              margin-bottom: 5px;
            }
            
            @media print {
              body {
                background: white;
                padding: 0;
              }
              
              .report-container {
                box-shadow: none;
                border-radius: 0;
              }
              
              .report-header {
                background: #2c3e50 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              .header-cell {
                background: #34495e !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="report-container">
            <div class="report-header">
              <h1 class="report-title">${title}</h1>
              <p class="report-subtitle">Reporte generado automáticamente</p>
            </div>
            
            <div class="report-info">
              <div class="info-item">
                <div class="info-icon">📅</div>
                <span>Fecha de generación: ${currentDate}</span>
              </div>
              <div class="info-item">
                <div class="info-icon">📊</div>
                <span>Total de registros: ${data.length}</span>
              </div>
              <div class="info-item">
                <div class="info-icon">🏢</div>
                <span>AgroTrack FUTAMAQ</span>
              </div>
            </div>
            
            <div class="report-content">
              <div class="table-container">
                <table>
                  <thead>
                    <tr>
                      ${headers}
                    </tr>
                  </thead>
                  <tbody>
                    ${tableRows}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div class="report-footer">
              <div class="footer-logo">AgroTrack FUTAMAQ</div>
              <div>Sistema de Gestión Agrícola Integral</div>
              <div>Generado el ${currentDate}</div>
            </div>
          </div>
        </body>
        </html>
      `
      
      const blob = new Blob([html], { type: 'text/html;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}.html`
      link.click()
      URL.revokeObjectURL(url)
      
      toast.success('Reporte HTML descargado (imprimir como PDF)')
    } catch (error) {
      toast.error('Error al generar reporte')
    }
  }

  return (
    <div className="flex space-x-1">
      <Button onClick={generateCSV} size="sm" variant="outline" className="hover:bg-blue-50 hover:border-blue-300 px-2 py-1 text-xs">
        <Download className="h-3 w-3 mr-1 text-blue-600" />
        <span className="text-blue-700 hidden sm:inline">CSV</span>
      </Button>
      <Button onClick={generateExcel} size="sm" variant="outline" className="hover:bg-green-50 hover:border-green-300 px-2 py-1 text-xs">
        <Download className="h-3 w-3 mr-1 text-green-600" />
        <span className="text-green-700 hidden sm:inline">Excel</span>
      </Button>
      <Button onClick={generatePDF} size="sm" variant="outline" className="hover:bg-red-50 hover:border-red-300 px-2 py-1 text-xs">
        <Download className="h-3 w-3 mr-1 text-red-600" />
        <span className="text-red-700 hidden sm:inline">PDF</span>
      </Button>
    </div>
  )
}
