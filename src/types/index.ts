export interface User {
  id: string;
  email: string;
  name: string;
  userType: 'patient' | 'doctor';
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  availableSlots: TimeSlot[];
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  dayOfWeek: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  timeSlot: string;
  purpose: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  doctorName?: string;
  patientName?: string;
  doctorSpecialization?: string;
}

export interface VoiceData {
  transcript: string;
  purpose: string;
  doctor?: string;
  date?: Date;
  time?: string;
  specialty?: string;
}