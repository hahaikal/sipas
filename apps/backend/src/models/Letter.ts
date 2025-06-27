import { Schema, model, Document, Types } from 'mongoose';

interface IFormData {
  [key: string]: any;
}

interface ILetter {
  nomorSurat: string;
  judul: string;
  tanggalSurat: Date;
  kategori: string;
  tipeSurat: 'masuk' | 'keluar';
  fileUrl?: string;
  createdBy: Types.ObjectId;
  schoolId: Types.ObjectId;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  templateId?: Types.ObjectId;
  content?: string; // Add this line
  formData?: string;
  approvedBy?: Types.ObjectId;
  approvedAt?: Date; 
}

export interface ILetterDocument extends ILetter, Document {}

const letterSchema = new Schema<ILetterDocument>({
  nomorSurat: {
    type: String,
    required: true,
    // unique: true,
  },
  judul: {
    type: String,
    required: true,
  },
  tanggalSurat: {
    type: Date,
    required: true,
  },
  kategori: {
    type: String,
    required: true,
  },
  tipeSurat: {
    type: String,
    enum: ['masuk', 'keluar'],
    required: true,
  },
  fileUrl: {
    type: String,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  schoolId: {
    type: Schema.Types.ObjectId,
    ref: 'School',
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
  },
  templateId: {
    type: Schema.Types.ObjectId,
    ref: 'LetterTemplate',
  },
  content: { // Add this block
    type: String,
  },
  formData: {
    type: String,
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  approvedAt: {
    type: Date,
  },
}, { timestamps: true });

const Letter = model<ILetterDocument>('Sipas-Letter', letterSchema);

export default Letter;