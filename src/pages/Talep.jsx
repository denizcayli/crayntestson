import { useEffect } from 'react'
import TalepContent from './TalepContent.jsx'
import AuroraFlow from '../components/AuroraFlow.jsx'
import { initTalepForm } from '../lib/talepForm.js'

export default function Talep() {
  useEffect(() => initTalepForm(), [])

  return (
    <main className="relative isolate min-h-screen pt-24 bg-[#05070a]">
      {/* Flowing backdrop. It stays fixed behind the form while the
          page scrolls; the clip keeps it inside this page's own area, off the footer. Here it is
          fainter and does not follow the pointer, so it stays behind the form; on a phone it is a
          still picture, so that nothing is drawn while the form is being filled in. */}
      <div className="absolute inset-0 -z-10 [clip-path:inset(0)]">
        <AuroraFlow background="#05070a" color1="#7da3ff" color2="#33507f" intensity={0.32} speed={0.7} pointerSpeed={0} stillOnPhones className="!fixed pointer-events-none" />
      </div>
      <TalepContent />
    </main>
  )
}
