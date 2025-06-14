import { Schema, model, Document, Types } from 'mongoose';

interface IAchievement {
  title: string;
  description: string;
  year: number;
  level: 'Sekolah' | 'Kecamatan' | 'Kabupaten/Kota' | 'Provinsi' | 'Nasional' | 'Internasional';
  achievedBy: string;
  addedBy: Types.ObjectId;
}

export interface IAchievementDocument extends IAchievement, Document {}

const achievementSchema = new Schema<IAchievementDocument>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  level: {
    type: String,
    enum: ['Sekolah', 'Kecamatan', 'Kabupaten/Kota', 'Provinsi', 'Nasional', 'Internasional'],
    required: true,
  },
  achievedBy: {
    type: String,
    required: true,
  },
  addedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

const Achievement = model<IAchievementDocument>('Achievement', achievementSchema);

export default Achievement;