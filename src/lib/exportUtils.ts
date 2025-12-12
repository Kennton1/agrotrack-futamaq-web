import * as XLSX from 'xlsx'
// @ts-ignore - xlsx-js-style no tiene tipos oficiales
import * as XLSXStyle from 'xlsx-js-style'
import { saveAs } from 'file-saver'

// Función para inicializar los módulos PDF
const initPDFModules = async () => {
  if (typeof window === 'undefined') {
    throw new Error('PDF generation is only available in the browser')
  }
  
  // CRÍTICO: Importar jspdf-autotable ANTES de importar jspdf
  // Esto asegura que el módulo extienda correctamente el prototipo
  await import('jspdf-autotable')
  
  // Ahora importar jspdf - autoTable ya debería estar disponible en el prototipo
  const jsPDFModule = await import('jspdf')
  const jsPDF = jsPDFModule.default
  
  return jsPDF
}

export interface ExportData {
  title: string
  data: any[]
  columns: Array<{ key: string; label: string; type: string }>
  filters?: Record<string, any>
  dateRange?: { start: string; end: string }
}

export const exportDataToPDF = async (exportData: ExportData) => {
  try {
    // Validar datos
    if (!exportData.data || exportData.data.length === 0) {
      throw new Error('No hay datos para exportar')
    }
    
    if (!exportData.columns || exportData.columns.length === 0) {
      throw new Error('No hay columnas definidas')
    }
    
    // Inicializar módulos PDF
    const jsPDFClass = await initPDFModules()
    
    // Crear instancia de jsPDF en modo landscape para más espacio horizontal
    const doc = new jsPDFClass({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })
    
    // Verificar que autoTable esté disponible
    // Si no está disponible, intentar importarlo de nuevo
    let autoTableFn: any = null
    if (typeof (doc as any).autoTable === 'function') {
      autoTableFn = (doc as any).autoTable.bind(doc)
    } else {
      // Intentar importar jspdf-autotable de nuevo
      const autoTableModule = await import('jspdf-autotable')
      
      // Verificar si autoTable está disponible como exportación del módulo
      autoTableFn = (autoTableModule as any).default || (autoTableModule as any).autoTable
      
      // Si autoTableFn es una función, guardarla para usarla más adelante
      if (typeof autoTableFn === 'function') {
        (doc as any).__autoTableFn = autoTableFn
      } else if (typeof (doc as any).autoTable !== 'function') {
        throw new Error('autoTable no está disponible. Verifica que jspdf-autotable esté correctamente instalado.')
      } else {
        autoTableFn = (doc as any).autoTable.bind(doc)
      }
    }
    
    // Guardar autoTableFn en el doc para usarlo más adelante
    if (autoTableFn) {
      (doc as any).__autoTableFn = autoTableFn
    }
    
    // Configuración de colores
    const primaryColor = [44, 62, 80] // #2C3E50
    const secondaryColor = [52, 73, 94] // #34495E
    const lightGray = [245, 247, 250] // #F5F7FA
    const darkGray = [127, 140, 141] // #7F8C8D
    
    // Fondo del encabezado (más alto para mejor presentación)
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 28, 'F')
    
    // Título del reporte (en el encabezado)
    doc.setFontSize(22)
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.text(exportData.title, 14, 18)
    
    // Fecha de generación (debajo del encabezado)
    doc.setFontSize(10)
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
    doc.setFont('helvetica', 'normal')
    const currentDate = new Date().toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    doc.text(`Reporte generado el ${currentDate}`, 14, 35)
    
    // Línea decorativa
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.setLineWidth(0.5)
    doc.line(14, 38, doc.internal.pageSize.getWidth() - 14, 38)
  
  // Preparar datos para la tabla
  const tableData = exportData.data.map(row => 
    exportData.columns.map(col => {
      const value = row[col.key]
      if (value === null || value === undefined || value === 'N/A') return ''
      
      switch (col.type) {
        case 'currency':
          return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0,
          }).format(value)
        case 'date':
          if (typeof value === 'string' && value !== 'N/A') {
            try {
              const date = new Date(value)
              if (!isNaN(date.getTime())) {
                return date.toLocaleDateString('es-CL')
              }
            } catch {
              return value
            }
          }
          return value === 'N/A' ? '' : String(value)
        case 'number':
          return new Intl.NumberFormat('es-CL').format(value)
        default:
          return String(value)
      }
    })
  )
  
  // Calcular totales para la fila de resumen
  const totalsRow: any[] = []
  const hasNumericColumns = exportData.columns.some(col => col.type === 'currency' || col.type === 'number')
  
  if (hasNumericColumns && exportData.data.length > 0) {
    exportData.columns.forEach((col, index) => {
      if (col.type === 'currency') {
        const total = exportData.data.reduce((sum, row) => {
          const value = row[col.key]
          if (value === null || value === undefined || value === 'N/A') return sum
          const numValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, '')) || 0
          return sum + numValue
        }, 0)
        totalsRow[index] = new Intl.NumberFormat('es-CL', {
          style: 'currency',
          currency: 'CLP',
          minimumFractionDigits: 0,
        }).format(total)
      } else if (col.type === 'number') {
        const total = exportData.data.reduce((sum, row) => {
          const value = row[col.key]
          if (value === null || value === undefined || value === 'N/A') return sum
          return sum + (typeof value === 'number' ? value : parseFloat(String(value)) || 0)
        }, 0)
        totalsRow[index] = new Intl.NumberFormat('es-CL').format(total)
      } else if (index === 0) {
        totalsRow[index] = 'TOTAL'
      } else {
        totalsRow[index] = ''
      }
    })
  }
  
  const headers = exportData.columns.map(col => col.label.toUpperCase())
  
  // Calcular el ancho disponible (página landscape A4 menos márgenes)
  const pageWidth = doc.internal.pageSize.getWidth()
  const margins = 12 * 2 // left + right
  const availableWidth = pageWidth - margins
  
  // Calcular anchos de columna inteligentes basados en el tipo y contenido
  const columnWidths: number[] = []
  const numColumns = exportData.columns.length
  
  exportData.columns.forEach((col, index) => {
    // Calcular ancho basado en el tipo de dato y longitud del header
    let width = 0
    const headerLength = col.label.length
    
    if (col.type === 'currency' || col.type === 'number') {
      // Columnas numéricas: ancho fijo pequeño
      width = 25
    } else if (col.type === 'date') {
      // Fechas: ancho fijo para formato DD-MM-YYYY
      width = 30
    } else if (col.key.toLowerCase().includes('id') || col.key.toLowerCase().includes('codigo')) {
      // IDs y códigos: ancho pequeño
      width = 35
    } else if (col.key.toLowerCase().includes('estado') || col.key.toLowerCase().includes('prioridad')) {
      // Estados y prioridades: ancho medio
      width = 30
    } else if (col.key.toLowerCase().includes('campo') || col.key.toLowerCase().includes('descripcion') || col.key.toLowerCase().includes('nombre')) {
      // Campos y descripciones: ancho más grande
      width = Math.max(40, headerLength * 2.5)
    } else {
      // Otros: ancho basado en el header
      width = Math.max(30, headerLength * 2.2)
    }
    
    columnWidths.push(width)
  })
  
  // Normalizar anchos para que sumen el ancho disponible
  const totalWidth = columnWidths.reduce((sum, w) => sum + w, 0)
  const scaleFactor = availableWidth / totalWidth
  const normalizedWidths = columnWidths.map(w => w * scaleFactor)
  
  // Agregar tabla con diseño optimizado para muchas columnas
  const tableOptions: any = {
    head: [headers],
    body: totalsRow.length > 0 ? [...tableData, totalsRow] : tableData,
    startY: 43,
    styles: {
      fontSize: 8, // Reducido para que quepan más columnas
      cellPadding: { top: 4, right: 3, bottom: 4, left: 3 }, // Padding reducido
      textColor: [30, 30, 30],
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
      halign: 'left',
      valign: 'middle',
      overflow: 'linebreak',
      cellWidth: 'wrap',
    },
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8, // Reducido para headers
      cellPadding: { top: 5, right: 4, bottom: 5, left: 4 },
      halign: 'center',
      valign: 'middle',
    },
    bodyStyles: {
      cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
      halign: 'left',
      valign: 'middle',
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: lightGray,
    },
    columnStyles: {},
    // Estilo para la fila de totales
    didParseCell: (data: any) => {
      if (totalsRow.length > 0 && data.row.index === tableData.length) {
        data.cell.styles.fillColor = secondaryColor
        data.cell.styles.textColor = [255, 255, 255]
        data.cell.styles.fontStyle = 'bold'
        data.cell.styles.fontSize = 8
        data.cell.styles.halign = 'right'
      }
      // Alinear números a la derecha en columnas numéricas
      const colIndex = data.column.index
      if (colIndex < exportData.columns.length) {
        const col = exportData.columns[colIndex]
        if (col.type === 'number' || col.type === 'currency') {
          data.cell.styles.halign = 'right'
        } else if (col.type === 'date') {
          data.cell.styles.halign = 'center'
        }
      }
    },
    margin: { top: 43, left: 12, right: 12, bottom: 25 },
    tableWidth: availableWidth,
    showHead: 'everyPage',
  }
  
  // Configurar anchos específicos para cada columna
  exportData.columns.forEach((col, index) => {
    tableOptions.columnStyles[index] = {
      cellWidth: normalizedWidths[index],
      halign: col.type === 'number' || col.type === 'currency' ? 'right' : 
              col.type === 'date' ? 'center' : 'left',
    }
  })
  
  // Llamar a autoTable con las opciones
  // Usar autoTableFn guardado si está disponible, de lo contrario usar doc.autoTable
  if ((doc as any).__autoTableFn) {
    const fn = (doc as any).__autoTableFn
    // Si la función está bindeada al doc, llamarla directamente
    // Si no, pasar doc como primer argumento
    if (fn === (doc as any).autoTable) {
      (doc as any).autoTable(tableOptions)
    } else {
      fn(doc, tableOptions)
    }
  } else {
    (doc as any).autoTable(tableOptions)
  }
  
    // Pie de página con información adicional
    const pageCount = (doc as any).internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      
      // Línea en el pie de página
      const pageHeight = doc.internal.pageSize.getHeight()
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.setLineWidth(0.5)
      doc.line(14, pageHeight - 15, doc.internal.pageSize.getWidth() - 14, pageHeight - 15)
      
      // Información del pie de página
      doc.setFontSize(8)
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
      doc.setFont('helvetica', 'normal')
      const footerText = `Página ${i} de ${pageCount} | ${exportData.data.length} registro${exportData.data.length !== 1 ? 's' : ''} | FUTAMAQ`
      doc.text(footerText, doc.internal.pageSize.getWidth() / 2, pageHeight - 10, {
        align: 'center'
      })
    }
    
    // Guardar PDF
    const filename = `${exportData.title.replace(/\s+/g, '_')}.pdf`
    doc.save(filename)
    
    return true
  } catch (error) {
    console.error('Error al generar PDF:', error)
    throw error
  }
}

