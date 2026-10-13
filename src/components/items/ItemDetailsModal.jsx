import React from 'react';
import Modal from '../common/Modal';
import { TypeBadge, StatusBadge, CategoryBadge } from '../common/Badge';
import { findMatchesForReport } from '../../utils/smartMatcher';
import {
  MapPin,
  Calendar,
  User,
  ShieldAlert,
  HandCoins,
  Sparkles,
  Info
} from 'lucide-react';

export default function ItemDetailsModal({
  isOpen,
  onClose,
  item,
  allItems = [],
  currentUserId,
  onClaimItem,
  onSelectMatchItem
}) {
  if (!item) return null;

  const isReporter = currentUserId && (item.reporterId === currentUserId);
  const isFound = item.type === 'found';
  const isActive = item.status === 'active';

  // Compute smart matches if this is the user's reported item
  const potentialMatches = isReporter ? findMatchesForReport(item, allItems, 30) : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Item Details & Recovery" maxWidth="max-w-2xl">
      <div className="space-y-5 text-xs">
        {/* Header summary */}
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          {/* Image */}
          {item.hasImage && item.imageBase64 ? (
            <img
              src={item.imageBase64}
              alt={item.title}
              className="w-full sm:w-48 h-48 object-cover rounded-xl border border-slate-200 shrink-0"
            />
          ) : (
            <div className="w-full sm:w-48 h-36 bg-slate-100 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-slate-400 shrink-0">
              <span className="text-3xl mb-1">{item.type === 'lost' ? '🔍' : '📦'}</span>
              <span className="text-[11px] font-semibold text-slate-500">No Image Provided</span>
            </div>
          )}

          {/* Key Metadata */}
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap gap-1.5 items-center">
              <TypeBadge type={item.type} />
              <StatusBadge status={item.status} />
              <CategoryBadge category={item.category} />
            </div>

            <h2 className="text-base font-bold text-slate-900 leading-snug">
              {item.title}
            </h2>

            <div className="space-y-1.5 text-slate-600 pt-1">
              {item.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-campus-600 shrink-0" />
                  <span className="font-semibold text-slate-800">{item.location}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Reported Date: <strong>{item.date}</strong></span>
              </div>

              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Reported by: <strong>{item.reporterName}</strong> {isReporter && '(You)'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
          <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-campus-600" />
            Description
          </h4>
          <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
            {item.description}
          </p>
        </div>

        {/* Anti-fraud challenge notice for found item */}
        {isFound && item.secretVerificationQuestion && (
          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 space-y-1 text-amber-900">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Fraud Protection Challenge Active</span>
            </div>
            <p className="text-[11px] text-amber-800">
              The finder has protected this valuable item with a verification challenge. When submitting your claim, you will be required to answer:
            </p>
            <div className="mt-2 p-2 bg-white rounded border border-amber-200 font-medium italic text-slate-800">
              "{item.secretVerificationQuestion}"
            </div>
          </div>
        )}

        {/* Smart Matches Radar (if viewing own report) */}
        {isReporter && potentialMatches.length > 0 && (
          <div className="p-4 bg-gradient-to-br from-indigo-50/70 to-purple-50/40 rounded-xl border border-indigo-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-indigo-950 flex items-center gap-1.5 text-xs">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Smart Matches Detected ({potentialMatches.length})
              </h4>
              <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-semibold">
                Multi-Factor Algorithmic Pair
              </span>
            </div>

            <p className="text-[11px] text-indigo-900/80">
              Our smart matching algorithm detected these opposing reports with matching keywords and location:
            </p>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {potentialMatches.map((match) => (
                <div
                  key={match.id}
                  className="p-2.5 bg-white rounded-lg border border-indigo-100 hover:border-indigo-300 transition flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 truncate">{match.title}</span>
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                        {match.matchScore}% Match
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">
                      {match.location || 'Location specified'} &bull; {match.date}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSelectMatchItem(match);
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 hover:bg-indigo-50 rounded border border-indigo-200 transition"
                    >
                      Compare
                    </button>
                    {match.type === 'found' && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onClaimItem(match);
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition"
                      >
                        Claim
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            Close
          </button>

          {isFound && isActive && !isReporter && onClaimItem && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onClaimItem(item);
              }}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-sm transition flex items-center gap-1.5"
            >
              <HandCoins className="w-4 h-4" />
              <span>Submit Ownership Claim</span>
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
