'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, Mail, Lock, LogIn, AlertCircle } from 'lucide-react'

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
    <div className="min-h-screen bg-[#0B0F19] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      
      {/* Effets de lumière en arrière-plan (Glows) */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#8B5CF6]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#F5A623]/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="w-20 h-20 bg-[#111827] rounded-[1.5rem] border border-white/10 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(245,166,35,0.15)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#F5A623]/10 to-transparent pointer-events-none" />
          {/* Logo DimaCard ou Icône */}
          <img 
            src="/dimacardlogo.jpeg" 
            alt="DimaCard Logo" 
            className="w-full h-full object-contain relative z-10 rounded-[1.5rem]" 
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              // Si l'image ne charge pas, on affiche l'icône de secours
              e.currentTarget.parentElement?.querySelector('svg')?.classList.remove('hidden');
            }} 
          />
          <LogIn size={32} className="text-[#F5A623] relative z-10 hidden" />
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight" style={{ fontFamily: 'var(--font-display, sans-serif)' }}>Connexion</h2>
        <p className="mt-2 text-sm text-[#9CA3AF] font-medium tracking-wide">Accédez à votre espace <span className="text-[#F5A623] font-bold">DimaCard</span></p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#111827] py-8 px-6 shadow-2xl shadow-black/50 sm:rounded-[2.5rem] sm:px-10 border border-white/5 relative overflow-hidden">
          
          {/* Lueur interne de la carte */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5A623]/5 blur-[50px] rounded-full pointer-events-none" />
          
          <form className="space-y-6 relative z-10" onSubmit={handleLogin}>
            
            {/* Message d'Erreur */}
            {errorMsg && (
              <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={18} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#9CA3AF] mb-2 ml-1">Adresse Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#9CA3AF]">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-[#0B0F19] border border-white/10 rounded-xl text-white font-medium focus:bg-[#1F2937] focus:border-[#F5A623] outline-none transition-all placeholder:text-gray-600 shadow-inner"
                  placeholder="exemple@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#9CA3AF] mb-2 ml-1">Mot de passe</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#9CA3AF]">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-[#0B0F19] border border-white/10 rounded-xl text-white font-medium focus:bg-[#1F2937] focus:border-[#F5A623] outline-none transition-all placeholder:text-gray-600 shadow-inner"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-[#F5A623]/20 text-sm font-black text-[#0B0F19] bg-[#F5A623] hover:bg-[#FDE047] focus:outline-none active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed transition-all uppercase tracking-wide mt-2"
            >
              {loading ? <Loader2 className="animate-spin text-[#0B0F19]" size={20} /> : <LogIn size={20} className="text-[#0B0F19]" />}
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}