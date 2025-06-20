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
      
      const { subdomain } = req.body;

      if (subdomain) {
          const school = await School.findOne({ subdomain: subdomain, status: 'active' }) as (typeof School.prototype & { _id: any }) | null;
          if (!school) {
            res.status(404);
            throw new Error(`School with subdomain "${subdomain}" not found or inactive`);
          }

          if (req.user.schoolId.toString() !== school._id.toString()) {
              res.status(401);
              throw new Error('Not authorized, user does not belong to this school');
          }
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

export const isApprover = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === 'kepala sekolah') {
        next();
    } else {
        res.status(403);
        throw new Error('Not authorized as an approver');
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