export type UserRole = 'admin' | 'client' | 'guest';

export interface RoutePermission {
  path: string;
  allowedRoles: UserRole[];
  exact?: boolean;
}

export const RoutePermissions: RoutePermission[] = [
  {
    path: '/admin',
    allowedRoles: ['admin'],
    exact: false,
  },
  {
    path: '/account',
    allowedRoles: ['admin', 'client'],
    exact: false,
  },
];

export function hasAccessToRoute(role: UserRole, pathname: string): boolean {
  const matchedPermission = RoutePermissions.find((perm) =>
    perm.exact ? pathname === perm.path : pathname.startsWith(perm.path),
  );

  // Si la route n'est pas explicitement protégée, l'accès est public
  if (!matchedPermission) {
    return true;
  }

  return matchedPermission.allowedRoles.includes(role);
}
