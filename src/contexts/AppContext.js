import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './AuthContext';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

const AppContext = createContext();

export function useApp() {
  return useContext(AppContext);
}

export function AppProvider({ children }) {
  const { user } = useAuth();
  const [collections, setCollections] = useState([]);
  const [requests, setRequests] = useState([]);
  const [environments, setEnvironments] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [tabs, setTabs] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Listen to collections
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'collections'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const collectionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCollections(collectionsData);
    });

    return unsubscribe;
  }, [user]);

  // Listen to requests
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'requests'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requestsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRequests(requestsData);
    });

    return unsubscribe;
  }, [user]);

  // Listen to environments
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'environments'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const environmentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEnvironments(environmentsData);
    });

    return unsubscribe;
  }, [user]);

  // Collection operations
  const createCollection = async (name, description = '') => {
    if (!user) return;

    try {
      const docRef = await addDoc(collection(db, 'collections'), {
        name,
        description,
        userId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      toast.success('Collection created successfully!');
      return docRef.id;
    } catch (error) {
      toast.error('Failed to create collection');
      console.error(error);
    }
  };

  const updateCollection = async (id, updates) => {
    try {
      await updateDoc(doc(db, 'collections', id), {
        ...updates,
        updatedAt: new Date()
      });
      toast.success('Collection updated successfully!');
    } catch (error) {
      toast.error('Failed to update collection');
      console.error(error);
    }
  };

  const deleteCollection = async (id) => {
    try {
      await deleteDoc(doc(db, 'collections', id));
      // Also delete all requests in this collection
      const collectionRequests = requests.filter(req => req.collectionId === id);
      await Promise.all(
        collectionRequests.map(req => deleteDoc(doc(db, 'requests', req.id)))
      );
      toast.success('Collection deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete collection');
      console.error(error);
    }
  };

  // Request operations
  const createRequest = async (requestData) => {
    if (!user) return;

    try {
      const docRef = await addDoc(collection(db, 'requests'), {
        ...requestData,
        userId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      toast.success('Request saved successfully!');
      return docRef.id;
    } catch (error) {
      toast.error('Failed to save request');
      console.error(error);
    }
  };

  const updateRequest = async (id, updates) => {
    try {
      await updateDoc(doc(db, 'requests', id), {
        ...updates,
        updatedAt: new Date()
      });
      toast.success('Request updated successfully!');
    } catch (error) {
      toast.error('Failed to update request');
      console.error(error);
    }
  };

  const deleteRequest = async (id) => {
    try {
      await deleteDoc(doc(db, 'requests', id));
      // Remove from tabs if open
      setTabs(prev => prev.filter(tab => tab.id !== id));
      if (activeTab === id) {
        setActiveTab(null);
      }
      toast.success('Request deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete request');
      console.error(error);
    }
  };

  // Environment operations
  const createEnvironment = async (name, variables = {}) => {
    if (!user) return;

    try {
      const docRef = await addDoc(collection(db, 'environments'), {
        name,
        variables,
        userId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      toast.success('Environment created successfully!');
      return docRef.id;
    } catch (error) {
      toast.error('Failed to create environment');
      console.error(error);
    }
  };

  // Tab management
  const openTab = (request) => {
    const existingTab = tabs.find(tab => tab.id === request.id);
    if (existingTab) {
      setActiveTab(request.id);
      return;
    }

    const newTab = {
      id: request.id || uuidv4(),
      name: request.name || 'Untitled Request',
      method: request.method || 'GET',
      url: request.url || '',
      saved: !!request.id,
      ...request
    };

    setTabs(prev => [...prev, newTab]);
    setActiveTab(newTab.id);
  };

  const closeTab = (tabId) => {
    setTabs(prev => prev.filter(tab => tab.id !== tabId));
    if (activeTab === tabId) {
      const remainingTabs = tabs.filter(tab => tab.id !== tabId);
      setActiveTab(remainingTabs.length > 0 ? remainingTabs[0].id : null);
    }
  };

  const updateTab = (tabId, updates) => {
    setTabs(prev => prev.map(tab => 
      tab.id === tabId ? { ...tab, ...updates, saved: false } : tab
    ));
  };

  // Add to history
  const addToHistory = (requestData, response) => {
    const historyItem = {
      id: uuidv4(),
      ...requestData,
      response,
      timestamp: new Date()
    };
    setHistory(prev => [historyItem, ...prev.slice(0, 99)]); // Keep last 100 items
  };

  const value = {
    collections,
    requests,
    environments,
    tabs,
    activeTab,
    history,
    loading,
    createCollection,
    updateCollection,
    deleteCollection,
    createRequest,
    updateRequest,
    deleteRequest,
    createEnvironment,
    openTab,
    closeTab,
    updateTab,
    setActiveTab,
    addToHistory,
    setLoading
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}