export const exportDataToExcel = (exportData: ExportData) => {
  // Crear workbook usando xlsx-js-style para soporte de estilos
  const workbook = XLSXStyle.utils.book_new()
  
  // Preparar datos con formato
  const worksheetData: any[][] = []
  
  // Fila vacía para espaciado superior
  worksheetData.push([])
  
  // Título (fila 2)
  const titleRow: any[] = []
  titleRow[0] = exportData.title
  worksheetData.push(titleRow)
  
  // Fecha de generación (fila 3)
  const currentDate = new Date().toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  const dateRow: any[] = []
  dateRow[0] = `Reporte generado el ${currentDate}`
  worksheetData.push(dateRow)
  
  // Fila vacía
  worksheetData.push([])
  
  // Headers (fila 5)
  worksheetData.push(exportData.columns.map(col => col.label.toUpperCase()))
  
  // Datos
  exportData.data.forEach(row => {
    const rowData = exportData.columns.map(col => {
      const value = row[col.key]
      if (value === null || value === undefined || value === 'N/A') return ''
      
      switch (col.type) {
        case 'currency':
          const numValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, '')) || 0
          return numValue
        case 'date':
          if (typeof value === 'string' && value !== 'N/A') {
            const date = new Date(value)
            if (!isNaN(date.getTime())) {
              return date
            }
          }
          return value
        case 'number':
          return typeof value === 'number' ? value : parseFloat(String(value)) || 0
        default:
          return String(value)
      }
    })
    worksheetData.push(rowData)
  })
  
  // Calcular totales
  const totalsRow: any[] = []
  let hasTotals = false
  
  exportData.columns.forEach((col, index) => {
    if (col.type === 'currency') {
      const total = exportData.data.reduce((sum, row) => {
        const value = row[col.key]
        if (value === null || value === undefined || value === 'N/A') return sum
        const numValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, '')) || 0
        return sum + numValue
      }, 0)
      totalsRow[index] = total
      hasTotals = true
    } else if (col.type === 'number') {
      const total = exportData.data.reduce((sum, row) => {
        const value = row[col.key]
        if (value === null || value === undefined || value === 'N/A') return sum
        return sum + (typeof value === 'number' ? value : parseFloat(String(value)) || 0)
      }, 0)
      totalsRow[index] = total
      hasTotals = true
    } else if (index === 0) {
      totalsRow[index] = 'TOTAL'
    } else {
      totalsRow[index] = ''
    }
  })
  
  if (hasTotals && exportData.data.length > 0) {
    worksheetData.push([]) // Fila vacía
    worksheetData.push(totalsRow)
  }
  
  // Crear worksheet primero
  const worksheet = XLSXStyle.utils.aoa_to_sheet(worksheetData)
  
  // Definir estilos
  const headerStyle = {
    font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
    fill: { fgColor: { rgb: '2C3E50' } }, // Azul oscuro
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: {
      top: { style: 'thin', color: { rgb: '1A252F' } },
      bottom: { style: 'thin', color: { rgb: '1A252F' } },
      left: { style: 'thin', color: { rgb: '1A252F' } },
      right: { style: 'thin', color: { rgb: '1A252F' } }
    }
  }
  
  const titleStyle = {
    font: { bold: true, sz: 16, color: { rgb: '2C3E50' } },
    alignment: { horizontal: 'left', vertical: 'center' }
  }
  
  const dateStyle = {
    font: { sz: 10, color: { rgb: '7F8C8D' } },
    alignment: { horizontal: 'left', vertical: 'center' }
  }
  
  const dataStyle = {
    font: { sz: 10 },
    alignment: { vertical: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: 'E5E7EB' } },
      bottom: { style: 'thin', color: { rgb: 'E5E7EB' } },
      left: { style: 'thin', color: { rgb: 'E5E7EB' } },
      right: { style: 'thin', color: { rgb: 'E5E7EB' } }
    }
  }
  
  const currencyStyle = {
    ...dataStyle,
    numFmt: '"$"#,##0', // Formato de moneda
    alignment: { horizontal: 'right', vertical: 'center' }
  }
  
  const numberStyle = {
    ...dataStyle,
    numFmt: '#,##0',
    alignment: { horizontal: 'right', vertical: 'center' }
  }
  
  const totalStyle = {
    font: { bold: true, sz: 11, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: '34495E' } }, // Gris oscuro
    alignment: { horizontal: 'right', vertical: 'center' },
    border: {
      top: { style: 'medium', color: { rgb: '2C3E50' } },
      bottom: { style: 'medium', color: { rgb: '2C3E50' } },
      left: { style: 'thin', color: { rgb: '1A252F' } },
      right: { style: 'thin', color: { rgb: '1A252F' } }
    }
  }
  
  const totalLabelStyle = {
    font: { bold: true, sz: 11, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: '34495E' } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: {
      top: { style: 'medium', color: { rgb: '2C3E50' } },
      bottom: { style: 'medium', color: { rgb: '2C3E50' } },
      left: { style: 'thin', color: { rgb: '1A252F' } },
      right: { style: 'thin', color: { rgb: '1A252F' } }
    }
  }
  
  // Aplicar estilos
  const headerRowIndex = 4 // Fila 5 (índice 4)
  const dataStartRow = 5 // Fila 6 (índice 5)
  const totalRowIndex = worksheetData.length - 1
  
  // Estilo del título (fila 2, índice 1)
  const titleCell = XLSXStyle.utils.encode_cell({ r: 1, c: 0 })
  if (!worksheet[titleCell]) worksheet[titleCell] = { t: 's', v: exportData.title }
  worksheet[titleCell].s = titleStyle
  
  // Estilo de la fecha (fila 3, índice 2)
  const dateCell = XLSXStyle.utils.encode_cell({ r: 2, c: 0 })
  if (!worksheet[dateCell]) worksheet[dateCell] = { t: 's', v: dateRow[0] }
  worksheet[dateCell].s = dateStyle
  
  // Estilos de encabezados
  exportData.columns.forEach((col, colIndex) => {
    const cellAddress = XLSXStyle.utils.encode_cell({ r: headerRowIndex, c: colIndex })
    if (!worksheet[cellAddress]) worksheet[cellAddress] = { t: 's', v: col.label.toUpperCase() }
    worksheet[cellAddress].s = headerStyle
  })
  
  // Estilos de datos
  exportData.data.forEach((row, rowIndex) => {
    exportData.columns.forEach((col, colIndex) => {
      const cellAddress = XLSXStyle.utils.encode_cell({ r: dataStartRow + rowIndex, c: colIndex })
      if (!worksheet[cellAddress]) {
        const value = row[col.key]
        worksheet[cellAddress] = { t: typeof value === 'number' ? 'n' : 's', v: value || '' }
      }
      
      // Aplicar estilo según el tipo
      if (col.type === 'currency') {
        worksheet[cellAddress].s = currencyStyle
      } else if (col.type === 'number') {
        worksheet[cellAddress].s = numberStyle
      } else {
        worksheet[cellAddress].s = dataStyle
      }
      
      // Alternar colores de fila para mejor legibilidad
      if (rowIndex % 2 === 1) {
        worksheet[cellAddress].s = {
          ...worksheet[cellAddress].s,
          fill: { fgColor: { rgb: 'F8F9FA' } }
        }
      }
    })
  })
  
  // Estilos de totales
  if (hasTotals && exportData.data.length > 0) {
    exportData.columns.forEach((col, colIndex) => {
      const cellAddress = XLSXStyle.utils.encode_cell({ r: totalRowIndex, c: colIndex })
      if (!worksheet[cellAddress]) {
        worksheet[cellAddress] = { t: typeof totalsRow[colIndex] === 'number' ? 'n' : 's', v: totalsRow[colIndex] || '' }
      }
      
      if (colIndex === 0) {
        worksheet[cellAddress].s = totalLabelStyle
      } else if (col.type === 'currency' || col.type === 'number') {
        worksheet[cellAddress].s = {
          ...totalStyle,
          numFmt: col.type === 'currency' ? '"$"#,##0' : '#,##0'
        }
      } else {
        worksheet[cellAddress].s = totalStyle
      }
    })
  }
  
  // Ajustar ancho de columnas
  const colWidths = exportData.columns.map((col) => {
    let maxWidth = col.label.length
    
    exportData.data.forEach(row => {
      const value = row[col.key]
      if (value !== null && value !== undefined && value !== 'N/A') {
        let strValue = String(value)
        if (col.type === 'currency') {
          const numValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, '')) || 0
          strValue = new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0,
          }).format(numValue)
        }
        if (strValue.length > maxWidth) {
          maxWidth = strValue.length
        }
      }
    })
    
    let width = Math.max(maxWidth + 3, 12)
    
    if (col.type === 'currency') {
      width = Math.max(width, 18)
    } else if (col.type === 'date') {
      width = Math.max(width, 15)
    } else if (col.label.length > 20) {
      width = Math.max(width, col.label.length + 3)
    }
    
    return { wch: Math.min(width, 60) }
  })
  worksheet['!cols'] = colWidths
  
  // Agregar worksheet al workbook
  XLSXStyle.utils.book_append_sheet(workbook, worksheet, 'Datos')
  
  // Guardar archivo
  XLSXStyle.writeFile(workbook, `${exportData.title.replace(/\s+/g, '_')}.xlsx`)
}

