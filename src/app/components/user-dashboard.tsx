import { useState } from 'react';
import { ArrowLeft, Package, RotateCw, Calendar, MapPin, DollarSign, AlertCircle, X, Send } from 'lucide-react';
import { useAppStore, Order, Return } from '../store/app-store';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface UserDashboardProps {
  onBack: () => void;
}

// Modal Component
function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4 rounded-lg shadow-xl">
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

export function UserDashboard({ onBack }: UserDashboardProps) {
  const {
    currentUser,
    orders,
    products,
    getUserReturns,
    requestReturn,
    isOrderReturnable,
    getReturnDeadline,
    getReturnPolicy,
    getOrderReturnDays,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'returns'>('orders');
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [returnReason, setReturnReason] = useState('');

  // Common return reasons
  const commonReturnReasons = [
    'Size does not fit',
    'Wrong item received',
    'Quality issues',
    'Changed my mind',
    'Item damaged in transit',
    'Color not as expected',
    'Other'
  ];

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[16px] text-gray-600 mb-4">Please log in to view your dashboard</p>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-[var(--charcoal)] text-white rounded-lg hover:bg-gray-800 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const userOrders = orders.filter(o => o.userId === currentUser.id);
  const userReturns = getUserReturns(currentUser.id);
  const returnPolicy = getReturnPolicy();

  const handleRequestReturn = () => {
    if (!selectedOrder || !returnReason.trim()) {
      alert('Please select a reason for return');
      return;
    }

    requestReturn(selectedOrder.id, returnReason);
    setShowReturnModal(false);
    setSelectedOrder(null);
    setReturnReason('');
    alert('Return request submitted successfully!');
  };

  const getProductImage = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product?.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80';
  };

  const getReturnStatus = (orderId: string) => {
    const ret = userReturns.find(r => r.orderId === orderId);
    return ret?.status || null;
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'requested':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-[var(--charcoal)] hover:text-[var(--crimson)] transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="text-[14px] font-medium">Back</span>
              </button>
              <h1 className="font-[var(--font-serif)] text-[24px] text-[var(--charcoal)]">My Dashboard</h1>
            </div>
            <div className="text-right">
              <p className="text-[14px] font-medium text-[var(--charcoal)]">{currentUser.name}</p>
              <p className="text-[12px] text-gray-600">{currentUser.email}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 mb-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-4 font-medium text-[14px] border-b-2 transition-colors ${
                activeTab === 'orders'
                  ? 'border-[var(--charcoal)] text-[var(--charcoal)]'
                  : 'border-transparent text-gray-600 hover:text-[var(--charcoal)]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Package size={18} />
                Orders ({userOrders.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('returns')}
              className={`px-4 py-4 font-medium text-[14px] border-b-2 transition-colors ${
                activeTab === 'returns'
                  ? 'border-[var(--charcoal)] text-[var(--charcoal)]'
                  : 'border-transparent text-gray-600 hover:text-[var(--charcoal)]'
              }`}
            >
              <div className="flex items-center gap-2">
                <RotateCw size={18} />
                Returns ({userReturns.length})
              </div>
            </button>
          </div>
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {userOrders.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                <Package size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-[14px] text-gray-600">No orders yet</p>
              </div>
            ) : (
              userOrders.map((order) => {
                const isReturnable = isOrderReturnable(order.id);
                const returnDeadline = isReturnable ? getReturnDeadline(order.createdAt, order.id) : null;
                const returnStatus = getReturnStatus(order.id);
                const hasActiveReturn = returnStatus && returnStatus !== 'rejected';
                const orderReturnDays = getOrderReturnDays(order.id);

                return (
                  <div key={order.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    {/* Order Header */}
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-[12px] text-gray-600">Order Number</p>
                          <p className="text-[16px] font-medium text-[var(--charcoal)]">{order.id}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[12px] text-gray-600">Order Date</p>
                          <p className="text-[14px] font-medium text-[var(--charcoal)]">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center px-3 py-1 text-[12px] font-medium rounded-full ${
                            order.status === 'delivered'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'shipped'
                              ? 'bg-blue-100 text-blue-800'
                              : order.status === 'processing'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>

                        {returnStatus && (
                          <span className={`inline-flex items-center px-3 py-1 text-[12px] font-medium rounded-full ${getStatusColor(returnStatus)}`}>
                            Return: {returnStatus.charAt(0).toUpperCase() + returnStatus.slice(1)}
                          </span>
                        )}

                        {isReturnable && !hasActiveReturn && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 text-[12px] font-medium rounded-full bg-blue-50 text-blue-800">
                            <RotateCw size={12} />
                            Returnable
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4">
                            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              <ImageWithFallback
                                src={getProductImage(item.id)}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="text-[14px] font-medium text-[var(--charcoal)]">{item.name}</p>
                              <p className="text-[12px] text-gray-600">
                                Size: {item.selectedSize} | Qty: {item.quantity}
                              </p>
                              <p className="text-[13px] font-medium text-[var(--charcoal)] mt-1">
                                ₹{(item.price * item.quantity).toFixed(0)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                      <div className="space-y-2 text-[13px]">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="text-[var(--charcoal)]">₹{order.subtotal.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Shipping</span>
                          <span className="text-[var(--charcoal)]">₹{(order.total - order.subtotal - order.tax_amount).toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-200 pt-2 font-medium">
                          <span className="text-gray-700">Total</span>
                          <span className="text-[var(--charcoal)]">₹{order.total.toFixed(0)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Return Information & Action Buttons */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <div className="space-y-4">
                        {isReturnable && !hasActiveReturn && (
                          <>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <div className="flex gap-3">
                                <AlertCircle size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="text-[13px] text-blue-800">
                                  <p className="font-medium mb-2">✓ Eligible for Return</p>
                                  <p className="mb-3 text-[12px]">
                                    Deadline: <span className="font-semibold">{returnDeadline?.toLocaleDateString()}</span> ({orderReturnDays} days remaining)
                                  </p>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setReturnReason('');
                                setShowReturnModal(true);
                              }}
                              className="w-full px-4 py-3 bg-[var(--crimson)] text-white rounded-lg font-medium text-[14px] hover:opacity-90 transition flex items-center justify-center gap-2"
                            >
                              <RotateCw size={16} />
                              Request Return
                            </button>
                          </>
                        )}

                        {!isReturnable && !hasActiveReturn && order.status === 'delivered' && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-[12px] text-red-800">
                              <strong>Return period expired.</strong> Contact support if you believe this is an error.
                            </p>
                          </div>
                        )}

                        {hasActiveReturn && (
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <p className="text-[12px] text-purple-800 mb-2">
                              <strong>Return Status:</strong> {returnStatus?.charAt(0).toUpperCase() + returnStatus?.slice(1)}
                            </p>
                            <p className="text-[11px] text-purple-700">
                              View details in the <button onClick={() => setActiveTab('returns')} className="underline font-semibold hover:no-underline">Returns tab</button>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Returns Tab */}
        {activeTab === 'returns' && (
          <div className="space-y-6">
            {userReturns.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                <RotateCw size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-[14px] text-gray-600">No return requests yet</p>
              </div>
            ) : (
              userReturns.map((ret) => {
                const order = orders.find(o => o.id === ret.orderId);
                return (
                  <div key={ret.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="px-6 py-4">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-[12px] text-gray-600">Return ID</p>
                          <p className="text-[16px] font-medium text-[var(--charcoal)]">{ret.id}</p>
                        </div>
                        <span
                          className={`inline-flex items-center px-3 py-1 text-[12px] font-medium rounded-full ${getStatusColor(ret.status)}`}
                        >
                          {ret.status.charAt(0).toUpperCase() + ret.status.slice(1)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-[12px] text-gray-600">Order</p>
                          <p className="text-[14px] font-medium text-[var(--charcoal)]">{order?.id}</p>
                        </div>
                        <div>
                          <p className="text-[12px] text-gray-600">Requested</p>
                          <p className="text-[14px] font-medium text-[var(--charcoal)]">
                            {new Date(ret.requestedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-[12px] text-gray-600 mb-1">Reason</p>
                        <p className="text-[14px] text-[var(--charcoal)]">{ret.reason}</p>
                      </div>

                      {ret.adminNotes && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-[12px] text-gray-600 mb-1">Admin Notes</p>
                          <p className="text-[13px] text-gray-700 italic">{ret.adminNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      {/* Return Request Modal */}
      <Modal
        isOpen={showReturnModal}
        onClose={() => {
          setShowReturnModal(false);
          setSelectedOrder(null);
          setReturnReason('');
        }}
        title="Request Return"
      >
        {selectedOrder && (
          <div className="space-y-5">
            <div>
              <label className="text-[12px] font-medium text-gray-700 block mb-2">
                Order Details
              </label>
              <div className="bg-gray-50 p-3 rounded-lg text-[13px] text-gray-700">
                <p className="font-medium">{selectedOrder.id}</p>
                <p>{selectedOrder.items.length} item(s) - ₹{selectedOrder.total.toFixed(0)}</p>
              </div>
            </div>

            <div>
              <label className="text-[12px] font-medium text-gray-700 block mb-3">
                Return Reason *
              </label>
              
              {/* Quick Select Buttons */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                {commonReturnReasons.map((reason) => (
                  <button
                    key={reason}
                    onClick={() => setReturnReason(reason)}
                    className={`px-3 py-2 text-[12px] font-medium rounded-lg transition border ${
                      returnReason === reason
                        ? 'bg-[var(--charcoal)] text-white border-[var(--charcoal)]'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>

              {/* Additional Details Textarea */}
              <textarea
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder="Or add more details about your return..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--charcoal)] focus:border-transparent"
                rows={4}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-[12px] text-blue-800">
                <strong>Return Policy:</strong> You have <strong>{getReturnPolicy()} days</strong> from delivery to request a return.
              </p>
            </div>

            <button
              onClick={handleRequestReturn}
              disabled={!returnReason.trim()}
              className="w-full px-4 py-3 bg-[var(--crimson)] text-white rounded-lg font-medium text-[14px] hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
              Submit Return Request
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
