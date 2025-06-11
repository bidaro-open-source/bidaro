import { InitializeLot } from './Lot'
import { InitializeLotBet } from './LotBet'
import { InitializeLotStatus } from './LotStatus'
import { InitializePermission } from './Permission'
import { InitializeRole } from './Role'
import { InitializeUser } from './User'

/**
 * Collection of all models initializers.
 *
 * - `key` is a model name
 * - `value` is a function that initializes the model
 */
export const models = {
  Lot: InitializeLot,
  LotBet: InitializeLotBet,
  LotStatus: InitializeLotStatus,
  Permission: InitializePermission,
  Role: InitializeRole,
  User: InitializeUser,
} as const
