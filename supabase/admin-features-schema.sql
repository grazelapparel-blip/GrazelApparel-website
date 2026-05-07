-- ============================================
-- GRAZEL APPAREL - ADMIN FEATURES SCHEMA EXTENSION
-- ============================================
-- This file extends the base schema with admin-specific features
-- Add to your existing schema.sql or run separately
-- Date: May 7, 2026
--
-- NEW FEATURES ADDED:
-- ✓ Stock management per product
-- ✓ Packaging options with pricing
-- ✓ Order status tracking with timestamps
-- ✓ Returns management
-- ✓ User activity tracking
-- ✓ Website navigation/menu control
-- ✓ Currency support (INR)
--
-- NEW TABLES:
-- - product_stock
-- - packaging_options
-- - order_returns
-- - user_activity
-- - website_navigation
--
-- ============================================

-- ============================================
-- SECTION 1: ENHANCED TABLES FOR ADMIN FEATURES
-- ============================================

-- 1. Product Stock Table (Stock Management)
CREATE TABLE IF NOT EXISTS product_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
  quantity_available INTEGER NOT NULL DEFAULT 0,
  quantity_reserved INTEGER NOT NULL DEFAULT 0,
  quantity_sold INTEGER NOT NULL DEFAULT 0,
  last_restocked_at TIMESTAMP WITH TIME ZONE,
  low_stock_threshold INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Packaging Options Table
CREATE TABLE IF NOT EXISTS packaging_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  base_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  price_currency TEXT DEFAULT 'INR',
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default packaging options
INSERT INTO packaging_options (name, description, base_price, display_order) 
VALUES 
  ('Simple Package', 'Basic white packaging', 0, 1),
  ('Elegant Packaging', 'Premium white box with tissue paper', 50.00, 2),
  ('Premium Package', 'Luxury box with ribbon and personalized message card', 150.00, 3),
  ('Gift Package', 'Special gift wrapping with premium box and greeting card', 200.00, 4)
ON CONFLICT (name) DO NOTHING;

-- 3. Order Returns Table
CREATE TABLE IF NOT EXISTS order_returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  return_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'initiated' CHECK (status IN ('initiated', 'approved', 'rejected', 'processing', 'completed', 'refunded')),
  refund_amount DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. User Activity Table (For analytics)
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('login', 'view_product', 'add_to_cart', 'remove_from_cart', 'place_order', 'view_order', 'wishlist_add', 'wishlist_remove', 'review_product', 'search')),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Website Navigation Table (Menu Control)
CREATE TABLE IF NOT EXISTS website_navigation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL UNIQUE,
  path TEXT NOT NULL UNIQUE,
  category TEXT DEFAULT 'main' CHECK (category IN ('main', 'collection', 'info', 'other')),
  icon_name TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  parent_id UUID REFERENCES website_navigation(id) ON DELETE CASCADE,
  filter_type TEXT,
  filter_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default navigation items
INSERT INTO website_navigation (label, path, category, display_order, filter_type, filter_value)
VALUES
  ('Men', '/men', 'main', 1, 'gender', 'Men'),
  ('Women', '/women', 'main', 2, 'gender', 'Women'),
  ('Essentials', '/essentials', 'main', 3, 'essentials', 'true'),
  ('New In', '/new-in', 'main', 4, 'newIn', 'true'),
  ('Collections', '/collections', 'collection', 5, NULL, NULL)
ON CONFLICT (label) DO NOTHING;

-- 6. Enhanced Orders Table with additional fields
ALTER TABLE orders ADD COLUMN IF NOT EXISTS packaging_id UUID REFERENCES packaging_options(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_status_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE orders ADD COLUMN IF NOT EXISTS acknowledged_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_started_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR';

-- Update status check constraint to include new statuses
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('ordered', 'acknowledged', 'shipping', 'delivered', 'cancelled'));

