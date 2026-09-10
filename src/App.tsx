import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { CompareProvider } from './context/CompareContext';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './layouts/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { AccountPage } from './pages/AccountPage';
import { OrdersPage } from './pages/OrdersPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { WishlistPage } from './pages/WishlistPage';
import { ComparePage } from './pages/ComparePage';
import { AboutPage } from './pages/AboutPage';
import { FaqPage } from './pages/FaqPage';
import { TermsPage } from './pages/TermsPage';
import { ContactPage } from './pages/ContactPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminLayout } from './admin/components/layout/AdminLayout';
import { AdminProtectedRoute } from './admin/components/auth/AdminProtectedRoute';
import { AdminLoginPage } from './admin/pages/Auth/AdminLoginPage';
import { AdminDashboardPage } from './admin/pages/Dashboard/AdminDashboardPage';
import { AdminProductsPage } from './admin/pages/Products/AdminProductsPage';
import { AdminProductFormPage } from './admin/pages/Products/AdminProductFormPage';
import { AdminCategoriesPage } from './admin/pages/Categories/AdminCategoriesPage';
import { AdminCollectionsPage } from './admin/pages/Collections/AdminCollectionsPage';
import { AdminInventoryPage } from './admin/pages/Inventory/AdminInventoryPage';
import { AdminOrdersPage } from './admin/pages/Orders/AdminOrdersPage';
import { AdminOrderDetailPage } from './admin/pages/Orders/AdminOrderDetailPage';
import { AdminAbandonedCartsPage } from './admin/pages/Marketing/AdminAbandonedCartsPage';
import { AdminReturnsPage } from './admin/pages/Sales/AdminReturnsPage';
import { AdminCustomersPage } from './admin/pages/Customers/AdminCustomersPage';
import { AdminReviewsPage } from './admin/pages/Customers/AdminReviewsPage';
import AdminMessagesPage from './admin/pages/Customers/AdminMessagesPage';
import { AdminCouponsPage } from './admin/pages/Marketing/AdminCouponsPage';
import { AdminPromotionsPage } from './admin/pages/Marketing/AdminPromotionsPage';
import AdminSubscribersPage from './admin/pages/Marketing/AdminSubscribersPage';
import { AdminAnalyticsPage } from './admin/pages/Analytics/AdminAnalyticsPage';
import { AdminSettingsPage } from './admin/pages/Settings/AdminSettingsPage';
import { AdminHomepageBuilderPage } from './admin/pages/Content/AdminHomepageBuilderPage';
import { AdminMediaLibraryPage } from './admin/pages/Content/AdminMediaLibraryPage';
import { IntegrationTracker } from './admin/pages/IntegrationTracker';
import { AdminDashboardPlaceholder } from './admin/pages/Dashboard/AdminDashboardPlaceholder';


// Component to scroll to top on path/location change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <CompareProvider>
                <BrowserRouter>
                  <ScrollToTop />
                  <Routes>
                    <Route element={<AppLayout />}>
                      {/* Catalog & Home Routes */}
                      <Route path="/" element={<HomePage />} />
                      <Route path="/index.html" element={<HomePage />} />
                      <Route path="/products" element={<ProductsPage />} />
                      <Route path="/products.html" element={<ProductsPage />} />

                      {/* Product Detail Routes */}
                      <Route path="/products/:id" element={<ProductDetailPage />} />
                      <Route path="/product.html" element={<ProductDetailPage />} />

                      {/* Shopping & Checkout Routes */}
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/cart.html" element={<CartPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/checkout.html" element={<CheckoutPage />} />
                      <Route path="/order-success" element={<OrderSuccessPage />} />

                      {/* Customer Profile & Order History (Protected) */}
                      <Route
                        path="/account"
                        element={
                          <ProtectedRoute>
                            <AccountPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/account/profile"
                        element={
                          <ProtectedRoute>
                            <AccountPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/account/security"
                        element={
                          <ProtectedRoute>
                            <AccountPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/account/addresses"
                        element={
                          <ProtectedRoute>
                            <AccountPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/account/orders"
                        element={
                          <ProtectedRoute>
                            <OrdersPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/orders"
                        element={
                          <ProtectedRoute>
                            <OrdersPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/orders/:id"
                        element={
                          <ProtectedRoute>
                            <OrderDetailPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Utility & Informational Routes */}
                      <Route path="/order-success" element={<OrderSuccessPage />} />
                      <Route path="/order-success/:id" element={<OrderSuccessPage />} />
                      <Route path="/track-order" element={<TrackOrderPage />} />
                      <Route path="/track-order/:id" element={<TrackOrderPage />} />
                      <Route path="/wishlist" element={<WishlistPage />} />
                      <Route path="/wishlist.html" element={<WishlistPage />} />
                      <Route path="/compare" element={<ComparePage />} />
                      <Route path="/compare.html" element={<ComparePage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/about.html" element={<AboutPage />} />
                      <Route path="/faq" element={<FaqPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="/terms" element={<TermsPage />} />

                      {/* Catch-all 404 route */}
                      <Route path="*" element={<NotFoundPage />} />
                    </Route>

                    {/* Admin Authentication Route */}
                    <Route path="/admin/login" element={<AdminLoginPage />} />

                    {/* Admin Frontend Platform Protected by Firebase Auth & RBAC */}
                    <Route
                      path="/admin"
                      element={
                        <AdminProtectedRoute>
                          <AdminLayout />
                        </AdminProtectedRoute>
                      }
                    >
                      <Route index element={<AdminDashboardPage />} />
                      <Route path="dashboard" element={<AdminDashboardPage />} />
                      <Route path="products" element={<AdminProductsPage />} />
                      <Route path="products/new" element={<AdminProductFormPage />} />
                      <Route path="products/:id/edit" element={<AdminProductFormPage />} />
                      <Route path="categories" element={<AdminCategoriesPage />} />
                      <Route path="collections" element={<AdminCollectionsPage />} />
                      <Route path="inventory" element={<AdminInventoryPage />} />
                      <Route path="orders" element={<AdminOrdersPage />} />
                      <Route path="orders/:id" element={<AdminOrderDetailPage />} />
                      <Route path="abandoned-carts" element={<AdminAbandonedCartsPage />} />
                      <Route path="returns" element={<AdminReturnsPage />} />
                      <Route path="customers" element={<AdminCustomersPage />} />
                      <Route path="messages" element={<AdminMessagesPage />} />
                      <Route path="reviews" element={<AdminReviewsPage />} />
                      <Route path="coupons" element={<AdminCouponsPage />} />
                      <Route path="promotions" element={<AdminPromotionsPage />} />
                      <Route path="subscribers" element={<AdminSubscribersPage />} />
                      <Route path="analytics" element={<AdminAnalyticsPage />} />
                      <Route path="reports" element={<AdminAnalyticsPage />} />
                      <Route path="homepage" element={<AdminHomepageBuilderPage />} />
                      <Route path="media" element={<AdminMediaLibraryPage />} />
                      <Route path="settings" element={<AdminSettingsPage />} />
                      <Route path="integration-tracker" element={<IntegrationTracker />} />
                      {/* Sub-route fallbacks for upcoming phases */}
                      <Route path="*" element={<AdminDashboardPlaceholder />} />
                    </Route>
                  </Routes>
                </BrowserRouter>
              </CompareProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
