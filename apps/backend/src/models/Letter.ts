import { Schema, model, Document, Types } from 'mongoose';

interface ILetter {
  nomorSurat: string;
  judul: string;
  tanggalSurat: Date;
  kategori: string;
  tipeSurat: 'masuk' | 'keluar';
  fileUrl: string;
  createdBy: Types.ObjectId;
  schoolId: Types.ObjectId;
}

export interface ILetterDocument extends ILetter, Document {}

const letterSchema = new Schema<ILetterDocument>({
  nomorSurat: {
    type: String,
    required: true,
    unique: true,
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
    required: true,
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
}, { timestamps: true });

const Letter = model<ILetterDocument>('Sipas-Letter', letterSchema);

export default Letter;