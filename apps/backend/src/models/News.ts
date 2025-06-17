import { Schema, model, Document, Types } from 'mongoose';

interface INews {
  title: string;
  content: string;
  imageUrl?: string;
  author: Types.ObjectId;
  schoolId: Types.ObjectId
}

export interface INewsDocument extends INews, Document {}

const newsSchema = new Schema<INewsDocument>({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
  },
  author: {
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

const News = model<INewsDocument>('News', newsSchema);

export default News;