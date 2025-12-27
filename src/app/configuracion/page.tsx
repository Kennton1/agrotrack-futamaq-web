'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/contexts/AppContext'
import { Settings, Save, ArrowLeft, Bell, Shield, Palette, Globe, Database } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
// Select nativo HTML para esta página
import { toast } from 'react-hot-toast'

export default function ConfiguracionPage() {
  const { currentUser } = useApp()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (currentUser && currentUser.role !== 'administrador') {
      router.push('/dashboard')
      toast.error('No tienes permisos para acceder a esta sección')
    }
  }, [currentUser, router])
  const [config, setConfig] = useState({
    // Configuración general
    companyName: 'FUTAMAQ',
    companyEmail: 'admin@futamaq.cl',
    companyPhone: '+56 9 1234 5678',
    timezone: 'America/Santiago',
    language: 'es',
    currency: 'CLP',

    // Configuración de notificaciones
    emailNotifications: true,
    pushNotifications: true,
    maintenanceAlerts: true,
    fuelAlerts: true,
    workOrderAlerts: true,

    // Configuración de interfaz
    theme: 'light',
    sidebarCollapsed: false,
    dashboardLayout: 'grid',

    // Configuración de seguridad
    sessionTimeout: '30',
    twoFactorAuth: false,
    passwordExpiry: '90',

    // Configuración de datos
    autoBackup: true,
    backupFrequency: 'daily',
    dataRetention: '365'
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simular actualización
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Configuración guardada exitosamente')
    } catch (error) {
      toast.error('Error al guardar la configuración')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Volver</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
            <p className="text-gray-600">Gestiona la configuración del sistema</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuración General */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Configuración General</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="companyName">Nombre de la Empresa</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={config.companyName}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="companyEmail">Email de la Empresa</Label>
                <Input
                  id="companyEmail"
                  name="companyEmail"
                  type="email"
                  value={config.companyEmail}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="companyPhone">Teléfono de la Empresa</Label>
                <Input
                  id="companyPhone"
                  name="companyPhone"
                  value={config.companyPhone}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="timezone">Zona Horaria</Label>
                <select
                  id="timezone"
                  name="timezone"
                  value={config.timezone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                >
                  <option value="America/Santiago">Santiago (GMT-3)</option>
                  <option value="America/New_York">Nueva York (GMT-5)</option>
                  <option value="Europe/Madrid">Madrid (GMT+1)</option>
                </select>
              </div>
              <div>
                <Label htmlFor="language">Idioma</Label>
                <select
                  id="language"
                  name="language"
                  value={config.language}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Notificaciones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notificaciones</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="emailNotifications">Notificaciones por Email</Label>
                <input
                  type="checkbox"
                  id="emailNotifications"
                  name="emailNotifications"
                  checked={config.emailNotifications}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="pushNotifications">Notificaciones Push</Label>
                <input
                  type="checkbox"
                  id="pushNotifications"
                  name="pushNotifications"
                  checked={config.pushNotifications}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="maintenanceAlerts">Alertas de Mantenimiento</Label>
                <input
                  type="checkbox"
                  id="maintenanceAlerts"
                  name="maintenanceAlerts"
                  checked={config.maintenanceAlerts}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="fuelAlerts">Alertas de Combustible</Label>
                <input
                  type="checkbox"
                  id="fuelAlerts"
                  name="fuelAlerts"
                  checked={config.fuelAlerts}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="workOrderAlerts">Alertas de Órdenes de Trabajo</Label>
                <input
                  type="checkbox"
                  id="workOrderAlerts"
                  name="workOrderAlerts"
                  checked={config.workOrderAlerts}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>
            </CardContent>
          </Card>

          {/* Seguridad */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Seguridad</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="sessionTimeout">Tiempo de Sesión (minutos)</Label>
                <select
                  id="sessionTimeout"
                  name="sessionTimeout"
                  value={config.sessionTimeout}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                >
                  <option value="15">15 minutos</option>
                  <option value="30">30 minutos</option>
                  <option value="60">1 hora</option>
                  <option value="120">2 horas</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="twoFactorAuth">Autenticación de Dos Factores</Label>
                <input
                  type="checkbox"
                  id="twoFactorAuth"
                  name="twoFactorAuth"
                  checked={config.twoFactorAuth}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>
              <div>
                <Label htmlFor="passwordExpiry">Expiración de Contraseña (días)</Label>
                <select
                  id="passwordExpiry"
                  name="passwordExpiry"
                  value={config.passwordExpiry}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                >
                  <option value="30">30 días</option>
                  <option value="60">60 días</option>
                  <option value="90">90 días</option>
                  <option value="180">180 días</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Datos y Respaldo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Datos y Respaldo</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="autoBackup">Respaldo Automático</Label>
                <input
                  type="checkbox"
                  id="autoBackup"
                  name="autoBackup"
                  checked={config.autoBackup}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>
              <div>
                <Label htmlFor="backupFrequency">Frecuencia de Respaldo</Label>
                <select
                  id="backupFrequency"
                  name="backupFrequency"
                  value={config.backupFrequency}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                >
                  <option value="daily">Diario</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensual</option>
                </select>
              </div>
              <div>
                <Label htmlFor="dataRetention">Retención de Datos (días)</Label>
                <select
                  id="dataRetention"
                  name="dataRetention"
                  value={config.dataRetention}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                >
                  <option value="90">90 días</option>
                  <option value="180">180 días</option>
                  <option value="365">1 año</option>
                  <option value="730">2 años</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botón de guardar */}
        <div className="flex justify-end">
          <Button type="submit" disabled={loading} className="flex items-center space-x-2">
            <Save className="h-4 w-4" />
            <span>{loading ? 'Guardando...' : 'Guardar Configuración'}</span>
          </Button>
        </div>
      </form>
    </div>
  )
}