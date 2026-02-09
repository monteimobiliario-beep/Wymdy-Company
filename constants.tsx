
import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Wallet, 
  Users, 
  Settings, 
  History 
} from 'lucide-react';
import { UserRole } from './types';

export const COLORS = {
  primary: '#10b981', // Emerald 500
  secondary: '#34d399',
  danger: '#ef4444',
  warning: '#f59e0b',
  success: '#10b981',
  info: '#3b82f6'
};

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Home', icon: <LayoutDashboard size={20} />, roles: Object.values(UserRole) },
  { id: 'stock', label: 'Stock', icon: <Package size={20} />, roles: [UserRole.ADMIN, UserRole.STOCK, UserRole.AUDITOR] },
  { id: 'sales', label: 'Vendas', icon: <ShoppingCart size={20} />, roles: [UserRole.ADMIN, UserRole.SELLER, UserRole.FINANCE, UserRole.AUDITOR] },
  { id: 'finance', label: 'Finanças', icon: <Wallet size={20} />, roles: [UserRole.ADMIN, UserRole.FINANCE, UserRole.AUDITOR] },
  { id: 'hr', label: 'RH', icon: <Users size={20} />, roles: [UserRole.ADMIN, UserRole.HR, UserRole.AUDITOR] },
  { id: 'audit', label: 'Log', icon: <History size={20} />, roles: [UserRole.ADMIN, UserRole.AUDITOR] },
  { id: 'config', label: 'Ajustes', icon: <Settings size={20} />, roles: [UserRole.ADMIN] },
];
