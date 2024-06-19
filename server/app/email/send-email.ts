import { createTransport } from 'nodemailer'
import type { EmailSenderPayload } from './types'

const runtimeConfig = useRuntimeConfig()

const transporter = createTransport({
  host: runtimeConfig.mailer.host,
  port: +runtimeConfig.mailer.port,
  secure: runtimeConfig.mailer.encryption === 'true',
  auth:
    runtimeConfig.mailer.user && runtimeConfig.mailer.pass
      ? {
          user: runtimeConfig.mailer.user,
          pass: runtimeConfig.mailer.pass,
        }
      : undefined,
})

export function sendEmail(payload: EmailSenderPayload) {
  return transporter.sendMail({
    from: `${runtimeConfig.mailer.fromName} <${runtimeConfig.mailer.fromAddress}>`,
    to: payload.to,
    subject: payload.subject,
    text: payload.template.text,
    html: payload.template.html,
  })
}
