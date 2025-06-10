import { InitializeLot } from './Lot'
import { InitializeLotBet } from './LotBet'
import { InitializeLotStatus } from './LotStatus'
import { InitializePermission } from './Permission'
import { InitializeRole } from './Role'
import { InitializeUser } from './User'

export const models = {
  Permission: InitializePermission,
  Role: InitializeRole,
  User: InitializeUser,
  LotStatus: InitializeLotStatus,
  LotBet: InitializeLotBet,
  Lot: InitializeLot,
} as const
