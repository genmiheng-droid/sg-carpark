import React from 'react';
import { ActiveTab } from '../types';
import { Map, List, Bookmark, BookOpen, Key } from 'lucide-react';

interface BottomNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  savedCount: number;
  nearbyCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  savedCount,
  nearbyCount,
}) => {
  const NAV_ITEMS: {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }[] = [
    {
      id: 'map',
      label: 'Map',
      icon: <Map className="w-5 h-5" />,
    },
    {
      id: 'list',
      label: 'Nearby Lots',
      icon: <List className="w-5 h-5" />,
      badge: nearbyCount,
    },
    {
      id: 'saved',
      label: 'Saved',
      icon: <Bookmark className="w-5 h-5" />,
      badge: savedCount > 0 ? savedCount : undefined,
    },
    {
      id: 'guide',
      label: 'SG Rates',
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      id: 'api',
      label: 'API Setup',
      icon: <Key className="w-5 h-5" />,
    },
  ];

  return (
    <nav
      id="singapore-carpark-bottom-navigation"
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-slate-800/80 backdrop-blur-xl shadow-2xl safe-bottom"
    >
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-1.5 sm:py-2">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              type="button"
              onClick={() => onChangeTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 ${
                isActive
                  ? 'text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              {/* Icon Container with relative badge */}
              <div className="relative p-1">
                {item.icon}

                {/* Badge if provided */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`absolute -top-1 -right-2 text-[10px] px-1.5 py-0.2 rounded-full font-bold leading-tight ${
                      isActive
                        ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/40'
                        : 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span className="text-[11px] tracking-tight mt-0.5 leading-none">
                {item.label}
              </span>

              {/* Active Indicator bar */}
              {isActive && (
                <span className="w-4 h-0.5 bg-emerald-400 rounded-full mt-1" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
