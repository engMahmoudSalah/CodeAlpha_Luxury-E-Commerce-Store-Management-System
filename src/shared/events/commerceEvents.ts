/**
 * Commerce EventBus for Real-time Cross-Module & Cross-Tab Synchronization
 * Enables instantaneous reactivity when Admin mutates data -> Storefront updates
 */

export type CommerceEventType =
  | 'PRODUCT_CREATED'
  | 'PRODUCT_UPDATED'
  | 'PRODUCT_DELETED'
  | 'CATEGORY_CREATED'
  | 'CATEGORY_UPDATED'
  | 'CATEGORY_DELETED'
  | 'COLLECTION_UPDATED'
  | 'ORDER_CREATED'
  | 'ORDER_UPDATED'
  | 'REVIEW_CREATED'
  | 'REVIEW_UPDATED'
  | 'COUPON_UPDATED'
  | 'PROMOTION_UPDATED'
  | 'HOMEPAGE_UPDATED'
  | 'SETTINGS_UPDATED'
  | 'RETURN_REQUEST_UPDATED'
  | 'CUSTOMER_UPDATED'
  | 'ABANDONED_CART_UPDATED'
  | 'INVENTORY_LOG_CREATED'
  | 'SUBSCRIBER_UPDATED'
  | 'TICKET_CREATED'
  | 'TICKET_UPDATED'
  | 'TICKET_DELETED'
  | 'OFFLINE_UPDATE_QUEUED'
  | 'OFFLINE_SYNC_COMPLETED';

export interface CommerceEvent<T = unknown> {
  type: CommerceEventType;
  payload: T;
  timestamp: string;
}

export type EventListener<T = any> = (payload: T, event: CommerceEvent<T>) => void;

class CommerceEventBus {
  private listeners: Map<CommerceEventType, Set<EventListener<any>>> = new Map();

  subscribe<T = any>(type: CommerceEventType, listener: EventListener<T>): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    const set = this.listeners.get(type)!;
    set.add(listener as EventListener<any>);

    return () => {
      set.delete(listener as EventListener<any>);
    };
  }

  emit<T>(type: CommerceEventType, payload: T): void {
    const event: CommerceEvent<T> = {
      type,
      payload,
      timestamp: new Date().toISOString(),
    };

    const set = this.listeners.get(type);
    if (set) {
      set.forEach((listener) => {
        try {
          listener(payload, event);
        } catch (err) {
          console.error(`Error handling commerce event ${type}:`, err);
        }
      });
    }

    // Also dispatch browser custom event for cross-component sync
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('fakhama_commerce_event', { detail: event }));
    }
  }

  publish<T = unknown>(type: CommerceEventType, payload?: T): void {
    this.emit(type, payload as T);
  }
}

export const commerceEventBus = new CommerceEventBus();
