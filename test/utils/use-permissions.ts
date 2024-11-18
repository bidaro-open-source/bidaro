import { Op } from 'sequelize'
import { permissions as originalPermissions } from '~/server/constants'

type PermissionKeys = keyof typeof originalPermissions

type PermissionNames = (typeof originalPermissions)[PermissionKeys]

type MappedPermissions = {
  -readonly [K in PermissionNames]: number
}

type MappedPermissionsId = {
  -readonly [K in PermissionKeys]: number
}

interface UsePermissionsResult {
  permissions: PermissionNames[]
  mappedPermissions: MappedPermissions
  mappedPermissionsId: MappedPermissionsId
}

let cache: UsePermissionsResult | undefined

export async function usePermissions(): Promise<UsePermissionsResult> {
  if (cache)
    return cache

  const permissions = Object.values(originalPermissions)
  const mappedPermissions: Partial<MappedPermissions> = {}
  const mappedPermissionsId: Partial<MappedPermissionsId> = {}

  const records = await db.Permission.findAll({
    where: {
      name: {
        [Op.in]: Object.values(permissions),
      },
    },
  })

  for (const record of records) {
    mappedPermissions[record.name as PermissionNames] = record.id
  }

  for (const key in originalPermissions) {
    const name = originalPermissions[key as PermissionKeys]

    const id = mappedPermissions[name]

    if (!id) {
      throw new Error(`Permission with id "${id}" not found.`
        + `Permission name is "${name}", key is "${key}"`,
      )
    }

    mappedPermissionsId[key as PermissionKeys] = id
  }

  cache = {
    permissions,
    mappedPermissions,
    mappedPermissionsId,
  } as UsePermissionsResult

  return cache
}
