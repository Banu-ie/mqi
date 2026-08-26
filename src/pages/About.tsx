const directions = [
  "Qadınların peşə və bacarıqlarının inkişaf etdirilməsi",
  "Qadınların məşğulluq imkanlarının artırılması",
  "Sahibkarlıq və biznes yönümlü təlimlərin təşkili",
  "Qadınların öz bizneslərini qurmasına dəstək",
  "Hazırlanan əl işlərinin satışına və gəlir əldə etməsinə imkan yaradılması",
  "Psixoloji sessiyalar və şəxsi inkişaf tədbirləri",
  "Qadınların sosial və iqtisadi fəallığının artırılması",
];

export default function About() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-br from-[#1A2540] via-[#2D3B6B] to-[#3B6FE0] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-[#7C5CFC] blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-[#3B6FE0] blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/15 text-white/90 text-xs font-semibold mb-6 uppercase tracking-wider">
            Haqqımızda
          </div>
          <h1 className="font-['DM_Serif_Display'] text-5xl lg:text-6xl text-white mb-6">
            Haqqımızda
          </h1>
          <p className="text-white/75 text-xl max-w-2xl mx-auto">
            Mingəçevir Qadın İcması 2025-ci ilin oktyabr ayında yaradılıb.
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-['DM_Serif_Display'] text-4xl text-[#1A2540] mb-6 leading-tight">
                Missiyamız
              </h2>
              <p className="text-[#6B7A99] text-lg leading-relaxed mb-6">
                Qadınların sosial və iqtisadi inkişafına dəstək olmaq, onların bilik və bacarıqlarını artırmaq, məşğulluq və sahibkarlıq imkanlarını genişləndirmək.
              </p>
              <p className="text-[#6B7A99] leading-relaxed">
                İcmamız qadınlara sadəcə dəstək olmaqla kifayətlənmir — onlara öz həyatlarında müstəqil seçimlər etmək üçün lazımi bilik, bacarıq və güvən verir. Biz inanırıq ki, hər qadın böyük potensialına malikdir, ona sadəcə doğru mühit lazımdır.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl overflow-hidden aspect-square bg-[#F0F4FE] row-span-2">
                <img
                  src="https://images.unsplash.com/photo-1744742224472-be00657176f9?w=400&h=600&fit=crop&auto=format"
                  alt="İcma üzvü"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-2xl overflow-hidden aspect-square bg-[#F0F4FE]">
                <img
                  src="https://images.unsplash.com/photo-1770232303925-b6975e83c3fa?w=400&h=400&fit=crop&auto=format"
                  alt="Əl işi"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-2xl overflow-hidden aspect-square bg-[#F0F4FE]">
                <img
                  src="https://images.unsplash.com/photo-1618587194716-40490bdba417?w=400&h=400&fit=crop&auto=format"
                  alt="Tikinti"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Directions */}
      <section className="py-24 bg-[#F8FAFF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F3F0FF] text-[#7C5CFC] text-xs font-semibold mb-5 uppercase tracking-wider">
              Fəaliyyətlər
            </div>
            <h2 className="font-['DM_Serif_Display'] text-4xl lg:text-5xl text-[#1A2540]">
              Fəaliyyət istiqamətlərimiz
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {directions.map((d, i) => (
              <div
                key={i}
                className="flex items-start gap-4 bg-white rounded-2xl p-6 border border-[#E4E9F4] hover:shadow-md transition-shadow"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3B6FE0] to-[#7C5CFC] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <p className="text-[#1A2540] font-medium leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#EEF3FD] text-[#3B6FE0] text-xs font-semibold mb-5 uppercase tracking-wider">
            Tarix
          </div>
          <h2 className="font-['DM_Serif_Display'] text-4xl text-[#1A2540] mb-14">
            Yolumuz
          </h2>
          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#E4E9F4]" />
            <div className="relative flex flex-col items-center">
              <div className="bg-white border-2 border-[#3B6FE0] rounded-2xl p-8 shadow-lg max-w-sm w-full">
                <div className="text-[#3B6FE0] font-['DM_Serif_Display'] text-3xl mb-3">Oktyabr 2025</div>
                <h3 className="font-semibold text-[#1A2540] mb-2">İcmanın yaradılması</h3>
                <p className="text-[#6B7A99] text-sm leading-relaxed">
                  Mingəçevir Qadın İcması rəsmi olaraq yaradıldı. İlk tədbirlər, ilk üzvlər, ilk addımlar.
                </p>
              </div>
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#3B6FE0] to-[#7C5CFC] my-6" />
              <div className="bg-[#F8FAFF] border border-dashed border-[#E4E9F4] rounded-2xl p-8 max-w-sm w-full">
                <div className="text-[#6B7A99] font-['DM_Serif_Display'] text-2xl mb-2">Gələcək</div>
                <p className="text-[#6B7A99] text-sm">Daha çox üzv, daha çox fəaliyyət, daha böyük icma...</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
