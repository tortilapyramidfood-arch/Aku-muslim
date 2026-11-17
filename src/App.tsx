import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { OfflineBanner } from './components/common/OfflineBanner';
import { HomeView } from './components/home/HomeView';
import { QuranView } from './components/quran/QuranView';
import { PrayerView } from './components/prayer/PrayerView';
import { LearningView } from './components/learning/LearningView';
import { ProfileView } from './components/profile/ProfileView';
import { KidsHome } from './components/kids/KidsHome';
import { QiblaModal } from './components/qibla/QiblaModal';
import { CalendarModal } from './components/calendar/CalendarModal';
import { OwnerDashboard } from './components/owner/OwnerDashboard';
import { QualityGateModal } from './components/test/QualityGateModal';
import { GlobalAudioPlayerBar } from './components/audio/GlobalAudioPlayerBar';
import { PremiumView } from './components/subscription/PremiumView';
import { FamilyDashboardView } from './components/family/FamilyDashboardView';
import { AppSettingsMenu } from './components/settings/AppSettingsMenu';

const AppContent: React.FC = () => {
  const {
    activeTab,
    mode,
    showPremiumModal,
    setShowPremiumModal,
    showFamilyDashboard,
    setShowFamilyDashboard,
    showSettingsModal,
    setShowSettingsModal,
  } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbf9] dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      {/* Top Offline Notification if network disconnects */}
      <OfflineBanner />

      {/* Top Navigation Bar */}
      <Header />

      {/* Main View Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 pt-4 pb-28">
        <div
          key={`${activeTab}_${activeTab === 'beranda' ? mode : ''}`}
          className="animate-tab-fade"
        >
          {activeTab === 'beranda' && (mode === 'anak' ? <KidsHome /> : <HomeView />)}
          {activeTab === 'quran' && <QuranView />}
          {activeTab === 'ibadah' && <PrayerView />}
          {activeTab === 'belajar' && <LearningView />}
          {activeTab === 'profil' && <ProfileView />}
        </div>
      </main>

      {/* Global Interactive Modals */}
      <QiblaModal />
      <CalendarModal />
      <OwnerDashboard />
      <QualityGateModal />

      {/* Unified App Settings Modal */}
      {showSettingsModal && (
        <AppSettingsMenu variant="modal" onClose={() => setShowSettingsModal(false)} />
      )}

      {/* Premium Subscription Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="w-full max-w-4xl max-h-[92vh] bg-stone-900 border border-stone-800 rounded-3xl overflow-y-auto p-4 sm:p-6 shadow-2xl">
            <PremiumView onClose={() => setShowPremiumModal(false)} />
          </div>
        </div>
      )}

      {/* Family Activity Dashboard Modal */}
      {showFamilyDashboard && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="w-full max-w-4xl max-h-[92vh] bg-stone-900 border border-stone-800 rounded-3xl overflow-y-auto p-4 sm:p-6 shadow-2xl text-stone-100">
            <FamilyDashboardView onClose={() => setShowFamilyDashboard(false)} />
          </div>
        </div>
      )}

      {/* Persistent Global Floating Audio Player */}
      <GlobalAudioPlayerBar />

      {/* Fixed Bottom Navigation (5 destinations) */}
      <BottomNav />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
