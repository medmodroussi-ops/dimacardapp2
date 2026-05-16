'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  User, Phone, Linkedin, Download, Mail, Globe, MessageCircle, 
  ChevronRight, ShieldCheck, Instagram, Youtube, Video, Ghost,
  Clock, ShieldAlert
} from 'lucide-react'
import { useParams } from 'next/navigation'

export default function PublicProfile() {
  const params = useParams()
  const id = params.id as string
  const supabase = createClient()
  
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isBlocked, setIsBlocked] = useState({ expired: false, suspended: false })

  useEffect(() => {
    async function fetchProfile() {
      const { data } = await supabase.from('profiles').select('*').eq('id', id).single()
      
      if (data) {
        const today = new Date()
        const expirationDate = data.expiration_date ? new Date(data.expiration_date) : null
        
        const expired = expirationDate ? expirationDate < today : false
        const suspended = data.status === 'suspendu'

        setProfile(data)
        setIsBlocked({ expired, suspended })
      }
      setLoading(false)
    }
    fetchProfile()
  }, [id, supabase])

  const downloadVCard = () => {
    if (!profile) return

    const vCard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN;CHARSET=UTF-8:${profile.full_name}`,
      `ORG;CHARSET=UTF-8:${profile.company || ''}`,
      `TITLE;CHARSET=UTF-8:${profile.job_title || ''}`,
      `TEL;TYPE=CELL:${profile.phone || ''}`,
      profile.phone_2 ? `TEL;TYPE=WORK:${profile.phone_2}` : '',
      profile.phone_3 ? `TEL;TYPE=OTHER:${profile.phone_3}` : '',
      `EMAIL;TYPE=INTERNET:${profile.email_contact || ''}`,
      profile.website_url ? `URL:${profile.website_url}` : '',
      `NOTE;CHARSET=UTF-8:PROFIL DIGITAL DIMACARD\n` +
      (profile.linkedin_url ? `URL: ${profile.linkedin_url}\n` : '') +
      (profile.instagram_url ? `URL: ${profile.instagram_url}\n` : '') +
      (profile.tiktok_url ? `URL: ${profile.tiktok_url}\n` : '') +
      (profile.youtube_url ? `URL: ${profile.youtube_url}\n` : '') +
      (profile.snapchat_url ? `Snapchat: ${profile.snapchat_url}\n` : '') +
      (profile.whatsapp ? `WhatsApp: https://wa.me/${profile.whatsapp.replace(/\D/g,'')}\n` : ''),
      profile.linkedin_url ? `X-SOCIALMSGR;TYPE=linkedin:${profile.linkedin_url}` : '',
      profile.instagram_url ? `X-SOCIALMSGR;TYPE=instagram:${profile.instagram_url}` : '',
      'END:VCARD'
    ].filter(Boolean).join('\r\n')

    const blob = new Blob([vCard], { type: 'text/vcard;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${profile.full_name.replace(/\s+/g, '_')}.vcf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  // --- BRANDING: ÉCRAN DE CHARGEMENT ---
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0F19]">
      <div className="relative">
        <div className="absolute inset-0 bg-[#F5A623]/20 rounded-full blur-xl animate-pulse"></div>
        <img 
          src="/dimacardlogo.jpeg" 
          alt="DimaCard Loading" 
          className="w-20 h-20 object-contain relative z-10 animate-bounce" 
        />
      </div>
      <div className="mt-8 w-40 h-1 bg-[#1F2937] rounded-full overflow-hidden">
        <div className="h-full bg-[#F5A623] rounded-full animate-progress"></div>
      </div>
      <style jsx>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-progress {
          animation: progress 1.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  )

  if (!profile) return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center font-bold text-[#9CA3AF] uppercase tracking-widest text-xs">
      Profil introuvable
    </div>
  )

  if (isBlocked.expired || isBlocked.suspended) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-6 font-sans relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[#8B5CF6]/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="w-full max-w-[400px] bg-[#111827] p-10 rounded-[3rem] shadow-2xl border border-white/5 text-center relative z-10">
          <div className="mb-6 flex justify-center">
             <img src="/dimacardlogo.jpeg" alt="DimaCard" className="h-8 w-auto grayscale opacity-30" />
          </div>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isBlocked.suspended ? 'bg-[#F5A623]/10 text-[#F5A623] border border-[#F5A623]/20' : 'bg-red-900/20 text-red-500 border border-red-500/20'}`}>
            {isBlocked.suspended ? <ShieldAlert size={40} /> : <Clock size={40} />}
          </div>
          <h1 className="text-2xl font-black text-white mb-3 uppercase tracking-tight" style={{ fontFamily: 'var(--font-display, sans-serif)' }}>
            {isBlocked.suspended ? "Profil Suspendu" : "Lien Expiré"}
          </h1>
          <p className="text-[#9CA3AF] font-medium leading-relaxed mb-8 text-sm">
            {isBlocked.suspended 
              ? "Ce profil a été temporairement désactivé par l'administrateur." 
              : "Cette carte de visite numérique n'est plus active car sa date de validité est dépassée."}
          </p>
          <div className="pt-6 border-t border-white/5">
            <p className="text-[10px] font-black text-[#4B5563] uppercase tracking-[0.2em]">DimaCard System</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] flex justify-center items-start sm:py-10 font-sans relative overflow-hidden">
      
      {/* Effets de lumière en arrière-plan */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#8B5CF6]/10 blur-[120px] rounded-full pointer-events-none hidden sm:block" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#F5A623]/10 blur-[120px] rounded-full pointer-events-none hidden sm:block" />

      <div className="w-full max-w-[420px] bg-[#111827] sm:rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] sm:border sm:border-white/5 flex flex-col min-h-screen sm:min-h-[850px] overflow-hidden relative z-10">
        
        {/* HEADER & IMAGE AVEC FILIGRANE BRANDING */}
        <div className="relative h-55 bg-[#0B0F19] shrink-0 overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 opacity-40 bg-gradient-to-tr from-[#8B5CF6]/40 via-transparent to-[#F5A623]/20"></div>
          
          {/* Petit logo en haut à gauche pour le branding */}
          <div className="absolute top-7 left-6 opacity-20">
            <img src="/dimacardlogo.jpeg" alt="DimaCard" className="h-15 w-auto" />
          </div>

          <div className="absolute -bottom-1 w-full flex justify-center">
            <div className="relative">
              <div className="w-32 h-45 rounded-[2.5rem] bg-[#111827] p-1.5 shadow-2xl border border-white/10">
                <div className="w-full h-full rounded-[2.2rem] overflow-hidden bg-[#1F2937] flex items-center justify-center">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} className="w-full h-full object-cover aspect-square" alt={profile.full_name} />
                  ) : (
                    <User size={45} className="text-[#4B5563]" />
                  )}
                </div>
              </div>
              <div className="absolute bottom-1 right-1 bg-[#F5A623] border-[3px] border-[#111827] w-9 h-9 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(245,166,35,0.4)] z-10">
                <ShieldCheck size={16} className="text-[#0B0F19]" />
              </div>
            </div>
          </div>
        </div>

        {/* CONTENU DU PROFIL */}
        <div className="mt-6 px-6 text-center flex-1 pb-10">
          <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'var(--font-display, sans-serif)' }}>{profile.full_name}</h1>
          <p className="text-[#F5A623] font-bold text-xs uppercase mt-1.5 tracking-widest">{profile.job_title}</p>
          <p className="text-[#9CA3AF] text-[10px] uppercase font-bold mt-1 tracking-wider">{profile.company}</p>

          <button 
            onClick={downloadVCard} 
            className="w-full mt-6 bg-[#F5A623] text-[#0B0F19] py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-[#F5A623]/20 hover:bg-[#FDE047] active:scale-95 transition-all"
          >
            <Download size={20} /> Enregistrer le Contact
          </button>

          <div className="mt-10 space-y-3 text-left">
            <p className="text-[10px] font-black text-[#4B5563] uppercase tracking-widest ml-2 mb-4">Coordonnées & Réseaux</p>
            
            {profile.phone && <SocialRow icon={<Phone size={18}/>} label="Téléphone Principal" value={profile.phone} href={`tel:${profile.phone}`} />}
            {profile.phone_2 && <SocialRow icon={<Phone size={18}/>} label="Téléphone secondaire" value={profile.phone_2} href={`tel:${profile.phone_2}`} />}
            {profile.phone_3 && <SocialRow icon={<Phone size={18}/>} label="Autre Ligne" value={profile.phone_3} href={`tel:${profile.phone_3}`} />}
            
            {profile.whatsapp && (
              <SocialRow 
                icon={<MessageCircle size={18}/>} 
                label="WhatsApp" 
                value="Démarrer une discussion" 
                href={`https://wa.me/${profile.whatsapp.replace(/\D/g,'')}`} 
                color="text-emerald-400" 
                isExternal 
              />
            )}
            {profile.website_url && <SocialRow icon={<Globe size={18}/>} label="Site Web" value="Visiter le site" href={profile.website_url} isExternal />}
            {profile.linkedin_url && <SocialRow icon={<Linkedin size={18}/>} label="LinkedIn" value="Profil Professionnel" href={profile.linkedin_url} isExternal color="text-[#0A66C2]" />}
            {profile.instagram_url && <SocialRow icon={<Instagram size={18}/>} label="Instagram" value="Suivre les actualités" href={profile.instagram_url} isExternal color="text-[#E1306C]" />}
            {profile.tiktok_url && <SocialRow icon={<Video size={18}/>} label="TikTok" value="Voir les vidéos" href={profile.tiktok_url} isExternal color="text-white" />}
            {profile.youtube_url && <SocialRow icon={<Youtube size={18}/>} label="YouTube" value="S'abonner" href={profile.youtube_url} isExternal color="text-[#FF0000]" />}
            {profile.snapchat_url && <SocialRow icon={<Ghost size={18}/>} label="Snapchat" value="Ajouter" href={profile.snapchat_url} isExternal color="text-[#FFFC00]" />}
            {profile.email_contact && <SocialRow icon={<Mail size={18}/>} label="Email" value={profile.email_contact} href={`mailto:${profile.email_contact}`} />}
          </div>

          {/* FOOTER BRANDING DIMACARD */}
          <div className="mt-12 flex flex-col items-center gap-2 pb-2">
             <img src="/dimacardlogo.jpeg" alt="DimaCard" className="h-10 w-auto opacity-50 grayscale hover:grayscale-0 transition-all duration-300" />
             <p className="text-[9px] text-[#4B5563] tracking-widest uppercase font-bold">Smart Business Card</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function SocialRow({ icon, label, value, href, isExternal, color = "text-[#9CA3AF]" }: any) {
  return (
    <a 
      href={href} 
      target={isExternal ? "_blank" : "_self"} 
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="flex items-center justify-between p-4 bg-[#1F2937] border border-white/5 rounded-2xl hover:bg-white/5 hover:border-white/10 transition-all group shadow-sm"
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 flex items-center justify-center bg-[#0B0F19] ${color} rounded-xl group-hover:scale-110 shadow-inner transition-transform`}>
          {icon}
        </div>
        <div>
          <p className="text-[9px] font-bold text-[#9CA3AF] uppercase leading-none mb-1.5 tracking-wider">{label}</p>
          <p className="text-sm font-bold text-white leading-none truncate max-w-[180px]">{value}</p>
        </div>
      </div>
      <ChevronRight size={16} className="text-[#4B5563] group-hover:text-[#F5A623] transition-colors" />
    </a>
  )
}