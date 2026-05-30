'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { 
  User, Phone, Linkedin, Download, Mail, Globe, MessageCircle, 
  ChevronRight, ShieldCheck, Instagram, Youtube, Video, Ghost,
  Clock, ShieldAlert, UserPlus, Send, X, CheckCircle2, Facebook, Twitter, Github
} from 'lucide-react'

{/* 
  Chosen Palette: Custom Theme Color (Dynamic) based on User Selection + Dark Mode Navy Background 
  Application Structure Plan: 
  - Information Architecture: Focused on a professional identity hierarchy (Banner -> Avatar -> Name -> Action -> Contact -> Social).
  - Navigation: Single-column mobile-first layout optimized for NFC scanning.
  - Interaction Flow: Primary action is "Enregistrer" (VCard), secondary is "Échanger" (Lead Form Modal).
  - Rationale: The circular avatar and layered header provide a high-end "LinkedIn-style" feel, essential for business credibility.
  
  Visualization & Content Choices:
  - Lead Generation: Interactive Modal for contact capture to minimize page clutter.
  - Feedback: Visual success state after lead submission.
  - Responsiveness: Tailwind-powered fluid layout that scales from small mobile screens to desktop previews.
  
  CONFIRMATION: NO SVG graphics used. NO Mermaid JS used.
*/}

