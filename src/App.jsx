import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { subscribeToItems, subscribeToClaims } from './firebase/rtdbService';
import Navbar from './components/common/Navbar';
import ToastContainer from './components/common/Toast';
import AuthModal from './components/auth/AuthModal';
import ReportItemModal from './components/items/ReportItemModal';
import ItemDetailsModal from './components/items/ItemDetailsModal';
import SubmitClaimModal from './components/claims/SubmitClaimModal';

// Pages
import ActiveListingsPage from './pages/ActiveListingsPage';
import MyReportsPage from './pages/MyReportsPage';
import MyClaimsPage from './pages/MyClaimsPage';
import ReviewClaimsPage from './pages/ReviewClaimsPage';
import TransactionHistoryPage from './pages/TransactionHistoryPage';
import EmailsPage from './pages/EmailsPage';

import { CLAIM_STATUSES } from './utils/constants';

export default function App() {
  const { currentUser } = useAuth();
  const currentUserId = currentUser?.id || currentUser?.uid;

  const [activeTab, setActiveTab] = useState('listings');
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);

  // Modals state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedItemForDetails, setSelectedItemForDetails] = useState(null);
  const [selectedItemForClaim, setSelectedItemForClaim] = useState(null);

  // Subscribe to RTDB items & claims
  useEffect(() => {
    const unsubItems = subscribeToItems((itemList) => {
      setItems(itemList);
    });

    const unsubClaims = subscribeToClaims((claimList) => {
      setClaims(claimList);
    });

    return () => {
      unsubItems();
      unsubClaims();
    };
  }, []);

  // Compute pending review count for the current user's items
  const pendingReviewCount = claims.filter(
    (c) => currentUserId && c.ownerId === currentUserId && c.status === CLAIM_STATUSES.PENDING
  ).length;

  const handleOpenClaimModal = (item) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setSelectedItemForClaim(item);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReportModal={() => {
          if (!currentUser) setIsAuthModalOpen(true);
          else setIsReportModalOpen(true);
        }}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        pendingReviewCount={pendingReviewCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'listings' && (
          <ActiveListingsPage
            items={items}
            currentUserId={currentUserId}
            onViewDetails={(item) => setSelectedItemForDetails(item)}
            onClaimItem={handleOpenClaimModal}
            onOpenReportModal={() => {
              if (!currentUser) setIsAuthModalOpen(true);
              else setIsReportModalOpen(true);
            }}
          />
        )}

        {activeTab === 'my-reports' && (
          <MyReportsPage
            items={items}
            currentUserId={currentUserId}
            onViewDetails={(item) => setSelectedItemForDetails(item)}
            onClaimItem={handleOpenClaimModal}
            onOpenReportModal={() => {
              if (!currentUser) setIsAuthModalOpen(true);
              else setIsReportModalOpen(true);
            }}
          />
        )}

        {activeTab === 'my-claims' && (
          <MyClaimsPage
            claims={claims}
            currentUserId={currentUserId}
            onNavigateToListings={() => setActiveTab('listings')}
          />
        )}

        {activeTab === 'review-claims' && (
          <ReviewClaimsPage
            claims={claims}
            currentUserId={currentUserId}
          />
        )}

        {activeTab === 'history' && (
          <TransactionHistoryPage
            currentUserId={currentUserId}
            onNavigateToListings={() => setActiveTab('listings')}
          />
        )}

        {activeTab === 'emails' && (
          <EmailsPage />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            &copy; {new Date().getFullYear()} <strong>FindIt</strong> &ndash; Digital Lost &amp; Found for Public Spaces.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Powered by React 18, Vite &amp; Firebase</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ReportItemModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

      <ItemDetailsModal
        isOpen={Boolean(selectedItemForDetails)}
        onClose={() => setSelectedItemForDetails(null)}
        item={selectedItemForDetails}
        allItems={items}
        currentUserId={currentUserId}
        onClaimItem={handleOpenClaimModal}
        onSelectMatchItem={(matchedItem) => setSelectedItemForDetails(matchedItem)}
      />

      <SubmitClaimModal
        isOpen={Boolean(selectedItemForClaim)}
        onClose={() => setSelectedItemForClaim(null)}
        item={selectedItemForClaim}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Global Notifications */}
      <ToastContainer />
    </div>
  );
}
