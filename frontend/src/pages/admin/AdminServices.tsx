import { useEffect, useState } from "react";
import { createService, deleteService, listServices, updateService, type ServiceInput } from "../../api/services";
import type { Service } from "../../api/types";
import { ApiError } from "../../api/client";

export default function AdminServices() {
  const [list, setList] = useState<Service[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", fullDesc: "", image: "", forWhom: "", benefits: "", status: "active" as "active" | "inactive" });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { listServices(true).then(setList).catch((err) => setError(err instanceof ApiError ? err.message : "Xidmətlər yüklənə bilmədi.")).finally(() => setLoading(false)); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const openAdd = () => {
    setForm({ name: "", description: "", fullDesc: "", image: "", forWhom: "", benefits: "", status: "active" });
    setEditId(null); setShowForm(true);
  };
  const openEdit = (s: Service) => {
    setForm({ name: s.name, description: s.description, fullDesc: s.fullDesc, image: s.image, forWhom: s.forWhom, benefits: s.benefits.join("\n"), status: s.status });
    setEditId(s.id); setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    const benefitsArr = form.benefits.split("\n").filter(Boolean);
    const input: ServiceInput = { ...form, benefits: benefitsArr };
    try { if (editId) { await updateService(editId, input); showToast("Xidmət uğurla yeniləndi."); } else { await createService(input); showToast("Xidmət uğurla əlavə edildi."); } await listServices(true).then(setList); }
    catch (err) { setError(err instanceof ApiError ? err.message : "Xidmət yadda saxlanılmadı."); return; }
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    try { await deleteService(id); setList((prev) => prev.filter((s) => s.id !== id)); }
    catch (err) { setError(err instanceof ApiError ? err.message : "Xidmət silinmədi."); return; }
    setDeleteId(null);
    showToast("Xidmət silindi.");
  };

  return (
    <div>
      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}
      {toast && <div className="fixed top-6 right-6 z-50 bg-[#1A2540] text-white px-5 py-3 rounded-xl shadow-xl text-sm font-medium">{toast}</div>}

      {deleteId && (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <h3 className="font-['DM_Serif_Display'] text-xl text-[#1A2540] mb-3">Silmək istədiyinizə əminsiniz?</h3>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3 rounded-xl border border-[#E4E9F4] text-[#6B7A99] font-medium">Ləğv et</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium">Sil</button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-8 max-w-xl w-full shadow-2xl my-8">
            <h3 className="font-['DM_Serif_Display'] text-2xl text-[#1A2540] mb-6">{editId ? "Xidməti redaktə et" : "Yeni xidmət əlavə et"}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1A2540] mb-2">Xidmət adı *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-[#E4E9F4] focus:outline-none focus:ring-2 focus:ring-[#3B6FE0]/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A2540] mb-2">Qısa təsvir</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-[#E4E9F4] focus:outline-none focus:ring-2 focus:ring-[#3B6FE0]/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A2540] mb-2">Tam təsvir</label>
                <textarea value={form.fullDesc} onChange={(e) => setForm({ ...form, fullDesc: e.target.value })} rows={3} className="w-full px-4 py-3 rounded-xl border border-[#E4E9F4] focus:outline-none focus:ring-2 focus:ring-[#3B6FE0]/30 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A2540] mb-2">Kimə aiddir?</label>
                <input value={form.forWhom} onChange={(e) => setForm({ ...form, forWhom: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-[#E4E9F4] focus:outline-none focus:ring-2 focus:ring-[#3B6FE0]/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A2540] mb-2">Üstünlüklər (hər sətirdə bir)</label>
                <textarea value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} rows={3} className="w-full px-4 py-3 rounded-xl border border-[#E4E9F4] focus:outline-none focus:ring-2 focus:ring-[#3B6FE0]/30 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A2540] mb-2">Şəkil URL</label>
                <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-[#E4E9F4] focus:outline-none focus:ring-2 focus:ring-[#3B6FE0]/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A2540] mb-2">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "inactive" })} className="w-full px-4 py-3 rounded-xl border border-[#E4E9F4] focus:outline-none bg-white">
                  <option value="active">Aktiv</option>
                  <option value="inactive">Gizli</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border border-[#E4E9F4] text-[#6B7A99] font-medium">Ləğv et</button>
              <button onClick={handleSave} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#3B6FE0] to-[#7C5CFC] text-white font-semibold">Yadda saxla</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-['DM_Serif_Display'] text-3xl text-[#1A2540]">Xidmətlər</h1>
          <p className="text-[#6B7A99] text-sm mt-1">{list.length} xidmət</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#3B6FE0] to-[#7C5CFC] text-white font-semibold text-sm shadow-md hover:opacity-90">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Xidmət əlavə et
        </button>
      </div>

      {loading ? (
        <p className="text-[#6B7A99] text-sm">Xidmətlər yüklənir...</p>
      ) : list.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E4E9F4] p-10 text-center">
          <p className="text-[#6B7A99] text-sm">Hələ xidmət yoxdur. "Xidmət əlavə et" düyməsi ilə ilkini əlavə edin.</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {list.map((s) => (
          <div key={s.id} className="bg-white rounded-2xl border border-[#E4E9F4] overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-40 bg-[#F0F4FE] overflow-hidden">
              {s.image ? <img src={s.image} alt={s.name} className="w-full h-full object-cover" /> : null}
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-[#1A2540] text-sm leading-snug">{s.name}</h3>
                <span className={`px-2 py-1 rounded-md text-xs font-medium flex-shrink-0 ml-2 ${s.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                  {s.status === "active" ? "Aktiv" : "Gizli"}
                </span>
              </div>
              <p className="text-[#6B7A99] text-xs leading-relaxed line-clamp-2 mb-4">{s.description}</p>
              <div className="flex gap-2">
                <button onClick={() => openEdit(s)} className="flex-1 py-2 rounded-lg bg-[#EEF3FD] text-[#3B6FE0] text-xs font-medium hover:bg-[#3B6FE0] hover:text-white transition-colors">
                  Redaktə
                </button>
                <button onClick={() => setDeleteId(s.id)} className="flex-1 py-2 rounded-lg bg-red-50 text-red-500 text-xs font-medium hover:bg-red-500 hover:text-white transition-colors">
                  Sil
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
