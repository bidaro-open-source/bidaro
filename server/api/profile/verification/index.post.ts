import {
  createEmailVerificationToken,
  deleteEmailVerificationTokenByUid,
} from '~~/server/services/email-verification'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const user = getAuthenticatedUser(event)

  await deleteEmailVerificationTokenByUid(user.id)

  const token = await createEmailVerificationToken(user.id)

  const config = useRuntimeConfig()

  await sendEmail(event, {
    to: user.email,
    subject: 'Верифікуй свою пошту - Bidaro',
    template: {
      html: `Верифікуй свою пошту, клікнувши <a href="${config.public.appUrl}/profile/verification/${token}">сюди</a>`,
      text: `Токен верифікації: ${token}`,
    },
  })
})
