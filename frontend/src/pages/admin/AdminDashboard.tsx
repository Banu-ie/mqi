import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listProducts } from "../../api/products";
import { listServices } from "../../api/services";
import { listEvents } from "../../api/events";
import { listCategories } from "../../api/categories";
import type { Product, Service, Event, Category } from "../../api/types";
import { ErrorBanner, PageSpinner } from "../../components/ui/StatusStates";

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { Promise.all([listProducts(true), listServices(true), listEvents(), listCategories()]).then(([p, s, e, c]) => { setProducts(p); setServices(s); setEvents(e); setCategories(c); }).catch((err) => setError(err instanceof Error ? err.message : "Dashboard yüklənmədi.")).finally(() => setLoading(false)); }, []);
  if (loading) return <PageSpinner label="Dashboard yüklənir..." />;
  if (error) return <ErrorBanner message={error} />;

  const recentActivity = [
    ...events.map((event) => ({
      text: `Tədbir əlavə edildi: ${event.title}`,
      createdAt: event.createdAt,
      icon: "📅",
    })),
    ...services.map((service) => ({
      text: `Xidmət əlavə edildi: ${service.name}`,
      createdAt: service.createdAt,
      icon: "⚙️",
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const stats = [
    {
      label: "Məhsullar",
      value: products.filter((p) => p.status === "active").length,
      total: products.length,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"/>
        </svg>
      ),
      color: "from-[#3B6FE0] to-[#5B8FFF]",
      link: "/admin/products",
    },
    {
      label: "Xidmətlər",
      value: services.filter((s) => s.status === "active").length,
      total: services.length,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"/>
        </svg>
      ),
      color: "from-[#7C5CFC] to-[#9B7CFF]",
      link: "/admin/services",
    },
    {
      label: "Tədbirlər",
      value: events.filter((e) => e.status === "upcoming").length,
      total: events.length,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/>
        </svg>
      ),
      color: "from-[#F59E0B] to-[#FBBF24]",
      link: "/admin/events",
    },
    {
      label: "Kateqoriyalar",
      value: categories.length,
      total: categories.length,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"/>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z"/>
        </svg>
      ),
      color: "from-[#10B981] to-[#34D399]",
      link: "/admin/categories",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-['DM_Serif_Display'] text-3xl text-[#1A2540] mb-1">Dashboard</h1>
        <p className="text-[#6B7A99] text-sm">Xoş gəldiniz! Platformanızın ümumi vəziyyəti.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.link}
            className="bg-white rounded-2xl p-6 border border-[#E4E9F4] hover:shadow-lg transition-all duration-200 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-md`}>
                {stat.icon}
              </div>
              <svg className="w-4 h-4 text-[#6B7A99] group-hover:text-[#3B6FE0] transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
            <div className="font-['DM_Serif_Display'] text-3xl text-[#1A2540] mb-1">{stat.value}</div>
            <div className="text-[#6B7A99] text-sm">{stat.label}</div>
            <div className="text-[#6B7A99] text-xs mt-1">Cəmi: {stat.total}</div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent products */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E4E9F4] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-[#1A2540]">Son məhsullar</h2>
            <Link to="/admin/products" className="text-[#3B6FE0] text-sm font-medium hover:underline">
              Hamısını gör
            </Link>
          </div>
          <div className="space-y-2">
            {products.slice(0, 4).map((p) => (
              <div key={p.id} className="flex items-center gap-4 p-3 bg-gradient-to-r from-[#fee5d6] to-[#f4e0f8] rounded-lg transition-colors hover:from-[#f4e0f8] hover:to-[#fee5d6]">
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-[#F0F4FE]">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#1A2540] truncate">{p.name}</div>
                  <div className="text-xs text-[#6B7A99]">{p.category}</div>
                </div>
                <div className="text-sm font-bold text-[#e0844c] flex-shrink-0">{p.price} AZN</div>
                <span className={`px-2 py-1 rounded-md text-xs font-medium flex-shrink-0 ${
                  p.status === "active" ? "bg-green-0 text-[#49a455]" : "bg-gray-100 text-gray-600"
                }`}>
                  {p.status === "active" ? "Aktiv" : "Gizli"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-2xl border border-[#E4E9F4] p-6">
          <h2 className="font-semibold text-[#1A2540] mb-6">Son fəaliyyət</h2>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-[#6B7A99]">Hələ fəaliyyət yoxdur.</p>
            ) : recentActivity.map((a, i) => (
              <div key={`${a.text}-${i}`} className="flex items-start gap-3">
                <div className="text-xl flex-shrink-0 mt-0.5">{a.icon}</div>
                <div>
                  <p className="text-sm text-[#1A2540] leading-relaxed">{a.text}</p>
                  <p className="text-xs text-[#6B7A99] mt-1">{new Date(a.createdAt).toLocaleDateString("az-AZ", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 bg-gradient-to-r from-[#EEF3FD] to-[#F3F0FF] rounded-2xl p-6 border border-[#E4E9F4]">
        <h2 className="font-semibold text-[#1A2540] mb-4">Sürətli əməliyyatlar</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/products" className="px-5 py-2.5 rounded-xl bg-white border border-[#E4E9F4] text-sm font-medium text-[#1A2540] hover:shadow-md transition-all">
            + Məhsul əlavə et
          </Link>
          <Link to="/admin/services" className="px-5 py-2.5 rounded-xl bg-white border border-[#E4E9F4] text-sm font-medium text-[#1A2540] hover:shadow-md transition-all">
            + Xidmət əlavə et
          </Link>
          <Link to="/admin/events" className="px-5 py-2.5 rounded-xl bg-white border border-[#E4E9F4] text-sm font-medium text-[#1A2540] hover:shadow-md transition-all">
            + Tədbir əlavə et
          </Link>
          <Link to="/admin/content" className="px-5 py-2.5 rounded-xl bg-white border border-[#E4E9F4] text-sm font-medium text-[#1A2540] hover:shadow-md transition-all">
            Məzmunu redaktə et
          </Link>
        </div>
      </div>
    </div>
  );
}
