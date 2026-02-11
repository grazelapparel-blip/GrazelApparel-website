import { Heart } from 'lucide-react';
import { useAppStore } from '../store/app-store';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  fabric?: string;
  fit?: string;
  gender?: string;
  isEssential?: boolean;
  offerPercentage?: number;
  onQuickView?: () => void;
}

export function ProductCard({ id, name, price, image, fabric, fit, gender, isEssential, offerPercentage, onQuickView }: ProductCardProps) {
  const { toggleFavorite, isFavorite } = useAppStore();

  const favorited = isFavorite(id);

  const handleLikeClick = () => {
    const product = { id, name, price, image, fabric, fit, gender, isEssential, offerPercentage };
    toggleFavorite(product);
  };

  return (
    <div className="group relative bg-white">
      {/* Image Container */}
      <div className="relative aspect-[3/4] mb-4 overflow-hidden bg-[var(--cream)]">
        <ImageWithFallback
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Offer Badge */}
        {offerPercentage && offerPercentage > 0 && (
          <div className="absolute top-4 left-4 bg-[var(--crimson)] text-white px-3 py-1 text-[12px] font-medium">
            {offerPercentage}% OFF
          </div>
        )}
        
        {/* Essential Badge */}
        {isEssential && (
          <div className="absolute top-4 right-12 bg-green-600 text-white px-3 py-1 text-[12px] font-medium">
            ESSENTIAL
          </div>
        )}
        
        <button
          onClick={handleLikeClick}
          className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
          title={favorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            size={18}
            strokeWidth={1.5}
            className={favorited ? 'text-[var(--crimson)] fill-[var(--crimson)]' : 'text-[var(--charcoal)]'}
          />
        </button>
        <button
          onClick={onQuickView}
          className="absolute bottom-4 left-4 right-4 h-12 bg-[var(--crimson)] text-white text-[13px] tracking-wide opacity-0 group-hover:opacity-100 transition-opacity hover:opacity-90"
        >
          Quick View
        </button>
      </div>

      {/* Product Info */}
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[14px] text-[var(--charcoal)] tracking-wide flex-1">
            {name}
          </h3>
          {gender && (
            <span className="text-[11px] bg-gray-200 text-[var(--charcoal)] px-2 py-1 whitespace-nowrap">
              {gender}
            </span>
          )}
        </div>
        {(fabric || fit) && (
          <p className="text-[12px] text-[var(--light-gray)]">
            {[fabric, fit].filter(Boolean).join(' · ')}
          </p>
        )}
        <p className="text-[15px] text-[var(--crimson)] mt-2">
          ₹{price.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
