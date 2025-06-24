import { User } from './user';
import { Letter } from './letter';

export type PopulatedUser = Pick<User, '_id' | 'name' | 'role'>;

export type PopulatedLetter = Pick<Letter, '_id' | 'judul' | 'nomorSurat'>;

export interface Disposition {
  _id: string;
  letterId: string | PopulatedLetter;
  fromUser: string | PopulatedUser;
  toUser: string | PopulatedUser;
  instructions: string;
  status: 'SENT' | 'READ';
  createdAt: string;
  updatedAt: string;
}