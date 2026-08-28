import { useEffect, useState } from "react";
import { listContactMessages } from "../../api/contact";
import type { ContactMessage } from "../../api/types";
import { ApiError } from "../../api/client";

export default function AdminContact() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { listContactMessages().then(setMessages).catch((err) => setError(err instanceof ApiError ? err.message : "Mesajlar yüklənmədi.")).finally(() => setLoading(false)); }, []);
  return <div>
    <div className="mb-8"><h1 className="font-['DM_Serif_Display'] text-3xl text-[#1A2540]">Mesajlar</h1><p className="text-[#6B7A99] text-sm mt-1">Saytdan göndərilən əlaqə mesajları.</p></div>
    {loading && <p className="text-[#6B7A99] text-sm">Mesajlar yüklənir...</p>}
    {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}
    {!loading && !error && messages.length === 0 && <p className="text-[#6B7A99] text-sm">Hələ mesaj yoxdur.</p>}
    <div className="space-y-4">{messages.map((message) => <div key={message.id} className="bg-white rounded-2xl border border-[#E4E9F4] p-6"><div className="flex items-start justify-between gap-4 mb-3"><div><h2 className="font-semibold text-[#1A2540]">{message.name}</h2><p className="text-sm text-[#6B7A99]">{message.phone}</p></div><time className="text-xs text-[#6B7A99]">{new Date(message.createdAt).toLocaleString("az-AZ")}</time></div><p className="text-sm text-[#1A2540] whitespace-pre-wrap">{message.message}</p></div>)}</div>
  </div>;
}
