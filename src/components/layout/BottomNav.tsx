import React from 'react';
import { useApp } from '../../context/AppContext';
import { Home, BookOpen, Clock, GraduationCap, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, mode } = useApp();

  const isAnak = mode === 'anak';

  const navItems = [
    { id: 'beranda' as const, label: 'Beranda', icon: Home },
    { id: 'quran' as const, label: "Al-Qur'an", icon: BookOpen },
    { id: 'ibadah' as const, label: 'Ibadah', icon: Clock },
    { id: 'belajar' as const, label: 'Belajar', icon: GraduationCap },
    { id: 'profil' as const, label: 'Profil', icon: User },
  ];

  return (
    <nav
      aria-label="Navigasi Utama"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 transition-colors"
    >
      <div className="max-w-4xl mx-auto px-2">
        <div className="grid grid-cols-5 items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center w-full h-full min-h-[44px] transition-colors ${
                  isActive
                    ? isAnak
                      ? 'text-amber-600 dark:text-amber-400 font-bold'
                      : 'text-emerald-700 dark:text-emerald-400 font-semibold'
                    : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 font-medium'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Visual active indicator bar on top with smooth transition */}
                {isActive && (
                  <span
                    className={`absolute top-0 w-8 h-1 rounded-full animate-tab-fade transition-all duration-300 ${
                      isAnak ? 'bg-amber-500' : 'bg-emerald-600'
                    }`}
                  />
                )}

                <Icon
                  className={`${isAnak ? 'w-6 h-6' : 'w-5 h-5'} transition-all duration-200 active:scale-95 ${
                    isActive ? 'scale-110 drop-shadow-xs' : 'opacity-70 group-hover:opacity-100'
                  }`}
                />

                <span
                  className={`mt-1 tracking-tight truncate whitespace-nowrap text-[11px] ${
                    isAnak ? 'font-bold' : ''
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
