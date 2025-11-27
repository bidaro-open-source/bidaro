import type {
  Database,
  Permission,
  PermissionAttributes,
  PermissionAttributesOptional,
} from '#database'
import { Factory } from '../class/Factory'

type PartialAttributes = Partial<PermissionAttributes>
type CreationAttributes = PermissionAttributesOptional

export class PermissionFactory extends Factory<Permission> {
  protected definition(attr: PartialAttributes = {}): CreationAttributes {
    const permission = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)

    return {
      name: attr.name ?? `p${permission}`,
      displayName: attr.displayName ?? null,
      description: attr.description ?? null,
    }
  }
}

export function InitializePermissionFactroy(
  database: Database,
): typeof PermissionFactory {
  PermissionFactory.init(database.Permission)
  return PermissionFactory
}
