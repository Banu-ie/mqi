export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  shortDesc: string;
  fullDesc: string;
  image: string;
  status: "active" | "inactive";
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  fullDesc: string;
  image: string;
  forWhom: string;
  benefits: string[];
  status: "active" | "inactive";
}

export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  shortDesc: string;
  fullDesc: string;
  image: string;
  status: "upcoming" | "past";
}

export interface Category {
  id: string;
  name: string;
  type: "product" | "service";
}

export const products: Product[] = [
  {
    id: "1",
    name: "Əl toxunması xalça",
    price: 85,
    category: "Əl işləri",
    shortDesc: "Ənənəvi Azərbaycan motivləri ilə toxunmuş dekorativ xalça.",
    fullDesc: "Mingəçevir Qadın İcması üzvləri tərəfindən əl ilə toxunan bu xalça, ənənəvi Azərbaycan ornamentlərini müasir dizaynla birləşdirir. Yüksək keyfiyyətli yun iplikdən hazırlanmış, uzunömürlü və davamlı məhsuldur. Hər xalça icma üzvlərimizin həftələr boyu sərf etdiyi zəhmətin nəticəsidir.",
    image: "https://images.unsplash.com/photo-1534413340928-7bd74b65196f?w=600&h=500&fit=crop&auto=format",
    status: "active",
    createdAt: "2025-10-15",
  },
  {
    id: "2",
    name: "Tikilmiş kənd köynəyi",
    price: 45,
    category: "Geyim",
    shortDesc: "Ənənəvi naxışlarla bəzədilmiş əl işi köynək.",
    fullDesc: "Dərzilik ustalarımız tərəfindən yüksək keyfiyyətli pambıq parçadan tikilmiş bu köynək, Azərbaycan milli ornamentlərini əks etdirən əl işi naxışlarla bəzədilmişdir. Hər biri unikal olan bu köynəklər, həm gündəlik həyatda həm də xüsusi mərasimlərdə istifadə oluna bilər.",
    image: "https://images.unsplash.com/photo-1608793733118-ee3f16002251?w=600&h=500&fit=crop&auto=format",
    status: "active",
    createdAt: "2025-10-20",
  },
  {
    id: "3",
    name: "Toxunma çanta",
    price: 30,
    category: "Çantalar",
    shortDesc: "Rəngli ipliklə toxunmuş əl işi çanta.",
    fullDesc: "İcmamızın toxuculuq ustadları tərəfindən hazırlanan bu çanta, müxtəlif rəngli ipliklərin ustalıqla bir araya gətirilməsindən yaranmışdır. Gündəlik istifadə üçün praktiki ölçüdə olan bu çanta, eyni zamanda bənzərsiz bir aksesuar olaraq diqqət çəkir.",
    image: "https://images.unsplash.com/photo-1722957533029-6b62a3826d05?w=600&h=500&fit=crop&auto=format",
    status: "active",
    createdAt: "2025-11-01",
  },
  {
    id: "4",
    name: "Naxışlı skarf",
    price: 20,
    category: "Aksesuarlar",
    shortDesc: "İpək iplikdən əl ilə toxunmuş dekorativ skarf.",
    fullDesc: "Zərif ipək iplikdən toxunmuş bu skarf, rəngarəng Azərbaycan ornamentlərini əks etdirir. Yüngül quruluşu sayəsində hər mövsümdə rahatlıqla istifadə edilə bilər. Hər skarf icmamızın bacarıqlı toxuculuq ustalarının səylə hazırladığı unikal bir əsərdir.",
    image: "https://images.unsplash.com/photo-1770232303925-b6975e83c3fa?w=600&h=500&fit=crop&auto=format",
    status: "active",
    createdAt: "2025-11-05",
  },
  {
    id: "5",
    name: "Dekorativ yastıq üzü",
    price: 25,
    category: "Əl işləri",
    shortDesc: "Rəngli saplarla işlənmiş əl işi yastıq üzü.",
    fullDesc: "Diqqəti cəlb edən naxışlarla bəzədilmiş bu yastıq üzü, evinizə milli rəng qatacaq. Davamlı parçadan tikilmiş bu məhsul, uzunömürlülüyü ilə seçilir. İstənilən otaq dekorununa uyğun müxtəlif rəng seçimləri mövcuddur.",
    image: "https://images.unsplash.com/photo-1763733593326-758b2271d725?w=600&h=500&fit=crop&auto=format",
    status: "active",
    createdAt: "2025-11-10",
  },
  {
    id: "6",
    name: "Əl işi bilərzik",
    price: 15,
    category: "Aksesuarlar",
    shortDesc: "Muncuq və iplikdən hazırlanan əl işi bilərzik.",
    fullDesc: "Rəngarəng muncuqlar və keyfiyyətli ipliklər istifadə edilərək hazırlanan bu bilərzik, zərif görünüşü ilə hər geyimə uyğundur. Hər bir bilərzik unikal dizayna malikdir, çünki icma üzvlərimiz onları tam əl işi ilə hazırlayır.",
    image: "https://images.unsplash.com/photo-1544031089-296448e3ebfa?w=600&h=500&fit=crop&auto=format",
    status: "active",
    createdAt: "2025-11-15",
  },
];

