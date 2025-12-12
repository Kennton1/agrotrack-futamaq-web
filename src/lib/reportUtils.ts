export const generateReportHTML = (
  title: string,
  data: any[],
  columns: Array<{ key: string; label: string; type: string }>,
  stats?: Record<string, any>
) => {
  const currentDate = new Date().toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

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
        if (typeof value === 'string' && value !== 'N/A') {
          try {
            return new Date(value).toLocaleDateString('es-CL')
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
  }

  const tableRows = data.map((row, index) => {
    const rowClass = index % 2 === 0 ? 'even-row' : 'odd-row'
    const cells = columns.map(col => {
      const value = formatValue(row[col.key], col.type)
      return `<td class="cell">${value}</td>`
    }).join('')
    return `<tr class="${rowClass}">${cells}</tr>`
  }).join('')

  const headers = columns.map(col => `<th class="header-cell">${col.label}</th>`).join('')

  let statsHTML = ''
  if (stats) {
    const statsEntries = Object.entries(stats).map(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').trim()
      return `<div class="stat-item">
        <span class="stat-label">${label}:</span>
        <span class="stat-value">${typeof value === 'number' && value > 1000 ? `${(value / 1000).toFixed(1)}K` : value}</span>
      </div>`
    }).join('')
    statsHTML = `<div class="stats-section">${statsEntries}</div>`
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 11pt;
          color: #333;
          padding: 20px;
          background: #f5f5f5;
        }
        
        .report-container {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .report-header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 3px solid #2c3e50;
        }
        
        .report-title {
          font-size: 24pt;
          font-weight: bold;
          color: #2c3e50;
          margin-bottom: 10px;
        }
        
        .report-subtitle {
          font-size: 10pt;
          color: #666;
        }
        
        .stats-section {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 30px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
        }
        
        .stat-item {
          flex: 1;
          min-width: 150px;
        }
        
        .stat-label {
          display: block;
          font-size: 9pt;
          color: #666;
          margin-bottom: 5px;
          text-transform: capitalize;
        }
        
        .stat-value {
          display: block;
          font-size: 16pt;
          font-weight: bold;
          color: #2c3e50;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          font-size: 10pt;
        }
        
        .header-cell {
          background-color: #2c3e50;
          color: white;
          font-weight: bold;
          text-align: center;
          padding: 12px 8px;
          border: 1px solid #34495e;
          font-size: 9pt;
        }
        
        .cell {
          padding: 10px 8px;
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
        
        .cell:hover {
          background-color: #e9ecef;
        }
        
        @media print {
          body {
            background: white;
            padding: 0;
          }
          
          .report-container {
            box-shadow: none;
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="report-container">
        <div class="report-header">
          <div class="report-title">${title}</div>
          <div class="report-subtitle">Reporte generado el ${currentDate}</div>
        </div>
        
        ${statsHTML}
        
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
    </body>
    </html>
  `
}

export const openHTMLInNewTab = (html: string) => {
  const newWindow = window.open('', '_blank')
  if (newWindow) {
    newWindow.document.write(html)
    newWindow.document.close()
  }
}

export const downloadPDF = async (
  exportData: {
    title: string
    data: any[]
    columns: Array<{ key: string; label: string; type: string }>
  },
  elementId?: string
) => {
  const html = generateReportHTML(
    exportData.title,
    exportData.data,
    exportData.columns
  )
  
  const { exportToPDF } = await import('./exportUtils')
  
  if (elementId) {
    await exportToPDF(elementId, exportData.title.replace(/\s+/g, '_'), exportData.title)
    return true
  } else {
    // Usar html2canvas y jsPDF para generar PDF desde HTML
    const html2canvas = (await import('html2canvas')).default
    const jsPDF = (await import('jspdf')).default
    
    const div = document.createElement('div')
    div.innerHTML = html
    div.style.position = 'absolute'
    div.style.left = '-9999px'
    document.body.appendChild(div)
    
    try {
      const canvas = await html2canvas(div, {
        scale: 2,
        useCORS: true,
        logging: false,
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('landscape', 'mm', 'a4')
      const imgWidth = 297
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      pdf.save(`${exportData.title.replace(/\s+/g, '_')}.pdf`)
      
      document.body.removeChild(div)
      return true
    } catch (error) {
      console.error('Error generating PDF:', error)
      document.body.removeChild(div)
      return false
    }
  }
}
