'use client'

import React from 'react'
import { Button } from '@/components/ui/Button'
import { Download } from 'lucide-react'
import toast from 'react-hot-toast'

export function TestExportButton() {
  const handleTestDownload = () => {
    console.log('=== TEST EXPORT BUTTON CLICKEADO ===')
    try {
      console.log('=== INICIANDO TEST DE DESCARGA ===')

      // Crear datos de prueba muy simples
      const testData = 'Nombre,Edad,Ciudad\nJuan,25,Santiago\nMaría,30,Valparaíso\nCarlos,28,Concepción'

      console.log('Datos de prueba:', testData)

      // Crear blob
      const blob = new Blob([testData], { type: 'text/csv;charset=utf-8;' })
      console.log('Blob creado:', blob)
      console.log('Tamaño del blob:', blob.size)

      // Crear URL
      const url = URL.createObjectURL(blob)
      console.log('URL del blob:', url)

      // Crear elemento de descarga
      const link = document.createElement('a')
      link.href = url
      link.download = 'test_export_' + Date.now() + '.csv'
      link.style.display = 'none'

      console.log('Link creado:', {
        href: link.href,
        download: link.download,
        style: link.style.display
      })

      // Agregar al DOM
      document.body.appendChild(link)
      console.log('Link agregado al DOM')

      // Simular click
      console.log('Simulando click...')
      link.click()
      console.log('Click ejecutado')

      // Limpiar
      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        console.log('Limpieza completada')
      }, 100)

      toast.success('Test de descarga completado')

    } catch (error) {
      console.error('Error en test de descarga:', error)
      toast.error('Error en test de descarga: ' + (error instanceof Error ? error.message : 'Error desconocido'))
    }
  }

  return (
    <div className="flex flex-col space-y-4 p-4 border rounded-lg bg-gray-50">
      <h3 className="font-semibold text-gray-900">Test de Exportación</h3>
      <p className="text-sm text-gray-600">
        Este botón prueba si las descargas funcionan básicamente en tu navegador.
      </p>
      <Button
        onClick={handleTestDownload}
        className="flex items-center space-x-2"
      >
        <Download className="h-4 w-4" />
        <span>Probar Descarga CSV</span>
      </Button>
      <p className="text-xs text-gray-500">
        Revisa la consola del navegador (F12) para ver los logs detallados.
      </p>
    </div>
  )
}