export const services: Service[] = [
  {
    id: "1",
    name: "Dərzilik xidməti",
    description: "Professional tikinti xidmətləri — gündəlik geyimdən tutmuş xüsusi mərasim paltarlarına qədər.",
    fullDesc: "İcmamızın peşəkar dərzi üzvləri, müştəri tələblərinə uyğun geyim tikinti xidmətləri göstərir. Hər biri uzun illik təcrübəyə malik olan dərzilərimiz, yüksək keyfiyyətli tikinti ilə sizi sevindirəcək.",
    image: "https://images.unsplash.com/photo-1457972657980-4c9fddebec8d?w=600&h=450&fit=crop&auto=format",
    forWhom: "Hər yaşdan qadın sahibkarlara, ev xanımlarına və peşəkar dərzi olmaq istəyənlərə.",
    benefits: ["Fərdi tikiş", "Ölçüyə uyğun hazırlanma", "Keyfiyyətli parça seçimi", "Sərfəli qiymətlər"],
    status: "active",
  },
  {
    id: "2",
    name: "Toxuculuq",
    description: "Ənənəvi toxuculuq sənətini öyrənin və ya hazır məhsul sifariş edin.",
    fullDesc: "Əl toxuculuğu sahəsində dərin biliyə sahib icma üzvlərimiz, bu sənəti sevənlərlə paylaşmaq üçün hazırdır. Xalça, skarf, çanta və digər toxuculuq məhsulları sifariş etmək mümkündür.",
    image: "https://images.unsplash.com/photo-1763733593326-758b2271d725?w=600&h=450&fit=crop&auto=format",
    forWhom: "Ənənəvi sənətlərə maraq göstərənlər, suvenir axtaranlar və ev dekorasiyasına diqqət edənlər üçün.",
    benefits: ["Ənənəvi üsul", "Yüksək keyfiyyət", "Unikal dizayn", "Sifariş imkanı"],
    status: "active",
  },
  {
    id: "3",
    name: "Peşə və bacarıq təlimləri",
    description: "Dərzilik, toxuculuq, kulinariya və digər peşəvi bacarıqlar üzrə praktiki təlimlər.",
    fullDesc: "İcmamız qadınların yeni bacarıqlar əldə etməsinə kömək etmək məqsədilə müxtəlif peşə təlimləri təşkil edir. Təlimlər nəzəri məlumatlarla yanaşı, praktiki məşğələləri də əhatə edir.",
    image: "https://images.unsplash.com/photo-1618587194716-40490bdba417?w=600&h=450&fit=crop&auto=format",
    forWhom: "Yeni peşə öyrənmək, mövcud bacarıqlarını inkişaf etdirmək istəyən qadınlar üçün.",
    benefits: ["Praktiki məşğələlər", "Peşəkar müəllimlər", "Sertifikat imkanı", "Kiçik qruplarda təlim"],
    status: "active",
  },
  {
    id: "4",
    name: "Sahibkarlıq və biznes təlimləri",
    description: "Öz biznesinizi qurmaq üçün lazım olan biliklər — biznes planlaşdırması, marketinq, maliyyə.",
    fullDesc: "İcmamız qadın sahibkarlığını dəstəkləmək məqsədilə biznes inkişafı üzrə müxtəlif fəaliyyətlər həyata keçirir. Bu fəaliyyətlər çərçivəsində iştirakçılar biznes ideyalarını inkişaf etdirmək, bazar araşdırması aparmaq və öz kiçik bizneslərini qurmaq üçün bilik əldə edirlər.",
    image: "https://images.unsplash.com/photo-1590929936124-b30012ff94ab?w=600&h=450&fit=crop&auto=format",
    forWhom: "Sahibkar olmaq istəyən qadınlar, kiçik biznes quran qadınlar üçün.",
    benefits: ["Biznes planlaşdırması", "Marketinq strategiyaları", "Maliyyə savadlılığı", "Mentor dəstəyi"],
    status: "active",
  },
  {
    id: "5",
    name: "Psixoloji sessiyalar",
    description: "Peşəkar psixoloq dəstəyi ilə şəxsi inkişaf, stress idarəetmə və özünüifadə.",
    fullDesc: "İcmamız qadınların psixi sağlamlığını dəstəkləmək məqsədilə psixoloji sessiyalar təşkil edir. Bu sessiyalarda iştirakçılar özünüdərk, stress idarəetməsi, münasibətlər psixologiyası və şəxsi inkişaf mövzularını araşdırırlar.",
    image: "https://images.unsplash.com/photo-1596939082030-301c0d17b5b3?w=600&h=450&fit=crop&auto=format",
    forWhom: "Özünü inkişaf etdirmək, stress ilə başa çıxmaq istəyən bütün qadınlar üçün.",
    benefits: ["Peşəkar psixoloq", "Gizlilik", "Fərdi yanaşma", "Qrup sessiyaları"],
    status: "active",
  },
];

