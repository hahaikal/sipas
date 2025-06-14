import { Schema, model, Document, Types } from 'mongoose';

interface IGalleryItem {
  imageUrl: string;
  caption: string;
  uploadedBy: Types.ObjectId;
}

export interface IGalleryItemDocument extends IGalleryItem, Document {}

const gallerySchema = new Schema<IGalleryItemDocument>({
  imageUrl: {
    type: String,
    required: true,
  },
  caption: {
    type: String,
    required: true,
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

const Gallery = model<IGalleryItemDocument>('Gallery', gallerySchema);

export default Gallery;