import nodemailer from 'nodemailer'

/**
 * Defines the structure for email content.
 */
export interface EmailTemplate {
  text: string
  html: string
}

/**
 * Defines the structure for the data required by the email sending function.
 */
export interface EmailSenderPayload {
  to: string
  subject: string
  template: EmailTemplate
}

/**
 * Sends an email using Nodemailer.
 *
 * @param event - H3Event
 * @param payload - Containing the email details (recipient, subject, template).
 * @returns A Promise that resolves with Nodemailer's message.
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
      textEncoding: 'quoted-printable',
    })
}
