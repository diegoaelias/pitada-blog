import React from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <img
            src="/favicon.png"
            alt="Pitada"
            className="w-7 h-7 rounded-lg group-hover:scale-105 transition-transform duration-300"
          />
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
