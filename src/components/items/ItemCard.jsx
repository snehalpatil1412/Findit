import React from 'react';
import { TypeBadge, StatusBadge, CategoryBadge } from '../common/Badge';
import {
  MapPin,
  Calendar,
  ShieldCheck,
  Eye,
  HandCoins,
  Sparkles,
  Laptop,
  Briefcase,
  Key,
  BookOpen,
  Shirt,
  Gem,
  Dumbbell,
  Package
} from 'lucide-react';

function getCategoryIcon(category) {
  switch (category) {
    case 'Electronics': return Laptop;
    case 'Bags & Wallets': return Briefcase;
    case 'Keys & IDs': return Key;
    case 'Documents & Passports': return BookOpen;
    case 'Clothing & Accessories': return Shirt;
    case 'Valuables & Jewelry': return Gem;
    case 'Sporting Equipment': return Dumbbell;
    default: return Package;
  }
}

export default function ItemCard({
  item,
  onViewDetails,
  onClaimItem,
  currentUserId,
  matchScore = null
}) {
  const isReporter = currentUserId && (item.reporterId === currentUserId);
  const isFound = item.type === 'found';
  const isActive = item.status === 'active';
  const Icon = getCategoryIcon(item.category);

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-campus-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden">
      {/* Top Media / Thumbnail */}
      <div className="relative h-44 w-full bg-slate-100 overflow-hidden flex items-center justify-center">
        {item.hasImage && item.imageBase64 ? (
          <img
            src={item.imageBase64}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200/70 flex flex-col items-center justify-center text-slate-400">
            <Icon className="w-12 h-12 stroke-[1.5] text-slate-400/80 mb-1" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {item.category}
            </span>
          </div>
        )}

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <TypeBadge type={item.type} />
          <StatusBadge status={item.status} />
        </div>

        {/* Smart match indicator badge */}
        {matchScore !== null && matchScore > 0 && (
          <div className="absolute top-3 right-3 bg-indigo-600/95 text-white px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 shadow-md backdrop-blur-xs">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>{matchScore}% Match</span>
          </div>
        )}

        {/* Anti-fraud challenge indicator */}
        {isFound && item.secretVerificationQuestion && (
          <div className="absolute bottom-2 left-3 bg-slate-900/80 text-amber-300 px-2 py-0.5 rounded-md text-[10px] font-medium flex items-center gap-1 backdrop-blur-xs">
            <ShieldCheck className="w-3 h-3" />
            <span>Challenge Protected</span>
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          {/* Category & Date */}
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <CategoryBadge category={item.category} />
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              {item.date}
            </span>
          </div>

          {/* Item Title */}
          <h3 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-campus-700 transition">
            {item.title}
          </h3>

          {/* Location / Address */}
          {item.location && (
            <div className="flex items-start gap-1.5 text-xs text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-campus-600 shrink-0 mt-0.5" />
              <p className="line-clamp-1 text-slate-700 font-medium">
                {item.location}
              </p>
            </div>
          )}

          {/* Excerpt */}
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Footer & Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
          <button
            onClick={() => onViewDetails(item)}
            className="flex-1 py-1.5 px-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition flex items-center justify-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>Details</span>
          </button>

          {isFound && isActive && !isReporter && onClaimItem && (
            <button
              onClick={() => onClaimItem(item)}
              className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
            >
              <HandCoins className="w-3.5 h-3.5" />
              <span>Claim</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
