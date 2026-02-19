// ============================================
// API Service Layer
// Uses Supabase for real data access
// ============================================

import {
  Doctor,
  Appointment,
  QueueEntry,
  Payment,
  Recommendation,
  ApiResponse,
  AppointmentSlot,
} from '@/types';
import { supabase } from '@/integrations/supabase/client';

// Specialty to symptom keyword mapping for recommendations
const specialtyKeywords: Record<string, string[]> = {
  'General Practice': ['fever', 'cold', 'flu', 'cough', 'headache', 'fatigue', 'checkup', 'vaccination', 'general'],
  'Cardiology': ['heart', 'chest pain', 'palpitations', 'blood pressure', 'hypertension', 'cardiac', 'breathing'],
  'Pediatrics': ['child', 'baby', 'infant', 'toddler', 'kids', 'childhood', 'growth', 'development'],
  'Dermatology': ['skin', 'rash', 'acne', 'eczema', 'psoriasis', 'mole', 'hair loss', 'itching'],
  'Orthopedics': ['bone', 'joint', 'muscle', 'back pain', 'knee', 'shoulder', 'fracture', 'arthritis', 'sports injury'],
};

// Generate time slots for a doctor (client-side)
const generateSlots = (doctorId: string): AppointmentSlot[] => {
  const slots: AppointmentSlot[] = [];
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  [today, tomorrow].forEach((date, dayIndex) => {
    for (let hour = 9; hour <= 17; hour++) {
      const slotDate = new Date(date);
      slotDate.setHours(hour, 0, 0, 0);
      slots.push({
        id: dayIndex * 20 + hour,
        time: slotDate.toISOString(),
        available: Math.random() > 0.3,
      });
    }
  });
  return slots;
};

// ============================================
// DOCTOR ENDPOINTS
// ============================================

export const getDoctors = async (): Promise<ApiResponse<Doctor[]>> => {
  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .order('rating', { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }

  const doctors: Doctor[] = (data || []).map(d => ({
    id: d.id,
    userId: d.user_id,
    name: d.name,
    email: d.email,
    specialty: d.specialty,
    rating: d.rating,
    cost: Number(d.cost),
    clinicId: d.clinic_id,
    clinicName: d.clinic_name,
    clinicAddress: d.clinic_address,
    lat: d.lat,
    lng: d.lng,
    queueLength: d.queue_length,
    availableSlots: generateSlots(d.id),
  }));

  return { success: true, data: doctors };
};

export const getDoctorById = async (id: string): Promise<ApiResponse<Doctor>> => {
  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) {
    return { success: false, error: error?.message || 'Doctor not found' };
  }

  const doctor: Doctor = {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    email: data.email,
    specialty: data.specialty,
    rating: data.rating,
    cost: Number(data.cost),
    clinicId: data.clinic_id,
    clinicName: data.clinic_name,
    clinicAddress: data.clinic_address,
    lat: data.lat,
    lng: data.lng,
    queueLength: data.queue_length,
    availableSlots: generateSlots(data.id),
  };

  return { success: true, data: doctor };
};

// ============================================
// QUEUE ENDPOINTS
// ============================================

