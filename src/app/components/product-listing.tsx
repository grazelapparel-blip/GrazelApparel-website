import { useState, useEffect } from 'react';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { ProductCard } from './product-card';

const allProducts = [
  { id: '1', name: 'Tailored Wool Blazer', price: 495, image: 'https://images.unsplash.com/photo-1762417421091-1b4e24facc62?w=1080', fabric: 'Wool', fit: 'Regular Fit', category: 'Outerwear', size: ['S', 'M', 'L', 'XL'] },
  { id: '2', name: 'Silk Evening Dress', price: 675, image: 'https://images.unsplash.com/photo-1562182856-e39faab686d7?w=1080', fabric: 'Silk', fit: 'Slim Fit', category: 'Dresses', size: ['XS', 'S', 'M', 'L'] },
  { id: '3', name: 'Cashmere Roll Neck', price: 385, image: 'https://images.unsplash.com/photo-1603906650843-b58e94d9df4d?w=1080', fabric: 'Cashmere', fit: 'Regular Fit', category: 'Knitwear', size: ['S', 'M', 'L', 'XL'] },
  { id: '4', name: 'Cotton Oxford Shirt', price: 145, image: 'https://images.unsplash.com/photo-1760545183001-af3b64500b0d?w=1080', fabric: 'Cotton', fit: 'Slim Fit', category: 'Shirts', size: ['S', 'M', 'L', 'XL', 'XXL'] },
  { id: '5', name: 'Wool Dress Trousers', price: 225, image: 'https://images.unsplash.com/photo-1570653321427-0e4c0c40bb84?w=1080', fabric: 'Wool', fit: 'Regular Fit', category: 'Trousers', size: ['30', '32', '34', '36', '38'] },
  { id: '6', name: 'Cashmere Overcoat', price: 895, image: 'https://images.unsplash.com/photo-1577909687863-91bb3ec12db5?w=1080', fabric: 'Cashmere', fit: 'Regular Fit', category: 'Outerwear', size: ['M', 'L', 'XL'] },
  { id: '7', name: 'Linen Blazer', price: 425, image: 'https://images.unsplash.com/photo-1719518411339-5158cea86caf?w=1080', fabric: 'Linen', fit: 'Relaxed Fit', category: 'Outerwear', size: ['S', 'M', 'L', 'XL'] },
  { id: '8', name: 'Merino Wool Cardigan', price: 295, image: 'https://images.unsplash.com/photo-1767898498160-b4043d7269da?w=1080', fabric: 'Wool', fit: 'Regular Fit', category: 'Knitwear', size: ['S', 'M', 'L', 'XL'] },
];

interface ProductListingProps {
  onProductClick: () => void;
  initialFilter?: { type: string; value: string } | null;
  onFilterApplied?: () => void;
}

