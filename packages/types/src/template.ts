import { Placeholder } from './placeholder';

export interface RequiredInput {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'number';
}

export interface LetterTemplate {
  _id: string;
  name: string;
  description: string;
  body: string;
  placeholders: Placeholder[];
  requiredInputs: RequiredInput[];
  schoolId: string;
  createdAt?: string;
  updatedAt?: string;
}
