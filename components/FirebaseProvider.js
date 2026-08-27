'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ADMIN_EMAIL = 'nghienphim26@gmail.com';
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyBgwwpq5NYl1hMbB2wgFpKugT1WnHuVSaA',
  authDomain: 'nonla-phim.firebaseapp.com',
  projectId: 'nonla-phim',
  storageBucket: 'nonla-phim.firebasestorage.app',
  messagingSenderId: '600020950441',
  appId: '1:600020950441:web:29c7f1eec2c8a55eaeb8b'
};

const FirebaseContext = createContext({
  ready: false,
  user: null,
  db: null,
  auth: null,
  isAdmin: false,
});

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === 'true') resolve();
      else existing.addEventListener('load', () => resolve(), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    script.onerror = () => reject(new Error(`Không thể tải Firebase: ${src}`));
    document.head.appendChild(script);
  });
}

export function useFirebase() {
  return useContext(FirebaseContext);
}

export default function FirebaseProvider({ children }) {
  const [state, setState] = useState({ ready: false, user: null, db: null, auth: null });

  useEffect(() => {
    let unsubscribe = null;
    let disposed = false;

    (async () => {
      try {
        await loadScript('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
        await loadScript('https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js');
        await loadScript('https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js');

        if (disposed || !window.firebase) return;
        const apps = window.firebase.apps || [];
        if (!apps.length) window.firebase.initializeApp(FIREBASE_CONFIG);

        const auth = window.firebase.auth();
        const db = window.firebase.firestore();
        unsubscribe = auth.onAuthStateChanged((user) => {
          if (!disposed) setState({ ready: true, user, db, auth });
        });
      } catch (error) {
        console.error('[Firebase]', error);
        if (!disposed) setState((prev) => ({ ...prev, ready: true }));
      }
    })();

    return () => {
      disposed = true;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const value = useMemo(() => ({
    ...state,
    isAdmin: Boolean(state.user?.email && state.user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()),
    adminEmail: ADMIN_EMAIL,
    config: FIREBASE_CONFIG,
  }), [state]);

  return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>;
}
