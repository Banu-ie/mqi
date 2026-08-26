import { useEffect, useState } from "react";
import { createProduct, deleteProduct, listProducts, updateProduct, type ProductInput } from "../../api/products";
import type { Product } from "../../api/types";
import { ApiError } from "../../api/client";

type FormState = ProductInput;

const emptyForm: FormState = {
  name: "",
  price: 0,
  category: "Əl işləri",
  shortDesc: "",
  fullDesc: "",
  image: "",
  status: "active",
};

export default function AdminProducts() {
  const [list, setList] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { listProducts(true).then(setList).catch((err) => setError(err instanceof ApiError ? err.message : "Məhsullar yüklənə bilmədi.")); }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };
  const openEdit = (p: Product) => {
    setForm({ name: p.name, price: p.price, category: p.category, shortDesc: p.shortDesc, fullDesc: p.fullDesc, image: p.image, status: p.status });
    setEditId(p.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    try { if (editId) { await updateProduct(editId, form); showToast("Məhsul uğurla yeniləndi."); } else { await createProduct(form); showToast("Məhsul uğurla əlavə edildi."); } await listProducts(true).then(setList); }
    catch (err) { setError(err instanceof ApiError ? err.message : "Məhsul yadda saxlanılmadı."); return; }
    setShowForm(false);
    setEditId(null);
  };

  const handleDelete = async (id: string) => {
    try { await deleteProduct(id); setList((prev) => prev.filter((p) => p.id !== id)); }
    catch (err) { setError(err instanceof ApiError ? err.message : "Məhsul silinmədi."); return; }
    setDeleteId(null);
    showToast("Məhsul silindi.");
  };

  return (
    <div>
      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#1A2540] text-white px-5 py-3 rounded-xl shadow-xl text-sm font-medium animate-pulse">
          {toast}
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <h3 className="font-['DM_Serif_Display'] text-xl text-[#1A2540] mb-3">Silmək istədiyinizə əminsiniz?</h3>
            <p className="text-[#6B7A99] text-sm mb-6">Bu əməliyyat geri alına bilməz.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3 rounded-xl border border-[#E4E9F4] text-[#6B7A99] font-medium hover:bg-[#F8FAFF] transition-colors">
                Ləğv et
              </button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors">
                Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-8 max-w-xl w-full shadow-2xl my-8">
            <h3 className="font-['DM_Serif_Display'] text-2xl text-[#1A2540] mb-6">
              {editId ? "Məhsulu redaktə et" : "Yeni məhsul əlavə et"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1A2540] mb-2">Məhsul adı *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Məhsulun adı"
                  className="w-full px-4 py-3 rounded-xl border border-[#E4E9F4] focus:outline-none focus:ring-2 focus:ring-[#3B6FE0]/30 focus:border-[#3B6FE0]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A2540] mb-2">Kateqoriya</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#E4E9F4] focus:outline-none focus:ring-2 focus:ring-[#3B6FE0]/30 bg-white"
                  >
                    {["Əl işləri", "Geyim", "Çantalar", "Aksesuarlar", "Digər"].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A2540] mb-2">Qiymət (AZN)</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-[#E4E9F4] focus:outline-none focus:ring-2 focus:ring-[#3B6FE0]/30"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A2540] mb-2">Qısa təsvir</label>
                <input
                  value={form.shortDesc}
                  onChange={(e) => setForm({ ...form, shortDesc: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[#E4E9F4] focus:outline-none focus:ring-2 focus:ring-[#3B6FE0]/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A2540] mb-2">Tam təsvir</label>
                <textarea
                  value={form.fullDesc}
                  onChange={(e) => setForm({ ...form, fullDesc: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-[#E4E9F4] focus:outline-none focus:ring-2 focus:ring-[#3B6FE0]/30 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A2540] mb-2">Şəkil URL</label>
                <input
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-xl border border-[#E4E9F4] focus:outline-none focus:ring-2 focus:ring-[#3B6FE0]/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A2540] mb-2">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "inactive" })}
                  className="w-full px-4 py-3 rounded-xl border border-[#E4E9F4] focus:outline-none focus:ring-2 focus:ring-[#3B6FE0]/30 bg-white"
                >
                  <option value="active">Aktiv</option>
                  <option value="inactive">Gizli</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border border-[#E4E9F4] text-[#6B7A99] font-medium hover:bg-[#F8FAFF]">
                Ləğv et
              </button>
              <button onClick={handleSave} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#3B6FE0] to-[#7C5CFC] text-white font-semibold hover:opacity-90">
                Yadda saxla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-['DM_Serif_Display'] text-3xl text-[#1A2540]">Məhsullar</h1>
          <p className="text-[#6B7A99] text-sm mt-1">{list.length} məhsul</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#3B6FE0] to-[#7C5CFC] text-white font-semibold text-sm shadow-md hover:shadow-lg hover:opacity-90 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Məhsul əlavə et
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E4E9F4] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E4E9F4] bg-[#F8FAFF]">
                <th className="text-left px-6 py-4 text-xs font-semibold text-[#6B7A99] uppercase tracking-wider">Məhsul</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-[#6B7A99] uppercase tracking-wider">Kateqoriya</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-[#6B7A99] uppercase tracking-wider">Qiymət</th>
                <th className="text-left px-4 py-4 text-xs font-semibold text-[#6B7A99] uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-[#6B7A99] uppercase tracking-wider">Əməliyyat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E9F4]">
              {list.map((p) => (
                <tr key={p.id} className="hover:bg-[#F8FAFF] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-[#F0F4FE]">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[#1A2540]">{p.name}</div>
                        <div className="text-xs text-[#6B7A99] mt-0.5 max-w-xs truncate">{p.shortDesc}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="px-2.5 py-1 rounded-lg bg-[#EEF3FD] text-[#3B6FE0] text-xs font-medium">{p.category}</span>
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-[#1A2540]">{p.price} AZN</td>
                  <td className="px-4 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                      p.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}>
                      {p.status === "active" ? "Aktiv" : "Gizli"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(p)} className="px-3 py-1.5 rounded-lg bg-[#EEF3FD] text-[#3B6FE0] text-xs font-medium hover:bg-[#3B6FE0] hover:text-white transition-colors">
                        Redaktə
                      </button>
                      <button onClick={() => setDeleteId(p.id)} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-500 text-xs font-medium hover:bg-red-500 hover:text-white transition-colors">
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
