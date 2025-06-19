import express from 'express';
import { io } from '../index.js';
import { DoctorModel } from '../models/index.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// ✅ GET all doctors
router.get('/', async (_req, res) => {
  try {
    const doctors = await DoctorModel.find().lean();

    const formattedDoctors = doctors.map((doc) => ({
      id: doc._id.toString(),
      name: doc.name,
      specialization: doc.specialization,
      availableSlots: doc.availableSlots || []
    }));

    res.json(formattedDoctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ GET doctor by ID
router.get('/:id', async (req, res) => {
  try {
    const doctor = await DoctorModel.findById(req.params.id).lean();

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json({
      id: doctor._id.toString(),
      name: doctor.name,
      specialization: doctor.specialization,
      availableSlots: doctor.availableSlots || []
    });
  } catch (error) {
    console.error('Error fetching doctor by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ PUT update doctor's slots
router.put('/:id/slots', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const doctor = await DoctorModel.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // 🔐 Only allow doctor to update their own slots
    if (req.user?.id !== doctor._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized to update this doctor\'s slots' });
    }

    const { availableSlots } = req.body;
    doctor.availableSlots = availableSlots || [];
    await doctor.save();

    // 🔄 Emit update to all connected clients
    io.emit('scheduleUpdated', {
      doctorId: doctor._id.toString(),
      doctorName: doctor.name
    });

    res.json({
      message: 'Available slots updated successfully',
      availableSlots: doctor.availableSlots
    });
  } catch (error) {
    console.error('Error updating doctor slots:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
