import { Home, UserCircle, Heart, CheckCircle2, ShieldCheck, MessageSquare, Building2, LogOut } from 'lucide-react';
import Link from 'next/link';
import { User } from '../types';

interface NavbarProps {
  onHomeClick: () => void;
  onSavedClick: () => void;
  onSignInClick: () => void;
  onLogout?: () => void;
  currentUser: User | null;
  savedCount: number;
}

const Navbar: React.FC<NavbarProps> = ({
  onHomeClick,
  onSavedClick,
  onSignInClick,
  onLogout,
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
            {/* Logged in Student Links */}
            {currentUser?.type === 'student' && (
              <>
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
                <Link href="/my-queries" className="flex items-center text-slate-600 hover:text-brand-600 transition group">
                  <MessageSquare className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline ml-2 font-medium text-sm">Queries</span>
                </Link>
              </>
            )}



            {/* Logged in Admin Links */}
            {currentUser?.type === 'admin' && (
              <Link href="/admin" className="flex items-center text-slate-600 hover:text-brand-600 transition group">
                <Building2 className="h-6 w-6 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline ml-2 font-medium text-sm">Dashboard</span>
              </Link>
            )}

            {currentUser ? (
              <div className="flex items-center space-x-3 bg-slate-50 pl-3 pr-4 py-1.5 rounded-full border border-slate-200">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm ${currentUser.type === 'admin' ? 'bg-indigo-600' : currentUser.type === 'student' ? 'bg-brand-500' : 'bg-emerald-600'}`}>
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
                    {currentUser.type === 'admin' ? 'System Admin' : currentUser.type === 'student' ? 'Verified Student' : 'Verified Landlord'}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="ml-2 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition"
                  title="Log Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <button
                  onClick={onSignInClick}
                  className="flex items-center text-slate-600 hover:text-brand-600 transition"
                >
                  <UserCircle className="h-6 w-6 mr-1" />
                  <span className="hidden sm:inline font-medium">Sign In</span>
                </button>
                <button
                  onClick={onSignInClick}
                  className="bg-brand-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-brand-700 transition shadow-sm flex items-center gap-2"
                >
                  <ShieldCheck size={16} />
                  Verify
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
