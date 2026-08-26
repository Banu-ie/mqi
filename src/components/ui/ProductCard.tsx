import { Link } from "react-router-dom";
import type { Product } from "../../data/mock";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-[#E4E9F4] group">
      <div className="relative overflow-hidden aspect-[4/3] bg-[#F0F4FE]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/90 text-[#3B6FE0] border border-[#3B6FE0]/20">
            {product.category}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-['DM_Serif_Display'] text-[#1A2540] text-lg leading-snug mb-1">
          {product.name}
        </h3>
        <p className="text-[#6B7A99] text-sm leading-relaxed mb-4 line-clamp-2">
          {product.shortDesc}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-[#3B6FE0] font-bold text-xl">
            {product.price} <span className="text-sm font-medium">AZN</span>
          </span>
          <Link
            to={`/mehsullar/${product.id}`}
            className="px-4 py-2 rounded-xl bg-[#EEF3FD] text-[#3B6FE0] text-sm font-semibold hover:bg-gradient-to-r hover:from-[#3B6FE0] hover:to-[#7C5CFC] hover:text-white transition-all duration-200"
          >
            Ətraflı bax
          </Link>
        </div>
      </div>
    </div>
  );
}
