import process from 'node:process'
import * as opentelemetry from '@opentelemetry/api'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-grpc'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc'
import { HostMetrics } from '@opentelemetry/host-metrics'
import { AwsInstrumentation } from '@opentelemetry/instrumentation-aws-sdk'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { IORedisInstrumentation } from '@opentelemetry/instrumentation-ioredis'
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg'
import { RuntimeNodeInstrumentation } from '@opentelemetry/instrumentation-runtime-node'
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { NodeSDK } from '@opentelemetry/sdk-node'
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
  SEMRESATTRS_SERVICE_INSTANCE_ID,
} from '@opentelemetry/semantic-conventions'

const COLLECTOR_URL = process.env.OBSERVABILITY_COLLECTOR_URL

const ENABLED = process.env.OBSERVABILITY_ENABLED === 'true'
const ENABLE_LOGS = ENABLED && process.env.OBSERVABILITY_LOGS_ENABLED === 'true'
const ENABLE_TRACES = ENABLED && process.env.OBSERVABILITY_TRACES_ENABLED === 'true'
const ENABLE_METRICS = ENABLED && process.env.OBSERVABILITY_METRICS_ENABLED === 'true'

const traceExporter = ENABLE_TRACES
  ? new OTLPTraceExporter({ url: COLLECTOR_URL })
  : undefined

const logExporter = ENABLE_LOGS
  ? new OTLPLogExporter({ url: COLLECTOR_URL })
  : undefined

const logRecordProcessor = logExporter
  ? new BatchLogRecordProcessor(logExporter)
  : undefined

const metricReader = ENABLE_METRICS
  ? new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({ url: COLLECTOR_URL }),
      exportIntervalMillis: 1000,
    })
  : undefined

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'bidaro',
    [ATTR_SERVICE_VERSION]: '1.0.0',
    [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
    [SEMRESATTRS_SERVICE_INSTANCE_ID]: process.env.HOSTNAME || `unknown-instance-${Math.floor(Math.random() * 100000)}`,
  }),
  traceExporter,
  logRecordProcessor,
  metricReader,
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
    new RuntimeNodeInstrumentation({
      monitoringPrecision: 5000,
    }),
  ],
})

if (ENABLED) {
  sdk.start()
  console.log(`🔭 OpenTelemetry started`)
  console.log(`   ├─ Collector: ${COLLECTOR_URL}`)
  console.log(`   ├─ Traces:    ${ENABLE_TRACES ? '✅' : '❌'}`)
  console.log(`   ├─ Metrics:   ${ENABLE_METRICS ? '✅' : '❌'}`)
  console.log(`   └─ Logs:      ${ENABLE_LOGS ? '✅' : '❌'}`)

  process.on('SIGTERM', () => {
    sdk.shutdown()
      .then(() => console.log('OTel SDK shut down'))
      .catch(error => console.log('Error shutting down SDK', error))
  })
}
else {
  console.log('⚪ OpenTelemetry disabled')
}

if (ENABLE_METRICS) {
  const hostMetrics = new HostMetrics({
    meterProvider: opentelemetry.metrics.getMeterProvider(),
  })

  hostMetrics.start()

  console.log('🔭 HostMetrics initialized')
}
