import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { supabase, signUpUser, signInUser, signOutUser, getCurrentSession } from '../../lib/supabase';

// Types
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  fabric: string;
  fit: string;
  category?: string;
  size?: string[];
  gender?: string;
  isEssential?: boolean;
  offerPercentage?: number;
  createdAt?: string;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
  userId?: string; // Track which user owns this cart item
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  joinedDate: string;
  address?: {
    street: string;
    city: string;
    postcode: string;
    country: string;
  };
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  shippingAddress: {
    street: string;
    city: string;
    postcode: string;
    country: string;
  };
}

export interface FitProfile {
  id?: string;
  userId: string;
  preferredSize: string;
  bodyType: string;
  height: string;
  weight: string;
  preferredFit: 'slim' | 'regular' | 'relaxed';
  notes?: string;
  createdAt: string;
}

interface AppState {
  users: User[];
  orders: Order[];
  cartItems: CartItem[];
  products: Product[];
  fitProfiles: FitProfile[];
  favorites: Product[]; // Array of favorite/liked products
  currentUser: User | null;
  isAdmin: boolean;
}

interface AppContextType extends AppState {
  addToCart: (product: Product, size: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  createOrder: () => Order | null;
  setCurrentUser: (user: User | null) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  saveFitProfile: (profile: Omit<FitProfile, 'userId' | 'createdAt'>) => void;
  // Favorite/Wishlist operations
  toggleFavorite: (product: Product) => void;
  isFavorite: (productId: string) => boolean;
  removeFavorite: (productId: string) => void;
  clearFavorites: () => void;
  // Fit Profile operations
  getFitProfiles: () => Promise<void>;
  addFitProfile: (profile: Omit<FitProfile, 'createdAt'>) => Promise<void>;
  updateFitProfile: (userId: string, profile: Partial<Omit<FitProfile, 'userId' | 'createdAt'>>) => Promise<void>;
  deleteFitProfile: (userId: string) => Promise<void>;
  // User authentication
  loginUser: (email: string, password: string) => Promise<boolean>;
  registerUser: (name: string, email: string, password: string) => Promise<boolean>;
  logoutUser: () => Promise<void>;
  // Admin CRUD operations
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  deleteAllProducts: () => Promise<void>;
  addUser: (user: Omit<User, 'id' | 'joinedDate'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  deleteOrder: (id: string) => void;
}

// Mock data
const mockUsers: User[] = [];

const mockProducts: Product[] = [];

const mockOrders: Order[] = [];

const mockFitProfiles: FitProfile[] = [];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Generate unique session ID for THIS INSTANCE ONLY (per tab/window)
  // Use useRef to ensure it's created once per mount and doesn't change on re-renders
  const sessionIdRef = useRef(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const SESSION_ID = sessionIdRef.current;

  const [users, setUsers] = useState<User[]>(mockUsers);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [fitProfiles, setFitProfiles] = useState<FitProfile[]>(mockFitProfiles);
  const [favorites, setFavorites] = useState<Product[]>(() => {
    // Don't load on init - will load after user logs in
    return [];
  });
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // Use sessionStorage for THIS TAB ONLY (not shared across tabs)
    const saved = sessionStorage.getItem(`currentUser_${SESSION_ID}`);
    return saved ? JSON.parse(saved) : null;
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState(true);

  // Set up Supabase auth listener on mount
  useEffect(() => {
    // First restore from sessionStorage (per-tab with unique SESSION_ID)
    const saved = sessionStorage.getItem(`currentUser_${SESSION_ID}`);
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to parse saved user:', err);
      }
    }

    // Listen for Supabase auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || 'User',
          joinedDate: new Date().toISOString().split('T')[0]
        };
        setCurrentUser(user);
        // Use sessionStorage - each tab has its own session
        sessionStorage.setItem(`currentUser_${SESSION_ID}`, JSON.stringify(user));
      } else if (event === 'SIGNED_OUT' || !session) {
        setCurrentUser(null);
        sessionStorage.removeItem(`currentUser_${SESSION_ID}`);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  // Persist current user to sessionStorage when it changes (per-tab only)
  useEffect(() => {
    if (currentUser) {
      // Store in sessionStorage with SESSION_ID - unique per tab
      sessionStorage.setItem(`currentUser_${SESSION_ID}`, JSON.stringify(currentUser));

      // Load user-specific favorites (uses user ID as key)
      const favKey = `favorites_${currentUser.id}`;
      const saved = localStorage.getItem(favKey);
      setFavorites(saved ? JSON.parse(saved) : []);

      // Load user-specific cart items (uses user ID as key)
      const cartKey = `cart_${currentUser.id}`;
      const cartSaved = localStorage.getItem(cartKey);
      if (cartSaved) {
        setCartItems(JSON.parse(cartSaved));
      }
    } else {
      // Remove this tab's session
      sessionStorage.removeItem(`currentUser_${SESSION_ID}`);
      // Clear favorites and cart when user logs out
      setFavorites([]);
      setCartItems([]);
    }
  }, [currentUser]);

  // Persist cart items to user-specific localStorage when they change
  useEffect(() => {
    if (currentUser) {
      const userCartItems = cartItems.filter(item => item.userId === currentUser.id);
      const cartKey = `cart_${currentUser.id}`;
      localStorage.setItem(cartKey, JSON.stringify(userCartItems));
    }
  }, [cartItems, currentUser]);

  // Fetch products from Supabase on mount and set up real-time listener
  useEffect(() => {
    fetchProductsFromSupabase();
    fetchUsersFromSupabase();

    // Set up real-time subscription for products
    const productSubscription = supabase
      .channel('products')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          // Refetch products when any change occurs
          fetchProductsFromSupabase();
        }
      )
      .subscribe();

    // Set up auto-refresh every 5 seconds as fallback
    const interval = setInterval(() => {
      fetchProductsFromSupabase();
      fetchUsersFromSupabase();
    }, 5000);

    return () => {
      clearInterval(interval);
      productSubscription.unsubscribe();
    };
  }, []);

  const fetchProductsFromSupabase = async () => {
    // Mock products for fallback when Supabase is not connected
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Tailored Wool Blazer',
        price: 495,
        image: 'https://images.unsplash.com/photo-1593642532400-2682a8a6b289?w=400&h=500&fit=crop',
        fabric: 'Wool',
        fit: 'Regular Fit',
        category: 'Men',
        gender: 'Male',
        isEssential: false,
        offerPercentage: 15
      },
      {
        id: '2',
        name: 'Silk Evening Dress',
        price: 675,
        image: 'https://images.unsplash.com/photo-1595777707802-08422fc4a3e6?w=400&h=500&fit=crop',
        fabric: 'Silk',
        fit: 'Slim Fit',
        category: 'Women',
        gender: 'Female',
        isEssential: false,
        offerPercentage: 10
      },
      {
        id: '3',
        name: 'Cashmere Roll Neck',
        price: 385,
        image: 'https://images.unsplash.com/photo-1591047990375-cd5d08cfd58a?w=400&h=500&fit=crop',
        fabric: 'Cashmere',
        fit: 'Regular Fit',
        category: 'Men',
        gender: 'Male',
        isEssential: false,
        offerPercentage: 0
      },
      {
        id: '4',
        name: 'Cotton Oxford Shirt',
        price: 145,
        image: 'https://images.unsplash.com/photo-1596362051609-b370a1c159a7?w=400&h=500&fit=crop',
        fabric: 'Cotton',
        fit: 'Slim Fit',
        category: 'Men',
        gender: 'Male',
        isEssential: true,
        offerPercentage: 20
      },
      {
        id: '5',
        name: 'Wool Dress Trousers',
        price: 225,
        image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=500&fit=crop',
        fabric: 'Wool',
        fit: 'Regular Fit',
        category: 'Men',
        gender: 'Male',
        isEssential: false,
        offerPercentage: 12
      },
      {
        id: '6',
        name: 'Cashmere Overcoat',
        price: 895,
        image: 'https://images.unsplash.com/photo-1539533057592-4c691c1270f0?w=400&h=500&fit=crop',
        fabric: 'Cashmere',
        fit: 'Regular Fit',
        category: 'Women',
        gender: 'Female',
        isEssential: false,
        offerPercentage: 0
      },
      {
        id: '7',
        name: 'Linen Summer Shirt',
        price: 99,
        image: 'https://images.unsplash.com/photo-1597622424447-d3935a1f0d44?w=400&h=500&fit=crop',
        fabric: 'Linen',
        fit: 'Relaxed Fit',
        category: 'Men',
        gender: 'Male',
        isEssential: true,
        offerPercentage: 25
      },
      {
        id: '8',
        name: 'Silk Blouse',
        price: 189,
        image: 'https://images.unsplash.com/photo-1595348625778-3f52b86b7f2e?w=400&h=500&fit=crop',
        fabric: 'Silk',
        fit: 'Slim Fit',
        category: 'Women',
        gender: 'Female',
        isEssential: false,
        offerPercentage: 18
      }
    ];

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        console.warn('Supabase connection issue or no products. Using mock products.');
        setSupabaseConnected(false);
        // Use mock products as fallback
        setProducts(mockProducts);
        return;
      }

      setSupabaseConnected(true);

      // Convert Supabase products to app format
      const supabaseProducts = data.map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.image_url,
        fabric: p.fabric,
        fit: p.fit,
        category: p.category,
        size: p.sizes,
        gender: p.gender,
        isEssential: p.is_essential,
        offerPercentage: p.offer_percentage,
        createdAt: p.created_at
      }));

      setProducts(supabaseProducts);
    } catch (err: any) {
      console.warn('Failed to fetch products from Supabase. Using mock products:', err?.message);
      setSupabaseConnected(false);
      // Use mock products as fallback when error
      setProducts(mockProducts);
    }
  };

  const fetchUsersFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('joined_date', { ascending: false });

      if (error) {
        console.warn('Supabase connection issue. Could not fetch users.');
        return;
      }

      if (data && data.length > 0) {
        // Convert Supabase users to app format
        const supabaseUsers = data.map((u: any) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          phone: u.phone,
          joinedDate: u.joined_date
        }));
        
        setUsers(supabaseUsers);
      }
    } catch (err: any) {
      console.warn('Failed to fetch users from Supabase:', err?.message);
      // Keep existing users
    }
  };

  const addToCart = (product: Product, size: string, quantity: number) => {
    // Only add to cart if user is logged in
    if (!currentUser) {
      console.warn('User must be logged in to add to cart');
      return;
    }

    setCartItems(prev => {
      // Filter to only this user's cart items
      const userCartItems = prev.filter(item => item.userId === currentUser.id);
      const existing = userCartItems.find(item => item.id === product.id && item.selectedSize === size);

      if (existing) {
        // Update existing item for this user
        return prev.map(item =>
          item.userId === currentUser.id && item.id === product.id && item.selectedSize === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      // Add new item with userId tracking
      return [...prev, { ...product, selectedSize: size, quantity, userId: currentUser.id }];
    });
  };

  const removeFromCart = (productId: string) => {
    if (!currentUser) return;
    // Only remove this user's items
    setCartItems(prev => prev.filter(item => !(item.id === productId && item.userId === currentUser.id)));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (!currentUser) return;

    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prev =>
      prev.map(item =>
        item.id === productId && item.userId === currentUser.id
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    if (!currentUser) return;
    // Only clear this user's cart
    setCartItems(prev => prev.filter(item => item.userId !== currentUser.id));
  };

  const createOrder = (): Order | null => {
    if (!currentUser) return null;

    // Get only this user's cart items
    const userCartItems = cartItems.filter(item => item.userId === currentUser.id);
    if (userCartItems.length === 0) return null;

    const newOrder: Order = {
      id: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
      userId: currentUser.id,
      items: [...userCartItems],
      total: userCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      status: 'pending',
      createdAt: new Date().toISOString(),
      shippingAddress: currentUser.address || {
        street: '',
        city: '',
        postcode: '',
        country: 'United Kingdom'
      }
    };
    
    setOrders(prev => [...prev, newOrder]);
    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, status } : order
      )
    );
  };

  const saveFitProfile = (profile: Omit<FitProfile, 'userId' | 'createdAt'>) => {
    if (!currentUser) return;
    
    const newProfile: FitProfile = {
      ...profile,
      userId: currentUser.id,
      createdAt: new Date().toISOString()
    };
    
    setFitProfiles(prev => {
      const existing = prev.findIndex(p => p.userId === currentUser.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = newProfile;
        return updated;
      }
      return [...prev, newProfile];
    });
  };

  // Favorite/Wishlist operations
  const toggleFavorite = (product: Product) => {
    if (!currentUser) return;

    setFavorites(prev => {
      const isFav = prev.some(p => p.id === product.id);
      let updated: Product[];
      if (isFav) {
        updated = prev.filter(p => p.id !== product.id);
      } else {
        updated = [...prev, product];
      }
      // Save to user-specific localStorage key
      const favKey = `favorites_${currentUser.id}`;
      localStorage.setItem(favKey, JSON.stringify(updated));
      return updated;
    });
  };

  const isFavorite = (productId: string): boolean => {
    return favorites.some(p => p.id === productId);
  };

  const removeFavorite = (productId: string) => {
    if (!currentUser) return;

    setFavorites(prev => {
      const updated = prev.filter(p => p.id !== productId);
      const favKey = `favorites_${currentUser.id}`;
      localStorage.setItem(favKey, JSON.stringify(updated));
      return updated;
    });
  };

  const clearFavorites = () => {
    if (!currentUser) return;
    setFavorites([]);
    const favKey = `favorites_${currentUser.id}`;
    localStorage.removeItem(favKey);
  };

  // User Authentication with Supabase
  const loginUser = async (email: string, password: string): Promise<boolean> => {
    try {
      const { user, session } = await signInUser(email, password);
      if (user) {
        const appUser: User = {
          id: user.id,
          name: user.user_metadata?.name || email.split('@')[0],
          email: user.email || email,
          joinedDate: user.created_at || new Date().toISOString().split('T')[0]
        };
        setCurrentUser(appUser);
        setIsAdmin(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      // Fallback to local users if Supabase fails
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        setCurrentUser(user);
        setIsAdmin(false);
        return true;
      }
      return false;
    }
  };

  const registerUser = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const { user } = await signUpUser(email, password, name);
      if (user) {
        const appUser: User = {
          id: user.id,
          name: name,
          email: user.email || email,
          joinedDate: new Date().toISOString().split('T')[0]
        };
        setUsers(prev => [...prev, appUser]);
        setCurrentUser(appUser);
        setIsAdmin(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      // Fallback to local registration if Supabase fails
      const emailExists = users.some(u => u.email === email);
      if (emailExists) return false;

      const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        password,
        joinedDate: new Date().toISOString().split('T')[0]
      };
      
      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      setIsAdmin(false);
      return true;
    }
  };

  const logoutUser = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setCurrentUser(null);
    setCartItems([]);
    setIsAdmin(false);
  };

  // Admin CRUD Operations for Products
  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      // Insert into Supabase
      const { data, error } = await supabase
        .from('products')
        .insert([
          {
            name: product.name,
            price: product.price,
            image_url: product.image,
            fabric: product.fabric,
            fit: product.fit,
            category: product.category,
            sizes: product.size || [],
            gender: product.gender,
            is_essential: product.isEssential || false,
            offer_percentage: product.offerPercentage || 0,
            is_active: true,
            created_at: product.createdAt || new Date().toISOString()
          }
        ])
        .select();

      if (error) {
        console.error('Error adding product to Supabase:', error);
        // Fallback: add to store only
        const newProduct: Product = {
          ...product,
          id: `prod-${Date.now()}`
        };
        setProducts(prev => [...prev, newProduct]);
      } else if (data && data.length > 0) {
        // Immediately add the product to state
        const newProduct: Product = {
          name: data[0].name,
          price: data[0].price,
          image: data[0].image_url,
          fabric: data[0].fabric,
          fit: data[0].fit,
          category: data[0].category,
          size: data[0].sizes,
          gender: data[0].gender,
          isEssential: data[0].is_essential,
          offerPercentage: data[0].offer_percentage,
          createdAt: data[0].created_at,
          id: data[0].id
        };
        setProducts(prev => [...prev, newProduct]);

        // Refetch to ensure all data is synced
        setTimeout(() => fetchProductsFromSupabase(), 500);
      }
    } catch (err) {
      console.error('Failed to add product:', err);
      // Fallback to store only
      const newProduct: Product = {
        ...product,
        id: `prod-${Date.now()}`
      };
      setProducts(prev => [...prev, newProduct]);
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      // Immediately update UI for instant feedback
      setProducts(prev =>
        prev.map(product =>
          product.id === id ? { ...product, ...updates } : product
        )
      );

      // Update in Supabase
      const { error } = await supabase
        .from('products')
        .update({
          name: updates.name,
          price: updates.price,
          image_url: updates.image,
          fabric: updates.fabric,
          fit: updates.fit,
          category: updates.category,
          sizes: updates.size,
          gender: updates.gender,
          is_essential: updates.isEssential,
          offer_percentage: updates.offerPercentage,
          created_at: updates.createdAt
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating product in Supabase:', error);
        // Refresh products to restore correct state
        await fetchProductsFromSupabase();
      } else {
        // Refresh products after successful update
        setTimeout(() => fetchProductsFromSupabase(), 500);
      }
    } catch (err) {
      console.error('Failed to update product:', err);
      // Refresh products on error
      await fetchProductsFromSupabase();
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      // Store the deleted product ID to prevent re-adding
      const deletedProductId = id;

      // Immediately remove from UI for instant feedback
      setProducts(prev => prev.filter(product => product.id !== deletedProductId));

      // Delete from Supabase (soft delete - set is_active to false)
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', deletedProductId);

      if (error) {
        console.error('Error deleting product from Supabase:', error);
        // If delete failed, refresh to restore the product
        await new Promise(resolve => setTimeout(resolve, 500));
        await fetchProductsFromSupabase();
      } else {
        // Delete was successful
        // Wait for database to fully process, then verify deletion
        await new Promise(resolve => setTimeout(resolve, 800));

        // Explicitly fetch to confirm the product is gone
        const { data, error: fetchError } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true);

        if (!fetchError && data) {
          // Set only the active products (excluding the deleted one)
          const activeProducts = data.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            image: p.image_url,
            fabric: p.fabric,
            fit: p.fit,
            category: p.category,
            size: p.sizes,
            gender: p.gender,
            isEssential: p.is_essential,
            offerPercentage: p.offer_percentage,
            createdAt: p.created_at
          }));
          setProducts(activeProducts);
        }
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
      // If there's an error, still keep the product removed from UI
      setProducts(prev => prev.filter(product => product.id !== id));
    }
  };

  const deleteAllProducts = async () => {
    try {
      // Immediately clear UI for instant feedback
      setProducts([]);

      // Delete all products from Supabase (soft delete - set is_active to false)
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('is_active', true);

      if (error) {
        console.error('Error deleting all products from Supabase:', error);
        // Keep products cleared from UI even if there's an error
      } else {
        // Deletion was successful
        // Wait for database to fully process
        await new Promise(resolve => setTimeout(resolve, 800));

        // Explicitly fetch to confirm all products are deleted
        const { data, error: fetchError } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true);

        if (!fetchError) {
          // Ensure products list is empty
          setProducts(data && data.length > 0 ? [] : []);
        }
      }
    } catch (err) {
      console.error('Failed to delete all products:', err);
      // Keep products cleared from UI even on error
      setProducts([]);
    }
  };

  // Admin CRUD Operations for Users
  const addUser = (user: Omit<User, 'id' | 'joinedDate'>) => {
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}`,
      joinedDate: new Date().toISOString().split('T')[0]
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev =>
      prev.map(user =>
        user.id === id ? { ...user, ...updates } : user
      )
    );
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id));
    // Also delete user's orders and fit profile
    setOrders(prev => prev.filter(order => order.userId !== id));
    setFitProfiles(prev => prev.filter(profile => profile.userId !== id));
  };

  // Admin Delete Operations for Orders
  const deleteOrder = (id: string) => {
    setOrders(prev => prev.filter(order => order.id !== id));
  };

  // Fit Profile Operations
  const getFitProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('fit_profiles')
        .select('*');

      if (error) {
        console.error('Error fetching fit profiles:', error);
        return;
      }

      if (data) {
        const profiles = data.map((p: any) => ({
          id: p.id,
          userId: p.user_id,
          preferredSize: p.preferred_size,
          bodyType: p.body_type,
          height: p.height,
          weight: p.weight,
          preferredFit: p.preferred_fit,
          notes: p.notes,
          createdAt: p.created_at
        }));
        setFitProfiles(profiles as any);
        console.log('Fit profiles fetched:', profiles);
      }
    } catch (err) {
      console.error('Failed to fetch fit profiles:', err);
    }
  };

  const addFitProfile = async (profile: Omit<FitProfile, 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('fit_profiles')
        .insert([
          {
            user_id: profile.userId,
            preferred_size: profile.preferredSize,
            body_type: profile.bodyType || '',
            height: profile.height || '',
            weight: profile.weight || '',
            preferred_fit: profile.preferredFit || 'regular',
            notes: profile.notes || ''
          }
        ])
        .select();

      if (error) {
        console.error('Error adding fit profile:', error);
      } else if (data && data.length > 0) {
        const newProfile: FitProfile = {
          id: data[0].id,
          userId: data[0].user_id,
          preferredSize: data[0].preferred_size,
          bodyType: data[0].body_type,
          height: data[0].height,
          weight: data[0].weight,
          preferredFit: data[0].preferred_fit,
          notes: data[0].notes,
          createdAt: data[0].created_at
        };
        setFitProfiles(prev => [...prev, newProfile]);
        console.log('Fit profile added successfully:', newProfile);
      }
    } catch (err) {
      console.error('Failed to add fit profile:', err);
    }
  };

  const updateFitProfile = async (userId: string, profile: Partial<Omit<FitProfile, 'userId' | 'createdAt'>>) => {
    try {
      const { error } = await supabase
        .from('fit_profiles')
        .update({
          preferred_size: profile.preferredSize,
          body_type: profile.bodyType,
          height: profile.height,
          weight: profile.weight,
          preferred_fit: profile.preferredFit,
          notes: profile.notes || ''
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating fit profile:', error);
      } else {
        setFitProfiles(prev =>
          prev.map(p =>
            p.userId === userId ? { ...p, ...profile } : p
          )
        );
        await getFitProfiles();
      }
    } catch (err) {
      console.error('Failed to update fit profile:', err);
    }
  };

  // Admin Delete Operations for Fit Profiles
  const deleteFitProfile = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('fit_profiles')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting fit profile:', error);
      } else {
        setFitProfiles(prev => prev.filter(profile => profile.userId !== userId));
      }
    } catch (err) {
      console.error('Failed to delete fit profile:', err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        users,
        orders,
        cartItems,
        products,
        fitProfiles,
        favorites,
        currentUser,
        isAdmin,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        createOrder,
        setCurrentUser,
        setIsAdmin,
        updateOrderStatus,
        saveFitProfile,
        // Favorite/Wishlist operations
        toggleFavorite,
        isFavorite,
        removeFavorite,
        clearFavorites,
        // Fit Profile operations
        getFitProfiles,
        addFitProfile,
        updateFitProfile,
        deleteFitProfile,
        // User authentication
        loginUser,
        registerUser,
        logoutUser,
        // Admin CRUD
        addProduct,
        updateProduct,
        deleteProduct,
        deleteAllProducts,
        addUser,
        updateUser,
        deleteUser,
        deleteOrder
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
}
