import React, { useEffect, useState } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { supabase, ADMIN_EMAIL } from '../../lib/supabase'
import { Lock, Mail, Loader2, LogOut, FileText } from 'lucide-react'

export default function AdminLayout() {
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setAuthError('')
    setSubmitting(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })

      if (error) {
        setAuthError(error.message === 'Invalid login credentials' 
          ? 'E-mail ou senha inválidos.' 
          : error.message
        )
      }
    } catch (err) {
      setAuthError('Erro ao tentar fazer login. Tente novamente.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#4A2545] animate-spin" />
      </div>
    )
  }

  // Not authenticated
  if (!session) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-[#4A2545]/10 text-[#4A2545] mb-2">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-extrabold text-[#4A2545]">Painel do Administrador</h1>
            <p className="text-xs text-gray-500">Faça login para gerenciar os posts do blog.</p>
          </div>

          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#4A2545]">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="seu-email@exemplo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8853A]/50 focus:border-[#C8853A] transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#4A2545]">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8853A]/50 focus:border-[#C8853A] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-[#4A2545] hover:bg-[#6B3566] text-white py-3 rounded-xl text-sm font-bold shadow-md shadow-[#4A2545]/20 hover:brightness-105 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <div className="text-center">
            <Link to="/" className="text-xs text-[#C8853A] hover:underline font-bold">
              Voltar para o blog público
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Authenticated but not the admin
  if (session.user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center space-y-6">
          <div className="inline-flex p-3 rounded-2xl bg-red-50 text-red-600 mb-2">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-extrabold text-red-600">Acesso Negado</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Seu usuário <span className="font-semibold text-gray-800">{session.user.email}</span> não tem permissão para acessar esta área.
          </p>
          <div className="pt-2 flex flex-col gap-3">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sair e usar outra conta
            </button>
            <Link to="/" className="text-xs text-[#C8853A] hover:underline font-bold">
              Voltar para o blog
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Authorized Admin
  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Header Admin */}
      <header className="sticky top-0 z-50 bg-[#4A2545] text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#C8853A]" />
            <Link to="/admin" className="font-bold text-sm sm:text-base hover:text-white/95 transition-colors">
              Painel do Blog Pitada
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-xs text-white/70">{session.user.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl transition-all font-bold"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Outlet />
      </div>
    </div>
  )
}
