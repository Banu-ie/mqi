import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProduct, listProducts } from "../api/products";
import { ApiError } from "../api/client";
import type { Product } from "../api/types";
import ProductCard from "../components/ui/ProductCard";
import { ErrorBanner, PageSpinner } from "../components/ui/StatusStates";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  useEffect(() => { if (!id) return; setLoading(true); setError(null); getProduct(id).then(setProduct).then(() => listProducts()).then(setRelated).catch((err) => { if (err instanceof ApiError && err.status === 404) setNotFound(true); else setError(err instanceof ApiError ? err.message : "Məhsul yüklənə bilmədi."); }).finally(() => setLoading(false)); }, [id]);

  if (loading) return <div className="pt-20"><PageSpinner label="Məhsul yüklənir..." /></div>;
  if (error) return <div className="pt-20"><ErrorBanner message={error} /></div>;

  if (!product) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-['DM_Serif_Display'] text-3xl text-[#1A2540] mb-4">Məhsul tapılmadı</h2>
          <Link to="/mehsullar" className="text-[#3B6FE0] font-semibold">← Geri qayıt</Link>
        </div>
      </div>
    );
  }

  const sameCategory = related.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 3);
  const fallbackRelated = related.filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <div className="pt-20 bg-[#F8FAFF] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#6B7A99] mb-8">
          <Link to="/" className="hover:text-[#3B6FE0] transition-colors">Ana səhifə</Link>
          <span>/</span>
          <Link to="/mehsullar" className="hover:text-[#3B6FE0] transition-colors">Məhsullar</Link>
          <span>/</span>
          <span className="text-[#1A2540]">{product.name}</span>
        </div>

        {/* Main content */}
        <div className="bg-white rounded-3xl shadow-sm border border-[#E4E9F4] overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Image */}
            <div className="aspect-square lg:aspect-auto bg-[#F0F4FE] relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="p-8 lg:p-12 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-lg bg-[#EEF3FD] text-[#3B6FE0] text-xs font-semibold">
                  {product.category}
                </span>
              </div>

              <h1 className="font-['DM_Serif_Display'] text-3xl lg:text-4xl text-[#1A2540] mb-4 leading-tight">
                {product.name}
              </h1>

              <div className="text-3xl font-bold text-[#3B6FE0] mb-6">
                {product.price} <span className="text-lg font-medium text-[#6B7A99]">AZN</span>
              </div>

              <p className="text-[#6B7A99] leading-relaxed mb-4">{product.shortDesc}</p>
              <p className="text-[#1A2540] leading-relaxed mb-8">{product.fullDesc}</p>

              {/* Info note */}
              <div className="bg-[#F8FAFF] rounded-xl p-4 border border-[#E4E9F4] mb-8">
                <div className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-[#7C5CFC] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-[#6B7A99] text-sm leading-relaxed">
                    Bütün sifariş detalları icma ilə əlaqə saxlanılaraq dəqiqləşdirilir.
                  </p>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                <Link
                  to="/elaqe"
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#3B6FE0] to-[#7C5CFC] text-white font-semibold text-center shadow-lg hover:shadow-xl hover:opacity-90 transition-all"
                >
                  Sifariş üçün əlaqə saxla
                </Link>
                <a
                  href="https://instagram.com/mingachevir_womens_community"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border-2 border-[#E4E9F4] text-[#6B7A99] font-semibold hover:border-[#7C5CFC] hover:text-[#7C5CFC] transition-all"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  Instagram-da bax
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Related products */}
        {(related.length > 0 || fallbackRelated.length > 0) && (
          <div className="mt-16">
            <h2 className="font-['DM_Serif_Display'] text-3xl text-[#1A2540] mb-8">Oxşar məhsullar</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(sameCategory.length > 0 ? sameCategory : fallbackRelated).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
