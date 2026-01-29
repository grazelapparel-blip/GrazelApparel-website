import { Heart } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  fabric?: string;
  fit?: string;
}

export function ProductCard({ id, name, price, image, fabric, fit }: ProductCardProps) {
  return (
    <div className="group relative bg-white">
      {/* Image Container */}
      <div className="relative aspect-[3/4] mb-4 overflow-hidden bg-[var(--cream)]">
        <ImageWithFallback
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <button className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
          <Heart size={18} strokeWidth={1.5} className="text-[var(--charcoal)]" />
        </button>
        <button className="absolute bottom-4 left-4 right-4 h-12 bg-[var(--crimson)] text-white text-[13px] tracking-wide opacity-0 group-hover:opacity-100 transition-opacity hover:opacity-90">
          Quick View
        </button>
      </div>

      {/* Product Info */}
      <div className="space-y-1">
        <h3 className="text-[14px] text-[var(--charcoal)] tracking-wide">
          {name}
        </h3>
        {(fabric || fit) && (
          <p className="text-[12px] text-[var(--light-gray)]">
            {[fabric, fit].filter(Boolean).join(' · ')}
          </p>
        )}
        <p className="text-[15px] text-[var(--crimson)] mt-2">
          £{price.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
