ARG NODE_IMAGE=oven/bun:1-alpine

FROM --platform=linux/amd64 $NODE_IMAGE AS base
WORKDIR /usr/src/app

# Installing Dependencies
FROM base AS install
COPY . .
RUN apk --no-cache add git
RUN bun install --frozen-lockfile --production
ENV NODE_ENV=production
RUN bun run build

# Production
FROM base AS release
COPY --chown=bun:bun --from=install /usr/src/app/node_modules node_modules
COPY --chown=bun:bun --from=install /usr/src/app/.output .
COPY --chown=bun:bun --from=install /usr/src/app/instrumentation.ts .

USER bun
ENV HOST 0.0.0.0
EXPOSE 3000
ENTRYPOINT [ "bun", "-r", "instrumentation.ts", "server/index.mjs" ]
