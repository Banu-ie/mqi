import { useEffect, useMemo, useState } from "react";
import { listProducts } from "../api/products";
import { listCategories } from "../api/categories";
import { ApiError } from "../api/client";
import type { Product, Category } from "../api/types";
import ProductCard from "../components/ui/ProductCard";
import { ErrorBanner, PageSpinner } from "../components/ui/StatusStates";

const allCategoryLabel = "Hamısı";

export default function Products() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(allCategoryLabel);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = () => { setLoading(true); setError(null); Promise.all([listProducts(), listCategories("product")]).then(([items, cats]) => { setProducts(items); setCategories(cats); }).catch((err) => setError(err instanceof ApiError ? err.message : "Məhsullar yüklənə bilmədi.")).finally(() => setLoading(false)); };
  useEffect(load, []);
  const allCategories = useMemo(() => [allCategoryLabel, ...categories.map((item) => item.name)], [categories]);

  const filtered = products.filter((p) => {
    const matchCat = category === allCategoryLabel || p.category === category;
    const matchSearch =
      search === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.shortDesc.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch && p.status === "active";
  });

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="py-16 bg-gradient-to-br from-[#d98643] via-[#9e4996] to-[#8636a1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/15 text-white/90 text-xs font-semibold mb-5 uppercase tracking-wider">
            Katalog
          </div>
          <h1 className="font-['DM_Serif_Display'] text-5xl text-white mb-4">Məhsullar</h1>
          <p className="text-white/75 text-lg max-w-xl mx-auto">
            İcma üzvlərinin hazırladığı unikal əl işi məhsullar. Hər biri zəhmət və sevginin nəticəsidir.
          </p>
        </div>
      </section>

      <section className="py-12 bg-[#F8FAFF] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? <PageSpinner label="Məhsullar yüklənir..." /> : error ? <ErrorBanner message={error} onRetry={load} /> : <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7A99]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Məhsul axtar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E4E9F4] bg-white text-[#1A2540] placeholder-[#6B7A99] focus:outline-none focus:ring-2 focus:ring-[#3B6FE0]/30 focus:border-[#3B6FE0] transition-all"
              />
            </div>
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap gap-2 mb-8">
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  category === cat
                    ? "bg-[#3B6FE0] text-white shadow-md"
                    : "bg-white text-[#6B7A99] border border-[#E4E9F4] hover:border-[#3B6FE0] hover:text-[#3B6FE0]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Results */}
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-[#EEF3FD] flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#6B7A99]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="font-['DM_Serif_Display'] text-xl text-[#1A2540] mb-2">Heç bir məhsul tapılmadı</h3>
              <p className="text-[#6B7A99]">Axtarış parametrlərini dəyişib yenidən cəhd edin.</p>
            </div>
          ) : (
            <>
              <p className="text-[#6B7A99] text-sm mb-6">{filtered.length} məhsul tapıldı</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </>
          )}
          </>}
        </div>
      </section>
    </div>
  );
}
