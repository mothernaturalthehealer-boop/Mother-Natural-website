import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Toaster } from '@/components/ui/sonner';

// Pages
import { HomePage } from '@/pages/HomePage';
import { ShopPage } from '@/pages/ShopPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { AppointmentsPage } from '@/pages/AppointmentsPage';
import { ClassesPage } from '@/pages/ClassesPage';
import { RetreatsPage } from '@/pages/RetreatsPage';
import { CommunityPage } from '@/pages/CommunityPage';
import { FundraisersPage } from '@/pages/FundraisersPage';
import { CartPage } from '@/pages/CartPage';
import { LoginPage, SignupPage } from '@/pages/AuthPages';
import { DashboardPage } from '@/pages/DashboardPage';
import { AdminPage } from '@/pages/AdminPage';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/shop/product/:productId" element={<ProductDetailPage />} />
                <Route path="/appointments" element={<AppointmentsPage />} />
                <Route path="/classes" element={<ClassesPage />} />
                <Route path="/retreats" element={<RetreatsPage />} />
                <Route path="/community" element={<CommunityPage />} />
                <Route path="/fundraisers" element={<FundraisersPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/admin" element={<AdminPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster position="top-right" richColors />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
