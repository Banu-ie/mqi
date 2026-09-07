import { useEffect, useMemo, useState } from "react";
import { listProducts } from "../api/products";
import { listCategories } from "../api/categories";
import { ApiError } from "../api/client";
import type { Product, Category } from "../api/types";
import ProductCard, {
  FAVORITES_KEY,
  FAVORITES_CHANGED_EVENT,
} from "../components/ui/ProductCard";
import { ErrorBanner, PageSpinner } from "../components/ui/StatusStates";

type SortOption =
  | "default"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc";

const allCategoryLabel = "Hamısı";

function getFavorites(): string[] {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function Products() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(allCategoryLabel);
  const [sort, setSort] = useState<SortOption>("default");

  const [showFavorites, setShowFavorites] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(
    getFavorites
  );

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);

    Promise.all([
      listProducts(),
      listCategories("product"),
    ])
      .then(([items, cats]) => {
        setProducts(items);
        setCategories(cats);
      })
      .catch((err) => {
        setError(
          err instanceof ApiError
            ? err.message
            : "Məhsullar yüklənə bilmədi."
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  // Favorite dəyişikliklərini məhsullar səhifəsində dərhal göstər
  useEffect(() => {
    const updateFavorites = () => {
      setFavoriteIds(getFavorites());
    };

    window.addEventListener(
      FAVORITES_CHANGED_EVENT,
      updateFavorites
    );

    return () => {
      window.removeEventListener(
        FAVORITES_CHANGED_EVENT,
        updateFavorites
      );
    };
  }, []);

  const allCategories = useMemo(
    () => [allCategoryLabel, ...categories.map((item) => item.name)],
    [categories]
  );

  const filtered = useMemo(() => {
    const searchValue = search.trim().toLocaleLowerCase("az");

    const result = products.filter((product) => {
      const matchCategory =
        category === allCategoryLabel ||
        product.category === category;

      const matchSearch =
        searchValue === "" ||
        product.name.toLocaleLowerCase("az").includes(searchValue) ||
        product.shortDesc
          .toLocaleLowerCase("az")
          .includes(searchValue);

      const matchFavorite =
        !showFavorites ||
        favoriteIds.includes(String(product.id));

      return (
        matchCategory &&
        matchSearch &&
        matchFavorite &&
        product.status === "active"
      );
    });

    return [...result].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return Number(a.price) - Number(b.price);

        case "price-desc":
          return Number(b.price) - Number(a.price);

        case "name-asc":
          return a.name.localeCompare(b.name, "az");

        case "name-desc":
          return b.name.localeCompare(a.name, "az");

        default:
          return 0;
      }
    });
  }, [
    products,
    search,
    category,
    sort,
    showFavorites,
    favoriteIds,
  ]);

  const hasActiveFilters =
    search.trim() !== "" ||
    category !== allCategoryLabel ||
    sort !== "default" ||
    showFavorites;

  const resetFilters = () => {
    setSearch("");
    setCategory(allCategoryLabel);
    setSort("default");
    setShowFavorites(false);
  };

  const clearSearch = () => {
    setSearch("");
  };

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="py-16 bg-gradient-to-br from-[#d98643] via-[#9e4996] to-[#8636a1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/15 text-white/90 text-xs font-semibold mb-5 uppercase tracking-wider">
            Kataloq
          </div>

          <h1 className="font-['DM_Serif_Display'] text-5xl text-white mb-4">
            Məhsullar
          </h1>

          <p className="text-white/75 text-lg max-w-xl mx-auto">
            İcma üzvlərinin hazırladığı unikal əl işi məhsullar.
            Hər biri zəhmət və sevginin nəticəsidir.
          </p>
        </div>
      </section>

      {/* Products */}
      <section className="py-12 bg-[#F8FAFF] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <PageSpinner label="Məhsullar yüklənir..." />
          ) : error ? (
            <ErrorBanner message={error} onRetry={load} />
          ) : (
            <>
              {/* Search + Sort */}
              <div className="flex flex-col lg:flex-row gap-5 mb-8">
                {/* Search */}
                <div className="relative flex-1">
                  <svg
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7A99]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>

                  <input
                    type="text"
                    placeholder="Məhsul axtar..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-11 py-3.5 rounded-xl border border-[#E4E9F4] bg-white text-[#1A2540] placeholder-[#6B7A99] focus:outline-none focus:ring-2 focus:ring-[#3B6FE0]/30 focus:border-[#3B6FE0] transition-all"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      aria-label="Axtarışı təmizlə"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center !text-[#6B7A99] hover:bg-[#EEF3FD] hover:!text-[#3B6FE0] transition-colors"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Sort */}
                <div className="lg:w-64">
                  <select
                    value={sort}
                    onChange={(e) =>
                      setSort(e.target.value as SortOption)
                    }
                    className="w-full px-4 py-3.5 rounded-xl border border-[#E4E9F4] bg-white !text-[#1A2540] focus:outline-none focus:ring-2 focus:ring-[#3B6FE0]/30 focus:border-[#3B6FE0] transition-all cursor-pointer"
                  >
                    <option value="default">
                      Sıralama: standart
                    </option>

                    <option value="price-asc">
                      Qiymət: aşağıdan yuxarı
                    </option>

                    <option value="price-desc">
                      Qiymət: yuxarıdan aşağı
                    </option>

                    <option value="name-asc">
                      Ad: A-dan Z-yə
                    </option>

                    <option value="name-desc">
                      Ad: Z-dən A-ya
                    </option>
                  </select>
                </div>
              </div>

              {/* Category + Favorites filters */}
              <div className="flex flex-wrap items-center gap-3 mb-10">
                {allCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      category === cat
                        ? "bg-gradient-to-r from-[#e0844c] to-[#c94cb0] !text-white shadow-md"
                        : "bg-white !text-[#6B7A99] border border-[#E4E9F4] hover:border-[#3B6FE0] hover:!text-[#3B6FE0] hover:shadow-sm"
                    }`}
                  >
                    {cat}
                  </button>
                ))}

                {/* Favorites */}
                <button
                  type="button"
                  onClick={() =>
                    setShowFavorites((current) => !current)
                  }
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    showFavorites
                      ? "bg-gradient-to-r from-[#E84B9B] to-[#C94CB0] !text-white shadow-md"
                      : "bg-white !text-[#E84B9B] border border-[#F2D4E5] hover:bg-[#FFF3F8] hover:border-[#E84B9B]"
                  }`}
                >
                  <span className="mr-1">♥</span>
                  Favoritlərim ({favoriteIds.length})
                </button>
              </div>

              {/* Active filters */}
              {hasActiveFilters && (
                <div className="flex items-center justify-between gap-4 mb-8 px-4 py-3 rounded-xl bg-white border border-[#E4E9F4]">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-semibold !text-[#1A2540]">
                      Aktiv filtrlər:
                    </span>

                    {search.trim() && (
                      <span className="px-2.5 py-1 rounded-lg bg-[#EEF3FD] !text-[#3B6FE0]">
                        Axtarış: {search}
                      </span>
                    )}

                    {category !== allCategoryLabel && (
                      <span className="px-2.5 py-1 rounded-lg bg-[#EEF3FD] !text-[#3B6FE0]">
                        Kateqoriya: {category}
                      </span>
                    )}

                    {showFavorites && (
                      <span className="px-2.5 py-1 rounded-lg bg-[#FFF0F7] !text-[#E84B9B]">
                        Yalnız favoritlər
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={resetFilters}
                    className="shrink-0 px-4 py-2 rounded-lg bg-[#EEF3FD] !text-[#3B6FE0] text-sm font-semibold border border-[#D8E2FA] hover:bg-gradient-to-r hover:from-[#3B6FE0] hover:to-[#7C5CFC] hover:!text-white hover:border-transparent transition-all duration-200"
                  >
                    Filtrləri sıfırla
                  </button>
                </div>
              )}

              {/* Result count */}
              <div className="flex items-center justify-between mb-7">
                <p className="text-[#6B7A99] text-sm">
                  <span className="font-semibold text-[#1A2540]">
                    {filtered.length}
                  </span>{" "}
                  məhsul tapıldı
                </p>
              </div>

              {/* Empty state */}
              {filtered.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 rounded-full bg-[#EEF3FD] flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-[#6B7A99]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>

                  <h3 className="font-['DM_Serif_Display'] text-xl !text-[#1A2540] mb-2">
                    {showFavorites
                      ? "Hələ favorit məhsul yoxdur"
                      : "Heç bir məhsul tapılmadı"}
                  </h3>

                  <p className="!text-[#6B7A99] mb-5">
                    {showFavorites
                      ? "Bəyəndiyiniz məhsulları ürək düyməsinə basaraq favoritlərinizə əlavə edin."
                      : "Axtarış parametrlərini dəyişib yenidən cəhd edin."}
                  </p>

                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#3B6FE0] to-[#7C5CFC] !text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                    >
                      Filtrləri sıfırla
                    </button>
                  )}
                </div>
              ) : (
                /* Product grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
                  {filtered.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}