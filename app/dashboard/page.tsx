'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  Upload, Loader2, Copy, LogOut, Save, User as UserIcon, 
  Phone, QrCode, Share2, BarChart3, Check, Palette, Layout, 
  Plus, Mail, Globe, Briefcase, Building, X, Download, Trash2,
  ShieldCheck, UserPlus, ChevronRight, MessageCircle, Linkedin, 
  Instagram, Facebook, Twitter, Github, Video, Youtube, Ghost
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

export default function Dashboard() {
  const supabase = createClient()
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [profiles, setProfiles] = useState<any[]>([])
  const [currentProfile, setCurrentProfile] = useState<any>(null)
  const [leads, setLeads] = useState<any[]>([])
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [activeTab, setActiveTab] = useState('identite')
  
  const [maxProfiles, setMaxProfiles] = useState(1)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      const { data: limitData } = await supabase.from('user_limits').select('max_profiles').eq('owner_id', user.id).single()
      if (limitData) setMaxProfiles(limitData.max_profiles)

      const { data: userProfiles, error } = await supabase.from('profiles').select('*').eq('owner_id', user.id).limit(100)
      if (error) throw error

      if (userProfiles && userProfiles.length > 0) {
        setProfiles(userProfiles)
        setCurrentProfile(userProfiles[0])
        fetchLeads(userProfiles[0].id)
      } else {
        await addNewCard(user.id, "Ma Première Carte")
      }
    } catch (error: any) {
      toast.error("Erreur de chargement")
    } finally {
      setLoading(false)
    }
  }

  async function fetchLeads(profileId: string) {
    const { data } = await supabase.from('leads').select('*').eq('profile_id', profileId)
    if (data) setLeads(data)
  }

  async function addNewCard(ownerId: string = user?.id, name: string = "Nouvelle Carte") {
    if (!ownerId) return
    if (profiles.length >= maxProfiles) {
      toast.error(`Limite atteinte (${maxProfiles} carte${maxProfiles > 1 ? 's' : ''}).`, { icon: '🔒' })
      return
    }

    const loadingToast = toast.loading("Création...")
    const { data, error } = await supabase.from('profiles').insert([{ owner_id: ownerId, full_name: name }]).select().single()

    if (error) toast.error("Erreur", { id: loadingToast })
    else if (data) {
      toast.success("Carte créée !", { id: loadingToast })
      setProfiles([...profiles, data])
      setCurrentProfile(data)
      setLeads([]) 
    }
  }

  async function deleteProfile() {
    if (!currentProfile) return
    if (!window.confirm(`Supprimer la carte "${currentProfile.full_name}" ?`)) return
    
    const loadingToast = toast.loading("Suppression...")
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', currentProfile.id)
      if (error) throw error
      
      toast.success("Carte supprimée !", { id: loadingToast })
      const updatedProfiles = profiles.filter(p => p.id !== currentProfile.id)
      setProfiles(updatedProfiles)
      if (updatedProfiles.length > 0) {
        setCurrentProfile(updatedProfiles[0])
        fetchLeads(updatedProfiles[0].id)
      } else {
        await addNewCard(user.id, "Ma Première Carte")
      }
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`, { id: loadingToast })
    }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!currentProfile) return

    setSaving(true)
    const loadingToast = toast.loading("Enregistrement...")

    // 🚨 HNA kay-tsifto ga3 les colonnes s7a7 l-Supabase
    const { id, owner_id, created_at, scan_count, ...updateData } = currentProfile

    const { error } = await supabase.from('profiles').update(updateData).eq('id', currentProfile.id)

    if (error) {
      toast.error(`Erreur: ${error.message}`, { id: loadingToast })
    } else {
      toast.success("Modifications enregistrées !", { id: loadingToast })
      setProfiles(profiles.map(p => p.id === currentProfile.id ? currentProfile : p))
    }
    setSaving(false)
  }

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploadingImage(true)
      if (!event.target.files || event.target.files.length === 0) throw new Error('Sélectionnez une image.')

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${currentProfile.id}-${Math.random()}.${fileExt}`
      const uploadToast = toast.loading("Téléchargement...")

      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file)
      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
      setCurrentProfile({ ...currentProfile, avatar_url: data.publicUrl })
      toast.success("Image téléchargée !", { id: uploadToast })
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleProfileSwitch = (e: any) => {
    const selected = profiles.find(p => p.id === e.target.value)
    if (selected) {
      setCurrentProfile(selected)
      fetchLeads(selected.id)
    }
  }

  if (loading) return <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center"><Loader2 className="animate-spin text-[#F5A623]" size={40} /></div>

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#F9FAFB] font-sans pb-20">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1F2937', color: '#fff' } }} />

      <nav className="bg-[#111827] border-b border-white/5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="font-black text-2xl text-white hidden sm:block">Dima<span className="text-[#F5A623]">Card</span></h1>
            <div className="flex items-center gap-2">
              <div className="relative">
                <select value={currentProfile?.id || ''} onChange={handleProfileSwitch} className="appearance-none bg-[#0B0F19] border border-white/10 text-white py-2 pl-4 pr-10 rounded-xl font-bold outline-none focus:border-[#F5A623] cursor-pointer">
                  {profiles.map(p => <option key={p.id} value={p.id}>{p.full_name || 'Carte sans nom'}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
              </div>
              <button onClick={() => addNewCard(user.id)} className="w-10 h-10 bg-[#1F2937] hover:bg-[#F5A623] hover:text-black rounded-xl flex items-center justify-center transition-colors"><Plus size={20}/></button>
            </div>
          </div>
          <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="text-gray-400 hover:text-white flex items-center gap-2 bg-[#1F2937] py-2 px-4 rounded-lg"><LogOut size={16}/> <span className="hidden sm:inline">Déconnexion</span></button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-10">
        <div className="flex flex-col lg:flex-row gap-10">
          
          <div className="flex-1 space-y-8">
            <div className="flex overflow-x-auto no-scrollbar gap-2 p-1 bg-[#111827] rounded-2xl border border-white/5">
              <TabButton id="identite" icon={<UserIcon size={18}/>} label="Identité" active={activeTab} onClick={setActiveTab} />
              <TabButton id="contact" icon={<Phone size={18}/>} label="Contact" active={activeTab} onClick={setActiveTab} />
              <TabButton id="reseaux" icon={<Share2 size={18}/>} label="Réseaux" active={activeTab} onClick={setActiveTab} />
              <TabButton id="design" icon={<Palette size={18}/>} label="Design" active={activeTab} onClick={setActiveTab} />
              <TabButton id="leads" icon={<BarChart3 size={18}/>} label={`Leads (${leads.length})`} active={activeTab} onClick={setActiveTab} />
            </div>

            <form onSubmit={saveProfile} className="bg-[#111827] rounded-[2rem] p-6 sm:p-8 border border-white/5 shadow-xl">
              
              {/* IDENTITÉ */}
              {activeTab === 'identite' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex flex-col sm:flex-row items-center gap-6 bg-[#0B0F19] p-4 rounded-2xl border border-white/5">
                    <div className="w-20 h-20 rounded-full bg-[#1F2937] border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                      {currentProfile?.avatar_url ? <img src={currentProfile.avatar_url} className="w-full h-full object-cover" /> : <UserIcon className="text-gray-500" size={32} />}
                    </div>
                    <div className="flex-1 w-full space-y-2">
                      <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Photo de profil</label>
                      <div className="relative">
                        <input type="file" id="avatar-upload" accept="image/*" onChange={uploadAvatar} disabled={uploadingImage} className="hidden" />
                        <label htmlFor="avatar-upload" className="flex items-center justify-center gap-2 w-full bg-[#111827] hover:bg-[#1F2937] border border-white/10 py-3 px-4 rounded-xl text-sm text-white transition-colors cursor-pointer active:scale-[0.98]">
                          {uploadingImage ? <Loader2 className="animate-spin text-[#F5A623]" size={18}/> : <Upload className="text-[#F5A623]" size={18}/>} {uploadingImage ? "Téléchargement..." : "Parcourir une image"}
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputGroup label="Nom complet" value={currentProfile?.full_name} onChange={(v: string) => setCurrentProfile({...currentProfile, full_name: v})} icon={<UserIcon size={16}/>} />
                    <InputGroup label="Poste actuel" value={currentProfile?.job_title} onChange={(v: string) => setCurrentProfile({...currentProfile, job_title: v})} icon={<Briefcase size={16}/>} />
                    <InputGroup label="Entreprise" value={currentProfile?.company} onChange={(v: string) => setCurrentProfile({...currentProfile, company: v})} icon={<Building size={16}/>} />
                  </div>
                </div>
              )}

              {/* CONTACT (Colonnes s7a7) */}
              {activeTab === 'contact' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputGroup label="Email" type="email" value={currentProfile?.email_contact} onChange={(v: string) => setCurrentProfile({...currentProfile, email_contact: v})} icon={<Mail size={16}/>} />
                    <InputGroup label="Téléphone Principal" type="tel" value={currentProfile?.phone} onChange={(v: string) => setCurrentProfile({...currentProfile, phone: v})} icon={<Phone size={16}/>} />
                    <InputGroup label="Téléphone 2 (Optionnel)" type="tel" value={currentProfile?.phone_2} onChange={(v: string) => setCurrentProfile({...currentProfile, phone_2: v})} icon={<Phone size={16}/>} />
                    <InputGroup label="Site Web" type="url" value={currentProfile?.website_url} onChange={(v: string) => setCurrentProfile({...currentProfile, website_url: v})} icon={<Globe size={16}/>} />
                  </div>
                </div>
              )}

              {/* 🚀 NOUVEAU: RÉSEAUX SOCIAUX */}
              {activeTab === 'reseaux' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputGroup label="WhatsApp (Ex: 2126000000)" type="tel" value={currentProfile?.whatsapp} onChange={(v: string) => setCurrentProfile({...currentProfile, whatsapp: v})} icon={<MessageCircle size={16}/>} />
                    <InputGroup label="LinkedIn (URL)" value={currentProfile?.linkedin_url} onChange={(v: string) => setCurrentProfile({...currentProfile, linkedin_url: v})} icon={<Linkedin size={16}/>} />
                    <InputGroup label="Instagram (URL)" value={currentProfile?.instagram_url} onChange={(v: string)=> setCurrentProfile({...currentProfile, instagram_url: v})} icon={<Instagram size={16}/>} />
                    <InputGroup label="Facebook (URL)" value={currentProfile?.facebook_url} onChange={(v: string)=> setCurrentProfile({...currentProfile, facebook_url: v})} icon={<Facebook size={16}/>} />
                    <InputGroup label="Twitter / X (URL)" value={currentProfile?.twitter_url} onChange={(v: string) => setCurrentProfile({...currentProfile, twitter_url: v})} icon={<Twitter size={16}/>} />
                    <InputGroup label="TikTok (URL)" value={currentProfile?.tiktok_url} onChange={(v: string) => setCurrentProfile({...currentProfile, tiktok_url: v})} icon={<Video size={16}/>} />
                  </div>
                </div>
              )}

              {/* DESIGN */}
              {activeTab === 'design' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Couleur Principale</label>
                      <div className="flex items-center gap-4 mt-2">
                        <input type="color" value={currentProfile?.theme_color || '#F5A623'} onChange={e => setCurrentProfile({...currentProfile, theme_color: e.target.value})} className="w-14 h-14 rounded-xl cursor-pointer bg-[#0B0F19] border border-white/10 p-1" />
                        <input type="text" value={currentProfile?.theme_color || '#F5A623'} onChange={e => setCurrentProfile({...currentProfile, theme_color: e.target.value})} className="flex-1 bg-[#0B0F19] border border-white/10 py-4 px-5 rounded-xl text-sm font-mono text-white outline-none focus:border-[#F5A623] uppercase" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Style des Boutons</label>
                      <select value={currentProfile?.button_style || 'solid'} onChange={e => setCurrentProfile({...currentProfile, button_style: e.target.value})} className="w-full bg-[#0B0F19] border border-white/10 py-4 px-5 rounded-xl text-sm text-white outline-none focus:border-[#F5A623] mt-2">
                        <option value="solid">Classique (Carré arrondi)</option>
                        <option value="rounded">Arrondi (Pilule)</option>
                        <option value="outline">Contours (Transparent)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* LEADS */}
              {activeTab === 'leads' && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                  {leads.length > 0 ? (
                    <div className="space-y-3">
                      {leads.map(lead => (
                        <div key={lead.id} className="bg-[#0B0F19] p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <p className="font-bold text-white">{lead.name}</p>
                            <p className="text-sm text-gray-400">{lead.email} {lead.phone && `• ${lead.phone}`}</p>
                          </div>
                          <span className="text-[10px] text-gray-500 bg-[#1F2937] px-2 py-1 rounded">{new Date(lead.created_at).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-center text-gray-500 py-10">Aucun lead pour le moment.</p>}
                </div>
              )}

              {/* ACTIONS */}
              {activeTab !== 'leads' && (
                <div className="flex gap-4 mt-8 pt-8 border-t border-white/5">
                  <button type="submit" disabled={saving} className="flex-1 bg-[#F5A623] text-black py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 hover:bg-[#E09612]">
                    {saving ? <Loader2 className="animate-spin" size={24}/> : <Save size={24}/>} Enregistrer
                  </button>
                  <button type="button" onClick={deleteProfile} className="px-5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 flex items-center justify-center"><Trash2 size={24}/></button>
                </div>
              )}
            </form>
          </div>

          {/* APERÇU (Variables s7a7) */}
          <div className="w-full lg:w-[350px] shrink-0">
            <div className="sticky top-28 bg-[#111827] rounded-[2rem] p-6 border border-white/5 shadow-xl flex flex-col items-center text-center">
              <h3 className="font-bold text-gray-400 mb-6 w-full text-left flex items-center gap-2"><Eye size={18}/> Aperçu en direct</h3>
              
              <div className="w-full max-w-[300px] aspect-[9/19] bg-black rounded-[2.5rem] border-[6px] border-[#1F2937] overflow-hidden relative shadow-2xl">
                <div className="w-full h-full bg-[#111827] flex flex-col relative">
                  <div className="h-24 bg-[#0B0F19] relative border-b border-white/5 shrink-0">
                    <div className="absolute inset-0 opacity-40" style={{ background: `linear-gradient(to top right, ${currentProfile?.theme_color || '#F5A623'}40, transparent, #0B0F19)` }}></div>
                  </div>

                  <div className="absolute top-24 left-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center z-20">
                    <div className="relative">
                      <div className="absolute -inset-1 rounded-full opacity-30 blur-sm" style={{ backgroundColor: currentProfile?.theme_color || '#F5A623' }}></div>
                      <div className="relative w-16 h-16 rounded-full bg-[#111827] p-1 z-10">
                        <div className="w-full h-full rounded-full overflow-hidden bg-[#1F2937] flex items-center justify-center border border-white/10">
                          {currentProfile?.avatar_url ? <img src={currentProfile.avatar_url} className="w-full h-full object-cover" /> : <UserIcon size={24} className="text-[#4B5563]"/>}
                        </div>
                      </div>
                      <div className="absolute bottom-0 right-0 border-2 border-[#111827] w-5 h-5 rounded-full flex items-center justify-center z-20" style={{ backgroundColor: currentProfile?.theme_color || '#F5A623' }}>
                        <ShieldCheck size={10} className="text-[#0B0F19]" />
                      </div>
                    </div>
                  </div>

                  <div className="px-4 text-center mt-10">
                    <h2 className="font-black text-base text-white line-clamp-1">{currentProfile?.full_name || 'Votre Nom'}</h2>
                    <p className="text-[8px] font-bold mt-1 tracking-widest uppercase line-clamp-1" style={{ color: currentProfile?.theme_color || '#F5A623' }}>{currentProfile?.job_title || 'Votre Poste'}</p>
                    <p className="text-[#9CA3AF] text-[7px] uppercase font-bold mt-0.5 line-clamp-1">{currentProfile?.company || 'Votre Entreprise'}</p>
                  </div>

                  <div className="mt-4 flex gap-2 px-4">
                    <div style={{ backgroundColor: currentProfile?.theme_color || '#F5A623' }} className={`text-white py-2 font-black flex items-center justify-center gap-1 flex-1 text-[8px] ${currentProfile?.button_style === 'rounded' ? 'rounded-full' : 'rounded-lg'}`}>
                      <Download size={10} /> Enregistrer
                    </div>
                  </div>

                  <div className="mt-4 px-4 pb-4 space-y-2 overflow-y-auto no-scrollbar">
                    <div className="flex items-center justify-between p-2 bg-[#1F2937] border border-white/5 rounded-xl">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 flex items-center justify-center bg-[#0B0F19] text-[#9CA3AF] rounded-lg"><Phone size={10}/></div>
                        <div className="text-left">
                          <p className="text-[6px] font-bold text-[#9CA3AF] uppercase mb-1">Téléphone</p>
                          <p className="text-[8px] font-bold text-white truncate w-28">{currentProfile?.phone || '+212...'}</p>
                        </div>
                      </div>
                      <ChevronRight size={12} className="text-[#4B5563]" />
                    </div>
                    
                    <div className="flex items-center justify-between p-2 bg-[#1F2937] border border-white/5 rounded-xl">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 flex items-center justify-center bg-[#0B0F19] text-[#9CA3AF] rounded-lg"><Mail size={10}/></div>
                        <div className="text-left">
                          <p className="text-[6px] font-bold text-[#9CA3AF] uppercase mb-1">Email</p>
                          <p className="text-[8px] font-bold text-white truncate w-28">{currentProfile?.email_contact || 'email@...'}</p>
                        </div>
                      </div>
                      <ChevronRight size={12} className="text-[#4B5563]" />
                    </div>
                  </div>
                  
                </div>
              </div>

              <div className="w-full mt-6 space-y-3">
                <a href={`/p/${currentProfile?.id}`} target="_blank" rel="noreferrer" className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-white">
                  <Share2 size={16}/> Voir la page publique
                </a>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

function TabButton({ id, icon, label, active, onClick }: any) {
  return (
    <button type="button" onClick={() => onClick(id)} className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all flex-1 justify-center ${active === id ? 'bg-[#F5A623] text-black shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
      {icon} {label}
    </button>
  )
}

function InputGroup({ label, type = "text", value, onChange, icon }: any) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">{icon}</div>
        <input type={type} value={value || ''} onChange={(e: any) => onChange(e.target.value)} className="w-full bg-[#0B0F19] border border-white/10 py-3 pl-11 pr-4 rounded-xl text-sm text-white outline-none focus:border-[#F5A623]" />
      </div>
    </div>
  )
}

function Eye(props: any) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
}