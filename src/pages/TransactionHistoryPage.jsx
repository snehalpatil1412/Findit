import React, { useState, useEffect } from 'react';
import HistoryCard from '../components/history/HistoryCard';
import { subscribeToUserHistory, deleteUserHistoryEntry } from '../firebase/rtdbService';
import { useNotification } from '../context/NotificationContext';
import { History, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export default function TransactionHistoryPage({ currentUserId, onNavigateToListings }) {
  const { showToast } = useNotification();
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId) {
      setHistoryList([]);
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToUserHistory(currentUserId, (records) => {
      setHistoryList(records);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUserId]);

  const handleDeleteHistory = async (historyId) => {
    if (window.confirm('Remove this transaction record from your personal history?')) {
      try {
        await deleteUserHistoryEntry(currentUserId, historyId);
        showToast('Record removed from your personal history view', 'info');
      } catch (err) {
        showToast('Error removing record', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <History className="w-5 h-5 text-campus-600" />
          Verified Transaction History
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Archived records of items successfully returned with verified dual confirmations.
        </p>
      </div>

      {/* Info Notice */}
      <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center gap-3 text-xs text-emerald-950">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
        <p className="leading-relaxed">
          <strong>Dual-Confirmation Protection:</strong> Items are only closed and moved here after both the finder marks "Submitted" and the claimant marks "Received". Deleting an entry here removes it only from your view.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">
          Loading history records...
        </div>
      ) : historyList.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-200 space-y-3">
          <History className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No completed return transactions yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Once you and another community member complete a handover and both confirm receipt, the record will automatically be archived here.
          </p>
          <button
            onClick={onNavigateToListings}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-campus-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-campus-700 transition"
          >
            Explore Active Listings
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {historyList.map((record) => (
            <HistoryCard
              key={record.id}
              record={record}
              onDelete={handleDeleteHistory}
            />
          ))}
        </div>
      )}
    </div>
  );
}
