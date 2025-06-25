import { Response } from 'express';
import Disposition from '../models/Disposition';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import asyncHandler from 'express-async-handler';

export const getMyDispositions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const myDispositions = await Disposition.find({ toUser: req.user?.id })
        .populate('fromUser', 'name')
        .populate('letterId', 'judul nomorSurat')
        .sort({ createdAt: -1 });

    res.status(200).json({ data: myDispositions });
});