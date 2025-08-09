import { Schema, model, Document, Types } from 'mongoose';

interface ILetter {
  judul: string;
  kategori: string;
  tipeSurat: 'masuk' | 'keluar';
  createdBy: Types.ObjectId;
  schoolId: Types.ObjectId;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  nomorSurat?: string;
  tanggalSurat?: Date;
  fileUrl?: string; 
  approvedBy?: Types.ObjectId; 
  approvedAt?: Date;
  templateRef?: Types.ObjectId;
  templateData?: Map<string, string>;
}

export interface ILetterDocument extends ILetter, Document {}

const letterSchema = new Schema<ILetterDocument>({
  judul: {
    type: String,
    required: true,
  },
  kategori: {
    type: String,
    // required: true,
  },
  tipeSurat: {
    type: String,
    enum: ['masuk', 'keluar'],
    default: 'keluar',
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
  nomorSurat: { type: String },
  tanggalSurat: { type: Date },
  fileUrl: { type: String },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  templateRef: {
    type: Schema.Types.ObjectId,
    ref: 'LetterTemplate',
    required: false,
  },
  templateData: {
    type: Map,
    of: String,
    required: false,
  },
}, { timestamps: true });

const Letter = model<ILetterDocument>('Sipas-Letter', letterSchema);

export default Letter;