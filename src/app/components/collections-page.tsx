import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useAppStore } from '../store/app-store';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CollectionsPageProps {
  onShowMore?: (category: string) => void;
  onProductClick?: (product: any) => void;
}

export function CollectionsPage({ onShowMore, onProductClick }: CollectionsPageProps) {
  const { products } = useAppStore();
  const [activeCategory, setActiveCategory] = useState<string>('Men');

  // Collections data
  const collections = [
    {
      id: 'men',
      title: 'Discover Men',
      label: 'Men',
      description: 'Timeless essentials crafted for the modern man. Explore our curated collection of premium menswear designed with quality and style at the forefront.',
      color: 'from-blue-900/20 to-blue-600/20',
      textColor: 'text-blue-900'
    },
    {
      id: 'women',
      title: 'Discover Women',
      label: 'Women',
      description: 'Elegant sophistication meets contemporary design. Our womenswear collection celebrates individuality with carefully selected pieces for every occasion.',
      color: 'from-rose-900/20 to-rose-600/20',
      textColor: 'text-rose-900'
    },
    {
      id: 'essentials',
      title: 'Essentials',
      label: 'Essentials',
      description: 'The foundation of a well-curated wardrobe. Versatile pieces that transition seamlessly through seasons and occasions.',
      color: 'from-slate-900/20 to-slate-600/20',
      textColor: 'text-slate-900'
    }
  ];

  // Get products for current category
  const getCategoryProducts = (category: string) => {
    return products.filter(p =>
      p.category?.toLowerCase() === category.toLowerCase() ||
      (category === 'Essentials' && p.isEssential)
    ).slice(0, 4);
  };

  // Get all products for category
  const getAllCategoryProducts = (category: string) => {
    return products.filter(p =>
      p.category?.toLowerCase() === category.toLowerCase() ||
      (category === 'Essentials' && p.isEssential)
    );
  };

  const currentCollection = collections.find(c => c.label === activeCategory);
  const categoryProducts = getCategoryProducts(activeCategory);
  const allCategoryProducts = getAllCategoryProducts(activeCategory);

  const handleShowMore = () => {
    onShowMore?.(activeCategory);
  };

  const handleProductClick = (product: any) => {
    onProductClick?.(product);
  };

  return (
    <div className="min-h-screen bg-white pt-8 pb-16">
      <div className="max-w-[1440px] mx-auto px-6">
        {/* Collections Header */}
        <div className="mb-16">
          <h1 className="font-[var(--font-serif)] text-4xl md:text-5xl text-[var(--charcoal)] mb-4">
            Collections
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl">
            Explore our curated collections of premium apparel, each carefully designed to celebrate timeless elegance and contemporary style.
          </p>
        </div>

        {/* Collection Tabs */}
        <div className="flex gap-4 mb-12 border-b border-gray-200">
          {collections.map((collection) => (
            <button
              key={collection.id}
              onClick={() => setActiveCategory(collection.label)}
              className={`pb-4 px-2 font-medium text-sm tracking-wide transition-colors relative ${
                activeCategory === collection.label
                  ? 'text-[var(--crimson)]'
                  : 'text-gray-600 hover:text-[var(--charcoal)]'
              }`}
            >
              {collection.label}
              {activeCategory === collection.label && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--crimson)]" />
              )}
            </button>
          ))}
        </div>

        {/* Active Collection Display */}
        {currentCollection && (
          <div className="space-y-12">
            {/* Hero Section */}
            <div className={`bg-gradient-to-br ${currentCollection.color} rounded-lg p-12 md:p-16`}>
              <h2 className={`font-[var(--font-serif)] text-3xl md:text-4xl mb-6 ${currentCollection.textColor}`}>
                {currentCollection.title}
              </h2>
              <p className="text-gray-700 text-lg max-w-2xl leading-relaxed mb-8">
                {currentCollection.description}
              </p>
              <button
                onClick={handleShowMore}
                className="inline-flex items-center gap-2 bg-[var(--crimson)] text-white px-8 py-3 hover:opacity-90 transition-opacity"
              >
                Explore Collection
                <ArrowRight size={18} />
              </button>
            </div>

            {/* Products Grid */}
            <div>
              <h3 className="font-[var(--font-serif)] text-2xl mb-8 text-[var(--charcoal)]">
                Featured Pieces
              </h3>

              {categoryProducts.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {categoryProducts.map((product) => (
                      <div
                        key={product.id}
                        className="group cursor-pointer"
                        onClick={() => handleProductClick(product)}
                      >
                        <div className="relative aspect-[3/4] mb-4 overflow-hidden bg-gray-100 rounded">
                          <ImageWithFallback
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {product.offerPercentage && product.offerPercentage > 0 && (
                            <div className="absolute top-4 left-4 bg-[var(--crimson)] text-white px-3 py-1 text-sm font-medium">
                              {product.offerPercentage}% OFF
                            </div>
                          )}
                        </div>
                        <h4 className="text-sm font-medium text-[var(--charcoal)] mb-2 group-hover:text-[var(--crimson)] transition-colors">
                          {product.name}
                        </h4>
                        <p className="text-xs text-gray-500 mb-3">
                          {[product.fabric, product.fit].filter(Boolean).join(' • ')}
                        </p>
                        <p className="text-sm font-semibold text-[var(--crimson)]">
                          ₹{product.price.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Show More Button */}
                  <div className="text-center">
                    <button
                      onClick={handleShowMore}
                      className="inline-flex items-center gap-2 border-2 border-[var(--charcoal)] text-[var(--charcoal)] px-12 py-4 hover:bg-[var(--charcoal)] hover:text-white transition-colors font-medium tracking-wide"
                    >
                      View All {activeCategory} Products
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg mb-6">
                    No products in this collection yet.
                  </p>
                  <button
                    onClick={() => onShowMore?.(activeCategory)}
                    className="inline-flex items-center gap-2 text-[var(--crimson)] hover:text-[var(--charcoal)] transition-colors"
                  >
                    Browse All Products
                    <ArrowRight size={18} />
                  </button>
                </div>
              )}
            </div>

            {/* Collection Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-12 border-t border-gray-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-[var(--crimson)] mb-2">
                  {allCategoryProducts.length}
                </p>
                <p className="text-sm text-gray-600">Products Available</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[var(--crimson)] mb-2">
                  {new Set(categoryProducts.map(p => p.fabric)).size}
                </p>
                <p className="text-sm text-gray-600">Premium Fabrics</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[var(--crimson)] mb-2">
                  {categoryProducts.length > 0 ? Math.floor(categoryProducts.reduce((acc, p) => acc + (p.offerPercentage || 0), 0) / categoryProducts.length) : 0}%
                </p>
                <p className="text-sm text-gray-600">Average Discount</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[var(--crimson)] mb-2">
                  ✓
                </p>
                <p className="text-sm text-gray-600">Premium Quality</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

