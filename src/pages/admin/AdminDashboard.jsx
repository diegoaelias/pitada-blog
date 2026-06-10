import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPosts, deletePost } from '../../lib/supabase'
import { Plus, Edit3, Trash2, Search, Calendar, FileText, CheckCircle, Clock } from 'lucide-react'

export default function AdminDashboard() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      setLoading(true)
      const data = await getPosts()
      setPosts(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir permanentemente este artigo? Esta ação não pode ser desfeita.')) return
    
    setDeletingId(id)
    setDeleteError('')
    
    try {
      await deletePost(id)
      setPosts(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      setDeleteError('Erro ao deletar post: ' + err.message)
      console.error(err)
    } finally {
      setDeletingId(null)
    }
  }

  // Count stats
  const totalPosts = posts.length
  const publishedCount = posts.filter(p => p.status === 'publicado').length
  const draftCount = posts.filter(p => p.status === 'rascunho').length

  // Filtered posts
  const filtered = posts.filter(p => 
    p.titulo.toLowerCase().includes(search.toLowerCase()) ||
    (p.excerpt || '').toLowerCase().includes(search.toLowerCase())
  )

  const formatDate = (iso) => {
    if (!iso) return '-'
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <div className="space-y-6">
      {/* Header page */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#4A2545]">Artigos do Blog</h1>
          <p className="text-xs text-gray-500">Crie, edite e gerencie o conteúdo do seu blog.</p>
        </div>
        <Link
          to="/admin/novo"
          className="flex items-center gap-1.5 bg-[#C8853A] hover:bg-[#E09B4A] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#C8853A]/20"
        >
          <Plus className="w-4 h-4" />
          Novo Artigo
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-gray-50 text-gray-500 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total de Artigos</p>
            <p className="text-xl font-extrabold text-gray-800">{totalPosts}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-[#2D7A4F] rounded-xl">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Publicados</p>
            <p className="text-xl font-extrabold text-[#2D7A4F]">{publishedCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-[#C8853A] rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Rascunhos</p>
            <p className="text-xl font-extrabold text-[#C8853A]">{draftCount}</p>
          </div>
        </div>
      </div>

      {deleteError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
          {deleteError}
        </div>
      )}

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Search/Filter Bar */}
        <div className="p-4 border-b border-gray-100 flex items-center relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-8 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por título ou resumo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#C8853A]/50 focus:border-[#C8853A] transition-all"
          />
        </div>

        {/* Loading state */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-[#4A2545] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-gray-500">Carregando artigos...</p>
          </div>
        )}

        {/* Table */}
        {!loading && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase border-b border-gray-100">
                  <th className="py-3.5 px-6">Artigo</th>
                  <th className="py-3.5 px-4 w-32">Status</th>
                  <th className="py-3.5 px-4 w-36">Publicado em</th>
                  <th className="py-3.5 px-6 w-32 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filtered.map(post => (
                  <tr key={post.id} className="hover:bg-gray-50/40 transition-colors">
                    {/* Artigo Info */}
                    <td className="py-4 px-6 flex items-start gap-4">
                      {post.cover_url ? (
                        <img 
                          src={post.cover_url} 
                          alt="" 
                          className="w-12 h-12 object-cover rounded-lg border border-gray-100 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 text-gray-300">
                          🍰
                        </div>
                      )}
                      <div className="space-y-0.5">
                        <Link 
                          to={post.status === 'publicado' ? `/${post.slug}` : `/admin/editar/${post.id}`}
                          className="font-bold text-gray-800 hover:text-[#C8853A] transition-colors line-clamp-1"
                        >
                          {post.titulo}
                        </Link>
                        <p className="text-xs text-gray-400 line-clamp-1">{post.excerpt || 'Sem resumo cadastrado.'}</p>
                      </div>
                    </td>

                    {/* Status badge */}
                    <td className="py-4 px-4 vertical-middle">
                      <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                        post.status === 'publicado' 
                          ? 'bg-green-50 text-[#2D7A4F]' 
                          : 'bg-orange-50 text-[#C8853A]'
                      }`}>
                        {post.status === 'publicado' ? 'Publicado' : 'Rascunho'}
                      </span>
                    </td>

                    {/* Published At */}
                    <td className="py-4 px-4 text-xs text-gray-500 vertical-middle">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {formatDate(post.published_at || post.created_at)}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="py-4 px-6 text-right vertical-middle">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/editar/${post.id}`}
                          className="p-1.5 text-gray-500 hover:text-[#C8853A] hover:bg-gray-50 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id)}
                          disabled={deletingId === post.id}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 space-y-3">
            <span className="text-4xl">📚</span>
            <p className="text-gray-500 font-medium">Nenhum artigo encontrado.</p>
            {search ? (
              <button 
                onClick={() => setSearch('')} 
                className="text-[#C8853A] text-xs font-bold underline"
              >
                Limpar busca
              </button>
            ) : (
              <Link 
                to="/admin/novo" 
                className="inline-block text-[#C8853A] text-xs font-bold underline"
              >
                Criar seu primeiro post
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
