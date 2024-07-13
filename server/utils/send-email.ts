import nodemailer from 'nodemailer'

export interface EmailTemplate {
  text: string
  html: string
}

export interface EmailSenderPayload {
  to: string
  subject: string
  template: EmailTemplate
}

/**
 * Sends email.
 *
 * @param event H3Event
 * @param payload email
 * @returns message info
 */
export function sendEmail(event: H3Event, payload: EmailSenderPayload) {
  const runtimeConfig = useRuntimeConfig(event)

  const fromName = runtimeConfig.mailer.fromName
  const fromAddress = runtimeConfig.mailer.fromAddress

  return nodemailer
    .createTransport({
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
    .sendMail({
      from: `${fromName} <${fromAddress}>`,
      to: payload.to,
      subject: payload.subject,
      text: payload.template.text,
      html: payload.template.html,
    })
}
