'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { Loader2, CalendarDays, Clock, CheckCircle2, XCircle, AlertCircle, Home } from 'lucide-react';
import { Booking } from '../../types';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    PENDING: {
        label: 'Under Admin Review',
        color: 'bg-amber-100 text-amber-700 border-amber-200',
        icon: <Clock size={13} />,
    },
    AWAITING_LANDLORD: {
        label: 'Sent to Landlord',
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: <Clock size={13} />,
    },
    LANDLORD_APPROVED: {
        label: 'Landlord Approved',
        color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        icon: <CheckCircle2 size={13} />,
    },
    ADMIN_CONFIRMED: {
        label: 'Booking Confirmed',
        color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        icon: <CheckCircle2 size={13} />,
    },
    SUCCESSFUL: {
        label: 'Booking Successful',
        color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        icon: <CheckCircle2 size={13} />,
    },
    LANDLORD_REJECTED: {
        label: 'Rejected by Landlord',
        color: 'bg-rose-100 text-rose-700 border-rose-200',
        icon: <XCircle size={13} />,
    },
    CANCELLED: {
        label: 'Cancelled',
        color: 'bg-slate-100 text-slate-500 border-slate-200',
        icon: <XCircle size={13} />,
    },
};

const STEPS = ['PENDING', 'AWAITING_LANDLORD', 'LANDLORD_APPROVED', 'ADMIN_CONFIRMED'];

const MyBookingsPage = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('nest_user');
        if (!savedUser) { window.location.href = '/'; return; }
        const user = JSON.parse(savedUser);
        if (user.type !== 'student') { window.location.href = '/'; return; }
        setCurrentUser(user);
        fetchBookings(user.email);
    }, []);

    const fetchBookings = async (email: string) => {
        try {
            setLoading(true);
            const res = await fetch(`/api/bookings?tenantEmail=${encodeURIComponent(email)}`);
            const data = await res.json();
            setBookings(Array.isArray(data) ? data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : []);
        } catch (error) {
            console.error('Failed to fetch bookings', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('nest_user');
        window.location.href = '/';
    };

    const getStepIndex = (status: string) => STEPS.indexOf(status);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Navbar
                onHomeClick={() => window.location.href = '/'}
                onSavedClick={() => window.location.href = '/wishlist'}
                onSignInClick={() => {}}
                onLogout={handleLogout}
                currentUser={currentUser}
                savedCount={0}
            />

            <main className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">My Bookings</h1>
                    <p className="text-slate-500 mt-1 text-sm">Track the status of your accommodation requests</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-brand-600" size={40} />
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                        <Home className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                        <p className="text-slate-500 text-lg font-medium">No booking requests yet.</p>
                        <a href="/" className="mt-4 inline-block text-brand-600 font-medium hover:underline text-sm">
                            Browse rooms
                        </a>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {bookings.map((booking: any) => {
                            const cfg = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG['PENDING'];
                            const stepIdx = getStepIndex(booking.status);
                            const isTerminal = ['LANDLORD_REJECTED', 'CANCELLED', 'SUCCESSFUL', 'ADMIN_CONFIRMED'].includes(booking.status);

                            return (
                                <div key={booking.id || booking._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    {/* Top bar colour by status */}
                                    <div className={`h-1.5 w-full ${
                                        booking.status === 'LANDLORD_REJECTED' || booking.status === 'CANCELLED' ? 'bg-rose-400' :
                                        booking.status === 'SUCCESSFUL' || booking.status === 'ADMIN_CONFIRMED' ? 'bg-emerald-500' :
                                        booking.status === 'LANDLORD_APPROVED' ? 'bg-emerald-400' :
                                        booking.status === 'AWAITING_LANDLORD' ? 'bg-blue-500' : 'bg-amber-400'
                                    }`} />

                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-lg">{booking.roomTitle}</h3>
                                                <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                                                    <CalendarDays size={12} />
                                                    Requested {new Date(booking.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </p>
                                            </div>
                                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.color}`}>
                                                {cfg.icon}
                                                {cfg.label}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-3 mb-4 text-sm">
                                            <span className="text-slate-500">Price:</span>
                                            <span className="font-bold text-slate-900">£{booking.pricePerWeek} / week</span>
                                        </div>

                                        {/* Progress stepper — only for active (non-terminal) statuses */}
                                        {!isTerminal && (
                                            <div className="flex items-center gap-0 mb-4">
                                                {['Admin Review', 'Sent to Landlord', 'Landlord Approved', 'Confirmed'].map((label, i) => (
                                                    <React.Fragment key={i}>
                                                        <div className="flex flex-col items-center">
                                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${
                                                                i < stepIdx + 1 ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white border-slate-300 text-slate-400'
                                                            }`}>
                                                                {i < stepIdx + 1 ? '✓' : i + 1}
                                                            </div>
                                                            <span className="text-[9px] text-slate-500 mt-1 text-center w-16 leading-tight">{label}</span>
                                                        </div>
                                                        {i < 3 && (
                                                            <div className={`flex-1 h-0.5 mb-4 mx-0.5 ${i < stepIdx ? 'bg-brand-600' : 'bg-slate-200'}`} />
                                                        )}
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                        )}

                                        {/* ✅ Landlord Approved notification */}
                                        {booking.status === 'LANDLORD_APPROVED' && (
                                            <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-300 rounded-xl p-4">
                                                <CheckCircle2 size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-bold text-emerald-700">Approved by Landlord 🎉</p>
                                                    <p className="text-xs text-emerald-600 mt-0.5">The landlord has approved your booking. It is now awaiting final confirmation from admin.</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* ❌ Landlord Rejected notification */}
                                        {booking.status === 'LANDLORD_REJECTED' && (
                                            <div className="bg-rose-50 border border-rose-300 rounded-xl p-4 space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <XCircle size={20} className="text-rose-500 shrink-0" />
                                                    <p className="text-sm font-bold text-rose-700">Booking Rejected by Landlord</p>
                                                </div>
                                                <p className="text-xs text-rose-600">Unfortunately the landlord has declined your booking request.</p>
                                                {booking.landlordRejectReason && (
                                                    <div className="bg-white border border-rose-200 rounded-lg px-3 py-2 mt-2">
                                                        <p className="text-[10px] font-bold text-rose-500 uppercase mb-1">Reason</p>
                                                        <p className="text-sm text-slate-700">{booking.landlordRejectReason}</p>
                                                    </div>
                                                )}
                                                <a href="/" className="inline-block mt-2 text-xs font-bold text-brand-600 hover:underline">
                                                    Browse other rooms →
                                                </a>
                                            </div>
                                        )}

                                        {/* ✅ Fully confirmed */}
                                        {(booking.status === 'SUCCESSFUL' || booking.status === 'ADMIN_CONFIRMED') && (
                                            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                                                <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                                                <div>
                                                    <p className="text-sm font-bold text-emerald-700">Booking Confirmed 🏠</p>
                                                    <p className="text-xs text-emerald-600 mt-0.5">Your booking has been fully confirmed. Welcome to your new home!</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyBookingsPage;
