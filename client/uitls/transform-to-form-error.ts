import type { FormError } from '@nuxt/ui'

export function transformToFormError(
  error: any,
): FormError[] {
  const array = []

  for (const key in error) {
    array.push({
      name: key,
      message: Array.isArray(error[key]) ? error[key][0] : error[key],
    })
  }

  return array
}