export const joinQueue = async (doctorId: string): Promise<ApiResponse<QueueEntry>> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('user_id', user.id)
    .maybeSingle();

  const { data: doctor } = await supabase
    .from('doctors')
    .select('name, queue_length')
    .eq('id', doctorId)
    .maybeSingle();

  if (!doctor) return { success: false, error: 'Doctor not found' };

  const { data, error } = await supabase
    .from('queue_entries')
    .insert({
      patient_id: user.id,
      patient_name: profile?.full_name || user.email || '',
      doctor_id: doctorId,
      doctor_name: doctor.name,
      position: doctor.queue_length + 1,
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  // Increment queue length
  await supabase
    .from('doctors')
    .update({ queue_length: doctor.queue_length + 1 })
    .eq('id', doctorId);

  return {
    success: true,
    data: {
      id: data.id,
      patientId: data.patient_id,
      patientName: data.patient_name,
      doctorId: data.doctor_id,
      doctorName: data.doctor_name,
      joinedAt: data.joined_at,
      status: data.status as any,
      position: data.position,
    },
  };
};

export const getQueue = async (doctorId: string): Promise<ApiResponse<QueueEntry[]>> => {
  const { data, error } = await supabase
    .from('queue_entries')
    .select('*')
    .eq('doctor_id', doctorId)
    .eq('status', 'waiting')
    .order('joined_at', { ascending: true });

  if (error) return { success: false, error: error.message };

  const entries: QueueEntry[] = (data || []).map(e => ({
    id: e.id,
    patientId: e.patient_id,
    patientName: e.patient_name,
    doctorId: e.doctor_id,
    doctorName: e.doctor_name,
    joinedAt: e.joined_at,
    status: e.status as any,
    position: e.position,
  }));

  return { success: true, data: entries };
};

export const inviteNextPatient = async (doctorId: string): Promise<ApiResponse<QueueEntry | null>> => {
  const { data: entries } = await supabase
    .from('queue_entries')
    .select('*')
    .eq('doctor_id', doctorId)
    .eq('status', 'waiting')
    .order('joined_at', { ascending: true })
    .limit(1);

  if (!entries || entries.length === 0) {
    return { success: true, data: null, message: 'No patients in queue' };
  }

  const next = entries[0];
  await supabase
    .from('queue_entries')
    .update({ status: 'invited' })
    .eq('id', next.id);

  // Decrement queue length
  const { data: doctor } = await supabase
    .from('doctors')
    .select('queue_length')
    .eq('id', doctorId)
    .maybeSingle();

  if (doctor && doctor.queue_length > 0) {
    await supabase
      .from('doctors')
      .update({ queue_length: doctor.queue_length - 1 })
      .eq('id', doctorId);
  }

  return {
    success: true,
    data: {
      id: next.id,
      patientId: next.patient_id,
      patientName: next.patient_name,
      doctorId: next.doctor_id,
      doctorName: next.doctor_name,
      joinedAt: next.joined_at,
      status: 'invited',
      position: next.position,
    },
  };
};

// ============================================
// APPOINTMENT ENDPOINTS
// ============================================

export const createAppointment = async (
  doctorId: string,
  appointmentTime: string
): Promise<ApiResponse<Appointment>> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('user_id', user.id)
    .maybeSingle();

  const { data: doctor } = await supabase
    .from('doctors')
    .select('name')
    .eq('id', doctorId)
    .maybeSingle();

  if (!doctor) return { success: false, error: 'Doctor not found' };

  const { data, error } = await supabase
    .from('appointments')
    .insert({
      patient_id: user.id,
      patient_name: profile?.full_name || user.email || '',
      doctor_id: doctorId,
      doctor_name: doctor.name,
      appointment_time: appointmentTime,
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  return {
    success: true,
    data: {
      id: data.id,
      patientId: data.patient_id,
      patientName: data.patient_name,
      doctorId: data.doctor_id,
      doctorName: data.doctor_name,
      appointmentTime: data.appointment_time,
      status: data.status as any,
      createdAt: data.created_at,
    },
  };
};

export const getAppointments = async (doctorId?: string): Promise<ApiResponse<Appointment[]>> => {
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase.from('appointments').select('*').order('appointment_time', { ascending: true });

  if (doctorId) {
    query = query.eq('doctor_id', doctorId);
  } else if (user) {
    // For patients, filter to only their own appointments
    query = query.eq('patient_id', user.id);
  }

  const { data, error } = await query;

  if (error) return { success: false, error: error.message };

  const appointments: Appointment[] = (data || []).map(a => ({
    id: a.id,
    patientId: a.patient_id,
    patientName: a.patient_name,
    doctorId: a.doctor_id,
    doctorName: a.doctor_name,
    appointmentTime: a.appointment_time,
    status: a.status as any,
    createdAt: a.created_at,
  }));

  return { success: true, data: appointments };
};

export const updateAppointment = async (
  id: string,
  status: 'scheduled' | 'completed' | 'cancelled' | 'in-progress'
): Promise<ApiResponse<Appointment>> => {
  const { data, error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  return {
    success: true,
    data: {
      id: data.id,
      patientId: data.patient_id,
      patientName: data.patient_name,
      doctorId: data.doctor_id,
      doctorName: data.doctor_name,
      appointmentTime: data.appointment_time,
      status: data.status as any,
      createdAt: data.created_at,
    },
  };
};

// ============================================
// PAYMENT ENDPOINTS (still mock for now)
// ============================================

export const processPayment = async (
  appointmentId: string,
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

export const getRecommendations = async (
  query: string
): Promise<ApiResponse<Recommendation[]>> => {
  // Fetch all doctors from DB
  const { data: doctors, error } = await supabase
    .from('doctors')
    .select('*');

  if (error || !doctors) {
    return { success: false, error: error?.message || 'Failed to load doctors' };
  }

  const queryLower = query.toLowerCase();
  const recommendations: Recommendation[] = [];

  for (const doctor of doctors) {
    const keywords = specialtyKeywords[doctor.specialty] || [];
    const matchedKeywords = keywords.filter(keyword => queryLower.includes(keyword));

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

  recommendations.sort((a, b) => b.matchScore - a.matchScore);
  const topRecommendations = recommendations.slice(0, 3);

  if (topRecommendations.length === 0) {
    const gpDoctor = doctors.find(d => d.specialty === 'General Practice');
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
