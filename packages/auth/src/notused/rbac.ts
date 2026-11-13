export type User_role = 'admin' | 'client' | 'manager';

export interface RoutePermission {
  path: string;
  allowedRoles: User_role[];
  exact?: boolean;
}

export const RoutePermissions: RoutePermission[] = [
  { path: '/admin', allowedRoles: ['admin', 'manager'] },
  { path: '/admin/settings', allowedRoles: ['admin'] },
  { path: '/account', allowedRoles: ['admin', 'client'] },
];

export function isUser_role(value: unknown): value is User_role {
  return value === 'admin' || value === 'client' || value === 'manager';
}

export function hasAccessToRoute(role: User_role, pathname: string): boolean {
  const match = RoutePermissions
    .filter((perm) =>
      perm.exact
        ? pathname === perm.path
        : pathname === perm.path || pathname.startsWith(perm.path + '/')
    )
  
    .sort((a, b) => b.path.length - a.path.length)[0];

   if (!match) return false;

  return match.allowedRoles.includes(role);
}