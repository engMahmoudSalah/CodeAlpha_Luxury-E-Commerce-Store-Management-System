import { auth, db, googleProvider } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updatePassword,
  updateProfile,
  signInWithPopup,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User } from '../types';
import { commerceStore } from '../shared/store/commerceStore';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

// Constants for authorized root administrators
const SUPER_ADMIN_EMAILS = ['mahmodsalah.2026@gmail.com'];
const SYSTEM_ADMIN_EMAILS = ['admin@fakhama.sa'];

export const determineUserRole = (email?: string | null, existingRole?: string): 'customer' | 'admin' | 'super_admin' => {
  if (existingRole === 'super_admin' || existingRole === 'admin') {
    return existingRole;
  }
  const cleanEmail = email?.trim().toLowerCase() || '';
  if (cleanEmail.includes('mahmodsalah.2026') || cleanEmail.includes('mahmodsalah2026')) {
    return 'super_admin';
  }
  if (SYSTEM_ADMIN_EMAILS.includes(cleanEmail)) {
    return 'admin';
  }
  return existingRole === 'admin' ? 'admin' : 'customer';
};

const mapFirebaseUser = async (firebaseUser: FirebaseUser): Promise<User> => {
  let userData: any = null;
  try {
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (userDoc.exists()) {
      userData = userDoc.data();
    }
  } catch (err) {
    console.warn('Could not read user document from Firestore:', err);
  }

  const role = determineUserRole(firebaseUser.email, userData?.role);
  const provider = firebaseUser.providerData?.[0]?.providerId || 'password';

  return {
    id: firebaseUser.uid,
    name: userData?.name || firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'عميل فخامة'),
    email: firebaseUser.email || '',
    phone: userData?.phone || firebaseUser.phoneNumber || undefined,
    photoURL: userData?.photoURL || firebaseUser.photoURL || undefined,
    provider,
    role,
    created_at: userData?.createdAt || new Date().toISOString(),
  };
};

