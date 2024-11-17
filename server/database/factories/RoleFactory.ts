import { Factory } from '../class/Factory'
import type {
  Role,
  RoleAttributes,
  RoleAttributesOptional,
  RoleModel,
} from '~/server/database'

type PartialAttributes = Partial<RoleAttributes>
type CreationAttributes = RoleAttributesOptional

export class RoleFactory extends Factory<Role> {
  protected definition(attr: PartialAttributes = {}): CreationAttributes {
    const role = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)

    return {
      name: attr.name ?? `#${role}`,
    }
  }
}

export function InitializeRoleFactroy(model: RoleModel): typeof RoleFactory {
  RoleFactory.init(model)
  return RoleFactory
}
