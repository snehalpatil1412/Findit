import React from 'react';
import { StatusBadge, CategoryBadge } from '../components/common/Badge';
import HandoverTracker from '../components/claims/HandoverTracker';
import { CLAIM_STATUSES } from '../utils/constants';
import {
  HandCoins,
  Clock,
  CheckCircle,
  XCircle,
  Mail,
  User,
  AlertTriangle
} from 'lucide-react';

export default function MyClaimsPage({
  claims = [],
  currentUserId,
  onNavigateToListings
}) {
  const myClaims = claims.filter(
    (claim) => currentUserId && claim.claimantId === currentUserId
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <HandCoins className="w-5 h-5 text-campus-600" />
          My Submitted Claims
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Track the status of your ownership claims and complete the return exchange confirmation.
        </p>
      </div>

      {myClaims.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-200 space-y-3">
          <HandCoins className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">You haven't claimed any items</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse the active found listings. If you recognize something that belongs to you, submit a claim.
          </p>
          <button
            onClick={onNavigateToListings}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-campus-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-campus-700 transition"
          >
            Browse Active Found Listings
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {myClaims.map((claim) => (
            <div
              key={claim.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4 hover:border-slate-300 transition"
            >
              {/* Claim Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{claim.itemTitle}</h3>
                    <StatusBadge status={claim.status} />
                  </div>
                  <p className="text-xs text-slate-500">
                    Reported by <strong>{claim.ownerName}</strong> &bull; Submitted on{' '}
                    {new Date(claim.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <CategoryBadge category={claim.itemCategory} />
                </div>
              </div>

              {/* Claimant's own submitted proof note */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                <p className="font-bold text-slate-900">Your Submitted Proof:</p>
                <p className="leading-relaxed">{claim.proofDescription}</p>
                {claim.secretAnswer && (
                  <p className="text-[11px] text-amber-900 mt-1">
                    <span className="font-semibold">Challenge Answer:</span> "{claim.secretAnswer}"
                  </p>
                )}
              </div>

              {/* Status Specific Banners */}
              {claim.status === CLAIM_STATUSES.PENDING && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-2 text-amber-900 text-xs">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Your claim is pending review by <strong>{claim.ownerName}</strong>. You will be notified via email when approved!
                  </span>
                </div>
              )}

              {claim.status === CLAIM_STATUSES.REJECTED && (
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 flex items-start gap-2 text-rose-900 text-xs">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Claim was rejected by finder:</span>
                    <p className="mt-0.5 text-rose-800">
                      {claim.rejectionReason || 'Proof provided did not match the item specifications.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Handover Tracker (If approved, in handover, or completed) */}
              {(claim.status === CLAIM_STATUSES.APPROVED || claim.status === CLAIM_STATUSES.COMPLETED) && (
                <HandoverTracker claim={claim} currentUserId={currentUserId} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
