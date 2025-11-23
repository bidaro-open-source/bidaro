export const roles = {
  USER: 'user',
} as const

export const permissions = {
  VIEW_PERMISSIONS: 'view_permissions',
  UPDATE_PERMISSIONS: 'update_permissions',

  UPDATE_OWN_PROFILE: 'update_own_profile',
  UPDATE_OWN_EMAIL: 'update_own_email',
  UPDATE_OWN_PASSWORD: 'update_own_password',

  VIEW_OWN_SESSIONS: 'view_own_sessions',
  DELETE_OWN_SESSIONS: 'delete_own_sessions',
  CREATE_CATEGORY: 'create_category',
  UPDATE_CATEGORY: 'update_category',
  DELETE_CATEGORY: 'delete_category',
  VIEW_CATEGORY_COUNT: 'view_category_count',
  UPDATE_CATEGORY_SLUG: 'update_category_slug',
  UPDATE_CATEGORY_PARENT: 'update_category_parent',

  VIEW_ROLES: 'view_roles',
  CREATE_ROLE: 'create_role',
  UPDATE_ROLE: 'update_role',
  DELETE_ROLE: 'delete_role',
  VIEW_ROLE_PERMISSIONS: 'view_role_permissions',
  UPDATE_ROLE_PERMISSIONS: 'update_role_permissions',
} as const

export const lotStatuses = {
  DRAFT: 'draft',
  IN_TRADING_PROCESS: 'in_trading_process',
  IN_DISCUSSION_PROCESS: 'in_discussion_process',
  IN_DELIVERY_PROCESS: 'in_delivery_process',
  RECEIVED: 'received',
  REJECTED: 'rejected',
} as const

export const lotInitialDurations = {
  ONE_HOUR: '1_hour',
  ONE_DAY: '1_day',
  THREE_DAYS: '3_days',
  SEVEN_DAYS: '7_days',
} as const

export const lotInitialDurationsInMs: Record<string, number> = {
  [lotInitialDurations.ONE_HOUR]: 60 * 60 * 1000,
  [lotInitialDurations.ONE_DAY]: 24 * 60 * 60 * 1000,
  [lotInitialDurations.THREE_DAYS]: 3 * 24 * 60 * 60 * 1000,
  [lotInitialDurations.SEVEN_DAYS]: 7 * 24 * 60 * 60 * 1000,
} as const
