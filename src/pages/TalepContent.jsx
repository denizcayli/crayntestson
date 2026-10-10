import RobotScene from '../components/RobotScene.jsx'
import { withBase } from '../lib/paths.js'
import { choices, lines } from '../lib/content.js'
import { scoped } from '../lib/text.js'

const t = scoped('talep')

// Questions added to a step in the panel, each `{ step, label, type, options, placeholder, required }`.
// They are drawn and checked like the form's own; `name` is the place of the question in the
// panel's list, which is how the answer is labelled where the requests are kept.
function ExtraQuestions({ step }) {
  return (window.CRAYN?.questions ?? []).map((question, index) => {
    if (Number(question.step || 1) !== step || !question.label) return null
    const name = `ek_${index + 1}`
    const field = { name: `fields[${name}]`, className: 'tlp-input', 'data-required': question.required ? '1' : undefined }
    return (
      <div key={name} className="talep-field" data-field={name}>
        <label className="tlp-label">
          {question.label}
          {question.required && <span className="tlp-accent ml-0.5">*</span>}
        </label>
        {' '}
        {question.type === 'textarea' && <textarea {...field} rows="3" placeholder={question.placeholder} />}
        {question.type === 'select' && (
          <select {...field}>
            <option value="">{question.placeholder || t('Seçiniz')}</option>
            {lines(question.options).filter(Boolean).map((label) => <option key={label} value={label}>{label}</option>)}
          </select>
        )}
        {question.type !== 'textarea' && question.type !== 'select' && <input type="text" {...field} defaultValue="" placeholder={question.placeholder} />}
        <p className="field-error hidden text-xs text-red-400 mt-2" />
      </div>
    )
  })
}

