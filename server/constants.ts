export const roles = {
  USER: 'user',
} as const

export const permissions = {
  VIEW_OWN_SESSIONS: 'view_own_sessions',
  DELETE_OWN_SESSIONS: 'delete_own_sessions',
} as const

export const lotStatuses = {
  DRAFT: 'draft',
  IN_TRADING_PROCESS: 'in_trading_process',
  IN_DISCUSSION_PROCESS: 'in_discussion_process',
  IN_DELIVERY_PROCESS: 'in_delivery_process',
  RECEIVED: 'received',
  REJECTED: 'rejected',
} as const
