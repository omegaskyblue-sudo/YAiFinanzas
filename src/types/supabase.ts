export type TransactionType = "income" | "expense";

export interface Couple {
  id: string;
  created_at: string;
  invite_code: string;
}

export interface Profile {
  id: string;
  couple_id: string | null;
  name: string;
  avatar_url: string | null;
}

export interface Category {
  id: string;
  couple_id: string;
  name: string;
  icon: string;
  type: TransactionType;
  color: string;
}

export interface Transaction {
  id: string;
  couple_id: string;
  created_by: string;
  amount: number;
  type: TransactionType;
  category_id: string | null;
  description: string | null;
  date: string;
  is_split: boolean;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  couple_id: string;
  category_id: string;
  month: string;
  amount: number;
  spent: number;
}

export interface SavingsGoal {
  id: string;
  couple_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  created_at: string;
}
