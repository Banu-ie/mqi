import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import AdminLayout from "./components/layout/AdminLayout";

import Home from "./pages/Home";
import About from "./pages/About";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Contact from "./pages/Contact";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminServices from "./pages/admin/AdminServices";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminContent from "./pages/admin/AdminContent";
import AdminContact from "./pages/admin/AdminContact";

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

function ProtectedAdmin({ children }: { children: React.ReactNode }) {
  const { admin, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-[#F8FAFF]"><div className="w-8 h-8 border-2 border-[#3B6FE0] border-t-transparent rounded-full animate-spin" /></div>;
  if (!admin) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={
            <PublicLayout>
              <Home />
            </PublicLayout>
          }
        />
        <Route
          path="/haqqimizda"
          element={
            <PublicLayout>
              <About />
            </PublicLayout>
          }
        />
        <Route
          path="/mehsullar"
          element={
            <PublicLayout>
              <Products />
            </PublicLayout>
          }
        />
        <Route
          path="/mehsullar/:id"
          element={
            <PublicLayout>
              <ProductDetail />
            </PublicLayout>
          }
        />
        <Route
          path="/xidmetler"
          element={
            <PublicLayout>
              <Services />
            </PublicLayout>
          }
        />
        <Route
          path="/xidmetler/:id"
          element={
            <PublicLayout>
              <ServiceDetail />
            </PublicLayout>
          }
        />
        <Route
          path="/tedbirler"
          element={
            <PublicLayout>
              <Events />
            </PublicLayout>
          }
        />
        <Route
          path="/tedbirler/:id"
          element={
            <PublicLayout>
              <EventDetail />
            </PublicLayout>
          }
        />
        <Route
          path="/elaqe"
          element={
            <PublicLayout>
              <Contact />
            </PublicLayout>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedAdmin>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedAdmin>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedAdmin>
              <AdminLayout>
                <AdminProducts />
              </AdminLayout>
            </ProtectedAdmin>
          }
        />
        <Route
          path="/admin/services"
          element={
            <ProtectedAdmin>
              <AdminLayout>
                <AdminServices />
              </AdminLayout>
            </ProtectedAdmin>
          }
        />
        <Route
          path="/admin/events"
          element={
            <ProtectedAdmin>
              <AdminLayout>
                <AdminEvents />
              </AdminLayout>
            </ProtectedAdmin>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <ProtectedAdmin>
              <AdminLayout>
                <AdminCategories />
              </AdminLayout>
            </ProtectedAdmin>
          }
        />
        <Route
          path="/admin/content"
          element={
            <ProtectedAdmin>
              <AdminLayout>
                <AdminContent />
              </AdminLayout>
            </ProtectedAdmin>
          }
        />
        <Route
          path="/admin/contact"
          element={
            <ProtectedAdmin>
              <AdminLayout>
                <AdminContact />
              </AdminLayout>
            </ProtectedAdmin>
          }
        />

        {/* Redirect /admin → /admin/login */}
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return <AuthProvider><AppRoutes /></AuthProvider>;
}
