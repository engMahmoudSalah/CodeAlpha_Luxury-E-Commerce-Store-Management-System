import { doc, setDoc, deleteDoc, collection, onSnapshot, writeBatch } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { commerceStore } from './commerceStore';
import { commerceEventBus } from '../events/commerceEvents';

interface QueueItem {
  id: string;
  type: 'set' | 'delete' | 'batch_set';
  collectionName: string;
  item?: any;
  items?: any[];
  itemId?: string | number;
  timestamp: number;
}

let syncQueue: QueueItem[] = [];

// Load queue from localStorage on load
try {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('commerce_sync_queue');
    if (saved) {
      syncQueue = JSON.parse(saved);
    }
  }
} catch (e) {
  console.error('Failed to load sync queue', e);
}

const saveQueue = () => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('commerce_sync_queue', JSON.stringify(syncQueue));
    }
  } catch (e) {
    console.error('Failed to save sync queue', e);
  }
};

let isProcessingQueue = false;

// Process the offline queue
export const processSyncQueue = async () => {
  if (isProcessingQueue || syncQueue.length === 0) return;
  
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return;
  }

  isProcessingQueue = true;
  console.log(`🔄 Processing ${syncQueue.length} queued offline updates...`);

  const failedItems: QueueItem[] = [];

  for (const queueItem of syncQueue) {
    try {
      if (queueItem.type === 'set') {
        const docId = String(queueItem.item.id || queueItem.item.orderNumber || queueItem.item.slug || Math.random().toString(36).slice(2));
        await setDoc(doc(db, queueItem.collectionName, docId), queueItem.item, { merge: true });
      } else if (queueItem.type === 'delete') {
        await deleteDoc(doc(db, queueItem.collectionName, String(queueItem.itemId)));
      } else if (queueItem.type === 'batch_set' && queueItem.items) {
        const batch = writeBatch(db);
        const chunk = queueItem.items.slice(0, 100);
        chunk.forEach(item => {
          const docId = String(item.id || item.orderNumber || item.slug);
          const docRef = doc(db, queueItem.collectionName, docId);
          batch.set(docRef, item, { merge: true });
        });
        await batch.commit();
      }
    } catch (err: any) {
      console.warn(`Retry failed for queue item ${queueItem.collectionName}:${queueItem.id || queueItem.itemId}:`, err.message);
      // If it's a permission denied error, don't keep retrying it forever
      if (err.code === 'permission-denied' || err.message?.includes('PERMISSION_DENIED')) {
        console.warn(`Dropping queue item due to permission denied: ${queueItem.collectionName}`);
      } else {
        failedItems.push(queueItem);
      }
    }
  }

  syncQueue = failedItems;
  saveQueue();
  isProcessingQueue = false;

  if (syncQueue.length === 0) {
    console.log('✅ All queued offline updates synchronized successfully!');
    commerceEventBus.emit('OFFLINE_SYNC_COMPLETED', null);
  }
};

// Listen to browser network changes
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('🌐 Connection restored, draining sync queue...');
    processSyncQueue();
  });
  // Also poll every 15 seconds as a fallback
  setInterval(processSyncQueue, 15000);
}

export const syncItemToFirestore = async (collectionName: string, item: any) => {
  const docId = String(item.id || item.orderNumber || item.slug || Math.random().toString(36).slice(2));
  try {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new Error('Network is offline');
    }
    await setDoc(doc(db, collectionName, docId), item, { merge: true });
  } catch (err: any) {
    if (err.code === 'permission-denied' || err.message?.includes('PERMISSION_DENIED')) {
      console.warn(`Firestore permission denied for ${collectionName}/${docId}. Skipping sync.`);
      return;
    }
    console.warn(`Firestore set failure, queuing update for ${collectionName}/${docId}:`, err);
    
    // Collapse duplicates in queue
    syncQueue = syncQueue.filter(q => !(q.collectionName === collectionName && q.type === 'set' && String(q.item?.id || q.item?.orderNumber || q.item?.slug) === docId));
    
    syncQueue.push({
      id: docId,
      type: 'set',
      collectionName,
      item,
      timestamp: Date.now()
    });
    saveQueue();
    commerceEventBus.emit('OFFLINE_UPDATE_QUEUED', { collectionName, item });
  }
};

