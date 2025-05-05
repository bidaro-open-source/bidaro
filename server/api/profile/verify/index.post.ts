import {
  createEmailVerificationToken,
  deleteEmailVerificationTokenByUid,
} from '~~/server/services/email-verification'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const user = getAuthenticatedUser(event)

  await deleteEmailVerificationTokenByUid(user.id)

  const token = await createEmailVerificationToken(user.id)

  await sendEmail(event, {
    to: user.email,
    subject: 'Email verification',
    template: {
      html: `Verify token: ${token}`,
      text: `Verify token: ${token}`,
    },
  })
})
