import { Link } from "react-router-dom";
import type { Event } from "../../data/mock";

interface Props {
  event: Event;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("az-AZ", { day: "numeric", month: "long", year: "numeric" });
}

export default function EventCard({ event }: Props) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-[#E4E9F4] group">
      <div className="relative overflow-hidden h-48 bg-[#F0F4FE]">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3">
          <span
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
              event.status === "upcoming"
                ? "bg-green-500 text-white"
                : "bg-[#6B7A99] text-white"
            }`}
          >
            {event.status === "upcoming" ? "Qarşıdan gələn" : "Keçirilmiş"}
          </span>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 text-[#7C5CFC] text-xs font-medium mb-2">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          {formatDate(event.date)}
        </div>
        <h3 className="font-['DM_Serif_Display'] text-[#1A2540] text-lg leading-snug mb-1">
          {event.title}
        </h3>
        <div className="flex items-center gap-1.5 text-[#6B7A99] text-xs mb-3">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          {event.location}
        </div>
        <p className="text-[#6B7A99] text-sm leading-relaxed mb-4 line-clamp-2">
          {event.shortDesc}
        </p>
        <Link
          to={`/tedbirler/${event.id}`}
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
