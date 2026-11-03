export type UserRole = 'admin' | 'client' | 'manager';

export interface RoutePermission {
  path: string;
  allowedRoles: UserRole[];
  exact?: boolean;
}

export const RoutePermissions: RoutePermission[] = [
  {
    path: '/admin',
    allowedRoles: ['admin', 'manager'],
    exact: false,
  },
  {
    path: '/account',
    allowedRoles: ['admin', 'client'],
    exact: false,
  },

  {
    path: '/admin/settings',
    allowedRoles: ['admin'], 
    exact: false,
  },

];

export function hasAccessToRoute(role: UserRole, pathname: string): boolean {
  const matchedPermission = RoutePermissions.find((perm) =>
    perm.exact ? pathname === perm.path : pathname.startsWith(perm.path),
  );
  
  if (!matchedPermission) {
    return true;
  }

  return matchedPermission.allowedRoles.includes(role);
}
