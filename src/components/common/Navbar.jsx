import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  FilePlus,
  Compass,
  FileText,
  HandCoins,
  Scale,
  History,
  Mail,
  LogIn,
  LogOut,
  ChevronDown,
  UserCheck
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenReportModal,
  onOpenAuthModal,
  pendingReviewCount = 0,
  emailCount = 0
}) {
  const { currentUser, logout, selectDemoUser, demoUsers, isLiveFirebase } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navItems = [
    { id: 'listings', label: 'Active Listings', icon: Compass },
    { id: 'my-reports', label: 'My Reports', icon: FileText },
    { id: 'my-claims', label: 'My Claims', icon: HandCoins },
    {
      id: 'review-claims',
      label: 'Review Claims',
      icon: Scale,
      badge: pendingReviewCount > 0 ? pendingReviewCount : null
    },
    { id: 'history', label: 'History', icon: History },
    { id: 'emails', label: 'Emails', icon: Mail }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('listings')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-campus-700 to-sky-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition">
                <Search className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-campus-800 to-sky-600 bg-clip-text text-transparent">
                  FindIt
                </span>
                <span className="hidden sm:inline-block ml-2 text-[11px] font-semibold text-campus-700 bg-campus-50 px-2 py-0.5 rounded-full border border-campus-200">
                  Public Lost & Found
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`relative flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-campus-50 text-campus-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-campus-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2.5">
            {/* Primary Report Button */}
            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-campus-600 hover:bg-campus-700 active:scale-95 text-white text-xs font-bold shadow-sm shadow-campus-600/30 transition"
            >
              <FilePlus className="w-4 h-4" />
              <span>Report Item</span>
            </button>

            {/* User Profile / Auth */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-slate-800 leading-tight">
                      {currentUser.name || currentUser.displayName}
                    </p>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      {currentUser.role || 'Community Member'}
                    </p>
                  </div>
                  <img
                    src={
                      currentUser.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || currentUser.displayName || 'User')}&background=0284c7&color=fff`
                    }
                    alt="avatar"
                    className="w-7 h-7 rounded-lg object-cover border border-slate-200"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Profile dropdown */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-bold text-slate-800">{currentUser.name || currentUser.displayName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                      <span className="mt-1 inline-block text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
                        {isLiveFirebase ? 'Firebase User' : 'Demo Account'}
                      </span>
                    </div>

                    {!isLiveFirebase && (
                      <div className="px-3 py-2 border-b border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Switch Demo Persona:
                        </p>
                        <div className="space-y-1">
                          {demoUsers.map((u) => (
                            <button
                              key={u.id}
                              onClick={() => {
                                selectDemoUser(u.id);
                                setProfileDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left transition ${
                                currentUser.id === u.id
                                  ? 'bg-campus-50 text-campus-700 font-bold'
                                  : 'hover:bg-slate-50 text-slate-600'
                              }`}
                            >
                              <span className="truncate">{u.name}</span>
                              {currentUser.id === u.id && <UserCheck className="w-3.5 h-3.5 shrink-0" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="px-2 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
              >
                <LogIn className="w-4 h-4 text-slate-500" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto py-2 border-t border-slate-100 gap-2 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition ${
                  isActive ? 'bg-campus-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-rose-500 text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
