import { useEffect, useState } from "react";
import { createCategory, deleteCategory, listCategories, updateCategory } from "../../api/categories";
import type { Category } from "../../api/types";
import { ApiError } from "../../api/client";

export default function AdminCategories() {
  const [list, setList] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"product" | "service">("product");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    listCategories()
      .then(setList)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Kateqoriyalar yüklənə bilmədi."))
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    try { const category = await createCategory({ name: newName.trim(), type: newType }); setList((prev) => [...prev, category]); }
    catch (err) { setError(err instanceof ApiError ? err.message : "Kateqoriya əlavə edilmədi."); return; }
    setNewName("");
    showToast("Kateqoriya əlavə edildi.");
  };

  const handleEdit = async (id: string) => {
    if (!editName.trim()) return;
    try { const category = await updateCategory(id, { name: editName.trim() }); setList((prev) => prev.map((item) => item.id === id ? category : item)); }
    catch (err) { setError(err instanceof ApiError ? err.message : "Kateqoriya yenilənmədi."); return; }
    setEditId(null);
    showToast("Kateqoriya yeniləndi.");
  };

  const handleDelete = async (id: string) => {
    try { await deleteCategory(id); setList((prev) => prev.filter((c) => c.id !== id)); }
    catch (err) { setError(err instanceof ApiError ? err.message : "Kateqoriya silinmədi."); return; }
    showToast("Kateqoriya silindi.");
  };

  const productCats = list.filter((c) => c.type === "product");
  const serviceCats = list.filter((c) => c.type === "service");

  return (
    <div>
      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}
      {toast && <div className="fixed top-6 right-6 z-50 bg-[#1A2540] text-white px-5 py-3 rounded-xl shadow-xl text-sm font-medium">{toast}</div>}
      {loading && <div className="mb-4 text-sm text-[#6B7A99]">Kateqoriyalar yüklənir...</div>}

      <div className="mb-8">
        <h1 className="font-['DM_Serif_Display'] text-3xl text-[#1A2540]">Kateqoriyalar</h1>
        <p className="text-[#6B7A99] text-sm mt-1">Məhsul və xidmət kateqoriyalarını idarə edin.</p>
      </div>

      {/* Add form */}
      <div className="bg-white rounded-2xl border border-[#E4E9F4] p-6 mb-8">
        <h2 className="font-semibold text-[#1A2540] mb-4">Yeni kateqoriya</h2>
        <div className="flex flex-wrap gap-3">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Kateqoriya adı"
            className="flex-1 min-w-48 px-4 py-2.5 rounded-xl border border-[#E4E9F4] focus:outline-none focus:ring-2 focus:ring-[#3B6FE0]/30 focus:border-[#3B6FE0] text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value as "product" | "service")}
            className="px-4 py-2.5 rounded-xl border border-[#E4E9F4] focus:outline-none bg-white text-sm text-[#1A2540]"
          >
            <option value="product">Məhsul</option>
            <option value="service">Xidmət</option>
          </select>
          <button onClick={handleAdd} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#e0844c] to-[#c94cb0] text-white text-sm font-semibold hover:opacity-90">
            Əlavə et
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {[
          { title: "Məhsul kateqoriyaları", items: productCats, badge: "bg-[#EEF3FD] text-[#3B6FE0]" },
          { title: "Xidmət kateqoriyaları", items: serviceCats, badge: "bg-[#F3F0FF] text-[#7C5CFC]" },
        ].map(({ title, items, badge }) => (
          <div key={title} className="bg-white rounded-2xl border border-[#E4E9F4] p-6">
            <h2 className="font-semibold text-[#1A2540] mb-4">{title}</h2>
            {items.length === 0 ? (
              <p className="text-[#6B7A99] text-sm">Heç bir kateqoriya yoxdur.</p>
            ) : (
              <div className="space-y-2">
                {items.map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-3 py-2.5 px-3 rounded-xl hover:bg-[#F8FAFF] group">
                    {editId === c.id ? (
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-[#3B6FE0] text-sm focus:outline-none"
                        onKeyDown={(e) => e.key === "Enter" && handleEdit(c.id)}
                        autoFocus
                      />
                    ) : (
                      <div className="flex items-center gap-2 flex-1">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${badge}`}>{c.name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {editId === c.id ? (
                        <>
                          <button onClick={() => handleEdit(c.id)} className="px-2.5 py-1 rounded-lg bg-[#3B6FE0] text-white text-xs font-medium">Saxla</button>
                          <button onClick={() => setEditId(null)} className="px-2.5 py-1 rounded-lg bg-[#F0F4FE] text-[#6B7A99] text-xs">Ləğv</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditId(c.id); setEditName(c.name); }} className="p-1.5 rounded-lg text-[#6B7A99] hover:text-[#3B6FE0] hover:bg-[#EEF3FD]">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/>
                            </svg>
                          </button>
                          <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg text-[#6B7A99] hover:text-red-500 hover:bg-red-50">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
