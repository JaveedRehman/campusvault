import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleProvider } from './lib/firebase';
import { AcademicResource } from './types/repository';
import { fetchAllResources } from './lib/repositoryService';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { BrowseView } from './components/BrowseView';
import { DetailView } from './components/DetailView';
import { UploadView } from './components/UploadView';
import { SetupGuideView } from './components/SetupGuideView';

import { SAMPLE_RESOURCES } from './lib/sampleData';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'home' | 'browse' | 'detail' | 'upload' | 'setup'>('home');
  const [resources, setResources] = useState<AcademicResource[]>(SAMPLE_RESOURCES);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [browseInitialCollege, setBrowseInitialCollege] = useState<string>('');
  const [browseInitialSearch, setBrowseInitialSearch] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Resources from Firestore + Sample Fallback
  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchAllResources();
        if (data && data.length > 0) {
          setResources(data);
        }
      } catch (err) {
        console.warn('Failed to load firestore resources:', err);
      }
    }
    loadData();
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Google Auth Error:', err);
      alert('Sign-In failed. Please try again or check browser popup settings.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign-Out Error:', err);
    }
  };

  const handleSelectResource = (id: string) => {
    setSelectedResourceId(id);
    setCurrentTab('detail');
  };

  const handleGoToBrowse = (college?: string, search?: string) => {
    setBrowseInitialCollege(college || '');
    setBrowseInitialSearch(search || '');
    setCurrentTab('browse');
  };

  const handleGoToUpload = () => {
    setCurrentTab('upload');
  };

  const handleUploadSuccess = (newDoc: AcademicResource) => {
    setResources(prev => [newDoc, ...prev]);
  };

  const handleUpdateResource = (updated: AcademicResource) => {
    setResources(prev => prev.map(r => r.id === updated.id ? updated : r));
  };

  const selectedResource = resources.find(r => r.id === selectedResourceId);

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', color: '#000000', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <div style={{ maxWidth: '980px', margin: '0 auto', padding: '15px' }}>

        <Header
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          user={user}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
        />

        <main style={{ minHeight: '450px' }}>
          {loading ? (
            <div style={{ padding: '30px', textAlign: 'center', fontSize: '13px', color: '#555555' }}>
              Loading CampusVault Document Repository... Please wait.
            </div>
          ) : (
            <>
              {currentTab === 'home' && (
                <HomeView
                  resources={resources}
                  onSelectResource={handleSelectResource}
                  onGoToBrowse={handleGoToBrowse}
                  onGoToUpload={handleGoToUpload}
                />
              )}

              {currentTab === 'browse' && (
                <BrowseView
                  resources={resources}
                  initialCollege={browseInitialCollege}
                  initialSearch={browseInitialSearch}
                  onSelectResource={handleSelectResource}
                  onResetFilters={() => {
                    setBrowseInitialCollege('');
                    setBrowseInitialSearch('');
                  }}
                />
              )}

              {currentTab === 'detail' && (
                selectedResource ? (
                  <DetailView
                    resource={selectedResource}
                    onBack={() => setCurrentTab('browse')}
                    onUpdateResource={handleUpdateResource}
                  />
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center' }}>
                    Document record not found.{' '}
                    <button onClick={() => setCurrentTab('home')} style={{ cursor: 'pointer' }}>
                      Return Home
                    </button>
                  </div>
                )
              )}

              {currentTab === 'upload' && (
                <UploadView
                  user={user}
                  onSignIn={handleSignIn}
                  onUploadSuccess={handleUploadSuccess}
                />
              )}

              {currentTab === 'setup' && (
                <SetupGuideView />
              )}
            </>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
}
