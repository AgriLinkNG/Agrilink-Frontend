import React from 'react';
import '@/styles/fonts.css';

// Components
import Footer from '../../components/marketplace/Footer';
import ProductDetailView from '../../components/marketplace/ProductDetailView';
import Chats from '../../components/dashboard/Chats';
import Settings from '../../components/dashboard/Settings';
import MobileNotifications from '../../components/dashboard/MobileNotifications';
import { NotificationData } from '../../components/dashboard/NotificationItem';
import MarketplaceHeader from '../../components/marketplace/MarketplaceHeader';
import HeroSection from '../../components/marketplace/HeroSection';
import CategorySidebar from '../../components/marketplace/CategorySidebar';
import FilterSidebar from '../../components/marketplace/FilterSidebar';
import ProductGrid from '../../components/marketplace/ProductGrid';

// Data
import { marketplaceProducts, Product } from '@/data/marketplaceProducts';
import { marketplaceCategories } from '@/data/marketplaceCategories';

// Hooks
import { useProductSearch } from '@/hooks/useProductSearch';
import { useScrollDetection } from '@/hooks/useScrollDetection';  

type ActiveView = 'marketplace' | 'chats' | 'notifications' | 'settings';

const BuyersMarketplace = () => {
  // UI State
  const [activeView, setActiveView] = React.useState<ActiveView>('marketplace');
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [isDetailViewOpen, setIsDetailViewOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  // Mobile detection
  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  // Custom hooks
  const isScrolled = useScrollDetection();
  const {
    searchTerm,
    isSearchActive,
    selectedCategories,
    selectedLocation,
    minPrice,
    maxPrice,
    handleSearch,
    handleCategoryToggle,
    clearAllFilters,
    getDisplayProducts,
    setSelectedLocation,
    setMinPrice,
    setMaxPrice
  } = useProductSearch(marketplaceProducts);

  // Event handlers
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailViewOpen(true);
  };

  const handleCloseDetailView = () => {
    setIsDetailViewOpen(false);
    setSelectedProduct(null);
  };

  const handleChatSeller = () => {
    setIsDetailViewOpen(false);
    setActiveView('chats');
  };

  // Computed values
  const displayProducts = getDisplayProducts();

  // Sample notification data for buyers
  const buyerNotifications: NotificationData[] = [
    {
      id: '1',
      avatar: '/chat-6.webp',
      title: 'Order Confirmed',
      message: 'Your order for Fresh Tomatoes has been confirmed by Adebola Farm.',
      timestamp: '2m',
      isRead: false,
      type: 'approval'
    },
    {
      id: '2',
      avatar: '/chat-7.webp',
      title: 'New Message',
      message: 'Kemi replied to your inquiry about bulk pepper purchase.',
      timestamp: '15m',
      isRead: false,
      type: 'message'
    },
    {
      id: '3',
      avatar: '/chat-8.png',
      title: 'Price Drop Alert',
      message: 'Sweet potatoes price dropped by 20% in your area.',
      timestamp: '1h',
      isRead: true,
      type: 'alert'
    },
    {
      id: '4',
      avatar: '/chat-9.svg',
      title: 'Delivery Update',
      message: 'Your Fresh Plantain order is out for delivery.',
      timestamp: '2h',
      isRead: false,
      type: 'alert'
    },
    {
      id: '5',
      avatar: '/chat-6.webp',
      title: 'Product Available',
      message: 'Organic Carrots you wishlisted are now available.',
      timestamp: '3h',
      isRead: true,
      type: 'reminder'
    },
    {
      id: '6',
      avatar: '/chat-7.webp',
      title: 'Review Reminder',
      message: 'Please review your recent purchase from Sunshine Farm.',
      timestamp: '1d',
      isRead: true,
      type: 'reminder'
    }
  ];

  // Notification handlers
  const handleNotificationClick = (notification: NotificationData) => {
    console.log('Notification clicked:', notification);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <MarketplaceHeader
        isScrolled={isScrolled}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Marketplace View */}
      {activeView === 'marketplace' && (
        <>
          {/* Hero Section */}
          <HeroSection
            isSearchActive={isSearchActive}
            isScrolled={isScrolled}
            searchTerm={searchTerm}
            onSearch={handleSearch}
          />
      
          {/* Main Content */}
          <div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8 lg:py-16">
            <div className="flex flex-col lg:flex-row gap-8 relative">
              {/* Categories Sidebar / Filter Sidebar */}
              <aside className={`w-full lg:w-80 xl:w-96 lg:flex-shrink-0 ${isSearchActive ? 'hidden lg:block' : ''}`}>
                <div>
                  {!isSearchActive ? (
                    <CategorySidebar categories={marketplaceCategories} />
                  ) : (
                    <FilterSidebar
                      categories={marketplaceCategories}
                      selectedCategories={selectedCategories}
                      selectedLocation={selectedLocation}
                      minPrice={minPrice}
                      maxPrice={maxPrice}
                      onCategoryToggle={handleCategoryToggle}
                      onLocationChange={setSelectedLocation}
                      onMinPriceChange={setMinPrice}
                      onMaxPriceChange={setMaxPrice}
                      onClearAll={clearAllFilters}
                    />
                  )}
                </div>
              </aside>

              {/* Product Grid */}
              <main className="flex-1 min-w-0">
                <ProductGrid
                  products={displayProducts}
                  isSearchActive={isSearchActive}
                  searchTerm={searchTerm}
                  onProductClick={handleProductClick}
                />
              </main>
            </div>
          </div>

          {/* Footer */}
          <Footer />
        </>
      )}

      {/* Chats View */}
      {activeView === 'chats' && (
        <div className="flex-1 bg-white overflow-hidden">
          <Chats
            showHeader={false}
            variant={isMobile ? 'mobile' : 'desktop'}
            context="marketplace"
          />
        </div>
      )}

      {/* Notifications View */}
      {activeView === 'notifications' && (
        <div className="lg:hidden">
          <MobileNotifications
            notifications={buyerNotifications}
            onNotificationClick={handleNotificationClick}
          />
        </div>
      )}

      {/* Settings View */}
      {activeView === 'settings' && (
        <>
          <div className="lg:hidden h-full">
            <Settings
              context="marketplace"
              variant="mobile"
              showHeader={false}
              onBack={() => setActiveView('marketplace')}
              onProfileClick={() => setActiveView('settings')}
              showBusinessName={false}
              placeholders={{
                fullName: "Enter your full name",
                phoneNumber: "Enter your phone number",
                email: "Enter your email address"
              }}
            />
          </div>
          <div className="hidden lg:block h-full">
            <Settings
              context="marketplace"
              variant="desktop"
              showHeader={false}
              onProfileClick={() => setActiveView('settings')}
              showBusinessName={false}
              placeholders={{
                fullName: "Enter your full name",
                phoneNumber: "Enter your phone number",
                email: "Enter your email address"
              }}
            />
          </div>
        </>
      )}

      {/* Product Detail View */}
      {activeView === 'marketplace' && (
        <ProductDetailView
          product={selectedProduct}
          isOpen={isDetailViewOpen}
          onClose={handleCloseDetailView}
          onChatSeller={handleChatSeller}
        />
      )}
    </div>
  );
};

export default BuyersMarketplace;