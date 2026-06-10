import React from 'react'
import { Link } from 'react-router-dom'
import { Clock } from 'lucide-react'

function readingTime(text = '') {
  const words = text.replace(/<[^>]*>/g, '').split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

export default function PostCard({ post }) {
  const minutes = readingTime(post.conteudo || post.excerpt || '')

  return (
    <article className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#C8853A]/30 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col">
      {/* Cover */}
      <Link to={`/${post.slug}`} className="block aspect-[16/9] overflow-hidden bg-[#4A2545]/5">
        {post.cover_url ? (
          <img
            src={post.cover_url}
            alt={post.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl">🍰</span>
          </div>
        )}
      </Link>

      <div className="p-5 flex-1 flex flex-col gap-3">
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[10px] font-bold uppercase tracking-wider bg-[#4A2545]/8 text-[#4A2545] px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <Link to={`/${post.slug}`}>
          <h2 className="font-extrabold text-[#1a1a1a] text-base leading-snug group-hover:text-[#4A2545] transition-colors line-clamp-2">
            {post.titulo}
          </h2>
        </Link>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 flex-1">{post.excerpt}</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <div className="flex items-center gap-1 text-[11px] text-gray-400">
            <Clock className="w-3 h-3" />
            <span>{minutes} min de leitura</span>
          </div>
          <Link
            to={`/${post.slug}`}
            className="text-xs font-bold text-[#C8853A] hover:text-[#4A2545] transition-colors"
          >
            Ler mais →
          </Link>
        </div>
      </div>
    </article>
  )
}