export const syncDeleteToFirestore = async (collectionName: string, id: string | number) => {
  const docId = String(id);
  try {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new Error('Network is offline');
    }
    await deleteDoc(doc(db, collectionName, docId));
  } catch (err: any) {
    if (err.code === 'permission-denied' || err.message?.includes('PERMISSION_DENIED')) {
      console.warn(`Firestore permission denied for deletion of ${collectionName}/${docId}. Skipping sync.`);
      return;
    }
    console.warn(`Firestore delete failure, queuing deletion for ${collectionName}/${docId}:`, err);
    
    // Collapse duplicates
    syncQueue = syncQueue.filter(q => !(q.collectionName === collectionName && q.type === 'delete' && String(q.itemId) === docId));
    
    syncQueue.push({
      id: docId,
      type: 'delete',
      collectionName,
      itemId: docId,
      timestamp: Date.now()
    });
    saveQueue();
    commerceEventBus.emit('OFFLINE_UPDATE_QUEUED', { collectionName, itemId: docId });
  }
};

// Batch sync an entire array to Firestore
export const syncArrayToFirestore = async (collectionName: string, items: any[]) => {
  try {
    if (!items || items.length === 0) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new Error('Network is offline');
    }
    const batch = writeBatch(db);
    const chunk = items.slice(0, 100);
    chunk.forEach(item => {
      const docId = String(item.id || item.orderNumber || item.slug);
      const docRef = doc(db, collectionName, docId);
      batch.set(docRef, item, { merge: true });
    });
    await batch.commit();
  } catch (err: any) {
    if (err.code === 'permission-denied' || err.message?.includes('PERMISSION_DENIED')) {
      console.warn(`Firestore permission denied for batch of ${collectionName}. Skipping sync.`);
      return;
    }
    console.warn(`Firestore batch set failure, queuing batch for ${collectionName}:`, err);
    
    syncQueue.push({
      id: `batch_${Date.now()}`,
      type: 'batch_set',
      collectionName,
      items,
      timestamp: Date.now()
    });
    saveQueue();
    commerceEventBus.emit('OFFLINE_UPDATE_QUEUED', { collectionName, count: items.length });
  }
};

let isInitialized = false;

export function initializeFirebaseSync() {
  if (isInitialized) return;
  isInitialized = true;

  console.log('🔄 Initializing Firebase Firestore Real-time synchronization...');

  const setupSync = (collectionName: string, property: string, eventName: any) => {
    onSnapshot(collection(db, collectionName), (snapshot) => {
      const items = snapshot.docs.map(d => ({ ...d.data(), id: d.data().id || d.id } as any));
      if (items.length > 0) {
        if (typeof (commerceStore as any).updateFromServer === 'function') {
           (commerceStore as any).updateFromServer(property, items);
        } else {
           (commerceStore as any)[property] = items;
        }
        commerceEventBus.emit(eventName, items);
      }
    }, (error) => {
      console.warn(`Firestore sync error on ${collectionName}:`, error.message);
    });
  };

  setupSync('products', 'products', 'PRODUCT_UPDATED');
  setupSync('categories', 'categories', 'CATEGORY_UPDATED');
  setupSync('orders', 'orders', 'ORDER_UPDATED');
  setupSync('collections', 'collections', 'COLLECTION_UPDATED');
  setupSync('users', 'customers', 'CUSTOMER_UPDATED');
  setupSync('reviews', 'reviews', 'REVIEW_UPDATED');
  setupSync('coupons', 'coupons', 'COUPON_UPDATED');
  setupSync('promotions', 'promotions', 'PROMOTION_UPDATED');
  setupSync('returns', 'returnRequests', 'RETURN_REQUEST_UPDATED');
  
  onSnapshot(doc(db, 'settings', 'storeSettings'), (docSnap) => {
    if (docSnap.exists()) {
      (commerceStore as any)['storeSettings'] = docSnap.data();
      commerceEventBus.emit('SETTINGS_UPDATED', docSnap.data());
    }
  }, (error) => {
    console.warn('Firestore sync error on storeSettings:', error.message);
  });
}
