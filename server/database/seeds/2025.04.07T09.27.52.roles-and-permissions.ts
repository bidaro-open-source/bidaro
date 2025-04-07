import type { Seeder } from '.'
import { permissions, roles } from '~/server/constants'

export const up: Seeder = async ({ context }) => {
  const view_all_roles = await context.PermissionFactory.new().create({
    name: permissions.VIEW_ALL_ROLES,
    displayName: 'Переглядати всі ролі',
    description: 'Дозволяє переглядати ролі системи',
  })

  const view_all_permissions = await context.PermissionFactory.new().create({
    name: permissions.VIEW_ALL_PERMISSIONS,
  })

  const view_all_sessions = await context.PermissionFactory.new().create({
    name: permissions.VIEW_ALL_SESSIONS,
  })

  const view_own_sessions = await context.PermissionFactory.new().create({
    name: permissions.VIEW_OWN_SESSIONS,
  })

  const delete_all_sessions = await context.PermissionFactory.new().create({
    name: permissions.DELETE_ALL_SESSIONS,
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

  const superuser = await context.RoleFactory.new().create({
    name: roles.SUPERUSER,
    displayName: 'Супер користувач',
  })

  superuser.addPermissions([
    view_all_roles,
    view_all_permissions,
    view_all_sessions,
    view_own_sessions,
    delete_all_sessions,
    delete_own_sessions,
  ])
}
