import React from 'react';
import { CategoryBadge } from '../common/Badge';
import {
  Calendar,
  UserCheck,
  Trash2,
  CheckCircle2,
  MapPin,
  Mail,
  ShieldCheck
} from 'lucide-react';

export default function HistoryCard({ record, onDelete }) {
  const formattedDate = new Date(record.completedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-slate-300 transition space-y-3.5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </span>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">{record.itemTitle}</h3>
            <p className="text-[11px] text-slate-500">Returned on {formattedDate}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <CategoryBadge category={record.itemCategory} />
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {record.myRole}
          </span>
        </div>
      </div>

      {/* Counterparty & Campus Zone Details */}
      <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Exchanged with: <strong className="text-slate-900">{record.counterpartyName}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-700">
          <Mail className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="truncate">{record.counterpartyEmail}</span>
        </div>

        {record.location && (
          <div className="flex items-center gap-2 text-slate-700 sm:col-span-2">
            <MapPin className="w-4 h-4 text-campus-600 shrink-0" />
            <span>Location: <strong>{record.location}</strong></span>
          </div>
        )}
      </div>

      {/* Footer with personal deletion action */}
      <div className="flex items-center justify-between pt-1 text-xs">
        <span className="text-[10px] text-slate-400">
          &bull; Verified dual-confirmation public exchange
        </span>

        <button
          onClick={() => onDelete(record.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-semibold transition"
          title="Remove from your personal view without affecting counterparty"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete from My History</span>
        </button>
      </div>
    </div>
  );
}
