import type { Seeder } from '../console/seeder-cli'
import { permissions, roles } from '~~/server/constants'

export const up: Seeder = async ({ context }) => {
  const view_own_sessions = await context.PermissionFactory.new().create({
    name: permissions.VIEW_OWN_SESSIONS,
  })

  const delete_own_sessions = await context.PermissionFactory.new().create({
    name: permissions.DELETE_OWN_SESSIONS,
  })

  const user = await context.RoleFactory.new().create({
    name: roles.USER,
    displayName: 'Користувач',
    description: 'Роль за замовчуванням',
  })

  user.addPermissions([
    view_own_sessions,
    delete_own_sessions,
  ])
}
