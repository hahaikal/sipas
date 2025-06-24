import { Schema, model, Document, Types } from 'mongoose';

export interface IPlaceholder {
  key: string;
  description: string;
}

export interface ILetterTemplate extends Document {
  name: string;
  description: string;
  body: string;
  placeholders: IPlaceholder[];
  schoolId: Types.ObjectId;
}

const placeholderSchema = new Schema<IPlaceholder>({
  key: { type: String, required: true },
  description: { type: String, required: true },
}, { _id: false });

const letterTemplateSchema = new Schema<ILetterTemplate>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
  },
  body: {
    type: String,
    required: true,
  },
  placeholders: [placeholderSchema],
  schoolId: {
    type: Schema.Types.ObjectId,
    ref: 'School',
    required: true,
    index: true,
  },
}, { timestamps: true });

const LetterTemplate = model<ILetterTemplate>('LetterTemplate', letterTemplateSchema);

export default LetterTemplate;