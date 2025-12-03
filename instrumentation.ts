import process from 'node:process'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-grpc'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc'
import { AwsInstrumentation } from '@opentelemetry/instrumentation-aws-sdk'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { IORedisInstrumentation } from '@opentelemetry/instrumentation-ioredis'
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg'
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions'

const logExporter = new OTLPLogExporter({
  url: 'http://localhost:4317',
})

const traceExporter = new OTLPTraceExporter({
  url: 'http://localhost:4317',
})

const metricExporter = new OTLPMetricExporter({
  url: 'http://localhost:4317',
})

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'bidaro',
    [ATTR_SERVICE_VERSION]: '1.0.0',
  }),
  traceExporter,
  logRecordProcessor: new BatchLogRecordProcessor(logExporter),
  metricReader: new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 1000,
  }),
  instrumentations: [
    new HttpInstrumentation(),
    new PgInstrumentation(),
    new WinstonInstrumentation({
      logHook: (span, record) => {
        const context = span.spanContext()

        record.message = {
          body: record.message,
          trace_id: context.traceId,
          span_id: context.spanId,
        }
      },
    }),
    new IORedisInstrumentation({
      requireParentSpan: false,
    }),
    new AwsInstrumentation({
      suppressInternalInstrumentation: true,
    }),
  ],
})

sdk.start()

console.log('🔭 OpenTelemetry initialized')

process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('OTel SDK shut down'))
    .catch(error => console.log('Error shutting down SDK', error))
})
