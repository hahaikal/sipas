import { Schema, model, Document, Types } from 'mongoose';

export interface IDisposition extends Document {
  letterId: Types.ObjectId;
  fromUser: Types.ObjectId;
  toUser: Types.ObjectId;
  instructions: string;
  status: 'SENT' | 'READ';
  schoolId: Types.ObjectId;
}

const dispositionSchema = new Schema<IDisposition>({
  letterId: {
    type: Schema.Types.ObjectId,
    ref: 'Sipas-Letter',
    required: true,
    index: true,
  },
  fromUser: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  toUser: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  instructions: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['SENT', 'READ'],
    default: 'SENT',
  },
  schoolId: {
    type: Schema.Types.ObjectId,
    ref: 'School',
    required: true,
    index: true,
  },
}, { timestamps: true });

const Disposition = model<IDisposition>('Disposition', dispositionSchema);

export default Disposition;