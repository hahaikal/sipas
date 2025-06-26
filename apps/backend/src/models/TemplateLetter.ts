import { Schema, model, Document, Types } from 'mongoose';

interface ILetterTemplate {
  name: string;
  description?: string;
  body: string;
  schoolId: Types.ObjectId;
}

export interface ILetterTemplateDocument extends ILetterTemplate, Document {}

const letterTemplateSchema = new Schema<ILetterTemplateDocument>({
  name: { type: String, required: true },
  description: { type: String },
  body: { type: String, required: true },
  schoolId: {
    type: Schema.Types.ObjectId,
    ref: 'School',
    required: true,
    index: true,
  },
}, { timestamps: true });

const LetterTemplate = model<ILetterTemplateDocument>('LetterTemplate', letterTemplateSchema);

export default LetterTemplate;