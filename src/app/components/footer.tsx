export function Footer() {
  const footerSections = [
    {
      title: 'Shop',
      links: ['Men', 'Women', 'Essentials', 'New In', 'Collections', 'Sale']
    },
    {
      title: 'Customer Service',
      links: ['Contact Us', 'Orders & Returns', 'Shipping', 'Size Guide', 'Care Instructions', 'FAQs']
    },
    {
      title: 'About Grazel',
      links: ['Our Story', 'Craftsmanship', 'Sustainability', 'Careers', 'Press', 'Store Locator']
    },
    {
      title: 'Connect',
      links: ['Newsletter', 'Instagram', 'Facebook', 'Pinterest', 'LinkedIn']
    }
  ];

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
                  <li key={link}>
                    <a
                      href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-[13px] text-[var(--charcoal)] hover:text-[var(--crimson)] transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="border-t border-[var(--border)] pt-12 mb-12">
          <div className="max-w-md">
            <h3 className="font-[var(--font-serif)] text-[17px] mb-3 text-[var(--charcoal)]">
              Subscribe to our Newsletter
            </h3>
            <p className="text-[13px] text-[var(--light-gray)] mb-4">
              Receive updates on new arrivals, exclusive collections, and craftsmanship insights.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Email address"
                className="flex-1 h-12 px-4 bg-white border border-[var(--border)] text-[14px] focus:outline-none focus:ring-1 focus:ring-[var(--crimson)]"
              />
              <button
                type="submit"
                className="px-8 h-12 bg-[var(--crimson)] text-white text-[14px] tracking-wide hover:opacity-90 transition-opacity"
              >
                Subscribe
              </button>
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
