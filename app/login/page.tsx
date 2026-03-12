'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, Mail, Lock, LogIn } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setErrorMsg("Email ou mot de passe incorrect.")
        setLoading(false)
        return
      }

      if (data?.user) {
        // 🟢 C'EST ICI QUE LA MAGIE OPÈRE : LE TRI INTELLIGENT
        
        // ⚠️ REMPLACEZ PAR VOTRE VRAI EMAIL ADMINISTRATEUR
        const adminEmails = ['test@test.com'] 

        if (data.user.email && adminEmails.includes(data.user.email)) {
          // C'est l'administrateur -> Go au Panel Admin
          router.push('/admin')
        } else {
          // C'est un client normal -> Go au Dashboard Client
          router.push('/dashboard')
        }
      }
    } catch (err) {
      setErrorMsg("Une erreur inattendue s'est produite.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
          <LogIn size={32} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Connexion</h2>
        <p className="mt-2 text-sm text-slate-500 font-medium">Accédez à votre espace DimaCardAPP</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-3xl sm:px-10 border border-slate-100">
          
          <form className="space-y-6" onSubmit={handleLogin}>
            
            {errorMsg && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold text-center">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Adresse Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  placeholder="exemple@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Mot de passe</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}