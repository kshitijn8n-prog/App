import React, { useState, useEffect } from 'react';
import { Room, Review } from '../types';
import {
  X, MapPin, User, Star, CheckCircle, Wifi, Coffee, Book,
  Shield, Calendar, Send, Heart
} from 'lucide-react';

interface RoomDetailsProps {
  room: Room;
  onClose: () => void;
  onBook: () => void;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent, roomId: string) => void;
}

const RoomDetails: React.FC<RoomDetailsProps> = ({ room, onClose, onBook, isFavorite, onToggleFavorite }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const [newReview, setNewReview] = useState('');
  const [reviews, setReviews] = useState<Review[]>(room.reviews);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [enquiryQuestion, setEnquiryQuestion] = useState('');
  const [submittingEnquiry, setSubmittingEnquiry] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);

  useEffect(() => {
    if (room.reviews.length > 0) {
      setLoadingSummary(true);
      const comments = room.reviews.map(r => r.comment);

      fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviews: comments })
      })
        .then(res => res.json())
        .then(data => setAiSummary(data.summary))
        .catch(() => setAiSummary("Could not load summary."))
        .finally(() => setLoadingSummary(false));
    }
  }, [room.id]);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.trim()) return;

    const review: Review = {
      id: Date.now().toString(),
      author: 'You',
      rating: 5,
      date: new Date().toLocaleDateString(),
      comment: newReview,
      university: 'International Student'
    };

    setReviews([review, ...reviews]);
    setNewReview('');
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end md:bg-black/50 backdrop-blur-sm transition-opacity">
      {/* Mobile close overlay */}
      <div className="absolute inset-0 md:hidden" onClick={onClose}></div>

      <div className="bg-white w-full md:w-[600px] h-full shadow-2xl flex flex-col animate-slide-in-right overflow-hidden md:rounded-l-2xl">

        {/* Header Image */}
        <div className="relative h-64 shrink-0 bg-slate-200">
          <img src={room.images[0]} alt={room.title} className="w-full h-full object-cover" />

          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <button
              onClick={(e) => onToggleFavorite(e, room.id)}
              className="bg-white/90 p-2 rounded-full hover:bg-white text-slate-800 transition shadow-lg"
            >
              <Heart
                size={20}
                className={`transition-colors ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-700'}`}
              />
            </button>
            <button
              onClick={onClose}
              className="bg-white/90 p-2 rounded-full hover:bg-white text-slate-800 transition shadow-lg"
            >
              <X size={20} />
            </button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 pt-12">
            <h2 className="text-2xl font-bold text-white mb-1">{room.title}</h2>
            <div className="flex items-center text-white/90 text-sm">
              <MapPin size={14} className="mr-1" />
              {room.city}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 sticky top-0 bg-white z-10">
          <button
            className={`flex-1 py-4 font-medium text-sm transition ${activeTab === 'details' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('details')}
          >
            Details & Booking
          </button>
          <button
            className={`flex-1 py-4 font-medium text-sm transition ${activeTab === 'reviews' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews ({reviews.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {activeTab === 'details' ? (
            <div className="space-y-6">
              {/* Landlord Info */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-600">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{room.landlord.name}</p>
                    <p className="text-xs text-slate-500">Response rate: {room.landlord.responseRate}%</p>
                  </div>
                </div>
                {room.landlord.verified && (
                  <div className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <Shield size={12} className="mr-1" /> Verified Owner
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="font-bold text-slate-900 mb-2">About this place</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{room.description}</p>
              </div>

              {/* Proximity */}
              <div>
                <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Book size={18} className="text-brand-600" /> Nearby Universities
                </h3>
                <ul className="space-y-2">
                  {room.universityProximity.map((u, i) => (
                    <li key={i} className="flex items-center text-sm text-slate-600">
                      <div className="w-1.5 h-1.5 bg-brand-400 rounded-full mr-2"></div>
                      {u}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="font-bold text-slate-900 mb-3">Amenities</h3>
                <div className="grid grid-cols-2 gap-3">
                  {room.amenities.map((amenity, i) => (
                    <div key={i} className="flex items-center text-sm text-slate-600 bg-white border border-slate-200 p-2 rounded-lg">
                      <CheckCircle size={14} className="text-green-500 mr-2" />
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>

              {/* Enquiry Section */}
              <div className="bg-brand-50 p-6 rounded-2xl border border-brand-100 mt-8">
                <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Send size={18} className="text-brand-600" /> Have a question?
                </h3>
                <p className="text-sm text-slate-600 mb-4">Ask the landlord directly about this property.</p>

                {enquirySuccess ? (
                  <div className="bg-green-100 text-green-700 p-4 rounded-xl text-sm font-medium animate-fade-in">
                    Thank you! Your question has been sent. You can check for replies in "My Queries".
                  </div>
                ) : (
                  <div className="space-y-3">
                    <textarea
                      placeholder="e.g., Is the internet speed good for gaming? Are bills definitely included?"
                      className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none h-24 transition-shadow"
                      value={enquiryQuestion}
                      onChange={(e) => setEnquiryQuestion(e.target.value)}
                    />
                    <button
                      onClick={async () => {
                        if (!enquiryQuestion.trim()) return;
                        setSubmittingEnquiry(true);
                        try {
                          const res = await fetch('/api/enquiries', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              roomId: room.id,
                              roomTitle: room.title,
                              question: enquiryQuestion
                            })
                          });
                          if (res.ok) {
                            setEnquirySuccess(true);
                            setEnquiryQuestion('');
                            setTimeout(() => setEnquirySuccess(false), 5000);
                          }
                        } catch (err) {
                          console.error("Enquiry failed", err);
                        } finally {
                          setSubmittingEnquiry(false);
                        }
                      }}
                      disabled={submittingEnquiry || !enquiryQuestion.trim()}
                      className="w-full bg-brand-600 text-white font-bold py-3 rounded-xl hover:bg-brand-700 disabled:opacity-50 transition shadow-md shadow-brand-100"
                    >
                      {submittingEnquiry ? 'Sending...' : 'Send Enquiry'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* AI Summary */}
              {room.reviews.length > 0 && (
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-xl border border-indigo-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-white p-1 rounded-full shadow-sm">
                      <span className="text-lg">✨</span>
                    </div>
                    <h3 className="font-bold text-indigo-900 text-sm">AI Summary</h3>
                  </div>
                  {loadingSummary ? (
                    <p className="text-xs text-indigo-700 animate-pulse">Analyzing tenant sentiment...</p>
                  ) : (
                    <p className="text-sm text-indigo-800 italic">"{aiSummary}"</p>
                  )}
                </div>
              )}

              {/* Add Review */}
              <form onSubmit={handleSubmitReview} className="relative">
                <input
                  type="text"
                  placeholder="Share your experience..."
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
                <button
                  type="submit"
                  disabled={!newReview.trim()}
                  className="absolute right-2 top-2 p-1.5 bg-brand-600 text-white rounded-lg disabled:opacity-50 hover:bg-brand-700 transition"
                >
                  <Send size={16} />
                </button>
              </form>

              {/* List */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-center text-slate-400 py-8">No reviews yet. Be the first!</p>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.id} className="border-b border-slate-100 pb-4 last:border-0">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{rev.author}</p>
                          <p className="text-xs text-slate-400">{rev.university} • {rev.date}</p>
                        </div>
                        <div className="flex items-center bg-amber-50 px-2 py-0.5 rounded text-amber-600 text-xs font-bold">
                          {rev.rating} <Star size={10} className="ml-1 fill-current" />
                        </div>
                      </div>
                      <p className="text-slate-600 text-sm mt-2">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col">
              <span className="text-xs text-slate-500">Total Price</span>
              <span className="text-xl font-bold text-slate-900">£{room.pricePerWeek}<span className="text-sm font-normal text-slate-500">/week</span></span>
            </div>
            <div className="text-right">
              <span className="text-xs text-green-600 font-medium">Available {room.availableFrom}</span>
            </div>
          </div>
          <button
            onClick={onBook}
            className="w-full bg-brand-600 text-white font-bold py-3.5 rounded-xl hover:bg-brand-700 active:scale-[0.98] transition shadow-md shadow-brand-200"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;