export const authApi = {
  async getMe(): Promise<User> {
    const user = auth.currentUser;
    if (user) {
      return mapFirebaseUser(user);
    }

    // Check backend active session
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data?.user) {
          const u = data.data.user;
          const role = determineUserRole(u.email, u.role);
          return {
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone,
            role,
            provider: 'password',
            created_at: u.created_at || new Date().toISOString()
          };
        }
      }
    } catch (e) {
      // Backend not available or unauthenticated
    }

    throw new Error('Not authenticated');
  },

  async login(payload: LoginPayload): Promise<User> {
    // 1. Try Firebase Authentication
    try {
      const userCredential = await signInWithEmailAndPassword(auth, payload.email, payload.password);
      return await mapFirebaseUser(userCredential.user);
    } catch (firebaseErr: any) {
      // 2. Seamlessly authenticate via backend session API (e.g. for demo users or if email/password isn't enabled in Firebase)
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok && data.success && data.data?.user) {
          const u = data.data.user;
          const role = determineUserRole(u.email, u.role);

          // Sync into Firestore users collection
          try {
            await setDoc(doc(db, 'users', String(u.id)), {
              id: u.id,
              name: u.name,
              email: u.email,
              role,
              provider: 'password',
              lastLogin: new Date().toISOString()
            }, { merge: true });
          } catch (syncErr) {}

          return {
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone,
            role,
            provider: 'password',
            created_at: u.created_at || new Date().toISOString()
          };
        }
      } catch (backendErr) {}

      if (firebaseErr.code === 'auth/operation-not-allowed') {
        throw new Error('تسجيل الدخول بالبريد الإلكتروني غير مفعّل. اطلب من مالك المشروع (Project Owner) تفعيل خيار Email/Password في Firebase Authentication.');
      } else if (firebaseErr.code === 'auth/invalid-credential' || firebaseErr.code === 'auth/user-not-found' || firebaseErr.code === 'auth/wrong-password') {
        throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
      } else if (firebaseErr.code === 'auth/too-many-requests') {
        throw new Error('تم حظر المحاولات مؤقتاً لتكرار الخطأ. يرجى المحاولة لاحقاً أو استعادة كلمة المرور.');
      }
      throw firebaseErr;
    }
  },

  async loginWithGoogle(): Promise<User> {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;

      // STRICT AUTHORIZATION CHECK
      // Only allow specific admin emails
      const userEmail = user.email?.trim().toLowerCase() || '';
      const isSuperAdmin = userEmail.includes('mahmodsalah.2026') || userEmail.includes('mahmodsalah2026');
      const isAdmin = userEmail === 'admin@fakhama.sa';
      
      if (!isSuperAdmin && !isAdmin) {
        await signOut(auth); // force logout immediately
        throw new Error('UNAUTHORIZED_EMAIL');
      }

      // Ensure user profile exists in Firestore
      try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        const existingData = userDoc.exists() ? userDoc.data() : null;
        const role = determineUserRole(user.email, existingData?.role);

        if (!userDoc.exists()) {
          const uName = user.displayName || (user.email ? user.email.split('@')[0] : 'عميل فخامة');
          await setDoc(userRef, {
            name: uName,
            email: user.email || '',
            phone: user.phoneNumber || null,
            photoURL: user.photoURL || null,
            role,
            provider: 'google.com',
            createdAt: new Date().toISOString()
          });

          // Sync to commerceStore for Admin Customers visibility
          commerceStore.addCustomer({
            name: uName,
            email: user.email || '',
            phone: user.phoneNumber || undefined,
            membershipTier: 'silver',
            loyaltyPoints: 100,
            totalOrders: 0,
            totalSpent: 0,
            city: 'الرياض',
            country: 'المملكة العربية السعودية',
            status: 'active',
          });
        }
      } catch (err) {
        console.warn('Could not sync user profile into Firestore:', err);
      }

      return mapFirebaseUser(user);
    } catch (err: any) {
      if (err.message === 'UNAUTHORIZED_EMAIL') {
        throw new Error('هذا الحساب غير مصرح له بالدخول كمالك أو مشرف للمنصة.');
      }
      if (err.code === 'auth/popup-closed-by-user') {
        throw new Error('تم إغلاق نافذة تسجيل الدخول بـ Google قبل إكمال العملية.');
      } else if (err.code === 'auth/popup-blocked') {
        throw new Error('تم حظر النافذة المنبثقة من قِبل المتصفح. يُرجى السماح بالنوافذ المنبثقة ثم المحاولة مجدداً.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        throw new Error('تم إلغاء طلب تسجيل الدخول.');
      }
      throw err;
    }
  },

  async register(payload: RegisterPayload): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, payload.email, payload.password);
      const user = userCredential.user;
      
      await updateProfile(user, { displayName: payload.name });
      const role = determineUserRole(payload.email);

      try {
        await setDoc(doc(db, 'users', user.uid), {
          name: payload.name,
          email: payload.email,
          phone: payload.phone || null,
          role,
          provider: 'password',
          createdAt: new Date().toISOString()
        });

        // Sync to commerceStore for Admin Customers visibility
        commerceStore.addCustomer({
          name: payload.name,
          email: payload.email,
          phone: payload.phone || undefined,
          membershipTier: 'silver',
          loyaltyPoints: 100,
          totalOrders: 0,
          totalSpent: 0,
          city: 'الرياض',
          country: 'المملكة العربية السعودية',
          status: 'active',
        });
      } catch (err) {
        console.warn('Could not save user profile to Firestore:', err);
      }
      
      return mapFirebaseUser(user);
    } catch (err: any) {
      // If Firebase Auth operation-not-allowed, register via backend API
      if (err.code === 'auth/operation-not-allowed') {
        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const data = await res.json();
          if (res.ok && data.success && data.data?.user) {
            const u = data.data.user;
            const role = determineUserRole(u.email, u.role);
            try {
              await setDoc(doc(db, 'users', String(u.id)), {
                id: u.id,
                name: u.name,
                email: u.email,
                role,
                provider: 'password',
                createdAt: new Date().toISOString()
              }, { merge: true });
            } catch (e) {}

            return {
              id: u.id,
              name: u.name,
              email: u.email,
              phone: u.phone,
              role,
              provider: 'password',
              created_at: u.created_at || new Date().toISOString()
            };
          }
        } catch (backendErr) {}
        throw new Error('التسجيل بالبريد غير مفعّل في Firebase. يرجى التسجيل فوراً بواسطة حساب Google بنقرة واحدة.');
      } else if (err.code === 'auth/email-already-in-use') {
        throw new Error('هذا البريد مسجل مسبقاً. يمكنك تسجيل الدخول أو المتابعة باستخدام Google.');
      } else if (err.code === 'auth/weak-password') {
        throw new Error('كلمة المرور ضعيفة. يجب ألا تقل عن 6 أحرف أو أرقام.');
      }
      throw err;
    }
  },

  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (e) {}
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
  },

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    await updatePassword(user, payload.newPassword);
  }
};
