// src/components/AuthProvider.js
import { createContext, useState, useEffect, useContext } from "react";
import {
  auth,
  googleProvider,
  db,
  createUserIfNotExists,
} from "../firebaseConfig";
import {
  onAuthStateChanged,
  signOut,
  signInWithPopup,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";

// Create context
const AuthContext = createContext();

// Hook to use auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("splash");
  const [initialLoading, setInitialLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Streak calculation (once per day using UTC)
  const handleStreak = async (userId) => {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    const data = userSnap.data() || {};

    const lastLogin = data.lastLogin?.toDate?.() || new Date(0);
    const now = new Date();

    const lastLoginUTC = Date.UTC(
      lastLogin.getUTCFullYear(),
      lastLogin.getUTCMonth(),
      lastLogin.getUTCDate()
    );
    const nowUTC = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
    );
    const diffDays = Math.floor(
      (nowUTC - lastLoginUTC) / (1000 * 60 * 60 * 24)
    );

    let newStreak = data.streak || 0;
    if (diffDays === 1) newStreak += 1; // consecutive day
    else if (diffDays > 1) newStreak = 1; // reset streak

    await updateDoc(userRef, {
      streak: newStreak,
      lastLogin: serverTimestamp(),
    });
  };

  // Update time spent on page (in seconds)
  const updateTimeSpent = async (userId, seconds) => {
    if (!userId) return;
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      sessionLogs: arrayUnion({
        date: new Date().toISOString(),
        timeSpent: seconds,
      }),
    });
  };
  // Save chat history in Firestore
  const saveChatToDB = async (userId, userMessage, aiAnswer) => {
    if (!userId) return;
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      chatHistory: arrayUnion({
        userMessage,
        aiAnswer,
        timestamp: new Date().toISOString(),
      }),
    });
  };

  // Get last 5 chat messages
  const getLast5Messages = async (userId) => {
    if (!userId) return [];
    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);
    const data = snap.data() || {};
    return (data.chatHistory || []).slice(-5);
  };

  // Auth state change listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          await createUserIfNotExists(currentUser);
          await handleStreak(currentUser.uid);
        } catch (err) {
          console.error("Auth initialization error:", err);
        }
        setPage("dashboard");
      } else {
        setUser(null);
        setPage("login");
      }
      setInitialLoading(false);
    });

    const handleBeforeUnload = () => {
      if (auth.currentUser) signOut(auth);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      unsubscribe();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Google Sign-In
  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const currentUser = result.user;
      await createUserIfNotExists(currentUser);
      await handleStreak(currentUser.uid);
      setUser(currentUser);
      setPage("dashboard");
    } catch (err) {
      console.error("Google Sign-In error:", err);
      setAuthError("Google Sign-In failed. Please try again.");
    }
  };

  // Email/Password Sign-In
  const signInWithEmail = async (email, password) => {
    setAuthError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const currentUser = result.user;
      await createUserIfNotExists(currentUser);
      await handleStreak(currentUser.uid);
      setUser(currentUser);
      setPage("dashboard");
    } catch (err) {
      console.error("Email Sign-In error:", err);
      setAuthError("Invalid email or password. Please try again.");
    }
  };

  // Logout
  const logout = async () => {
    if (auth.currentUser) {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { lastSessionEnd: serverTimestamp() });
    }
    await signOut(auth);
    setUser(null);
    setPage("login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        page,
        setPage,
        signInWithGoogle,
        signInWithEmail,
        logout,
        initialLoading,
        authError,
        updateTimeSpent,
        saveChatToDB,
        getLast5Messages,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
