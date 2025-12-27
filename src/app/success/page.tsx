'use client'

import React from 'react'
import Link from 'next/link'
import { CheckCircle, ArrowRight, ShieldCheck, Zap } from 'lucide-react'

export default function PaymentSuccessPage() {
    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-green-500/30">

            {/* Ambient Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900/20 via-[#050505] to-[#050505] pointer-events-none" />
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-green-600/10 rounded-full blur-[120px] animate-pulse-slow pointer-events-none" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05] pointer-events-none" />

            {/* Success Card */}
            <div className="max-w-xl w-full relative z-10 animate-in fade-in zoom-in-95 duration-500">
                <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden ring-1 ring-white/5">

                    {/* Glow effect behind the checkmark */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-green-500/20 rounded-full blur-3xl pointer-events-none" />

                    {/* Icon */}
                    <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-900/30 mb-8 animate-[bounce_1s_infinite]">
                        <CheckCircle className="w-12 h-12 text-white" />
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                        ¡Felicidades!
                    </h1>

                    {/* Subtitle */}
                    <p className="text-xl text-green-400 font-medium mb-4">
                        Tu suscripción se ha activado correctamente.
                    </p>

                    {/* Description */}
                    <p className="text-gray-400 mb-10 leading-relaxed">
                        Gracias por confiar en <strong>AgroHosting</strong>. Ahora tienes acceso completo a nuestras herramientas de gestión agrícola de última generación.
                    </p>

                    {/* Features (Mini list) */}
                    <div className="flex justify-center gap-6 mb-10 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-green-500" />
                            <span>Pago Seguro</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-green-500" />
                            <span>Acceso Inmediato</span>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <Link href="/dashboard" className="block w-full">
                        <button className="group relative w-full bg-white text-black font-bold py-4 px-8 rounded-full hover:bg-gray-100 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transform hover:-translate-y-1">
                            <span className="flex items-center justify-center gap-3">
                                Ingresar al Sistema
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </button>
                    </Link>

                    <div className="mt-8 text-xs text-gray-500">
                        Se ha enviado un recibo a tu correo electrónico.
                    </div>
                </div>
            </div>
        </div>
    )
}
