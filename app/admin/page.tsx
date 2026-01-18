
'use client';

import React, { useState, useEffect } from 'react';
import { Room } from '../../types';
import { Trash2, Edit, Plus, Save, X } from 'lucide-react';
import Navbar from '../../components/Navbar';

const AdminPage = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingRoom, setEditingRoom] = useState<Partial<Room> | null>(null);
    const [activeTab, setActiveTab] = useState<'listings' | 'enquiries'>('listings');
    const [enquiries, setEnquiries] = useState<any[]>([]);
    const [submittingReply, setSubmittingReply] = useState<string | null>(null);

    useEffect(() => {
        fetchRooms();
        fetchEnquiries();
    }, []);

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/rooms');
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Navbar
                onHomeClick={() => window.location.href = '/'}
                onSavedClick={() => { }}
                onSignInClick={() => { }}
                currentUser={{ name: 'Admin', email: 'admin@test.com', type: 'student', isVerified: true }}
                savedCount={0}
            />

            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
                    <div className="flex gap-2">
                        <a
                            href="/api/admin/export-excel"
                            target="_blank"
                            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
                        >
                            Export Excel
                        </a>
                        <button
                            onClick={startNew}
                            className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition"
                        >
                            <Plus size={18} /> Add New Room
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b border-slate-200">
                    <button
                        onClick={() => setActiveTab('listings')}
                        className={`pb-4 px-2 font-bold text-sm transition ${activeTab === 'listings' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Property Listings
                    </button>
                    <button
                        onClick={() => setActiveTab('enquiries')}
                        className={`pb-4 px-2 font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'enquiries' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        User Enquiries
                        {enquiries.filter(e => e.status === 'PENDING').length > 0 && (
                            <span className="bg-rose-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                                {enquiries.filter(e => e.status === 'PENDING').length}
                            </span>
                        )}
                    </button>
                </div>

                {activeTab === 'listings' ? (
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
                                            <td className="p-4 flex gap-2 justify-end">
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
                ) : (
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
                )}
            </main>
        </div>
    );
};

export default AdminPage;
