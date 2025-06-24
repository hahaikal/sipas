import { Schema, model, Document, Types } from 'mongoose';

interface ILetter {
  nomorSurat?: string;
  judul: string;
  tanggalSurat: Date;
  kategori?: string;
  tipeSurat: 'masuk' | 'keluar' | 'generated';
  fileUrl?: string;
  content?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';
  formData?: Map<string, any>;
  createdBy: Types.ObjectId;
  approvedBy?: Types.ObjectId;
  template?: Types.ObjectId;
  schoolId: Types.ObjectId;
}

export interface ILetterDocument extends ILetter, Document {}

const letterSchema = new Schema<ILetterDocument>({
  nomorSurat: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  judul: {
    type: String,
    required: true,
  },
  tanggalSurat: {
    type: Date,
    required: true,
    default: Date.now,
  },
  kategori: {
    type: String,
  },
  tipeSurat: {
    type: String,
    enum: ['masuk', 'keluar', 'generated'],
    required: true,
  },
  fileUrl: {
    type: String,
  },
  content: {
      type: String,
  },
  status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'ARCHIVED'],
      default: 'ARCHIVED',
  },
  formData: { type: Map, of: String },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
  },
  template: {
      type: Schema.Types.ObjectId,
      ref: 'LetterTemplate',
  },
  schoolId: {
    type: Schema.Types.ObjectId,
    ref: 'School',
    required: true,
    index: true,
  },
}, { timestamps: true });

const Letter = model<ILetterDocument>('Sipas-Letter', letterSchema);

export default Letter;