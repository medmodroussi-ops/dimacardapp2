'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  User, Building2, Phone, Linkedin, Download, Mail, 
  Globe, MessageCircle, MapPin, ChevronRight, AlignLeft,
  Ban // Icône pour le profil suspendu
} from 'lucide-react'
import { useParams } from 'next/navigation'

export default function PublicProfile() {
  const params = useParams()
  const id = params.id as string
  const supabase = createClient()
  
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isSuspended, setIsSuspended] = useState(false)

  useEffect(() => {
    async function fetchProfile() {
      if (!id) return
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single()
        
        if (error) {
          console.error("Erreur Supabase:", error.message)
        } else if (data) {
          
          // Vérification de l'état
          const currentStatus = data.status ? data.status.toLowerCase().trim() : 'actif'

          if (currentStatus === 'suspendu') {
            setIsSuspended(true)
            setProfile(null) // On cache les données en mémoire
          } else {
            setIsSuspended(false)
            setProfile(data) // On charge les données
          }
        }
      } catch (err) {
        console.error("Erreur inattendue", err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchProfile()
  }, [id, supabase])

  const downloadVCard = () => {
    if (!profile) return
    const vCard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN;CHARSET=UTF-8:${profile.full_name || ''}`,
      `ORG;CHARSET=UTF-8:${profile.company || ''}`,
      `TITLE;CHARSET=UTF-8:${profile.job_title || ''}`,
      `TEL;TYPE=CELL:${profile.phone || ''}`,
      `TEL;TYPE=WORK:${profile.whatsapp || ''}`,
      `EMAIL;TYPE=INTERNET:${profile.email_contact || ''}`,
      `ADR;TYPE=WORK;CHARSET=UTF-8:;;${profile.address || ''};;;`,
      `URL:${profile.website_url || ''}`,
      'END:VCARD'
    ].join('\r\n')

    const blob = new Blob([vCard], { type: 'text/vcard;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${profile.full_name || 'contact'}.vcf`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // --- 1. ÉTAT : CHARGEMENT ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // --- 2. ÉTAT : SUSPENDU ---
  if (isSuspended) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center font-sans">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-6 shadow-sm">
          <Ban size={40} />
        </div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Profil indisponible</h1>
        <p className="mt-3 text-slate-500 max-w-sm">
          Cette carte de visite numérique a été suspendue ou n'est plus accessible pour le moment.
        </p>
        <div className="mt-10 py-6 border-t border-slate-200 w-full max-w-xs flex flex-col items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Propulsé par</span>
            <span className="text-xs font-bold text-slate-300">DimaCardApp</span>
        </div>
      </div>
    )
  }

  // --- 3. ÉTAT : INTROUVABLE ---
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-bold text-slate-500">
        Ce profil n'existe pas.
      </div>
    )
  }

  // --- 4. ÉTAT : AFFICHAGE NORMAL DU PROFIL (Complet) ---
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex justify-center items-start text-slate-900 font-sans">
      <div className="w-full max-w-md flex flex-col min-h-screen bg-white shadow-2xl">
        
        {/* HEADER VISUEL */}
        <div className="relative h-56 w-full">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-700 to-indigo-900"></div>
          <div className="absolute -bottom-12 w-full flex justify-center">
            <div className="w-32 h-32 rounded-[2.5rem] bg-white p-1 shadow-2xl overflow-hidden ring-4 ring-white">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover rounded-[2.2rem]" />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300"><User size={50} /></div>
              )}
            </div>
          </div>
        </div>

        {/* INFOS PRINCIPALES */}
        <div className="mt-16 px-8 text-center">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{profile.full_name}</h1>
          <div className="mt-2 flex flex-col items-center gap-1">
            <span className="text-blue-600 font-extrabold uppercase tracking-widest text-[11px] px-3 py-1 bg-blue-50 rounded-full">
              {profile.job_title}
            </span>
            <div className="flex items-center gap-1.5 text-slate-500 font-medium text-sm mt-1">
              <Building2 size={16} />
              <span>{profile.company || 'Cardmesh'}</span>
            </div>
          </div>
          
          {profile.bio && (
            <div className="mt-5 p-4 bg-slate-50 rounded-2xl text-slate-600 text-sm leading-relaxed text-left border border-slate-100 flex gap-3">
              <AlignLeft size={20} className="text-slate-400 shrink-0 mt-0.5" />
              <p>{profile.bio}</p>
            </div>
          )}
        </div>

        {/* BOUTON ENREGISTRER */}
        <div className="px-6 mt-8">
          <button onClick={downloadVCard} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all">
            <Download size={22} /> Enregistrer le Contact
          </button>
        </div>

        {/* COORDONNÉES ET CONTACTS */}
        <div className="px-6 mt-10 space-y-6 pb-12">
          
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Contact Direct</h3>

          {/* Numéros en gros */}
          <div className="space-y-3">
            {profile.phone && (
              <a href={`tel:${profile.phone}`} className="flex items-center gap-4 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl group transition-all">
                <div className="w-12 h-12 flex items-center justify-center bg-white text-blue-600 rounded-xl shadow-sm"><Phone size={22} /></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-blue-400 uppercase">Téléphone</span>
                  <span className="text-lg font-black text-blue-900">{profile.phone}</span>
                </div>
              </a>
            )}

            {profile.whatsapp && (
              <a href={`https://wa.me/${profile.whatsapp.replace(/\D/g,'')}`} className="flex items-center gap-4 p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl group transition-all">
                <div className="w-12 h-12 flex items-center justify-center bg-white text-emerald-500 rounded-xl shadow-sm"><MessageCircle size={22} /></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">WhatsApp</span>
                  <span className="text-lg font-black text-emerald-900">{profile.whatsapp}</span>
                </div>
              </a>
            )}
          </div>

          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pt-4 ml-1">Informations Complémentaires</h3>
          <div className="space-y-3">
            {profile.email_contact && (
              <div className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl">
                <div className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl"><Mail size={20} /></div>
                <div className="overflow-hidden">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Email</p>
                  <p className="text-sm font-bold text-slate-700 truncate">{profile.email_contact}</p>
                </div>
              </div>
            )}

            {profile.address && (
              <div className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl">
                <div className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl"><MapPin size={20} /></div>
                <div className="overflow-hidden">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Adresse</p>
                  <p className="text-sm font-bold text-slate-700">{profile.address}</p>
                </div>
              </div>
            )}

            {profile.website_url && (
              <a href={profile.website_url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-xl"><Globe size={20} /></div>
                  <span className="text-sm font-bold text-slate-700">Site Internet</span>
                </div>
                <ChevronRight size={18} className="text-slate-300" />
              </a>
            )}

            {profile.linkedin_url && (
              <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 flex items-center justify-center bg-[#0A66C2]/10 text-[#0A66C2] rounded-xl"><Linkedin size={20} /></div>
                  <span className="text-sm font-bold text-slate-700">Profil LinkedIn</span>
                </div>
                <ChevronRight size={18} className="text-slate-300" />
              </a>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="py-12 flex flex-col items-center gap-3">
          <div className="h-px w-12 bg-slate-200"></div>
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">Cardmesh Digital</p>
        </div>
      </div>
    </div>
  )
}