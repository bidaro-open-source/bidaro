import nodemailer from 'nodemailer'

let transporter: nodemailer.Transporter | null = null

/**
 * Creates and returns a Nodemailer transporter.
 *
 * @param event - H3Event
 * @returns Nodemailer transporter
 * @throws NODEMAILER_CREATION_FAILED - When nodemailer transporter creation fails
 */
export function useNodemailer(event: H3Event) {
  const runtimeConfig = useRuntimeConfig(event)

  try {
    if (!transporter) {
      transporter = nodemailer
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
    }

    return transporter
  }
  catch (error) {
    throw createAppError('NODEMAILER_CREATION_FAILED')
  }
}
