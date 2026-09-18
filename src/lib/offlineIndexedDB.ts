/**
 * نظام قيد (QAYD) - إدارة التخزين المحلي وقائمة المزامنة عبر IndexedDB
 * Robust offline persistence for sales, orders, and pending sync queue
 */

import { Order } from '../types';

const DB_NAME = 'qayd_pos_offline_db';
const DB_VERSION = 1;
const STORE_ORDERS = 'orders';
const STORE_PENDING_SYNC = 'pending_sync';

export interface PendingSyncRecord {
  syncId?: number;
  type: 'ORDER_CREATED' | 'STOCK_UPDATED' | 'INVOICE_CANCELLED';
  payload: any;
  createdAt: number;
  status: 'pending' | 'syncing' | 'failed';
  attempts: number;
  errorMessage?: string;
}

let dbInstance: IDBDatabase | null = null;

export async function openOfflineDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;
  if (typeof window === 'undefined' || !window.indexedDB) {
    throw new Error('IndexedDB is not supported in this environment');
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Store for all completed orders
      if (!db.objectStoreNames.contains(STORE_ORDERS)) {
        const orderStore = db.createObjectStore(STORE_ORDERS, { keyPath: 'id' });
        orderStore.createIndex('timestamp', 'timestamp', { unique: false });
        orderStore.createIndex('invoiceNumber', 'invoiceNumber', { unique: false });
      }

      // Store for pending sync queue (offline orders)
      if (!db.objectStoreNames.contains(STORE_PENDING_SYNC)) {
        const syncStore = db.createObjectStore(STORE_PENDING_SYNC, { keyPath: 'syncId', autoIncrement: true });
        syncStore.createIndex('status', 'status', { unique: false });
        syncStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Save an order to IndexedDB and queue it for sync if offline or pending
 */
export async function saveOrderToIndexedDB(order: Order, isOffline: boolean = false): Promise<void> {
  try {
    const db = await openOfflineDB();
    const tx = db.transaction([STORE_ORDERS, STORE_PENDING_SYNC], 'readwrite');
    const orderStore = tx.objectStore(STORE_ORDERS);
    const syncStore = tx.objectStore(STORE_PENDING_SYNC);

    // Save order
    orderStore.put(order);

    // Queue for sync
    const syncRecord: PendingSyncRecord = {
      type: 'ORDER_CREATED',
      payload: order,
      createdAt: Date.now(),
      status: 'pending',
      attempts: 0
    };
    syncStore.add(syncRecord);

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to save order to IndexedDB (falling back to localStorage):', err);
  }
}

/**
 * Get all stored orders from IndexedDB
 */
export async function getAllIndexedDBOrders(): Promise<Order[]> {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_ORDERS, 'readonly');
      const store = tx.objectStore(STORE_ORDERS);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Failed to read from IndexedDB:', err);
    return [];
  }
}

/**
 * Get count of pending sync items
 */
export async function getPendingSyncCount(): Promise<number> {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PENDING_SYNC, 'readonly');
      const store = tx.objectStore(STORE_PENDING_SYNC);
      const statusIndex = store.index('status');
      const request = statusIndex.count(IDBKeyRange.only('pending'));

      request.onsuccess = () => resolve(request.result || 0);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    return 0;
  }
}

/**
 * Get all pending items
 */
export async function getPendingSyncItems(): Promise<PendingSyncRecord[]> {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PENDING_SYNC, 'readonly');
      const store = tx.objectStore(STORE_PENDING_SYNC);
      const request = store.getAll();

      request.onsuccess = () => {
        const items: PendingSyncRecord[] = request.result || [];
        resolve(items.filter(item => item.status === 'pending'));
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    return [];
  }
}

/**
 * Remove or mark an item as synced
 */
export async function markItemSynced(syncId: number): Promise<void> {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PENDING_SYNC, 'readwrite');
      const store = tx.objectStore(STORE_PENDING_SYNC);
      const request = store.delete(syncId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Failed to mark item synced:', err);
  }
}
