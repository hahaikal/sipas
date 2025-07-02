import { Schema, model, Document, Types } from 'mongoose';

export interface IPlaceholder {
  key: string;
  description: string;
}

export interface IRequiredInput {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'number';
}

export interface ILetterTemplate extends Document {
  name: string;
  description: string;
  body: string;
  placeholders: IPlaceholder[];
  schoolId: Types.ObjectId;
  requiredInputs: IRequiredInput[];
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
  requiredInputs: [{
    name: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, required: true, enum: ['text', 'textarea', 'date', 'number'] }
  }]
}, { timestamps: true });

const LetterTemplate = model<ILetterTemplate>('LetterTemplate', letterTemplateSchema);

export default LetterTemplate;