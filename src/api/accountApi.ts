import { auth, db } from '../lib/firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { updateProfile as updateAuthProfile } from 'firebase/auth';
import { User, Address } from '../types';
import { commerceStore } from '../shared/store/commerceStore';
import { commerceEventBus } from '../shared/events/commerceEvents';

export const accountApi = {
  async getProfile(): Promise<User> {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();
    
    return {
      id: user.uid as any,
      name: userData?.name || user.displayName || 'Unknown',
      email: user.email || '',
      phone: userData?.phone || user.phoneNumber || undefined,
      role: userData?.role || 'customer',
      created_at: userData?.createdAt || new Date().toISOString(),
    };
  },

  async updateProfile(payload: { name: string; phone?: string; city?: string }): Promise<User> {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    await updateAuthProfile(user, { displayName: payload.name });
    
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      name: payload.name,
      phone: payload.phone || null,
      email: user.email || '',
      photoURL: user.photoURL || null,
      city: payload.city || 'الرياض',
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // Sync to commerceStore for real-time reflection in Admin Customers
    const updatedCustomer = commerceStore.updateCustomer(user.uid, {
      name: payload.name,
      phone: payload.phone,
      email: user.email || undefined,
      city: payload.city,
    });

    if (!updatedCustomer && user.email) {
      // Also try email match
      commerceStore.updateCustomer(user.email, {
        name: payload.name,
        phone: payload.phone,
        city: payload.city,
      });
    }

    return this.getProfile();
  },

  async getAddresses(): Promise<Address[]> {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    return userDoc.data()?.addresses || [];
  },

  async createAddress(payload: Omit<Address, 'id' | 'user_id' | 'created_at'>): Promise<Address> {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    const currentAddresses = userDoc.exists() ? (userDoc.data()?.addresses || []) : [];
    
    const newAddress: Address = {
      ...payload,
      id: Date.now(),
      user_id: user.uid as any,
      created_at: new Date().toISOString(),
    };
    
    await setDoc(userRef, {
      addresses: [...currentAddresses, newAddress]
    }, { merge: true });
    
    return newAddress;
  },

  async deleteAddress(id: number): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    const currentAddresses = userDoc.exists() ? (userDoc.data()?.addresses || []) : [];
    
    await setDoc(userRef, {
      addresses: currentAddresses.filter((a: Address) => a.id !== id)
    }, { merge: true });
  },

  async setDefaultAddress(id: number): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    const currentAddresses = userDoc.exists() ? (userDoc.data()?.addresses || []) : [];
    
    await setDoc(userRef, {
      addresses: currentAddresses.map((a: Address) => ({
        ...a,
        is_default: a.id === id ? 1 : 0
      }))
    }, { merge: true });
  }
};
