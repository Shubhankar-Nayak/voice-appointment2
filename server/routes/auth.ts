import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { DoctorModel, PatientModel } from '../models/index.js';

const router = express.Router();

// 🔐 REGISTER
router.post('/register', async (req, res) => {
  try {
    const {
      email,
      password,
      name,
      age,
      gender,
      userType,
      specialization,
      availableSlots = []
    } = req.body;

    if (!email || !password || !name || !age || !gender || !userType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (userType === 'doctor' && !specialization) {
      return res.status(400).json({ error: 'Specialization required for doctors' });
    }

    // Check if user exists in either collection
    const existingDoctor = await DoctorModel.findOne({ email });
    const existingPatient = await PatientModel.findOne({ email });
    if (existingDoctor || existingPatient) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let user;
    if (userType === 'doctor') {
      user = new DoctorModel({
        name,
        email,
        password: hashedPassword,
        age,
        gender,
        userType,
        specialization,
        availableSlots
      });
    } else {
      user = new PatientModel({
        name,
        email,
        password: hashedPassword,
        age,
        gender,
        userType
      });
    }

    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, userType: user.userType },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        userType: user.userType
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 🔑 LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Search in both models
    const user =
      (await DoctorModel.findOne({ email })) ||
      (await PatientModel.findOne({ email }));

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

  const isValidPassword = await bcrypt.compare(password, user.password ?? '');

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, userType: user.userType },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        userType: user.userType
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
