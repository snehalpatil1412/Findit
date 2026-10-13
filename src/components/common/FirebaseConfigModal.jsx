import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import {
  saveCustomFirebaseConfig,
  clearCustomFirebaseConfig,
  isLiveFirebase,
  configSource
} from '../../firebase/config';
import { resetDemoDatabase } from '../../firebase/rtdbService';
import { getEmailActivityLogs } from '../../utils/emailService';
import { useNotification } from '../../context/NotificationContext';
import {
  Database,
  Mail,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

export default function FirebaseConfigModal({ isOpen, onClose }) {
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState('database'); // 'database' | 'emailLogs'
  const [emailLogs, setEmailLogs] = useState([]);

  const [apiKey, setApiKey] = useState('');
  const [authDomain, setAuthDomain] = useState('');
  const [databaseURL, setDatabaseURL] = useState('');
  const [projectId, setProjectId] = useState('');
  const [storageBucket, setStorageBucket] = useState('');
  const [appId, setAppId] = useState('');

  useEffect(() => {
    if (isOpen) {
      setEmailLogs(getEmailActivityLogs());
    }
    const handleEmailLog = () => setEmailLogs(getEmailActivityLogs());
    window.addEventListener('findit_email_logged', handleEmailLog);
    return () => window.removeEventListener('findit_email_logged', handleEmailLog);
  }, [isOpen]);

  const handleSaveConfig = (e) => {
    e.preventDefault();
    if (!apiKey || !databaseURL) {
      showToast('API Key and Database URL are required', 'error');
      return;
    }

    saveCustomFirebaseConfig({
      apiKey,
      authDomain,
      databaseURL,
      projectId,
      storageBucket,
      appId
    });
  };

  const handleClearConfig = () => {
    if (window.confirm('Switch back to Local Demo Mode?')) {
      clearCustomFirebaseConfig();
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset local demo items and claims back to initial campus sample data?')) {
      resetDemoDatabase();
      showToast('Demo database reset to initial campus items', 'success');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="System Configuration & Live Logs" maxWidth="max-w-3xl">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-4">
        <button
          onClick={() => setActiveTab('database')}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'database'
              ? 'border-campus-600 text-campus-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          Firebase Database Settings
        </button>

        <button
          onClick={() => setActiveTab('emailLogs')}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'emailLogs'
              ? 'border-campus-600 text-campus-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Mail className="w-4 h-4" />
          Email Coordination Logs ({emailLogs.length})
        </button>
      </div>

      {activeTab === 'database' ? (
        <div className="space-y-6 text-sm">
          {/* Current Status Banner */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            isLiveFirebase
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-sky-50 border-sky-200 text-sky-950'
          }`}>
            <CheckCircle className={`w-5 h-5 shrink-0 mt-0.5 ${isLiveFirebase ? 'text-emerald-600' : 'text-sky-600'}`} />
            <div>
              <p className="font-bold">
                {isLiveFirebase
                  ? `Connected to Live Firebase (${configSource})`
                  : 'Running in Local Campus Demo Mode (Active & Zero-Setup)'}
              </p>
              <p className="text-xs mt-1 text-slate-600 leading-relaxed">
                {isLiveFirebase
                  ? 'Your app is syncing in real time with your Firebase Realtime Database and Auth.'
                  : 'All features including image compression, smart matching, claims, and dual handover work locally. You can enter real Firebase credentials below anytime.'}
              </p>
            </div>
          </div>

          {/* Quick Demo Controls */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-slate-800">Reset Demo Items & Data</h4>
              <p className="text-xs text-slate-500">Restore default test reports (HP Laptop, Hydro Flask, Wallet) to verify flows.</p>
            </div>
            <button
              type="button"
              onClick={handleResetData}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              Reset Demo Data
            </button>
          </div>

          {/* Form to connect live Firebase */}
          <form onSubmit={handleSaveConfig} className="space-y-4">
            <h4 className="font-bold text-slate-800 flex items-center justify-between">
              <span>Connect Custom Firebase Project</span>
              <a
                href="https://console.firebase.google.com/"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-campus-600 hover:underline flex items-center gap-1 font-normal"
              >
                Firebase Console <ExternalLink className="w-3 h-3" />
              </a>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">API Key</label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-campus-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Database URL (RTDB)</label>
                <input
                  type="text"
                  value={databaseURL}
                  onChange={(e) => setDatabaseURL(e.target.value)}
                  placeholder="https://your-app-default-rtdb.firebaseio.com"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-campus-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Project ID</label>
                <input
                  type="text"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  placeholder="my-campus-findit"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-campus-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Auth Domain</label>
                <input
                  type="text"
                  value={authDomain}
                  onChange={(e) => setAuthDomain(e.target.value)}
                  placeholder="my-campus-findit.firebaseapp.com"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-campus-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              {configSource === 'localStorage' && (
                <button
                  type="button"
                  onClick={handleClearConfig}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                >
                  Disconnect Custom Firebase
                </button>
              )}
              <div className="ml-auto flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-campus-600 text-white rounded-lg text-xs font-bold hover:bg-campus-700 transition shadow-sm"
                >
                  Save & Reload
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        /* Email Coordination Logs */
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Whenever an owner approves a claim, FindIt dispatches an email with return instructions.
            Below is the real-time event log of all generated emails:
          </p>

          {emailLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
              No emails generated yet. Accept a claim in the Review Claims tab to trigger an email!
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {emailLogs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-slate-500 font-mono text-[10px]">
                    <span className="inline-flex items-center gap-1 font-semibold text-campus-700 uppercase">
                      [{log.type === 'live' ? 'Live EmailJS' : 'Simulated Delivery'}]
                    </span>
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>

                  <p className="font-bold text-slate-800">{log.subject}</p>
                  <p className="text-slate-600">
                    <span className="font-semibold">Recipient:</span> {log.recipient}
                  </p>

                  {log.details && (
                    <div className="mt-2 p-2 bg-white rounded border border-slate-200 text-slate-700 space-y-1">
                      <p><span className="font-semibold text-slate-900">Item:</span> {log.details.item_title}</p>
                      <p><span className="font-semibold text-slate-900">Location:</span> {log.details.handover_location}</p>
                      <p><span className="font-semibold text-slate-900">Instructions:</span> {log.details.instructions}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
