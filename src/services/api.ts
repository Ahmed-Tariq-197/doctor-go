// ============================================
// API Service Layer
// Centralizes all API calls for the application
// For MVP demo, uses mock data; easy to switch to real API
// ============================================

import { 
  Doctor, 
  Appointment, 
  QueueEntry, 
  Payment, 
  Recommendation, 
  ApiResponse 
} from '@/types';
import { 
  mockDoctors, 
  mockAppointments, 
  mockQueueEntries, 
  specialtyKeywords 
} from '@/data/mockData';

// Configuration - change this to your backend URL when ready
const API_BASE_URL = '/api'; // Will be http://localhost:3001/api in production

// Helper to get auth token
const getToken = (): string | null => {
  return localStorage.getItem('doctorgo_token');
};

// Helper to create headers with auth
const getHeaders = (): HeadersInit => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ============================================
// DOCTOR ENDPOINTS
// ============================================

// Get all doctors with optional filters
export const getDoctors = async (
  specialty?: string,
  name?: string
): Promise<ApiResponse<Doctor[]>> => {
  // For MVP demo, filter mock data
  let doctors = [...mockDoctors];

  if (specialty) {
    doctors = doctors.filter(d => 
      d.specialty.toLowerCase().includes(specialty.toLowerCase())
    );
  }

  if (name) {
    doctors = doctors.filter(d => 
      d.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  return { success: true, data: doctors };
};

// Get single doctor by ID
export const getDoctorById = async (id: number): Promise<ApiResponse<Doctor>> => {
  await new Promise(resolve => setTimeout(resolve, 200));

  const doctor = mockDoctors.find(d => d.id === id);
  if (!doctor) {
    return { success: false, error: 'Doctor not found' };
  }

  return { success: true, data: doctor };
};

// ============================================
// QUEUE ENDPOINTS
// ============================================

// Join the queue for a doctor
export const joinQueue = async (doctorId: number): Promise<ApiResponse<QueueEntry>> => {
  await new Promise(resolve => setTimeout(resolve, 300));

  const doctor = mockDoctors.find(d => d.id === doctorId);
  if (!doctor) {
    return { success: false, error: 'Doctor not found' };
  }

  // Create new queue entry
  const newEntry: QueueEntry = {
    id: Date.now(),
    patientId: 1, // Would come from auth in real app
    patientName: 'Current User',
    doctorId,
    doctorName: doctor.name,
    joinedAt: new Date().toISOString(),
    status: 'waiting',
    position: doctor.queueLength + 1,
  };

  // Update mock queue length
  doctor.queueLength += 1;
  mockQueueEntries.push(newEntry);

  return { success: true, data: newEntry };
};

// Get queue entries for a doctor
export const getQueue = async (doctorId: number): Promise<ApiResponse<QueueEntry[]>> => {
  await new Promise(resolve => setTimeout(resolve, 200));

  const entries = mockQueueEntries.filter(
    q => q.doctorId === doctorId && q.status === 'waiting'
  );

  return { success: true, data: entries };
};

// Invite next patient (doctor action)
export const inviteNextPatient = async (doctorId: number): Promise<ApiResponse<QueueEntry | null>> => {
  await new Promise(resolve => setTimeout(resolve, 300));

  const waitingEntries = mockQueueEntries.filter(
    q => q.doctorId === doctorId && q.status === 'waiting'
  );

  if (waitingEntries.length === 0) {
    return { success: true, data: null, message: 'No patients in queue' };
  }

  // Get the first (oldest) waiting patient
  const nextPatient = waitingEntries.sort(
    (a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime()
  )[0];

  // Update status
  const entryIndex = mockQueueEntries.findIndex(q => q.id === nextPatient.id);
  if (entryIndex >= 0) {
    mockQueueEntries[entryIndex].status = 'invited';
  }

  // Update queue length
  const doctor = mockDoctors.find(d => d.id === doctorId);
  if (doctor && doctor.queueLength > 0) {
    doctor.queueLength -= 1;
  }

  return { success: true, data: nextPatient };
};

// ============================================
// APPOINTMENT ENDPOINTS
// ============================================

// Create a new appointment
export const createAppointment = async (
  doctorId: number,
  appointmentTime: string
): Promise<ApiResponse<Appointment>> => {
  await new Promise(resolve => setTimeout(resolve, 300));

  const doctor = mockDoctors.find(d => d.id === doctorId);
  if (!doctor) {
    return { success: false, error: 'Doctor not found' };
  }

  const newAppointment: Appointment = {
    id: Date.now(),
    patientId: 1, // Would come from auth
    patientName: 'Current User',
    doctorId,
    doctorName: doctor.name,
    appointmentTime,
    status: 'scheduled',
    createdAt: new Date().toISOString(),
  };

  mockAppointments.push(newAppointment);

  // Mark the slot as unavailable
  const slotIndex = doctor.availableSlots.findIndex(s => s.time === appointmentTime);
  if (slotIndex >= 0) {
    doctor.availableSlots[slotIndex].available = false;
  }

  return { success: true, data: newAppointment };
};

// Get appointments for current user or doctor
export const getAppointments = async (
  doctorId?: number
): Promise<ApiResponse<Appointment[]>> => {
  await new Promise(resolve => setTimeout(resolve, 200));

  let appointments = [...mockAppointments];

  if (doctorId) {
    appointments = appointments.filter(a => a.doctorId === doctorId);
  }

  return { success: true, data: appointments };
};

// Update appointment status
export const updateAppointment = async (
  id: number,
  status: 'scheduled' | 'completed' | 'cancelled' | 'in-progress'
): Promise<ApiResponse<Appointment>> => {
  await new Promise(resolve => setTimeout(resolve, 200));

  const index = mockAppointments.findIndex(a => a.id === id);
  if (index < 0) {
    return { success: false, error: 'Appointment not found' };
  }

  mockAppointments[index].status = status;
  return { success: true, data: mockAppointments[index] };
};

// ============================================
// PAYMENT ENDPOINTS
// ============================================

// Mock payment processing
export const processPayment = async (
  appointmentId: number,
  amount: number
): Promise<ApiResponse<Payment>> => {
  await new Promise(resolve => setTimeout(resolve, 500));

  const payment: Payment = {
    id: Date.now(),
    appointmentId,
    amount,
    method: 'card',
    paidAt: new Date().toISOString(),
    receiptNumber: `RCP-${Date.now().toString(36).toUpperCase()}`,
  };

  return { success: true, data: payment };
};

// ============================================
// RECOMMENDATION ENDPOINT
// ============================================

// Get doctor recommendations based on symptoms
export const getRecommendations = async (
  query: string
): Promise<ApiResponse<Recommendation[]>> => {
  await new Promise(resolve => setTimeout(resolve, 400));

  const queryLower = query.toLowerCase();
  const recommendations: Recommendation[] = [];

  // Simple keyword matching algorithm
  for (const doctor of mockDoctors) {
    const keywords = specialtyKeywords[doctor.specialty] || [];
    const matchedKeywords = keywords.filter(keyword => 
      queryLower.includes(keyword)
    );

    if (matchedKeywords.length > 0) {
      const matchScore = Math.round((matchedKeywords.length / keywords.length) * 100);
      recommendations.push({
        doctorId: doctor.id,
        doctorName: doctor.name,
        specialty: doctor.specialty,
        matchScore,
        reason: `Matches your symptoms: ${matchedKeywords.join(', ')}. ${doctor.name} specializes in ${doctor.specialty} and has a ${doctor.rating} star rating.`,
      });
    }
  }

  // Sort by match score and return top 3
  recommendations.sort((a, b) => b.matchScore - a.matchScore);
  const topRecommendations = recommendations.slice(0, 3);

  // If no matches, suggest general practice
  if (topRecommendations.length === 0) {
    const gpDoctor = mockDoctors.find(d => d.specialty === 'General Practice');
    if (gpDoctor) {
      topRecommendations.push({
        doctorId: gpDoctor.id,
        doctorName: gpDoctor.name,
        specialty: gpDoctor.specialty,
        matchScore: 50,
        reason: `For general health concerns, we recommend seeing ${gpDoctor.name}, a General Practitioner who can evaluate your symptoms and refer you to a specialist if needed.`,
      });
    }
  }

  return { success: true, data: topRecommendations };
};
