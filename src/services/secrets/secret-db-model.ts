import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ISecretDB extends mongoose.Document {
  secret: string;
  date: Date;
  expires: Date;
  maxUsages: number;
  uuid: string;
  usages: number;
}

export const SecretDBSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  secret: { type: String },
  date: { type: Date, required: true },
  expires: { type: Date },
  maxUsages: { type: Number },
  usages: { type: Number, default: 0 },
  uuid: { type: String, required: true }
});

export default mongoose.model<ISecretDB>('SecretDB', SecretDBSchema);
