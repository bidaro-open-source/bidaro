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
export function sendMail(event: H3Event, payload: EmailSenderPayload) {
  const transporter = useNodemailer(event)
  const runtimeConfig = useRuntimeConfig(event)

  const fromName = runtimeConfig.mailer.fromName
  const fromAddress = runtimeConfig.mailer.fromAddress

  return transporter
    .sendMail({
      from: `${fromName} <${fromAddress}>`,
      to: payload.to,
      subject: payload.subject,
      text: payload.template.text,
      html: payload.template.html,
      textEncoding: 'quoted-printable',
    })
}
