import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    userType: 'patient' | 'doctor';
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

export const requireDoctor = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.userType !== 'doctor') {
    return res.status(403).json({ error: 'Doctor access required' });
  }
  next();
};

export const requirePatient = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.userType !== 'patient') {
    return res.status(403).json({ error: 'Patient access required' });
  }
  next();
};