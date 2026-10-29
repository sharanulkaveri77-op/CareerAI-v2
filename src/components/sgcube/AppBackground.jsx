import React from 'react'

export const AppBackground = ({ activeTab = 'home' }) => {
  const isImageActive = activeTab !== 'home'

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#000000]">
      {/* Contextual image layer with smooth opacity transition */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out ${
          isImageActive ? 'opacity-20' : 'opacity-0'
        }`}
        style={{
          backgroundImage: "url('/assets/bg_abstract_dark.jpg')",
          filter: 'contrast(1.2) brightness(0.7)',
        }}
      />

      {/* Dark overlay to guarantee text contrast */}
      <div className="absolute inset-0 bg-[#000000]/80" />

      {/* Subtle radial purple atmospheric glow matching #833EEF */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(131, 62, 239, 0.08) 0%, rgba(15, 8, 30, 0.6) 55%, rgba(0, 0, 0, 0.95) 100%)',
        }}
      />

      {/* Subtle scanline / cyber texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(131, 62, 239, 0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(131, 62, 239, 0.25) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
    </div>
  )
}

export default AppBackground
