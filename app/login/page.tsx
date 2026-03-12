'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  // Fonction pour l'inscription (Créer un compte)
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      alert('Inscription réussie ! (Si la confirmation par email est activée sur Supabase, vérifie ta boîte mail).')
      // Redirection optionnelle ou on laisse l'utilisateur se connecter
    }
    setLoading(false)
  }

  // Fonction pour la connexion
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('Email ou mot de passe incorrect.')
    } else {
      // Si succès, on redirige vers le dashboard
      router.push('/dashboard')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Espace Client
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Gérez votre carte de visite digitale
          </p>
        </div>

        <form className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Adresse Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="client@entreprise.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Chargement...' : 'Se connecter'}
            </button>
            
            <button
              onClick={handleSignUp}
              disabled={loading}
              className="w-full bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              Créer un compte
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}