import React from 'react';

export function StatusBadge({ status }) {
  let style = 'bg-slate-100 text-slate-700 border-slate-200';
  let label = status || 'Active';

  switch (status) {
    case 'active':
      style = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      label = 'Active Listing';
      break;
    case 'in_handover':
      style = 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse-subtle';
      label = 'In Handover';
      break;
    case 'returned':
      style = 'bg-blue-50 text-blue-700 border-blue-200';
      label = 'Returned & Closed';
      break;
    case 'pending':
      style = 'bg-amber-50 text-amber-700 border-amber-200';
      label = 'Pending Review';
      break;
    case 'approved':
      style = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      label = 'Claim Approved';
      break;
    case 'rejected':
      style = 'bg-rose-50 text-rose-700 border-rose-200';
      label = 'Claim Rejected';
      break;
    case 'completed':
      style = 'bg-blue-50 text-blue-700 border-blue-200';
      label = 'Exchange Complete';
      break;
    default:
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75"></span>
      {label}
    </span>
  );
}

export function TypeBadge({ type }) {
  if (type === 'lost') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200 uppercase tracking-wide">
        Lost
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 uppercase tracking-wide">
      Found
    </span>
  );
}

export function CategoryBadge({ category }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
      {category}
    </span>
  );
}
