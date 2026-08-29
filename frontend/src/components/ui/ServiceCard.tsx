import { Link } from "react-router-dom";
import type { Service } from "../../api/types";
import { resolveMediaUrl } from "../../api/client";

interface Props {
  service: Service;
}

export default function ServiceCard({ service }: Props) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-[#E4E9F4] group">
      <div className="relative overflow-hidden h-48 bg-[#F0F4FE]">
        <img
          src={resolveMediaUrl(service.image)}
          alt={service.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>
      <div className="p-5">
        <h3 className="font-['DM_Serif_Display'] text-[#1A2540] text-lg leading-snug mb-2">
          {service.name}
        </h3>
        <p className="text-[#6B7A99] text-sm leading-relaxed mb-4 line-clamp-2">
          {service.description}
        </p>
        <Link
          to={`/xidmetler/${service.id}`}
          className="inline-flex items-center gap-2 text-[#3B6FE0] text-sm font-semibold hover:gap-3 transition-all duration-200"
        >
          Ətraflı bax
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
