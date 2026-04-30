import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

/** 
 * Diagnostic to test Firestore connection on boot.
 */
export async function testFirestoreConnection() {
  try {
    // Attempting to fetch a dummy doc from server directly
    await getDocFromServer(doc(db, '_diagnostics', 'connection-test'));
    console.log('Firestore connection verified');
  } catch (error: any) {
    if (error?.message?.includes('the client is offline') || error?.code === 'unavailable') {
      console.error("Please check your Firebase configuration or internet connection. Firestore is currently unavailable.");
    } else if (error?.code === 'permission-denied') {
      // This is actually a 'good' sign that we REACHED the server but hit rules
      console.log('Firestore reached, but hit expected permission-denied for test doc');
    } else {
      console.error('Firestore connection error:', error);
    }
  }
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  }
}

export function handleFirestoreError(error: any, operationType: FirestoreErrorInfo['operationType'], path: string | null = null): never {
  const authInfo = auth.currentUser ? {
    userId: auth.currentUser.uid,
    email: auth.currentUser.email || '',
    emailVerified: auth.currentUser.emailVerified,
    isAnonymous: auth.currentUser.isAnonymous,
    providerInfo: auth.currentUser.providerData.map(p => ({
      providerId: p.providerId,
      displayName: p.displayName || '',
      email: p.email || ''
    }))
  } : {
    userId: 'unauthenticated',
    email: '',
    emailVerified: false,
    isAnonymous: false,
    providerInfo: []
  };

  const errorInfo: FirestoreErrorInfo = {
    error: error.message || String(error),
    operationType,
    path,
    authInfo
  };

  const stringified = JSON.stringify(errorInfo);
  console.error('Firestore Error:', stringified);
  throw new Error(stringified);
}

export function handleAuthError(error: any): string {
  console.error('Auth Error:', error);
  
  if (error.code === 'auth/network-request-failed') {
    return "Network error: The browser blocked the connection to the authentication server. This often happens due to 'Third-party cookie' blocking or 'Cross-site tracking' protection in your browser settings. Please try disabling ad-blockers or using a different browser.";
  }
  
  if (error.code === 'auth/popup-blocked') {
    return "Popup blocked: Please allow popups for this site to sign in.";
  }
  
  if (error.code === 'auth/popup-closed-by-user') {
    return "Login cancelled: The authentication window was closed before completion.";
  }

  if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
    return "Invalid email or password. Please check your credentials.";
  }

  if (error.code === 'auth/email-already-in-use') {
    return "This email is already registered. Try logging in instead.";
  }

  if (error.code === 'auth/weak-password') {
    return "Password is too weak. Please choose a stronger password.";
  }

  if (error.code === 'auth/invalid-email') {
    return "Invalid email format. Please enter a valid email address.";
  }

  if (error.code === 'auth/operation-not-allowed') {
    return "Sign-in method not enabled: Please go to your Firebase Console under Authentication > Sign-in method and enable the 'Email/Password' provider.";
  }

  return error.message || "An unexpected authentication error occurred.";
}
