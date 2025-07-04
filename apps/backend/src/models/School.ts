import { Schema, model, Document } from 'mongoose';

export interface ISchool extends Document {
  name: string;
  address?: string;
  phone?: string;
  subdomain?: string;
  status: 'active' | 'inactive' | 'suspended';
  logoUrl?: string;
  letterheadDetail?: string;
}

const schoolSchema = new Schema<ISchool>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  subdomain: {
    type: String,
    required: true,
    unique: true,
  },
  address: {
    type: String,
  },
  phone: {
    type: String,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
  },
  logoUrl: {
    type: String,
  },
  letterheadDetail: {
    type: String,
  },
}, { timestamps: true });

const School = model<ISchool>('School', schoolSchema);

export default School;