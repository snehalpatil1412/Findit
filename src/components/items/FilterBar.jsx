import React from 'react';
import { ITEM_CATEGORIES } from '../../utils/constants';
import { Search, X, Filter, Tag } from 'lucide-react';

export default function FilterBar({
  searchQuery,
  setSearchQuery,
  selectedType,
  setSelectedType,
  selectedCategory,
  setSelectedCategory
}) {
  const hasActiveFilters = searchQuery || selectedType !== 'all' || selectedCategory !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedCategory('all');
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3 mb-6">
      {/* Top Search & Type Selector */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by item name, description, address, location, or keywords..."
            className="w-full pl-10 pr-9 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-campus-500 focus:outline-none transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Type Toggle Pills */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedType === 'all'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setSelectedType('lost')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedType === 'lost'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-slate-500 hover:text-rose-600'
            }`}
          >
            Lost
          </button>
          <button
            onClick={() => setSelectedType('found')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedType === 'found'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-emerald-700'
            }`}
          >
            Found
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 font-semibold mr-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Category:</span>
        </div>

        {/* Category Dropdown */}
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="pl-2.5 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-campus-500 font-medium"
          >
            <option value="all">All Categories</option>
            {ITEM_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Reset Filter Button */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="ml-auto flex items-center gap-1 px-2.5 py-1 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition font-medium"
          >
            <X className="w-3.5 h-3.5" />
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
