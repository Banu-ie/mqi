import { useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../../api/types";
import { resolveMediaUrl } from "../../api/client";

interface Props {
  product: Product;
}

const FAVORITES_KEY = "mqicma-favorite-products";

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

export default function ProductCard({ product }: Props) {
  const [imageError, setImageError] = useState(false);

  const [isFavorite, setIsFavorite] = useState(() =>
    getFavorites().includes(String(product.id))
  );

  const imageUrl = resolveMediaUrl(product.image);

  const toggleFavorite = () => {
    const favorites = getFavorites();
    const productId = String(product.id);

    let updatedFavorites: string[];

    if (favorites.includes(productId)) {
      updatedFavorites = favorites.filter(
        (id) => id !== productId
      );
      setIsFavorite(false);
    } else {
      updatedFavorites = [...favorites, productId];
      setIsFavorite(true);
    }

    localStorage.setItem(
      FAVORITES_KEY,
      JSON.stringify(updatedFavorites)
    );
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-[#E4E9F4] group h-full flex flex-col">
      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/3] bg-[#F0F4FE]">
        {!imageError ? (
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center !text-[#6B7A99]">
            <svg
              className="w-10 h-10 mb-2"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>

            <span className="text-xs">
              Şəkil mövcud deyil
            </span>
          </div>
        )}

        {/* Category */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/90 !text-[#3B6FE0] border border-[#3B6FE0]/20 shadow-sm">
            {product.category}
          </span>
        </div>

        {/* Favorite */}
        <button
          type="button"
          onClick={toggleFavorite}
          aria-label={
            isFavorite
              ? "Favoritlərdən çıxar"
              : "Favoritlərə əlavə et"
          }
          className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center bg-white/95 shadow-sm transition-all duration-200 hover:scale-110 ${
            isFavorite
              ? "!text-[#E84B9B]"
              : "!text-[#6B7A99] hover:!text-[#E84B9B]"
          }`}
        >
          <svg
            className="w-5 h-5"
            fill={isFavorite ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={1.8}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-['DM_Serif_Display'] !text-[#1A2540] text-lg leading-snug mb-2 line-clamp-2">
          {product.name}
        </h3>

        <p className="!text-[#6B7A99] text-sm leading-relaxed mb-5 line-clamp-2">
          {product.shortDesc}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3">
          <span className="!text-[#3B6FE0] font-bold text-xl whitespace-nowrap">
            {product.price}{" "}
            <span className="text-sm font-medium">
              AZN
            </span>
          </span>

          <Link
            to={`/mehsullar/${product.id}`}
            className="px-4 py-2 rounded-xl bg-[#EEF3FD] !text-[#3B6FE0] text-sm font-semibold border border-transparent hover:bg-gradient-to-r hover:from-[#3B6FE0] hover:to-[#7C5CFC] hover:!text-white transition-all duration-200 whitespace-nowrap"
          >
            Ətraflı bax
          </Link>
        </div>
      </div>
    </div>
  );
}