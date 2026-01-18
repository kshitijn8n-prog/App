'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import RoomCard from '../../components/RoomCard';
import { Room } from '../../types';
import { Loader2 } from 'lucide-react';

const WishlistPage = () => {
    const [wishlist, setWishlist] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/wishlist');
            const data = await res.json();
            setWishlist(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch wishlist', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFavorite = async (e: React.MouseEvent, roomId: string) => {
        e.stopPropagation();
        e.preventDefault();

        // Optimistic update
        setWishlist(prev => prev.filter(item => item.roomId._id !== roomId && item.roomId.id !== roomId));

        try {
            const res = await fetch(`/api/wishlist?roomId=${roomId}`, { method: 'DELETE' });
            if (!res.ok) {
                fetchWishlist(); // Revert on failure
            }
        } catch (error) {
            console.error('Failed to remove from wishlist', error);
            fetchWishlist();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Navbar
                onHomeClick={() => window.location.href = '/'}
                onSavedClick={() => { }} // Already here
                onSignInClick={() => { }}
                currentUser={{ name: 'Demo User', email: 'demo@test.com', type: 'student', isVerified: true }}
                savedCount={wishlist.length}
            />

            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
                <h1 className="text-3xl font-bold text-slate-900 mb-8">My Wishlist</h1>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-brand-600" size={40} />
                    </div>
                ) : wishlist.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                        <p className="text-slate-500 text-lg">Your wishlist is empty.</p>
                        <a href="/" className="mt-4 inline-block text-brand-600 font-medium hover:underline">
                            Browse Homes
                        </a>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wishlist.map(item => {
                            // Map Room object (ensuring id is set correctly if it comes from _id)
                            const room = item.roomId;
                            // Ensure id exists for RoomCard (Mongoose populates _id usually)
                            if (!room.id && room._id) room.id = room._id;

                            return (
                                <RoomCard
                                    key={room.id || item._id}
                                    room={room}
                                    onClick={(r) => window.location.href = `/?roomId=${r.id}`} // Simple nav or handle differently
                                    isFavorite={true}
                                    onToggleFavorite={handleToggleFavorite}
                                />
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

export default WishlistPage;
