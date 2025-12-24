-- ============================================
-- DoctorGo Seed Data
-- Sample data for testing
-- ============================================

USE doctorgo;

-- Insert Clinics
INSERT INTO clinics (id, name, address, lat, lng, phone) VALUES
(1, 'City Health Center', '123 Main Street, Downtown', 40.7128, -74.0060, '555-0101'),
(2, 'Wellness Medical Hub', '456 Oak Avenue, Midtown', 40.7580, -73.9855, '555-0102'),
(3, 'Community Care Clinic', '789 Park Road, Uptown', 40.7829, -73.9654, '555-0103');

-- Insert Users (password is 'password123' hashed with bcrypt)
-- Hash: $2a$10$rQnM1u8E5VzVx5G5z5z5z.5z5z5z5z5z5z5z5z5z5z5z5z5z5z5z
INSERT INTO users (id, name, email, password_hash, role) VALUES
-- Patients
(1, 'John Patient', 'patient@test.com', '$2a$10$X7VYHy.9H8nD8JxQ3qQ3qO3qQ3qQ3qQ3qQ3qQ3qQ3qQ3qQ3qQ3qQ', 'patient'),
(10, 'Alice Brown', 'alice@test.com', '$2a$10$X7VYHy.9H8nD8JxQ3qQ3qO3qQ3qQ3qQ3qQ3qQ3qQ3qQ3qQ3qQ3qQ', 'patient'),
(11, 'Bob Smith', 'bob@test.com', '$2a$10$X7VYHy.9H8nD8JxQ3qQ3qO3qQ3qQ3qQ3qQ3qQ3qQ3qQ3qQ3qQ3qQ', 'patient'),
(12, 'Carol Davis', 'carol@test.com', '$2a$10$X7VYHy.9H8nD8JxQ3qQ3qO3qQ3qQ3qQ3qQ3qQ3qQ3qQ3qQ3qQ3qQ', 'patient'),
-- Doctors
(101, 'Dr. Sarah Johnson', 'doctor@test.com', '$2a$10$X7VYHy.9H8nD8JxQ3qQ3qO3qQ3qQ3qQ3qQ3qQ3qQ3qQ3qQ3qQ3qQ', 'doctor'),
(102, 'Dr. Michael Chen', 'michael.chen@doctorgo.com', '$2a$10$X7VYHy.9H8nD8JxQ3qQ3qO3qQ3qQ3qQ3qQ3qQ3qQ3qQ3qQ3qQ3qQ', 'doctor'),
(103, 'Dr. Emily Rodriguez', 'emily.rodriguez@doctorgo.com', '$2a$10$X7VYHy.9H8nD8JxQ3qQ3qO3qQ3qQ3qQ3qQ3qQ3qQ3qQ3qQ3qQ3qQ', 'doctor'),
(104, 'Dr. James Wilson', 'james.wilson@doctorgo.com', '$2a$10$X7VYHy.9H8nD8JxQ3qQ3qO3qQ3qQ3qQ3qQ3qQ3qQ3qQ3qQ3qQ3qQ', 'doctor'),
(105, 'Dr. Maria Santos', 'maria.santos@doctorgo.com', '$2a$10$X7VYHy.9H8nD8JxQ3qQ3qO3qQ3qQ3qQ3qQ3qQ3qQ3qQ3qQ3qQ3qQ', 'doctor'),
-- Admin
(200, 'Admin User', 'admin@test.com', '$2a$10$X7VYHy.9H8nD8JxQ3qQ3qO3qQ3qQ3qQ3qQ3qQ3qQ3qQ3qQ3qQ3qQ', 'admin');

-- Insert Doctors
INSERT INTO doctors (id, user_id, specialty, rating, cost, clinic_id, bio) VALUES
(1, 101, 'General Practice', 4.8, 75.00, 1, 'Experienced general practitioner with 10+ years experience.'),
(2, 102, 'Cardiology', 4.9, 150.00, 2, 'Board-certified cardiologist specializing in preventive care.'),
(3, 103, 'Pediatrics', 4.7, 100.00, 1, 'Caring pediatrician dedicated to children health.'),
(4, 104, 'Dermatology', 4.6, 125.00, 3, 'Expert in skin conditions and cosmetic dermatology.'),
(5, 105, 'Orthopedics', 4.8, 175.00, 2, 'Sports medicine and orthopedic surgery specialist.');

-- Insert sample queue entries
INSERT INTO queue (patient_id, doctor_id, status) VALUES
(10, 1, 'waiting'),
(11, 1, 'waiting'),
(12, 1, 'waiting');

-- Insert sample appointments
INSERT INTO appointments (patient_id, doctor_id, appointment_time, status) VALUES
(1, 1, DATE_ADD(NOW(), INTERVAL 1 DAY), 'scheduled'),
(1, 2, DATE_ADD(NOW(), INTERVAL 2 DAY), 'scheduled');
