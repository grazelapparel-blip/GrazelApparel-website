import { useState, useEffect } from 'react';
import { Header } from './components/header';
import { Footer } from './components/footer';
import { ProductCard } from './components/product-card';
import { ProductListing } from './components/product-listing';
import { ProductDetail } from './components/product-detail';
import { FitIntelligence } from './components/fit-intelligence';
import { CartCheckout } from './components/cart-checkout';
import { AdminDashboard } from './components/admin-dashboard';
import { AdminLogin } from './components/admin-login';
import { UserAuth } from './components/user-auth';
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import { AppProvider, useAppStore } from './store/app-store';

// Mock product data
const featuredProducts = [
  {
    id: '1',
    name: 'Tailored Wool Blazer',
    price: 495,
    image: 'https://images.unsplash.com/photo-1762417421091-1b4e24facc62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YWlsb3JlZCUyMG1lbnN3ZWFyfGVufDF8fHx8MTc2ODE5NjQ5OHww&ixlib=rb-4.1.0&q=80&w=1080',
    fabric: 'Wool',
    fit: 'Regular Fit'
  },
  {
    id: '2',
    name: 'Silk Evening Dress',
    price: 675,
    image: 'https://images.unsplash.com/photo-1562182856-e39faab686d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwd29tYW4lMjBkcmVzc3xlbnwxfHx8fDE3NjgxOTY0OTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    fabric: 'Silk',
    fit: 'Slim Fit'
  },
  {
    id: '3',
    name: 'Cashmere Roll Neck',
    price: 385,
    image: 'https://images.unsplash.com/photo-1767898498160-b4043d7269da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBrbml0d2VhcnxlbnwxfHx8fDE3NjgxOTY0OTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    fabric: 'Cashmere',
    fit: 'Regular Fit'
  },
  {
    id: '4',
    name: 'Cotton Oxford Shirt',
    price: 145,
    image: 'https://images.unsplash.com/photo-1719518411339-5158cea86caf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBmYXNoaW9uJTIwZWRpdG9yaWFsfGVufDF8fHx8MTc2ODEyNDQyN3ww&ixlib=rb-4.1.0&q=80&w=1080',
    fabric: 'Cotton',
    fit: 'Slim Fit'
  }
];

