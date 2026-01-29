import { useState } from 'react';
import { Minus, Plus, X, Lock } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CartCheckoutProps {
  onContinueShopping: () => void;
}

export function CartCheckout({ onContinueShopping }: CartCheckoutProps) {
  const [cartItems, setCartItems] = useState([
    {
      id: '1',
      name: 'Tailored Wool Blazer',
      price: 495,
      size: 'M',
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1762417421091-1b4e24facc62?w=400',
      fabric: 'Wool',
      fit: 'Regular Fit'
    }
  ]);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setCartItems(cartItems.filter(item => item.id !== id));
    } else {
      setCartItems(cartItems.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeItem = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal >= 200 ? 0 : 15;
  const total = subtotal + shipping;

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-12">
      <h1 className="font-[var(--font-serif)] text-4xl mb-8 text-[var(--charcoal)]">
        Shopping Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          {cartItems.length === 0 ? (
            <div className="bg-white p-12 text-center">
              <p className="text-[15px] text-[var(--light-gray)] mb-6">
                Your cart is empty
              </p>
              <button
                onClick={onContinueShopping}
                className="h-12 px-10 border border-[var(--crimson)] text-[var(--crimson)] text-[14px] tracking-wide hover:bg-[var(--crimson)] hover:text-white transition-all"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white p-6 flex gap-6">
                  <div className="w-32 h-40 flex-shrink-0 bg-[var(--cream)] overflow-hidden">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-[16px] text-[var(--charcoal)] mb-1">
                          {item.name}
                        </h3>
                        <p className="text-[13px] text-[var(--light-gray)]">
                          {item.fabric} · {item.fit} · Size {item.size}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-[var(--charcoal)] hover:text-[var(--crimson)] transition-colors"
                      >
                        <X size={20} strokeWidth={1.5} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 border border-[var(--border)] flex items-center justify-center hover:border-[var(--crimson)] transition-colors"
                        >
                          <Minus size={14} strokeWidth={1.5} />
                        </button>
                        <span className="w-8 text-center text-[14px] text-[var(--charcoal)]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 border border-[var(--border)] flex items-center justify-center hover:border-[var(--crimson)] transition-colors"
                        >
                          <Plus size={14} strokeWidth={1.5} />
                        </button>
                      </div>
                      <p className="text-[17px] text-[var(--crimson)]">
                        £{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white p-8 sticky top-24">
            <h2 className="font-[var(--font-serif)] text-[20px] mb-6 text-[var(--charcoal)]">
              Order Summary
            </h2>

            <div className="space-y-4 mb-6 pb-6 border-b border-[var(--border)]">
              <div className="flex justify-between text-[14px]">
                <span className="text-[var(--charcoal)]">Subtotal</span>
                <span className="text-[var(--charcoal)]">£{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="text-[var(--charcoal)]">Shipping</span>
                <span className="text-[var(--charcoal)]">
                  {shipping === 0 ? 'Free' : `£${shipping.toFixed(2)}`}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-[12px] text-[var(--light-gray)]">
                  Add £{(200 - subtotal).toFixed(2)} more for free delivery
                </p>
              )}
            </div>

            <div className="flex justify-between mb-8 pb-6 border-b border-[var(--border)]">
              <span className="font-[var(--font-serif)] text-[18px] text-[var(--charcoal)]">
                Total
              </span>
              <span className="font-[var(--font-serif)] text-[20px] text-[var(--crimson)]">
                £{total.toFixed(2)}
              </span>
            </div>

            <button
              disabled={cartItems.length === 0}
              className="w-full h-14 bg-[var(--crimson)] text-white text-[14px] tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mb-3"
            >
              Proceed to Checkout
            </button>

            <button
              onClick={onContinueShopping}
              className="w-full h-12 border border-[var(--border)] text-[var(--charcoal)] text-[14px] tracking-wide hover:border-[var(--crimson)] transition-colors"
            >
              Continue Shopping
            </button>

            <div className="mt-6 pt-6 border-t border-[var(--border)] space-y-3">
              <div className="flex items-start gap-3 text-[12px] text-[var(--charcoal)]">
                <Lock size={16} className="text-[var(--crimson)] flex-shrink-0" strokeWidth={1.5} />
                <p>Secure checkout with SSL encryption</p>
              </div>
              <p className="text-[12px] text-[var(--light-gray)] pl-7">
                30-day return policy on all items
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
