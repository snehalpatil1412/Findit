import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { LogIn, UserPlus, Users, Sparkles } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register, selectDemoUser, demoUsers, isLiveFirebase } = useAuth();
  const { showToast } = useNotification();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Undergraduate Student');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        showToast('Successfully signed in!', 'success');
      } else {
        await register(email, password, name, role);
        showToast('Campus account created successfully!', 'success');
      }
      onClose();
    } catch (err) {
      showToast(err.message || 'Authentication error', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectDemo = (user) => {
    selectDemoUser(user.id);
    showToast(`Switched active profile to ${user.name} (${user.role})`, 'success');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'login' ? 'Sign In to FindIt' : 'Create Campus FindIt Account'}
      maxWidth="max-w-md"
    >
      <div className="space-y-5">
        {/* Quick Demo Switcher (Especially helpful for testing dual-party handover) */}
        {!isLiveFirebase && (
          <div className="p-3.5 bg-gradient-to-br from-campus-50 to-indigo-50/60 rounded-xl border border-campus-200/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-campus-800 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-campus-600" />
              Quick Demo Personas (Instant 1-Click Switch)
            </div>
            <p className="text-[11px] text-slate-600 mb-2.5">
              Switch between personas to test owner review and claimant dual-confirmation:
            </p>
            <div className="space-y-1.5">
              {demoUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleSelectDemo(u)}
                  type="button"
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-white/90 hover:bg-white border border-campus-100 text-left transition shadow-xs hover:border-campus-400 group"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-7 h-7 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <p className="text-xs font-semibold text-slate-800 group-hover:text-campus-600">{u.name}</p>
                      <p className="text-[10px] text-slate-500">{u.role}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-campus-600 bg-campus-50 px-2 py-0.5 rounded-full border border-campus-200">
                    Switch
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Auth form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === 'register' && (
            <>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Taylor Smith"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-campus-500 focus:outline-none"
                />
              </div>
            </>
          )}

          <div>
            <label className="block font-medium text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-campus-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-campus-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 bg-campus-600 hover:bg-campus-700 text-white font-bold rounded-lg transition shadow-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Create Account
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="font-semibold text-campus-600 hover:underline"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-semibold text-campus-600 hover:underline"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
