// ============================================
// DoctorGo Type Definitions
// These types define the shape of our data
// ============================================

// User roles in the system
export type UserRole = 'patient' | 'doctor' | 'secretary' | 'admin';

// User object returned from auth
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

// Doctor with full profile information
export interface Doctor {
  id: number;
  userId: number;
  name: string;
  email: string;
  specialty: string;
  rating: number;
  cost: number;
  clinicId: number;
  clinicName: string;
  clinicAddress: string;
  lat: number;
  lng: number;
  queueLength: number;
  availableSlots: AppointmentSlot[];
}

// A single appointment time slot
export interface AppointmentSlot {
  id: number;
  time: string;
  available: boolean;
}

// Clinic information
export interface Clinic {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

// Appointment status options
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'in-progress';

// Appointment record
export interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  appointmentTime: string;
  status: AppointmentStatus;
  createdAt: string;
}

// Queue entry for walk-in patients
export type QueueStatus = 'waiting' | 'invited' | 'completed' | 'cancelled';

export interface QueueEntry {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  joinedAt: string;
  status: QueueStatus;
  position: number;
}

// Payment record (mock)
export interface Payment {
  id: number;
  appointmentId: number;
  amount: number;
  method: string;
  paidAt: string;
  receiptNumber: string;
}

// Recommendation result from the AI
export interface Recommendation {
  doctorId: number;
  doctorName: string;
  specialty: string;
  matchScore: number;
  reason: string;
}

// Auth context type
export interface AuthContextType {
  user: User | null;
  token: string | null;
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
