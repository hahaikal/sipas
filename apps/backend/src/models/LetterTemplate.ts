import { Schema, model, Document, Types } from 'mongoose';

export interface IRequiredInput {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'number';
}

export interface ILetterTemplate extends Document {
  name: string;
  description: string;
  body: string;
  requiredInputs: IRequiredInput[];
  schoolId: Types.ObjectId;
}

const requiredInputSchema = new Schema<IRequiredInput>({
  name: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, enum: ['text', 'textarea', 'date', 'number'], required: true },
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
  requiredInputs: [requiredInputSchema],
  schoolId: {
    type: Schema.Types.ObjectId,
    ref: 'School',
    required: true,
    index: true,
  },
}, { timestamps: true });

const LetterTemplate = model<ILetterTemplate>('LetterTemplate', letterTemplateSchema);

export default LetterTemplate;