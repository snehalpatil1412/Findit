import React from 'react';
import ItemCard from '../components/items/ItemCard';
import { findMatchesForReport } from '../utils/smartMatcher';
import { deleteItem, markItemAsReturned } from '../firebase/rtdbService';
import { useNotification } from '../context/NotificationContext';
import {
  FileText,
  Sparkles,
  Trash2,
  CheckCircle2,
  PlusCircle,
  MapPin
} from 'lucide-react';

export default function MyReportsPage({
  items = [],
  currentUserId,
  onViewDetails,
  onClaimItem,
  onOpenReportModal
}) {
  const { showToast } = useNotification();

  const myReports = items.filter(
    (item) => currentUserId && item.reporterId === currentUserId && item.status !== 'returned'
  );

  const handleDelete = async (itemId, title) => {
    if (window.confirm(`Delete report for "${title}"?`)) {
      try {
        await deleteItem(itemId);
        showToast('Report deleted successfully', 'info');
      } catch (err) {
        showToast('Error deleting report', 'error');
      }
    }
  };

  const handleMarkResolved = async (itemId, title) => {
    if (window.confirm(`Mark "${title}" as recovered/resolved? It will be removed from active public listings.`)) {
      try {
        await markItemAsReturned(itemId);
        showToast(`"${title}" marked as resolved and removed from active listings!`, 'success');
      } catch (err) {
        showToast('Error updating item status', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-campus-600" />
            My Reported Items & Smart Match Radar
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your active lost and found reports. Our algorithm scans for potential matching items automatically.
          </p>
        </div>

        <button
          onClick={onOpenReportModal}
          className="flex items-center gap-2 px-4 py-2 bg-campus-600 hover:bg-campus-700 text-white rounded-xl text-xs font-bold shadow-sm transition self-end sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report Another Item</span>
        </button>
      </div>

      {myReports.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-200 space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">You haven't reported any items yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Lost something in a public space or found an item left behind? Post a report to begin tracking it.
          </p>
          <button
            onClick={onOpenReportModal}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-campus-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-campus-700 transition"
          >
            Post Your First Report
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {myReports.map((report) => {
            const matches = findMatchesForReport(report, items, 30);

            return (
              <div
                key={report.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4 hover:border-slate-300 transition"
              >
                {/* Top Summary of User's Report */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        report.type === 'lost' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {report.type}
                      </span>
                      <h3 className="text-base font-bold text-slate-900">{report.title}</h3>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                      <span>{report.category}</span>
                      {report.location && (
                        <>
                          <span>&bull;</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-campus-600" />
                            {report.location}
                          </span>
                        </>
                      )}
                      <span>&bull;</span>
                      <span>Date: {report.date}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleMarkResolved(report.id, report.title)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
                      title="Mark as returned/found and remove from public listings"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark as Resolved</span>
                    </button>
                    <button
                      onClick={() => onViewDetails(report)}
                      className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleDelete(report.id, report.title)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                      title="Delete Report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Smart Match Radar Section */}
                {matches.length > 0 ? (
                  <div className="p-4 bg-gradient-to-br from-indigo-50/80 to-sky-50/40 rounded-xl border border-indigo-200/90 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-indigo-950 font-bold text-xs">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <span>Smart Match Radar: {matches.length} Potential Match{matches.length > 1 ? 'es' : ''} Detected!</span>
                      </div>
                      <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
                        AI Multi-Factor
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {matches.map((matchedItem) => (
                        <div
                          key={matchedItem.id}
                          className="p-3 bg-white rounded-xl border border-indigo-100 shadow-xs flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-xs truncate">
                                {matchedItem.title}
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-extrabold shrink-0">
                                {matchedItem.matchScore}% Match
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              {matchedItem.location || 'Location specified'} &bull; {matchedItem.date}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => onViewDetails(matchedItem)}
                              className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition"
                            >
                              Inspect
                            </button>
                            {matchedItem.type === 'found' && (
                              <button
                                onClick={() => onClaimItem(matchedItem)}
                                className="px-3 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-xs"
                              >
                                Claim
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl text-slate-500 text-[11px] flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                    <span>No matches detected in opposing reports yet. We'll automatically alert you when a similar item is reported.</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
