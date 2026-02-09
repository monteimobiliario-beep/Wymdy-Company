
export enum UserRole {
  ADMIN = 'ADMIN',
  FINANCE = 'FINANCE',
  STOCK = 'STOCK',
  SELLER = 'SELLER',
  PURCHASES = 'PURCHASES',
  HR = 'HR',
  AUDITOR = 'AUDITOR'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  unit: string;
  costPrice: number;
  salePrice: number;
  minStock: number;
  currentStock: number;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: 'IN' | 'OUT' | 'ADJ';
  quantity: number;
  date: string;
  userId: string;
  refDoc?: string;
}

export interface MarketingAgent {
  id: string;
  name: string;
  bonusPercentage: number;
}

export interface Client {
  id: string;
  name: string;
  nuit: string;
  phone: string;
  address: string;
  creditLimit: number;
  balance: number;
  marketingAgentId?: string; // Link to bonus system
}

export interface Sale {
  id: string;
  clientId: string;
  total: number;
  discount: number;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  type: 'cash' | 'credit';
  date: string;
  userId: string;
}

export interface Installment {
  id: string;
  saleId: string;
  number: number;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  paidAt?: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  provider: string;
  description: string;
  userId: string;
  status: 'pending' | 'approved' | 'paid';
}

export interface SalarySheet {
  id: string;
  month: string;
  year: number;
  status: 'draft' | 'closed';
  entries: SalaryEntry[];
}

export interface SalaryEntry {
  employeeId: string;
  employeeName: string;
  baseSalary: number;
  marketingBonus: number;
  otherBonuses: number;
  deductions: number;
  netSalary: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  before?: string;
  after?: string;
  timestamp: string;
}
