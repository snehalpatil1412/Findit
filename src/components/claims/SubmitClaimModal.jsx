import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { submitClaim } from '../../firebase/rtdbService';
import { compressImage } from '../../utils/imageCompressor';
import {
  HandCoins,
  ShieldCheck,
  Upload,
  Image as ImageIcon,
  X,
  Phone,
  Mail,
  AlertCircle
} from 'lucide-react';

export default function SubmitClaimModal({ isOpen, onClose, item }) {
  const { currentUser } = useAuth();
  const { showToast } = useNotification();

  const [proofDescription, setProofDescription] = useState('');
  const [secretAnswer, setSecretAnswer] = useState('');
  const [claimantPhone, setClaimantPhone] = useState('');
  const [proofImageBase64, setProofImageBase64] = useState('');
  const [imageMeta, setImageMeta] = useState(null);
  const [compressing, setCompressing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!item) return null;

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setCompressing(true);
      const res = await compressImage(file, 800, 0.7);
      setProofImageBase64(res.base64);
      setImageMeta(res);
      showToast(`Proof photo compressed to ${res.sizeKb} KB`, 'success');
    } catch (err) {
      showToast('Error processing proof image', 'error');
    } finally {
      setCompressing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      showToast('Please sign in to submit a claim', 'error');
      return;
    }
    if (!proofDescription.trim()) {
      showToast('Please provide an explanation of why this item belongs to you', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await submitClaim({
        itemId: item.id,
        itemTitle: item.title,
        itemType: item.type,
        itemCategory: item.category,
        itemLocation: item.location || '',
        ownerId: item.reporterId,
        ownerName: item.reporterName,
        ownerEmail: item.reporterEmail,
        claimantId: currentUser.id || currentUser.uid,
        claimantName: currentUser.name || currentUser.displayName || 'Community Member',
        claimantEmail: currentUser.email,
        claimantPhone: claimantPhone.trim(),
        proofDescription: proofDescription.trim(),
        secretAnswer: secretAnswer.trim(),
        proofImageBase64
      });

      showToast('Ownership claim submitted! The item finder will review your proof.', 'success');
      setProofDescription('');
      setSecretAnswer('');
      setClaimantPhone('');
      setProofImageBase64('');
      onClose();
    } catch (err) {
      showToast(err.message || 'Error submitting claim', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Claim Found Item" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Item Summary Header */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Claiming Found Item</span>
            <p className="font-bold text-slate-900 text-sm">{item.title}</p>
            <p className="text-slate-500 text-[11px]">{item.location} &bull; Reported by {item.reporterName}</p>
          </div>
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-bold text-[11px]">
            {item.category}
          </span>
        </div>

        {/* Proof Explanation */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Explanation of Ownership & Distinctive Marks *
          </label>
          <textarea
            required
            rows={3}
            value={proofDescription}
            onChange={(e) => setProofDescription(e.target.value)}
            placeholder="Explain why this item is yours: describe non-visible stickers, wallpaper, contents inside, purchase date, scratches, etc."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-campus-500 focus:outline-none"
          />
        </div>

        {/* Secret Challenge Answer (if finder set a challenge) */}
        {item.secretVerificationQuestion && (
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Finder's Verification Challenge</span>
            </div>
            <p className="text-[11px] text-amber-800">
              Question: <strong>"{item.secretVerificationQuestion}"</strong>
            </p>
            <input
              type="text"
              required
              value={secretAnswer}
              onChange={(e) => setSecretAnswer(e.target.value)}
              placeholder="Your answer to the finder's challenge..."
              className="w-full px-3 py-2 border border-amber-300 bg-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        )}

        {/* Contact info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              Your Email Address
            </label>
            <input
              type="email"
              disabled
              value={currentUser?.email || ''}
              className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              Mobile Phone (For Return Coordination)
            </label>
            <input
              type="tel"
              value={claimantPhone}
              onChange={(e) => setClaimantPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-campus-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Optional Proof Photo Upload */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Optional Proof Photo (Receipt, Serial Number, or Past Photo)
          </label>
          {proofImageBase64 ? (
            <div className="relative p-2 border border-slate-200 rounded-xl bg-slate-50 flex items-center gap-3">
              <img
                src={proofImageBase64}
                alt="Proof"
                className="w-14 h-14 object-cover rounded-lg border border-slate-200"
              />
              <div className="flex-1 text-xs">
                <p className="font-semibold text-slate-800">Proof photo attached</p>
                {imageMeta && (
                  <p className="text-[11px] text-emerald-600 font-medium">
                    {imageMeta.sizeKb} KB ({imageMeta.compressionRatio})
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setProofImageBase64('');
                  setImageMeta(null);
                }}
                className="p-1 rounded text-rose-500 hover:bg-rose-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="border border-dashed border-slate-300 hover:border-campus-400 rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer bg-slate-50/50 hover:bg-campus-50/20 transition">
              <Upload className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600 font-medium">
                {compressing ? 'Compressing...' : 'Upload verification photo'}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={compressing}
                className="hidden"
              />
            </label>
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
            disabled={submitting || compressing}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
          >
            <HandCoins className="w-4 h-4" />
            <span>{submitting ? 'Submitting...' : 'Submit Claim'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
