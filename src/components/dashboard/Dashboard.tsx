'use client'

import { KPICard } from './KPICard'
import { WorkOrdersTable } from './WorkOrdersTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { MOCK_KPI_DATA } from '@/data/mockData'
import { formatCLP, formatHectares, formatLiters, formatHours } from '@/lib/utils'
import { 
  Tractor, 
  Fuel, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  MapPin,
  Calendar
} from 'lucide-react'

export function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard FUTAMAQ</h1>
          <p className="text-gray-600">Resumen de operaciones agrícolas</p>
        </div>
        <div className="text-sm text-gray-500">
          Última actualización: {new Date().toLocaleString('es-CL')}
        </div>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Hectáreas Trabajadas (7 días)"
          value={formatHectares(MOCK_KPI_DATA.last7Days.hectaresWorked)}
          change={{ value: 12, type: 'increase' }}
          icon={Tractor}
          iconColor="text-primary-500"
        />
        <KPICard
          title="Combustible Consumido"
          value={formatLiters(MOCK_KPI_DATA.last7Days.fuelConsumed)}
          change={{ value: 8, type: 'increase' }}
          icon={Fuel}
          iconColor="text-warning-500"
        />
        <KPICard
          title="Costo Combustible"
          value={formatCLP(MOCK_KPI_DATA.last7Days.fuelCost)}
          change={{ value: 15, type: 'increase' }}
          icon={TrendingUp}
          iconColor="text-danger-500"
        />
        <KPICard
          title="Horas Máquina"
          value={formatHours(MOCK_KPI_DATA.last7Days.machineHours)}
          change={{ value: 5, type: 'increase' }}
          icon={Clock}
          iconColor="text-primary-500"
        />
      </div>

      {/* KPIs secundarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Órdenes Activas"
          value={MOCK_KPI_DATA.last7Days.activeOrders}
          icon={CheckCircle}
          iconColor="text-success-500"
        />
        <KPICard
          title="Órdenes Retrasadas"
          value={MOCK_KPI_DATA.last7Days.delayedOrders}
          icon={AlertTriangle}
          iconColor="text-danger-500"
        />
        <KPICard
          title="Mantenimientos Vencidos"
          value={MOCK_KPI_DATA.last7Days.dueMaintenance}
          icon={AlertTriangle}
          iconColor="text-warning-500"
        />
        <KPICard
          title="Mantenimientos Próximos"
          value={MOCK_KPI_DATA.last7Days.upcomingMaintenance}
          icon={Calendar}
          iconColor="text-primary-500"
        />
      </div>

      {/* Resumen del día */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resumen del Día</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Hectáreas trabajadas</span>
              <span className="font-semibold">{formatHectares(MOCK_KPI_DATA.today.hectaresWorked)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Combustible consumido</span>
              <span className="font-semibold">{formatLiters(MOCK_KPI_DATA.today.fuelConsumed)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Costo combustible</span>
              <span className="font-semibold">{formatCLP(MOCK_KPI_DATA.today.fuelCost)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Horas máquina</span>
              <span className="font-semibold">{formatHours(MOCK_KPI_DATA.today.machineHours)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Órdenes activas</span>
              <span className="font-semibold">{MOCK_KPI_DATA.today.activeOrders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Órdenes completadas</span>
              <span className="font-semibold text-success-600">{MOCK_KPI_DATA.today.completedOrders}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Maquinarias en Campo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Tractor className="h-5 w-5 text-primary-500" />
                  <div>
                    <p className="text-sm font-medium">T002 - New Holland T6080</p>
                    <p className="text-xs text-gray-500">Potrero Norte</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">En Faena</p>
                  <p className="text-xs text-gray-500">6.5 hrs</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Tractor className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">T001 - John Deere 6120M</p>
                    <p className="text-xs text-gray-500">Base FUTAMAQ</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Disponible</p>
                  <p className="text-xs text-gray-500">0 hrs</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertas y Notificaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-warning-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-warning-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-warning-800">Mantenimiento vencido</p>
                  <p className="text-xs text-warning-600">Tractor T001 requiere mantenimiento preventivo</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-danger-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-danger-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-danger-800">Orden retrasada</p>
                  <p className="text-xs text-danger-600">OT-2024-002 debería haber iniciado hoy</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-info-50 rounded-lg">
                <Calendar className="h-5 w-5 text-info-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-info-800">Mantenimiento programado</p>
                  <p className="text-xs text-info-600">T002 - 28 de marzo</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de órdenes de trabajo */}
      <WorkOrdersTable />
    </div>
  )
}

