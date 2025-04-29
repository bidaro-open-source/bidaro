import { InitializePermission } from './Permission'
import { InitializeRole } from './Role'
import { InitializeUser } from './User'

export const models = {
  Permission: InitializePermission,
  Role: InitializeRole,
  User: InitializeUser,
} as const
