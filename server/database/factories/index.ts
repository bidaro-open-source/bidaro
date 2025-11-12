import { InitializeCategoryFactroy } from './CategoryFactory'
import { InitializeImageFactroy } from './ImageFactory'
import { InitializeLotBetFactroy } from './LotBetFactory'
import { InitializeLotFactroy } from './LotFactory'
import { InitializePermissionFactroy } from './PermissionFactory'
import { InitializeRoleFactroy } from './RoleFactory'
import { InitializeUserFactroy } from './UserFactory'

export const factories = {
  CategoryFactory: InitializeCategoryFactroy,
  ImageFactory: InitializeImageFactroy,
  LotBetFactory: InitializeLotBetFactroy,
  LotFactory: InitializeLotFactroy,
  PermissionFactory: InitializePermissionFactroy,
  RoleFactory: InitializeRoleFactroy,
  UserFactory: InitializeUserFactroy,
} as const
