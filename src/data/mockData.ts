// ============================================
// Mock Data - kept for reference only
// Real data now comes from the database
// ============================================

import { Doctor, User, Appointment, QueueEntry, Clinic, AppointmentSlot } from '@/types';

// Specialty to symptom keyword mapping for recommendations
export const specialtyKeywords: Record<string, string[]> = {
  'General Practice': ['fever', 'cold', 'flu', 'cough', 'headache', 'fatigue', 'checkup', 'vaccination', 'general'],
  'Cardiology': ['heart', 'chest pain', 'palpitations', 'blood pressure', 'hypertension', 'cardiac', 'breathing'],
  'Pediatrics': ['child', 'baby', 'infant', 'toddler', 'kids', 'childhood', 'growth', 'development'],
  'Dermatology': ['skin', 'rash', 'acne', 'eczema', 'psoriasis', 'mole', 'hair loss', 'itching'],
  'Orthopedics': ['bone', 'joint', 'muscle', 'back pain', 'knee', 'shoulder', 'fracture', 'arthritis', 'sports injury'],
};

// These arrays are no longer used - data comes from Supabase
export const mockClinics: Clinic[] = [];
export const mockDoctors: Doctor[] = [];
export const mockUsers: (User & { password: string })[] = [];
export const mockAppointments: Appointment[] = [];
export const mockQueueEntries: QueueEntry[] = [];
