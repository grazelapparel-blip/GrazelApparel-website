import { useState, useEffect } from 'react';
import {
  Users,
  ShoppingCart,
  Package,
  Ruler,
  BarChart3,
  Search,
  ArrowLeft,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  Plus,
  X,
  Save,
  Tag,
  Settings,
  TrendingUp,
  RotateCw,
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import { useAppStore, User, Order, FitProfile, Product } from '../store/app-store';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface AdminDashboardProps {
  onBack: () => void;
}

type TabType = 'overview' | 'users' | 'orders' | 'products' | 'stock' | 'returns' | 'return-policy' | 'packaging' | 'navigation' | 'analytics';

// Modal Component
function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4 rounded-lg shadow-xl">
        <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-[var(--font-serif)] text-[18px] text-[var(--charcoal)]">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// Packaging Options Component
function PackagingManager() {
  const [packagingOptions, setPackagingOptions] = useState([
    { id: '1', name: 'Simple Package', description: 'Basic white packaging', price: 0 },
    { id: '2', name: 'Elegant Packaging', description: 'Premium white box with tissue paper', price: 50 },
    { id: '3', name: 'Premium Package', description: 'Luxury box with ribbon and card', price: 150 },
    { id: '4', name: 'Gift Package', description: 'Special gift wrapping with greeting card', price: 200 }
  ]);
  const [showPackagingModal, setShowPackagingModal] = useState(false);
  const [editingPackaging, setEditingPackaging] = useState<any>(null);
  const [packagingForm, setPackagingForm] = useState({ name: '', description: '', price: '' });

  const handleAddPackaging = () => {
    setEditingPackaging(null);
    setPackagingForm({ name: '', description: '', price: '' });
    setShowPackagingModal(true);
  };

  const handleSavePackaging = () => {
    if (!packagingForm.name || !packagingForm.price) {
      alert('Please fill in all fields');
      return;
    }
    if (editingPackaging) {
      setPackagingOptions(packagingOptions.map(p =>
        p.id === editingPackaging.id
          ? { ...p, name: packagingForm.name, description: packagingForm.description, price: Number(packagingForm.price) }
          : p
      ));
    } else {
      setPackagingOptions([...packagingOptions, {
        id: Date.now().toString(),
        name: packagingForm.name,
        description: packagingForm.description,
        price: Number(packagingForm.price)
      }]);
    }
    setShowPackagingModal(false);
  };

  const handleEditPackaging = (packaging: any) => {
    setEditingPackaging(packaging);
    setPackagingForm({
      name: packaging.name,
      description: packaging.description,
      price: packaging.price.toString()
    });
    setShowPackagingModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-[var(--font-serif)] text-[20px] text-[var(--charcoal)]">Packaging Options</h2>
        <button
          onClick={handleAddPackaging}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--crimson)] text-white text-[13px] hover:opacity-90"
        >
          <Plus size={16} /> Add Packaging
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {packagingOptions.map((packaging) => (
          <div key={packaging.id} className="bg-white border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-[15px] font-medium text-[var(--charcoal)]">{packaging.name}</h3>
                <p className="text-[13px] text-gray-500 mt-1">{packaging.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditPackaging(packaging)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <Edit2 size={16} className="text-gray-600" />
                </button>
                <button
                  onClick={() => setPackagingOptions(packagingOptions.filter(p => p.id !== packaging.id))}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <Trash2 size={16} className="text-red-600" />
                </button>
              </div>
            </div>
            <p className="text-[18px] font-semibold text-[var(--crimson)]">₹{packaging.price}</p>
          </div>
        ))}
      </div>

      <Modal isOpen={showPackagingModal} onClose={() => setShowPackagingModal(false)} title={editingPackaging ? 'Edit Packaging' : 'Add Packaging'}>
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-2">Packaging Name</label>
            <input
              type="text"
              value={packagingForm.name}
              onChange={(e) => setPackagingForm({ ...packagingForm, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 text-[14px] focus:outline-none focus:border-[var(--crimson)]"
              placeholder="e.g., Premium Package"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={packagingForm.description}
              onChange={(e) => setPackagingForm({ ...packagingForm, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 text-[14px] focus:outline-none focus:border-[var(--crimson)] h-20"
              placeholder="Describe this packaging option"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-2">Price (₹)</label>
            <input
              type="number"
              value={packagingForm.price}
              onChange={(e) => setPackagingForm({ ...packagingForm, price: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 text-[14px] focus:outline-none focus:border-[var(--crimson)]"
              placeholder="0"
              min="0"
            />
          </div>
          <button
            onClick={handleSavePackaging}
            className="w-full px-4 py-2 bg-[var(--crimson)] text-white text-[14px] hover:opacity-90 mt-4"
          >
            <Save size={16} className="inline mr-2" /> Save Packaging
          </button>
        </div>
      </Modal>
    </div>
  );
}

// Stock Management Component
function StockManagement({ products }: { products: Product[] }) {
  const [stock, setStock] = useState<{ [key: string]: { available: number; sold: number; reserved: number } }>({});
  const [editingStock, setEditingStock] = useState<string | null>(null);
  const [stockForm, setStockForm] = useState({ available: '', sold: '', reserved: '' });

  const handleEditStock = (productId: string) => {
    const current = stock[productId] || { available: 0, sold: 0, reserved: 0 };
    setEditingStock(productId);
    setStockForm({
      available: current.available.toString(),
      sold: current.sold.toString(),
      reserved: current.reserved.toString()
    });
  };

  const handleSaveStock = (productId: string) => {
    setStock({
      ...stock,
      [productId]: {
        available: Number(stockForm.available),
        sold: Number(stockForm.sold),
        reserved: Number(stockForm.reserved)
      }
    });
    setEditingStock(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="font-[var(--font-serif)] text-[20px] text-[var(--charcoal)]">Stock Management</h2>

      <div className="bg-white border border-gray-200 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Product</th>
              <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Available</th>
              <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Reserved</th>
              <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Sold</th>
              <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => {
              const s = stock[product.id] || { available: 0, sold: 0, reserved: 0 };
              const forSale = s.available - s.reserved;
              const status = forSale <= 0 ? 'Out of Stock' : forSale <= 10 ? 'Low Stock' : 'In Stock';
              const statusColor = forSale <= 0 ? 'bg-red-100 text-red-800' : forSale <= 10 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800';

              if (editingStock === product.id) {
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-[14px]">{product.name}</td>
                    <td className="px-6 py-4"><input type="number" value={stockForm.available} onChange={(e) => setStockForm({ ...stockForm, available: e.target.value })} className="w-20 px-2 py-1 border border-gray-200 text-[13px]" /></td>
                    <td className="px-6 py-4"><input type="number" value={stockForm.reserved} onChange={(e) => setStockForm({ ...stockForm, reserved: e.target.value })} className="w-20 px-2 py-1 border border-gray-200 text-[13px]" /></td>
                    <td className="px-6 py-4"><input type="number" value={stockForm.sold} onChange={(e) => setStockForm({ ...stockForm, sold: e.target.value })} className="w-20 px-2 py-1 border border-gray-200 text-[13px]" /></td>
                    <td className="px-6 py-4" colSpan={2} className="space-x-2">
                      <button onClick={() => handleSaveStock(product.id)} className="px-3 py-1 bg-green-600 text-white text-[12px] hover:bg-green-700">Save</button>
                      <button onClick={() => setEditingStock(null)} className="px-3 py-1 bg-gray-300 text-gray-800 text-[12px] hover:bg-gray-400">Cancel</button>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-[14px] font-medium">{product.name}</td>
                  <td className="px-6 py-4 text-[14px]">{s.available}</td>
                  <td className="px-6 py-4 text-[14px]">{s.reserved}</td>
                  <td className="px-6 py-4 text-[14px]">{s.sold}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 text-[12px] font-medium rounded ${statusColor}`}>
                      {status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEditStock(product.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Edit2 size={16} className="text-gray-600" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Return Policy Settings Component
function ReturnPolicySettings({ 
  returnPolicyDays, 
  onSave 
}: { 
  returnPolicyDays: number; 
  onSave: (days: number) => void;
}) {
  const [policyDays, setPolicyDays] = useState(returnPolicyDays);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    onSave(policyDays);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      <h2 className="font-[var(--font-serif)] text-[20px] text-[var(--charcoal)]">Return Policy Settings</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-[14px] font-medium text-gray-700 mb-2">
            Return Window (Days)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="number"
              min="1"
              max="365"
              value={policyDays}
              onChange={(e) => setPolicyDays(Math.max(1, parseInt(e.target.value) || 30))}
              className="px-4 py-2 border border-gray-200 rounded-lg text-[14px] w-24"
            />
            <span className="text-[14px] text-gray-600">days from delivery</span>
          </div>
          <p className="text-[12px] text-gray-500 mt-2">
            Customers can request returns within this period from when their order is delivered.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-[13px] text-blue-800">
            <strong>Current Policy:</strong> Customers have {policyDays} days to request a return from delivery date.
          </p>
        </div>

        <div>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-[var(--charcoal)] text-white rounded-lg font-medium text-[14px] hover:bg-gray-800 transition flex items-center gap-2"
          >
            <Save size={16} />
            Save Policy
          </button>
          {isSaved && (
            <p className="text-[12px] text-green-600 mt-2">✓ Return policy updated successfully</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Returns Management Component
function ReturnsManagement({ 
  orders, 
  returns,
  onUpdateReturnStatus,
  isOrderReturnable,
  getReturnDeadline
}: { 
  orders: Order[]; 
  returns: any[];
  onUpdateReturnStatus: (returnId: string, status: string, adminNotes?: string) => void;
  isOrderReturnable: (orderId: string) => boolean;
  getReturnDeadline: (orderDate: string) => Date;
}) {
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [showModal, setShowModal] = useState(false);

  const getOrderNumber = (orderId: string) => {
    return orders.find(o => o.id === orderId)?.orderNumber || orderId;
  };

  const handleStatusChange = (returnId: string, newStatus: string) => {
    onUpdateReturnStatus(returnId, newStatus, adminNotes);
    setShowModal(false);
    setAdminNotes('');
    setSelectedReturn(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-[var(--font-serif)] text-[20px] text-[var(--charcoal)]">Returns Management</h2>
      </div>

      {returns.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <RotateCw size={32} className="mx-auto text-gray-400 mb-2" />
          <p className="text-[14px] text-gray-600">No return requests yet</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 overflow-x-auto rounded-lg">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Return ID</th>
                <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Reason</th>
                <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Requested</th>
                <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {returns.map((ret) => (
                <tr key={ret.id}>
                  <td className="px-6 py-4 text-[14px] font-medium">{ret.id}</td>
                  <td className="px-6 py-4 text-[14px]">{getOrderNumber(ret.orderId)}</td>
                  <td className="px-6 py-4 text-[14px]">{ret.reason}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 text-[12px] font-medium rounded ${
                      ret.status === 'approved' ? 'bg-green-100 text-green-800' :
                      ret.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      ret.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {ret.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[12px] text-gray-500">
                    {new Date(ret.requestedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-[14px]">
                    <button
                      onClick={() => {
                        setSelectedReturn(ret);
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 font-medium text-[12px]"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal 
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedReturn(null);
          setAdminNotes('');
        }}
        title="Manage Return Request"
      >
        {selectedReturn && (
          <div className="space-y-4">
            <div>
              <label className="text-[13px] font-medium text-gray-700">Return ID</label>
              <p className="text-[14px] text-gray-900">{selectedReturn.id}</p>
            </div>
            <div>
              <label className="text-[13px] font-medium text-gray-700">Reason</label>
              <p className="text-[14px] text-gray-900">{selectedReturn.reason}</p>
            </div>
            <div>
              <label className="text-[13px] font-medium text-gray-700 block mb-2">Status</label>
              <select 
                value={selectedReturn.status}
                onChange={(e) => setSelectedReturn({...selectedReturn, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[14px]"
              >
                <option value="requested">Requested</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="shipped">Shipped</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="text-[13px] font-medium text-gray-700 block mb-2">Admin Notes</label>
              <textarea 
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes about this return..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[14px]"
                rows={4}
              />
            </div>
            <button
              onClick={() => handleStatusChange(selectedReturn.id, selectedReturn.status)}
              className="w-full px-4 py-2 bg-[var(--charcoal)] text-white rounded-lg font-medium text-[14px] hover:bg-gray-800"
            >
              Update Return Status
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}

// Navigation Control Component
function NavigationControl() {
  const [menuItems, setMenuItems] = useState([
    { id: '1', label: 'Men', path: '/men', category: 'main', active: true, order: 1 },
    { id: '2', label: 'Women', path: '/women', category: 'main', active: true, order: 2 },
    { id: '3', label: 'Essentials', path: '/essentials', category: 'main', active: true, order: 3 },
    { id: '4', label: 'New In', path: '/new-in', category: 'main', active: true, order: 4 },
    { id: '5', label: 'Collections', path: '/collections', category: 'collection', active: true, order: 5 }
  ]);
  const [editingMenu, setEditingMenu] = useState<string | null>(null);
  const [menuForm, setMenuForm] = useState({ label: '', path: '', category: 'main', active: true });
  const [showMenuModal, setShowMenuModal] = useState(false);

  const handleAddMenu = () => {
    setEditingMenu(null);
    setMenuForm({ label: '', path: '', category: 'main', active: true });
    setShowMenuModal(true);
  };

  const handleSaveMenu = () => {
    if (!menuForm.label || !menuForm.path) {
      alert('Please fill in all fields');
      return;
    }
    if (editingMenu) {
      setMenuItems(menuItems.map(m =>
        m.id === editingMenu
          ? { ...m, ...menuForm }
          : m
      ));
    } else {
      setMenuItems([...menuItems, {
        id: Date.now().toString(),
        ...menuForm,
        order: menuItems.length + 1
      }]);
    }
    setShowMenuModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-[var(--font-serif)] text-[20px] text-[var(--charcoal)]">Website Navigation Control</h2>
        <button
          onClick={handleAddMenu}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--crimson)] text-white text-[13px] hover:opacity-90"
        >
          <Plus size={16} /> Add Menu Item
        </button>
      </div>

      <div className="bg-white border border-gray-200 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Label</th>
              <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Path</th>
              <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Order</th>
              <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Active</th>
              <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {menuItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-[14px] font-medium">{item.label}</td>
                <td className="px-6 py-4 text-[14px] text-gray-600">{item.path}</td>
                <td className="px-6 py-4 text-[14px]">{item.category}</td>
                <td className="px-6 py-4 text-[14px]">{item.order}</td>
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={item.active}
                    onChange={(e) => setMenuItems(menuItems.map(m =>
                      m.id === item.id ? { ...m, active: e.target.checked } : m
                    ))}
                    className="w-4 h-4"
                  />
                </td>
                <td className="px-6 py-4 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingMenu(item.id);
                      setMenuForm(item);
                      setShowMenuModal(true);
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Edit2 size={16} className="text-gray-600" />
                  </button>
                  <button
                    onClick={() => setMenuItems(menuItems.filter(m => m.id !== item.id))}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showMenuModal} onClose={() => setShowMenuModal(false)} title={editingMenu ? 'Edit Menu Item' : 'Add Menu Item'}>
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-2">Label</label>
            <input
              type="text"
              value={menuForm.label}
              onChange={(e) => setMenuForm({ ...menuForm, label: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 text-[14px] focus:outline-none focus:border-[var(--crimson)]"
              placeholder="e.g., Men"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-2">Path</label>
            <input
              type="text"
              value={menuForm.path}
              onChange={(e) => setMenuForm({ ...menuForm, path: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 text-[14px] focus:outline-none focus:border-[var(--crimson)]"
              placeholder="e.g., /men"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-2">Category</label>
            <select
              value={menuForm.category}
              onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 text-[14px] focus:outline-none focus:border-[var(--crimson)]"
            >
              <option value="main">Main</option>
              <option value="collection">Collection</option>
              <option value="info">Info</option>
              <option value="other">Other</option>
            </select>
          </div>
          <button
            onClick={handleSaveMenu}
            className="w-full px-4 py-2 bg-[var(--crimson)] text-white text-[14px] hover:opacity-90 mt-4"
          >
            <Save size={16} className="inline mr-2" /> Save Menu Item
          </button>
        </div>
      </Modal>
    </div>
  );
}

// Analytics Component
function Analytics({ orders, users }: { orders: Order[]; users: User[] }) {
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const frequentUsers = users.filter(u => orders.filter(o => o.userId === u.id).length > 1);

  return (
    <div className="space-y-6">
      <h2 className="font-[var(--font-serif)] text-[20px] text-[var(--charcoal)]">Analytics & Insights</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[13px] text-gray-500 uppercase tracking-wide">Total Revenue</span>
            <TrendingUp size={20} className="text-[var(--crimson)]" />
          </div>
          <p className="font-[var(--font-serif)] text-3xl text-[var(--charcoal)]">₹{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[13px] text-gray-500 uppercase tracking-wide">Avg Order Value</span>
            <ShoppingCart size={20} className="text-[var(--crimson)]" />
          </div>
          <p className="font-[var(--font-serif)] text-3xl text-[var(--charcoal)]">₹{averageOrderValue.toFixed(0)}</p>
        </div>
        <div className="bg-white p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[13px] text-gray-500 uppercase tracking-wide">Frequent Users</span>
            <Users size={20} className="text-[var(--crimson)]" />
          </div>
          <p className="font-[var(--font-serif)] text-3xl text-[var(--charcoal)]">{frequentUsers.length}</p>
          <p className="text-[12px] text-gray-500 mt-2">Users with 2+ orders</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 p-6">
        <h3 className="font-[var(--font-serif)] text-[16px] text-[var(--charcoal)] mb-4">Frequent Customers</h3>
        <div className="space-y-4">
          {frequentUsers.slice(0, 10).map((user) => {
            const userOrders = orders.filter(o => o.userId === user.id);
            const spent = userOrders.reduce((sum, o) => sum + o.total, 0);
            return (
              <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded">
                <div>
                  <p className="text-[14px] font-medium text-[var(--charcoal)]">{user.name}</p>
                  <p className="text-[12px] text-gray-500">{user.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-[14px] font-medium">₹{spent.toFixed(0)}</p>
                  <p className="text-[12px] text-gray-500">{userOrders.length} orders</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function AdminDashboardEnhanced({ onBack }: AdminDashboardProps) {
  const {
    users, orders, products,
    updateOrderStatus,
    addProduct, updateProduct, deleteProduct,
    addUser, updateUser, deleteUser,
    deleteOrder,
    // Return management
    returns: storeReturns,
    adminSettings,
    setReturnPolicy,
    getReturnPolicy,
    getAllReturns,
    updateReturnStatus,
    isOrderReturnable,
    getReturnDeadline,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [productForm, setProductForm] = useState({
    name: '', price: '', image: '', fabric: '', fit: '', category: '', size: '', gender: '', isEssential: false, isHighlight: false, isTop: false, isBottom: false, offerPercentage: '', returnDays: '30', season: '', festival: ''
  });

  const [userForm, setUserForm] = useState({
    name: '', email: '', phone: ''
  });

  // Product handlers
  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductForm({ name: '', price: '', image: '', fabric: '', fit: '', category: '', size: '', gender: '', isEssential: false, isHighlight: false, isTop: false, isBottom: false, offerPercentage: '', returnDays: '30', season: '', festival: '' });
    setShowProductModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: String(product.price),
      image: product.image,
      fabric: product.fabric,
      fit: product.fit,
      category: product.category || '',
      size: product.size?.join(', ') || '',
      gender: product.gender || '',
      isEssential: product.isEssential || false,
      isHighlight: product.isHighlight || false,
      isTop: product.isTop || false,
      isBottom: product.isBottom || false,
      offerPercentage: String(product.offerPercentage || ''),
      returnDays: String(product.returnDays || '30'),
      season: product.season || '',
      festival: product.festival || ''
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async () => {
    const productData = {
      name: productForm.name,
      price: Number(productForm.price),
      image: productForm.image || 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400',
      fabric: productForm.fabric,
      fit: productForm.fit,
      category: productForm.category,
      size: productForm.size.split(',').map(s => s.trim()).filter(Boolean),
      gender: productForm.gender,
      isEssential: productForm.isEssential,
      isHighlight: productForm.isHighlight,
      isTop: productForm.isTop,
      isBottom: productForm.isBottom,
      offerPercentage: Number(productForm.offerPercentage) || 0,
      returnDays: Math.max(1, Number(productForm.returnDays) || 30),
      season: productForm.season,
      festival: productForm.festival,
      createdAt: editingProduct?.createdAt || new Date().toISOString()
    };

    if (editingProduct) {
      await updateProduct(editingProduct.id, productData);
    } else {
      await addProduct(productData);
    }
    setShowProductModal(false);
  };

  // User handlers
  const handleAddUser = () => {
    setEditingUser(null);
    setUserForm({ name: '', email: '', phone: '' });
    setShowUserModal(true);
  };

  const handleSaveUser = () => {
    if (!userForm.name || !userForm.email) {
      alert('Please fill in required fields');
      return;
    }
    const userData = {
      name: userForm.name,
      email: userForm.email,
      phone: userForm.phone || undefined,
      address: undefined
    };

    if (editingUser) {
      updateUser(editingUser.id, userData);
    } else {
      addUser(userData);
    }
    setShowUserModal(false);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrders = orders.filter(o =>
    o.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: BarChart3 },
    { id: 'users' as TabType, label: 'Users', icon: Users },
    { id: 'orders' as TabType, label: 'Orders', icon: ShoppingCart },
    { id: 'products' as TabType, label: 'Products', icon: Package },
    { id: 'stock' as TabType, label: 'Stock', icon: Truck },
    { id: 'packaging' as TabType, label: 'Packaging', icon: Tag },
    { id: 'returns' as TabType, label: 'Returns', icon: RotateCw },
    { id: 'return-policy' as TabType, label: 'Return Policy', icon: Settings },
    { id: 'navigation' as TabType, label: 'Navigation', icon: Settings },
    { id: 'analytics' as TabType, label: 'Analytics', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-[var(--charcoal)] hover:text-[var(--crimson)] transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="text-[14px]">Back</span>
              </button>
              <div className="h-6 w-px bg-gray-200" />
              <h1 className="font-[var(--font-serif)] text-[22px] text-[var(--charcoal)]">Admin Dashboard</h1>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 pl-10 pr-4 w-64 border border-gray-200 text-[14px] focus:outline-none focus:border-[var(--crimson)]"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto px-6 py-8">
        {/* Tabs */}
        <nav className="flex gap-2 mb-8 border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 text-[14px] font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[var(--crimson)] text-[var(--crimson)]'
                  : 'border-transparent text-gray-500 hover:text-[var(--charcoal)]'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[13px] text-gray-500 uppercase">Revenue</span>
                  <TrendingUp size={20} className="text-[var(--crimson)]" />
                </div>
                <p className="font-[var(--font-serif)] text-3xl text-[var(--charcoal)]">₹{orders.reduce((sum, o) => sum + o.total, 0).toLocaleString()}</p>
              </div>
              <div className="bg-white p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[13px] text-gray-500 uppercase">Orders</span>
                  <ShoppingCart size={20} className="text-[var(--crimson)]" />
                </div>
                <p className="font-[var(--font-serif)] text-3xl text-[var(--charcoal)]">{orders.length}</p>
              </div>
              <div className="bg-white p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[13px] text-gray-500 uppercase">Users</span>
                  <Users size={20} className="text-[var(--crimson)]" />
                </div>
                <p className="font-[var(--font-serif)] text-3xl text-[var(--charcoal)]">{users.length}</p>
              </div>
              <div className="bg-white p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[13px] text-gray-500 uppercase">Products</span>
                  <Package size={20} className="text-[var(--crimson)]" />
                </div>
                <p className="font-[var(--font-serif)] text-3xl text-[var(--charcoal)]">{products.length}</p>
              </div>
            </div>

            <Analytics orders={orders} users={users} />
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-[var(--font-serif)] text-[18px] text-[var(--charcoal)]">Users ({filteredUsers.length})</h2>
              <button
                onClick={handleAddUser}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--crimson)] text-white text-[13px] hover:opacity-90"
              >
                <Plus size={16} /> Add User
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Orders</th>
                    <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Spent</th>
                    <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => {
                    const userOrders = orders.filter(o => o.userId === user.id);
                    const spent = userOrders.reduce((sum, o) => sum + o.total, 0);
                    return (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-[14px] font-medium">{user.name}</td>
                        <td className="px-6 py-4 text-[14px] text-gray-600">{user.email}</td>
                        <td className="px-6 py-4 text-[14px]">{userOrders.length}</td>
                        <td className="px-6 py-4 text-[14px] font-medium">₹{spent.toFixed(0)}</td>
                        <td className="px-6 py-4 flex items-center gap-2">
                          <button onClick={() => { setEditingUser(user); setUserForm({ name: user.name, email: user.email, phone: user.phone || '' }); setShowUserModal(true); }} className="p-1 hover:bg-gray-100 rounded"><Edit2 size={16} className="text-gray-600" /></button>
                          <button onClick={() => { if (confirm('Delete user?')) deleteUser(user.id); }} className="p-1 hover:bg-gray-100 rounded"><Trash2 size={16} className="text-red-600" /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="font-[var(--font-serif)] text-[18px] text-[var(--charcoal)]">Orders ({filteredOrders.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Order</th>
                    <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.map((order) => {
                    const user = users.find(u => u.id === order.userId);
                    return (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-[14px] font-medium">{order.id}</td>
                        <td className="px-6 py-4 text-[14px]">{user?.name}</td>
                        <td className="px-6 py-4 text-[14px] font-medium">₹{order.total.toFixed(0)}</td>
                        <td className="px-6 py-4">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                            className="px-2 py-1 border border-gray-200 text-[12px] rounded"
                          >
                            <option value="ordered">Ordered</option>
                            <option value="acknowledged">Acknowledged</option>
                            <option value="shipping">Shipping</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <button onClick={() => { if (confirm('Delete order?')) deleteOrder(order.id); }} className="p-1 hover:bg-gray-100 rounded"><Trash2 size={16} className="text-red-600" /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="bg-white border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-[var(--font-serif)] text-[18px] text-[var(--charcoal)]">Products ({filteredProducts.length})</h2>
              <button
                onClick={handleAddProduct}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--crimson)] text-white text-[13px] hover:opacity-90"
              >
                <Plus size={16} /> Add Product
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Sizes</th>
                    <th className="px-6 py-3 text-left text-[12px] font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-[14px] font-medium">{product.name}</td>
                      <td className="px-6 py-4 text-[14px]">{product.category}</td>
                      <td className="px-6 py-4 text-[14px] font-medium">₹{product.price}</td>
                      <td className="px-6 py-4 text-[14px]">{product.size?.join(', ')}</td>
                      <td className="px-6 py-4 flex items-center gap-2">
                        <button onClick={() => handleEditProduct(product)} className="p-1 hover:bg-gray-100 rounded"><Edit2 size={16} className="text-gray-600" /></button>
                        <button onClick={() => { if (confirm('Delete product?')) deleteProduct(product.id); }} className="p-1 hover:bg-gray-100 rounded"><Trash2 size={16} className="text-red-600" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stock Tab */}
        {activeTab === 'stock' && <StockManagement products={products} />}

        {/* Packaging Tab */}
        {activeTab === 'packaging' && <PackagingManager />}

        {/* Returns Tab */}
        {activeTab === 'returns' && (
          <ReturnsManagement 
            orders={orders}
            returns={getAllReturns()}
            onUpdateReturnStatus={updateReturnStatus}
            isOrderReturnable={isOrderReturnable}
            getReturnDeadline={getReturnDeadline}
          />
        )}

        {/* Return Policy Tab */}
        {activeTab === 'return-policy' && (
          <ReturnPolicySettings 
            returnPolicyDays={adminSettings.returnPolicyDays}
            onSave={setReturnPolicy}
          />
        )}

        {/* Navigation Tab */}
        {activeTab === 'navigation' && <NavigationControl />}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && <Analytics orders={orders} users={users} />}
      </div>

      {/* Product Modal */}
      <Modal isOpen={showProductModal} onClose={() => setShowProductModal(false)} title={editingProduct ? 'Edit Product' : 'Add Product'}>
        <div className="space-y-4">
          <input type="text" placeholder="Product Name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className="w-full px-4 py-2 border border-gray-200 text-[14px]" />
          <input type="number" placeholder="Price (₹)" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} className="w-full px-4 py-2 border border-gray-200 text-[14px]" />
          <input type="text" placeholder="Image URL" value={productForm.image} onChange={(e) => setProductForm({ ...productForm, image: e.target.value })} className="w-full px-4 py-2 border border-gray-200 text-[14px]" />
          <input type="text" placeholder="Fabric" value={productForm.fabric} onChange={(e) => setProductForm({ ...productForm, fabric: e.target.value })} className="w-full px-4 py-2 border border-gray-200 text-[14px]" />
          <input type="text" placeholder="Fit" value={productForm.fit} onChange={(e) => setProductForm({ ...productForm, fit: e.target.value })} className="w-full px-4 py-2 border border-gray-200 text-[14px]" />
          <input type="text" placeholder="Category" value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} className="w-full px-4 py-2 border border-gray-200 text-[14px]" />
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1">Return Window (Days)</label>
            <input type="number" min="1" max="365" placeholder="Return days (e.g., 30)" value={productForm.returnDays} onChange={(e) => setProductForm({ ...productForm, returnDays: e.target.value })} className="w-full px-4 py-2 border border-gray-200 text-[14px]" />
            <p className="text-[11px] text-gray-500 mt-1">How many days customers have to return this product (default: 30)</p>
          </div>
          <input type="text" placeholder="Sizes (comma separated)" value={productForm.size} onChange={(e) => setProductForm({ ...productForm, size: e.target.value })} className="w-full px-4 py-2 border border-gray-200 text[14px]" />
          <button onClick={handleSaveProduct} className="w-full px-4 py-2 bg-[var(--crimson)] text-white text-[14px] hover:opacity-90">Save Product</button>
        </div>
      </Modal>

      {/* User Modal */}
      <Modal isOpen={showUserModal} onClose={() => setShowUserModal(false)} title={editingUser ? 'Edit User' : 'Add User'}>
        <div className="space-y-4">
          <input type="text" placeholder="Full Name" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} className="w-full px-4 py-2 border border-gray-200 text-[14px]" />
          <input type="email" placeholder="Email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} className="w-full px-4 py-2 border border-gray-200 text-[14px]" />
          <input type="text" placeholder="Phone" value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} className="w-full px-4 py-2 border border-gray-200 text-[14px]" />
          <button onClick={handleSaveUser} className="w-full px-4 py-2 bg-[var(--crimson)] text-white text-[14px] hover:opacity-90">Save User</button>
        </div>
      </Modal>
    </div>
  );
}
