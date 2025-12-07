import { describe, expect, it } from 'vitest'
import { AppError } from '~/server/classes/app-error'
import { errors } from '~/server/errors'

describe('AppError', () => {
  it('should create an error with code and basic properties', () => {
    const error = new AppError('USER_NOT_FOUND')

    expect(error.code).toBe('USER_NOT_FOUND')
    expect(error.statusCode).toBe(404)
    expect(error.title).toBe('Користувача не знайдено')
    expect(error.description).toBe('Користувач з вказаним ідентифікатором не існує в системі.')
    expect(error.details).toBeUndefined()
  })

  it('should create an error with details', () => {
    const error = new AppError('USER_NOT_FOUND', { userId: 123 })

    expect(error.code).toBe('USER_NOT_FOUND')
    expect(error.statusCode).toBe(404)
    expect(error.details).toEqual({ userId: 123 })
  })

  it('should create validation error with field errors', () => {
    const error = new AppError('VALIDATION_ERROR', {
      fieldErrors: {
        email: ['Invalid email format'],
        password: ['Password too short'],
      },
    })

    expect(error.code).toBe('VALIDATION_ERROR')
    expect(error.statusCode).toBe(422)
    expect(error.details).toEqual({
      fieldErrors: {
        email: ['Invalid email format'],
        password: ['Password too short'],
      },
    })
  })

  it('should have proper JSON representation', () => {
    const error = new AppError('CATEGORY_NOT_FOUND', { categoryId: 456 })
    const json = error.toJSON()

    expect(json).toEqual({
      code: 'CATEGORY_NOT_FOUND',
      title: 'Категорію не знайдено',
      description: 'Категорія з вказаним ідентифікатором не існує в системі.',
      details: { categoryId: 456 },
    })
  })

  it('should create internal server error', () => {
    const error = new AppError('INTERNAL_SERVER_ERROR')

    expect(error.statusCode).toBe(500)
    expect(error.code).toBe('INTERNAL_SERVER_ERROR')
  })

  it('should be instance of Error', () => {
    const error = new AppError('NOT_FOUND')

    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(AppError)
  })
})

describe('errors constant', () => {
  it('should have all required universal errors', () => {
    expect(errors.INTERNAL_SERVER_ERROR).toBeDefined()
    expect(errors.VALIDATION_ERROR).toBeDefined()
    expect(errors.PAYLOAD_TOO_LARGE).toBeDefined()
    expect(errors.UNSUPPORTED_MEDIA_TYPE).toBeDefined()
    expect(errors.UNAUTHORIZED).toBeDefined()
    expect(errors.FORBIDDEN).toBeDefined()

    expect(errors.INTERNAL_SERVER_ERROR.statusCode).toBe(500)
    expect(errors.VALIDATION_ERROR.statusCode).toBe(422)
    expect(errors.PAYLOAD_TOO_LARGE.statusCode).toBe(413)
    expect(errors.UNSUPPORTED_MEDIA_TYPE.statusCode).toBe(415)
    expect(errors.UNAUTHORIZED.statusCode).toBe(401)
    expect(errors.FORBIDDEN.statusCode).toBe(403)
  })

  it('should have proper structure for all errors', () => {
    Object.entries(errors).forEach(([_key, errorDef]) => {
      expect(errorDef.statusCode).toBeGreaterThan(0)
      expect(errorDef.title).toBeTruthy()
      expect(errorDef.description).toBeTruthy()
      // detailsSchema is optional
    })
  })
})
