import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const LOCAL_STORAGE_KEY_FIREBASE = 'findit_custom_firebase_config';

/**
 * Retrieves the current Firebase configuration from either localStorage or .env
 */
export function getStoredFirebaseConfig() {
  try {
    const custom = localStorage.getItem(LOCAL_STORAGE_KEY_FIREBASE);
    if (custom) {
      const parsed = JSON.parse(custom);
      if (parsed.apiKey && parsed.databaseURL) {
        return { config: parsed, source: 'localStorage' };
      }
    }
  } catch (e) {
    console.warn('Error reading stored Firebase config', e);
  }

  // Check if .env has valid non-placeholder keys
  const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const envDbUrl = import.meta.env.VITE_FIREBASE_DATABASE_URL;

  if (envApiKey && envDbUrl && !envApiKey.includes('your_api_key')) {
    return {
      config: {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID
      },
      source: 'env'
    };
  }

  return { config: null, source: 'none' };
}

/**
 * Saves custom Firebase credentials entered in the UI.
 */
export function saveCustomFirebaseConfig(config) {
  localStorage.setItem(LOCAL_STORAGE_KEY_FIREBASE, JSON.stringify(config));
  window.location.reload();
}

/**
 * Clears custom Firebase credentials and reverts to demo mode.
 */
export function clearCustomFirebaseConfig() {
  localStorage.removeItem(LOCAL_STORAGE_KEY_FIREBASE);
  window.location.reload();
}

const { config: activeConfig, source: configSource } = getStoredFirebaseConfig();

let app = null;
let auth = null;
let rtdb = null;
const isLiveFirebase = Boolean(activeConfig && activeConfig.apiKey);

if (isLiveFirebase) {
  try {
    app = getApps().length === 0 ? initializeApp(activeConfig) : getApp();
    auth = getAuth(app);
    rtdb = getDatabase(app);
    console.log(`[FindIt] Initialized Firebase with ${configSource} credentials.`);
  } catch (err) {
    console.warn('[FindIt] Failed to initialize live Firebase, running in Local Demo Mode:', err);
  }
} else {
  console.log('[FindIt] Running in Local Demo Mode (Instant Zero-Setup with Seed Data).');
}

export { app, auth, rtdb, isLiveFirebase, configSource };
