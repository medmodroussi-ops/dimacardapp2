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
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="relative">
        <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
        <img 
          src="/dimacardlogo.jpeg" 
          alt="DimaCard Loading" 
          className="w-20 h-20 object-contain relative z-10 animate-bounce" 
        />
      </div>
      <div className="mt-8 w-40 h-1 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-blue-600 rounded-full animate-progress"></div>
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
    <div className="min-h-screen flex items-center justify-center font-bold text-slate-400 uppercase tracking-widest text-xs">
      Profil introuvable
    </div>
  )

  if (isBlocked.expired || isBlocked.suspended) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-[400px] bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 text-center">
          {/* Logo Branding en haut */}
          <div className="mb-6 flex justify-center">
             <img src="/dimacardlogo.jpeg" alt="DimaCard" className="h-8 w-auto grayscale opacity-40" />
          </div>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isBlocked.suspended ? 'bg-amber-50 text-amber-500' : 'bg-red-50 text-red-500'}`}>
            {isBlocked.suspended ? <ShieldAlert size={40} /> : <Clock size={40} />}
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-3 uppercase tracking-tight">
            {isBlocked.suspended ? "Profil Suspendu" : "Lien Expiré"}
          </h1>
          <p className="text-slate-500 font-medium leading-relaxed mb-8 text-sm">
            {isBlocked.suspended 
              ? "Ce profil a été temporairement désactivé par l'administrateur." 
              : "Cette carte de visite numérique n'est plus active car sa date de validité est dépassée."}
          </p>
          <div className="pt-6 border-t border-slate-50">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">DimaCard System</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center items-start sm:py-10 font-sans">
      <div className="w-full max-w-[420px] bg-white sm:rounded-[3rem] shadow-2xl flex flex-col min-h-screen sm:min-h-[850px] overflow-hidden relative">
        
        {/* HEADER & IMAGE AVEC FILIGRANE BRANDING */}
        <div className="relative h-55 bg-slate-900 shrink-0 overflow-hidden">
          <div className="absolute inset-0 opacity-30 bg-gradient-to-tr from-blue-600 to-transparent"></div>
          
          {/* Petit logo en haut à gauche pour le branding */}
          <div className="absolute top-7 left-6 opacity-10">
          <img src="/dimacardlogo.jpeg" alt="DimaCard" className="h-15 w-auto " />
          </div>

          <div className="absolute -bottom-1 w-full flex justify-center">
            <div className="relative">
              <div className="w-32 h-45 rounded-[2.5rem] bg-white p-1.5 shadow-2x1">
                <div className="w-full h-full rounded-[2.2rem] overflow-hidden bg-slate-50 flex items-center justify-center">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} className="w-full h-full object-cover aspect-square" alt={profile.full_name} />
                  ) : (
                    <User size={45} className="text-slate-300" />
                  )}
                </div>
              </div>
              <div className="absolute bottom-1 right-1 bg-green-500 border-[3px] border-white w-9 h-9 rounded-full flex items-center justify-center shadow-lg z-10">
                <ShieldCheck size={16} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* CONTENU DU PROFIL */}
        <div className="mt-5 px-6 text-center flex-1 pb-10">
          <h1 className="text-2xl font-black text-slate-900">{profile.full_name}</h1>
          <p className="text-blue-600 font-bold text-xs uppercase mt-1 tracking-widest">{profile.job_title}</p>
          <p className="text-slate-400 text-[10px] uppercase font-bold mt-1 tracking-wider">{profile.company}</p>

          <button 
            onClick={downloadVCard} 
            className="w-full mt-4 bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all"
          >
            <Download size={20} /> Enregistrer le Contact
          </button>

          <div className="mt-8 space-y-3 text-left">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-2">Coordonnées & Réseaux</p>
            
            {profile.phone && <SocialRow icon={<Phone size={18}/>} label="Téléphone Principal" value={profile.phone} href={`tel:${profile.phone}`} />}
            {profile.phone_2 && <SocialRow icon={<Phone size={18}/>} label="Téléphone secondaire" value={profile.phone_2} href={`tel:${profile.phone_2}`} />}
            {profile.phone_3 && <SocialRow icon={<Phone size={18}/>} label="Autre Ligne" value={profile.phone_3} href={`tel:${profile.phone_3}`} />}
            
            {profile.whatsapp && (
              <SocialRow 
                icon={<MessageCircle size={18}/>} 
                label="WhatsApp" 
                value="Démarrer une discussion" 
                href={`https://wa.me/${profile.whatsapp.replace(/\D/g,'')}`} 
                color="text-emerald-500" 
                isExternal 
              />
            )}
            {profile.website_url && <SocialRow icon={<Globe size={18}/>} label="Site Web" value="Visiter le site" href={profile.website_url} isExternal />}
            {profile.linkedin_url && <SocialRow icon={<Linkedin size={18}/>} label="LinkedIn" value="Profil Professionnel" href={profile.linkedin_url} isExternal color="text-blue-700" />}
            {profile.instagram_url && <SocialRow icon={<Instagram size={18}/>} label="Instagram" value="Suivre les actualités" href={profile.instagram_url} isExternal color="text-pink-600" />}
            {profile.tiktok_url && <SocialRow icon={<Video size={18}/>} label="TikTok" value="Voir les vidéos" href={profile.tiktok_url} isExternal color="text-black" />}
            {profile.youtube_url && <SocialRow icon={<Youtube size={18}/>} label="YouTube" value="S'abonner" href={profile.youtube_url} isExternal color="text-red-600" />}
            {profile.snapchat_url && <SocialRow icon={<Ghost size={18}/>} label="Snapchat" value="Ajouter" href={profile.snapchat_url} isExternal color="text-yellow-500" />}
            {profile.email_contact && <SocialRow icon={<Mail size={18}/>} label="Email" value={profile.email_contact} href={`mailto:${profile.email_contact}`} />}
          </div>

          {/* FOOTER BRANDING DIMACARD */}
          <div className="mt-10 flex flex-col items-center gap-2 pb-1 opacity-100">
             <img src="/dimacardlogo.jpeg" alt="DimaCard" className="h-15 w-auto " />
             
          </div>
        </div>
      </div>
    </div>
  )
}

function SocialRow({ icon, label, value, href, isExternal, color = "text-slate-400" }: any) {
  return (
    <a 
      href={href} 
      target={isExternal ? "_blank" : "_self"} 
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all group shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 flex items-center justify-center bg-slate-50 ${color} rounded-xl group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1">{label}</p>
          <p className="text-sm font-bold text-slate-700 leading-none truncate max-w-[180px]">{value}</p>
        </div>
      </div>
      <ChevronRight size={16} className="text-slate-300" />
    </a>
  )
}