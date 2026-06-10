import React from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[#C8853A] group-hover:rotate-12 transition-transform duration-300">
            <path d="M17 3c-2.28 0-4 1.72-4 4 0 .97.34 1.85.91 2.54l-7.46 7.46a2.5 2.5 0 1 0 3.54 3.54l7.46-7.46c.69.57 1.57.91 2.54.91 2.28 0 4-1.72 4-4 0-2.28-1.72-4-4-4z" />
          </svg>
          <span className="font-extrabold text-lg tracking-tight text-[#1a1a1a]">
            pitada<span className="text-[#C8853A]">.</span>
            <span className="text-xs font-semibold text-[#4A2545]/60 ml-1">blog</span>
          </span>
        </Link>
        <a
          href="https://app.usepitada.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold bg-[#4A2545] hover:bg-[#6B3566] text-white px-4 py-2 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Experimentar grátis →
        </a>
      </div>
    </header>
  )
}
