# Supabase Database Setup Checklist ✅

Complete this checklist to integrate Supabase into Grazel Apparel.

## Phase 1: Supabase Project Setup

- [ ] **Create Supabase Account**
  - Visit https://supabase.com
  - Sign up with email or GitHub
  - Verify email

- [ ] **Create New Project**
  - Project name: `grazel-apparel`
  - Database password: Save securely ⚠️
  - Region: Select closest to users (UK: eu-west-1)
  - Pricing plan: Free tier for development

- [ ] **Wait for initialization**
  - Project setup takes 2-3 minutes
  - You'll receive email when ready

## Phase 2: Get Credentials

- [ ] **Copy API Credentials**
  - Go to Settings → API
  - Copy **Project URL**
  - Copy **anon public key**
  - Copy **service_role key** (for admin operations - keep secret!)

- [ ] **Create .env.local file**
  ```bash
  VITE_SUPABASE_URL=https://your-project.supabase.co
  VITE_SUPABASE_ANON_KEY=your-anon-key-here
  ```

- [ ] **Verify .env.local is in .gitignore**
  - Never commit secrets to git!

## Phase 3: Database Schema

- [ ] **Copy schema.sql**
  - Open `supabase/schema.sql` file in your project

- [ ] **Run migration in Supabase**
  - Go to Supabase Dashboard
  - Click **SQL Editor**
  - Click **New Query**
  - Paste entire schema.sql content
  - Click **Run** button
  - Wait for execution to complete

- [ ] **Verify tables created**
  - Check left sidebar under "Tables"
  - Should see:
    - ✅ users
    - ✅ user_addresses
    - ✅ products
    - ✅ orders
    - ✅ order_items
    - ✅ cart_items
    - ✅ fit_profiles
    - ✅ wishlist_items
    - ✅ reviews

- [ ] **Verify indexes created**
  - Click **Indexes** tab in SQL Editor
  - Should see ~14 indexes

- [ ] **Verify RLS policies enabled**
  - Click each table → **Policies** tab
  - Each table should have RLS enabled (padlock icon)

- [ ] **Verify sample products inserted**
  - Click **products** table
  - Should see 8 sample products

## Phase 4: Authentication Setup

- [ ] **Enable email authentication**
  - Go to Authentication → Providers
  - Email provider should be enabled by default
  - Check settings if needed

- [ ] **Configure email templates** (Optional)
  - Go to Email Templates
  - Review confirmation, reset, invite emails
  - Customize if desired

- [ ] **Test auth function**
  - SQL Editor → New Query
  - Run: `SELECT * FROM users;`
  - Should be empty (no users yet)

## Phase 5: Development Setup

- [ ] **Install dependencies**
  ```bash
  npm install @supabase/supabase-js
  ```
  ✅ Already done!

- [ ] **Verify Supabase client**
  - Check `src/lib/supabase.ts` exists
  - Should have all helper functions

- [ ] **Update app-store.tsx**
  - Replace mock data with Supabase calls
  - Update auth functions to use Supabase
  - Test CRUD operations

- [ ] **Test user signup**
  - Visit app at http://localhost:5173
  - Click "Sign Up"
  - Create test account
  - Check Supabase Dashboard → Auth → Users
  - Should see new user in list

- [ ] **Test user login**
  - Logout
  - Login with test credentials
  - Verify works correctly

## Phase 6: Feature Testing

- [ ] **Test Products**
  - Navigate to Products page
  - Verify products load from Supabase
  - Test filtering and search

- [ ] **Test Cart**
  - Add items to cart
  - Check `cart_items` table in Supabase
  - Items should show for logged-in user only

- [ ] **Test Orders**
  - Place an order
  - Check `orders` table in Supabase
  - Order should have correct user_id
  - Check `order_items` table for line items

- [ ] **Test User Isolation**
  - Login as User A
  - Place order
  - Logout
  - Login as User B
  - Verify User B doesn't see User A's orders
  - Verify User B's cart is empty

- [ ] **Test Admin Functions**
  - Navigate to admin dashboard (#/admin)
  - Test add product
  - Verify product appears in products table
  - Test update product
  - Test delete product
  - Test add user
  - Test update user
  - Test delete user

- [ ] **Test Fit Profile**
  - Save fit profile
  - Check `fit_profiles` table in Supabase
  - Verify user can update profile
  - Logout/Login and verify profile persists

## Phase 7: Security Verification

- [ ] **Test RLS Policies**
  - Open Supabase SQL Editor
  - Run as authenticated user without admin:
    ```sql
    SELECT * FROM orders WHERE user_id != auth.uid();
    ```
    Should return 0 rows (blocked by RLS)

- [ ] **Verify API keys security**
  - Check .env.local NOT in git
  - Check .gitignore has `.env.local`
  - Check no keys exposed in commits

- [ ] **Test session security**
  - Login
  - Open DevTools → Application → Cookies
  - Verify session cookie is HttpOnly
  - Logout and verify cookie cleared

## Phase 8: Production Preparation

- [ ] **Review database backup**
  - Supabase → Settings → Database
  - Check automatic backups enabled (daily)

- [ ] **Set up monitoring** (Optional)
  - Supabase → Logs
  - Monitor API usage
  - Check error logs

- [ ] **Document credentials**
  - Store in password manager
  - Share securely with team if needed
  - Never commit to repo

- [ ] **Plan migration from mock data**
  - Current state: Using mock data with local state
  - Next state: Using Supabase with real persistence
  - Plan smooth transition for existing users

## Phase 9: Ongoing Maintenance

- [ ] **Monitor API usage**
  - Check Supabase Dashboard
  - Track usage vs quota limits
  - Upgrade if approaching limits

- [ ] **Backup data regularly**
  - Enable weekly backups
  - Test restore procedures
  - Export data periodically

- [ ] **Update dependencies**
  ```bash
  npm update @supabase/supabase-js
  ```

- [ ] **Keep RLS policies updated**
  - Review policies quarterly
  - Update for new features
  - Test thoroughly

---

## Quick Reference: Supabase Commands

### View Logs
```sql
-- View recent API calls
SELECT * FROM auth.audit_log_entries ORDER BY created_at DESC LIMIT 10;
```

### Check User Sessions
```sql
-- View active sessions
SELECT id, user_id, created_at FROM auth.sessions;
```

### View Table Stats
```sql
-- Check table sizes
SELECT table_name, pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) AS size
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY pg_total_relation_size(quote_ident(table_name)) DESC;
```

### Reset Demo Data
```sql
-- Delete all data (caution!)
TRUNCATE TABLE products CASCADE;
-- Then re-insert sample products from schema.sql
```

---

## Troubleshooting

### Issue: Tables not created
**Solution:**
1. Check SQL execution output for errors
2. Ensure all SQL syntax is correct
3. Try running schema.sql in smaller chunks
4. Check Supabase status page

### Issue: RLS errors
**Solution:**
1. Verify user is authenticated
2. Check RLS policy syntax
3. Run: `SELECT current_user;` in SQL Editor
4. Check JWT token in Network tab

### Issue: Auth not working
**Solution:**
1. Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local
2. Check email/password correct
3. Look for errors in browser console
4. Check Supabase Auth logs

### Issue: Data not persisting
**Solution:**
1. Check user_id is set correctly
2. Verify RLS allows write operations
3. Check network requests in DevTools
4. Monitor Supabase logs for errors

---

## Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Community**: https://discord.supabase.io
- **Database Documentation**: https://www.postgresql.org/docs/
- **RLS Documentation**: https://supabase.com/docs/guides/auth/row-level-security

---

**Last Updated**: January 28, 2026
**Status**: Ready for implementation ✅
