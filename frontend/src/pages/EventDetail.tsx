import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getEvent } from "../api/events";
import { ApiError } from "../api/client";
import type { Event } from "../api/types";
import { ErrorBanner, PageSpinner } from "../components/ui/StatusStates";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("az-AZ", { day: "numeric", month: "long", year: "numeric" });
}

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  useEffect(() => { if (!id) return; getEvent(id).then(setEvent).catch((err) => { if (err instanceof ApiError && err.status === 404) setNotFound(true); else setError(err instanceof ApiError ? err.message : "Tədbir yüklənə bilmədi."); }).finally(() => setLoading(false)); }, [id]);

  if (loading) return <div className="pt-20"><PageSpinner label="Tədbir yüklənir..." /></div>;
  if (error) return <div className="pt-20"><ErrorBanner message={error} /></div>;

  if (!event) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-['DM_Serif_Display'] text-3xl text-[#1A2540] mb-4">Tədbir tapılmadı</h2>
          <Link to="/tedbirler" className="text-[#3B6FE0] font-semibold">← Geri qayıt</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 bg-[#F8FAFF] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#6B7A99] mb-8">
          <Link to="/" className="hover:text-[#3B6FE0] transition-colors">Ana səhifə</Link>
          <span>/</span>
          <Link to="/tedbirler" className="hover:text-[#3B6FE0] transition-colors">Tədbirlər</Link>
          <span>/</span>
          <span className="text-[#1A2540]">{event.title}</span>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-[#E4E9F4] overflow-hidden">
          {/* Image */}
          <div className="relative h-72 lg:h-96 bg-[#F0F4FE]">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A2540]/60 to-transparent" />
            <div className="absolute bottom-6 left-8">
              <span
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                  event.status === "upcoming"
                    ? "bg-green-500 text-white"
                    : "bg-white/20 backdrop-blur-sm text-white border border-white/30"
                }`}
              >
                {event.status === "upcoming" ? "Qarşıdan gələn" : "Keçirilmiş"}
              </span>
            </div>
          </div>

          <div className="p-8 lg:p-12">
            {/* Meta */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2 text-[#7C5CFC] text-sm font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                {formatDate(event.date)}
              </div>
              <div className="flex items-center gap-2 text-[#6B7A99] text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                {event.location}
              </div>
            </div>

            <h1 className="font-['DM_Serif_Display'] text-4xl text-[#1A2540] mb-6 leading-tight">
              {event.title}
            </h1>
            <p className="text-[#6B7A99] text-lg leading-relaxed mb-8">{event.fullDesc}</p>

            {/* CTA */}
            <div className="bg-gradient-to-r from-[#EEF3FD] to-[#F3F0FF] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-[#1A2540]">Ətraflı məlumat almaq istəyirsiniz?</h3>
                <p className="text-[#6B7A99] text-sm">Bizimlə əlaqə saxlayın.</p>
              </div>
              <Link
                to="/elaqe"
                className="flex-shrink-0 px-6 py-3 rounded-xl bg-gradient-to-r from-[#e0844c] to-[#c94cb0] text-white font-semibold shadow-md hover:shadow-lg hover:opacity-90 transition-all"
              >
                Əlaqə saxla
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
