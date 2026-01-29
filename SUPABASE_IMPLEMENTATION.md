# Supabase Integration Timeline & Implementation Guide

## 📅 Complete Implementation Roadmap

### **Week 1: Setup & Configuration**

#### Day 1: Supabase Project Creation
- [ ] Create Supabase account (5 min)
- [ ] Create grazel-apparel project (5 min)
- [ ] Get API credentials (5 min)
- [ ] Create .env.local file (2 min)
- **Time: 17 minutes**

#### Day 2: Database Migration
- [ ] Run schema.sql in SQL Editor (5 min)
- [ ] Verify all 9 tables created (3 min)
- [ ] Verify 14 indexes created (2 min)
- [ ] Verify RLS policies enabled (3 min)
- [ ] Test sample products loaded (2 min)
- **Time: 15 minutes**

#### Day 3-5: App Integration
- [ ] Update authentication to use Supabase Auth
- [ ] Replace mock data with database calls
- [ ] Update product loading
- [ ] Update cart operations
- [ ] Update order creation
- **Time: 4-6 hours**

---

## 🔧 Integration Steps

### Step 1: Update User Authentication

**File**: `src/app/components/user-auth.tsx`

Replace local auth with Supabase:

```typescript
import { signUpUser, signInUser } from '../lib/supabase';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    if (isLogin) {
      await signInUser(formData.email, formData.password);
      onSuccess();
    } else {
      await signUpUser(formData.email, formData.password, formData.name);
      onSuccess();
    }
  } catch (error) {
    setError(error.message);
  }
};
```

### Step 2: Update App Store

**File**: `src/app/store/app-store.tsx`

Replace with Supabase:

```typescript
import { supabase, getProducts, getUserOrders } from '../lib/supabase';

// Remove mockProducts, mockOrders, mockUsers
// Replace with Supabase queries

// In AppProvider:
useEffect(() => {
  const loadProducts = async () => {
    const products = await getProducts();
    setProducts(products);
  };
  
  const loadUserData = async () => {
    if (currentUser) {
      const orders = await getUserOrders(currentUser.id);
      setOrders(orders);
      
      const cartItems = await getCartItems(currentUser.id);
      setCartItems(cartItems);
    }
  };
  
  loadProducts();
  loadUserData();
}, [currentUser]);
```

### Step 3: Update Product Loading

**File**: `src/app/App.tsx`

```typescript
import { getProducts } from './lib/supabase';

useEffect(() => {
  const loadProducts = async () => {
    const data = await getProducts({ is_active: true });
    // Use products...
  };
  
  loadProducts();
}, []);
```

### Step 4: Update Cart Operations

**File**: `src/app/components/cart-checkout.tsx`

```typescript
import { addToCart, removeFromCart, createOrder } from '../lib/supabase';

const handleAddToCart = async (productId: string, size: string, qty: number) => {
  const { currentUser } = useAppStore();
  if (!currentUser) return;
  
  await addToCart(currentUser.id, productId, qty, size);
  // Refresh cart...
};

const handlePlaceOrder = async () => {
  const { currentUser } = useAppStore();
  if (!currentUser) return;
  
  const order = await createOrder({
    user_id: currentUser.id,
    subtotal: subtotal,
    tax_amount: tax,
    shipping_amount: shipping,
    total_amount: total,
    status: 'pending',
    shipping_street: address.street,
    shipping_city: address.city,
    shipping_postcode: address.postcode,
    shipping_country: address.country
  }, cartItems);
  
  // Clear cart...
};
```

### Step 5: Update Admin Dashboard

**File**: `src/app/components/admin-dashboard.tsx`

```typescript
import { 
  getAllProducts, getAllOrders, getAllUsers,
  createProduct, updateProduct, deleteProduct,
  createUser, updateUser, deleteUser,
  deleteOrder
} from '../lib/supabase';

// Replace CRUD functions with Supabase calls
const handleAddProduct = async () => {
  const product = await createProduct(productData);
  // Refresh products...
};

const handleUpdateProduct = async (id, data) => {
  await updateProduct(id, data);
  // Refresh products...
};

const handleDeleteProduct = async (id) => {
  await deleteProduct(id);
  // Refresh products...
};
```

### Step 6: Update Order History

**File**: `src/app/components/` (create new component if needed)

```typescript
import { getUserOrders } from '../lib/supabase';

const UserOrderHistory = ({ userId }) => {
  const [orders, setOrders] = useState([]);
  
  useEffect(() => {
    const loadOrders = async () => {
      const data = await getUserOrders(userId);
      setOrders(data);
    };
    
    loadOrders();
  }, [userId]);
  
  return (
    <div>
      {orders.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
};
```

---

## 🧪 Testing Checklist

### Unit Tests
```typescript
// Test product loading
describe('Products', () => {
  test('loads products from Supabase', async () => {
    const products = await getProducts();
    expect(products.length).toBeGreaterThan(0);
  });
});

// Test user isolation
describe('User Isolation', () => {
  test('user A cannot see user B orders', async () => {
    // Login as User A
    // Get orders - should only see User A's orders
    // User B's orders should not be returned
  });
});
```

