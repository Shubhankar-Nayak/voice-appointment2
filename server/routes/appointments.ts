import express from 'express';
import { Types } from 'mongoose';
import { io } from '../index.js';
import { AppointmentModel, DoctorModel, PatientModel } from '../models/index.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// ✅ Type for populated appointment (optional doctor/patient)
interface PopulatedAppointment {
  _id: Types.ObjectId;
  doctorId?: {
    _id: Types.ObjectId;
    name: string;
    specialization: string;
  };
  patientId?: {
    _id: Types.ObjectId;
    name: string;
  };
  date: string;
  timeSlot: string;
  purpose: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
}

// 📅 Create new appointment
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { doctorName, date, timeSlot, purpose } = req.body;

    if (!doctorName || !date || !timeSlot || !purpose) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const doctor = await DoctorModel.findOne({ name: doctorName });
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const patient = await PatientModel.findById(req.user!.id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const newAppointment = await new AppointmentModel({
      doctorId: doctor._id,
      patientId: req.user!.id,
      date,
      timeSlot,
      purpose,
      status: 'pending',
      createdAt: new Date()
    }).save();

    const enrichedAppointment = {
      id: newAppointment._id.toString(),
      doctorId: doctor._id.toString(),
      patientId: patient._id.toString(),
      date,
      timeSlot,
      purpose,
      status: newAppointment.status,
      createdAt: newAppointment.createdAt,
      doctorName: doctor.name,
      doctorSpecialization: doctor.specialization,
      patientName: patient.name
    };

    io.emit('appointmentBooked', enrichedAppointment);

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment: enrichedAppointment
    });
  } catch (error) {
    console.error('Appointment creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// 📋 Get appointments for logged-in doctor/patient
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    let appointments: PopulatedAppointment[];

    if (req.user?.userType === 'doctor') {
      appointments = await AppointmentModel.find({ doctorId: req.user.id })
        .populate('doctorId', 'name specialization')
        .populate('patientId', 'name')
        .lean();
    } else {
      appointments = await AppointmentModel.find({ patientId: req.user.id })
        .populate('doctorId', 'name specialization')
        .populate('patientId', 'name')
        .lean();
    }

    const enrichedAppointments = appointments.map((a) => ({
      id: a._id.toString(),
      doctorId: a.doctorId?._id?.toString() ?? 'unknown',
      patientId: a.patientId?._id?.toString() ?? 'unknown',
      date: a.date,
      timeSlot: a.timeSlot,
      purpose: a.purpose,
      status: a.status,
      createdAt: a.createdAt,
      doctorName: a.doctorId?.name ?? 'Unknown',
      doctorSpecialization: a.doctorId?.specialization ?? 'Unknown',
      patientName: a.patientId?.name ?? 'Unknown'
    }));

    res.json(enrichedAppointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
