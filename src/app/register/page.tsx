'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Eye, EyeOff, User, Mail, Lock, ArrowRight, Leaf } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { BRANDING } from '@/lib/branding'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)

    try {
      // Create user with 'administrador' role by default
      const { error } = await signUp(email, password, fullName, 'administrador')

      if (error) {
        if (error.message.includes('User already registered') || error.message.includes('already registered')) {
          toast.error('Este correo ya está registrado. Por favor inicia sesión.')
          setTimeout(() => router.push('/login'), 2000)
        } else {
          toast.error('Error al registrarse: ' + error.message)
        }
      } else {
        toast.success('Registro exitoso. Por favor selecciona tu plan.')
        // Redirect to Landing Page to select a plan
        setTimeout(() => {
          window.location.href = '/#planes'
        }, 1500)
      }
    } catch (error) {
      toast.error('Error inesperado al registrarse')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-950 to-slate-900 flex items-center justify-center relative overflow-hidden font-sans selection:bg-green-500/30">

      {/* Background Ambient Effects - Matching Login Page */}
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-emerald-600/10 rounded-full blur-[120px] animate-pulse-slow pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] animate-pulse-slow pointer-events-none mix-blend-screen" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05] pointer-events-none" />

      {/* Register Container */}
      <div className="w-full max-w-lg p-6 relative z-10">
        {/* Header / Logo */}
        <div className="text-center mb-10 space-y-3">
          <Link href="/" className="inline-flex items-center gap-3 mb-2 group">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-900/30 group-hover:scale-105 transition-transform duration-300">
              <Leaf className="text-white w-7 h-7" />
            </div>
            <span className="text-3xl font-bold text-white tracking-tight">
              Agro<span className="text-green-400">Hosting</span>
            </span>
          </Link>
          <h1 className="text-2xl font-medium text-gray-200 tracking-tight">Comienza a optimizar tu campo</h1>
        </div>

        {/* Card - Better Contrast & Harmony in Slate/Green */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden ring-1 ring-white/5">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider ml-1">Nombre Completo</label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within/input:text-green-400 text-gray-400">
                  <User className="h-5 w-5" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700/50 text-white rounded-xl py-3.5 pl-11 pr-4 focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all outline-none placeholder:text-gray-500 hover:border-slate-600/50"
                  placeholder="Ej. Juan Pérez"
                  required
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider ml-1">Email Corporativo</label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within/input:text-green-400 text-gray-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700/50 text-white rounded-xl py-3.5 pl-11 pr-4 focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all outline-none placeholder:text-gray-500 hover:border-slate-600/50"
                  placeholder="nombre@empresa.com"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider ml-1">Contraseña</label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within/input:text-green-400 text-gray-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700/50 text-white rounded-xl py-3.5 pl-11 pr-12 focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all outline-none placeholder:text-gray-500 hover:border-slate-600/50"
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider ml-1">Confirmar Contraseña</label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within/input:text-green-400 text-gray-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700/50 text-white rounded-xl py-3.5 pl-11 pr-4 focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all outline-none placeholder:text-gray-500 hover:border-slate-600/50"
                  placeholder="Repite tu contraseña"
                  minLength={6}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-900/20 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Registrarse Gratis <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-gray-400 text-sm">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-green-400 hover:text-green-300 font-semibold transition-colors hover:underline">
                Inicia Sesión aquí
              </Link>
            </p>
          </div>
        </div>

        {/* Terms */}
        <div className="mt-8 text-center px-4">
          <p className="text-xs text-gray-500">
            Al registrarte, aceptas nuestros{' '}
            <a href="#" className="text-gray-400 hover:text-white transition-colors underline">Términos de Servicio</a>
            {' y '}
            <a href="#" className="text-gray-400 hover:text-white transition-colors underline">Política de Privacidad</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
