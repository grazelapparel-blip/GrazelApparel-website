'use client';

import { useState } from 'react';
import { useAppStore } from '../store/app-store';
import { supabase } from '../../lib/supabase';

export function Footer() {
  const { setCurrentPage, setProductCategory } = useAppStore();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const footerSections = [
    {
      title: 'Shop',
      links: [
        { label: 'Men', type: 'shop', path: '/products/men' },
        { label: 'Women', type: 'shop', path: '/products/women' },
        { label: 'Essentials', type: 'shop', path: '/products/essentials' },
        { label: 'New In', type: 'shop', path: '/products/new' },
        { label: 'Collections', type: 'shop', path: '/products/collections' },
        { label: 'Sale', type: 'shop', path: '/products/sale' }
      ]
    },
    {
      title: 'Customer Service',
      links: [
        { label: 'Contact Us', type: 'page', path: '/contact' },
        { label: 'Orders & Returns', type: 'page', path: '/orders-returns' },
        { label: 'Shipping', type: 'page', path: '/shipping' },
        { label: 'Size Guide', type: 'page', path: '/size-guide' },
        { label: 'Care Instructions', type: 'page', path: '/care-instructions' },
        { label: 'FAQs', type: 'page', path: '/faqs' }
      ]
    },
    {
      title: 'About Grazel',
      links: [
        { label: 'Our Story', type: 'page', path: '/about' },
        { label: 'Craftsmanship', type: 'page', path: '/craftsmanship' },
        { label: 'Sustainability', type: 'page', path: '/sustainability' },
        { label: 'Careers', type: 'page', path: '/careers' },
        { label: 'Press', type: 'page', path: '/press' },
        { label: 'Store Locator', type: 'page', path: '/store-locator' }
      ]
    },
    {
      title: 'Connect',
      links: [
        { label: 'Newsletter', type: 'scroll', path: 'newsletter' },
        { label: 'Instagram', type: 'social', path: 'https://instagram.com/grazelapparel' },
        { label: 'Facebook', type: 'social', path: 'https://facebook.com/grazelapparel' },
        { label: 'Pinterest', type: 'social', path: 'https://pinterest.com/grazelapparel' },
        { label: 'LinkedIn', type: 'social', path: 'https://linkedin.com/company/grazelapparel' }
      ]
    }
  ];

  const handleLinkClick = (link: any) => {
    if (link.type === 'shop') {
      // Extract category from path (e.g., '/products/men' -> 'men')
      const category = link.path.split('/').pop();
      setProductCategory(category);
      setCurrentPage('products');
    } else if (link.type === 'page') {
      // Navigate to other pages
      if (link.path === '/contact') {
        setCurrentPage('contact');
      } else if (link.path === '/about') {
        setCurrentPage('about');
      } else {
        // For other pages, just set current page to a generic page view
        setCurrentPage('page');
      }
    } else if (link.type === 'social') {
      window.open(link.path, '_blank');
    } else if (link.type === 'scroll') {
      const element = document.getElementById(link.path);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      setNewsletterMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }

    setNewsletterLoading(true);
    setNewsletterMessage(null);

    try {
      // Insert into newsletter subscribers table
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .insert([
          {
            email: newsletterEmail,
            subscribed_at: new Date().toISOString(),
            is_active: true
          }
        ])
        .select();

      if (error) {
        if (error.code === '23505') {
          setNewsletterMessage({ type: 'error', text: 'This email is already subscribed' });
        } else {
          setNewsletterMessage({ type: 'error', text: 'Failed to subscribe. Please try again.' });
        }
      } else {
        setNewsletterMessage({ type: 'success', text: 'Thank you for subscribing! Check your email for confirmation.' });
        setNewsletterEmail('');
        
        // Optional: Navigate to admin page after 2 seconds
        setTimeout(() => {
          setCurrentPage('admin-dashboard');
        }, 2000);
      }
    } catch (err) {
      setNewsletterMessage({ type: 'error', text: 'An error occurred. Please try again.' });
      console.error('Newsletter subscription error:', err);
    } finally {
      setNewsletterLoading(false);
    }
  };

  return (
    <footer className="bg-[var(--cream)] border-t border-[var(--border)] mt-auto">
      <div className="max-w-[1440px] mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-[var(--font-serif)] text-[15px] mb-4 text-[var(--charcoal)]">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => handleLinkClick(link)}
                      className="text-[13px] text-[var(--charcoal)] hover:text-[var(--crimson)] transition-colors cursor-pointer bg-none border-none p-0 text-left"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="border-t border-[var(--border)] pt-12 mb-12" id="newsletter">
          <div className="max-w-md">
            <h3 className="font-[var(--font-serif)] text-[17px] mb-3 text-[var(--charcoal)]">
              Subscribe to our Newsletter
            </h3>
            <p className="text-[13px] text-[var(--light-gray)] mb-4">
              Receive updates on new arrivals, exclusive collections, and craftsmanship insights.
            </p>
            <form onSubmit={handleNewsletterSubscribe} className="flex gap-2 flex-col">
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  disabled={newsletterLoading}
                  className="flex-1 h-12 px-4 bg-white border border-[var(--border)] text-[14px] focus:outline-none focus:ring-1 focus:ring-[var(--crimson)] disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={newsletterLoading}
                  className="px-8 h-12 bg-[var(--crimson)] text-white text-[14px] tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                >
                  {newsletterLoading ? 'Subscribing...' : 'Subscribe'}
                </button>
              </div>
              {newsletterMessage && (
                <div className={`text-[13px] ${newsletterMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {newsletterMessage.text}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[var(--border)] pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6 text-[13px] text-[var(--light-gray)]">
            <span>© 2026 Grazel. All rights reserved.</span>
            <a href="#privacy" className="hover:text-[var(--crimson)] transition-colors">
              Privacy Policy
            </a>
            <a href="#terms" className="hover:text-[var(--crimson)] transition-colors">
              Terms of Service
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[13px] text-[var(--light-gray)]">Payment methods:</span>
            <div className="flex gap-2">
              {['Visa', 'MC', 'Amex', 'PayPal'].map((method) => (
                <div
                  key={method}
                  className="w-10 h-6 bg-white border border-[var(--border)] flex items-center justify-center text-[9px] text-[var(--charcoal)]"
                >
                  {method}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
