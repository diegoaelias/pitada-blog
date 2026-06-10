import React, { useEffect, useState } from 'react'
import { getPosts } from '../lib/supabase'
import PostCard from '../components/PostCard'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Search } from 'lucide-react'

export default function Blog() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState(null)

  useEffect(() => {
    getPosts({ status: 'publicado' })
      .then(setPosts)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Collect all unique tags
  const allTags = [...new Set(posts.flatMap(p => p.tags || []))]

  const filtered = posts.filter(p => {
    const matchSearch = !search || p.titulo.toLowerCase().includes(search.toLowerCase()) || (p.excerpt || '').toLowerCase().includes(search.toLowerCase())
    const matchTag = !activeTag || (p.tags || []).includes(activeTag)
    return matchSearch && matchTag
  })

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#4A2545] to-[#6B3566] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[#C8853A]">Blog do Pitada</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Dicas para confeiteiras<br />que querem lucrar de verdade
          </h1>
          <p className="text-white/70 max-w-lg mx-auto text-sm">
            Precificação, gestão, marketing e receitas financeiras para o seu negócio crescer.
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto mt-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Buscar artigos..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/10 border border-white/20 placeholder-white/40 text-white rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8853A]/50"
            />
          </div>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Tag filter */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setActiveTag(null)}
              className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${!activeTag ? 'bg-[#4A2545] text-white border-[#4A2545]' : 'text-[#4A2545] border-[#4A2545]/20 hover:border-[#4A2545]/50'}`}
            >
              Todos
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${activeTag === tag ? 'bg-[#4A2545] text-white border-[#4A2545]' : 'text-[#4A2545] border-[#4A2545]/20 hover:border-[#4A2545]/50'}`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-2xl h-72 animate-pulse border border-gray-100" />
            ))}
          </div>
        )}

        {/* Posts grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(post => <PostCard key={post.id} post={post} />)}
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 space-y-3">
            <span className="text-5xl">🍰</span>
            <p className="text-gray-500 font-medium">Nenhum post encontrado.</p>
            {search && <button onClick={() => setSearch('')} className="text-[#C8853A] text-sm font-bold underline">Limpar busca</button>}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
