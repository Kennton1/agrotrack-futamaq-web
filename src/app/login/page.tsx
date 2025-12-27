'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Eye, EyeOff, Lock, Mail, ArrowRight, Leaf, Check } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { BRANDING } from '@/lib/branding'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)

  const { signIn, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Check for saved email
    const savedEmail = localStorage.getItem('agrotrack_saved_email')
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

  // Redirect if already logged in - to HOME
  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await signIn(email, password)

      if (error) {
        toast.error('Credenciales incorrectas')
      } else {
        toast.success(`Bienvenido de vuelta`)

        // Save email if remember me is checked
        if (rememberMe) {
          localStorage.setItem('agrotrack_saved_email', email)
        } else {
          localStorage.removeItem('agrotrack_saved_email')
        }

        // Redirect to Home/Landing
        setTimeout(() => {
          window.location.href = '/'
        }, 800)
      }
    } catch (error) {
      toast.error('Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-950 to-slate-900 flex items-center justify-center relative overflow-hidden font-sans selection:bg-green-500/30">

      {/* Background Ambient Effects - Richer and more visible */}
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-emerald-600/10 rounded-full blur-[120px] animate-pulse-slow pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] animate-pulse-slow pointer-events-none mix-blend-screen" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05] pointer-events-none" />

      {/* Login Container */}
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
          <h1 className="text-2xl font-medium text-gray-200 tracking-tight">Bienvenido de vuelta</h1>
        </div>

        {/* Card - Lighter contrast against the deep colored background */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden ring-1 ring-white/5">
          <form onSubmit={handleSubmit} className="space-y-6">

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
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Contraseña</label>
                <Link href="#" className="text-xs text-green-400 hover:text-green-300 transition-colors font-medium">¿Olvidaste tu contraseña?</Link>
              </div>
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
                  placeholder="••••••••"
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

            {/* Remember Me */}
            <div className="flex items-center">
              <label className="flex items-center gap-3 cursor-pointer group/check select-none">
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${rememberMe ? 'bg-green-500 border-green-500' : 'bg-transparent border-slate-600 group-hover/check:border-slate-500'}`}>
                  {rememberMe && <Check className="w-3.5 h-3.5 text-white" />}
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                </div>
                <span className="text-sm text-gray-300 group-hover/check:text-gray-200 transition-colors">Recordar dispositivo</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-900/20 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Iniciar Sesión <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-gray-400 text-sm">
              ¿Aún no tienes cuenta?{' '}
              <Link href="/register" className="text-green-400 hover:text-green-300 font-semibold transition-colors hover:underline">
                Crear Cuenta Gratis
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 flex justify-center gap-8 text-xs text-gray-500 font-medium">
          <a href="#" className="hover:text-gray-300 transition-colors">Privacidad</a>
          <a href="#" className="hover:text-gray-300 transition-colors">Términos</a>
          <a href="#" className="hover:text-gray-300 transition-colors">Ayuda</a>
        </div>
      </div>
    </div>
  )
}