export const exportDataToCSV = (exportData: ExportData) => {
  // Headers
  const headers = exportData.columns.map(col => col.label).join(',')
  
  // Datos
  const rows = exportData.data.map(row =>
    exportData.columns.map(col => {
      const value = row[col.key]
      if (value === null || value === undefined) return ''
      
      // Escapar comillas en valores de texto
      const stringValue = String(value)
      if (stringValue.includes(',') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    }).join(',')
  )
  
  const csvContent = [headers, ...rows].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  saveAs(blob, `${exportData.title.replace(/\s+/g, '_')}.csv`)
}

export const exportToPDF = async (
  elementId: string,
  filename: string,
  title: string,
  subtitle?: string
) => {
  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error(`Element with id ${elementId} not found`)
  }

  const html2canvas = (await import('html2canvas')).default
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
  })

  const imgData = canvas.toDataURL('image/png')
  const jsPDFClass = await initPDFModules()
  const pdf = new jsPDFClass('landscape', 'mm', 'a4')
  const imgWidth = 297 // A4 width in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  pdf.setFontSize(18)
  pdf.text(title, 14, 15)
  if (subtitle) {
    pdf.setFontSize(12)
    pdf.text(subtitle, 14, 22)
  }

  pdf.addImage(imgData, 'PNG', 0, subtitle ? 30 : 25, imgWidth, imgHeight)
  pdf.save(`${filename}.pdf`)
}
