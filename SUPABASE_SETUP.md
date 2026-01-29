# Supabase Setup Guide - Grazel Apparel

## Quick Start

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Project name**: `grazel-apparel`
   - **Database password**: Save this securely
   - **Region**: Choose closest to your location (e.g., `eu-west-1` for UK)
   - **Pricing plan**: Free tier is fine for development
5. Click "Create new project"
6. Wait for project to initialize (2-3 minutes)

### 2. Get Your Credentials

Once project is created:

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (supabase_url)
   - **anon public** (supabase_anon_key)
3. Save them for next step

### 3. Create Environment File

Create `.env.local` in your project root:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Replace with your actual values from Step 2**

### 4. Run Database Migration

In Supabase dashboard:

1. Go to **SQL Editor**
2. Click "New Query"
3. Copy entire contents of `supabase/schema.sql`
4. Paste into the editor
5. Click **Run** (or Cmd+Enter)
6. Wait for tables to be created

You should see 9 new tables in the left sidebar:
- ✅ users
- ✅ user_addresses
- ✅ products
- ✅ orders
- ✅ order_items
- ✅ cart_items
- ✅ fit_profiles
- ✅ wishlist_items
- ✅ reviews

### 5. Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-react
```

### 6. Update App to Use Supabase

The app-store will be updated to use Supabase instead of mock data.

---

## Database Tables Overview

### `users`
Stores user profile information
- `id` (UUID) - Linked to auth.users
- `email`, `name`, `phone`
- `joined_date`, `created_at`, `updated_at`

### `products`
All available products in the store
- `id`, `name`, `description`
- `price`, `fabric`, `fit`, `category`
- `sizes` (array: S, M, L, XL, etc)
- `image_url`, `sku`

### `orders`
Customer orders
- `id`, `user_id`, `order_number`
- `status` (pending, processing, shipped, delivered, cancelled)
- `total_amount`, `subtotal`, `tax_amount`, `shipping_amount`
- Shipping and billing addresses
- `created_at`, `shipped_at`, `delivered_at`

### `order_items`
Line items in each order
- `id`, `order_id`, `product_id`
- `quantity`, `price`, `selected_size`

### `cart_items`
User shopping cart
- `id`, `user_id`, `product_id`
- `quantity`, `selected_size`
- Unique constraint on (user_id, product_id, selected_size)

### `fit_profiles`
User body measurements and preferences
- `user_id` (unique - one per user)
- `height`, `weight`, `chest`, `waist`, `hips`
- `preferred_fit` (slim, regular, relaxed)

### `wishlist_items`
User's saved products
- `user_id`, `product_id`
- `added_at`

### `reviews`
Product reviews
- `user_id`, `product_id`
- `rating` (1-5), `title`, `comment`
- `is_verified_purchase`, `helpful_count`

---

## Security Features

### Row Level Security (RLS)
All tables have RLS enabled:

✅ Users can only see their own data
✅ Users can only modify their own orders
✅ Cart items are private to each user
✅ Fit profiles are private
✅ Products are publicly readable

### Authentication
- Uses Supabase Auth (email/password)
- Auto-creates user record on signup
- Links auth session to users table

---

## API Endpoints (Auto-generated)

Supabase creates REST APIs automatically:

```
GET    /rest/v1/products
GET    /rest/v1/orders?user_id=eq.{id}
GET    /rest/v1/cart_items?user_id=eq.{id}
POST   /rest/v1/orders
POST   /rest/v1/order_items
PUT    /rest/v1/orders?id=eq.{id}
DELETE /rest/v1/cart_items?id=eq.{id}
```

---

## Sample Queries

### Get all products
```javascript
const { data } = await supabase
  .from('products')
  .select('*')
  .eq('is_active', true);
```

### Get user's orders
```javascript
const { data } = await supabase
  .from('orders')
  .select('*, order_items(*)')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });
```

### Get user's cart
```javascript
const { data } = await supabase
  .from('cart_items')
  .select('*, products(*)')
  .eq('user_id', userId);
```

### Create order
```javascript
const { data } = await supabase
  .from('orders')
  .insert({
    user_id: userId,
    subtotal: 150.00,
    tax_amount: 30.00,
    shipping_amount: 10.00,
    total_amount: 190.00,
    status: 'pending',
    shipping_street: '...',
  })
  .select();
```

---

## Testing

### Test Users

After setup, you can create test accounts:

1. In app, click "Sign Up"
2. Use test emails:
   - `test1@example.com`
   - `test2@example.com`
3. Password: `test123456`

Each user will have isolated data automatically.

### Admin Access

For admin functions, create separate accounts:
- `admin@grazel.com` (password: `admin123`)

---

## Useful Supabase Dashboard Shortcuts

**Table Editor**: View/edit data directly
**Auth**: Manage user accounts
**SQL Editor**: Run custom queries
**Logs**: Debug API calls
**Settings**: Manage API keys, policies

---

## Troubleshooting

### Tables not created
- Check SQL execution output
- Ensure all SQL executed without errors
- Check Supabase status page

### RLS issues
- Check user is authenticated
- Verify JWT token in API headers
- Check RLS policy settings

### Connection issues
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Check `.env.local` file exists
- Clear browser cache and reload

### Auth issues
- Ensure auth trigger is enabled
- Check `handle_new_user()` function exists
- Verify `on_auth_user_created` trigger exists

---

## Next Steps

1. ✅ Create Supabase project
2. ✅ Copy credentials to `.env.local`
3. ✅ Run schema.sql migration
4. ✅ Install dependencies
5. 🔄 Update app-store.tsx to use Supabase
6. 🔄 Test authentication
7. 🔄 Test CRUD operations

The app will automatically migrate from mock data to real Supabase database!
