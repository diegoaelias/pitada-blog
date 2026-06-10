import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import LinkExtension from '@tiptap/extension-link'
import ImageExtension from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import { 
  ArrowLeft, Save, Globe, Eye, Image as ImageIcon, Plus, 
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, 
  Heading2, Heading3, Quote, Link2, Unlink, Sparkles, Loader2, X 
} from 'lucide-react'
import { supabase, savePost, uploadImage } from '../../lib/supabase'

export default function PostEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const coverInputRef = useRef(null)

  // Form states
  const [titulo, setTitulo] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [status, setStatus] = useState('rascunho')
  const [publishedAt, setPublishedAt] = useState(null)

  // UI/Flow states
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false)
  
  // Modals
  const [ctaModalOpen, setCtaModalOpen] = useState(false)
  const [ctaText, setCtaText] = useState('')
  const [ctaBtnLabel, setCtaBtnLabel] = useState('')
  const [ctaBtnUrl, setCtaBtnUrl] = useState('')

  const [previewOpen, setPreviewOpen] = useState(false)

  // Configure TipTap Editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#C8853A] underline font-medium hover:text-[#E09B4A]'
        }
      }),
      ImageExtension.configure({
        HTMLAttributes: {
          class: 'rounded-2xl max-w-full my-6 border border-gray-100 shadow-md mx-auto block max-h-[350px] object-cover'
        }
      }),
      Placeholder.configure({
        placeholder: 'Comece a escrever a história do seu artigo aqui...',
      })
    ],
    content: '',
  })

  // Load post details if editing
  useEffect(() => {
    if (!id) return
    
    const fetchPost = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error

        setTitulo(data.titulo)
        setSlug(data.slug)
        setExcerpt(data.excerpt || '')
        setCoverUrl(data.cover_url || '')
        setTagsInput((data.tags || []).join(', '))
        setSeoDescription(data.seo_description || '')
        setStatus(data.status)
        setPublishedAt(data.published_at)
        setIsSlugManuallyEdited(true)

        if (editor) {
          editor.commands.setContent(data.conteudo || '')
        }
      } catch (err) {
        console.error(err)
        setErrorMsg('Erro ao carregar o artigo: ' + err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [id, editor])

  // Sync content when editor loads if editing data arrived first
  useEffect(() => {
    if (id && editor && titulo && !editor.getText()) {
      // Fetch post again or trigger content update if available
      supabase.from('posts').select('conteudo').eq('id', id).single()
        .then(({ data }) => {
          if (data) editor.commands.setContent(data.conteudo || '')
        })
    }
  }, [editor])

  // Auto generate slug from title
  const handleTitleChange = (val) => {
    setTitulo(val)
    if (!isSlugManuallyEdited && !id) {
      const generated = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remove accents
        .replace(/[^a-z0-9\s-]/g, '')    // remove spec chars
        .trim()
        .replace(/\s+/g, '-')            // replace spaces with hyphens
        .replace(/-+/g, '-')             // remove consecutive hyphens
      setSlug(generated)
    }
  }

  // Cover upload
  const handleCoverUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    try {
      setSaving(true)
      setErrorMsg('')
      const url = await uploadImage(file, 'blog-covers')
      setCoverUrl(url)
      setSuccessMsg('Imagem de capa enviada com sucesso!')
    } catch (err) {
      setErrorMsg('Erro no upload da capa: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  // Inline image upload for the editor
  const handleInlineImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    try {
      setSaving(true)
      setErrorMsg('')
      const url = await uploadImage(file, 'blog-images')
      editor.chain().focus().setImage({ src: url }).run()
      setSuccessMsg('Imagem inserida no texto!')
    } catch (err) {
      setErrorMsg('Erro no upload da imagem: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  // Insert CTA Block
  const handleInsertCta = () => {
    if (!ctaText || !ctaBtnLabel || !ctaBtnUrl) return

    const ctaHtml = `
      <div class="cta-block">
        <p>${ctaText}</p>
        <a href="${ctaBtnUrl}" target="_blank" rel="noopener noreferrer">${ctaBtnLabel}</a>
      </div>
    `
    editor.chain().focus().insertContent(ctaHtml).run()
    
    // Reset modal
    setCtaText('')
    setCtaBtnLabel('')
    setCtaBtnUrl('')
    setCtaModalOpen(false)
  }

  // Save functionality
  const handleSave = async (targetStatus) => {
    if (!titulo.trim()) {
      setErrorMsg('O título é obrigatório.')
      return
    }
    if (!slug.trim()) {
      setErrorMsg('O slug é obrigatório.')
      return
    }

    setSaving(true)
    setErrorMsg('')
    setSuccessMsg('')

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)

    const now = new Date().toISOString()
    const finalPublishedAt = targetStatus === 'publicado' 
      ? (publishedAt || now) 
      : publishedAt

    const postPayload = {
      titulo,
      slug,
      excerpt,
      conteudo: editor.getHTML(),
      cover_url: coverUrl,
      tags,
      status: targetStatus,
      seo_description: seoDescription,
      published_at: finalPublishedAt
    }

    if (id) {
      postPayload.id = id
    }

    try {
      const saved = await savePost(postPayload)
      setSuccessMsg(`Artigo salvo com sucesso como ${targetStatus === 'publicado' ? 'Publicado' : 'Rascunho'}!`)
      setStatus(targetStatus)
      if (finalPublishedAt) setPublishedAt(finalPublishedAt)
      
      // If creating a new post, redirect to edit screen
      if (!id) {
        setTimeout(() => navigate(`/admin/editar/${saved.id}`), 1000)
      }
    } catch (err) {
      setErrorMsg('Erro ao salvar o artigo: ' + err.message)
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  // Link promoter
  const handleAddLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL do link:', previousUrl)

    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-8 h-8 text-[#4A2545] animate-spin" />
        <p className="text-xs text-gray-500">Buscando detalhes do artigo...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
        <div className="flex items-center gap-2">
          <Link to="/admin" className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-[#4A2545] transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-[#4A2545]">
              {id ? 'Editar Artigo' : 'Novo Artigo'}
            </h1>
            <p className="text-xs text-gray-500">Desenhe seu post perfeito com imagens e CTAs de conversão.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setPreviewOpen(true)}
            className="flex items-center gap-1.5 bg-white border border-gray-200 hover:border-[#4A2545]/20 text-[#4A2545] px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Eye className="w-4 h-4" />
            Pré-visualizar
          </button>
          
          <button
            onClick={() => handleSave('rascunho')}
            disabled={saving}
            className="flex items-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-sm"
          >
            <Save className="w-4 h-4 text-gray-400" />
            Salvar Rascunho
          </button>

          <button
            onClick={() => handleSave('publicado')}
            disabled={saving}
            className="flex items-center gap-1.5 bg-[#4A2545] hover:bg-[#6B3566] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-md shadow-[#4A2545]/15"
          >
            <Globe className="w-4 h-4 text-[#C8853A]" />
            Publicar
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-green-50 border border-green-200 text-[#2D7A4F] rounded-xl text-xs font-semibold">
          {successMsg}
        </div>
      )}

      {/* Editor two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Content Editor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            {/* Title Input */}
            <input
              type="text"
              placeholder="Digite o título marcante do artigo..."
              value={titulo}
              onChange={e => handleTitleChange(e.target.value)}
              className="w-full text-xl sm:text-2xl font-extrabold text-[#1a1a1a] placeholder-gray-300 border-none outline-none focus:ring-0 p-0"
            />

            {/* TipTap Toolbar */}
            {editor && (
              <div className="border border-gray-100 rounded-xl overflow-hidden bg-gray-50/50">
                <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border-b border-gray-100">
                  <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-1.5 rounded-lg transition-all ${editor.isActive('bold') ? 'bg-[#4A2545] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                    title="Negrito"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-1.5 rounded-lg transition-all ${editor.isActive('italic') ? 'bg-[#4A2545] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                    title="Itálico"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={`p-1.5 rounded-lg transition-all ${editor.isActive('underline') ? 'bg-[#4A2545] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                    title="Sublinhado"
                  >
                    <UnderlineIcon className="w-4 h-4" />
                  </button>
                  
                  <div className="w-px h-6 bg-gray-200 mx-1" />

                  <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`p-1.5 rounded-lg transition-all ${editor.isActive('heading', { level: 2 }) ? 'bg-[#4A2545] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                    title="Título 2"
                  >
                    <Heading2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={`p-1.5 rounded-lg transition-all ${editor.isActive('heading', { level: 3 }) ? 'bg-[#4A2545] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                    title="Título 3"
                  >
                    <Heading3 className="w-4 h-4" />
                  </button>

                  <div className="w-px h-6 bg-gray-200 mx-1" />

                  <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-1.5 rounded-lg transition-all ${editor.isActive('bulletList') ? 'bg-[#4A2545] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                    title="Lista de marcadores"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-1.5 rounded-lg transition-all ${editor.isActive('orderedList') ? 'bg-[#4A2545] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                    title="Lista numerada"
                  >
                    <ListOrdered className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={`p-1.5 rounded-lg transition-all ${editor.isActive('blockquote') ? 'bg-[#4A2545] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                    title="Citação"
                  >
                    <Quote className="w-4 h-4" />
                  </button>

                  <div className="w-px h-6 bg-gray-200 mx-1" />

                  <button
                    onClick={handleAddLink}
                    className={`p-1.5 rounded-lg transition-all ${editor.isActive('link') ? 'bg-[#4A2545] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                    title="Inserir Link"
                  >
                    <Link2 className="w-4 h-4" />
                  </button>
                  {editor.isActive('link') && (
                    <button
                      onClick={() => editor.chain().focus().unsetLink().run()}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-gray-100 transition-all"
                      title="Remover Link"
                    >
                      <Unlink className="w-4 h-4" />
                    </button>
                  )}

                  <div className="w-px h-6 bg-gray-200 mx-1" />

                  {/* Inline image file input */}
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleInlineImageUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-all flex items-center gap-1 text-xs"
                    title="Inserir Imagem Inline"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>

                  {/* CTA Block Inserter */}
                  <button
                    onClick={() => setCtaModalOpen(true)}
                    className="p-1.5 text-[#C8853A] hover:bg-orange-50 rounded-lg transition-all flex items-center gap-1 text-xs font-bold"
                    title="Inserir Caixa de CTA"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Inserir CTA
                  </button>
                </div>

                <div className="p-4 bg-white min-h-[400px]">
                  <EditorContent editor={editor} className="prose prose-sm sm:prose-base max-w-none" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Settings Panel */}
        <div className="space-y-6">
          {/* Cover Image Box */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="text-xs font-bold text-[#4A2545] uppercase tracking-wider">Imagem de Capa</h2>
            
            {coverUrl ? (
              <div className="space-y-3">
                <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                  <img src={coverUrl} alt="Capa" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setCoverUrl('')}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 break-all">{coverUrl}</p>
              </div>
            ) : (
              <div 
                onClick={() => coverInputRef.current.click()}
                className="border-2 border-dashed border-gray-200 hover:border-[#C8853A]/40 rounded-xl p-8 text-center cursor-pointer transition-all bg-gray-50/50 flex flex-col items-center justify-center gap-2"
              >
                <ImageIcon className="w-6 h-6 text-gray-400" />
                <span className="text-xs text-gray-500 font-bold">Enviar Imagem</span>
                <span className="text-[10px] text-gray-400">Recomendado: 1200x630px</span>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              ref={coverInputRef}
              onChange={handleCoverUpload}
              className="hidden"
            />
          </div>

          {/* Settings Fields */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="text-xs font-bold text-[#4A2545] uppercase tracking-wider">Metadados do Post</h2>
            
            {/* Slug */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-500 uppercase">Slug da URL</label>
              <input
                type="text"
                placeholder="slug-do-artigo"
                value={slug}
                onChange={e => {
                  setSlug(e.target.value)
                  setIsSlugManuallyEdited(true)
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#C8853A]/50 focus:border-[#C8853A] font-mono"
              />
              <p className="text-[10px] text-gray-400 font-medium">Use apenas letras minúsculas, números e hifens.</p>
            </div>

            {/* Excerpt */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-500 uppercase">Resumo / Excerpt</label>
              <textarea
                placeholder="Uma breve introdução atrativa que aparecerá nos cards do blog..."
                value={excerpt}
                onChange={e => setExcerpt(e.target.value)}
                rows={3}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#C8853A]/50 focus:border-[#C8853A] resize-none"
              />
            </div>

            {/* Tags */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-500 uppercase">Tags (Separadas por vírgula)</label>
              <input
                type="text"
                placeholder="Precificação, Finanças, Receitas"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#C8853A]/50 focus:border-[#C8853A]"
              />
            </div>

            {/* SEO Description */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-500 uppercase">Meta Descrição (SEO)</label>
              <textarea
                placeholder="Descrição resumida para mecanismos de busca (Google)..."
                value={seoDescription}
                onChange={e => setSeoDescription(e.target.value)}
                rows={3}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#C8853A]/50 focus:border-[#C8853A] resize-none"
              />
            </div>

            {/* Current Status display */}
            <div className="pt-2 flex justify-between items-center text-xs">
              <span className="text-gray-400 font-bold">Status Atual:</span>
              <span className={`font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-[10px] ${
                status === 'publicado' ? 'bg-green-50 text-[#2D7A4F]' : 'bg-orange-50 text-[#C8853A]'
              }`}>
                {status === 'publicado' ? 'Publicado' : 'Rascunho'}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* CTA Insertion Modal */}
      {ctaModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 border border-gray-100 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-[#4A2545] text-base flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-[#C8853A]" />
                Configurar CTA de Conversão
              </h3>
              <button onClick={() => setCtaModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              O CTA insere uma caixa visual chamativa dentro do seu texto para guiar a confeiteira a comprar ou entrar em contato.
            </p>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Texto do Chamado (CTA)</label>
                <input
                  type="text"
                  placeholder="Ex: Quer aprender a precificar de forma simples e lucrar mais?"
                  value={ctaText}
                  onChange={e => setCtaText(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#C8853A]/50 focus:border-[#C8853A]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Etiqueta do Botão</label>
                <input
                  type="text"
                  placeholder="Ex: Baixar Planilha Grátis!"
                  value={ctaBtnLabel}
                  onChange={e => setCtaBtnLabel(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#C8853A]/50 focus:border-[#C8853A]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Link do Botão (URL)</label>
                <input
                  type="text"
                  placeholder="Ex: https://usepitada.com ou link do Whatsapp"
                  value={ctaBtnUrl}
                  onChange={e => setCtaBtnUrl(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#C8853A]/50 focus:border-[#C8853A]"
                />
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setCtaModalOpen(false)}
                className="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-xs font-bold transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleInsertCta}
                disabled={!ctaText || !ctaBtnLabel || !ctaBtnUrl}
                className="w-1/2 bg-[#C8853A] hover:bg-[#E09B4A] text-white py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              >
                Inserir Bloco
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FDFBF7] w-full max-w-3xl h-[85vh] rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
            {/* Preview Header */}
            <div className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Pré-visualização do Post</span>
              </div>
              <button 
                onClick={() => setPreviewOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview Content Simulator */}
            <div className="flex-1 overflow-y-auto px-6 py-8">
              <article className="max-w-2xl mx-auto space-y-6">
                {/* Cover simulation */}
                {coverUrl && (
                  <div className="w-full aspect-[21/9] rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                    <img src={coverUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Tags simulation */}
                {tagsInput && (
                  <div className="flex flex-wrap gap-1.5">
                    {tagsInput.split(',').map(t => t.trim()).filter(t => t).map(tag => (
                      <span key={tag} className="text-[9px] font-bold uppercase tracking-wider bg-[#4A2545]/8 text-[#4A2545] px-2.5 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a1a1a] leading-tight">
                  {titulo || 'Sem Título'}
                </h1>

                {/* Meta simulation */}
                <div className="flex items-center gap-3 text-xs text-gray-400 pb-5 border-b border-gray-100">
                  <span>{new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                  <span>•</span>
                  <span>Tempo de leitura estimado</span>
                </div>

                {/* Content HTML */}
                <div 
                  className="prose prose-sm sm:prose-base max-w-none prose-headings:font-extrabold prose-a:text-[#C8853A] prose-blockquote:border-l-[#C8853A]"
                  dangerouslySetInnerHTML={{ __html: editor ? editor.getHTML() : '' }}
                />
              </article>
            </div>
            
            {/* Footer buttons */}
            <div className="bg-white border-t border-gray-100 px-6 py-4 text-right">
              <button
                onClick={() => setPreviewOpen(false)}
                className="bg-[#4A2545] hover:bg-[#6B3566] text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                Voltar ao Editor
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