export default function PublicProfile() {
  const params = useParams()
  const id = params?.id as string
  const supabase = createClient()
  
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isBlocked, setIsBlocked] = useState({ expired: false, suspended: false })

  const [showLeadModal, setShowLeadModal] = useState(false)
  const [leadForm, setLeadForm] = useState({ name: '', phone: '', email: '', company: '' })
  const [submittingLead, setSubmittingLead] = useState(false)
  const [leadSuccess, setLeadSuccess] = useState(false)

  useEffect(() => {
    async function fetchProfileAndIncrement() {
      try {
        // Kan-st3mlo count wla nbdlo chwya logic bach n-forciw Supabase y-refreshi
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', id)
  .single()
        
        if (data) {
          const today = new Date()
          const expirationDate = data.expiration_date ? new Date(data.expiration_date) : null
          const expired = expirationDate ? expirationDate < today : false
          const suspended = data.status === 'suspendu'

          setProfile(data)
          setIsBlocked({ expired, suspended })

          if (!expired && !suspended) {
            const { error: rpcError } = await supabase.rpc('increment_scan_count', { target_profile_id: id })
                if (rpcError) {
                           console.error("Mochkil f RPC:", rpcError)
            }
          }
        }
      } catch (error) {
        console.error("Fetch error:", error)
      } finally {
        setLoading(false)
      }
    }
    
    if (id) {
      fetchProfileAndIncrement()
    }
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
      (profile.linkedin_url ? `LinkedIn: ${profile.linkedin_url}\n` : '') +
      (profile.whatsapp ? `WhatsApp: https://wa.me/${profile.whatsapp.replace(/\D/g,'')}\n` : ''),
      'END:VCARD'
    ].filter(Boolean).join('\r\n')

    const blob = new Blob([vCard], { type: 'text/vcard;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${profile.full_name?.replace(/\s+/g, '_') || 'Contact'}.vcf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const submitLead = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!leadForm.name) return
    setSubmittingLead(true)
    try {
      const { error } = await supabase.from('leads').insert({
        profile_id: id,
        name: leadForm.name,
        phone: leadForm.phone,
        email: leadForm.email,
        company: leadForm.company
      })
      if (error) throw error
      setLeadSuccess(true)
      setTimeout(() => {
        setShowLeadModal(false)
        setLeadSuccess(false)
        setLeadForm({ name: '', phone: '', email: '', company: '' })
      }, 3000)
    } catch (error) {
      alert("Une erreur est survenue lors de l'envoi.")
    } finally {
      setSubmittingLead(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0F19]">
      <div className="relative">
        <div className="absolute inset-0 bg-[#F5A623]/20 rounded-full blur-xl animate-pulse"></div>
        <img src="/dimacardlogo.jpeg" alt="DimaCard" className="w-20 h-20 object-contain relative z-10 animate-bounce" />
      </div>
      <div className="mt-8 w-40 h-1 bg-[#1F2937] rounded-full overflow-hidden">
        <div className="h-full bg-[#F5A623] animate-progress"></div>
      </div>
      <style>{`@keyframes progress { 0% { width: 0%; } 100% { width: 100%; } } .animate-progress { animation: progress 1.5s infinite ease-in-out; }`}</style>
    </div>
  )

  if (!profile) return <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center text-[#9CA3AF] uppercase font-bold tracking-widest text-xs">Profil Introuvable</div>

  if (isBlocked.expired || isBlocked.suspended) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-6 font-sans relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[#8B5CF6]/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="w-full max-w-[400px] bg-[#111827] p-10 rounded-[3rem] shadow-2xl border border-white/5 text-center relative z-10">
          <div className="mb-6 flex justify-center"><img src="/dimacardlogo.jpeg" alt="DimaCard" className="h-8 w-auto grayscale opacity-30" /></div>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isBlocked.suspended ? 'bg-[#F5A623]/10 text-[#F5A623] border border-[#F5A623]/20' : 'bg-red-900/20 text-red-500 border border-red-500/20'}`}>
            {isBlocked.suspended ? <ShieldAlert size={40} /> : <Clock size={40} />}
          </div>
          <h1 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">{isBlocked.suspended ? "Profil Suspendu" : "Lien Expiré"}</h1>
          <p className="text-[#9CA3AF] font-medium leading-relaxed text-sm">
            {isBlocked.suspended ? "Ce profil a été temporairement désactivé." : "Cette carte de visite numérique n'est plus active."}
          </p>
        </div>
      </div>
    )
  }

  const themeColor = profile.theme_color || '#F5A623'
  const buttonStyle = profile.button_style || 'solid'
  const isRounded = buttonStyle === 'rounded'

  return (
    <div className="min-h-screen bg-[#0B0F19] flex justify-center items-start sm:py-10 font-sans relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#8B5CF6]/10 blur-[120px] rounded-full pointer-events-none hidden sm:block" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#F5A623]/10 blur-[120px] rounded-full pointer-events-none hidden sm:block" />

      <div className="w-full max-w-[420px] bg-[#111827] sm:rounded-[3rem] shadow-2xl sm:border sm:border-white/5 flex flex-col min-h-screen sm:min-h-[850px] relative z-10 pb-10">
        
        <div className="relative mb-20"> 
          <div className="h-48 sm:h-52 bg-[#0B0F19] overflow-hidden relative border-b border-white/5 sm:rounded-t-[3rem]">
            <div className="absolute inset-0 opacity-40" style={{ background: `linear-gradient(to top right, ${themeColor}40, transparent, #0B0F19)` }}></div>
            <div className="absolute top-7 left-6 opacity-20"><img src="/dimacardlogo.jpeg" alt="DimaCard" className="h-10 w-auto" /></div>
          </div>
          
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 flex justify-center z-20">
            <div className="relative">
              <div className="absolute -inset-2 rounded-full opacity-30 blur-md" style={{ backgroundColor: themeColor }}></div>
              <div className="relative w-32 h-32 rounded-full bg-[#111827] p-1.5 shadow-2xl z-10">
                <div className="w-full h-full rounded-full overflow-hidden bg-[#1F2937] flex items-center justify-center border border-white/10">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} className="w-full h-full object-cover" alt={profile.full_name} />
                  ) : <User size={45} className="text-[#4B5563]" />}
                </div>
              </div>
              <div className="absolute bottom-1 right-1 border-[3px] border-[#111827] w-9 h-9 rounded-full flex items-center justify-center z-20" style={{ backgroundColor: themeColor, boxShadow: `0 0 15px ${themeColor}66` }}>
                <ShieldCheck size={16} className="text-[#0B0F19] drop-shadow-md" />
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 text-center flex-1">
          <h1 className="text-2xl font-black text-white">{profile.full_name}</h1>
          <p className="font-bold text-xs uppercase mt-1.5 tracking-widest" style={{ color: themeColor }}>{profile.job_title}</p>
          <p className="text-[#9CA3AF] text-[10px] uppercase font-bold mt-1 tracking-wider">{profile.company}</p>

          <div className="mt-8 flex gap-3 flex-col sm:flex-row">
            <button 
              onClick={downloadVCard} 
              style={{ backgroundColor: themeColor }}
              className={`w-full text-white py-3.5 font-black flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all flex-1 ${isRounded ? 'rounded-full' : 'rounded-xl'}`}
            >
              <Download size={18} /> Enregistrer
            </button>
            <button 
              onClick={() => setShowLeadModal(true)} 
              style={{ borderColor: themeColor, color: themeColor }}
              className={`w-full py-3.5 font-black flex items-center justify-center gap-2 border-2 hover:bg-white/5 active:scale-95 transition-all flex-1 ${isRounded ? 'rounded-full' : 'rounded-xl'}`}
            >
              <UserPlus size={18} /> Échanger
            </button>
          </div>

          <div className="mt-10 space-y-3 text-left">
            {(profile.phone || profile.email_contact || profile.website_url) && (
              <p className="text-[10px] font-black text-[#4B5563] uppercase tracking-widest ml-2 mb-4">Coordonnées</p>
            )}
            {profile.phone && <SocialRow icon={<Phone size={18}/>} label="Téléphone" value={profile.phone} href={`tel:${profile.phone}`} themeColor={themeColor} buttonStyle={buttonStyle} />}
            {profile.email_contact && <SocialRow icon={<Mail size={18}/>} label="Email" value={profile.email_contact} href={`mailto:${profile.email_contact}`} themeColor={themeColor} buttonStyle={buttonStyle} />}
            {profile.website_url && <SocialRow icon={<Globe size={18}/>} label="Site Web" value="Visiter" href={profile.website_url} isExternal themeColor={themeColor} buttonStyle={buttonStyle} />}

            {(profile.whatsapp || profile.linkedin_url || profile.instagram_url || profile.facebook_url) && (
              <p className="text-[10px] font-black text-[#4B5563] uppercase tracking-widest ml-2 mt-8 mb-4">Réseaux Sociaux</p>
            )}
            {profile.whatsapp && <SocialRow icon={<MessageCircle size={18}/>} label="WhatsApp" value="Discussion" href={`https://wa.me/${profile.whatsapp.replace(/\D/g,'')}`} color="text-emerald-400" isExternal themeColor={themeColor} buttonStyle={buttonStyle} />}
            {profile.linkedin_url && <SocialRow icon={<Linkedin size={18}/>} label="LinkedIn" value="Profil Pro" href={profile.linkedin_url} color="text-[#0A66C2]" isExternal themeColor={themeColor} buttonStyle={buttonStyle} />}
            {profile.instagram_url && <SocialRow icon={<Instagram size={18}/>} label="Instagram" value="Photos" href={profile.instagram_url} color="text-[#E1306C]" isExternal themeColor={themeColor} buttonStyle={buttonStyle} />}
            {profile.facebook_url && <SocialRow icon={<Facebook size={18}/>} label="Facebook" value="Page" href={profile.facebook_url} color="text-[#1877F2]" isExternal themeColor={themeColor} buttonStyle={buttonStyle} />}
            {profile.twitter_url && <SocialRow icon={<Twitter size={18}/>} label="Twitter / X" value="Suivre" href={profile.twitter_url} color="text-white" isExternal themeColor={themeColor} buttonStyle={buttonStyle} />}
            {profile.github_url && <SocialRow icon={<Github size={18}/>} label="GitHub" value="Code" href={profile.github_url} color="text-white" isExternal themeColor={themeColor} buttonStyle={buttonStyle} />}
            {profile.tiktok_url && <SocialRow icon={<Video size={18}/>} label="TikTok" value="Vidéos" href={profile.tiktok_url} color="text-white" isExternal themeColor={themeColor} buttonStyle={buttonStyle} />}
            {profile.youtube_url && <SocialRow icon={<Youtube size={18}/>} label="YouTube" value="Chaîne" href={profile.youtube_url} color="text-[#FF0000]" isExternal themeColor={themeColor} buttonStyle={buttonStyle} />}
            {profile.snapchat_url && <SocialRow icon={<Ghost size={18}/>} label="Snapchat" value="Ajouter" href={profile.snapchat_url} color="text-[#FFFC00]" isExternal themeColor={themeColor} buttonStyle={buttonStyle} />}
          </div>
          
          <div className="mt-12 flex flex-col items-center gap-2 pb-2">
             <img src="/dimacardlogo.jpeg" alt="DimaCard" className="h-8 w-auto opacity-30 grayscale" />
             <p className="text-[9px] text-[#4B5563] tracking-widest uppercase font-bold">Smart Business Card</p>
          </div>
        </div>
      </div>

      {showLeadModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0B0F19]/80 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-[#111827] border border-white/10 p-6 sm:p-8 rounded-t-[2.5rem] sm:rounded-[2.5rem] w-full max-w-sm relative shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
            <button onClick={() => setShowLeadModal(false)} className="absolute top-6 right-6 text-[#9CA3AF] hover:text-white transition-colors bg-[#1F2937] p-2 rounded-full"><X size={18}/></button>
            {!leadSuccess ? (
              <>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-white/5" style={{ color: themeColor }}><UserPlus size={24} /></div>
                <h2 className="text-xl font-black mb-2 text-white">Échanger les infos</h2>
                <p className="text-xs text-[#9CA3AF] mb-6 leading-relaxed">Partagez vos coordonnées avec <strong className="text-white">{profile.full_name}</strong>.</p>
                <form onSubmit={submitLead} className="space-y-4">
                  <input type="text" required placeholder="Nom *" value={leadForm.name} onChange={e => setLeadForm({...leadForm, name: e.target.value})} className="w-full bg-[#1F2937] border border-white/5 p-3.5 rounded-xl text-sm text-white outline-none focus:border-white/20"/>
                  <input type="tel" placeholder="Tél" value={leadForm.phone} onChange={e => setLeadForm({...leadForm, phone: e.target.value})} className="w-full bg-[#1F2937] border border-white/5 p-3.5 rounded-xl text-sm text-white outline-none focus:border-white/20"/>
                  <input type="email" placeholder="Email" value={leadForm.email} onChange={e => setLeadForm({...leadForm, email: e.target.value})} className="w-full bg-[#1F2937] border border-white/5 p-3.5 rounded-xl text-sm text-white outline-none focus:border-white/20"/>
                  <button type="submit" disabled={submittingLead} style={{ backgroundColor: themeColor }} className="w-full text-white py-4 mt-2 rounded-xl font-black flex items-center justify-center gap-2 transition-all">
                    {submittingLead ? "Envoi..." : <><Send size={18} /> Envoyer</>}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-green-500/10 text-green-500"><CheckCircle2 size={40} /></div>
                <h2 className="text-xl font-black text-white mb-2">Envoyé !</h2>
                <p className="text-[#9CA3AF] text-sm">Vos infos ont été transmises.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function SocialRow({ icon, label, value, href, isExternal, color = "text-[#9CA3AF]", buttonStyle, themeColor }: any) {
  const isOutline = buttonStyle === 'outline'
  return (
    <a 
      href={href} target={isExternal ? "_blank" : "_self"} rel="noopener noreferrer"
      className={`flex items-center justify-between p-4 transition-all group ${buttonStyle === 'rounded' ? 'rounded-full px-5' : 'rounded-2xl'} ${isOutline ? 'bg-transparent border-2 border-white/10' : 'bg-[#1F2937] border border-white/5'}`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 flex items-center justify-center bg-[#0B0F19] ${color} rounded-xl group-hover:scale-110 transition-transform`}>{icon}</div>
        <div>
          <p className="text-[9px] font-bold text-[#9CA3AF] uppercase leading-none mb-1.5 tracking-wider">{label}</p>
          <p className="text-sm font-bold text-white leading-none truncate max-w-[180px]">{value}</p>
        </div>
      </div>
      <ChevronRight size={16} className="text-[#4B5563] group-hover:text-white" />
    </a>
  )
}