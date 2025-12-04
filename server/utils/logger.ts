import winston from 'winston'

try {
  // eslint-disable-next-line ts/no-require-imports
  require('winston') // Fix issue with open telemetry
}
catch {}

const consoleFormat = winston.format.printf(({ level, message, timestamp, trace_id }) => {
  let logBody = message

  if (typeof message === 'object' && message !== null) {
    const cleanObj = { ...message }
    delete (cleanObj as any).trace_id
    delete (cleanObj as any).span_id

    logBody = JSON.stringify(cleanObj)
  }

  return `${timestamp} [${level}]: ${logBody} ${trace_id ? `trace_id=${trace_id}` : ''}`
})

export const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        consoleFormat,
      ),
    }),
  ],
})
