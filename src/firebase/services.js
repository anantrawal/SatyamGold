import {
  collection, doc, getDoc, getDocs,
  setDoc, updateDoc, deleteDoc,
  onSnapshot, query, where, orderBy
} from 'firebase/firestore';
import {
  ref, uploadBytes, getDownloadURL, deleteObject
} from 'firebase/storage';
import { db, storage } from './config';

// ─── PLOTS ───────────────────────────────────────────────────

export const getPlots = (callback) => {
  const q = query(collection(db, 'path'), orderBy('plotNumber', 'asc'));
  return onSnapshot(q, (snap) => {
    const plots = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(plots);
  });
};
export const getPlot = async (plotId) => {
  
  const ref = doc(db, 'path', plotId);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const updatePlot = async (plotId, data) => {
  await updateDoc(doc(db, 'path', plotId), data);
};

export const createPlot = async (plotId, data) => {
  await setDoc(doc(db, 'path', plotId), data);
};

export const deletePlot = async (plotId) => {
  await deleteDoc(doc(db, 'path', plotId));
};

// ─── USERS ───────────────────────────────────────────────────

export const getUser = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const createUser = async (uid, data) => {
  await setDoc(doc(db, 'users', uid), data);
};

export const getOfficeUsers = async () => {
  const q = query(collection(db, 'users'), where('role', '==', 'office'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const updateUser = async (uid, data) => {
  await updateDoc(doc(db, 'users', uid), data);
};

export const deleteUser = async (uid) => {
  await deleteDoc(doc(db, 'users', uid));
};

// ─── ELEVATIONS ──────────────────────────────────────────────

export const getElevations = async (plotSize) => {
  const sizeKey = plotSize.toLowerCase().replace(' ', '_');
  const q = query(collection(db, 'elevations'), where('plotSize', '==', sizeKey));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getAllElevations = async () => {
  const snap = await getDocs(collection(db, 'elevations'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const createElevation = async (data) => {
  const ref = doc(collection(db, 'elevations'));
  await setDoc(ref, data);
  return ref.id;
};

export const deleteElevation = async (elevationId) => {
  await deleteDoc(doc(db, 'elevations', elevationId));
};

// ─── STORAGE ─────────────────────────────────────────────────

export const uploadImage = async (file, path) => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

export const deleteImage = async (path) => {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
};

// ─── REPORTS ─────────────────────────────────────────────────

export const getPlotStats = async () => {
  const snap = await getDocs(collection(db, 'path'));
  const plots = snap.docs.map(d => d.data());
  return {
    total:     plots.length,
    available: plots.filter(p => p.status === 'available').length,
    booked:    plots.filter(p => p.status === 'booked').length,
    sold:      plots.filter(p => p.status === 'sold').length,
    hold:      plots.filter(p => p.status === 'hold').length,
  };
};
