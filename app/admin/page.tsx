'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  Users, Search, Trash2, Edit, ShieldCheck, 
  X, Save, Activity, Ban, CheckCircle, Plus, QrCode, Download, 
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

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 text-slate-900 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-3"><ShieldCheck className="text-blue-600" size={32} /> Admin Panel</h1>
            <p className="text-slate-500 font-medium">{profiles.length} comptes au total</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Rechercher..." className="pl-10 pr-4 py-3 bg-white border rounded-xl outline-none w-full sm:w-64 shadow-sm" onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <button onClick={() => { setEditingProfile(initialProfileState); setIsCreating(true); }} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
              <Plus size={20} /> Nouveau
            </button>
          </div>
        </div>

        {/* LISTE DES PROFILS */}
        <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Utilisateur</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Expiration</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Statut</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredProfiles.map((p) => {
                const expired = isExpired(p.expiration_date);
                return (
                  <tr key={p.id} className={`hover:bg-slate-50/50 transition-colors ${p.status === 'suspendu' || expired ? 'bg-red-50/20' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border">
                          {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover rounded-xl" /> : <Users size={18} className="text-slate-300" />}
                        </div>
                        <div>
                          <div className="font-bold text-slate-700 leading-none mb-1">
                            {p.full_name || 'Sans nom'}
                          </div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{p.company || 'Aucune entreprise'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {p.expiration_date ? (
                        <div className="flex flex-col">
                           <span className={`text-[11px] font-bold ${expired ? 'text-red-600' : 'text-slate-600'}`}>
                            {new Date(p.expiration_date).toLocaleDateString()}
                          </span>
                          {expired && <span className="text-[8px] font-black text-red-500 flex items-center gap-1 uppercase"><AlertCircle size={10}/> Expiré</span>}
                        </div>
                      ) : <span className="text-slate-300 text-[10px]">Illimité</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${p.status === 'suspendu' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                          {p.status || 'actif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setQrProfile(p)} className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"><QrCode size={18}/></button>
                        <button onClick={() => toggleSuspendProfile(p.id, p.status)} className={`p-2.5 rounded-xl transition-all ${p.status === 'suspendu' ? 'text-emerald-500 hover:bg-emerald-50' : 'text-amber-500 hover:bg-amber-50'}`}>
                          {p.status === 'suspendu' ? <CheckCircle size={18}/> : <Ban size={18}/>}
                        </button>
                        <button onClick={() => { setEditingProfile(p); setIsCreating(false); }} className="p-2.5 hover:bg-blue-50 rounded-xl text-blue-600 transition-colors"><Edit size={18}/></button>
                        <button onClick={() => deleteProfile(p.id)} className="p-2.5 hover:bg-red-50 rounded-xl text-red-500 transition-colors"><Trash2 size={18}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL ÉDITION GÉNÉRALE */}
      {editingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl my-auto">
            <div className="p-8 border-b flex justify-between items-center bg-slate-50 rounded-t-[2.5rem]">
              <h2 className="text-xl font-black flex items-center gap-2"><Share2 className="text-blue-600"/> {isCreating ? 'Nouveau Profil' : 'Édition Complète'}</h2>
              <button onClick={() => setEditingProfile(null)} className="text-slate-400 hover:text-slate-900 bg-white p-2 rounded-full shadow-sm"><X size={24}/></button>
            </div>
            
            <form onSubmit={saveProfile} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* COLONNE 1 : IDENTITÉ & EXPIRATION */}
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2"><Users size={14}/> Identité & Validité</p>
                    <AdminInput label="Nom Complet" name="full_name" value={editingProfile.full_name} onChange={handleInputChange} required />
                    <AdminInput label="Email" name="email_contact" value={editingProfile.email_contact} onChange={handleInputChange} required />
                    <AdminInput label="Poste / Job" name="job_title" value={editingProfile.job_title} onChange={handleInputChange} />
                    <AdminInput label="Entreprise" name="company" value={editingProfile.company} onChange={handleInputChange} />
                    
                    {/* CHAMP DATE D'EXPIRATION */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-black text-red-500 uppercase tracking-widest ml-1 flex items-center gap-1"><Calendar size={10}/> Date d'expiration</label>
                      <input type="date" name="expiration_date" value={editingProfile.expiration_date || ''} onChange={handleInputChange} className="w-full p-3 bg-red-50/50 border border-red-100 rounded-xl font-bold text-xs text-slate-700 outline-none focus:border-red-500 transition-all shadow-sm" />
                    </div>
                </div>

                {/* COLONNE 2 : TÉLÉPHONES */}
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2"><LinkIcon size={14}/> Téléphones</p>
                    <AdminInput label="Téléphone Principal" name="phone" value={editingProfile.phone} onChange={handleInputChange} />
                    <AdminInput label="Téléphone 2" name="phone_2" value={editingProfile.phone_2} onChange={handleInputChange} />
                    <AdminInput label="Téléphone 3" name="phone_3" value={editingProfile.phone_3} onChange={handleInputChange} />
                    <AdminInput label="WhatsApp" name="whatsapp" value={editingProfile.whatsapp} onChange={handleInputChange} />
                </div>

                {/* COLONNE 3 : RÉSEAUX SOCIAUX */}
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-pink-600 uppercase tracking-widest flex items-center gap-2"><Share2 size={14}/> Réseaux Sociaux</p>
                    <AdminInput label="LinkedIn" name="linkedin_url" value={editingProfile.linkedin_url} onChange={handleInputChange} />
                    <AdminInput label="Instagram" name="instagram_url" value={editingProfile.instagram_url} onChange={handleInputChange} />
                    <AdminInput label="TikTok" name="tiktok_url" value={editingProfile.tiktok_url} onChange={handleInputChange} />
                    <AdminInput label="YouTube" name="youtube_url" value={editingProfile.youtube_url} onChange={handleInputChange} />
                    <AdminInput label="Site Web" name="website_url" value={editingProfile.website_url} onChange={handleInputChange} />
                </div>

              </div>

              <div className="mt-10 pt-6 border-t flex justify-end items-center gap-6">
                <div className="flex items-center gap-2 mr-auto">
                    <span className="text-[10px] font-black uppercase text-slate-400 font-black">Statut :</span>
                    <select name="status" value={editingProfile.status} onChange={handleInputChange} className="bg-slate-100 border-none rounded-lg font-bold text-xs p-2 outline-none">
                        <option value="actif">Actif</option>
                        <option value="suspendu">Suspendu</option>
                    </select>
                </div>
                <button type="button" onClick={() => setEditingProfile(null)} className="font-bold text-slate-400 hover:text-slate-600">Annuler</button>
                <button type="submit" disabled={isSaving} className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl flex items-center gap-2 hover:bg-black transition-all active:scale-95">
                   {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL QR CODE */}
      {qrProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 text-center relative shadow-2xl">
            <button onClick={() => setQrProfile(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900"><X size={24}/></button>
            <h2 className="text-xl font-black mb-1">QR Code</h2>
            <p className="text-xs text-slate-400 mb-8 truncate font-black uppercase tracking-widest">{qrProfile.full_name}</p>
            <div className="bg-slate-50 p-6 rounded-[2rem] border inline-block mb-8 shadow-inner">
              <QRCodeCanvas id="qr-canvas" value={`${window.location.origin}/p/${qrProfile.id}`} size={200} level="H" includeMargin={true} />
            </div>
            <button onClick={() => {
                const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
                const link = document.createElement('a');
                link.href = canvas.toDataURL();
                link.download = `QR_${qrProfile.full_name}.png`;
                link.click();
            }} className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg"><Download size={20}/> Télécharger</button>
          </div>
        </div>
      )}
    </div>
  )
}

function AdminInput({ label, ...props }: any) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <input {...props} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" />
    </div>
  )
}