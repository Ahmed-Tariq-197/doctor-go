// ============================================
// Mock Data for DoctorGo MVP
// This simulates backend data for the preview
// ============================================

import { Doctor, User, Appointment, QueueEntry, Clinic, AppointmentSlot } from '@/types';

// Mock clinics
export const mockClinics: Clinic[] = [
  { id: 1, name: 'City Health Center', address: '123 Main Street, Downtown', lat: 40.7128, lng: -74.0060 },
  { id: 2, name: 'Wellness Medical Hub', address: '456 Oak Avenue, Midtown', lat: 40.7580, lng: -73.9855 },
  { id: 3, name: 'Community Care Clinic', address: '789 Park Road, Uptown', lat: 40.7829, lng: -73.9654 },
];

// Generate time slots for today and tomorrow
const generateSlots = (doctorId: number): AppointmentSlot[] => {
  const slots: AppointmentSlot[] = [];
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  [today, tomorrow].forEach((date, dayIndex) => {
    for (let hour = 9; hour <= 17; hour++) {
      slots.push({
        id: doctorId * 100 + dayIndex * 20 + hour,
        time: new Date(date.setHours(hour, 0, 0, 0)).toISOString(),
        available: Math.random() > 0.3, // 70% chance of being available
      });
    }
  });
  return slots;
};

// Mock doctors with realistic data
export const mockDoctors: Doctor[] = [
  {
    id: 1,
    userId: 101,
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@doctorgo.com',
    specialty: 'General Practice',
    rating: 4.8,
    cost: 75,
    clinicId: 1,
    clinicName: 'City Health Center',
    clinicAddress: '123 Main Street, Downtown',
    lat: 40.7128,
    lng: -74.0060,
    queueLength: 3,
    availableSlots: generateSlots(1),
  },
  {
    id: 2,
    userId: 102,
    name: 'Dr. Michael Chen',
    email: 'michael.chen@doctorgo.com',
    specialty: 'Cardiology',
    rating: 4.9,
    cost: 150,
    clinicId: 2,
    clinicName: 'Wellness Medical Hub',
    clinicAddress: '456 Oak Avenue, Midtown',
    lat: 40.7580,
    lng: -73.9855,
    queueLength: 5,
    availableSlots: generateSlots(2),
  },
  {
    id: 3,
    userId: 103,
    name: 'Dr. Emily Rodriguez',
    email: 'emily.rodriguez@doctorgo.com',
    specialty: 'Pediatrics',
    rating: 4.7,
    cost: 100,
    clinicId: 1,
    clinicName: 'City Health Center',
    clinicAddress: '123 Main Street, Downtown',
    lat: 40.7128,
    lng: -74.0060,
    queueLength: 2,
    availableSlots: generateSlots(3),
  },
  {
    id: 4,
    userId: 104,
    name: 'Dr. James Wilson',
    email: 'james.wilson@doctorgo.com',
    specialty: 'Dermatology',
    rating: 4.6,
    cost: 125,
    clinicId: 3,
    clinicName: 'Community Care Clinic',
    clinicAddress: '789 Park Road, Uptown',
    lat: 40.7829,
    lng: -73.9654,
    queueLength: 1,
    availableSlots: generateSlots(4),
  },
  {
    id: 5,
    userId: 105,
    name: 'Dr. Maria Santos',
    email: 'maria.santos@doctorgo.com',
    specialty: 'Orthopedics',
    rating: 4.8,
    cost: 175,
    clinicId: 2,
    clinicName: 'Wellness Medical Hub',
    clinicAddress: '456 Oak Avenue, Midtown',
    lat: 40.7580,
    lng: -73.9855,
    queueLength: 4,
    availableSlots: generateSlots(5),
  },
];

// Mock users (for testing login)
export const mockUsers: (User & { password: string })[] = [
  { id: 1, name: 'John Patient', email: 'patient@test.com', role: 'patient', password: 'password123', createdAt: '2024-01-01' },
  { id: 2, name: 'Dr. Sarah Johnson', email: 'doctor@test.com', role: 'doctor', password: 'password123', createdAt: '2024-01-01' },
  { id: 3, name: 'Admin User', email: 'admin@test.com', role: 'admin', password: 'password123', createdAt: '2024-01-01' },
];

// Mock appointments
export const mockAppointments: Appointment[] = [
  {
    id: 1,
    patientId: 1,
    patientName: 'John Patient',
    doctorId: 1,
    doctorName: 'Dr. Sarah Johnson',
    appointmentTime: new Date(Date.now() + 86400000).toISOString(),
    status: 'scheduled',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    patientId: 1,
    patientName: 'John Patient',
    doctorId: 2,
    doctorName: 'Dr. Michael Chen',
    appointmentTime: new Date(Date.now() + 172800000).toISOString(),
    status: 'scheduled',
    createdAt: new Date().toISOString(),
  },
];

// Mock queue entries
export const mockQueueEntries: QueueEntry[] = [
  {
    id: 1,
    patientId: 10,
    patientName: 'Alice Brown',
    doctorId: 1,
    doctorName: 'Dr. Sarah Johnson',
    joinedAt: new Date(Date.now() - 3600000).toISOString(),
    status: 'waiting',
    position: 1,
  },
  {
    id: 2,
    patientId: 11,
    patientName: 'Bob Smith',
    doctorId: 1,
    doctorName: 'Dr. Sarah Johnson',
    joinedAt: new Date(Date.now() - 1800000).toISOString(),
    status: 'waiting',
    position: 2,
  },
  {
    id: 3,
    patientId: 12,
    patientName: 'Carol Davis',
    doctorId: 1,
    doctorName: 'Dr. Sarah Johnson',
    joinedAt: new Date(Date.now() - 900000).toISOString(),
    status: 'waiting',
    position: 3,
  },
];

// Specialty to symptom keyword mapping for recommendations
export const specialtyKeywords: Record<string, string[]> = {
  'General Practice': ['fever', 'cold', 'flu', 'cough', 'headache', 'fatigue', 'checkup', 'vaccination', 'general'],
  'Cardiology': ['heart', 'chest pain', 'palpitations', 'blood pressure', 'hypertension', 'cardiac', 'breathing'],
  'Pediatrics': ['child', 'baby', 'infant', 'toddler', 'kids', 'childhood', 'growth', 'development'],
  'Dermatology': ['skin', 'rash', 'acne', 'eczema', 'psoriasis', 'mole', 'hair loss', 'itching'],
  'Orthopedics': ['bone', 'joint', 'muscle', 'back pain', 'knee', 'shoulder', 'fracture', 'arthritis', 'sports injury'],
};
