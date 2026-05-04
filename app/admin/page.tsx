
'use client';

import React, { useState, useEffect } from 'react';
import { Room } from '../../types';
import { Trash2, Edit, Plus, Save, X } from 'lucide-react';
import Navbar from '../../components/Navbar';

const AdminPage = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingRoom, setEditingRoom] = useState<Partial<Room> | null>(null);
    const [activeTab, setActiveTab] = useState<'landlords' | 'pending' | 'listings' | 'enquiries' | 'requests' | 'successful'>('landlords');
    const [enquiries, setEnquiries] = useState<any[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [landlords, setLandlords] = useState<any[]>([]);
    const [submittingReply, setSubmittingReply] = useState<string | null>(null);
    const [updatingBooking, setUpdatingBooking] = useState<string | null>(null);

    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('nest_user');
        if (savedUser) {
            const user = JSON.parse(savedUser);
            if (user.type !== 'admin') {
                window.location.href = '/';
                return;
            }
            setCurrentUser(user);
        } else {
            window.location.href = '/';
            return;
        }

        fetchRooms();
        fetchEnquiries();
        fetchBookings();
        fetchLandlords();
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

    const fetchEnquiries = async () => {
        try {
            const res = await fetch('/api/admin/enquiries');
            const data = await res.json();
            setEnquiries(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch enquiries', error);
        }
    };

    const fetchBookings = async () => {
        try {
            const res = await fetch('/api/admin/bookings');
            const data = await res.json();
            setBookings(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch bookings', error);
        }
    };

    const fetchLandlords = async () => {
        try {
            const res = await fetch('/api/admin/landlords');
            const data = await res.json();
            setLandlords(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch landlords', error);
        }
    };

    const handlePublishRoom = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/rooms/${id}/publish`, {
                method: 'PATCH'
            });
            if (res.ok) {
                fetchRooms();
            } else {
                alert('Failed to publish room');
            }
        } catch (err) {
            console.error("Failed to publish room", err);
        }
    };

    const handleUpdateBookingStatus = async (id: string, action: 'SEND_TO_LANDLORD' | 'CONFIRM' | 'CANCEL') => {
        setUpdatingBooking(id);
        try {
            const res = await fetch('/api/admin/bookings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, action })
            });
            if (res.ok) {
                fetchBookings();
                alert(`Booking ${action.toLowerCase()} successfully`);
            } else {
                alert('Failed to update booking');
            }
        } catch (err) {
            console.error("Failed to update booking", err);
        } finally {
            setUpdatingBooking(null);
        }
    };

    const handleReply = async (id: string, answer: string) => {
        if (!answer.trim()) return;
        setSubmittingReply(id);
        try {
            const res = await fetch(`/api/admin/enquiries/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answer })
            });
            if (res.ok) {
                fetchEnquiries();
            }
        } catch (err) {
            console.error("Failed to reply", err);
        } finally {
            setSubmittingReply(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this listing?')) return;
        try {
            await fetch(`/api/rooms/${id}`, { method: 'DELETE' });
            setRooms(rooms.filter(r => r.id !== id));
        } catch (error) {
            console.error('Failed to delete', error);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingRoom) return;

        try {
            const isNew = !editingRoom.id;
            const url = isNew ? '/api/rooms' : `/api/rooms/${editingRoom.id}`;
            const method = isNew ? 'POST' : 'PUT';

            // Basic defaults for new room
            const payload = {
                ...editingRoom,
                // Ensure nested objects exist for new rooms
                landlord: editingRoom.landlord || {
                    name: 'Admin User',
                    verified: true,
                    joinedDate: '2024',
                    responseRate: 100
                },
                reviews: editingRoom.reviews || [],
                universityProximity: Array.isArray(editingRoom.universityProximity) ? editingRoom.universityProximity : [],
                amenities: Array.isArray(editingRoom.amenities) ? editingRoom.amenities : [],
                images: Array.isArray(editingRoom.images) ? editingRoom.images : ['https://picsum.photos/800/600'],
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setEditingRoom(null);
                fetchRooms();
            } else {
                alert('Failed to save');
            }
        } catch (error) {
            console.error('Failed to save', error);
        }
    };

    const startEdit = (room: Room) => {
        setEditingRoom(room);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const startNew = () => {
        setEditingRoom({
            title: '',
            city: '',
            pricePerWeek: 0,
            type: 'Private Studio',
            description: '',
            availableFrom: '2024-09-01'
        });
    };
    const handleLogout = () => {
        localStorage.removeItem('nest_user');
        window.location.href = '/';
    };

    if (!currentUser) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Navbar
                onHomeClick={() => window.location.href = '/'}
                onSavedClick={() => { }}
                onSignInClick={() => { }}
                onLogout={handleLogout}
                currentUser={currentUser}
                savedCount={0}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Administration</h1>
                        <p className="text-slate-500 mt-1">Manage platform listings, enquiries and bookings</p>
                    </div>
                    {/* <div className="flex gap-3">
                        <button
                            onClick={() => {
                                setEditingRoom({
                                    title: '',
                                    description: '',
                                    city: '',
                                    pricePerWeek: 0,
                                    type: 'En-suite' as any,
                                    universityProximity: [],
                                    amenities: [],
                                    images: [],
                                    availableFrom: 'Sept 2024'
                                });
                            }}
                            className="bg-brand-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-brand-100 hover:bg-brand-700 transition flex items-center gap-2"
                        >
                            <Plus size={18} /> New Listing
                        </button>
                    </div> */}
                </div>

                <div className="flex border-b border-slate-200 mb-8 space-x-8">
                    <button
                        className={`pb-4 text-sm font-bold transition-colors relative ${activeTab === 'pending' ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        🔔 Pending Approval
                        {activeTab === 'pending' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full" />}
                    </button>
                    <button
                        className={`pb-4 text-sm font-bold transition-colors relative ${activeTab === 'listings' ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
                        onClick={() => setActiveTab('listings')}
                    >
                        Property Listings
                        {activeTab === 'listings' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full" />}
                    </button>
                    <button
                        className={`pb-4 text-sm font-bold transition-colors relative ${activeTab === 'enquiries' ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
                        onClick={() => setActiveTab('enquiries')}
                    >
                        Tenant Enquiries
                        {activeTab === 'enquiries' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full" />}
                    </button>
                    <button
                        className={`pb-4 text-sm font-bold transition-colors relative ${activeTab === 'requests' ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
                        onClick={() => setActiveTab('requests')}
                    >
                        Booking Requests
                        {activeTab === 'requests' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full" />}
                    </button>
                    <button
                        className={`pb-4 text-sm font-bold transition-colors relative ${activeTab === 'successful' ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
                        onClick={() => setActiveTab('successful')}
                    >
                        Confirmed Bookings
                        {activeTab === 'successful' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full" />}
                    </button>
                </div>

                {activeTab === 'pending' ? (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium text-sm">
                                <tr>
                                    <th className="p-4">Title</th>
                                    <th className="p-4">City</th>
                                    <th className="p-4">Price/wk</th>
                                    <th className="p-4">Type</th>
                                    <th className="p-4">Description</th>
                                    <th className="p-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rooms.filter(r => r.status === 'PENDING').length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-slate-500">
                                            ✅ No pending listings - all properties are published!
                                        </td>
                                    </tr>
                                ) : (
                                    rooms.filter(r => r.status === 'PENDING').map(room => (
                                        <tr key={room.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                                            <td className="p-4 font-medium text-slate-900">{room.title}</td>
                                            <td className="p-4 text-slate-600">{room.city}</td>
                                            <td className="p-4 text-slate-600">£{room.pricePerWeek}/week</td>
                                            <td className="p-4 text-slate-600">{room.type}</td>
                                            <td className="p-4 text-slate-600 truncate max-w-xs">{room.description}</td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => handlePublishRoom(room.id as any)}
                                                    className="bg-green-600 text-white px-4 py-2 rounded font-medium hover:bg-green-700 transition"
                                                >
                                                    ✓ Approve
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : activeTab === 'listings' ? (
                    <>
                        {/* Edit Form */}
                        {editingRoom && (
                            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 mb-8 animate-fade-in-down">
                                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                                    <h2 className="text-xl font-bold text-slate-800">
                                        {editingRoom.id ? 'Edit Room' : 'Create New Room'}
                                    </h2>
                                    <button onClick={() => setEditingRoom(null)} className="text-slate-400 hover:text-slate-600">
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                                        <input
                                            className="w-full p-2 border rounded"
                                            value={editingRoom.title || ''}
                                            onChange={e => setEditingRoom({ ...editingRoom, title: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                                        <input
                                            className="w-full p-2 border rounded"
                                            value={editingRoom.city || ''}
                                            onChange={e => setEditingRoom({ ...editingRoom, city: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Price per Week (£)</label>
                                        <input
                                            type="number"
                                            className="w-full p-2 border rounded"
                                            value={editingRoom.pricePerWeek || 0}
                                            onChange={e => setEditingRoom({ ...editingRoom, pricePerWeek: Number(e.target.value) })}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                        <select
                                            className="w-full p-2 border rounded"
                                            value={editingRoom.type || 'Private Studio'}
                                            onChange={e => setEditingRoom({ ...editingRoom, type: e.target.value as any })}
                                        >
                                            <option>Private Studio</option>
                                            <option>En-suite</option>
                                            <option>Shared Room</option>
                                            <option>Apartment</option>
                                        </select>
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                        <textarea
                                            className="w-full p-2 border rounded h-24"
                                            value={editingRoom.description || ''}
                                            onChange={e => setEditingRoom({ ...editingRoom, description: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="col-span-2 flex justify-end gap-3 mt-4">
                                        <button
                                            type="button"
                                            onClick={() => setEditingRoom(null)}
                                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex items-center gap-2 px-6 py-2 bg-brand-600 text-white rounded hover:bg-brand-700"
                                        >
                                            <Save size={18} /> Save Listing
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* List */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium text-sm">
                                    <tr>
                                        <th className="p-4">Title</th>
                                        <th className="p-4">City</th>
                                        <th className="p-4">Price/wk</th>
                                        <th className="p-4">Type</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {rooms.map(room => (
                                        <tr key={room.id} className="hover:bg-slate-50 transition">
                                            <td className="p-4 font-medium text-slate-900">{room.title}</td>
                                            <td className="p-4 text-slate-600">{room.city}</td>
                                            <td className="p-4 text-slate-600">£{room.pricePerWeek}</td>
                                            <td className="p-4 text-slate-600">
                                                <span className="bg-slate-100 px-2 py-1 rounded text-xs">{room.type}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${room.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {room.status || 'PENDING'}
                                                </span>
                                            </td>
                                            <td className="p-4 flex gap-2 justify-end">
                                                {room.status !== 'PUBLISHED' && (
                                                    <button
                                                        onClick={() => handlePublishRoom(room.id)}
                                                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded"
                                                        title="Publish"
                                                    >
                                                        <Save size={18} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => startEdit(room)}
                                                    className="p-2 text-brand-600 hover:bg-brand-50 rounded"
                                                    title="Edit"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(room.id)}
                                                    className="p-2 text-rose-500 hover:bg-rose-50 rounded"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {rooms.length === 0 && !loading && (
                                        <tr>
                                            <td colSpan={5} className="p-10 text-center text-slate-400">
                                                No rooms found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : activeTab === 'enquiries' ? (
                    <div className="space-y-6">
                        {enquiries.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                                <p className="text-slate-400">No enquiries found.</p>
                            </div>
                        ) : (
                            enquiries.map((enq) => (
                                <div key={enq._id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-slate-900">{enq.roomTitle}</h3>
                                            <p className="text-sm text-slate-500">From: {enq.userName} ({enq.userId})</p>
                                        </div>
                                        <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${enq.status === 'REPLIED' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700 animate-pulse'}`}>
                                            {enq.status}
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-4">
                                        <p className="text-slate-800 text-sm">"{enq.question}"</p>
                                    </div>

                                    {enq.status === 'REPLIED' ? (
                                        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                                            <p className="text-xs font-bold text-emerald-600 mb-1 uppercase">Your Reply:</p>
                                            <p className="text-slate-700 text-sm italic">"{enq.answer}"</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 mt-4">
                                            <textarea
                                                id={`reply-${enq._id}`}
                                                className="w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500"
                                                placeholder="Type your reply here..."
                                            />
                                            <button
                                                onClick={() => {
                                                    const text = (document.getElementById(`reply-${enq._id}`) as HTMLTextAreaElement).value;
                                                    handleReply(enq._id, text);
                                                }}
                                                disabled={submittingReply === enq._id}
                                                className="bg-brand-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
                                            >
                                                {submittingReply === enq._id ? 'Sending...' : 'Reply to User'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                ) : activeTab === 'requests' ? (
                    <div className="space-y-6">
                        {bookings.filter(b => 
                            b.status === 'PENDING' || 
                            b.status === 'AWAITING_LANDLORD' || 
                            b.status === 'LANDLORD_APPROVED' || 
                            b.status === 'LANDLORD_REJECTED'
                        ).length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                                <p className="text-slate-400">No pending booking requests.</p>
                            </div>
                        ) : (
                            bookings
                                .filter(b => 
                                    b.status === 'PENDING' || 
                                    b.status === 'AWAITING_LANDLORD' || 
                                    b.status === 'LANDLORD_APPROVED' || 
                                    b.status === 'LANDLORD_REJECTED'
                                )
                                .map((booking) => (
                                    <div key={booking._id || booking.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
                                        {/* Status Indicator */}
                                        <div className={`absolute top-0 left-0 w-1.5 h-full ${
                                            booking.status === 'LANDLORD_APPROVED' ? 'bg-emerald-500' :
                                            booking.status === 'LANDLORD_REJECTED' ? 'bg-rose-500' :
                                            booking.status === 'AWAITING_LANDLORD' ? 'bg-blue-500' :
                                            'bg-amber-500'
                                        }`}></div>

                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-lg">{booking.roomTitle}</h3>
                                                <p className="text-sm text-slate-500">Landlord: <span className="font-semibold text-slate-700">{booking.landlordName}</span></p>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                                booking.status === 'LANDLORD_APPROVED' ? 'bg-emerald-50 text-emerald-600' :
                                                booking.status === 'LANDLORD_REJECTED' ? 'bg-rose-50 text-rose-600' :
                                                booking.status === 'AWAITING_LANDLORD' ? 'bg-blue-50 text-blue-600' :
                                                'bg-amber-50 text-amber-600'
                                            }`}>
                                                {booking.status}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100 mb-4 text-sm">
                                            <div>
                                                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Tenant Details</p>
                                                <p className="font-medium text-slate-900">{booking.tenantName}</p>
                                                <p className="text-slate-600">{booking.tenantEmail}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Booking Info</p>
                                                <p className="font-medium text-slate-900">£{booking.pricePerWeek} / week</p>
                                                <p className="text-slate-600">Requested: {new Date(booking.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        {/* Landlord Rejection Reason */}
                                        {booking.status === 'LANDLORD_REJECTED' && booking.landlordRejectReason && (
                                            <div className="bg-rose-50 border border-rose-200 p-4 rounded-lg mb-4">
                                                <p className="text-xs font-bold text-rose-600 mb-1 uppercase">Landlord's Reason for Rejection:</p>
                                                <p className="text-slate-700 text-sm italic">"{booking.landlordRejectReason}"</p>
                                            </div>
                                        )}

                                        {/* Action Buttons Based on Status */}
                                        <div className="flex justify-end gap-3 mt-4">
                                            {booking.status === 'PENDING' && (
                                                <>
                                                    <button
                                                        onClick={() => handleUpdateBookingStatus(booking._id || booking.id, 'CANCEL')}
                                                        disabled={updatingBooking === (booking._id || booking.id)}
                                                        className="px-6 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg text-sm font-medium transition disabled:opacity-50"
                                                    >
                                                        Decline Request
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateBookingStatus(booking._id || booking.id, 'SEND_TO_LANDLORD')}
                                                        disabled={updatingBooking === (booking._id || booking.id)}
                                                        className="bg-blue-600 text-white px-8 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition disabled:opacity-50 shadow-md shadow-blue-100"
                                                    >
                                                        {updatingBooking === (booking._id || booking.id) ? 'Sending...' : 'Send to Landlord'}
                                                    </button>
                                                </>
                                            )}

                                            {booking.status === 'AWAITING_LANDLORD' && (
                                                <div className="text-center py-3 px-6 bg-blue-50 border border-blue-200 rounded-lg w-full">
                                                    <p className="text-sm text-blue-600 font-semibold">⏳ Waiting for landlord response...</p>
                                                </div>
                                            )}

                                            {booking.status === 'LANDLORD_APPROVED' && (
                                                <>
                                                    <button
                                                        onClick={() => handleUpdateBookingStatus(booking._id || booking.id, 'CANCEL')}
                                                        disabled={updatingBooking === (booking._id || booking.id)}
                                                        className="px-6 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg text-sm font-medium transition disabled:opacity-50"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateBookingStatus(booking._id || booking.id, 'CONFIRM')}
                                                        disabled={updatingBooking === (booking._id || booking.id)}
                                                        className="bg-emerald-600 text-white px-8 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 transition disabled:opacity-50 shadow-md shadow-emerald-100"
                                                    >
                                                        {updatingBooking === (booking._id || booking.id) ? 'Confirming...' : 'Confirm Booking'}
                                                    </button>
                                                </>
                                            )}

                                            {booking.status === 'LANDLORD_REJECTED' && (
                                                <div className="text-center py-3 px-6 bg-rose-50 border border-rose-200 rounded-lg w-full">
                                                    <p className="text-sm text-rose-600 font-semibold">❌ Landlord rejected this booking</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {bookings.filter(b => b.status === 'SUCCESSFUL' || b.status === 'ADMIN_CONFIRMED').length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                                <p className="text-slate-400">No confirmed bookings yet.</p>
                            </div>
                        ) : (
                            bookings.filter(b => b.status === 'SUCCESSFUL' || b.status === 'ADMIN_CONFIRMED').map((booking) => (
                                <div key={booking._id || booking.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-lg">{booking.roomTitle}</h3>
                                            <p className="text-sm text-slate-500">Landlord: <span className="font-semibold text-slate-700">{booking.landlordName}</span></p>
                                        </div>
                                        <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                            CONFIRMED
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100 mb-2 text-sm">
                                        <div>
                                            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Tenant Details</p>
                                            <p className="font-medium text-slate-900">{booking.tenantName}</p>
                                            <p className="text-slate-600">{booking.tenantEmail}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Booking Info</p>
                                            <p className="font-medium text-slate-900">£{booking.pricePerWeek} / week</p>
                                            <p className="text-slate-600">Confirmed: {new Date(booking.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminPage;
