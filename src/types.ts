/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  price: number; // Price in SAR (Riyal)
  costPrice?: number; // Optional cost price to calculate profit
  barcode: string; // Barcode number
  category: string; // Category name
  stock: number; // Stock quantity
  image?: string; // Optional image URL or placeholder
  isUnavailable?: boolean; // Out of service / Unavailable status
}

export interface Company {
  id: string;
  name: string;
  vatNumber: string;
  crNumber: string;
  vatRate: number;
  welcomeMsg: string;
  subscriptionPlan: 'free' | 'basic' | 'premium' | 'enterprise';
  subscriptionExpiry: string;
  maxProductsLimit: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type PaymentMethod = 'cash' | 'mada' | 'visa' | 'apple_pay';

export type PaymentStatus = 'idle' | 'processing' | 'card_inserted' | 'pin_required' | 'authorized' | 'completed' | 'failed';

export interface Order {
  id: string;
  invoiceNumber: string;
  items: CartItem[];
  subtotal: number;
  vat: number; // 15% VAT
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  timestamp: number; // Epoch timestamp
  receivedAmount?: number; // Cash received
  changeAmount?: number; // Cash change returned
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export type DeviceType = 'scanner' | 'scale' | 'printer' | 'terminal';
export type DeviceStatus = 'connected' | 'disconnected' | 'connecting';

export interface HardwareDevice {
  id: string;
  name: string;
  arabicName: string;
  type: DeviceType;
  status: DeviceStatus;
  connectionType: 'USB' | 'Bluetooth' | 'Wi-Fi' | 'Serial (COM)';
  portOrIp: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  lastActive?: number;
  details?: string;
}
