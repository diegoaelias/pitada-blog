import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-[#4A2545] text-white/70 mt-20">
      {/* CTA Banner */}
      <div className="bg-[#3a1c37] border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[#C8853A]">Para confeiteiras</p>
          <h3 className="text-2xl font-extrabold text-white">Calcule o preço certo dos seus produtos</h3>
          <p className="text-sm text-white/60 max-w-lg mx-auto">
            O Pitada cuida de toda a matemática: custo de ingredientes, margem de lucro, custo por hora e muito mais.
          </p>
          <a
            href="https://app.usepitada.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#C8853A] hover:bg-[#E09B4A] text-white font-bold px-8 py-3 rounded-2xl transition-all shadow-lg hover:-translate-y-0.5"
          >
            Testar grátis por 7 dias →
          </a>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <p>© {new Date().getFullYear()} Use Pitada. Todos os direitos reservados.</p>
        <div className="flex gap-4">
          <a href="https://usepitada.com" className="hover:text-[#C8853A] transition-colors">Site</a>
          <a href="https://www.instagram.com/usepitada" target="_blank" rel="noopener noreferrer" className="hover:text-[#C8853A] transition-colors">Instagram</a>
          <a href="https://wa.me/5547988809195" target="_blank" rel="noopener noreferrer" className="hover:text-[#C8853A] transition-colors">WhatsApp</a>
        </div>
      </div>
    </footer>
  )
}
