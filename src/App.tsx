import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProformaProvider, useProforma } from './context/ProformaContext';
import { Navbar } from './components/Navbar';
import { FinancialDashboard } from './components/FinancialDashboard';
import { ProformaList } from './components/ProformaList';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { AuthModal } from './components/AuthModal';
import { ProformaFormModal } from './components/ProformaFormModal';
import { ProformaViewModal } from './components/ProformaViewModal';
import { RecordPaymentModal } from './components/RecordPaymentModal';
import { SettingsModal } from './components/SettingsModal';
import { LoginPage } from './components/LoginPage';
import { Proforma } from './types/proforma';
import { Lock, AlertCircle, LogOut } from 'lucide-react';

function AppContent() {
  const {
    currentView,
    selectedProforma,
    setSelectedProforma,
    viewModalOpen,
    setViewModalOpen,
    paymentModalProforma,
    setPaymentModalProforma,
    settingsModalOpen,
    setSettingsModalOpen,
    proformas,
  } = useProforma();

  const { currentUser, activeEnterprise, logout } = useAuth();

  const [isSuperAdminView, setIsSuperAdminView] = useState<boolean>(() => {
    return currentUser?.role === 'super_admin';
  });

  // Automatically update view when user logs in or switches
  React.useEffect(() => {
    if (currentUser?.role === 'super_admin') {
      setIsSuperAdminView(true);
    } else {
      setIsSuperAdminView(false);
    }
  }, [currentUser?.role]);

  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [formProforma, setFormProforma] = useState<Proforma | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

  // If user is not authenticated, display the Login Page first!
  if (!currentUser) {
    return <LoginPage />;
  }

  const handleOpenNewProforma = () => {
    setFormProforma(null);
    setIsFormOpen(true);
  };

  const handleEditProforma = (p: Proforma) => {
    setFormProforma(p);
    setIsFormOpen(true);
  };

  const handleViewProforma = (id: string) => {
    const found = proformas.find((p) => p.id === id);
    if (found) {
      setSelectedProforma(found);
      setViewModalOpen(true);
    }
  };

  const handleRecordPayment = (id: string) => {
    const found = proformas.find((p) => p.id === id);
    if (found) {
      setPaymentModalProforma(found);
    }
  };

  // Check if current enterprise account is blocked
  const isBlocked = activeEnterprise?.status === 'blocked';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <Navbar
        onOpenNewProforma={handleOpenNewProforma}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        isSuperAdminView={isSuperAdminView}
        setIsSuperAdminView={setIsSuperAdminView}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* If Account is Blocked */}
        {isBlocked && !isSuperAdminView ? (
          <div className="max-w-xl mx-auto my-12 bg-white border border-rose-200 rounded-2xl p-8 shadow-xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Compte Entreprise Suspendu
            </h2>
            <div className="p-3 bg-rose-50 rounded-xl text-rose-800 text-xs leading-relaxed border border-rose-100">
              <AlertCircle className="w-4 h-4 inline-block mr-1.5 mb-0.5" />
              Ce compte d'entreprise ({activeEnterprise?.companyName}) a été <strong>bloqué par le Super Administrateur</strong>. 
              {activeEnterprise?.blockReason && (
                <div className="mt-1 font-semibold">Motif : {activeEnterprise.blockReason}</div>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Veuillez contacter le support ou l'administrateur de la plateforme pour rétablir votre accès.
            </p>
            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                onClick={logout}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
              >
                <LogOut className="w-4 h-4" />
                <span>Se déconnecter</span>
              </button>
              <button
                onClick={() => setAuthModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all"
              >
                <span>Changer d'identifiant</span>
              </button>
            </div>
          </div>
        ) : isSuperAdminView ? (
          /* Super Admin Dashboard */
          <SuperAdminDashboard
            onOpenCompanyApp={(enterpriseId) => {
              setIsSuperAdminView(false);
            }}
          />
        ) : (
          /* Regular Enterprise App (Financial Dashboard or Proformas List) */
          <>
            {currentView === 'dashboard' ? (
              <FinancialDashboard
                onOpenNewProforma={handleOpenNewProforma}
                onViewProforma={handleViewProforma}
                onRecordPayment={handleRecordPayment}
              />
            ) : (
              <ProformaList
                onOpenNewProforma={handleOpenNewProforma}
                onEditProforma={handleEditProforma}
                onViewProforma={handleViewProforma}
                onRecordPayment={handleRecordPayment}
              />
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="no-print border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ProformaPulse Enterprise · Gestion Multi-Entreprises & Devis Proforma</span>
          <span>Espace Super Admin & Sécurisation Locale</span>
        </div>
      </footer>

      {/* Auth / Switch Account Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Proforma Modals */}
      <ProformaFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={formProforma}
      />

      <ProformaViewModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        proforma={selectedProforma}
        onOpenRecordPayment={handleRecordPayment}
        onEdit={(p) => {
          setViewModalOpen(false);
          handleEditProforma(p);
        }}
      />

      <RecordPaymentModal
        isOpen={!!paymentModalProforma}
        onClose={() => setPaymentModalProforma(null)}
        proforma={paymentModalProforma}
      />

      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ProformaProvider>
        <AppContent />
      </ProformaProvider>
    </AuthProvider>
  );
}
