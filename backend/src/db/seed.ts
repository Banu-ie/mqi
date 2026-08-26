import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "./index";
import { Admins, Categories, Products, Services, Events, SiteContent } from "./models";

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@mqicma.az";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "REDACTED";
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  Admins.upsert({ name: "Admin", email: adminEmail, passwordHash, role: "admin" });

  const categories = [
    { name: "Əl işləri", type: "product" }, { name: "Geyim", type: "product" },
    { name: "Çantalar", type: "product" }, { name: "Aksesuarlar", type: "product" },
    { name: "Digər", type: "product" }, { name: "Dərzilik", type: "service" },
    { name: "Toxuculuq", type: "service" }, { name: "Təlimlər", type: "service" },
    { name: "Psixologiya", type: "service" },
  ];
  const existingCategories = new Set(Categories.list().map((c) => `${c.name}::${c.type}`));
  for (const category of categories) {
    if (!existingCategories.has(`${category.name}::${category.type}`)) Categories.create(category);
  }

  db.prepare("DELETE FROM products").run();
  const products = [
    ["Əl toxunması xalça", 85, "Əl işləri", "Ənənəvi Azərbaycan motivləri ilə toxunmuş dekorativ xalça."],
    ["Tikilmiş kənd köynəyi", 45, "Geyim", "Ənənəvi naxışlarla bəzədilmiş əl işi köynək."],
    ["Toxunma çanta", 30, "Çantalar", "Rəngli ipliklə toxunmuş əl işi çanta."],
    ["Naxışlı skarf", 20, "Aksesuarlar", "İpək iplikdən əl ilə toxunmuş dekorativ skarf."],
    ["Dekorativ yastıq üzü", 25, "Əl işləri", "Rəngli saplarla işlənmiş əl işi yastıq üzü."],
    ["Əl işi bilərzik", 15, "Aksesuarlar", "Muncuq və iplikdən hazırlanan əl işi bilərzik."],
  ] as const;
  for (const [name, price, category, shortDesc] of products) {
    const images: Record<string, string> = {
      "Əl toxunması xalça": "https://images.unsplash.com/photo-1534413340928-7bd74b65196f?w=600&h=500&fit=crop&auto=format",
      "Tikilmiş kənd köynəyi": "https://images.unsplash.com/photo-1608793733118-ee3f16002251?w=600&h=500&fit=crop&auto=format",
      "Toxunma çanta": "https://images.unsplash.com/photo-1722957533029-6b62a3826d05?w=600&h=500&fit=crop&auto=format",
      "Naxışlı skarf": "https://images.unsplash.com/photo-1770232303925-b6975e83c3fa?w=600&h=500&fit=crop&auto=format",
      "Dekorativ yastıq üzü": "https://images.unsplash.com/photo-1763733593326-758b2271d725?w=600&h=500&fit=crop&auto=format",
      "Əl işi bilərzik": "https://images.unsplash.com/photo-1544031089-296448e3ebfa?w=600&h=500&fit=crop&auto=format",
    };
    Products.create({ name, price, category, shortDesc, fullDesc: shortDesc, image: images[name], status: "active" });
  }

  db.prepare("DELETE FROM services").run();
  const services = [
    ["Dərzilik xidməti", "Professional tikinti xidmətləri — gündəlik geyimdən tutmuş xüsusi mərasim paltarlarına qədər."],
    ["Toxuculuq", "Ənənəvi toxuculuq sənətini öyrənin və ya hazır məhsul sifariş edin."],
    ["Peşə və bacarıq təlimləri", "Dərzilik, toxuculuq, kulinariya və digər peşəvi bacarıqlar üzrə praktiki təlimlər."],
    ["Sahibkarlıq və biznes təlimləri", "Öz biznesinizi qurmaq üçün lazım olan biliklər — biznes planlaşdırması, marketinq, maliyyə."],
    ["Psixoloji sessiyalar", "Peşəkar psixoloq dəstəyi ilə şəxsi inkişaf, stress idarəetmə və özünüifadə."],
  ] as const;
  for (const [name, description] of services) {
    const images: Record<string, string> = {
      "Dərzilik xidməti": "https://images.unsplash.com/photo-1457972657980-4c9fddebec8d?w=600&h=450&fit=crop&auto=format",
      "Toxuculuq": "https://images.unsplash.com/photo-1763733593326-758b2271d725?w=600&h=450&fit=crop&auto=format",
      "Peşə və bacarıq təlimləri": "https://images.unsplash.com/photo-1618587194716-40490bdba417?w=600&h=450&fit=crop&auto=format",
      "Sahibkarlıq və biznes təlimləri": "https://images.unsplash.com/photo-1590929936124-b30012ff94ab?w=600&h=450&fit=crop&auto=format",
      "Psixoloji sessiyalar": "https://images.unsplash.com/photo-1596939082030-301c0d17b5b3?w=600&h=450&fit=crop&auto=format",
    };
    Services.create({ name, description, fullDesc: description, image: images[name], forWhom: "Qadınlar üçün.", benefits: [], status: "active" });
  }

  db.prepare("DELETE FROM events").run();
  const events = [
    ["Əl işlərinin sərgi-satışı", "2025-12-15", "Mingəçevir, Mədəniyyət Sarayı", "İcma üzvlərinin hazırladığı əl işlərinin nümayiş edildiyi sərgi-satış tədbiri."],
    ["Sahibkarlıq mövzusunda seminar", "2025-12-22", "Mingəçevir, İcma Mərkəzi", "Qadın sahibkarlığını dəstəkləyən praktiki seminar."],
    ["Dərzilik masterklası", "2026-01-10", "Mingəçevir, Qadın İcması Mərkəzi", "Peşəkar dərzi tərəfindən aparılan praktiki dərzilik masterklası."],
    ["İcmanın açılış tədbirı", "2025-10-20", "Mingəçevir, Mədəniyyət Evi", "Mingəçevir Qadın İcmasının rəsmi açılışı."],
    ["Psixoloji inkişaf sessiyası", "2025-11-15", "Mingəçevir, İcma Mərkəzi", "Özünüdərk və şəxsi inkişaf mövzusunda qrup sessiyası."],
  ] as const;
  for (const [title, date, location, shortDesc] of events) {
    const status = date < "2026-01-01" ? "past" : "upcoming";
    const images: Record<string, string> = {
      "Əl işlərinin sərgi-satışı": "https://images.unsplash.com/photo-1770232303925-b6975e83c3fa?w=800&h=500&fit=crop&auto=format",
      "Sahibkarlıq mövzusunda seminar": "https://images.unsplash.com/photo-1590929936124-b30012ff94ab?w=800&h=500&fit=crop&auto=format",
      "Dərzilik masterklası": "https://images.unsplash.com/photo-1618587194716-40490bdba417?w=800&h=500&fit=crop&auto=format",
      "İcmanın açılış tədbirı": "https://images.unsplash.com/photo-1783853855829-684167740ed8?w=800&h=500&fit=crop&auto=format",
      "Psixoloji inkişaf sessiyası": "https://images.unsplash.com/photo-1596939082030-301c0d17b5b3?w=800&h=500&fit=crop&auto=format",
    };
    Events.create({ title, date, location, shortDesc, fullDesc: shortDesc, image: images[title], status });
  }

  SiteContent.upsert({
    heroHeadline: "Mingəçevir Qadın İcması",
    heroSubtext: "Qadınların sosial və iqtisadi inkişafına, bacarıqlarının artırılmasına və yeni imkanlar qazanmasına dəstək oluruq.",
    aboutIntro: "Mingəçevir Qadın İcması 2025-ci ilin oktyabr ayında yaradılıb. İcmanın əsas məqsədi qadınların sosial və iqtisadi inkişafına dəstək olmaq, onların bilik və bacarıqlarını artırmaq, məşğulluq və sahibkarlıq imkanlarını genişləndirməkdir.",
    mission: "Qadınların sosial və iqtisadi inkişafına dəstək olmaq, onların bilik və bacarıqlarını artırmaq, məşğulluq və sahibkarlıq imkanlarını genişləndirmək.",
    phone: "+994 XX XXX XX XX",
    email: "info@mqicma.az",
    instagram: "@mingachevir_womens_community",
    address: "Mingəçevir şəhəri, Azərbaycan",
  });

  console.log("Seed complete.");
  console.log(`Admin login -> email: ${adminEmail}  password: ${adminPassword}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
