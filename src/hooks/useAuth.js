import { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { getUser, createUser } from '../firebase/services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,        setUser]        = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const profile = await getUser(firebaseUser.uid);
        setUserProfile(profile);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const profile = await getUser(result.user.uid);
    setUserProfile(profile);
    return { user: result.user, profile };
  };

  const logout = () => signOut(auth);

  const createOfficeUser = async (email, password, name) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await createUser(result.user.uid, {
      name,
      email,
      role: 'office',
      createdAt: new Date().toISOString()
    });
    return result.user;
  };

  const isOwner  = userProfile?.role === 'owner';
  const isOffice = userProfile?.role === 'office';

  return (
    <AuthContext.Provider value={{
      user, userProfile, loading,
      login, logout, createOfficeUser,
      isOwner, isOffice
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
