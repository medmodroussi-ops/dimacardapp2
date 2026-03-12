'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User, Building2, Phone, Linkedin, Download, Mail, Globe, MessageCircle, ExternalLink } from 'lucide-react'
import { useParams } from 'next/navigation'

export default function PublicProfile() {
  const params = useParams()
  const id = params.id as string

  const supabase = createClient()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProfile() {
      if (!id) return

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

      if (data) setProfile(data)
      setLoading(false)
    }
    
    fetchProfile()
  }, [id])

  const getBase64Image = async (url: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64data = (reader.result as string).split(',')[1] 
          resolve({ base64: base64data, type: blob.type.split('/')[1].toUpperCase() })
        }
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    } catch (error) {
      console.error("Erreur de conversion d'image", error)
      return null
    }
  }

  const downloadVCard = async () => {
    if (!profile) return

    let photoVCard = ''
    if (profile.avatar_url) {
      const imgData: any = await getBase64Image(profile.avatar_url)
      if (imgData) {
        photoVCard = `\nPHOTO;ENCODING=b;TYPE=${imgData.type}:${imgData.base64}`
      }
    }

    // NOUVEAU : On ajoute automatiquement tous les liens personnalisés à la VCard
    let customUrlsVCard = ''
    if (profile.custom_links && Array.isArray(profile.custom_links)) {
      profile.custom_links.forEach((link: any) => {
        if (link.url) customUrlsVCard += `\nURL:${link.url}`
      })
    }

    const vcfData = `BEGIN:VCARD
VERSION:3.0
FN:${profile.full_name || ''}
ORG:${profile.company || ''}
TITLE:${profile.job_title || ''}
TEL;TYPE=WORK,VOICE:${profile.phone || ''}
TEL;TYPE=CELL,VOICE:${profile.whatsapp || ''}
EMAIL;TYPE=WORK:${profile.email_contact || ''}
URL:${profile.website_url || ''}
URL;type=LinkedIn:${profile.linkedin_url || ''}${customUrlsVCard}${photoVCard}
END:VCARD`

    const blob = new Blob([vcfData], { type: 'text/vcard' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${(profile.full_name || 'contact').replace(/\s+/g, '_')}.vcf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><p className="text-slate-500 font-medium animate-pulse">Chargement de la carte...</p></div>
  }

  if (!profile) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><p className="text-slate-500 font-medium">Profil introuvable.</p></div>
  }

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center items-start sm:py-10">
      <div className="w-full max-w-md bg-white sm:rounded-3xl shadow-xl overflow-hidden min-h-screen sm:min-h-0">
        
        <div className="h-40 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-28 h-28 bg-white rounded-full p-1.5 shadow-lg">
            {profile.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt={profile.full_name} 
                className="w-full h-full rounded-full object-cover border border-slate-100"
              />
            ) : (
              <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                <User size={48} />
              </div>
            )}
          </div>
        </div>

        <div className="pt-16 pb-10 px-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">{profile.full_name}</h1>
          <p className="text-blue-600 font-semibold mt-1 text-lg">{profile.job_title}</p>
          {profile.company && (
            <p className="text-slate-500 mt-1 flex items-center justify-center gap-1.5 font-medium">
              <Building2 size={16} /> {profile.company}
            </p>
          )}

          <button 
            onClick={downloadVCard}
            className="mt-8 w-full bg-slate-900 text-white py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            <Download size={20} />
            Enregistrer le contact
          </button>

          <div className="mt-8 text-left space-y-3">
            
            {/* --- CONTACTS STANDARDS --- */}
            {profile.phone && (
              <a href={`tel:${profile.phone}`} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-300 hover:bg-white transition-all group">
                <div className="bg-slate-200 text-slate-700 p-3 rounded-xl group-hover:bg-slate-800 group-hover:text-white transition-colors">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Téléphone</p>
                  <p className="text-slate-900 font-bold">{profile.phone}</p>
                </div>
              </a>
            )}

            {profile.whatsapp && (
              <a href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 hover:border-emerald-300 hover:bg-white transition-all group">
                <div className="bg-emerald-500 text-white p-3 rounded-xl shadow-sm group-hover:bg-emerald-600 transition-colors">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <p className="text-xs text-emerald-700 font-medium">WhatsApp</p>
                  <p className="text-emerald-900 font-bold">{profile.whatsapp}</p>
                </div>
              </a>
            )}

            {profile.email_contact && (
              <a href={`mailto:${profile.email_contact}`} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-300 hover:bg-white transition-all group">
                <div className="bg-red-100 text-red-600 p-3 rounded-xl group-hover:bg-red-500 group-hover:text-white transition-colors">
                  <Mail size={20} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs text-slate-500 font-medium">Email professionnel</p>
                  <p className="text-slate-900 font-bold truncate">{profile.email_contact}</p>
                </div>
              </a>
            )}

            {profile.website_url && (
              <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-300 hover:bg-white transition-all group">
                <div className="bg-purple-100 text-purple-600 p-3 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Globe size={20} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs text-slate-500 font-medium">Site Web</p>
                  <p className="text-slate-900 font-bold truncate">{profile.website_url.replace(/^https?:\/\//, '')}</p>
                </div>
              </a>
            )}

            {profile.linkedin_url && (
              <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-300 hover:bg-white transition-all group">
                <div className="bg-blue-100 text-blue-600 p-3 rounded-xl group-hover:bg-[#0A66C2] group-hover:text-white transition-colors">
                  <Linkedin size={20} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs text-slate-500 font-medium">LinkedIn</p>
                  <p className="text-slate-900 font-bold truncate">{profile.linkedin_url.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}</p>
                </div>
              </a>
            )}

            {/* --- NOUVEAU : LIENS DYNAMIQUES PERSONNALISÉS --- */}
            {profile.custom_links && profile.custom_links.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-200">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 text-center">Liens additionnels</h3>
                <div className="space-y-3">
                  {profile.custom_links.map((link: any) => link.title && link.url && (
                    <a 
                      key={link.id} 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-4 p-4 rounded-2xl bg-white border-2 border-slate-100 hover:border-blue-500 hover:shadow-md transition-all group"
                    >
                      <div className="bg-slate-50 text-slate-400 p-3 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        <ExternalLink size={20} />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-slate-900 font-bold text-sm">{link.title}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{link.url.replace(/^https?:\/\//, '')}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}