import mongoose from 'mongoose';

// ---------- TimeSlot Schema ----------
const TimeSlotSchema = new mongoose.Schema({
  id: String,
  startTime: String,
  endTime: String,
  dayOfWeek: Number // 0-6 (Sunday to Saturday)
});

// ---------- Doctor Schema ----------
const DoctorSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: {type:String,required:true},
  age: Number,
  gender: { type: String, enum: ['male', 'female', 'other'] },
  userType: { type: String, enum: ['doctor'], default: 'doctor' },
  specialization: String,
  availableSlots: [TimeSlotSchema]
});

export const DoctorModel = mongoose.model('Doctor', DoctorSchema);

// ---------- Patient Schema ----------
const PatientSchema = new mongoose.Schema({
  name: { type: String, required: true},
  email: { type: String, required: true, unique: true },
  password: {type:String,required:true},
  age: Number,
  gender: { type: String, enum: ['male', 'female', 'other'] },
  userType: { type: String, enum: ['patient'], default: 'patient' }
});

export const PatientModel = mongoose.model('Patient', PatientSchema);

// ---------- Appointment Schema ----------
const AppointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  date: String,
  timeSlot: String,
  purpose: String,
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

export const AppointmentModel = mongoose.model('Appointment', AppointmentSchema);
