import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useNotification } from '../../context/NotificationContext';
import { reviewClaim } from '../../firebase/rtdbService';
import { CLAIM_STATUSES } from '../../utils/constants';
import {
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  ShieldCheck,
  Send,
  MapPin,
  FileText
} from 'lucide-react';

export default function ReviewClaimModal({ isOpen, onClose, claim }) {
  const { showToast } = useNotification();

  const [decision, setDecision] = useState('approve'); // 'approve' | 'reject'
  const [returnInstructions, setReturnInstructions] = useState(
    'Please meet me at the public information desk with identification to claim this item.'
  );
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!claim) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (decision === 'approve') {
        await reviewClaim(claim, CLAIM_STATUSES.APPROVED, '', returnInstructions);
        showToast('Claim approved! Coordination email notification sent.', 'success');
      } else {
        if (!rejectionReason.trim()) {
          showToast('Please provide a reason for rejecting the claim', 'error');
          setSubmitting(false);
          return;
        }
        await reviewClaim(claim, CLAIM_STATUSES.REJECTED, rejectionReason.trim());
        showToast('Claim rejected.', 'info');
      }
      onClose();
    } catch (err) {
      showToast(err.message || 'Error updating claim', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Review Ownership Claim" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Item Header */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-[10px] text-slate-500 uppercase font-bold">Item Being Claimed</p>
          <h4 className="font-bold text-slate-900 text-sm">{claim.itemTitle}</h4>
          <p className="text-slate-500">{claim.itemLocation}</p>
        </div>

        {/* Claimant Info */}
        <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-200/80 space-y-2">
          <h5 className="font-bold text-slate-800">Claimant Profile</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
            <div>
              <span className="font-semibold text-slate-900">Name:</span> {claim.claimantName}
            </div>
            <div className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              <span>{claim.claimantEmail}</span>
            </div>
            {claim.claimantPhone && (
              <div className="flex items-center gap-1 sm:col-span-2">
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                <span>{claim.claimantPhone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Claimant's Proof Description */}
        <div className="space-y-1">
          <label className="block font-bold text-slate-800">
            Claimant's Proof & Description
          </label>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed whitespace-pre-wrap">
            {claim.proofDescription}
          </div>
        </div>

        {/* Secret Challenge Answer */}
        {claim.secretAnswer && (
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1 text-amber-950">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Answer to Challenge Question</span>
            </div>
            <p className="p-2 bg-white rounded border border-amber-200 text-slate-800 font-medium">
              "{claim.secretAnswer}"
            </p>
          </div>
        )}

        {/* Attached Proof Image */}
        {claim.proofImageBase64 && (
          <div className="space-y-1">
            <label className="block font-bold text-slate-800">
              Claimant's Attached Proof Photo
            </label>
            <img
              src={claim.proofImageBase64}
              alt="Proof attached by claimant"
              className="max-h-48 rounded-xl border border-slate-200 object-cover"
            />
          </div>
        )}

        {/* Decision Toggle */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setDecision('approve')}
              className={`py-2 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                decision === 'approve'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Approve Claim
            </button>
            <button
              type="button"
              onClick={() => setDecision('reject')}
              className={`py-2 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                decision === 'reject'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              Reject Claim
            </button>
          </div>

          {/* Conditional Input based on decision */}
          {decision === 'approve' ? (
            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">
                Return & Meeting Instructions (Dispatched in Email)
              </label>
              <textarea
                rows={2}
                value={returnInstructions}
                onChange={(e) => setReturnInstructions(e.target.value)}
                placeholder="Where and when to meet (e.g. Central Library Front Desk tomorrow at 3 PM)..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-campus-500 focus:outline-none"
              />
            </div>
          ) : (
            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">
                Reason for Rejection *
              </label>
              <textarea
                required
                rows={2}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why the proof was insufficient (e.g. serial number did not match)..."
                className="w-full px-3 py-2 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={`px-5 py-2 text-white rounded-lg font-bold shadow-sm transition disabled:opacity-50 flex items-center gap-1.5 ${
              decision === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{decision === 'approve' ? 'Confirm Approval & Send Email' : 'Submit Rejection'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
