import { useState } from 'react';
import { Heart, Ruler, TruckIcon, RotateCcw, Shield } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ProductDetailProps {
  onFitIntelligenceClick: () => void;
  onAddToCart: () => void;
}

export function ProductDetail({ onFitIntelligenceClick, onAddToCart }: ProductDetailProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const product = {
    name: 'Tailored Wool Blazer',
    price: 495,
    images: [
      'https://images.unsplash.com/photo-1762417421091-1b4e24facc62?w=1080',
      'https://images.unsplash.com/photo-1719518411339-5158cea86caf?w=1080',
      'https://images.unsplash.com/photo-1577909687863-91bb3ec12db5?w=1080'
    ],
    fabric: 'Italian Wool',
    fabricDetails: 'Woven from 100% superfine merino wool sourced from Italian mills, this fabric offers exceptional drape and breathability. The tight weave ensures durability while maintaining a soft hand feel.',
    fit: 'Regular Fit',
    fitDetails: 'Designed with a classic silhouette that sits comfortably at the shoulders with a gently tapered waist. Allows for layering while maintaining a refined profile.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    care: [
      'Dry clean only',
      'Store on a wooden hanger',
      'Steam to remove wrinkles',
      'Brush regularly to maintain texture'
    ],
    features: [
      'Horn buttons',
      'Full canvas construction',
      'Working cuff buttons',
      'Interior pocket',
      'Made in Portugal'
    ]
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div>
          <div className="sticky top-24 space-y-4">
            <div className="aspect-[3/4] bg-white overflow-hidden">
              <ImageWithFallback
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {product.images.slice(1).map((image, index) => (
                <div key={index} className="aspect-[3/4] bg-white overflow-hidden cursor-pointer hover:opacity-75 transition-opacity">
                  <ImageWithFallback
                    src={image}
                    alt={`${product.name} view ${index + 2}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Information */}
        <div className="bg-[var(--cream)] p-8 lg:p-12">
          {/* Title & Price */}
          <div className="mb-8">
            <h1 className="font-[var(--font-serif)] text-4xl mb-4 text-[var(--charcoal)]">
              {product.name}
            </h1>
            <p className="text-[24px] text-[var(--crimson)]">
              £{product.price.toFixed(2)}
            </p>
          </div>

          {/* Fit Intelligence Entry */}
          <button
            onClick={onFitIntelligenceClick}
            className="w-full h-14 mb-8 border border-[var(--crimson)] text-[var(--crimson)] text-[14px] tracking-wide hover:bg-[var(--crimson)] hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <Ruler size={18} strokeWidth={1.5} />
            Refine Fit for Your Body
          </button>

          {/* Size Selector */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-[var(--font-serif)] text-[17px] text-[var(--charcoal)]">
                Select Size
              </h3>
              <button className="text-[13px] text-[var(--crimson)] hover:underline">
                Size Guide
              </button>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`h-12 border text-[14px] transition-all ${
                    selectedSize === size
                      ? 'border-[var(--crimson)] bg-[var(--crimson)] text-white'
                      : 'border-[var(--border)] bg-white text-[var(--charcoal)] hover:border-[var(--crimson)]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="mb-8">
            <h3 className="font-[var(--font-serif)] text-[17px] mb-4 text-[var(--charcoal)]">
              Quantity
            </h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 border border-[var(--border)] bg-white text-[var(--charcoal)] hover:border-[var(--crimson)] transition-colors"
              >
                −
              </button>
              <span className="w-12 text-center text-[15px] text-[var(--charcoal)]">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 border border-[var(--border)] bg-white text-[var(--charcoal)] hover:border-[var(--crimson)] transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart */}
          <div className="flex gap-3 mb-12">
            <button
              onClick={onAddToCart}
              disabled={!selectedSize}
              className="flex-1 h-14 bg-[var(--crimson)] text-white text-[14px] tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add to Cart
            </button>
            <button className="w-14 h-14 border border-[var(--border)] bg-white flex items-center justify-center hover:border-[var(--crimson)] transition-colors">
              <Heart size={20} strokeWidth={1.5} className="text-[var(--charcoal)]" />
            </button>
          </div>

          {/* Fabric Details */}
          <div className="mb-8 pb-8 border-b border-[var(--border)]">
            <h3 className="font-[var(--font-serif)] text-[17px] mb-3 text-[var(--charcoal)]">
              Fabric: {product.fabric}
            </h3>
            <p className="text-[14px] text-[var(--charcoal)] leading-relaxed">
              {product.fabricDetails}
            </p>
          </div>

          {/* Fit Details */}
          <div className="mb-8 pb-8 border-b border-[var(--border)]">
            <h3 className="font-[var(--font-serif)] text-[17px] mb-3 text-[var(--charcoal)]">
              Fit & Silhouette: {product.fit}
            </h3>
            <p className="text-[14px] text-[var(--charcoal)] leading-relaxed">
              {product.fitDetails}
            </p>
          </div>

          {/* Features */}
          <div className="mb-8 pb-8 border-b border-[var(--border)]">
            <h3 className="font-[var(--font-serif)] text-[17px] mb-3 text-[var(--charcoal)]">
              Features
            </h3>
            <ul className="space-y-2">
              {product.features.map((feature, index) => (
                <li key={index} className="text-[14px] text-[var(--charcoal)] flex items-start">
                  <span className="inline-block w-1 h-1 rounded-full bg-[var(--crimson)] mt-2 mr-3 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Care Instructions */}
          <div className="mb-8 pb-8 border-b border-[var(--border)]">
            <h3 className="font-[var(--font-serif)] text-[17px] mb-3 text-[var(--charcoal)]">
              Care Instructions
            </h3>
            <ul className="space-y-2">
              {product.care.map((instruction, index) => (
                <li key={index} className="text-[14px] text-[var(--charcoal)] flex items-start">
                  <span className="inline-block w-1 h-1 rounded-full bg-[var(--crimson)] mt-2 mr-3 flex-shrink-0" />
                  {instruction}
                </li>
              ))}
            </ul>
          </div>

          {/* Service Icons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center">
              <TruckIcon size={24} strokeWidth={1.5} className="text-[var(--crimson)] mb-2" />
              <p className="text-[13px] text-[var(--charcoal)]">Free Delivery</p>
              <p className="text-[11px] text-[var(--light-gray)]">Orders over £200</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <RotateCcw size={24} strokeWidth={1.5} className="text-[var(--crimson)] mb-2" />
              <p className="text-[13px] text-[var(--charcoal)]">Easy Returns</p>
              <p className="text-[11px] text-[var(--light-gray)]">30 day return policy</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Shield size={24} strokeWidth={1.5} className="text-[var(--crimson)] mb-2" />
              <p className="text-[13px] text-[var(--charcoal)]">Quality Guarantee</p>
              <p className="text-[11px] text-[var(--light-gray)]">Lifetime craftsmanship</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
