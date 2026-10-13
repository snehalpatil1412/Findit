import React, { useState } from 'react';
import { StatusBadge, CategoryBadge } from '../components/common/Badge';
import ReviewClaimModal from '../components/claims/ReviewClaimModal';
import HandoverTracker from '../components/claims/HandoverTracker';
import { CLAIM_STATUSES } from '../utils/constants';
import {
  Scale,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  ShieldCheck,
  Mail,
  UserCheck
} from 'lucide-react';

export default function ReviewClaimsPage({
  claims = [],
  currentUserId
}) {
  const [selectedClaimForReview, setSelectedClaimForReview] = useState(null);

  // Filter claims on items reported by current user
  const incomingClaims = claims.filter(
    (claim) => currentUserId && claim.ownerId === currentUserId
  );

  const pendingClaims = incomingClaims.filter(c => c.status === CLAIM_STATUSES.PENDING);
  const activeHandoverClaims = incomingClaims.filter(
    c => c.status === CLAIM_STATUSES.APPROVED || c.status === CLAIM_STATUSES.COMPLETED
  );
  const rejectedClaims = incomingClaims.filter(c => c.status === CLAIM_STATUSES.REJECTED);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Scale className="w-5 h-5 text-campus-600" />
          Review Incoming Claims
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Review ownership proofs submitted for items you found and coordinate safe return handovers.
        </p>
      </div>

      {incomingClaims.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-200 space-y-3">
          <Scale className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No claims submitted for your reports</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When another community member submits an ownership claim on an item you found, it will appear here for your review.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Section 1: Pending Claims */}
          {pendingClaims.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                <h3 className="font-bold text-slate-900 text-sm">
                  Awaiting Your Decision ({pendingClaims.length})
                </h3>
              </div>

              <div className="space-y-4">
                {pendingClaims.map((claim) => (
                  <div
                    key={claim.id}
                    className="bg-white rounded-2xl p-5 border-2 border-amber-200/90 shadow-sm space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-slate-900">{claim.itemTitle}</h4>
                          <StatusBadge status={claim.status} />
                        </div>
                        <p className="text-xs text-slate-500">
                          Claimed by <strong className="text-slate-700">{claim.claimantName}</strong> ({claim.claimantEmail})
                        </p>
                      </div>

                      <button
                        onClick={() => setSelectedClaimForReview(claim)}
                        className="px-4 py-2 bg-campus-600 hover:bg-campus-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 self-end sm:self-auto"
                      >
                        <Scale className="w-3.5 h-3.5" />
                        <span>Review Proof & Decide</span>
                      </button>
                    </div>

                    {/* Proof preview snippet */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                      <p className="font-semibold text-slate-900 mb-0.5">Submitted Proof:</p>
                      <p className="line-clamp-2 italic text-slate-600 leading-relaxed">
                        "{claim.proofDescription}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Approved Claims & In Handover */}
          {activeHandoverClaims.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Approved & Exchange In Progress ({activeHandoverClaims.length})
                </h3>
              </div>

              <div className="space-y-4">
                {activeHandoverClaims.map((claim) => (
                  <div
                    key={claim.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-slate-900">{claim.itemTitle}</h4>
                          <StatusBadge status={claim.status} />
                        </div>
                        <p className="text-xs text-slate-500">
                          Claimant: <strong className="text-slate-700">{claim.claimantName}</strong> &bull; {claim.claimantEmail}
                        </p>
                      </div>

                      <CategoryBadge category={claim.itemCategory} />
                    </div>

                    {/* Interactive Handover Tracker */}
                    <HandoverTracker claim={claim} currentUserId={currentUserId} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Past Rejected Claims */}
          {rejectedClaims.length > 0 && (
            <div className="space-y-3 opacity-75">
              <h3 className="font-bold text-slate-500 text-xs uppercase tracking-wider">
                Rejected Claims ({rejectedClaims.length})
              </h3>
              <div className="space-y-2">
                {rejectedClaims.map((claim) => (
                  <div key={claim.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">{claim.itemTitle}</span> &bull; Claimed by {claim.claimantName}
                      <p className="text-[11px] text-rose-600 mt-0.5">Reason: {claim.rejectionReason}</p>
                    </div>
                    <StatusBadge status="rejected" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Review Modal Dialog */}
      {selectedClaimForReview && (
        <ReviewClaimModal
          isOpen={Boolean(selectedClaimForReview)}
          onClose={() => setSelectedClaimForReview(null)}
          claim={selectedClaimForReview}
        />
      )}
    </div>
  );
}
