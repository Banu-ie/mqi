import { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Bu sahə tələb olunur.";
    if (!form.phone.trim()) e.phone = "Bu sahə tələb olunur.";
    if (!form.message.trim()) e.message = "Bu sahə tələb olunur.";
    return e;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setErrors({});
    setSuccess(true);
    setForm({ name: "", phone: "", message: "" });
  };

  const contactItems = [
    {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
      label: "Instagram",
      value: "@mingachevir_womens_community",
      href: "https://instagram.com/mingachevir_womens_community",
      color: "from-[#f09433] to-[#bc1888]",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
        </svg>
      ),
      label: "Telefon",
      value: "+994 XX XXX XX XX",
      href: "tel:+994XXXXXXXXX",
      color: "from-[#3B6FE0] to-[#3B6FE0]",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      ),
      label: "WhatsApp",
      value: "+994 XX XXX XX XX",
      href: "https://wa.me/994XXXXXXXXX",
      color: "from-[#25D366] to-[#128C7E]",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
        </svg>
      ),
      label: "Email",
      value: "info@mqicma.az",
      href: "mailto:info@mqicma.az",
      color: "from-[#7C5CFC] to-[#3B6FE0]",
    },
  ];

  return (
    <div className="pt-20">
      <section className="py-16 bg-gradient-to-br from-[#1A2540] via-[#2D3B6B] to-[#7C5CFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/15 text-white/90 text-xs font-semibold mb-5 uppercase tracking-wider">
            Əlaqə
          </div>
          <h1 className="font-['DM_Serif_Display'] text-5xl text-white mb-4">Bizimlə əlaqə saxlayın</h1>
          <p className="text-white/75 text-lg max-w-xl mx-auto">
            Sifariş, məlumat almaq və ya icmamıza qoşulmaq üçün aşağıdakı kanallardan bizə müraciət edin.
          </p>
        </div>
      </section>

      <section className="py-16 bg-[#F8FAFF]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact info */}
            <div>
              <h2 className="font-['DM_Serif_Display'] text-3xl text-[#1A2540] mb-8">Əlaqə kanalları</h2>
              <div className="space-y-4">
                {contactItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-[#E4E9F4] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
                  >
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white flex-shrink-0 shadow-sm`}>
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#6B7A99] uppercase tracking-wider mb-0.5">{item.label}</div>
                      <div className="text-[#1A2540] font-medium group-hover:text-[#3B6FE0] transition-colors">{item.value}</div>
                    </div>
                    <svg className="w-4 h-4 text-[#6B7A99] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ))}
              </div>

              <div className="mt-8 p-5 bg-[#EEF3FD] rounded-2xl border border-[#3B6FE0]/20">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#3B6FE0] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <div>
                    <div className="font-semibold text-[#1A2540] mb-1">Ünvan</div>
                    <div className="text-[#6B7A99] text-sm">Mingəçevir şəhəri, Azərbaycan</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div>
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#E4E9F4]">
                <h2 className="font-['DM_Serif_Display'] text-3xl text-[#1A2540] mb-2">Mesaj göndərin</h2>
                <p className="text-[#6B7A99] text-sm mb-8">Sualınızı göndərin, ən qısa müddətdə cavab verəcəyik.</p>

                {success && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-green-700 text-sm font-medium">Mesajınız uğurla göndərildi. Ən qısa müddətdə sizinlə əlaqə saxlayacağıq!</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-[#1A2540] mb-2">Ad</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Adınızı daxil edin"
                      className={`w-full px-4 py-3 rounded-xl border text-[#1A2540] placeholder-[#6B7A99] focus:outline-none focus:ring-2 focus:ring-[#3B6FE0]/30 transition-all ${
                        errors.name ? "border-red-400 bg-red-50" : "border-[#E4E9F4] focus:border-[#3B6FE0]"
                      }`}
                    />
                    {errors.name && <p className="mt-1.5 text-red-500 text-xs">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1A2540] mb-2">Telefon</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+994 XX XXX XX XX"
                      className={`w-full px-4 py-3 rounded-xl border text-[#1A2540] placeholder-[#6B7A99] focus:outline-none focus:ring-2 focus:ring-[#3B6FE0]/30 transition-all ${
                        errors.phone ? "border-red-400 bg-red-50" : "border-[#E4E9F4] focus:border-[#3B6FE0]"
                      }`}
                    />
                    {errors.phone && <p className="mt-1.5 text-red-500 text-xs">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1A2540] mb-2">Mesaj</label>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Mesajınızı yazın..."
                      rows={5}
                      className={`w-full px-4 py-3 rounded-xl border text-[#1A2540] placeholder-[#6B7A99] focus:outline-none focus:ring-2 focus:ring-[#3B6FE0]/30 transition-all resize-none ${
                        errors.message ? "border-red-400 bg-red-50" : "border-[#E4E9F4] focus:border-[#3B6FE0]"
                      }`}
                    />
                    {errors.message && <p className="mt-1.5 text-red-500 text-xs">{errors.message}</p>}
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#3B6FE0] to-[#7C5CFC] text-white font-semibold shadow-lg hover:shadow-xl hover:opacity-90 transition-all"
                  >
                    Göndər
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
