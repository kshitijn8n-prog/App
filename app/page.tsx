'use client';

import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Map as MapIcon, Loader2, CheckCircle2, Heart, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import RoomCard from '../components/RoomCard';
import RoomDetails from '../components/RoomDetails';
import VerificationModal from '../components/VerificationModal';
import { MOCK_ROOMS } from '../constants'; // We'll move this later
import { Room, SearchFilters, ViewState, User } from '../types';
// import { parseSearchQuery } from '../services/geminiService'; // Removed

// We probably need to adjust imports if we move things, but for now assuming we keep components in root structure

const App: React.FC = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [viewState, setViewState] = useState<ViewState>(ViewState.HOME);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [activeFilters, setActiveFilters] = useState<SearchFilters>({});

    const [savedRoomIds, setSavedRoomIds] = useState<string[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isVerificationOpen, setIsVerificationOpen] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [filterCity, setFilterCity] = useState('');
    const [filterMinPrice, setFilterMinPrice] = useState('');
    const [filterMaxPrice, setFilterMaxPrice] = useState('');

    useEffect(() => {
        fetchRooms();
        fetchWishlist();
        const savedUser = localStorage.getItem('nest_user');
        if (savedUser) {
            const user = JSON.parse(savedUser);
            if (user.type === 'landlord') {
                window.location.href = '/landlord';
                return;
            }
            if (user.type === 'admin') {
                window.location.href = '/admin';
                return;
            }
            setCurrentUser(user);
        }
    }, []);

    const handleVerify = (user: User) => {
        setCurrentUser(user);
        localStorage.setItem('nest_user', JSON.stringify(user));
        if (user.type === 'landlord') {
            window.location.href = '/landlord';
        } else if (user.type === 'admin') {
            window.location.href = '/admin';
        }
    };

    const fetchWishlist = async () => {
        try {
            const res = await fetch('/api/wishlist');
            const data = await res.json();
            if (Array.isArray(data)) {
                // Map wishlist items to room IDs, with safety check for deleted rooms
                setSavedRoomIds(data
                    .filter((item: any) => item.roomId)
                    .map((item: any) => item.roomId.id || item.roomId._id)
                );
            }
        } catch (error) {
            console.error('Failed to fetch wishlist', error);
        }
    };

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/rooms');
            const data = await res.json();
            if (Array.isArray(data)) {
                setRooms(data);
            }
        } catch (error) {
            console.error('Failed to fetch rooms', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSeed = async () => {
        await fetch('/api/seed', { method: 'POST' });
        fetchRooms();
    };


    const handleRoomClick = (room: Room) => {
        setSelectedRoom(room);
        setViewState(ViewState.DETAILS);
    };

    const handleCloseDetails = () => {
        setSelectedRoom(null);
        setViewState(ViewState.HOME);
    };

    const handleBookRoom = async () => {
        if (!currentUser || !selectedRoom) {
            setIsVerificationOpen(true);
            return;
        }

        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomId: selectedRoom.id,
                    roomTitle: selectedRoom.title,
                    tenantName: currentUser.name,
                    tenantEmail: currentUser.email,
                    landlordName: selectedRoom.landlord.name,
                    pricePerWeek: selectedRoom.pricePerWeek
                })
            });

            if (res.ok) {
                setViewState(ViewState.BOOKING_SUCCESS);
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to send booking request');
            }
        } catch (error) {
            console.error('Booking error:', error);
            alert('An error occurred while booking');
        }
    };

    const handleToggleFavorite = async (e: React.MouseEvent, roomId: string) => {
        e.stopPropagation();

        if (!currentUser) {
            setIsVerificationOpen(true);
            return;
        }

        // Optimistic update
        const isCurrentlySaved = savedRoomIds.includes(roomId);
        if (isCurrentlySaved) {
            setSavedRoomIds(prev => prev.filter(id => id !== roomId));
        } else {
            setSavedRoomIds(prev => [...prev, roomId]);
        }

        try {
            const method = isCurrentlySaved ? 'DELETE' : 'POST';
            // For DELETE we use query param, for POST we use body as per our API design
            // Actually my API design: POST body { roomId }, DELETE query ?roomId

            let res;
            if (isCurrentlySaved) {
                res = await fetch(`/api/wishlist?roomId=${roomId}`, { method: 'DELETE' });
            } else {
                res = await fetch('/api/wishlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ roomId })
                });
            }

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                console.error("Failed to update wishlist:", errorData);
                alert(`Wishlist update failed: ${errorData.error || 'Unknown error'}`);

                // Revert if failed
                if (isCurrentlySaved) {
                    setSavedRoomIds(prev => [...prev, roomId]);
                } else {
                    setSavedRoomIds(prev => prev.filter(id => id !== roomId));
                }
            }
        } catch (error) {
            console.error("Failed to update wishlist", error);
            // Revert
            if (isCurrentlySaved) {
                setSavedRoomIds(prev => [...prev, roomId]);
            } else {
                setSavedRoomIds(prev => prev.filter(id => id !== roomId));
            }
        }
    };

    const handleSavedClick = () => {
        window.location.href = '/wishlist';
    };

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setViewState(ViewState.HOME);

        if (!searchQuery.trim()) {
            fetchRooms(); // Refetch to reset
            setActiveFilters({});
            return;
        }

        setIsSearching(true);

        try {
            // Server-side call via API to protect keys
            const searchRes = await fetch('/api/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: searchQuery })
            });
            const aiFilters: SearchFilters = await searchRes.json();

            setActiveFilters(aiFilters);

            const params = new URLSearchParams();
            if (aiFilters.city) params.set('city', aiFilters.city);
            if (aiFilters.maxPrice) params.set('maxPrice', aiFilters.maxPrice.toString());

            const res = await fetch(`/api/rooms?${params.toString()}`);
            const filtered = await res.json();

            const finalFiltered = filtered.filter((room: Room) => {
                const keywords = aiFilters.keywords && aiFilters.keywords.length > 0
                    ? aiFilters.keywords
                    : searchQuery.toLowerCase().split(' ');

                const roomText = `${room.title} ${room.description} ${room.type} ${room.amenities.join(' ')}`.toLowerCase();
                // Basic keyword matching
                const keywordMatch = keywords.some(k => roomText.includes(k.toLowerCase()));

                if (keywords.length > 0 && !keywordMatch && !aiFilters.city && !aiFilters.maxPrice) return false;
                return true;
            });

            setRooms(finalFiltered);
        } catch (err) {
            console.error("Search failed", err);
            // Fallback if API fails
            setRooms(MOCK_ROOMS);
        } finally {
            setIsSearching(false);
        }
    }


    const handleLogout = () => {
        setCurrentUser(null);
        localStorage.removeItem('nest_user');
        window.location.reload();
    };

    const availableCities = [...new Set(rooms.map(r => r.city))].sort();

    const activeFilterCount = [filterCity, filterMinPrice, filterMaxPrice].filter(Boolean).length;

    const clearFilters = () => {
        setFilterCity('');
        setFilterMinPrice('');
        setFilterMaxPrice('');
    };

    const displayRooms = rooms.filter(room => {
        if (filterCity && room.city !== filterCity) return false;
        if (filterMinPrice && room.pricePerWeek < Number(filterMinPrice)) return false;
        if (filterMaxPrice && room.pricePerWeek > Number(filterMaxPrice)) return false;
        return true;
    });

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <Navbar
                onHomeClick={() => setViewState(ViewState.HOME)}
                onSavedClick={handleSavedClick}
                onSignInClick={() => setIsVerificationOpen(true)}
                onLogout={handleLogout}
                currentUser={currentUser}
                savedCount={savedRoomIds.length}
            />

            <VerificationModal
                isOpen={isVerificationOpen}
                onClose={() => setIsVerificationOpen(false)}
                onVerify={handleVerify}
            />

            {viewState === ViewState.HOME && (
                <div className="bg-brand-900 text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-brand-700 rounded-full opacity-50 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-indigo-600 rounded-full opacity-50 blur-3xl"></div>

                    <div className="max-w-4xl mx-auto text-center relative z-10">
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                            Find your home away from home in the UK
                        </h1>
                        <p className="text-lg text-brand-100 mb-8 max-w-2xl mx-auto">
                            Secure, verified student accommodation for international students.
                            Use AI to find exactly what you need.
                        </p>

                        <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                {isSearching ? <Loader2 className="h-5 w-5 text-slate-400 animate-spin" /> : <Search className="h-5 w-5 text-slate-400" />}
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-12 pr-4 py-4 rounded-full text-slate-900 bg-white border-0 shadow-lg focus:ring-4 focus:ring-brand-500/30 text-lg placeholder:text-slate-400 transition"
                                placeholder='Try "Ensuite in Manchester under £200" or "Quiet studio near UCL"...'
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-2 bottom-2 bg-brand-600 text-white px-6 rounded-full font-medium hover:bg-brand-700 transition"
                            >
                                Search
                            </button>
                        </form>

                        {(activeFilters.city || activeFilters.maxPrice) && (
                            <div className="mt-4 flex justify-center gap-2">
                                {activeFilters.city && (
                                    <span className="bg-brand-800 text-brand-100 px-3 py-1 rounded-full text-sm flex items-center">
                                        <MapIcon size={12} className="mr-1" /> {activeFilters.city}
                                    </span>
                                )}
                                {activeFilters.maxPrice && (
                                    <span className="bg-brand-800 text-brand-100 px-3 py-1 rounded-full text-sm">
                                        Max £{activeFilters.maxPrice}/wk
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 pb-16 w-full mt-10">



                {viewState === ViewState.BOOKING_SUCCESS ? (
                    <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center max-w-lg mx-auto mt-10">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 size={40} />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Booking Request Sent!</h2>
                        <p className="text-slate-600 mb-6">
                            Your request for <strong>{selectedRoom?.title}</strong> has been submitted successfully.
                        </p>
                        <div className="text-left bg-slate-50 border border-slate-200 rounded-xl p-5 mb-8 space-y-3">
                            <p className="text-sm font-bold text-slate-700 uppercase tracking-wide">What happens next?</p>
                            <div className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                                <p className="text-sm text-slate-600"><strong>Admin review</strong> — Our team will review your booking request.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                                <p className="text-sm text-slate-600"><strong>Sent to landlord</strong> — Admin forwards it to <strong>{selectedRoom?.landlord.name}</strong> for approval.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                                <p className="text-sm text-slate-600"><strong>Confirmation</strong> — Once the landlord approves, admin confirms your booking.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setSelectedRoom(null);
                                setViewState(ViewState.HOME);
                            }}
                            className="bg-slate-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-slate-800 transition"
                        >
                            Back to Search
                        </button>
                    </div>
                ) : (
                    <>
                        {viewState === ViewState.HOME && (
                            <div className="mb-6">
                                {/* Header row */}
                                <div className="flex justify-between items-center mb-3">
                                    <h2 className="text-xl font-bold text-slate-800">
                                        {displayRooms.length} {displayRooms.length === 1 ? 'place' : 'places'} to stay
                                    </h2>
                                    <button
                                        onClick={() => setShowFilters(v => !v)}
                                        className={`flex items-center gap-2 font-medium px-4 py-2 rounded-lg shadow-sm border transition ${showFilters ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200'}`}
                                    >
                                        <SlidersHorizontal size={16} />
                                        Filters
                                        {activeFilterCount > 0 && (
                                            <span className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ${showFilters ? 'bg-white text-brand-600' : 'bg-brand-600 text-white'}`}>
                                                {activeFilterCount}
                                            </span>
                                        )}
                                    </button>
                                </div>

                                {/* Filter panel */}
                                {showFilters && (
                                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 mb-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            {/* Location */}
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                                                    <MapIcon size={11} className="inline mr-1" />Location
                                                </label>
                                                <select
                                                    value={filterCity}
                                                    onChange={e => setFilterCity(e.target.value)}
                                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50"
                                                >
                                                    <option value="">All Cities</option>
                                                    {availableCities.map(city => (
                                                        <option key={city} value={city}>{city}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Min price */}
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                                                    Min Budget (£/week)
                                                </label>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    placeholder="e.g. 100"
                                                    value={filterMinPrice}
                                                    onChange={e => setFilterMinPrice(e.target.value)}
                                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50"
                                                />
                                            </div>

                                            {/* Max price */}
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                                                    Max Budget (£/week)
                                                </label>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    placeholder="e.g. 400"
                                                    value={filterMaxPrice}
                                                    onChange={e => setFilterMaxPrice(e.target.value)}
                                                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50"
                                                />
                                            </div>
                                        </div>

                                        {/* Active filter pills + clear */}
                                        {activeFilterCount > 0 && (
                                            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                                                <span className="text-xs text-slate-500 font-medium">Active:</span>
                                                {filterCity && (
                                                    <span className="flex items-center gap-1 bg-brand-50 text-brand-700 border border-brand-200 px-2.5 py-1 rounded-full text-xs font-semibold">
                                                        <MapIcon size={10} /> {filterCity}
                                                        <button onClick={() => setFilterCity('')} className="ml-1 hover:text-brand-900"><X size={10} /></button>
                                                    </span>
                                                )}
                                                {filterMinPrice && (
                                                    <span className="flex items-center gap-1 bg-brand-50 text-brand-700 border border-brand-200 px-2.5 py-1 rounded-full text-xs font-semibold">
                                                        Min £{filterMinPrice}/wk
                                                        <button onClick={() => setFilterMinPrice('')} className="ml-1 hover:text-brand-900"><X size={10} /></button>
                                                    </span>
                                                )}
                                                {filterMaxPrice && (
                                                    <span className="flex items-center gap-1 bg-brand-50 text-brand-700 border border-brand-200 px-2.5 py-1 rounded-full text-xs font-semibold">
                                                        Max £{filterMaxPrice}/wk
                                                        <button onClick={() => setFilterMaxPrice('')} className="ml-1 hover:text-brand-900"><X size={10} /></button>
                                                    </span>
                                                )}
                                                <button
                                                    onClick={clearFilters}
                                                    className="ml-auto text-xs text-rose-500 hover:text-rose-700 font-semibold flex items-center gap-1"
                                                >
                                                    <X size={12} /> Clear all
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {displayRooms.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {displayRooms.map(room => (
                                    <RoomCard
                                        key={room.id}
                                        room={room}
                                        onClick={handleRoomClick}
                                        isFavorite={savedRoomIds.includes(room.id)}
                                        onToggleFavorite={handleToggleFavorite}
                                        currentUser={currentUser}
                                    />
                                ))}
                            </div>
                        ) : (
                            viewState === ViewState.HOME && (
                                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                                    <p className="text-slate-500 text-lg">No homes found matching your criteria.</p>
                                    <button
                                        onClick={() => {
                                            setSearchQuery('');
                                            fetchRooms();
                                            setActiveFilters({});
                                            clearFilters();
                                        }}
                                        className="mt-4 text-brand-600 font-medium hover:underline"
                                    >
                                        Clear all filters
                                    </button>
                                </div>
                            )
                        )}


                    </>
                )}
            </main>

            {selectedRoom && viewState === ViewState.DETAILS && (
                <RoomDetails
                    room={selectedRoom}
                    onClose={handleCloseDetails}
                    onBook={handleBookRoom}
                    isFavorite={savedRoomIds.includes(selectedRoom.id)}
                    onToggleFavorite={handleToggleFavorite}
                    currentUser={currentUser}
                    onSignInClick={() => setIsVerificationOpen(true)}
                />
            )}

            <footer className="bg-slate-900 text-slate-400 py-12 mt-auto">
                <div className="max-w-7xl mx-auto px-4 text-center sm:text-left grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-white font-bold text-lg mb-4">StudentNest UK</h3>
                        <p className="text-sm leading-relaxed">Making international study easy. Find your perfect room safely and securely.</p>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Discover</h4>
                        <ul className="space-y-2 text-sm">
                            <li>London</li>
                            <li>Manchester</li>
                            <li>Birmingham</li>
                            <li>Edinburgh</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Support</h4>
                        <ul className="space-y-2 text-sm">
                            <li>Help Center</li>
                            <li>Safety Information</li>
                            <li>Cancellation Options</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm">
                            <li>Privacy Policy</li>
                            <li>Terms of Service</li>
                            <li>Sitemap</li>
                            <li>
                                <button onClick={handleSeed} className="text-slate-600 hover:text-slate-400 text-xs mt-4 block">
                                    (Demo) Seed DB
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default App;
