import { useEffect, useState } from "react";
import { listEvents } from "../api/events";
import { ApiError } from "../api/client";
import type { Event } from "../api/types";
import EventCard from "../components/ui/EventCard";
import { ErrorBanner, PageSpinner } from "../components/ui/StatusStates";

export default function Events() {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { listEvents().then(setEvents).catch((err) => setError(err instanceof ApiError ? err.message : "Tədbirlər yüklənə bilmədi.")).finally(() => setLoading(false)); }, []);

  const filtered = events.filter((e) => e.status === tab);

  return (
    <div className="pt-20">
      <section className="py-16 bg-gradient-to-br from-[#1A2540] via-[#2D3B6B] to-[#3B6FE0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/15 text-white/90 text-xs font-semibold mb-5 uppercase tracking-wider">
            Tədbirlər
          </div>
          <h1 className="font-['DM_Serif_Display'] text-5xl text-white mb-4">Tədbirlər</h1>
          <p className="text-white/75 text-lg max-w-xl mx-auto">
            İcmamızın keçirdiyi sərgilər, seminarlar, masterkласlar və daha çox.
          </p>
        </div>
      </section>

      <section className="py-12 bg-[#F8FAFF] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tabs */}
          <div className="inline-flex bg-white rounded-xl p-1 border border-[#E4E9F4] mb-8 shadow-sm">
            <button
              onClick={() => setTab("upcoming")}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                tab === "upcoming"
                  ? "bg-gradient-to-r from-[#3B6FE0] to-[#7C5CFC] text-white shadow-md"
                  : "text-[#6B7A99] hover:text-[#1A2540]"
              }`}
            >
              Qarşıdan gələn
            </button>
            <button
              onClick={() => setTab("past")}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                tab === "past"
                  ? "bg-gradient-to-r from-[#3B6FE0] to-[#7C5CFC] text-white shadow-md"
                  : "text-[#6B7A99] hover:text-[#1A2540]"
              }`}
            >
              Keçirilmiş
            </button>
          </div>

          {loading ? <PageSpinner label="Tədbirlər yüklənir..." /> : error ? <ErrorBanner message={error} /> : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-[#EEF3FD] flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#6B7A99]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
              <h3 className="font-['DM_Serif_Display'] text-xl text-[#1A2540] mb-2">Heç bir tədbir tapılmadı</h3>
              <p className="text-[#6B7A99]">Bu kateqoriyada hələ ki, heç bir tədbir yoxdur.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
