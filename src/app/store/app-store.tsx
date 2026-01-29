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
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addUser: (user: Omit<User, 'id' | 'joinedDate'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  deleteOrder: (id: string) => void;
  deleteFitProfile: (userId: string) => void;
}

// Mock data
const mockUsers: User[] = [];

const mockProducts: Product[] = [
  { id: '1', name: 'Tailored Wool Blazer', price: 495, image: 'https://images.unsplash.com/photo-1762417421091-1b4e24facc62?w=400', fabric: 'Wool', fit: 'Regular Fit', category: 'Outerwear', size: ['S', 'M', 'L', 'XL'] },
  { id: '2', name: 'Silk Evening Dress', price: 675, image: 'https://images.unsplash.com/photo-1562182856-e39faab686d7?w=400', fabric: 'Silk', fit: 'Slim Fit', category: 'Dresses', size: ['XS', 'S', 'M', 'L'] },
  { id: '3', name: 'Cashmere Roll Neck', price: 385, image: 'https://images.unsplash.com/photo-1603906650843-b58e94d9df4d?w=400', fabric: 'Cashmere', fit: 'Regular Fit', category: 'Knitwear', size: ['S', 'M', 'L', 'XL'] },
  { id: '4', name: 'Cotton Oxford Shirt', price: 145, image: 'https://images.unsplash.com/photo-1760545183001-af3b64500b0d?w=400', fabric: 'Cotton', fit: 'Slim Fit', category: 'Shirts', size: ['S', 'M', 'L', 'XL', 'XXL'] },
  { id: '5', name: 'Wool Dress Trousers', price: 225, image: 'https://images.unsplash.com/photo-1570653321427-0e4c0c40bb84?w=400', fabric: 'Wool', fit: 'Regular Fit', category: 'Trousers', size: ['30', '32', '34', '36', '38'] },
  { id: '6', name: 'Cashmere Overcoat', price: 895, image: 'https://images.unsplash.com/photo-1577909687863-91bb3ec12db5?w=400', fabric: 'Cashmere', fit: 'Regular Fit', category: 'Outerwear', size: ['M', 'L', 'XL'] },
  { id: '7', name: 'Linen Blazer', price: 425, image: 'https://images.unsplash.com/photo-1719518411339-5158cea86caf?w=400', fabric: 'Linen', fit: 'Relaxed Fit', category: 'Outerwear', size: ['S', 'M', 'L', 'XL'] },
  { id: '8', name: 'Merino Wool Cardigan', price: 295, image: 'https://images.unsplash.com/photo-1767898498160-b4043d7269da?w=400', fabric: 'Wool', fit: 'Regular Fit', category: 'Knitwear', size: ['S', 'M', 'L', 'XL'] },
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Handle automatic logout when browser closes
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clear current user when browser closes
      localStorage.removeItem('currentUser');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

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
  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev =>
      prev.map(product =>
        product.id === id ? { ...product, ...updates } : product
      )
    );
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
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
