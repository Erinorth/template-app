export interface Payment {
  id: number | string;
  status: string;
  email: string;
  amount: number;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}
