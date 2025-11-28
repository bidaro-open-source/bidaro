export const roles = {
  USER: 'user',
} as const

export const permissions = {
  CLEAR_CACHE: 'clear_cache',

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

  VIEW_USERS: 'view_users',
  CREATE_USER: 'create_user',
  VERIFY_USER: 'verify_user',
  UPDATE_USER_ROLE: 'update_user_role',
  DELETE_USER: 'delete_user',

  VIEW_LOTS: 'view_lots',
  CREATE_LOT: 'create_lot',
  UPDATE_LOT: 'update_lot',
  DELETE_LOT: 'delete_lot',
  PUBLISH_LOT: 'publish_lot',
  CLOSE_LOT: 'close_lot',
  SHIP_LOT: 'ship_lot',
  RECEIVE_LOT: 'receive_lot',

  CREATE_LOT_BET: 'create_lot_bet',

  VIEW_LOT_IMAGES: 'view_lot_images',
  UPLOAD_LOT_IMAGE: 'upload_lot_image',
  DELETE_LOT_IMAGE: 'delete_lot_image',
  UPDATE_LOT_IMAGE_ORDER: 'update_lot_image_order',
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

export const actionLimits = {
  CREATE_LOT: 6,
  CREATE_LOT_BET: 30,
  EMAIL_VERIFICATION_REQUEST: 3,
  UPDATE_EMAIL: 3,
  UPDATE_PASSWORD: 3,
} as const

export const IMAGE_PER_LOT_LIMIT = 10
