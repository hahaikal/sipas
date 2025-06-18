import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User, { IUserDocument } from '../models/User';
import School from '../models/School';

interface JwtPayload {
  id: string;
  role: string;
  schoolId: string;
}

export interface AuthenticatedRequest extends Request {
  user?: IUserDocument & { schoolId: string };
}

export const protect = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const secret = process.env.JWT_SECRET || 'default-secret-key';
      const decoded = jwt.verify(token, secret) as JwtPayload;

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      if (req.user.schoolId.toString() !== decoded.schoolId) {
        res.status(401);
        throw new Error('Not authorized, school mismatch');
      }

      (req.user as any).schoolId = decoded.schoolId;

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

export const admin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403);
        throw new Error('Not authorized as an admin');
    }
}

export const getSchoolIdFromSubdomain = async (req: AuthenticatedRequest) => {
  const subdomain = req.body.subdomain;
  if (!subdomain) {
    throw new Error('Subdomain tidak ditemukan di request body');
  }

  const school = await School.findOne({ subdomain: subdomain, status: 'active' });
  if (!school) {
    throw new Error(`Sekolah dengan subdomain "${subdomain}" tidak ditemukan atau tidak aktif`);
  }
  return school._id;
}
