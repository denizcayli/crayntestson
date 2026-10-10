import { withBase } from '../lib/paths.js'
import { t } from '../lib/text.js'

export default function NotFound() {
  return (
    <main className="min-h-screen pt-24 bg-[#070707] flex flex-col items-center justify-center text-center px-6">
      <p className="text-7xl font-extrabold tracking-tighter text-white">404</p>
      <p className="mt-4 text-gray-400">{t("Aradığınız sayfa bulunamadı.")}</p>
      <a href={withBase('/')} className="magnetic-btn mt-10">{t("Ana sayfaya dön")}</a>
    </main>
  )
}
