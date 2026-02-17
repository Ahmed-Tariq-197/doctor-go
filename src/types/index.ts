// ============================================
// DoctorGo Type Definitions
// Updated to use UUID strings for Supabase
// ============================================

// User roles in the system
export type UserRole = 'patient' | 'doctor' | 'secretary' | 'admin';

// User object returned from auth
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

// Doctor with full profile information
export interface Doctor {
  id: string;
  userId?: string | null;
  name: string;
  email: string | null;
  specialty: string;
  rating: number;
  cost: number;
  clinicId?: string | null;
  clinicName: string | null;
  clinicAddress: string | null;
  lat: number;
  lng: number;
  queueLength: number;
  availableSlots: AppointmentSlot[];
  distance?: number;
}

// A single appointment time slot (generated client-side)
export interface AppointmentSlot {
  id: number;
  time: string;
  available: boolean;
}

// Clinic information
export interface Clinic {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

// Appointment status options
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'in-progress';

// Appointment record
export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  appointmentTime: string;
  status: AppointmentStatus;
  createdAt: string;
}

// Queue entry for walk-in patients
export type QueueStatus = 'waiting' | 'invited' | 'completed' | 'cancelled';

export interface QueueEntry {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  joinedAt: string;
  status: QueueStatus;
  position: number;
}

// Payment record (mock for now)
export interface Payment {
  id: number;
  appointmentId: string;
  amount: number;
  method: string;
  paidAt: string;
  receiptNumber: string;
}

// Recommendation result
export interface Recommendation {
  doctorId: string;
  doctorName: string;
  specialty: string;
  matchScore: number;
  reason: string;
}

// Auth context type
export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
