import { InitializePermissionFactroy } from './PermissionFactory'
import { InitializeRoleFactroy } from './RoleFactory'
import { InitializeUserFactroy } from './UserFactory'

export const factories = {
  PermissionFactory: InitializePermissionFactroy,
  RoleFactory: InitializeRoleFactroy,
  UserFactory: InitializeUserFactroy,
} as const
