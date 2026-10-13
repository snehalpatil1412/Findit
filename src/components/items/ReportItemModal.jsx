import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { createItem } from '../../firebase/rtdbService';
import { compressImage } from '../../utils/imageCompressor';
import { ITEM_CATEGORIES, ITEM_TYPES } from '../../utils/constants';
import {
  Upload,
  ShieldCheck,
  Calendar,
  MapPin,
  Tag,
  X
} from 'lucide-react';

export default function ReportItemModal({ isOpen, onClose }) {
  const { currentUser } = useAuth();
  const { showToast } = useNotification();

  const [type, setType] = useState(ITEM_TYPES.LOST);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(ITEM_CATEGORIES[0]);
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [secretQuestion, setSecretQuestion] = useState('');

  // Image upload state
  const [imageBase64, setImageBase64] = useState('');
  const [imageMeta, setImageMeta] = useState(null);
  const [compressing, setCompressing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setCompressing(true);
      const result = await compressImage(file, 800, 0.7);
      setImageBase64(result.base64);
      setImageMeta(result);
      showToast(`Image compressed to ${result.sizeKb} KB (${result.compressionRatio})`, 'success');
    } catch (err) {
      showToast(err.message || 'Error processing image', 'error');
    } finally {
      setCompressing(false);
    }
  };

  const handleRemoveImage = () => {
    setImageBase64('');
    setImageMeta(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      showToast('Please sign in to report an item', 'error');
      return;
    }
    if (!title.trim() || !description.trim()) {
      showToast('Please provide an item name and description', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await createItem({
        type,
        title: title.trim(),
        category,
        location: location.trim(),
        date,
        description: description.trim(),
        secretVerificationQuestion: type === ITEM_TYPES.FOUND ? secretQuestion.trim() : '',
        imageBase64,
        reporterId: currentUser.id || currentUser.uid,
        reporterName: currentUser.name || currentUser.displayName || 'Community Member',
        reporterEmail: currentUser.email
      });

      showToast(`Successfully reported ${type === ITEM_TYPES.LOST ? 'lost' : 'found'} item!`, 'success');
      setTitle('');
      setLocation('');
      setDescription('');
      setSecretQuestion('');
      handleRemoveImage();
      onClose();
    } catch (err) {
      showToast(err.message || 'Error creating report', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Report an Item" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Lost vs Found Toggle */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setType(ITEM_TYPES.LOST)}
            className={`py-2.5 rounded-lg font-bold text-xs transition ${
              type === ITEM_TYPES.LOST
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            I Lost Something
          </button>
          <button
            type="button"
            onClick={() => setType(ITEM_TYPES.FOUND)}
            className={`py-2.5 rounded-lg font-bold text-xs transition ${
              type === ITEM_TYPES.FOUND
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            I Found Something
          </button>
        </div>

        {/* Item Title */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Item Name & Model *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              type === ITEM_TYPES.LOST
                ? 'e.g., Midnight Blue MacBook Air with Dev Stickers'
                : 'e.g., Black Leather Bi-fold Wallet'
            }
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-campus-500 focus:outline-none"
          />
        </div>

        {/* Category & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-campus-500 focus:outline-none bg-white"
            >
              {ITEM_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Date {type === ITEM_TYPES.LOST ? 'Lost' : 'Found'} *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-campus-500 focus:outline-none bg-white"
            />
          </div>
        </div>

        {/* Address / Location (Simple single field) */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            Address / Location *
          </label>
          <input
            type="text"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. JFK Airport Terminal 4 Gate B12, Central Metro Platform 2, Westfield Mall Food Court"
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-campus-500 focus:outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Detailed Description *
          </label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe colors, engravings, brand name, distinctive marks, or contents..."
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-campus-500 focus:outline-none"
          />
        </div>

        {/* Anti-Fraud Secret Verification Question (For Found Items) */}
        {type === ITEM_TYPES.FOUND && (
          <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/90 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Anti-Fraud Ownership Challenge (Recommended)</span>
            </div>
            <p className="text-[11px] text-amber-800">
              Set a question only the legitimate owner would know (e.g. <em>"What is the screen lock wallpaper?"</em> or <em>"What card is in the front slot?"</em>). Claimants will have to answer this before you accept their claim!
            </p>
            <input
              type="text"
              value={secretQuestion}
              onChange={(e) => setSecretQuestion(e.target.value)}
              placeholder="e.g. What specific keychain or sticker is attached?"
              className="w-full px-3 py-2 text-xs border border-amber-300 bg-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        )}

        {/* Image Upload with Client Compression */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Item Photo (Zero-Cost Compressed Base64)
          </label>

          {imageBase64 ? (
            <div className="relative p-2 border border-slate-200 rounded-xl bg-slate-50 flex items-center gap-3">
              <img
                src={imageBase64}
                alt="Compressed preview"
                className="w-16 h-16 object-cover rounded-lg border border-slate-200"
              />
              <div className="flex-1 text-xs">
                <p className="font-semibold text-slate-800">Image Compressed Successfully</p>
                {imageMeta && (
                  <p className="text-[11px] text-emerald-600 font-medium">
                    Optimized to {imageMeta.sizeKb} KB ({imageMeta.compressionRatio})
                  </p>
                )}
                <p className="text-[10px] text-slate-400">Stored directly in Realtime Database with zero cloud fees.</p>
              </div>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-slate-300 hover:border-campus-400 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-campus-50/20 transition">
              <Upload className="w-6 h-6 text-slate-400 mb-1" />
              <span className="text-xs font-semibold text-slate-700">
                {compressing ? 'Compressing photo...' : 'Click to upload photo'}
              </span>
              <span className="text-[10px] text-slate-400">
                Automatically compressed to &le; 100KB for free database storage
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

        {/* Submit Buttons */}
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
            className="px-5 py-2 bg-campus-600 hover:bg-campus-700 text-white rounded-lg font-bold shadow-sm transition disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Post Item Report'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
