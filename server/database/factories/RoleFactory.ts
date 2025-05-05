import type {
  Database,
  Role,
  RoleAttributes,
  RoleAttributesOptional,
} from '~~/server/database'
import { Factory } from '../class/Factory'

type PartialAttributes = Partial<RoleAttributes>
type CreationAttributes = RoleAttributesOptional

export class RoleFactory extends Factory<Role> {
  protected definition(attr: PartialAttributes = {}): CreationAttributes {
    const role = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)

    return {
      name: attr.name ?? `r${role}`,
      displayName: attr.displayName ?? null,
      description: attr.description ?? null,
    }
  }
}

export function InitializeRoleFactroy(database: Database) {
  RoleFactory.init(database.Role)
  return RoleFactory
}
