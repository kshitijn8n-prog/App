export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  university?: string;
}

export interface Landlord {
  id: string;
  name: string;
  verified: boolean;
  joinedDate: string;
  responseRate: number; // percentage
}

export interface Room {
  id: string;
  title: string;
  description: string;
  city: string;
  universityProximity: string[]; // e.g., "Near Imperial College", "20m bus to UCL"
  pricePerWeek: number;
  type: 'Private Studio' | 'En-suite' | 'Shared Room' | 'Apartment';
  amenities: string[];
  images: string[];
  rating: number;
  reviews: Review[];
  landlord: Landlord;
  availableFrom: string;
  status: 'PENDING' | 'PUBLISHED';
  rentalStatus?: 'AVAILABLE' | 'RENTED';
}

export interface SearchFilters {
  city?: string;
  maxPrice?: number;
  keywords?: string[];
}

export enum ViewState {
  HOME,
  DETAILS,
  BOOKING_SUCCESS,
  SAVED
}

export interface User {
  name: string;
  email: string;
  type: 'student' | 'landlord' | 'admin';
  isVerified: boolean;
  university?: string; // for students
  licenseNumber?: string; // for landlords
}

export interface Booking {
  id: string;
  roomId: string;
  roomTitle: string;
  tenantName: string;
  tenantEmail: string;
  landlordId: string;
  landlordName: string;
  landlordEmail: string;
  pricePerWeek: number;
  status: 'PENDING' | 'AWAITING_LANDLORD' | 'LANDLORD_APPROVED' | 'ADMIN_CONFIRMED' | 'SUCCESSFUL' | 'LANDLORD_REJECTED' | 'CANCELLED';
  landlordResponse?: 'PENDING' | 'APPROVED' | 'REJECTED';
  landlordRejectReason?: string;
  landlordResponseDate?: Date;
  createdAt: Date;
}