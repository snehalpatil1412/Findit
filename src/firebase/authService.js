import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth, isLiveFirebase } from './config';
import { DEMO_USERS } from '../utils/constants';

const DEMO_USER_STORAGE_KEY = 'findit_active_demo_user';

/**
 * Formats Firebase auth error codes into user-friendly messages.
 */
function formatAuthError(error) {
  if (!error) return 'Authentication error';
  const code = error.code || '';
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
    return 'Invalid email or password. Please verify and try again.';
  }
  if (code === 'auth/user-not-found') {
    return 'No account found with this email. Please create an account.';
  }
  if (code === 'auth/email-already-in-use') {
    return 'An account already exists with this email address. Please sign in instead.';
  }
  if (code === 'auth/weak-password') {
    return 'Password should be at least 6 characters.';
  }
  if (code === 'auth/invalid-email') {
    return 'Please enter a valid email address.';
  }
  if (code === 'auth/operation-not-allowed') {
    return 'Email/Password sign-in is not enabled in your Firebase Console. Please enable it under Authentication -> Sign-in method.';
  }
  return error.message || 'Authentication error';
}

/**
 * Gets currently active user from live Firebase Auth or Local Demo storage.
 */
export function getCurrentUser() {
  if (isLiveFirebase && auth) {
    return auth.currentUser;
  }
  try {
    const raw = localStorage.getItem(DEMO_USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEMO_USERS[0];
  } catch (e) {
    return DEMO_USERS[0];
  }
}

/**
 * Subscribes to authentication state changes.
 */
export function subscribeToAuth(callback) {
  if (isLiveFirebase && auth) {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        callback({
          uid: user.uid,
          id: user.uid,
          email: user.email,
          displayName: user.displayName || user.email.split('@')[0],
          name: user.displayName || user.email.split('@')[0],
          photoURL: user.photoURL || null,
          role: 'Community Member',
          isDemo: false
        });
      } else {
        callback(null);
      }
    });
  }

  // Local demo mode listener
  const emitDemoUser = () => {
    const user = getCurrentUser();
    callback(user ? { ...user, uid: user.id, displayName: user.name, isDemo: true } : null);
  };

  emitDemoUser();

  const handleStorage = (e) => {
    if (e.key === DEMO_USER_STORAGE_KEY) {
      emitDemoUser();
    }
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener('findit_auth_changed', emitDemoUser);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener('findit_auth_changed', emitDemoUser);
  };
}

/**
 * Sign in user with email & password.
 */
export async function signIn(email, password) {
  if (isLiveFirebase && auth) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      return cred.user;
    } catch (err) {
      throw new Error(formatAuthError(err));
    }
  }

  // In demo mode: find matching demo user or create a session
  const matched = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
  const user = matched || {
    id: `user_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
    name: email.split('@')[0],
    email,
    role: 'Community Member',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  };

  localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new CustomEvent('findit_auth_changed'));
  return user;
}

/**
 * Register a new user.
 */
export async function register(email, password, displayName) {
  if (isLiveFirebase && auth) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(cred.user, { displayName });
      }
      return cred.user;
    } catch (err) {
      throw new Error(formatAuthError(err));
    }
  }

  const user = {
    id: `user_${Date.now()}`,
    name: displayName || email.split('@')[0],
    email,
    role: 'Community Member',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  };

  localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new CustomEvent('findit_auth_changed'));
  return user;
}

/**
 * Switches the active profile in Demo Mode.
 */
export function switchDemoUser(userIndexOrId) {
  let targetUser = DEMO_USERS[0];
  if (typeof userIndexOrId === 'number') {
    targetUser = DEMO_USERS[userIndexOrId] || DEMO_USERS[0];
  } else if (typeof userIndexOrId === 'string') {
    targetUser = DEMO_USERS.find(u => u.id === userIndexOrId) || DEMO_USERS[0];
  }

  localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(targetUser));
  window.dispatchEvent(new CustomEvent('findit_auth_changed'));
  return targetUser;
}

/**
 * Signs the user out.
 */
export async function logOut() {
  if (isLiveFirebase && auth) {
    await firebaseSignOut(auth);
    return;
  }
  localStorage.removeItem(DEMO_USER_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('findit_auth_changed'));
}
