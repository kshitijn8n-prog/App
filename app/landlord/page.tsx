'use client';

import React, { useState, useEffect } from 'react';
import { Room, User, Booking } from '../../types';
import { Trash2, Edit, Plus, Save, X, Upload, Image as ImageIcon, AlertCircle, Loader2, MessageSquare, CheckCircle2, XCircle } from 'lucide-react';
import Navbar from '../../components/Navbar';

const LandlordDashboard = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [bookingsLoading, setBookingsLoading] = useState(false);
    const [editingRoom, setEditingRoom] = useState<Partial<Room> | null>(null);
    const [activeTab, setActiveTab] = useState<'listings' | 'bookings'>('listings');
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [approvingId, setApprovingId] = useState<string | null>(null);
    const [updatingRentalStatus, setUpdatingRentalStatus] = useState<string | null>(null);

    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        if (tab === 'listings' || tab === 'bookings') {
            setActiveTab(tab as any);
        }

        const savedUser = localStorage.getItem('nest_user');
        if (savedUser) {
            const user = JSON.parse(savedUser);
            if (user.type !== 'landlord') {
                window.location.href = '/';
                return;
            }
            setCurrentUser(user);
            fetchRooms();
            fetchBookings(user);
        } else {
            window.location.href = '/';
            return;
        }
    }, []);

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/rooms?includePending=true');
            const data = await res.json();
            setRooms(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch rooms', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBookings = async (_user?: User | null) => {
        try {
            setBookingsLoading(true);
            const res = await fetch('/api/admin/bookings');
            const data = await res.json();
            const pendingBookings = Array.isArray(data)
                ? data.filter((b: Booking) => b.status === 'AWAITING_LANDLORD')
                : [];
            setBookings(pendingBookings);
        } catch (error) {
            console.error('Failed to fetch bookings', error);
        } finally {
            setBookingsLoading(false);
        }
    };

    const handleApproveBooking = async (bookingId: string) => {
        setApprovingId(bookingId);
        try {
            const res = await fetch(`/api/landlord/bookings/${bookingId}/approve`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                alert('Booking approved! Admin will contact the student.');
                fetchBookings();
            } else {
                alert('Failed to approve booking');
            }
        } catch (error) {
            console.error('Failed to approve booking', error);
            alert('Error approving booking');
        } finally {
            setApprovingId(null);
        }
    };

    const handleRejectBooking = async (bookingId: string) => {
        if (!rejectReason.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }

        try {
            const res = await fetch(`/api/landlord/bookings/${bookingId}/reject`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: rejectReason })
            });
            if (res.ok) {
                alert('Booking rejected. Admin will notify the student.');
                setRejectingId(null);
                setRejectReason('');
                fetchBookings();
            } else {
                alert('Failed to reject booking');
            }
        } catch (error) {
            console.error('Failed to reject booking', error);
            alert('Error rejecting booking');
        }
    };

    const handleUpdateRentalStatus = async (roomId: string, newStatus: 'AVAILABLE' | 'RENTED') => {
        setUpdatingRentalStatus(roomId);
        try {
            const res = await fetch(`/api/rooms/${roomId}/rental-status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rentalStatus: newStatus })
            });
            if (res.ok) {
                fetchRooms();
            } else {
                alert('Failed to update rental status');
            }
        } catch (error) {
            console.error('Failed to update rental status', error);
            alert('Error updating rental status');
        } finally {
            setUpdatingRentalStatus(null);
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!editingRoom?.title?.trim()) newErrors.title = 'Title is required';
        if (!editingRoom?.city?.trim()) newErrors.city = 'City is required';
        if (!editingRoom?.pricePerWeek || editingRoom.pricePerWeek <= 0) newErrors.pricePerWeek = 'Price must be greater than 0';
        if (!editingRoom?.description?.trim()) newErrors.description = 'Description is required';
        if (imagePreviews.length === 0 && (!editingRoom?.images || editingRoom.images.length === 0)) {
            newErrors.images = 'At least one image is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const fileArray = Array.from(files);
        const promises = fileArray.map(file => {
            return new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });

        Promise.all(promises).then(base64Images => {
            setImagePreviews(prev => [...prev, ...base64Images]);
        });
    };

    const removeImage = (index: number) => {
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const isNew = !editingRoom?.id;
            const url = isNew ? '/api/rooms' : `/api/rooms/${editingRoom?.id}`;
            const method = isNew ? 'POST' : 'PUT';

            const payload = {
                ...editingRoom,
                images: imagePreviews.length > 0 ? imagePreviews : editingRoom?.images,
                landlord: editingRoom?.landlord || {
                    name: 'Demo Landlord',
                    verified: true,
                    joinedDate: new Date().getFullYear().toString(),
                    responseRate: 100
                },
                reviews: editingRoom?.reviews || [],
                universityProximity: Array.isArray(editingRoom?.universityProximity) ? editingRoom.universityProximity : ['Near University'],
                amenities: Array.isArray(editingRoom?.amenities) ? editingRoom.amenities : ['Wifi', 'Kitchen', 'Heating'],
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setEditingRoom(null);
                setImagePreviews([]);
                const isNew = !editingRoom?.id;
                if (isNew) {
                    alert('✅ Listing created! Your property is now awaiting admin approval. You\'ll see it in the "Pending" status. Admin will review and publish it shortly.');
                } else {
                    alert('✅ Listing updated successfully!');
                }
                fetchRooms();
            } else {
                alert('Failed to save property. Please check the network tab for details.');
            }
        } catch (error) {
            console.error('Failed to save', error);
        }
    };

    const startEdit = (room: Room) => {
        setEditingRoom(room);
        setImagePreviews(room.images);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const startNew = () => {
        setEditingRoom({
            title: '',
            city: '',
            pricePerWeek: 0,
            type: 'Private Studio',
            description: '',
            availableFrom: new Date().toISOString().split('T')[0]
        });
        setImagePreviews([]);
        setErrors({});
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Navbar
                onHomeClick={() => window.location.href = '/'}
                onSavedClick={() => window.location.href = '/wishlist'}
                onSignInClick={() => { }}
                onLogout={() => {
                    localStorage.removeItem('nest_user');
                    window.location.href = '/';
                }}
                currentUser={currentUser}
                savedCount={0}
            />

            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Landlord Dashboard</h1>
                        <p className="text-slate-500">Manage your property listings and bookings</p>
                    </div>
                    <button
                        onClick={startNew}
                        className="flex items-center gap-2 bg-brand-600 text-white px-6 py-3 rounded-xl hover:bg-brand-700 transition shadow-lg shadow-brand-100 font-bold"
                    >
                        <Plus size={20} /> List New Property
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-8 mb-8 border-b border-slate-200">
                    <button
                        onClick={() => setActiveTab('listings')}
                        className={`pb-4 px-2 font-bold text-sm transition-all border-b-2 ${activeTab === 'listings' ? 'text-brand-600 border-brand-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                    >
                        Your Properties
                    </button>
                    <button
                        onClick={() => setActiveTab('bookings')}
                        className={`pb-4 px-2 font-bold text-sm transition-all border-b-2 relative ${activeTab === 'bookings' ? 'text-brand-600 border-brand-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                    >
                        Booking Requests
                        {bookings.filter(b => b.status === 'AWAITING_LANDLORD' || b.status === 'PENDING').length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                {bookings.filter(b => b.status === 'AWAITING_LANDLORD' || b.status === 'PENDING').length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Property Form */}
                {editingRoom && (
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 mb-12 animate-fade-in-down overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-2 h-full bg-brand-600"></div>
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold text-slate-800">
                                {editingRoom.id ? 'Edit Property Details' : 'Create New Listing'}
                            </h2>
                            <button onClick={() => setEditingRoom(null)} className="text-slate-400 hover:text-slate-600 transition">
                                <X size={28} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Property Title</label>
                                    <input
                                        className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition ${errors.title ? 'border-rose-500 bg-rose-50' : 'border-slate-200'}`}
                                        placeholder="e.g. Modern Studio near University of Manchester"
                                        value={editingRoom.title || ''}
                                        onChange={e => setEditingRoom({ ...editingRoom, title: e.target.value })}
                                    />
                                    {errors.title && <p className="text-rose-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.title}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">City</label>
                                        <input
                                            className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition ${errors.city ? 'border-rose-500 bg-rose-50' : 'border-slate-200'}`}
                                            placeholder="London"
                                            value={editingRoom.city || ''}
                                            onChange={e => setEditingRoom({ ...editingRoom, city: e.target.value })}
                                        />
                                        {errors.city && <p className="text-rose-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.city}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Price (£/week)</label>
                                        <input
                                            type="number"
                                            className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition ${errors.pricePerWeek ? 'border-rose-500 bg-rose-50' : 'border-slate-200'}`}
                                            value={editingRoom.pricePerWeek || 0}
                                            onChange={e => setEditingRoom({ ...editingRoom, pricePerWeek: Number(e.target.value) })}
                                        />
                                        {errors.pricePerWeek && <p className="text-rose-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.pricePerWeek}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Type</label>
                                        <select
                                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition"
                                            value={editingRoom.type || 'Private Studio'}
                                            onChange={e => setEditingRoom({ ...editingRoom, type: e.target.value as any })}
                                        >
                                            <option>Private Studio</option>
                                            <option>En-suite</option>
                                            <option>Shared Room</option>
                                            <option>Apartment</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Available From</label>
                                        <input
                                            type="date"
                                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition"
                                            value={editingRoom.availableFrom || ''}
                                            onChange={e => setEditingRoom({ ...editingRoom, availableFrom: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                                    <textarea
                                        className={`w-full p-3 border rounded-xl h-40 focus:ring-2 focus:ring-brand-500 outline-none transition ${errors.description ? 'border-rose-500 bg-rose-50' : 'border-slate-200'}`}
                                        placeholder="Tell students about your property, proximity to university, and rules..."
                                        value={editingRoom.description || ''}
                                        onChange={e => setEditingRoom({ ...editingRoom, description: e.target.value })}
                                    />
                                    {errors.description && <p className="text-rose-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.description}</p>}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-semibold text-slate-700">Property Photos</label>
                                {errors.images && <p className="text-rose-500 text-xs flex items-center gap-1"><AlertCircle size={12} /> {errors.images}</p>}

                                <div className="grid grid-cols-3 gap-3">
                                    {imagePreviews.map((img, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-100 group">
                                            <img src={img} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-brand-500 hover:bg-brand-50 transition text-slate-400 hover:text-brand-600">
                                        <Upload size={24} className="mb-1" />
                                        <span className="text-[10px] font-bold uppercase">Add Photo</span>
                                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                                    </label>
                                </div>
                                <p className="text-[10px] text-slate-400 italic">Tip: Use high-quality photos to attract more students.</p>
                            </div>

                            <div className="col-span-1 md:col-span-2 flex justify-end gap-4 mt-4 border-t border-slate-100 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setEditingRoom(null)}
                                    className="px-8 py-3 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition"
                                >
                                    Discard
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-10 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition shadow-lg shadow-slate-200 font-bold"
                                >
                                    <Save size={18} /> {editingRoom.id ? 'Update Listing' : 'Publish Property'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Property List */}
                {activeTab === 'listings' && (
                <div className="space-y-4">
                    {/* Info Banner */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
                        <div className="text-blue-600 flex-shrink-0">ℹ️</div>
                        <div>
                            <p className="text-sm font-semibold text-blue-900">How Listing Status Works</p>
                            <p className="text-xs text-blue-700 mt-1">
                                • <strong>Pending:</strong> Your listing is waiting for admin approval. Once approved, it will be visible to students.
                                • <strong>Published:</strong> Your listing is live and students can view and book it.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="font-bold text-slate-800">Your Listings</h2>
                        <span className="text-xs bg-slate-100 px-3 py-1 rounded-full font-bold text-slate-500">{rooms.length} Total</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="p-6">Property</th>
                                    <th className="p-6 text-center">Price</th>
                                    <th className="p-6 text-center">Type</th>
                                    <th className="p-6 text-center">Status</th>
                                    <th className="p-6 text-center">Rental Status</th>
                                    <th className="p-6 text-center">Images</th>
                                    <th className="p-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rooms.map(room => (
                                    <tr key={room.id} className="hover:bg-slate-50/50 transition group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                                                    <img src={room.images[0]} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 group-hover:text-brand-600 transition truncate max-w-[200px]">{room.title}</p>
                                                    <p className="text-xs text-slate-500">{room.city}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <span className="font-bold text-slate-900">£{room.pricePerWeek}</span>
                                            <span className="text-[10px] text-slate-400 block uppercase">per week</span>
                                        </td>
                                        <td className="p-6 text-center">
                                            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase">{room.type}</span>
                                        </td>
                                        <td className="p-6 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${room.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {room.status || 'PENDING'}
                                            </span>
                                        </td>
                                        <td className="p-6 text-center">
                                            <div className="flex gap-2 justify-center">
                                                <button
                                                    onClick={() => handleUpdateRentalStatus(room.id, 'AVAILABLE')}
                                                    disabled={updatingRentalStatus === room.id}
                                                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition ${
                                                        room.rentalStatus === 'AVAILABLE'
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : 'bg-slate-100 text-slate-600 hover:bg-emerald-50'
                                                    } ${updatingRentalStatus === room.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                >
                                                    Available
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateRentalStatus(room.id, 'RENTED')}
                                                    disabled={updatingRentalStatus === room.id}
                                                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition ${
                                                        room.rentalStatus === 'RENTED'
                                                            ? 'bg-rose-100 text-rose-700'
                                                            : 'bg-slate-100 text-slate-600 hover:bg-rose-50'
                                                    } ${updatingRentalStatus === room.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                >
                                                    Rented
                                                </button>
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <div className="flex justify-center -space-x-2">
                                                {room.images.slice(0, 3).map((img, i) => (
                                                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white overflow-hidden bg-slate-200">
                                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                ))}
                                                {room.images.length > 3 && (
                                                    <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-800 text-white text-[8px] flex items-center justify-center font-bold">
                                                        +{room.images.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    onClick={() => startEdit(room)}
                                                    className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition"
                                                    title="Edit"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {rooms.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={6} className="p-20 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <ImageIcon size={48} className="text-slate-200 mb-2" />
                                                <p className="text-slate-400 font-medium">No properties listed yet.</p>
                                                <button onClick={startNew} className="text-brand-600 text-sm font-bold hover:underline">Start your first listing</button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                </div>
                )}

                {/* Bookings Tab */}
                {activeTab === 'bookings' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <div>
                            <h2 className="font-bold text-slate-800">Booking Requests</h2>
                            <p className="text-xs text-blue-600 mt-0.5">These requests have been reviewed and forwarded to you by admin</p>
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">{bookings.length} Awaiting Your Review</span>
                    </div>

                    {bookingsLoading ? (
                        <div className="p-20 text-center flex items-center justify-center gap-2">
                            <Loader2 className="animate-spin text-brand-600" size={24} />
                            <span className="text-slate-500">Loading bookings...</span>
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="p-20 text-center">
                            <div className="flex flex-col items-center gap-2">
                                <MessageSquare size={48} className="text-slate-200 mb-2" />
                                <p className="text-slate-400 font-medium">No pending booking requests.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {bookings.map(booking => (
                                <div key={booking.id} className="p-6 hover:bg-slate-50/50 transition">
                                    <div className="flex items-center gap-2 mb-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                                        <span className="text-blue-500 text-sm">📋</span>
                                        <p className="text-xs text-blue-700 font-semibold">Admin has forwarded this booking request for your review</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Room</p>
                                            <p className="font-bold text-slate-900">{booking.roomTitle}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Student</p>
                                            <p className="font-bold text-slate-900">{booking.tenantName}</p>
                                            <p className="text-xs text-slate-500">{booking.tenantEmail}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Price</p>
                                            <p className="font-bold text-slate-900">£{booking.pricePerWeek}/week</p>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <p className="text-xs text-slate-500 uppercase font-bold mb-2">Request Date</p>
                                        <p className="text-sm text-slate-600">
                                            {new Date(booking.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>

                                    {rejectingId === booking.id ? (
                                        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 mb-4">
                                            <label className="block text-xs text-slate-700 uppercase font-bold mb-2">Reason for Rejection</label>
                                            <textarea
                                                className="w-full p-3 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
                                                placeholder="Tell us why you're rejecting this booking..."
                                                value={rejectReason}
                                                onChange={(e) => setRejectReason(e.target.value)}
                                                rows={3}
                                            />
                                            <div className="flex gap-2 mt-3">
                                                <button
                                                    onClick={() => handleRejectBooking(booking.id!)}
                                                    className="flex-1 flex items-center justify-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition font-bold"
                                                >
                                                    <XCircle size={16} /> Confirm Rejection
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setRejectingId(null);
                                                        setRejectReason('');
                                                    }}
                                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition font-bold"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleApproveBooking(booking.id!)}
                                                disabled={approvingId === booking.id}
                                                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition font-bold"
                                            >
                                                {approvingId === booking.id ? (
                                                    <>
                                                        <Loader2 size={16} className="animate-spin" /> Approving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle2 size={16} /> Approve
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => setRejectingId(booking.id!)}
                                                className="flex-1 flex items-center justify-center gap-2 bg-rose-600 text-white px-6 py-2 rounded-lg hover:bg-rose-700 transition font-bold"
                                            >
                                                <XCircle size={16} /> Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                )}

            </main>
        </div>
    );
};

export default LandlordDashboard;