function AppContent() {
  const { currentUser, logoutUser } = useAppStore();
  const [currentPage, setCurrentPage] = useState<'home' | 'products' | 'product' | 'fit' | 'cart' | 'admin-login' | 'admin'>('home');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [pendingAction, setPendingAction] = useState<'cart' | 'wishlist' | null>(null);
  const [initialFilter, setInitialFilter] = useState<{ type: string; value: string } | null>(null);

  // Check URL for admin access
  useEffect(() => {
    const checkAdminRoute = () => {
      const hash = window.location.hash;
      if (hash === '#/admin' || hash === '#admin') {
        setCurrentPage('admin-login');
      }
    };
    
    checkAdminRoute();
    window.addEventListener('hashchange', checkAdminRoute);
    return () => window.removeEventListener('hashchange', checkAdminRoute);
  }, []);

  // Show admin login page (separate from user site)
  if (currentPage === 'admin-login') {
    return (
      <AdminLogin 
        onLogin={() => {
          setIsAdminLoggedIn(true);
          setCurrentPage('admin');
        }}
        onBack={() => {
          window.location.hash = '';
          setCurrentPage('home');
        }}
      />
    );
  }

  // Show admin dashboard (only after login)
  if (currentPage === 'admin' && isAdminLoggedIn) {
    return (
      <AdminDashboard 
        onBack={() => {
          setIsAdminLoggedIn(false);
          window.location.hash = '';
          setCurrentPage('home');
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--cream)]">
      <Header 
        onLogout={logoutUser}
        onSearch={() => setCurrentPage('products')}
        onWishlist={() => {
          if (!currentUser) {
            setShowLoginPrompt(true);
            setPendingAction('wishlist');
          } else {
            console.log('Wishlist feature coming soon');
          }
        }}
        onCart={() => {
          if (!currentUser) {
            setShowLoginPrompt(true);
            setPendingAction('cart');
          } else {
            setCurrentPage('cart');
          }
        }}
        onProducts={() => setCurrentPage('products')}
        onNavigation={(category) => {
          setInitialFilter(null);
          setCurrentPage('products');
        }}
        onFilterNavigation={(filterType, filterValue) => {
          setInitialFilter({ type: filterType, value: filterValue });
          setCurrentPage('products');
        }}
      />
      
      {currentPage === 'home' && (
        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative h-[600px] md:h-[700px] bg-white">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1719518411339-5158cea86caf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBmYXNoaW9uJTIwZWRpdG9yaWFsfGVufDF8fHx8MTc2ODEyNDQyN3ww&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Grazel Collection"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white max-w-2xl px-6">
                <h1 className="font-[var(--font-serif)] text-5xl md:text-6xl mb-6 tracking-wide">
                  Timeless Elegance
                </h1>
                <p className="text-[16px] md:text-[18px] mb-8 leading-relaxed tracking-wide">
                  Discover our new collection of meticulously crafted pieces, designed for those who value enduring quality and refined simplicity.
                </p>
                <button 
                  onClick={() => setCurrentPage('products')}
                  className="h-14 px-12 bg-[var(--crimson)] text-white text-[14px] tracking-wide hover:opacity-90 transition-opacity"
                >
                  Explore Collection
                </button>
              </div>
            </div>
          </section>

          {/* Featured Products */}
          <section className="max-w-[1440px] mx-auto px-6 py-20">
            <div className="text-center mb-12">
              <h2 className="font-[var(--font-serif)] text-4xl mb-4 text-[var(--charcoal)]">
                Featured Selection
              </h2>
              <p className="text-[15px] text-[var(--light-gray)] max-w-2xl mx-auto">
                Each piece represents our commitment to exceptional craftsmanship, premium fabrics, and timeless design.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <div key={product.id} onClick={() => setCurrentPage('product')}>
                  <ProductCard {...product} />
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <button 
                onClick={() => setCurrentPage('products')}
                className="h-12 px-10 border border-[var(--crimson)] text-[var(--crimson)] text-[14px] tracking-wide hover:bg-[var(--crimson)] hover:text-white transition-all"
              >
                View All Products
              </button>
            </div>
          </section>

          {/* Fabric & Craftsmanship */}
          <section className="bg-white py-20">
            <div className="max-w-[1440px] mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div>
                  <h2 className="font-[var(--font-serif)] text-4xl mb-6 text-[var(--charcoal)]">
                    Fabric Excellence
                  </h2>
                  <div className="space-y-4 text-[15px] text-[var(--charcoal)] leading-relaxed">
                    <p>
                      Every Grazel garment begins with the finest materials sourced from renowned mills across Europe. We select only premium natural fibres—Italian wool, Irish linen, Scottish cashmere, and French silk.
                    </p>
                    <p>
                      Our commitment to quality extends beyond the fabric itself. Each piece is constructed using traditional tailoring techniques, ensuring exceptional fit, durability, and comfort that improves with wear.
                    </p>
                    <p>
                      This dedication to craftsmanship means your Grazel pieces are designed not for a season, but for a lifetime.
                    </p>
                  </div>
                  <button className="mt-8 h-12 px-10 border border-[var(--crimson)] text-[var(--crimson)] text-[14px] tracking-wide hover:bg-[var(--crimson)] hover:text-white transition-all">
                    Our Craftsmanship
                  </button>
                </div>
                <div className="aspect-[4/5] bg-[var(--cream)] overflow-hidden">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1762417421091-1b4e24facc62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YWlsb3JlZCUyMG1lbnN3ZWFyfGVufDF8fHx8MTc2ODE5NjQ5OHww&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Craftsmanship detail"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Brand Philosophy */}
          <section className="max-w-[1440px] mx-auto px-6 py-20">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-[var(--font-serif)] text-4xl mb-6 text-[var(--charcoal)]">
                The Grazel Philosophy
              </h2>
              <div className="space-y-6 text-[15px] text-[var(--charcoal)] leading-relaxed">
                <p>
                  Founded on principles of enduring quality and refined simplicity, Grazel represents a return to thoughtful, considered design. We believe in creating garments that transcend fleeting trends, offering instead pieces that become trusted companions in your wardrobe.
                </p>
                <p>
                  Our approach is rooted in respect—for the artisans who craft each piece, for the environment from which our materials are sourced, and for you, the discerning individual who values authenticity and longevity.
                </p>
              </div>
            </div>
          </section>
        </main>
      )}

      {currentPage === 'products' && (
        <ProductListing 
          onProductClick={() => setCurrentPage('product')} 
          initialFilter={initialFilter}
          onFilterApplied={() => setInitialFilter(null)}
        />
      )}

      {currentPage === 'product' && (
        <ProductDetail 
          onFitIntelligenceClick={() => {
            if (!currentUser) {
              setShowLoginPrompt(true);
              setPendingAction(null);
              return;
            }
            setCurrentPage('fit');
          }}
          onAddToCart={() => {
            if (!currentUser) {
              setShowLoginPrompt(true);
              setPendingAction('cart');
              return;
            }
            setCurrentPage('cart');
          }}
        />
      )}

      {currentPage === 'fit' && currentUser && (
        <FitIntelligence 
          onClose={() => setCurrentPage('product')}
          onComplete={() => setCurrentPage('cart')}
        />
      )}

      {currentPage === 'cart' && currentUser && (
        <CartCheckout onContinueShopping={() => setCurrentPage('products')} />
      )}

      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 flex justify-between items-center border-b border-gray-200 p-4 bg-white">
              <h2 className="font-[var(--font-serif)] text-xl text-[var(--charcoal)]">
                Sign In to Shop
              </h2>
              <button
                onClick={() => {
                  setShowLoginPrompt(false);
                  setPendingAction(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="p-8">
              <p className="text-center text-gray-600 mb-6 text-[14px]">
                {pendingAction === 'cart' 
                  ? 'Sign in to add items to your cart and complete your purchase.'
                  : pendingAction === 'wishlist'
                  ? 'Sign in to save items to your wishlist.'
                  : 'Sign in to continue shopping.'}
              </p>
              
              <UserAuth 
                onSuccess={() => {
                  setShowLoginPrompt(false);
                  setPendingAction(null);
                  if (pendingAction === 'cart') {
                    setCurrentPage('cart');
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}