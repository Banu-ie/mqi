import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listProducts } from "../api/products";
import { listServices } from "../api/services";
import { listEvents } from "../api/events";
import { getContent } from "../api/content";
import type { Product, Service, Event, SiteContent } from "../api/types";
import ProductCard from "../components/ui/ProductCard";
import ServiceCard from "../components/ui/ServiceCard";
import EventCard from "../components/ui/EventCard";
import { ErrorBanner } from "../components/ui/StatusStates";

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
    title: "Peşə və bacarıq təlimləri",
    desc: "Dərzilik, toxuculuq, kulinariya və digər sahələrdə peşəkar təlimlər.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
      </svg>
    ),
    title: "Məşğulluğa dəstək",
    desc: "Qadınların iş bazarına daxil olmasına kömək edən proqramlar.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
    title: "Sahibkarlıq təlimləri",
    desc: "Öz biznesinizi qurmaq üçün lazımi biliklər və bacarıqlar.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.883-5.539c.536-1.338.999-2.713 1.38-4.121M9.53 16.122a15.994 15.994 0 01-3.535-2.727 15.994 15.994 0 01-2.727-3.535m0 0a15.998 15.998 0 005.54-3.883 15.998 15.998 0 014.12-1.38m0 0a15.998 15.998 0 013.883 5.539c.536 1.338.999 2.713 1.38 4.121" />
      </svg>
    ),
    title: "Əl işlərinin inkişafı",
    desc: "Ənənəvi sənət növlərini öyrənmək və məhsulların satışından gəlir əldə etmək.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
    title: "Psixoloji sessiyalar",
    desc: "Peşəkar dəstəklə özünüdərk, stress idarəetməsi və şəxsi inkişaf.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
      </svg>
    ),
    title: "Şəxsi inkişaf",
    desc: "Liderliklə bağlı bacarıqlar, özgüvən artırma və sosial fəallıq proqramları.",
  },
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [content, setContent] = useState<SiteContent>({ heroHeadline: "Mingəçevir Qadın İcması", heroSubtext: "Qadınların sosial və iqtisadi inkişafına, bacarıqlarının artırılmasına və yeni imkanlar qazanmasına dəstək oluruq.", aboutIntro: "Mingəçevir Qadın İcması 2025-ci ilin oktyabr ayında yaradılıb.", mission: "", phone: "", email: "", instagram: "@mingachevir_womens_community", address: "" });
  const [dataError, setDataError] = useState<string | null>(null);
  const loadDynamicSections = () => {
    setDataError(null);
    Promise.all([listProducts(), listServices(), listEvents(), getContent()])
      .then(([p, s, e, c]) => { setProducts(p); setServices(s); setEvents(e); setContent(c); })
      .catch(() => setDataError("Bəzi məlumatlar yüklənə bilmədi. Zəhmət olmasa yenidən cəhd edin."));
  };
  useEffect(loadDynamicSections, []);
  const featuredProducts = products.slice(0, 4);
  const featuredServices = services.slice(0, 4);
  const upcomingEvents = events.filter((e) => e.status === "upcoming").slice(0, 3);

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1783853855829-684167740ed8?w=1400&h=900&fit=crop&auto=format"
            alt="Mingəçevir Qadın İcması"
            className="w-full h-full object-cover brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A2540]/90 via-[#1A2540]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A2540]/60 via-transparent to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
          <div className="max-w-2xl">
            <h1 className="font-['DM_Serif_Display'] text-5xl sm:text-6xl lg:text-7xl text-white leading-tight mb-6">
              Mingəçevir
              <br />
              <span className="text-[#A78BFA]">Qadın İcması</span>
            </h1>
            <p className="text-white/80 text-lg sm:text-xl leading-relaxed mb-10 max-w-xl">
              {content.heroSubtext}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/mehsullar"
                className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#3B6FE0] to-[#7C5CFC] text-white font-semibold text-base shadow-xl hover:shadow-2xl hover:opacity-90 transition-all duration-200"
              >
                Məhsullara bax
              </Link>
              <Link
                to="/haqqimizda"
                className="px-7 py-3.5 rounded-xl bg-white/15 backdrop-blur-sm border border-white/30 text-white font-semibold text-base hover:bg-white/25 transition-all duration-200"
              >
                Haqqımızda
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50">
          <span className="text-xs">Aşağı</span>
          <div className="w-px h-8 bg-white/30 animate-pulse" />
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#EEF3FD] text-[#3B6FE0] text-xs font-semibold mb-5 uppercase tracking-wider">
                Haqqımızda
              </div>
              <h2 className="font-['DM_Serif_Display'] text-4xl lg:text-5xl text-[#1A2540] mb-6 leading-tight">
                Birlikdə daha
                <br />
                <span className="text-[#7C5CFC]">güclüyük</span>
              </h2>
              <p className="text-[#6B7A99] text-lg leading-relaxed mb-6">
                {content.aboutIntro}
              </p>
              <p className="text-[#6B7A99] leading-relaxed mb-8">
                İcmamız qadınlara peşə öyrənmək, əl işləri hazırlamaq, bizneslərini qurmaq və şəxsi inkişaf üçün lazımi mühiti yaradır. Birlikdə biz daha güclüyük.
              </p>
              <Link
                to="/haqqimizda"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-[#3B6FE0] text-[#3B6FE0] font-semibold hover:bg-[#3B6FE0] hover:text-white transition-all duration-200"
              >
                Daha ətraflı
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1783853852573-6c48dfa838e5?w=600&h=750&fit=crop&auto=format"
                  alt="Qadın icması"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A2540]/30 to-transparent" />
              </div>
              {/* Stat card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-5 shadow-xl border border-[#E4E9F4]">
                <div className="text-3xl font-['DM_Serif_Display'] text-[#3B6FE0] mb-1">2025</div>
                <div className="text-[#6B7A99] text-sm">Oktyabr ayında yaradıldı</div>
              </div>
              {/* Accent shape */}
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-2xl bg-gradient-to-br from-[#3B6FE0] to-[#7C5CFC] opacity-20 -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* WHAT WE DO */}
      <section className="py-24 bg-[#F8FAFF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F3F0FF] text-[#7C5CFC] text-xs font-semibold mb-5 uppercase tracking-wider">
              Fəaliyyətlərimiz
            </div>
            <h2 className="font-['DM_Serif_Display'] text-4xl lg:text-5xl text-[#1A2540] mb-4">
              Nə edirik?
            </h2>
            <p className="text-[#6B7A99] text-lg max-w-xl mx-auto">
              Qadınların güclənməsi üçün müxtəlif istiqamətlərdə fəaliyyət göstəririk.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-[#E4E9F4] hover:shadow-lg hover:border-[#3B6FE0]/20 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#EEF3FD] to-[#F3F0FF] flex items-center justify-center text-[#3B6FE0] mb-4 group-hover:from-[#3B6FE0] group-hover:to-[#7C5CFC] group-hover:text-white transition-all duration-300">
                  {f.icon}
                </div>
                <h3 className="font-['DM_Serif_Display'] text-[#1A2540] text-lg mb-2">{f.title}</h3>
                <p className="text-[#6B7A99] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {dataError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <ErrorBanner message={dataError} onRetry={loadDynamicSections} />
        </div>
      )}

      {/* FEATURED PRODUCTS */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#EEF3FD] text-[#3B6FE0] text-xs font-semibold mb-4 uppercase tracking-wider">
                Məhsullar
              </div>
              <h2 className="font-['DM_Serif_Display'] text-4xl lg:text-5xl text-[#1A2540]">
                Seçilmiş məhsullar
              </h2>
            </div>
            <Link
              to="/mehsullar"
              className="hidden sm:inline-flex items-center gap-2 text-[#3B6FE0] font-semibold hover:gap-3 transition-all"
            >
              Hamısını gör
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
          {!dataError && featuredProducts.length === 0 ? (
            <p className="text-[#6B7A99] text-sm py-8">Hazırda göstərilən məhsul yoxdur, tezliklə əlavə olunacaq.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
          <div className="sm:hidden mt-8 text-center">
            <Link
              to="/mehsullar"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-[#3B6FE0] text-[#3B6FE0] font-semibold"
            >
              Bütün məhsullar
            </Link>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-24 bg-[#F8FAFF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F3F0FF] text-[#7C5CFC] text-xs font-semibold mb-4 uppercase tracking-wider">
                Xidmətlər
              </div>
              <h2 className="font-['DM_Serif_Display'] text-4xl lg:text-5xl text-[#1A2540]">
                Xidmətlərimiz
              </h2>
            </div>
            <Link
              to="/xidmetler"
              className="hidden sm:inline-flex items-center gap-2 text-[#7C5CFC] font-semibold hover:gap-3 transition-all"
            >
              Hamısını gör
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
          {!dataError && featuredServices.length === 0 ? (
            <p className="text-[#6B7A99] text-sm py-8">Hazırda göstərilən xidmət yoxdur, tezliklə əlavə olunacaq.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredServices.map((s) => (
                <ServiceCard key={s.id} service={s} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* EVENTS */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#EEF3FD] text-[#3B6FE0] text-xs font-semibold mb-4 uppercase tracking-wider">
                Tədbirlər
              </div>
              <h2 className="font-['DM_Serif_Display'] text-4xl lg:text-5xl text-[#1A2540]">
                Qarşıdan gələn tədbirlər
              </h2>
            </div>
            <Link
              to="/tedbirler"
              className="hidden sm:inline-flex items-center gap-2 text-[#3B6FE0] font-semibold hover:gap-3 transition-all"
            >
              Hamısını gör
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
          {!dataError && upcomingEvents.length === 0 ? (
            <p className="text-[#6B7A99] text-sm py-8">Hazırda planlaşdırılan tədbir yoxdur, tezliklə əlavə olunacaq.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* INSTAGRAM SECTION */}
      <section className="py-16 bg-gradient-to-br from-[#d98643] via-[#ae51a4] to-[#8636a1]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </div>
          <h2 className="font-['DM_Serif_Display'] text-4xl lg:text-5xl text-white mb-4">
            İcmanın fəaliyyətini
            <br />Instagram-da izləyin
          </h2>
          <p className="text-white/75 text-lg mb-3">
            Ən son tədbirlərdən, məhsullardan və icma xəbərlərindən xəbərdar olun.
          </p>
          <p className="text-white font-semibold text-xl mb-8">
            @mingachevir_womens_community
          </p>
          <a
            href="https://instagram.com/mingachevir_womens_community"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-white text-[#3B6FE0] font-bold text-base hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200"
          >
            Instagram-a keç
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="py-24 bg-[#F8FAFF]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-3xl p-12 shadow-sm border border-[#E4E9F4]">
            <h2 className="font-['DM_Serif_Display'] text-4xl lg:text-5xl text-[#1A2540] mb-4">
              Məhsul və xidmətlərimizlə
              <br />maraqlanırsınız?
            </h2>
            <p className="text-[#6B7A99] text-lg mb-8">
              Sifariş vermək və ya ətraflı məlumat almaq üçün bizimlə əlaqə saxlayın.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/elaqe"
                className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#3B6FE0] to-[#7C5CFC] text-white font-semibold shadow-lg hover:shadow-xl hover:opacity-90 transition-all"
              >
                Bizimlə əlaqə saxlayın
              </Link>
              <a
                href="https://instagram.com/mingachevir_womens_community"
                target="_blank"
                rel="noopener noreferrer"
                className="px-7 py-3.5 rounded-xl border-2 border-[#E4E9F4] text-[#1A2540] font-semibold hover:border-[#7C5CFC] hover:text-[#7C5CFC] transition-all"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
