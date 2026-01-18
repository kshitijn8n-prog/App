'use client';

import React, { useState, useEffect } from 'react';
import { Room } from '../../types';
import { Trash2, Edit, Plus, Save, X, Upload, Image as ImageIcon, AlertCircle, Loader2, MessageSquare } from 'lucide-react';
import Navbar from '../../components/Navbar';

const LandlordDashboard = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingRoom, setEditingRoom] = useState<Partial<Room> | null>(null);
    const [activeTab, setActiveTab] = useState<'listings' | 'queries'>('listings');
    const [enquiries, setEnquiries] = useState<any[]>([]);
    const [submittingReply, setSubmittingReply] = useState<string | null>(null);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchRooms();
        fetchEnquiries();
    }, []);

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

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/rooms');
            const data = await res.json();
            // In a real app, we'd filter by landlord ID. 
            // For this demo, we'll show all and pretend they belong to this landlord.
            setRooms(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch rooms', error);
        } finally {
            setLoading(false);
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
                currentUser={{ name: 'Demo Landlord', email: 'landlord@test.com', type: 'landlord', isVerified: true }}
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
                        onClick={() => setActiveTab('queries')}
                        className={`pb-4 px-2 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'queries' ? 'text-brand-600 border-brand-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                    >
                        Student Queries
                        {enquiries.filter(e => e.status === 'PENDING').length > 0 && (
                            <span className="bg-rose-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                                {enquiries.filter(e => e.status === 'PENDING').length}
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

                {activeTab === 'listings' ? (
                    /* Property List */
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
                                            <td colSpan={5} className="p-20 text-center">
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
                ) : (
                    <div className="space-y-6">
                        {enquiries.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                                <p className="text-slate-400">No student queries found yet.</p>
                            </div>
                        ) : (
                            enquiries.map((enq) => (
                                <div key={enq._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold">
                                                {enq.userName.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900">{enq.roomTitle}</h3>
                                                <p className="text-xs text-slate-500">From: <span className="text-slate-700 font-medium">{enq.userName}</span></p>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${enq.status === 'REPLIED' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                            {enq.status}
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6 relative">
                                        <div className="absolute -top-2 left-4 px-2 bg-white text-[10px] font-bold text-slate-400 border border-slate-100 rounded tracking-wider uppercase">Question</div>
                                        <p className="text-slate-800 text-sm italic">"{enq.question}"</p>
                                    </div>

                                    {enq.status === 'REPLIED' ? (
                                        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 relative">
                                            <div className="absolute -top-2 left-4 px-2 bg-white text-[10px] font-bold text-emerald-500 border border-emerald-100 rounded tracking-wider uppercase">Your Answer</div>
                                            <p className="text-slate-700 text-sm">"{enq.answer}"</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <textarea
                                                id={`reply-${enq._id}`}
                                                className="w-full p-4 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none transition h-24"
                                                placeholder="Type your answer to the student here..."
                                            />
                                            <div className="flex justify-end">
                                                <button
                                                    onClick={() => {
                                                        const text = (document.getElementById(`reply-${enq._id}`) as HTMLTextAreaElement).value;
                                                        handleReply(enq._id, text);
                                                    }}
                                                    disabled={submittingReply === enq._id}
                                                    className="bg-brand-600 text-white px-8 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-700 transition disabled:opacity-50 shadow-lg shadow-brand-100 flex items-center gap-2"
                                                >
                                                    {submittingReply === enq._id ? <Loader2 className="animate-spin" size={16} /> : <MessageSquare size={16} />}
                                                    Send Answer
                                                </button>
                                            </div>
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

export default LandlordDashboard;
