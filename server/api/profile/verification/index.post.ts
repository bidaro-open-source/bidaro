import { verificationService } from '#domains/authentication'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  await useRateLimiter(event, {
    authenticatedLimit: 10,
    anonymousLimit: 0,
    duration: 60,
  })

  const user = getAuthenticatedUser(event)

  await useActionLimiter(event, 'email_verification_request', actionLimits.EMAIL_VERIFICATION_REQUEST, async () => {
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
})
