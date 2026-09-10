import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { commerceStore } from './commerceStore';
import { commerceEventBus } from '../events/commerceEvents';

let isInitialized = false;

export function initializeFirebaseSync() {
  if (isInitialized) return;
  isInitialized = true;

  // Listen to Products
  onSnapshot(collection(db, 'products'), (snapshot) => {
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    if (products.length > 0) {
      commerceStore['products'] = products;
      commerceEventBus.publish('PRODUCT_UPDATED');
    }
  });

  // Listen to Categories
  onSnapshot(collection(db, 'categories'), (snapshot) => {
    const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    if (categories.length > 0) {
      commerceStore['categories'] = categories;
      commerceEventBus.publish('CATEGORY_UPDATED');
    }
  });

  // Listen to Orders
  onSnapshot(collection(db, 'orders'), (snapshot) => {
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    if (orders.length > 0) {
      commerceStore['orders'] = orders;
      commerceEventBus.publish('ORDER_UPDATED');
    }
  });

  // Listen to Customers
  onSnapshot(collection(db, 'users'), (snapshot) => {
    const customers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    if (customers.length > 0) {
      commerceStore['customers'] = customers;
      commerceEventBus.publish('CUSTOMER_UPDATED');
    }
  });
  
  // Settings
  onSnapshot(doc(db, 'settings', 'storeSettings'), (docSnap) => {
    if (docSnap.exists()) {
      commerceStore['storeSettings'] = docSnap.data() as any;
      commerceEventBus.publish('SETTINGS_UPDATED');
    }
  });
}
