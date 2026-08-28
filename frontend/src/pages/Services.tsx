import { useEffect, useState } from "react";
import { listServices } from "../api/services";
import { ApiError } from "../api/client";
import type { Service } from "../api/types";
import ServiceCard from "../components/ui/ServiceCard";
import { ErrorBanner, PageSpinner } from "../components/ui/StatusStates";

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = () => { setLoading(true); listServices().then(setServices).catch((err) => setError(err instanceof ApiError ? err.message : "Xidmətlər yüklənə bilmədi.")).finally(() => setLoading(false)); };
  useEffect(load, []);
  return (
    <div className="pt-20">
      <section className="py-16 bg-gradient-to-br from-[#d98643] via-[#9e4996] to-[#8636a1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/15 text-white/90 text-xs font-semibold mb-5 uppercase tracking-wider">
            Xidmətlər
          </div>
          <h1 className="font-['DM_Serif_Display'] text-5xl text-white mb-4">Xidmətlərimiz</h1>
          <p className="text-white/75 text-lg max-w-xl mx-auto">
            Qadınların inkişafı, məşğulluğu və sahibkarlığı üçün müxtəlif xidmətlər göstəririk.
          </p>
        </div>
      </section>

      <section className="py-16 bg-[#F8FAFF] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? <PageSpinner label="Xidmətlər yüklənir..." /> : error ? <ErrorBanner message={error} onRetry={load} /> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.filter((s) => s.status === "active").map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>}
        </div>
      </section>
    </div>
  );
}
