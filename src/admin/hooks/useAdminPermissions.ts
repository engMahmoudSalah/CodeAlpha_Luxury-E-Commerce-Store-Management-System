import { useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import { UserRole } from '../types';

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: ['*'], // Full unrestricted access
  admin: [
    'products.*',
    'categories.*',
    'collections.*',
    'inventory.*',
    'orders.*',
    'returns.*',
    'customers.*',
    'reviews.*',
    'marketing.*',
    'cms.*',
    'media.*',
    'analytics.view',
    'settings.view',
    'settings.edit',
  ],
  inventory_manager: [
    'products.view',
    'products.edit',
    'inventory.*',
    'warehouses.*',
    'suppliers.*',
    'purchase_orders.*',
  ],
  orders_manager: [
    'orders.*',
    'returns.*',
    'customers.view',
    'shipping.view',
  ],
  customer_support: [
    'orders.view',
    'orders.notes',
    'returns.view',
    'returns.edit',
    'customers.view',
    'reviews.view',
    'reviews.edit',
    'qa.*',
  ],
  editor: [
    'cms.*',
    'media.*',
    'products.view',
    'categories.view',
    'reviews.view',
  ],
};

export function useAdminPermissions() {
  const { currentUser } = useAdmin();

  const userRole: UserRole = currentUser?.role || 'editor';

  const can = useMemo(() => {
    const permissions = ROLE_PERMISSIONS[userRole] || [];

    return (requiredPermission: string): boolean => {
      if (permissions.includes('*')) return true;
      if (permissions.includes(requiredPermission)) return true;

      // Check wildcards, e.g. 'products.*' covers 'products.create'
      const [module] = requiredPermission.split('.');
      if (permissions.includes(`${module}.*`)) return true;

      return false;
    };
  }, [userRole]);

  return {
    role: userRole,
    can,
    isSuperAdmin: userRole === 'super_admin',
    isAdmin: userRole === 'super_admin' || userRole === 'admin',
  };
}
