import "dotenv/config";
import bcrypt from "bcryptjs";
import { closeDb, execute, queryOne, runMigrations } from "./index";
import {
  Admins,
  Categories,
  Events,
  Products,
  Services,
  SiteContent,
} from "./models";
import { logger } from "../lib/logger";

// Seeding replaces the demo catalogue, so it only clears tables when
// SEED_RESET=true is passed explicitly. Without that flag it tops up empty
// tables and leaves existing rows alone — safe to run against a deployed
// database by accident.
const RESET = process.env.SEED_RESET === "true";

async function replaceTable(
  table: string,
  rowCount: number,
  insert: () => Promise<void>,
) {
  const row = await queryOne<{ count: number }>(
    `SELECT COUNT(*)::int AS count FROM ${table}`,
  );
  const existing = row?.count ?? 0;
  if (existing > 0 && !RESET) {
    console.log(
      `- ${table}: ${existing} row(s) already present, left untouched (SEED_RESET=true to replace)`,
    );
    return;
  }
  if (existing > 0) {
    await execute(`DELETE FROM ${table}`);
    console.log(`- ${table}: cleared ${existing} row(s) (SEED_RESET=true)`);
  }
  await insert();
  console.log(`- ${table}: inserted ${rowCount} row(s)`);
}

const PRODUCT_IMAGES: Record<string, string> = {
  "Əl toxunması xalça":
    "https://images.unsplash.com/photo-1534413340928-7bd74b65196f?w=600&h=500&fit=crop&auto=format",
  "Tikilmiş kənd köynəyi":
    "https://images.unsplash.com/photo-1608793733118-ee3f16002251?w=600&h=500&fit=crop&auto=format",
  "Toxunma çanta":
    "https://images.unsplash.com/photo-1722957533029-6b62a3826d05?w=600&h=500&fit=crop&auto=format",
  "Naxışlı skarf":
    "https://images.unsplash.com/photo-1770232303925-b6975e83c3fa?w=600&h=500&fit=crop&auto=format",
  "Dekorativ yastıq üzü":
    "https://images.unsplash.com/photo-1763733593326-758b2271d725?w=600&h=500&fit=crop&auto=format",
  "Əl işi bilərzik":
    "https://images.unsplash.com/photo-1544031089-296448e3ebfa?w=600&h=500&fit=crop&auto=format",
};

/**
 * Seed products ship with a gallery so the picture carousel has something to
 * carousel. These are three crops of the same placeholder photograph, standing
 * in for the several angles a real product would be shot from; genuine
 * photographs arrive through the admin panel.
 */
function galleryFor(name: string): string[] {
  const cover = PRODUCT_IMAGES[name];
  if (!cover) return [];
  const [base] = cover.split("?");
  return [
    cover,
    `${base}?w=600&h=500&fit=crop&crop=top&auto=format`,
    `${base}?w=600&h=500&fit=crop&crop=bottom&auto=format`,
  ];
}

const SERVICE_IMAGES: Record<string, string> = {
  "Dərzilik xidməti":
    "https://images.unsplash.com/photo-1457972657980-4c9fddebec8d?w=600&h=450&fit=crop&auto=format",
  Toxuculuq:
    "https://images.unsplash.com/photo-1763733593326-758b2271d725?w=600&h=450&fit=crop&auto=format",
  "Peşə və bacarıq təlimləri":
    "https://images.unsplash.com/photo-1618587194716-40490bdba417?w=600&h=450&fit=crop&auto=format",
  "Sahibkarlıq və biznes təlimləri":
    "https://images.unsplash.com/photo-1590929936124-b30012ff94ab?w=600&h=450&fit=crop&auto=format",
  "Psixoloji sessiyalar":
    "https://images.unsplash.com/photo-1596939082030-301c0d17b5b3?w=600&h=450&fit=crop&auto=format",
};