export default function TalepContent() {
  return (
    <section className="tlp-wrap py-6 md:py-8 px-6">
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="tlp-glow" />
      <div className="max-w-3xl lg:max-w-7xl mx-auto relative z-10 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12 lg:items-start">
        <RobotScene />
        <div>
          <div className="text-center mb-5">
            <span className="tlp-eyebrow inline-block text-xs font-bold uppercase tlp-accent mb-2">
              {t("Talep Formu")}
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-white leading-tight">
              {t("Projenizi birlikte planlayalım")}
            </h1>
          </div>
          <div className="tlp-glass">
          <div className="tlp-shimmer" />
          <div id="talepProgress">
            <div className="tlp-prog" aria-hidden="true">
              <span className="tlp-seg is-now" data-seg="1" />
              <span className="tlp-seg" data-seg="2" />
              <span className="tlp-seg" data-seg="3" />
              <span className="tlp-seg" data-seg="4" />
            </div>
            <div className="tlp-meta">
              <span id="stepTag" className="tlp-tag">{t("Hizmet")}</span>
              <span id="stepCounter" className="tlp-count">1 / 4</span>
            </div>
          </div>
          <div id="talepSuccess" className="hidden text-center py-10">
            {/* The tick that draws itself, as in the request card; it starts when this block is shown */}
            <svg viewBox="0 0 52 52" className="plan-check mx-auto mb-6 size-20" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="26" cy="26" r="24" className="stroke-crayn" />
              <path d="M16 27l7 7 14-15" className="stroke-cloud" />
            </svg>
            <h2 className="text-2xl font-extrabold text-white mb-3">
              {t("Talebiniz alındı!")}
            </h2>
            <p id="talepSuccessMsg" className="text-gray-400 max-w-md mx-auto">
              {t("Talebiniz alındı! Ekibimiz en kısa sürede sizinle iletişime geçecek.")}
            </p>
            <a href={withBase('/')} className="inline-block mt-8 tlp-accent font-semibold hover:underline">
              {t("← Ana sayfaya dön")}
            </a>
          </div>
          <form id="talepForm" method="POST" data-steps="4">
            <div style={{ position: "absolute", left: "-9999px" }} aria-hidden="true">
              <input type="text" name="_hp" tabIndex="-1" autoComplete="off" />
            </div>
            <input type="hidden" name="_url" value="https://crayn.ai/talep" />
            {' '}
            <input type="hidden" name="_referrer" value="https://crayn.ai/" />
            {' '}
            <input type="hidden" name="_utm_source" value="" />
            {' '}
            <input type="hidden" name="_utm_medium" value="" />
            {' '}
            <input type="hidden" name="_utm_campaign" value="" />
            {' '}
            <input type="hidden" name="_utm_content" value="" />
            {' '}
            <input type="hidden" name="_utm_term" value="" />
            <div className="talep-step " data-step="1" data-tag={t("Hizmet")}>
              <div className="mb-5">
                <h2 className="tlp-title">
                  {t("İlgilendiğiniz Hizmet")}
                </h2>
                <p className="tlp-sub">
                  {t("Size nasıl yardımcı olabiliriz?")}
                </p>
              </div>
              <div className="space-y-4">
                <div className="talep-field" data-field="hizmet">
                  <label className="tlp-label">
                    {t("Hangi konuda destek istiyorsunuz?")}
                    <span className="tlp-accent ml-0.5">
                      *
                    </span>
                  </label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {choices('hizmet').map((label) => (
                      <label key={label} className="tlp-opt">
                        <input type="radio" name="fields[hizmet]" value={label} data-required="1" />
                        {' '}
                        <span className="tlp-mark tlp-mark--radio">
                          <span className="tlp-dot" />
                        </span>
                        {' '}
                        <span className="tlp-opt-label">
                          {label}
                        </span>
                      </label>
                    ))}
                  </div>
                  <p className="field-error hidden text-xs text-red-400 mt-2" />
                </div>
                <ExtraQuestions step={1} />
              </div>
            </div>
            <div className="talep-step hidden" data-step="2" data-tag={t("Proje")}>
              <div className="mb-5">
                <h2 className="tlp-title">
                  {t("Proje Detayları")}
                </h2>
                <p className="tlp-sub">
                  {t("Bütçe, zaman çizelgesi ve kapsam.")}
                </p>
              </div>
              <div className="space-y-4">
                <div className="talep-field" data-field="butce">
                  <label className="tlp-label">
                    {t("Tahmini Bütçe")}
                    <span className="tlp-accent ml-0.5">
                      *
                    </span>
                  </label>
                  {' '}
                  <select name="fields[butce]" data-required="1" className="tlp-input">
                    <option value="">
                      {t("Bütçe aralığı seçin")}
                    </option>
                    {choices('butce').map((label) => <option key={label} value={label}>{label}</option>)}
                  </select>
                  <p className="field-error hidden text-xs text-red-400 mt-2" />
                </div>
                <div className="talep-field" data-field="zaman">
                  <label className="tlp-label">
                    {t("Zaman Çizelgesi")}
                    <span className="tlp-accent ml-0.5">
                      *
                    </span>
                  </label>
                  {' '}
                  <select name="fields[zaman]" data-required="1" className="tlp-input">
                    <option value="">
                      {t("Ne zaman başlamak istersiniz?")}
                    </option>
                    {choices('zaman').map((label) => <option key={label} value={label}>{label}</option>)}
                  </select>
                  <p className="field-error hidden text-xs text-red-400 mt-2" />
                </div>
                <div className="talep-field" data-field="aciklama">
                  <label className="tlp-label">
                    {t("Projenizi kısaca anlatın")}
                  </label>
                  <textarea name="fields[aciklama]" rows="3" placeholder={t("İhtiyaçlarınızı ve hedeflerinizi birkaç cümleyle paylaşın...")} className="tlp-input" />
                  <p className="field-error hidden text-xs text-red-400 mt-2" />
                </div>
                <ExtraQuestions step={2} />
              </div>
            </div>
            <div className="talep-step hidden" data-step="3" data-tag={t("Şirket")}>
              <div className="mb-5">
                <h2 className="tlp-title">
                  {t("Şirket Bilgileri")}
                </h2>
                <p className="tlp-sub">
                  {t("Sizi biraz tanıyalım.")}
                </p>
              </div>
              <div className="space-y-4">
                <div className="talep-field" data-field="firma">
                  <label className="tlp-label">
                    {t("Firma Adı")}
                    <span className="tlp-accent ml-0.5">
                      *
                    </span>
                  </label>
                  {' '}
                  <input type="text" name="fields[firma]" defaultValue="" placeholder={t("Şirketinizin adı")} data-required="1" className="tlp-input" />
                  <p className="field-error hidden text-xs text-red-400 mt-2" />
                </div>
                <div className="talep-field" data-field="sektor">
                  <label className="tlp-label">
                    {t("Sektör")}
                    <span className="tlp-accent ml-0.5">
                      *
                    </span>
                  </label>
                  {' '}
                  <select name="fields[sektor]" data-required="1" className="tlp-input">
                    <option value="">
                      {t("Sektör seçin")}
                    </option>
                    {choices('sektor').map((label) => <option key={label} value={label}>{label}</option>)}
                  </select>
                  <p className="field-error hidden text-xs text-red-400 mt-2" />
                </div>
                <div className="talep-field" data-field="olcek">
                  <label className="tlp-label">
                    {t("Çalışan Sayısı")}
                    <span className="tlp-accent ml-0.5">
                      *
                    </span>
                  </label>
                  {' '}
                  <select name="fields[olcek]" data-required="1" className="tlp-input">
                    <option value="">
                      {t("Şirket ölçeği")}
                    </option>
                    {choices('olcek').map((label) => <option key={label} value={label}>{label}</option>)}
                  </select>
                  <p className="field-error hidden text-xs text-red-400 mt-2" />
                </div>
                <ExtraQuestions step={3} />
              </div>
            </div>
            <div className="talep-step hidden" data-step="4" data-tag={t("İletişim")}>
              <div className="mb-5">
                <h2 className="tlp-title">
                  {t("İletişim Bilgileri")}
                </h2>
                <p className="tlp-sub">
                  {t("Size nasıl ulaşalım?")}
                </p>
              </div>
              <div className="space-y-4">
                <div className="talep-field" data-field="ad_soyad">
                  <label className="tlp-label">
                    {t("Ad Soyad")}
                    <span className="tlp-accent ml-0.5">
                      *
                    </span>
                  </label>
                  {' '}
                  <input type="text" name="fields[ad_soyad]" defaultValue="" placeholder={t("Adınız ve soyadınız")} data-required="1" className="tlp-input" />
                  <p className="field-error hidden text-xs text-red-400 mt-2" />
                </div>
                <div className="talep-field" data-field="eposta">
                  <label className="tlp-label">
                    {t("E-posta")}
                    <span className="tlp-accent ml-0.5">
                      *
                    </span>
                  </label>
                  {' '}
                  <input type="email" name="fields[eposta]" defaultValue="" placeholder={t("ornek@firma.com")} data-required="1" className="tlp-input" />
                  <p className="field-error hidden text-xs text-red-400 mt-2" />
                </div>
                <div className="talep-field" data-field="telefon">
                  <label className="tlp-label">
                    {t("Telefon")}
                  </label>
                  {' '}
                  <input type="tel" name="fields[telefon]" defaultValue="" placeholder={t("+90 5XX XXX XX XX")} className="tlp-input" />
                  <p className="field-error hidden text-xs text-red-400 mt-2" />
                </div>
                <ExtraQuestions step={4} />
                <div className="talep-field" data-field="kvkk_onay">
                  <label className="tlp-opt tlp-opt--start">
                    <input type="checkbox" name="fields[kvkk_onay]" value="1" data-required="1" />
                    {' '}
                    <span className="tlp-mark tlp-mark--check">
                      <svg className="tlp-ico" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </span>
                    {' '}
                    <span className="text-sm text-gray-400 leading-relaxed">
                      {t("Kişisel verilerimin işlenmesine ilişkin aydınlatma metnini okudum ve onaylıyorum.")}
                    </span>
                  </label>
                  <p className="field-error hidden text-xs text-red-400 mt-2" />
                </div>
              </div>
            </div>
            <div className="tlp-footer">
              <button type="button" id="talepPrev" className="tlp-btn-back hidden">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                {t("Geri")}
              </button>
              <button type="button" id="talepNext" className="magnet-pill magnet-pill--light tlp-btn-main">
                <span className="magnet-pill__face">
                  {t("Devam et")} <span className="tlp-arr" aria-hidden="true">→</span>
                </span>
              </button>
              <button type="submit" id="talepSubmit" className="magnet-pill magnet-pill--light tlp-btn-main hidden">
                <span className="magnet-pill__face">
                  {t("Talebi Gönder")} <span className="tlp-arr" aria-hidden="true">→</span>
                </span>
              </button>
            </div>
            <p id="talepFormError" className="hidden text-sm text-red-400 mt-4 text-center" />
          </form>
          </div>
        </div>
      </div>
    </section>
  )
}
