import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '../store/app-store';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CollectionsPageProps {
  onProductClick?: (product: any) => void;
}

export function CollectionsPage({ onProductClick }: CollectionsPageProps) {
  const { products } = useAppStore();

  // Carousel state for each collection
  const [carouselIndices, setCarouselIndices] = useState<{ [key: string]: number }>({
    men: 0,
    women: 0
  });

  // Collections data
  const collections = [
    {
      id: 'men',
      label: 'Men',
      title: 'Discover Men',
      description: 'Timeless essentials crafted for the modern man. Explore our curated collection of premium menswear designed with quality and style at the forefront.',
      color: 'from-blue-900/20 to-blue-600/20',
      textColor: 'text-blue-900'
    },
    {
      id: 'women',
      label: 'Women',
      title: 'Discover Women',
      description: 'Elegant sophistication meets contemporary design. Our womenswear collection celebrates individuality with carefully selected pieces for every occasion.',
      color: 'from-rose-900/20 to-rose-600/20',
      textColor: 'text-rose-900'
    }
  ];

  // Get all products for a category
  const getCategoryProducts = (category: string) => {
    return products.filter(p =>
      p.category?.toLowerCase() === category.toLowerCase() ||
      (category === 'Essentials' && p.isEssential)
    );
  };

  // Handle carousel navigation
  const handleCarouselPrev = (collectionId: string, productsCount: number) => {
    setCarouselIndices(prev => ({
      ...prev,
      [collectionId]: prev[collectionId] === 0 ? productsCount - 1 : prev[collectionId] - 1
    }));
  };

  const handleCarouselNext = (collectionId: string, productsCount: number) => {
    setCarouselIndices(prev => ({
      ...prev,
      [collectionId]: prev[collectionId] === productsCount - 1 ? 0 : prev[collectionId] + 1
    }));
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

        {/* Display each collection as separate section */}
        <div className="space-y-24">
          {collections.map((collection) => {
            const categoryProducts = getCategoryProducts(collection.label);

            return (
              <div key={collection.id} className="space-y-8">
                {/* Hero Section */}
                <div className={`bg-gradient-to-br ${collection.color} rounded-lg p-12 md:p-16`}>
                  <h2 className={`font-[var(--font-serif)] text-3xl md:text-4xl mb-6 ${collection.textColor}`}>
                    {collection.title}
                  </h2>
                  <p className="text-gray-700 text-lg max-w-2xl leading-relaxed">
                    {collection.description}
                  </p>
                </div>

                {/* Products Carousel */}
                {categoryProducts.length > 0 ? (
                  <div>
                    <h3 className="font-[var(--font-serif)] text-2xl mb-8 text-[var(--charcoal)]">
                      {collection.label} Collection
                    </h3>

                    {/* Carousel Container */}
                    <div className="relative bg-gray-50 rounded-lg overflow-hidden">
                      {/* Main Carousel Image */}
                      <div className="relative aspect-[3/4] lg:aspect-[4/5] overflow-hidden bg-gray-100">
                        <ImageWithFallback
                          src={categoryProducts[carouselIndices[collection.id]].image}
                          alt={categoryProducts[carouselIndices[collection.id]].name}
                          className="w-full h-full object-cover"
                        />

                        {/* Discount Badge */}
                        {categoryProducts[carouselIndices[collection.id]].offerPercentage &&
                         categoryProducts[carouselIndices[collection.id]].offerPercentage > 0 && (
                          <div className="absolute top-6 left-6 bg-[var(--crimson)] text-white px-4 py-2 text-lg font-bold rounded">
                            {categoryProducts[carouselIndices[collection.id]].offerPercentage}% OFF
                          </div>
                        )}

                        {/* Previous Button */}
                        <button
                          onClick={() => handleCarouselPrev(collection.id, categoryProducts.length)}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black p-3 rounded-full transition-all z-10 shadow-lg"
                          aria-label="Previous product"
                        >
                          <ChevronLeft size={24} />
                        </button>

                        {/* Next Button */}
                        <button
                          onClick={() => handleCarouselNext(collection.id, categoryProducts.length)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black p-3 rounded-full transition-all z-10 shadow-lg"
                          aria-label="Next product"
                        >
                          <ChevronRight size={24} />
                        </button>

                        {/* Product Counter */}
                        <div className="absolute bottom-6 right-6 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">
                          {carouselIndices[collection.id] + 1} / {categoryProducts.length}
                        </div>
                      </div>

                      {/* Product Info Below Carousel */}
                      <div className="p-8">
                        <h4 className="text-2xl font-medium text-[var(--charcoal)] mb-2">
                          {categoryProducts[carouselIndices[collection.id]].name}
                        </h4>
                        <p className="text-gray-600 text-lg mb-4">
                          {[categoryProducts[carouselIndices[collection.id]].fabric,
                            categoryProducts[carouselIndices[collection.id]].fit].filter(Boolean).join(' • ')}
                        </p>
                        <p className="text-3xl font-bold text-[var(--crimson)] mb-6">
                          ₹{categoryProducts[carouselIndices[collection.id]].price.toFixed(2)}
                        </p>
                        <button
                          onClick={() => handleProductClick(categoryProducts[carouselIndices[collection.id]])}
                          className="w-full bg-[var(--crimson)] text-white py-4 rounded-lg font-medium text-lg hover:opacity-90 transition-opacity"
                        >
                          View Product Details
                        </button>
                      </div>
                    </div>

                    {/* Thumbnail Strip */}
                    <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
                      {categoryProducts.map((product, index) => (
                        <button
                          key={product.id}
                          onClick={() => setCarouselIndices(prev => ({ ...prev, [collection.id]: index }))}
                          className={`flex-shrink-0 w-20 h-24 rounded-lg overflow-hidden border-2 transition-all ${
                            carouselIndices[collection.id] === index
                              ? 'border-[var(--crimson)] opacity-100'
                              : 'border-gray-300 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <ImageWithFallback
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <p className="text-gray-500 text-lg">
                      No products in this collection yet.
                    </p>
                  </div>
                )}

                {/* Separator */}
                {collection.id !== collections[collections.length - 1].id && (
                  <div className="border-t border-gray-200 my-8" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

