import React, { useState, useMemo } from 'react';
import FilterBar from '../components/items/FilterBar';
import ItemCard from '../components/items/ItemCard';
import { ITEM_STATUSES } from '../utils/constants';
import { Search, Compass, Package, Sparkles } from 'lucide-react';

export default function ActiveListingsPage({
  items = [],
  currentUserId,
  onViewDetails,
  onClaimItem,
  onOpenReportModal
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Strictly filter only ACTIVE items (items in handover or returned are excluded from public listings)
  const activeItems = useMemo(() => {
    return items.filter(item => item.status === ITEM_STATUSES.ACTIVE);
  }, [items]);

  // Apply search and filter criteria
  const filteredItems = useMemo(() => {
    return activeItems.filter((item) => {
      // Type filter
      if (selectedType !== 'all' && item.type !== selectedType) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Search query (matches title, description, and location/address)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = item.title?.toLowerCase().includes(query);
        const matchDesc = item.description?.toLowerCase().includes(query);
        const matchLocation = item.location?.toLowerCase().includes(query);
        const matchCategory = item.category?.toLowerCase().includes(query);
        return matchTitle || matchDesc || matchLocation || matchCategory;
      }
      return true;
    });
  }, [activeItems, selectedType, selectedCategory, searchQuery]);

  // Statistics
  const lostCount = activeItems.filter(i => i.type === 'lost').length;
  const foundCount = activeItems.filter(i => i.type === 'found').length;

  return (
    <div className="space-y-6">
      {/* Hero Banner with Stats */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-campus-900 via-campus-800 to-sky-900 text-white p-6 sm:p-8 shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-sky-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Digital Lost & Found for Public Spaces</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Find What You Lost. Return What You Found.
          </h1>
          <p className="text-xs sm:text-sm text-sky-100/90 leading-relaxed">
            Report lost belongings, claim found items with anti-fraud verification, and coordinate safe handovers across public spaces with mutual confirmation.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium">
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
              <span><strong>{lostCount}</strong> Lost Items Active</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span><strong>{foundCount}</strong> Found Items Waiting</span>
            </div>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Filter and Search Bar */}
      <FilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* Listings Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-200 space-y-3">
          <Package className="w-12 h-12 text-slate-300 mx-auto stroke-[1.5]" />
          <h3 className="font-bold text-slate-800 text-base">No active items match your criteria</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your search terms or post a new lost or found report.
          </p>
          <button
            onClick={onOpenReportModal}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-campus-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-campus-700 transition"
          >
            + Report Lost or Found Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              currentUserId={currentUserId}
              onViewDetails={onViewDetails}
              onClaimItem={onClaimItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}
