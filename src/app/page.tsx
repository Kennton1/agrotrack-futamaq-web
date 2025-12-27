'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Check,
  Menu,
  X,
  ArrowRight,
  BarChart3,
  MapPin,
  ChevronRight,
  Globe,
  Smartphone,
  ShieldCheck,
  Leaf,
  Droplets,
  Tractor,
  Users,
  Activity,
  Zap,
  TrendingUp,
  Award,
  Cpu,
  Lock,
  LogOut,
  LayoutDashboard
} from 'lucide-react'
import { BRANDING } from '@/lib/branding'
import { toast } from 'react-hot-toast'

import { useAuth } from '@/contexts/AuthContext'

export default function LandingPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // Detectar scroll para el navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToPlans = () => {
    const plansSection = document.getElementById('planes')
    if (plansSection) {
      plansSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleBuy = async (planTitle: string, price: number) => {
    if (!user) {
      toast.error('Debes iniciar sesión para contratar un plan')
      window.location.href = '/login'
      return
    }

    const toastId = toast.loading('Procesando solicitud...')

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planTitle,
          price,
          quantity: 1,
          payer_email: user.email // Enviamos el email del usuario logueado
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error('Error al iniciar el pago', { id: toastId })
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error de conexión', { id: toastId })
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-green-600 selection:text-white overflow-x-hidden">

      {/* Navbar Fixed */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${isScrolled ? 'bg-[#050505]/90 backdrop-blur-md border-white/10 py-3' : 'bg-transparent border-transparent py-5'}`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer group">
            <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-green-700 rounded-lg flex items-center justify-center shadow-lg shadow-green-900/40">
              <Leaf className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Agro<span className="text-green-500">Hosting</span>
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink href="#features">Funcionalidades</NavLink>
            <NavLink href="#planes">Planes</NavLink>
            <NavLink href="#nosotros">Nosotros</NavLink>
            <div className="h-6 w-px bg-white/10"></div>
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="bg-zinc-800/50 border border-white/10 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-zinc-700/50 transition-all flex items-center gap-2 relative z-50"
                >
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Hola, {user.full_name?.split(' ')[0] || 'Usuario'}
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-[#0a0f16] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-200">
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <LayoutDashboard size={16} className="text-green-500" />
                        Mi Panel
                      </Link>
                      <button
                        onClick={() => {
                          signOut()
                          setUserMenuOpen(false)
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors text-left"
                      >
                        <LogOut size={16} />
                        Cerrar Sesión
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link href="/login">
                  <button className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                    Iniciar Sesión
                  </button>
                </Link>
                <Link href="/register">
                  <button className="bg-green-600 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-green-500 transition-colors flex items-center gap-2 shadow-lg shadow-green-900/20">
                    Crear Cuenta <ChevronRight size={14} />
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-300 hover:text-white"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {
          mobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 bg-[#0a0a0a] border-b border-white/10 p-6 md:hidden shadow-2xl flex flex-col gap-4">
              <Link href="#features" className="text-lg font-medium text-gray-300">Funcionalidades</Link>
              <Link href="#planes" className="text-lg font-medium text-gray-300">Planes</Link>
              <Link href="#nosotros" className="text-lg font-medium text-gray-300">Nosotros</Link>
              <div className="flex flex-col gap-3 mt-4">
                <Link href="/login">
                  <button className="w-full bg-[#111] border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 px-6 py-3 rounded-xl text-lg font-bold transition-all">
                    Iniciar Sesión
                  </button>
                </Link>
                <Link href="/register">
                  <button className="w-full bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl text-lg font-bold shadow-lg shadow-green-900/20 transition-all">
                    Crear Cuenta
                  </button>
                </Link>
              </div>
            </div>
          )
        }
      </nav >

      {/* Hero Section */}
      < section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden" >
        {/* Background Glow */}
        < div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-green-600/10 blur-[120px] rounded-full pointer-events-none" ></div >

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

            {/* Hero Content */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-xs font-semibold tracking-wide text-green-400 uppercase">La plataforma #1 en Chile</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold text-white tracking-tight mb-6 leading-[1.1]">
                Gestiona tu campo <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
                  sin complicaciones.
                </span>
              </h1>

              <p className="text-lg text-gray-400 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Centraliza el control de tu maquinaria, combustible y personal en un solo lugar.
                Toma decisiones basadas en datos reales, no en intuiciones.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={scrollToPlans}
                  className="px-8 py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-500 transition-all shadow-lg shadow-green-900/20 flex items-center justify-center gap-2"
                >
                  Ver Planes y Precios
                </button>
                <Link href="/login">
                  <button className="px-8 py-4 bg-[#111] text-white border border-white/10 rounded-xl font-bold text-lg hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                    <Smartphone size={20} /> Descargar App
                  </button>
                </Link>
              </div>

              <div className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2"><Check size={16} className="text-green-500" /> Sin contratos forzosos</div>
                <div className="flex items-center gap-2"><Check size={16} className="text-green-500" /> Soporte local</div>
              </div>
            </div>

            {/* Hero Visual / Mockup */}
            <div className="flex-1 w-full max-w-[600px] lg:max-w-none relative perspective-[2000px]">
              {/* Dashboard Realistic Mockup */}
              <div className="relative bg-[#0F0F0F] border border-white/10 rounded-2xl shadow-2xl overflow-hidden transform rotate-y-[-5deg] rotate-x-[5deg] hover:rotate-0 transition-all duration-700 ease-out flex flex-col">
                {/* Header Mockup */}
                <div className="h-14 border-b border-white/5 bg-[#111] flex items-center px-4 gap-4 justify-between">
                  <div className="flex gap-2 items-center">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center text-[8px]">●</div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center text-[8px]">●</div>
                      <div className="w-3 h-3 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-[8px]">●</div>
                    </div>
                    <div className="h-6 w-px bg-white/10 mx-2"></div>
                    <div className="flex items-center gap-2 bg-[#050505] px-3 py-1.5 rounded-md border border-white/5">
                      <span className="text-xs font-medium text-gray-400">app.agrohosting.com</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-500">ADMIN</span>
                    <div className="w-6 h-6 rounded-full bg-green-900 border border-green-700"></div>
                  </div>
                </div>

                {/* Body Mockup */}
                <div className="p-6 grid grid-cols-2 gap-4 bg-[#0A0A0A]">
                  {/* Top Stats */}
                  <div className="p-4 rounded-xl bg-[#151515] border border-white/5 group hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-2 mb-2 text-gray-400">
                      <Tractor size={16} /> <span className="text-xs font-bold">FLOTA ACTIVA</span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">12<span className="text-sm text-gray-500 font-normal">/15</span></div>
                    <div className="text-xs text-green-500 font-medium">● 3 en Mantenimiento</div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#151515] border border-white/5 group hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-2 mb-2 text-gray-400">
                      <Droplets size={16} /> <span className="text-xs font-bold">COMBUSTIBLE (MES)</span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">4.2k<span className="text-sm text-gray-500 font-normal"> Litros</span></div>
                    <div className="text-xs text-green-500 font-medium flex items-center gap-1">
                      <Globe size={10} /> Consumo Óptimo
                    </div>
                  </div>

                  {/* Activity Chart Area */}
                  <div className="col-span-2 h-48 bg-[#151515] rounded-xl border border-white/5 p-5 flex flex-col justify-between relative overflow-hidden group">
                    {/* Title */}
                    <div className="flex justify-between items-center z-10 relative">
                      <div className="flex items-center gap-2">
                        <Activity size={16} className="text-green-500" />
                        <span className="text-sm font-bold text-gray-300">Actividad en Tiempo Real</span>
                      </div>
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-[10px] text-green-500 font-bold uppercase">Live</span>
                      </div>
                    </div>

                    {/* SVG Area Chart */}
                    <div className="absolute inset-0 pt-12 pr-0 pl-0 bottom-0 pointer-events-none">
                      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M0,80 C10,70 20,90 30,50 C40,20 50,60 60,70 C70,80 80,40 90,50 L90,100 L0,100 Z"
                          fill="url(#chartGradient)"
                        />
                        <path
                          d="M0,80 C10,70 20,90 30,50 C40,20 50,60 60,70 C70,80 80,40 90,50"
                          fill="none"
                          stroke="#22c55e"
                          strokeWidth="0.5"
                          vectorEffect="non-scaling-stroke"
                        />
                      </svg>

                      {/* Grid lines */}
                      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                      <div className="absolute inset-x-0 bottom-0 h-px bg-white/5"></div>
                      <div className="absolute inset-x-0 bottom-1/3 h-px bg-white/5 border-dashed border-b border-white/5"></div>
                      <div className="absolute inset-x-0 bottom-2/3 h-px bg-white/5 border-dashed border-b border-white/5"></div>
                    </div>
                  </div>

                  {/* Recent Alerts List */}
                  <div className="col-span-2 mt-2">
                    <div className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider px-1">Alertas en Tiempo Real</div>
                    <div className="space-y-2">
                      <div className="h-12 bg-[#151515] rounded-lg flex items-center px-4 gap-3 border-l-2 border-red-500 group hover:bg-[#1A1A1A] transition-colors cursor-pointer">
                        <div className="p-1.5 bg-red-500/10 rounded text-red-500"><ShieldCheck size={14} /></div>
                        <div className="flex-1">
                          <div className="text-xs font-bold text-gray-200">Presión de Aceite Baja</div>
                          <div className="text-[10px] text-gray-500">Tractor John Deere 6120M • Hace 5 min</div>
                        </div>
                        <button className="text-[10px] bg-white/5 group-hover:bg-white/10 px-2 py-1 rounded text-white transition-colors">Ver</button>
                      </div>
                      <div className="h-12 bg-[#151515] rounded-lg flex items-center px-4 gap-3 border-l-2 border-orange-500 group hover:bg-[#1A1A1A] transition-colors cursor-pointer">
                        <div className="p-1.5 bg-orange-500/10 rounded text-orange-500"><Droplets size={14} /></div>
                        <div className="flex-1">
                          <div className="text-xs font-bold text-gray-200">Nivel de Combustible &lt; 10%</div>
                          <div className="text-[10px] text-gray-500">Generador Estacionario 2 • Hace 25 min</div>
                        </div>
                        <button className="text-[10px] bg-white/5 group-hover:bg-white/10 px-2 py-1 rounded text-white transition-colors">Ver</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Element: Mobile App Notification */}
              <div className="absolute -bottom-10 -left-10 bg-[#1A1A1A] p-4 rounded-xl border border-white/10 shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-5 fade-in duration-1000 delay-500">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                  <Check size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Mantenimiento Completado</p>
                  <p className="text-xs text-gray-400">Tractor John Deere 6120M</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section >

      {/* Features Detail Section */}
      < section id="features" className="py-24 bg-[#080808]" >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Control total, estés donde estés</h2>
            <p className="text-gray-400 text-lg">
              AgroHosting combina hardware IoT y software en la nube para entregarte una visión completa de tu operación.
            </p>
          </div>

          <div className="space-y-24">

            {/* Feature 1: Machinery & Maintenance */}
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 order-2 lg:order-1">
                <div className="w-full aspect-video bg-[#111] rounded-2xl border border-white/5 overflow-hidden relative shadow-2xl flex flex-col">
                  {/* Mock Fleet List UI */}
                  <div className="p-4 border-b border-white/5 bg-[#151515] flex justify-between items-center">
                    <div className="text-sm font-bold text-gray-300">Estado de Flota</div>
                    <div className="flex gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className="text-xs text-gray-500">12 Activos</span>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    {/* Machine Item 1 */}
                    <div className="p-3 bg-[#1A1A1A] rounded-xl border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                          <Tractor size={18} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">John Deere 6120M</div>
                          <div className="text-xs text-gray-500">Horómetro: 14,250 hrs</div>
                        </div>
                      </div>
                      <div className="px-2 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded">OPERATIVO</div>
                    </div>

                    {/* Machine Item 2 */}
                    <div className="p-3 bg-[#1A1A1A] rounded-xl border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                          <Tractor size={18} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">Massey Ferguson 7700</div>
                          <div className="text-xs text-gray-500">Horómetro: 8,100 hrs</div>
                        </div>
                      </div>
                      <div className="px-2 py-1 bg-orange-500/10 text-orange-500 text-xs font-bold rounded">MANTENCIÓN</div>
                    </div>

                    {/* Machine Item 3 */}
                    <div className="p-3 bg-[#1A1A1A] rounded-xl border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                          <Tractor size={18} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">New Holland T6</div>
                          <div className="text-xs text-gray-500">Horómetro: 5,320 hrs</div>
                        </div>
                      </div>
                      <div className="px-2 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded">OPERATIVO</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1 order-1 lg:order-2">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 mb-6">
                  <Tractor size={24} />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">Control Integral de Maquinaria</h3>
                <p className="text-lg text-gray-400 mb-6">
                  Lleva una hoja de vida digital detallada de cada equipo. Controla horas de uso, programa mantenimientos preventivos y evita paradas inesperadas.
                </p>
                <ul className="space-y-3">
                  {['Registro de horómetros', 'Historial de mantenimientos', 'Alertas de servicios próximos'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-gray-300">
                      <Check size={18} className="text-blue-500" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Feature 2: App Mobile */}
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1">
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500 mb-6">
                  <Smartphone size={24} />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">App Móvil para Operadores</h3>
                <p className="text-lg text-gray-400 mb-6">
                  Simplifica la vida de tu equipo. Una interfaz diseñada para dedos grandes y sol brillante. Registra labores, combustible y mecánicas en segundos.
                </p>
                <ul className="space-y-3">
                  {['Funciona 100% Offline', 'Carga de Combustible con Validaciones', 'Reporte de Fallas con Fotos'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-gray-300">
                      <Check size={18} className="text-green-500" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 flex justify-center">
                {/* Detailed Phone Mockup */}
                <div className="w-[320px] h-[640px] bg-[#050505] border-8 border-[#1A1A1A] rounded-[3rem] overflow-hidden relative shadow-2xl flex flex-col">
                  {/* Notch */}
                  <div className="absolute top-0 left-0 right-0 h-7 bg-[#1A1A1A] z-20 rounded-b-2xl mx-auto w-40"></div>

                  {/* App Header */}
                  <div className="bg-[#111] p-6 pt-12 pb-4 border-b border-white/5">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <div className="text-xs text-gray-500 font-medium">BIENVENIDO</div>
                        <div className="text-xl font-bold text-white">Juan Pérez</div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-green-900/50 border border-green-500/30 flex items-center justify-center text-green-500 font-bold">JP</div>
                    </div>
                    {/* Connection Status */}
                    <div className="flex items-center gap-2 bg-green-500/10 w-fit px-3 py-1 rounded-full border border-green-500/20">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-bold text-green-500">CONECTADO</span>
                    </div>
                  </div>

                  {/* App Content */}
                  <div className="p-5 flex-1 bg-[#0A0A0A] overflow-hidden relative">
                    {/* Quick Actions Grid */}
                    <div className="text-xs text-gray-500 font-bold mb-3 uppercase tracking-wider">Acciones Rápidas</div>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-[#151515] p-4 rounded-2xl border border-white/5 hover:bg-[#1A1A1A] transition-colors cursor-pointer group">
                        <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 mb-2 group-hover:scale-110 transition-transform">
                          <Droplets size={20} />
                        </div>
                        <span className="text-sm font-bold text-gray-200">Cargar<br />Combustible</span>
                      </div>
                      <div className="bg-[#151515] p-4 rounded-2xl border border-white/5 hover:bg-[#1A1A1A] transition-colors cursor-pointer group">
                        <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 mb-2 group-hover:scale-110 transition-transform">
                          <ShieldCheck size={20} />
                        </div>
                        <span className="text-sm font-bold text-gray-200">Reportar<br />Falla</span>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="text-xs text-gray-500 font-bold mb-3 uppercase tracking-wider">Actividad Reciente</div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-[#111] rounded-xl border border-white/5">
                        <div className="p-2 bg-green-500/10 rounded-lg text-green-500"><Check size={16} /></div>
                        <div>
                          <div className="text-sm font-bold text-white">Turno Iniciado</div>
                          <div className="text-xs text-gray-500">Hace 2 horas • Fundo Los Olivos</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-[#111] rounded-xl border border-white/5 opacity-60">
                        <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500"><Droplets size={16} /></div>
                        <div>
                          <div className="text-sm font-bold text-white">Carga 150L Diesel</div>
                          <div className="text-xs text-gray-500">Ayer 18:30 • Tractor T-800</div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Nav Mockup */}
                    <div className="absolute bottom-4 left-4 right-4 h-16 bg-[#151515] rounded-2xl flex items-center justify-around border border-white/10 shadow-2xl">
                      <div className="text-green-500"><Menu size={24} /></div>
                      <div className="text-gray-600"><MapPin size={24} /></div>
                      <div className="text-gray-600"><Users size={24} /></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3: Fuel */}
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 order-2 lg:order-1">
                <div className="w-full aspect-video bg-[#111] rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center relative shadow-2xl">
                  {/* Abstract Charts */}
                  <div className="w-3/4 h-3/4 flex items-end justify-between gap-4 p-8">
                    <div className="w-12 h-[40%] bg-orange-500/20 rounded-t-lg relative group">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded text-black text-xs opacity-0 group-hover:opacity-100 transition-opacity">400Lt</div>
                    </div>
                    <div className="w-12 h-[75%] bg-orange-500/40 rounded-t-lg"></div>
                    <div className="w-12 h-[50%] bg-orange-500/30 rounded-t-lg"></div>
                    <div className="w-12 h-[90%] bg-orange-500 rounded-t-lg shadow-[0_0_20px_rgba(249,115,22,0.3)]"></div>
                    <div className="w-12 h-[60%] bg-orange-500/30 rounded-t-lg"></div>
                  </div>
                </div>
              </div>
              <div className="flex-1 order-1 lg:order-2">
                <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 mb-6">
                  <Droplets size={24} />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">Control de Combustible</h3>
                <p className="text-lg text-gray-400 mb-6">
                  Reduce el robo y desperdicio. Monitorea cada carga y descarga de combustible, cruzando datos con el rendimiento real de las máquinas.
                </p>
                <ul className="space-y-3">
                  {['Conciliación de litros', 'Alertas de anomalías', 'Reportes de rendimiento por chofer'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-gray-300">
                      <Check size={18} className="text-orange-500" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </div>
      </section >

      {/* Pricing Section */}
      < section id="planes" className="py-24 relative overflow-hidden bg-[#050505]" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Planes diseñados para crecer</h2>
            <p className="text-gray-400 text-lg">Inicia con lo básico y escala a medida que tu operación lo requiera.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Starter */}
            <div className="p-8 rounded-3xl bg-[#0a0a0a] border border-white/10 flex flex-col hover:border-white/20 transition-all group">
              <h3 className="text-lg font-bold text-gray-300 mb-2">Starter</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-white">$24.990</span>
                <span className="text-gray-500">/mes</span>
              </div>
              <p className="text-sm text-gray-500 mb-6">Para empezar a digitalizar sin grandes costos.</p>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-gray-400"><Check size={18} className="text-green-500" /> App Operadores Offline</li>
                <li className="flex items-center gap-3 text-gray-400"><Check size={18} className="text-green-500" /> Hoja de Vida Maquinaria</li>
                <li className="flex items-center gap-3 text-gray-400"><Check size={18} className="text-green-500" /> Control Cargas de Petróleo</li>
                <li className="flex items-center gap-3 text-gray-400"><Check size={18} className="text-green-500" /> 1 Usuario Admin</li>
              </ul>
              <button
                onClick={() => handleBuy('Starter', 24990)}
                className="w-full py-3 rounded-xl bg-gray-800 text-white font-bold hover:bg-gray-700 transition-all"
              >
                Contratar
              </button>
            </div>

            {/* Pro - Featured */}
            <div className="p-8 rounded-3xl bg-[#0c0c0c] border-2 border-green-600 flex flex-col relative shadow-[0_0_40px_rgba(22,163,74,0.1)] scale-105 z-10">
              <div className="absolute top-0 right-0 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl">
                MÁS POPULAR
              </div>
              <h3 className="text-lg font-bold text-green-400 mb-2">Pro</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-5xl font-bold text-white">$59.990</span>
                <span className="text-gray-500">/mes</span>
              </div>
              <p className="text-sm text-gray-400 mb-6">Velocidad y control para campos en crecimiento.</p>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-white"><Check size={18} className="text-green-500" /> Todo lo del Starter +</li>
                <li className="flex items-center gap-3 text-white"><Check size={18} className="text-green-500" /> Alertas de Robo Combustible</li>
                <li className="flex items-center gap-3 text-white"><Check size={18} className="text-green-500" /> Gestión Taller y Mantenciones</li>
                <li className="flex items-center gap-3 text-white"><Check size={18} className="text-green-500" /> 5 Usuarios + Roles</li>
              </ul>
              <button
                onClick={() => handleBuy('Pro', 59990)}
                className="w-full py-4 rounded-xl bg-green-600 text-white font-bold hover:bg-green-500 transition-all shadow-lg hover:shadow-green-500/25"
              >
                Contratar
              </button>
            </div>

            {/* Enterprise */}
            <div className="p-8 rounded-3xl bg-[#0a0a0a] border border-white/10 flex flex-col hover:border-white/20 transition-all">
              <h3 className="text-lg font-bold text-gray-300 mb-2">Enterprise</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-white">$119.990</span>
                <span className="text-gray-500">/mes</span>
              </div>
              <p className="text-sm text-gray-500 mb-6">Potencia ilimitada para grandes agrícolas.</p>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-gray-400"><Check size={18} className="text-green-500" /> Todo lo del Pro +</li>
                <li className="flex items-center gap-3 text-gray-400"><Check size={18} className="text-green-500" /> Integración ERP / SAP</li>
                <li className="flex items-center gap-3 text-gray-400"><Check size={18} className="text-green-500" /> Usuarios Ilimitados</li>
                <li className="flex items-center gap-3 text-gray-400"><Check size={18} className="text-green-500" /> Soporte Prioritario WhatsApp</li>
              </ul>
              <button
                onClick={() => handleBuy('Enterprise', 119990)}
                className="w-full py-3 rounded-xl bg-gray-800 text-white font-bold hover:bg-gray-700 transition-all"
              >
                Contratar
              </button>
            </div>
          </div>
        </div>
      </section >

      {/* Us (About) Section */}
      < section id="nosotros" className="py-24 bg-[#080808] border-t border-white/5 overflow-hidden" >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-20 items-center">

            <div className="flex-1 space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                <Users size={14} className="text-blue-500" />
                <span className="text-xs font-bold text-blue-500 uppercase">ADN Tecnológico</span>
              </div>

              <h2 className="text-4xl lg:text-6xl font-bold text-white leading-[1.1]">
                No somos agricultores. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                  Somos expertos en datos.
                </span>
              </h2>

              <div className="prose prose-invert text-gray-400">
                <p className="text-xl font-medium text-gray-300">
                  Y eso es exactamente lo que tu campo necesita.
                </p>
                <p className="text-lg">
                  En <strong className="text-white">AgroHosting</strong>, somos un equipo de elite de <strong>Ingenieros Informáticos</strong> obsesionados con la eficiencia.
                  No venimos a decirte cómo cultivar, venimos a darte las herramientas militares para controlar tu imperio agrícola.
                </p>
                <p className="text-lg">
                  Vimos un campo lleno de maquinaria costosa gestionada con cuadernos y excel. Vimos ineficiencia. Vimos robo hormiga.
                  Y creamos la solución definitiva para cerrarle la llave a las pérdidas.
                </p>
              </div>
            </div>

            <div className="flex-1 w-full relative">
              {/* Abstract Tech Visual */}
              <div className="relative z-10 grid grid-cols-2 gap-4">
                <div className="space-y-4 pt-12">
                  <div className="bg-[#111] p-6 rounded-2xl border border-white/10 hover:border-blue-500/50 transition-all duration-300 group">
                    <h4 className="text-3xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">+30%</h4>
                    <p className="text-sm text-gray-400 font-medium uppercase tracking-wide">Ahorro en Combustible</p>
                  </div>
                  <div className="bg-[#111] p-6 rounded-2xl border border-white/10 hover:border-blue-500/50 transition-all duration-300 group">
                    <h4 className="text-3xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">100%</h4>
                    <p className="text-sm text-gray-400 font-medium uppercase tracking-wide">Trazabilidad Digital</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-[#151515] p-6 rounded-2xl border border-white/10 hover:border-blue-500/50 transition-all duration-300 shadow-2xl group">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                      <Zap size={24} fill="currentColor" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">Velocidad Extrema</h4>
                    <p className="text-sm text-gray-400">Nuestro software está optimizado para funcionar rápido, incluso con mala señal. Ingeniería de alto nivel.</p>
                  </div>
                  <div className="bg-[#111] p-6 rounded-2xl border border-white/10 hover:border-blue-500/50 transition-all duration-300 group">
                    <h4 className="text-3xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">24/7</h4>
                    <p className="text-sm text-gray-400 font-medium uppercase tracking-wide">Uptime Garantizado</p>
                  </div>
                </div>
              </div>

              {/* Decorative background elements */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-600/10 blur-[100px] rounded-full -z-10"></div>
            </div>

          </div>
        </div>
      </section >

      {/* Footer */}
      < footer className="bg-[#020202] border-t border-white/5 py-12" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-900/30 rounded-lg flex items-center justify-center">
                <Leaf className="text-green-500 w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white">AgroHosting</span>
            </div>

            <p className="text-gray-500 text-sm">
              © 2024 AgroHosting Inc. Todos los derechos reservados.
            </p>

            <div className="flex gap-6 text-sm font-medium text-gray-400">
              <a href="#" className="hover:text-green-500 transition-colors">Términos</a>
              <a href="#" className="hover:text-green-500 transition-colors">Privacidad</a>
              <a href="#" className="hover:text-green-500 transition-colors">Soporte</a>
            </div>
          </div>
        </div>
      </footer >
    </div >
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
      {children}
    </Link>
  )
}