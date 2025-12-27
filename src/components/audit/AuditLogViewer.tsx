import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { History, ArrowRight, User } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

interface AuditLog {
    id: string
    operation: 'INSERT' | 'UPDATE' | 'DELETE'
    old_data: any
    new_data: any
    changed_by: string // UUID
    changed_at: string
    user_email?: string // To be fetched
}

interface AuditLogViewerProps {
    tableName: string
    recordId: string | number
    className?: string
}

export function AuditLogViewer({ tableName, recordId, className = '' }: AuditLogViewerProps) {
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchLogs()
    }, [tableName, recordId])

    const fetchLogs = async () => {
        try {
            setLoading(true)
            // 1. Fetch logs
            const { data, error } = await supabase
                .from('audit_logs')
                .select('*')
                .eq('table_name', tableName)
                .eq('record_id', String(recordId))
                .order('changed_at', { ascending: false })

            if (error) throw error

            // 2. Fetch user details
            const logsWithUsers = await Promise.all(data.map(async (log) => {
                if (log.changed_by) {
                    const { data: userData } = await supabase
                        .from('users')
                        .select('email')
                        .eq('id', log.changed_by)
                        .single()
                    return { ...log, user_email: userData?.email || 'Sistema/Usuario' }
                }
                return { ...log, user_email: 'Desconocido' }
            }))

            setLogs(logsWithUsers)
        } catch (err) {
            console.error('Error fetching audit logs:', err)
        } finally {
            setLoading(false)
        }
    }

    const renderDiff = (oldData: any, newData: any) => {
        if (!oldData && !newData) return null
        if (!oldData) return <div className="text-sm text-green-600">Registro Creado</div>
        if (!newData) return <div className="text-sm text-red-600">Registro Eliminado</div>

        const changes: React.ReactNode[] = []
        const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)])

        // Ignored keys
        const ignoredKeys = ['updated_at', 'created_at', 'last_location']

        allKeys.forEach(key => {
            if (ignoredKeys.includes(key)) return

            const val1 = oldData[key]
            const val2 = newData[key]

            // Simple comparison
            if (JSON.stringify(val1) !== JSON.stringify(val2)) {
                changes.push(
                    <div key={key} className="flex items-center gap-2 text-xs py-1 border-b border-gray-100 dark:border-gray-800 last:border-0">
                        <span className="font-semibold w-24 capitalize text-gray-500 dark:text-gray-400">{key.replace('_', ' ')}:</span>
                        <span className="text-red-500 dark:text-red-400 line-through bg-red-50 dark:bg-red-900/30 px-1 rounded">{String(val1)}</span>
                        <ArrowRight className="h-3 w-3 text-gray-400" />
                        <span className="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-1 rounded font-medium">{String(val2)}</span>
                    </div>
                )
            }
        })

        if (changes.length === 0) return <div className="text-sm text-gray-400 italic">Actualización interna (sin cambios visibles)</div>

        return <div className="mt-2 bg-gray-50 dark:bg-gray-900 rounded p-2">{changes}</div>
    }

    if (loading) return <div className="p-4 text-center text-gray-500 animate-pulse">Cargando historial...</div>

    if (logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-gray-400 border border-dashed rounded-lg">
                <History className="h-8 w-8 mb-2 opacity-50" />
                <p>No hay historial de cambios registrado.</p>
            </div>
        )
    }

    return (
        <div className={`space-y-4 ${className}`}>
            <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800 dark:text-white">
                <History className="h-5 w-5" />
                Historial de Cambios
            </h3>

            <div className="space-y-4">
                {logs.map((log) => (
                    <Card key={log.id} className="overflow-hidden">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Badge variant={
                                        log.operation === 'INSERT' ? 'success' :
                                            log.operation === 'UPDATE' ? 'info' : 'danger'
                                    }>
                                        {log.operation === 'INSERT' ? 'CREACIÓN' :
                                            log.operation === 'UPDATE' ? 'EDICIÓN' : 'ELIMINACIÓN'}
                                    </Badge>
                                    <span className="text-xs text-gray-400">
                                        {new Date(log.changed_at).toLocaleString('es-CL')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <User className="h-3 w-3" />
                                    {log.user_email || 'Usuario'}
                                </div>
                            </div>

                            {renderDiff(log.old_data, log.new_data)}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
