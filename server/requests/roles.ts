import { z } from 'zod'
import {
  descriptionSchema,
  displayNameSchema,
  nameSchema,
} from '../zod/models/role'

export const paramsSchema = z.object({
  name: nameSchema,
})

export type GetRoleRequest = Awaited<ReturnType<typeof getRoleRequest>>

export async function getRoleRequest(event: H3Event) {
  return {
    params: await getValidatedRouterParams(event, paramsSchema.parse),
  }
}

export const createBodySchema = z.object({
  name: nameSchema,
  displayName: displayNameSchema,
  description: descriptionSchema,
})

export type CreateRoleRequest = Awaited<ReturnType<typeof createRoleRequest>>

export async function createRoleRequest(event: H3Event) {
  return {
    body: await readValidatedBody(event, createBodySchema.parse),
  }
}

export const updateBodySchema = z.object({
  displayName: displayNameSchema,
  description: descriptionSchema,
})

export type UpdateRoleRequest = Awaited<ReturnType<typeof updateRoleRequest>>

export async function updateRoleRequest(event: H3Event) {
  return {
    body: await readValidatedBody(event, updateBodySchema.parse),
    params: await getValidatedRouterParams(event, paramsSchema.parse),
  }
}

export const updatePermissionBodySchema = z.object({
  permissions: z.array(nameSchema),
})

export type UpdateRolePermissionRequest = Awaited<
  ReturnType<typeof updateRolePermissionRequest>
>

export async function updateRolePermissionRequest(event: H3Event) {
  return {
    body: await readValidatedBody(event, updatePermissionBodySchema.parse),
    params: await getValidatedRouterParams(event, paramsSchema.parse),
  }
}

export const deleteBodySchema = z.object({
  replace: z.string().optional(),
})

export type DeleteRoleRequest = Awaited<ReturnType<typeof deleteRoleRequest>>

export async function deleteRoleRequest(event: H3Event) {
  return {
    body: await readValidatedBody(event, deleteBodySchema.parse),
    params: await getValidatedRouterParams(event, paramsSchema.parse),
  }
}
