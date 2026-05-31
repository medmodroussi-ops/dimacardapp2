'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  Users, CreditCard, Activity, ShieldAlert, Search, 
  Trash2, Eye, Lock, Unlock, Loader2, LogOut, Settings, 
  Edit, X, Save 
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

export default function AdminDashboard() {
  const supabase = createClient()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [profiles, setProfiles] = useState<any[]>([])
  const [search, setSearch] = useState('')
  
  // States dyal les Modals (Edition & Limites)
  const [editingProfile, setEditingProfile] = useState<any>(null)
  const [savingUpdate, setSavingUpdate] = useState(false)
  const [limitModal, setLimitModal] = useState<any>(null)
  const [savingLimit, setSavingLimit] = useState(false)

  // Statistiques Globales
  const totalCards = profiles.length
  const totalViews = profiles.reduce((acc, curr) => acc + (curr.scan_count || 0), 0)
  const activeCards = profiles.filter(p => p.status !== 'suspendu').length
  const suspendedCards = profiles.filter(p => p.status === 'suspendu').length

  useEffect(() => {
    checkAdminAndFetchData()
  }, [])



  async function checkAdminAndFetchData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      // 1. التحقق من أن اليوزر هو "admin"
      // كنفترضو عندك جدول سميتو 'profiles' فيه كولون 'role'
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError || profile?.role !== 'admin') {
        toast.error("Accès non autorisé !")
        router.push('/dashboard') // صيفطو للداشبورد العادي إلا ما كانش أدمن
        return
      }

      // 2. إلا كان أدمن، كمل تحميل البيانات
      await fetchGlobalData()
    } catch (error) {
      router.push('/dashboard')
    }
  }
  // 1. CHARGEMENT DE TOUTES LES CARTES
  async function fetchGlobalData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        

      if (error) throw error
      setProfiles(data || [])
    } catch (error: any) {
      toast.error("Erreur de chargement: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  // 2. BLOQUER / DÉBLOQUER UNE CARTE
  async function toggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'suspendu' ? 'actif' : 'suspendu'
    const loadingToast = toast.loading("Mise à jour...")
    
    const { error } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) {
      toast.error("Erreur !", { id: loadingToast })
    } else {
      toast.success(`Carte ${newStatus === 'suspendu' ? 'suspendue' : 'activée'} !`, { id: loadingToast })
      setProfiles(profiles.map(p => p.id === id ? { ...p, status: newStatus } : p))
    }
  }

  // 3. SUPPRIMER UNE CARTE DÉFINITIVEMENT
  async function deleteCard(id: string, name: string) {
    if (!window.confirm(`Wach m2aked bghiti tmsa7 l'carte "${name}" b-sifa niha2iya?`)) return
    
    const loadingToast = toast.loading("Suppression en cours...")
    const { error } = await supabase.from('profiles').delete().eq('id', id)
    
    if (error) {
      toast.error(`Erreur: ${error.message}`, { id: loadingToast })
    } else {
      toast.success("Carte supprimée avec succès !", { id: loadingToast })
      setProfiles(profiles.filter(p => p.id !== id))
    }
  }

  // 4. SAUVEGARDER LES MODIFICATIONS D'UN PROFIL (Édition)
  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingProfile) return
    
    setSavingUpdate(true)
    const loadingToast = toast.loading("Enregistrement...")

    try {
      const { id, owner_id, created_at, scan_count, ...updateData } = editingProfile
      
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', editingProfile.id)

      if (error) throw error

      setProfiles(profiles.map(p => p.id === editingProfile.id ? editingProfile : p))
      toast.success("Profil mis à jour !", { id: loadingToast })
      setEditingProfile(null)
    } catch (error: any) {
      toast.error(`Erreur : ${error.message}`, { id: loadingToast })
    } finally {
      setSavingUpdate(false)
    }
  }

  // 5. OUVRIR LE MODAL DE LIMITE
  async function openLimitModal(owner_id: string, user_name: string) {
    const loadingToast = toast.loading("Chargement des limites...")
    const { data, error } = await supabase.from('user_limits').select('max_profiles').eq('owner_id', owner_id).single()
    toast.dismiss(loadingToast)
    
    setLimitModal({
      owner_id,
      max_profiles: data ? data.max_profiles : 1, // Par défaut 1 si non défini
      user_name
    })
  }

  // 6. SAUVEGARDER LA LIMITE D'UN CLIENT
  async function saveLimit(e: React.FormEvent) {
    e.preventDefault()
    if (!limitModal) return
    setSavingLimit(true)
    const loadingToast = toast.loading("Enregistrement...")
    
    const { error } = await supabase.from('user_limits').upsert({
      owner_id: limitModal.owner_id,
      max_profiles: limitModal.max_profiles
    })
    
    if (error) {
      toast.error(`Erreur: ${error.message}`, { id: loadingToast })
    } else {
      toast.success(`Limite de ${limitModal.user_name} mise à jour !`, { id: loadingToast })
      setLimitModal(null)
    }
    setSavingLimit(false)
  }

  // 7. FILTRE DE RECHERCHE
  const filteredProfiles = profiles.filter(p => 
    (p.full_name?.toLowerCase() || '').includes(search.toLowerCase()) || 
    (p.owner_id || '').includes(search)
  )

  if (loading) return <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#F9FAFB] font-sans">
      <Toaster position="top-right" />

      {/* Navbar Admin */}
      <nav className="bg-[#111827] border-b border-indigo-500/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-500">
              <ShieldAlert size={24} />
            </div>
            <span className="font-black text-2xl text-white">DimaCard <span className="text-indigo-500">Admin</span></span>
          </div>
          <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="text-gray-400 hover:text-white flex items-center gap-2">
            <LogOut size={18}/> Déconnexion
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10 relative">
        
        {/* Section: Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <StatCard icon={<CreditCard/>} label="Total Cartes" value={totalCards} color="text-blue-500" bg="bg-blue-500/10" />
          <StatCard icon={<Activity/>} label="Total Vues (Scans)" value={totalViews} color="text-indigo-500" bg="bg-indigo-500/10" />
          <StatCard icon={<Unlock/>} label="Cartes Actives" value={activeCards} color="text-emerald-500" bg="bg-emerald-500/10" />
          <StatCard icon={<Lock/>} label="Cartes Suspendues" value={suspendedCards} color="text-red-500" bg="bg-red-500/10" />
        </div>

        {/* Section: Liste des Cartes */}
        <div className="bg-[#111827] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
          <div className="p-6 md:p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-black flex items-center gap-2"><Users size={20} className="text-indigo-500"/> Gestion des Profils</h2>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18}/>
              <input 
                type="text" 
                placeholder="Rechercher par nom ou Owner ID..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#0B0F19] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#0B0F19]/50 text-[10px] uppercase tracking-widest text-gray-500">
                  <th className="p-4 pl-8 font-bold">Profil</th>
                  <th className="p-4 font-bold">Vues</th>
                  <th className="p-4 font-bold">Owner ID</th>
                  <th className="p-4 font-bold">Statut</th>
                  <th className="p-4 pr-8 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProfiles.length > 0 ? filteredProfiles.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 pl-8">
                      <p className="font-bold text-sm text-white">{p.full_name || 'Sans Nom'}</p>
                      <p className="text-xs text-gray-500">{p.job_title || 'Pas de poste'}</p>
                    </td>
                    <td className="p-4">
                      <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold">{p.scan_count || 0}</span>
                    </td>
                    <td className="p-4">
                      <code className="text-[10px] text-gray-500 bg-[#0B0F19] px-2 py-1 rounded border border-white/5">{p.owner_id?.slice(0,8)}...</code>
                    </td>
                    <td className="p-4">
                      {p.status === 'suspendu' 
                        ? <span className="text-red-500 text-xs font-bold flex items-center gap-1"><Lock size={12}/> Suspendu</span>
                        : <span className="text-emerald-500 text-xs font-bold flex items-center gap-1"><Check size={12}/> Actif</span>
                      }
                    </td>
                    <td className="p-4 pr-8 text-right flex justify-end gap-2">
                      <a href={`/p/${p.id}`} target="_blank" rel="noreferrer" className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-all" title="Voir la carte">
                        <Eye size={16}/>
                      </a>
                      
                      <button onClick={() => setEditingProfile(p)} className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg hover:bg-yellow-500/20 transition-all" title="Modifier le profil">
                        <Edit size={16}/>
                      </button>

                      <button onClick={() => openLimitModal(p.owner_id, p.full_name)} className="p-2 bg-purple-500/10 text-purple-500 rounded-lg hover:bg-purple-500/20 transition-all" title="Gérer le forfait (limites)">
                        <Settings size={16}/>
                      </button>

                      <button onClick={() => toggleStatus(p.id, p.status)} className={`p-2 rounded-lg transition-all ${p.status === 'suspendu' ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20'}`} title={p.status === 'suspendu' ? 'Réactiver' : 'Suspendre'}>
                        {p.status === 'suspendu' ? <Unlock size={16}/> : <Lock size={16}/>}
                      </button>

                      <button onClick={() => deleteCard(p.id, p.full_name)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all" title="Supprimer">
                        <Trash2 size={16}/>
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="p-10 text-center text-gray-500">Aucune carte trouvée.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* 🚀 MODAL DE MODIFICATION RAPIDE */}
      {editingProfile && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#111827] p-8 rounded-[2rem] w-full max-w-lg border border-white/10 relative my-8">
            <button onClick={() => setEditingProfile(null)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"><X size={24}/></button>
            <h2 className="text-2xl font-black mb-6 text-white flex items-center gap-2"><Edit size={24} className="text-yellow-500"/> Modifier la carte</h2>
            
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Nom complet</label>
                  <input type="text" value={editingProfile.full_name || ''} onChange={e => setEditingProfile({...editingProfile, full_name: e.target.value})} className="w-full bg-[#0B0F19] border border-white/10 p-3 rounded-xl text-sm text-white outline-none focus:border-yellow-500 mt-1" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Poste actuel</label>
                  <input type="text" value={editingProfile.job_title || ''} onChange={e => setEditingProfile({...editingProfile, job_title: e.target.value})} className="w-full bg-[#0B0F19] border border-white/10 p-3 rounded-xl text-sm text-white outline-none focus:border-yellow-500 mt-1" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Entreprise</label>
                  <input type="text" value={editingProfile.company || ''} onChange={e => setEditingProfile({...editingProfile, company: e.target.value})} className="w-full bg-[#0B0F19] border border-white/10 p-3 rounded-xl text-sm text-white outline-none focus:border-yellow-500 mt-1" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Téléphone</label>
                  <input type="text" value={editingProfile.phone || ''} onChange={e => setEditingProfile({...editingProfile, phone: e.target.value})} className="w-full bg-[#0B0F19] border border-white/10 p-3 rounded-xl text-sm text-white outline-none focus:border-yellow-500 mt-1" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Couleur (Hex)</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="color" value={editingProfile.theme_color || '#F5A623'} onChange={e => setEditingProfile({...editingProfile, theme_color: e.target.value})} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0" />
                    <input type="text" value={editingProfile.theme_color || ''} onChange={e => setEditingProfile({...editingProfile, theme_color: e.target.value})} className="flex-1 bg-[#0B0F19] border border-white/10 p-3 rounded-xl text-sm text-white outline-none focus:border-yellow-500 uppercase font-mono" />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={savingUpdate} className="w-full mt-6 bg-yellow-500 text-black py-4 rounded-xl font-black text-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20 hover:bg-yellow-400">
                {savingUpdate ? <Loader2 className="animate-spin" size={24}/> : <Save size={24}/>} Enregistrer les modifications
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 🚀 MODAL DE LIMITE DE PROFILS */}
      {limitModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] p-8 rounded-[2rem] w-full max-w-sm border border-purple-500/30 relative">
            <button onClick={() => setLimitModal(null)} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X size={24}/></button>
            <h2 className="text-xl font-black mb-2 text-white">Forfait & Limite</h2>
            <p className="text-sm text-gray-400 mb-6">Client: <strong className="text-white">{limitModal.user_name}</strong></p>
            
            <form onSubmit={saveLimit}>
              <label className="text-[10px] font-bold uppercase text-purple-400 ml-1">Nombre maximum de cartes autorisées</label>
              <input 
                type="number" min="1" max="100"
                value={limitModal.max_profiles} 
                onChange={e => setLimitModal({...limitModal, max_profiles: parseInt(e.target.value)})} 
                className="w-full bg-[#0B0F19] border border-white/10 p-4 rounded-xl text-lg text-white outline-none focus:border-purple-500 mt-2 font-black text-center" 
              />
              <button type="submit" disabled={savingLimit} className="w-full mt-6 bg-purple-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-purple-600 transition-all">
                {savingLimit ? <Loader2 className="animate-spin" size={20}/> : "Confirmer la limite"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// COMPOSANTS RÉUTILISABLES
function StatCard({ icon, label, value, color, bg }: any) {
  return (
    <div className="bg-[#111827] p-6 rounded-[2rem] border border-white/5 flex items-center gap-4">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bg} ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-3xl font-black text-white">{value}</p>
      </div>
    </div>
  )
}

function Check(props: any) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="20 6 9 17 4 12"></polyline></svg>
}