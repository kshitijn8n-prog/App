'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { Loader2, MessageSquare, Clock, CheckCircle2 } from 'lucide-react';

const MyQueriesPage = () => {
    const [enquiries, setEnquiries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEnquiries();
    }, []);

    const fetchEnquiries = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/enquiries');
            const data = await res.json();
            setEnquiries(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch enquiries', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Navbar
                onHomeClick={() => window.location.href = '/'}
                onSavedClick={() => window.location.href = '/wishlist'}
                onSignInClick={() => { }}
                currentUser={{ name: 'Demo User', email: 'demo@test.com', type: 'student', isVerified: true }}
                savedCount={0}
            />

            <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
                <h1 className="text-3xl font-bold text-slate-900 mb-8">My Enquiries</h1>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-brand-600" size={40} />
                    </div>
                ) : enquiries.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                        <MessageSquare className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                        <p className="text-slate-500 text-lg">You haven't asked any questions yet.</p>
                        <a href="/" className="mt-4 inline-block text-brand-600 font-medium hover:underline">
                            Browse Rooms
                        </a>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {enquiries.map((enq) => (
                            <div key={enq._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-lg mb-1">{enq.roomTitle}</h3>
                                            <p className="text-xs text-slate-500 flex items-center gap-1">
                                                <Clock size={12} /> Asked on {new Date(enq.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${enq.status === 'REPLIED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {enq.status === 'REPLIED' ? (
                                                <><CheckCircle2 size={12} /> Replied</>
                                            ) : (
                                                <><Clock size={12} /> Pending</>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
                                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2 text-[10px]">Your Question</p>
                                        <p className="text-slate-800 text-sm leading-relaxed">{enq.question}</p>
                                    </div>

                                    {enq.status === 'REPLIED' && (
                                        <div className="bg-brand-50 p-4 rounded-xl border border-brand-100 animate-fade-in">
                                            <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-2 text-[10px]">Landlord's Reply</p>
                                            <p className="text-slate-800 text-sm leading-relaxed">{enq.answer}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyQueriesPage;
