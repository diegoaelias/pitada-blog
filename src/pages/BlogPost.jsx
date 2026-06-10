import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getPostBySlug } from '../lib/supabase'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Clock, ArrowLeft, Share2, Check } from 'lucide-react'

function readingTime(html = '') {
  const words = html.replace(/<[^>]*>/g, '').split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function BlogPost() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    getPostBySlug(slug)
      .then(data => {
        setPost(data)
        if (data && data.titulo) {
          document.title = `${data.titulo} | Blog do Pitada`
        }
      })
      .catch(() => navigate('/', { replace: true }))
      .finally(() => setLoading(false))
  }, [slug, navigate])

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleWhatsApp = () => {
    const text = `Leia esse artigo: ${post.titulo} — ${window.location.href}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  if (loading) return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-20 space-y-4">
        <div className="h-8 bg-gray-200 rounded-xl animate-pulse w-3/4" />
        <div className="h-4 bg-gray-100 rounded animate-pulse" />
        <div className="h-4 bg-gray-100 rounded animate-pulse w-4/5" />
      </div>
    </div>
  )

  if (!post) return null

  const minutes = readingTime(post.conteudo)

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar />

      {/* Hero cover */}
      {post.cover_url && (
        <div className="w-full aspect-[21/9] max-h-[480px] overflow-hidden bg-[#4A2545]/10">
          <img src={post.cover_url} alt={post.titulo} className="w-full h-full object-cover" />
        </div>
      )}

      <main className="max-w-2xl mx-auto px-4 py-10">
        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4A2545]/60 hover:text-[#4A2545] transition-colors mb-8">
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao blog
        </Link>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map(tag => (
              <span key={tag} className="text-[10px] font-bold uppercase tracking-wider bg-[#4A2545]/8 text-[#4A2545] px-2.5 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a1a1a] leading-tight mb-4">
          {post.titulo}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-gray-400 mb-10 pb-8 border-b border-gray-100">
          <span>{formatDate(post.published_at || post.created_at)}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {minutes} min de leitura
          </span>
        </div>

        {/* Content — renders HTML with prose styles and cta-block */}
        <div
          className="prose prose-sm sm:prose-base max-w-none prose-headings:font-extrabold prose-a:text-[#C8853A] prose-blockquote:border-l-[#C8853A]"
          dangerouslySetInnerHTML={{ __html: post.conteudo }}
        />

        {/* Share section */}
        <div className="mt-14 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-bold text-[#4A2545]">Gostou? Compartilhe!</p>
          <div className="flex gap-3">
            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-2 text-xs font-bold bg-[#25D366] text-white px-4 py-2 rounded-xl hover:brightness-105 transition-all"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.122.554 4.11 1.523 5.834L.052 23.9l6.235-1.496A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.806 9.806 0 01-5.007-1.373l-.36-.213-3.7.888.937-3.61-.235-.371A9.79 9.79 0 012.182 12c0-5.422 4.396-9.818 9.818-9.818 5.422 0 9.818 4.396 9.818 9.818 0 5.422-4.396 9.818-9.818 9.818z"/></svg>
              WhatsApp
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-xs font-bold border border-gray-200 text-gray-600 px-4 py-2 rounded-xl hover:border-[#4A2545]/30 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
              {copied ? 'Copiado!' : 'Copiar link'}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
