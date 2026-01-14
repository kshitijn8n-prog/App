import React from 'react';
import { MapPin, Star, PoundSterling, ShieldCheck, Heart } from 'lucide-react';
import { Room } from '../types';

interface RoomCardProps {
  room: Room;
  onClick: (room: Room) => void;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent, roomId: string) => void;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, onClick, isFavorite, onToggleFavorite }) => {
  return (
    <div 
      className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden cursor-pointer group flex flex-col h-full relative"
      onClick={() => onClick(room)}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={room.images[0]} 
          alt={room.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Favorite Button */}
        <button
          onClick={(e) => onToggleFavorite(e, room.id)}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors shadow-sm group/btn"
        >
          <Heart 
            size={18} 
            className={`transition-colors ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-600 group-hover/btn:text-rose-500'}`} 
          />
        </button>

        <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-white shadow-sm">
          {room.type}
        </div>
        
        {room.landlord.verified && (
          <div className="absolute top-3 left-3 bg-blue-500/90 backdrop-blur-sm text-white p-1 rounded-full shadow-sm" title="Verified Landlord">
            <ShieldCheck size={14} />
          </div>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-brand-600 transition-colors">{room.title}</h3>
          <div className="flex items-center text-amber-500 text-sm font-bold shrink-0 ml-2">
            <Star size={14} className="fill-current mr-1" />
            {room.rating}
          </div>
        </div>
        
        <div className="flex items-center text-slate-500 text-sm mb-3">
          <MapPin size={14} className="mr-1" />
          {room.city}
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
           {room.universityProximity.slice(0, 1).map((uni, idx) => (
             <span key={idx} className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-md line-clamp-1">
               {uni}
             </span>
           ))}
        </div>
        
        <div className="mt-auto pt-3 border-t border-slate-100 flex justify-between items-center">
          <div className="flex items-center text-brand-700 font-bold text-lg">
            <PoundSterling size={18} />
            {room.pricePerWeek} <span className="text-slate-400 text-sm font-normal ml-1">/ week</span>
          </div>
          <button className="text-brand-600 font-medium text-sm hover:underline">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;