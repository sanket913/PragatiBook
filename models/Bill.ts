import { ObjectId } from 'mongodb';

export interface BillItem {
  id: string;
  text: string;
  feet: number;
  inches: number;
  quantity?: number;
  defaultValue: number;
  calculatedValue: number;
}

export interface Bill {
  _id?: ObjectId;
  userId: ObjectId;
  customerName: string;
  description?: string;
  date: string;
  items: BillItem[];
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BillResponse {
  id: string;
  userId: string;
  customerName: string;
  description?: string;
  date: string;
  items: BillItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
}