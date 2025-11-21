import { profileVerificationService } from '~~/server/services/verification.service'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const user = getAuthenticatedUser(event)

  await profileVerificationService.deleteEmailVerificationTokenByUid(user.id)

  const token = await profileVerificationService.createEmailVerificationToken(user.id)

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
