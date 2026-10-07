import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { ToastProvider, useToast } from './context/ToastContext.tsx';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';

// Views
import { HomeView } from './views/HomeView.tsx';
import { CatalogView } from './views/CatalogView.tsx';
import { DetailView } from './views/DetailView.tsx';
import { BovineFormView } from './views/BovineFormView.tsx';
import { CartView } from './views/CartView.tsx';
import { CheckoutView } from './views/CheckoutView.tsx';
import { InvoiceView } from './views/InvoiceView.tsx';
import { AuthView } from './views/AuthView.tsx';
import { SalesHistoryView } from './views/SalesHistoryView.tsx';
import { InventoryView } from './views/InventoryView.tsx';
import { ReportsView } from './views/ReportsView.tsx';
import { UsersView } from './views/UsersView.tsx';
import { AboutView, ContactView } from './views/StaticViews.tsx';

function MainApp() {
  const { user, isAdmin, canAccessAdmin } = useAuth();
  const { showToast } = useToast();

  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParams, setViewParams] = useState<any>({});

  // Route protector (Business Rule: protect admin routes & redirect clients with message)
  const handleNavigate = (view: string, params: any = {}) => {
    // Admin only routes
    if (['bovine-form', 'reports', 'users'].includes(view)) {
      if (!isAdmin) {
        showToast('Acceso denegado: Esta sección requiere rol de Administrador.', 'error');
        setCurrentView('home');
        setViewParams({});
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    // Staff only routes (Admin or Vendor)
    if (['sales-history', 'inventory'].includes(view)) {
      if (!canAccessAdmin) {
        showToast('Acceso denegado: Se requiere rol de Vendedor o Administrador.', 'error');
        setCurrentView('home');
        setViewParams({});
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    setCurrentView(view);
    setViewParams(params || {});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 font-sans text-stone-800 antialiased selection:bg-rose-100 selection:text-[#B3202A]">
      <Header 
        currentView={currentView} 
        onNavigate={handleNavigate}
      />

      <main className="flex-1">
        {currentView === 'home' && <HomeView onNavigate={handleNavigate} />}
        
        {currentView === 'catalog' && (
          <CatalogView 
            initialFilters={viewParams} 
            onNavigate={handleNavigate} 
          />
        )}

        {currentView === 'detail' && (
          <DetailView 
            bovineId={viewParams.id} 
            onNavigate={handleNavigate} 
          />
        )}

        {currentView === 'bovine-form' && (
          <BovineFormView 
            editId={viewParams.id} 
            onNavigate={handleNavigate} 
          />
        )}

        {currentView === 'cart' && <CartView onNavigate={handleNavigate} />}
        
        {currentView === 'checkout' && <CheckoutView onNavigate={handleNavigate} />}
        
        {currentView === 'invoice' && (
          <InvoiceView 
            invoiceId={viewParams.id} 
            onNavigate={handleNavigate} 
          />
        )}

        {currentView === 'auth' && <AuthView onNavigate={handleNavigate} />}
        
        {currentView === 'sales-history' && <SalesHistoryView onNavigate={handleNavigate} />}
        
        {currentView === 'inventory' && <InventoryView onNavigate={handleNavigate} />}
        
        {currentView === 'reports' && <ReportsView onNavigate={handleNavigate} />}
        
        {currentView === 'users' && <UsersView onNavigate={handleNavigate} />}
        
        {currentView === 'about' && <AboutView onNavigate={handleNavigate} />}
        
        {currentView === 'contact' && <ContactView onNavigate={handleNavigate} />}
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <MainApp />
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}
