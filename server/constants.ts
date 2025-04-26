export const roles = {
  USER: 'user',
  SUPERUSER: 'superuser',
} as const

export const permissions = {
  VIEW_ALL_PERMISSIONS: 'view_all_permissions',
  ASSIGN_PERMISSION: 'assign_permission',
  VIEW_ALL_ROLES: 'view_all_roles',
  CREATE_ROLE: 'create_role',
  UPDATE_ROLE: 'update_role',
  DELETE_ROLE: 'delete_role',
  VIEW_ALL_SESSIONS: 'view_all_sessions',
  VIEW_OWN_SESSIONS: 'view_own_sessions',
  DELETE_ALL_SESSIONS: 'delete_all_sessions',
  DELETE_OWN_SESSIONS: 'delete_own_sessions',
} as const
