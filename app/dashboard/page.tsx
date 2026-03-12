'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  Upload, Loader2, Link as LinkIcon, Copy, ExternalLink, 
  LogOut, Save, User as UserIcon, Briefcase, Phone, Globe, Plus, Trash2,
  QrCode, X, Download // 🟢 Ajout des icônes nécessaires pour le QR Code
} from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react' // 🟢 Importation de la librairie QR Code

export default function Dashboard() {
  const supabase = createClient()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  
  // 🟢 Nouvel état pour gérer l'affichage de la fenêtre du QR Code
  const [showQrModal, setShowQrModal] = useState(false)
  
  const [profile, setProfile] = useState({
    full_name: '',
    job_title: '',
    company: '',
    phone: '',
    linkedin_url: '',
    avatar_url: '',
    email_contact: '', 
    website_url: '',   
    whatsapp: '',
    custom_links: [] as { id: string, title: string, url: string }[]
  })

  useEffect(() => {
    getProfile()
  }, [])

  async function getProfile() {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }
      
      setUserId(user.id)

      const { data, error } = await supabase
        .from('profiles')
        .select(`full_name, job_title, company, phone, linkedin_url, avatar_url, email_contact, website_url, whatsapp, custom_links`)
        .eq('id', user.id)
        .single()

      if (data) {
        const d = data as any;
        setProfile({
          full_name: d.full_name || '',
          job_title: d.job_title || '',
          company: d.company || '',
          phone: d.phone || '',
          linkedin_url: d.linkedin_url || '',
          avatar_url: d.avatar_url || '',
          email_contact: d.email_contact || '',
          website_url: d.website_url || '',    
          whatsapp: d.whatsapp || '',
          custom_links: d.custom_links || [] 
        })
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (userId) {
      const url = `${window.location.origin}/p/${userId}`
      navigator.clipboard.writeText(url)
      alert('Lien public copié dans le presse-papier !')
    }
  }

  // 🟢 Fonction pour télécharger le QR Code du client
  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream')
      let downloadLink = document.createElement('a')
      downloadLink.href = pngUrl
      downloadLink.download = `Mon_QRCode_${profile.full_name || 'Profil'}.png`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const addCustomLink = () => {
    setProfile({
      ...profile,
      custom_links: [...profile.custom_links, { id: Date.now().toString(), title: '', url: '' }]
    })
  }

  const updateCustomLink = (id: string, field: 'title' | 'url', value: string) => {
    const updatedLinks = profile.custom_links.map(link => 
      link.id === id ? { ...link, [field]: value } : link
    )
    setProfile({ ...profile, custom_links: updatedLinks })
  }

  const removeCustomLink = (id: string) => {
    const updatedLinks = profile.custom_links.filter(link => link.id !== id)
    setProfile({ ...profile, custom_links: updatedLinks })
  }

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploadingImage(true)
      if (!event.target.files || event.target.files.length === 0) throw new Error('Vous devez sélectionner une image.')

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const { data: { user } } = await supabase.auth.getUser()
      const filePath = `${user?.id}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true })
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath)
      setProfile({ ...profile, avatar_url: publicUrl })
    } catch (error) {
      alert('Erreur lors du téléchargement de l\'image.')
    } finally {
      setUploadingImage(false)
    }
  }

  async function updateProfile(e: React.FormEvent) {
    e.preventDefault()
    try {
      setUpdating(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Aucun utilisateur connecté')

      const updates = {
        id: user.id,
        ...profile,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from('profiles').upsert(updates)
      if (error) throw error
      alert('Profil mis à jour avec succès !')
    } catch (error) {
      alert('Erreur lors de la mise à jour des données.')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
        <p className="text-slate-500 font-medium">Chargement de votre espace...</p>
      </div>
    )
  }

  const publicUrl = userId && typeof window !== 'undefined' ? `${window.location.origin}/p/${userId}` : ''

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                <LinkIcon size={20} />
              </div>
              <span className="text-xl font-bold text-slate-900">DimaCardAPP</span>
            </div>
            <button onClick={handleSignOut} className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-red-600 transition-colors">
              <LogOut size={18} />
              <span className="hidden sm:inline">Se déconnecter</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Mon Profil Digitale</h1>
          <p className="text-slate-500 mt-2">Gérez les informations de votre carte de visite digitale.</p>
        </div>
        
        {userId && (
          <div className="mb-8 p-5 bg-white border border-blue-100 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <div className="flex items-center gap-4 overflow-hidden pl-2">
              <div className="bg-blue-50 p-3 rounded-xl text-blue-600 shrink-0">
                <LinkIcon size={24} />
              </div>
              <div className="truncate">
                <p className="text-sm font-bold text-slate-900">Votre lien public</p>
                <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate block flex items-center gap-1 mt-0.5">
                  {publicUrl} <ExternalLink size={14} />
                </a>
              </div>
            </div>
            
            {/* 🟢 Ajout du bouton QR Code à côté de Copier le lien */}
            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2 shrink-0">
              <button onClick={() => setShowQrModal(true)} className="w-full sm:w-auto bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                <QrCode size={16} /> Mon QR Code
              </button>
              <button onClick={copyToClipboard} className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                <Copy size={16} /> Copier le lien
              </button>
            </div>
          </div>
        )}

        <form onSubmit={updateProfile} className="space-y-6">
          
          {/* BLOC 1 : Photo */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <UserIcon className="text-blue-600" size={20} /> Photo de profil
            </h2>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full bg-slate-100 border-4 border-white shadow-md relative group">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-slate-300"><UserIcon size={40} /></div>
                )}
                {uploadingImage && <div className="absolute inset-0 bg-white/70 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={24} /></div>}
              </div>
              <div className="text-center sm:text-left">
                <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors inline-flex items-center gap-2">
                  <Upload size={16} /> Changer l'image
                  <input type="file" className="hidden" accept="image/*" onChange={uploadAvatar} disabled={uploadingImage} />
                </label>
              </div>
            </div>
          </div>

          {/* BLOC 2 : Infos Générales */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Briefcase className="text-blue-600" size={20} /> Informations générales
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nom et Prénom</label>
                <input type="text" value={profile.full_name} onChange={(e) => setProfile({...profile, full_name: e.target.value})} className="block w-full rounded-xl border-slate-200 bg-slate-50 border px-4 py-2.5 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Poste / Fonction</label>
                <input type="text" value={profile.job_title} onChange={(e) => setProfile({...profile, job_title: e.target.value})} className="block w-full rounded-xl border-slate-200 bg-slate-50 border px-4 py-2.5 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Entreprise</label>
                <input type="text" value={profile.company} onChange={(e) => setProfile({...profile, company: e.target.value})} className="block w-full rounded-xl border-slate-200 bg-slate-50 border px-4 py-2.5 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
              </div>
            </div>
          </div>

          {/* BLOC 3 : Coordonnées et Base */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Phone className="text-blue-600" size={20} /> Contacts standards
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Téléphone Mobile</label>
                <input type="tel" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} className="block w-full rounded-xl border-slate-200 bg-slate-50 border px-4 py-2.5 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Numéro WhatsApp</label>
                <input type="tel" value={profile.whatsapp} onChange={(e) => setProfile({...profile, whatsapp: e.target.value})} className="block w-full rounded-xl border-slate-200 bg-slate-50 border px-4 py-2.5 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email </label>
                <input type="email" value={profile.email_contact} onChange={(e) => setProfile({...profile, email_contact: e.target.value})} className="block w-full rounded-xl border-slate-200 bg-slate-50 border px-4 py-2.5 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Site Web</label>
                <input type="url" value={profile.website_url} onChange={(e) => setProfile({...profile, website_url: e.target.value})} className="block w-full rounded-xl border-slate-200 bg-slate-50 border px-4 py-2.5 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Profil LinkedIn</label>
                <input type="url" value={profile.linkedin_url} onChange={(e) => setProfile({...profile, linkedin_url: e.target.value})} className="block w-full rounded-xl border-slate-200 bg-slate-50 border px-4 py-2.5 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
              </div>
            </div>
          </div>

          {/* BLOC 4 : Liens Personnalisés Dynamiques */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Globe className="text-blue-600" size={20} /> Liens additionnels
            </h2>
            <p className="text-sm text-slate-500 mb-6">Ajoutez d'autres liens spécifiques (Portfolio, Instagram, Calendly, Menu de restaurant...)</p>
            
            <div className="space-y-4 mb-6">
              {profile.custom_links.map((link) => (
                <div key={link.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="w-full sm:w-1/3">
                    <input 
                      type="text" 
                      placeholder="Titre (ex: Mon Instagram)" 
                      value={link.title} 
                      onChange={(e) => updateCustomLink(link.id, 'title', e.target.value)}
                      className="block w-full rounded-lg border-slate-200 bg-white border px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                  <div className="w-full sm:w-flex-1 flex-1">
                    <input 
                      type="url" 
                      placeholder="URL (ex: https://instagram.com/...)" 
                      value={link.url} 
                      onChange={(e) => updateCustomLink(link.id, 'url', e.target.value)}
                      className="block w-full rounded-lg border-slate-200 bg-white border px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removeCustomLink(link.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer ce lien"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>

            <button 
              type="button" 
              onClick={addCustomLink}
              className="w-full border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-xl py-3 flex items-center justify-center gap-2 font-medium transition-colors"
            >
              <Plus size={18} /> Ajouter un nouveau lien
            </button>
          </div>

          <div className="pt-6 pb-12 flex justify-end">
            <button type="submit" disabled={updating} className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
              {updating ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {updating ? 'Enregistrement en cours...' : 'Enregistrer les modifications'}
            </button>
          </div>

        </form>
      </main>

      {/* 🟢 MODAL QR CODE DU CLIENT */}
      {showQrModal && userId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl overflow-hidden p-8 text-center relative">
            <button onClick={() => setShowQrModal(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-all">
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-black text-slate-900 mb-1">Mon QR Code</h2>
            <p className="text-sm text-slate-500 mb-8">Scannez pour voir votre carte de visite</p>

            <div className="flex justify-center bg-slate-50 p-6 rounded-3xl border border-slate-100 inline-block mx-auto mb-8">
              <QRCodeCanvas 
                id="qr-canvas"
                value={`${window.location.origin}/p/${userId}`} 
                size={200}
                bgColor={"#ffffff"}
                fgColor={"#0f172a"}
                level={"H"}
                includeMargin={false}
              />
            </div>

            <button onClick={downloadQRCode} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-200">
              <Download size={20} /> Télécharger l'image PNG
            </button>
          </div>
        </div>
      )}

    </div>
  )
}