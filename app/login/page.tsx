'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false) // Toggle entre Login et Inscription

  // 1. N-t2akdo wach l'utilisateur aslan connecté (bach n-siwftouh l'Dashboard direct)
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/dashboard')
      }
    }
    checkUser()
  }, [router, supabase])

  // 2. Fonction dyal Login w Inscription
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const loadingToast = toast.loading(isSignUp ? "Création du compte..." : "Connexion en cours...")

    try {
      if (isSignUp) {
        // INSCRIPTION (Sign Up)
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        toast.success("Compte créé avec succès ! Tu peux te connecter.", { id: loadingToast })
        setIsSignUp(false) // N-rej3ouh l'page dyal Login bach y-dkhel
        setPassword('') // N-khwiw l'mot de passe
      } else {
        // CONNEXION (Sign In)
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        toast.success("Connecté !", { id: loadingToast })
        router.push('/dashboard') // N-siftooh l'Dashboard
      }
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`, { id: loadingToast })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#F9FAFB] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <Toaster position="top-center" toastOptions={{ style: { background: '#1F2937', color: '#fff' } }}/>
      
      {/* Background Éléments (Décoration) */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#F5A623]/10 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#F5A623]/5 blur-[100px] rounded-full pointer-events-none"></div>

      {/* Carte de Connexion */}
      <div className="w-full max-w-md bg-[#111827] rounded-[2rem] p-8 sm:p-10 border border-white/5 shadow-2xl relative z-10">
        
        {/* Logo / Titre */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-tight text-white mb-2">
            Dima<span className="text-[#F5A623]">Card</span>
          </h1>
          <p className="text-gray-400 text-sm">
            {isSignUp ? "Créez votre compte pour commencer" : "Connectez-vous pour gérer votre carte"}
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleAuth} className="space-y-5">
          {/* Email */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Adresse Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@email.com"
                required
                className="w-full bg-[#0B0F19] border border-white/10 py-4 pl-12 pr-4 rounded-xl text-sm text-white outline-none focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] transition-all placeholder:text-gray-600"
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-[#0B0F19] border border-white/10 py-4 pl-12 pr-4 rounded-xl text-sm text-white outline-none focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] transition-all placeholder:text-gray-600"
              />
            </div>
          </div>

          {/* Bouton de Soumission */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-8 bg-[#F5A623] text-black py-4 rounded-xl font-black text-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-[#F5A623]/20 hover:bg-[#E09612]"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24}/>
            ) : (
              <>
                {isSignUp ? "Créer mon compte" : "Se connecter"} <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        {/* Toggle Login / Register */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            {isSignUp ? "Vous avez déjà un compte ?" : "Vous n'avez pas de compte ?"}
            <button 
              type="button" 
              onClick={() => setIsSignUp(!isSignUp)}
              className="ml-2 text-[#F5A623] font-bold hover:underline"
            >
              {isSignUp ? "Se connecter" : "S'inscrire"}
            </button>
          </p>
        </div>

      </div>
    </div>
  )
}