import { z } from 'zod'

/**
 * Type representing valid error codes
 */
export type ErrorCode = keyof typeof errors

/**
 * Helper type to extract the Zod output type from the error definition.
 * If no schema is provided, it returns void (no details required).
 */
export type ErrorDetails<T extends ErrorCode>
  = (typeof errors)[T] extends { detailsSchema: infer S }
    ? S extends z.ZodType<any>
      ? z.infer<S>
      : void
    : void

/**
 * Error definition structure
 */
export interface ErrorDefinition {
  statusCode: number
  message: string
  description: string
  detailsSchema?: z.ZodType<any>
}

/**
 * System error definitions
 * Each error key represents a specific error condition with standardized response
 */
export const errors = {
  INTERNAL_SERVER_ERROR: {
    statusCode: 500,
    message: 'Внутрішня помилка сервера',
    description: 'Виникла непередбачена помилка на сервері. Спробуйте пізніше або зв\'яжіться з підтримкою.',
  },
  UNAUTHORIZED: {
    statusCode: 401,
    message: 'Не авторизовано',
    description: 'Для виконання цієї дії необхідно бути авторизованим в системі.',
  },
  FORBIDDEN: {
    statusCode: 403,
    message: 'Доступ заборонено',
    description: 'У вас немає прав для виконання цієї дії.',
  },
  PAYLOAD_TOO_LARGE: {
    statusCode: 413,
    message: 'Занадто великий розмір даних',
    description: 'Розмір переданих даних перевищує допустиме обмеження.',
    detailsSchema: z.object({
      field: z.string().optional(),
      filename: z.string().optional(),
    }),
  },
  UNSUPPORTED_MEDIA_TYPE: {
    statusCode: 415,
    message: 'Непідтримуваний тип медіа',
    description: 'Тип файлу або content-type не підтримується системою.',
    detailsSchema: z.object({
      contentType: z.string().optional(),
      mimeType: z.string().optional(),
    }),
  },
  VALIDATION_ERROR: {
    statusCode: 422,
    message: 'Помилка валідації',
    description: 'Дані запиту не відповідають очікуваному формату. Перевірте правильність введених даних.',
    detailsSchema: z.object({
      fieldErrors: z.record(z.string(), z.array(z.string())).optional(),
      formErrors: z.array(z.string()).optional(),
    }),
  },
  TOO_MANY_REQUESTS: {
    statusCode: 429,
    message: 'Занадто багато запитів',
    description: 'Ліміт запитів перевищено. Будь ласка, спробуйте пізніше.',
  },
  TOO_MANY_REQUESTS_ANONYMOUS: {
    statusCode: 429,
    message: 'Занадто багато запитів',
    description: 'Ліміт запитів для неавторизованих користувачів перевищено. Будь ласка, увійдіть в систему або спробуйте пізніше.',
  },
  ACTION_LIMIT_EXCEEDED: {
    statusCode: 429,
    message: 'Ліміт дій перевищено',
    description: 'Ліміт дій перевищено. Будь ласка, спробуйте пізніше.',
    detailsSchema: z.object({
      action: z.string().optional(),
      limit: z.number().optional(),
    }),
  },
  FEATURE_DISABLED: {
    statusCode: 403,
    message: 'Функція вимкнена',
    description: 'Ця функція наразі вимкнена в системі.',
    detailsSchema: z.object({
      feature: z.string(),
    }),
  },

  INVALID_AUTHORIZATION_METHOD: {
    statusCode: 401,
    message: 'Невалідний метод авторизації',
    description: 'Метод авторизації не дозволений. Використовуйте Bearer токен.',
  },
  INVALID_ACCESS_TOKEN: {
    statusCode: 401,
    message: 'Невалідний токен доступу',
    description: 'Токен авторизації недійсний, прострочений або був відкликаний.',
  },
  AUTHENTICATION_REQUIRED: {
    statusCode: 401,
    message: 'Потрібна авторизація',
    description: 'Для виконання цієї дії необхідно бути авторизованим в системі.',
  },

  USER_NOT_FOUND: {
    statusCode: 404,
    message: 'Користувача не знайдено',
    description: 'Користувач з вказаним ідентифікатором не існує в системі.',
    detailsSchema: z.object({
      id: z.number().optional(),
    }),
  },
  ACCOUNT_NOT_FOUND: {
    statusCode: 404,
    message: 'Акаунт не знайдено',
    description: 'Акаунт з вказаним іменем користувача не знайдено в системі.',
    detailsSchema: z.object({
      username: z.string().optional(),
    }),
  },
  INVALID_PASSWORD: {
    statusCode: 400,
    message: 'Невірний пароль',
    description: 'Введений пароль не співпадає з паролем користувача.',
  },

  REFRESH_TOKEN_NOT_FOUND: {
    statusCode: 404,
    message: 'Токен оновлення не знайдено',
    description: 'Токен оновлення не існує або був відкликаний.',
  },
  REFRESH_TOKEN_ACCESS_DENIED: {
    statusCode: 403,
    message: 'Доступ до токену заборонено',
    description: 'Немає доступу до цього токену оновлення.',
  },

  CATEGORY_NOT_FOUND: {
    statusCode: 404,
    message: 'Категорію не знайдено',
    description: 'Категорія з вказаним ідентифікатором не існує в системі.',
    detailsSchema: z.object({
      id: z.number().optional(),
      slug: z.string().optional(),
    }),
  },
  CATEGORY_SLUG_TAKEN: {
    statusCode: 409,
    message: 'Слаг вже зайнятий',
    description: 'Категорія з таким слагом вже існує. Оберіть інший слаг.',
    detailsSchema: z.object({
      slug: z.string().optional(),
    }),
  },
  CATEGORY_PARENT_NOT_FOUND: {
    statusCode: 404,
    message: 'Батьківську категорію не знайдено',
    description: 'Батьківська категорія не існує в системі.',
    detailsSchema: z.object({
      parentId: z.number().optional(),
    }),
  },
  CATEGORY_MODIFIED_OR_DELETED: {
    statusCode: 409,
    message: 'Категорія була змінена',
    description: 'Категорія була змінена або видалена іншим користувачем. Оновіть дані та спробуйте знову.',
  },
  CATEGORY_HAS_CHILDREN: {
    statusCode: 409,
    message: 'Категорія має підкатегорії',
    description: 'Неможливо виконати операцію, оскільки категорія має підкатегорії.',
    detailsSchema: z.object({
      childrenCount: z.number(),
    }),
  },
  CATEGORY_HAS_LOTS: {
    statusCode: 409,
    message: 'Категорія має лоти',
    description: 'Неможливо видалити категорію, оскільки вона має асоційовані лоти.',
    detailsSchema: z.object({
      lotsCount: z.number(),
    }),
  },
  CATEGORY_PARENT_LOOP: {
    statusCode: 400,
    message: 'Циклічна залежність категорій',
    description: 'Неможливо встановити батьківську категорію, оскільки це створить циклічну залежність.',
    detailsSchema: z.object({
      categoryId: z.number().optional(),
      parentId: z.number().optional(),
    }),
  },

  INVALID_IMAGE_BUFFER: {
    statusCode: 422,
    message: 'Невалідний буфер зображення',
    description: 'Переданий буфер зображення невалідний або пошкоджений.',
    detailsSchema: z.object({
      message: z.string().optional(),
    }),
  },

  ROLE_NOT_FOUND: {
    statusCode: 404,
    message: 'Роль не знайдено',
    description: 'Роль з вказаним іменем не існує в системі.',
    detailsSchema: z.object({
      name: z.string().optional(),
    }),
  },
  ROLE_NAME_TAKEN: {
    statusCode: 409,
    message: 'Ім\'я ролі вже зайняте',
    description: 'Роль з таким іменем вже існує в системі.',
    detailsSchema: z.object({
      name: z.string().optional(),
    }),
  },
  ROLE_HAS_USERS: {
    statusCode: 409,
    message: 'Роль має користувачів',
    description: 'Неможливо видалити роль, оскільки вона призначена користувачам.',
    detailsSchema: z.object({
      usersCount: z.number().optional(),
    }),
  },
  ROLE_IS_RESERVED: {
    statusCode: 409,
    message: 'Зарезервована роль',
    description: 'Неможливо змінювати або видаляти зарезервовану системну роль.',
  },

  PERMISSION_NOT_FOUND: {
    statusCode: 404,
    message: 'Право не знайдено',
    description: 'Право з вказаним іменем не існує в системі.',
    detailsSchema: z.object({
      name: z.string().optional(),
    }),
  },
  PERMISSIONS_NOT_FOUND: {
    statusCode: 404,
    message: 'Права не знайдено',
    description: 'Одне або більше прав не знайдено в системі.',
    detailsSchema: z.object({
      missingPermissions: z.array(z.string()).optional(),
    }),
  },

  LOT_NOT_FOUND: {
    statusCode: 404,
    message: 'Лот не знайдено',
    description: 'Лот з вказаним ідентифікатором не існує в системі.',
    detailsSchema: z.object({
      id: z.number().optional(),
    }),
  },
  LOT_INVALID_STATUS: {
    statusCode: 400,
    message: 'Невалідний статус лоту',
    description: 'Операція неможлива для лоту з поточним статусом.',
    detailsSchema: z.object({
      currentStatus: z.string().optional(),
      requiredStatus: z.string().optional(),
    }),
  },
  LOT_NOT_EXPIRED: {
    statusCode: 400,
    message: 'Лот ще не завершено',
    description: 'Лот не може бути закритий до досягнення дати завершення.',
    detailsSchema: z.object({
      currentDate: z.string().optional(),
      expirationDate: z.string().nullable().optional(),
    }),
  },
  LOT_CATEGORY_NOT_SET: {
    statusCode: 400,
    message: 'Категорія лоту не встановлена',
    description: 'Лот повинен мати встановлену категорію перед публікацією.',
  },
  LOT_IMAGE_LIMIT_REACHED: {
    statusCode: 400,
    message: 'Ліміт зображень досягнуто',
    description: 'Досягнуто максимальну кількість зображень для лоту',
    detailsSchema: z.object({
      maxImages: z.number().optional(),
    }),
  },
  LOT_IMAGE_ORDER_INVALID: {
    statusCode: 400,
    message: 'Невалідний порядок зображень',
    description: 'Передано невалідний список ідентифікаторів зображень. Список має містити всі зображення лоту без зайвих або відсутніх ідентифікаторів.',
    detailsSchema: z.object({
      extraIds: z.array(z.number()).optional(),
      missingIds: z.array(z.number()).optional(),
    }),
  },
  LOT_BET_TOO_LOW: {
    statusCode: 400,
    message: 'Ставка занадто низька',
    description: 'Ставка повинна бути вищою за поточну ціну лоту.',
    detailsSchema: z.object({
      lotPrice: z.number().optional(),
      betAmount: z.number().optional(),
    }),
  },
  LOT_BET_OWNER_IS_SELLER: {
    statusCode: 400,
    message: 'Продавець не може робити ставки на свій лот',
    description: 'Користувач не може робити ставки на лоти, які він продає.',
    detailsSchema: z.object({
      userId: z.number().optional(),
      sellerId: z.number().optional(),
    }),
  },

  MISSING_CONTENT_TYPE: {
    statusCode: 400,
    message: 'Відсутній заголовок Content-Type',
    description: 'Запит повинен містити заголовок Content-Type.',
  },
  INVALID_MULTIPART_DATA: {
    statusCode: 400,
    message: 'Невалідні multipart дані',
    description: 'Помилка при розборі multipart даних. Перевірте формат запиту.',
    detailsSchema: z.object({
      error: z.string().optional(),
    }),
  },
  FIELD_NAME_TOO_LONG: {
    statusCode: 413,
    message: 'Ім\'я поля занадто довге',
    description: 'Ім\'я поля перевищує допустиму довжину.',
    detailsSchema: z.object({
      field: z.string().optional(),
    }),
  },

  INVALID_CHALLENGE_SOLUTION: {
    statusCode: 400,
    message: 'Невірне рішення капчі',
    description: 'Рішення капчі не вірне або прострочене.',
  },

  VERIFICATION_TOKEN_NOT_FOUND: {
    statusCode: 404,
    message: 'Токен верифікації не знайдено',
    description: 'Токен верифікації не існує або прострочений.',
  },
  RECOVERY_TOKEN_NOT_FOUND: {
    statusCode: 404,
    message: 'Токен відновлення не знайдено',
    description: 'Токен відновлення пароля не існує або прострочений.',
  },
  EMAIL_NOT_FOUND: {
    statusCode: 404,
    message: 'Email не знайдено',
    description: 'Користувача з такою адресою електронної пошти не знайдено.',
  },
} as const satisfies Record<string, ErrorDefinition>
