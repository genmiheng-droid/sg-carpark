import React from 'react';
import { Carpark } from '../types';
import { CarparkCard } from './CarparkCard';
import { Bookmark, Sparkles, Navigation } from 'lucide-react';

interface SavedLotsViewProps {
  savedCarparks: Carpark[];
  selectedCarpark: Carpark | null;
  onSelectCarpark: (cp: Carpark) => void;
  onToggleSave: (cp: Carpark) => void;
  onOpenDetails: (cp: Carpark) => void;
  onExploreMap: () => void;
}

export const SavedLotsView: React.FC<SavedLotsViewProps> = ({
  savedCarparks,
  selectedCarpark,
  onSelectCarpark,
  onToggleSave,
  onOpenDetails,
  onExploreMap,
}) => {
  return (
    <div id="saved-lots-view" className="w-full max-w-3xl mx-auto pb-24 animate-fadeIn">
      {/* View Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span>Saved Parking Lots</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Quickly monitor real-time vacancies for your regular destinations
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
          {savedCarparks.length} Saved
        </span>
      </div>

      {savedCarparks.length === 0 ? (
        /* Empty State */
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-8 text-center my-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-200 mb-1">
            No saved parking lots yet
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5 leading-relaxed">
            Bookmark frequent parking lots in Orchard, CBD, or your neighborhood to check live lot availability in one glance before driving.
          </p>
          <button
            type="button"
            onClick={onExploreMap}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20 inline-flex items-center gap-1.5"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Explore Map &amp; Search</span>
          </button>
        </div>
      ) : (
        /* Saved List */
        <div className="space-y-3">
          {savedCarparks.map((cp) => (
            <CarparkCard
              key={cp.id}
              carpark={cp}
              isSelected={selectedCarpark?.id === cp.id}
              isSaved={true}
              onSelect={onSelectCarpark}
              onToggleSave={onToggleSave}
              onOpenDetails={onOpenDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
};
