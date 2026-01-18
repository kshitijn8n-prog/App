import React from 'react';
import { Home, UserCircle, Heart, CheckCircle2, ShieldCheck, MessageSquare } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  onHomeClick: () => void;
  onSavedClick: () => void;
  onSignInClick: () => void;
  currentUser: User | null;
  savedCount: number;
}

const Navbar: React.FC<NavbarProps> = ({
  onHomeClick,
  onSavedClick,
  onSignInClick,
  currentUser,
  savedCount
}) => {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={onHomeClick}>
            <Home className="h-8 w-8 text-brand-600" />
            <span className="ml-2 text-xl font-bold text-slate-800 tracking-tight">StudentNest<span className="text-brand-600">UK</span></span>
          </div>
          <div className="flex items-center space-x-6">
            <button
              onClick={() => window.location.href = '/landlord'}
              className="group flex items-center text-slate-600 hover:text-brand-600 transition"
              title="Landlord Dashboard"
            >
              <UserCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline ml-2 font-medium text-sm">Landlords</span>
            </button>

            <button
              onClick={onSavedClick}
              className="group flex items-center text-slate-600 hover:text-rose-600 transition"
              title="Saved Listings"
            >
              <div className="relative">
                <Heart className="h-6 w-6 group-hover:scale-110 transition-transform" />
                {savedCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm">
                    {savedCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline ml-2 font-medium text-sm">Saved</span>
            </button>

            <button
              onClick={() => window.location.href = '/my-queries'}
              className="group flex items-center text-slate-600 hover:text-brand-600 transition"
              title="My Queries"
            >
              <div className="relative">
                <MessageSquare className="h-6 w-6 group-hover:scale-110 transition-transform" />
              </div>
              <span className="hidden sm:inline ml-2 font-medium text-sm">Queries</span>
            </button>

            {currentUser ? (
              <div className="flex items-center space-x-3 bg-slate-50 pl-3 pr-4 py-1.5 rounded-full border border-slate-200">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm ${currentUser.type === 'student' ? 'bg-brand-500' : 'bg-emerald-600'}`}>
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800 leading-tight flex items-center gap-1">
                    {currentUser.name}
                    {currentUser.isVerified && (
                      <CheckCircle2 size={12} className="text-blue-500 fill-blue-50" />
                    )}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">
                    {currentUser.type === 'student' ? 'Verified Student' : 'Verified Landlord'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <button className="text-slate-600 hover:text-brand-600 font-medium text-sm transition hidden sm:block">
                  For Landlords
                </button>
                <button
                  onClick={onSignInClick}
                  className="flex items-center text-slate-600 hover:text-brand-600 transition"
                >
                  <UserCircle className="h-6 w-6 mr-1" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
                <button
                  onClick={onSignInClick}
                  className="bg-brand-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-brand-700 transition shadow-sm flex items-center gap-2"
                >
                  <ShieldCheck size={16} />
                  Verify Identity
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;