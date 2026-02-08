import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
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
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
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
  userId: string;
  height: string;
  weight: string;
  chest: string;
  waist: string;
  hips: string;
  preferredFit: 'slim' | 'regular' | 'relaxed';
  createdAt: string;
}

interface AppState {
  users: User[];
  orders: Order[];
  cartItems: CartItem[];
  products: Product[];
  fitProfiles: FitProfile[];
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
  // User authentication
  loginUser: (email: string, password: string) => Promise<boolean>;
  registerUser: (name: string, email: string, password: string) => Promise<boolean>;
  logoutUser: () => Promise<void>;
  // Admin CRUD operations
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addUser: (user: Omit<User, 'id' | 'joinedDate'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  deleteOrder: (id: string) => void;
  deleteFitProfile: (userId: string) => void;
}

// Mock data
const mockUsers: User[] = [];

const mockProducts: Product[] = [
  { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Tailored Wool Blazer', price: 495, image: 'https://images.unsplash.com/photo-1762417421091-1b4e24facc62?w=400', fabric: 'Wool', fit: 'Regular Fit', category: 'Outerwear', size: ['S', 'M', 'L', 'XL'] },
  { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Silk Evening Dress', price: 675, image: 'https://images.unsplash.com/photo-1562182856-e39faab686d7?w=400', fabric: 'Silk', fit: 'Slim Fit', category: 'Dresses', size: ['XS', 'S', 'M', 'L'] },
  { id: '550e8400-e29b-41d4-a716-446655440003', name: 'Cashmere Roll Neck', price: 385, image: 'https://images.unsplash.com/photo-1603906650843-b58e94d9df4d?w=400', fabric: 'Cashmere', fit: 'Regular Fit', category: 'Knitwear', size: ['S', 'M', 'L', 'XL'] },
  { id: '550e8400-e29b-41d4-a716-446655440004', name: 'Cotton Oxford Shirt', price: 145, image: 'https://images.unsplash.com/photo-1760545183001-af3b64500b0d?w=400', fabric: 'Cotton', fit: 'Slim Fit', category: 'Shirts', size: ['S', 'M', 'L', 'XL', 'XXL'] },
  { id: '550e8400-e29b-41d4-a716-446655440005', name: 'Wool Dress Trousers', price: 225, image: 'https://images.unsplash.com/photo-1570653321427-0e4c0c40bb84?w=400', fabric: 'Wool', fit: 'Regular Fit', category: 'Trousers', size: ['30', '32', '34', '36', '38'] },
  { id: '550e8400-e29b-41d4-a716-446655440006', name: 'Cashmere Overcoat', price: 895, image: 'https://images.unsplash.com/photo-1577909687863-91bb3ec12db5?w=400', fabric: 'Cashmere', fit: 'Regular Fit', category: 'Outerwear', size: ['M', 'L', 'XL'] },
  { id: '550e8400-e29b-41d4-a716-446655440007', name: 'Linen Blazer', price: 425, image: 'https://images.unsplash.com/photo-1719518411339-5158cea86caf?w=400', fabric: 'Linen', fit: 'Relaxed Fit', category: 'Outerwear', size: ['S', 'M', 'L', 'XL'] },
  { id: '550e8400-e29b-41d4-a716-446655440008', name: 'Merino Wool Cardigan', price: 295, image: 'https://images.unsplash.com/photo-1767898498160-b4043d7269da?w=400', fabric: 'Wool', fit: 'Regular Fit', category: 'Knitwear', size: ['S', 'M', 'L', 'XL'] },
];

const mockOrders: Order[] = [];

const mockFitProfiles: FitProfile[] = [];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [fitProfiles, setFitProfiles] = useState<FitProfile[]>(mockFitProfiles);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // Restore session from localStorage on mount
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAdmin, setIsAdmin] = useState(false);

  // Set up Supabase auth listener on mount
  useEffect(() => {
    // First restore from localStorage
    const saved = localStorage.getItem('currentUser');
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
        localStorage.setItem('currentUser', JSON.stringify(user));
      } else if (event === 'SIGNED_OUT' || !session) {
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  // Persist current user to localStorage when it changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  // Fetch products from Supabase on mount
  useEffect(() => {
    fetchProductsFromSupabase();
    // Set up auto-refresh every 3 seconds to catch admin changes immediately
    const interval = setInterval(fetchProductsFromSupabase, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchProductsFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching products from Supabase:', error);
        return;
      }

      if (data && data.length > 0) {
        // Convert Supabase products to app format
        const supabaseProducts = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.image_url,
          fabric: p.fabric,
          fit: p.fit,
          category: p.category,
          size: p.sizes
        }));
        
        // Use ONLY Supabase products, don't mix with mock products
        setProducts(supabaseProducts);
      } else {
        // If no products in Supabase, use mock products
        setProducts(mockProducts);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      // Keep mock products as fallback
      setProducts(mockProducts);
    }
  };

  const addToCart = (product: Product, size: string, quantity: number) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedSize === size);
      if (existing) {
        return prev.map(item =>
          item.id === product.id && item.selectedSize === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, selectedSize: size, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const createOrder = (): Order | null => {
    if (!currentUser || cartItems.length === 0) return null;
    
    const newOrder: Order = {
      id: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
      userId: currentUser.id,
      items: [...cartItems],
      total: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
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
            is_active: true
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
        // Add the product with Supabase ID
        const newProduct: Product = {
          name: data[0].name,
          price: data[0].price,
          image: data[0].image_url,
          fabric: data[0].fabric,
          fit: data[0].fit,
          category: data[0].category,
          size: data[0].sizes,
          id: data[0].id
        };
        setProducts(prev => [...prev, newProduct]);
        // Refresh products to ensure all data is synced
        await fetchProductsFromSupabase();
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
          sizes: updates.size
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating product in Supabase:', error);
      } else {
        // Refresh products after successful update
        await fetchProductsFromSupabase();
        return;
      }
      
      // Update in store as fallback
      setProducts(prev =>
        prev.map(product =>
          product.id === id ? { ...product, ...updates } : product
        )
      );
    } catch (err) {
      console.error('Failed to update product:', err);
      // Fallback to store update
      setProducts(prev =>
        prev.map(product =>
          product.id === id ? { ...product, ...updates } : product
        )
      );
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      // Delete from Supabase (soft delete - set is_active to false)
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        console.error('Error deleting product from Supabase:', error);
      } else {
        // Refresh products after successful delete
        await fetchProductsFromSupabase();
        return;
      }
      
      // Delete from store as fallback
      setProducts(prev => prev.filter(product => product.id !== id));
    } catch (err) {
      console.error('Failed to delete product:', err);
      // Fallback to store delete
      setProducts(prev => prev.filter(product => product.id !== id));
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

  // Admin Delete Operations for Fit Profiles
  const deleteFitProfile = (userId: string) => {
    setFitProfiles(prev => prev.filter(profile => profile.userId !== userId));
  };

  return (
    <AppContext.Provider
      value={{
        users,
        orders,
        cartItems,
        products,
        fitProfiles,
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
        // User authentication
        loginUser,
        registerUser,
        logoutUser,
        // Admin CRUD
        addProduct,
        updateProduct,
        deleteProduct,
        addUser,
        updateUser,
        deleteUser,
        deleteOrder,
        deleteFitProfile
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
