import { z } from 'zod'

/**
 * Error definition structure
 */
export interface ErrorDefinition {
  /**
   * HTTP status code to return
   */
  statusCode: number
  /**
   * Error title in Ukrainian
   */
  title: string
  /**
   * Detailed description of the error and reasons for its occurrence in Ukrainian
   */
  description: string
  /**
   * Zod schema for additional details that can be returned with the error
   */
  detailsSchema?: z.ZodType<any>
}

/**
 * System error definitions
 * Each error key represents a specific error condition with standardized response
 */
export const errors = {
  // Universal HTTP errors
  INTERNAL_SERVER_ERROR: {
    statusCode: 500,
    title: 'Внутрішня помилка сервера',
    description: 'Виникла непередбачена помилка на сервері. Спробуйте пізніше або зв\'яжіться з підтримкою.',
  },
  VALIDATION_ERROR: {
    statusCode: 422,
    title: 'Помилка валідації',
    description: 'Дані запиту не відповідають очікуваному формату. Перевірте правильність введених даних.',
    detailsSchema: z.object({
      fieldErrors: z.record(z.array(z.string())).optional(),
      formErrors: z.array(z.string()).optional(),
    }),
  },
  PAYLOAD_TOO_LARGE: {
    statusCode: 413,
    title: 'Занадто великий розмір даних',
    description: 'Розмір переданих даних перевищує допустиме обмеження.',
    detailsSchema: z.object({
      field: z.string().optional(),
      filename: z.string().optional(),
    }),
  },
  UNSUPPORTED_MEDIA_TYPE: {
    statusCode: 415,
    title: 'Непідтримуваний тип медіа',
    description: 'Тип файлу або content-type не підтримується системою.',
    detailsSchema: z.object({
      contentType: z.string().optional(),
      mimeType: z.string().optional(),
    }),
  },
  UNAUTHORIZED: {
    statusCode: 401,
    title: 'Не авторизовано',
    description: 'Для виконання цієї дії необхідно бути авторизованим в системі.',
  },
  FORBIDDEN: {
    statusCode: 403,
    title: 'Доступ заборонено',
    description: 'У вас немає прав для виконання цієї дії.',
  },

  // Authentication errors
  INVALID_AUTHORIZATION_METHOD: {
    statusCode: 401,
    title: 'Невалідний метод авторизації',
    description: 'Метод авторизації не дозволений. Використовуйте Bearer токен.',
  },
  INVALID_ACCESS_TOKEN: {
    statusCode: 401,
    title: 'Невалідний токен доступу',
    description: 'Токен авторизації недійсний, прострочений або був відкликаний. Увійдіть в систему знову.',
  },
  AUTHENTICATION_REQUIRED: {
    statusCode: 401,
    title: 'Потрібна авторизація',
    description: 'Для виконання цієї дії необхідно бути авторизованим в системі.',
  },

  // User errors
  USER_NOT_FOUND: {
    statusCode: 404,
    title: 'Користувача не знайдено',
    description: 'Користувач з вказаним ідентифікатором не існує в системі.',
    detailsSchema: z.object({
      userId: z.number().optional(),
    }),
  },
  ACCOUNT_NOT_FOUND: {
    statusCode: 404,
    title: 'Акаунт не знайдено',
    description: 'Акаунт з вказаним іменем користувача не знайдено в системі.',
    detailsSchema: z.object({
      username: z.string().optional(),
    }),
  },
  INVALID_PASSWORD: {
    statusCode: 422,
    title: 'Невірний пароль',
    description: 'Введений пароль не співпадає з паролем користувача.',
  },

  // Session/Token errors
  REFRESH_TOKEN_NOT_FOUND: {
    statusCode: 404,
    title: 'Токен оновлення не знайдено',
    description: 'Токен оновлення не існує або був відкликаний.',
  },
  REFRESH_TOKEN_ACCESS_DENIED: {
    statusCode: 403,
    title: 'Доступ до токену заборонено',
    description: 'Немає доступу до цього токену оновлення.',
  },

  // Category errors
  CATEGORY_NOT_FOUND: {
    statusCode: 404,
    title: 'Категорію не знайдено',
    description: 'Категорія з вказаним ідентифікатором не існує в системі.',
    detailsSchema: z.object({
      categoryId: z.number().optional(),
    }),
  },
  CATEGORY_SLUG_TAKEN: {
    statusCode: 422,
    title: 'Слаг вже зайнятий',
    description: 'Категорія з таким слагом вже існує. Оберіть інший слаг.',
    detailsSchema: z.object({
      slug: z.string().optional(),
    }),
  },
  PARENT_CATEGORY_NOT_FOUND: {
    statusCode: 422,
    title: 'Батьківську категорію не знайдено',
    description: 'Батьківська категорія не існує в системі.',
    detailsSchema: z.object({
      parentId: z.number().optional(),
    }),
  },
  CATEGORY_MODIFIED_OR_DELETED: {
    statusCode: 409,
    title: 'Категорія була змінена',
    description: 'Категорія була змінена або видалена іншим користувачем. Оновіть дані та спробуйте знову.',
  },
  CATEGORY_HAS_CHILDREN: {
    statusCode: 400,
    title: 'Категорія має підкатегорії',
    description: 'Неможливо виконати операцію, оскільки категорія має підкатегорії.',
  },
  CATEGORY_PARENT_LOOP: {
    statusCode: 400,
    title: 'Циклічна залежність категорій',
    description: 'Неможливо встановити батьківську категорію, оскільки це створить циклічну залежність.',
  },

  // Role errors
  ROLE_NOT_FOUND: {
    statusCode: 404,
    title: 'Роль не знайдено',
    description: 'Роль з вказаним іменем не існує в системі.',
    detailsSchema: z.object({
      roleName: z.string().optional(),
    }),
  },
  ROLE_NAME_TAKEN: {
    statusCode: 422,
    title: 'Ім\'я ролі вже зайняте',
    description: 'Роль з таким іменем вже існує в системі.',
    detailsSchema: z.object({
      roleName: z.string().optional(),
    }),
  },
  ROLE_HAS_USERS: {
    statusCode: 400,
    title: 'Роль має користувачів',
    description: 'Неможливо видалити роль, оскільки вона призначена користувачам.',
  },
  DEFAULT_ROLE_NOT_FOUND: {
    statusCode: 500,
    title: 'Роль за замовчуванням не знайдено',
    description: 'Системна роль за замовчуванням не налаштована. Зверніться до адміністратора.',
  },

  // Permission errors
  PERMISSION_NOT_FOUND: {
    statusCode: 404,
    title: 'Право не знайдено',
    description: 'Право з вказаним іменем не існує в системі.',
    detailsSchema: z.object({
      permissionName: z.string().optional(),
    }),
  },

  // Lot errors
  LOT_NOT_FOUND: {
    statusCode: 404,
    title: 'Лот не знайдено',
    description: 'Лот з вказаним ідентифікатором не існує в системі.',
    detailsSchema: z.object({
      lotId: z.number().optional(),
    }),
  },
  LOT_SELLER_NOT_FOUND: {
    statusCode: 500,
    title: 'Продавця лоту не знайдено',
    description: 'Продавець лоту не знайдений в системі. Зверніться до підтримки.',
  },
  LOT_INVALID_STATUS: {
    statusCode: 400,
    title: 'Невалідний статус лоту',
    description: 'Операція неможлива для лоту з поточним статусом.',
    detailsSchema: z.object({
      currentStatus: z.string().optional(),
      requiredStatus: z.string().optional(),
    }),
  },
  LOT_IMAGE_LIMIT_REACHED: {
    statusCode: 400,
    title: 'Ліміт зображень досягнуто',
    description: 'Досягнуто максимальну кількість зображень для лоту (10).',
  },
  LOT_IMAGE_NOT_FOUND: {
    statusCode: 404,
    title: 'Зображення не знайдено',
    description: 'Зображення лоту не знайдено в системі.',
    detailsSchema: z.object({
      imageId: z.number().optional(),
    }),
  },
  LOT_BET_TOO_LOW: {
    statusCode: 400,
    title: 'Ставка занадто низька',
    description: 'Ставка повинна бути вищою за поточну ціну лоту.',
    detailsSchema: z.object({
      currentPrice: z.number().optional(),
      minimumBet: z.number().optional(),
    }),
  },

  // Rate limiting errors
  TOO_MANY_REQUESTS: {
    statusCode: 429,
    title: 'Занадто багато запитів',
    description: 'Ліміт запитів перевищено. Будь ласка, спробуйте пізніше.',
  },
  TOO_MANY_REQUESTS_ANONYMOUS: {
    statusCode: 429,
    title: 'Занадто багато запитів',
    description: 'Ліміт запитів для неавторизованих користувачів перевищено. Будь ласка, увійдіть в систему або спробуйте пізніше.',
  },
  ACTION_LIMIT_EXCEEDED: {
    statusCode: 429,
    title: 'Ліміт дій перевищено',
    description: 'Ліміт дій перевищено. Будь ласка, спробуйте пізніше.',
    detailsSchema: z.object({
      action: z.string().optional(),
      limit: z.number().optional(),
    }),
  },

  // Multipart/Upload errors
  MISSING_CONTENT_TYPE: {
    statusCode: 400,
    title: 'Відсутній заголовок Content-Type',
    description: 'Запит повинен містити заголовок Content-Type.',
  },
  INVALID_MULTIPART_DATA: {
    statusCode: 400,
    title: 'Невалідні multipart дані',
    description: 'Помилка при розборі multipart даних. Перевірте формат запиту.',
    detailsSchema: z.object({
      error: z.string().optional(),
    }),
  },
  FIELD_NAME_TOO_LONG: {
    statusCode: 413,
    title: 'Ім\'я поля занадто довге',
    description: 'Ім\'я поля перевищує допустиму довжину.',
  },

  // Challenge/Captcha errors
  INVALID_CHALLENGE_SOLUTION: {
    statusCode: 400,
    title: 'Невірне рішення капчі',
    description: 'Рішення капчі не вірне або прострочене.',
  },
  CHALLENGE_CREATION_FAILED: {
    statusCode: 500,
    title: 'Не вдалося створити капчу',
    description: 'Не вдалося створити виклик для капчі. Спробуйте пізніше.',
  },
  CHALLENGE_TOKEN_CREATION_FAILED: {
    statusCode: 500,
    title: 'Не вдалося створити токен',
    description: 'Не вдалося створити токен для капчі. Спробуйте пізніше.',
  },

  // Email/Recovery errors
  VERIFICATION_TOKEN_NOT_FOUND: {
    statusCode: 404,
    title: 'Токен верифікації не знайдено',
    description: 'Токен верифікації не існує або прострочений.',
  },
  RECOVERY_TOKEN_NOT_FOUND: {
    statusCode: 404,
    title: 'Токен відновлення не знайдено',
    description: 'Токен відновлення пароля не існує або прострочений.',
  },
  EMAIL_NOT_FOUND: {
    statusCode: 404,
    title: 'Email не знайдено',
    description: 'Користувача з такою адресою електронної пошти не знайдено.',
  },
  USER_ALREADY_EXISTS: {
    statusCode: 422,
    title: 'Користувач вже існує',
    description: 'Користувач з таким іменем або email вже зареєстрований.',
    detailsSchema: z.object({
      field: z.string().optional(),
    }),
  },

  // Infrastructure errors
  DATABASE_CONNECTION_FAILED: {
    statusCode: 500,
    title: 'Помилка з\'єднання з базою даних',
    description: 'Не вдалося встановити з\'єднання з базою даних. Спробуйте пізніше.',
  },
  REDIS_CONNECTION_FAILED: {
    statusCode: 500,
    title: 'Помилка з\'єднання з Redis',
    description: 'Не вдалося встановити з\'єднання з Redis. Спробуйте пізніше.',
  },
  REDIS_OPERATION_FAILED: {
    statusCode: 500,
    title: 'Помилка операції Redis',
    description: 'Операція з Redis не вдалася. Спробуйте пізніше.',
  },
  OBJECT_STORAGE_CONNECTION_FAILED: {
    statusCode: 500,
    title: 'Помилка з\'єднання зі сховищем',
    description: 'Не вдалося встановити з\'єднання зі сховищем об\'єктів. Спробуйте пізніше.',
  },
  NODEMAILER_CREATION_FAILED: {
    statusCode: 500,
    title: 'Помилка створення nodemailer',
    description: 'Не вдалося створити nodemailer транспорт. Спробуйте пізніше.',
  },
  ACTION_LIMITER_AUTH_REQUIRED: {
    statusCode: 500,
    title: 'Помилка використання обмежувача дій',
    description: 'Використання обмежувача дій вимагає авторизованого користувача.',
  },

  // General errors
  NOT_FOUND: {
    statusCode: 404,
    title: 'Не знайдено',
    description: 'Запитуваний ресурс не знайдено.',
  },
  BAD_REQUEST: {
    statusCode: 400,
    title: 'Поганий запит',
    description: 'Запит містить невалідні або неповні дані.',
  },
  UNKNOWN_VALIDATION_ERROR: {
    statusCode: 500,
    title: 'Невідома помилка валідації',
    description: 'Виникла невідома помилка під час валідації запиту.',
  },
  UNKNOWN_AUTHORIZATION_ERROR: {
    statusCode: 500,
    title: 'Невідома помилка авторизації',
    description: 'Виникла невідома помилка під час авторизації запиту.',
  },
} as const satisfies Record<string, ErrorDefinition>

export type ErrorCode = keyof typeof errors