export const events: Event[] = [
  {
    id: "1",
    title: "Əl işlərinin sərgi-satışı",
    date: "2025-12-15",
    location: "Mingəçevir, Mədəniyyət Sarayı",
    shortDesc: "İcma üzvlərinin hazırladığı əl işlərinin nümayiş edildiyi sərgi-satış tədbirini.",
    fullDesc: "Mingəçevir Qadın İcması üzvlərinin böyük zəhməti ilə hazırladıqları unikal əl işlərini bu sərgi-satışda görə bilərsiniz. Xalçalar, geyimlər, çantalar, aksesuarlar və daha çox məhsul sizin üçün hazırlanmışdır. Bu, həm icmamızın yaradıcılığını tanıtmaq, həm də üzvlərımizin gəlir əldə etməsinə dəstək olmaq imkanıdır.",
    image: "https://images.unsplash.com/photo-1770232303925-b6975e83c3fa?w=800&h=500&fit=crop&auto=format",
    status: "upcoming",
  },
  {
    id: "2",
    title: "Sahibkarlıq mövzusunda seminar",
    date: "2025-12-22",
    location: "Mingəçevir, İcma Mərkəzi",
    shortDesc: "Qadın sahibkarlığını dəstəkləyən praktiki seminar.",
    fullDesc: "Bu seminarda iştirakçılar öz kiçik bizneslərini necə quracaqlarını, bazar araşdırması aparacaqlarını və biznes planı yazacaqlarını öyrənəcəklər. Peşəkar iş adamları və biznes mütəxəssislərinin iştirakı nəzərdə tutulur. Seminar praktiki məşğələləri əhatə edir.",
    image: "https://images.unsplash.com/photo-1590929936124-b30012ff94ab?w=800&h=500&fit=crop&auto=format",
    status: "upcoming",
  },
  {
    id: "3",
    title: "Dərzilik masterklası",
    date: "2026-01-10",
    location: "Mingəçevir, Qadın İcması Mərkəzi",
    shortDesc: "Peşəkar dərzi tərəfindən aparılan praktiki dərzilik masterklası.",
    fullDesc: "Peşəkar dərzilik sahəsindəki təcrübəni paylaşmaq məqsədilə keçirilən bu masterklasda iştirakçılar əsas tikinti texnikalarını öyrənəcəklər. Praktiki məşğələlər əsasında keçirilən bu tədbirə ilkin tikinti biliyinə sahib olmaq arzusunda olan hər kəs qatıla bilər.",
    image: "https://images.unsplash.com/photo-1618587194716-40490bdba417?w=800&h=500&fit=crop&auto=format",
    status: "upcoming",
  },
  {
    id: "4",
    title: "İcmanın açılış tədbirı",
    date: "2025-10-20",
    location: "Mingəçevir, Mədəniyyət Evi",
    shortDesc: "Mingəçevir Qadın İcmasının rəsmi açılışı.",
    fullDesc: "Mingəçevir Qadın İcması 2025-ci il oktyabr ayında rəsmi olaraq açıldı. Açılış tədbirində şəhərin müxtəlif nümayəndələri, qadın icmalarının rəhbərləri və yerli sakinlər iştirak etdi. Tədbirdə icmanın məqsədləri, fəaliyyət istiqamətləri və gələcək planları barədə məlumat verildi.",
    image: "https://images.unsplash.com/photo-1783853855829-684167740ed8?w=800&h=500&fit=crop&auto=format",
    status: "past",
  },
  {
    id: "5",
    title: "Psixoloji inkişaf sessiyası",
    date: "2025-11-15",
    location: "Mingəçevir, İcma Mərkəzi",
    shortDesc: "Özünüdərk və şəxsi inkişaf mövzusunda qrup sessiyası.",
    fullDesc: "İcmanın psixoloji inkişaf fəaliyyətləri çərçivəsində keçirilən bu sessiyada iştirakçılar özünüdərk, stress idarəetməsi və müsbət düşüncə mövzuları üzərində çalışdılar. Peşəkar psixoloq tərəfindən aparılan sessiya iştirakçılar tərəfindən yüksək qiymətləndirildi.",
    image: "https://images.unsplash.com/photo-1596939082030-301c0d17b5b3?w=800&h=500&fit=crop&auto=format",
    status: "past",
  },
];

export const categories: Category[] = [
  { id: "1", name: "Əl işləri", type: "product" },
  { id: "2", name: "Geyim", type: "product" },
  { id: "3", name: "Çantalar", type: "product" },
  { id: "4", name: "Aksesuarlar", type: "product" },
  { id: "5", name: "Digər", type: "product" },
  { id: "6", name: "Dərzilik", type: "service" },
  { id: "7", name: "Toxuculuq", type: "service" },
  { id: "8", name: "Təlimlər", type: "service" },
  { id: "9", name: "Psixologiya", type: "service" },
];
