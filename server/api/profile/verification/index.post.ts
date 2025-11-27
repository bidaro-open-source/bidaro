import { verificationService } from '#domains/authentication'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const user = getAuthenticatedUser(event)

  await verificationService.deleteTokenByUserId(user.id)

  const token = await verificationService.createToken(user.id)

  const config = useRuntimeConfig()

  await sendMail(event, {
    to: user.email,
    subject: 'Верифікуй свою пошту - Bidaro',
    template: {
      html: `Верифікуй свою пошту, клікнувши <a href="${config.public.appUrl}/profile/verification/${token}">сюди</a>`,
      text: `Токен верифікації: ${token}`,
    },
  })
})