export function ProductListing({ onProductClick, initialFilter, onFilterApplied }: ProductListingProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<{
    category: string[];
    fabric: string[];
    fit: string[];
    size: string[];
    price: string[];
  }>({
    category: [],
    fabric: [],
    fit: [],
    size: [],
    price: []
  });
  const [sortBy, setSortBy] = useState('new');

  // Apply initial filter when it changes
  useEffect(() => {
    if (initialFilter) {
      const { type, value } = initialFilter;
      // Map the filter value to match our filter options
      let filterValue = value;
      if (type === 'fit' && !value.includes('Fit')) {
        filterValue = value + ' Fit';
      }
      
      setSelectedFilters(prev => ({
        ...prev,
        category: [],
        fabric: [],
        fit: [],
        size: [],
        price: [],
        [type]: [filterValue]
      }));
      
      onFilterApplied?.();
    }
  }, [initialFilter, onFilterApplied]);

  const filters = {
    category: ['Shirts', 'Trousers', 'Knitwear', 'Outerwear', 'Dresses'],
    fabric: ['Cotton', 'Wool', 'Linen', 'Cashmere', 'Silk'],
    fit: ['Slim Fit', 'Regular Fit', 'Relaxed Fit'],
    size: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    price: ['Under £200', '£200-£400', '£400-£600', 'Over £600']
  };

  const toggleFilter = (filterType: keyof typeof selectedFilters, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(v => v !== value)
        : [...prev[filterType], value]
    }));
  };

  const clearFilters = () => {
    setSelectedFilters({
      category: [],
      fabric: [],
      fit: [],
      size: [],
      price: []
    });
  };

  const hasActiveFilters = Object.values(selectedFilters).some(arr => arr.length > 0);

  // Filter products based on selected filters
  const filteredProducts = allProducts.filter(product => {
    // Category filter
    if (selectedFilters.category.length > 0 && !selectedFilters.category.includes(product.category)) {
      return false;
    }
    // Fabric filter
    if (selectedFilters.fabric.length > 0 && !selectedFilters.fabric.includes(product.fabric)) {
      return false;
    }
    // Fit filter
    if (selectedFilters.fit.length > 0 && !selectedFilters.fit.includes(product.fit)) {
      return false;
    }
    // Size filter
    if (selectedFilters.size.length > 0 && !selectedFilters.size.some(size => product.size.includes(size))) {
      return false;
    }
    // Price filter
    if (selectedFilters.price.length > 0) {
      const matchesPrice = selectedFilters.price.some(priceRange => {
        if (priceRange === 'Under £200') return product.price < 200;
        if (priceRange === '£200-£400') return product.price >= 200 && product.price <= 400;
        if (priceRange === '£400-£600') return product.price > 400 && product.price <= 600;
        if (priceRange === 'Over £600') return product.price > 600;
        return false;
      });
      if (!matchesPrice) return false;
    }
    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'popular':
        return 0; // Keep original order for now
      case 'new':
      default:
        return 0; // Keep original order for new arrivals
    }
  });

  const FilterSection = ({ title, options, filterKey }: { title: string; options: string[]; filterKey: keyof typeof selectedFilters }) => (
    <div className="pb-6 border-b border-[var(--border)]">
      <h3 className="font-[var(--font-serif)] text-[15px] mb-4 text-[var(--charcoal)]">{title}</h3>
      <div className="space-y-2">
        {options.map((option) => (
          <label key={option} className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={selectedFilters[filterKey].includes(option)}
              onChange={() => toggleFilter(filterKey, option)}
              className="w-4 h-4 border border-[var(--border)] text-[var(--crimson)] focus:ring-[var(--crimson)] focus:ring-1"
            />
            <span className="text-[14px] text-[var(--charcoal)] group-hover:text-[var(--crimson)] transition-colors">
              {option}
            </span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-[var(--font-serif)] text-4xl mb-2 text-[var(--charcoal)]">All Products</h1>
        <p className="text-[14px] text-[var(--light-gray)]">{sortedProducts.length} of {allProducts.length} items</p>
      </div>

      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-6 flex gap-3">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="flex-1 h-12 border border-[var(--border)] bg-white flex items-center justify-center gap-2 text-[14px] text-[var(--charcoal)] hover:border-[var(--crimson)] transition-colors"
        >
          <SlidersHorizontal size={18} strokeWidth={1.5} />
          Filters {hasActiveFilters && `(${Object.values(selectedFilters).flat().length})`}
        </button>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="h-12 px-4 border border-[var(--border)] bg-white text-[14px] text-[var(--charcoal)] focus:outline-none focus:border-[var(--crimson)]"
        >
          <option value="new">New Arrivals</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>

      <div className="flex gap-12">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-6">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-[13px] text-[var(--crimson)] hover:underline mb-4"
              >
                Clear all filters
              </button>
            )}
            <FilterSection title="Category" options={filters.category} filterKey="category" />
            <FilterSection title="Fabric" options={filters.fabric} filterKey="fabric" />
            <FilterSection title="Fit" options={filters.fit} filterKey="fit" />
            <FilterSection title="Size" options={filters.size} filterKey="size" />
            <FilterSection title="Price" options={filters.price} filterKey="price" />
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="hidden lg:flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              {hasActiveFilters && (
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(selectedFilters).flatMap(([key, values]) =>
                    values.map(value => (
                      <span
                        key={`${key}-${value}`}
                        className="inline-flex items-center gap-2 px-3 py-1 border border-[var(--crimson)] text-[var(--crimson)] text-[13px]"
                      >
                        {value}
                        <button onClick={() => toggleFilter(key as keyof typeof selectedFilters, value)}>
                          <X size={14} />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              )}
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-10 px-4 border border-[var(--border)] bg-white text-[14px] text-[var(--charcoal)] focus:outline-none focus:border-[var(--crimson)]"
            >
              <option value="new">New Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedProducts.length > 0 ? (
              sortedProducts.map((product) => (
                <div key={product.id} onClick={onProductClick} className="cursor-pointer">
                  <ProductCard {...product} />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <p className="text-[var(--charcoal)] text-lg mb-2">No products found</p>
                <p className="text-[var(--light-gray)] text-[14px] mb-4">Try adjusting your filters</p>
                <button
                  onClick={clearFilters}
                  className="text-[var(--crimson)] text-[14px] hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-[var(--cream)] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-[var(--font-serif)] text-[20px] text-[var(--charcoal)]">Filters</h2>
                <button onClick={() => setMobileFiltersOpen(false)}>
                  <X size={24} className="text-[var(--charcoal)]" />
                </button>
              </div>
              <div className="space-y-6">
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-[13px] text-[var(--crimson)] hover:underline mb-4"
                  >
                    Clear all filters
                  </button>
                )}
                <FilterSection title="Category" options={filters.category} filterKey="category" />
                <FilterSection title="Fabric" options={filters.fabric} filterKey="fabric" />
                <FilterSection title="Fit" options={filters.fit} filterKey="fit" />
                <FilterSection title="Size" options={filters.size} filterKey="size" />
                <FilterSection title="Price" options={filters.price} filterKey="price" />
              </div>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full h-12 bg-[var(--crimson)] text-white text-[14px] tracking-wide mt-6"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
