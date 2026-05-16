'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  Users, Search, Trash2, Edit, ShieldCheck, 
  X, Save, Ban, CheckCircle, Plus, QrCode, Download, 
  Share2, Link as LinkIcon, Loader2, Calendar, AlertCircle
} from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'

export default function AdminDashboard() {
  const supabase = createClient()
  const router = useRouter()
  
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isMounted, setIsMounted] = useState(false)
  
  const [editingProfile, setEditingProfile] = useState<any>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [qrProfile, setQrProfile] = useState<any>(null)

  const initialProfileState = {
    full_name: '', job_title: '', company: '', email_contact: '',
    phone: '', phone_2: '', phone_3: '', whatsapp: '',
    linkedin_url: '', instagram_url: '', facebook_url: '',
    twitter_url: '', tiktok_url: '', youtube_url: '',
    snapchat_url: '', website_url: '', expiration_date: '', status: 'actif'
  }

  useEffect(() => {
    checkAdminAccess()
  }, [])

  async function checkAdminAccess() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      
      const adminEmails = ['test@test.com'] // <--- TON EMAIL ICI
      if (!user.email || !adminEmails.includes(user.email)) {
        router.push('/dashboard'); return
      }
      setIsMounted(true)
      fetchProfiles()
    } catch (error) { router.push('/login') }
  }

  async function fetchProfiles() {
    try {
      const { data, error } = await supabase.from('profiles').select('*')
      if (!error && data) setProfiles(data)
    } finally { setLoading(false) }
  }

  const deleteProfile = async (id: string) => {
    if (confirm("Supprimer définitivement ce profil ?")) {
      await supabase.from('profiles').delete().eq('id', id)
      fetchProfiles()
    }
  }

  const toggleSuspendProfile = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'suspendu' ? 'actif' : 'suspendu';
    if (confirm(`Changer le statut en ${newStatus} ?`)) {
      await supabase.from('profiles').update({ status: newStatus }).eq('id', id);
      fetchProfiles();
    }
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      if (isCreating) {
        const cleanEmail = editingProfile.email_contact.trim()
        const temporaryPassword = crypto.randomUUID().slice(0, 8) + "-Aa1!"
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: cleanEmail, password: temporaryPassword,
        })
        if (authError) throw authError
        await supabase.from('profiles').upsert([{ id: authData.user?.id, ...editingProfile }])
        alert(`Succès !\nEmail: ${cleanEmail}\nPass: ${temporaryPassword}`)
      } else {
        await supabase.from('profiles').update(editingProfile).eq('id', editingProfile.id)
      }
      setEditingProfile(null)
      fetchProfiles()
    } catch (err: any) { alert(err.message) } finally { setIsSaving(false) }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setEditingProfile((prev: any) => ({ ...prev, [name]: value }))
  }

  const isExpired = (date: string) => {
    if (!date) return false;
    return new Date(date) < new Date();
  }

  if (!isMounted) return null

  const filteredProfiles = profiles.filter(p => 
    (p.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (p.email_contact?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0F19]">
      <div className="relative">
        <div className="absolute inset-0 bg-[#F5A623]/20 rounded-full blur-xl animate-pulse"></div>
        <img 
          src="dimacardlogo.jpeg" 
          alt="Loading DimaCard" 
          className="w-24 h-24 object-contain relative z-10 animate-bounce" 
          style={{ animationDuration: '2s' }}
        />
      </div>
      
      <div className="mt-8 w-48 h-1 bg-[#1F2937] rounded-full overflow-hidden">
        <div className="h-full bg-[#F5A623] rounded-full animate-infinite-loading"></div>
      </div>
      
      <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-[#9CA3AF]">
        DimaCard
      </p>
  
      <style jsx>{`
        @keyframes infinite-loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-infinite-loading {
          width: 100%;
          animation: infinite-loading 1.5s infinite linear;
        }
      `}</style>
    </div>
  )



  return (
    <div className="min-h-screen bg-[#0B0F19] p-4 md:p-10 text-[#F9FAFB] font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* NAV BAR AVEC LOGO */}
        <nav className="bg-[#111827] rounded-3xl p-6 shadow-lg border border-white/5 flex items-center justify-between mb-10 gap-4 flex-wrap relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F5A623]/5 blur-[80px] rounded-full pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <h1 className="text-3xl font-black flex items-center gap-3 shrink-0" style={{ fontFamily: 'var(--font-display)' }}><ShieldCheck className="text-[#F5A623]" size={32} /> Admin</h1>
            <p className="text-[#9CA3AF] font-medium whitespace-nowrap hidden sm:block">| {profiles.length} comptes</p>
          </div>
          
          {/* --- TON LOGO ICI --- */}
          <div className="order-first sm:order-none mx-auto sm:mx-0 shrink-0 relative z-10">
            <img 
              src="dimacardlogo.jpeg" // <--- REMPLACE PAR LE CHEMIN VERS TON IMAGE DE LOGO
              alt="DimaCard Logo" 
              className="h-16 w-auto object-contain" 
            />
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto relative z-10">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={18} />
              <input type="text" placeholder="Rechercher..." className="pl-10 pr-4 py-3 bg-[#1F2937] border border-white/10 rounded-xl outline-none w-full sm:w-64 shadow-sm text-white focus:border-[#F5A623] transition-colors" onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <button onClick={() => { setEditingProfile(initialProfileState); setIsCreating(true); }} className="px-6 py-3 bg-[#F5A623] text-[#0B0F19] font-bold rounded-xl flex items-center gap-2 hover:bg-[#FDE047] transition-all shadow-lg shadow-[#F5A623]/20 shrink-0">
              <Plus size={20} /> Nouveau
            </button>
          </div>
        </nav>

        {/* LISTE DES PROFILS */}
        <div className="bg-[#111827] rounded-[2.5rem] border border-white/5 shadow-xl overflow-hidden relative">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-[#1F2937] border-b border-white/5">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-[#9CA3AF] tracking-wider">Utilisateur</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-[#9CA3AF] tracking-wider">Expiration</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-[#9CA3AF] tracking-wider">Statut</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-[#9CA3AF] text-right tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProfiles.map((p) => {
                const expired = isExpired(p.expiration_date);
                return (
                  <tr key={p.id} className={`hover:bg-[#1F2937]/50 transition-colors ${p.status === 'suspendu' || expired ? 'bg-red-900/10' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#1F2937] flex items-center justify-center shrink-0 border border-white/10 shadow-inner">
                          {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover rounded-xl" /> : <Users size={18} className="text-[#9CA3AF]" />}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-white leading-none mb-1 truncate">
                            {p.full_name || 'Sans nom'}
                          </span>
                          <span className="text-[10px] text-[#F5A623] font-bold uppercase tracking-tight truncate">{p.company || 'Aucune entreprise'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {p.expiration_date ? (
                        <div className="flex flex-col">
                           <span className={`text-[11px] font-bold ${expired ? 'text-red-400' : 'text-[#9CA3AF]'}`}>
                            {new Date(p.expiration_date).toLocaleDateString()}
                          </span>
                          {expired && <span className="text-[8px] font-black text-red-500 flex items-center gap-1 uppercase leading-none mt-1"><AlertCircle size={10}/> Expiré</span>}
                        </div>
                      ) : <span className="text-[#9CA3AF] text-[10px]">Illimité</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${p.status === 'suspendu' ? 'bg-red-900/30 text-red-400 border border-red-500/20' : 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/20'}`}>
                          {p.status || 'actif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setQrProfile(p)} className="p-2.5 hover:bg-[#1F2937] rounded-xl text-[#9CA3AF] hover:text-white transition-colors" title="QR Code"><QrCode size={18}/></button>
                        <button onClick={() => toggleSuspendProfile(p.id, p.status)} className={`p-2.5 rounded-xl transition-all ${p.status === 'suspendu' ? 'text-emerald-400 hover:bg-emerald-900/30' : 'text-[#F5A623] hover:bg-[#F5A623]/10'}`} title={p.status === 'suspendu' ? "Réactiver" : "Suspendre"}>
                          {p.status === 'suspendu' ? <CheckCircle size={18}/> : <Ban size={18}/>}
                        </button>
                        <button onClick={() => { setEditingProfile(p); setIsCreating(false); }} className="p-2.5 hover:bg-[#8B5CF6]/10 rounded-xl text-[#8B5CF6] transition-colors" title="Éditer"><Edit size={18}/></button>
                        <button onClick={() => deleteProfile(p.id)} className="p-2.5 hover:bg-red-900/20 rounded-xl text-red-400 transition-colors" title="Supprimer"><Trash2 size={18}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL QR CODE */}
      {qrProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0F19]/80 backdrop-blur-sm">
          <div className="bg-[#111827] border border-white/10 p-8 rounded-[2.5rem] max-w-sm w-full text-center relative shadow-2xl animate-in zoom-in duration-200">
            <button onClick={() => setQrProfile(null)} className="absolute top-6 right-6 text-[#9CA3AF] hover:text-white transition-colors"><X size={24}/></button>
            <h2 className="text-xl font-black mb-1 text-white">QR Code</h2>
            <p className="text-xs text-[#F5A623] mb-8 truncate uppercase font-bold tracking-widest px-4">{qrProfile.full_name}</p>
            <div className="bg-white p-4 rounded-[2rem] border-4 border-[#1F2937] inline-block mb-8 shadow-inner">
              <QRCodeCanvas id="qr-canvas" value={`${window.location.origin}/p/${qrProfile.id}`} size={200} level="H" includeMargin={true} />
            </div>
            <button onClick={() => {
                const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
                const link = document.createElement('a');
                link.href = canvas.toDataURL();
                link.download = `QR_${qrProfile.full_name}.png`;
                link.click();
            }} className="w-full py-4 bg-[#F5A623] text-[#0B0F19] font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-[#FDE047] transition-all shadow-lg shadow-[#F5A623]/20 active:scale-95"><Download size={20}/> Télécharger</button>
          </div>
        </div>
      )}

      {/* MODAL ÉDITION GÉNÉRALE */}
      {editingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0F19]/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#111827] border border-white/10 rounded-[2.5rem] w-full max-w-4xl shadow-2xl my-auto animate-in zoom-in duration-200">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#1F2937] rounded-t-[2.5rem]">
              <h2 className="text-xl font-black flex items-center gap-2 text-white"><Share2 className="text-[#F5A623]"/> {isCreating ? 'Nouveau Profil' : 'Gestion Complète'}</h2>
              <button onClick={() => setEditingProfile(null)} className="text-[#9CA3AF] hover:text-white bg-[#0B0F19] p-2 rounded-full shadow-sm border border-white/5"><X size={24}/></button>
            </div>
            
            <form onSubmit={saveProfile} className="p-8 pb-12 relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#8B5CF6]/5 blur-[100px] rounded-full pointer-events-none" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 relative z-10">
                
                {/* COLONNE 1 : IDENTITÉ & EXPIRATION */}
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-[#F5A623] uppercase tracking-widest flex items-center gap-2 mb-3"><Users size={14}/> Identité & Validité</p>
                    <AdminInput label="Nom Complet" name="full_name" value={editingProfile.full_name} onChange={handleInputChange} required />
                    <AdminInput label="Email" name="email_contact" value={editingProfile.email_contact} onChange={handleInputChange} required />
                    <AdminInput label="Poste / Job" name="job_title" value={editingProfile.job_title} onChange={handleInputChange} />
                    <AdminInput label="Entreprise" name="company" value={editingProfile.company} onChange={handleInputChange} />
                    
                    {/* CHAMP DATE D'EXPIRATION */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-black text-red-400 uppercase tracking-widest ml-1 flex items-center gap-1"><Calendar size={10}/> Date d'expiration</label>
                      <input type="date" name="expiration_date" value={editingProfile.expiration_date || ''} onChange={handleInputChange} className="w-full p-3 bg-red-900/10 border border-red-500/20 rounded-xl font-bold text-xs text-red-200 outline-none focus:border-red-400 transition-all shadow-sm" style={{ colorScheme: 'dark' }} />
                    </div>
                </div>

                {/* COLONNE 2 : TÉLÉPHONES */}
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-[#8B5CF6] uppercase tracking-widest flex items-center gap-2 mb-3"><LinkIcon size={14}/> Téléphones</p>
                    <AdminInput label="Téléphone Principal" name="phone" value={editingProfile.phone} onChange={handleInputChange} />
                    <AdminInput label="Téléphone 2" name="phone_2" value={editingProfile.phone_2} onChange={handleInputChange} />
                    <AdminInput label="Téléphone 3" name="phone_3" value={editingProfile.phone_3} onChange={handleInputChange} />
                    <AdminInput label="WhatsApp" name="whatsapp" value={editingProfile.whatsapp} onChange={handleInputChange} />
                </div>

                {/* COLONNE 3 : RÉSEAUX SOCIAUX */}
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-[#06B6D4] uppercase tracking-widest flex items-center gap-2 mb-3"><Share2 size={14}/> Réseaux Sociaux</p>
                    <AdminInput label="LinkedIn" name="linkedin_url" value={editingProfile.linkedin_url} onChange={handleInputChange} />
                    <AdminInput label="Instagram" name="instagram_url" value={editingProfile.instagram_url} onChange={handleInputChange} />
                    <AdminInput label="TikTok" name="tiktok_url" value={editingProfile.tiktok_url} onChange={handleInputChange} />
                    <AdminInput label="YouTube" name="youtube_url" value={editingProfile.youtube_url} onChange={handleInputChange} />
                    <AdminInput label="Site Web" name="website_url" value={editingProfile.website_url} onChange={handleInputChange} />
                </div>

              </div>

              <div className="fixed bottom-0 left-0 right-0 md:relative bg-[#1F2937]/90 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none p-6 md:p-0 md:mt-10 md:pt-6 md:border-t flex justify-between items-center gap-6 z-20 border-t border-white/5 md:border-white/10 rounded-t-3xl md:rounded-none">
                <div className="flex items-center gap-2 mr-auto shrink-0">
                    <span className="text-[10px] font-black uppercase text-[#9CA3AF] font-black">Statut :</span>
                    <select name="status" value={editingProfile.status} onChange={handleInputChange} className="bg-[#0B0F19] border border-white/10 text-white rounded-lg font-bold text-xs p-2 outline-none focus:border-[#F5A623]">
                        <option value="actif">Actif</option>
                        <option value="suspendu">Suspendu</option>
                    </select>
                </div>
                <button type="button" onClick={() => setEditingProfile(null)} className="font-bold text-[#9CA3AF] hover:text-white shrink-0 transition-colors">Annuler</button>
                <button type="submit" disabled={isSaving} className="px-10 py-4 bg-[#F5A623] text-[#0B0F19] font-black rounded-2xl shadow-lg shadow-[#F5A623]/20 flex items-center gap-2 hover:bg-[#FDE047] transition-all active:scale-95 shrink-0 disabled:opacity-50">
                   {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function AdminInput({ label, ...props }: any) {
  return (
    <div className="flex flex-col gap-1 w-full text-left">
      <label className="text-[9px] font-black text-[#9CA3AF] uppercase tracking-widest ml-1">{label}</label>
      <input {...props} className="w-full p-3 bg-[#0B0F19] border border-white/10 rounded-xl font-bold text-xs text-white outline-none focus:border-[#F5A623] transition-all shadow-sm placeholder:text-[#4B5563]" placeholder="..." />
    </div>
  )
}