import React, { useEffect, lazy, Suspense } from 'react';
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
const ProductsPage = lazy(() => import('./pages/ProductsPage').then((m) => ({ default: m.ProductsPage })));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })));
const CartPage = lazy(() => import('./pages/CartPage').then((m) => ({ default: m.CartPage })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage })));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage').then((m) => ({ default: m.OrderSuccessPage })));
const AccountPage = lazy(() => import('./pages/AccountPage').then((m) => ({ default: m.AccountPage })));
const OrdersPage = lazy(() => import('./pages/OrdersPage').then((m) => ({ default: m.OrdersPage })));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage').then((m) => ({ default: m.OrderDetailPage })));
const TrackOrderPage = lazy(() => import('./pages/TrackOrderPage').then((m) => ({ default: m.TrackOrderPage })));
const WishlistPage = lazy(() => import('./pages/WishlistPage').then((m) => ({ default: m.WishlistPage })));
const ComparePage = lazy(() => import('./pages/ComparePage').then((m) => ({ default: m.ComparePage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const FaqPage = lazy(() => import('./pages/FaqPage').then((m) => ({ default: m.FaqPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then((m) => ({ default: m.TermsPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));
const AdminLayout = lazy(() => import('./admin/components/layout/AdminLayout').then((m) => ({ default: m.AdminLayout })));
import { AdminProtectedRoute } from './admin/components/auth/AdminProtectedRoute';
const AdminLoginPage = lazy(() => import('./admin/pages/Auth/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })));
const AdminDashboardPage = lazy(() => import('./admin/pages/Dashboard/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));
const AdminProductsPage = lazy(() => import('./admin/pages/Products/AdminProductsPage').then((m) => ({ default: m.AdminProductsPage })));
const AdminProductFormPage = lazy(() => import('./admin/pages/Products/AdminProductFormPage').then((m) => ({ default: m.AdminProductFormPage })));
const AdminCategoriesPage = lazy(() => import('./admin/pages/Categories/AdminCategoriesPage').then((m) => ({ default: m.AdminCategoriesPage })));
const AdminCollectionsPage = lazy(() => import('./admin/pages/Collections/AdminCollectionsPage').then((m) => ({ default: m.AdminCollectionsPage })));
const AdminInventoryPage = lazy(() => import('./admin/pages/Inventory/AdminInventoryPage').then((m) => ({ default: m.AdminInventoryPage })));
const AdminOrdersPage = lazy(() => import('./admin/pages/Orders/AdminOrdersPage').then((m) => ({ default: m.AdminOrdersPage })));
const AdminOrderDetailPage = lazy(() => import('./admin/pages/Orders/AdminOrderDetailPage').then((m) => ({ default: m.AdminOrderDetailPage })));
const AdminAbandonedCartsPage = lazy(() => import('./admin/pages/Marketing/AdminAbandonedCartsPage').then((m) => ({ default: m.AdminAbandonedCartsPage })));
const AdminReturnsPage = lazy(() => import('./admin/pages/Sales/AdminReturnsPage').then((m) => ({ default: m.AdminReturnsPage })));
const AdminCustomersPage = lazy(() => import('./admin/pages/Customers/AdminCustomersPage').then((m) => ({ default: m.AdminCustomersPage })));
const AdminReviewsPage = lazy(() => import('./admin/pages/Customers/AdminReviewsPage').then((m) => ({ default: m.AdminReviewsPage })));
const AdminMessagesPage = lazy(() => import('./admin/pages/Customers/AdminMessagesPage'));
const AdminCouponsPage = lazy(() => import('./admin/pages/Marketing/AdminCouponsPage').then((m) => ({ default: m.AdminCouponsPage })));
const AdminPromotionsPage = lazy(() => import('./admin/pages/Marketing/AdminPromotionsPage').then((m) => ({ default: m.AdminPromotionsPage })));
const AdminSubscribersPage = lazy(() => import('./admin/pages/Marketing/AdminSubscribersPage'));
const AdminAnalyticsPage = lazy(() => import('./admin/pages/Analytics/AdminAnalyticsPage').then((m) => ({ default: m.AdminAnalyticsPage })));
const AdminSettingsPage = lazy(() => import('./admin/pages/Settings/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage })));
const AdminHomepageBuilderPage = lazy(() => import('./admin/pages/Content/AdminHomepageBuilderPage').then((m) => ({ default: m.AdminHomepageBuilderPage })));
const AdminMediaLibraryPage = lazy(() => import('./admin/pages/Content/AdminMediaLibraryPage').then((m) => ({ default: m.AdminMediaLibraryPage })));
const IntegrationTracker = lazy(() => import('./admin/pages/IntegrationTracker').then((m) => ({ default: m.IntegrationTracker })));
const AdminDashboardPlaceholder = lazy(() => import('./admin/pages/Dashboard/AdminDashboardPlaceholder').then((m) => ({ default: m.AdminDashboardPlaceholder })));


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
                  <Suspense fallback={<div style={{minHeight:"60vh",display:"grid",placeItems:"center",color:"#9a8a5a"}}>...</div>}><Routes>
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
                  </Routes></Suspense>
                </BrowserRouter>
              </CompareProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
