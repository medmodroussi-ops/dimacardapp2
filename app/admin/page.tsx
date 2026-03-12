'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  Users, Search, Trash2, Edit, ShieldCheck, 
  X, Save, Activity, Ban, CheckCircle, Plus, QrCode, Download 
} from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'

export default function AdminDashboard() {
  const supabase = createClient()
  const router = useRouter()
  
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isMounted, setIsMounted] = useState(false)
  
  // États pour le Modal d'Édition
  const [editingProfile, setEditingProfile] = useState<any>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // État pour le Modal du QR Code
  const [qrProfile, setQrProfile] = useState<any>(null)

  const initialProfileState = {
    full_name: '', job_title: '', company: '', email_contact: '',
    phone: '', whatsapp: '', address: '', website_url: '', bio: '', status: 'actif'
  }

  useEffect(() => {
    checkAdminAccess()
  }, [])

  // 🟢 VÉRIFICATION DE LA SÉCURITÉ (AUTHENTIFICATION)
  async function checkAdminAccess() {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // ⚠️ REMPLACEZ L'EMAIL CI-DESSOUS PAR VOTRE VRAI EMAIL ADMINISTRATEUR ⚠️
      const adminEmails = ['test@test.com'] 
      
      if (!user.email || !adminEmails.includes(user.email)) {
        alert("Accès refusé. Vous n'êtes pas administrateur.")
        router.push('/dashboard') 
        return
      }

      setIsMounted(true)
      fetchProfiles()

    } catch (error) {
      console.error("Erreur de vérification", error)
      router.push('/login')
    }
  }

  async function fetchProfiles() {
    try {
      const { data, error } = await supabase.from('profiles').select('*')
      if (!error && data) setProfiles(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const deleteProfile = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce profil définitivement ?")) {
      await supabase.from('profiles').delete().eq('id', id)
      fetchProfiles()
    }
  }

  const toggleSuspendProfile = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'suspendu' ? 'actif' : 'suspendu'
    if (confirm(newStatus === 'suspendu' ? "Suspendre ce profil ?" : "Réactiver ce profil ?")) {
      await supabase.from('profiles').update({ status: newStatus }).eq('id', id)
      fetchProfiles()
    }
  }

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      if (isCreating) {
        if (!editingProfile.email_contact) {
          alert("L'email est obligatoire.")
          setIsSaving(false)
          return
        }
        const cleanEmail = editingProfile.email_contact.trim()
        const temporaryPassword = crypto.randomUUID().slice(0, 8) + "-Aa1!"
        
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: cleanEmail, password: temporaryPassword,
        })

        if (authError || !authData.user) {
          alert(`Erreur création compte: ${authError?.message}`)
          setIsSaving(false)
          return
        }

        const newProfileData = {
          id: authData.user.id, 
          full_name: editingProfile.full_name, job_title: editingProfile.job_title,
          company: editingProfile.company, email_contact: cleanEmail,
          phone: editingProfile.phone, whatsapp: editingProfile.whatsapp,
          address: editingProfile.address, website_url: editingProfile.website_url,
          bio: editingProfile.bio, status: editingProfile.status
        }

        const { error: insertError } = await supabase.from('profiles').upsert([newProfileData])
        if (insertError) throw insertError

        alert(`✅ Profil créé !\nEmail : ${cleanEmail}\nMot de passe : ${temporaryPassword}`)
      } else {
        const profileData = {
          full_name: editingProfile.full_name, job_title: editingProfile.job_title,
          company: editingProfile.company, email_contact: editingProfile.email_contact?.trim(),
          phone: editingProfile.phone, whatsapp: editingProfile.whatsapp,
          address: editingProfile.address, website_url: editingProfile.website_url,
          bio: editingProfile.bio, status: editingProfile.status
        }
        await supabase.from('profiles').update(profileData).eq('id', editingProfile.id)
      }
      closeModal()
      fetchProfiles()
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditingProfile((prev: any) => ({ ...prev, [name]: value }))
  }

  const closeModal = () => {
    setEditingProfile(null)
    setIsCreating(false)
  }

  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream')
      let downloadLink = document.createElement('a')
      downloadLink.href = pngUrl
      downloadLink.download = `QRCode_${qrProfile.full_name || 'profil'}.png`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    }
  }

  const getStatusBadge = (status: string) => {
    const s = (status || 'actif').toLowerCase()
    if (s === 'actif') return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-[10px] font-black uppercase">Actif</span>
    if (s === 'suspendu') return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-[10px] font-black uppercase">Suspendu</span>
    return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-[10px] font-black uppercase">Prospect</span>
  }

  if (!isMounted) return null

  const filteredProfiles = profiles.filter(p => 
    (p.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (p.email_contact?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-3"><ShieldCheck className="text-blue-600" size={32} /> Admin Panel</h1>
            <p className="text-slate-500 font-medium mt-1">Gestion des {profiles.length} utilisateurs</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Rechercher..." className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl w-full outline-none shadow-sm" onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <button onClick={() => { setEditingProfile(initialProfileState); setIsCreating(true); }} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-md">
              <Plus size={20} /> Nouveau Profil
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase">Utilisateur</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase">Statut</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase">Contact</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProfiles.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                        {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" /> : <Users size={20} className="text-slate-300" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700">{p.full_name || 'Sans nom'}</span>
                        <span className="text-xs text-slate-500">{p.company || '-'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(p.status)}</td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-bold text-slate-600">{p.email_contact || '-'}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{p.phone || '-'}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setQrProfile(p)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Afficher le QR Code">
                        <QrCode size={18} />
                      </button>
                      <button onClick={() => toggleSuspendProfile(p.id, p.status)} className={`p-2 rounded-lg transition-all ${p.status === 'suspendu' ? 'text-emerald-500 hover:bg-emerald-50' : 'text-amber-500 hover:bg-amber-50'}`} title="Suspendre/Réactiver">
                        {p.status === 'suspendu' ? <CheckCircle size={18} /> : <Ban size={18} />}
                      </button>
                      <button onClick={() => { setEditingProfile(p); setIsCreating(false); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Éditer">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => deleteProfile(p.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Supprimer">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL QR CODE */}
      {qrProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl overflow-hidden p-8 text-center relative">
            <button onClick={() => setQrProfile(null)} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-all">
              <X size={20} />
            </button>
            <h2 className="text-xl font-black text-slate-900 mb-1">QR Code</h2>
            <p className="text-sm text-slate-500 mb-8">{qrProfile.full_name}</p>

            <div className="flex justify-center bg-slate-50 p-6 rounded-3xl border border-slate-100 inline-block mx-auto mb-8">
              <QRCodeCanvas 
                id="qr-canvas"
                value={`${window.location.origin}/p/${qrProfile.id}`} 
                size={200} bgColor={"#ffffff"} fgColor={"#0f172a"} level={"H"} includeMargin={false}
              />
            </div>
            <button onClick={downloadQRCode} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-200">
              <Download size={20} /> Télécharger l'image PNG
            </button>
          </div>
        </div>
      )}

      {/* MODAL D'ÉDITION */}
      {editingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
           <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                {isCreating ? <><Plus className="text-blue-600" /> Créer un profil</> : <><Edit className="text-blue-600" /> Modifier le profil</>}
              </h2>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-all"><X size={20} /></button>
            </div>
            <form onSubmit={saveProfile} className="p-6 md:p-8 space-y-6">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                <div className="p-3 bg-white text-slate-400 rounded-xl shadow-sm"><Activity size={20} /></div>
                <div className="flex-1 space-y-1">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Statut du client</label>
                  <select name="status" value={editingProfile.status || 'actif'} onChange={handleInputChange} className="w-full bg-transparent font-bold text-slate-700 outline-none cursor-pointer">
                    <option value="actif">🟢 Actif</option><option value="prospect">🟡 Prospect</option><option value="suspendu">🔴 Suspendu</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2"><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Nom Complet *</label><input type="text" name="full_name" required value={editingProfile.full_name || ''} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div className="space-y-2"><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Email (Obligatoire) *</label><input type="email" name="email_contact" required={isCreating} value={editingProfile.email_contact || ''} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div className="space-y-2"><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Poste</label><input type="text" name="job_title" value={editingProfile.job_title || ''} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div className="space-y-2"><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Entreprise</label><input type="text" name="company" value={editingProfile.company || ''} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div className="space-y-2"><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Téléphone</label><input type="text" name="phone" value={editingProfile.phone || ''} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div className="space-y-2"><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">WhatsApp</label><input type="text" name="whatsapp" value={editingProfile.whatsapp || ''} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500" /></div>
              </div>
              <div className="space-y-2"><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Adresse</label><input type="text" name="address" value={editingProfile.address || ''} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500" /></div>
              
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button type="button" onClick={closeModal} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all">Annuler</button>
                <button type="submit" disabled={isSaving} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"><Save size={18} /> {isSaving ? 'En cours...' : (isCreating ? 'Créer le profil' : 'Sauvegarder')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}