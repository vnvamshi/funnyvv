import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, ChevronDown, ChevronLeft } from 'lucide-react';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import useWindowSize from '../../hooks/useWindowSize';
import house1 from '../../assets/images/spotlight-house1.svg';
import { fetchOrders } from '../../utils/api';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import ServiceSection from '../Home/DesktopServiceSectionUI';
import { useAuth, useAuthData } from '../../contexts/AuthContext';
import { MobileMenu } from '../../components/MobileMenu';
import MobileBuyerMenu from '../../components/MobileBuyerMenu';
import MobileAgentMenu from '../../components/MobileAgentMenu';
import { MobileBottonMenu } from '../../components/MobileMenu';

// Orders state and fetch logic must be inside the component
const MyOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchOrders(1, 20)
      .then((data) => {
        if (data && data.data && Array.isArray(data.data.orders)) {
          setOrders(data.data.orders);
        } else {
          setOrders([]);
        }
      })
      .catch((err) => {
        setError('Failed to load orders');
        setOrders([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const statusColors: { [key: string]: string } = {
    in_transit: 'text-[#EBA100]',
    delivered: 'text-[#0A8F47]',
  };

  const { width } = useWindowSize();
  const { t } = useTranslation();
  const isMobile = width < 768;
  const navigate = useNavigate();
  const location = useLocation();
  const { orderNo, productId } = useParams<{ orderNo?: string; productId?: string }>();
  const [selectedDate, setSelectedDate] = useState('30');
  const [selectedSort, setSelectedSort] = useState('all');
  const [dateDropdownFocused, setDateDropdownFocused] = useState(false);
  const [sortDropdownFocused, setSortDropdownFocused] = useState(false);

  // Helper function to safely translate status values
  const translateStatus = (status: string) => {
    try {
      return t(`my_orders.status.${status}`);
    } catch (error) {
      // Fallback to status if translation doesn't exist
      return status;
    }
  };

  // Menu state
  const [menuOpen, setMenuOpen] = useState(false);
  const { isLoggedIn } = useAuth();
  const userData = useAuthData();
  const isAgent = userData?.user?.user_type === 'agent';
  const isBuyer = userData?.user?.user_type === 'buyer';

  // Helper to find product by orderNo and productId
  const findProduct = (orderNo: string, productId: string) => {
    const order = orders.find((o) => o.order_number === orderNo);
    if (!order) return null;
    const product = (order.items || []).find((p: any) => String(p.id) === String(productId));
    return product ? { order, product } : null;
  };

  // GradientButton component for consistent gradient border/hover
  const GradientButton: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [hover, setHover] = useState(false);
    return (
      <button
        className="font-medium"
        style={{
          borderRadius: 7,
          padding: '8px 20px',
          fontSize: 15,
          transition: 'all 0.2s',
          minWidth: 120,
          border: '2px solid',
          borderImage: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%) 1',
          color: hover ? 'white' : '#004236',
          background: hover ? 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)' : 'white',
          backgroundClip: 'padding-box',
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {children}
      </button>
    );
  };

  // Desktop Order Card
  const DesktopOrderCard = ({ order }: { order: any }) => (
    <div className="bg-white rounded-[10px] shadow-sm border border-gray-200 mb-6">
      {/* Order Header */}
      <div className="flex flex-wrap items-center justify-between px-6 pt-4 pb-2 bg-[#F5F5F5] rounded-t-[10px]">
        <div className="flex flex-row items-center gap-x-8">
          <div className="text-[15px] font-medium text-[#222]">
            Order no. : <span
              className="font-bold bg-gradient-to-r from-[#004236] to-[#007E67] bg-clip-text text-transparent"
              style={{ borderRadius: 7, padding: '2px 8px', border: '2px solid', borderImage: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%) 1', display: 'inline-block' }}
            >{order.order_number}</span>
          </div>
          <div className="text-[15px] font-medium text-[#222]">
            Total : <span className="font-bold">${order.total_amount}</span>
          </div>
          <div className="flex items-center gap-1 text-[15px] text-[#15803d] font-medium cursor-pointer">
            Invoice <ChevronDown size={16} />
          </div>
        </div>
        <div className="text-[13px] text-gray-500 ml-auto">
          Date Placed. : <span className="font-semibold bg-gradient-to-r from-[#004236] to-[#007E67] bg-clip-text text-transparent">{order.created_at ? new Date(order.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}</span>
        </div>
      </div>
      {/* Product Rows */}
      <div className="divide-y divide-gray-100">
        {(order.items || []).map((item: any, idx: number) => {
          // Treat 'pending' as 'in_transit' for display
          const status = item.delivery_status === 'pending' ? 'in_transit' : item.delivery_status;
          const isDelivered = status === 'delivered';
          const isInTransit = status === 'in_transit';
          return (
            <div key={item.id} className="flex items-center px-6 py-6">
              {/* Left: Image and product info */}
              <img src={item.product?.primary_image?.image_url || house1} alt={item.product?.name} className="w-24 h-24 object-cover rounded-[8px] border border-gray-100" />
              <div className="flex-1 min-w-0 ml-6">
                <div className="font-semibold text-[17px] truncate text-[#222]">{item.product?.name}</div>
                <div className="text-[18px] font-bold text-[#222]">${parseFloat(item.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="text-[13px] text-gray-500 truncate">{item.product?.short_description}</div>
              </div>
              {/* Middle: Status and delivery info */}
              <div className="flex flex-col items-start min-w-[200px] mx-6">
                {isDelivered ? (
                  <>
                    <div className="font-semibold text-[15px] text-[#15803d]">{t('my_orders.status.delivered')}</div>
                    {item.delivery_date && (
                      <div className="text-[13px] text-gray-500">{t('my_orders.status.delivered')}: {new Date(item.delivery_date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}</div>
                    )}
                  </>
                ) : isInTransit ? (
                  <>
                    <div className="font-semibold text-[15px] text-[#EBA100]">{t('my_orders.status.in_transit')}</div>
                    {item.expected_delivery_date && (
                      <div className="text-[13px] text-gray-500">Expect to deliver on {new Date(item.expected_delivery_date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}</div>
                    )}
                  </>
                ) : (
                  <div className="font-semibold text-[15px] text-gray-500">{translateStatus(status)}</div>
                )}
                {item.product?.deliveredInfo && (
                  <div className="text-[13px] text-gray-500">{item.product.deliveredInfo}</div>
                )}
              </div>
              {/* Right: Action buttons */}
              <div className="flex flex-row items-center gap-3 min-w-[320px] justify-end">
                <GradientButton>{t('my_orders.track_package')}</GradientButton>
                <GradientButton>{t('my_orders.view_item')}</GradientButton>
                <button
                  className="text-white font-medium rounded-[7px] px-5 py-2 text-[15px] shadow-sm"
                  style={{
                    minWidth: 120,
                    background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)',
                    border: 'none',
                  }}
                >
                  {t('my_orders.buy_again')}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Mobile Item Detail View
  const MobileOrderItemDetail: React.FC<{ order: any; product: any }> = ({ order, product }) => (
    <div className="bg-white rounded-[14px] shadow-md border border-gray-200 mb-7 p-6 flex flex-col min-h-[230px]">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center text-[#222]">
        <ChevronLeft size={24} className="mr-1" />
        <span className="text-base font-medium">{t('my_orders.back')}</span>
      </button>
      <div className="text-[16px] font-semibold text-[#222] mb-4">
        {t('my_orders.order_no')} : <span className="font-bold text-[#15803d]">{order.order_number}</span>
      </div>
      <div className="flex items-center mb-5">
        <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded-[12px] border border-gray-100 flex-shrink-0 mr-5" />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[16px] truncate text-[#222] mb-2">{product.name}</div>
          <div className="text-[15px] font-bold text-[#222] mb-2">{product.price}</div>
          <div className="text-[14px] text-gray-400 truncate mb-2">{product.subtext}</div>
        </div>
      </div>
      <div className={`font-semibold text-[15px] mb-2 ${(statusColors as any)[product.status]}`}>{translateStatus(product.status)}{product.status === 'delivered' && product.statusDate ? ` ${product.statusDate}` : ''}</div>
      {product.status === 'in_transit' && (
        <div className="text-[14px] text-gray-400 mb-4">{product.expected}</div>
      )}
      {product.status === 'delivered' && (
        <div className="text-[14px] text-gray-400 mb-4">{product.deliveredInfo}</div>
      )}
      <div className="flex flex-col items-center gap-4 mb-2 mt-4">
        <div className=" flex flex-row gap-3 justify-center">
          <button
            style={{
              width: 115,
              height: 36,
              borderRadius: 7,
              borderWidth: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              border: 'none',
            }}
            className="form-submit-button text-xs font-medium shadow-sm"
          >
            {t('my_orders.buy_again')}
          </button>
          <button
            style={{
              width: 115,
              height: 36,
              borderRadius: 7,
              borderWidth: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className="text-xs border border-gray-300 text-[#222] bg-white font-medium"
          >
            {t('my_orders.track_package')}
          </button>
          <button
            style={{
              width: 115,
              height: 36,
              borderRadius: 7,
              borderWidth: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className="text-xs border border-gray-300 text-[#222] bg-white font-medium"
          >
            {t('my_orders.view_item')}
          </button>
        </div>
        <a
          href="#"
          className="text-xs text-[#15803d] underline font-medium text-center"
          style={{ width: '100%' }}
        >
          {t('my_orders.download_invoice')}
        </a>
      </div>
    </div>
  );

  // Mobile Order Card (List View)
  const MobileOrderCard: React.FC<{ order: any }> = ({ order }) => (
    <div className="bg-white rounded-[14px] shadow-md border border-gray-200 mb-7 p-6 flex flex-col">
      <div className="text-[16px] font-semibold text-[#222] mb-4">
        {t('my_orders.order_no')} : <span className="font-bold text-[#15803d]">{order.order_number}</span>
      </div>
      <div className="flex flex-col gap-y-4">
        {(order.items || []).map((product: any) => (
          <div
            key={product.id}
            className="flex items-center py-4 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 rounded-lg transition"
            onClick={() => navigate(`/myorders/${order.order_number}/${product.id}`)}
          >
            <img src={product.product?.primary_image?.image_url || house1} alt={product.product?.name} className="w-16 h-16 object-cover rounded-[12px] border border-gray-100 flex-shrink-0 mr-5" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[16px] truncate text-[#222] mb-1">{product.product?.name}</div>
              <div className={`font-semibold text-[15px] mb-1 ${(statusColors as any)[product.delivery_status]}`}>{translateStatus(product.delivery_status)}{product.delivery_status === 'delivered' && product.delivery_date ? ` ${product.delivery_date}` : ''}</div>
              {product.delivery_status === 'in_transit' && (
                <div className="text-[14px] text-gray-400">Expected: {product.expected_delivery_date}</div>
              )}
              {product.delivery_status === 'delivered' && (
                <div className="text-[14px] text-gray-400">{t('my_orders.status.delivered')}: {product.delivery_date}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Order summary text based on API response
  const totalOrders = orders.length;
  let delivered = 0;
  let inProgress = 0;
  orders.forEach(order => {
    if (order.delivered_count) delivered += order.delivered_count;
    if (order.inprogress_count) inProgress += order.inprogress_count;
  });
  const orderSummary = `${totalOrders} ${t('my_orders.title')}`;
  const orderStatusSummary = `${delivered} ${t('my_orders.status.delivered').toLowerCase()}, ${inProgress} ${t('my_orders.in_progress').toLowerCase()}`;

  // My Orders Skeleton Loader
  const MyOrdersSkeleton: React.FC = () => (
    <div className="bg-white rounded-[10px] shadow-sm border border-gray-200 mb-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-wrap items-center justify-between px-6 pt-4 pb-2 bg-[#F5F5F5] rounded-t-[10px]">
        <div className="flex flex-row items-center gap-x-8">
          <div className="h-5 w-32 bg-gray-200 rounded mb-2" />
          <div className="h-5 w-24 bg-gray-200 rounded mb-2" />
          <div className="h-5 w-20 bg-gray-200 rounded mb-2" />
        </div>
        <div className="h-4 w-32 bg-gray-200 rounded ml-auto" />
      </div>
      {/* Product Rows Skeleton */}
      <div className="divide-y divide-gray-100">
        {[1, 2, 3].map((_, idx) => (
          <div key={idx} className="flex items-center px-6 py-6">
            <div className="w-24 h-24 bg-gray-200 rounded-[8px]" />
            <div className="flex-1 min-w-0 ml-6">
              <div className="h-5 w-40 bg-gray-200 rounded mb-2" />
              <div className="h-5 w-24 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-32 bg-gray-200 rounded" />
            </div>
            <div className="flex flex-col items-start min-w-[200px] mx-6">
              <div className="h-5 w-24 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-32 bg-gray-200 rounded" />
            </div>
            <div className="flex flex-row items-center gap-3 min-w-[320px] justify-end">
              <div className="h-10 w-24 bg-gray-200 rounded" />
              <div className="h-10 w-24 bg-gray-200 rounded" />
              <div className="h-10 w-24 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render logic
  return (
    <div className="container mx-auto p-4 pt-6 bg-[#F9F9F9] min-h-screen">
      {/* Header Row */}
      {isMobile ? (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <button className="p-2 -ml-2" onClick={() => setMenuOpen(true)}>
              <Menu size={22} />
            </button>
            <h1 className="text-xl font-bold text-[#15803d]">{t('my_orders.title')}</h1>
          </div>
          <div className="flex items-center gap-1 text-xs text-green-700 font-semibold cursor-pointer">
            <div className="gradient-border-bg">
              <Select
                value={selectedSort}
                onChange={e => setSelectedSort(e.target.value as string)}
                displayEmpty
                size="small"
                className="input-inside-bg"
                sx={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#15803d',
                  background: 'white',
                  borderRadius: '8px',
                  height: '32px',
                  boxShadow: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  '.MuiOutlinedInput-notchedOutline': { border: 'none' },
                  '.MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                    height: '32px',
                    padding: '0 8px',
                    lineHeight: 'normal',
                    fontSize: '12px',
                    color: '#15803d',
                    fontWeight: 600,
                  },
                  '.MuiSelect-icon': {
                    top: '50%',
                    transform: 'translateY(-50%)',
                  },
                  '.MuiSvgIcon-root': { 
                    fontSize: '16px',
                    color: '#15803d' 
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      borderRadius: '8px',
                    },
                  },
                }}
              >
                <MenuItem value="all">{t('my_orders.showing_all')}</MenuItem>
                <MenuItem value="delivered">{t('my_orders.delivered')}</MenuItem>
                <MenuItem value="in_transit">{t('my_orders.in_transit')}</MenuItem>
              </Select>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between mb-4">
          <div className="flex flex-col gap-0">
            <div className="text-[15px] text-[#222] font-medium mb-0">{orderSummary}</div>
            <div className="text-[13px] text-gray-500">{orderStatusSummary}</div>
          </div>
          <h1 className="text-2xl font-bold text-[#222] text-center flex-1">{t('my_orders.title')}</h1>
          <div className="flex items-center gap-x-6">
            {/* Date Dropdown */}
            <div className={`gradient-border-bg${dateDropdownFocused ? ' focused' : ''}`}>
              <Select
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value as string)}
                displayEmpty
                inputProps={{ 'aria-label': 'Without label' }}
                className="input-inside-bg w-[170px]"
                onFocus={() => setDateDropdownFocused(true)}
                onBlur={() => setDateDropdownFocused(false)}
                sx={{
                  fontSize: 16,
                  fontWeight: 500,
                  color: '#16634a',
                  background: 'white',
                  borderRadius: '10px',
                  height: '40px',
                  boxShadow: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  '.MuiOutlinedInput-notchedOutline': { border: 'none' },
                  '.MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                    height: '40px',
                    padding: '0 14px',
                    lineHeight: 'normal',
                  },
                  '.MuiSelect-icon': {
                    top: '50%',
                    transform: 'translateY(-50%)',
                  },
                  '.MuiSvgIcon-root': { color: '#007E67' },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      borderRadius: '10px',
                    },
                  },
                }}
              >
                <MenuItem value="30">{t('my_orders.past_30_days')}</MenuItem>
                <MenuItem value="180">{t('my_orders.past_6_months')}</MenuItem>
                <MenuItem value="365">{t('my_orders.past_year')}</MenuItem>
              </Select>
            </div>
            {/* Sort Dropdown */}
            <div className="relative flex items-center">
              <span className="text-[#16634a] font-semibold mr-1">{t('my_orders.sort')} :</span>
              <div className={`gradient-border-bg${sortDropdownFocused ? ' focused' : ''}`}>
                <Select
                  value={selectedSort}
                  onChange={e => setSelectedSort(e.target.value as string)}
                  displayEmpty
                  inputProps={{ 'aria-label': 'Without label' }}
                  className="input-inside-bg w-[170px]"
                  onFocus={() => setSortDropdownFocused(true)}
                  onBlur={() => setSortDropdownFocused(false)}
                  sx={{
                    fontSize: 16,
                    fontWeight: 500,
                    color: '#16634a',
                    background: 'white',
                    borderRadius: '10px',
                    height: '40px',
                    boxShadow: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    '.MuiOutlinedInput-notchedOutline': { border: 'none' },
                    '.MuiSelect-select': {
                      display: 'flex',
                      alignItems: 'center',
                      height: '40px',
                      padding: '0 14px',
                      lineHeight: 'normal',
                    },
                    '.MuiSelect-icon': {
                      top: '50%',
                      transform: 'translateY(-50%)',
                    },
                    '.MuiSvgIcon-root': { color: '#007E67' },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        borderRadius: '10px',
                      },
                    },
                  }}
                >
                  <MenuItem value="all">{t('my_orders.showing_all')}</MenuItem>
                  <MenuItem value="delivered">{t('my_orders.delivered')}</MenuItem>
                  <MenuItem value="in_transit">{t('my_orders.in_transit')}</MenuItem>
                </Select>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Order summary (mobile) */}
      {isMobile && (
        <div className="text-xs text-gray-500 mb-2">{orderSummary} – {orderStatusSummary}</div>
      )}
      {/* Orders List or Detail View (Mobile) */}
      <div className="flex flex-col gap-6">
        {loading ? (
          <MyOrdersSkeleton />
        ) : isMobile && orderNo && productId ? (
          (() => {
            const found = findProduct(orderNo, productId);
            if (!found) return <div className="text-center text-gray-500 mt-10">{t('my_orders.not_found')}</div>;
            return <MobileOrderItemDetail order={found.order} product={found.product} />;
          })()
        ) : isMobile ? (
          orders.map((order) => <MobileOrderCard key={order.order_number} order={order} />)
        ) : (
          orders.map((order) => <DesktopOrderCard key={order.order_number} order={order} />)
        )}
      </div>
      {/* <ServiceSection /> */}

      {/* Mobile Menu Components */}
      {isLoggedIn && isAgent && (
        <MobileAgentMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      )}
      {isLoggedIn && isBuyer && (
        <MobileBuyerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      )}
      {!isLoggedIn && (
        <MobileMenu 
          isOpen={menuOpen} 
          onClose={() => setMenuOpen(false)} 
          isLoggedIn={isLoggedIn}
          userType={userData?.user?.user_type}
        />
      )}
      
      {/* Bottom Navigation Menu - Only show on mobile */}
      {isMobile && <MobileBottonMenu />}
    </div>
  );
};

export default MyOrders; 