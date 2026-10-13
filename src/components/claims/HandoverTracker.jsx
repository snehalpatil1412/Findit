import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { updateHandoverConfirmation } from '../../firebase/rtdbService';
import { useNotification } from '../../context/NotificationContext';
import {
  CheckCircle2,
  Clock,
  PackageCheck,
  Handshake,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function HandoverTracker({ claim, currentUserId }) {
  const { showToast } = useNotification();
  const [loading, setLoading] = useState(false);

  const isOwner = currentUserId === claim.ownerId;
  const isClaimant = currentUserId === claim.claimantId;

  const handover = claim.handoverStatus || {
    ownerSubmitted: false,
    claimantReceived: false
  };

  const isComplete = handover.ownerSubmitted && handover.claimantReceived;

  const handleToggleConfirmation = async (role, targetState) => {
    setLoading(true);
    try {
      const result = await updateHandoverConfirmation(claim, role, targetState);
      if (result.isBothCompleted) {
        // Fire confetti celebration!
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        showToast('Both users confirmed! Item successfully marked as RETURNED and archived to History.', 'success');
      } else {
        showToast(
          targetState
            ? `Confirmation recorded! Waiting for ${role === 'owner' ? 'claimant' : 'finder'} to confirm.`
            : 'Confirmation undone.',
          'info'
        );
      }
    } catch (err) {
      showToast(err.message || 'Error updating handover status', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gradient-to-br from-amber-50/60 to-orange-50/40 rounded-2xl border border-amber-200 space-y-4">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Handshake className="w-5 h-5 text-amber-600" />
          <h4 className="font-bold text-amber-950 text-xs">
            {isComplete ? 'Return Completed & Verified' : 'Dual-Confirmation Return Tracker'}
          </h4>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          isComplete ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'
        }`}>
          {isComplete ? 'Archived to History' : 'Awaiting Exchange'}
        </span>
      </div>

      {/* Two Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Step 1: Finder / Owner Handover */}
        <div className={`p-3 rounded-xl border transition ${
          handover.ownerSubmitted
            ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
            : 'bg-white border-slate-200 text-slate-700'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-[11px] text-slate-500">
              1. Finder / Reporter ({claim.ownerName})
            </span>
            {handover.ownerSubmitted ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> Handed Over
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                <Clock className="w-3 h-3" /> Pending Handover
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-600 mb-3">
            {handover.ownerSubmitted
              ? `Confirmed handover of "${claim.itemTitle}".`
              : 'Marks item as given back to claimant.'}
          </p>

          {isOwner && !isComplete && (
            <button
              type="button"
              disabled={loading}
              onClick={() => handleToggleConfirmation('owner', !handover.ownerSubmitted)}
              className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                handover.ownerSubmitted
                  ? 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'
                  : 'bg-campus-600 hover:bg-campus-700 text-white shadow-xs'
              }`}
            >
              <PackageCheck className="w-3.5 h-3.5" />
              <span>{handover.ownerSubmitted ? 'Undo Handover' : 'Mark as Handed Over'}</span>
            </button>
          )}
        </div>

        {/* Step 2: Claimant Receipt */}
        <div className={`p-3 rounded-xl border transition ${
          handover.claimantReceived
            ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
            : 'bg-white border-slate-200 text-slate-700'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-[11px] text-slate-500">
              2. Claimant ({claim.claimantName})
            </span>
            {handover.claimantReceived ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> Received
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                <Clock className="w-3 h-3" /> Pending Receipt
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-600 mb-3">
            {handover.claimantReceived
              ? `Confirmed receiving "${claim.itemTitle}".`
              : 'Marks item as safely received back in person.'}
          </p>

          {isClaimant && !isComplete && (
            <button
              type="button"
              disabled={loading}
              onClick={() => handleToggleConfirmation('claimant', !handover.claimantReceived)}
              className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                handover.claimantReceived
                  ? 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
              }`}
            >
              <PackageCheck className="w-3.5 h-3.5" />
              <span>{handover.claimantReceived ? 'Undo Received' : 'Mark as Received'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Completion message */}
      {isComplete ? (
        <div className="p-3 bg-emerald-100/80 rounded-xl border border-emerald-300 flex items-center gap-2 text-emerald-900 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Exchange verified by both members! This item is automatically archived to your personal History tab.
          </span>
        </div>
      ) : (
        <p className="text-[11px] text-slate-500 text-center">
          &bull; Both members must confirm before the item is closed and moved to transaction history.
        </p>
      )}
    </div>
  );
}