### Integration Tests
- [ ] Signup creates user in Supabase
- [ ] Login retrieves correct user
- [ ] Adding product shows in cart
- [ ] Creating order saves to database
- [ ] User A can't see User B's data
- [ ] Admin can manage all products

### E2E Tests
- [ ] Complete signup → browse → add to cart → checkout → order flow
- [ ] User logout → different user login → verify isolation
- [ ] Admin login → add product → verify in store → delete product

---

## 📊 Migration Data Strategy

### For Existing Users

Option A: **Fresh Start**
- Clear mock data
- Users create new accounts
- Easiest to implement

Option B: **Migrate Mock Data**
```typescript
// Create seed function
async function migrateExistingData() {
  // Insert existing users
  await supabase.from('users').insert(mockUsers);
  
  // Insert existing products
  await supabase.from('products').insert(mockProducts);
  
  // Insert existing orders
  await supabase.from('orders').insert(mockOrders);
}

// Call once during migration
migrateExistingData();
```

Option C: **Hybrid**
- Keep mock data as default
- Auto-create sample accounts
- Gradual migration of real data

---

## 🚨 Rollback Plan

If issues occur during migration:

### Quick Rollback
```bash
# Revert to mock data
git checkout src/app/store/app-store.tsx

# Keep Supabase running but disabled
# Mock data will be used again
```

### Data Cleanup
```sql
-- If needed, reset Supabase
DELETE FROM order_items CASCADE;
DELETE FROM orders CASCADE;
DELETE FROM cart_items CASCADE;
DELETE FROM products CASCADE;
DELETE FROM users CASCADE;

-- Re-run schema.sql to reset
```

---

## 📈 Performance Optimization

### Caching Strategy
```typescript
// Cache products (change rarely)
const [cachedProducts, setCachedProducts] = useState(null);

useEffect(() => {
  if (!cachedProducts) {
    getProducts().then(setCachedProducts);
  }
}, []);
```

### Pagination for Orders
```typescript
// Load orders in batches
const loadMoreOrders = async (offset = 0) => {
  const orders = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .range(offset, offset + 9);
  
  setOrders(prev => [...prev, ...orders]);
};
```

### Real-time Updates
```typescript
// Subscribe to order changes
const subscription = supabase
  .from(`orders:user_id=eq.${userId}`)
  .on('*', payload => {
    console.log('Order updated:', payload);
    // Refresh orders
  })
  .subscribe();
```

---

## 🔍 Monitoring & Logging

### API Usage
```typescript
// Log all Supabase operations
const logOperation = (operation, data) => {
  console.log(`[Supabase] ${operation}`, data);
  // Send to analytics...
};
```

### Error Handling
```typescript
// Comprehensive error handling
try {
  const data = await supabase.from('orders').select('*');
  if (error) {
    console.error('Query failed:', error);
    // Retry logic
    // Fallback to cache
  }
} catch (error) {
  console.error('Network error:', error);
  // Show user-friendly message
}
```

### Supabase Logs
- Monitor via Supabase Dashboard → Logs
- Set up alerts for errors
- Track slow queries
- Monitor authentication events

---

## 🎯 Success Criteria

✅ All tests passing
✅ User isolation verified
✅ CRUD operations working
✅ Admin functions functional
✅ Performance acceptable (< 500ms queries)
✅ No data leaks between users
✅ Backup strategy in place
✅ Monitoring configured

---

## 📞 Troubleshooting During Migration

### Problem: Authentication failing
**Debug**:
1. Check .env.local has correct URLs
2. Verify user exists in Supabase → Auth
3. Check browser console for auth errors
4. Try manually signing in via Supabase dashboard

### Problem: Data not persisting
**Debug**:
1. Check network tab for failed requests
2. Verify RLS policies allow operation
3. Check Supabase logs for errors
4. Ensure user_id is set correctly

### Problem: RLS denying legitimate access
**Debug**:
1. Verify user is authenticated (check JWT)
2. Check RLS policy logic
3. Test query without RLS
4. Review Supabase documentation on RLS

---

## ✨ Final Checklist

- [ ] Schema.sql successfully migrated
- [ ] All tables created with indexes
- [ ] RLS policies enabled
- [ ] Sample products inserted
- [ ] .env.local configured
- [ ] Dependencies installed
- [ ] Supabase client created
- [ ] Authentication integrated
- [ ] Product loading works
- [ ] Cart operations work
- [ ] Order creation works
- [ ] User isolation verified
- [ ] Admin functions work
- [ ] Logging configured
- [ ] Monitoring enabled
- [ ] Backup strategy in place
- [ ] Documentation updated
- [ ] Team briefed

**Status**: Ready for production deployment! 🚀

---

**Document Version**: 1.0
**Last Updated**: January 28, 2026
**Status**: Complete & Ready for Implementation
