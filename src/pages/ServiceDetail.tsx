import { useParams, Link } from "react-router-dom";
import { services } from "../data/mock";

export default function ServiceDetail() {
  const { id } = useParams();
  const service = services.find((s) => s.id === id);

  if (!service) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-['DM_Serif_Display'] text-3xl text-[#1A2540] mb-4">Xidmət tapılmadı</h2>
          <Link to="/xidmetler" className="text-[#3B6FE0] font-semibold">← Geri qayıt</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 bg-[#F8FAFF] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#6B7A99] mb-8">
          <Link to="/" className="hover:text-[#3B6FE0] transition-colors">Ana səhifə</Link>
          <span>/</span>
          <Link to="/xidmetler" className="hover:text-[#3B6FE0] transition-colors">Xidmətlər</Link>
          <span>/</span>
          <span className="text-[#1A2540]">{service.name}</span>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-[#E4E9F4] overflow-hidden">
          {/* Image */}
          <div className="relative h-72 lg:h-96 bg-[#F0F4FE]">
            <img
              src={service.image}
              alt={service.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A2540]/50 to-transparent" />
          </div>

          <div className="p-8 lg:p-12">
            <h1 className="font-['DM_Serif_Display'] text-4xl text-[#1A2540] mb-4">{service.name}</h1>
            <p className="text-[#6B7A99] text-lg mb-8 leading-relaxed">{service.fullDesc}</p>

            <div className="grid sm:grid-cols-2 gap-8 mb-10">
              {/* For whom */}
              <div className="bg-[#F8FAFF] rounded-2xl p-6 border border-[#E4E9F4]">
                <h3 className="font-semibold text-[#1A2540] mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-[#EEF3FD] flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-[#3B6FE0]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  Kimə aiddir?
                </h3>
                <p className="text-[#6B7A99] text-sm leading-relaxed">{service.forWhom}</p>
              </div>

              {/* Benefits */}
              <div className="bg-[#F8FAFF] rounded-2xl p-6 border border-[#E4E9F4]">
                <h3 className="font-semibold text-[#1A2540] mb-3">Üstünlüklər</h3>
                <ul className="space-y-2">
                  {service.benefits.map((b, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-[#6B7A99]">
                      <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-[#EEF3FD] to-[#F3F0FF] rounded-2xl p-8 text-center">
              <h3 className="font-['DM_Serif_Display'] text-2xl text-[#1A2540] mb-3">
                Bu xidmət ilə maraqlanırsınız?
              </h3>
              <p className="text-[#6B7A99] mb-6">
                Ətraflı məlumat almaq üçün bizimlə əlaqə saxlayın.
              </p>
              <Link
                to="/elaqe"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#3B6FE0] to-[#7C5CFC] text-white font-semibold shadow-lg hover:shadow-xl hover:opacity-90 transition-all"
              >
                Ətraflı məlumat üçün əlaqə saxlayın
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
