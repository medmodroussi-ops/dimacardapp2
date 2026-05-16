'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  Upload, Loader2, Link as LinkIcon, Copy, LogOut, Save, User as UserIcon, 
  Phone, Globe, QrCode, X, Download, Mail, Share2
} from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'

export default function Dashboard() {
  const supabase = createClient()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [showQrModal, setShowQrModal] = useState(false)
  
  const [profile, setProfile] = useState({
    full_name: '', job_title: '', company: '', avatar_url: '',
    phone: '', phone_2: '', phone_3: '', whatsapp: '',
    email_contact: '', website_url: '', linkedin_url: '',
    instagram_url: '', facebook_url: '', twitter_url: '',
    tiktok_url: '', youtube_url: '', snapchat_url: ''
  })

  useEffect(() => {
    async function getProfile() {
      try {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }
        setUserId(user.id)
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (data) setProfile(prev => ({ ...prev, ...data }))
      } catch (error) { console.error(error) } finally { setLoading(false) }
    }
    getProfile()
  }, [router, supabase])

  const copyToClipboard = () => {
    if (userId) {
      navigator.clipboard.writeText(`${window.location.origin}/p/${userId}`)
      alert("Lien copié !")
    }
  }

  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement
    if (canvas) {
      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/png')
      link.download = `QR_${profile.full_name || 'DimaCard'}.png`
      link.click()
    }
  }

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploadingImage(true)
      const file = event.target.files?.[0]
      if (!file || !userId) return
      const filePath = `${userId}/avatar-${Math.random()}.${file.name.split('.').pop()}`
      await supabase.storage.from('avatars').upload(filePath, file)
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath)
      setProfile(prev => ({ ...prev, avatar_url: publicUrl }))
    } finally { setUploadingImage(false) }
  }

  async function updateProfile(e: React.FormEvent) {
    e.preventDefault()
    setUpdating(true)
    try {
      await supabase.from('profiles').upsert({ id: userId, ...profile, updated_at: new Date().toISOString() })
      alert('Profil mis à jour !')
    } finally { setUpdating(false) }
  }

  // --- ÉCRAN DE CHARGEMENT AVEC LOGO DIMACARD ---
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0F19]">
      <div className="relative">
        <div className="absolute inset-0 bg-[#F5A623]/20 rounded-full blur-xl animate-pulse"></div>
        <img 
          src="/dimacardlogo.jpeg" 
          alt="Loading DimaCard" 
          className="w-24 h-24 object-contain relative z-10 animate-bounce" 
          style={{ animationDuration: '2s' }}
        />
      </div>
      <div className="mt-8 w-48 h-1 bg-[#1F2937] rounded-full overflow-hidden">
        <div className="h-full bg-[#F5A623] rounded-full animate-infinite-loading"></div>
      </div>
      <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-[#9CA3AF]">DimaCard</p>
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
    <div className="min-h-screen bg-[#0B0F19] text-[#F9FAFB] pb-20 font-sans relative overflow-hidden">
      
      {/* Effets de fond (Glow) */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#8B5CF6]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#F5A623]/5 blur-[150px] rounded-full pointer-events-none" />

      {/* NAVBAR AVEC LOGO */}
      <nav className="bg-[#111827]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-40 shadow-lg">
        <div className="max-w-5xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <img src="/dimacardlogo.jpeg" alt="DimaCard Logo" className="h-10 w-auto object-contain" />
             <span className="font-black text-xl text-white tracking-tight hidden sm:block" style={{ fontFamily: 'var(--font-display, sans-serif)' }}>DimaCard</span>
          </div>
          <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="text-[#9CA3AF] font-bold flex items-center gap-2 hover:text-red-400 transition-colors">
            <LogOut size={18}/> <span className="hidden sm:inline">Quitter</span>
          </button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 mt-10 relative z-10">
        {/* LIEN PUBLIC */}
        <div className="bg-[#111827] rounded-[2rem] p-6 shadow-xl border border-white/5 mb-8 flex flex-col md:flex-row items-center gap-6 overflow-hidden">
          <div className="flex-1 w-full min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#F5A623]">Votre lien public</p>
            <p className="text-[#9CA3AF] text-sm truncate block mt-1">{`${window.location.origin}/p/${userId}`}</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto shrink-0">
            <button type="button" onClick={() => setShowQrModal(true)} className="flex-1 md:flex-none bg-[#F5A623] text-[#0B0F19] px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#FDE047] transition-all text-sm whitespace-nowrap shadow-lg shadow-[#F5A623]/20"><QrCode size={18}/> QR Code</button>
            <button type="button" onClick={copyToClipboard} className="flex-1 md:flex-none bg-[#1F2937] text-white border border-white/10 px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all text-sm whitespace-nowrap"><Copy size={18}/> Copier</button>
          </div>
        </div>

        <form onSubmit={updateProfile} className="space-y-6">
          <section className="bg-[#111827] rounded-[2rem] p-8 shadow-xl border border-white/5">
            <h2 className="text-lg font-black mb-6 flex items-center gap-2 text-white" style={{ fontFamily: 'var(--font-display, sans-serif)' }}><UserIcon size={20} className="text-[#F5A623]"/> Identité</h2>
            <div className="flex flex-col md:flex-row gap-8 mb-8 items-center">
              <div className="relative">
                <div className="w-28 h-28 rounded-[2rem] overflow-hidden bg-[#1F2937] border-4 border-[#0B0F19] shadow-inner">
                  {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <UserIcon className="w-full h-full p-6 text-[#9CA3AF]" />}
                  {uploadingImage && <div className="absolute inset-0 bg-[#0B0F19]/60 flex items-center justify-center backdrop-blur-sm"><Loader2 className="animate-spin text-[#F5A623]" /></div>}
                </div>
                <label className="absolute -bottom-2 -right-2 bg-[#F5A623] text-[#0B0F19] p-2 rounded-lg cursor-pointer shadow-lg shadow-[#F5A623]/30 hover:scale-110 hover:bg-[#FDE047] transition-transform">
                  <Upload size={16}/><input type="file" className="hidden" accept="image/*" onChange={uploadAvatar} />
                </label>
              </div>
              <div className="grid grid-cols-1 gap-4 flex-1 w-full">
                <InputGroup label="Nom complet" value={profile.full_name} onChange={(v) => setProfile({...profile, full_name: v})} />
                <InputGroup label="Poste actuel" value={profile.job_title} onChange={(v) => setProfile({...profile, job_title: v})} />
              </div>
            </div>
            <InputGroup label="Entreprise" value={profile.company} onChange={(v) => setProfile({...profile, company: v})} />
          </section>

          <section className="bg-[#111827] rounded-[2rem] p-8 shadow-xl border border-white/5">
            <h2 className="text-lg font-black mb-6 flex items-center gap-2 text-white" style={{ fontFamily: 'var(--font-display, sans-serif)' }}><Share2 size={20} className="text-[#8B5CF6]"/> Contacts & Réseaux</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputGroup label="Téléphone Principal" value={profile.phone} onChange={(v) => setProfile({...profile, phone: v})} />
              <InputGroup label="Téléphone 2" value={profile.phone_2} onChange={(v) => setProfile({...profile, phone_2: v})} />
              <InputGroup label="Téléphone 3" value={profile.phone_3} onChange={(v) => setProfile({...profile, phone_3: v})} />
              <InputGroup label="WhatsApp" value={profile.whatsapp} onChange={(v) => setProfile({...profile, whatsapp: v})} />
              <InputGroup label="Email Contact" value={profile.email_contact} onChange={(v) => setProfile({...profile, email_contact: v})} />
              <InputGroup label="LinkedIn" value={profile.linkedin_url} onChange={(v) => setProfile({...profile, linkedin_url: v})} />
              <InputGroup label="Instagram" value={profile.instagram_url} onChange={(v) => setProfile({...profile, instagram_url: v})} />
              <InputGroup label="Facebook" value={profile.facebook_url} onChange={(v) => setProfile({...profile, facebook_url: v})} />
              <InputGroup label="TikTok" value={profile.tiktok_url} onChange={(v) => setProfile({...profile, tiktok_url: v})} />
              <InputGroup label="Twitter / X" value={profile.twitter_url} onChange={(v) => setProfile({...profile, twitter_url: v})} />
              <InputGroup label="YouTube" value={profile.youtube_url} onChange={(v) => setProfile({...profile, youtube_url: v})} />
              <InputGroup label="Snapchat" value={profile.snapchat_url} onChange={(v) => setProfile({...profile, snapchat_url: v})} />
              <div className="md:col-span-2"><InputGroup label="Site Web" value={profile.website_url} onChange={(v) => setProfile({...profile, website_url: v})} /></div>
            </div>
          </section>

          <button type="submit" disabled={updating} className="w-full bg-[#F5A623] text-[#0B0F19] py-5 rounded-2xl font-black text-lg shadow-xl shadow-[#F5A623]/20 hover:bg-[#FDE047] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3" style={{ fontFamily: 'var(--font-body, sans-serif)' }}>
            {updating ? <Loader2 className="animate-spin" size={24}/> : <Save size={24}/>} Enregistrer les modifications
          </button>
        </form>
      </main>

      {/* MODAL QR CODE */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0F19]/80 backdrop-blur-sm p-4">
          <div className="bg-[#111827] border border-white/10 p-8 rounded-[2.5rem] max-w-sm w-full text-center relative shadow-2xl animate-in zoom-in duration-200">
            <button onClick={() => setShowQrModal(false)} className="absolute top-6 right-6 text-[#9CA3AF] hover:text-white transition-colors"><X size={24}/></button>
            <h2 className="text-xl font-black mb-2 text-white" style={{ fontFamily: 'var(--font-display, sans-serif)' }}>Votre QR Code</h2>
            <p className="text-[10px] text-[#F5A623] mb-8 font-bold uppercase tracking-widest">{profile.full_name || 'Profil'}</p>
            
            <div className="bg-white p-4 rounded-[2rem] border-4 border-[#1F2937] inline-block mb-8 shadow-inner">
              <QRCodeCanvas id="qr-canvas" value={`${window.location.origin}/p/${userId}`} size={200} level="H" includeMargin={true} />
            </div>
            
            <button onClick={downloadQRCode} className="w-full bg-[#F5A623] text-[#0B0F19] py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#FDE047] transition-all active:scale-95 shadow-lg shadow-[#F5A623]/20"><Download size={18}/> Télécharger l'image</button>
          </div>
        </div>
      )}
    </div>
  )
}

function InputGroup({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1 w-full text-left">
      <label className="text-[10px] font-black uppercase text-[#9CA3AF] ml-1 tracking-wider">{label}</label>
      <input 
        type="text" 
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)} 
        className="w-full bg-[#0B0F19] border border-white/10 p-3.5 rounded-xl font-bold text-sm text-white outline-none focus:border-[#F5A623] transition-all shadow-sm placeholder:text-[#4B5563]" 
        placeholder="..." 
      />
    </div>
  )
}