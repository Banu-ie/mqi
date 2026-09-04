import { useEffect, useState } from "react";
import { getContent, updateContent } from "../../api/content";
import type { SiteContent } from "../../api/types";
import { ApiError } from "../../api/client";

const initialContent = {
  heroHeadline: "Mingəçevir Qadın İcması",
  heroSubtext: "Qadınların sosial və iqtisadi inkişafına, bacarıqlarının artırılmasına və yeni imkanlar qazanmasına dəstək oluruq.",
  aboutIntro: "Mingəçevir Qadın İcması 2025-ci ilin oktyabr ayında yaradılıb. İcmanın əsas məqsədi qadınların sosial və iqtisadi inkişafına dəstək olmaq, onların bilik və bacarıqlarını artırmaq, məşğulluq və sahibkarlıq imkanlarını genişləndirməkdir.",
  mission: "Qadınların sosial və iqtisadi inkişafına dəstək olmaq, onların bilik və bacarıqlarını artırmaq, məşğulluq və sahibkarlıq imkanlarını genişləndirmək.",
  phone: "+994 XX XXX XX XX",
  email: "info@mqicma.az",
  instagram: "@mingachevir_womens_community",
  address: "Mingəçevir şəhəri, Azərbaycan",
};

export default function AdminContent() {
  const [content, setContent] = useState<SiteContent>(initialContent);
  const [saved, setSaved] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"homepage" | "about" | "contact">("homepage");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { getContent().then(setContent).catch((err) => setError(err instanceof ApiError ? err.message : "Məzmun yüklənmədi.")).finally(() => setLoading(false)); }, []);

  const handleSave = async () => {
    try { const updated = await updateContent(content); setContent(updated); setSaved("Məzmun uğurla yadda saxlandı."); setTimeout(() => setSaved(null), 3000); }
    catch (err) { setError(err instanceof ApiError ? err.message : "Məzmun yadda saxlanılmadı."); }
  };

  return (
    <div>
      {loading && <div className="mb-4 text-sm text-[#6B7A99]">Məzmun yüklənir...</div>}
      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}
      {saved && <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-medium">{saved}</div>}

      <div className="mb-8">
        <h1 className="font-['DM_Serif_Display'] text-3xl text-[#1A2540]">Məzmun İdarəetməsi</h1>
        <p className="text-[#6B7A99] text-sm mt-1">Saytın məzmununu buradan redaktə edin.</p>
      </div>

      {/* Tabs */}
      <div className="inline-flex bg-white rounded-xl p-1 border border-[#E4E9F4] mb-8 shadow-sm">
        {[
          { key: "homepage", label: "Ana səhifə" },
          { key: "about", label: "Haqqımızda" },
          { key: "contact", label: "Əlaqə məlumatları" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? "bg-gradient-to-r from-[#e0844c] to-[#c94cb0] text-white shadow-md"
                : "text-[#6B7A99] hover:text-[#1A2540]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#E4E9F4] p-8 max-w-2xl">
        {activeTab === "homepage" && (
          <div className="space-y-6">
            <h2 className="font-semibold text-[#1A2540] mb-2">Ana səhifə mətni</h2>
            <div>
              <label className="block text-sm font-medium text-[#1A2540] mb-2">Hero başlığı</label>
              <input
                value={content.heroHeadline}
                onChange={(e) => setContent({ ...content, heroHeadline: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-[#E4E9F4] focus:outline-none focus:ring-2 focus:ring-[#3B6FE0]/30 focus:border-[#3B6FE0]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A2540] mb-2">Hero alt mətni</label>
              <textarea
                value={content.heroSubtext}
                onChange={(e) => setContent({ ...content, heroSubtext: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-[#E4E9F4] focus:outline-none focus:ring-2 focus:ring-[#3B6FE0]/30 resize-none"
              />
            </div>
          </div>
        )}

        {activeTab === "about" && (
          <div className="space-y-6">
            <h2 className="font-semibold text-[#1A2540] mb-2">Haqqımızda mətni</h2>
            <div>
              <label className="block text-sm font-medium text-[#1A2540] mb-2">Giriş mətni</label>
              <textarea
                value={content.aboutIntro}
                onChange={(e) => setContent({ ...content, aboutIntro: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-[#E4E9F4] focus:outline-none focus:ring-2 focus:ring-[#3B6FE0]/30 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A2540] mb-2">Missiya</label>
              <textarea
                value={content.mission}
                onChange={(e) => setContent({ ...content, mission: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-[#E4E9F4] focus:outline-none focus:ring-2 focus:ring-[#3B6FE0]/30 resize-none"
              />
            </div>
          </div>
        )}

        {activeTab === "contact" && (
          <div className="space-y-5">
            <h2 className="font-semibold text-[#1A2540] mb-2">Əlaqə məlumatları</h2>
            {[
              { key: "phone", label: "Telefon" },
              { key: "email", label: "Email" },
              { key: "instagram", label: "Instagram" },
              { key: "address", label: "Ünvan" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-[#1A2540] mb-2">{label}</label>
                <input
                  value={(content as unknown as Record<string, string>)[key]}
                  onChange={(e) => setContent({ ...content, [key]: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[#E4E9F4] focus:outline-none focus:ring-2 focus:ring-[#3B6FE0]/30 focus:border-[#3B6FE0]"
                />
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleSave}
          className="mt-8 w-full py-3.5 rounded-xl bg-gradient-to-r from-[#e0844c] to-[#c94cb0] text-white font-semibold shadow-lg hover:shadow-xl hover:opacity-90 transition-all"
        >
          Yadda saxla
        </button>
      </div>
    </div>
  );
}
