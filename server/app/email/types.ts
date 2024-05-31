export interface EmailTemplate {
  text: string
  html: string
}

export interface EmailSenderPayload {
  to: string
  subject: string
  template: EmailTemplate
}