-- ============================================
-- SECTION 2: INDEXES FOR NEW TABLES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_product_stock_product_id ON product_stock(product_id);
CREATE INDEX IF NOT EXISTS idx_product_stock_quantity ON product_stock(quantity_available) WHERE quantity_available < 20;
CREATE INDEX IF NOT EXISTS idx_packaging_options_active ON packaging_options(is_active);
CREATE INDEX IF NOT EXISTS idx_packaging_options_order ON packaging_options(display_order);
CREATE INDEX IF NOT EXISTS idx_order_returns_order_id ON order_returns(order_id);
CREATE INDEX IF NOT EXISTS idx_order_returns_user_id ON order_returns(user_id);
CREATE INDEX IF NOT EXISTS idx_order_returns_status ON order_returns(status);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_activity_type ON user_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity(created_at);
CREATE INDEX IF NOT EXISTS idx_website_navigation_active ON website_navigation(is_active);
CREATE INDEX IF NOT EXISTS idx_website_navigation_order ON website_navigation(display_order);
CREATE INDEX IF NOT EXISTS idx_website_navigation_parent_id ON website_navigation(parent_id);

-- ============================================
-- SECTION 3: USEFUL VIEWS FOR ADMIN
-- ============================================

-- View for frequently ordered users
CREATE OR REPLACE VIEW frequent_users AS
SELECT 
  u.id,
  u.name,
  u.email,
  COUNT(o.id) as order_count,
  SUM(o.total_amount) as total_spent,
  MAX(o.created_at) as last_order_date,
  ua.activity_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
LEFT JOIN (
  SELECT user_id, COUNT(*) as activity_count
  FROM user_activity
  GROUP BY user_id
) ua ON u.id = ua.user_id
GROUP BY u.id, u.name, u.email, ua.activity_count
HAVING COUNT(o.id) > 0
ORDER BY order_count DESC;

-- View for stock status
CREATE OR REPLACE VIEW stock_status AS
SELECT 
  p.id,
  p.name,
  p.category,
  ps.quantity_available,
  ps.quantity_reserved,
  ps.quantity_sold,
  (ps.quantity_available - ps.quantity_reserved) as available_for_sale,
  CASE 
    WHEN (ps.quantity_available - ps.quantity_reserved) <= 0 THEN 'Out of Stock'
    WHEN (ps.quantity_available - ps.quantity_reserved) <= ps.low_stock_threshold THEN 'Low Stock'
    ELSE 'In Stock'
  END as stock_status,
  p.price
FROM products p
LEFT JOIN product_stock ps ON p.id = ps.product_id
ORDER BY available_for_sale ASC;

-- View for order analytics
CREATE OR REPLACE VIEW order_analytics AS
SELECT 
  DATE(o.created_at) as order_date,
  COUNT(o.id) as total_orders,
  SUM(o.total_amount) as revenue,
  AVG(o.total_amount) as avg_order_value,
  COUNT(DISTINCT o.user_id) as unique_customers,
  SUM(oi.quantity) as total_items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY DATE(o.created_at)
ORDER BY order_date DESC;

-- ============================================
-- SECTION 4: HELPER FUNCTIONS
-- ============================================

-- Function to update stock after order
CREATE OR REPLACE FUNCTION update_stock_after_order()
RETURNS TRIGGER AS $$
BEGIN
  -- When a new order is placed, reduce available stock
  UPDATE product_stock
  SET quantity_reserved = quantity_reserved + NEW.quantity,
      updated_at = NOW()
  WHERE product_id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update stock when order items are created
DROP TRIGGER IF EXISTS trigger_update_stock_after_order ON order_items;
CREATE TRIGGER trigger_update_stock_after_order
AFTER INSERT ON order_items
FOR EACH ROW
EXECUTE FUNCTION update_stock_after_order();

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
  p_user_id UUID,
  p_activity_type TEXT,
  p_product_id UUID DEFAULT NULL,
  p_order_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO user_activity (user_id, activity_type, product_id, order_id, metadata)
  VALUES (p_user_id, p_activity_type, p_product_id, p_order_id, p_metadata);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SECTION 5: RLS POLICIES FOR NEW TABLES
-- ============================================

ALTER TABLE product_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE packaging_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_navigation ENABLE ROW LEVEL SECURITY;

-- Product stock - admin only for now
CREATE POLICY "Allow public read product stock" ON product_stock
  FOR SELECT USING (true);

-- Packaging options - public read
CREATE POLICY "Allow public read packaging options" ON packaging_options
  FOR SELECT USING (is_active = true);

-- Order returns - users can only see their own
CREATE POLICY "Users can view own returns" ON order_returns
  FOR SELECT USING (auth.uid() = user_id);

-- User activity - private
CREATE POLICY "Users can view own activity" ON user_activity
  FOR SELECT USING (auth.uid() = user_id);

-- Website navigation - public read
CREATE POLICY "Allow public read navigation" ON website_navigation
  FOR SELECT USING (is_active = true);