const EVENT_IMAGES: Record<string, string> = {
  "Əl işlərinin sərgi-satışı":
    "https://images.unsplash.com/photo-1770232303925-b6975e83c3fa?w=800&h=500&fit=crop&auto=format",
  "Sahibkarlıq mövzusunda seminar":
    "https://images.unsplash.com/photo-1590929936124-b30012ff94ab?w=800&h=500&fit=crop&auto=format",
  "Dərzilik masterklası":
    "https://images.unsplash.com/photo-1618587194716-40490bdba417?w=800&h=500&fit=crop&auto=format",
  "İcmanın açılış tədbirı":
    "https://images.unsplash.com/photo-1783853855829-684167740ed8?w=800&h=500&fit=crop&auto=format",
  "Psixoloji inkişaf sessiyası":
    "https://images.unsplash.com/photo-1596939082030-301c0d17b5b3?w=800&h=500&fit=crop&auto=format",
};

async function main() {
  const applied = await runMigrations();
  console.log(
    applied.length
      ? `- migrations applied: ${applied.join(", ")}`
      : "- migrations: already up to date",
  );

  const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (
    !adminEmail ||
    !adminPassword ||
    adminPassword === "REDACTED" ||
    adminPassword === "REDACTED"
  ) {
    throw new Error(
      "SEED_ADMIN_EMAIL and a unique SEED_ADMIN_PASSWORD are required; default credentials are not allowed.",
    );
  }
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await Admins.upsert({
    name: "Admin",
    email: adminEmail,
    passwordHash,
    role: "admin",
  });

  const categories = [
    { name: "Əl işləri", type: "product" },
    { name: "Geyim", type: "product" },
    { name: "Çantalar", type: "product" },
    { name: "Aksesuarlar", type: "product" },
    { name: "Digər", type: "product" },
    { name: "Dərzilik", type: "service" },
    { name: "Toxuculuq", type: "service" },
    { name: "Təlimlər", type: "service" },
    { name: "Psixologiya", type: "service" },
  ];
  const existingCategories = new Set(
    (await Categories.list()).map((c) => `${c.name}::${c.type}`),
  );
  let newCategories = 0;
  for (const category of categories) {
    if (!existingCategories.has(`${category.name}::${category.type}`)) {
      await Categories.create(category);
      newCategories += 1;
    }
  }
  console.log(
    `- categories: ${newCategories} added, ${existingCategories.size} already present`,
  );

  const products = [
    [
      "Əl toxunması xalça",
      85,
      "Əl işləri",
      "Ənənəvi Azərbaycan motivləri ilə toxunmuş dekorativ xalça.",
    ],
    [
      "Tikilmiş kənd köynəyi",
      45,
      "Geyim",
      "Ənənəvi naxışlarla bəzədilmiş əl işi köynək.",
    ],
    ["Toxunma çanta", 30, "Çantalar", "Rəngli ipliklə toxunmuş əl işi çanta."],
    [
      "Naxışlı skarf",
      20,
      "Aksesuarlar",
      "İpək iplikdən əl ilə toxunmuş dekorativ skarf.",
    ],
    [
      "Dekorativ yastıq üzü",
      25,
      "Əl işləri",
      "Rəngli saplarla işlənmiş əl işi yastıq üzü.",
    ],
    [
      "Əl işi bilərzik",
      15,
      "Aksesuarlar",
      "Muncuq və iplikdən hazırlanan əl işi bilərzik.",
    ],
  ] as const;
  await replaceTable("products", products.length, async () => {
    for (const [name, price, category, shortDesc] of products) {
      await Products.create({
        name,
        price,
        category,
        shortDesc,
        fullDesc: shortDesc,
        image: PRODUCT_IMAGES[name] ?? "",
        images: galleryFor(name),
        status: "active",
      });
    }
  });

  const services = [
    [
      "Dərzilik xidməti",
      "Professional tikinti xidmətləri — gündəlik geyimdən tutmuş xüsusi mərasim paltarlarına qədər.",
    ],
    [
      "Toxuculuq",
      "Ənənəvi toxuculuq sənətini öyrənin və ya hazır məhsul sifariş edin.",
    ],
    [
      "Peşə və bacarıq təlimləri",
      "Dərzilik, toxuculuq, kulinariya və digər peşəvi bacarıqlar üzrə praktiki təlimlər.",
    ],
    [
      "Sahibkarlıq və biznes təlimləri",
      "Öz biznesinizi qurmaq üçün lazım olan biliklər — biznes planlaşdırması, marketinq, maliyyə.",
    ],
    [
      "Psixoloji sessiyalar",
      "Peşəkar psixoloq dəstəyi ilə şəxsi inkişaf, stress idarəetmə və özünüifadə.",
    ],
  ] as const;
  await replaceTable("services", services.length, async () => {
    for (const [name, description] of services) {
      await Services.create({
        name,
        description,
        fullDesc: description,
        image: SERVICE_IMAGES[name] ?? "",
        forWhom: "Qadınlar üçün.",
        benefits: [],
        status: "active",
      });
    }
  });

  const events = [
    [
      "Əl işlərinin sərgi-satışı",
      "2025-12-15",
      "Mingəçevir, Mədəniyyət Sarayı",
      "İcma üzvlərinin hazırladığı əl işlərinin nümayiş edildiyi sərgi-satış tədbiri.",
    ],
    [
      "Sahibkarlıq mövzusunda seminar",
      "2025-12-22",
      "Mingəçevir, İcma Mərkəzi",
      "Qadın sahibkarlığını dəstəkləyən praktiki seminar.",
    ],
    [
      "Dərzilik masterklası",
      "2026-01-10",
      "Mingəçevir, Qadın İcması Mərkəzi",
      "Peşəkar dərzi tərəfindən aparılan praktiki dərzilik masterklası.",
    ],
    [
      "İcmanın açılış tədbirı",
      "2025-10-20",
      "Mingəçevir, Mədəniyyət Evi",
      "Mingəçevir Qadın İcmasının rəsmi açılışı.",
    ],
    [
      "Psixoloji inkişaf sessiyası",
      "2025-11-15",
      "Mingəçevir, İcma Mərkəzi",
      "Özünüdərk və şəxsi inkişaf mövzusunda qrup sessiyası.",
    ],
  ] as const;
  await replaceTable("events", events.length, async () => {
    for (const [title, date, location, shortDesc] of events) {
      await Events.create({
        title,
        date,
        location,
        shortDesc,
        fullDesc: shortDesc,
        image: EVENT_IMAGES[title] ?? "",
        status: date < "2026-01-01" ? "past" : "upcoming",
      });
    }
  });

  const contentExists = (await SiteContent.get()) !== undefined;
  if (contentExists && !RESET) {
    console.log(
      "- site_content: already configured, left untouched (SEED_RESET=true to replace)",
    );
  } else {
    await SiteContent.upsert({
      heroHeadline: "Mingəçevir Qadın İcması",
      heroSubtext:
        "Qadınların sosial və iqtisadi inkişafına, bacarıqlarının artırılmasına və yeni imkanlar qazanmasına dəstək oluruq.",
      aboutIntro:
        "Mingəçevir Qadın İcması 2025-ci ilin oktyabr ayında yaradılıb. İcmanın əsas məqsədi qadınların sosial və iqtisadi inkişafına dəstək olmaq, onların bilik və bacarıqlarını artırmaq, məşğulluq və sahibkarlıq imkanlarını genişləndirməkdir.",
      mission:
        "Qadınların sosial və iqtisadi inkişafına dəstək olmaq, onların bilik və bacarıqlarını artırmaq, məşğulluq və sahibkarlıq imkanlarını genişləndirmək.",
      phone: "+994 XX XXX XX XX",
      email: "info@mqicma.az",
      instagram: "@mingachevir_womens_community",
      address: "Mingəçevir şəhəri, Azərbaycan",
    });
    console.log("- site_content: configured");
  }

  console.log("Seed complete.");
  console.log(`Admin account ensured: ${adminEmail}`);
}

main()
  .catch((error) => {
    logger.error(error, "Seed command failed");
    process.exitCode = 1;
  })
  .finally(() => closeDb());
