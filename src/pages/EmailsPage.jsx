import React, { useState, useEffect } from 'react';
import { getEmailActivityLogs } from '../utils/emailService';
import { useNotification } from '../context/NotificationContext';
import Modal from '../components/common/Modal';
import {
  Mail,
  Send,
  Clock,
  User,
  MapPin,
  FileText,
  Trash2,
  ExternalLink,
  CheckCircle2,
  KeyRound
} from 'lucide-react';

export default function EmailsPage() {
  const { showToast } = useNotification();
  const [logs, setLogs] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showConfigCard, setShowConfigCard] = useState(false);

  // EmailJS form state for in-page configuration
  const [serviceId, setServiceId] = useState(
    localStorage.getItem('findit_emailjs_service_id') || ''
  );
  const [templateId, setTemplateId] = useState(
    localStorage.getItem('findit_emailjs_template_id') || ''
  );
  const [publicKey, setPublicKey] = useState(
    localStorage.getItem('findit_emailjs_public_key') || ''
  );

  const loadLogs = () => {
    setLogs(getEmailActivityLogs());
  };

  useEffect(() => {
    loadLogs();
    const handleEmailEvent = () => loadLogs();
    window.addEventListener('findit_email_logged', handleEmailEvent);
    return () => window.removeEventListener('findit_email_logged', handleEmailEvent);
  }, []);

  const handleClearLogs = () => {
    if (window.confirm('Clear all recorded email coordination logs?')) {
      localStorage.removeItem('findit_sent_emails_log');
      loadLogs();
      showToast('Email activity logs cleared', 'info');
    }
  };

  const handleSaveEmailConfig = (e) => {
    e.preventDefault();
    localStorage.setItem('findit_emailjs_service_id', serviceId.trim());
    localStorage.setItem('findit_emailjs_template_id', templateId.trim());
    localStorage.setItem('findit_emailjs_public_key', publicKey.trim());
    showToast('EmailJS configuration saved!', 'success');
    setShowConfigCard(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Mail className="w-5 h-5 text-campus-600" />
            Email Coordination & Notifications
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            View all official handover coordination emails generated when claims are approved.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setShowConfigCard(!showConfigCard)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
          >
            <KeyRound className="w-3.5 h-3.5 text-slate-500" />
            <span>EmailJS Setup</span>
          </button>

          {logs.length > 0 && (
            <button
              onClick={handleClearLogs}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Logs</span>
            </button>
          )}
        </div>
      </div>

      {/* Optional EmailJS Setup Drawer */}
      {showConfigCard && (
        <form onSubmit={handleSaveEmailConfig} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3.5 text-xs animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-campus-600" />
              EmailJS Service Credentials (Optional)
            </h4>
            <a
              href="https://www.emailjs.com/"
              target="_blank"
              rel="noreferrer"
              className="text-campus-600 hover:underline flex items-center gap-1 text-[11px]"
            >
              emailjs.com <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <p className="text-[11px] text-slate-500">
            FindIt has a built-in simulator that displays all generated emails below without any setup. To dispatch real emails to claimant inboxes, provide your free EmailJS credentials:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Service ID</label>
              <input
                type="text"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                placeholder="service_findit"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-campus-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Template ID</label>
              <input
                type="text"
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                placeholder="template_claim_approved"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-campus-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Public Key</label>
              <input
                type="text"
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
                placeholder="user_xxx / public_key"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-campus-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowConfigCard(false)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-campus-600 hover:bg-campus-700 text-white rounded-lg font-bold shadow-xs"
            >
              Save Email Credentials
            </button>
          </div>
        </form>
      )}

      {/* Email Activity Feed */}
      {logs.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-200 space-y-3">
          <Mail className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No coordination emails sent yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When you approve a claim on a found item, FindIt automatically creates and sends a coordination email with return meeting instructions.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((email) => {
            const dateStr = new Date(email.timestamp).toLocaleString();
            const details = email.details || {};

            return (
              <div
                key={email.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-slate-300 transition space-y-3.5"
              >
                {/* Email Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-campus-50 text-campus-700 border border-campus-100">
                      <Send className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">
                        {email.subject}
                      </h4>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{dateStr}</span>
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border self-end sm:self-auto ${
                    email.type === 'live'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-blue-50 text-blue-800 border-blue-200'
                  }`}>
                    {email.type === 'live' ? 'Live EmailJS Delivery' : 'Simulated Email Notification'}
                  </span>
                </div>

                {/* Email Body Summary */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-700">
                  <div>
                    <span className="font-semibold text-slate-900 block text-[11px] text-slate-500">Recipient (Claimant):</span>
                    <span className="font-medium text-slate-800 truncate block">{email.recipient}</span>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-900 block text-[11px] text-slate-500">Sender (Item Finder):</span>
                    <span className="font-medium text-slate-800 truncate block">{details.from_name || 'Item Owner'}</span>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-900 block text-[11px] text-slate-500">Meeting Location:</span>
                    <span className="font-medium text-slate-800 truncate block">{details.handover_location || 'Public Meeting Spot'}</span>
                  </div>
                </div>

                {/* Return Instructions Preview */}
                {details.instructions && (
                  <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-slate-700">
                    <p className="font-bold text-slate-900 text-[11px] mb-0.5">Meeting / Return Instructions:</p>
                    <p className="italic text-slate-600 leading-relaxed">
                      "{details.instructions}"
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => setSelectedEmail(email)}
                    className="text-xs font-semibold text-campus-600 hover:text-campus-800 hover:underline flex items-center gap-1"
                  >
                    <span>View Full Message Body</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Email Preview Modal */}
      {selectedEmail && (
        <Modal
          isOpen={Boolean(selectedEmail)}
          onClose={() => setSelectedEmail(null)}
          title="Full Coordination Email Preview"
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 font-mono text-[11px] text-slate-700">
              <p><strong>To:</strong> {selectedEmail.recipient}</p>
              <p><strong>From:</strong> {selectedEmail.details?.from_name} &lt;{selectedEmail.details?.from_email}&gt;</p>
              <p><strong>Subject:</strong> {selectedEmail.subject}</p>
              <p><strong>Date:</strong> {new Date(selectedEmail.timestamp).toLocaleString()}</p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 leading-relaxed text-slate-800">
              <p>Hello <strong>{selectedEmail.details?.to_name}</strong>,</p>

              <p>
                Great news! Your ownership claim for the item <strong>"{selectedEmail.details?.item_title}"</strong> has been approved by <strong>{selectedEmail.details?.from_name}</strong> on FindIt.
              </p>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <p><strong>Item:</strong> {selectedEmail.details?.item_title}</p>
                <p><strong>Proposed Location:</strong> {selectedEmail.details?.handover_location}</p>
                <p><strong>Instructions from Finder:</strong> {selectedEmail.details?.instructions}</p>
              </div>

              <p>
                Please coordinate with the finder to meet safely in a well-lit public space. Once the item is returned, please remember to click <strong>"Mark as Received"</strong> on your FindIt dashboard to complete the verification!
              </p>

              <p className="pt-2 text-slate-500 text-[11px]">
                &mdash; FindIt Digital Lost and Found System
              </p>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedEmail(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
