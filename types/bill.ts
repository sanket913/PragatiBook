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